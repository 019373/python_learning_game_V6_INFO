"use strict";

/*
============================================================
PYT - app.js
Version navigateur

Rôles :
- démarre l'application ;
- gère l'introduction ;
- gère le menu principal ;
- gère les paramètres ;
- gère la musique ;
- connecte UI / niveaux / robot / moteur ;
- exécute le sous-ensemble Python pédagogique ;
- conserve les actions valides avant une erreur ;
- anime les déplacements ;
- fournit des retours pédagogiques précis.
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

        this.reset();
    }


    // =====================================================
    // RESET
    // =====================================================

    reset() {

        this.actions = [];
        this.output = [];

        this.variables =
            Object.create(null);

        this.functions =
            Object.create(null);

        this.iterations = 0;
        this.functionCalls = 0;

        this.currentLine = null;
    }


    // =====================================================
    // EXÉCUTION
    // =====================================================

    run(code) {

        this.reset();

        try {

            this.checkForbiddenCode(
                code
            );


            const lines =
                this.prepareLines(
                    code
                );


            this.executeBlock(
                lines,
                0,
                0,
                lines.length
            );


            return {
                success: true,
                error: null,
                errorLine: null,
                output:
                    this.output.join("\n"),
                actions:
                    [...this.actions]
            };

        } catch (error) {

            return {
                success: false,

                error:
                    error instanceof Error
                        ? error.message
                        : String(error),

                errorLine:
                    error?.lineNumber
                    ??
                    this.currentLine
                    ??
                    null,

                output:
                    this.output.join("\n"),

                /*
                IMPORTANT :
                les actions valides déjà trouvées
                sont conservées.

                Ainsi, si l'élève écrit :

                forward(2)
                erreur()

                Pyt avance d'abord de 2 cases,
                puis l'erreur est affichée.
                */
                actions:
                    [...this.actions]
            };
        }
    }


    // =====================================================
    // ERREUR AVEC NUMÉRO DE LIGNE
    // =====================================================

    fail(
        message,
        lineNumber = null
    ) {

        const error =
            new Error(message);


        if (
            Number.isInteger(
                lineNumber
            )
        ) {

            error.lineNumber =
                lineNumber;
        }


        throw error;
    }


    // =====================================================
    // PRÉPARATION DES LIGNES
    // =====================================================

    prepareLines(code) {

        const rawLines =
            String(code ?? "")
                .replace(/\r/g, "")
                .replace(/\t/g, "    ")
                .split("\n");


        const lines = [];


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

                this.fail(
                    `Ligne ${index + 1} : utilise 4 espaces pour l'indentation.`,
                    index + 1
                );
            }


            lines.push({
                number:
                    index + 1,

                indent:
                    spaces,

                text:
                    withoutComment.trim()
            });
        }


        return lines;
    }


    removeComment(line) {

        let result = "";
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

                result += char;
                escaped = false;

                continue;
            }


            if (
                char === "\\"
                &&
                quote !== null
            ) {

                result += char;
                escaped = true;

                continue;
            }


            if (
                char === "'"
                ||
                char === "\""
            ) {

                if (
                    quote === null
                ) {

                    quote = char;

                } else if (
                    quote === char
                ) {

                    quote = null;
                }


                result += char;

                continue;
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
    // BLOC
    // =====================================================

    executeBlock(
        lines,
        startIndex,
        indent,
        endIndex = lines.length
    ) {

        let index =
            startIndex;


        while (
            index < endIndex
            &&
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

                this.fail(
                    `Ligne ${line.number} : indentation inattendue.`,
                    line.number
                );
            }


            this.currentLine =
                line.number;


            const text =
                line.text;


            // -----------------------------------------
            // IF
            // -----------------------------------------

            if (
                /^if\s+.+:$/.test(text)
            ) {

                const result =
                    this.executeIf(
                        lines,
                        index,
                        indent,
                        endIndex
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


            // -----------------------------------------
            // FOR
            // -----------------------------------------

            if (
                /^for\s+/.test(text)
                &&
                text.endsWith(":")
            ) {

                const result =
                    this.executeFor(
                        lines,
                        index,
                        indent,
                        endIndex
                    );


                if (
                    result.signal
                    === "return"
                ) {

                    return result;
                }


                index =
                    result.nextIndex;

                continue;
            }


            // -----------------------------------------
            // WHILE
            // -----------------------------------------

            if (
                /^while\s+/.test(text)
                &&
                text.endsWith(":")
            ) {

                const result =
                    this.executeWhile(
                        lines,
                        index,
                        indent,
                        endIndex
                    );


                if (
                    result.signal
                    === "return"
                ) {

                    return result;
                }


                index =
                    result.nextIndex;

                continue;
            }


            // -----------------------------------------
            // DEF
            // -----------------------------------------

            if (
                /^def\s+/.test(text)
                &&
                text.endsWith(":")
            ) {

                index =
                    this.registerFunction(
                        lines,
                        index,
                        indent,
                        endIndex
                    );

                continue;
            }


            // -----------------------------------------
            // ELIF / ELSE ISOLÉ
            // -----------------------------------------

            if (
                text === "else:"
                ||
                text.startsWith("elif ")
            ) {

                break;
            }


            // -----------------------------------------
            // BREAK
            // -----------------------------------------

            if (
                text === "break"
            ) {

                return {
                    nextIndex:
                        index + 1,

                    signal:
                        "break",

                    value:
                        null
                };
            }


            // -----------------------------------------
            // RETURN
            // -----------------------------------------

            if (
                text === "return"
                ||
                text.startsWith(
                    "return "
                )
            ) {

                const value =
                    text === "return"
                        ? null
                        : this.evaluateExpression(
                            text.slice(7),
                            line.number
                        );


                return {
                    nextIndex:
                        index + 1,

                    signal:
                        "return",

                    value
                };
            }


            // -----------------------------------------
            // PASS
            // -----------------------------------------

            if (
                text === "pass"
            ) {

                index++;
                continue;
            }


            // -----------------------------------------
            // INSTRUCTION SIMPLE
            // -----------------------------------------

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
                null,

            value:
                null
        };
    }


    // =====================================================
    // BLOC ENFANT
    // =====================================================

    findChildBlock(
        lines,
        parentIndex,
        parentIndent,
        maximumEnd = lines.length
    ) {

        const start =
            parentIndex + 1;


        if (
            start >= maximumEnd
            ||
            start >= lines.length
            ||
            lines[start].indent
            <= parentIndent
        ) {

            this.fail(
                `Ligne ${lines[parentIndex].number} : bloc indenté attendu.`,
                lines[parentIndex].number
            );
        }


        const childIndent =
            lines[start].indent;


        let end =
            start;


        while (
            end < maximumEnd
            &&
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
    // IF / ELIF / ELSE
    // =====================================================

    executeIf(
        lines,
        index,
        indent,
        maximumEnd
    ) {

        let cursor =
            index;

        let executed =
            false;


        while (
            cursor < maximumEnd
            &&
            cursor < lines.length
        ) {

            const line =
                lines[cursor];


            if (
                line.indent !== indent
            ) {
                break;
            }


            let condition;
            let isElse = false;


            if (
                line.text.startsWith(
                    "if "
                )
                &&
                line.text.endsWith(":")
            ) {

                condition =
                    line.text.slice(
                        3,
                        -1
                    );

            } else if (
                line.text.startsWith(
                    "elif "
                )
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

                isElse = true;

            } else {

                break;
            }


            const block =
                this.findChildBlock(
                    lines,
                    cursor,
                    indent,
                    maximumEnd
                );


            let shouldRun =
                false;


            if (!executed) {

                if (isElse) {

                    shouldRun =
                        true;

                } else {

                    shouldRun =
                        this.pythonTruthy(
                            this.evaluateExpression(
                                condition,
                                line.number
                            )
                        );
                }
            }


            if (shouldRun) {

                const result =
                    this.executeBlock(
                        lines,
                        block.start,
                        block.indent,
                        block.end
                    );


                executed =
                    true;


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
                cursor >= maximumEnd
                ||
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
                !next.text.startsWith(
                    "elif "
                )
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
                null,

            value:
                null
        };
    }


    // =====================================================
    // FOR
    // =====================================================

    executeFor(
        lines,
        index,
        indent,
        maximumEnd
    ) {

        const line =
            lines[index];


        const match =
            line.text.match(
                /^for\s+([A-Za-z_]\w*)\s+in\s+(.+):$/
            );


        if (!match) {

            this.fail(
                `Ligne ${line.number} : boucle for invalide.`,
                line.number
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
            !Array.isArray(
                iterable
            )
            &&
            typeof iterable !== "string"
        ) {

            this.fail(
                `Ligne ${line.number} : la boucle for attend range(...), une liste ou un texte.`,
                line.number
            );
        }


        const block =
            this.findChildBlock(
                lines,
                index,
                indent,
                maximumEnd
            );


        for (
            const value
            of iterable
        ) {

            this.countIteration(
                line.number
            );


            this.variables[
                variableName
            ] = value;


            const result =
                this.executeBlock(
                    lines,
                    block.start,
                    block.indent,
                    block.end
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

                return {
                    nextIndex:
                        block.end,

                    signal:
                        "return",

                    value:
                        result.value
                };
            }
        }


        return {
            nextIndex:
                block.end,

            signal:
                null,

            value:
                null
        };
    }


    // =====================================================
    // WHILE
    // =====================================================

    executeWhile(
        lines,
        index,
        indent,
        maximumEnd
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
                indent,
                maximumEnd
            );


        while (
            this.pythonTruthy(
                this.evaluateExpression(
                    condition,
                    line.number
                )
            )
        ) {

            this.countIteration(
                line.number
            );


            const result =
                this.executeBlock(
                    lines,
                    block.start,
                    block.indent,
                    block.end
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

                return {
                    nextIndex:
                        block.end,

                    signal:
                        "return",

                    value:
                        result.value
                };
            }
        }


        return {
            nextIndex:
                block.end,

            signal:
                null,

            value:
                null
        };
    }


    countIteration(lineNumber) {

        this.iterations++;


        if (
            this.iterations
            >
            this.maxIterations
        ) {

            this.fail(
                "Boucle arrêtée : trop d'itérations. Vérifie la condition de ta boucle.",
                lineNumber
            );
        }
    }


    // =====================================================
    // FONCTIONS
    // =====================================================

    registerFunction(
        lines,
        index,
        indent,
        maximumEnd
    ) {

        const line =
            lines[index];


        const match =
            line.text.match(
                /^def\s+([A-Za-z_]\w*)\s*\((.*?)\)\s*:$/
            );


        if (!match) {

            this.fail(
                `Ligne ${line.number} : définition de fonction invalide.`,
                line.number
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

                this.fail(
                    `Ligne ${line.number} : paramètre "${parameter}" invalide.`,
                    line.number
                );
            }
        }


        const block =
            this.findChildBlock(
                lines,
                index,
                indent,
                maximumEnd
            );


        this.functions[name] = {
            name,
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
        args,
        lineNumber
    ) {

        const func =
            this.functions[name];


        if (!func) {

            this.fail(
                `Ligne ${lineNumber} : fonction inconnue : ${name}().`,
                lineNumber
            );
        }


        if (
            args.length
            !==
            func.parameters.length
        ) {

            this.fail(
                `Ligne ${lineNumber} : ${name}() attend ${func.parameters.length} argument(s).`,
                lineNumber
            );
        }


        this.functionCalls++;


        if (
            this.functionCalls
            >
            this.maxFunctionCalls
        ) {

            this.fail(
                "Trop d'appels de fonctions.",
                lineNumber
            );
        }


        const previousVariables =
            this.variables;


        const localVariables =
            Object.assign(
                Object.create(
                    previousVariables
                ),
                {}
            );


        for (
            let i = 0;
            i < func.parameters.length;
            i++
        ) {

            localVariables[
                func.parameters[i]
            ] = args[i];
        }


        this.variables =
            localVariables;


        let result;


        try {

            result =
                this.executeBlock(
                    func.lines,
                    func.start,
                    func.indent,
                    func.end
                );

        } finally {

            this.variables =
                previousVariables;
        }


        return (
            result?.signal
            === "return"
                ? result.value
                : null
        );
    }


    // =====================================================
    // INSTRUCTIONS SIMPLES
    // =====================================================

    executeStatement(
        text,
        lineNumber
    ) {

        this.currentLine =
            lineNumber;


        // -----------------------------------------
        // += -= *= /= //= %=
        // -----------------------------------------

        const compound =
            text.match(
                /^([A-Za-z_]\w*)\s*(\+=|-=|\*=|\/=|\/\/=|%=)\s*(.+)$/
            );


        if (compound) {

            const name =
                compound[1];

            const operator =
                compound[2];


            if (
                !(name in this.variables)
            ) {

                this.fail(
                    `Ligne ${lineNumber} : variable inconnue "${name}".`,
                    lineNumber
                );
            }


            const right =
                this.evaluateExpression(
                    compound[3],
                    lineNumber
                );


            const left =
                this.variables[name];


            switch (operator) {

                case "+=":

                    this.variables[name] =
                        left + right;

                    break;


                case "-=":

                    this.variables[name] =
                        Number(left)
                        -
                        Number(right);

                    break;


                case "*=":

                    this.variables[name] =
                        Number(left)
                        *
                        Number(right);

                    break;


                case "/=":

                    if (
                        Number(right)
                        === 0
                    ) {

                        this.fail(
                            `Ligne ${lineNumber} : division par zéro.`,
                            lineNumber
                        );
                    }


                    this.variables[name] =
                        Number(left)
                        /
                        Number(right);

                    break;


                case "//=":

                    if (
                        Number(right)
                        === 0
                    ) {

                        this.fail(
                            `Ligne ${lineNumber} : division par zéro.`,
                            lineNumber
                        );
                    }


                    this.variables[name] =
                        Math.floor(
                            Number(left)
                            /
                            Number(right)
                        );

                    break;


                case "%=":

                    if (
                        Number(right)
                        === 0
                    ) {

                        this.fail(
                            `Ligne ${lineNumber} : division par zéro.`,
                            lineNumber
                        );
                    }


                    this.variables[name] =
                        Number(left)
                        %
                        Number(right);

                    break;
            }


            return;
        }


        // -----------------------------------------
        // APPEND
        // -----------------------------------------

        const appendMatch =
            text.match(
                /^([A-Za-z_]\w*)\.append\s*\((.*)\)$/
            );


        if (appendMatch) {

            const name =
                appendMatch[1];


            const list =
                this.variables[name];


            if (
                !Array.isArray(list)
            ) {

                this.fail(
                    `Ligne ${lineNumber} : append() s'utilise sur une liste.`,
                    lineNumber
                );
            }


            const value =
                this.evaluateExpression(
                    appendMatch[2],
                    lineNumber
                );


            list.push(value);

            return;
        }


        // -----------------------------------------
        // AFFECTATION INDEX
        // -----------------------------------------

        const indexAssignment =
            text.match(
                /^([A-Za-z_]\w*)\s*\[(.+)\]\s*=\s*(.+)$/
            );


        if (indexAssignment) {

            const name =
                indexAssignment[1];


            const container =
                this.variables[name];


            if (
                !Array.isArray(container)
            ) {

                this.fail(
                    `Ligne ${lineNumber} : "${name}" n'est pas une liste modifiable.`,
                    lineNumber
                );
            }


            let index =
                Number(
                    this.evaluateExpression(
                        indexAssignment[2],
                        lineNumber
                    )
                );


            if (
                !Number.isInteger(index)
            ) {

                this.fail(
                    `Ligne ${lineNumber} : l'index doit être un entier.`,
                    lineNumber
                );
            }


            if (
                index < 0
            ) {

                index =
                    container.length
                    +
                    index;
            }


            if (
                index < 0
                ||
                index >= container.length
            ) {

                this.fail(
                    `Ligne ${lineNumber} : index hors de la liste.`,
                    lineNumber
                );
            }


            container[index] =
                this.evaluateExpression(
                    indexAssignment[3],
                    lineNumber
                );


            return;
        }


        // -----------------------------------------
        // AFFECTATION SIMPLE
        // -----------------------------------------

        const assignment =
            text.match(
                /^([A-Za-z_]\w*)\s*=\s*(?!=)(.+)$/
            );


        if (assignment) {

            this.variables[
                assignment[1]
            ] =
                this.evaluateExpression(
                    assignment[2],
                    lineNumber
                );


            return;
        }


        // -----------------------------------------
        // APPEL
        // -----------------------------------------

        const call =
            this.parseCall(text);


        if (call) {

            const args =
                this.parseArguments(
                    call.arguments
                )
                .map(
                    argument =>
                        this.evaluateExpression(
                            argument,
                            lineNumber
                        )
                );


            this.executeCall(
                call.name,
                args,
                lineNumber
            );


            return;
        }


        this.fail(
            `Ligne ${lineNumber} : instruction non reconnue : ${text}`,
            lineNumber
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

        // -----------------------------------------
        // MOUVEMENT
        // -----------------------------------------

        if (
            name === "forward"
            ||
            name === "backward"
        ) {

            if (
                args.length !== 1
            ) {

                this.fail(
                    `Ligne ${lineNumber} : ${name}() attend une distance.`,
                    lineNumber
                );
            }


            const amount =
                Number(args[0]);


            if (
                !Number.isInteger(amount)
                ||
                amount < 0
            ) {

                this.fail(
                    `Ligne ${lineNumber} : ${name}() attend un entier positif.`,
                    lineNumber
                );
            }


            for (
                let i = 0;
                i < amount;
                i++
            ) {

                this.addAction(
                    name,
                    1,
                    lineNumber
                );
            }


            return null;
        }


        // -----------------------------------------
        // ROTATION
        // -----------------------------------------

        if (
            name === "right"
            ||
            name === "left"
        ) {

            if (
                args.length !== 1
            ) {

                this.fail(
                    `Ligne ${lineNumber} : ${name}() attend un angle.`,
                    lineNumber
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

                this.fail(
                    `Ligne ${lineNumber} : les rotations doivent utiliser un multiple positif de 90°.`,
                    lineNumber
                );
            }


            const turns =
                angle / 90;


            for (
                let i = 0;
                i < turns;
                i++
            ) {

                this.addAction(
                    name,
                    90,
                    lineNumber
                );
            }


            return null;
        }


        // -----------------------------------------
        // PRINT
        // -----------------------------------------

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


        // -----------------------------------------
        // FONCTION ÉLÈVE
        // -----------------------------------------

        if (
            this.functions[name]
        ) {

            return this.callFunction(
                name,
                args,
                lineNumber
            );
        }


        this.fail(
            `Ligne ${lineNumber} : fonction inconnue : ${name}().`,
            lineNumber
        );
    }


    addAction(
        type,
        value,
        lineNumber
    ) {

        if (
            this.actions.length
            >=
            this.maxActions
        ) {

            this.fail(
                "Programme arrêté : trop d'actions demandées.",
                lineNumber
            );
        }


        this.actions.push({
            type,
            value,
            line:
                lineNumber
        });
    }


    // =====================================================
    // EXPRESSIONS
    // =====================================================

    evaluateExpression(
        expression,
        lineNumber = null
    ) {

        const text =
            String(expression)
                .trim();


        if (
            text === ""
        ) {

            this.fail(
                `Ligne ${lineNumber} : expression vide.`,
                lineNumber
            );
        }


        return this.evaluateOr(
            text,
            lineNumber
        );
    }


    // -----------------------------------------------------
    // OR
    // -----------------------------------------------------

    evaluateOr(
        text,
        lineNumber
    ) {

        const parts =
            this.splitTopLevelWord(
                text,
                "or"
            );


        if (
            parts.length > 1
        ) {

            for (
                const part
                of parts
            ) {

                const value =
                    this.evaluateAnd(
                        part,
                        lineNumber
                    );


                if (
                    this.pythonTruthy(
                        value
                    )
                ) {

                    return true;
                }
            }


            return false;
        }


        return this.evaluateAnd(
            text,
            lineNumber
        );
    }


    // -----------------------------------------------------
    // AND
    // -----------------------------------------------------

    evaluateAnd(
        text,
        lineNumber
    ) {

        const parts =
            this.splitTopLevelWord(
                text,
                "and"
            );


        if (
            parts.length > 1
        ) {

            for (
                const part
                of parts
            ) {

                const value =
                    this.evaluateNot(
                        part,
                        lineNumber
                    );


                if (
                    !this.pythonTruthy(
                        value
                    )
                ) {

                    return false;
                }
            }


            return true;
        }


        return this.evaluateNot(
            text,
            lineNumber
        );
    }


    // -----------------------------------------------------
    // NOT
    // -----------------------------------------------------

    evaluateNot(
        text,
        lineNumber
    ) {

        const trimmed =
            text.trim();


        if (
            /^not\s+/.test(
                trimmed
            )
        ) {

            return !this.pythonTruthy(
                this.evaluateNot(
                    trimmed.replace(
                        /^not\s+/,
                        ""
                    ),
                    lineNumber
                )
            );
        }


        return this.evaluateComparison(
            trimmed,
            lineNumber
        );
    }


    // -----------------------------------------------------
    // COMPARAISONS
    // -----------------------------------------------------

    evaluateComparison(
        text,
        lineNumber
    ) {

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


        if (!comparison) {

            return this.evaluateAddSub(
                text,
                lineNumber
            );
        }


        const left =
            this.evaluateAddSub(
                comparison.left,
                lineNumber
            );


        const right =
            this.evaluateAddSub(
                comparison.right,
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

            default:
                return false;
        }
    }


    // -----------------------------------------------------
    // + -
    // -----------------------------------------------------

    evaluateAddSub(
        text,
        lineNumber
    ) {

        const operation =
            this.findTopLevelOperatorFromRight(
                text,
                [
                    "+",
                    "-"
                ]
            );


        if (!operation) {

            return this.evaluateMulDiv(
                text,
                lineNumber
            );
        }


        const left =
            this.evaluateAddSub(
                operation.left,
                lineNumber
            );


        const right =
            this.evaluateMulDiv(
                operation.right,
                lineNumber
            );


        if (
            operation.operator
            === "+"
        ) {

            if (
                Array.isArray(left)
                &&
                Array.isArray(right)
            ) {

                return [
                    ...left,
                    ...right
                ];
            }


            return left + right;
        }


        return (
            Number(left)
            -
            Number(right)
        );
    }


    // -----------------------------------------------------
    // * / // %
    // -----------------------------------------------------

    evaluateMulDiv(
        text,
        lineNumber
    ) {

        const operation =
            this.findTopLevelOperatorFromRight(
                text,
                [
                    "//",
                    "*",
                    "/",
                    "%"
                ]
            );


        if (!operation) {

            return this.evaluatePower(
                text,
                lineNumber
            );
        }


        const left =
            this.evaluateMulDiv(
                operation.left,
                lineNumber
            );


        const right =
            this.evaluatePower(
                operation.right,
                lineNumber
            );


        switch (
            operation.operator
        ) {

            case "*":

                return (
                    Number(left)
                    *
                    Number(right)
                );


            case "/":

                if (
                    Number(right)
                    === 0
                ) {

                    this.fail(
                        `Ligne ${lineNumber} : division par zéro.`,
                        lineNumber
                    );
                }


                return (
                    Number(left)
                    /
                    Number(right)
                );


            case "//":

                if (
                    Number(right)
                    === 0
                ) {

                    this.fail(
                        `Ligne ${lineNumber} : division par zéro.`,
                        lineNumber
                    );
                }


                return Math.floor(
                    Number(left)
                    /
                    Number(right)
                );


            case "%":

                if (
                    Number(right)
                    === 0
                ) {

                    this.fail(
                        `Ligne ${lineNumber} : division par zéro.`,
                        lineNumber
                    );
                }


                return (
                    Number(left)
                    %
                    Number(right)
                );
        }


        return null;
    }


    // -----------------------------------------------------
    // **
    // -----------------------------------------------------

    evaluatePower(
        text,
        lineNumber
    ) {

        const operation =
            this.findTopLevelOperator(
                text,
                ["**"]
            );


        if (!operation) {

            return this.evaluateUnary(
                text,
                lineNumber
            );
        }


        return Math.pow(
            Number(
                this.evaluateUnary(
                    operation.left,
                    lineNumber
                )
            ),

            Number(
                this.evaluatePower(
                    operation.right,
                    lineNumber
                )
            )
        );
    }


    // -----------------------------------------------------
    // UNARY
    // -----------------------------------------------------

    evaluateUnary(
        text,
        lineNumber
    ) {

        const trimmed =
            text.trim();


        if (
            trimmed.startsWith("+")
        ) {

            return Number(
                this.evaluateUnary(
                    trimmed.slice(1),
                    lineNumber
                )
            );
        }


        if (
            trimmed.startsWith("-")
        ) {

            return -Number(
                this.evaluateUnary(
                    trimmed.slice(1),
                    lineNumber
                )
            );
        }


        return this.evaluatePrimary(
            trimmed,
            lineNumber
        );
    }


    // -----------------------------------------------------
    // VALEURS
    // -----------------------------------------------------

    evaluatePrimary(
        text,
        lineNumber
    ) {

        let trimmed =
            text.trim();


        // Parenthèses externes.

        while (
            this.hasOuterParentheses(
                trimmed
            )
        ) {

            trimmed =
                trimmed
                    .slice(
                        1,
                        -1
                    )
                    .trim();
        }


        // Booléens / None.

        if (
            trimmed === "True"
        ) {
            return true;
        }


        if (
            trimmed === "False"
        ) {
            return false;
        }


        if (
            trimmed === "None"
        ) {
            return null;
        }


        // Nombre.

        if (
            /^-?(?:\d+(?:\.\d*)?|\.\d+)$/
                .test(trimmed)
        ) {

            return Number(
                trimmed
            );
        }


        // Texte.

        if (
            this.isStringLiteral(
                trimmed
            )
        ) {

            return this.parseStringLiteral(
                trimmed,
                lineNumber
            );
        }


        // Liste.

        if (
            trimmed.startsWith("[")
            &&
            trimmed.endsWith("]")
            &&
            this.isBalanced(
                trimmed
            )
        ) {

            const inside =
                trimmed
                    .slice(
                        1,
                        -1
                    )
                    .trim();


            if (
                inside === ""
            ) {
                return [];
            }


            return this.parseArguments(
                inside
            )
            .map(
                item =>
                    this.evaluateExpression(
                        item,
                        lineNumber
                    )
            );
        }


        // Index.

        const indexExpression =
            this.parseIndexExpression(
                trimmed
            );


        if (
            indexExpression
        ) {

            const container =
                this.evaluateExpression(
                    indexExpression.base,
                    lineNumber
                );


            let index =
                Number(
                    this.evaluateExpression(
                        indexExpression.index,
                        lineNumber
                    )
                );


            if (
                !Number.isInteger(index)
            ) {

                this.fail(
                    `Ligne ${lineNumber} : l'index doit être un entier.`,
                    lineNumber
                );
            }


            if (
                index < 0
            ) {

                index =
                    container.length
                    +
                    index;
            }


            if (
                container == null
                ||
                index < 0
                ||
                index >= container.length
            ) {

                this.fail(
                    `Ligne ${lineNumber} : index hors de la liste.`,
                    lineNumber
                );
            }


            return container[index];
        }


        // Appel.

        const call =
            this.parseCall(
                trimmed
            );


        if (call) {

            const args =
                this.parseArguments(
                    call.arguments
                )
                .map(
                    argument =>
                        this.evaluateExpression(
                            argument,
                            lineNumber
                        )
                );


            return this.evaluateCall(
                call.name,
                args,
                lineNumber
            );
        }


        // Variable.

        if (
            /^[A-Za-z_]\w*$/
                .test(trimmed)
        ) {

            if (
                trimmed in this.variables
            ) {

                return this.variables[
                    trimmed
                ];
            }


            this.fail(
                `Ligne ${lineNumber} : variable inconnue "${trimmed}".`,
                lineNumber
            );
        }


        this.fail(
            `Ligne ${lineNumber} : expression non reconnue : ${trimmed}`,
            lineNumber
        );
    }


    // =====================================================
    // APPELS DANS EXPRESSIONS
    // =====================================================

    evaluateCall(
        name,
        args,
        lineNumber
    ) {

        switch (name) {

            case "range":

                return this.pythonRange(
                    args,
                    lineNumber
                );


            case "len":

                if (
                    args.length !== 1
                ) {

                    this.fail(
                        `Ligne ${lineNumber} : len() attend un argument.`,
                        lineNumber
                    );
                }


                if (
                    typeof args[0]
                    !== "string"
                    &&
                    !Array.isArray(
                        args[0]
                    )
                ) {

                    this.fail(
                        `Ligne ${lineNumber} : len() attend une liste ou un texte.`,
                        lineNumber
                    );
                }


                return args[0].length;


            case "int":

                if (
                    args.length !== 1
                ) {

                    this.fail(
                        `Ligne ${lineNumber} : int() attend un argument.`,
                        lineNumber
                    );
                }


                if (
                    Number.isNaN(
                        Number(args[0])
                    )
                ) {

                    this.fail(
                        `Ligne ${lineNumber} : impossible de convertir cette valeur en entier.`,
                        lineNumber
                    );
                }


                return Math.trunc(
                    Number(args[0])
                );


            case "float":

                if (
                    args.length !== 1
                ) {

                    this.fail(
                        `Ligne ${lineNumber} : float() attend un argument.`,
                        lineNumber
                    );
                }


                if (
                    Number.isNaN(
                        Number(args[0])
                    )
                ) {

                    this.fail(
                        `Ligne ${lineNumber} : impossible de convertir cette valeur en nombre.`,
                        lineNumber
                    );
                }


                return Number(
                    args[0]
                );


            case "str":

                if (
                    args.length !== 1
                ) {

                    this.fail(
                        `Ligne ${lineNumber} : str() attend un argument.`,
                        lineNumber
                    );
                }


                return this.pythonString(
                    args[0]
                );


            case "bool":

                if (
                    args.length !== 1
                ) {

                    this.fail(
                        `Ligne ${lineNumber} : bool() attend un argument.`,
                        lineNumber
                    );
                }


                return this.pythonTruthy(
                    args[0]
                );


            case "abs":

                if (
                    args.length !== 1
                ) {

                    this.fail(
                        `Ligne ${lineNumber} : abs() attend un argument.`,
                        lineNumber
                    );
                }


                return Math.abs(
                    Number(args[0])
                );


            case "min":

                if (
                    args.length < 1
                ) {

                    this.fail(
                        `Ligne ${lineNumber} : min() attend au moins une valeur.`,
                        lineNumber
                    );
                }


                return Math.min(
                    ...args.map(Number)
                );


            case "max":

                if (
                    args.length < 1
                ) {

                    this.fail(
                        `Ligne ${lineNumber} : max() attend au moins une valeur.`,
                        lineNumber
                    );
                }


                return Math.max(
                    ...args.map(Number)
                );


            case "forward":
            case "backward":
            case "right":
            case "left":
            case "print":

                return this.executeCall(
                    name,
                    args,
                    lineNumber
                );


            default:

                if (
                    this.functions[name]
                ) {

                    return this.callFunction(
                        name,
                        args,
                        lineNumber
                    );
                }


                this.fail(
                    `Ligne ${lineNumber} : fonction inconnue : ${name}().`,
                    lineNumber
                );
        }
    }


    pythonRange(
        args,
        lineNumber
    ) {

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

            this.fail(
                `Ligne ${lineNumber} : range() attend 1, 2 ou 3 arguments.`,
                lineNumber
            );
        }


        if (
            !Number.isInteger(start)
            ||
            !Number.isInteger(stop)
            ||
            !Number.isInteger(step)
        ) {

            this.fail(
                `Ligne ${lineNumber} : range() attend des entiers.`,
                lineNumber
            );
        }


        if (
            step === 0
        ) {

            this.fail(
                `Ligne ${lineNumber} : le pas de range() ne peut pas être 0.`,
                lineNumber
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
                    result.length
                    >
                    this.maxIterations
                ) {

                    this.fail(
                        `Ligne ${lineNumber} : range() est trop grand.`,
                        lineNumber
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
                    result.length
                    >
                    this.maxIterations
                ) {

                    this.fail(
                        `Ligne ${lineNumber} : range() est trop grand.`,
                        lineNumber
                    );
                }
            }
        }


        return result;
    }


    // =====================================================
    // PARSING
    // =====================================================

    parseCall(text) {

        const trimmed =
            text.trim();


        const firstParenthesis =
            trimmed.indexOf("(");


        if (
            firstParenthesis <= 0
            ||
            !trimmed.endsWith(")")
        ) {

            return null;
        }


        const name =
            trimmed
                .slice(
                    0,
                    firstParenthesis
                )
                .trim();


        if (
            !/^[A-Za-z_]\w*$/
                .test(name)
        ) {

            return null;
        }


        const parentheses =
            trimmed.slice(
                firstParenthesis
            );


        if (
            !this.hasOuterParentheses(
                parentheses
            )
        ) {

            return null;
        }


        return {
            name,

            arguments:
                trimmed.slice(
                    firstParenthesis + 1,
                    -1
                )
        };
    }


    parseIndexExpression(text) {

        const trimmed =
            text.trim();


        if (
            !trimmed.endsWith("]")
        ) {
            return null;
        }


        let depth = 0;
        let quote = null;


        for (
            let i = trimmed.length - 1;
            i >= 0;
            i--
        ) {

            const char =
                trimmed[i];


            if (
                (
                    char === "'"
                    ||
                    char === "\""
                )
                &&
                trimmed[i - 1] !== "\\"
            ) {

                if (
                    quote === null
                ) {

                    quote = char;

                } else if (
                    quote === char
                ) {

                    quote = null;
                }

                continue;
            }


            if (
                quote !== null
            ) {
                continue;
            }


            if (
                char === "]"
            ) {

                depth++;
                continue;
            }


            if (
                char === "["
            ) {

                depth--;


                if (
                    depth === 0
                ) {

                    const base =
                        trimmed
                            .slice(
                                0,
                                i
                            )
                            .trim();


                    if (
                        base === ""
                    ) {
                        return null;
                    }


                    return {
                        base,

                        index:
                            trimmed
                                .slice(
                                    i + 1,
                                    -1
                                )
                    };
                }
            }
        }


        return null;
    }


    parseArguments(text) {

        const trimmed =
            String(text)
                .trim();


        if (
            trimmed === ""
        ) {
            return [];
        }


        return this.splitTopLevel(
            trimmed,
            ","
        );
    }


    splitTopLevel(
        text,
        separator
    ) {

        const result = [];

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
                &&
                quote !== null
            ) {

                current += char;
                escaped = true;

                continue;
            }


            if (
                char === "'"
                ||
                char === "\""
            ) {

                if (
                    quote === null
                ) {

                    quote = char;

                } else if (
                    quote === char
                ) {

                    quote = null;
                }


                current += char;

                continue;
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

                } else if (
                    char === ")"
                    ||
                    char === "]"
                ) {

                    depth--;
                }


                if (
                    depth === 0
                    &&
                    text.startsWith(
                        separator,
                        i
                    )
                ) {

                    result.push(
                        current.trim()
                    );


                    current = "";


                    i +=
                        separator.length
                        -
                        1;


                    continue;
                }
            }


            current += char;
        }


        if (
            current.trim()
            !== ""
        ) {

            result.push(
                current.trim()
            );
        }


        return result;
    }


    splitTopLevelWord(
        text,
        word
    ) {

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
                    char === "\""
                )
                &&
                text[i - 1] !== "\\"
            ) {

                if (
                    quote === null
                ) {

                    quote = char;

                } else if (
                    quote === char
                ) {

                    quote = null;
                }


                current += char;

                continue;
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

                } else if (
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
                        i + word.length
                    )
                    === word
                ) {

                    const before =
                        i === 0
                            ? " "
                            : text[i - 1];


                    const after =
                        i + word.length
                        >= text.length
                            ? " "
                            : text[
                                i
                                +
                                word.length
                            ];


                    if (
                        /\s/.test(before)
                        &&
                        /\s/.test(after)
                    ) {

                        result.push(
                            current.trim()
                        );


                        current = "";


                        i +=
                            word.length
                            -
                            1;


                        continue;
                    }
                }
            }


            current += char;
        }


        if (
            current.trim()
            !== ""
        ) {

            result.push(
                current.trim()
            );
        }


        return result;
    }


    findTopLevelOperator(
        text,
        operators
    ) {

        let depth = 0;
        let quote = null;


        const sorted =
            [...operators]
                .sort(
                    (a, b) =>
                        b.length
                        -
                        a.length
                );


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
                    char === "\""
                )
                &&
                text[i - 1] !== "\\"
            ) {

                if (
                    quote === null
                ) {

                    quote = char;

                } else if (
                    quote === char
                ) {

                    quote = null;
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
                ||
                char === "["
            ) {

                depth++;
                continue;
            }


            if (
                char === ")"
                ||
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
                of sorted
            ) {

                if (
                    text.startsWith(
                        operator,
                        i
                    )
                ) {

                    return {
                        left:
                            text
                                .slice(
                                    0,
                                    i
                                )
                                .trim(),

                        right:
                            text
                                .slice(
                                    i
                                    +
                                    operator.length
                                )
                                .trim(),

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


        const sorted =
            [...operators]
                .sort(
                    (a, b) =>
                        b.length
                        -
                        a.length
                );


        for (
            let i = text.length - 1;
            i >= 0;
            i--
        ) {

            const char =
                text[i];


            if (
                (
                    char === "'"
                    ||
                    char === "\""
                )
                &&
                text[i - 1] !== "\\"
            ) {

                if (
                    quote === null
                ) {

                    quote = char;

                } else if (
                    quote === char
                ) {

                    quote = null;
                }

                continue;
            }


            if (
                quote !== null
            ) {
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


            if (
                depth !== 0
            ) {
                continue;
            }


            for (
                const operator
                of sorted
            ) {

                const start =
                    i
                    -
                    operator.length
                    +
                    1;


                if (
                    start < 0
                ) {
                    continue;
                }


                if (
                    text.slice(
                        start,
                        i + 1
                    )
                    !== operator
                ) {

                    continue;
                }


                if (
                    operator === "-"
                    ||
                    operator === "+"
                ) {

                    const before =
                        text
                            .slice(
                                0,
                                start
                            )
                            .trimEnd();


                    if (
                        before === ""
                    ) {
                        continue;
                    }


                    const previous =
                        before[
                            before.length - 1
                        ];


                    if (
                        "+-*/%(,<>=!"
                            .includes(
                                previous
                            )
                    ) {

                        continue;
                    }
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


        return null;
    }


    hasOuterParentheses(text) {

        const trimmed =
            text.trim();


        if (
            !trimmed.startsWith("(")
            ||
            !trimmed.endsWith(")")
        ) {
            return false;
        }


        let depth = 0;
        let quote = null;


        for (
            let i = 0;
            i < trimmed.length;
            i++
        ) {

            const char =
                trimmed[i];


            if (
                (
                    char === "'"
                    ||
                    char === "\""
                )
                &&
                trimmed[i - 1] !== "\\"
            ) {

                if (
                    quote === null
                ) {

                    quote = char;

                } else if (
                    quote === char
                ) {

                    quote = null;
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
            }


            if (
                char === ")"
            ) {
                depth--;
            }


            if (
                depth === 0
                &&
                i
                <
                trimmed.length - 1
            ) {

                return false;
            }
        }


        return depth === 0;
    }


    isBalanced(text) {

        let depthRound = 0;
        let depthSquare = 0;
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
                    char === "\""
                )
                &&
                text[i - 1] !== "\\"
            ) {

                if (
                    quote === null
                ) {

                    quote = char;

                } else if (
                    quote === char
                ) {

                    quote = null;
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
                depthRound++;
            }


            if (
                char === ")"
            ) {
                depthRound--;
            }


            if (
                char === "["
            ) {
                depthSquare++;
            }


            if (
                char === "]"
            ) {
                depthSquare--;
            }


            if (
                depthRound < 0
                ||
                depthSquare < 0
            ) {

                return false;
            }
        }


        return (
            depthRound === 0
            &&
            depthSquare === 0
            &&
            quote === null
        );
    }


    isStringLiteral(text) {

        if (
            text.length < 2
        ) {
            return false;
        }


        return (
            (
                text.startsWith("\"")
                &&
                text.endsWith("\"")
            )
            ||
            (
                text.startsWith("'")
                &&
                text.endsWith("'")
            )
        );
    }


    parseStringLiteral(
        text,
        lineNumber
    ) {

        const quote =
            text[0];


        if (
            text[
                text.length - 1
            ]
            !== quote
        ) {

            this.fail(
                `Ligne ${lineNumber} : texte non terminé.`,
                lineNumber
            );
        }


        let value =
            text.slice(
                1,
                -1
            );


        value =
            value
                .replace(
                    /\\n/g,
                    "\n"
                )
                .replace(
                    /\\t/g,
                    "\t"
                )
                .replace(
                    /\\"/g,
                    "\""
                )
                .replace(
                    /\\'/g,
                    "'"
                )
                .replace(
                    /\\\\/g,
                    "\\"
                );


        return value;
    }


    // =====================================================
    // VALEURS PYTHON
    // =====================================================

    pythonTruthy(value) {

        if (
            value === false
            ||
            value === null
            ||
            value === 0
            ||
            value === ""
        ) {

            return false;
        }


        if (
            Array.isArray(value)
            &&
            value.length === 0
        ) {

            return false;
        }


        return true;
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
    // SÉCURITÉ
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
                pattern.test(
                    String(code)
                )
            ) {

                this.fail(
                    "Cette instruction Python n'est pas disponible dans PYT."
                );
            }
        }
    }
}


// =========================================================
// AUDIO
// =========================================================

class PytAudioManager {

    constructor() {

        this.enabled =
            true;

        this.volume =
            0.6;

        this.currentTrack =
            null;

        this.tracks =
            Object.create(null);


        this.loadSettings();
        this.findTracks();
        this.applySettings();
    }


    loadSettings() {

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

                this.enabled =
                    enabled !== "false";
            }


            if (
                volume !== null
            ) {

                const parsed =
                    Number(volume);


                if (
                    Number.isFinite(parsed)
                ) {

                    this.volume =
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

            console.warn(
                "Paramètres audio indisponibles.",
                error
            );
        }
    }


    findTracks() {

        this.tracks.intro =
            document.getElementById(
                "music-intro"
            );


        this.tracks.theory =
            document.getElementById(
                "music-theory"
            );


        for (
            let chapter = 1;
            chapter <= 9;
            chapter++
        ) {

            this.tracks[
                `chapter-${chapter}`
            ] =
                document.getElementById(
                    `music-chapter-${chapter}`
                );
        }


        /*
        Les fichiers audio sont optionnels.

        Si les <audio> du HTML n'ont pas de src,
        aucune erreur ne bloque le jeu.

        Si vous ajoutez plus tard les fichiers,
        les chemins suivants seront utilisés.
        */

        const defaultSources = {
            intro:
                "assets/audio/intro.mp3",

            theory:
                "assets/audio/theory.mp3",

            "chapter-1":
                "assets/audio/chapter1.mp3",

            "chapter-2":
                "assets/audio/chapter2.mp3",

            "chapter-3":
                "assets/audio/chapter3.mp3",

            "chapter-4":
                "assets/audio/chapter4.mp3",

            "chapter-5":
                "assets/audio/chapter5.mp3",

            "chapter-6":
                "assets/audio/chapter6.mp3",

            "chapter-7":
                "assets/audio/chapter7.mp3",

            "chapter-8":
                "assets/audio/chapter8.mp3",

            "chapter-9":
                "assets/audio/chapter9.mp3"
        };


        for (
            const [
                name,
                element
            ]
            of Object.entries(
                this.tracks
            )
        ) {

            if (!element) {
                continue;
            }


            element.loop =
                true;


            element.preload =
                "none";


            /*
            On n'impose PAS automatiquement
            un src inexistant.

            Si un src existe déjà dans index.html,
            il sera utilisé.

            Sinon le jeu reste parfaitement
            fonctionnel sans musique.
            */

            element.dataset.defaultSrc =
                defaultSources[name]
                ||
                "";
        }
    }


    applySettings() {

        for (
            const audio
            of Object.values(
                this.tracks
            )
        ) {

            if (!audio) {
                continue;
            }


            audio.volume =
                this.volume;


            audio.muted =
                !this.enabled;
        }
    }


    setEnabled(enabled) {

        this.enabled =
            Boolean(enabled);


        try {

            localStorage.setItem(
                "pyt-music-enabled",
                String(
                    this.enabled
                )
            );

        } catch (error) {

            console.warn(error);
        }


        this.applySettings();


        if (
            !this.enabled
        ) {

            this.pauseAll();

        } else if (
            this.currentTrack
        ) {

            this.play(
                this.currentTrack
            );
        }
    }


    setVolume(value) {

        const number =
            Number(value);


        this.volume =
            Math.max(
                0,
                Math.min(
                    1,
                    Number.isFinite(number)
                        ? number
                        : 0.6
                )
            );


        try {

            localStorage.setItem(
                "pyt-music-volume",
                String(
                    this.volume
                )
            );

        } catch (error) {

            console.warn(error);
        }


        this.applySettings();
    }


    pauseAll() {

        for (
            const audio
            of Object.values(
                this.tracks
            )
        ) {

            if (!audio) {
                continue;
            }


            try {

                audio.pause();

            } catch (error) {

                /*
                Une erreur audio ne doit
                jamais bloquer PYT.
                */
            }
        }
    }


    async play(name) {

        this.currentTrack =
            name;


        this.pauseAll();


        if (
            !this.enabled
        ) {
            return;
        }


        const audio =
            this.tracks[name];


        if (!audio) {
            return;
        }


        /*
        Pas de fichier ?
        On ne tente même pas de lecture.
        */

        if (
            !audio.getAttribute(
                "src"
            )
            &&
            !audio.querySelector(
                "source[src]"
            )
        ) {

            return;
        }


        try {

            audio.volume =
                this.volume;


            audio.muted =
                false;


            audio.currentTime =
                0;


            const promise =
                audio.play();


            if (
                promise
                &&
                typeof promise.catch
                === "function"
            ) {

                await promise.catch(
                    () => {}
                );
            }

        } catch (error) {

            /*
            Autoplay refusé ou fichier absent :
            le jeu continue normalement.
            */
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

        this.audio = null;

        this.introTimers = [];

        this.introFinished =
            false;

        this.gameStarted =
            false;

        this.settingsReturnTarget =
            "menu";

        this.pendingProgramError =
            null;

        this.lastActionFailure =
            null;
    }


    // =====================================================
    // START
    // =====================================================

    start() {

        this.checkDependencies();


        this.ui =
            new PytUI();


        /*
        Environ 0,5 seconde par action.
        */
        this.ui.actionDelay =
            500;


        this.audio =
            new PytAudioManager();


        this.connectUI();
        this.connectShell();
        this.wrapUINavigation();


        const loaded =
            this.loadLevel(
                1,
                1
            );


        if (!loaded) {
            return;
        }


        this.syncSettingsControls();


        this.showIntro();
        this.startIntro();
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
    // RACCOURCIS DOM
    // =====================================================

    element(id) {

        return document.getElementById(
            id
        );
    }


    hide(element) {

        element
            ?.classList
            .add("hidden");
    }


    show(element) {

        element
            ?.classList
            .remove("hidden");
    }


    // =====================================================
    // SHELL : INTRO / MENU / PARAMÈTRES
    // =====================================================

    connectShell() {

        const skipIntroButton =
            this.element(
                "skip-intro-button"
            );


        const playButton =
            this.element(
                "play-button"
            );


        const settingsButton =
            this.element(
                "settings-button"
            );


        const settingsBackButton =
            this.element(
                "settings-back-button"
            );


        const gameSettingsButton =
            this.element(
                "game-settings-button"
            );


        const menuButton =
            this.element(
                "menu-button"
            );


        const musicEnabled =
            this.element(
                "music-enabled"
            );


        const volumeSlider =
            this.element(
                "volume-slider"
            );


        skipIntroButton
            ?.addEventListener(
                "click",
                () => {

                    this.finishIntro();
                }
            );


        playButton
            ?.addEventListener(
                "click",
                () => {

                    this.startGame();
                }
            );


        settingsButton
            ?.addEventListener(
                "click",
                () => {

                    this.openSettings(
                        "menu"
                    );
                }
            );


        gameSettingsButton
            ?.addEventListener(
                "click",
                () => {

                    this.openSettings(
                        "game"
                    );
                }
            );


        settingsBackButton
            ?.addEventListener(
                "click",
                () => {

                    this.closeSettings();
                }
            );


        menuButton
            ?.addEventListener(
                "click",
                () => {

                    this.returnToMenu();
                }
            );


        musicEnabled
            ?.addEventListener(
                "change",
                event => {

                    this.audio
                        ?.setEnabled(
                            event.target.checked
                        );


                    this.syncSettingsControls();
                }
            );


        volumeSlider
            ?.addEventListener(
                "input",
                event => {

                    const value =
                        Number(
                            event.target.value
                        )
                        /
                        100;


                    this.audio
                        ?.setVolume(
                            value
                        );


                    this.syncSettingsControls();
                }
            );
    }


    syncSettingsControls() {

        const musicEnabled =
            this.element(
                "music-enabled"
            );


        const volumeSlider =
            this.element(
                "volume-slider"
            );


        const volumeValue =
            this.element(
                "volume-value"
            );


        if (
            musicEnabled
            &&
            this.audio
        ) {

            musicEnabled.checked =
                this.audio.enabled;
        }


        if (
            volumeSlider
            &&
            this.audio
        ) {

            volumeSlider.value =
                String(
                    Math.round(
                        this.audio.volume
                        *
                        100
                    )
                );
        }


        if (
            volumeValue
            &&
            this.audio
        ) {

            volumeValue.textContent =
                `${Math.round(
                    this.audio.volume
                    *
                    100
                )}%`;
        }
    }


    // =====================================================
    // INTRO
    // =====================================================

    showIntro() {

        this.hide(
            this.element(
                "main-menu"
            )
        );


        this.hide(
            this.element(
                "settings-screen"
            )
        );


        this.hide(
            this.element(
                "game-interface"
            )
        );


        this.show(
            this.element(
                "intro-screen"
            )
        );
    }


    startIntro() {

        const intro =
            this.element(
                "intro-screen"
            );


        if (!intro) {

            this.finishIntro();
            return;
        }


        this.clearIntroTimers();


        intro.classList.remove(
            "intro-arrive",
            "intro-y",
            "intro-happy",
            "intro-finished"
        );


        this.audio
            ?.play(
                "intro"
            );


        this.introTimers.push(

            setTimeout(
                () => {

                    intro.classList.add(
                        "intro-arrive"
                    );

                },
                350
            )
        );


        this.introTimers.push(

            setTimeout(
                () => {

                    intro.classList.add(
                        "intro-y"
                    );

                },
                1650
            )
        );


        this.introTimers.push(

            setTimeout(
                () => {

                    /*
                    La joie passe uniquement
                    par les yeux.
                    */
                    intro.classList.add(
                        "intro-happy"
                    );


                    intro.classList.add(
                        "intro-finished"
                    );

                },
                2400
            )
        );


        this.introTimers.push(

            setTimeout(
                () => {

                    this.finishIntro();

                },
                4100
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


        this.introFinished =
            true;


        this.clearIntroTimers();


        this.hide(
            this.element(
                "intro-screen"
            )
        );


        this.showMainMenu();
    }


    // =====================================================
    // MENU
    // =====================================================

    showMainMenu() {

        this.gameStarted =
            false;


        this.hide(
            this.element(
                "intro-screen"
            )
        );


        this.hide(
            this.element(
                "settings-screen"
            )
        );


        this.hide(
            this.element(
                "game-interface"
            )
        );


        this.show(
            this.element(
                "main-menu"
            )
        );


        this.audio
            ?.play(
                "intro"
            );
    }


    returnToMenu() {

        this.ui
            ?.stopAnimation();


        this.showMainMenu();
    }


    // =====================================================
    // PARAMÈTRES
    // =====================================================

    openSettings(
        returnTarget = "menu"
    ) {

        this.settingsReturnTarget =
            returnTarget;


        this.syncSettingsControls();


        this.hide(
            this.element(
                "intro-screen"
            )
        );


        this.hide(
            this.element(
                "main-menu"
            )
        );


        this.hide(
            this.element(
                "game-interface"
            )
        );


        this.show(
            this.element(
                "settings-screen"
            )
        );
    }


    closeSettings() {

        this.hide(
            this.element(
                "settings-screen"
            )
        );


        if (
            this.settingsReturnTarget
            === "game"
            &&
            this.gameStarted
        ) {

            this.show(
                this.element(
                    "game-interface"
                )
            );


            this.playChapterMusic();

            return;
        }


        this.showMainMenu();
    }


    // =====================================================
    // COMMENCER LE JEU
    // =====================================================

    startGame() {

        this.gameStarted =
            true;


        this.hide(
            this.element(
                "intro-screen"
            )
        );


        this.hide(
            this.element(
                "main-menu"
            )
        );


        this.hide(
            this.element(
                "settings-screen"
            )
        );


        this.show(
            this.element(
                "game-interface"
            )
        );


        const opened =
            this.ui
                .showCourseAtChapterStart(
                    this.currentChapter
                );


        if (!opened) {

            this.ui.showMap();
        }


        this.playChapterMusic();
    }


    // =====================================================
    // MUSIQUE SELON L'ÉCRAN
    // =====================================================

    playChapterMusic() {

        this.audio
            ?.play(
                `chapter-${this.currentChapter}`
            );
    }


    wrapUINavigation() {

        if (
            !this.ui
            ||
            this.ui.__pytNavigationWrapped
        ) {

            return;
        }


        this.ui.__pytNavigationWrapped =
            true;


        const originalShowCourse =
            this.ui.showCourse
                .bind(this.ui);


        const originalShowMap =
            this.ui.showMap
                .bind(this.ui);


        const originalShowGame =
            this.ui.showGame
                .bind(this.ui);


        this.ui.showCourse =
            (...args) => {

                const result =
                    originalShowCourse(
                        ...args
                    );


                this.audio
                    ?.play(
                        "theory"
                    );


                return result;
            };


        this.ui.showMap =
            (...args) => {

                const result =
                    originalShowMap(
                        ...args
                    );


                this.playChapterMusic();


                return result;
            };


        this.ui.showGame =
            (...args) => {

                const result =
                    originalShowGame(
                        ...args
                    );


                this.playChapterMusic();


                return result;
            };
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


                    this.ui.showGuide?.(
                        this.getExerciseGuideMessage()
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
    // CHARGER NIVEAU
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

            this.ui
                ?.showMessage(
                    "Niveau introuvable",
                    "Impossible de charger cet exercice."
                );


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
        this.ui.hideThought?.();
        this.ui.clearCodeErrorHighlight?.();

        this.ui.drawWorld();


        return true;
    }


    getExerciseGuideMessage() {

        if (
            this.currentChapter === 1
            &&
            this.currentExercise === 1
        ) {

            return (
                "Commence par observer la pièce. "
                +
                "Écris les déplacements de Pyt avec forward(), right() et left(). "
                +
                "Clique ensuite sur EXÉCUTER."
            );
        }


        return (
            "Observe la mission, écris ton programme puis lance-le. "
            +
            "Il peut exister plusieurs solutions correctes."
        );
    }


    // =====================================================
    // RESTART
    // =====================================================

    restartLevel() {

        if (
            !this.game
        ) {
            return;
        }


        this.ui.stopAnimation();


        this.game.reset();


        this.ui.clearConsole();
        this.ui.hideThought?.();
        this.ui.clearCodeErrorHighlight?.();

        this.ui.drawWorld();


        this.ui.setStatus(
            "Niveau recommencé."
        );


        this.ui.showGuide?.(
            "Niveau recommencé. Ton code est toujours là : tu peux le modifier et réessayer."
        );
    }


    // =====================================================
    // EXÉCUTION CODE ÉLÈVE
    // =====================================================

    async runStudentCode(code) {

        if (
            !this.game
        ) {
            return;
        }


        this.ui.stopAnimation();


        /*
        Chaque tentative repart du début.
        Le code reste dans l'éditeur.
        */

        this.game.reset();


        this.ui.hideThought?.();
        this.ui.clearCodeErrorHighlight?.();

        this.ui.drawWorld();


        this.ui.setConsole(
            "Analyse du programme..."
        );


        this.ui.setStatus(
            "Pyt lit ton programme..."
        );


        this.pendingProgramError =
            null;


        this.lastActionFailure =
            null;


        let result;


        try {

            result =
                this.runner.run(
                    code
                );

        } catch (error) {

            result = {
                success: false,

                error:
                    error instanceof Error
                        ? error.message
                        : String(error),

                errorLine:
                    null,

                output:
                    "",

                actions:
                    []
            };
        }


        const actions =
            Array.isArray(
                result?.actions
            )
                ? result.actions
                : [];


        /*
        Si le programme contient une erreur,
        on la garde en attente.

        Les actions valides écrites AVANT
        cette erreur sont jouées d'abord.
        */

        if (
            !result
            ||
            result.success === false
        ) {

            this.pendingProgramError = {
                message:
                    result?.error
                    ||
                    "Programme invalide.",

                line:
                    result?.errorLine
                    ??
                    null
            };
        }


        // -----------------------------------------
        // CONSOLE PRINT
        // -----------------------------------------

        if (
            result?.output
        ) {

            this.ui.setConsole(
                result.output
            );

        } else if (
            !this.pendingProgramError
        ) {

            this.ui.setConsole(
                "Programme accepté."
            );
        }


        // -----------------------------------------
        // AUCUNE ACTION
        // -----------------------------------------

        if (
            actions.length === 0
        ) {

            if (
                this.pendingProgramError
            ) {

                this.finishProgramError();

                return;
            }


            this.finishAttempt();

            return;
        }


        // -----------------------------------------
        // ANIMATION
        // -----------------------------------------

        this.ui.setStatus(
            "Pyt exécute ton programme..."
        );


        await new Promise(
            resolve => {

                this.ui.playActions(
                    actions,

                    action =>
                        this.performAction(
                            action
                        ),

                    (
                        completed,
                        failureDetails
                    ) => {

                        /*
                        Collision ou déplacement
                        impossible.
                        */

                        if (
                            !completed
                            &&
                            failureDetails
                            &&
                            failureDetails.reason
                            === "blocked"
                        ) {

                            const action =
                                failureDetails.action;


                            this.lastActionFailure = {
                                message:
                                    this.getBlockedActionMessage(
                                        action
                                    ),

                                line:
                                    action?.line
                                    ??
                                    null
                            };
                        }


                        resolve();
                    }
                );
            }
        );


        // -----------------------------------------
        // COLLISION AVANT ERREUR PYTHON
        // -----------------------------------------

        if (
            this.lastActionFailure
        ) {

            this.finishBlockedAction();

            return;
        }


        // -----------------------------------------
        // ERREUR PYTHON APRÈS ACTIONS VALIDES
        // -----------------------------------------

        if (
            this.pendingProgramError
        ) {

            this.finishProgramError();

            return;
        }


        this.finishAttempt();
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

                    return (
                        this.game
                            .moveForward()
                        !== false
                    );


                case "backward":

                    return (
                        this.game
                            .moveBackward()
                        !== false
                    );


                case "right":

                    this.robot
                        .rotateRight(
                            Number(value)
                            ||
                            90
                        );


                    return true;


                case "left":

                    this.robot
                        .rotateLeft(
                            Number(value)
                            ||
                            90
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


    getBlockedActionMessage(action) {

        const type =
            action?.type
            ||
            action?.action
            ||
            action?.[0]
            ||
            "";


        if (
            type === "forward"
        ) {

            return (
                "Je ne peux pas avancer ici : "
                +
                "quelque chose bloque mon chemin."
            );
        }


        if (
            type === "backward"
        ) {

            return (
                "Je ne peux pas reculer ici : "
                +
                "quelque chose bloque mon chemin."
            );
        }


        return (
            "Je ne peux pas effectuer cette action ici."
        );
    }


    // =====================================================
    // ERREUR TECHNIQUE
    // =====================================================

    finishProgramError() {

        const error =
            this.pendingProgramError;


        if (!error) {
            return;
        }


        this.appendConsole(
            `✗ ${error.message}`
        );


        this.ui.setStatus(
            "Corrige ton programme puis réessaie."
        );


        this.ui.handleFailedAttempt({
            message:
                error.message,

            line:
                error.line,

            technical:
                true
        });


        this.pendingProgramError =
            null;
    }


    // =====================================================
    // ACTION BLOQUÉE
    // =====================================================

    finishBlockedAction() {

        const failure =
            this.lastActionFailure;


        if (!failure) {
            return;
        }


        this.appendConsole(
            `✗ ${failure.message}`
        );


        this.ui.setStatus(
            "Le déplacement est bloqué."
        );


        /*
        Une collision est liée à une action
        précise : à partir de la deuxième
        tentative ui.js pourra souligner
        cette ligne.
        */

        this.ui.handleFailedAttempt({
            message:
                failure.message,

            line:
                failure.line,

            technical:
                true
        });


        this.lastActionFailure =
            null;
    }


    // =====================================================
    // FIN DE TENTATIVE
    // =====================================================

    finishAttempt() {

        if (
            !this.game
        ) {
            return;
        }


        this.ui.drawWorld();


        let success =
            false;


        try {

            success =
                Boolean(
                    this.game
                        .checkSuccess()
                );

        } catch (error) {

            console.error(error);
        }


        if (success) {

            this.appendConsole(
                "✓ Mission réussie !"
            );


            this.ui.setStatus(
                "Mission réussie !"
            );


            this.ui.hideThought?.();
            this.ui.clearCodeErrorHighlight?.();


            this.ui
                .completeCurrentLevel();


            return;
        }


        const feedback =
            this.getFailureFeedback();


        this.appendConsole(
            "✗ "
            +
            feedback.message
        );


        this.ui.setStatus(
            "Essaie encore."
        );


        if (
            feedback.thought
        ) {

            this.ui.showThought?.(
                feedback.thought
            );
        }


        /*
        Une mission non réussie n'implique
        PAS automatiquement qu'une ligne
        de Python est fausse.

        Donc pas de faux soulignement rouge.
        */

        this.ui.handleFailedAttempt({
            message:
                feedback.message,

            line:
                null,

            technical:
                false
        });
    }


    // =====================================================
    // DIAGNOSTIC DE MISSION
    // =====================================================

    getFailureFeedback() {

        const game =
            this.game;


        const level =
            this.level;


        if (
            !game
            ||
            !level
        ) {

            return {
                message:
                    "La mission n'est pas encore terminée.",

                thought:
                    null
            };
        }


        // -----------------------------------------
        // OBJETS NON RAMASSÉS
        // -----------------------------------------

        if (
            game.objects
            &&
            typeof game.objects.size
            === "number"
            &&
            game.objects.size > 0
        ) {

            return {
                message:
                    "Il reste encore un objet à récupérer.",

                thought:
                    "J'ai oublié quelque chose..."
            };
        }


        // -----------------------------------------
        // SALETÉ
        // -----------------------------------------

        if (
            game.dirt
            &&
            typeof game.dirt.size
            === "number"
            &&
            game.dirt.size > 0
        ) {

            return {
                message:
                    "Il reste encore une case à nettoyer.",

                thought:
                    "La pièce n'est pas encore propre..."
            };
        }


        // -----------------------------------------
        // BOUTONS
        // -----------------------------------------

        if (
            game.buttons
            &&
            game.buttons instanceof Map
        ) {

            const inactive =
                [...game.buttons.values()]
                    .some(
                        button =>
                            button
                            &&
                            typeof button
                            === "object"
                            &&
                            button.active
                            === false
                    );


            if (inactive) {

                return {
                    message:
                        "Tous les mécanismes ne sont pas encore activés.",

                    thought:
                        "Il reste un mécanisme à activer..."
                };
            }
        }


        // -----------------------------------------
        // INVENTAIRE
        // -----------------------------------------

        const inventory =
            this.robot?.inventory;


        const objectiveType =
            typeof level.objective
            === "string"
                ? level.objective
                : level.objective?.type;


        if (
            objectiveType === "deposit"
            &&
            Array.isArray(inventory)
            &&
            inventory.length > 0
        ) {

            return {
                message:
                    "J'ai récupéré l'objet, mais je ne l'ai pas encore déposé au bon endroit.",

                thought:
                    "Je dois encore déposer ce que je transporte..."
            };
        }


        // -----------------------------------------
        // OBJECTIF POSITION
        // -----------------------------------------

        const goal =
            level.goal;


        if (
            Array.isArray(goal)
            &&
            goal.length >= 2
        ) {

            const robotRow =
                Number(
                    this.robot?.row
                    ??
                    this.robot?.position?.row
                );


            const robotCol =
                Number(
                    this.robot?.col
                    ??
                    this.robot?.position?.col
                );


            if (
                robotRow !== Number(goal[0])
                ||
                robotCol !== Number(goal[1])
            ) {

                return {
                    message:
                        "Le programme s'est terminé, mais Pyt n'est pas arrivé à la bonne destination.",

                    thought:
                        "Ce n’est pas là que je voulais aller..."
                };
            }
        }


        // -----------------------------------------
        // MESSAGE MOTEUR
        // -----------------------------------------

        if (
            typeof game.message
            === "string"
            &&
            game.message.trim()
            !== ""
        ) {

            return {
                message:
                    game.message,

                thought:
                    null
            };
        }


        // -----------------------------------------
        // GÉNÉRIQUE
        // -----------------------------------------

        return {
            message:
                "La mission n'est pas encore terminée. Observe ce que Pyt a fait et compare avec l'objectif.",

            thought:
                "Il me manque encore quelque chose..."
        };
    }


    // =====================================================
    // CONSOLE
    // =====================================================

    appendConsole(text) {

        if (
            !this.ui
            ||
            !this.ui.consoleOutput
        ) {
            return;
        }


        const current =
            this.ui.consoleOutput
                .textContent
                .trim();


        if (
            !current
            ||
            current === "Prêt."
            ||
            current === "Programme accepté."
            ||
            current === "Analyse du programme..."
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
// DÉMARRAGE
// =========================================================

function startPytApplication() {

    try {

        const app =
            new PytApplication();


        app.start();


        /*
        Accessible depuis la console navigateur
        pour faciliter les tests.
        */

        window.pytApp =
            app;


        window.runPythonCode =
            async function(code) {

                return app.runStudentCode(
                    code
                );
            };


    } catch (error) {

        console.error(
            "Impossible de démarrer PYT :",
            error
        );


        const message =
            document.createElement(
                "div"
            );


        message.style.position =
            "fixed";

        message.style.inset =
            "20px";

        message.style.zIndex =
            "99999";

        message.style.padding =
            "24px";

        message.style.background =
            "#171329";

        message.style.color =
            "#ffffff";

        message.style.fontFamily =
            "monospace";

        message.style.whiteSpace =
            "pre-wrap";

        message.style.overflow =
            "auto";


        message.textContent =
            "PYT n'a pas pu démarrer.\n\n"
            +
            (
                error instanceof Error
                    ? error.message
                    : String(error)
            );


        document.body.appendChild(
            message
        );
    }
}


// =========================================================
// EXPOSITION GLOBALE
// =========================================================

window.BrowserPythonRunner =
    BrowserPythonRunner;


window.PytAudioManager =
    PytAudioManager;


window.PytApplication =
    PytApplication;


// =========================================================
// LANCEMENT AUTOMATIQUE
// =========================================================

if (
    document.readyState
    === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startPytApplication,
        {
            once: true
        }
    );

} else {

    startPytApplication();
}