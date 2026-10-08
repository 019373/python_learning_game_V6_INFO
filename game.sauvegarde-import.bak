
"use strict";

/* =========================================================
   PYT - GAME.JS
   Moteur principal, interpréteur Python simplifié et rendu.

   - 1 case = 500 ms
   - Interactions automatiques
   - Les actions valides restent exécutées en cas d'erreur
   - Compatible avec ui.js et app.js
   - Aucun changement dans art.js
========================================================= */

class PytReturnSignal {
    constructor(value) {
        this.value = value;
    }
}

class PytBreakSignal {}

/* =========================================================
   VARIABLES ET PORTÉE
========================================================= */

class PytScope {
    constructor(parent = null) {
        this.parent = parent;
        this.values = Object.create(null);
    }

    hasLocal(name) {
        return Object.prototype.hasOwnProperty.call(
            this.values,
            name
        );
    }

    has(name) {
        return this.hasLocal(name) ||
            Boolean(this.parent && this.parent.has(name));
    }

    get(name) {
        if (this.hasLocal(name)) {
            return this.values[name];
        }

        if (this.parent) {
            return this.parent.get(name);
        }

        throw new Error(`Nom inconnu : ${name}`);
    }

    set(name, value) {
        this.values[name] = value;
        return value;
    }

    assign(name, value) {
        if (this.hasLocal(name) || !this.parent) {
            return this.set(name, value);
        }

        if (this.parent.has(name)) {
            return this.parent.assign(name, value);
        }

        return this.set(name, value);
    }
}

/* =========================================================
   ANALYSE DES NOTIONS PYTHON
========================================================= */

