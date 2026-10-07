"use strict";

/* =========================================================
   PYT - game.js

   MOTEUR PRINCIPAL DU JEU

   ---------------------------------------------------------

   PRINCIPES :

   - Pyt se déplace sur une grille logique.
   - Le décor n'est PAS la grille.
   - La grille est dessinée par-dessus le décor.
   - 1 case ≈ 0,5 seconde de déplacement.
   - Les actions valides sont jouées même si le programme
     n'atteint finalement pas l'objectif.
   - On vérifie le résultat obtenu, pas une solution exacte.
   - Les interactions simples sont automatiques.

   COMMANDES PRINCIPALES ÉLÈVE :

       forward(1)
       backward(1)
       left(90)
       right(90)

   Compatibilité supplémentaire :

       avancer(1)
       reculer(1)
       tourner_gauche(90)
       tourner_droite(90)

   Interactions automatiques :

   - ramasser un objet
   - déposer un objet
   - pousser une caisse
   - activer un bouton
   - ouvrir une porte
   - nettoyer une case
   - recharger Pyt
   - atteindre une destination

========================================================= */


/* =========================================================
   SIGNAUX INTERNES DE L'INTERPRÉTEUR
========================================================= */

class PytReturnSignal {

    constructor(value) {

        this.value =
            value;
    }
}


class PytBreakSignal {

    constructor() {

        this.isBreakSignal =
            true;
    }
}



/* =========================================================
   SCOPE PYTHON SIMPLIFIÉ
========================================================= */

class PytScope {

    constructor(parent = null) {

        this.parent =
            parent;


        this.values =
            Object.create(
                null
            );
    }


    hasLocal(name) {

        return Object.prototype
            .hasOwnProperty
            .call(
                this.values,
                name
            );
    }


    has(name) {

        if (
            this.hasLocal(
                name
            )
        ) {

            return true;
        }


        return Boolean(
            this.parent &&
            this.parent.has(
                name
            )
        );
    }


    get(name) {

        if (
            this.hasLocal(
                name
            )
        ) {

            return this.values[
                name
            ];
        }


        if (
            this.parent
        ) {

            return this.parent
                .get(
                    name
                );
        }


        throw new Error(
            `Nom inconnu : ${name}`
        );
    }


    set(
        name,
        value
    ) {

        this.values[
            name
        ] =
            value;


        return value;
    }
}



/* =========================================================
   ANALYSEUR DES NOTIONS UTILISÉES
========================================================= */

class PytCodeAnalyzer {

