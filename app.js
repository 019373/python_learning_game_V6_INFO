"use strict";

/*
============================================================
PYT - app.js

Rôle :
- démarrer le jeu ;
- gérer l'intro ;
- gérer le menu et les paramètres ;
- gérer la musique ;
- exécuter le sous-ensemble Python utilisé dans PYT ;
- transformer le code en actions ;
- animer les actions même si le programme échoue ensuite ;
- vérifier les notions demandées par chaque exercice ;
- donner un retour précis à l'élève.
============================================================
*/


// =========================================================
// RUNNER PYTHON SIMPLIFIÉ
// =========================================================

class BrowserPythonRunner {

    constructor() {

        this.maxActions = 250;
        this.maxIterations = 1000;
        this.maxFunctionCalls = 100;

        this.reset();
    }


    reset() {

        this.variables = {};
        this.functions = {};

        this.actions = [];
        this.output = [];

        this.loopIterations = 0;
        this.functionCalls = 0;
    }


    // =====================================================
    // LANCEMENT
    // =====================================================

    run(code) {

        this.reset();

        try {

            this.checkForbiddenCode(code);

            const lines =
                this.prepareLines(code);

            this.executeBlock(
                lines,
                0,
                lines.length,
                0
            );

            return {
                success: true,
                actions: [...this.actions],
                output: [...this.output],
                error: null,
                errorLine: null
            };

        } catch (error) {

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            const match =
                message.match(
                    /Ligne\s+(\d+)/i
                );

            return {
                success: false,

                /*
                IMPORTANT :
                on garde les actions valides exécutées
                avant l'erreur.
                */
                actions: [...this.actions],

                output: [...this.output],

                error: message,

                errorLine:
                    match
                        ? Number(match[1])
                        : null
            };
        }
    }


    // =====================================================
    // SÉCURITÉ
    // =====================================================