class PytCodeAnalyzer {
    static analyze(source) {
        const code = String(source || "");

        return {
            forward: /\b(?:forward|avancer)\s*\(/.test(code),
            backward: /\b(?:backward|reculer)\s*\(/.test(code),
            left: /\b(?:left|tourner_gauche)\s*\(/.test(code),
            right: /\b(?:right|tourner_droite)\s*\(/.test(code),
            variable: /^[ \t]*[a-z_]\w*\s*=(?!=)/im.test(code),
            condition: /^[ \t]*(?:if|elif)\b/m.test(code),
            for: /^[ \t]*for\b/m.test(code),
            range: /\brange\s*\(/.test(code),
            while: /^[ \t]*while\b/m.test(code),
            list: /\[[\s\S]*?\]/.test(code),
            dictionary: /\{[\s\S]*?:[\s\S]*?\}/.test(code),
            function: /^[ \t]*def\b/m.test(code),
            return: /^[ \t]*return\b/m.test(code)
        };
    }

    static normalizeConcept(concept) {
        const key = String(concept || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();

        const aliases = {
            variables: "variable",
            conditions: "condition",
            if: "condition",
            elif: "condition",
            else: "condition",
            boucle_for: "for",
            for_loop: "for",
            boucle_while: "while",
            while_loop: "while",
            listes: "list",
            liste: "list",
            dictionnaires: "dictionary",
            dictionnaire: "dictionary",
            dict: "dictionary",
            fonctions: "function",
            fonction: "function",
            functions: "function",
            def: "function",
            retour: "return",
            avancer: "forward",
            reculer: "backward",
            gauche: "left",
            droite: "right"
        };

        return aliases[key] || key;
    }

    static missingConcepts(source, required) {
        if (!Array.isArray(required)) {
            return [];
        }

        const found = this.analyze(source);

        return required
            .map(x => this.normalizeConcept(x))
            .filter(x => x && !found[x]);
    }
}

/* =========================================================
   PARSEUR D'EXPRESSIONS PYTHON
========================================================= */

class PytExpressionParser {
    constructor(source, scope, interpreter) {
        this.source = String(source || "");
        this.scope = scope;
        this.interpreter = interpreter;
        this.tokens = this.tokenize(this.source);
        this.position = 0;
    }

    tokenize(source) {
        const tokens = [];
        let i = 0;

        while (i < source.length) {
            const ch = source[i];

            if (/\s/.test(ch)) {
                i++;
                continue;
            }

            if (ch === "'" || ch === '"') {
                const quote = ch;
                let value = "";
                let closed = false;

                i++;

                while (i < source.length) {
                    const current = source[i++];

                    if (current === quote) {
                        closed = true;
                        break;
                    }

                    if (
                        current === "\\" &&
                        i < source.length
                    ) {
                        const escaped = source[i++];

                        value += ({
                            n: "\n",
                            t: "\t",
                            r: "\r"
                        })[escaped] ?? escaped;
                    } else {
                        value += current;
                    }
                }

                if (!closed) {
                    throw new Error(
                        "Chaîne de caractères non terminée."
                    );
                }

                tokens.push({
                    type: "string",
                    value
                });

                continue;
            }

            const number =
                /^(?:\d+(?:\.\d*)?|\.\d+)/
                    .exec(source.slice(i));

            if (number) {
                tokens.push({
                    type: "number",
                    value: Number(number[0])
                });

                i += number[0].length;
                continue;
            }

            const identifier =
                /^[a-zA-Z_]\w*/
                    .exec(source.slice(i));

            if (identifier) {
                tokens.push({
                    type: "id",
                    value: identifier[0]
                });

                i += identifier[0].length;
                continue;
            }

            const operator = [
                "**=",
                "//=",
                "==",
                "!=",
                "<=",
                ">=",
                "//",
                "**",
                "+=",
                "-=",
                "*=",
                "/=",
                "%="
            ].find(x => source.startsWith(x, i));

            if (operator) {
                tokens.push({
                    type: "operator",
                    value: operator
                });

                i += operator.length;
                continue;
            }

            if ("+-*/%<>()[]{}:,.".includes(ch)) {
                tokens.push({
                    type: "operator",
                    value: ch
                });

                i++;
                continue;
            }

            throw new Error(
                `Caractère inconnu : ${ch}`
            );
        }

        tokens.push({
            type: "end",
            value: null
        });

        return tokens;
    }

    current() {
        return this.tokens[this.position];
    }

    next() {
        return this.tokens[this.position++];
    }

    match(value) {
        if (this.current().value !== value) {
            return false;
        }

        this.position++;
        return true;
    }

    expect(value) {
        if (!this.match(value)) {
            throw new Error(
                `« ${value} » attendu.`
            );
        }
    }

    parse() {
        const result = this.parseOr();

        if (this.current().type !== "end") {
            throw new Error(
                "Expression incorrecte."
            );
        }

        return result;
    }

    truth(value) {
        return this.interpreter.truth(value);
    }

    parseOr() {
        let left = this.parseAnd();

        while (this.match("or")) {
            const right = this.parseAnd();

            left = this.truth(left)
                ? left
                : right;
        }

        return left;
    }

    parseAnd() {
        let left = this.parseNot();

        while (this.match("and")) {
            const right = this.parseNot();

            left = this.truth(left)
                ? right
                : left;
        }

        return left;
    }

    parseNot() {
        if (this.match("not")) {
            return !this.truth(
                this.parseNot()
            );
        }

        return this.parseComparison();
    }

    contains(container, value) {
        if (
            typeof container === "string" ||
            Array.isArray(container)
        ) {
            return container.includes(value);
        }

        if (
            container &&
            typeof container === "object"
        ) {
            return Object.prototype
                .hasOwnProperty
                .call(container, value);
        }

        return false;
    }

    parseComparison() {
        let left = this.parseAdd();

        while (true) {
            let op = this.current().value;

            if (
                op === "not" &&
                this.tokens[this.position + 1]?.value === "in"
            ) {
                op = "not in";
                this.position += 2;
            } else if (
                [
                    "in",
                    "==",
                    "!=",
                    "<",
                    ">",
                    "<=",
                    ">="
                ].includes(op)
            ) {
                this.position++;
            } else {
                break;
            }

            const right = this.parseAdd();

            switch (op) {
                case "in":
                    left = this.contains(right, left);
                    break;

                case "not in":
                    left = !this.contains(right, left);
                    break;

                case "==":
                    left = left === right;
                    break;

                case "!=":
                    left = left !== right;
                    break;

                case "<":
                    left = left < right;
                    break;

                case ">":
                    left = left > right;
                    break;

                case "<=":
                    left = left <= right;
                    break;

                case ">=":
                    left = left >= right;
                    break;
            }
        }

        return left;
    }

    parseAdd() {
        let left = this.parseMultiply();

        while (
            ["+", "-"].includes(
                this.current().value
            )
        ) {
            const op = this.next().value;
            const right = this.parseMultiply();

            left = op === "+"
                ? left + right
                : left - right;
        }

        return left;
    }

    parseMultiply() {
        let left = this.parseUnary();

        while (
            ["*", "/", "//", "%"].includes(
                this.current().value
            )
        ) {
            const op = this.next().value;
            const right = this.parseUnary();

            if (
                (op === "/" || op === "//" || op === "%") &&
                right === 0
            ) {
                throw new Error(
                    "Division par zéro."
                );
            }

            if (op === "*") {
                left *= right;
            }

            if (op === "/") {
                left /= right;
            }

            if (op === "//") {
                left = Math.floor(left / right);
            }

            if (op === "%") {
                left = ((left % right) + right) % right;
            }
        }

        return left;
    }

    parseUnary() {
        if (this.match("-")) {
            return -Number(
                this.parseUnary()
            );
        }

        if (this.match("+")) {
            return Number(
                this.parseUnary()
            );
        }

        let result = this.parsePostfix();

        if (this.match("**")) {
            result **= this.parseUnary();
        }

        return result;
    }

    parsePostfix() {
        let value = this.parsePrimary();

        while (true) {
            if (this.match("(")) {
                const args = [];

                if (!this.match(")")) {
                    do {
                        args.push(
                            this.parseOr()
                        );
                    } while (this.match(","));

                    this.expect(")");
                }

                value = this.interpreter.callValue(
                    value,
                    args
                );
            } else if (this.match("[")) {
                const key = this.parseOr();

                this.expect("]");

                if (value == null) {
                    throw new Error(
                        "Index sur une valeur vide."
                    );
                }

                const index =
                    typeof key === "number" &&
                    key < 0 &&
                    (
                        Array.isArray(value) ||
                        typeof value === "string"
                    )
                        ? value.length + key
                        : key;

                value = value[index];
            } else if (this.match(".")) {
                const name = this.next();

                if (
                    !name ||
                    name.type !== "id"
                ) {
                    throw new Error(
                        "Nom de méthode attendu."
                    );
                }

                const receiver = value;

                const methods = {
                    append: item => {
                        if (!Array.isArray(receiver)) {
                            throw new Error(
                                "append() demande une liste."
                            );
                        }

                        receiver.push(item);
                        return null;
                    },

                    pop: () => {
                        if (!Array.isArray(receiver)) {
                            throw new Error(
                                "pop() demande une liste."
                            );
                        }

                        return receiver.pop();
                    },

                    count: item =>
                        Array.isArray(receiver)
                            ? receiver.filter(
                                x => x === item
                            ).length
                            : 0
                };

                if (!(name.value in methods)) {
                    throw new Error(
                        `Méthode inconnue : ${name.value}`
                    );
                }

                value = methods[name.value];
            } else {
                break;
            }
        }

        return value;
    }

    parsePrimary() {
        const token = this.next();

        if (!token) {
            throw new Error(
                "Expression incomplète."
            );
        }

        if (
            token.type === "number" ||
            token.type === "string"
        ) {
            return token.value;
        }

        if (token.type === "id") {
            if (token.value === "True") {
                return true;
            }

            if (token.value === "False") {
                return false;
            }

            if (token.value === "None") {
                return null;
            }

            return this.scope.get(
                token.value
            );
        }

        if (token.value === "(") {
            const result = this.parseOr();

            this.expect(")");
            return result;
        }

        if (token.value === "[") {
            const result = [];

            if (!this.match("]")) {
                do {
                    result.push(
                        this.parseOr()
                    );
                } while (this.match(","));

                this.expect("]");
            }

            return result;
        }

        if (token.value === "{") {
            const result = Object.create(null);

            if (!this.match("}")) {
                do {
                    const key = this.parseOr();

                    this.expect(":");

                    result[String(key)] =
                        this.parseOr();
                } while (this.match(","));

                this.expect("}");
            }

            return result;
        }

        throw new Error(
            "Expression incomplète."
        );
    }
}

/* =========================================================
   INTERPRÉTEUR PYTHON SIMPLIFIÉ
========================================================= */

class PytInterpreter {
    constructor(game, source) {
        this.game = game;
        this.source = String(source || "");
        this.scope = new PytScope();

        this.currentLine = 0;
        this.iterations = 0;
        this.calls = 0;

        this.installBuiltins();
    }

    truth(value) {
        if (Array.isArray(value)) {
            return value.length > 0;
        }

        if (
            value &&
            typeof value === "object"
        ) {
            return Object.keys(value).length > 0;
        }

        return Boolean(value);
    }

    installBuiltins() {
        const bind = (name, fn) =>
            this.scope.set(name, fn);

        bind(
            "forward",
            n => this.game.apiForward(n)
        );

        bind(
            "backward",
            n => this.game.apiBackward(n)
        );

        bind(
            "left",
            n => this.game.apiLeft(n)
        );

        bind(
            "right",
            n => this.game.apiRight(n)
        );

        bind(
            "avancer",
            n => this.game.apiForward(n)
        );

        bind(
            "reculer",
            n => this.game.apiBackward(n)
        );

        bind(
            "tourner_gauche",
            n => this.game.apiLeft(n)
        );

        bind(
            "tourner_droite",
            n => this.game.apiRight(n)
        );

        bind(
            "setheading",
            n => this.game.apiSetHeading(n)
        );

        bind(
            "goto",
            (x, y) => this.game.apiGoto(x, y)
        );

        bind(
            "front_is_clear",
            () => this.game.frontIsClear()
        );

        bind(
            "devant_libre",
            () => this.game.frontIsClear()
        );

        bind(
            "on_object",
            () => this.game.robotOnObject()
        );

        bind(
            "sur_objet",
            () => this.game.robotOnObject()
        );

        bind(
            "xcor",
            () => this.game.robot.x
        );

        bind(
            "ycor",
            () => this.game.robot.y
        );

        bind(
            "position_x",
            () => this.game.robot.x
        );

        bind(
            "position_y",
            () => this.game.robot.y
        );

        bind(
            "direction",
            () => this.game.robot.direction
        );

        bind(
            "inventory_contains",
            item => this.game.inventoryContains(item)
        );

        bind(
            "inventaire_contient",
            item => this.game.inventoryContains(item)
        );

        bind("print", (...items) => {
            this.game.programOutput.push(
                items
                    .map(x => this.pythonString(x))
                    .join(" ")
            );

            return null;
        });

        bind(
            "len",
            value =>
                value == null
                    ? 0
                    : (
                        value.length ??
                        Object.keys(value).length
                    )
        );

        bind(
            "int",
            value => parseInt(value, 10)
        );

        bind(
            "float",
            value => Number(value)
        );

        bind(
            "str",
            value => this.pythonString(value)
        );

        bind(
            "round",
            (value, digits = 0) => {
                const n = 10 ** Number(digits);

                return Math.round(value * n) / n;
            }
        );

        bind(
            "min",
            (...args) =>
                Math.min(
                    ...(
                        args.length === 1 &&
                        Array.isArray(args[0])
                            ? args[0]
                            : args
                    )
                )
        );

        bind(
            "max",
            (...args) =>
                Math.max(
                    ...(
                        args.length === 1 &&
                        Array.isArray(args[0])
                            ? args[0]
                            : args
                    )
                )
        );

        bind(
            "abs",
            value => Math.abs(Number(value))
        );

        bind(
            "sum",
            items => items.reduce(
                (a, b) => a + b,
                0
            )
        );

        bind(
            "range",
            (start, end, step = 1) => {
                if (end === undefined) {
                    end = start;
                    start = 0;
                }

                start = Number(start);
                end = Number(end);
                step = Number(step);

                if (
                    ![start, end, step].every(
                        Number.isFinite
                    ) ||
                    step === 0
                ) {
                    throw new Error(
                        "range() invalide."
                    );
                }

                const result = [];

                for (
                    let i = start;
                    step > 0 ? i < end : i > end;
                    i += step
                ) {
                    if (result.length >= 2000) {
                        throw new Error(
                            "range() est trop grand."
                        );
                    }

                    result.push(i);
                }

                return result;
            }
        );
    }

    pythonString(value) {
        if (value === true) {
            return "True";
        }

        if (value === false) {
            return "False";
        }

        if (value == null) {
            return "None";
        }

        if (Array.isArray(value)) {
            return `[${value
                .map(x => this.pythonString(x))
                .join(", ")}]`;
        }

        if (typeof value === "object") {
            return JSON.stringify(value);
        }

        return String(value);
    }

    stripComment(line) {
        let quote = null;
        let escaped = false;

        for (let i = 0; i < line.length; i++) {
            const ch = line[i];

            if (escaped) {
                escaped = false;
                continue;
            }

            if (ch === "\\") {
                escaped = true;
                continue;
            }

            if (quote) {
                if (ch === quote) {
                    quote = null;
                }

                continue;
            }

            if (ch === "'" || ch === '"') {
                quote = ch;
                continue;
            }

            if (ch === "#") {
                return line.slice(0, i);
            }
        }

        return line;
    }

    bracketDepth(text) {
        let depth = 0;
        let quote = null;
        let escaped = false;

        for (const ch of text) {
            if (escaped) {
                escaped = false;
                continue;
            }

            if (ch === "\\") {
                escaped = true;
                continue;
            }

            if (quote) {
                if (ch === quote) {
                    quote = null;
                }

                continue;
            }

            if (ch === "'" || ch === '"') {
                quote = ch;
                continue;
            }

            if ("([{ ".includes(ch) && ch !== " ") {
                depth++;
            }

            if (")] }".includes(ch) && ch !== " ") {
                depth--;
            }
        }

        return depth;
    }

    prepareLines() {
        const raw = this.source
            .replace(/\r\n?/g, "\n")
            .split("\n");

        const lines = [];

        let buffer = "";
        let firstLine = 0;
        let indent = 0;

        raw.forEach((line, index) => {
            const clean = this.stripComment(line);
            const content = clean.trim();

            if (!content && !buffer) {
                return;
            }

            if (!buffer) {
                firstLine = index + 1;

                indent = clean
                    .match(/^[ \t]*/)[0]
                    .replace(/\t/g, "    ")
                    .length;
            }

            buffer += (
                buffer ? " " : ""
            ) + content;

            if (this.bracketDepth(buffer) > 0) {
                return;
            }

            if (this.bracketDepth(buffer) < 0) {
                throw new Error(
                    `Parenthèses incorrectes à la ligne ${firstLine}.`
                );
            }

            if (buffer.trim()) {
                lines.push({
                    line: firstLine,
                    indent,
                    text: buffer.trim(),
                    children: []
                });
            }

            buffer = "";
        });

        if (buffer) {
            throw new Error(
                `Parenthèse non fermée à la ligne ${firstLine}.`
            );
        }

        return lines;
    }

    buildTree() {
        const root = {
            indent: -1,
            children: []
        };

        const stack = [root];

        for (const node of this.prepareLines()) {
            while (
                stack.length > 1 &&
                node.indent <=
                    stack[stack.length - 1].indent
            ) {
                stack.pop();
            }

            const parent =
                stack[stack.length - 1];

            parent.children.push(node);

            if (node.text.endsWith(":")) {
                stack.push(node);
            }
        }

        return root.children;
    }

    evaluate(text, scope) {
        return new PytExpressionParser(
            text,
            scope,
            this
        ).parse();
    }

    callValue(value, args) {
        if (typeof value === "function") {
            return value(...args);
        }

        if (
            value &&
            value.__pytFunction
        ) {
            if (++this.calls > 200) {
                throw new Error(
                    "Trop d'appels de fonction."
                );
            }

            const scope =
                new PytScope(value.closure);

            value.params.forEach((p, i) => {
                scope.set(p, args[i]);
            });

            try {
                this.executeNodes(
                    value.body,
                    scope
                );
            } catch (signal) {
                if (
                    signal instanceof PytReturnSignal
                ) {
                    return signal.value;
                }

                throw signal;
            }

            return null;
        }

        throw new Error(
            "Cette valeur n'est pas une fonction."
        );
    }

    execute() {
        this.executeNodes(
            this.buildTree(),
            this.scope
        );
    }

    executeNodes(nodes, scope) {
        for (
            let i = 0;
            i < nodes.length;
            i++
        ) {
            const node = nodes[i];

            this.currentLine = node.line;

            const text = node.text;

            if (/^if\b/.test(text)) {
                const chain = [node];

                while (
                    i + 1 < nodes.length &&
                    /^(elif\b|else\s*:)/.test(
                        nodes[i + 1].text
                    )
                ) {
                    chain.push(nodes[++i]);
                }

                for (const part of chain) {
                    this.currentLine = part.line;

                    if (
                        /^else\s*:/.test(part.text) ||
                        this.truth(
                            this.evaluate(
                                part.text
                                    .replace(
                                        /^(if|elif)\b/,
                                        ""
                                    )
                                    .replace(
                                        /:\s*$/,
                                        ""
                                    )
                                    .trim(),
                                scope
                            )
                        )
                    ) {
                        this.executeNodes(
                            part.children,
                            scope
                        );

                        break;
                    }
                }
            } else if (
                /^(elif\b|else\s*:)/.test(text)
            ) {
                throw new Error(
                    "elif/else sans if."
                );
            } else if (/^for\b/.test(text)) {
                const match =
                    /^for\s+([a-zA-Z_]\w*)\s+in\s+(.+):$/
                        .exec(text);

                if (!match) {
                    throw new Error(
                        "Boucle for invalide."
                    );
                }

                const values =
                    this.evaluate(match[2], scope);

                if (
                    values == null ||
                    typeof values[Symbol.iterator] !==
                        "function"
                ) {
                    throw new Error(
                        "for attend une liste ou range()."
                    );
                }

                for (const value of values) {
                    if (++this.iterations > 2000) {
                        throw new Error(
                            "Boucle trop longue."
                        );
                    }

                    scope.assign(
                        match[1],
                        value
                    );

                    try {
                        this.executeNodes(
                            node.children,
                            scope
                        );
                    } catch (signal) {
                        if (
                            signal instanceof
                                PytBreakSignal
                        ) {
                            break;
                        }

                        throw signal;
                    }
                }
            } else if (/^while\b/.test(text)) {
                const condition = text
                    .replace(/^while\b/, "")
                    .replace(/:\s*$/, "")
                    .trim();

                while (
                    this.truth(
                        this.evaluate(
                            condition,
                            scope
                        )
                    )
                ) {
                    if (++this.iterations > 2000) {
                        throw new Error(
                            "La boucle while semble infinie."
                        );
                    }

                    try {
                        this.executeNodes(
                            node.children,
                            scope
                        );
                    } catch (signal) {
                        if (
                            signal instanceof
                                PytBreakSignal
                        ) {
                            break;
                        }

                        throw signal;
                    }
                }
            } else if (/^def\b/.test(text)) {
                const match =
                    /^def\s+([a-zA-Z_]\w*)\s*\((.*?)\)\s*:$/
                        .exec(text);

                if (!match) {
                    throw new Error(
                        "Définition de fonction invalide."
                    );
                }

                const params = match[2]
                    .split(",")
                    .map(x => x.trim())
                    .filter(Boolean);

                scope.set(match[1], {
                    __pytFunction: true,
                    params,
                    body: node.children,
                    closure: scope
                });
            } else if (
                /^return(?:\s|$)/.test(text)
            ) {
                const expression = text
                    .replace(/^return\b/, "")
                    .trim();

                throw new PytReturnSignal(
                    expression
                        ? this.evaluate(
                            expression,
                            scope
                        )
                        : null
                );
            } else if (text === "break") {
                throw new PytBreakSignal();
            } else if (text !== "pass") {
                const augmented =
                    /^([a-zA-Z_]\w*)\s*(\+=|-=|\*=|\/=|%=)\s*(.+)$/
                        .exec(text);

                if (augmented) {
                    const left =
                        scope.get(augmented[1]);

                    const right =
                        this.evaluate(
                            augmented[3],
                            scope
                        );

                    const op = augmented[2];

                    const result =
                        op === "+="
                            ? left + right
                            : op === "-="
                                ? left - right
                                : op === "*="
                                    ? left * right
                                    : op === "/="
                                        ? left / right
                                        : left % right;

                    scope.assign(
                        augmented[1],
                        result
                    );
                } else {
                    const assignment =
                        /^([a-zA-Z_]\w*)\s*=(?!=)\s*(.+)$/
                            .exec(text);

                    if (assignment) {
                        scope.assign(
                            assignment[1],
                            this.evaluate(
                                assignment[2],
                                scope
                            )
                        );
                    } else {
                        this.evaluate(
                            text,
                            scope
                        );
                    }
                }
            }
        }
    }
}

/* =========================================================
   MOTEUR PRINCIPAL PYT
========================================================= */

class PytGame {
    constructor() {
        this.canvas =
            document.getElementById("game-canvas");

        this.ctx =
            this.canvas?.getContext("2d") || null;

        this.levelData = null;
        this.robot = null;
        this.visualRobot = null;

        this.mapWidth = 8;
        this.mapHeight = 6;

        this.actionQueue = [];
        this.programOutput = [];

        this.logicalObjects = [];
        this.logicalTargets = [];

        this.visualObjects = [];
        this.visualTargets = [];

        this.runtimeIssues = [];

        this.executing = false;
        this.playbackId = 0;

        this.animationFrame = null;
        this.animationFinish = null;

        this.boardLayout = null;
        this.artWarningShown = false;

        this.resetStats();
        this.ensureArtCompatibility();
        this.bindEvents();

        this.resizeCanvas();
        this.render();
    }

    /* =====================================================
       COMPATIBILITÉ GRAPHIQUE
    ===================================================== */

    ensureArtCompatibility() {
        const palette =
            window.PYTArt?.palette;

        if (!palette) {
            return;
        }

        if (
            typeof palette.glassBlue !==
            "function"
        ) {
            const color =
                typeof palette.glassBlue === "string"
                    ? palette.glassBlue
                    : "#74c9dd";

            palette.glassBlue = () => color;
        }

        if (
            typeof palette.glassSteel !==
            "function"
        ) {
            const color =
                typeof palette.glassSteel === "string"
                    ? palette.glassSteel
                    : "#9fc5ca";

            palette.glassSteel = () => color;
        }
    }

    /* =====================================================
       ÉVÉNEMENTS
    ===================================================== */

    bindEvents() {
        window.addEventListener(
            "pyt:load-level",
            event => {
                this.loadLevel(
                    event.detail?.data ||
                    event.detail ||
                    {}
                );
            }
        );

        window.addEventListener(
            "pyt:reload-world",
            event => {
                this.restartLevel(
                    event.detail?.data
                );
            }
        );

        window.addEventListener(
            "pyt:restart-level",
            () => {
                this.restartLevel();
            }
        );

        window.addEventListener(
            "pyt:run-code",
            event => {
                const detail =
                    event.detail || {};

                this.executeSource(
                    detail.source ??
                    detail.code ??
                    detail.value ??
                    ""
                );
            }
        );

        window.addEventListener(
            "resize",
            () => {
                this.resizeCanvas();
                this.render();
            },
            {
                passive: true
            }
        );

        window.addEventListener(
            "orientationchange",
            () => {
                setTimeout(() => {
                    this.resizeCanvas();
                    this.render();
                }, 120);
            }
        );
    }

    /* =====================================================
       CANVAS / RESPONSIVE
    ===================================================== */

    resizeCanvas() {
        if (!this.canvas) {
            return;
        }

        if (!this.canvas.width) {
            this.canvas.width = 960;
        }

        if (!this.canvas.height) {
            this.canvas.height = 640;
        }

        const rect =
            this.canvas.parentElement
                ?.getBoundingClientRect();

        if (
            !rect ||
            rect.width <= 0 ||
            rect.height <= 0
        ) {
            return;
        }

        let width = rect.width;
        let height = width * (640 / 960);

        if (height > rect.height) {
            height = rect.height;
            width = height * (960 / 640);
        }

        Object.assign(
            this.canvas.style,
            {
                display: "block",
                width: `${Math.floor(width)}px`,
                height: `${Math.floor(height)}px`,
                maxWidth: "100%",
                maxHeight: "100%",
                margin: "auto",
                imageRendering: "pixelated"
            }
        );
    }

    /* =====================================================
       OUTILS
    ===================================================== */

    clone(value) {
        return value === undefined
            ? undefined
            : JSON.parse(
                JSON.stringify(value)
            );
    }

    normalize(value) {
        return String(value ?? "")
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .toLowerCase()
            .trim()
            .replace(
                /[\s-]+/g,
                "_"
            );
    }

    normalizeDirection(direction) {
        const key =
            String(direction ?? "E")
                .toUpperCase();

        return ({
            NORTH: "N",
            NORD: "N",
            UP: "N",

            EAST: "E",
            EST: "E",
            RIGHT: "E",

            SOUTH: "S",
            SUD: "S",
            DOWN: "S",

            WEST: "W",
            OUEST: "W",
            LEFT: "W"
        })[key] || (
            ["N", "E", "S", "W"].includes(key)
                ? key
                : "E"
        );
    }

    /* =====================================================
       CHARGEMENT DES DONNÉES
    ===================================================== */

    extractStart(data) {
        const start = [
            data.robotStart,
            data.start,
            data.robot?.start,
            data.robot,
            data.map?.start,
            data.map?.robotStart
        ].find(
            x =>
                x &&
                typeof x === "object"
        ) || {};

        return {
            x: Number(
                start.x ??
                start.col ??
                start.column ??
                0
            ),

            y: Number(
                start.y ??
                start.row ??
                start.line ??
                0
            ),

            direction:
                this.normalizeDirection(
                    start.direction ??
                    start.heading ??
                    "E"
                )
        };
    }

    extractObjects(data) {
        const objects =
            data.objects ??
            data.map?.objects ??
            [];

        if (!Array.isArray(objects)) {
            return [];
        }

        return objects.map(
            (item, i) => ({
                ...this.clone(item),

                id:
                    item.id ??
                    `object-${i + 1}`,

                x: Number(
                    item.x ??
                    item.col ??
                    0
                ),

                y: Number(
                    item.y ??
                    item.row ??
                    0
                )
            })
        );
    }

    extractTargets(data) {
        const targets =
            data.targets ??
            data.map?.targets ??
            [];

        if (!Array.isArray(targets)) {
            return [];
        }

        return targets.map(
            (item, i) => ({
                ...this.clone(item),

                id:
                    item.id ??
                    `target-${i + 1}`,

                x: Number(
                    item.x ??
                    item.col ??
                    0
                ),

                y: Number(
                    item.y ??
                    item.row ??
                    0
                )
            })
        );
    }

    createRobot(start) {
        let robot;

        try {
            robot =
                typeof window.PytRobot === "function"
                    ? new window.PytRobot(start)
                    : {};
        } catch (_) {
            try {
                robot = new window.PytRobot(
                    start.x,
                    start.y,
                    start.direction
                );
            } catch (_) {
                robot = {};
            }
        }

        Object.assign(robot, {
            x: start.x,
            y: start.y,
            direction: start.direction,
            inventory: [],
            visited: [
                {
                    x: start.x,
                    y: start.y
                }
            ]
        });

        return robot;
    }

    resetStats() {
        this.stats = {
            moves: 0,
            forward: 0,
            backward: 0,
            turns: 0,
            collisions: 0,
            picked: [],
            deposited: [],
            pushed: [],
            buttons: [],
            doors: [],
            cleaned: [],
            recharged: false
        };
    }

    /* =====================================================
       OUVERTURE D'EXERCICE
    ===================================================== */

    loadLevel(data) {
        this.stopAnimation();

        this.levelData =
            this.clone(data || {});

        this.mapWidth = Math.max(
            1,
            Math.min(
                30,
                Number(
                    this.levelData.map?.width ??
                    this.levelData.width ??
                    8
                ) || 8
            )
        );

        this.mapHeight = Math.max(
            1,
            Math.min(
                30,
                Number(
                    this.levelData.map?.height ??
                    this.levelData.height ??
                    6
                ) || 6
            )
        );

        this.startState =
            this.extractStart(
                this.levelData
            );

        this.robot =
            this.createRobot(
                this.startState
            );

        this.logicalObjects =
            this.extractObjects(
                this.levelData
            );

        this.logicalTargets =
            this.extractTargets(
                this.levelData
            );

        this.resetStats();

        this.actionQueue = [];
        this.programOutput = [];
        this.runtimeIssues = [];
        this.executing = false;

        this.prepareVisualPlayback();

        this.updateStatus("Prêt");

        this.resizeCanvas();
        this.render();

        requestAnimationFrame(() => {
            this.resizeCanvas();
            this.render();
        });
    }

    restartLevel(data = null) {
        if (data || this.levelData) {
            this.loadLevel(
                data ||
                this.levelData
            );
        }
    }

    resetLevel() {
        this.restartLevel();
    }

    resetLogicalWorld() {
        Object.assign(
            this.robot,
            {
                x: this.startState.x,
                y: this.startState.y,
                direction:
                    this.startState.direction,

                inventory: [],

                visited: [
                    {
                        x: this.startState.x,
                        y: this.startState.y
                    }
                ]
            }
        );

        this.logicalObjects =
            this.extractObjects(
                this.levelData
            );

        this.logicalTargets =
            this.extractTargets(
                this.levelData
            );

        this.resetStats();
    }

    prepareVisualPlayback() {
        this.visualRobot = {
            x: this.startState.x,
            y: this.startState.y,
            direction:
                this.startState.direction,
            inventory: []
        };

        this.visualObjects =
            this.extractObjects(
                this.levelData
            );

        this.visualTargets =
            this.extractTargets(
                this.levelData
            );
    }

    /* =====================================================
       EXÉCUTION DU CODE
    ===================================================== */

    async executeSource(source) {
        if (
            this.executing ||
            !this.levelData
        ) {
            return;
        }

        this.executing = true;

        const playbackId =
            ++this.playbackId;

        this.resetLogicalWorld();

        this.programOutput = [];
        this.actionQueue = [];
        this.runtimeIssues = [];

        this.updateStatus(
            "Analyse du programme..."
        );

        let problem = null;
        let errorLine = 0;
        let interpreter = null;

        try {
            interpreter = new PytInterpreter(
                this,
                String(source)
            );

            interpreter.execute();
        } catch (error) {
            problem = error;

            errorLine = Number(
                error.line ??
                error.lineNumber ??
                interpreter?.currentLine ??
                0
            );

            if (!errorLine) {
                errorLine = Number(
                    /ligne\s+(\d+)/i
                        .exec(error.message)?.[1] ||
                    0
                );
            }
        }

        this.prepareVisualPlayback();

        this.updateStatus("Exécution...");

        try {
            await this.playActionQueue(
                playbackId
            );

            if (
                playbackId !==
                this.playbackId
            ) {
                return;
            }

            const result = problem
                ? {
                    success: false,
                    reason: "runtime_error",
                    message:
                        problem.message ||
                        "Erreur dans le programme.",
                    errorLine
                }
                : this.validateLevel(
                    String(source)
                );

            this.finishExecution({
                ...result,
                output:
                    this.programOutput.slice()
            });
        } catch (error) {
            if (
                playbackId !==
                this.playbackId
            ) {
                return;
            }

            this.finishExecution({
                success: false,
                reason: "engine_error",
                message:
                    error.message ||
                    "Erreur pendant l'exécution."
            });
        }
    }

    finishExecution(result) {
        this.executing = false;

        const line = Number(
            result.errorLine ??
            result.line ??
            0
        );

        const detail = {
            ...result,
            errorLine: line,
            line,
            lineNumber: line,
            levelData:
                this.clone(this.levelData)
        };

        this.updateStatus(
            detail.success
                ? "Mission réussie"
                : "À corriger"
        );

        this.render();

        window.dispatchEvent(
            new CustomEvent(
                "pyt:execution-result",
                {
                    detail
                }
            )
        );

        window.dispatchEvent(
            new CustomEvent(
                detail.success
                    ? "pyt:level-complete"
                    : "pyt:level-failed",
                {
                    detail
                }
            )
        );
    }

    /* =====================================================
       FILE D'ACTIONS
    ===================================================== */

    ensureQueueCapacity() {
        if (
            this.actionQueue.length >=
            1500
        ) {
            throw new Error(
                "Programme trop long : limite de 1500 actions."
            );
        }
    }

    queue(action) {
        this.ensureQueueCapacity();
        this.actionQueue.push(action);
    }

    /* =====================================================
       DIRECTIONS
    ===================================================== */

    rotateDirection(direction, turns) {
        const order = [
            "N",
            "E",
            "S",
            "W"
        ];

        return order[
            (
                order.indexOf(
                    this.normalizeDirection(direction)
                ) +
                turns +
                8
            ) % 4
        ];
    }

    getDirectionVector(direction) {
        return {
            N: {
                x: 0,
                y: -1
            },

            E: {
                x: 1,
                y: 0
            },

            S: {
                x: 0,
                y: 1
            },

            W: {
                x: -1,
                y: 0
            }
        }[
            this.normalizeDirection(direction)
        ];
    }

    inBounds(x, y) {
        return (
            x >= 0 &&
            y >= 0 &&
            x < this.mapWidth &&
            y < this.mapHeight
        );
    }

    /* =====================================================
       COMMANDES DE DÉPLACEMENT
    ===================================================== */

    normalizeDistance(value = 1) {
        const n = Number(value ?? 1);

        if (
            !Number.isInteger(n) ||
            n < 0 ||
            n > 100
        ) {
            throw new Error(
                "Le nombre de cases doit être entier entre 0 et 100."
            );
        }

        return n;
    }

    apiForward(distance = 1) {
        const count =
            this.normalizeDistance(distance);

        for (let i = 0; i < count; i++) {
            this.tryMove(1, "forward");
        }

        return null;
    }

    apiBackward(distance = 1) {
        const count =
            this.normalizeDistance(distance);

        for (let i = 0; i < count; i++) {
            this.tryMove(-1, "backward");
        }

        return null;
    }

    apiLeft(degrees = 90) {
        return this.turnBy(
            -Number(degrees ?? 90)
        );
    }

    apiRight(degrees = 90) {
        return this.turnBy(
            Number(degrees ?? 90)
        );
    }

    turnBy(degrees) {
        if (
            !Number.isFinite(degrees) ||
            degrees % 90 !== 0 ||
            Math.abs(degrees) > 3600
        ) {
            throw new Error(
                "Utilise des rotations par multiples de 90 degrés."
            );
        }

        const count =
            Math.abs(degrees / 90);

        for (let i = 0; i < count; i++) {
            const from =
                this.robot.direction;

            const to =
                this.rotateDirection(
                    from,
                    degrees > 0 ? 1 : -1
                );

            this.robot.direction = to;
            this.stats.turns++;

            this.queue({
                type: "turn",
                from,
                to
            });
        }

        return null;
    }

    apiSetHeading(degrees) {
        const angle =
            (
                (Number(degrees) % 360) +
                360
            ) % 360;

        const to = {
            0: "E",
            90: "S",
            180: "W",
            270: "N"
        }[angle];

        if (!to) {
            throw new Error(
                "setheading() : utilise 0, 90, 180 ou 270."
            );
        }

        const from =
            this.robot.direction;

        this.robot.direction = to;

        this.queue({
            type: "turn",
            from,
            to
        });

        return null;
    }

    apiGoto(x, y) {
        x = Number(x);
        y = Number(y);

        if (
            !Number.isInteger(x) ||
            !Number.isInteger(y) ||
            !this.inBounds(x, y)
        ) {
            throw new Error(
                "Coordonnées goto() hors de la grille."
            );
        }

        let guard = 0;

        while (
            this.robot.x !== x &&
            guard++ < 100
        ) {
            this.turnToDirection(
                this.robot.x < x
                    ? "E"
                    : "W"
            );

            if (!this.tryMove(1, "forward")) {
                break;
            }
        }

        guard = 0;

        while (
            this.robot.y !== y &&
            guard++ < 100
        ) {
            this.turnToDirection(
                this.robot.y < y
                    ? "S"
                    : "N"
            );

            if (!this.tryMove(1, "forward")) {
                break;
            }
        }

        return null;
    }

    turnToDirection(direction) {
        for (
            let i = 0;
            i < 4 &&
                this.robot.direction !== direction;
            i++
        ) {
            this.turnBy(90);
        }
    }

    /* =====================================================
       COLLISIONS ET OBJETS
    ===================================================== */

    getBlockedCells() {
        const source =
            this.levelData?.blocked ??
            this.levelData?.map?.blocked ??
            [];

        return Array.isArray(source)
            ? source
            : [];
    }

    cellMatches(item, x, y) {
        if (Array.isArray(item)) {
            return (
                Number(item[0]) === x &&
                Number(item[1]) === y
            );
        }

        return Boolean(
            item &&
            Number(item.x ?? item.col) === x &&
            Number(item.y ?? item.row) === y
        );
    }

    isPushableObject(item) {
        if (item.pushable != null) {
            return item.pushable === true;
        }

        return [
            "caisse",
            "box",
            "crate",
            "caisse_bois"
        ].includes(
            this.normalize(
                item.type ??
                item.id
            )
        );
    }

    isButtonType(type) {
        return [
            "button",
            "bouton",
            "switch",
            "interrupteur"
        ].includes(type);
    }

    isDoorType(type) {
        return [
            "door",
            "porte"
        ].includes(type);
    }

    isDirtyType(type) {
        return [
            "dirty",
            "salete",
            "mud",
            "boue",
            "tache"
        ].includes(type);
    }

    isChargerType(type) {
        return [
            "charger",
            "recharge",
            "station_recharge",
            "charging_station"
        ].includes(type);
    }

    isDepositTarget(item) {
        return [
            "deposit",
            "depot",
            "drop",
            "destination_objet"
        ].includes(
            this.normalize(
                item.type ??
                item.id
            )
        );
    }

    isAutoPickupObject(item) {
        if (
            item.pickable === false ||
            this.isPushableObject(item)
        ) {
            return false;
        }

        const types = [
            "book",
            "livre",
            "livre_rouge",
            "livre_bleu",
            "key",
            "cle",
            "apple",
            "pomme",
            "cup",
            "tasse",
            "plate",
            "assiette",
            "bottle",
            "bouteille",
            "bouteille_rouge",
            "bouteille_bleue",
            "bouteille_verte",
            "bouteille_jaune",
            "watering_can",
            "arrosoir",
            "toy",
            "jouet",
            "charger_item",
            "chargeur",
            "float",
            "bouee",
            "toolbox",
            "boite_outils"
        ];

        return (
            item.pickable === true ||
            types.includes(
                this.normalize(
                    item.type ??
                    item.id
                )
            )
        );
    }

    findPushableAt(x, y) {
        return this.logicalObjects.find(
            object =>
                object.x === x &&
                object.y === y &&
                this.isPushableObject(object)
        ) || null;
    }

    isBlockedCell(
        x,
        y,
        ignoreId = null
    ) {
        if (!this.inBounds(x, y)) {
            return true;
        }

        if (
            this.getBlockedCells().some(
                cell =>
                    this.cellMatches(
                        cell,
                        x,
                        y
                    )
            )
        ) {
            return true;
        }

        return this.logicalObjects.some(
            object => {
                if (
                    object.id === ignoreId ||
                    object.x !== x ||
                    object.y !== y
                ) {
                    return false;
                }

                const type =
                    this.normalize(
                        object.type ??
                        object.id
                    );

                if (
                    this.isAutoPickupObject(object) ||
                    this.isButtonType(type) ||
                    this.isDoorType(type) ||
                    this.isDirtyType(type) ||
                    this.isChargerType(type)
                ) {
                    return false;
                }

                return (
                    this.isPushableObject(object) ||
                    object.solid === true
                );
            }
        );
    }

    registerCollision(from, target) {
        this.stats.collisions++;

        this.runtimeIssues.push({
            type: "collision",
            ...target
        });

        this.queue({
            type: "bump",
            from,
            target,
            direction:
                this.robot.direction
        });
    }

    /* =====================================================
       MOUVEMENT LOGIQUE
    ===================================================== */

    tryMove(sign, mode) {
        const vector =
            this.getDirectionVector(
                this.robot.direction
            );

        const dx = vector.x * sign;
        const dy = vector.y * sign;

        const from = {
            x: this.robot.x,
            y: this.robot.y
        };

        const target = {
            x: from.x + dx,
            y: from.y + dy
        };

        if (
            !this.inBounds(
                target.x,
                target.y
            )
        ) {
            this.registerCollision(
                from,
                target
            );

            return false;
        }

        const box =
            this.findPushableAt(
                target.x,
                target.y
            );

        if (box) {
            const destination = {
                x: target.x + dx,
                y: target.y + dy
            };

            if (
                this.isBlockedCell(
                    destination.x,
                    destination.y,
                    box.id
                )
            ) {
                this.registerCollision(
                    from,
                    target
                );

                return false;
            }

            const oldPosition = {
                x: box.x,
                y: box.y
            };

            box.x = destination.x;
            box.y = destination.y;

            this.stats.pushed.push(
                box.id
            );

            this.queue({
                type: "push",
                objectId: box.id,
                from: oldPosition,
                to: destination
            });
        }

        if (
            this.isBlockedCell(
                target.x,
                target.y
            )
        ) {
            this.registerCollision(
                from,
                target
            );

            return false;
        }

        this.robot.x = target.x;
        this.robot.y = target.y;

        this.robot.visited.push(target);

        this.stats.moves++;

        this.stats[
            mode === "backward"
                ? "backward"
                : "forward"
        ]++;

        this.queue({
            type: "move",
            from,
            to: target,
            mode,
            direction:
                this.robot.direction
        });

        this.applyAutomaticInteractions();

        return true;
    }

    frontIsClear() {
        const vector =
            this.getDirectionVector(
                this.robot.direction
            );

        const x =
            this.robot.x +
            vector.x;

        const y =
            this.robot.y +
            vector.y;

        const box =
            this.findPushableAt(
                x,
                y
            );

        if (box) {
            return !this.isBlockedCell(
                x + vector.x,
                y + vector.y,
                box.id
            );
        }

        return !this.isBlockedCell(x, y);
    }

    robotOnObject() {
        return this.logicalObjects.some(
            object =>
                object.x === this.robot.x &&
                object.y === this.robot.y
        );
    }

    objectMatches(item, expected) {
        const key =
            this.normalize(expected);

        return [
            item.id,
            item.type,
            item.original?.id,
            item.original?.type
        ].some(
            value =>
                this.normalize(value) === key
        );
    }

    inventoryContains(value) {
        return this.robot.inventory.some(
            item =>
                this.objectMatches(
                    item,
                    value
                )
        );
    }

    /* =====================================================
       INTERACTIONS AUTOMATIQUES
    ===================================================== */

    applyAutomaticInteractions() {
        const { x, y } = this.robot;

        const objects =
            this.logicalObjects.filter(
                object =>
                    object.x === x &&
                    object.y === y
            );

        for (const object of objects) {
            const type =
                this.normalize(
                    object.type ??
                    object.id
                );

            if (this.isButtonType(type)) {
                if (!object.activated) {
                    object.activated = true;

                    this.stats.buttons.push(
                        object.id
                    );

                    this.queue({
                        type: "button",
                        objectId: object.id,
                        x,
                        y
                    });
                }
            } else if (
                this.isChargerType(type)
            ) {
                this.stats.recharged = true;

                this.queue({
                    type: "recharge",
                    objectId: object.id,
                    x,
                    y
                });
            } else if (
                object.cleanable === true ||
                this.isDirtyType(type)
            ) {
                if (!object.cleaned) {
                    object.cleaned = true;

                    this.stats.cleaned.push(
                        object.id
                    );

                    this.queue({
                        type: "clean",
                        objectId: object.id,
                        x,
                        y
                    });
                }
            } else if (
                this.isDoorType(type)
            ) {
                if (!object.open) {
                    object.open = true;

                    this.stats.doors.push(
                        object.id
                    );

                    this.queue({
                        type: "door",
                        objectId: object.id,
                        x,
                        y
                    });
                }
            } else if (
                this.isAutoPickupObject(object) &&
                !object.collected
            ) {
                object.collected = true;

                const item = {
                    id: object.id,
                    type:
                        object.type ??
                        object.id,
                    original:
                        this.clone(object)
                };

                this.robot.inventory.push(
                    item
                );

                this.stats.picked.push(
                    object.id
                );

                this.queue({
                    type: "pickup",
                    objectId: object.id,
                    item,
                    x,
                    y
                });
            }
        }

        this.logicalObjects =
            this.logicalObjects.filter(
                object =>
                    !object.collected
            );

        this.tryAutomaticDeposit();
    }

    tryAutomaticDeposit() {
        if (
            !this.robot.inventory.length
        ) {
            return;
        }

        const target =
            this.logicalTargets.find(
                item =>
                    item.x === this.robot.x &&
                    item.y === this.robot.y &&
                    this.isDepositTarget(item) &&
                    !item.completed
            );

        if (!target) {
            return;
        }

        const expected =
            target.object ??
            target.objectId ??
            target.requiredObject ??
            target.accepts ??
            null;

        const index =
            expected == null
                ? 0
                : this.robot.inventory.findIndex(
                    item =>
                        this.objectMatches(
                            item,
                            expected
                        )
                );

        if (index < 0) {
            return;
        }

        const item =
            this.robot.inventory.splice(
                index,
                1
            )[0];

        target.completed = true;

        this.stats.deposited.push({
            object: item.id,
            target: target.id
        });

        this.queue({
            type: "deposit",
            item,
            targetId: target.id,
            x: target.x,
            y: target.y
        });
    }

    /* =====================================================
       OBJECTIFS ET VALIDATION
    ===================================================== */

    extractGoalPosition(goal = {}) {
        const choices = [
            goal.position,
            goal.destination,
            goal.target
        ];

        if (
            goal.x != null &&
            goal.y != null
        ) {
            choices.push(goal);
        }

        for (const item of choices) {
            if (
                !item ||
                (
                    item.x == null &&
                    item.col == null
                )
            ) {
                continue;
            }

            const x = Number(
                item.x ??
                item.col
            );

            const y = Number(
                item.y ??
                item.row
            );

            if (
                Number.isFinite(x) &&
                Number.isFinite(y)
            ) {
                return { x, y };
            }
        }

        return null;
    }

    findDestinationTarget() {
        const target =
            this.logicalTargets.find(
                item =>
                    [
                        "goal",
                        "objectif",
                        "destination",
                        "finish",
                        "arrivee"
                    ].includes(
                        this.normalize(
                            item.type ??
                            item.id
                        )
                    )
            );

        return target
            ? {
                x: target.x,
                y: target.y
            }
            : null;
    }

    validateLevel(source) {
        const goal =
            this.levelData.goal || {};

        const missing =
            PytCodeAnalyzer.missingConcepts(
                source,
                this.levelData.requiredConcepts
            );

        const fail = (reason, message) => ({
            success: false,
            reason,
            message
        });

        if (missing.length) {
            return {
                ...fail(
                    "concept_missing",
                    "Utilise les notions Python demandées."
                ),

                missingConcepts: missing
            };
        }

        const destination =
            this.extractGoalPosition(goal) ||
            this.findDestinationTarget();

        if (
            destination &&
            (
                this.robot.x !== destination.x ||
                this.robot.y !== destination.y
            )
        ) {
            return fail(
                "wrong_destination",
                "Pyt n'est pas arrivé à la destination."
            );
        }

        const required =
            goal.requiredObject ??
            goal.required_object ??
            goal.pickup;

        if (required) {
            const items =
                Array.isArray(required)
                    ? required
                    : [required];

            for (const item of items) {
                const wasPicked =
                    this.stats.picked.some(
                        id =>
                            this.normalize(id) ===
                            this.normalize(item)
                    );

                const inInventory =
                    this.robot.inventory.some(
                        object =>
                            this.objectMatches(
                                object,
                                item
                            )
                    );

                const wasDeposited =
                    this.stats.deposited.some(
                        object =>
                            this.normalize(
                                object.object
                            ) ===
                            this.normalize(item)
                    );

                if (
                    !wasPicked &&
                    !inInventory &&
                    !wasDeposited
                ) {
                    return fail(
                        "object_missing",
                        "Un objet important manque encore."
                    );
                }
            }
        }

        const unfinishedDeposit =
            this.logicalTargets.some(
                target =>
                    this.isDepositTarget(target) &&
                    !target.optional &&
                    !target.completed
            );

        if (unfinishedDeposit) {
            return fail(
                "deposit_missing",
                "Tous les dépôts ne sont pas terminés."
            );
        }

        const requiredButtons = Number(
            goal.buttons ??
            goal.requiredButtons ??
            0
        );

        if (
            this.stats.buttons.length <
            requiredButtons
        ) {
            return fail(
                "objective_incomplete",
                "Il reste un mécanisme à activer."
            );
        }

        const requiredCleaned = Number(
            goal.cleaned ??
            goal.requiredCleaned ??
            0
        );

        if (
            this.stats.cleaned.length <
            requiredCleaned
        ) {
            return fail(
                "objective_incomplete",
                "Il reste des cases à nettoyer."
            );
        }

        if (
            goal.recharge &&
            !this.stats.recharged
        ) {
            return fail(
                "objective_incomplete",
                "Pyt doit encore se recharger."
            );
        }

        const minimumMoves = Number(
            goal.minimum_moves ??
            goal.minimumMoves ??
            0
        );

        if (
            this.stats.moves <
            minimumMoves
        ) {
            return fail(
                "objective_incomplete",
                "Le trajet est incomplet."
            );
        }

        if (
            goal.noCollisions &&
            this.stats.collisions
        ) {
            return fail(
                "objective_incomplete",
                "Pyt a heurté un obstacle."
            );
        }

        if (
            Array.isArray(goal.visit) &&
            goal.visit.some(
                point =>
                    !this.robot.visited.some(
                        visited =>
                            this.cellMatches(
                                point,
                                visited.x,
                                visited.y
                            )
                    )
            )
        ) {
            return fail(
                "objective_incomplete",
                "Toutes les étapes du parcours doivent être visitées."
            );
        }

        if (
            Array.isArray(goal.visitInOrder)
        ) {
            let lastIndex = -1;

            for (
                const checkpoint
                of goal.visitInOrder
            ) {
                lastIndex =
                    this.robot.visited.findIndex(
                        (point, index) =>
                            index > lastIndex &&
                            this.cellMatches(
                                checkpoint,
                                point.x,
                                point.y
                            )
                    );

                if (lastIndex < 0) {
                    return fail(
                        "objective_incomplete",
                        "Les étapes doivent être parcourues dans l'ordre."
                    );
                }
            }
        }

        return {
            success: true,
            reason: "success",
            message: "Mission réussie !"
        };
    }

    /* =====================================================
       APPELS À ART.JS
    ===================================================== */

    safeArt(method, ...args) {
        const fn =
            window.PYTArt?.[method];

        if (typeof fn !== "function") {
            return false;
        }

        try {
            this.ensureArtCompatibility();

            fn.call(
                window.PYTArt,
                ...args
            );

            return true;
        } catch (error) {
            if (!this.artWarningShown) {
                this.artWarningShown = true;

                console.warn(
                    "[PYT] Erreur de dessin (le jeu continue) :",
                    error
                );
            }

            return false;
        }
    }

    /* =====================================================
       RENDU
    ===================================================== */

    render(options = {}) {
        if (
            !this.ctx ||
            !this.canvas
        ) {
            return;
        }

        const ctx = this.ctx;

        const width =
            this.canvas.width;

        const height =
            this.canvas.height;

        ctx.save();

        try {
            ctx.imageSmoothingEnabled = false;

            ctx.clearRect(
                0,
                0,
                width,
                height
            );

            ctx.fillStyle = "#10111a";

            ctx.fillRect(
                0,
                0,
                width,
                height
            );

            const room =
                this.normalize(
                    this.levelData?.room ||
                    "entree"
                );

            this.safeArt(
                "drawRoomScene",
                ctx,
                room,
                16,
                16,
                width - 32,
                height - 32,
                {
                    furniture: false
                }
            );

            if (!this.levelData) {
                return;
            }

            this.boardLayout =
                this.calculateBoardLayout(
                    width,
                    height
                );

            this.drawBoardFloor(ctx);
            this.drawGrid(ctx);
            this.drawTargets(ctx);
            this.drawDecorations(ctx);
            this.drawBlockedCells(ctx);
            this.drawObjects(ctx);
            this.drawRobot(ctx, options);
            this.drawBoardBorder(ctx);
        } catch (error) {
            console.error(
                "[PYT] Rendu de l'exercice :",
                error
            );
        } finally {
            ctx.restore();
        }
    }

    calculateBoardLayout(width, height) {
        const marginX = 78;
        const marginTop = 78;
        const marginBottom = 60;

        const availableWidth = Math.max(
            1,
            width - marginX * 2
        );

        const availableHeight = Math.max(
            1,
            height - marginTop - marginBottom
        );

        const tileSize = Math.max(
            1,
            Math.floor(
                Math.min(
                    availableWidth / this.mapWidth,
                    availableHeight / this.mapHeight
                )
            )
        );

        const boardWidth =
            tileSize * this.mapWidth;

        const boardHeight =
            tileSize * this.mapHeight;

        return {
            tileSize,
            width: boardWidth,
            height: boardHeight,

            x: Math.round(
                (width - boardWidth) / 2
            ),

            y: Math.round(
                marginTop +
                (
                    availableHeight -
                    boardHeight
                ) / 2
            )
        };
    }

    cellRect(x, y) {
        const layout =
            this.boardLayout ||
            this.calculateBoardLayout(
                this.canvas?.width || 960,
                this.canvas?.height || 640
            );

        return {
            x:
                layout.x +
                Number(x) * layout.tileSize,

            y:
                layout.y +
                Number(y) * layout.tileSize,

            size:
                layout.tileSize
        };
    }

    /* =====================================================
       SOL DU PLATEAU
    ===================================================== */

    drawBoardFloor(ctx) {
        const p = this.boardLayout;

        ctx.fillStyle =
            "rgba(0,0,0,0.28)";

        ctx.fillRect(
            p.x + 8,
            p.y + 9,
            p.width,
            p.height
        );

        ctx.fillStyle =
            "rgba(255,240,205,0.18)";

        ctx.fillRect(
            p.x,
            p.y,
            p.width,
            p.height
        );

        for (
            let y = 0;
            y < this.mapHeight;
            y++
        ) {
            for (
                let x = 0;
                x < this.mapWidth;
                x++
            ) {
                if ((x + y) % 2) {
                    const cell =
                        this.cellRect(x, y);

                    ctx.fillStyle =
                        "rgba(0,0,0,0.055)";

                    ctx.fillRect(
                        cell.x,
                        cell.y,
                        cell.size,
                        cell.size
                    );
                }
            }
        }
    }

    /* =====================================================
       GRILLE
    ===================================================== */

    drawGrid(ctx) {
        for (
            let y = 0;
            y < this.mapHeight;
            y++
        ) {
            for (
                let x = 0;
                x < this.mapWidth;
                x++
            ) {
                const cell =
                    this.cellRect(x, y);

                const drawn = this.safeArt(
                    "drawGridCell",
                    ctx,
                    cell.x,
                    cell.y,
                    cell.size,
                    {
                        alpha: 0.48,
                        color: "#fff3d7"
                    }
                );

                if (!drawn) {
                    ctx.strokeStyle =
                        "rgba(255,243,215,0.40)";

                    ctx.lineWidth = 1;

                    ctx.strokeRect(
                        cell.x,
                        cell.y,
                        cell.size,
                        cell.size
                    );
                }
            }
        }
    }

    /* =====================================================
       OBJECTIFS VISUELS
    ===================================================== */

    drawTargets(ctx) {
        const targets =
            this.executing
                ? this.visualTargets
                : this.logicalTargets;

        for (const target of targets) {
            const cell =
                this.cellRect(
                    target.x,
                    target.y
                );

            const type =
                this.normalize(
                    target.type ??
                    target.id
                );

            if (
                this.isDepositTarget(target)
            ) {
                this.safeArt(
                    "drawDeposit",
                    ctx,
                    cell.x,
                    cell.y,
                    cell.size
                );
            } else if (
                [
                    "goal",
                    "objectif",
                    "destination",
                    "finish",
                    "arrivee"
                ].includes(type)
            ) {
                this.safeArt(
                    "drawGoal",
                    ctx,
                    cell.x,
                    cell.y,
                    cell.size
                );
            }
        }

        const goal =
            this.extractGoalPosition(
                this.levelData.goal || {}
            );

        if (
            goal &&
            !targets.some(
                target =>
                    target.x === goal.x &&
                    target.y === goal.y
            )
        ) {
            const cell =
                this.cellRect(
                    goal.x,
                    goal.y
                );

            this.safeArt(
                "drawGoal",
                ctx,
                cell.x,
                cell.y,
                cell.size
            );
        }
    }

    /* =====================================================
       DÉCORATIONS
    ===================================================== */

    drawDecorations(ctx) {
        const decorations =
            this.levelData?.decorations ??
            this.levelData?.map?.decorations ??
            [];

        if (
            !Array.isArray(decorations)
        ) {
            return;
        }

        for (
            const item of decorations
        ) {
            const x = Number(
                item.x ??
                item.col
            );

            const y = Number(
                item.y ??
                item.row
            );

            if (
                !Number.isFinite(x) ||
                !Number.isFinite(y)
            ) {
                continue;
            }

            const cell =
                this.cellRect(x, y);

            const size =
                cell.size *
                Number(item.scale ?? 0.94);

            const offset =
                (cell.size - size) / 2;

            this.safeArt(
                "draw",
                ctx,
                item.type ??
                    item.id ??
                    "unknown",
                cell.x + offset,
                cell.y + offset,
                size,
                item
            );
        }
    }

    /* =====================================================
       OBSTACLES VISUELS
    ===================================================== */

    drawBlockedCells(ctx) {
        for (
            const item
            of this.getBlockedCells()
        ) {
            const x = Number(
                Array.isArray(item)
                    ? item[0]
                    : item.x ?? item.col
            );

            const y = Number(
                Array.isArray(item)
                    ? item[1]
                    : item.y ?? item.row
            );

            if (
                !Number.isFinite(x) ||
                !Number.isFinite(y)
            ) {
                continue;
            }

            const cell =
                this.cellRect(x, y);

            this.safeArt(
                "drawBlocked",
                ctx,
                cell.x,
                cell.y,
                cell.size
            );
        }
    }

    /* =====================================================
       APPARENCE DES OBJETS
    ===================================================== */

    getObjectArtType(object) {
        const key =
            this.normalize(
                object.art ??
                object.type ??
                object.id ??
                ""
            );

        const specialTypes = [
            "livre_rouge",
            "livre_bleu",
            "bouteille_rouge",
            "bouteille_bleue",
            "bouteille_verte",
            "bouteille_jaune",
            "boite_outils"
        ];

        for (const name of specialTypes) {
            if (key.includes(name)) {
                return name;
            }
        }

        return key.replace(
            /_\d+$/,
            ""
        );
    }

    drawObjects(ctx) {
        const objects =
            this.executing
                ? this.visualObjects
                : this.logicalObjects;

        for (const object of objects) {
            if (object.hidden) {
                continue;
            }

            const cell =
                this.cellRect(
                    object.x,
                    object.y
                );

            let size =
                cell.size *
                (
                    this.isPushableObject(object)
                        ? 0.83
                        : 0.74
                );

            if (
                this.isAutoPickupObject(object)
            ) {
                const gradient =
                    ctx.createRadialGradient(
                        cell.x + cell.size / 2,
                        cell.y + cell.size / 2,
                        0,
                        cell.x + cell.size / 2,
                        cell.y + cell.size / 2,
                        cell.size * 0.48
                    );

                gradient.addColorStop(
                    0,
                    "rgba(255,238,150,0.18)"
                );

                gradient.addColorStop(
                    1,
                    "rgba(255,238,150,0)"
                );

                ctx.fillStyle = gradient;

                ctx.fillRect(
                    cell.x,
                    cell.y,
                    cell.size,
                    cell.size
                );
            }

            let drawY =
                cell.y +
                (cell.size - size) / 2;

            if (object._pickup) {
                const progress = Number(
                    object._pickupProgress || 0
                );

                drawY -=
                    cell.size *
                    progress *
                    0.3;

                size *=
                    1 - progress * 0.55;
            }

            ctx.save();

            if (object._cleanProgress) {
                ctx.globalAlpha =
                    1 -
                    object._cleanProgress;
            }

            this.safeArt(
                "draw",
                ctx,
                this.getObjectArtType(object),
                cell.x +
                    (cell.size - size) / 2,
                drawY,
                size,
                object
            );

            ctx.restore();
        }
    }

    /* =====================================================
       ROBOT DU JEU
       Aspect fourni par art.js, sans modification.
    ===================================================== */

    drawRobot(ctx, options = {}) {
        const robot =
            this.visualRobot ||
            this.robot;

        if (!robot) {
            return;
        }

        const cell =
            this.cellRect(
                robot.x,
                robot.y
            );

        const size =
            cell.size * 0.76;

        const offset =
            (cell.size - size) / 2;

        this.safeArt(
            "drawPyt",
            ctx,
            cell.x + offset,
            cell.y + offset -
                cell.size * 0.06,
            size,
            robot.direction,
            {
                bob: Boolean(options.moving),
                happy: false
            }
        );
    }

    /* =====================================================
       BORDURE DU PLATEAU
    ===================================================== */

    drawBoardBorder(ctx) {
        const p =
            this.boardLayout;

        ctx.strokeStyle =
            "rgba(15,13,24,0.78)";

        ctx.lineWidth = 5;

        ctx.strokeRect(
            p.x - 3,
            p.y - 3,
            p.width + 6,
            p.height + 6
        );

        ctx.strokeStyle =
            "rgba(255,239,205,0.30)";

        ctx.lineWidth = 2;

        ctx.strokeRect(
            p.x,
            p.y,
            p.width,
            p.height
        );
    }

    /* =====================================================
       STATUS ET SON
    ===================================================== */

    updateStatus(text) {
        const element =
            document.getElementById(
                "game-status"
            );

        if (element) {
            element.textContent = text;
        }
    }

    playSfx(name) {
        if (
            typeof window.pytApp?.playSfx ===
            "function"
        ) {
            window.pytApp.playSfx(name);
        }
    }

    /* =====================================================
       ANNULATION D'ANIMATION
    ===================================================== */

    stopAnimation() {
        this.playbackId++;

        if (
            this.animationFrame != null
        ) {
            cancelAnimationFrame(
                this.animationFrame
            );
        }

        this.animationFrame = null;

        if (this.animationFinish) {
            const finish =
                this.animationFinish;

            this.animationFinish = null;
            finish();
        }
    }

    /* =====================================================
       ANIMATION GÉNÉRIQUE
    ===================================================== */

    animate(duration, update) {
        return new Promise(resolve => {
            const start =
                performance.now();

            let finished = false;

            const finish = () => {
                if (!finished) {
                    finished = true;
                    this.animationFinish = null;
                    resolve();
                }
            };

            this.animationFinish = finish;

            const frame = now => {
                if (finished) {
                    return;
                }

                const t = Math.min(
                    1,
                    (now - start) / duration
                );

                update(t);

                if (t >= 1) {
                    this.animationFrame = null;
                    finish();
                } else {
                    this.animationFrame =
                        requestAnimationFrame(
                            frame
                        );
                }
            };

            this.animationFrame =
                requestAnimationFrame(
                    frame
                );
        });
    }

    easeInOut(t) {
        return t < 0.5
            ? 2 * t * t
            : 1 -
                (
                    (-2 * t + 2) ** 2
                ) / 2;
    }

    wait(duration) {
        return this.animate(
            duration,
            () => {}
        );
    }

    /* =====================================================
       LECTURE DES ACTIONS
    ===================================================== */

    async playActionQueue(id) {
        for (
            const action
            of this.actionQueue
        ) {
            if (
                id !== this.playbackId
            ) {
                return;
            }

            switch (action.type) {
                case "move": {
                    this.playSfx("step");

                    this.visualRobot.direction =
                        action.direction;

                    await this.animate(
                        500,
                        t => {
                            const k =
                                this.easeInOut(t);

                            this.visualRobot.x =
                                action.from.x +
                                (
                                    action.to.x -
                                    action.from.x
                                ) * k;

                            this.visualRobot.y =
                                action.from.y +
                                (
                                    action.to.y -
                                    action.from.y
                                ) * k;

                            this.render({
                                moving: true
                            });
                        }
                    );

                    break;
                }

                case "turn": {
                    this.playSfx("turn");

                    await this.wait(170);

                    this.visualRobot.direction =
                        action.to;

                    this.render();
                    break;
                }

                case "bump": {
                    this.playSfx("bump");

                    const v =
                        this.getDirectionVector(
                            action.direction
                        );

                    await this.animate(
                        180,
                        t => {
                            const amount =
                                Math.sin(
                                    t * Math.PI
                                ) * 0.12;

                            this.visualRobot.x =
                                action.from.x +
                                v.x * amount;

                            this.visualRobot.y =
                                action.from.y +
                                v.y * amount;

                            this.render();
                        }
                    );

                    this.visualRobot.x =
                        action.from.x;

                    this.visualRobot.y =
                        action.from.y;

                    break;
                }

                case "pickup": {
                    this.playSfx("pickup");

                    const item =
                        this.visualObjects.find(
                            x =>
                                x.id ===
                                action.objectId
                        );

                    if (item) {
                        item._pickup = true;
                    }

                    await this.animate(
                        260,
                        t => {
                            if (item) {
                                item._pickupProgress = t;
                            }

                            this.render();
                        }
                    );

                    this.visualObjects =
                        this.visualObjects.filter(
                            x =>
                                x.id !==
                                action.objectId
                        );

                    this.visualRobot.inventory.push(
                        this.clone(action.item)
                    );

                    break;
                }

                case "push": {
                    this.playSfx("push");

                    const item =
                        this.visualObjects.find(
                            x =>
                                x.id ===
                                action.objectId
                        );

                    if (item) {
                        await this.animate(
                            360,
                            t => {
                                const k =
                                    this.easeInOut(t);

                                item.x =
                                    action.from.x +
                                    (
                                        action.to.x -
                                        action.from.x
                                    ) * k;

                                item.y =
                                    action.from.y +
                                    (
                                        action.to.y -
                                        action.from.y
                                    ) * k;

                                this.render();
                            }
                        );
                    }

                    break;
                }

                case "deposit": {
                    this.playSfx("drop");

                    this.visualRobot.inventory =
                        this.visualRobot.inventory.filter(
                            x =>
                                x.id !==
                                action.item.id
                        );

                    this.visualObjects.push({
                        ...this.clone(
                            action.item.original
                        ),

                        id:
                            `${action.item.id}-deposited`,

                        x: action.x,
                        y: action.y,

                        deposited: true,
                        pickable: false
                    });

                    await this.wait(250);

                    break;
                }

                case "clean": {
                    const item =
                        this.visualObjects.find(
                            x =>
                                x.id ===
                                action.objectId
                        );

                    await this.animate(
                        260,
                        t => {
                            if (item) {
                                item._cleanProgress = t;
                            }

                            this.render();
                        }
                    );

                    this.visualObjects =
                        this.visualObjects.filter(
                            x =>
                                x.id !==
                                action.objectId
                        );

                    break;
                }

                default: {
                    this.playSfx(action.type);

                    await this.wait(220);

                    break;
                }
            }

            this.render();
        }

        if (
            id !== this.playbackId
        ) {
            return;
        }

        this.visualRobot = {
            x: this.robot.x,
            y: this.robot.y,
            direction:
                this.robot.direction,
            inventory:
                this.clone(
                    this.robot.inventory
                )
        };

        this.visualObjects =
            this.clone(
                this.logicalObjects
            );

        this.visualTargets =
            this.clone(
                this.logicalTargets
            );

        this.render();
    }
}

/* =========================================================
   DÉMARRAGE DU MOTEUR
========================================================= */

function startPytGame() {
    if (window.pytGame) {
        return;
    }

    window.PytGame =
        PytGame;

    window.PytInterpreter =
        PytInterpreter;

    window.PytCodeAnalyzer =
        PytCodeAnalyzer;

    window.pytGame =
        new PytGame();
}

if (
    document.readyState === "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        startPytGame,
        {
            once: true
        }
    );
} else {
    startPytGame();
}

/* ========================================================
   PYT — IMPORT TURTLE OBLIGATOIRE
   À ajouter tout à la fin de game.js.
======================================================== */

(() => {
    if (
        typeof PytGame === "undefined" ||
        PytGame.prototype.__turtleImportInstalled
    ) {
        return;
    }

    const originalExecute =
        PytGame.prototype.executeSource;

    const importPattern =
        /^\s*from[ \t]+turtle[ \t]+import[ \t]*\*[ \t]*(?:#.*)?$/;

    PytGame.prototype.executeSource = function (source) {
        if (this.executing || !this.levelData) {
            return;
        }

        const lines = String(source ?? "")
            .replace(/\r\n?/g, "\n")
            .split("\n");

        const firstCodeLine = lines.findIndex(line => {
            const clean = line.trim();

            return (
                clean !== "" &&
                !clean.startsWith("#")
            );
        });

        const importPresent =
            firstCodeLine >= 0 &&
            importPattern.test(lines[firstCodeLine]);

        if (!importPresent) {
            this.resetLogicalWorld?.();
            this.prepareVisualPlayback?.();

            this.finishExecution({
                success: false,
                reason: "turtle_import_missing",
                message:
                    "Commence par : from turtle import * (sans # devant).",
                errorLine: Math.max(
                    1,
                    firstCodeLine + 1
                ),
                output: []
            });

            return;
        }

        /*
         * Le moteur PYT simule les commandes Turtle.
         * On retire uniquement la ligne d'import
         * avant de transmettre le programme
         * à son interpréteur interne.
         *
         * Les numéros de lignes restent identiques.
         */

        lines[firstCodeLine] = "";

        return originalExecute.call(
            this,
            lines.join("\n")
        );
    };

    PytGame.prototype.__turtleImportInstalled = true;

    /* Ajouter l'explication dans les théories. */

    const data =
        window.PYT_GAME_DATA ||
        window.PYT_LEVELS;

    if (!Array.isArray(data?.chapters)) {
        return;
    }

    data.chapters.forEach((chapter, index) => {
        if (!Array.isArray(chapter.theory)) {
            return;
        }

        if (
            chapter.theory.some(
                section => section.__turtleImportLesson
            )
        ) {
            return;
        }

        if (index === 0) {
            chapter.theory.unshift({
                __turtleImportLesson: true,
                title: "Importer Turtle",
                body:
                    "Avant de déplacer Pyt, écris from turtle import * au début de ton programme. Cette instruction permet d'utiliser forward(), backward(), left() et right(). Tu devras la réécrire dans chaque exercice.",
                code:
                    "from turtle import *\n\nforward(2)\nright(90)\nforward(1)"
            });
        } else {
            chapter.theory.unshift({
                __turtleImportLesson: true,
                title: "Rappel : importer Turtle",
                body:
                    "Pour déplacer Pyt, commence toujours ton programme par cette ligne :",
                code: "from turtle import *"
            });
        }

        /* Petit indice dans chaque nouvel exercice. */

        (chapter.levels || []).forEach(level => {
            if (
                typeof level.starterCode !== "string" ||
                level.__turtleImportHint
            ) {
                return;
            }

            level.starterCode =
                "# Pense à importer Turtle sur la première ligne.\n" +
                level.starterCode;

            level.__turtleImportHint = true;
        });
    });
})();