    static analyze(source) {

        const code =
            String(
                source ||
                ""
            );


        const result = {

            forward:
                /\b(?:forward|avancer)\s*\(/.test(
                    code
                ),

            backward:
                /\b(?:backward|reculer)\s*\(/.test(
                    code
                ),

            left:
                /\b(?:left|tourner_gauche)\s*\(/.test(
                    code
                ),

            right:
                /\b(?:right|tourner_droite)\s*\(/.test(
                    code
                ),

            variable:
                /^[ \t]*[A-Za-z_]\w*[ \t]*=(?!=)/m.test(
                    code
                ),

            condition:
                /^[ \t]*(?:if|elif)\b/m.test(
                    code
                ),

            for:
                /^[ \t]*for\b/m.test(
                    code
                ),

            range:
                /\brange\s*\(/.test(
                    code
                ),

            while:
                /^[ \t]*while\b/m.test(
                    code
                ),

            list:
                /\[[\s\S]*?\]/.test(
                    code
                ),

            dictionary:
                /\{[\s\S]*?:[\s\S]*?\}/.test(
                    code
                ),

            function:
                /^[ \t]*def\b/m.test(
                    code
                ),

            return:
                /^[ \t]*return\b/m.test(
                    code
                )
        };


        return result;
    }


    static normalizeConcept(
        concept
    ) {

        const value =
            String(
                concept ||
                ""
            )
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                )
                .toLowerCase()
                .trim();


        const aliases = {

            variables:
                "variable",

            variable:
                "variable",

            conditions:
                "condition",

            if:
                "condition",

            elif:
                "condition",

            else:
                "condition",

            boucle_for:
                "for",

            for_loop:
                "for",

            range:
                "range",

            boucle_while:
                "while",

            while_loop:
                "while",

            listes:
                "list",

            liste:
                "list",

            list:
                "list",

            dictionnaires:
                "dictionary",

            dictionnaire:
                "dictionary",

            dict:
                "dictionary",

            functions:
                "function",

            fonctions:
                "function",

            fonction:
                "function",

            def:
                "function",

            retour:
                "return",

            reculer:
                "backward",

            avancer:
                "forward",

            gauche:
                "left",

            droite:
                "right"
        };


        return aliases[
            value
        ] ||
            value;
    }


    static missingConcepts(
        source,
        requiredConcepts
    ) {

        if (
            !Array.isArray(
                requiredConcepts
            )
        ) {

            return [];
        }


        const analysis =
            this.analyze(
                source
            );


        return requiredConcepts
            .map(
                concept =>
                    this.normalizeConcept(
                        concept
                    )
            )
            .filter(
                concept =>
                    concept &&
                    analysis[
                        concept
                    ] !==
                        true
            );
    }
}



/* =========================================================
   PARSEUR D'EXPRESSIONS
========================================================= */

class PytExpressionParser {

    constructor(
        source,
        scope,
        interpreter
    ) {

        this.source =
            String(
                source ||
                ""
            );


        this.scope =
            scope;


        this.interpreter =
            interpreter;


        this.tokens =
            this.tokenize(
                this.source
            );


        this.index =
            0;
    }



    /* =====================================================
       TOKENIZER
    ===================================================== */

    tokenize(source) {

        const tokens =
            [];


        let i =
            0;


        while (
            i <
            source.length
        ) {

            const char =
                source[i];


            if (
                /\s/.test(
                    char
                )
            ) {

                i +=
                    1;

                continue;
            }


            /* =============================================
               STRING
            ============================================= */

            if (
                char ===
                    "'" ||
                char ===
                    '"'
            ) {

                const quote =
                    char;


                let value =
                    "";


                i +=
                    1;


                while (
                    i <
                    source.length
                ) {

                    const current =
                        source[i];


                    if (
                        current ===
                        "\\"
                    ) {

                        i +=
                            1;


                        if (
                            i <
                            source.length
                        ) {

                            const escaped =
                                source[i];


                            if (
                                escaped ===
                                "n"
                            ) {

                                value +=
                                    "\n";

                            } else if (
                                escaped ===
                                "t"
                            ) {

                                value +=
                                    "\t";

                            } else {

                                value +=
                                    escaped;
                            }


                            i +=
                                1;

                            continue;
                        }
                    }


                    if (
                        current ===
                        quote
                    ) {

                        i +=
                            1;

                        break;
                    }


                    value +=
                        current;


                    i +=
                        1;
                }


                tokens.push({

                    type:
                        "string",

                    value
                });


                continue;
            }


            /* =============================================
               NUMBER
            ============================================= */

            if (
                /[0-9]/.test(
                    char
                ) ||
                (
                    char ===
                        "." &&
                    /[0-9]/.test(
                        source[
                            i + 1
                        ] ||
                        ""
                    )
                )
            ) {

                let raw =
                    char;


                i +=
                    1;


                while (
                    i <
                    source.length &&
                    /[0-9.]/.test(
                        source[i]
                    )
                ) {

                    raw +=
                        source[i];

                    i +=
                        1;
                }


                tokens.push({

                    type:
                        "number",

                    value:
                        Number(
                            raw
                        )
                });


                continue;
            }


            /* =============================================
               IDENTIFIER
            ============================================= */

            if (
                /[A-Za-z_]/.test(
                    char
                )
            ) {

                let name =
                    char;


                i +=
                    1;


                while (
                    i <
                    source.length &&
                    /[A-Za-z0-9_]/.test(
                        source[i]
                    )
                ) {

                    name +=
                        source[i];

                    i +=
                        1;
                }


                tokens.push({

                    type:
                        "identifier",

                    value:
                        name
                });


                continue;
            }


            /* =============================================
               OPERATORS
            ============================================= */

            const three =
                source.slice(
                    i,
                    i + 3
                );


            const two =
                source.slice(
                    i,
                    i + 2
                );


            if (
                [
                    "**=",
                    "//="
                ].includes(
                    three
                )
            ) {

                tokens.push({

                    type:
                        "operator",

                    value:
                        three
                });


                i +=
                    3;

                continue;
            }


            if (
                [
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
                ].includes(
                    two
                )
            ) {

                tokens.push({

                    type:
                        "operator",

                    value:
                        two
                });


                i +=
                    2;

                continue;
            }


            if (
                "+-*/%<>()[]{}:,."
                    .includes(
                        char
                    )
            ) {

                tokens.push({

                    type:
                        "operator",

                    value:
                        char
                });


                i +=
                    1;

                continue;
            }


            throw new Error(
                `Caractère non reconnu : ${char}`
            );
        }


        tokens.push({

            type:
                "eof",

            value:
                null
        });


        return tokens;
    }



    /* =====================================================
       HELPERS
    ===================================================== */

    current() {

        return this.tokens[
            this.index
        ];
    }


    next() {

        const token =
            this.tokens[
                this.index
            ];


        this.index +=
            1;


        return token;
    }


    matchValue(value) {

        if (
            this.current()
                .value ===
            value
        ) {

            this.index +=
                1;


            return true;
        }


        return false;
    }


    matchIdentifier(value) {

        const token =
            this.current();


        if (
            token.type ===
                "identifier" &&
            token.value ===
                value
        ) {

            this.index +=
                1;


            return true;
        }


        return false;
    }


    expectValue(value) {

        if (
            !this.matchValue(
                value
            )
        ) {

            throw new Error(
                `« ${value} » attendu`
            );
        }
    }



    /* =====================================================
       PARSE
    ===================================================== */

    parse() {

        const value =
            this.parseOr();


        if (
            this.current()
                .type !==
            "eof"
        ) {

            throw new Error(
                `Expression invalide près de « ${this.current().value} »`
            );
        }


        return value;
    }



    parseOr() {

        let left =
            this.parseAnd();


        while (
            this.matchIdentifier(
                "or"
            )
        ) {

            const right =
                this.parseAnd();


            left =
                Boolean(
                    left
                ) ||
                Boolean(
                    right
                );
        }


        return left;
    }



    parseAnd() {

        let left =
            this.parseNot();


        while (
            this.matchIdentifier(
                "and"
            )
        ) {

            const right =
                this.parseNot();


            left =
                Boolean(
                    left
                ) &&
                Boolean(
                    right
                );
        }


        return left;
    }



    parseNot() {

        if (
            this.matchIdentifier(
                "not"
            )
        ) {

            return !Boolean(
                this.parseNot()
            );
        }


        return this.parseComparison();
    }



    parseComparison() {

        let left =
            this.parseAdditive();


        while (
            true
        ) {

            /*
             * "not in"
             */

            if (
                this.current()
                    .type ===
                    "identifier" &&
                this.current()
                    .value ===
                    "not" &&
                this.tokens[
                    this.index +
                    1
                ]?.value ===
                    "in"
            ) {

                this.index +=
                    2;


                const right =
                    this.parseAdditive();


                left =
                    !this.contains(
                        right,
                        left
                    );


                continue;
            }


            /*
             * "in"
             */

            if (
                this.matchIdentifier(
                    "in"
                )
            ) {

                const right =
                    this.parseAdditive();


                left =
                    this.contains(
                        right,
                        left
                    );


                continue;
            }


            const operator =
                this.current()
                    .value;


            if (
                ![
                    "==",
                    "!=",
                    "<",
                    ">",
                    "<=",
                    ">="
                ].includes(
                    operator
                )
            ) {

                break;
            }


            this.index +=
                1;


            const right =
                this.parseAdditive();


            switch (
                operator
            ) {

                case "==":

                    left =
                        left ===
                        right;

                    break;


                case "!=":

                    left =
                        left !==
                        right;

                    break;


                case "<":

                    left =
                        left <
                        right;

                    break;


                case ">":

                    left =
                        left >
                        right;

                    break;


                case "<=":

                    left =
                        left <=
                        right;

                    break;


                case ">=":

                    left =
                        left >=
                        right;

                    break;
            }
        }


        return left;
    }



    contains(
        container,
        value
    ) {

        if (
            Array.isArray(
                container
            ) ||
            typeof container ===
                "string"
        ) {

            return container
                .includes(
                    value
                );
        }


        if (
            container &&
            typeof container ===
                "object"
        ) {

            return Object.prototype
                .hasOwnProperty
                .call(
                    container,
                    value
                );
        }


        return false;
    }



    parseAdditive() {

        let left =
            this.parseMultiplicative();


        while (
            [
                "+",
                "-"
            ].includes(
                this.current()
                    .value
            )
        ) {

            const operator =
                this.next()
                    .value;


            const right =
                this.parseMultiplicative();


            if (
                operator ===
                "+"
            ) {

                left =
                    left +
                    right;

            } else {

                left =
                    left -
                    right;
            }
        }


        return left;
    }



    parseMultiplicative() {

        let left =
            this.parsePower();


        while (
            [
                "*",
                "/",
                "//",
                "%"
            ].includes(
                this.current()
                    .value
            )
        ) {

            const operator =
                this.next()
                    .value;


            const right =
                this.parsePower();


            switch (
                operator
            ) {

                case "*":

                    left =
                        left *
                        right;

                    break;


                case "/":

                    left =
                        left /
                        right;

                    break;


                case "//":

                    left =
                        Math.floor(
                            left /
                            right
                        );

                    break;


                case "%":

                    left =
                        left %
                        right;

                    break;
            }
        }


        return left;
    }



    parsePower() {

        let left =
            this.parseUnary();


        if (
            this.matchValue(
                "**"
            )
        ) {

            const right =
                this.parsePower();


            left =
                left **
                right;
        }


        return left;
    }



    parseUnary() {

        if (
            this.matchValue(
                "-"
            )
        ) {

            return -Number(
                this.parseUnary()
            );
        }


        if (
            this.matchValue(
                "+"
            )
        ) {

            return Number(
                this.parseUnary()
            );
        }


        return this.parsePostfix();
    }



    parsePostfix() {

        let value =
            this.parsePrimary();


        while (
            true
        ) {

            /*
             * CALL
             */

            if (
                this.matchValue(
                    "("
                )
            ) {

                const args =
                    [];


                if (
                    !this.matchValue(
                        ")"
                    )
                ) {

                    do {

                        args.push(
                            this.parseOr()
                        );

                    } while (
                        this.matchValue(
                            ","
                        )
                    );


                    this.expectValue(
                        ")"
                    );
                }


                value =
                    this.interpreter
                        .callValue(
                            value,
                            args
                        );


                continue;
            }


            /*
             * INDEX
             */

            if (
                this.matchValue(
                    "["
                )
            ) {

                const index =
                    this.parseOr();


                this.expectValue(
                    "]"
                );


                if (
                    value ===
                        null ||
                    value ===
                        undefined
                ) {

                    throw new Error(
                        "Index utilisé sur une valeur vide."
                    );
                }


                value =
                    value[
                        index
                    ];


                continue;
            }


            break;
        }


        return value;
    }



    parsePrimary() {

        const token =
            this.next();


        if (
            token.type ===
            "number"
        ) {

            return token.value;
        }


        if (
            token.type ===
            "string"
        ) {

            return token.value;
        }


        if (
            token.type ===
            "identifier"
        ) {

            switch (
                token.value
            ) {

                case "True":

                    return true;


                case "False":

                    return false;


                case "None":

                    return null;
            }


            return this.scope
                .get(
                    token.value
                );
        }


        /*
         * Parenthèses
         */

        if (
            token.value ===
            "("
        ) {

            const value =
                this.parseOr();


            this.expectValue(
                ")"
            );


            return value;
        }


        /*
         * Liste
         */

        if (
            token.value ===
            "["
        ) {

            const values =
                [];


            if (
                !this.matchValue(
                    "]"
                )
            ) {

                do {

                    values.push(
                        this.parseOr()
                    );

                } while (
                    this.matchValue(
                        ","
                    )
                );


                this.expectValue(
                    "]"
                );
            }


            return values;
        }


        /*
         * Dictionnaire
         */

        if (
            token.value ===
            "{"
        ) {

            const object =
                {};


            if (
                !this.matchValue(
                    "}"
                )
            ) {

                do {

                    const key =
                        this.parseOr();


                    this.expectValue(
                        ":"
                    );


                    const value =
                        this.parseOr();


                    object[
                        key
                    ] =
                        value;

                } while (
                    this.matchValue(
                        ","
                    )
                );


                this.expectValue(
                    "}"
                );
            }


            return object;
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

    constructor(
        game,
        source
    ) {

        this.game =
            game;


        this.source =
            String(
                source ||
                ""
            );


        this.globalScope =
            new PytScope();


        this.currentLine =
            0;


        this.maxLoopIterations =
            600;


        this.installBuiltins();
    }



    /* =====================================================
       BUILTINS
    ===================================================== */

    installBuiltins() {

        const bind =
            (
                name,
                callback
            ) => {

                this.globalScope
                    .set(
                        name,
                        callback
                    );
            };


        /*
         * Déplacement officiel.
         */

        bind(
            "forward",
            distance =>
                this.game
                    .apiForward(
                        distance
                    )
        );


        bind(
            "backward",
            distance =>
                this.game
                    .apiBackward(
                        distance
                    )
        );


        bind(
            "left",
            degrees =>
                this.game
                    .apiLeft(
                        degrees
                    )
        );


        bind(
            "right",
            degrees =>
                this.game
                    .apiRight(
                        degrees
                    )
        );


        /*
         * Anciens alias pour ne pas casser
         * les niveaux déjà créés.
         */

        bind(
            "avancer",
            distance =>
                this.game
                    .apiForward(
                        distance
                    )
        );


        bind(
            "reculer",
            distance =>
                this.game
                    .apiBackward(
                        distance
                    )
        );


        bind(
            "tourner_gauche",
            degrees =>
                this.game
                    .apiLeft(
                        degrees ??
                        90
                    )
        );


        bind(
            "tourner_droite",
            degrees =>
                this.game
                    .apiRight(
                        degrees ??
                        90
                    )
        );


        /*
         * Turtle supplémentaire.
         */

        bind(
            "setheading",
            degrees =>
                this.game
                    .apiSetHeading(
                        degrees
                    )
        );


        bind(
            "goto",
            (
                x,
                y
            ) =>
                this.game
                    .apiGoto(
                        x,
                        y
                    )
        );


        /*
         * Informations environnement.
         */

        bind(
            "front_is_clear",
            () =>
                this.game
                    .frontIsClear()
        );


        bind(
            "devant_libre",
            () =>
                this.game
                    .frontIsClear()
        );


        bind(
            "on_object",
            () =>
                this.game
                    .robotOnObject()
        );


        bind(
            "sur_objet",
            () =>
                this.game
                    .robotOnObject()
        );


        bind(
            "position_x",
            () =>
                this.game
                    .getRobotX()
        );


        bind(
            "position_y",
            () =>
                this.game
                    .getRobotY()
        );


        bind(
            "xcor",
            () =>
                this.game
                    .getRobotX()
        );


        bind(
            "ycor",
            () =>
                this.game
                    .getRobotY()
        );


        bind(
            "direction",
            () =>
                this.game
                    .getRobotDirection()
        );


        bind(
            "inventory_contains",
            item =>
                this.game
                    .inventoryContains(
                        item
                    )
        );


        bind(
            "inventaire_contient",
            item =>
                this.game
                    .inventoryContains(
                        item
                    )
        );


        /*
         * Python.
         */

        bind(
            "range",
            (
                start,
                stop,
                step
            ) =>
                this.makeRange(
                    start,
                    stop,
                    step
                )
        );


        bind(
            "len",
            value => {

                if (
                    value ===
                        null ||
                    value ===
                        undefined
                ) {

                    return 0;
                }


                if (
                    typeof value.length ===
                    "number"
                ) {

                    return value.length;
                }


                if (
                    typeof value ===
                    "object"
                ) {

                    return Object.keys(
                        value
                    ).length;
                }


                return 0;
            }
        );


        bind(
            "print",
            (...values) => {

                const text =
                    values
                        .map(
                            value =>
                                this.pythonString(
                                    value
                                )
                        )
                        .join(
                            " "
                        );


                this.game
                    .programOutput
                    .push(
                        text
                    );


                return null;
            }
        );


        bind(
            "int",
            value =>
                parseInt(
                    value,
                    10
                )
        );


        bind(
            "float",
            value =>
                Number(
                    value
                )
        );


        bind(
            "str",
            value =>
                this.pythonString(
                    value
                )
        );


        bind(
            "round",
            (
                value,
                digits = 0
            ) => {

                const factor =
                    10 **
                    Number(
                        digits
                    );


                return Math.round(
                    Number(
                        value
                    ) *
                    factor
                ) /
                factor;
            }
        );


        bind(
            "min",
            (...values) => {

                const flattened =
                    (
                        values.length ===
                            1 &&
                        Array.isArray(
                            values[0]
                        )
                    )
                        ? values[0]
                        : values;


                return Math.min(
                    ...flattened
                );
            }
        );


        bind(
            "max",
            (...values) => {

                const flattened =
                    (
                        values.length ===
                            1 &&
                        Array.isArray(
                            values[0]
                        )
                    )
                        ? values[0]
                        : values;


                return Math.max(
                    ...flattened
                );
            }
        );
    }



    makeRange(
        start,
        stop,
        step
    ) {

        if (
            stop ===
            undefined
        ) {

            stop =
                start;

            start =
                0;
        }


        if (
            step ===
                undefined ||
            step ===
                null
        ) {

            step =
                1;
        }


        start =
            Number(
                start
            );


        stop =
            Number(
                stop
            );


        step =
            Number(
                step
            );


        if (
            step ===
            0
        ) {

            throw new Error(
                "range() ne peut pas avoir un pas de 0."
            );
        }


        const values =
            [];


        let guard =
            0;


        if (
            step >
            0
        ) {

            for (
                let value = start;
                value < stop;
                value += step
            ) {

                values.push(
                    value
                );


                guard +=
                    1;


                if (
                    guard >
                    10000
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

                values.push(
                    value
                );


                guard +=
                    1;


                if (
                    guard >
                    10000
                ) {

                    break;
                }
            }
        }


        return values;
    }



    pythonString(value) {

        if (
            value ===
            true
        ) {

            return "True";
        }


        if (
            value ===
            false
        ) {

            return "False";
        }


        if (
            value ===
            null ||
            value ===
            undefined
        ) {

            return "None";
        }


        if (
            Array.isArray(
                value
            )
        ) {

            return `[${value
                .map(
                    item =>
                        this.pythonString(
                            item
                        )
                )
                .join(", ")}]`;
        }


        if (
            typeof value ===
            "object"
        ) {

            return JSON.stringify(
                value
            );
        }


        return String(
            value
        );
    }



    /* =====================================================
       PRÉPARATION DU CODE
    ===================================================== */

    stripComment(line) {

        let quote =
            null;


        let escaped =
            false;


        for (
            let i = 0;
            i < line.length;
            i += 1
        ) {

            const char =
                line[i];


            if (
                escaped
            ) {

                escaped =
                    false;

                continue;
            }


            if (
                char ===
                "\\"
            ) {

                escaped =
                    true;

                continue;
            }


            if (
                quote
            ) {

                if (
                    char ===
                    quote
                ) {

                    quote =
                        null;
                }


                continue;
            }


            if (
                char ===
                    "'" ||
                char ===
                    '"'
            ) {

                quote =
                    char;

                continue;
            }


            if (
                char ===
                "#"
            ) {

                return line.slice(
                    0,
                    i
                );
            }
        }


        return line;
    }



    bracketDepth(text) {

        let depth =
            0;


        let quote =
            null;


        let escaped =
            false;


        for (
            const char
            of text
        ) {

            if (
                escaped
            ) {

                escaped =
                    false;

                continue;
            }


            if (
                char ===
                "\\"
            ) {

                escaped =
                    true;

                continue;
            }


            if (
                quote
            ) {

                if (
                    char ===
                    quote
                ) {

                    quote =
                        null;
                }


                continue;
            }


            if (
                char ===
                    "'" ||
                char ===
                    '"'
            ) {

                quote =
                    char;

                continue;
            }


            if (
                "([{".includes(
                    char
                )
            ) {

                depth +=
                    1;
            }


            if (
                ")]}".includes(
                    char
                )
            ) {

                depth -=
                    1;
            }
        }


        return depth;
    }



    prepareLines() {

        const raw =
            this.source
                .replace(
                    /\r\n?/g,
                    "\n"
                )
                .split(
                    "\n"
                );


        const prepared =
            [];


        let buffer =
            null;


        let bufferLine =
            0;


        let bufferIndent =
            0;


        raw.forEach(
            (
                rawLine,
                index
            ) => {

                const withoutComment =
                    this.stripComment(
                        rawLine
                    );


                if (
                    buffer !==
                    null
                ) {

                    buffer +=
                        " " +
                        withoutComment
                            .trim();


                    if (
                        this.bracketDepth(
                            buffer
                        ) <=
                        0
                    ) {

                        prepared.push({

                            line:
                                bufferLine,

                            indent:
                                bufferIndent,

                            text:
                                buffer.trim()
                        });


                        buffer =
                            null;
                    }


                    return;
                }


                const trimmed =
                    withoutComment
                        .trim();


                if (
                    trimmed ===
                    ""
                ) {

                    continue;
                }


                const spaces =
                    withoutComment
                        .match(
                            /^[ \t]*/
                        )[0]
                        .replace(
                            /\t/g,
                            "    "
                        )
                        .length;


                if (
                    this.bracketDepth(
                        trimmed
                    ) >
                    0
                ) {

                    buffer =
                        trimmed;


                    bufferLine =
                        index +
                        1;


                    bufferIndent =
                        spaces;


                    return;
                }


                prepared.push({

                    line:
                        index +
                        1,

                    indent:
                        spaces,

                    text:
                        trimmed
                });
            }
        );


        if (
            buffer !==
            null
        ) {

            throw new Error(
                "Parenthèse, liste ou dictionnaire non terminé."
            );
        }


        return prepared;
    }



    /* =====================================================
       ARBRE D'INDENTATION
    ===================================================== */

    buildTree() {

        const lines =
            this.prepareLines();


        const root =
            {

                indent:
                    -1,

                children:
                    []
            };


        const stack =
            [
                root
            ];


        for (
            const line
            of lines
        ) {

            while (
                stack.length >
                    1 &&
                line.indent <=
                    stack[
                        stack.length -
                        1
                    ].indent
            ) {

                stack.pop();
            }


            const parent =
                stack[
                    stack.length -
                    1
                ];


            const node =
                {

                    ...line,

                    children:
                        []
                };


            parent.children.push(
                node
            );


            if (
                line.text.endsWith(
                    ":"
                )
            ) {

                stack.push(
                    node
                );
            }
        }


        return root.children;
    }



    /* =====================================================
       EXÉCUTION
    ===================================================== */

    execute() {

        const nodes =
            this.buildTree();


        this.executeNodes(
            nodes,
            this.globalScope
        );


        return {

            output:
                this.game
                    .programOutput
                    .slice()
        };
    }



    executeNodes(
        nodes,
        scope
    ) {

        for (
            let index = 0;
            index < nodes.length;
            index += 1
        ) {

            const node =
                nodes[
                    index
                ];


            this.currentLine =
                node.line;


            const text =
                node.text;


            /*
             * IF / ELIF / ELSE
             */

            if (
                /^if\b/.test(
                    text
                )
            ) {

                const chain =
                    [
                        node
                    ];


                let nextIndex =
                    index +
                    1;


                while (
                    nextIndex <
                        nodes.length &&
                    /^(?:elif\b|else\s*:)/.test(
                        nodes[
                            nextIndex
                        ].text
                    )
                ) {

                    chain.push(
                        nodes[
                            nextIndex
                        ]
                    );


                    nextIndex +=
                        1;
                }


                this.executeIfChain(
                    chain,
                    scope
                );


                index =
                    nextIndex -
                    1;


                continue;
            }


            /*
             * ELIF / ELSE isolé
             */

            if (
                /^(?:elif\b|else\s*:)/.test(
                    text
                )
            ) {

                continue;
            }


            /*
             * FOR
             */

            if (
                /^for\b/.test(
                    text
                )
            ) {

                this.executeFor(
                    node,
                    scope
                );


                continue;
            }


            /*
             * WHILE
             */

            if (
                /^while\b/.test(
                    text
                )
            ) {

                this.executeWhile(
                    node,
                    scope
                );


                continue;
            }


            /*
             * DEF
             */

            if (
                /^def\b/.test(
                    text
                )
            ) {

                this.executeDefinition(
                    node,
                    scope
                );


                continue;
            }


            /*
             * RETURN
             */

            if (
                /^return(?:\s|$)/.test(
                    text
                )
            ) {

                const expression =
                    text
                        .replace(
                            /^return\b/,
                            ""
                        )
                        .trim();


                const value =
                    expression
                        ? this.evaluate(
                            expression,
                            scope
                        )
                        : null;


                throw new PytReturnSignal(
                    value
                );
            }


            /*
             * BREAK
             */

            if (
                text ===
                "break"
            ) {

                throw new PytBreakSignal();
            }


            /*
             * PASS
             */

            if (
                text ===
                "pass"
            ) {

                continue;
            }


            this.executeSimpleStatement(
                text,
                scope
            );
        }
    }



    executeIfChain(
        chain,
        scope
    ) {

        for (
            const node
            of chain
        ) {

            const text =
                node.text;


            if (
                /^if\b/.test(
                    text
                )
            ) {

                const expression =
                    text
                        .replace(
                            /^if\b/,
                            ""
                        )
                        .replace(
                            /:\s*$/,
                            ""
                        )
                        .trim();


                if (
                    Boolean(
                        this.evaluate(
                            expression,
                            scope
                        )
                    )
                ) {

                    this.executeNodes(
                        node.children,
                        scope
                    );


                    return;
                }


                continue;
            }


            if (
                /^elif\b/.test(
                    text
                )
            ) {

                const expression =
                    text
                        .replace(
                            /^elif\b/,
                            ""
                        )
                        .replace(
                            /:\s*$/,
                            ""
                        )
                        .trim();


                if (
                    Boolean(
                        this.evaluate(
                            expression,
                            scope
                        )
                    )
                ) {

                    this.executeNodes(
                        node.children,
                        scope
                    );


                    return;
                }


                continue;
            }


            if (
                /^else\s*:/.test(
                    text
                )
            ) {

                this.executeNodes(
                    node.children,
                    scope
                );


                return;
            }
        }
    }



    executeFor(
        node,
        scope
    ) {

        const match =
            node.text.match(
                /^for\s+([A-Za-z_]\w*)\s+in\s+(.+):$/
            );


        if (
            !match
        ) {

            throw new Error(
                "Boucle for invalide."
            );
        }


        const variable =
            match[1];


        const iterable =
            this.evaluate(
                match[2],
                scope
            );


        if (
            iterable ===
                null ||
            iterable ===
                undefined ||
            typeof iterable[
                Symbol.iterator
            ] !==
                "function"
        ) {

            throw new Error(
                "La valeur utilisée dans for n'est pas parcourable."
            );
        }


        let iterations =
            0;


        for (
            const value
            of iterable
        ) {

            iterations +=
                1;


            if (
                iterations >
                this.maxLoopIterations
            ) {

                throw new Error(
                    "La boucle for effectue trop d'itérations."
                );
            }


            scope.set(
                variable,
                value
            );


            try {

                this.executeNodes(
                    node.children,
                    scope
                );

            } catch (
                signal
            ) {

                if (
                    signal instanceof
                    PytBreakSignal
                ) {

                    break;
                }


                throw signal;
            }
        }
    }



    executeWhile(
        node,
        scope
    ) {

        const expression =
            node.text
                .replace(
                    /^while\b/,
                    ""
                )
                .replace(
                    /:\s*$/,
                    ""
                )
                .trim();


        let iterations =
            0;


        while (
            Boolean(
                this.evaluate(
                    expression,
                    scope
                )
            )
        ) {

            iterations +=
                1;


            if (
                iterations >
                this.maxLoopIterations
            ) {

                throw new Error(
                    "La boucle while semble infinie."
                );
            }


            try {

                this.executeNodes(
                    node.children,
                    scope
                );

            } catch (
                signal
            ) {

                if (
                    signal instanceof
                    PytBreakSignal
                ) {

                    break;
                }


                throw signal;
            }
        }
    }



    executeDefinition(
        node,
        scope
    ) {

        const match =
            node.text.match(
                /^def\s+([A-Za-z_]\w*)\s*\((.*?)\)\s*:$/
            );


        if (
            !match
        ) {

            throw new Error(
                "Définition de fonction invalide."
            );
        }


        const name =
            match[1];


        const params =
            match[2]
                .split(
                    ","
                )
                .map(
                    param =>
                        param.trim()
                )
                .filter(
                    Boolean
                );


        scope.set(
            name,
            {

                __pytFunction:
                    true,

                name,

                params,

                body:
                    node.children,

                closure:
                    scope
            }
        );
    }



    executeSimpleStatement(
        text,
        scope
    ) {

        /*
         * Affectation augmentée.
         */

        const augmented =
            text.match(
                /^([A-Za-z_]\w*)\s*(\+=|-=|\*=|\/=|%=)\s*(.+)$/
            );


        if (
            augmented
        ) {

            const name =
                augmented[1];


            const operator =
                augmented[2];


            const right =
                this.evaluate(
                    augmented[3],
                    scope
                );


            const left =
                scope.get(
                    name
                );


            switch (
                operator
            ) {

                case "+=":

                    scope.set(
                        name,
                        left +
                        right
                    );

                    return;


                case "-=":

                    scope.set(
                        name,
                        left -
                        right
                    );

                    return;


                case "*=":

                    scope.set(
                        name,
                        left *
                        right
                    );

                    return;


                case "/=":

                    scope.set(
                        name,
                        left /
                        right
                    );

                    return;


                case "%=":

                    scope.set(
                        name,
                        left %
                        right
                    );

                    return;
            }
        }


        /*
         * Affectation simple.
         */

        const assignment =
            text.match(
                /^([A-Za-z_]\w*)\s*=(?!=)\s*(.+)$/
            );


        if (
            assignment
        ) {

            const name =
                assignment[1];


            const value =
                this.evaluate(
                    assignment[2],
                    scope
                );


            scope.set(
                name,
                value
            );


            return;
        }


        /*
         * Expression / appel.
         */

        this.evaluate(
            text,
            scope
        );
    }



    evaluate(
        expression,
        scope
    ) {

        const parser =
            new PytExpressionParser(
                expression,
                scope,
                this
            );


        return parser.parse();
    }



    callValue(
        value,
        args
    ) {

        if (
            typeof value ===
            "function"
        ) {

            return value(
                ...args
            );
        }


        if (
            value &&
            value.__pytFunction
        ) {

            return this.callUserFunction(
                value,
                args
            );
        }


        throw new Error(
            "Cette valeur n'est pas une fonction."
        );
    }



    callUserFunction(
        definition,
        args
    ) {

        const scope =
            new PytScope(
                definition.closure
            );


        definition.params
            .forEach(
                (
                    param,
                    index
                ) => {

                    scope.set(
                        param,
                        args[
                            index
                        ]
                    );
                }
            );


        try {

            this.executeNodes(
                definition.body,
                scope
            );

        } catch (
            signal
        ) {

            if (
                signal instanceof
                PytReturnSignal
            ) {

                return signal.value;
            }


            throw signal;
        }


        return null;
    }
}



/* =========================================================
   MOTEUR DE JEU
========================================================= */

class PytGame {

    constructor() {

        this.canvas =
            null;


        this.ctx =
            null;


        this.levelData =
            null;


        this.mapWidth =
            8;


        this.mapHeight =
            6;


        this.robot =
            null;


        this.startState =
            null;


        this.logicalObjects =
            [];


        this.logicalTargets =
            [];


        this.visualObjects =
            [];


        this.visualTargets =
            [];


        this.visualRobot =
            null;


        this.actionQueue =
            [];


        this.programOutput =
            [];


        this.runtimeIssues =
            [];


        this.stats =
            {};


        this.executing =
            false;


        this.animationFrame =
            null;


        this.boardLayout =
            null;


        this.bindEvents();

        this.initCanvas();
    }



    /* =====================================================
       INITIALISATION
    ===================================================== */

    initCanvas() {

        this.canvas =
            document.getElementById(
                "game-canvas"
            );


        if (
            !this.canvas
        ) {

            return;
        }


        this.ctx =
            this.canvas.getContext(
                "2d"
            );


        this.ctx.imageSmoothingEnabled =
            false;


        this.render();
    }



    bindEvents() {

        window.addEventListener(
            "pyt:load-level",
            event => {

                this.loadLevel(
                    event.detail
                        ?.data ||
                    event.detail ||
                    {}
                );
            }
        );


        window.addEventListener(
            "pyt:reload-world",
            event => {

                this.loadLevel(
                    event.detail
                        ?.data ||
                    this.levelData ||
                    {}
                );
            }
        );


        window.addEventListener(
            "pyt:run-code",
            event => {

                this.executeSource(
                    event.detail
                        ?.code ||
                    ""
                );
            }
        );


        /*
         * Correction du branchement visuel
         * des lignes d'erreur.
         */

        window.addEventListener(
            "pyt:code-error-line",
            event => {

                const line =
                    Number(
                        event.detail
                            ?.line
                    );


                if (
                    line >
                    0
                ) {

                    window.pytUI
                        ?.renderCodeError(
                            line
                        );
                }
            }
        );


        window.addEventListener(
            "resize",
            () => {

                this.render();
            }
        );
    }



    /* =====================================================
       CHARGEMENT NIVEAU
    ===================================================== */

    loadLevel(data) {

        this.stopAnimation();


        this.levelData =
            this.clone(
                data ||
                {}
            );


        this.mapWidth =
            Number(
                this.levelData
                    ?.map
                    ?.width ??
                this.levelData
                    ?.width ??
                8
            );


        this.mapHeight =
            Number(
                this.levelData
                    ?.map
                    ?.height ??
                this.levelData
                    ?.height ??
                6
            );


        if (
            !Number.isFinite(
                this.mapWidth
            ) ||
            this.mapWidth <
                1
        ) {

            this.mapWidth =
                8;
        }


        if (
            !Number.isFinite(
                this.mapHeight
            ) ||
            this.mapHeight <
                1
        ) {

            this.mapHeight =
                6;
        }


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


        this.visualObjects =
            this.clone(
                this.logicalObjects
            );


        this.visualTargets =
            this.clone(
                this.logicalTargets
            );


        this.visualRobot =
            {

                x:
                    this.robot.x,

                y:
                    this.robot.y,

                direction:
                    this.robot.direction,

                inventory:
                    []
            };


        this.resetStats();


        this.actionQueue =
            [];


        this.programOutput =
            [];


        this.runtimeIssues =
            [];


        this.executing =
            false;


        this.updateStatus(
            "Prêt"
        );


        this.render();
    }



    extractStart(data) {

        const candidates = [

            data.robotStart,

            data.start,

            data.robot?.start,

            data.robot,

            data.map?.start,

            data.map?.robotStart
        ];


        let source =
            {};


        for (
            const candidate
            of candidates
        ) {

            if (
                candidate &&
                typeof candidate ===
                    "object"
            ) {

                source =
                    candidate;

                break;
            }
        }


        return {

            x:
                Number(
                    source.x ??
                    source.col ??
                    source.column ??
                    0
                ),

            y:
                Number(
                    source.y ??
                    source.row ??
                    source.line ??
                    0
                ),

            direction:
                this.normalizeDirection(
                    source.direction ??
                    source.heading ??
                    "E"
                )
        };
    }



    extractObjects(data) {

        const source =
            data.objects ??
            data.map?.objects ??
            [];


        if (
            !Array.isArray(
                source
            )
        ) {

            return [];
        }


        return source.map(
            (
                object,
                index
            ) => ({

                ...this.clone(
                    object
                ),

                id:
                    object.id ??
                    `object-${index + 1}`,

                x:
                    Number(
                        object.x ??
                        object.col ??
                        0
                    ),

                y:
                    Number(
                        object.y ??
                        object.row ??
                        0
                    )
            })
        );
    }



    extractTargets(data) {

        const source =
            data.targets ??
            data.map?.targets ??
            [];


        if (
            !Array.isArray(
                source
            )
        ) {

            return [];
        }


        return source.map(
            (
                target,
                index
            ) => ({

                ...this.clone(
                    target
                ),

                id:
                    target.id ??
                    `target-${index + 1}`,

                x:
                    Number(
                        target.x ??
                        target.col ??
                        0
                    ),

                y:
                    Number(
                        target.y ??
                        target.row ??
                        0
                    )
            })
        );
    }



    createRobot(start) {

        let robot =
            null;


        /*
         * On conserve robot.js comme objet principal
         * lorsque PytRobot existe.
         */

        if (
            typeof window.PytRobot ===
            "function"
        ) {

            try {

                robot =
                    new window.PytRobot(
                        {

                            x:
                                start.x,

                            y:
                                start.y,

                            direction:
                                start.direction
                        }
                    );

            } catch (
                firstError
            ) {

                try {

                    robot =
                        new window.PytRobot(
                            start.x,
                            start.y,
                            start.direction
                        );

                } catch (
                secondError
                ) {

                    robot =
                        null;
                }
            }
        }


        if (
            !robot
        ) {

            robot =
                {};
        }


        /*
         * Normalisation de l'état.
         */

        robot.x =
            start.x;


        robot.y =
            start.y;


        robot.direction =
            start.direction;


        robot.inventory =
            [];


        robot.visited =
            [
                {
                    x:
                        start.x,

                    y:
                        start.y
                }
            ];


        return robot;
    }



    resetStats() {

        this.stats = {

            moves:
                0,

            forward:
                0,

            backward:
                0,

            turns:
                0,

            collisions:
                0,

            picked:
                [],

            deposited:
                [],

            pushed:
                [],

            buttons:
                [],

            doors:
                [],

            cleaned:
                [],

            recharged:
                false
        };
    }



    /* =====================================================
       PROGRAMME
    ===================================================== */

    async executeSource(source) {

        if (
            this.executing ||
            !this.levelData
        ) {

            return;
        }


        this.executing =
            true;


        this.updateStatus(
            "Analyse du programme..."
        );


        /*
         * Repartir du monde initial.
         */

        this.resetLogicalWorld();


        this.programOutput =
            [];


        this.actionQueue =
            [];


        this.runtimeIssues =
            [];


        let syntaxError =
            null;


        let errorLine =
            0;


        try {

            const interpreter =
                new PytInterpreter(
                    this,
                    source
                );


            interpreter.execute();

        } catch (
            error
        ) {

            syntaxError =
                error;


            errorLine =
                Number(
                    error?.line ??
                    error?.lineNumber ??
                    0
                );


            /*
             * Si le parser connaît la ligne actuelle.
             */

            if (
                errorLine ===
                0
            ) {

                try {

                    const interpreterLine =
                        /ligne\s+(\d+)/i
                            .exec(
                                String(
                                    error.message
                                )
                            );


                    if (
                        interpreterLine
                    ) {

                        errorLine =
                            Number(
                                interpreterLine[1]
                            );
                    }

                } catch (
                ignored
                ) {

                    /*
                     * Rien.
                     */
                }
            }
        }


        /*
         * Important :
         * même avec une erreur tardive,
         * les actions déjà créées seront jouées.
         */

        this.prepareVisualPlayback();


        this.updateStatus(
            "Exécution..."
        );


        await this.playActionQueue();


        /*
         * Une erreur de syntaxe/runtime
         * reste un échec après les actions déjà valides.
         */

        if (
            syntaxError
        ) {

            this.finishExecution({

                success:
                    false,

                reason:
                    "runtime_error",

                message:
                    syntaxError.message ||
                    "Le programme contient une erreur.",

                error:
                    syntaxError.message ||
                    String(
                        syntaxError
                    ),

                errorLine,

                output:
                    this.programOutput
                        .slice()
            });


            return;
        }


        /*
         * Validation du résultat.
         */

        const validation =
            this.validateLevel(
                source
            );


        this.finishExecution({

            ...validation,

            output:
                this.programOutput
                    .slice()
        });
    }



    resetLogicalWorld() {

        this.robot.x =
            this.startState.x;


        this.robot.y =
            this.startState.y;


        this.robot.direction =
            this.startState.direction;


        this.robot.inventory =
            [];


        this.robot.visited =
            [
                {

                    x:
                        this.robot.x,

                    y:
                        this.robot.y
                }
            ];


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

            x:
                this.startState.x,

            y:
                this.startState.y,

            direction:
                this.startState.direction,

            inventory:
                []
        };


        this.visualObjects =
            this.extractObjects(
                this.levelData
            );


        this.visualTargets =
            this.extractTargets(
                this.levelData
            );


        this.render();
    }



    finishExecution(result) {

        this.executing =
            false;


        this.updateStatus(
            result.success
                ? "Mission réussie"
                : "À corriger"
        );


        this.render();


        window.dispatchEvent(
            new CustomEvent(
                "pyt:execution-result",
                {

                    detail:
                        result
                }
            )
        );
    }



    /* =====================================================
       API MOUVEMENT
    ===================================================== */

    apiForward(distance = 1) {

        const count =
            this.normalizeDistance(
                distance
            );


        for (
            let i = 0;
            i < count;
            i += 1
        ) {

            this.tryMove(
                1,
                "forward"
            );
        }


        return null;
    }



    apiBackward(distance = 1) {

        const count =
            this.normalizeDistance(
                distance
            );


        for (
            let i = 0;
            i < count;
            i += 1
        ) {

            this.tryMove(
                -1,
                "backward"
            );
        }


        return null;
    }



    normalizeDistance(value) {

        const number =
            Number(
                value ??
                1
            );


        if (
            !Number.isFinite(
                number
            )
        ) {

            throw new Error(
                "La distance doit être un nombre."
            );
        }


        if (
            number <
            0
        ) {

            throw new Error(
                "Utilise backward() pour reculer."
            );
        }


        if (
            !Number.isInteger(
                number
            )
        ) {

            throw new Error(
                "Les déplacements se font case par case avec un nombre entier."
            );
        }


        if (
            number >
            100
        ) {

            throw new Error(
                "Déplacement trop long."
            );
        }


        return number;
    }



    apiLeft(degrees = 90) {

        return this.turnBy(
            -Number(
                degrees ??
                90
            )
        );
    }



    apiRight(degrees = 90) {

        return this.turnBy(
            Number(
                degrees ??
                90
            )
        );
    }



    turnBy(degrees) {

        if (
            !Number.isFinite(
                degrees
            )
        ) {

            throw new Error(
                "L'angle doit être un nombre."
            );
        }


        if (
            degrees %
            90 !==
            0
        ) {

            throw new Error(
                "Dans PYT, les rotations doivent être des multiples de 90°."
            );
        }


        const turns =
            Math.abs(
                degrees /
                90
            );


        const direction =
            degrees >=
                0
                ? 1
                : -1;


        for (
            let i = 0;
            i < turns;
            i += 1
        ) {

            const from =
                this.robot.direction;


            const to =
                this.rotateDirection(
                    from,
                    direction
                );


            this.robot.direction =
                to;


            this.actionQueue.push({

                type:
                    "turn",

                from,

                to,

                direction
            });


            this.stats.turns +=
                1;
        }


        return null;
    }



    apiSetHeading(degrees) {

        const normalized =
            (
                Number(
                    degrees
                ) %
                360 +
                360
            ) %
            360;


        const map = {

            0:
                "E",

            90:
                "S",

            180:
                "W",

            270:
                "N"
        };


        if (
            !Object.prototype
                .hasOwnProperty
                .call(
                    map,
                    normalized
                )
        ) {

            throw new Error(
                "setheading() utilise ici 0, 90, 180 ou 270."
            );
        }


        const from =
            this.robot.direction;


        const to =
            map[
                normalized
            ];


        this.robot.direction =
            to;


        this.actionQueue.push({

            type:
                "turn",

            from,

            to,

            direction:
                0
        });


        return null;
    }



    apiGoto(
        targetX,
        targetY
    ) {

        targetX =
            Number(
                targetX
            );


        targetY =
            Number(
                targetY
            );


        if (
            !Number.isInteger(
                targetX
            ) ||
            !Number.isInteger(
                targetY
            )
        ) {

            throw new Error(
                "goto() utilise des coordonnées entières."
            );
        }


        /*
         * Déplacement grille simple :
         * horizontal puis vertical.
         */

        while (
            this.robot.x !==
            targetX
        ) {

            const desired =
                this.robot.x <
                targetX
                    ? "E"
                    : "W";


            this.turnToDirection(
                desired
            );


            if (
                !this.tryMove(
                    1,
                    "forward"
                )
            ) {

                break;
            }
        }


        while (
            this.robot.y !==
            targetY
        ) {

            const desired =
                this.robot.y <
                targetY
                    ? "S"
                    : "N";


            this.turnToDirection(
                desired
            );


            if (
                !this.tryMove(
                    1,
                    "forward"
                )
            ) {

                break;
            }
        }


        return null;
    }



    turnToDirection(direction) {

        let guard =
            0;


        while (
            this.robot.direction !==
                direction &&
            guard <
                4
        ) {

            this.turnBy(
                90
            );


            guard +=
                1;
        }
    }



    /* =====================================================
       DÉPLACEMENT LOGIQUE
    ===================================================== */

    tryMove(
        sign,
        mode
    ) {

        const vector =
            this.getDirectionVector(
                this.robot.direction
            );


        const dx =
            vector.x *
            sign;


        const dy =
            vector.y *
            sign;


        const from = {

            x:
                this.robot.x,

            y:
                this.robot.y
        };


        const target = {

            x:
                from.x +
                dx,

            y:
                from.y +
                dy
        };


        /*
         * Hors carte.
         */

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


        /*
         * Objet poussable.
         */

        const pushable =
            this.findPushableAt(
                target.x,
                target.y
            );


        if (
            pushable
        ) {

            const objectTarget = {

                x:
                    target.x +
                    dx,

                y:
                    target.y +
                    dy
            };


            if (
                !this.inBounds(
                    objectTarget.x,
                    objectTarget.y
                ) ||
                this.isBlockedCell(
                    objectTarget.x,
                    objectTarget.y,
                    pushable.id
                )
            ) {

                this.registerCollision(
                    from,
                    target
                );


                return false;
            }


            const oldObject = {

                x:
                    pushable.x,

                y:
                    pushable.y
            };


            pushable.x =
                objectTarget.x;


            pushable.y =
                objectTarget.y;


            this.stats.pushed
                .push(
                    pushable.id
                );


            this.actionQueue.push({

                type:
                    "push",

                objectId:
                    pushable.id,

                from:
                    oldObject,

                to:
                    {

                        x:
                            pushable.x,

                        y:
                            pushable.y
                    }
            });
        }


        /*
         * Mur / obstacle.
         */

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


        /*
         * Mouvement logique.
         */

        this.robot.x =
            target.x;


        this.robot.y =
            target.y;


        this.robot.visited
            .push(
                {

                    x:
                        target.x,

                    y:
                        target.y
                }
            );


        this.stats.moves +=
            1;


        if (
            mode ===
            "backward"
        ) {

            this.stats.backward +=
                1;

        } else {

            this.stats.forward +=
                1;
        }


        this.actionQueue.push({

            type:
                "move",

            mode,

            from,

            to:
                target,

            direction:
                this.robot.direction
        });


        /*
         * Interactions automatiques.
         */

        this.applyAutomaticInteractions();


        return true;
    }



    registerCollision(
        from,
        target
    ) {

        this.stats.collisions +=
            1;


        this.runtimeIssues
            .push({

                type:
                    "collision",

                x:
                    target.x,

                y:
                    target.y
            });


        this.actionQueue.push({

            type:
                "bump",

            from,

            target,

            direction:
                this.robot.direction
        });
    }



    /* =====================================================
       INTERACTIONS AUTOMATIQUES
    ===================================================== */

    applyAutomaticInteractions() {

        const x =
            this.robot.x;


        const y =
            this.robot.y;


        /*
         * Objets présents sur la case.
         */

        const objects =
            this.logicalObjects
                .filter(
                    object =>
                        object.x ===
                            x &&
                        object.y ===
                            y
                );


        for (
            const object
            of objects
        ) {

            const type =
                this.normalize(
                    object.type ??
                    object.id
                );


            /*
             * Bouton.
             */

            if (
                this.isButtonType(
                    type
                )
            ) {

                if (
                    !object.activated
                ) {

                    object.activated =
                        true;


                    this.stats.buttons
                        .push(
                            object.id
                        );


                    this.actionQueue.push({

                        type:
                            "button",

                        objectId:
                            object.id,

                        x,

                        y
                    });
                }


                continue;
            }


            /*
             * Recharge.
             */

            if (
                this.isChargerType(
                    type
                )
            ) {

                this.stats.recharged =
                    true;


                this.actionQueue.push({

                    type:
                        "recharge",

                    objectId:
                        object.id,

                    x,

                    y
                });


                continue;
            }


            /*
             * Nettoyage.
             */

            if (
                object.cleanable ===
                    true ||
                this.isDirtyType(
                    type
                )
            ) {

                if (
                    !object.cleaned
                ) {

                    object.cleaned =
                        true;


                    this.stats.cleaned
                        .push(
                            object.id
                        );


                    this.actionQueue.push({

                        type:
                            "clean",

                        objectId:
                            object.id,

                        x,

                        y
                    });
                }


                continue;
            }


            /*
             * Porte.
             */

            if (
                this.isDoorType(
                    type
                )
            ) {

                if (
                    !object.open
                ) {

                    object.open =
                        true;


                    this.stats.doors
                        .push(
                            object.id
                        );


                    this.actionQueue.push({

                        type:
                            "door",

                        objectId:
                            object.id,

                        x,

                        y
                    });
                }


                continue;
            }


            /*
             * Ramassage.
             */

            if (
                this.isAutoPickupObject(
                    object
                )
            ) {

                object.collected =
                    true;


                const inventoryItem = {

                    id:
                        object.id,

                    type:
                        object.type ??
                        object.id,

                    original:
                        this.clone(
                            object
                        )
                };


                this.robot.inventory
                    .push(
                        inventoryItem
                    );


                this.stats.picked
                    .push(
                        object.id
                    );


                this.actionQueue.push({

                    type:
                        "pickup",

                    objectId:
                        object.id,

                    item:
                        inventoryItem,

                    x,

                    y
                });
            }
        }


        /*
         * Retirer les objets ramassés.
         */

        this.logicalObjects =
            this.logicalObjects
                .filter(
                    object =>
                        !object.collected
                );


        /*
         * Dépôt automatique.
         */

        this.tryAutomaticDeposit();
    }



    tryAutomaticDeposit() {

        if (
            !Array.isArray(
                this.robot.inventory
            ) ||
            this.robot.inventory
                .length ===
                0
        ) {

            return;
        }


        const target =
            this.logicalTargets
                .find(
                    item =>
                        item.x ===
                            this.robot.x &&
                        item.y ===
                            this.robot.y &&
                        this.isDepositTarget(
                            item
                        )
                );


        if (
            !target
        ) {

            return;
        }


        const expected =
            target.object ??
            target.objectId ??
            target.requiredObject ??
            target.accepts ??
            null;


        let index =
            0;


        if (
            expected
        ) {

            index =
                this.robot.inventory
                    .findIndex(
                        item =>
                            this.objectMatches(
                                item,
                                expected
                            )
                    );


            if (
                index <
                0
            ) {

                return;
            }
        }


        const item =
            this.robot.inventory
                .splice(
                    index,
                    1
                )[0];


        this.stats.deposited
            .push(
                {

                    object:
                        item.id,

                    target:
                        target.id
                }
            );


        target.completed =
            true;


        this.actionQueue.push({

            type:
                "deposit",

            item,

            targetId:
                target.id,

            x:
                target.x,

            y:
                target.y
        });
    }



    /* =====================================================
       TYPES D'OBJETS
    ===================================================== */

    isPushableObject(object) {

        const type =
            this.normalize(
                object.type ??
                object.id
            );


        if (
            object.pushable ===
            true
        ) {

            return true;
        }


        if (
            object.pushable ===
            false
        ) {

            return false;
        }


        return [
            "caisse",
            "box",
            "crate",
            "caisse_bois"
        ].includes(
            type
        );
    }



    isAutoPickupObject(object) {

        if (
            object.pickable ===
            false
        ) {

            return false;
        }


        if (
            this.isPushableObject(
                object
            )
        ) {

            return false;
        }


        const type =
            this.normalize(
                object.type ??
                object.id
            );


        const pickableTypes = [

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
            object.pickable ===
                true ||
            pickableTypes.includes(
                type
            )
        );
    }



    isButtonType(type) {

        return [
            "button",
            "bouton",
            "switch",
            "interrupteur"
        ].includes(
            type
        );
    }



    isDoorType(type) {

        return [
            "door",
            "porte"
        ].includes(
            type
        );
    }



    isChargerType(type) {

        return [
            "charger",
            "recharge",
            "station_recharge",
            "charging_station"
        ].includes(
            type
        );
    }



    isDirtyType(type) {

        return [
            "dirty",
            "salete",
            "mud",
            "boue",
            "tache"
        ].includes(
            type
        );
    }



    isDepositTarget(target) {

        const type =
            this.normalize(
                target.type ??
                target.id
            );


        return [
            "deposit",
            "depot",
            "drop",
            "destination_objet"
        ].includes(
            type
        );
    }



    /* =====================================================
       COLLISIONS
    ===================================================== */

    getBlockedCells() {

        const source =
            this.levelData
                ?.blocked ??
            this.levelData
                ?.map
                ?.blocked ??
            [];


        return Array.isArray(
            source
        )
            ? source
            : [];
    }



    cellMatches(
        cell,
        x,
        y
    ) {

        if (
            Array.isArray(
                cell
            )
        ) {

            return (
                Number(
                    cell[0]
                ) ===
                    x &&
                Number(
                    cell[1]
                ) ===
                    y
            );
        }


        if (
            cell &&
            typeof cell ===
                "object"
        ) {

            return (
                Number(
                    cell.x ??
                    cell.col
                ) ===
                    x &&
                Number(
                    cell.y ??
                    cell.row
                ) ===
                    y
            );
        }


        return false;
    }



    isBlockedCell(
        x,
        y,
        ignoreObjectId = null
    ) {

        if (
            !this.inBounds(
                x,
                y
            )
        ) {

            return true;
        }


        if (
            this.getBlockedCells()
                .some(
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


        const solidObject =
            this.logicalObjects
                .find(
                    object => {

                        if (
                            object.id ===
                            ignoreObjectId
                        ) {

                            return false;
                        }


                        if (
                            object.x !==
                                x ||
                            object.y !==
                                y
                        ) {

                            return false;
                        }


                        const type =
                            this.normalize(
                                object.type ??
                                object.id
                            );


                        /*
                         * Ces objets n'empêchent pas
                         * Pyt d'entrer sur la case.
                         */

                        if (
                            this.isAutoPickupObject(
                                object
                            ) ||
                            this.isButtonType(
                                type
                            ) ||
                            this.isDoorType(
                                type
                            ) ||
                            this.isChargerType(
                                type
                            ) ||
                            this.isDirtyType(
                                type
                            )
                        ) {

                            return false;
                        }


                        if (
                            this.isPushableObject(
                                object
                            )
                        ) {

                            return true;
                        }


                        return (
                            object.solid ===
                            true
                        );
                    }
                );


        return Boolean(
            solidObject
        );
    }



    findPushableAt(
        x,
        y
    ) {

        return this.logicalObjects
            .find(
                object =>
                    object.x ===
                        x &&
                    object.y ===
                        y &&
                    this.isPushableObject(
                        object
                    )
            ) ||
            null;
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


        if (
            !this.inBounds(
                x,
                y
            )
        ) {

            return false;
        }


        const pushable =
            this.findPushableAt(
                x,
                y
            );


        if (
            pushable
        ) {

            return !this.isBlockedCell(
                x +
                    vector.x,
                y +
                    vector.y,
                pushable.id
            );
        }


        return !this.isBlockedCell(
            x,
            y
        );
    }



    robotOnObject() {

        return this.logicalObjects
            .some(
                object =>
                    object.x ===
                        this.robot.x &&
                    object.y ===
                        this.robot.y
            );
    }



    inventoryContains(value) {

        return this.robot.inventory
            .some(
                item =>
                    this.objectMatches(
                        item,
                        value
                    )
            );
    }



    objectMatches(
        item,
        expected
    ) {

        const expectedValue =
            this.normalize(
                expected
            );


        return [

            item.id,

            item.type,

            item.original?.id,

            item.original?.type

        ]
            .filter(
                Boolean
            )
            .map(
                value =>
                    this.normalize(
                        value
                    )
            )
            .includes(
                expectedValue
            );
    }



    /* =====================================================
       ROBOT INFOS
    ===================================================== */

    getRobotX() {

        return this.robot.x;
    }


    getRobotY() {

        return this.robot.y;
    }


    getRobotDirection() {

        return this.robot.direction;
    }



    /* =====================================================
       DIRECTIONS
    ===================================================== */

    normalizeDirection(direction) {

        const value =
            String(
                direction ||
                "E"
            )
                .toUpperCase();


        const aliases = {

            NORTH:
                "N",

            NORD:
                "N",

            UP:
                "N",

            EAST:
                "E",

            EST:
                "E",

            RIGHT:
                "E",

            SOUTH:
                "S",

            SUD:
                "S",

            DOWN:
                "S",

            WEST:
                "W",

            OUEST:
                "W",

            LEFT:
                "W"
        };


        const normalized =
            aliases[
                value
            ] ||
            value;


        return [
            "N",
            "E",
            "S",
            "W"
        ].includes(
            normalized
        )
            ? normalized
            : "E";
    }



    rotateDirection(
        direction,
        amount
    ) {

        const directions = [
            "N",
            "E",
            "S",
            "W"
        ];


        let index =
            directions.indexOf(
                this.normalizeDirection(
                    direction
                )
            );


        index =
            (
                index +
                amount +
                directions.length
            ) %
            directions.length;


        return directions[
            index
        ];
    }



    getDirectionVector(direction) {

        switch (
            this.normalizeDirection(
                direction
            )
        ) {

            case "N":

                return {

                    x:
                        0,

                    y:
                        -1
                };


            case "S":

                return {

                    x:
                        0,

                    y:
                        1
                };


            case "W":

                return {

                    x:
                        -1,

                    y:
                        0
                };


            default:

                return {

                    x:
                        1,

                    y:
                        0
                };
        }
    }



    inBounds(
        x,
        y
    ) {

        return (
            x >=
                0 &&
            y >=
                0 &&
            x <
                this.mapWidth &&
            y <
                this.mapHeight
        );
    }



    /* =====================================================
       ANIMATION
    ===================================================== */

    async playActionQueue() {

        for (
            const action
            of this.actionQueue
        ) {

            switch (
                action.type
            ) {

                case "move":

                    await this.animateMove(
                        action
                    );

                    break;


                case "turn":

                    await this.animateTurn(
                        action
                    );

                    break;


                case "bump":

                    await this.animateBump(
                        action
                    );

                    break;


                case "pickup":

                    await this.animatePickup(
                        action
                    );

                    break;


                case "push":

                    await this.animatePush(
                        action
                    );

                    break;


                case "deposit":

                    await this.animateDeposit(
                        action
                    );

                    break;


                case "button":

                    await this.animateSimpleInteraction(
                        action,
                        "button"
                    );

                    break;


                case "door":

                    await this.animateSimpleInteraction(
                        action,
                        "door"
                    );

                    break;


                case "clean":

                    await this.animateClean(
                        action
                    );

                    break;


                case "recharge":

                    await this.animateSimpleInteraction(
                        action,
                        "recharge"
                    );

                    break;
            }
        }


        /*
         * Synchronisation visuelle finale.
         */

        this.visualRobot = {

            x:
                this.robot.x,

            y:
                this.robot.y,

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



    animateMove(action) {

        const duration =
            500;


        const from =
            action.from;


        const to =
            action.to;


        this.visualRobot.direction =
            action.direction;


        window.pytApp
            ?.playSfx(
                "step"
            );


        return this.animate(
            duration,
            progress => {

                const eased =
                    this.easeInOut(
                        progress
                    );


                this.visualRobot.x =
                    from.x +
                    (
                        to.x -
                        from.x
                    ) *
                    eased;


                this.visualRobot.y =
                    from.y +
                    (
                        to.y -
                        from.y
                    ) *
                    eased;


                this.render(
                    {

                        moving:
                            true
                    }
                );
            }
        ).then(
            () => {

                this.visualRobot.x =
                    to.x;


                this.visualRobot.y =
                    to.y;


                this.render();
            }
        );
    }



    animateTurn(action) {

        window.pytApp
            ?.playSfx(
                "turn"
            );


        return this.wait(
            170
        ).then(
            () => {

                this.visualRobot.direction =
                    action.to;


                this.render();
            }
        );
    }



    animateBump(action) {

        window.pytApp
            ?.playSfx(
                "bump"
            );


        const vector =
            this.getDirectionVector(
                action.direction
            );


        return this.animate(
            180,
            progress => {

                const amount =
                    Math.sin(
                        progress *
                        Math.PI
                    ) *
                    0.12;


                this.visualRobot.x =
                    action.from.x +
                    vector.x *
                    amount;


                this.visualRobot.y =
                    action.from.y +
                    vector.y *
                    amount;


                this.render();

            }
        ).then(
            () => {

                this.visualRobot.x =
                    action.from.x;


                this.visualRobot.y =
                    action.from.y;


                this.render();
            }
        );
    }



    animatePickup(action) {

        window.pytApp
            ?.playSfx(
                "pickup"
            );


        const object =
            this.visualObjects
                .find(
                    item =>
                        item.id ===
                        action.objectId
                );


        if (
            object
        ) {

            object._pickup =
                true;
        }


        return this.animate(
            260,
            progress => {

                if (
                    object
                ) {

                    object._pickupProgress =
                        progress;
                }


                this.render();

            }
        ).then(
            () => {

                this.visualObjects =
                    this.visualObjects
                        .filter(
                            item =>
                                item.id !==
                                action.objectId
                        );


                this.visualRobot.inventory
                    .push(
                        this.clone(
                            action.item
                        )
                    );


                this.render();
            }
        );
    }



    animatePush(action) {

        window.pytApp
            ?.playSfx(
                "push"
            );


        const object =
            this.visualObjects
                .find(
                    item =>
                        item.id ===
                        action.objectId
                );


        if (
            !object
        ) {

            return Promise.resolve();
        }


        return this.animate(
            360,
            progress => {

                const eased =
                    this.easeInOut(
                        progress
                    );


                object.x =
                    action.from.x +
                    (
                        action.to.x -
                        action.from.x
                    ) *
                    eased;


                object.y =
                    action.from.y +
                    (
                        action.to.y -
                        action.from.y
                    ) *
                    eased;


                this.render();

            }
        ).then(
            () => {

                object.x =
                    action.to.x;


                object.y =
                    action.to.y;


                this.render();
            }
        );
    }



    animateDeposit(action) {

        window.pytApp
            ?.playSfx(
                "drop"
            );


        this.visualRobot.inventory =
            this.visualRobot.inventory
                .filter(
                    item =>
                        item.id !==
                        action.item.id
                );


        this.visualObjects.push({

            ...this.clone(
                action.item.original
            ),

            id:
                `${action.item.id}-deposited`,

            x:
                action.x,

            y:
                action.y,

            deposited:
                true,

            pickable:
                false
        });


        return this.animate(
            250,
            () => {

                this.render();
            }
        );
    }



    animateSimpleInteraction(
        action,
        sound
    ) {

        window.pytApp
            ?.playSfx(
                sound
            );


        return this.animate(
            220,
            progress => {

                this.render(
                    {

                        interaction:
                            progress
                    }
                );
            }
        );
    }



    animateClean(action) {

        const object =
            this.visualObjects
                .find(
                    item =>
                        item.id ===
                        action.objectId
                );


        return this.animate(
            260,
            progress => {

                if (
                    object
                ) {

                    object._cleanProgress =
                        progress;
                }


                this.render();

            }
        ).then(
            () => {

                this.visualObjects =
                    this.visualObjects
                        .filter(
                            item =>
                                item.id !==
                                action.objectId
                        );


                this.render();
            }
        );
    }



    animate(
        duration,
        update
    ) {

        return new Promise(
            resolve => {

                const start =
                    performance.now();


                const frame =
                    now => {

                        const progress =
                            Math.min(
                                1,
                                (
                                    now -
                                    start
                                ) /
                                duration
                            );


                        update(
                            progress
                        );


                        if (
                            progress >=
                            1
                        ) {

                            this.animationFrame =
                                null;


                            resolve();

                            return;
                        }


                        this.animationFrame =
                            requestAnimationFrame(
                                frame
                            );
                    };


                this.animationFrame =
                    requestAnimationFrame(
                        frame
                    );
            }
        );
    }



    wait(duration) {

        return new Promise(
            resolve => {

                window.setTimeout(
                    resolve,
                    duration
                );
            }
        );
    }



    easeInOut(value) {

        return value <
            0.5
            ? 2 *
                value *
                value
            : 1 -
                Math.pow(
                    -2 *
                        value +
                        2,
                    2
                ) /
                2;
    }



    stopAnimation() {

        if (
            this.animationFrame
        ) {

            cancelAnimationFrame(
                this.animationFrame
            );


            this.animationFrame =
                null;
        }
    }



    /* =====================================================
       VALIDATION
    ===================================================== */

    validateLevel(source) {

        const goal =
            this.levelData
                ?.goal ||
            {};


        /*
         * 1. Concepts obligatoires.
         */

        const missingConcepts =
            PytCodeAnalyzer
                .missingConcepts(
                    source,
                    this.levelData
                        ?.requiredConcepts
                );


        if (
            missingConcepts.length >
            0
        ) {

            return {

                success:
                    false,

                reason:
                    "concept_missing",

                message:
                    "Ton programme atteint peut-être une partie de l’objectif, mais il n’utilise pas encore toutes les notions demandées dans ce chapitre.",

                missingConcepts
            };
        }


        /*
         * 2. Destination finale.
         */

        const destination =
            this.extractGoalPosition(
                goal
            ) ||
            this.findDestinationTarget();


        if (
            destination &&
            (
                this.robot.x !==
                    destination.x ||
                this.robot.y !==
                    destination.y
            )
        ) {

            return {

                success:
                    false,

                reason:
                    "wrong_destination",

                wrongDestination:
                    true,

                message:
                    "Pyt n’est pas arrivé à la bonne destination."
            };
        }


        /*
         * 3. Objet à ramasser.
         */

        const requiredObject =
            goal.requiredObject ??
            goal.required_object ??
            goal.pickup ??
            null;


        if (
            requiredObject
        ) {

            const picked =
                this.stats.picked
                    .some(
                        id =>
                            this.normalize(
                                id
                            ) ===
                            this.normalize(
                                requiredObject
                            )
                    ) ||
                this.robot.inventory
                    .some(
                        item =>
                            this.objectMatches(
                                item,
                                requiredObject
                            )
                    ) ||
                this.stats.deposited
                    .some(
                        entry =>
                            this.normalize(
                                entry.object
                            ) ===
                            this.normalize(
                                requiredObject
                            )
                    );


            if (
                !picked
            ) {

                return {

                    success:
                        false,

                    reason:
                        "object_missing",

                    message:
                        "Il manque encore un objet important pour terminer la mission."
                };
            }
        }


        /*
         * 4. Dépôts.
         */

        const depositTargets =
            this.logicalTargets
                .filter(
                    target =>
                        this.isDepositTarget(
                            target
                        )
                );


        const unfinishedDeposit =
            depositTargets
                .find(
                    target => {

                        if (
                            target.optional ===
                            true
                        ) {

                            return false;
                        }


                        return !target.completed;
                    }
                );


        if (
            unfinishedDeposit
        ) {

            return {

                success:
                    false,

                reason:
                    "deposit_missing",

                message:
                    "Un objet n’a pas encore été déposé au bon endroit."
            };
        }


        /*
         * 5. Boutons.
         */

        const requiredButtons =
            Number(
                goal.buttons ??
                goal.requiredButtons ??
                0
            );


        if (
            requiredButtons >
                0 &&
            this.stats.buttons.length <
                requiredButtons
        ) {

            return {

                success:
                    false,

                reason:
                    "objective_incomplete",

                message:
                    "Il reste encore un mécanisme à activer."
            };
        }


        /*
         * 6. Nettoyage.
         */

        const requiredCleaned =
            Number(
                goal.cleaned ??
                goal.requiredCleaned ??
                0
            );


        if (
            requiredCleaned >
                0 &&
            this.stats.cleaned.length <
                requiredCleaned
        ) {

            return {

                success:
                    false,

                reason:
                    "objective_incomplete",

                message:
                    "La mission de nettoyage n’est pas encore terminée."
            };
        }


        /*
         * 7. Recharge.
         */

        if (
            goal.recharge ===
                true &&
            !this.stats.recharged
        ) {

            return {

                success:
                    false,

                reason:
                    "objective_incomplete",

                message:
                    "Pyt doit encore atteindre sa station de recharge."
            };
        }


        /*
         * 8. Nombre minimum de déplacements.
         *
         * Utilisable lorsqu'un niveau doit empêcher
         * un raccourci pédagogique.
         */

        const minimumMoves =
            Number(
                goal.minimum_moves ??
                goal.minimumMoves ??
                0
            );


        if (
            minimumMoves >
                0 &&
            this.stats.moves <
                minimumMoves
        ) {

            return {

                success:
                    false,

                reason:
                    "objective_incomplete",

                message:
                    "Le trajet n’est pas encore complet."
            };
        }


        /*
         * 9. Pas de collision si demandé.
         */

        if (
            goal.noCollisions ===
                true &&
            this.stats.collisions >
                0
        ) {

            return {

                success:
                    false,

                reason:
                    "objective_incomplete",

                message:
                    "Pyt a bien avancé, mais il a rencontré un obstacle pendant son trajet."
            };
        }


        /*
         * 10. Succès.
         */

        return {

            success:
                true,

            reason:
                "success",

            message:
                "Mission réussie !"
        };
    }



    extractGoalPosition(goal) {

        const candidates = [

            goal.position,

            goal.destination,

            goal.target,

            (
                Number.isFinite(
                    Number(
                        goal.x
                    )
                ) &&
                Number.isFinite(
                    Number(
                        goal.y
                    )
                )
                    ? goal
                    : null
            )
        ];


        for (
            const candidate
            of candidates
        ) {

            if (
                !candidate
            ) {

                continue;
            }


            const x =
                Number(
                    candidate.x ??
                    candidate.col
                );


            const y =
                Number(
                    candidate.y ??
                    candidate.row
                );


            if (
                Number.isFinite(
                    x
                ) &&
                Number.isFinite(
                    y
                )
            ) {

                return {

                    x,

                    y
                };
            }
        }


        return null;
    }



    findDestinationTarget() {

        const target =
            this.logicalTargets
                .find(
                    item => {

                        const type =
                            this.normalize(
                                item.type ??
                                item.id
                            );


                        return [
                            "goal",
                            "objectif",
                            "destination",
                            "finish",
                            "arrivee"
                        ].includes(
                            type
                        );
                    }
                );


        if (
            !target
        ) {

            return null;
        }


        return {

            x:
                target.x,

            y:
                target.y
        };
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


        const ctx =
            this.ctx;


        const width =
            this.canvas.width;


        const height =
            this.canvas.height;


        ctx.save();

        ctx.imageSmoothingEnabled =
            false;


        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        /*
         * Fond global.
         */

        this.drawRoomBackground(
            ctx,
            width,
            height
        );


        if (
            !this.levelData
        ) {

            ctx.restore();

            return;
        }


        this.boardLayout =
            this.calculateBoardLayout(
                width,
                height
            );


        /*
         * Plateau logique.
         */

        this.drawBoardFloor(
            ctx
        );


        /*
         * Grille claire.
         */

        this.drawGrid(
            ctx
        );


        /*
         * Zones objectif / dépôt.
         */

        this.drawTargets(
            ctx
        );


        /*
         * Décor défini dans levels.js.
         */

        this.drawDecorations(
            ctx
        );


        /*
         * Obstacles logiques.
         */

        this.drawBlockedCells(
            ctx
        );


        /*
         * Objets interactifs.
         */

        this.drawObjects(
            ctx
        );


        /*
         * Robot.
         */

        this.drawRobot(
            ctx,
            options
        );


        /*
         * Bord du plateau.
         */

        this.drawBoardBorder(
            ctx
        );


        ctx.restore();
    }



    drawRoomBackground(
        ctx,
        width,
        height
    ) {

        const room =
            this.normalize(
                this.levelData
                    ?.room ||
                window.pytUI
                    ?.getChapterData(
                        window.pytApp
                            ?.currentChapter ||
                        1
                    )
                    ?.room ||
                "entree"
            );


        /*
         * Bord extérieur.
         */

        ctx.fillStyle =
            "#10111a";


        ctx.fillRect(
            0,
            0,
            width,
            height
        );


        if (
            window.PYTArt
        ) {

            /*
             * Grande pièce complète.
             *
             * furniture:false :
             * on laisse les vraies décorations de levels.js
             * définir les obstacles du niveau.
             */

            window.PYTArt
                .drawRoomScene(
                    ctx,
                    room,
                    16,
                    16,
                    width -
                        32,
                    height -
                        32,
                    {

                        furniture:
                            false
                    }
                );
        }
    }



    calculateBoardLayout(
        canvasWidth,
        canvasHeight
    ) {

        /*
         * On laisse une vraie bordure de pièce
         * autour du plateau.
         */

        const marginX =
            78;


        const marginTop =
            78;


        const marginBottom =
            60;


        const availableWidth =
            canvasWidth -
            marginX *
                2;


        const availableHeight =
            canvasHeight -
            marginTop -
            marginBottom;


        const tileSize =
            Math.floor(
                Math.min(
                    availableWidth /
                        this.mapWidth,
                    availableHeight /
                        this.mapHeight
                )
            );


        const boardWidth =
            tileSize *
            this.mapWidth;


        const boardHeight =
            tileSize *
            this.mapHeight;


        return {

            tileSize,

            width:
                boardWidth,

            height:
                boardHeight,

            x:
                Math.round(
                    (
                        canvasWidth -
                        boardWidth
                    ) /
                    2
                ),

            y:
                Math.round(
                    marginTop +
                    (
                        availableHeight -
                        boardHeight
                    ) /
                    2
                )
        };
    }



    drawBoardFloor(ctx) {

        const layout =
            this.boardLayout;


        const room =
            this.normalize(
                this.levelData
                    ?.room ||
                "entree"
            );


        /*
         * Ombre plateau.
         */

        ctx.fillStyle =
            "rgba(0,0,0,0.28)";


        ctx.fillRect(
            layout.x +
                8,
            layout.y +
                9,
            layout.width,
            layout.height
        );


        /*
         * Une légère couche claire sous la grille
         * rend chaque case beaucoup plus lisible.
         */

        ctx.save();

        ctx.globalAlpha =
            0.18;


        ctx.fillStyle =
            room ===
                "garage"
                ? "#e1e2e4"
                : room ===
                    "cave_a_vin"
                    ? "#d6d1d6"
                    : "#fff0cd";


        ctx.fillRect(
            layout.x,
            layout.y,
            layout.width,
            layout.height
        );


        ctx.restore();


        /*
         * Légère alternance de cases.
         */

        for (
            let row = 0;
            row < this.mapHeight;
            row += 1
        ) {

            for (
                let column = 0;
                column < this.mapWidth;
                column += 1
            ) {

                if (
                    (
                        row +
                        column
                    ) %
                    2 ===
                    0
                ) {

                    continue;
                }


                const cell =
                    this.cellRect(
                        column,
                        row
                    );


                ctx.save();

                ctx.globalAlpha =
                    0.055;


                ctx.fillStyle =
                    "#000000";


                ctx.fillRect(
                    cell.x,
                    cell.y,
                    cell.size,
                    cell.size
                );


                ctx.restore();
            }
        }
    }



    drawGrid(ctx) {

        if (
            !window.PYTArt
        ) {

            return;
        }


        for (
            let row = 0;
            row < this.mapHeight;
            row += 1
        ) {

            for (
                let column = 0;
                column < this.mapWidth;
                column += 1
            ) {

                const cell =
                    this.cellRect(
                        column,
                        row
                    );


                window.PYTArt
                    .drawGridCell(
                        ctx,
                        cell.x,
                        cell.y,
                        cell.size,
                        {

                            alpha:
                                0.48,

                            color:
                                "#fff3d7"
                        }
                    );
            }
        }
    }



    drawTargets(ctx) {

        const targets =
            this.executing
                ? this.visualTargets
                : this.logicalTargets;


        for (
            const target
            of targets
        ) {

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
                this.isDepositTarget(
                    target
                )
            ) {

                window.PYTArt
                    ?.drawDeposit(
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
                ].includes(
                    type
                )
            ) {

                window.PYTArt
                    ?.drawGoal(
                        ctx,
                        cell.x,
                        cell.y,
                        cell.size
                    );
            }
        }


        /*
         * Goal défini directement dans goal.position.
         */

        const position =
            this.extractGoalPosition(
                this.levelData
                    ?.goal ||
                {}
            );


        if (
            position &&
            !targets.some(
                target =>
                    target.x ===
                        position.x &&
                    target.y ===
                        position.y
            )
        ) {

            const cell =
                this.cellRect(
                    position.x,
                    position.y
                );


            window.PYTArt
                ?.drawGoal(
                    ctx,
                    cell.x,
                    cell.y,
                    cell.size
                );
        }
    }



    drawDecorations(ctx) {

        const decorations =
            this.levelData
                ?.decorations ??
            this.levelData
                ?.map
                ?.decorations ??
            [];


        if (
            !Array.isArray(
                decorations
            )
        ) {

            return;
        }


        for (
            const decoration
            of decorations
        ) {

            const x =
                Number(
                    decoration.x ??
                    decoration.col
                );


            const y =
                Number(
                    decoration.y ??
                    decoration.row
                );


            if (
                !Number.isFinite(
                    x
                ) ||
                !Number.isFinite(
                    y
                )
            ) {

                continue;
            }


            const cell =
                this.cellRect(
                    x,
                    y
                );


            const scale =
                Number(
                    decoration.scale ??
                    0.94
                );


            const size =
                cell.size *
                scale;


            const offset =
                (
                    cell.size -
                    size
                ) /
                2;


            window.PYTArt
                ?.draw(
                    ctx,
                    decoration.type ??
                    decoration.id ??
                    "unknown",
                    cell.x +
                        offset,
                    cell.y +
                        offset,
                    size,
                    decoration
                );
        }
    }



    drawBlockedCells(ctx) {

        const blocked =
            this.getBlockedCells();


        blocked.forEach(
            cell => {

                let x;
                let y;


                if (
                    Array.isArray(
                        cell
                    )
                ) {

                    x =
                        Number(
                            cell[0]
                        );

                    y =
                        Number(
                            cell[1]
                        );

                } else {

                    x =
                        Number(
                            cell.x ??
                            cell.col
                        );

                    y =
                        Number(
                            cell.y ??
                            cell.row
                        );
                }


                if (
                    !Number.isFinite(
                        x
                    ) ||
                    !Number.isFinite(
                        y
                    )
                ) {

                    return;
                }


                const rect =
                    this.cellRect(
                        x,
                        y
                    );


                /*
                 * Très léger indicateur.
                 * Le décor doit rester visible.
                 */

                window.PYTArt
                    ?.drawBlocked(
                        ctx,
                        rect.x,
                        rect.y,
                        rect.size
                    );
            }
        );
    }



    drawObjects(ctx) {

        const objects =
            this.executing
                ? this.visualObjects
                : this.logicalObjects;


        for (
            const object
            of objects
        ) {

            if (
                object.hidden ===
                true
            ) {

                continue;
            }


            const cell =
                this.cellRect(
                    object.x,
                    object.y
                );


            let size =
                cell.size *
                0.74;


            let offset =
                (
                    cell.size -
                    size
                ) /
                2;


            if (
                this.isPushableObject(
                    object
                )
            ) {

                size =
                    cell.size *
                    0.83;


                offset =
                    (
                        cell.size -
                        size
                    ) /
                    2;
            }


            /*
             * Petit halo pour les objets ramassables.
             */

            if (
                this.isAutoPickupObject(
                    object
                )
            ) {

                ctx.save();


                const centerX =
                    cell.x +
                    cell.size /
                    2;


                const centerY =
                    cell.y +
                    cell.size /
                    2;


                const gradient =
                    ctx.createRadialGradient(
                        centerX,
                        centerY,
                        0,
                        centerX,
                        centerY,
                        cell.size *
                            0.48
                    );


                gradient.addColorStop(
                    0,
                    "rgba(255,238,150,0.18)"
                );


                gradient.addColorStop(
                    1,
                    "rgba(255,238,150,0)"
                );


                ctx.fillStyle =
                    gradient;


                ctx.fillRect(
                    cell.x,
                    cell.y,
                    cell.size,
                    cell.size
                );


                ctx.restore();
            }


            let artType =
                this.getObjectArtType(
                    object
                );


            let drawY =
                cell.y +
                offset;


            let drawSize =
                size;


            if (
                object._pickup
            ) {

                const progress =
                    Number(
                        object._pickupProgress ||
                        0
                    );


                drawY -=
                    cell.size *
                    progress *
                    0.3;


                drawSize *=
                    1 -
                    progress *
                    0.55;
            }


            if (
                object._cleanProgress
            ) {

                ctx.save();

                ctx.globalAlpha =
                    1 -
                    object._cleanProgress;
            }


            window.PYTArt
                ?.draw(
                    ctx,
                    artType,
                    cell.x +
                        (
                            cell.size -
                            drawSize
                        ) /
                        2,
                    drawY,
                    drawSize,
                    object
                );


            if (
                object._cleanProgress
            ) {

                ctx.restore();
            }
        }
    }



    getObjectArtType(object) {

        const raw =
            this.normalize(
                object.art ??
                object.type ??
                object.id ??
                ""
            );


        /*
         * IDs particuliers.
         */

        if (
            raw.includes(
                "livre_rouge"
            )
        ) {

            return "livre_rouge";
        }


        if (
            raw.includes(
                "livre_bleu"
            )
        ) {

            return "livre_bleu";
        }


        if (
            raw.includes(
                "bouteille_rouge"
            )
        ) {

            return "bouteille_rouge";
        }


        if (
            raw.includes(
                "bouteille_bleue"
            )
        ) {

            return "bouteille_bleue";
        }


        if (
            raw.includes(
                "bouteille_verte"
            )
        ) {

            return "bouteille_verte";
        }


        if (
            raw.includes(
                "bouteille_jaune"
            )
        ) {

            return "bouteille_jaune";
        }


        if (
            raw.includes(
                "boite_outils"
            )
        ) {

            return "boite_outils";
        }


        /*
         * Suppression d'un numéro final :
         * jouet_1 → jouet
         */

        return raw
            .replace(
                /_\d+$/,
                ""
            );
    }



    drawRobot(
        ctx,
        options = {}
    ) {

        const robot =
            this.visualRobot ||
            this.robot;


        if (
            !robot
        ) {

            return;
        }


        const cell =
            this.cellRect(
                robot.x,
                robot.y
            );


        const size =
            cell.size *
            0.76;


        const offset =
            (
                cell.size -
                size
            ) /
                2;


        if (
            window.PYTArt
        ) {

            window.PYTArt
                .drawPyt(
                    ctx,
                    cell.x +
                        offset,
                    cell.y +
                        offset -
                        cell.size *
                        0.06,
                    size,
                    robot.direction,
                    {

                        bob:
                            Boolean(
                                options.moving
                            ),

                        happy:
                            false
                    }
                );
        }
    }



    drawBoardBorder(ctx) {

        const layout =
            this.boardLayout;


        ctx.save();


        /*
         * Bord sombre.
         */

        ctx.strokeStyle =
            "rgba(15,13,24,0.78)";


        ctx.lineWidth =
            5;


        ctx.strokeRect(
            layout.x -
                3,
            layout.y -
                3,
            layout.width +
                6,
            layout.height +
                6
        );


        /*
         * Petit highlight.
         */

        ctx.strokeStyle =
            "rgba(255,239,205,0.30)";


        ctx.lineWidth =
            2;


        ctx.strokeRect(
            layout.x,
            layout.y,
            layout.width,
            layout.height
        );


        ctx.restore();
    }



    /* =====================================================
       CASES
    ===================================================== */

    cellRect(
        x,
        y
    ) {

        const layout =
            this.boardLayout ||
            this.calculateBoardLayout(
                this.canvas?.width ||
                960,
                this.canvas?.height ||
                640
            );


        const size =
            layout.tileSize;


        return {

            x:
                layout.x +
                Number(
                    x
                ) *
                size,

            y:
                layout.y +
                Number(
                    y
                ) *
                size,

            size
        };
    }



    /* =====================================================
       STATUS
    ===================================================== */

    updateStatus(text) {

        const status =
            document.getElementById(
                "game-status"
            );


        if (
            status
        ) {

            status.textContent =
                text;
        }
    }



    /* =====================================================
       UTILS
    ===================================================== */

    normalize(value) {

        return String(
            value ??
            ""
        )
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



    clone(value) {

        if (
            value ===
                undefined
        ) {

            return undefined;
        }


        return JSON.parse(
            JSON.stringify(
                value
            )
        );
    }
}



/* =========================================================
   EXPORT / START
========================================================= */

function startPytGame() {

    if (
        window.pytGame
    ) {

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
    document.readyState ===
    "loading"
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