    checkForbiddenCode(code) {

        const forbidden = [
            /\bimport\b/,
            /\bfrom\b/,
            /\beval\s*\(/,
            /\bexec\s*\(/,
            /\bopen\s*\(/,
            /\b__import__\b/,
            /\bglobals\s*\(/,
            /\blocals\s*\(/,
            /\bcompile\s*\(/,
            /\binput\s*\(/,
            /\bos\./,
            /\bsys\./,
            /\bsubprocess\b/
        ];

        for (const pattern of forbidden) {

            if (pattern.test(code)) {

                throw new Error(
                    "Cette commande n'est pas disponible dans PYT."
                );
            }
        }
    }


    // =====================================================
    // PRÉPARATION DES LIGNES
    // =====================================================

    prepareLines(code) {

        const rawLines =
            String(code || "")
                .replace(/\t/g, "    ")
                .split(/\r?\n/);

        const lines = [];

        for (
            let index = 0;
            index < rawLines.length;
            index++
        ) {

            const raw =
                rawLines[index];

            const withoutComment =
                this.removeComment(raw);

            if (
                withoutComment.trim() === ""
            ) {

                continue;
            }

            const spaces =
                withoutComment.match(/^ */)[0].length;

            if (
                spaces % 4 !== 0
            ) {

                throw new Error(
                    `Ligne ${index + 1} : utilise 4 espaces pour l'indentation.`
                );
            }

            lines.push({
                number: index + 1,
                indent: spaces / 4,
                text: withoutComment.trim()
            });
        }

        return lines;
    }


    removeComment(line) {

        let quote = null;

        for (
            let i = 0;
            i < line.length;
            i++
        ) {

            const char =
                line[i];

            if (
                char === "'" ||
                char === '"'
            ) {

                if (
                    quote === char
                ) {

                    quote = null;

                } else if (
                    quote === null
                ) {

                    quote = char;
                }
            }

            if (
                char === "#" &&
                quote === null
            ) {

                return line.slice(
                    0,
                    i
                );
            }
        }

        return line;
    }


    // =====================================================
    // BLOCS
    // =====================================================

    executeBlock(
        lines,
        start,
        end,
        indent
    ) {

        let index = start;

        while (index < end) {

            const line =
                lines[index];

            if (
                line.indent < indent
            ) {

                break;
            }

            if (
                line.indent > indent
            ) {

                throw new Error(
                    `Ligne ${line.number} : indentation inattendue.`
                );
            }


            const text =
                line.text;


            // ---------------------------------------------
            // IF
            // ---------------------------------------------

            if (
                /^if\s+.+:$/.test(text)
            ) {

                index =
                    this.executeIfChain(
                        lines,
                        index,
                        end,
                        indent
                    );

                continue;
            }


            // ---------------------------------------------
            // ELIF / ELSE isolé
            // ---------------------------------------------

            if (
                /^elif\s+/.test(text) ||
                text === "else:"
            ) {

                throw new Error(
                    `Ligne ${line.number} : ${text.startsWith("elif") ? "elif" : "else"} sans if correspondant.`
                );
            }


            // ---------------------------------------------
            // FOR
            // ---------------------------------------------

            if (
                /^for\s+/.test(text)
            ) {

                index =
                    this.executeFor(
                        lines,
                        index,
                        end,
                        indent
                    );

                continue;
            }


            // ---------------------------------------------
            // WHILE
            // ---------------------------------------------

            if (
                /^while\s+/.test(text)
            ) {

                index =
                    this.executeWhile(
                        lines,
                        index,
                        end,
                        indent
                    );

                continue;
            }


            // ---------------------------------------------
            // DEF
            // ---------------------------------------------

            if (
                /^def\s+/.test(text)
            ) {

                index =
                    this.registerFunction(
                        lines,
                        index,
                        end,
                        indent
                    );

                continue;
            }


            // ---------------------------------------------
            // BREAK
            // ---------------------------------------------

            if (
                text === "break"
            ) {

                return {
                    type: "break",
                    nextIndex: index + 1
                };
            }


            // ---------------------------------------------
            // RETURN
            // ---------------------------------------------

            if (
                text === "return"
            ) {

                return {
                    type: "return",
                    value: null,
                    nextIndex: index + 1
                };
            }


            if (
                text.startsWith("return ")
            ) {

                const expression =
                    text.slice(7).trim();

                return {
                    type: "return",
                    value:
                        this.evaluateExpression(
                            expression,
                            line.number
                        ),
                    nextIndex: index + 1
                };
            }


            // ---------------------------------------------
            // PASS
            // ---------------------------------------------

            if (
                text === "pass"
            ) {

                index++;
                continue;
            }


            this.executeStatement(
                text,
                line.number
            );

            index++;
        }

        return {
            type: "normal",
            nextIndex: index
        };
    }


    findBlockEnd(
        lines,
        start,
        end,
        parentIndent
    ) {

        let index =
            start + 1;

        while (index < end) {

            if (
                lines[index].indent <=
                parentIndent
            ) {

                break;
            }

            index++;
        }

        return index;
    }


    // =====================================================
    // IF / ELIF / ELSE
    // =====================================================

    executeIfChain(
        lines,
        start,
        end,
        indent
    ) {

        let index = start;
        let branchExecuted = false;

        while (index < end) {

            const line =
                lines[index];

            if (
                line.indent !== indent
            ) {

                break;
            }

            const text =
                line.text;

            const isIf =
                /^if\s+.+:$/.test(text);

            const isElif =
                /^elif\s+.+:$/.test(text);

            const isElse =
                text === "else:";

            if (
                !isIf &&
                !isElif &&
                !isElse
            ) {

                break;
            }

            if (
                index !== start &&
                isIf
            ) {

                break;
            }

            const blockEnd =
                this.findBlockEnd(
                    lines,
                    index,
                    end,
                    indent
                );

            let shouldRun = false;

            if (!branchExecuted) {

                if (isElse) {

                    shouldRun = true;

                } else {

                    const conditionText =
                        text
                            .replace(
                                /^(if|elif)\s+/,
                                ""
                            )
                            .replace(
                                /:$/,
                                ""
                            );

                    shouldRun =
                        Boolean(
                            this.evaluateExpression(
                                conditionText,
                                line.number
                            )
                        );
                }
            }

            if (shouldRun) {

                branchExecuted = true;

                const result =
                    this.executeBlock(
                        lines,
                        index + 1,
                        blockEnd,
                        indent + 1
                    );

                if (
                    result.type !== "normal"
                ) {

                    return result;
                }
            }

            index = blockEnd;

            if (
                index >= end
            ) {

                break;
            }

            const next =
                lines[index];

            if (
                next.indent !== indent ||
                !(
                    /^elif\s+.+:$/.test(
                        next.text
                    ) ||
                    next.text === "else:"
                )
            ) {

                break;
            }
        }

        return index;
    }


    // =====================================================
    // FOR
    // =====================================================

    executeFor(
        lines,
        start,
        end,
        indent
    ) {

        const line =
            lines[start];

        const match =
            line.text.match(
                /^for\s+([A-Za-z_]\w*)\s+in\s+(.+):$/
            );

        if (!match) {

            throw new Error(
                `Ligne ${line.number} : boucle for incorrecte.`
            );
        }

        const variableName =
            match[1];

        const iterableExpression =
            match[2];

        const iterable =
            this.evaluateExpression(
                iterableExpression,
                line.number
            );

        if (
            !Array.isArray(iterable)
        ) {

            throw new Error(
                `Ligne ${line.number} : la boucle for attend une liste ou range().`
            );
        }

        const blockEnd =
            this.findBlockEnd(
                lines,
                start,
                end,
                indent
            );

        for (
            const value
            of iterable
        ) {

            this.loopIterations++;

            if (
                this.loopIterations >
                this.maxIterations
            ) {

                throw new Error(
                    `Ligne ${line.number} : trop d'itérations. Vérifie ta boucle.`
                );
            }

            this.variables[
                variableName
            ] = value;

            const result =
                this.executeBlock(
                    lines,
                    start + 1,
                    blockEnd,
                    indent + 1
                );

            if (
                result.type === "break"
            ) {

                break;
            }

            if (
                result.type === "return"
            ) {

                return result;
            }
        }

        return blockEnd;
    }


    // =====================================================
    // WHILE
    // =====================================================

    executeWhile(
        lines,
        start,
        end,
        indent
    ) {

        const line =
            lines[start];

        const match =
            line.text.match(
                /^while\s+(.+):$/
            );

        if (!match) {

            throw new Error(
                `Ligne ${line.number} : boucle while incorrecte.`
            );
        }

        const condition =
            match[1];

        const blockEnd =
            this.findBlockEnd(
                lines,
                start,
                end,
                indent
            );

        while (
            Boolean(
                this.evaluateExpression(
                    condition,
                    line.number
                )
            )
        ) {

            this.loopIterations++;

            if (
                this.loopIterations >
                this.maxIterations
            ) {

                throw new Error(
                    `Ligne ${line.number} : la boucle while semble ne jamais s'arrêter.`
                );
            }

            const result =
                this.executeBlock(
                    lines,
                    start + 1,
                    blockEnd,
                    indent + 1
                );

            if (
                result.type === "break"
            ) {

                break;
            }

            if (
                result.type === "return"
            ) {

                return result;
            }
        }

        return blockEnd;
    }


    // =====================================================
    // FONCTIONS
    // =====================================================

    registerFunction(
        lines,
        start,
        end,
        indent
    ) {

        const line =
            lines[start];

        const match =
            line.text.match(
                /^def\s+([A-Za-z_]\w*)\s*\((.*?)\)\s*:$/
            );

        if (!match) {

            throw new Error(
                `Ligne ${line.number} : définition de fonction incorrecte.`
            );
        }

        const name =
            match[1];

        const parametersText =
            match[2].trim();

        const parameters =
            parametersText === ""
                ? []
                : parametersText
                    .split(",")
                    .map(
                        item =>
                            item.trim()
                    );

        for (
            const parameter
            of parameters
        ) {

            if (
                !/^[A-Za-z_]\w*$/.test(
                    parameter
                )
            ) {

                throw new Error(
                    `Ligne ${line.number} : paramètre de fonction incorrect.`
                );
            }
        }

        const blockEnd =
            this.findBlockEnd(
                lines,
                start,
                end,
                indent
            );

        this.functions[name] = {
            parameters,
            lines,
            start: start + 1,
            end: blockEnd,
            indent: indent + 1,
            lineNumber: line.number
        };

        return blockEnd;
    }


    callUserFunction(
        name,
        args,
        lineNumber
    ) {

        const fn =
            this.functions[name];

        if (!fn) {

            throw new Error(
                `Ligne ${lineNumber} : fonction inconnue "${name}".`
            );
        }

        if (
            args.length !==
            fn.parameters.length
        ) {

            throw new Error(
                `Ligne ${lineNumber} : "${name}" attend ${fn.parameters.length} argument(s).`
            );
        }

        this.functionCalls++;

        if (
            this.functionCalls >
            this.maxFunctionCalls
        ) {

            throw new Error(
                `Ligne ${lineNumber} : trop d'appels de fonction.`
            );
        }

        const oldVariables =
            { ...this.variables };

        for (
            let i = 0;
            i < fn.parameters.length;
            i++
        ) {

            this.variables[
                fn.parameters[i]
            ] = args[i];
        }

        const result =
            this.executeBlock(
                fn.lines,
                fn.start,
                fn.end,
                fn.indent
            );

        const changedVariables =
            { ...this.variables };

        this.variables =
            oldVariables;

        /*
        On conserve les variables globales
        qui existaient avant l'appel.
        */
        for (
            const key
            of Object.keys(oldVariables)
        ) {

            if (
                Object.prototype.hasOwnProperty.call(
                    changedVariables,
                    key
                )
            ) {

                this.variables[key] =
                    changedVariables[key];
            }
        }

        if (
            result.type === "return"
        ) {

            return result.value;
        }

        return null;
    }


    // =====================================================
    // INSTRUCTIONS SIMPLES
    // =====================================================

    executeStatement(
        text,
        lineNumber
    ) {

        // ---------------------------------------------
        // += -= *=
        // ---------------------------------------------

        let match =
            text.match(
                /^([A-Za-z_]\w*)\s*(\+=|-=|\*=)\s*(.+)$/
            );

        if (match) {

            const name =
                match[1];

            const operator =
                match[2];

            const value =
                this.evaluateExpression(
                    match[3],
                    lineNumber
                );

            if (
                !Object.prototype.hasOwnProperty.call(
                    this.variables,
                    name
                )
            ) {

                throw new Error(
                    `Ligne ${lineNumber} : variable inconnue "${name}".`
                );
            }

            if (
                operator === "+="
            ) {

                this.variables[name] += value;

            } else if (
                operator === "-="
            ) {

                this.variables[name] -= value;

            } else {

                this.variables[name] *= value;
            }

            return;
        }


        // ---------------------------------------------
        // AFFECTATION
        // ---------------------------------------------

        match =
            text.match(
                /^([A-Za-z_]\w*)\s*=\s*(.+)$/
            );

        if (match) {

            const name =
                match[1];

            const expression =
                match[2];

            this.variables[name] =
                this.evaluateExpression(
                    expression,
                    lineNumber
                );

            return;
        }


        // ---------------------------------------------
        // APPEND
        // ---------------------------------------------

        match =
            text.match(
                /^([A-Za-z_]\w*)\.append\s*\((.*)\)$/
            );

        if (match) {

            const listName =
                match[1];

            const list =
                this.variables[
                    listName
                ];

            if (
                !Array.isArray(list)
            ) {

                throw new Error(
                    `Ligne ${lineNumber} : "${listName}" n'est pas une liste.`
                );
            }

            const value =
                this.evaluateExpression(
                    match[2],
                    lineNumber
                );

            list.push(value);

            return;
        }


        // ---------------------------------------------
        // APPEL DE FONCTION
        // ---------------------------------------------

        match =
            text.match(
                /^([A-Za-z_]\w*)\s*\((.*)\)$/
            );

        if (match) {

            const name =
                match[1];

            const args =
                this.parseArguments(
                    match[2],
                    lineNumber
                );

            this.executeCall(
                name,
                args,
                lineNumber
            );

            return;
        }


        throw new Error(
            `Ligne ${lineNumber} : instruction non reconnue.`
        );
    }


    // =====================================================
    // APPELS
    // =====================================================

    executeCall(
        name,
        args,
        lineNumber
    ) {

        if (
            name === "forward"
        ) {

            const steps =
                this.requireMovementNumber(
                    args,
                    lineNumber,
                    "forward"
                );

            this.addAction(
                "forward",
                steps,
                lineNumber
            );

            return null;
        }


        if (
            name === "backward"
        ) {

            const steps =
                this.requireMovementNumber(
                    args,
                    lineNumber,
                    "backward"
                );

            this.addAction(
                "backward",
                steps,
                lineNumber
            );

            return null;
        }


        if (
            name === "right"
        ) {

            const angle =
                args.length === 0
                    ? 90
                    : Number(args[0]);

            if (
                !Number.isFinite(angle) ||
                angle % 90 !== 0
            ) {

                throw new Error(
                    `Ligne ${lineNumber} : right() attend un angle multiple de 90.`
                );
            }

            const turns =
                Math.abs(angle / 90);

            for (
                let i = 0;
                i < turns;
                i++
            ) {

                this.addAction(
                    angle >= 0
                        ? "right"
                        : "left",
                    90,
                    lineNumber
                );
            }

            return null;
        }


        if (
            name === "left"
        ) {

            const angle =
                args.length === 0
                    ? 90
                    : Number(args[0]);

            if (
                !Number.isFinite(angle) ||
                angle % 90 !== 0
            ) {

                throw new Error(
                    `Ligne ${lineNumber} : left() attend un angle multiple de 90.`
                );
            }

            const turns =
                Math.abs(angle / 90);

            for (
                let i = 0;
                i < turns;
                i++
            ) {

                this.addAction(
                    angle >= 0
                        ? "left"
                        : "right",
                    90,
                    lineNumber
                );
            }

            return null;
        }


        if (
            name === "print"
        ) {

            this.output.push(
                args
                    .map(
                        value =>
                            this.pythonString(
                                value
                            )
                    )
                    .join(" ")
            );

            return null;
        }


        if (
            Object.prototype.hasOwnProperty.call(
                this.functions,
                name
            )
        ) {

            return this.callUserFunction(
                name,
                args,
                lineNumber
            );
        }


        throw new Error(
            `Ligne ${lineNumber} : fonction inconnue "${name}".`
        );
    }


    requireMovementNumber(
        args,
        lineNumber,
        name
    ) {

        if (
            args.length > 1
        ) {

            throw new Error(
                `Ligne ${lineNumber} : ${name}() attend un seul nombre.`
            );
        }

        const value =
            args.length === 0
                ? 1
                : Number(args[0]);

        if (
            !Number.isFinite(value) ||
            value < 0 ||
            !Number.isInteger(value)
        ) {

            throw new Error(
                `Ligne ${lineNumber} : ${name}() attend un nombre entier positif.`
            );
        }

        return value;
    }


    addAction(
        type,
        value,
        line
    ) {

        if (
            this.actions.length >=
            this.maxActions
        ) {

            throw new Error(
                `Ligne ${line} : trop d'actions dans le programme.`
            );
        }

        /*
        On garde maintenant le numéro de ligne.
        Cela permet d'indiquer une ligne seulement
        lorsqu'une action précise est réellement en cause.
        */

        this.actions.push({
            type,
            value,
            line
        });
    }


    // =====================================================
    // EXPRESSIONS
    // =====================================================

    evaluateExpression(
        expression,
        lineNumber
    ) {

        let expr =
            String(expression).trim();

        if (
            expr === ""
        ) {

            throw new Error(
                `Ligne ${lineNumber} : expression vide.`
            );
        }


        // ---------------------------------------------
        // PARENTHÈSES EXTÉRIEURES
        // ---------------------------------------------

        while (
            expr.startsWith("(") &&
            expr.endsWith(")") &&
            this.outerParenthesesMatch(expr)
        ) {

            expr =
                expr.slice(
                    1,
                    -1
                ).trim();
        }


        // ---------------------------------------------
        // OR
        // ---------------------------------------------

        let split =
            this.splitTopLevelWord(
                expr,
                "or"
            );

        if (split) {

            return (
                Boolean(
                    this.evaluateExpression(
                        split.left,
                        lineNumber
                    )
                ) ||
                Boolean(
                    this.evaluateExpression(
                        split.right,
                        lineNumber
                    )
                )
            );
        }


        // ---------------------------------------------
        // AND
        // ---------------------------------------------

        split =
            this.splitTopLevelWord(
                expr,
                "and"
            );

        if (split) {

            return (
                Boolean(
                    this.evaluateExpression(
                        split.left,
                        lineNumber
                    )
                ) &&
                Boolean(
                    this.evaluateExpression(
                        split.right,
                        lineNumber
                    )
                )
            );
        }


        // ---------------------------------------------
        // NOT
        // ---------------------------------------------

        if (
            expr.startsWith("not ")
        ) {

            return !Boolean(
                this.evaluateExpression(
                    expr.slice(4),
                    lineNumber
                )
            );
        }


        // ---------------------------------------------
        // COMPARAISONS
        // ---------------------------------------------

        const comparison =
            this.findTopLevelOperator(
                expr,
                [
                    "==",
                    "!=",
                    ">=",
                    "<=",
                    ">",
                    "<"
                ]
            );

        if (comparison) {

            const left =
                this.evaluateExpression(
                    expr.slice(
                        0,
                        comparison.index
                    ),
                    lineNumber
                );

            const right =
                this.evaluateExpression(
                    expr.slice(
                        comparison.index +
                        comparison.operator.length
                    ),
                    lineNumber
                );

            switch (
                comparison.operator
            ) {

                case "==":
                    return left === right;

                case "!=":
                    return left !== right;

                case ">=":
                    return left >= right;

                case "<=":
                    return left <= right;

                case ">":
                    return left > right;

                case "<":
                    return left < right;
            }
        }


        // ---------------------------------------------
        // ADDITION / SOUSTRACTION
        // ---------------------------------------------

        const addSub =
            this.findTopLevelOperatorFromRight(
                expr,
                [
                    "+",
                    "-"
                ]
            );

        if (addSub) {

            const left =
                this.evaluateExpression(
                    expr.slice(
                        0,
                        addSub.index
                    ),
                    lineNumber
                );

            const right =
                this.evaluateExpression(
                    expr.slice(
                        addSub.index + 1
                    ),
                    lineNumber
                );

            if (
                addSub.operator === "+"
            ) {

                return left + right;
            }

            return left - right;
        }


        // ---------------------------------------------
        // MULTIPLICATION / DIVISION
        // ---------------------------------------------

        const mulDiv =
            this.findTopLevelOperatorFromRight(
                expr,
                [
                    "*",
                    "/",
                    "%"
                ]
            );

        if (mulDiv) {

            const left =
                this.evaluateExpression(
                    expr.slice(
                        0,
                        mulDiv.index
                    ),
                    lineNumber
                );

            const right =
                this.evaluateExpression(
                    expr.slice(
                        mulDiv.index + 1
                    ),
                    lineNumber
                );

            if (
                mulDiv.operator === "*"
            ) {

                return left * right;
            }

            if (
                mulDiv.operator === "/"
            ) {

                if (right === 0) {

                    throw new Error(
                        `Ligne ${lineNumber} : division par zéro.`
                    );
                }

                return left / right;
            }

            return left % right;
        }


        // ---------------------------------------------
        // NOMBRE NÉGATIF
        // ---------------------------------------------

        if (
            expr.startsWith("-") &&
            /^-\d+(\.\d+)?$/.test(expr)
        ) {

            return Number(expr);
        }


        // ---------------------------------------------
        // NOMBRES
        // ---------------------------------------------

        if (
            /^\d+(\.\d+)?$/.test(expr)
        ) {

            return Number(expr);
        }


        // ---------------------------------------------
        // BOOL / NONE
        // ---------------------------------------------

        if (
            expr === "True"
        ) {

            return true;
        }

        if (
            expr === "False"
        ) {

            return false;
        }

        if (
            expr === "None"
        ) {

            return null;
        }


        // ---------------------------------------------
        // CHAÎNES
        // ---------------------------------------------

        if (
            (
                expr.startsWith('"') &&
                expr.endsWith('"')
            ) ||
            (
                expr.startsWith("'") &&
                expr.endsWith("'")
            )
        ) {

            return expr.slice(
                1,
                -1
            );
        }


        // ---------------------------------------------
        // LISTE
        // ---------------------------------------------

        if (
            expr.startsWith("[") &&
            expr.endsWith("]")
        ) {

            const inside =
                expr.slice(
                    1,
                    -1
                ).trim();

            if (
                inside === ""
            ) {

                return [];
            }

            return this
                .splitArguments(inside)
                .map(
                    item =>
                        this.evaluateExpression(
                            item,
                            lineNumber
                        )
                );
        }


        // ---------------------------------------------
        // INDEX DE LISTE
        // ---------------------------------------------

        const indexMatch =
            expr.match(
                /^([A-Za-z_]\w*)\[(.+)\]$/
            );

        if (indexMatch) {

            const listName =
                indexMatch[1];

            const list =
                this.variables[
                    listName
                ];

            if (
                !Array.isArray(list) &&
                typeof list !== "string"
            ) {

                throw new Error(
                    `Ligne ${lineNumber} : "${listName}" ne peut pas être indexé.`
                );
            }

            const index =
                Number(
                    this.evaluateExpression(
                        indexMatch[2],
                        lineNumber
                    )
                );

            if (
                !Number.isInteger(index)
            ) {

                throw new Error(
                    `Ligne ${lineNumber} : l'indice doit être un entier.`
                );
            }

            if (
                index < 0 ||
                index >= list.length
            ) {

                throw new Error(
                    `Ligne ${lineNumber} : indice hors de la liste.`
                );
            }

            return list[index];
        }


        // ---------------------------------------------
        // APPEL DANS UNE EXPRESSION
        // ---------------------------------------------

        const callMatch =
            expr.match(
                /^([A-Za-z_]\w*)\s*\((.*)\)$/
            );

        if (callMatch) {

            const name =
                callMatch[1];

            const args =
                this.parseArguments(
                    callMatch[2],
                    lineNumber
                );


            if (
                name === "range"
            ) {

                return this.makeRange(
                    args,
                    lineNumber
                );
            }


            if (
                name === "len"
            ) {

                if (
                    args.length !== 1
                ) {

                    throw new Error(
                        `Ligne ${lineNumber} : len() attend une valeur.`
                    );
                }

                if (
                    !Array.isArray(args[0]) &&
                    typeof args[0] !== "string"
                ) {

                    throw new Error(
                        `Ligne ${lineNumber} : len() attend une liste ou un texte.`
                    );
                }

                return args[0].length;
            }


            if (
                name === "int"
            ) {

                if (
                    args.length !== 1
                ) {

                    throw new Error(
                        `Ligne ${lineNumber} : int() attend une valeur.`
                    );
                }

                const value =
                    parseInt(
                        args[0],
                        10
                    );

                if (
                    Number.isNaN(value)
                ) {

                    throw new Error(
                        `Ligne ${lineNumber} : conversion en int impossible.`
                    );
                }

                return value;
            }


            if (
                name === "float"
            ) {

                if (
                    args.length !== 1
                ) {

                    throw new Error(
                        `Ligne ${lineNumber} : float() attend une valeur.`
                    );
                }

                const value =
                    Number(
                        args[0]
                    );

                if (
                    Number.isNaN(value)
                ) {

                    throw new Error(
                        `Ligne ${lineNumber} : conversion en float impossible.`
                    );
                }

                return value;
            }


            if (
                name === "str"
            ) {

                if (
                    args.length !== 1
                ) {

                    throw new Error(
                        `Ligne ${lineNumber} : str() attend une valeur.`
                    );
                }

                return String(
                    args[0]
                );
            }


            if (
                Object.prototype.hasOwnProperty.call(
                    this.functions,
                    name
                )
            ) {

                return this.callUserFunction(
                    name,
                    args,
                    lineNumber
                );
            }


            throw new Error(
                `Ligne ${lineNumber} : fonction inconnue "${name}".`
            );
        }


        // ---------------------------------------------
        // VARIABLE
        // ---------------------------------------------

        if (
            /^[A-Za-z_]\w*$/.test(expr)
        ) {

            if (
                Object.prototype.hasOwnProperty.call(
                    this.variables,
                    expr
                )
            ) {

                return this.variables[
                    expr
                ];
            }

            throw new Error(
                `Ligne ${lineNumber} : variable inconnue "${expr}".`
            );
        }


        throw new Error(
            `Ligne ${lineNumber} : expression non reconnue "${expr}".`
        );
    }


    // =====================================================
    // RANGE
    // =====================================================

    makeRange(
        args,
        lineNumber
    ) {

        if (
            args.length < 1 ||
            args.length > 3
        ) {

            throw new Error(
                `Ligne ${lineNumber} : range() attend 1 à 3 nombres.`
            );
        }

        let start = 0;
        let stop = 0;
        let step = 1;

        if (
            args.length === 1
        ) {

            stop =
                Number(args[0]);

        } else if (
            args.length === 2
        ) {

            start =
                Number(args[0]);

            stop =
                Number(args[1]);

        } else {

            start =
                Number(args[0]);

            stop =
                Number(args[1]);

            step =
                Number(args[2]);
        }

        if (
            !Number.isInteger(start) ||
            !Number.isInteger(stop) ||
            !Number.isInteger(step)
        ) {

            throw new Error(
                `Ligne ${lineNumber} : range() utilise des nombres entiers.`
            );
        }

        if (
            step === 0
        ) {

            throw new Error(
                `Ligne ${lineNumber} : le pas de range() ne peut pas être 0.`
            );
        }

        const result = [];

        if (
            step > 0
        ) {

            for (
                let value = start;
                value < stop;
                value += step
            ) {

                result.push(value);

                if (
                    result.length >
                    this.maxIterations
                ) {

                    throw new Error(
                        `Ligne ${lineNumber} : range() est trop grand.`
                    );
                }
            }

        } else {

            for (
                let value = start;
                value > stop;
                value += step
            ) {

                result.push(value);

                if (
                    result.length >
                    this.maxIterations
                ) {

                    throw new Error(
                        `Ligne ${lineNumber} : range() est trop grand.`
                    );
                }
            }
        }

        return result;
    }


    // =====================================================
    // ARGUMENTS
    // =====================================================

    parseArguments(
        text,
        lineNumber
    ) {

        const trimmed =
            String(text).trim();

        if (
            trimmed === ""
        ) {

            return [];
        }

        return this
            .splitArguments(trimmed)
            .map(
                expression =>
                    this.evaluateExpression(
                        expression,
                        lineNumber
                    )
            );
    }


    splitArguments(text) {

        const result = [];

        let current = "";
        let depth = 0;
        let quote = null;

        for (
            let i = 0;
            i < text.length;
            i++
        ) {

            const char =
                text[i];

            if (
                char === "'" ||
                char === '"'
            ) {

                if (
                    quote === char
                ) {

                    quote = null;

                } else if (
                    quote === null
                ) {

                    quote = char;
                }

                current += char;
                continue;
            }

            if (
                quote === null
            ) {

                if (
                    char === "(" ||
                    char === "["
                ) {

                    depth++;

                } else if (
                    char === ")" ||
                    char === "]"
                ) {

                    depth--;

                } else if (
                    char === "," &&
                    depth === 0
                ) {

                    result.push(
                        current.trim()
                    );

                    current = "";

                    continue;
                }
            }

            current += char;
        }

        if (
            current.trim() !== ""
        ) {

            result.push(
                current.trim()
            );
        }

        return result;
    }


    // =====================================================
    // OUTILS EXPRESSIONS
    // =====================================================

    outerParenthesesMatch(expr) {

        let depth = 0;
        let quote = null;

        for (
            let i = 0;
            i < expr.length;
            i++
        ) {

            const char =
                expr[i];

            if (
                char === "'" ||
                char === '"'
            ) {

                if (
                    quote === char
                ) {

                    quote = null;

                } else if (
                    quote === null
                ) {

                    quote = char;
                }

                continue;
            }

            if (
                quote !== null
            ) {

                continue;
            }

            if (
                char === "("
            ) {

                depth++;

            } else if (
                char === ")"
            ) {

                depth--;

                if (
                    depth === 0 &&
                    i !== expr.length - 1
                ) {

                    return false;
                }
            }
        }

        return depth === 0;
    }


    splitTopLevelWord(
        expression,
        word
    ) {

        let depth = 0;
        let quote = null;

        for (
            let i = 0;
            i <= expression.length - word.length;
            i++
        ) {

            const char =
                expression[i];

            if (
                char === "'" ||
                char === '"'
            ) {

                if (
                    quote === char
                ) {

                    quote = null;

                } else if (
                    quote === null
                ) {

                    quote = char;
                }

                continue;
            }

            if (
                quote !== null
            ) {

                continue;
            }

            if (
                char === "(" ||
                char === "["
            ) {

                depth++;
                continue;
            }

            if (
                char === ")" ||
                char === "]"
            ) {

                depth--;
                continue;
            }

            if (
                depth !== 0
            ) {

                continue;
            }

            const candidate =
                expression.slice(
                    i,
                    i + word.length
                );

            if (
                candidate !== word
            ) {

                continue;
            }

            const before =
                i === 0
                    ? " "
                    : expression[i - 1];

            const after =
                i + word.length >=
                expression.length
                    ? " "
                    : expression[
                        i + word.length
                    ];

            if (
                /\s/.test(before) &&
                /\s/.test(after)
            ) {

                return {
                    left:
                        expression
                            .slice(0, i)
                            .trim(),

                    right:
                        expression
                            .slice(
                                i + word.length
                            )
                            .trim()
                };
            }
        }

        return null;
    }


    findTopLevelOperator(
        expression,
        operators
    ) {

        let depth = 0;
        let quote = null;

        for (
            let i = 0;
            i < expression.length;
            i++
        ) {

            const char =
                expression[i];

            if (
                char === "'" ||
                char === '"'
            ) {

                if (
                    quote === char
                ) {

                    quote = null;

                } else if (
                    quote === null
                ) {

                    quote = char;
                }

                continue;
            }

            if (
                quote !== null
            ) {

                continue;
            }

            if (
                char === "(" ||
                char === "["
            ) {

                depth++;
                continue;
            }

            if (
                char === ")" ||
                char === "]"
            ) {

                depth--;
                continue;
            }

            if (
                depth !== 0
            ) {

                continue;
            }

            for (
                const operator
                of operators
            ) {

                if (
                    expression.startsWith(
                        operator,
                        i
                    )
                ) {

                    return {
                        index: i,
                        operator
                    };
                }
            }
        }

        return null;
    }


    findTopLevelOperatorFromRight(
        expression,
        operators
    ) {

        let depth = 0;
        let quote = null;

        for (
            let i =
                expression.length - 1;
            i >= 0;
            i--
        ) {

            const char =
                expression[i];

            if (
                char === "'" ||
                char === '"'
            ) {

                if (
                    quote === char
                ) {

                    quote = null;

                } else if (
                    quote === null
                ) {

                    quote = char;
                }

                continue;
            }

            if (
                quote !== null
            ) {

                continue;
            }

            if (
                char === ")" ||
                char === "]"
            ) {

                depth++;
                continue;
            }

            if (
                char === "(" ||
                char === "["
            ) {

                depth--;
                continue;
            }

            if (
                depth !== 0
            ) {

                continue;
            }

            if (
                !operators.includes(char)
            ) {

                continue;
            }

            /*
            Évite de prendre le signe -
            d'un nombre négatif.
            */

            if (
                char === "-" &&
                (
                    i === 0 ||
                    "+-*/%(<>=,".includes(
                        expression[i - 1]
                    )
                )
            ) {

                continue;
            }

            return {
                index: i,
                operator: char
            };
        }

        return null;
    }


    pythonString(value) {

        if (
            value === true
        ) {

            return "True";
        }

        if (
            value === false
        ) {

            return "False";
        }

        if (
            value === null
        ) {

            return "None";
        }

        if (
            Array.isArray(value)
        ) {

            return (
                "[" +
                value
                    .map(
                        item =>
                            this.pythonString(
                                item
                            )
                    )
                    .join(", ") +
                "]"
            );
        }

        return String(value);
    }
}


// =========================================================
// APPLICATION
// =========================================================

class PytApplication {

    constructor() {

        this.ui = null;

        this.robot = null;
        this.game = null;
        this.level = null;

        this.runner =
            new BrowserPythonRunner();


        // ---------------------------------------------
        // AUDIO
        // ---------------------------------------------

        this.musicEnabled = true;
        this.musicVolume = 0.6;

        this.currentMusic = null;


        // ---------------------------------------------
        // INTRO
        // ---------------------------------------------

        this.introTimers = [];
        this.introFinished = false;


        // ---------------------------------------------
        // PARAMÈTRES
        // ---------------------------------------------

        this.settingsReturnTarget =
            "menu";


        // ---------------------------------------------
        // ESSAI EN COURS
        // ---------------------------------------------

        this.lastRunResult = null;
        this.lastConceptResult = null;

        this.isRunning = false;
    }


    // =====================================================
    // DÉMARRAGE
    // =====================================================

    start() {

        if (
            typeof PytUI === "undefined"
        ) {

            console.error(
                "PytUI est introuvable."
            );

            return;
        }

        this.ui =
            new PytUI();

        /*
        Environ 0,5 seconde par action.
        */
        this.ui.actionDelay = 500;


        this.connectUI();
        this.connectShell();

        this.loadAudioSettings();

        this.loadLevel(
            1,
            1,
            false
        );


        this.hide(
            "main-menu"
        );

        this.hide(
            "settings-screen"
        );

        this.hide(
            "game-interface"
        );

        this.show(
            "intro-screen"
        );


        this.startIntro();
    }


    // =====================================================
    // CONNEXION UI
    // =====================================================

    connectUI() {

        this.ui.onRunCode =
            code => {

                this.runStudentCode(
                    code
                );
            };


        this.ui.onRestart =
            () => {

                this.restartCurrentLevel();
            };


        this.ui.onSelectLevel =
            (
                chapter,
                exercise
            ) => {

                this.loadLevel(
                    chapter,
                    exercise,
                    true
                );

                this.playChapterMusic(
                    chapter
                );
            };
    }


    // =====================================================
    // CONNEXION MENU / PARAMÈTRES
    // =====================================================

    connectShell() {

        const playButton =
            document.getElementById(
                "play-button"
            );

        const settingsButton =
            document.getElementById(
                "settings-button"
            );

        const settingsBackButton =
            document.getElementById(
                "settings-back-button"
            );

        const gameSettingsButton =
            document.getElementById(
                "game-settings-button"
            );

        const menuButton =
            document.getElementById(
                "menu-button"
            );

        const skipIntroButton =
            document.getElementById(
                "skip-intro-button"
            );

        const musicEnabled =
            document.getElementById(
                "music-enabled"
            );

        const volumeSlider =
            document.getElementById(
                "volume-slider"
            );

        const clearCodeButton =
            document.getElementById(
                "clear-code-button"
            );


        if (playButton) {

            playButton.addEventListener(
                "click",
                () => {

                    this.startGame();
                }
            );
        }


        if (settingsButton) {

            settingsButton.addEventListener(
                "click",
                () => {

                    this.openSettings(
                        "menu"
                    );
                }
            );
        }


        if (gameSettingsButton) {

            gameSettingsButton.addEventListener(
                "click",
                () => {

                    this.openSettings(
                        "game"
                    );
                }
            );
        }


        if (settingsBackButton) {

            settingsBackButton.addEventListener(
                "click",
                () => {

                    this.closeSettings();
                }
            );
        }


        if (menuButton) {

            menuButton.addEventListener(
                "click",
                () => {

                    this.openMainMenu();
                }
            );
        }


        if (skipIntroButton) {

            skipIntroButton.addEventListener(
                "click",
                () => {

                    this.finishIntro();
                }
            );
        }


        if (musicEnabled) {

            musicEnabled.addEventListener(
                "change",
                () => {

                    this.musicEnabled =
                        musicEnabled.checked;

                    this.saveAudioSettings();

                    if (
                        !this.musicEnabled
                    ) {

                        this.stopMusic();

                    } else {

                        this.resumeCorrectMusic();
                    }
                }
            );
        }


        if (volumeSlider) {

            volumeSlider.addEventListener(
                "input",
                () => {

                    this.musicVolume =
                        Math.max(
                            0,
                            Math.min(
                                1,
                                Number(
                                    volumeSlider.value
                                ) / 100
                            )
                        );

                    this.updateVolumeLabel();
                    this.applyVolume();
                    this.saveAudioSettings();
                }
            );
        }


        if (clearCodeButton) {

            clearCodeButton.addEventListener(
                "click",
                () => {

                    if (
                        this.ui &&
                        this.ui.codeEditor
                    ) {

                        this.ui.codeEditor.value =
                            "";

                        if (
                            typeof this.ui.saveCurrentCode ===
                            "function"
                        ) {

                            this.ui.saveCurrentCode();
                        }

                        if (
                            typeof this.ui.clearCodeError ===
                            "function"
                        ) {

                            this.ui.clearCodeError();
                        }
                    }
                }
            );
        }


        /*
        Quand l'élève ouvre volontairement
        le cours, on utilise la musique théorie.
        */

        const courseButton =
            document.getElementById(
                "course-button"
            );

        const mapCourseButton =
            document.getElementById(
                "map-course-button"
            );


        if (courseButton) {

            courseButton.addEventListener(
                "click",
                () => {

                    this.playTheoryMusic();
                }
            );
        }


        if (mapCourseButton) {

            mapCourseButton.addEventListener(
                "click",
                () => {

                    this.playTheoryMusic();
                }
            );
        }


        /*
        Lorsque le bouton du cours ramène
        vers la carte ou l'exercice,
        on reprend la musique du chapitre.
        */

        const courseMapButton =
            document.getElementById(
                "course-map-button"
            );

        if (courseMapButton) {

            courseMapButton.addEventListener(
                "click",
                () => {

                    setTimeout(
                        () => {

                            if (
                                !this.isElementVisible(
                                    "chapter-screen"
                                )
                            ) {

                                this.playChapterMusic(
                                    this.ui
                                        ? this.ui.currentChapter
                                        : 1
                                );
                            }
                        },
                        0
                    );
                }
            );
        }
    }


    // =====================================================
    // INTRO
    // =====================================================

    startIntro() {

        this.clearIntroTimers();

        this.introFinished = false;

        const screen =
            document.getElementById(
                "intro-screen"
            );

        if (!screen) {

            this.finishIntro();
            return;
        }

        screen.classList.remove(
            "intro-arrive",
            "intro-y",
            "intro-happy",
            "intro-finished"
        );


        this.playMusic(
            "music-intro"
        );


        this.introTimers.push(

            setTimeout(
                () => {

                    screen.classList.add(
                        "intro-arrive"
                    );
                },
                300
            )
        );


        this.introTimers.push(

            setTimeout(
                () => {

                    screen.classList.add(
                        "intro-y"
                    );
                },
                1500
            )
        );


        this.introTimers.push(

            setTimeout(
                () => {

                    screen.classList.add(
                        "intro-happy",
                        "intro-finished"
                    );
                },
                2200
            )
        );


        this.introTimers.push(

            setTimeout(
                () => {

                    this.finishIntro();
                },
                3800
            )
        );
    }


    clearIntroTimers() {

        for (
            const timer
            of this.introTimers
        ) {

            clearTimeout(timer);
        }

        this.introTimers = [];
    }


    finishIntro() {

        if (
            this.introFinished
        ) {

            return;
        }

        this.introFinished = true;

        this.clearIntroTimers();

        this.hide(
            "intro-screen"
        );

        this.openMainMenu();
    }


    // =====================================================
    // MENU
    // =====================================================

    openMainMenu() {

        this.hide(
            "intro-screen"
        );

        this.hide(
            "settings-screen"
        );

        this.hide(
            "game-interface"
        );

        this.show(
            "main-menu"
        );

        this.stopMusic();
    }


    startGame() {

        this.hide(
            "main-menu"
        );

        this.hide(
            "settings-screen"
        );

        this.show(
            "game-interface"
        );


        if (
            this.ui &&
            typeof this.ui.showCourseAtChapterStart ===
            "function"
        ) {

            const courseShown =
                this.ui.showCourseAtChapterStart();

            if (courseShown) {

                this.playTheoryMusic();
                return;
            }
        }


        if (
            this.ui &&
            typeof this.ui.showMap ===
            "function"
        ) {

            this.ui.showMap();
        }


        this.playChapterMusic(
            this.ui
                ? this.ui.currentChapter
                : 1
        );
    }


    // =====================================================
    // PARAMÈTRES
    // =====================================================

    openSettings(
        returnTarget = "menu"
    ) {

        this.settingsReturnTarget =
            returnTarget;

        this.hide(
            "main-menu"
        );

        if (
            returnTarget === "game"
        ) {

            this.hide(
                "game-interface"
            );
        }

        this.syncSettingsControls();

        this.show(
            "settings-screen"
        );
    }


    closeSettings() {

        this.hide(
            "settings-screen"
        );

        if (
            this.settingsReturnTarget ===
            "game"
        ) {

            this.show(
                "game-interface"
            );

            this.resumeCorrectMusic();

        } else {

            this.show(
                "main-menu"
            );
        }
    }


    // =====================================================
    // AUDIO
    // =====================================================

    loadAudioSettings() {

        try {

            const enabled =
                localStorage.getItem(
                    "pyt-music-enabled"
                );

            const volume =
                localStorage.getItem(
                    "pyt-music-volume"
                );


            if (
                enabled !== null
            ) {

                this.musicEnabled =
                    enabled === "true";
            }


            if (
                volume !== null
            ) {

                const parsed =
                    Number(volume);

                if (
                    Number.isFinite(parsed)
                ) {

                    this.musicVolume =
                        Math.max(
                            0,
                            Math.min(
                                1,
                                parsed
                            )
                        );
                }
            }

        } catch (error) {

            /*
            localStorage peut être indisponible.
            Le jeu continue normalement.
            */
        }


        this.syncSettingsControls();
        this.applyVolume();
    }


    saveAudioSettings() {

        try {

            localStorage.setItem(
                "pyt-music-enabled",
                String(
                    this.musicEnabled
                )
            );

            localStorage.setItem(
                "pyt-music-volume",
                String(
                    this.musicVolume
                )
            );

        } catch (error) {

            /*
            Pas bloquant.
            */
        }
    }


    syncSettingsControls() {

        const enabled =
            document.getElementById(
                "music-enabled"
            );

        const slider =
            document.getElementById(
                "volume-slider"
            );

        if (enabled) {

            enabled.checked =
                this.musicEnabled;
        }

        if (slider) {

            slider.value =
                String(
                    Math.round(
                        this.musicVolume *
                        100
                    )
                );
        }

        this.updateVolumeLabel();
    }


    updateVolumeLabel() {

        const label =
            document.getElementById(
                "volume-value"
            );

        if (label) {

            label.textContent =
                `${Math.round(
                    this.musicVolume *
                    100
                )}%`;
        }
    }


    applyVolume() {

        const audioElements =
            document.querySelectorAll(
                "#audio-container audio"
            );

        for (
            const audio
            of audioElements
        ) {

            audio.volume =
                this.musicVolume;
        }
    }


    audioHasSource(audio) {

        if (!audio) {

            return false;
        }

        const src =
            audio.getAttribute(
                "src"
            );

        if (
            src &&
            src.trim() !== ""
        ) {

            return true;
        }

        const source =
            audio.querySelector(
                "source[src]"
            );

        return Boolean(
            source &&
            source.getAttribute("src")
        );
    }


    playMusic(id) {

        if (
            !this.musicEnabled
        ) {

            return;
        }

        const audio =
            document.getElementById(
                id
            );

        /*
        Aucun fichier audio n'est obligatoire.
        Une balise sans src est simplement ignorée.
        */

        if (
            !this.audioHasSource(audio)
        ) {

            this.stopMusic();
            return;
        }

        if (
            this.currentMusic === audio &&
            !audio.paused
        ) {

            return;
        }

        this.stopMusic();

        this.currentMusic =
            audio;

        audio.volume =
            this.musicVolume;

        audio.loop = true;

        try {

            const promise =
                audio.play();

            if (
                promise &&
                typeof promise.catch ===
                "function"
            ) {

                promise.catch(
                    () => {
                        /*
                        Certains navigateurs bloquent
                        l'audio avant une interaction.
                        Ce n'est jamais une erreur du jeu.
                        */
                    }
                );
            }

        } catch (error) {

            /*
            Audio non bloquant.
            */
        }
    }


    stopMusic() {

        const audioElements =
            document.querySelectorAll(
                "#audio-container audio"
            );

        for (
            const audio
            of audioElements
        ) {

            try {

                audio.pause();

            } catch (error) {

                /*
                Rien à faire.
                */
            }
        }

        this.currentMusic = null;
    }


    playTheoryMusic() {

        this.playMusic(
            "music-theory"
        );
    }


    playChapterMusic(
        chapter
    ) {

        const safeChapter =
            Math.max(
                1,
                Math.min(
                    9,
                    Number(chapter) || 1
                )
            );

        this.playMusic(
            `music-chapter-${safeChapter}`
        );
    }


    resumeCorrectMusic() {

        if (
            !this.musicEnabled
        ) {

            return;
        }

        if (
            this.isElementVisible(
                "chapter-screen"
            )
        ) {

            this.playTheoryMusic();
            return;
        }

        if (
            this.isElementVisible(
                "game-interface"
            )
        ) {

            this.playChapterMusic(
                this.ui
                    ? this.ui.currentChapter
                    : 1
            );
        }
    }


    // =====================================================
    // NIVEAUX
    // =====================================================

    loadLevel(
        chapter,
        exercise,
        showGame = true
    ) {

        const level =
            typeof getLevel ===
            "function"
                ? getLevel(
                    chapter,
                    exercise
                )
                : null;

        if (!level) {

            console.error(
                `Niveau ${chapter}-${exercise} introuvable.`
            );

            return false;
        }

        this.level =
            level;


        this.robot =
            new Robot();


        this.game =
            new Game(
                level,
                this.robot
            );


        if (
            this.ui
        ) {

            this.ui.currentChapter =
                Number(chapter);

            this.ui.currentExercise =
                Number(exercise);


            if (
                typeof this.ui.setGame ===
                "function"
            ) {

                this.ui.setGame(
                    this.game
                );
            }


            if (
                typeof this.ui.setLevel ===
                "function"
            ) {

                this.ui.setLevel(
                    level
                );
            }


            if (
                showGame &&
                typeof this.ui.showGame ===
                "function"
            ) {

                this.ui.showGame();
            }
        }


        return true;
    }


    restartCurrentLevel() {

        if (
            this.isRunning
        ) {

            return;
        }

        const chapter =
            this.ui
                ? this.ui.currentChapter
                : this.level?.chapter;

        const exercise =
            this.ui
                ? this.ui.currentExercise
                : this.level?.exercise;


        this.loadLevel(
            chapter,
            exercise,
            true
        );


        if (
            this.ui &&
            typeof this.ui.clearCodeError ===
            "function"
        ) {

            this.ui.clearCodeError();
        }


        if (
            this.ui &&
            typeof this.ui.hideThought ===
            "function"
        ) {

            this.ui.hideThought();
        }


        if (
            this.ui &&
            typeof this.ui.setStatus ===
            "function"
        ) {

            this.ui.setStatus(
                "PRÊT"
            );
        }


        this.playChapterMusic(
            chapter
        );
    }


    // =====================================================
    // EXÉCUTION DU CODE
    // =====================================================

    runStudentCode(code) {

        if (
            this.isRunning ||
            !this.level
        ) {

            return;
        }


        this.isRunning = true;


        /*
        Chaque exécution repart de l'état
        initial du niveau, mais le texte du code
        reste dans l'éditeur.
        */

        const chapter =
            this.ui.currentChapter;

        const exercise =
            this.ui.currentExercise;


        this.loadLevel(
            chapter,
            exercise,
            true
        );


        if (
            this.ui &&
            typeof this.ui.clearCodeError ===
            "function"
        ) {

            this.ui.clearCodeError();
        }


        if (
            this.ui &&
            typeof this.ui.hideThought ===
            "function"
        ) {

            this.ui.hideThought();
        }


        if (
            this.ui &&
            typeof this.ui.setStatus ===
            "function"
        ) {

            this.ui.setStatus(
                "EXÉCUTION..."
            );
        }


        if (
            this.ui &&
            typeof this.ui.setConsole ===
            "function"
        ) {

            this.ui.setConsole(
                "Exécution du programme..."
            );
        }


        const result =
            this.runner.run(
                code
            );


        this.lastRunResult =
            result;


        /*
        Vérification pédagogique indépendante
        du trajet.

        On ne compare jamais le programme à
        une solution exacte : plusieurs solutions
        restent donc possibles.
        */

        this.lastConceptResult =
            this.validateRequiredConcepts(
                code,
                this.level
            );


        const actions =
            Array.isArray(
                result.actions
            )
                ? result.actions
                : [];


        const finish =
            animationResult => {

                this.finishAttempt(
                    code,
                    result,
                    animationResult
                );
            };


        /*
        Même si le programme contient ensuite
        une erreur, toutes les actions valides
        déjà produites sont animées.
        */

        if (
            actions.length > 0 &&
            this.ui &&
            typeof this.ui.playActions ===
            "function"
        ) {

            this.ui.playActions(
                actions,

                action =>
                    this.performAction(
                        action
                    ),

                (
                    completed,
                    details
                ) => {

                    finish({
                        completed,
                        details:
                            details || null
                    });
                }
            );

        } else {

            finish({
                completed: true,
                details: null
            });
        }
    }


    // =====================================================
    // ACTIONS DU ROBOT
    // =====================================================

    performAction(action) {

        if (
            !action ||
            !this.game ||
            !this.robot
        ) {

            return false;
        }


        let type;
        let value;


        if (
            Array.isArray(action)
        ) {

            type =
                action[0];

            value =
                action[1];

        } else {

            type =
                action.type;

            value =
                action.value;
        }


        if (
            type === "forward"
        ) {

            return this.performMovement(
                "forward",
                value
            );
        }


        if (
            type === "backward"
        ) {

            return this.performMovement(
                "backward",
                value
            );
        }


        if (
            type === "right"
        ) {

            if (
                typeof this.robot.rotateRight ===
                "function"
            ) {

                this.robot.rotateRight(
                    value || 90
                );

            } else if (
                typeof this.robot.turnRight ===
                "function"
            ) {

                this.robot.turnRight();
            }

            return true;
        }


        if (
            type === "left"
        ) {

            if (
                typeof this.robot.rotateLeft ===
                "function"
            ) {

                this.robot.rotateLeft(
                    value || 90
                );

            } else if (
                typeof this.robot.turnLeft ===
                "function"
            ) {

                this.robot.turnLeft();
            }

            return true;
        }


        return false;
    }


    performMovement(
        direction,
        amount
    ) {

        const steps =
            Math.max(
                0,
                Number(amount) || 0
            );


        for (
            let i = 0;
            i < steps;
            i++
        ) {

            let success = false;


            if (
                direction === "forward"
            ) {

                if (
                    typeof this.game.moveForward ===
                    "function"
                ) {

                    success =
                        this.game.moveForward();

                } else if (
                    typeof this.robot.forward ===
                    "function"
                ) {

                    success =
                        this.robot.forward(
                            this.game,
                            1
                        );
                }

            } else {

                if (
                    typeof this.game.moveBackward ===
                    "function"
                ) {

                    success =
                        this.game.moveBackward();

                } else if (
                    typeof this.robot.backward ===
                    "function"
                ) {

                    success =
                        this.robot.backward(
                            this.game,
                            1
                        );
                }
            }


            if (
                success === false
            ) {

                return false;
            }
        }


        return true;
    }


    // =====================================================
    // FIN D'ESSAI
    // =====================================================

    finishAttempt(
        code,
        runnerResult,
        animationResult
    ) {

        this.isRunning = false;


        const output =
            Array.isArray(
                runnerResult.output
            )
                ? runnerResult.output
                : [];


        /*
        1. Erreur Python / syntaxique.
        */

        if (
            !runnerResult.success
        ) {

            const consoleText = [
                ...output,
                "",
                `Erreur : ${runnerResult.error}`
            ]
                .filter(
                    line =>
                        line !== undefined
                )
                .join("\n");


            this.setConsole(
                consoleText
            );


            this.failAttempt({

                type:
                    "python_error",

                message:
                    runnerResult.error,

                line:
                    runnerResult.errorLine
            });

            return;
        }


        /*
        2. Action impossible :
        mur, porte fermée, sortie de carte...
        */

        if (
            animationResult &&
            animationResult.completed === false
        ) {

            const action =
                animationResult
                    .details
                    ?.action;

            const line =
                action &&
                !Array.isArray(action)
                    ? action.line
                    : null;


            this.setConsole(
                [
                    ...output,
                    "",
                    "Pyt n'a pas pu terminer un déplacement."
                ].join("\n")
            );


            this.failAttempt({

                type:
                    "blocked",

                message:
                    "Mon trajet est bloqué. Regarde où je me suis arrêté et vérifie le déplacement correspondant.",

                line
            });

            return;
        }


        /*
        3. Objectif réel du niveau.
        */

        const success =
            this.game &&
            typeof this.game.checkSuccess ===
            "function"
                ? this.game.checkSuccess()
                : false;


        if (!success) {

            const feedback =
                this.getFailureFeedback();


            this.setConsole(
                [
                    ...output,
                    "",
                    feedback.message
                ].join("\n")
            );


            if (
                feedback.thought &&
                this.ui &&
                typeof this.ui.showThought ===
                "function"
            ) {

                this.ui.showThought(
                    feedback.thought
                );
            }


            this.failAttempt(
                feedback
            );

            return;
        }


        /*
        4. Le trajet est correct, mais l'exercice
        demande une notion du chapitre.

        Exemple :
        le niveau sur les boucles ne doit pas
        être validé avec 10 forward() écrits à la main.

        On vérifie seulement la présence des
        structures demandées, jamais une solution
        exacte.
        */

        if (
            this.lastConceptResult &&
            !this.lastConceptResult.success
        ) {

            const message =
                this.lastConceptResult.message;


            this.setConsole(
                [
                    ...output,
                    "",
                    message
                ].join("\n")
            );


            this.failAttempt({

                type:
                    "missing_concept",

                message,

                line: null
            });

            return;
        }


        // ---------------------------------------------
        // SUCCÈS
        // ---------------------------------------------

        this.setConsole(
            [
                ...output,
                "",
                this.level.successMessage ||
                "Mission réussie !"
            ].join("\n")
        );


        if (
            this.ui &&
            typeof this.ui.setStatus ===
            "function"
        ) {

            this.ui.setStatus(
                "RÉUSSI"
            );
        }


        if (
            this.ui &&
            typeof this.ui.showGuide ===
            "function"
        ) {

            this.ui.showGuide(
                this.level.successMessage ||
                "Bravo ! Mission réussie."
            );
        }


        if (
            this.ui &&
            typeof this.ui.completeCurrentLevel ===
            "function"
        ) {

            this.ui.completeCurrentLevel();
        }
    }


    failAttempt(details) {

        if (
            this.ui &&
            typeof this.ui.setStatus ===
            "function"
        ) {

            this.ui.setStatus(
                "À CORRIGER"
            );
        }


        if (
            this.ui &&
            typeof this.ui.handleFailedAttempt ===
            "function"
        ) {

            this.ui.handleFailedAttempt(
                details
            );
        }
    }


    // =====================================================
    // RETOURS D'ERREUR DU MONDE
    // =====================================================

    getFailureFeedback() {

        const state =
            this.game &&
            typeof this.game.getState ===
            "function"
                ? this.game.getState()
                : null;


        // ---------------------------------------------
        // OBJETS NON RAMASSÉS
        // ---------------------------------------------

        if (
            this.collectionHasItems(
                this.game?.objects
            )
        ) {

            return {
                type:
                    "object_not_picked",

                message:
                    "Il reste un objet à récupérer. Regarde le trajet de Pyt et vérifie qu'il passe bien dessus.",

                line:
                    null
            };
        }


        // ---------------------------------------------
        // SALETÉS
        // ---------------------------------------------

        if (
            this.collectionHasItems(
                this.game?.dirt
            )
        ) {

            return {
                type:
                    "unfinished_cleaning",

                message:
                    "Il reste encore une zone à nettoyer. Pyt doit passer sur toutes les cases sales.",

                line:
                    null
            };
        }


        // ---------------------------------------------
        // BOUTONS
        // ---------------------------------------------

        if (
            this.collectionHasItems(
                this.game?.buttons
            )
        ) {

            const inactive =
                this.countInactiveButtons(
                    this.game.buttons
                );

            if (
                inactive > 0
            ) {

                return {
                    type:
                        "button_not_activated",

                    message:
                        "Un bouton n'a pas encore été activé. Fais passer Pyt dessus avant de continuer.",

                    line:
                        null
                };
            }
        }


        // ---------------------------------------------
        // DÉPÔT
        // ---------------------------------------------

        if (
            this.objectiveContains(
                "deposit"
            )
        ) {

            return {
                type:
                    "object_misplaced",

                message:
                    "L'objet n'est pas encore au bon endroit. Vérifie la zone de dépôt.",

                line:
                    null
            };
        }


        // ---------------------------------------------
        // CAISSES
        // ---------------------------------------------

        if (
            this.objectiveContains(
                "boxes"
            )
        ) {

            return {
                type:
                    "boxes_unfinished",

                message:
                    "Toutes les caisses ne sont pas encore à leur place.",

                line:
                    null
            };
        }


        // ---------------------------------------------
        // MAUVAISE CASE FINALE
        // ---------------------------------------------

        if (
            this.objectiveContains(
                "reach_goal"
            )
        ) {

            return {
                type:
                    "wrong_destination",

                message:
                    "Pyt a exécuté le programme, mais il ne termine pas sur la bonne case.",

                thought:
                    "Ce n’est pas là que je voulais aller...",

                line:
                    null
            };
        }


        // ---------------------------------------------
        // MESSAGE DU MOTEUR
        // ---------------------------------------------

        if (
            this.game &&
            typeof this.game.message ===
            "string" &&
            this.game.message.trim() !== ""
        ) {

            return {
                type:
                    "unfinished_objective",

                message:
                    this.game.message,

                line:
                    null
            };
        }


        // ---------------------------------------------
        // GÉNÉRIQUE
        // ---------------------------------------------

        return {
            type:
                "unfinished_objective",

            message:
                "La mission n'est pas encore terminée. Observe le trajet de Pyt et compare-le à l'objectif.",

            line:
                null,

            state
        };
    }


    collectionHasItems(
        collection
    ) {

        if (!collection) {

            return false;
        }

        if (
            typeof collection.size ===
            "number"
        ) {

            return collection.size > 0;
        }

        if (
            Array.isArray(collection)
        ) {

            return collection.length > 0;
        }

        return false;
    }


    countInactiveButtons(
        buttons
    ) {

        if (!buttons) {

            return 0;
        }

        if (
            buttons instanceof Set
        ) {

            /*
            Dans certains moteurs, les boutons
            restants sont simplement ceux qui ne
            sont pas encore activés.
            */

            return buttons.size;
        }

        if (
            buttons instanceof Map
        ) {

            let count = 0;

            for (
                const value
                of buttons.values()
            ) {

                if (
                    value === false ||
                    value?.active === false
                ) {

                    count++;
                }
            }

            return count;
        }

        if (
            Array.isArray(buttons)
        ) {

            return buttons.filter(
                value =>
                    value === false ||
                    value?.active === false
            ).length;
        }

        return 0;
    }


    objectiveContains(type) {

        const objective =
            this.level?.objective;

        if (!objective) {

            return false;
        }

        if (
            objective.type === type
        ) {

            return true;
        }

        if (
            objective.type ===
            "combined" &&
            Array.isArray(
                objective.requirements
            )
        ) {

            return objective
                .requirements
                .some(
                    requirement =>
                        requirement &&
                        requirement.type ===
                        type
                );
        }

        return false;
    }


    // =====================================================
    // VALIDATION DES NOTIONS
    // =====================================================

    validateRequiredConcepts(
        code,
        level
    ) {

        const required =
            Array.isArray(
                level?.requiredConcepts
            )
                ? level.requiredConcepts
                : [];


        if (
            required.length === 0
        ) {

            return {
                success: true,
                missing: [],
                message: ""
            };
        }


        /*
        "revision" signifie que l'élève choisit
        lui-même les notions utiles.
        */

        const conceptsToCheck =
            required.filter(
                concept =>
                    concept !== "revision"
            );


        if (
            conceptsToCheck.length === 0
        ) {

            return {
                success: true,
                missing: [],
                message: ""
            };
        }


        const source =
            String(code || "");


        const tests = {

            forward:
                /\bforward\s*\(/,

            backward:
                /\bbackward\s*\(/,

            turn:
                /\b(?:left|right)\s*\(/,

            movement:
                /\b(?:forward|backward|left|right)\s*\(/,

            variable:
                /^[ \t]*[A-Za-z_]\w*[ \t]*=(?!=)/m,

            arithmetic:
                /(?:\+|-|\*|\/|%)/,

            conversion:
                /\b(?:int|float|str)\s*\(/,

            if:
                /^[ \t]*if\s+.+:/m,

            elif:
                /^[ \t]*elif\s+.+:/m,

            else:
                /^[ \t]*else\s*:/m,

            condition:
                /^[ \t]*(?:if|elif)\s+.+:/m,

            boolean:
                /\b(?:and|or|not)\b/,

            for:
                /^[ \t]*for\s+[A-Za-z_]\w*\s+in\s+.+:/m,

            range:
                /\brange\s*\(/,

            while:
                /^[ \t]*while\s+.+:/m,

            break:
                /^[ \t]*break\b/m,

            list:
                /=\s*\[[\s\S]*?\]/m,

            index:
                /\b[A-Za-z_]\w*\s*\[[^\]]+\]/,

            append:
                /\.append\s*\(/,

            function:
                /^[ \t]*def\s+[A-Za-z_]\w*\s*\(/m,

            parameter:
                /^[ \t]*def\s+[A-Za-z_]\w*\s*\(\s*[A-Za-z_]\w+/m,

            loop:
                /^[ \t]*(?:for|while)\s+.+:/m
        };


        const labels = {

            forward:
                "forward()",

            backward:
                "backward()",

            turn:
                "un virage avec left() ou right()",

            movement:
                "les commandes de déplacement",

            variable:
                "une variable",

            arithmetic:
                "un calcul",

            conversion:
                "une conversion int(), float() ou str()",

            if:
                "une condition if",

            elif:
                "elif",

            else:
                "else",

            condition:
                "une condition",

            boolean:
                "and, or ou not",

            for:
                "une boucle for",

            range:
                "range()",

            while:
                "une boucle while",

            break:
                "break",

            list:
                "une liste",

            index:
                "l'accès à un élément de liste",

            append:
                "append()",

            function:
                "une fonction avec def",

            parameter:
                "un paramètre de fonction",

            loop:
                "une boucle"
        };


        const missing = [];


        for (
            const concept
            of conceptsToCheck
        ) {

            const test =
                tests[concept];

            /*
            Si une future notion n'a pas encore
            de test, elle ne bloque pas le jeu.
            */

            if (!test) {

                continue;
            }

            if (
                !test.test(source)
            ) {

                missing.push(
                    concept
                );
            }
        }


        if (
            missing.length === 0
        ) {

            return {
                success: true,
                missing: [],
                message: ""
            };
        }


        const missingLabels =
            missing.map(
                concept =>
                    labels[concept] ||
                    concept
            );


        let listText = "";

        if (
            missingLabels.length === 1
        ) {

            listText =
                missingLabels[0];

        } else {

            listText =
                missingLabels
                    .slice(
                        0,
                        -1
                    )
                    .join(", ") +
                " et " +
                missingLabels[
                    missingLabels.length - 1
                ];
        }


        return {
            success: false,
            missing,

            message:
                `Ton trajet fonctionne peut-être, mais cet exercice te demande d'utiliser ${listText}. Il peut y avoir plusieurs solutions : modifie ton programme en utilisant la notion du chapitre.`
        };
    }


    // =====================================================
    // CONSOLE
    // =====================================================

    setConsole(text) {

        if (
            this.ui &&
            typeof this.ui.setConsole ===
            "function"
        ) {

            this.ui.setConsole(
                text
            );

            return;
        }

        const consoleOutput =
            document.getElementById(
                "console-output"
            );

        if (consoleOutput) {

            consoleOutput.textContent =
                text;
        }
    }


    // =====================================================
    // OUTILS DOM
    // =====================================================

    show(id) {

        const element =
            document.getElementById(
                id
            );

        if (element) {

            element.classList.remove(
                "hidden"
            );
        }
    }


    hide(id) {

        const element =
            document.getElementById(
                id
            );

        if (element) {

            element.classList.add(
                "hidden"
            );
        }
    }


    isElementVisible(id) {

        const element =
            document.getElementById(
                id
            );

        if (!element) {

            return false;
        }

        return !element.classList.contains(
            "hidden"
        );
    }
}


// =========================================================
// DÉMARRAGE AUTOMATIQUE
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const app =
            new PytApplication();

        window.pytApp =
            app;

        /*
        Petit accès pratique depuis la console
        du navigateur pendant le développement.
        */

        window.runPythonCode =
            code =>
                app.runner.run(
                    code
                );


        app.start();
    }
);


// =========================================================
// EXPOSITION
// =========================================================

window.BrowserPythonRunner =
    BrowserPythonRunner;

window.PytApplication =
    PytApplication;