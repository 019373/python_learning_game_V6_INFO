"use strict";

/*
============================================================
PYT - app.js
Version navigateur

Rôles :
- démarre l'application ;
- connecte UI / niveaux / robot / moteur ;
- exécute le sous-ensemble Python pédagogique de PYT ;
- transforme le programme en actions animables.

Aucune installation Python n'est nécessaire.
============================================================
*/


// =========================================================
// RUNNER PYTHON PÉDAGOGIQUE
// =========================================================

class BrowserPythonRunner {

    constructor() {
        this.maxActions = 250;
        this.maxIterations = 1000;
        this.maxFunctionCalls = 100;

        this.actions = [];
        this.output = [];

        this.variables = Object.create(null);
        this.functions = Object.create(null);

        this.iterations = 0;
        this.functionCalls = 0;
    }


    // =====================================================
    // EXÉCUTION PRINCIPALE
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
                0
            );

            return {
                success: true,
                error: null,
                output: this.output.join("\n"),
                actions: [...this.actions]
            };

        } catch (error) {

            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
                output: this.output.join("\n"),
                actions: []
            };
        }
    }


    reset() {

        this.actions = [];
        this.output = [];

        this.variables =
            Object.create(null);

        this.functions =
            Object.create(null);

        this.iterations = 0;
        this.functionCalls = 0;
    }


    // =====================================================
    // PRÉPARATION DU CODE
    // =====================================================

    prepareLines(code) {

        const rawLines =
            String(code)
                .replace(/\r/g, "")
                .replace(/\t/g, "    ")
                .split("\n");

        const result = [];


        for (
            let index = 0;
            index < rawLines.length;
            index++
        ) {

            const original =
                rawLines[index];

            const withoutComment =
                this.removeComment(
                    original
                );

            if (
                withoutComment.trim()
                === ""
            ) {
                continue;
            }


            const spaces =
                withoutComment
                    .match(/^ */)[0]
                    .length;


            if (
                spaces % 4 !== 0
            ) {

                throw new Error(
                    `Ligne ${index + 1} : utilise 4 espaces pour l'indentation.`
                );
            }


            result.push({
                number:
                    index + 1,

                indent:
                    spaces,

                text:
                    withoutComment.trim()
            });
        }


        return result;
    }


    removeComment(line) {

        let result = "";

        let quote = null;


        for (
            let i = 0;
            i < line.length;
            i++
        ) {

            const char =
                line[i];


            if (
                (
                    char === "'"
                    ||
                    char === '"'
                )
                &&
                line[i - 1] !== "\\"
            ) {

                if (quote === null) {

                    quote = char;

                } else if (
                    quote === char
                ) {

                    quote = null;
                }
            }


            if (
                char === "#"
                &&
                quote === null
            ) {

                break;
            }


            result += char;
        }


        return result.replace(
            /\s+$/,
            ""
        );
    }


    // =====================================================
    // BLOC DE CODE
    // =====================================================

    executeBlock(
        lines,
        startIndex,
        indent
    ) {

        let index =
            startIndex;


        while (
            index < lines.length
        ) {

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
                text.startsWith("if ")
                &&
                text.endsWith(":")
            ) {

                const result =
                    this.executeIf(
                        lines,
                        index,
                        indent
                    );

                index =
                    result.nextIndex;

                continue;
            }


            // ---------------------------------------------
            // FOR
            // ---------------------------------------------

            if (
                text.startsWith("for ")
                &&
                text.endsWith(":")
            ) {

                index =
                    this.executeFor(
                        lines,
                        index,
                        indent
                    );

                continue;
            }


            // ---------------------------------------------
            // WHILE
            // ---------------------------------------------

            if (
                text.startsWith("while ")
                &&
                text.endsWith(":")
            ) {

                index =
                    this.executeWhile(
                        lines,
                        index,
                        indent
                    );

                continue;
            }


            // ---------------------------------------------
            // DEF
            // ---------------------------------------------

            if (
                text.startsWith("def ")
                &&
                text.endsWith(":")
            ) {

                index =
                    this.registerFunction(
                        lines,
                        index,
                        indent
                    );

                continue;
            }


            // ---------------------------------------------
            // ELSE / ELIF ISOLÉ
            // ---------------------------------------------

            if (
                text === "else:"
                ||
                text.startsWith("elif ")
            ) {

                break;
            }


            // ---------------------------------------------
            // BREAK
            // ---------------------------------------------

            if (text === "break") {

                return {
                    nextIndex:
                        index + 1,

                    signal:
                        "break"
                };
            }


            // ---------------------------------------------
            // RETURN
            // ---------------------------------------------

            if (
                text === "return"
                ||
                text.startsWith("return ")
            ) {

                let value = null;


                if (
                    text !== "return"
                ) {

                    value =
                        this.evaluateExpression(
                            text.slice(7)
                        );
                }


                return {
                    nextIndex:
                        index + 1,

                    signal:
                        "return",

                    value
                };
            }


            // ---------------------------------------------
            // INSTRUCTION SIMPLE
            // ---------------------------------------------

            this.executeStatement(
                text,
                line.number
            );


            index++;
        }


        return {
            nextIndex:
                index,

            signal:
                null
        };
    }


    // =====================================================
    // IF / ELIF / ELSE
    // =====================================================

    executeIf(
        lines,
        index,
        indent
    ) {

        let cursor =
            index;

        let executed =
            false;


        while (
            cursor < lines.length
        ) {

            const line =
                lines[cursor];


            if (
                line.indent !== indent
            ) {
                break;
            }


            let condition = null;


            if (
                line.text.startsWith("if ")
                &&
                line.text.endsWith(":")
            ) {

                condition =
                    line.text.slice(
                        3,
                        -1
                    );

            } else if (
                line.text.startsWith("elif ")
                &&
                line.text.endsWith(":")
            ) {

                condition =
                    line.text.slice(
                        5,
                        -1
                    );

            } else if (
                line.text === "else:"
            ) {

                condition =
                    null;

            } else {

                break;
            }


            const block =
                this.findChildBlock(
                    lines,
                    cursor,
                    indent
                );


            const shouldRun =
                !executed
                &&
                (
                    condition === null
                    ||
                    Boolean(
                        this.evaluateExpression(
                            condition
                        )
                    )
                );


            if (shouldRun) {

                const result =
                    this.executeBlock(
                        lines,
                        block.start,
                        block.indent
                    );


                executed = true;


                if (
                    result.signal
                ) {

                    return {
                        nextIndex:
                            block.end,

                        signal:
                            result.signal,

                        value:
                            result.value
                    };
                }
            }


            cursor =
                block.end;


            if (
                cursor >= lines.length
            ) {
                break;
            }


            const next =
                lines[cursor];


            if (
                next.indent !== indent
            ) {
                break;
            }


            if (
                !next.text.startsWith("elif ")
                &&
                next.text !== "else:"
            ) {
                break;
            }
        }


        return {
            nextIndex:
                cursor,

            signal:
                null
        };
    }


    // =====================================================
    // FOR
    // =====================================================

    executeFor(
        lines,
        index,
        indent
    ) {

        const line =
            lines[index];


        const match =
            line.text.match(
                /^for\s+([A-Za-z_]\w*)\s+in\s+(.+):$/
            );


        if (!match) {

            throw new Error(
                `Ligne ${line.number} : boucle for invalide.`
            );
        }


        const variableName =
            match[1];

        const iterable =
            this.evaluateExpression(
                match[2]
            );


        if (
            !Array.isArray(iterable)
        ) {

            throw new Error(
                `Ligne ${line.number} : la boucle for attend range(...) ou une liste.`
            );
        }


        const block =
            this.findChildBlock(
                lines,
                index,
                indent
            );


        for (
            const value
            of iterable
        ) {

            this.countIteration();


            this.variables[
                variableName
            ] = value;


            const result =
                this.executeBlock(
                    lines,
                    block.start,
                    block.indent
                );


            if (
                result.signal
                === "break"
            ) {
                break;
            }


            if (
                result.signal
                === "return"
            ) {

                return block.end;
            }
        }


        return block.end;
    }


    // =====================================================
    // WHILE
    // =====================================================

    executeWhile(
        lines,
        index,
        indent
    ) {

        const line =
            lines[index];


        const condition =
            line.text.slice(
                6,
                -1
            );


        const block =
            this.findChildBlock(
                lines,
                index,
                indent
            );


        while (
            Boolean(
                this.evaluateExpression(
                    condition
                )
            )
        ) {

            this.countIteration();


            const result =
                this.executeBlock(
                    lines,
                    block.start,
                    block.indent
                );


            if (
                result.signal
                === "break"
            ) {
                break;
            }


            if (
                result.signal
                === "return"
            ) {
                break;
            }
        }


        return block.end;
    }


    countIteration() {

        this.iterations++;


        if (
            this.iterations
            >
            this.maxIterations
        ) {

            throw new Error(
                "Boucle arrêtée : trop d'itérations. Vérifie la condition de ta boucle."
            );
        }
    }


    // =====================================================
    // FONCTIONS
    // =====================================================

    registerFunction(
        lines,
        index,
        indent
    ) {

        const line =
            lines[index];


        const match =
            line.text.match(
                /^def\s+([A-Za-z_]\w*)\s*\((.*?)\)\s*:$/
            );


        if (!match) {

            throw new Error(
                `Ligne ${line.number} : définition de fonction invalide.`
            );
        }


        const name =
            match[1];


        const parameters =
            match[2]
                .split(",")
                .map(
                    value =>
                        value.trim()
                )
                .filter(Boolean);


        for (
            const parameter
            of parameters
        ) {

            if (
                !/^[A-Za-z_]\w*$/
                    .test(parameter)
            ) {

                throw new Error(
                    `Ligne ${line.number} : paramètre invalide.`
                );
            }
        }


        const block =
            this.findChildBlock(
                lines,
                index,
                indent
            );


        this.functions[name] = {
            parameters,
            lines,
            start:
                block.start,
            end:
                block.end,
            indent:
                block.indent
        };


        return block.end;
    }


    callFunction(
        name,
        args
    ) {

        const func =
            this.functions[name];


        if (!func) {

            throw new Error(
                `Fonction inconnue : ${name}().`
            );
        }


        if (
            args.length
            !==
            func.parameters.length
        ) {

            throw new Error(
                `${name}() attend ${func.parameters.length} argument(s).`
            );
        }


        this.functionCalls++;


        if (
            this.functionCalls
            >
            this.maxFunctionCalls
        ) {

            throw new Error(
                "Trop d'appels de fonctions."
            );
        }


        const savedVariables =
            { ...this.variables };


        for (
            let i = 0;
            i < func.parameters.length;
            i++
        ) {

            this.variables[
                func.parameters[i]
            ] = args[i];
        }


        const functionLines =
            func.lines.slice(
                0,
                func.end
            );


        const result =
            this.executeBlock(
                functionLines,
                func.start,
                func.indent
            );


        const returnValue =
            result.signal
            === "return"
                ? result.value
                : null;


        this.variables =
            Object.assign(
                Object.create(null),
                savedVariables
            );


        return returnValue;
    }


    // =====================================================
    // TROUVER LE BLOC ENFANT
    // =====================================================

    findChildBlock(
        lines,
        parentIndex,
        parentIndent
    ) {

        const start =
            parentIndex + 1;


        if (
            start >= lines.length
            ||
            lines[start].indent
            <= parentIndent
        ) {

            throw new Error(
                `Ligne ${lines[parentIndex].number} : bloc indenté attendu.`
            );
        }


        const childIndent =
            lines[start].indent;


        let end =
            start;


        while (
            end < lines.length
            &&
            lines[end].indent
            >= childIndent
        ) {

            end++;
        }


        return {
            start,
            end,
            indent:
                childIndent
        };
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

        const compound =
            text.match(
                /^([A-Za-z_]\w*)\s*(\+=|-=|\*=)\s*(.+)$/
            );


        if (compound) {

            const name =
                compound[1];

            const operator =
                compound[2];

            const right =
                this.evaluateExpression(
                    compound[3]
                );


            if (
                !(name in this.variables)
            ) {

                throw new Error(
                    `Ligne ${lineNumber} : variable inconnue "${name}".`
                );
            }


            if (operator === "+=") {

                this.variables[name] += right;

            } else if (
                operator === "-="
            ) {

                this.variables[name] -= right;

            } else {

                this.variables[name] *= right;
            }


            return;
        }


        // ---------------------------------------------
        // AFFECTATION
        // ---------------------------------------------

        const assignment =
            text.match(
                /^([A-Za-z_]\w*)\s*=\s*(?!=)(.+)$/
            );


        if (assignment) {

            this.variables[
                assignment[1]
            ] =
                this.evaluateExpression(
                    assignment[2]
                );

            return;
        }


        // ---------------------------------------------
        // APPEND
        // ---------------------------------------------

        const appendMatch =
            text.match(
                /^([A-Za-z_]\w*)\.append\s*\((.*)\)$/
            );


        if (appendMatch) {

            const list =
                this.variables[
                    appendMatch[1]
                ];


            if (
                !Array.isArray(list)
            ) {

                throw new Error(
                    `Ligne ${lineNumber} : append() s'utilise sur une liste.`
                );
            }


            list.push(
                this.evaluateExpression(
                    appendMatch[2]
                )
            );

            return;
        }


        // ---------------------------------------------
        // APPEL DE FONCTION / COMMANDE
        // ---------------------------------------------

        const call =
            this.parseCall(
                text
            );


        if (call) {

            const args =
                this.parseArguments(
                    call.arguments
                )
                .map(
                    argument =>
                        this.evaluateExpression(
                            argument
                        )
                );


            this.executeCall(
                call.name,
                args
            );

            return;
        }


        throw new Error(
            `Ligne ${lineNumber} : instruction non reconnue : ${text}`
        );
    }


    // =====================================================
    // APPELS
    // =====================================================

    executeCall(
        name,
        args
    ) {

        // ---------------------------------------------
        // PYT
        // ---------------------------------------------

        if (
            name === "forward"
            ||
            name === "backward"
        ) {

            if (
                args.length !== 1
            ) {

                throw new Error(
                    `${name}() attend une distance.`
                );
            }


            const amount =
                Number(args[0]);


            if (
                !Number.isInteger(amount)
                ||
                amount < 0
            ) {

                throw new Error(
                    `${name}() attend un entier positif.`
                );
            }


            for (
                let i = 0;
                i < amount;
                i++
            ) {

                this.addAction(
                    name,
                    1
                );
            }


            return null;
        }


        if (
            name === "right"
            ||
            name === "left"
        ) {

            if (
                args.length !== 1
            ) {

                throw new Error(
                    `${name}() attend un angle.`
                );
            }


            const angle =
                Number(args[0]);


            if (
                !Number.isInteger(angle)
                ||
                angle < 0
                ||
                angle % 90 !== 0
            ) {

                throw new Error(
                    "Les rotations doivent utiliser un multiple de 90°."
                );
            }


            /*
            On découpe également la rotation
            afin de conserver une animation simple.
            */

            const turns =
                angle / 90;


            for (
                let i = 0;
                i < turns;
                i++
            ) {

                this.addAction(
                    name,
                    90
                );
            }


            return null;
        }


        // ---------------------------------------------
        // PRINT
        // ---------------------------------------------

        if (name === "print") {

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


        // ---------------------------------------------
        // FONCTION DE L'ÉLÈVE
        // ---------------------------------------------

        if (
            this.functions[name]
        ) {

            return this.callFunction(
                name,
                args
            );
        }


        throw new Error(
            `Fonction inconnue : ${name}().`
        );
    }


    addAction(
        type,
        value
    ) {

        this.actions.push([
            type,
            value
        ]);


        if (
            this.actions.length
            >
            this.maxActions
        ) {

            throw new Error(
                "Ton programme effectue trop d'actions."
            );
        }
    }


    // =====================================================
    // EXPRESSIONS
    // =====================================================

    evaluateExpression(expression) {

        let text =
            String(expression)
                .trim();


        if (!text) {
            return null;
        }


        // ---------------------------------------------
        // PARENTHÈSES EXTÉRIEURES
        // ---------------------------------------------

        text =
            this.stripOuterParentheses(
                text
            );


        // ---------------------------------------------
        // OR
        // ---------------------------------------------

        let split =
            this.splitTopLevelWord(
                text,
                "or"
            );


        if (split) {

            return (
                Boolean(
                    this.evaluateExpression(
                        split.left
                    )
                )
                ||
                Boolean(
                    this.evaluateExpression(
                        split.right
                    )
                )
            );
        }


        // ---------------------------------------------
        // AND
        // ---------------------------------------------

        split =
            this.splitTopLevelWord(
                text,
                "and"
            );


        if (split) {

            return (
                Boolean(
                    this.evaluateExpression(
                        split.left
                    )
                )
                &&
                Boolean(
                    this.evaluateExpression(
                        split.right
                    )
                )
            );
        }


        // ---------------------------------------------
        // NOT
        // ---------------------------------------------

        if (
            text.startsWith("not ")
        ) {

            return !Boolean(
                this.evaluateExpression(
                    text.slice(4)
                )
            );
        }


        // ---------------------------------------------
        // COMPARAISONS
        // ---------------------------------------------

        const comparison =
            this.findTopLevelOperator(
                text,
                [
                    "==",
                    "!=",
                    ">=",
                    "<=",
                    ">",
                    "<",
                    " in "
                ]
            );


        if (comparison) {

            const left =
                this.evaluateExpression(
                    comparison.left
                );

            const right =
                this.evaluateExpression(
                    comparison.right
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

                case " in ":

                    if (
                        Array.isArray(right)
                        ||
                        typeof right
                        === "string"
                    ) {

                        return right.includes(
                            left
                        );
                    }

                    return false;
            }
        }


        // ---------------------------------------------
        // + ET -
        // ---------------------------------------------

        const plusMinus =
            this.findTopLevelOperatorFromRight(
                text,
                ["+", "-"]
            );


        if (plusMinus) {

            const left =
                this.evaluateExpression(
                    plusMinus.left
                );

            const right =
                this.evaluateExpression(
                    plusMinus.right
                );


            if (
                plusMinus.operator
                === "+"
            ) {

                return left + right;
            }


            return left - right;
        }


        // ---------------------------------------------
        // *, /, //, %
        // ---------------------------------------------

        const multiply =
            this.findTopLevelOperatorFromRight(
                text,
                ["//", "*", "/", "%"]
            );


        if (multiply) {

            const left =
                this.evaluateExpression(
                    multiply.left
                );

            const right =
                this.evaluateExpression(
                    multiply.right
                );


            if (
                multiply.operator === "*"
            ) {
                return left * right;
            }


            if (
                right === 0
            ) {

                throw new Error(
                    "Division par zéro."
                );
            }


            if (
                multiply.operator === "/"
            ) {
                return left / right;
            }


            if (
                multiply.operator === "//"
            ) {
                return Math.floor(
                    left / right
                );
            }


            return left % right;
        }


        // ---------------------------------------------
        // NOMBRE
        // ---------------------------------------------

        if (
            /^-?\d+(\.\d+)?$/
                .test(text)
        ) {

            return Number(text);
        }


        // ---------------------------------------------
        // BOOLÉENS
        // ---------------------------------------------

        if (text === "True") {
            return true;
        }


        if (text === "False") {
            return false;
        }


        if (text === "None") {
            return null;
        }


        // ---------------------------------------------
        // CHAÎNE
        // ---------------------------------------------

        if (
            (
                text.startsWith('"')
                &&
                text.endsWith('"')
            )
            ||
            (
                text.startsWith("'")
                &&
                text.endsWith("'")
            )
        ) {

            return text
                .slice(1, -1)
                .replace(/\\n/g, "\n")
                .replace(/\\"/g, '"')
                .replace(/\\'/g, "'");
        }


        // ---------------------------------------------
        // LISTE
        // ---------------------------------------------

        if (
            text.startsWith("[")
            &&
            text.endsWith("]")
        ) {

            const inside =
                text.slice(
                    1,
                    -1
                );


            if (
                inside.trim() === ""
            ) {
                return [];
            }


            return this
                .parseArguments(
                    inside
                )
                .map(
                    item =>
                        this.evaluateExpression(
                            item
                        )
                );
        }


        // ---------------------------------------------
        // INDEX LISTE
        // ---------------------------------------------

        const indexMatch =
            text.match(
                /^([A-Za-z_]\w*)\[(.+)\]$/
            );


        if (indexMatch) {

            const container =
                this.variables[
                    indexMatch[1]
                ];


            if (
                !Array.isArray(container)
                &&
                typeof container
                !== "string"
            ) {

                throw new Error(
                    `${indexMatch[1]} n'est pas indexable.`
                );
            }


            const position =
                Number(
                    this.evaluateExpression(
                        indexMatch[2]
                    )
                );


            return container[
                position
            ];
        }


        // ---------------------------------------------
        // APPEL DE FONCTION
        // ---------------------------------------------

        const call =
            this.parseCall(
                text
            );


        if (call) {

            const args =
                this.parseArguments(
                    call.arguments
                )
                .map(
                    argument =>
                        this.evaluateExpression(
                            argument
                        )
                );


            // range()
            if (
                call.name === "range"
            ) {

                return this.makeRange(
                    args
                );
            }


            // len()
            if (
                call.name === "len"
            ) {

                if (
                    args.length !== 1
                ) {

                    throw new Error(
                        "len() attend une valeur."
                    );
                }


                return args[0].length;
            }


            // int()
            if (
                call.name === "int"
            ) {

                if (
                    args.length !== 1
                ) {

                    throw new Error(
                        "int() attend une valeur."
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
                        "Conversion int() impossible."
                    );
                }


                return value;
            }


            // float()
            if (
                call.name === "float"
            ) {

                if (
                    args.length !== 1
                ) {

                    throw new Error(
                        "float() attend une valeur."
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
                        "Conversion float() impossible."
                    );
                }


                return value;
            }


            // str()
            if (
                call.name === "str"
            ) {

                if (
                    args.length !== 1
                ) {

                    throw new Error(
                        "str() attend une valeur."
                    );
                }


                return this.pythonString(
                    args[0]
                );
            }


            if (
                this.functions[
                    call.name
                ]
            ) {

                return this.callFunction(
                    call.name,
                    args
                );
            }
        }


        // ---------------------------------------------
        // VARIABLE
        // ---------------------------------------------

        if (
            /^[A-Za-z_]\w*$/
                .test(text)
        ) {

            if (
                text
                in
                this.variables
            ) {

                return this.variables[
                    text
                ];
            }


            throw new Error(
                `Variable inconnue : ${text}`
            );
        }


        throw new Error(
            `Expression non reconnue : ${text}`
        );
    }


    // =====================================================
    // RANGE
    // =====================================================

    makeRange(args) {

        let start;
        let stop;
        let step;


        if (
            args.length === 1
        ) {

            start = 0;
            stop =
                Number(args[0]);
            step = 1;

        } else if (
            args.length === 2
        ) {

            start =
                Number(args[0]);

            stop =
                Number(args[1]);

            step = 1;

        } else if (
            args.length === 3
        ) {

            start =
                Number(args[0]);

            stop =
                Number(args[1]);

            step =
                Number(args[2]);

        } else {

            throw new Error(
                "range() attend 1, 2 ou 3 arguments."
            );
        }


        if (
            !Number.isInteger(start)
            ||
            !Number.isInteger(stop)
            ||
            !Number.isInteger(step)
        ) {

            throw new Error(
                "range() utilise des nombres entiers."
            );
        }


        if (step === 0) {

            throw new Error(
                "Le pas de range() ne peut pas être 0."
            );
        }


        const values = [];


        if (step > 0) {

            for (
                let value = start;
                value < stop;
                value += step
            ) {

                values.push(
                    value
                );


                if (
                    values.length
                    >
                    this.maxIterations
                ) {

                    throw new Error(
                        "range() contient trop de valeurs."
                    );
                }
            }

        } else {

            for (
                let value = start;
                value > stop;
                value += step
            ) {

                values.push(
                    value
                );


                if (
                    values.length
                    >
                    this.maxIterations
                ) {

                    throw new Error(
                        "range() contient trop de valeurs."
                    );
                }
            }
        }


        return values;
    }


    // =====================================================
    // OUTILS DE PARSING
    // =====================================================

    parseCall(text) {

        const match =
            text.match(
                /^([A-Za-z_]\w*)\s*\((.*)\)$/
            );


        if (!match) {
            return null;
        }


        return {
            name:
                match[1],

            arguments:
                match[2]
        };
    }


    parseArguments(text) {

        if (
            text.trim() === ""
        ) {
            return [];
        }


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
                (
                    char === "'"
                    ||
                    char === '"'
                )
                &&
                text[i - 1] !== "\\"
            ) {

                if (quote === null) {

                    quote = char;

                } else if (
                    quote === char
                ) {

                    quote = null;
                }
            }


            if (
                quote === null
            ) {

                if (
                    char === "("
                    ||
                    char === "["
                ) {
                    depth++;
                }


                if (
                    char === ")"
                    ||
                    char === "]"
                ) {
                    depth--;
                }


                if (
                    char === ","
                    &&
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


    stripOuterParentheses(text) {

        while (
            text.startsWith("(")
            &&
            text.endsWith(")")
            &&
            this.outerParenthesesMatch(
                text
            )
        ) {

            text =
                text
                    .slice(1, -1)
                    .trim();
        }


        return text;
    }


    outerParenthesesMatch(text) {

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
                (
                    char === "'"
                    ||
                    char === '"'
                )
                &&
                text[i - 1] !== "\\"
            ) {

                if (quote === null) {

                    quote = char;

                } else if (
                    quote === char
                ) {

                    quote = null;
                }
            }


            if (quote !== null) {
                continue;
            }


            if (char === "(") {
                depth++;
            }


            if (char === ")") {
                depth--;
            }


            if (
                depth === 0
                &&
                i < text.length - 1
            ) {

                return false;
            }
        }


        return depth === 0;
    }


    splitTopLevelWord(
        text,
        word
    ) {

        const target =
            ` ${word} `;

        const position =
            this.findTopLevelText(
                text,
                target
            );


        if (
            position === -1
        ) {
            return null;
        }


        return {
            left:
                text
                    .slice(
                        0,
                        position
                    )
                    .trim(),

            right:
                text
                    .slice(
                        position
                        +
                        target.length
                    )
                    .trim()
        };
    }


    findTopLevelText(
        text,
        target
    ) {

        let depth = 0;
        let quote = null;


        for (
            let i = 0;
            i <=
            text.length
            -
            target.length;
            i++
        ) {

            const char =
                text[i];


            if (
                (
                    char === "'"
                    ||
                    char === '"'
                )
                &&
                text[i - 1] !== "\\"
            ) {

                if (quote === null) {

                    quote = char;

                } else if (
                    quote === char
                ) {

                    quote = null;
                }
            }


            if (quote !== null) {
                continue;
            }


            if (
                char === "("
                ||
                char === "["
            ) {
                depth++;
            }


            if (
                char === ")"
                ||
                char === "]"
            ) {
                depth--;
            }


            if (
                depth === 0
                &&
                text.slice(
                    i,
                    i + target.length
                )
                === target
            ) {

                return i;
            }
        }


        return -1;
    }


    findTopLevelOperator(
        text,
        operators
    ) {

        for (
            const operator
            of operators
        ) {

            const position =
                this.findTopLevelText(
                    text,
                    operator
                );


            if (
                position !== -1
            ) {

                return {
                    left:
                        text
                            .slice(
                                0,
                                position
                            )
                            .trim(),

                    right:
                        text
                            .slice(
                                position
                                +
                                operator.length
                            )
                            .trim(),

                    operator
                };
            }
        }


        return null;
    }


    findTopLevelOperatorFromRight(
        text,
        operators
    ) {

        let depth = 0;
        let quote = null;


        for (
            let i =
                text.length - 1;
            i >= 0;
            i--
        ) {

            const char =
                text[i];


            if (
                (
                    char === "'"
                    ||
                    char === '"'
                )
                &&
                text[i - 1] !== "\\"
            ) {

                if (quote === null) {

                    quote = char;

                } else if (
                    quote === char
                ) {

                    quote = null;
                }
            }


            if (quote !== null) {
                continue;
            }


            if (
                char === ")"
                ||
                char === "]"
            ) {
                depth++;
                continue;
            }


            if (
                char === "("
                ||
                char === "["
            ) {
                depth--;
                continue;
            }


            if (depth !== 0) {
                continue;
            }


            for (
                const operator
                of operators
            ) {

                const start =
                    i
                    -
                    operator.length
                    + 1;


                if (start < 0) {
                    continue;
                }


                if (
                    text.slice(
                        start,
                        i + 1
                    )
                    === operator
                ) {

                    /*
                    Ne pas confondre -5 avec
                    une soustraction binaire.
                    */

                    if (
                        operator === "-"
                        &&
                        start === 0
                    ) {
                        continue;
                    }


                    return {
                        left:
                            text
                                .slice(
                                    0,
                                    start
                                )
                                .trim(),

                        right:
                            text
                                .slice(
                                    i + 1
                                )
                                .trim(),

                        operator
                    };
                }
            }
        }


        return null;
    }


    // =====================================================
    // AFFICHAGE PYTHON
    // =====================================================

    pythonString(value) {

        if (value === true) {
            return "True";
        }


        if (value === false) {
            return "False";
        }


        if (value === null) {
            return "None";
        }


        if (
            Array.isArray(value)
        ) {

            return (
                "["
                +
                value
                    .map(
                        item =>
                            this.pythonString(
                                item
                            )
                    )
                    .join(", ")
                +
                "]"
            );
        }


        return String(value);
    }


    // =====================================================
    // SÉCURITÉ / LIMITES DU JEU
    // =====================================================

    checkForbiddenCode(code) {

        const forbidden = [
            /\bimport\b/i,
            /\bfrom\s+\w+\s+import\b/i,
            /\beval\s*\(/i,
            /\bexec\s*\(/i,
            /\bopen\s*\(/i,
            /__/,
            /\bclass\s+/i,
            /\bglobal\b/i,
            /\bnonlocal\b/i,
            /\blambda\b/i,
            /\byield\b/i,
            /\basync\b/i,
            /\bawait\b/i
        ];


        for (
            const pattern
            of forbidden
        ) {

            if (
                pattern.test(code)
            ) {

                throw new Error(
                    "Cette instruction Python n'est pas disponible dans PYT."
                );
            }
        }
    }

}


// =========================================================
// APPLICATION
// =========================================================

class PytApplication {

    constructor() {

        this.ui = null;

        this.game = null;
        this.robot = null;
        this.level = null;

        this.currentChapter = 1;
        this.currentExercise = 1;

        this.runner =
            new BrowserPythonRunner();
    }


    // =====================================================
    // DÉMARRAGE
    // =====================================================

    start() {

        this.checkDependencies();


        this.ui =
            new PytUI();


        this.connectUI();


        const loaded =
            this.loadLevel(
                1,
                1
            );


        if (!loaded) {
            return;
        }


        const courseOpened =
            this.ui
                .showCourseAtChapterStart(
                    1
                );


        if (!courseOpened) {

            this.ui.showMap();
        }
    }


    // =====================================================
    // DÉPENDANCES
    // =====================================================

    checkDependencies() {

        if (
            typeof PytUI
            !== "function"
        ) {

            throw new Error(
                "ui.js n'est pas chargé."
            );
        }


        if (
            typeof Robot
            !== "function"
        ) {

            throw new Error(
                "robot.js n'est pas chargé."
            );
        }


        if (
            typeof Game
            !== "function"
        ) {

            throw new Error(
                "game.js n'est pas chargé."
            );
        }


        if (
            typeof getLevel
            !== "function"
        ) {

            throw new Error(
                "levels.js n'est pas chargé."
            );
        }
    }


    // =====================================================
    // CONNEXION UI
    // =====================================================

    connectUI() {

        this.ui.onSelectLevel =
            (
                chapter,
                exercise
            ) => {

                if (
                    this.loadLevel(
                        chapter,
                        exercise
                    )
                ) {

                    this.ui.showGame();

                    this.ui.setStatus(
                        "Pyt attend ton programme."
                    );
                }
            };


        this.ui.onRestart =
            () => {

                this.restartLevel();
            };


        this.ui.onRunCode =
            async code => {

                await this.runStudentCode(
                    code
                );
            };
    }


    // =====================================================
    // CHARGER UN NIVEAU
    // =====================================================

    loadLevel(
        chapter,
        exercise
    ) {

        const newLevel =
            getLevel(
                chapter,
                exercise
            );


        if (!newLevel) {

            if (this.ui) {

                this.ui.showMessage(
                    "Niveau introuvable",
                    "Impossible de charger cet exercice."
                );
            }

            return false;
        }


        this.currentChapter =
            Number(chapter);

        this.currentExercise =
            Number(exercise);

        this.level =
            newLevel;


        this.robot =
            new Robot();


        this.game =
            new Game(
                this.level,
                this.robot
            );


        this.ui.currentChapter =
            this.currentChapter;

        this.ui.currentExercise =
            this.currentExercise;


        this.ui.setGame(
            this.game
        );


        this.ui.setLevel(
            this.level
        );


        this.ui.clearConsole();

        this.ui.drawWorld();


        return true;
    }


    // =====================================================
    // RECOMMENCER
    // =====================================================

    restartLevel() {

        if (!this.game) {
            return;
        }


        this.ui.stopAnimation();


        this.game.reset();


        this.ui.clearConsole();

        this.ui.drawWorld();


        this.ui.setStatus(
            "Niveau recommencé."
        );
    }


    // =====================================================
    // CODE DE L'ÉLÈVE
    // =====================================================

    async runStudentCode(code) {

        if (!this.game) {
            return;
        }


        /*
        Chaque exécution repart de l'état
        initial du niveau.

        Cela évite qu'une deuxième tentative
        continue depuis la position laissée
        par la première.
        */

        this.game.reset();

        this.ui.drawWorld();


        this.ui.setConsole(
            "Analyse du programme..."
        );


        let result;


        try {

            result =
                this.runner.run(
                    code
                );

        } catch (error) {

            this.ui.setConsole(
                "Erreur interne :\n"
                +
                error.message
            );

            this.ui.handleFailedAttempt();

            return;
        }


        // -------------------------------------------------
        // ERREUR DE PROGRAMME
        // -------------------------------------------------

        if (
            !result
            ||
            result.success === false
        ) {

            let message =
                result
                &&
                result.error
                    ? result.error
                    : "Programme invalide.";


            if (
                result
                &&
                result.output
            ) {

                message =
                    result.output
                    +
                    "\n"
                    +
                    message;
            }


            this.ui.setConsole(
                message
            );


            this.ui.setStatus(
                "Corrige ton programme puis réessaie."
            );


            this.ui.handleFailedAttempt();

            return;
        }


        // -------------------------------------------------
        // CONSOLE
        // -------------------------------------------------

        if (result.output) {

            this.ui.setConsole(
                result.output
            );

        } else {

            this.ui.setConsole(
                "Programme accepté."
            );
        }


        const actions =
            Array.isArray(
                result.actions
            )
                ? result.actions
                : [];


        // -------------------------------------------------
        // AUCUNE ACTION
        // -------------------------------------------------

        if (
            actions.length === 0
        ) {

            this.finishAttempt();

            return;
        }


        // -------------------------------------------------
        // ANIMATION
        // -------------------------------------------------

        this.ui.playActions(

            actions,

            action =>
                this.performAction(
                    action
                ),

            () => {

                this.finishAttempt();

            }

        );
    }


    // =====================================================
    // ACTION DU MOTEUR
    // =====================================================

    performAction(action) {

        if (
            !this.game
            ||
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
                action.length > 1
                    ? action[1]
                    : 1;

        } else if (
            action
            &&
            typeof action
            === "object"
        ) {

            type =
                action.type
                ||
                action.action;

            value =
                action.value
                ??
                action.amount
                ??
                1;

        } else {

            return false;
        }


        try {

            switch (type) {

                case "forward":

                    return this.game
                        .moveForward();


                case "backward":

                    return this.game
                        .moveBackward();


                case "right":

                    this.robot
                        .rotateRight(
                            Number(value)
                            || 90
                        );

                    return true;


                case "left":

                    this.robot
                        .rotateLeft(
                            Number(value)
                            || 90
                        );

                    return true;


                default:

                    console.warn(
                        "Action inconnue :",
                        action
                    );

                    return false;
            }

        } catch (error) {

            console.error(
                error
            );

            return false;
        }
    }


    // =====================================================
    // FIN DE TENTATIVE
    // =====================================================

    finishAttempt() {

        if (!this.game) {
            return;
        }


        this.ui.drawWorld();


        const success =
            this.game
                .checkSuccess();


        if (success) {

            this.appendConsole(
                "✓ Mission réussie !"
            );


            this.ui.setStatus(
                "Mission réussie !"
            );


            this.ui
                .completeCurrentLevel();


            return;
        }


        let failureText =
            "✗ La mission n'est pas encore réussie.";


        if (
            this.game.message
        ) {

            failureText +=
                "\n"
                +
                this.game.message;
        }


        this.appendConsole(
            failureText
        );


        this.ui.setStatus(
            "Essaie encore."
        );


        this.ui
            .handleFailedAttempt();
    }


    // =====================================================
    // CONSOLE
    // =====================================================

    appendConsole(text) {

        const current =
            this.ui
                .consoleOutput
                .textContent
                .trim();


        if (
            !current
            ||
            current === "Prêt."
            ||
            current
            === "Programme accepté."
            ||
            current
            === "Analyse du programme..."
        ) {

            this.ui.setConsole(
                text
            );

            return;
        }


        this.ui.setConsole(
            current
            +
            "\n"
            +
            text
        );
    }

}


// =========================================================
// DÉMARRAGE AUTOMATIQUE
// =========================================================

function startPytApplication() {

    try {

        const app =
            new PytApplication();


        app.start();


        /*
        Accessible dans la console du navigateur
        pour faciliter les tests pendant le projet.
        */

        window.pytApp =
            app;


        window.runPythonCode =
            async function(code) {

                return app.runner.run(
                    code
                );
            };


        console.log(
            "PYT démarré."
        );

    } catch (error) {

        console.error(
            "Impossible de démarrer PYT :",
            error
        );


        const status =
            document.getElementById(
                "game-status"
            );


        if (status) {

            status.textContent =
                "Erreur au démarrage : "
                +
                error.message;
        }
    }
}


if (
    document.readyState
    === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startPytApplication
    );

} else {

    startPytApplication();
}