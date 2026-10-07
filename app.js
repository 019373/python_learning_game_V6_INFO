"use strict";

/* =========================================================
   PYT - app.js
   Application principale + exécution du Python simplifié.
========================================================= */


/* =========================================================
   MINI INTERPRÉTEUR PYTHON
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

        this.lines = [];
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

            this.lines =
                this.prepareLines(code);

            this.executeBlock(
                0,
                this.lines.length,
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
            return {
                success: false,

                /*
                On conserve les actions valides exécutées
                avant l'erreur afin que Pyt puisse les jouer.
                */
                actions: [...this.actions],

                output: [...this.output],

                error:
                    error instanceof Error
                        ? error.message
                        : String(error),

                errorLine:
                    this.extractErrorLine(
                        error instanceof Error
                            ? error.message
                            : String(error)
                    )
            };
        }
    }


    /* =====================================================
       PRÉPARATION
    ===================================================== */

    checkForbiddenCode(code) {
        const forbidden = [
            /\bimport\b/i,
            /\bfrom\b/i,
            /\beval\s*\(/i,
            /\bexec\s*\(/i,
            /\bopen\s*\(/i,
            /\b__import__\s*\(/i,
            /\bglobals\s*\(/i,
            /\blocals\s*\(/i,
            /\bcompile\s*\(/i,
            /\binput\s*\(/i,
            /\bos\./i,
            /\bsys\./i,
            /\bsubprocess\b/i
        ];

        for (
            const pattern
            of forbidden
        ) {
            if (
                pattern.test(code)
            ) {
                throw new Error(
                    "Cette instruction n'est pas disponible dans PYT."
                );
            }
        }
    }


    prepareLines(code) {
        const rawLines =
            String(code || "")
                .replace(/\r\n/g, "\n")
                .replace(/\r/g, "\n")
                .split("\n");

        return rawLines.map(
            (raw, index) => {
                const withoutComment =
                    this.removeComment(raw);

                const indentationMatch =
                    withoutComment.match(
                        /^(\s*)/
                    );

                const indentationText =
                    indentationMatch
                        ? indentationMatch[1]
                        : "";

                if (
                    indentationText.includes(
                        "\t"
                    )
                ) {
                    throw new Error(
                        `Ligne ${index + 1} : utilise 4 espaces pour l'indentation.`
                    );
                }

                const indentation =
                    indentationText.length;

                if (
                    indentation % 4 !== 0
                ) {
                    throw new Error(
                        `Ligne ${index + 1} : l'indentation doit utiliser des groupes de 4 espaces.`
                    );
                }

                return {
                    number:
                        index + 1,

                    indent:
                        indentation,

                    text:
                        withoutComment.trim(),

                    raw
                };
            }
        );
    }


    removeComment(line) {
        let quote = null;
        let escaped = false;

        for (
            let i = 0;
            i < line.length;
            i++
        ) {
            const char =
                line[i];

            if (escaped) {
                escaped = false;
                continue;
            }

            if (
                char === "\\"
            ) {
                escaped = true;
                continue;
            }

            if (
                quote
            ) {
                if (
                    char === quote
                ) {
                    quote = null;
                }

                continue;
            }

            if (
                char === '"' ||
                char === "'"
            ) {
                quote = char;
                continue;
            }

            if (
                char === "#"
            ) {
                return line.slice(
                    0,
                    i
                );
            }
        }

        return line;
    }


    extractErrorLine(message) {
        const match =
            String(message || "")
                .match(
                    /Ligne\s+(\d+)/i
                );

        return match
            ? Number(match[1])
            : null;
    }


    /* =====================================================
       BLOCS
    ===================================================== */

    executeBlock(
        start,
        end,
        indent
    ) {
        let index =
            start;

        while (
            index < end
        ) {
            const line =
                this.lines[index];

            if (
                !line ||
                !line.text
            ) {
                index++;
                continue;
            }

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


            if (
                line.text.startsWith(
                    "if "
                )
            ) {
                const result =
                    this.executeIfChain(
                        index,
                        end,
                        indent
                    );

                if (
                    result.signal
                ) {
                    return result;
                }

                index =
                    result.nextIndex;

                continue;
            }


            if (
                line.text.startsWith(
                    "elif "
                ) ||
                line.text === "else:"
            ) {
                break;
            }


            if (
                line.text.startsWith(
                    "for "
                )
            ) {
                const result =
                    this.executeFor(
                        index,
                        end,
                        indent
                    );

                if (
                    result.signal ===
                    "return"
                ) {
                    return result;
                }

                index =
                    result.nextIndex;

                continue;
            }


            if (
                line.text.startsWith(
                    "while "
                )
            ) {
                const result =
                    this.executeWhile(
                        index,
                        end,
                        indent
                    );

                if (
                    result.signal ===
                    "return"
                ) {
                    return result;
                }

                index =
                    result.nextIndex;

                continue;
            }


            if (
                line.text.startsWith(
                    "def "
                )
            ) {
                index =
                    this.registerFunction(
                        index,
                        end,
                        indent
                    );

                continue;
            }


            if (
                line.text === "break"
            ) {
                return {
                    signal: "break",
                    nextIndex:
                        index + 1
                };
            }


            if (
                line.text === "return"
            ) {
                return {
                    signal: "return",
                    value: null,
                    nextIndex:
                        index + 1
                };
            }


            if (
                line.text.startsWith(
                    "return "
                )
            ) {
                return {
                    signal: "return",

                    value:
                        this.evaluateExpression(
                            line.text.slice(7),
                            line.number
                        ),

                    nextIndex:
                        index + 1
                };
            }


            if (
                line.text === "pass"
            ) {
                index++;
                continue;
            }


            this.executeStatement(
                line.text,
                line.number
            );

            index++;
        }

        return {
            signal: null,
            nextIndex: index
        };
    }


    findBlockEnd(
        start,
        end,
        parentIndent
    ) {
        let index =
            start + 1;

        while (
            index < end
        ) {
            const line =
                this.lines[index];

            if (
                line.text &&
                line.indent <=
                parentIndent
            ) {
                break;
            }

            index++;
        }

        return index;
    }


    getChildIndent(
        index,
        end
    ) {
        for (
            let i =
                index + 1;
            i < end;
            i++
        ) {
            const line =
                this.lines[i];

            if (!line.text) {
                continue;
            }

            if (
                line.indent <=
                this.lines[index].indent
            ) {
                break;
            }

            return line.indent;
        }

        throw new Error(
            `Ligne ${this.lines[index].number} : bloc vide.`
        );
    }


    /* =====================================================
       IF / ELIF / ELSE
    ===================================================== */

    executeIfChain(
        index,
        end,
        indent
    ) {
        let cursor =
            index;

        let executed =
            false;

        while (
            cursor < end
        ) {
            const line =
                this.lines[cursor];

            if (
                !line.text ||
                line.indent !== indent
            ) {
                break;
            }

            const isIf =
                line.text.startsWith(
                    "if "
                );

            const isElif =
                line.text.startsWith(
                    "elif "
                );

            const isElse =
                line.text === "else:";

            if (
                !isIf &&
                !isElif &&
                !isElse
            ) {
                break;
            }


            if (
                (
                    isIf ||
                    isElif
                ) &&
                !line.text.endsWith(":")
            ) {
                throw new Error(
                    `Ligne ${line.number} : il manque ":" à la fin de la condition.`
                );
            }


            const blockEnd =
                this.findBlockEnd(
                    cursor,
                    end,
                    indent
                );

            const childIndent =
                this.getChildIndent(
                    cursor,
                    blockEnd
                );


            let condition =
                false;

            if (isElse) {
                condition = true;

            } else {
                const prefixLength =
                    isIf
                        ? 3
                        : 5;

                const expression =
                    line.text
                        .slice(
                            prefixLength,
                            -1
                        )
                        .trim();

                condition =
                    Boolean(
                        this.evaluateExpression(
                            expression,
                            line.number
                        )
                    );
            }


            if (
                !executed &&
                condition
            ) {
                const result =
                    this.executeBlock(
                        cursor + 1,
                        blockEnd,
                        childIndent
                    );

                executed = true;

                if (
                    result.signal
                ) {
                    return {
                        ...result,
                        nextIndex:
                            this.findIfChainEnd(
                                blockEnd,
                                end,
                                indent
                            )
                    };
                }
            }


            cursor =
                blockEnd;


            while (
                cursor < end &&
                !this.lines[cursor].text
            ) {
                cursor++;
            }


            if (
                cursor >= end ||
                this.lines[cursor].indent !==
                indent
            ) {
                break;
            }


            if (
                !this.lines[cursor]
                    .text
                    .startsWith("elif ") &&
                this.lines[cursor].text !==
                "else:"
            ) {
                break;
            }
        }


        return {
            signal: null,
            nextIndex: cursor
        };
    }


    findIfChainEnd(
        index,
        end,
        indent
    ) {
        let cursor =
            index;

        while (
            cursor < end
        ) {
            const line =
                this.lines[cursor];

            if (!line.text) {
                cursor++;
                continue;
            }

            if (
                line.indent !== indent
            ) {
                break;
            }

            if (
                !line.text.startsWith(
                    "elif "
                ) &&
                line.text !== "else:"
            ) {
                break;
            }

            cursor =
                this.findBlockEnd(
                    cursor,
                    end,
                    indent
                );
        }

        return cursor;
    }


    /* =====================================================
       FOR
    ===================================================== */

    executeFor(
        index,
        end,
        indent
    ) {
        const line =
            this.lines[index];

        if (
            !line.text.endsWith(":")
        ) {
            throw new Error(
                `Ligne ${line.number} : il manque ":" après la boucle for.`
            );
        }

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
                match[2],
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
                index,
                end,
                indent
            );

        const childIndent =
            this.getChildIndent(
                index,
                blockEnd
            );


        for (
            const value
            of iterable
        ) {
            this.iterations++;

            this.checkIterationLimit(
                line.number
            );

            this.variables[
                variableName
            ] = value;

            const result =
                this.executeBlock(
                    index + 1,
                    blockEnd,
                    childIndent
                );

            if (
                result.signal ===
                "break"
            ) {
                break;
            }

            if (
                result.signal ===
                "return"
            ) {
                return {
                    ...result,
                    nextIndex:
                        blockEnd
                };
            }
        }


        return {
            signal: null,
            nextIndex:
                blockEnd
        };
    }


    /* =====================================================
       WHILE
    ===================================================== */

    executeWhile(
        index,
        end,
        indent
    ) {
        const line =
            this.lines[index];

        if (
            !line.text.endsWith(":")
        ) {
            throw new Error(
                `Ligne ${line.number} : il manque ":" après la boucle while.`
            );
        }

        const expression =
            line.text
                .slice(
                    6,
                    -1
                )
                .trim();

        const blockEnd =
            this.findBlockEnd(
                index,
                end,
                indent
            );

        const childIndent =
            this.getChildIndent(
                index,
                blockEnd
            );


        while (
            Boolean(
                this.evaluateExpression(
                    expression,
                    line.number
                )
            )
        ) {
            this.iterations++;

            this.checkIterationLimit(
                line.number
            );

            const result =
                this.executeBlock(
                    index + 1,
                    blockEnd,
                    childIndent
                );

            if (
                result.signal ===
                "break"
            ) {
                break;
            }

            if (
                result.signal ===
                "return"
            ) {
                return {
                    ...result,
                    nextIndex:
                        blockEnd
                };
            }
        }


        return {
            signal: null,
            nextIndex:
                blockEnd
        };
    }


    checkIterationLimit(
        lineNumber
    ) {
        if (
            this.iterations >
            this.maxIterations
        ) {
            throw new Error(
                `Ligne ${lineNumber} : trop de répétitions. Vérifie ta boucle.`
            );
        }
    }


    /* =====================================================
       FONCTIONS
    ===================================================== */

    registerFunction(
        index,
        end,
        indent
    ) {
        const line =
            this.lines[index];

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
            match[2].trim()
                ? this.splitArguments(
                    match[2]
                ).map(
                    parameter =>
                        parameter.trim()
                )
                : [];

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


        const blockEnd =
            this.findBlockEnd(
                index,
                end,
                indent
            );

        const childIndent =
            this.getChildIndent(
                index,
                blockEnd
            );


        this.functions[name] = {
            parameters,
            start:
                index + 1,
            end:
                blockEnd,
            indent:
                childIndent,
            line:
                line.number
        };


        return blockEnd;
    }


    callUserFunction(
        name,
        args,
        lineNumber
    ) {
        const definition =
            this.functions[name];

        if (!definition) {
            throw new Error(
                `Ligne ${lineNumber} : fonction "${name}" inconnue.`
            );
        }

        if (
            args.length !==
            definition.parameters.length
        ) {
            throw new Error(
                `Ligne ${lineNumber} : "${name}" attend ${definition.parameters.length} argument(s).`
            );
        }


        this.functionCalls++;

        if (
            this.functionCalls >
            this.maxFunctionCalls
        ) {
            throw new Error(
                `Ligne ${lineNumber} : trop d'appels de fonctions.`
            );
        }


        const previousVariables =
            {...this.variables};


        definition.parameters
            .forEach(
                (
                    parameter,
                    index
                ) => {
                    this.variables[
                        parameter
                    ] = args[index];
                }
            );


        const result =
            this.executeBlock(
                definition.start,
                definition.end,
                definition.indent
            );


        const changedGlobals =
            {...this.variables};

        this.variables =
            previousVariables;


        for (
            const key
            of Object.keys(
                previousVariables
            )
        ) {
            if (
                Object.prototype
                    .hasOwnProperty.call(
                        changedGlobals,
                        key
                    ) &&
                !definition.parameters
                    .includes(key)
            ) {
                this.variables[key] =
                    changedGlobals[key];
            }
        }


        return (
            result.signal ===
            "return"
                ? result.value
                : null
        );
    }


    /* =====================================================
       INSTRUCTIONS
    ===================================================== */

    executeStatement(
        statement,
        lineNumber
    ) {
        const appendMatch =
            statement.match(
                /^([A-Za-z_]\w*)\.append\s*\((.*)\)$/
            );

        if (appendMatch) {
            const variable =
                appendMatch[1];

            if (
                !Array.isArray(
                    this.variables[
                        variable
                    ]
                )
            ) {
                throw new Error(
                    `Ligne ${lineNumber} : "${variable}" n'est pas une liste.`
                );
            }

            this.variables[
                variable
            ].push(
                this.evaluateExpression(
                    appendMatch[2],
                    lineNumber
                )
            );

            return;
        }


        const augmentedMatch =
            statement.match(
                /^([A-Za-z_]\w*)\s*(\+=|-=|\*=)\s*(.+)$/
            );

        if (augmentedMatch) {
            const name =
                augmentedMatch[1];

            const operator =
                augmentedMatch[2];

            const value =
                this.evaluateExpression(
                    augmentedMatch[3],
                    lineNumber
                );

            if (
                !Object.prototype
                    .hasOwnProperty.call(
                        this.variables,
                        name
                    )
            ) {
                throw new Error(
                    `Ligne ${lineNumber} : variable "${name}" inconnue.`
                );
            }

            if (
                operator === "+="
            ) {
                this.variables[name] +=
                    value;

            } else if (
                operator === "-="
            ) {
                this.variables[name] -=
                    value;

            } else {
                this.variables[name] *=
                    value;
            }

            return;
        }


        const assignmentMatch =
            statement.match(
                /^([A-Za-z_]\w*)\s*=\s*(.+)$/
            );

        if (assignmentMatch) {
            this.variables[
                assignmentMatch[1]
            ] =
                this.evaluateExpression(
                    assignmentMatch[2],
                    lineNumber
                );

            return;
        }


        const call =
            this.parseFunctionCall(
                statement
            );

        if (call) {
            this.executeFunctionCall(
                call.name,
                call.args,
                lineNumber
            );

            return;
        }


        throw new Error(
            `Ligne ${lineNumber} : instruction non reconnue.`
        );
    }


    executeFunctionCall(
        name,
        argumentExpressions,
        lineNumber
    ) {
        const args =
            argumentExpressions.map(
                expression =>
                    this.evaluateExpression(
                        expression,
                        lineNumber
                    )
            );


        switch (name) {

            case "forward": {
                const steps =
                    this.normalizeMovementSteps(
                        args[0] ?? 1,
                        lineNumber
                    );

                this.addMovementActions(
                    "forward",
                    steps,
                    lineNumber
                );

                return null;
            }


            case "backward": {
                const steps =
                    this.normalizeMovementSteps(
                        args[0] ?? 1,
                        lineNumber
                    );

                this.addMovementActions(
                    "backward",
                    steps,
                    lineNumber
                );

                return null;
            }


            case "right": {
                const degrees =
                    this.normalizeRotation(
                        args[0] ?? 90,
                        lineNumber
                    );

                this.addAction({
                    type: "right",
                    value: degrees,
                    line: lineNumber
                });

                return null;
            }


            case "left": {
                const degrees =
                    this.normalizeRotation(
                        args[0] ?? 90,
                        lineNumber
                    );

                this.addAction({
                    type: "left",
                    value: degrees,
                    line: lineNumber
                });

                return null;
            }


            case "print": {
                const text =
                    args.map(
                        value =>
                            this.pythonString(
                                value
                            )
                    ).join(" ");

                this.output.push(
                    text
                );

                return null;
            }


            default:
                if (
                    this.functions[name]
                ) {
                    return this.callUserFunction(
                        name,
                        args,
                        lineNumber
                    );
                }

                throw new Error(
                    `Ligne ${lineNumber} : fonction "${name}" inconnue.`
                );
        }
    }


    /*
    IMPORTANT :
    forward(3) devient 3 actions séparées.

    Cela permet d'avoir environ 0,5 seconde
    d'animation PAR CASE au lieu de téléporter
    Pyt de trois cases puis d'attendre une seule fois.
    */

    addMovementActions(
        type,
        steps,
        lineNumber
    ) {
        for (
            let i = 0;
            i < steps;
            i++
        ) {
            this.addAction({
                type,
                value: 1,
                line: lineNumber
            });
        }
    }


    addAction(action) {
        if (
            this.actions.length >=
            this.maxActions
        ) {
            throw new Error(
                `Ligne ${action.line || "?"} : trop d'actions dans ce programme.`
            );
        }

        this.actions.push(
            action
        );
    }


    normalizeMovementSteps(
        value,
        lineNumber
    ) {
        const number =
            Number(value);

        if (
            !Number.isFinite(number) ||
            number < 0 ||
            !Number.isInteger(number)
        ) {
            throw new Error(
                `Ligne ${lineNumber} : la distance doit être un nombre entier positif.`
            );
        }

        return number;
    }


    normalizeRotation(
        value,
        lineNumber
    ) {
        const number =
            Number(value);

        if (
            !Number.isFinite(number) ||
            number % 90 !== 0
        ) {
            throw new Error(
                `Ligne ${lineNumber} : l'angle doit être un multiple de 90°.`
            );
        }

        return number;
    }


    /* =====================================================
       EXPRESSIONS
    ===================================================== */

    evaluateExpression(
        expression,
        lineNumber
    ) {
        let text =
            String(expression || "")
                .trim();

        if (!text) {
            throw new Error(
                `Ligne ${lineNumber} : expression vide.`
            );
        }


        text =
            this.stripOuterParentheses(
                text
            );


        /*
        OR
        */

        const orParts =
            this.splitTopLevelWord(
                text,
                "or"
            );

        if (
            orParts.length > 1
        ) {
            for (
                const part
                of orParts
            ) {
                if (
                    Boolean(
                        this.evaluateExpression(
                            part,
                            lineNumber
                        )
                    )
                ) {
                    return true;
                }
            }

            return false;
        }


        /*
        AND
        */

        const andParts =
            this.splitTopLevelWord(
                text,
                "and"
            );

        if (
            andParts.length > 1
        ) {
            for (
                const part
                of andParts
            ) {
                if (
                    !Boolean(
                        this.evaluateExpression(
                            part,
                            lineNumber
                        )
                    )
                ) {
                    return false;
                }
            }

            return true;
        }


        /*
        NOT
        */

        if (
            /^not\s+/.test(text)
        ) {
            return !Boolean(
                this.evaluateExpression(
                    text.replace(
                        /^not\s+/,
                        ""
                    ),
                    lineNumber
                )
            );
        }


        /*
        Comparaisons.
        */

        const comparison =
            this.findTopLevelOperator(
                text,
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
                    text.slice(
                        0,
                        comparison.index
                    ),
                    lineNumber
                );

            const right =
                this.evaluateExpression(
                    text.slice(
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


        /*
        Addition / soustraction.
        */

        const addition =
            this.findTopLevelOperatorFromRight(
                text,
                [
                    "+",
                    "-"
                ]
            );

        if (
            addition &&
            !(
                addition.operator === "-" &&
                addition.index === 0
            )
        ) {
            const left =
                this.evaluateExpression(
                    text.slice(
                        0,
                        addition.index
                    ),
                    lineNumber
                );

            const right =
                this.evaluateExpression(
                    text.slice(
                        addition.index + 1
                    ),
                    lineNumber
                );

            if (
                addition.operator === "+"
            ) {
                return left + right;
            }

            return left - right;
        }


        /*
        Multiplication / division / modulo.
        */

        const multiplication =
            this.findTopLevelOperatorFromRight(
                text,
                [
                    "*",
                    "/",
                    "%"
                ]
            );

        if (multiplication) {
            const left =
                this.evaluateExpression(
                    text.slice(
                        0,
                        multiplication.index
                    ),
                    lineNumber
                );

            const right =
                this.evaluateExpression(
                    text.slice(
                        multiplication.index + 1
                    ),
                    lineNumber
                );

            if (
                multiplication.operator === "*"
            ) {
                return left * right;
            }

            if (
                multiplication.operator === "/"
            ) {
                if (
                    Number(right) === 0
                ) {
                    throw new Error(
                        `Ligne ${lineNumber} : division par zéro.`
                    );
                }

                return left / right;
            }

            if (
                Number(right) === 0
            ) {
                throw new Error(
                    `Ligne ${lineNumber} : modulo par zéro.`
                );
            }

            return left % right;
        }


        /*
        Nombre négatif.
        */

        if (
            text.startsWith("-")
        ) {
            return -Number(
                this.evaluateExpression(
                    text.slice(1),
                    lineNumber
                )
            );
        }


        /*
        Nombres.
        */

        if (
            /^-?\d+(?:\.\d+)?$/
                .test(text)
        ) {
            return Number(text);
        }


        /*
        Booléens / None.
        */

        if (
            text === "True"
        ) {
            return true;
        }

        if (
            text === "False"
        ) {
            return false;
        }

        if (
            text === "None"
        ) {
            return null;
        }


        /*
        Chaînes.
        */

        if (
            (
                text.startsWith('"') &&
                text.endsWith('"')
            ) ||
            (
                text.startsWith("'") &&
                text.endsWith("'")
            )
        ) {
            return this.parseString(
                text,
                lineNumber
            );
        }


        /*
        Listes.
        */

        if (
            text.startsWith("[") &&
            text.endsWith("]")
        ) {
            const inside =
                text.slice(
                    1,
                    -1
                ).trim();

            if (!inside) {
                return [];
            }

            return this.splitArguments(
                inside
            ).map(
                item =>
                    this.evaluateExpression(
                        item,
                        lineNumber
                    )
            );
        }


        /*
        Indexation : liste[0]
        */

        const indexMatch =
            text.match(
                /^([A-Za-z_]\w*)\s*\[(.+)\]$/
            );

        if (indexMatch) {
            const variableName =
                indexMatch[1];

            if (
                !Object.prototype
                    .hasOwnProperty.call(
                        this.variables,
                        variableName
                    )
            ) {
                throw new Error(
                    `Ligne ${lineNumber} : variable "${variableName}" inconnue.`
                );
            }

            const collection =
                this.variables[
                    variableName
                ];

            const index =
                this.evaluateExpression(
                    indexMatch[2],
                    lineNumber
                );

            if (
                !Array.isArray(collection) &&
                typeof collection !==
                "string"
            ) {
                throw new Error(
                    `Ligne ${lineNumber} : "${variableName}" ne peut pas être indexé.`
                );
            }

            return collection[index];
        }


        /*
        Appel de fonction.
        */

        const call =
            this.parseFunctionCall(
                text
            );

        if (call) {
            const args =
                call.args.map(
                    argument =>
                        this.evaluateExpression(
                            argument,
                            lineNumber
                        )
                );

            switch (call.name) {
                case "range":
                    return this.makeRange(
                        args,
                        lineNumber
                    );

                case "len":
                    if (
                        args.length !== 1
                    ) {
                        throw new Error(
                            `Ligne ${lineNumber} : len() attend un argument.`
                        );
                    }

                    if (
                        !Array.isArray(args[0]) &&
                        typeof args[0] !==
                        "string"
                    ) {
                        throw new Error(
                            `Ligne ${lineNumber} : len() attend une liste ou un texte.`
                        );
                    }

                    return args[0].length;

                case "int":
                    if (
                        args.length !== 1
                    ) {
                        throw new Error(
                            `Ligne ${lineNumber} : int() attend un argument.`
                        );
                    }

                    return parseInt(
                        args[0],
                        10
                    );

                case "float":
                    if (
                        args.length !== 1
                    ) {
                        throw new Error(
                            `Ligne ${lineNumber} : float() attend un argument.`
                        );
                    }

                    return parseFloat(
                        args[0]
                    );

                case "str":
                    if (
                        args.length !== 1
                    ) {
                        throw new Error(
                            `Ligne ${lineNumber} : str() attend un argument.`
                        );
                    }

                    return this.pythonString(
                        args[0]
                    );

                default:
                    if (
                        this.functions[
                            call.name
                        ]
                    ) {
                        return this.callUserFunction(
                            call.name,
                            args,
                            lineNumber
                        );
                    }

                    throw new Error(
                        `Ligne ${lineNumber} : fonction "${call.name}" inconnue.`
                    );
            }
        }


        /*
        Variable.
        */

        if (
            /^[A-Za-z_]\w*$/
                .test(text)
        ) {
            if (
                Object.prototype
                    .hasOwnProperty.call(
                        this.variables,
                        text
                    )
            ) {
                return this.variables[
                    text
                ];
            }

            throw new Error(
                `Ligne ${lineNumber} : variable "${text}" inconnue.`
            );
        }


        throw new Error(
            `Ligne ${lineNumber} : expression non reconnue "${text}".`
        );
    }


    makeRange(
        args,
        lineNumber
    ) {
        if (
            args.length < 1 ||
            args.length > 3
        ) {
            throw new Error(
                `Ligne ${lineNumber} : range() attend entre 1 et 3 arguments.`
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
            !Number.isFinite(start) ||
            !Number.isFinite(stop) ||
            !Number.isFinite(step) ||
            step === 0
        ) {
            throw new Error(
                `Ligne ${lineNumber} : arguments invalides dans range().`
            );
        }


        const values = [];

        if (
            step > 0
        ) {
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
                values.push(value);

                if (
                    values.length >
                    this.maxIterations
                ) {
                    throw new Error(
                        `Ligne ${lineNumber} : range() est trop grand.`
                    );
                }
            }
        }

        return values;
    }


    parseString(
        text,
        lineNumber
    ) {
        try {
            if (
                text.startsWith('"')
            ) {
                return JSON.parse(
                    text
                );
            }

            const content =
                text.slice(
                    1,
                    -1
                );

            return content
                .replace(/\\'/g, "'")
                .replace(/\\\\/g, "\\")
                .replace(/\\n/g, "\n")
                .replace(/\\t/g, "\t");

        } catch {
            throw new Error(
                `Ligne ${lineNumber} : texte invalide.`
            );
        }
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


    /* =====================================================
       PARSING
    ===================================================== */

    parseFunctionCall(text) {
        const trimmed =
            String(text || "")
                .trim();

        const match =
            trimmed.match(
                /^([A-Za-z_]\w*)\s*\((.*)\)$/
            );

        if (!match) {
            return null;
        }

        const argsText =
            match[2].trim();

        return {
            name:
                match[1],

            args:
                argsText
                    ? this.splitArguments(
                        argsText
                    )
                    : []
        };
    }


    splitArguments(text) {
        const parts = [];

        let current = "";
        let depth = 0;
        let quote = null;
        let escaped = false;

        for (
            let i = 0;
            i < text.length;
            i++
        ) {
            const char =
                text[i];

            if (escaped) {
                current += char;
                escaped = false;
                continue;
            }

            if (
                char === "\\"
            ) {
                current += char;
                escaped = true;
                continue;
            }

            if (quote) {
                current += char;

                if (
                    char === quote
                ) {
                    quote = null;
                }

                continue;
            }

            if (
                char === '"' ||
                char === "'"
            ) {
                quote = char;
                current += char;
                continue;
            }

            if (
                char === "(" ||
                char === "[" ||
                char === "{"
            ) {
                depth++;
                current += char;
                continue;
            }

            if (
                char === ")" ||
                char === "]" ||
                char === "}"
            ) {
                depth--;
                current += char;
                continue;
            }

            if (
                char === "," &&
                depth === 0
            ) {
                parts.push(
                    current.trim()
                );

                current = "";
                continue;
            }

            current += char;
        }

        if (
            current.trim() ||
            text.trim()
        ) {
            parts.push(
                current.trim()
            );
        }

        return parts;
    }


    stripOuterParentheses(text) {
        let result =
            text.trim();

        while (
            result.startsWith("(") &&
            result.endsWith(")") &&
            this.outerParenthesesWrapAll(
                result
            )
        ) {
            result =
                result.slice(
                    1,
                    -1
                ).trim();
        }

        return result;
    }


    outerParenthesesWrapAll(text) {
        let depth = 0;
        let quote = null;

        for (
            let i = 0;
            i < text.length;
            i++
        ) {
            const char =
                text[i];

            if (quote) {
                if (
                    char === quote &&
                    text[i - 1] !== "\\"
                ) {
                    quote = null;
                }

                continue;
            }

            if (
                char === '"' ||
                char === "'"
            ) {
                quote = char;
                continue;
            }

            if (
                char === "("
            ) {
                depth++;
            }

            if (
                char === ")"
            ) {
                depth--;

                if (
                    depth === 0 &&
                    i <
                    text.length - 1
                ) {
                    return false;
                }
            }
        }

        return depth === 0;
    }


    splitTopLevelWord(
        text,
        word
    ) {
        const parts = [];

        let current = "";
        let depth = 0;
        let quote = null;

        let i = 0;

        while (
            i < text.length
        ) {
            const char =
                text[i];

            if (quote) {
                current += char;

                if (
                    char === quote &&
                    text[i - 1] !== "\\"
                ) {
                    quote = null;
                }

                i++;
                continue;
            }

            if (
                char === '"' ||
                char === "'"
            ) {
                quote = char;
                current += char;
                i++;
                continue;
            }

            if (
                char === "(" ||
                char === "["
            ) {
                depth++;
                current += char;
                i++;
                continue;
            }

            if (
                char === ")" ||
                char === "]"
            ) {
                depth--;
                current += char;
                i++;
                continue;
            }


            if (
                depth === 0 &&
                text.slice(
                    i,
                    i + word.length
                ) === word
            ) {
                const before =
                    text[i - 1];

                const after =
                    text[
                        i +
                        word.length
                    ];

                const validBefore =
                    !before ||
                    /\s/.test(before);

                const validAfter =
                    !after ||
                    /\s/.test(after);

                if (
                    validBefore &&
                    validAfter
                ) {
                    parts.push(
                        current.trim()
                    );

                    current = "";

                    i +=
                        word.length;

                    continue;
                }
            }

            current += char;
            i++;
        }


        if (
            parts.length > 0
        ) {
            parts.push(
                current.trim()
            );

            return parts;
        }

        return [text];
    }


    findTopLevelOperator(
        text,
        operators
    ) {
        let depth = 0;
        let quote = null;

        for (
            let i = 0;
            i < text.length;
            i++
        ) {
            const char =
                text[i];

            if (quote) {
                if (
                    char === quote &&
                    text[i - 1] !== "\\"
                ) {
                    quote = null;
                }

                continue;
            }

            if (
                char === '"' ||
                char === "'"
            ) {
                quote = char;
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
                    text.slice(
                        i,
                        i +
                        operator.length
                    ) === operator
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

            if (quote) {
                if (
                    char === quote &&
                    text[i - 1] !== "\\"
                ) {
                    quote = null;
                }

                continue;
            }

            if (
                char === '"' ||
                char === "'"
            ) {
                quote = char;
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
                operators.includes(
                    char
                )
            ) {
                if (
                    char === "-" &&
                    (
                        i === 0 ||
                        "+-*/%(,<>=!"
                            .includes(
                                text[i - 1]
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
        }

        return null;
    }
}


/* =========================================================
   APPLICATION PYT
========================================================= */

class PytApplication {

    constructor() {
        this.ui = null;

        this.robot = null;
        this.game = null;
        this.level = null;

        this.runner =
            new BrowserPythonRunner();

        this.currentChapter = 1;
        this.currentExercise = 1;

        this.running = false;

        this.musicEnabled = true;
        this.volume = 0.5;

        this.introFinished = false;
        this.introReady = false;
        this.introContinuing = false;

        this.introTimers = [];
    }


    /* =====================================================
       DÉMARRAGE
    ===================================================== */

    start() {
        this.ui =
            new PytUI();

        this.ui.actionDelay =
            500;

        this.connectUI();
        this.connectShell();
        this.loadAudioSettings();

        this.loadLevel(
            1,
            1,
            {
                showGame: false
            }
        );

        this.showIntro();
    }


    connectUI() {
        this.ui.onRunCode =
            code =>
                this.runStudentCode(
                    code
                );

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


    /* =====================================================
       ÉLÉMENTS GÉNÉRAUX
    ===================================================== */

    connectShell() {
        this.introScreen =
            document.getElementById(
                "intro-screen"
            );

        this.introScene =
            document.getElementById(
                "intro-scene"
            );

        this.introPyt =
            document.getElementById(
                "intro-pyt"
            );

        this.introContinueMessage =
            document.getElementById(
                "intro-continue-message"
            );

        this.skipIntroButton =
            document.getElementById(
                "skip-intro-button"
            );

        this.mainMenu =
            document.getElementById(
                "main-menu"
            );

        this.playButton =
            document.getElementById(
                "play-button"
            );

        this.settingsButton =
            document.getElementById(
                "settings-button"
            );

        this.settingsScreen =
            document.getElementById(
                "settings-screen"
            );

        this.settingsBackButton =
            document.getElementById(
                "settings-back-button"
            );

        this.creditsButton =
            document.getElementById(
                "credits-button"
            );

        this.creditsScreen =
            document.getElementById(
                "credits-screen"
            );

        this.closeCreditsButton =
            document.getElementById(
                "close-credits-button"
            );

        this.creditsScroll =
            document.getElementById(
                "credits-scroll"
            );

        this.gameSettingsButton =
            document.getElementById(
                "game-settings-button"
            );

        this.menuButton =
            document.getElementById(
                "menu-button"
            );

        this.musicEnabledInput =
            document.getElementById(
                "music-enabled"
            );

        this.volumeSlider =
            document.getElementById(
                "volume-slider"
            );

        this.volumeValue =
            document.getElementById(
                "volume-value"
            );

        this.musicAudio =
            document.getElementById(
                "music-audio"
            );

        this.theoryAudio =
            document.getElementById(
                "theory-audio"
            );


        this.playButton?.addEventListener(
            "click",
            () =>
                this.startGame()
        );


        this.settingsButton?.addEventListener(
            "click",
            () =>
                this.showSettings(
                    "menu"
                )
        );


        this.gameSettingsButton
            ?.addEventListener(
                "click",
                () =>
                    this.showSettings(
                        "game"
                    )
            );


        this.settingsBackButton
            ?.addEventListener(
                "click",
                () =>
                    this.leaveSettings()
            );


        this.creditsButton
            ?.addEventListener(
                "click",
                () =>
                    this.showCredits()
            );


        this.closeCreditsButton
            ?.addEventListener(
                "click",
                () =>
                    this.hideCredits()
            );


        this.menuButton?.addEventListener(
            "click",
            () =>
                this.showMainMenu()
        );


        /*
        Le bouton "Passer" est gardé dans le HTML
        pour compatibilité, mais l'introduction ne
        peut plus être passée avant la scène finale.
        */

        if (
            this.skipIntroButton
        ) {
            this.skipIntroButton.classList.add(
                "hidden"
            );

            this.skipIntroButton.setAttribute(
                "aria-hidden",
                "true"
            );

            this.skipIntroButton.tabIndex =
                -1;
        }


        this.musicEnabledInput
            ?.addEventListener(
                "change",
                () => {
                    this.musicEnabled =
                        Boolean(
                            this.musicEnabledInput
                                .checked
                        );

                    /*
                    Demande du projet :
                    Musique = Non -> volume = 0 %.
                    */
                    if (
                        !this.musicEnabled
                    ) {
                        this.setVolume(
                            0
                        );

                    } else if (
                        this.volume <= 0
                    ) {
                        this.setVolume(
                            0.5
                        );
                    }

                    this.applyAudioSettings();
                }
            );


        this.volumeSlider
            ?.addEventListener(
                "input",
                () => {
                    const value =
                        Number(
                            this.volumeSlider
                                .value
                        );

                    const maximum =
                        Number(
                            this.volumeSlider
                                .max
                        ) || 100;

                    this.setVolume(
                        value /
                        maximum
                    );

                    /*
                    Si l'utilisateur remonte le volume,
                    la musique repasse automatiquement
                    sur Oui.
                    */
                    if (
                        this.volume > 0
                    ) {
                        this.musicEnabled =
                            true;

                        if (
                            this.musicEnabledInput
                        ) {
                            this.musicEnabledInput.checked =
                                true;
                        }
                    }

                    this.applyAudioSettings();
                }
            );


        this.ui.courseButton
            ?.addEventListener(
                "click",
                () =>
                    this.playTheorySound()
            );


        document.addEventListener(
            "keydown",
            event =>
                this.handleIntroKey(
                    event
                )
        );


        this.introScreen?.addEventListener(
            "pointerdown",
            event =>
                this.handleIntroPointer(
                    event
                )
        );


        this.introScreen?.addEventListener(
            "touchstart",
            event =>
                this.handleIntroPointer(
                    event
                ),
            {
                passive: true
            }
        );
    }


    /* =====================================================
       INTRODUCTION
    ===================================================== */

    showIntro() {
        this.clearIntroTimers();

        this.introFinished =
            false;

        this.introReady =
            false;

        this.introContinuing =
            false;


        this.hideAllMainScreens();

        this.introScreen?.classList.remove(
            "hidden",
            "intro-ready",
            "intro-leaving"
        );


        this.introScene?.classList.remove(
            "intro-stage-1",
            "intro-stage-2",
            "intro-stage-3",
            "intro-stage-final"
        );


        this.introPyt?.classList.remove(
            "intro-pyt-arriving",
            "intro-pyt-hop-1",
            "intro-pyt-hop-2",
            "intro-pyt-hop-3",
            "intro-pyt-final"
        );


        if (
            this.introContinueMessage
        ) {
            this.introContinueMessage.textContent =
                this.isTouchDevice()
                    ? "Touchez l’écran pour continuer"
                    : "Appuyez sur une touche pour continuer";

            this.introContinueMessage.classList.add(
                "hidden"
            );
        }


        /*
        Animation plus lente :
        Pyt avance par petits bonds successifs.
        Le CSS gère le mouvement précis de chaque étape.
        */

        this.addIntroTimer(
            () => {
                this.introScene?.classList.add(
                    "intro-stage-1"
                );

                this.introPyt?.classList.add(
                    "intro-pyt-arriving"
                );
            },
            500
        );


        this.addIntroTimer(
            () => {
                this.introPyt?.classList.remove(
                    "intro-pyt-arriving"
                );

                this.introPyt?.classList.add(
                    "intro-pyt-hop-1"
                );
            },
            1700
        );


        this.addIntroTimer(
            () => {
                this.introScene?.classList.add(
                    "intro-stage-2"
                );

                this.introPyt?.classList.remove(
                    "intro-pyt-hop-1"
                );

                this.introPyt?.classList.add(
                    "intro-pyt-hop-2"
                );
            },
            3000
        );


        this.addIntroTimer(
            () => {
                this.introScene?.classList.add(
                    "intro-stage-3"
                );

                this.introPyt?.classList.remove(
                    "intro-pyt-hop-2"
                );

                this.introPyt?.classList.add(
                    "intro-pyt-hop-3"
                );
            },
            4300
        );


        this.addIntroTimer(
            () => {
                this.introScene?.classList.add(
                    "intro-stage-final"
                );

                this.introPyt?.classList.remove(
                    "intro-pyt-hop-3"
                );

                this.introPyt?.classList.add(
                    "intro-pyt-final"
                );
            },
            5600
        );


        /*
        L'intro s'arrête ici.
        Aucune navigation automatique.
        */

        this.addIntroTimer(
            () => {
                this.introReady =
                    true;

                this.introScreen?.classList.add(
                    "intro-ready"
                );

                this.introContinueMessage
                    ?.classList.remove(
                        "hidden"
                    );
            },
            6800
        );
    }


    addIntroTimer(
        callback,
        delay
    ) {
        const timer =
            window.setTimeout(
                callback,
                delay
            );

        this.introTimers.push(
            timer
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


    handleIntroKey(event) {
        if (
            this.introScreen
                ?.classList
                .contains("hidden")
        ) {
            return;
        }

        if (
            !this.introReady ||
            this.introContinuing
        ) {
            return;
        }


        /*
        Évite qu'une touche modificatrice seule
        déclenche l'introduction.
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

        event.preventDefault();

        this.continueAfterIntro();
    }


    handleIntroPointer(event) {
        if (
            this.introScreen
                ?.classList
                .contains("hidden")
        ) {
            return;
        }

        if (
            !this.introReady ||
            this.introContinuing
        ) {
            return;
        }

        if (
            event?.target?.closest?.(
                "button"
            )
        ) {
            return;
        }

        this.continueAfterIntro();
    }


    continueAfterIntro() {
        if (
            !this.introReady ||
            this.introContinuing
        ) {
            return;
        }

        this.introContinuing =
            true;

        this.introFinished =
            true;

        this.introContinueMessage
            ?.classList.add(
                "hidden"
            );

        this.introScreen?.classList.add(
            "intro-leaving"
        );


        window.setTimeout(
            () => {
                this.introScreen?.classList.add(
                    "hidden"
                );

                this.introScreen?.classList.remove(
                    "intro-leaving"
                );

                this.showMainMenu();
            },
            450
        );
    }


    isTouchDevice() {
        return (
            window.matchMedia(
                "(pointer: coarse)"
            ).matches ||
            "ontouchstart" in window
        );
    }


    /* =====================================================
       MENU
    ===================================================== */

    hideAllMainScreens() {
        this.mainMenu?.classList.add(
            "hidden"
        );

        this.settingsScreen?.classList.add(
            "hidden"
        );

        this.creditsScreen?.classList.add(
            "hidden"
        );

        this.ui?.gameInterface
            ?.classList.add(
                "hidden"
            );
    }


    showMainMenu() {
        this.hideAllMainScreens();

        this.mainMenu?.classList.remove(
            "hidden"
        );

        this.settingsReturnTarget =
            "menu";
    }


    startGame() {
        this.hideAllMainScreens();

        this.ui.gameInterface?.classList.remove(
            "hidden"
        );

        /*
        Au début du jeu on montre le cours
        du chapitre 1 si nécessaire.
        */

        this.ui.showCourseAtChapterStart();

        this.tryPlayMusic();
    }


    /* =====================================================
       PARAMÈTRES
    ===================================================== */

    showSettings(
        returnTarget = "menu"
    ) {
        this.settingsReturnTarget =
            returnTarget;

        this.mainMenu?.classList.add(
            "hidden"
        );

        this.ui?.gameInterface
            ?.classList.add(
                "hidden"
            );

        this.creditsScreen?.classList.add(
            "hidden"
        );

        this.settingsScreen?.classList.remove(
            "hidden"
        );

        this.refreshSettingsUI();
    }


    leaveSettings() {
        if (
            this.settingsReturnTarget ===
            "game"
        ) {
            this.settingsScreen?.classList.add(
                "hidden"
            );

            this.ui?.gameInterface
                ?.classList.remove(
                    "hidden"
                );

            this.ui?.showGame();

            return;
        }

        this.showMainMenu();
    }


    refreshSettingsUI() {
        if (
            this.musicEnabledInput
        ) {
            this.musicEnabledInput.checked =
                this.musicEnabled;
        }


        if (
            this.volumeSlider
        ) {
            const maximum =
                Number(
                    this.volumeSlider.max
                ) || 100;

            this.volumeSlider.value =
                String(
                    Math.round(
                        this.volume *
                        maximum
                    )
                );
        }


        if (
            this.volumeValue
        ) {
            this.volumeValue.textContent =
                `${Math.round(
                    this.volume * 100
                )}%`;
        }
    }


    /* =====================================================
       CRÉDITS
    ===================================================== */

    showCredits() {
        this.settingsScreen?.classList.add(
            "hidden"
        );

        this.creditsScreen?.classList.remove(
            "hidden",
            "credits-finished"
        );


        /*
        Relance l'animation du générique depuis
        le début à chaque ouverture.
        */

        if (
            this.creditsScroll
        ) {
            this.creditsScroll.classList.remove(
                "credits-running"
            );

            void this.creditsScroll.offsetWidth;

            this.creditsScroll.classList.add(
                "credits-running"
            );
        }


        /*
        La durée correspond au générique CSS.
        À la fin, PYT reste figé au centre.
        */

        window.clearTimeout(
            this.creditsFinishTimer
        );

        this.creditsFinishTimer =
            window.setTimeout(
                () => {
                    this.creditsScreen?.classList.add(
                        "credits-finished"
                    );
                },
                36000
            );
    }


    hideCredits() {
        window.clearTimeout(
            this.creditsFinishTimer
        );

        this.creditsFinishTimer =
            null;

        this.creditsScreen?.classList.add(
            "hidden"
        );

        this.creditsScreen?.classList.remove(
            "credits-finished"
        );

        this.creditsScroll?.classList.remove(
            "credits-running"
        );

        this.settingsScreen?.classList.remove(
            "hidden"
        );

        this.refreshSettingsUI();
    }


    /* =====================================================
       AUDIO
    ===================================================== */

    loadAudioSettings() {
        /*
        Les valeurs restent locales à la session.
        Aucun stockage externe n'est nécessaire.
        */

        this.musicEnabled =
            true;

        this.volume =
            0.5;

        this.applyAudioSettings();
    }


    setVolume(value) {
        const next =
            Number(value);

        if (
            !Number.isFinite(next)
        ) {
            return;
        }

        this.volume =
            Math.max(
                0,
                Math.min(
                    1,
                    next
                )
            );

        if (
            this.volume === 0
        ) {
            this.musicEnabled =
                false;

            if (
                this.musicEnabledInput
            ) {
                this.musicEnabledInput.checked =
                    false;
            }
        }

        this.refreshSettingsUI();
    }


    applyAudioSettings() {
        const effectiveVolume =
            this.musicEnabled
                ? this.volume
                : 0;


        if (
            this.musicAudio
        ) {
            this.musicAudio.volume =
                effectiveVolume;

            this.musicAudio.muted =
                !this.musicEnabled ||
                effectiveVolume <= 0;


            if (
                this.musicAudio.muted
            ) {
                this.musicAudio.pause();
            }
        }


        if (
            this.theoryAudio
        ) {
            this.theoryAudio.volume =
                effectiveVolume;

            this.theoryAudio.muted =
                !this.musicEnabled ||
                effectiveVolume <= 0;
        }


        this.refreshSettingsUI();
    }


    tryPlayMusic() {
        if (
            !this.musicAudio ||
            !this.musicEnabled ||
            this.volume <= 0
        ) {
            return;
        }

        const playPromise =
            this.musicAudio.play();

        if (
            playPromise &&
            typeof playPromise.catch ===
            "function"
        ) {
            playPromise.catch(
                () => {}
            );
        }
    }


    playTheorySound() {
        if (
            !this.theoryAudio ||
            !this.musicEnabled ||
            this.volume <= 0
        ) {
            return;
        }

        try {
            this.theoryAudio.currentTime =
                0;

            const promise =
                this.theoryAudio.play();

            promise?.catch?.(
                () => {}
            );

        } catch {
            /*
            L'absence d'un fichier audio ne doit
            jamais empêcher le jeu de fonctionner.
            */
        }
    }


    /* =====================================================
       NIVEAUX
    ===================================================== */

    getLevel(
        chapter,
        exercise
    ) {
        if (
            typeof window.getLevel ===
            "function"
        ) {
            return window.getLevel(
                chapter,
                exercise
            );
        }


        if (
            Array.isArray(
                window.LEVELS
            )
        ) {
            return window.LEVELS.find(
                level =>
                    Number(level.chapter) ===
                    Number(chapter) &&
                    Number(level.exercise) ===
                    Number(exercise)
            ) || null;
        }


        return null;
    }


    loadLevel(
        chapter,
        exercise,
        options = {}
    ) {
        const level =
            this.getLevel(
                chapter,
                exercise
            );

        if (!level) {
            console.error(
                `Niveau introuvable : ${chapter}-${exercise}`
            );

            return false;
        }


        this.currentChapter =
            Number(chapter);

        this.currentExercise =
            Number(exercise);

        this.level =
            level;

        this.robot =
            new Robot();

        this.game =
            new Game(
                level,
                this.robot
            );

        this.ui.setGame(
            this.game
        );

        this.ui.setLevel(
            level
        );


        if (
            options.showGame !== false
        ) {
            this.hideAllMainScreens();

            this.ui.gameInterface
                ?.classList.remove(
                    "hidden"
                );

            this.ui.showGame();

            this.ui.showGuide(
                level.hint ||
                level.instruction ||
                "Observe la mission et écris ton programme."
            );
        }


        return true;
    }


    restartCurrentLevel() {
        if (
            !this.level
        ) {
            return;
        }


        const currentCode =
            this.ui.codeEditor?.value ||
            this.level.starterCode ||
            "";


        this.robot =
            new Robot();

        this.game =
            new Game(
                this.level,
                this.robot
            );


        this.ui.setGame(
            this.game
        );


        /*
        On ne rappelle pas setLevel ici :
        cela évite d'effacer le code de l'élève
        lors d'un simple redémarrage.
        */

        if (
            this.ui.codeEditor
        ) {
            this.ui.codeEditor.value =
                currentCode;
        }


        this.ui.clearErrorHighlight();
        this.ui.hideThoughtBubble();

        this.ui.setStatus(
            ""
        );

        if (
            this.ui.consoleOutput
        ) {
            this.ui.consoleOutput.textContent =
                "";
        }

        this.ui.render();
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


        this.running =
            true;


        /*
        IMPORTANT :
        on réinitialise uniquement le moteur.
        On ne recharge PAS le niveau via setLevel(),
        sinon le contenu de l'éditeur serait remplacé
        par le starterCode au moment d'exécuter.
        */

        this.robot =
            new Robot();

        this.game =
            new Game(
                this.level,
                this.robot
            );

        this.ui.setGame(
            this.game
        );


        this.ui.clearErrorHighlight();
        this.ui.hideThoughtBubble();
        this.ui.hideGuide();

        this.ui.setStatus(
            "Exécution..."
        );


        if (
            this.ui.consoleOutput
        ) {
            this.ui.consoleOutput.textContent =
                "";
        }


        const result =
            this.runner.run(
                code
            );


        if (
            this.ui.consoleOutput &&
            result.output.length > 0
        ) {
            this.ui.consoleOutput.textContent =
                result.output.join(
                    "\n"
                );
        }


        const conceptValidation =
            this.validateRequiredConcepts(
                code,
                this.level.requiredConcepts ||
                []
            );


        /*
        Même si une erreur Python arrive après
        quelques instructions correctes, les actions
        déjà produites sont animées.
        */

        this.ui.playActions(
            result.actions,
            action =>
                this.performAction(
                    action
                ),
            blockedAction => {
                this.finishAttempt({
                    code,
                    runnerResult:
                        result,
                    conceptValidation,
                    blockedAction
                });
            }
        );
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
                return this.game
                    .moveForward();


            case "backward":
                return this.game
                    .moveBackward();


            case "right":
                return (
                    this.robot.rotateRight(
                        value ?? 90
                    ) !== false
                );


            case "left":
                return (
                    this.robot.rotateLeft(
                        value ?? 90
                    ) !== false
                );


            default:
                return false;
        }
    }


    finishAttempt({
        code,
        runnerResult,
        conceptValidation,
        blockedAction
    }) {
        this.running =
            false;

        this.ui.render();


        const levelId =
            this.level.id ||
            `${this.level.chapter}-${this.level.exercise}`;

        const attempt =
            this.ui.registerAttempt(
                levelId
            );


        /*
        1. Erreur Python.
        */

        if (
            !runnerResult.success
        ) {
            this.ui.setStatus(
                "Erreur dans le programme"
            );


            if (
                attempt >= 2 &&
                runnerResult.errorLine
            ) {
                this.ui.highlightErrorLine(
                    runnerResult.errorLine
                );
            }


            this.ui.showFailureGuide(
                runnerResult.error ||
                "Ton programme contient une erreur.",
                {
                    attempt,
                    type: "python_error",
                    line:
                        runnerResult.errorLine
                }
            );

            return;
        }


        /*
        2. Déplacement impossible.
        */

        if (blockedAction) {
            this.ui.setStatus(
                "Pyt est bloqué"
            );


            if (
                attempt >= 2 &&
                blockedAction.line
            ) {
                this.ui.highlightErrorLine(
                    blockedAction.line
                );
            }


            this.ui.showThoughtBubble(
                "Ce n’est pas là que je voulais aller..."
            );


            this.ui.showFailureGuide(
                this.game.message ||
                "Pyt ne peut pas effectuer ce déplacement.",
                {
                    attempt,
                    type: "blocked",
                    line:
                        blockedAction.line
                }
            );

            return;
        }


        /*
        3. Résultat du niveau.
        */

        if (
            !this.game.checkSuccess()
        ) {
            this.ui.setStatus(
                "Mission non terminée"
            );


            this.ui.showThoughtBubble(
                "Ce n’est pas là que je voulais aller..."
            );


            this.ui.showFailureGuide(
                this.getFailureMessage(),
                {
                    attempt,
                    type:
                        "semantic_failure"
                }
            );

            return;
        }


        /*
        4. Le résultat est correct mais une notion
        demandée par l'exercice n'a pas été utilisée.
        */

        if (
            !conceptValidation.success
        ) {
            this.ui.setStatus(
                "Presque !"
            );


            this.ui.showFailureGuide(
                conceptValidation.message,
                {
                    attempt,
                    type:
                        "missing_concept"
                }
            );

            return;
        }


        /*
        Succès.
        */

        this.ui.setStatus(
            "Mission réussie !"
        );

        this.ui.hideThoughtBubble();

        this.ui.completeCurrentLevel();
    }


    /* =====================================================
       FEEDBACK
    ===================================================== */

    getFailureMessage() {
        const objective =
            this.level?.objective;


        const containsObjective =
            type => {
                if (
                    typeof objective ===
                    "string"
                ) {
                    return (
                        objective === type ||
                        objective.includes(
                            type
                        )
                    );
                }


                if (
                    Array.isArray(objective)
                ) {
                    return objective.some(
                        item =>
                            typeof item ===
                            "string"
                                ? (
                                    item === type ||
                                    item.includes(
                                        type
                                    )
                                )
                                : (
                                    item?.type ===
                                    type
                                )
                    );
                }


                if (
                    objective &&
                    typeof objective ===
                    "object"
                ) {
                    if (
                        objective.type ===
                        type
                    ) {
                        return true;
                    }

                    const requirements =
                        objective.requirements ||
                        objective.objectives;

                    if (
                        Array.isArray(
                            requirements
                        )
                    ) {
                        return requirements.some(
                            item =>
                                typeof item ===
                                "string"
                                    ? (
                                        item === type ||
                                        item.includes(
                                            type
                                        )
                                    )
                                    : (
                                        item?.type ===
                                        type
                                    )
                        );
                    }
                }

                return false;
            };


        if (
            this.game.objects.size > 0 &&
            (
                containsObjective(
                    "collect"
                ) ||
                containsObjective(
                    "combined"
                )
            )
        ) {
            return "Il reste encore un objet à récupérer.";
        }


        if (
            this.game.dirt.size > 0 &&
            (
                containsObjective(
                    "clean"
                ) ||
                containsObjective(
                    "combined"
                )
            )
        ) {
            return "Il reste encore une zone à nettoyer.";
        }


        if (
            this.game.initialButtonCount > 0 &&
            this.game.activatedButtons.size <
            this.game.initialButtonCount
        ) {
            return "Tous les boutons n'ont pas encore été activés.";
        }


        if (
            containsObjective(
                "deposit"
            ) &&
            !this.game.checkDeposit()
        ) {
            return "Les objets doivent encore être déposés au bon endroit.";
        }


        if (
            containsObjective(
                "boxes"
            ) &&
            !this.game.checkBoxes()
        ) {
            return "Toutes les caisses ne sont pas encore sur leur emplacement.";
        }


        if (
            this.game.goal &&
            !this.game.checkReachGoal()
        ) {
            return "Pyt n'est pas encore arrivé à la bonne case.";
        }


        return "La mission n'est pas encore terminée. Observe le résultat et essaie à nouveau.";
    }


    /* =====================================================
       NOTIONS OBLIGATOIRES
    ===================================================== */

    validateRequiredConcepts(
        code,
        requiredConcepts
    ) {
        if (
            !Array.isArray(
                requiredConcepts
            ) ||
            requiredConcepts.length === 0
        ) {
            return {
                success: true,
                message: ""
            };
        }


        const source =
            String(code || "");


        const checks = {

            forward:
                /\bforward\s*\(/,

            backward:
                /\bbackward\s*\(/,

            left:
                /\bleft\s*\(/,

            right:
                /\bright\s*\(/,

            movement:
                /\b(?:forward|backward|left|right)\s*\(/,

            variable:
                /^\s*[A-Za-z_]\w*\s*=/m,

            variables:
                /^\s*[A-Za-z_]\w*\s*=/m,

            calculation:
                /[+\-*\/%]/,

            calculations:
                /[+\-*\/%]/,

            conversion:
                /\b(?:int|float|str)\s*\(/,

            conversions:
                /\b(?:int|float|str)\s*\(/,

            if:
                /^\s*if\s+.+:/m,

            condition:
                /^\s*(?:if|elif)\s+.+:/m,

            conditions:
                /^\s*(?:if|elif)\s+.+:/m,

            elif:
                /^\s*elif\s+.+:/m,

            else:
                /^\s*else\s*:/m,

            and:
                /\band\b/,

            or:
                /\bor\b/,

            not:
                /\bnot\b/,

            for:
                /^\s*for\s+.+\s+in\s+.+:/m,

            range:
                /\brange\s*\(/,

            while:
                /^\s*while\s+.+:/m,

            break:
                /^\s*break\s*$/m,

            list:
                /\[[^\]]*\]/,

            lists:
                /\[[^\]]*\]/,

            append:
                /\.append\s*\(/,

            function:
                /^\s*def\s+[A-Za-z_]\w*\s*\(/m,

            functions:
                /^\s*def\s+[A-Za-z_]\w*\s*\(/m,

            def:
                /^\s*def\s+[A-Za-z_]\w*\s*\(/m
        };


        const labels = {
            forward:
                "forward()",

            backward:
                "backward()",

            left:
                "left()",

            right:
                "right()",

            movement:
                "une instruction de déplacement",

            variable:
                "une variable",

            variables:
                "une variable",

            calculation:
                "un calcul",

            calculations:
                "un calcul",

            conversion:
                "une conversion",

            conversions:
                "une conversion",

            if:
                "if",

            condition:
                "une condition",

            conditions:
                "une condition",

            elif:
                "elif",

            else:
                "else",

            and:
                "and",

            or:
                "or",

            not:
                "not",

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

            lists:
                "une liste",

            append:
                "append()",

            function:
                "une fonction",

            functions:
                "une fonction",

            def:
                "def"
        };


        for (
            const concept
            of requiredConcepts
        ) {
            const normalized =
                String(concept)
                    .trim()
                    .toLowerCase();


            /*
            "revision" signifie simplement qu'on
            réutilise des notions précédentes.
            Aucun motif exact n'est imposé.
            */

            if (
                normalized ===
                "revision"
            ) {
                continue;
            }


            const pattern =
                checks[normalized];

            if (
                pattern &&
                !pattern.test(source)
            ) {
                return {
                    success: false,

                    message:
                        `La mission est correcte, mais essaie de la résoudre en utilisant ${labels[normalized] || concept}.`
                };
            }
        }


        return {
            success: true,
            message: ""
        };
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