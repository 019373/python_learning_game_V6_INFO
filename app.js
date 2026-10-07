"use strict";

/* =========================================================
   PYT - app.js

   Gestion générale :
   - lancement du jeu ;
   - intro interactive ;
   - crédits ;
   - paramètres audio ;
   - navigation ;
   - exécution du pseudo-Python ;
   - animation des actions ;
   - messages d'erreur ;
   - progression.
========================================================= */


/* =========================================================
   INTERPRÉTEUR PYTHON CONTRÔLÉ
========================================================= */

class BrowserPythonRunner {

    constructor() {
        this.maxActions = 250;
        this.maxIterations = 1000;
        this.maxFunctionCalls = 100;

        this.actions = [];
        this.output = [];
        this.variables = {};
        this.functions = {};

        this.iterations = 0;
        this.functionCalls = 0;
    }


    run(code) {
        this.actions = [];
        this.output = [];
        this.variables = {};
        this.functions = {};
        this.iterations = 0;
        this.functionCalls = 0;

        try {
            this.checkForbiddenCode(code);

            const lines = this.prepareLines(code);

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

            let errorLine = null;

            const match =
                String(error.message)
                    .match(/Ligne\s+(\d+)/i);

            if (match) {
                errorLine = Number(match[1]);
            }

            return {
                success: false,
                actions: [...this.actions],
                output: [...this.output],
                error: error.message,
                errorLine
            };
        }
    }


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
                    "Cette instruction n'est pas autorisée dans PYT."
                );
            }
        }
    }


    prepareLines(code) {
        const rawLines =
            String(code || "")
                .replace(/\r/g, "")
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
                this.removeComment(original);

            if (
                withoutComment.trim() === ""
            ) {
                continue;
            }

            const spaces =
                withoutComment.match(/^ */)[0].length;

            if (spaces % 4 !== 0) {
                throw new Error(
                    `Ligne ${index + 1} : l'indentation doit utiliser des groupes de 4 espaces.`
                );
            }

            result.push({
                text: withoutComment.trim(),
                indent: spaces,
                lineNumber: index + 1
            });
        }

        return result;
    }


    removeComment(line) {
        let quote = null;

        for (
            let i = 0;
            i < line.length;
            i++
        ) {
            const char = line[i];

            if (
                (char === '"' || char === "'") &&
                line[i - 1] !== "\\"
            ) {
                if (quote === char) {
                    quote = null;
                } else if (!quote) {
                    quote = char;
                }
            }

            if (
                char === "#" &&
                !quote
            ) {
                return line.slice(0, i);
            }
        }

        return line;
    }


    executeBlock(
        lines,
        start,
        end,
        indent
    ) {
        let i = start;

        while (i < end) {
            const line = lines[i];

            if (line.indent < indent) {
                break;
            }

            if (line.indent > indent) {
                throw new Error(
                    `Ligne ${line.lineNumber} : indentation inattendue.`
                );
            }

            const text = line.text;

            if (/^if\b/.test(text)) {
                i =
                    this.executeIfChain(
                        lines,
                        i,
                        end,
                        indent
                    );

                continue;
            }

            if (/^for\b/.test(text)) {
                i =
                    this.executeFor(
                        lines,
                        i,
                        end,
                        indent
                    );

                continue;
            }

            if (/^while\b/.test(text)) {
                i =
                    this.executeWhile(
                        lines,
                        i,
                        end,
                        indent
                    );

                continue;
            }

            if (/^def\b/.test(text)) {
                i =
                    this.registerFunction(
                        lines,
                        i,
                        end,
                        indent
                    );

                continue;
            }

            if (text === "break") {
                return {
                    type: "break",
                    nextIndex: i + 1
                };
            }

            if (/^return\b/.test(text)) {
                const expression =
                    text.replace(/^return\b/, "")
                        .trim();

                return {
                    type: "return",
                    value:
                        expression
                            ? this.evaluateExpression(
                                expression,
                                line.lineNumber
                            )
                            : null,
                    nextIndex: i + 1
                };
            }

            if (text === "pass") {
                i++;
                continue;
            }

            this.executeStatement(
                text,
                line.lineNumber
            );

            i++;
        }

        return {
            type: "normal",
            nextIndex: i
        };
    }


    findBlockEnd(
        lines,
        start,
        end,
        indent
    ) {
        let i = start;

        while (
            i < end &&
            lines[i].indent > indent
        ) {
            i++;
        }

        return i;
    }


    executeIfChain(
        lines,
        index,
        end,
        indent
    ) {
        let i = index;
        let executed = false;

        while (i < end) {
            const line = lines[i];

            if (line.indent !== indent) {
                break;
            }

            const text = line.text;

            let condition = null;

            if (/^if\b/.test(text)) {
                condition =
                    text
                        .replace(/^if\s+/, "")
                        .replace(/:\s*$/, "");

            } else if (/^elif\b/.test(text)) {
                condition =
                    text
                        .replace(/^elif\s+/, "")
                        .replace(/:\s*$/, "");

            } else if (/^else\s*:/.test(text)) {
                condition = true;

            } else {
                break;
            }

            const blockStart = i + 1;
            const blockEnd =
                this.findBlockEnd(
                    lines,
                    blockStart,
                    end,
                    indent
                );

            let shouldExecute = false;

            if (!executed) {
                if (condition === true) {
                    shouldExecute = true;
                } else {
                    shouldExecute =
                        Boolean(
                            this.evaluateExpression(
                                condition,
                                line.lineNumber
                            )
                        );
                }
            }

            if (shouldExecute) {
                executed = true;

                const result =
                    this.executeBlock(
                        lines,
                        blockStart,
                        blockEnd,
                        indent + 4
                    );

                if (
                    result &&
                    result.type !== "normal"
                ) {
                    return blockEnd;
                }
            }

            i = blockEnd;

            if (
                i >= end ||
                lines[i].indent !== indent ||
                !/^(elif\b|else\s*:)/.test(
                    lines[i].text
                )
            ) {
                break;
            }
        }

        return i;
    }


    executeFor(
        lines,
        index,
        end,
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
                `Ligne ${line.lineNumber} : boucle for invalide.`
            );
        }

        const variableName =
            match[1];

        const iterable =
            this.evaluateExpression(
                match[2],
                line.lineNumber
            );

        if (!Array.isArray(iterable)) {
            throw new Error(
                `Ligne ${line.lineNumber} : la boucle for attend une liste ou range(...).`
            );
        }

        const blockStart =
            index + 1;

        const blockEnd =
            this.findBlockEnd(
                lines,
                blockStart,
                end,
                indent
            );

        for (const value of iterable) {
            this.iterations++;

            if (
                this.iterations >
                this.maxIterations
            ) {
                throw new Error(
                    `Ligne ${line.lineNumber} : trop d'itérations.`
                );
            }

            this.variables[variableName] =
                value;

            const result =
                this.executeBlock(
                    lines,
                    blockStart,
                    blockEnd,
                    indent + 4
                );

            if (
                result &&
                result.type === "break"
            ) {
                break;
            }

            if (
                result &&
                result.type === "return"
            ) {
                return blockEnd;
            }
        }

        return blockEnd;
    }


    executeWhile(
        lines,
        index,
        end,
        indent
    ) {
        const line =
            lines[index];

        const condition =
            line.text
                .replace(/^while\s+/, "")
                .replace(/:\s*$/, "");

        const blockStart =
            index + 1;

        const blockEnd =
            this.findBlockEnd(
                lines,
                blockStart,
                end,
                indent
            );

        while (
            Boolean(
                this.evaluateExpression(
                    condition,
                    line.lineNumber
                )
            )
        ) {
            this.iterations++;

            if (
                this.iterations >
                this.maxIterations
            ) {
                throw new Error(
                    `Ligne ${line.lineNumber} : la boucle while semble infinie.`
                );
            }

            const result =
                this.executeBlock(
                    lines,
                    blockStart,
                    blockEnd,
                    indent + 4
                );

            if (
                result &&
                result.type === "break"
            ) {
                break;
            }

            if (
                result &&
                result.type === "return"
            ) {
                return blockEnd;
            }
        }

        return blockEnd;
    }


    registerFunction(
        lines,
        index,
        end,
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
                `Ligne ${line.lineNumber} : définition de fonction invalide.`
            );
        }

        const name =
            match[1];

        const params =
            match[2].trim()
                ? match[2]
                    .split(",")
                    .map(
                        value =>
                            value.trim()
                    )
                : [];

        const blockStart =
            index + 1;

        const blockEnd =
            this.findBlockEnd(
                lines,
                blockStart,
                end,
                indent
            );

        this.functions[name] = {
            params,
            lines,
            start: blockStart,
            end: blockEnd,
            indent: indent + 4,
            lineNumber: line.lineNumber
        };

        return blockEnd;
    }


    executeStatement(
        text,
        lineNumber
    ) {
        let match;


        match =
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

            const current =
                this.variables[name] ?? 0;

            if (operator === "+=") {
                this.variables[name] =
                    current + value;
            }

            if (operator === "-=") {
                this.variables[name] =
                    current - value;
            }

            if (operator === "*=") {
                this.variables[name] =
                    current * value;
            }

            return;
        }


        match =
            text.match(
                /^([A-Za-z_]\w*)\s*=\s*(.+)$/
            );

        if (match) {
            this.variables[match[1]] =
                this.evaluateExpression(
                    match[2],
                    lineNumber
                );

            return;
        }


        match =
            text.match(
                /^([A-Za-z_]\w*)\.append\((.*)\)$/
            );

        if (match) {
            const name =
                match[1];

            if (
                !Array.isArray(
                    this.variables[name]
                )
            ) {
                throw new Error(
                    `Ligne ${lineNumber} : ${name} n'est pas une liste.`
                );
            }

            this.variables[name].push(
                this.evaluateExpression(
                    match[2],
                    lineNumber
                )
            );

            return;
        }


        if (
            /^[A-Za-z_]\w*\s*\(.*\)$/.test(
                text
            )
        ) {
            this.evaluateExpression(
                text,
                lineNumber
            );

            return;
        }


        throw new Error(
            `Ligne ${lineNumber} : instruction non reconnue.`
        );
    }


    evaluateExpression(
        expression,
        lineNumber
    ) {
        let expr =
            String(expression).trim();

        if (expr === "") {
            return null;
        }


        if (
            expr.startsWith("(") &&
            expr.endsWith(")") &&
            this.parenthesesWrapExpression(expr)
        ) {
            return this.evaluateExpression(
                expr.slice(1, -1),
                lineNumber
            );
        }


        let split =
            this.findTopLevelWord(
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


        split =
            this.findTopLevelWord(
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


        if (/^not\s+/.test(expr)) {
            return !Boolean(
                this.evaluateExpression(
                    expr.replace(/^not\s+/, ""),
                    lineNumber
                )
            );
        }


        const comparisons = [
            "==",
            "!=",
            ">=",
            "<=",
            ">",
            "<"
        ];

        for (
            const operator
            of comparisons
        ) {
            const comparison =
                this.findTopLevelOperator(
                    expr,
                    operator
                );

            if (comparison) {
                const left =
                    this.evaluateExpression(
                        comparison.left,
                        lineNumber
                    );

                const right =
                    this.evaluateExpression(
                        comparison.right,
                        lineNumber
                    );

                switch (operator) {
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
        }


        for (
            const operator
            of ["+", "-"]
        ) {
            const operation =
                this.findTopLevelOperatorFromRight(
                    expr,
                    operator
                );

            if (operation) {
                const left =
                    this.evaluateExpression(
                        operation.left,
                        lineNumber
                    );

                const right =
                    this.evaluateExpression(
                        operation.right,
                        lineNumber
                    );

                if (operator === "+") {
                    return left + right;
                }

                return left - right;
            }
        }


        for (
            const operator
            of ["*", "/", "%"]
        ) {
            const operation =
                this.findTopLevelOperatorFromRight(
                    expr,
                    operator
                );

            if (operation) {
                const left =
                    this.evaluateExpression(
                        operation.left,
                        lineNumber
                    );

                const right =
                    this.evaluateExpression(
                        operation.right,
                        lineNumber
                    );

                if (operator === "*") {
                    return left * right;
                }

                if (operator === "/") {
                    if (right === 0) {
                        throw new Error(
                            `Ligne ${lineNumber} : division par zéro.`
                        );
                    }

                    return left / right;
                }

                return left % right;
            }
        }


        if (/^-\d+(\.\d+)?$/.test(expr)) {
            return Number(expr);
        }


        if (/^\d+(\.\d+)?$/.test(expr)) {
            return Number(expr);
        }


        if (expr === "True") {
            return true;
        }

        if (expr === "False") {
            return false;
        }

        if (expr === "None") {
            return null;
        }


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
            return expr.slice(1, -1);
        }


        if (
            expr.startsWith("[") &&
            expr.endsWith("]")
        ) {
            const content =
                expr.slice(1, -1)
                    .trim();

            if (!content) {
                return [];
            }

            return this.splitArguments(content)
                .map(
                    item =>
                        this.evaluateExpression(
                            item,
                            lineNumber
                        )
                );
        }


        const indexMatch =
            expr.match(
                /^([A-Za-z_]\w*)\[(.+)\]$/
            );

        if (indexMatch) {
            const value =
                this.variables[
                    indexMatch[1]
                ];

            if (
                !Array.isArray(value) &&
                typeof value !== "string"
            ) {
                throw new Error(
                    `Ligne ${lineNumber} : impossible d'utiliser un index ici.`
                );
            }

            const index =
                Number(
                    this.evaluateExpression(
                        indexMatch[2],
                        lineNumber
                    )
                );

            return value[index];
        }


        const call =
            expr.match(
                /^([A-Za-z_]\w*)\s*\((.*)\)$/
            );

        if (call) {
            const name =
                call[1];

            const args =
                call[2].trim()
                    ? this.splitArguments(
                        call[2]
                    ).map(
                        argument =>
                            this.evaluateExpression(
                                argument,
                                lineNumber
                            )
                    )
                    : [];

            return this.callFunction(
                name,
                args,
                lineNumber
            );
        }


        if (
            Object.prototype.hasOwnProperty.call(
                this.variables,
                expr
            )
        ) {
            return this.variables[expr];
        }


        throw new Error(
            `Ligne ${lineNumber} : expression inconnue « ${expr} ».`
        );
    }


    callFunction(
        name,
        args,
        lineNumber
    ) {
        if (
            name === "forward" ||
            name === "backward"
        ) {
            const amount =
                args.length
                    ? Number(args[0])
                    : 1;

            if (
                !Number.isInteger(amount) ||
                amount < 0
            ) {
                throw new Error(
                    `Ligne ${lineNumber} : ${name} attend un nombre entier positif.`
                );
            }

            /*
            Une action est créée PAR CASE.

            Cela permet d'avoir réellement environ
            0,5 seconde entre chaque déplacement.
            */
            for (
                let step = 0;
                step < amount;
                step++
            ) {
                this.addAction(
                    name,
                    1,
                    lineNumber
                );
            }

            return null;
        }


        if (
            name === "right" ||
            name === "left"
        ) {
            const angle =
                args.length
                    ? Number(args[0])
                    : 90;

            if (
                !Number.isFinite(angle) ||
                angle % 90 !== 0
            ) {
                throw new Error(
                    `Ligne ${lineNumber} : ${name} attend un angle multiple de 90.`
                );
            }

            const turns =
                Math.abs(angle / 90);

            for (
                let turn = 0;
                turn < turns;
                turn++
            ) {
                this.addAction(
                    angle >= 0
                        ? name
                        : (
                            name === "right"
                                ? "left"
                                : "right"
                        ),
                    90,
                    lineNumber
                );
            }

            return null;
        }


        if (name === "print") {
            this.output.push(
                args
                    .map(String)
                    .join(" ")
            );

            return null;
        }


        if (name === "range") {
            return this.makeRange(args, lineNumber);
        }


        if (name === "len") {
            if (args.length !== 1) {
                throw new Error(
                    `Ligne ${lineNumber} : len() attend une valeur.`
                );
            }

            return args[0]?.length ?? 0;
        }


        if (name === "int") {
            return parseInt(
                args[0] ?? 0,
                10
            );
        }


        if (name === "float") {
            return Number(
                args[0] ?? 0
            );
        }


        if (name === "str") {
            return String(
                args[0] ?? ""
            );
        }


        if (this.functions[name]) {
            return this.callUserFunction(
                name,
                args,
                lineNumber
            );
        }


        throw new Error(
            `Ligne ${lineNumber} : fonction inconnue « ${name} ».`
        );
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
                `Ligne ${line} : trop d'actions dans ce programme.`
            );
        }

        this.actions.push({
            type,
            value,
            line
        });
    }


    makeRange(
        args,
        lineNumber
    ) {
        let start;
        let stop;
        let step;

        if (args.length === 1) {
            start = 0;
            stop = Number(args[0]);
            step = 1;

        } else if (args.length === 2) {
            start = Number(args[0]);
            stop = Number(args[1]);
            step = 1;

        } else if (args.length === 3) {
            start = Number(args[0]);
            stop = Number(args[1]);
            step = Number(args[2]);

        } else {
            throw new Error(
                `Ligne ${lineNumber} : range() attend 1, 2 ou 3 valeurs.`
            );
        }

        if (
            !Number.isFinite(start) ||
            !Number.isFinite(stop) ||
            !Number.isFinite(step) ||
            step === 0
        ) {
            throw new Error(
                `Ligne ${lineNumber} : range() contient une valeur invalide.`
            );
        }

        const values = [];

        if (step > 0) {
            for (
                let value = start;
                value < stop;
                value += step
            ) {
                values.push(value);

                if (
                    values.length >
                    this.maxIterations
                ) {
                    break;
                }
            }

        } else {
            for (
                let value = start;
                value > stop;
                value += step
            ) {
                values.push(value);

                if (
                    values.length >
                    this.maxIterations
                ) {
                    break;
                }
            }
        }

        return values;
    }


    callUserFunction(
        name,
        args,
        lineNumber
    ) {
        this.functionCalls++;

        if (
            this.functionCalls >
            this.maxFunctionCalls
        ) {
            throw new Error(
                `Ligne ${lineNumber} : trop d'appels de fonction.`
            );
        }

        const definition =
            this.functions[name];

        const previousVariables = {
            ...this.variables
        };

        for (
            let i = 0;
            i < definition.params.length;
            i++
        ) {
            this.variables[
                definition.params[i]
            ] = args[i] ?? null;
        }

        const result =
            this.executeBlock(
                definition.lines,
                definition.start,
                definition.end,
                definition.indent
            );

        const changedExisting = {};

        for (
            const key
            of Object.keys(previousVariables)
        ) {
            if (
                this.variables[key] !==
                previousVariables[key]
            ) {
                changedExisting[key] =
                    this.variables[key];
            }
        }

        this.variables = {
            ...previousVariables,
            ...changedExisting
        };

        if (
            result &&
            result.type === "return"
        ) {
            return result.value;
        }

        return null;
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
            const char = text[i];

            if (
                (char === '"' || char === "'") &&
                text[i - 1] !== "\\"
            ) {
                if (quote === char) {
                    quote = null;
                } else if (!quote) {
                    quote = char;
                }
            }

            if (!quote) {
                if (
                    char === "(" ||
                    char === "["
                ) {
                    depth++;
                }

                if (
                    char === ")" ||
                    char === "]"
                ) {
                    depth--;
                }

                if (
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

        if (current.trim()) {
            result.push(
                current.trim()
            );
        }

        return result;
    }


    parenthesesWrapExpression(expr) {
        let depth = 0;
        let quote = null;

        for (
            let i = 0;
            i < expr.length;
            i++
        ) {
            const char = expr[i];

            if (
                (char === '"' || char === "'") &&
                expr[i - 1] !== "\\"
            ) {
                if (quote === char) {
                    quote = null;
                } else if (!quote) {
                    quote = char;
                }
            }

            if (quote) {
                continue;
            }

            if (char === "(") {
                depth++;
            }

            if (char === ")") {
                depth--;
            }

            if (
                depth === 0 &&
                i <
                expr.length - 1
            ) {
                return false;
            }
        }

        return depth === 0;
    }


    findTopLevelWord(
        expr,
        word
    ) {
        let depth = 0;
        let quote = null;

        for (
            let i = 0;
            i <=
            expr.length - word.length;
            i++
        ) {
            const char = expr[i];

            if (
                (char === '"' || char === "'") &&
                expr[i - 1] !== "\\"
            ) {
                if (quote === char) {
                    quote = null;
                } else if (!quote) {
                    quote = char;
                }
            }

            if (quote) {
                continue;
            }

            if (
                char === "(" ||
                char === "["
            ) {
                depth++;
            }

            if (
                char === ")" ||
                char === "]"
            ) {
                depth--;
            }

            if (
                depth === 0 &&
                expr.slice(
                    i,
                    i + word.length
                ) === word
            ) {
                const before =
                    expr[i - 1];

                const after =
                    expr[i + word.length];

                if (
                    (!before || /\s/.test(before)) &&
                    (!after || /\s/.test(after))
                ) {
                    return {
                        left:
                            expr
                                .slice(0, i)
                                .trim(),

                        right:
                            expr
                                .slice(
                                    i + word.length
                                )
                                .trim()
                    };
                }
            }
        }

        return null;
    }


    findTopLevelOperator(
        expr,
        operator
    ) {
        let depth = 0;
        let quote = null;

        for (
            let i = 0;
            i <=
            expr.length - operator.length;
            i++
        ) {
            const char = expr[i];

            if (
                (char === '"' || char === "'") &&
                expr[i - 1] !== "\\"
            ) {
                if (quote === char) {
                    quote = null;
                } else if (!quote) {
                    quote = char;
                }
            }

            if (quote) {
                continue;
            }

            if (
                char === "(" ||
                char === "["
            ) {
                depth++;
            }

            if (
                char === ")" ||
                char === "]"
            ) {
                depth--;
            }

            if (
                depth === 0 &&
                expr.slice(
                    i,
                    i + operator.length
                ) === operator
            ) {
                return {
                    left:
                        expr.slice(0, i).trim(),

                    right:
                        expr
                            .slice(
                                i + operator.length
                            )
                            .trim()
                };
            }
        }

        return null;
    }


    findTopLevelOperatorFromRight(
        expr,
        operator
    ) {
        let depth = 0;
        let quote = null;

        for (
            let i = expr.length - 1;
            i >= 0;
            i--
        ) {
            const char = expr[i];

            if (
                char === '"' ||
                char === "'"
            ) {
                if (quote === char) {
                    quote = null;
                } else if (!quote) {
                    quote = char;
                }

                continue;
            }

            if (quote) {
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
                depth === 0 &&
                char === operator
            ) {
                if (
                    operator === "-" &&
                    (
                        i === 0 ||
                        /[+\-*/%(,<>=]/.test(
                            expr[i - 1]
                        )
                    )
                ) {
                    continue;
                }

                return {
                    left:
                        expr.slice(0, i).trim(),

                    right:
                        expr.slice(i + 1).trim()
                };
            }
        }

        return null;
    }
}


/* =========================================================
   APPLICATION
========================================================= */

class PytApplication {

    constructor() {
        this.ui = null;

        this.robot = null;
        this.game = null;
        this.level = null;

        this.runner =
            new BrowserPythonRunner();

        this.running = false;

        this.actionDelay = 500;

        this.musicEnabled = true;
        this.volume = 0.6;
        this.volumeBeforeMute = 0.6;
        this.currentMusic = null;

        this.introReadyForInput = false;
        this.introFinished = false;

        this.introTimers = [];

        this.creditsTimer = null;
    }


    start() {
        if (
            typeof PytUI === "undefined"
        ) {
            console.error(
                "PytUI n'est pas chargé."
            );

            return;
        }

        this.ui =
            new PytUI();

        this.ui.actionDelay =
            this.actionDelay;

        this.connectUI();
        this.connectShell();
        this.applyAudioSettings();

        this.loadLevel(
            1,
            1,
            {
                showGame: false
            }
        );

        this.showIntro();
    }


    /* =====================================================
       CONNEXION UI
    ===================================================== */

    connectUI() {
        if (!this.ui) {
            return;
        }

        this.ui.onRunCode =
            code =>
                this.runStudentCode(code);

        this.ui.onRestart =
            () =>
                this.restartCurrentLevel();

        this.ui.onSelectLevel =
            (
                chapter,
                exercise
            ) =>
                this.loadLevel(
                    chapter,
                    exercise
                );
    }


    connectShell() {
        const playButton =
            this.$("play-button");

        const settingsButton =
            this.$("settings-button");

        const settingsBackButton =
            this.$("settings-back-button");

        const gameSettingsButton =
            this.$("game-settings-button");

        const menuButton =
            this.$("menu-button");

        const skipIntroButton =
            this.$("skip-intro-button");

        const musicEnabled =
            this.$("music-enabled");

        const volumeSlider =
            this.$("volume-slider");

        const clearCodeButton =
            this.$("clear-code-button");

        const creditsButton =
            this.$("credits-button");

        const closeCreditsButton =
            this.$("close-credits-button");


        playButton?.addEventListener(
            "click",
            () =>
                this.startGame()
        );


        settingsButton?.addEventListener(
            "click",
            () =>
                this.openSettings(
                    "menu"
                )
        );


        gameSettingsButton?.addEventListener(
            "click",
            () =>
                this.openSettings(
                    "game"
                )
        );


        settingsBackButton?.addEventListener(
            "click",
            () =>
                this.closeSettings()
        );


        menuButton?.addEventListener(
            "click",
            () =>
                this.showMainMenu()
        );


        skipIntroButton?.addEventListener(
            "click",
            event => {
                event.stopPropagation();
                this.finishIntro();
            }
        );


        musicEnabled?.addEventListener(
            "change",
            () => {
                this.setMusicEnabled(
                    musicEnabled.checked
                );
            }
        );


        volumeSlider?.addEventListener(
            "input",
            () => {
                this.setVolume(
                    Number(
                        volumeSlider.value
                    ) / 100
                );
            }
        );


        clearCodeButton?.addEventListener(
            "click",
            () => {
                const editor =
                    this.$("code-editor");

                if (editor) {
                    editor.value = "";
                    editor.focus();
                }

                this.ui?.clearErrorHighlight?.();
            }
        );


        creditsButton?.addEventListener(
            "click",
            () =>
                this.showCredits()
        );


        closeCreditsButton?.addEventListener(
            "click",
            () =>
                this.closeCredits()
        );


        /*
        Musique du cours.
        */

        this.$("course-button")
            ?.addEventListener(
                "click",
                () =>
                    this.playMusic(
                        "music-theory"
                    )
            );


        this.$("map-course-button")
            ?.addEventListener(
                "click",
                () =>
                    this.playMusic(
                        "music-theory"
                    )
            );


        /*
        Retour à la musique du chapitre
        depuis la carte ou le cours.
        */

        this.$("course-map-button")
            ?.addEventListener(
                "click",
                () => {
                    if (
                        this.level
                    ) {
                        this.playChapterMusic(
                            this.level.chapter
                        );
                    }
                }
            );


        /*
        Croix du guide Pyt.
        L'animation de sortie est gérée par ui.js
        lorsqu'elle existe.
        */

        this.$("close-pyt-guide-button")
            ?.addEventListener(
                "click",
                () => {
                    if (
                        this.ui &&
                        typeof this.ui.hideGuide ===
                        "function"
                    ) {
                        this.ui.hideGuide();

                    } else {
                        const guide =
                            this.$("pyt-guide");

                        if (!guide) {
                            return;
                        }

                        guide.classList.add(
                            "guide-leaving"
                        );

                        window.setTimeout(
                            () => {
                                guide.classList.add(
                                    "hidden"
                                );

                                guide.classList.remove(
                                    "guide-leaving"
                                );
                            },
                            320
                        );
                    }
                }
            );
    }


    /* =====================================================
       INTRO
    ===================================================== */

    showIntro() {
        const intro =
            this.$("intro-screen");

        const menu =
            this.$("main-menu");

        const game =
            this.$("game-interface");

        const settings =
            this.$("settings-screen");

        const credits =
            this.$("credits-screen");


        menu?.classList.add(
            "hidden"
        );

        game?.classList.add(
            "hidden"
        );

        settings?.classList.add(
            "hidden"
        );

        credits?.classList.add(
            "hidden"
        );

        intro?.classList.remove(
            "hidden",
            "intro-hop-1",
            "intro-hop-2",
            "intro-hop-3",
            "intro-hop-4",
            "intro-hop-5",
            "intro-arrive",
            "intro-y",
            "intro-happy",
            "intro-finished",
            "intro-await-input"
        );


        this.introReadyForInput =
            false;

        this.introFinished =
            false;


        this.clearIntroTimers();


        this.updateIntroContinueText();


        /*
        Aucun appui ne fait continuer l'intro avant
        la fin réelle de l'animation.
        */

        this.introKeyHandler =
            event => {
                if (
                    !this.introReadyForInput ||
                    this.introFinished
                ) {
                    return;
                }

                /*
                On évite quelques touches purement
                modificatrices.
                */

                if (
                    [
                        "Shift",
                        "Control",
                        "Alt",
                        "Meta",
                        "CapsLock"
                    ].includes(
                        event.key
                    )
                ) {
                    return;
                }

                this.finishIntro();
            };


        this.introTouchHandler =
            event => {
                if (
                    !this.introReadyForInput ||
                    this.introFinished
                ) {
                    return;
                }

                /*
                Le bouton "Passer" possède déjà
                son propre événement.
                */

                if (
                    event.target?.closest?.(
                        "#skip-intro-button"
                    )
                ) {
                    return;
                }

                this.finishIntro();
            };


        window.addEventListener(
            "keydown",
            this.introKeyHandler
        );

        intro?.addEventListener(
            "pointerdown",
            this.introTouchHandler
        );


        this.playMusic(
            "music-intro"
        );


        /*
        Arrivée volontairement lente et sautillante.
        */

        this.scheduleIntroClass(
            550,
            "intro-hop-1"
        );

        this.scheduleIntroClass(
            1150,
            "intro-hop-2"
        );

        this.scheduleIntroClass(
            1750,
            "intro-hop-3"
        );

        this.scheduleIntroClass(
            2350,
            "intro-hop-4"
        );

        this.scheduleIntroClass(
            2950,
            "intro-hop-5"
        );

        this.scheduleIntroClass(
            3500,
            "intro-arrive"
        );


        /*
        Une fois arrivé, Pyt forme le Y.
        */

        this.introTimers.push(
            window.setTimeout(
                () => {
                    intro?.classList.add(
                        "intro-y"
                    );
                },
                4150
            )
        );


        /*
        Puis il devient heureux uniquement
        grâce à ses yeux.
        */

        this.introTimers.push(
            window.setTimeout(
                () => {
                    intro?.classList.add(
                        "intro-happy"
                    );
                },
                4750
            )
        );


        /*
        La scène finale apparaît.
        */

        this.introTimers.push(
            window.setTimeout(
                () => {
                    intro?.classList.add(
                        "intro-finished"
                    );
                },
                5200
            )
        );


        /*
        IMPORTANT :
        À partir de ce moment, l'intro ne continue
        PLUS automatiquement.

        Elle reste figée jusqu'à une interaction.
        */

        this.introTimers.push(
            window.setTimeout(
                () => {
                    this.introReadyForInput =
                        true;

                    intro?.classList.add(
                        "intro-await-input"
                    );
                },
                5650
            )
        );
    }


    scheduleIntroClass(
        delay,
        className
    ) {
        const intro =
            this.$("intro-screen");

        this.introTimers.push(
            window.setTimeout(
                () => {
                    intro?.classList.add(
                        className
                    );
                },
                delay
            )
        );
    }


    clearIntroTimers() {
        for (
            const timer
            of this.introTimers
        ) {
            window.clearTimeout(
                timer
            );
        }

        this.introTimers = [];
    }


    updateIntroContinueText() {
        const message =
            this.$(
                "intro-continue-message"
            );

        if (!message) {
            return;
        }

        if (
            this.isMobileDevice()
        ) {
            message.textContent =
                "Touchez l’écran pour continuer";
        } else {
            message.textContent =
                "Appuyez sur une touche pour continuer";
        }
    }


    finishIntro() {
        if (
            this.introFinished
        ) {
            return;
        }

        this.introFinished =
            true;

        this.clearIntroTimers();

        const intro =
            this.$("intro-screen");

        /*
        Si le bouton Passer est utilisé avant la fin,
        on place brièvement l'intro dans son état final.
        */

        intro?.classList.add(
            "intro-arrive",
            "intro-y",
            "intro-happy",
            "intro-finished"
        );

        intro?.classList.remove(
            "intro-await-input"
        );


        window.removeEventListener(
            "keydown",
            this.introKeyHandler
        );

        intro?.removeEventListener(
            "pointerdown",
            this.introTouchHandler
        );


        window.setTimeout(
            () => {
                intro?.classList.add(
                    "hidden"
                );

                this.showMainMenu();
            },
            180
        );
    }


    /* =====================================================
       MENU
    ===================================================== */

    showMainMenu() {
        this.hideAllMainScreens();

        this.$("main-menu")
            ?.classList.remove(
                "hidden"
            );

        this.stopMusic();
    }


    startGame() {
        this.hideAllMainScreens();

        this.$("game-interface")
            ?.classList.remove(
                "hidden"
            );

        if (
            this.level
        ) {
            this.playChapterMusic(
                this.level.chapter
            );
        }

        /*
        Au début du jeu, on présente d'abord le cours
        du chapitre.
        */

        if (
            this.ui &&
            typeof this.ui.showCourseAtChapterStart ===
            "function"
        ) {
            this.ui.showCourseAtChapterStart();

        } else if (
            this.ui &&
            typeof this.ui.showCourse ===
            "function"
        ) {
            this.ui.showCourse();
        }
    }


    hideAllMainScreens() {
        this.$("intro-screen")
            ?.classList.add(
                "hidden"
            );

        this.$("main-menu")
            ?.classList.add(
                "hidden"
            );

        this.$("settings-screen")
            ?.classList.add(
                "hidden"
            );

        this.$("game-interface")
            ?.classList.add(
                "hidden"
            );

        this.$("credits-screen")
            ?.classList.add(
                "hidden"
            );
    }


    /* =====================================================
       PARAMÈTRES
    ===================================================== */

    openSettings(source = "menu") {
        const settings =
            this.$("settings-screen");

        if (!settings) {
            return;
        }

        settings.dataset.returnTo =
            source;

        this.$("main-menu")
            ?.classList.add(
                "hidden"
            );

        if (
            source === "game"
        ) {
            this.$("game-interface")
                ?.classList.add(
                    "hidden"
                );
        }

        settings.classList.remove(
            "hidden"
        );

        this.syncSettingsUI();
    }


    closeSettings() {
        const settings =
            this.$("settings-screen");

        const returnTo =
            settings?.dataset.returnTo ||
            "menu";

        settings?.classList.add(
            "hidden"
        );

        if (
            returnTo === "game"
        ) {
            this.$("game-interface")
                ?.classList.remove(
                    "hidden"
                );

            if (
                this.level
            ) {
                this.playChapterMusic(
                    this.level.chapter
                );
            }

        } else {
            this.$("main-menu")
                ?.classList.remove(
                    "hidden"
                );
        }
    }


    /* =====================================================
       CRÉDITS
    ===================================================== */

    showCredits() {
        const credits =
            this.$("credits-screen");

        if (!credits) {
            return;
        }

        if (
            this.creditsTimer
        ) {
            window.clearTimeout(
                this.creditsTimer
            );

            this.creditsTimer = null;
        }

        this.$("settings-screen")
            ?.classList.add(
                "hidden"
            );

        credits.classList.remove(
            "hidden",
            "credits-running",
            "credits-finished"
        );


        /*
        Force un nouveau cycle d'animation
        à chaque ouverture.
        */

        void credits.offsetWidth;

        credits.classList.add(
            "credits-running"
        );


        /*
        L'animation CSS dure 42 secondes.
        Ensuite PYT reste figé au centre.
        */

        this.creditsTimer =
            window.setTimeout(
                () => {
                    credits.classList.remove(
                        "credits-running"
                    );

                    credits.classList.add(
                        "credits-finished"
                    );

                    this.creditsTimer =
                        null;
                },
                42000
            );
    }


    closeCredits() {
        const credits =
            this.$("credits-screen");

        if (
            this.creditsTimer
        ) {
            window.clearTimeout(
                this.creditsTimer
            );

            this.creditsTimer = null;
        }

        credits?.classList.add(
            "hidden"
        );

        credits?.classList.remove(
            "credits-running",
            "credits-finished"
        );

        this.$("settings-screen")
            ?.classList.remove(
                "hidden"
            );
    }


    /* =====================================================
       AUDIO
    ===================================================== */

    setMusicEnabled(enabled) {
        this.musicEnabled =
            Boolean(enabled);

        if (
            !this.musicEnabled
        ) {
            /*
            Demande :
            Musique = Non -> volume = 0 %.
            */

            if (
                this.volume > 0
            ) {
                this.volumeBeforeMute =
                    this.volume;
            }

            this.volume = 0;

            this.stopMusic();

        } else {
            /*
            Si l'utilisateur réactive la musique,
            on restaure le volume précédent.
            */

            if (
                this.volume <= 0
            ) {
                this.volume =
                    this.volumeBeforeMute > 0
                        ? this.volumeBeforeMute
                        : 0.6;
            }

            this.resumeRelevantMusic();
        }

        this.applyAudioSettings();
        this.syncSettingsUI();
    }


    setVolume(volume) {
        const value =
            Math.max(
                0,
                Math.min(
                    1,
                    Number(volume) || 0
                )
            );

        this.volume =
            value;

        if (
            value > 0
        ) {
            this.volumeBeforeMute =
                value;

            if (
                !this.musicEnabled
            ) {
                this.musicEnabled =
                    true;
            }

        } else {
            this.musicEnabled =
                false;

            this.stopMusic();
        }

        this.applyAudioSettings();
        this.syncSettingsUI();
    }


    applyAudioSettings() {
        const audios =
            document.querySelectorAll(
                "#audio-container audio"
            );

        audios.forEach(
            audio => {
                audio.volume =
                    this.volume;

                audio.muted =
                    !this.musicEnabled ||
                    this.volume <= 0;
            }
        );

        this.syncSettingsUI();
    }


    syncSettingsUI() {
        const music =
            this.$("music-enabled");

        const slider =
            this.$("volume-slider");

        const value =
            this.$("volume-value");


        if (music) {
            music.checked =
                this.musicEnabled;
        }

        if (slider) {
            slider.value =
                String(
                    Math.round(
                        this.volume * 100
                    )
                );
        }

        if (value) {
            value.textContent =
                `${Math.round(
                    this.volume * 100
                )} %`;
        }
    }


    playMusic(id) {
        if (
            !this.musicEnabled ||
            this.volume <= 0
        ) {
            return;
        }

        const audio =
            this.$(id);

        if (!audio) {
            return;
        }

        /*
        Aucun src = aucun problème.
        */

        if (
            !audio.getAttribute("src") &&
            !audio.querySelector("source")
        ) {
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
            this.volume;

        audio.muted =
            false;

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
                    l'audio avant interaction.
                    Le jeu continue normalement.
                    */
                }
            );
        }
    }


    playChapterMusic(chapter) {
        this.playMusic(
            `music-chapter-${chapter}`
        );
    }


    stopMusic() {
        const audios =
            document.querySelectorAll(
                "#audio-container audio"
            );

        audios.forEach(
            audio => {
                try {
                    audio.pause();
                } catch (_) {
                    // Aucun blocage du jeu.
                }
            }
        );

        this.currentMusic =
            null;
    }


    resumeRelevantMusic() {
        if (
            !this.musicEnabled ||
            this.volume <= 0
        ) {
            return;
        }

        const intro =
            this.$("intro-screen");

        const game =
            this.$("game-interface");

        const course =
            this.$("chapter-screen");


        if (
            intro &&
            !intro.classList.contains(
                "hidden"
            )
        ) {
            this.playMusic(
                "music-intro"
            );

            return;
        }


        if (
            game &&
            !game.classList.contains(
                "hidden"
            )
        ) {
            if (
                course &&
                !course.classList.contains(
                    "hidden"
                )
            ) {
                this.playMusic(
                    "music-theory"
                );

                return;
            }

            if (
                this.level
            ) {
                this.playChapterMusic(
                    this.level.chapter
                );
            }
        }
    }


    /* =====================================================
       NIVEAUX
    ===================================================== */

    loadLevel(
        chapter,
        exercise,
        options = {}
    ) {
        if (
            typeof getLevel !==
            "function"
        ) {
            console.error(
                "getLevel() n'est pas disponible."
            );

            return false;
        }

        const level =
            getLevel(
                chapter,
                exercise
            );

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

        if (this.ui) {
            this.ui.setGame(
                this.game
            );

            this.ui.setLevel(
                level
            );

            if (
                options.showGame !== false
            ) {
                this.ui.showGame();
            }
        }

        if (
            options.showGame !== false
        ) {
            this.playChapterMusic(
                chapter
            );
        }

        return true;
    }


    restartCurrentLevel() {
        if (!this.level) {
            return;
        }

        const editor =
            this.$("code-editor");

        const currentCode =
            editor?.value ?? "";

        this.robot =
            new Robot();

        this.game =
            new Game(
                this.level,
                this.robot
            );

        if (this.ui) {
            this.ui.setGame(
                this.game
            );

            /*
            On ne rappelle PAS setLevel ici.
            Cela évite d'effacer le code de l'élève.
            */

            this.ui.clearErrorHighlight?.();

            this.ui.hideThoughtBubble?.();

            this.ui.render?.();

            this.ui.setStatus?.(
                ""
            );
        }

        if (editor) {
            editor.value =
                currentCode;
        }
    }


    resetWorldForExecution() {
        if (!this.level) {
            return;
        }

        this.robot =
            new Robot();

        this.game =
            new Game(
                this.level,
                this.robot
            );

        if (this.ui) {
            this.ui.setGame(
                this.game
            );

            /*
            Très important :
            pas de setLevel() ici.
            Sinon le starterCode remplace le code
            que l'élève vient d'écrire.
            */

            this.ui.render?.();
        }
    }


    /* =====================================================
       EXÉCUTION DU CODE
    ===================================================== */

    runStudentCode(code) {
        if (
            this.running ||
            !this.level
        ) {
            return;
        }

        this.running = true;

        this.resetWorldForExecution();

        this.ui?.clearErrorHighlight?.();
        this.ui?.hideThoughtBubble?.();
        this.ui?.setStatus?.(
            "Exécution..."
        );

        const result =
            this.runner.run(
                code
            );

        this.showConsoleOutput(
            result
        );

        const requiredCheck =
            this.validateRequiredConcepts(
                code
            );


        /*
        Même si une erreur arrive plus tard,
        les actions valides déjà produites
        sont exécutées visuellement.
        */

        this.playActions(
            result.actions,
            () => {
                this.finishAttempt(
                    code,
                    result,
                    requiredCheck
                );
            }
        );
    }


    playActions(
        actions,
        onComplete
    ) {
        const queue =
            Array.isArray(actions)
                ? [...actions]
                : [];

        const next =
            () => {
                if (
                    queue.length === 0
                ) {
                    onComplete?.();
                    return;
                }

                const action =
                    queue.shift();

                const successful =
                    this.performAction(
                        action
                    );

                this.ui?.render?.();

                if (!successful) {
                    /*
                    Le programme s'arrête lorsqu'une
                    action physique est impossible.
                    */

                    queue.length = 0;

                    this.lastBlockedAction =
                        action;

                    onComplete?.();
                    return;
                }

                window.setTimeout(
                    next,
                    this.actionDelay
                );
            };

        next();
    }


    performAction(action) {
        if (
            !action ||
            !this.game ||
            !this.robot
        ) {
            return false;
        }

        const type =
            Array.isArray(action)
                ? action[0]
                : action.type;

        const value =
            Array.isArray(action)
                ? action[1]
                : action.value;


        switch (type) {
            case "forward":
                return this.game.moveForward();

            case "backward":
                return this.game.moveBackward();

            case "right":
                this.robot.rotateRight(
                    value || 90
                );

                return true;

            case "left":
                this.robot.rotateLeft(
                    value || 90
                );

                return true;

            default:
                return false;
        }
    }


    finishAttempt(
        code,
        result,
        requiredCheck
    ) {
        this.running = false;

        const attempt =
            this.ui?.registerAttempt?.(
                this.level.id
            ) ?? 1;


        /*
        1. Erreur Python.
        */

        if (!result.success) {
            this.handleFailure({
                type: "python_error",
                message:
                    result.error ||
                    "Le programme contient une erreur.",
                line:
                    result.errorLine,
                attempt
            });

            return;
        }


        /*
        2. Action bloquée.
        */

        if (this.lastBlockedAction) {
            const blocked =
                this.lastBlockedAction;

            this.lastBlockedAction =
                null;

            this.handleFailure({
                type: "blocked",
                message:
                    this.game?.message ||
                    "Pyt ne peut pas continuer dans cette direction.",
                line:
                    blocked.line || null,
                attempt
            });

            return;
        }


        /*
        3. Résultat du niveau.
        */

        const success =
            this.game.checkSuccess();


        if (!success) {
            this.handleFailure({
                type: "semantic",
                message:
                    this.getFailureFeedback(),
                line: null,
                attempt
            });

            return;
        }


        /*
        4. Vérification pédagogique.
        Le joueur peut trouver plusieurs solutions,
        mais doit réellement pratiquer la notion
        demandée par le chapitre.
        */

        if (!requiredCheck.success) {
            this.handleFailure({
                type: "concept",
                message:
                    requiredCheck.message,
                line: null,
                attempt
            });

            return;
        }


        /*
        Réussite.
        */

        this.ui?.setStatus?.(
            "Mission réussie !"
        );

        this.ui?.clearErrorHighlight?.();

        this.ui?.completeCurrentLevel?.();
    }


    handleFailure({
        type,
        message,
        line,
        attempt
    }) {
        this.ui?.setStatus?.(
            message
        );


        /*
        Mauvaise position finale :
        pensée exacte demandée.
        */

        if (
            type === "semantic" &&
            this.isWrongFinalPosition()
        ) {
            this.ui?.showThoughtBubble?.(
                "Ce n’est pas là que je voulais aller..."
            );
        }


        /*
        Première erreur :
        pas de soulignement rouge immédiat.
        */

        if (
            attempt <= 1
        ) {
            this.ui?.clearErrorHighlight?.();

        } else if (
            (
                type === "python_error" ||
                type === "blocked"
            ) &&
            Number.isInteger(line)
        ) {
            /*
            À partir de la deuxième tentative,
            on souligne seulement lorsqu'on connaît
            réellement la ligne problématique.
            */

            this.ui?.highlightErrorLine?.(
                line
            );

        } else {
            /*
            Une solution syntaxiquement correcte
            qui produit le mauvais résultat ne reçoit
            PAS de faux soulignement.
            */

            this.ui?.clearErrorHighlight?.();
        }


        /*
        Pyt propose de revoir le cours.
        */

        if (
            this.ui &&
            typeof this.ui.showFailureGuide ===
            "function"
        ) {
            this.ui.showFailureGuide(
                message,
                {
                    attempt,
                    type
                }
            );

        } else {
            this.ui?.showGuide?.(
                message
            );
        }
    }


    getFailureFeedback() {
        if (!this.game) {
            return "La mission n'est pas terminée.";
        }


        if (
            this.game.objects &&
            this.game.objects.size > 0
        ) {
            const count =
                this.game.objects.size;

            return (
                count === 1
                    ? "Il reste encore un objet à récupérer."
                    : `Il reste encore ${count} objets à récupérer.`
            );
        }


        if (
            this.game.dirt &&
            this.game.dirt.size > 0
        ) {
            const count =
                this.game.dirt.size;

            return (
                count === 1
                    ? "Il reste encore une zone à nettoyer."
                    : `Il reste encore ${count} zones à nettoyer.`
            );
        }


        if (
            this.game.buttons &&
            this.game.activatedButtons
        ) {
            const inactive =
                this.game.buttons.size -
                this.game.activatedButtons.size;

            if (
                inactive > 0
            ) {
                return (
                    inactive === 1
                        ? "Il reste encore un bouton à activer."
                        : `Il reste encore ${inactive} boutons à activer.`
                );
            }
        }


        if (
            this.game.getInventoryCount?.() > 0 &&
            this.game.deposits?.size > 0
        ) {
            return "Pyt transporte encore un objet. Il faut l'apporter à la zone de dépôt.";
        }


        if (
            this.level?.objective ===
            "boxes" ||
            this.level?.objective?.type ===
            "boxes"
        ) {
            return "Toutes les caisses ne sont pas encore à la bonne place.";
        }


        if (
            this.game.message
        ) {
            return this.game.message;
        }


        if (
            this.isWrongFinalPosition()
        ) {
            return "Ce n’est pas là que je voulais aller...";
        }


        return "La mission n'est pas encore terminée.";
    }


    isWrongFinalPosition() {
        if (
            !this.game ||
            !this.game.goal
        ) {
            return false;
        }

        const position =
            this.game.getRobotPosition?.();

        if (!position) {
            return false;
        }

        return (
            position.row !==
            this.game.goal.row ||
            position.col !==
            this.game.goal.col
        );
    }


    /* =====================================================
       CONCEPTS PÉDAGOGIQUES
    ===================================================== */

    validateRequiredConcepts(code) {
        const required =
            Array.isArray(
                this.level?.requiredConcepts
            )
                ? this.level.requiredConcepts
                : [];

        if (
            required.length === 0
        ) {
            return {
                success: true
            };
        }

        const tests = {
            forward:
                /\bforward\s*\(/,

            backward:
                /\bbackward\s*\(/,

            right:
                /\bright\s*\(/,

            left:
                /\bleft\s*\(/,

            movement:
                /\b(?:forward|backward|right|left)\s*\(/,

            variable:
                /^[ \t]*[A-Za-z_]\w*\s*=/m,

            variables:
                /^[ \t]*[A-Za-z_]\w*\s*=/m,

            arithmetic:
                /[+*/%]|(?:\w|\d)\s*-\s*(?:\w|\d)/,

            conversion:
                /\b(?:int|float|str)\s*\(/,

            if:
                /\bif\b/,

            elif:
                /\belif\b/,

            else:
                /\belse\s*:/,

            condition:
                /\bif\b/,

            conditions:
                /\bif\b/,

            and:
                /\band\b/,

            or:
                /\bor\b/,

            not:
                /\bnot\b/,

            for:
                /\bfor\b/,

            range:
                /\brange\s*\(/,

            while:
                /\bwhile\b/,

            break:
                /\bbreak\b/,

            list:
                /\[[^\]]*\]/,

            lists:
                /\[[^\]]*\]/,

            append:
                /\.append\s*\(/,

            function:
                /\bdef\s+[A-Za-z_]\w*\s*\(/,

            functions:
                /\bdef\s+[A-Za-z_]\w*\s*\(/,

            print:
                /\bprint\s*\(/
        };


        for (
            const concept
            of required
        ) {
            if (
                concept === "revision"
            ) {
                continue;
            }

            const test =
                tests[concept];

            if (
                test &&
                !test.test(code)
            ) {
                return {
                    success: false,
                    message:
                        this.getConceptMessage(
                            concept
                        )
                };
            }
        }


        return {
            success: true
        };
    }


    getConceptMessage(concept) {
        const messages = {
            forward:
                "Essaie d'utiliser forward(...).",

            backward:
                "Essaie d'utiliser backward(...).",

            right:
                "Essaie d'utiliser right(...).",

            left:
                "Essaie d'utiliser left(...).",

            movement:
                "Utilise les instructions de déplacement de Pyt.",

            variable:
                "Cet exercice te demande d'utiliser une variable.",

            variables:
                "Cet exercice te demande d'utiliser des variables.",

            arithmetic:
                "Utilise un calcul dans ton programme.",

            conversion:
                "Utilise une conversion avec int(), float() ou str().",

            if:
                "Cet exercice te demande d'utiliser une condition avec if.",

            elif:
                "Essaie d'utiliser elif dans ta condition.",

            else:
                "Essaie d'utiliser else dans ta condition.",

            condition:
                "Cet exercice te demande d'utiliser une condition.",

            conditions:
                "Cet exercice te demande d'utiliser des conditions.",

            and:
                "Essaie d'utiliser and.",

            or:
                "Essaie d'utiliser or.",

            not:
                "Essaie d'utiliser not.",

            for:
                "Cet exercice te demande d'utiliser une boucle for.",

            range:
                "Utilise range(...) avec ta boucle.",

            while:
                "Cet exercice te demande d'utiliser une boucle while.",

            break:
                "Essaie d'utiliser break dans ta boucle.",

            list:
                "Cet exercice te demande d'utiliser une liste.",

            lists:
                "Cet exercice te demande d'utiliser une liste.",

            append:
                "Essaie d'ajouter un élément avec append(...).",

            function:
                "Cet exercice te demande de créer une fonction avec def.",

            functions:
                "Cet exercice te demande de créer une fonction avec def.",

            print:
                "Essaie d'utiliser print(...)."
        };

        return (
            messages[concept] ||
            `Utilise la notion « ${concept} » dans ta solution.`
        );
    }


    /* =====================================================
       CONSOLE
    ===================================================== */

    showConsoleOutput(result) {
        const consoleOutput =
            this.$("console-output");

        if (!consoleOutput) {
            return;
        }

        const lines = [
            ...(result.output || [])
        ];

        if (
            !result.success &&
            result.error
        ) {
            lines.push(
                `Erreur : ${result.error}`
            );
        }

        consoleOutput.textContent =
            lines.length
                ? lines.join("\n")
                : "Programme lancé.";
    }


    /* =====================================================
       OUTILS
    ===================================================== */

    isMobileDevice() {
        return (
            window.matchMedia(
                "(max-width: 760px)"
            ).matches ||
            (
                "ontouchstart" in window &&
                window.innerWidth <= 900
            )
        );
    }


    $(id) {
        return document.getElementById(
            id
        );
    }
}


/* =========================================================
   DÉMARRAGE
========================================================= */

window.BrowserPythonRunner =
    BrowserPythonRunner;

window.PytApplication =
    PytApplication;


document.addEventListener(
    "DOMContentLoaded",
    () => {
        const app =
            new PytApplication();

        window.pytApp =
            app;

        app.start();
    }
);