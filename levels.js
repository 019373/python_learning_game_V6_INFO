"use strict";

/* =========================================================
   PYT - levels.js
   =========================================================

   CONTENU DU JEU

   9 chapitres
   3 exercices par chapitre
   27 exercices

   ---------------------------------------------------------

   CHAPITRES :

   1. Entrée
      Séquences et déplacements

   2. Cuisine
      Variables

   3. Salon
      Conditions

   4. Chambre
      Boucles for

   5. Garage
      Fonctions

   6. Cave à vin
      Listes

   7. Balcon
      Dictionnaires

   8. Salle d'eau
      Boucles while

   9. Jardin
      Mission finale

   ---------------------------------------------------------

   COMMANDES DE DÉPLACEMENT :

       forward(1)
       backward(1)
       left(90)
       right(90)

   ---------------------------------------------------------

   Les interactions sont automatiques :

   - objet traversé → ramassé
   - zone de dépôt → objet déposé
   - caisse → poussée si possible
   - bouton → activé
   - boue → nettoyée
   - station → recharge
   - porte → ouverte

========================================================= */


/* =========================================================
   HELPERS
========================================================= */

const PYT_MAP_WIDTH =
    8;


const PYT_MAP_HEIGHT =
    6;



function decoration(
    type,
    x,
    y,
    scale = 0.92,
    options = {}
) {

    return {

        type,

        x,

        y,

        scale,

        ...options
    };
}



function object(
    id,
    type,
    x,
    y,
    options = {}
) {

    return {

        id,

        type,

        x,

        y,

        ...options
    };
}



function target(
    id,
    type,
    x,
    y,
    options = {}
) {

    return {

        id,

        type,

        x,

        y,

        ...options
    };
}



function cell(
    x,
    y
) {

    return {

        x,

        y
    };
}



function levelKey(
    chapter,
    level
) {

    return `${chapter}-${level}`;
}



/* =========================================================
   DÉCORS COMMUNS
========================================================= */

function getRoomDecorations(
    room,
    variant = 0
) {

    switch (
        room
    ) {

        /* =================================================
           ENTRÉE
        ================================================= */

        case "entree":

            return [

                decoration(
                    "plante",
                    0,
                    0,
                    0.80
                ),

                decoration(
                    "table",
                    6,
                    0,
                    1.18
                ),

                decoration(
                    "lampe",
                    7,
                    0,
                    0.62
                ),

                decoration(
                    "tapis",
                    3,
                    2,
                    1.45
                ),

                decoration(
                    "caisse",
                    0,
                    4,
                    0.66
                ),

                decoration(
                    "chaise",
                    7,
                    4,
                    0.72
                )
            ];


        /* =================================================
           CUISINE
        ================================================= */

        case "cuisine":

            return [

                decoration(
                    "frigo",
                    0,
                    0,
                    1.04
                ),

                decoration(
                    "evier",
                    2,
                    0,
                    1.34
                ),

                decoration(
                    "four",
                    6,
                    0,
                    0.96
                ),

                decoration(
                    "table",
                    3,
                    2,
                    1.55
                ),

                decoration(
                    "chaise",
                    2,
                    2,
                    0.63
                ),

                decoration(
                    "chaise",
                    5,
                    2,
                    0.63
                ),

                decoration(
                    "plante",
                    7,
                    4,
                    0.67
                ),

                decoration(
                    "tasse",
                    4,
                    2,
                    0.38
                )
            ];


        /* =================================================
           SALON
        ================================================= */

        case "salon":

            return [

                decoration(
                    "canape",
                    0,
                    1,
                    1.75
                ),

                decoration(
                    "table",
                    3,
                    2,
                    1.16
                ),

                decoration(
                    "bibliotheque",
                    6,
                    0,
                    1.20
                ),

                decoration(
                    "lampe",
                    5,
                    0,
                    0.63
                ),

                decoration(
                    "plante",
                    7,
                    4,
                    0.72
                ),

                decoration(
                    "tapis",
                    3,
                    3,
                    1.55
                ),

                decoration(
                    "livre",
                    4,
                    2,
                    0.34
                )
            ];


        /* =================================================
           CHAMBRE
        ================================================= */

        case "chambre":

            return [

                decoration(
                    "lit",
                    5,
                    0,
                    1.82
                ),

                decoration(
                    "tapis",
                    3,
                    2,
                    1.50
                ),

                decoration(
                    "table",
                    0,
                    0,
                    0.80
                ),

                decoration(
                    "lampe",
                    1,
                    0,
                    0.56
                ),

                decoration(
                    "plante",
                    7,
                    4,
                    0.69
                ),

                decoration(
                    "livre_bleu",
                    1,
                    1,
                    0.35
                )
            ];


        /* =================================================
           GARAGE
        ================================================= */

        case "garage":

            return [

                decoration(
                    "voiture",
                    5,
                    1,
                    1.95
                ),

                decoration(
                    "boite_outils",
                    7,
                    0,
                    0.84
                ),

                decoration(
                    "caisse",
                    0,
                    0,
                    0.72
                ),

                decoration(
                    "caisse",
                    0,
                    1,
                    0.60
                ),

                decoration(
                    "lampe",
                    7,
                    4,
                    0.63
                )
            ];


        /* =================================================
           CAVE À VIN
        ================================================= */

        case "cave_a_vin":

            return [

                decoration(
                    "casier_vin",
                    0,
                    0,
                    1.30
                ),

                decoration(
                    "casier_vin",
                    6,
                    0,
                    1.30
                ),

                decoration(
                    "tonneau",
                    0,
                    4,
                    0.88
                ),

                decoration(
                    "tonneau",
                    7,
                    4,
                    0.88
                ),

                decoration(
                    "table",
                    3,
                    2,
                    1.08
                ),

                decoration(
                    "lampe",
                    4,
                    0,
                    0.58
                ),

                decoration(
                    "bouteille_rouge",
                    4,
                    2,
                    0.32
                )
            ];


        /* =================================================
           BALCON
        ================================================= */

        case "balcon":

            return [

                decoration(
                    "table",
                    3,
                    2,
                    1.12
                ),

                decoration(
                    "chaise",
                    2,
                    2,
                    0.63
                ),

                decoration(
                    "chaise",
                    5,
                    2,
                    0.63
                ),

                decoration(
                    "plante",
                    0,
                    0,
                    0.78
                ),

                decoration(
                    "fleurs",
                    7,
                    0,
                    0.75
                ),

                decoration(
                    "arrosoir",
                    7,
                    4,
                    0.52
                ),

                decoration(
                    "lampe",
                    0,
                    4,
                    0.58
                )
            ];


        /* =================================================
           SALLE D'EAU
        ================================================= */

        case "toilette":

            return [

                decoration(
                    "toilette",
                    0,
                    1,
                    1.00
                ),

                decoration(
                    "lavabo",
                    6,
                    0,
                    1.00
                ),

                decoration(
                    "plante",
                    7,
                    4,
                    0.60
                ),

                decoration(
                    "lampe",
                    4,
                    0,
                    0.50
                ),

                decoration(
                    "tapis",
                    3,
                    3,
                    1.20
                )
            ];


        /* =================================================
           JARDIN
        ================================================= */

        case "jardin":

            return [

                decoration(
                    "arbre",
                    0,
                    0,
                    1.18
                ),

                decoration(
                    "arbre",
                    7,
                    0,
                    1.18
                ),

                decoration(
                    "buisson",
                    0,
                    4,
                    0.90
                ),

                decoration(
                    "fleurs",
                    1,
                    0,
                    0.72
                ),

                decoration(
                    "fleurs",
                    7,
                    4,
                    0.72
                ),

                decoration(
                    "piscine",
                    5,
                    2,
                    1.75,
                    {

                        animate:
                            true
                    }
                ),

                decoration(
                    "transat",
                    4,
                    0,
                    0.73
                ),

                decoration(
                    "transat",
                    5,
                    0,
                    0.73
                ),

                decoration(
                    "banc",
                    1,
                    4,
                    0.92
                ),

                decoration(
                    "fontaine",
                    3,
                    0,
                    0.76
                )
            ];


        default:

            return [];
    }
}



/* =========================================================
   DONNÉES
========================================================= */

const PYT_LEVEL_DATA = {

    version:
        "8.0",


    /* =====================================================
       CHAPITRES
    ===================================================== */

    chapters: [

        /* =================================================
           CHAPITRE 1
           ENTRÉE
        ================================================= */

        {

            chapter:
                1,

            title:
                "Premiers pas",

            subtitle:
                "Déplacer Pyt dans la maison",

            room:
                "entree",

            theory: [

                {

                    title:
                        "Bienvenue dans PYT",

                    body: [

                        "Pyt se déplace sur une grille. Chaque case correspond à un déplacement.",

                        "Tu vas écrire de petites instructions Python pour lui indiquer où aller."
                    ]
                },

                {

                    title:
                        "Avancer",

                    body:
                        "La commande forward() fait avancer Pyt dans la direction qu’il regarde.",

                    code:
`forward(1)

forward(3)`
                },

                {

                    title:
                        "Tourner",

                    body:
                        "Pyt peut tourner à gauche ou à droite. Un quart de tour correspond à 90 degrés.",

                    code:
`left(90)

right(90)`
                },

                {

                    title:
                        "Reculer",

                    body:
                        "backward() déplace Pyt vers l’arrière sans changer la direction dans laquelle il regarde.",

                    code:
`backward(2)`
                },

                {

                    title:
                        "Une instruction après l’autre",

                    body:
                        "Python exécute les lignes dans l’ordre, de haut en bas.",

                    code:
`forward(2)
right(90)
forward(1)`
                }
            ],


            levels: [

                /* =========================================
                   1-1
                ========================================= */

                {

                    chapter:
                        1,

                    level:
                        1,

                    room:
                        "entree",

                    title:
                        "Le couloir",

                    difficulty:
                        "Découverte",

                    instruction:
                        "Fais avancer Pyt jusqu’à la zone lumineuse.",

                    guideMessage:
                        "Compte les cases entre Pyt et l’objectif. Utilise forward().",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            1,

                        y:
                            4,

                        direction:
                            "E"
                    },

                    blocked: [

                        cell(
                            0,
                            0
                        ),

                        cell(
                            6,
                            0
                        ),

                        cell(
                            7,
                            0
                        ),

                        cell(
                            0,
                            4
                        ),

                        cell(
                            7,
                            4
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "entree",
                            1
                        ),

                    objects:
                        [],

                    targets: [

                        target(
                            "goal",
                            "goal",
                            5,
                            4
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                5,

                            y:
                                4
                        }
                    },

                    requiredConcepts: [

                        "forward"
                    ],

                    starterCode:
`# Fais avancer Pyt jusqu'à l'objectif.
`,

                    hints: [

                        "Pyt regarde vers la droite.",

                        "Compte combien de cases séparent Pyt de l’objectif.",

                        "forward(nombre) permet d’avancer de plusieurs cases."
                    ]
                },


                /* =========================================
                   1-2
                ========================================= */

                {

                    chapter:
                        1,

                    level:
                        2,

                    room:
                        "entree",

                    title:
                        "Tourner dans l’entrée",

                    difficulty:
                        "Facile",

                    instruction:
                        "Rejoins l’objectif situé plus haut dans la pièce.",

                    guideMessage:
                        "Cette fois, Pyt devra avancer puis changer de direction.",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            1,

                        y:
                            4,

                        direction:
                            "E"
                    },

                    blocked: [

                        cell(
                            0,
                            0
                        ),

                        cell(
                            6,
                            0
                        ),

                        cell(
                            7,
                            0
                        ),

                        cell(
                            2,
                            2
                        ),

                        cell(
                            3,
                            2
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "entree",
                            2
                        ),

                    objects:
                        [],

                    targets: [

                        target(
                            "goal",
                            "goal",
                            4,
                            1
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                4,

                            y:
                                1
                        }
                    },

                    requiredConcepts: [

                        "forward",

                        "left"
                    ],

                    starterCode:
`# Avance, tourne, puis continue vers l'objectif.
`,

                    hints: [

                        "Commence par rejoindre la colonne de l’objectif.",

                        "Depuis l’est, left(90) fait regarder Pyt vers le nord."
                    ]
                },


                /* =========================================
                   1-3
                ========================================= */

                {

                    chapter:
                        1,

                    level:
                        3,

                    room:
                        "entree",

                    title:
                        "Marche arrière",

                    difficulty:
                        "Facile",

                    instruction:
                        "Utilise aussi la marche arrière pour rejoindre l’objectif.",

                    guideMessage:
                        "backward() permet de reculer sans changer le regard de Pyt.",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            5,

                        y:
                            4,

                        direction:
                            "E"
                    },

                    blocked: [

                        cell(
                            0,
                            0
                        ),

                        cell(
                            6,
                            0
                        ),

                        cell(
                            7,
                            0
                        ),

                        cell(
                            6,
                            3
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "entree",
                            3
                        ),

                    objects:
                        [],

                    targets: [

                        target(
                            "goal",
                            "goal",
                            3,
                            2
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                3,

                            y:
                                2
                        }
                    },

                    requiredConcepts: [

                        "backward",

                        "left",

                        "forward"
                    ],

                    starterCode:
`# Utilise au moins une fois backward().
`,

                    hints: [

                        "Pyt peut commencer par reculer.",

                        "Reculer ne change pas sa direction.",

                        "Une rotation sera ensuite nécessaire."
                    ]
                }
            ]
        },



        /* =================================================
           CHAPITRE 2
           CUISINE
        ================================================= */

        {

            chapter:
                2,

            title:
                "Variables",

            subtitle:
                "Donner un nom aux valeurs",

            room:
                "cuisine",

            theory: [

                {

                    title:
                        "Une variable",

                    body:
                        "Une variable permet de stocker une valeur sous un nom.",

                    code:
`distance = 3`
                },

                {

                    title:
                        "Réutiliser une valeur",

                    body:
                        "Une fois créée, la variable peut être utilisée à la place du nombre.",

                    code:
`distance = 3

forward(distance)`
                },

                {

                    title:
                        "Plusieurs variables",

                    body:
                        "Tu peux stocker plusieurs informations séparément.",

                    code:
`horizontal = 2
vertical = 4`
                },

                {

                    title:
                        "Modifier une variable",

                    body:
                        "La valeur d’une variable peut changer pendant le programme.",

                    code:
`distance = 2
distance = distance + 1`
                }
            ],


            levels: [

                /* =========================================
                   2-1
                ========================================= */

                {

                    chapter:
                        2,

                    level:
                        1,

                    room:
                        "cuisine",

                    title:
                        "La bonne distance",

                    difficulty:
                        "Facile",

                    instruction:
                        "Stocke la distance dans une variable puis rejoins l’objectif.",

                    guideMessage:
                        "Crée une variable contenant le nombre de cases à parcourir.",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            1,

                        y:
                            3,

                        direction:
                            "E"
                    },

                    blocked: [

                        cell(
                            0,
                            0
                        ),

                        cell(
                            2,
                            0
                        ),

                        cell(
                            3,
                            0
                        ),

                        cell(
                            6,
                            0
                        ),

                        cell(
                            3,
                            2
                        ),

                        cell(
                            4,
                            2
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "cuisine",
                            1
                        ),

                    objects:
                        [],

                    targets: [

                        target(
                            "goal",
                            "goal",
                            6,
                            3
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                6,

                            y:
                                3
                        }
                    },

                    requiredConcepts: [

                        "variable",

                        "forward"
                    ],

                    starterCode:
`# Stocke le nombre de cases dans une variable.
`,

                    hints: [

                        "Une variable s’écrit par exemple : distance = 4.",

                        "Tu peux ensuite utiliser forward(distance)."
                    ]
                },


                /* =========================================
                   2-2
                ========================================= */

                {

                    chapter:
                        2,

                    level:
                        2,

                    room:
                        "cuisine",

                    title:
                        "Deux distances",

                    difficulty:
                        "Facile",

                    instruction:
                        "Utilise des variables pour les deux parties du trajet.",

                    guideMessage:
                        "Le trajet comporte une partie horizontale puis une partie verticale.",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            1,

                        y:
                            1,

                        direction:
                            "E"
                    },

                    blocked: [

                        cell(
                            0,
                            0
                        ),

                        cell(
                            2,
                            0
                        ),

                        cell(
                            3,
                            0
                        ),

                        cell(
                            6,
                            0
                        ),

                        cell(
                            3,
                            2
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "cuisine",
                            2
                        ),

                    objects:
                        [],

                    targets: [

                        target(
                            "goal",
                            "goal",
                            5,
                            3
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                5,

                            y:
                                3
                        }
                    },

                    requiredConcepts: [

                        "variable",

                        "right",

                        "forward"
                    ],

                    starterCode:
`# Tu peux créer plusieurs variables.
`,

                    hints: [

                        "Commence par compter le déplacement horizontal.",

                        "Pyt devra ensuite regarder vers le bas."
                    ]
                },


                /* =========================================
                   2-3
                ========================================= */

                {

                    chapter:
                        2,

                    level:
                        3,

                    room:
                        "cuisine",

                    title:
                        "Le service",

                    difficulty:
                        "Intermédiaire",

                    instruction:
                        "Utilise des variables pour traverser la cuisine en plusieurs étapes.",

                    guideMessage:
                        "Organise ton trajet avec des noms de variables compréhensibles.",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            6,

                        y:
                            4,

                        direction:
                            "W"
                    },

                    blocked: [

                        cell(
                            0,
                            0
                        ),

                        cell(
                            2,
                            0
                        ),

                        cell(
                            3,
                            0
                        ),

                        cell(
                            6,
                            0
                        ),

                        cell(
                            4,
                            2
                        ),

                        cell(
                            5,
                            2
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "cuisine",
                            3
                        ),

                    objects:
                        [],

                    targets: [

                        target(
                            "goal",
                            "goal",
                            2,
                            1
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                2,

                            y:
                                1
                        }
                    },

                    requiredConcepts: [

                        "variable",

                        "right",

                        "forward"
                    ],

                    starterCode:
`# Choisis des noms de variables qui décrivent ton trajet.
`,

                    hints: [

                        "Pyt commence en regardant vers l’ouest.",

                        "right(90) depuis l’ouest fait regarder vers le nord."
                    ]
                }
            ]
        },



        /* =================================================
           CHAPITRE 3
           SALON
        ================================================= */

        {

            chapter:
                3,

            title:
                "Conditions",

            subtitle:
                "Permettre à Pyt de prendre une décision",

            room:
                "salon",

            theory: [

                {

                    title:
                        "La condition if",

                    body:
                        "if permet d’exécuter du code seulement lorsqu’une condition est vraie.",

                    code:
`if front_is_clear():
    forward(1)`
                },

                {

                    title:
                        "Sinon",

                    body:
                        "else permet de prévoir une autre action lorsque la condition est fausse.",

                    code:
`if front_is_clear():
    forward(1)
else:
    left(90)`
                },

                {

                    title:
                        "not",

                    body:
                        "not inverse une condition.",

                    code:
`if not front_is_clear():
    right(90)`
                },

                {

                    title:
                        "Indentation",

                    body:
                        "En Python, les lignes qui appartiennent au if doivent être décalées vers la droite."
                }
            ],


            levels: [

                /* =========================================
                   3-1
                ========================================= */

                {

                    chapter:
                        3,

                    level:
                        1,

                    room:
                        "salon",

                    title:
                        "Le canapé bloque le passage",

                    difficulty:
                        "Intermédiaire",

                    instruction:
                        "Utilise une condition pour réagir lorsque Pyt rencontre un passage bloqué.",

                    guideMessage:
                        "front_is_clear() indique si la case située devant Pyt est libre.",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            1,

                        y:
                            4,

                        direction:
                            "E"
                    },

                    blocked: [

                        cell(
                            3,
                            4
                        ),

                        cell(
                            0,
                            1
                        ),

                        cell(
                            1,
                            1
                        ),

                        cell(
                            6,
                            0
                        ),

                        cell(
                            7,
                            0
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "salon",
                            1
                        ),

                    objects:
                        [],

                    targets: [

                        target(
                            "goal",
                            "goal",
                            2,
                            1
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                2,

                            y:
                                1
                        },

                        noCollisions:
                            true
                    },

                    requiredConcepts: [

                        "condition",

                        "left",

                        "forward"
                    ],

                    starterCode:
`# Utilise front_is_clear() dans une condition.
`,

                    hints: [

                        "Une case bloque le passage devant Pyt.",

                        "Teste le passage avant de choisir la direction."
                    ]
                },


                /* =========================================
                   3-2
                ========================================= */

                {

                    chapter:
                        3,

                    level:
                        2,

                    room:
                        "salon",

                    title:
                        "Changer de direction",

                    difficulty:
                        "Intermédiaire",

                    instruction:
                        "Décide quand tourner pour rejoindre l’autre côté du salon.",

                    guideMessage:
                        "Tu peux utiliser if ou if/else pour décider du prochain mouvement.",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            1,

                        y:
                            1,

                        direction:
                            "E"
                    },

                    blocked: [

                        cell(
                            4,
                            1
                        ),

                        cell(
                            0,
                            1
                        ),

                        cell(
                            6,
                            0
                        ),

                        cell(
                            7,
                            0
                        ),

                        cell(
                            3,
                            2
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "salon",
                            2
                        ),

                    objects:
                        [],

                    targets: [

                        target(
                            "goal",
                            "goal",
                            3,
                            4
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                3,

                            y:
                                4
                        },

                        noCollisions:
                            true
                    },

                    requiredConcepts: [

                        "condition",

                        "right",

                        "forward"
                    ],

                    starterCode:
`# Observe l'obstacle avant de décider quand tourner.
`,

                    hints: [

                        "Pyt ne doit pas foncer dans le meuble.",

                        "Lorsqu’il ne peut plus continuer vers l’est, il doit changer de direction."
                    ]
                },


                /* =========================================
                   3-3
                ========================================= */

                {

                    chapter:
                        3,

                    level:
                        3,

                    room:
                        "salon",

                    title:
                        "La clé du salon",

                    difficulty:
                        "Intermédiaire",

                    instruction:
                        "Récupère automatiquement la clé puis apporte-la dans la zone de dépôt.",

                    guideMessage:
                        "Pyt ramasse la clé automatiquement lorsqu’il passe dessus.",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            1,

                        y:
                            4,

                        direction:
                            "E"
                    },

                    blocked: [

                        cell(
                            3,
                            4
                        ),

                        cell(
                            0,
                            1
                        ),

                        cell(
                            6,
                            0
                        ),

                        cell(
                            7,
                            0
                        ),

                        cell(
                            4,
                            3
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "salon",
                            3
                        ),

                    objects: [

                        object(
                            "cle_salon",
                            "cle",
                            2,
                            4,
                            {

                                pickable:
                                    true
                            }
                        )
                    ],

                    targets: [

                        target(
                            "depot_cle",
                            "deposit",
                            5,
                            1,
                            {

                                object:
                                    "cle_salon"
                            }
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                5,

                            y:
                                1
                        },

                        requiredObject:
                            "cle_salon",

                        noCollisions:
                            true
                    },

                    requiredConcepts: [

                        "condition",

                        "left",

                        "right",

                        "forward"
                    ],

                    starterCode:
`# Passe sur la clé.
# Elle sera ramassée automatiquement.
`,

                    hints: [

                        "La clé est sur la première partie du trajet.",

                        "Une fois l’objet récupéré, rejoins la zone bleue.",

                        "Teste l’obstacle pour savoir quand changer de direction."
                    ]
                }
            ]
        },



        /* =================================================
           CHAPITRE 4
           CHAMBRE
        ================================================= */

        {

            chapter:
                4,

            title:
                "Boucles for",

            subtitle:
                "Répéter une action un nombre connu de fois",

            room:
                "chambre",

            theory: [

                {

                    title:
                        "Répéter",

                    body:
                        "Une boucle for évite de recopier plusieurs fois la même instruction.",

                    code:
`for i in range(4):
    forward(1)`
                },

                {

                    title:
                        "range()",

                    body:
                        "range(4) produit quatre répétitions : 0, 1, 2 et 3."
                },

                {

                    title:
                        "La variable de boucle",

                    body:
                        "Dans for i in range(...), i change automatiquement à chaque répétition.",

                    code:
`for i in range(3):
    print(i)`
                },

                {

                    title:
                        "Plusieurs boucles",

                    body:
                        "Un programme peut contenir plusieurs boucles pour différentes parties d’un trajet."
                }
            ],


            levels: [

                /* =========================================
                   4-1
                ========================================= */

                {

                    chapter:
                        4,

                    level:
                        1,

                    room:
                        "chambre",

                    title:
                        "Répéter les pas",

                    difficulty:
                        "Intermédiaire",

                    instruction:
                        "Utilise une boucle for pour faire traverser la chambre à Pyt.",

                    guideMessage:
                        "Au lieu d’écrire forward(1) plusieurs fois, utilise range().",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            1,

                        y:
                            3,

                        direction:
                            "E"
                    },

                    blocked: [

                        cell(
                            5,
                            0
                        ),

                        cell(
                            6,
                            0
                        ),

                        cell(
                            0,
                            0
                        ),

                        cell(
                            3,
                            2
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "chambre",
                            1
                        ),

                    objects:
                        [],

                    targets: [

                        target(
                            "goal",
                            "goal",
                            6,
                            3
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                6,

                            y:
                                3
                        }
                    },

                    requiredConcepts: [

                        "for",

                        "range",

                        "forward"
                    ],

                    starterCode:
`# Répète une instruction avec for et range().
`,

                    hints: [

                        "Compte combien de cases Pyt doit parcourir.",

                        "La ligne à répéter doit être indentée."
                    ]
                },


                /* =========================================
                   4-2
                ========================================= */

                {

                    chapter:
                        4,

                    level:
                        2,

                    room:
                        "chambre",

                    title:
                        "Deux répétitions",

                    difficulty:
                        "Intermédiaire",

                    instruction:
                        "Utilise des boucles pour les deux parties du trajet.",

                    guideMessage:
                        "Deux segments du trajet nécessitent plusieurs déplacements identiques.",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            1,

                        y:
                            4,

                        direction:
                            "E"
                    },

                    blocked: [

                        cell(
                            5,
                            0
                        ),

                        cell(
                            6,
                            0
                        ),

                        cell(
                            0,
                            0
                        ),

                        cell(
                            3,
                            2
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "chambre",
                            2
                        ),

                    objects:
                        [],

                    targets: [

                        target(
                            "goal",
                            "goal",
                            5,
                            1
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                5,

                            y:
                                1
                        }
                    },

                    requiredConcepts: [

                        "for",

                        "range",

                        "left",

                        "forward"
                    ],

                    starterCode:
`# Tu peux écrire plusieurs boucles for.
`,

                    hints: [

                        "Le premier segment est horizontal.",

                        "Le deuxième est vertical.",

                        "Une rotation sépare les deux boucles."
                    ]
                },


                /* =========================================
                   4-3
                ========================================= */

                {

                    chapter:
                        4,

                    level:
                        3,

                    room:
                        "chambre",

                    title:
                        "Les livres oubliés",

                    difficulty:
                        "Intermédiaire",

                    instruction:
                        "Traverse la chambre avec des boucles et récupère les livres placés sur le chemin.",

                    guideMessage:
                        "Les objets sont ramassés automatiquement lorsque Pyt passe dessus.",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            1,

                        y:
                            4,

                        direction:
                            "E"
                    },

                    blocked: [

                        cell(
                            5,
                            0
                        ),

                        cell(
                            0,
                            0
                        ),

                        cell(
                            3,
                            2
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "chambre",
                            3
                        ),

                    objects: [

                        object(
                            "livre_1",
                            "livre_rouge",
                            2,
                            4,
                            {

                                pickable:
                                    true
                            }
                        ),

                        object(
                            "livre_2",
                            "livre_bleu",
                            4,
                            4,
                            {

                                pickable:
                                    true
                            }
                        ),

                        object(
                            "livre_3",
                            "livre",
                            6,
                            4,
                            {

                                pickable:
                                    true
                            }
                        )
                    ],

                    targets: [

                        target(
                            "goal",
                            "goal",
                            6,
                            1
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                6,

                            y:
                                1
                        },

                        requiredObject:
                            "livre_3"
                    },

                    requiredConcepts: [

                        "for",

                        "range",

                        "left",

                        "forward"
                    ],

                    starterCode:
`# Les livres seront récupérés automatiquement.
`,

                    hints: [

                        "Commence par traverser la ligne des livres.",

                        "Une seconde boucle peut ensuite faire monter Pyt."
                    ]
                }
            ]
        },



        /* =================================================
           CHAPITRE 5
           GARAGE
        ================================================= */

        {

            chapter:
                5,

            title:
                "Fonctions",

            subtitle:
                "Créer ses propres commandes",

            room:
                "garage",

            theory: [

                {

                    title:
                        "Créer une fonction",

                    body:
                        "def permet de regrouper plusieurs instructions sous un seul nom.",

                    code:
`def avancer_deux():
    forward(1)
    forward(1)`
                },

                {

                    title:
                        "Appeler la fonction",

                    body:
                        "Définir une fonction ne l’exécute pas. Il faut ensuite l’appeler.",

                    code:
`avancer_deux()`
                },

                {

                    title:
                        "Paramètres",

                    body:
                        "Une fonction peut recevoir une valeur.",

                    code:
`def avancer_de(distance):
    forward(distance)`
                },

                {

                    title:
                        "return",

                    body:
                        "return permet à une fonction de renvoyer une valeur.",

                    code:
`def distance():
    return 3`
                }
            ],


            levels: [

                /* =========================================
                   5-1
                ========================================= */

                {

                    chapter:
                        5,

                    level:
                        1,

                    room:
                        "garage",

                    title:
                        "Une commande personnalisée",

                    difficulty:
                        "Intermédiaire",

                    instruction:
                        "Crée une fonction puis utilise-la pour rejoindre l’objectif.",

                    guideMessage:
                        "Regroupe ton déplacement dans une fonction créée avec def.",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            1,

                        y:
                            3,

                        direction:
                            "E"
                    },

                    blocked: [

                        cell(
                            5,
                            1
                        ),

                        cell(
                            6,
                            1
                        ),

                        cell(
                            7,
                            0
                        ),

                        cell(
                            0,
                            0
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "garage",
                            1
                        ),

                    objects:
                        [],

                    targets: [

                        target(
                            "goal",
                            "goal",
                            6,
                            3
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                6,

                            y:
                                3
                        }
                    },

                    requiredConcepts: [

                        "function",

                        "forward"
                    ],

                    starterCode:
`# Crée ta propre fonction avec def.
`,

                    hints: [

                        "Une fonction doit être définie avant d’être appelée.",

                        "N’oublie pas l’indentation dans le corps de la fonction."
                    ]
                },


                /* =========================================
                   5-2
                ========================================= */

                {

                    chapter:
                        5,

                    level:
                        2,

                    room:
                        "garage",

                    title:
                        "Fonction avec paramètre",

                    difficulty:
                        "Intermédiaire",

                    instruction:
                        "Crée une fonction capable d’avancer d’une distance donnée.",

                    guideMessage:
                        "Un paramètre permet de réutiliser la même fonction avec différentes valeurs.",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            1,

                        y:
                            4,

                        direction:
                            "E"
                    },

                    blocked: [

                        cell(
                            5,
                            1
                        ),

                        cell(
                            6,
                            1
                        ),

                        cell(
                            0,
                            0
                        ),

                        cell(
                            7,
                            0
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "garage",
                            2
                        ),

                    objects:
                        [],

                    targets: [

                        target(
                            "goal",
                            "goal",
                            5,
                            2
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                5,

                            y:
                                2
                        }
                    },

                    requiredConcepts: [

                        "function",

                        "left",

                        "forward"
                    ],

                    starterCode:
`# Ta fonction peut recevoir une distance.
`,

                    hints: [

                        "Essaie de créer une fonction qui appelle forward(distance).",

                        "Tu peux appeler cette fonction plusieurs fois."
                    ]
                },


                /* =========================================
                   5-3
                ========================================= */

                {

                    chapter:
                        5,

                    level:
                        3,

                    room:
                        "garage",

                    title:
                        "Une fonction qui calcule",

                    difficulty:
                        "Avancé",

                    instruction:
                        "Utilise une fonction avec return pour obtenir une valeur utile au trajet.",

                    guideMessage:
                        "Une fonction peut renvoyer une valeur puis cette valeur peut être utilisée par forward().",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            1,

                        y:
                            4,

                        direction:
                            "E"
                    },

                    blocked: [

                        cell(
                            5,
                            1
                        ),

                        cell(
                            6,
                            1
                        ),

                        cell(
                            7,
                            0
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "garage",
                            3
                        ),

                    objects:
                        [],

                    targets: [

                        target(
                            "goal",
                            "goal",
                            4,
                            1
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                4,

                            y:
                                1
                        }
                    },

                    requiredConcepts: [

                        "function",

                        "return",

                        "left",

                        "forward"
                    ],

                    starterCode:
`# Une fonction peut renvoyer un nombre avec return.
`,

                    hints: [

                        "Crée une fonction qui renvoie une distance.",

                        "Utilise ensuite sa valeur dans ton déplacement."
                    ]
                }
            ]
        },



        /* =================================================
           CHAPITRE 6
           CAVE
        ================================================= */

        {

            chapter:
                6,

            title:
                "Listes",

            subtitle:
                "Stocker plusieurs valeurs dans un ordre précis",

            room:
                "cave_a_vin",

            theory: [

                {

                    title:
                        "Créer une liste",

                    body:
                        "Une liste regroupe plusieurs valeurs entre crochets.",

                    code:
`distances = [2, 4, 1]`
                },

                {

                    title:
                        "Lire une valeur",

                    body:
                        "Les positions commencent à 0.",

                    code:
`distances = [2, 4, 1]

print(distances[0])
print(distances[1])`
                },

                {

                    title:
                        "Liste et boucle",

                    body:
                        "Une boucle for peut parcourir directement les valeurs d’une liste.",

                    code:
`distances = [1, 2, 1]

for distance in distances:
    forward(distance)`
                }
            ],


            levels: [

                /* =========================================
                   6-1
                ========================================= */

                {

                    chapter:
                        6,

                    level:
                        1,

                    room:
                        "cave_a_vin",

                    title:
                        "Une distance dans une liste",

                    difficulty:
                        "Intermédiaire",

                    instruction:
                        "Stocke la distance dans une liste puis utilise la valeur de la liste.",

                    guideMessage:
                        "Une liste utilise des crochets et son premier élément est à l’indice 0.",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            1,

                        y:
                            3,

                        direction:
                            "E"
                    },

                    blocked: [

                        cell(
                            0,
                            0
                        ),

                        cell(
                            1,
                            0
                        ),

                        cell(
                            6,
                            0
                        ),

                        cell(
                            7,
                            0
                        ),

                        cell(
                            3,
                            2
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "cave_a_vin",
                            1
                        ),

                    objects:
                        [],

                    targets: [

                        target(
                            "goal",
                            "goal",
                            5,
                            3
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                5,

                            y:
                                3
                        }
                    },

                    requiredConcepts: [

                        "list",

                        "forward"
                    ],

                    starterCode:
`# Crée une liste.
`,

                    hints: [

                        "Exemple de liste : valeurs = [2, 3].",

                        "Le premier élément est valeurs[0]."
                    ]
                },


                /* =========================================
                   6-2
                ========================================= */

                {

                    chapter:
                        6,

                    level:
                        2,

                    room:
                        "cave_a_vin",

                    title:
                        "Deux valeurs",

                    difficulty:
                        "Intermédiaire",

                    instruction:
                        "Utilise une liste pour stocker les deux distances du trajet.",

                    guideMessage:
                        "Les deux segments peuvent être enregistrés dans une seule liste.",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            1,

                        y:
                            4,

                        direction:
                            "E"
                    },

                    blocked: [

                        cell(
                            0,
                            0
                        ),

                        cell(
                            6,
                            0
                        ),

                        cell(
                            7,
                            0
                        ),

                        cell(
                            3,
                            2
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "cave_a_vin",
                            2
                        ),

                    objects:
                        [],

                    targets: [

                        target(
                            "goal",
                            "goal",
                            4,
                            1
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                4,

                            y:
                                1
                        }
                    },

                    requiredConcepts: [

                        "list",

                        "left",

                        "forward"
                    ],

                    starterCode:
`# Place les distances du trajet dans une liste.
`,

                    hints: [

                        "Il y a deux segments de même ou de différente longueur.",

                        "Accède aux éléments avec [0], [1], etc."
                    ]
                },


                /* =========================================
                   6-3
                ========================================= */

                {

                    chapter:
                        6,

                    level:
                        3,

                    room:
                        "cave_a_vin",

                    title:
                        "Une liste d’actions",

                    difficulty:
                        "Avancé",

                    instruction:
                        "Crée une liste d’actions puis parcours-la avec une boucle et une condition.",

                    guideMessage:
                        "Une liste peut aussi contenir du texte comme \"forward\" ou \"left\".",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            1,

                        y:
                            4,

                        direction:
                            "E"
                    },

                    blocked: [

                        cell(
                            0,
                            0
                        ),

                        cell(
                            6,
                            0
                        ),

                        cell(
                            7,
                            0
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "cave_a_vin",
                            3
                        ),

                    objects:
                        [],

                    targets: [

                        target(
                            "goal",
                            "goal",
                            4,
                            2
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                4,

                            y:
                                2
                        }
                    },

                    requiredConcepts: [

                        "list",

                        "for",

                        "condition",

                        "left",

                        "forward"
                    ],

                    starterCode:
`# Tu peux stocker des mots dans une liste.
# Exemple : actions = ["forward", "left"]
`,

                    hints: [

                        "Parcours la liste avec for.",

                        "Teste la valeur de chaque action avec if.",

                        "Une action peut représenter un déplacement ou une rotation."
                    ]
                }
            ]
        },



        /* =================================================
           CHAPITRE 7
           BALCON
        ================================================= */

        {

            chapter:
                7,

            title:
                "Dictionnaires",

            subtitle:
                "Associer une clé à une valeur",

            room:
                "balcon",

            theory: [

                {

                    title:
                        "Créer un dictionnaire",

                    body:
                        "Un dictionnaire associe des noms, appelés clés, à des valeurs.",

                    code:
`trajet = {
    "distance": 3,
    "angle": 90
}`
                },

                {

                    title:
                        "Lire une valeur",

                    body:
                        "On utilise la clé entre crochets.",

                    code:
`trajet = {"distance": 3}

forward(trajet["distance"])`
                },

                {

                    title:
                        "Plusieurs informations",

                    body:
                        "Un dictionnaire est utile lorsque chaque valeur possède une signification précise."
                },

                {

                    title:
                        "Dictionnaire et condition",

                    body:
                        "La valeur associée à une clé peut aussi être utilisée dans une condition.",

                    code:
`config = {"tour": "left"}

if config["tour"] == "left":
    left(90)`
                }
            ],


            levels: [

                /* =========================================
                   7-1
                ========================================= */

                {

                    chapter:
                        7,

                    level:
                        1,

                    room:
                        "balcon",

                    title:
                        "La distance nommée",

                    difficulty:
                        "Intermédiaire",

                    instruction:
                        "Stocke la distance dans un dictionnaire puis utilise-la.",

                    guideMessage:
                        "Crée une clé qui représente clairement la distance à parcourir.",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            1,

                        y:
                            3,

                        direction:
                            "E"
                    },

                    blocked: [

                        cell(
                            0,
                            0
                        ),

                        cell(
                            7,
                            0
                        ),

                        cell(
                            3,
                            2
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "balcon",
                            1
                        ),

                    objects:
                        [],

                    targets: [

                        target(
                            "goal",
                            "goal",
                            5,
                            3
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                5,

                            y:
                                3
                        }
                    },

                    requiredConcepts: [

                        "dictionary",

                        "forward"
                    ],

                    starterCode:
`# Crée un dictionnaire avec une clé pour la distance.
`,

                    hints: [

                        "Un dictionnaire s’écrit avec des accolades.",

                        "Lis une valeur avec dictionnaire[\"cle\"]."
                    ]
                },


                /* =========================================
                   7-2
                ========================================= */

                {

                    chapter:
                        7,

                    level:
                        2,

                    room:
                        "balcon",

                    title:
                        "Le trajet organisé",

                    difficulty:
                        "Intermédiaire",

                    instruction:
                        "Stocke plusieurs informations du trajet dans un dictionnaire.",

                    guideMessage:
                        "Utilise une clé pour chaque segment du trajet.",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            1,

                        y:
                            4,

                        direction:
                            "E"
                    },

                    blocked: [

                        cell(
                            0,
                            0
                        ),

                        cell(
                            7,
                            0
                        ),

                        cell(
                            3,
                            2
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "balcon",
                            2
                        ),

                    objects:
                        [],

                    targets: [

                        target(
                            "goal",
                            "goal",
                            5,
                            2
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                5,

                            y:
                                2
                        }
                    },

                    requiredConcepts: [

                        "dictionary",

                        "left",

                        "forward"
                    ],

                    starterCode:
`# Ton dictionnaire peut contenir plusieurs distances.
`,

                    hints: [

                        "Une clé peut s’appeler horizontal.",

                        "Une autre peut s’appeler vertical."
                    ]
                },


                /* =========================================
                   7-3
                ========================================= */

                {

                    chapter:
                        7,

                    level:
                        3,

                    room:
                        "balcon",

                    title:
                        "Configuration de Pyt",

                    difficulty:
                        "Avancé",

                    instruction:
                        "Utilise un dictionnaire et une condition pour décider comment Pyt doit tourner.",

                    guideMessage:
                        "Le dictionnaire peut contenir une direction sous forme de texte.",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            1,

                        y:
                            4,

                        direction:
                            "E"
                    },

                    blocked: [

                        cell(
                            0,
                            0
                        ),

                        cell(
                            7,
                            0
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "balcon",
                            3
                        ),

                    objects:
                        [],

                    targets: [

                        target(
                            "goal",
                            "goal",
                            4,
                            1
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                4,

                            y:
                                1
                        }
                    },

                    requiredConcepts: [

                        "dictionary",

                        "condition",

                        "left",

                        "forward"
                    ],

                    starterCode:
`# Exemple d'idée :
# config = {"tour": "..."}
`,

                    hints: [

                        "Lis la valeur d’une clé dans ta condition.",

                        "Le programme doit décider quelle rotation appliquer."
                    ]
                }
            ]
        },



        /* =================================================
           CHAPITRE 8
           TOILETTE / SALLE D'EAU
        ================================================= */

        {

            chapter:
                8,

            title:
                "Boucles while",

            subtitle:
                "Répéter tant qu’une condition est vraie",

            room:
                "toilette",

            theory: [

                {

                    title:
                        "while",

                    body:
                        "Une boucle while continue tant que sa condition reste vraie.",

                    code:
`while front_is_clear():
    forward(1)`
                },

                {

                    title:
                        "Attention aux boucles infinies",

                    body:
                        "Si la condition ne devient jamais fausse, la boucle ne peut pas s’arrêter."
                },

                {

                    title:
                        "Utiliser une position",

                    body:
                        "Pyt peut connaître sa position avec position_x() et position_y().",

                    code:
`while position_x() < 5:
    forward(1)`
                },

                {

                    title:
                        "Plusieurs while",

                    body:
                        "Une mission peut utiliser une première boucle pour un segment puis une seconde pour un autre."
                }
            ],


            levels: [

                /* =========================================
                   8-1
                ========================================= */

                {

                    chapter:
                        8,

                    level:
                        1,

                    room:
                        "toilette",

                    title:
                        "Jusqu’au mur",

                    difficulty:
                        "Intermédiaire",

                    instruction:
                        "Fais avancer Pyt tant que la case devant lui est libre.",

                    guideMessage:
                        "Cette mission est parfaite pour while front_is_clear().",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            1,

                        y:
                            3,

                        direction:
                            "E"
                    },

                    blocked: [

                        cell(
                            6,
                            3
                        ),

                        cell(
                            0,
                            1
                        ),

                        cell(
                            6,
                            0
                        ),

                        cell(
                            7,
                            0
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "toilette",
                            1
                        ),

                    objects:
                        [],

                    targets: [

                        target(
                            "goal",
                            "goal",
                            5,
                            3
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                5,

                            y:
                                3
                        },

                        noCollisions:
                            true
                    },

                    requiredConcepts: [

                        "while",

                        "forward"
                    ],

                    starterCode:
`# Répète tant que le passage est libre.
`,

                    hints: [

                        "La boucle doit s’arrêter juste avant l’obstacle.",

                        "front_is_clear() devient False devant le mur."
                    ]
                },


                /* =========================================
                   8-2
                ========================================= */

                {

                    chapter:
                        8,

                    level:
                        2,

                    room:
                        "toilette",

                    title:
                        "Jusqu’à la coordonnée",

                    difficulty:
                        "Intermédiaire",

                    instruction:
                        "Utilise la position de Pyt dans la condition de la boucle.",

                    guideMessage:
                        "position_x() donne la colonne actuelle de Pyt.",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            1,

                        y:
                            4,

                        direction:
                            "E"
                    },

                    blocked: [

                        cell(
                            0,
                            1
                        ),

                        cell(
                            6,
                            0
                        ),

                        cell(
                            7,
                            0
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "toilette",
                            2
                        ),

                    objects:
                        [],

                    targets: [

                        target(
                            "goal",
                            "goal",
                            5,
                            4
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                5,

                            y:
                                4
                        }
                    },

                    requiredConcepts: [

                        "while",

                        "forward"
                    ],

                    starterCode:
`# Utilise position_x() dans la condition.
`,

                    hints: [

                        "Observe la colonne de l’objectif.",

                        "La valeur de position_x() change après chaque déplacement."
                    ]
                },


                /* =========================================
                   8-3
                ========================================= */

                {

                    chapter:
                        8,

                    level:
                        3,

                    room:
                        "toilette",

                    title:
                        "Deux couloirs",

                    difficulty:
                        "Avancé",

                    instruction:
                        "Utilise plusieurs boucles while pour parcourir les deux parties du trajet.",

                    guideMessage:
                        "Une première boucle peut aller jusqu’à l’obstacle, puis une autre terminer le trajet.",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            1,

                        y:
                            4,

                        direction:
                            "E"
                    },

                    blocked: [

                        cell(
                            4,
                            4
                        ),

                        cell(
                            0,
                            1
                        ),

                        cell(
                            6,
                            0
                        ),

                        cell(
                            7,
                            0
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "toilette",
                            3
                        ),

                    objects:
                        [],

                    targets: [

                        target(
                            "goal",
                            "goal",
                            3,
                            1
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                3,

                            y:
                                1
                        },

                        noCollisions:
                            true
                    },

                    requiredConcepts: [

                        "while",

                        "left",

                        "forward"
                    ],

                    starterCode:
`# Tu peux utiliser plusieurs boucles while.
`,

                    hints: [

                        "La première boucle peut s’arrêter devant l’obstacle.",

                        "Après avoir tourné, position_y() peut aider à savoir quand arrêter la seconde boucle."
                    ]
                }
            ]
        },



        /* =================================================
           CHAPITRE 9
           JARDIN
        ================================================= */

        {

            chapter:
                9,

            title:
                "Mission finale",

            subtitle:
                "Combiner les outils Python appris dans la maison",

            room:
                "jardin",

            theory: [

                {

                    title:
                        "La mission finale",

                    body: [

                        "Dans le jardin, tu vas combiner plusieurs notions apprises dans les chapitres précédents.",

                        "Il n’existe pas une seule bonne façon d’écrire le programme. PYT vérifie principalement le résultat obtenu et les notions demandées."
                    ]
                },

                {

                    title:
                        "Décomposer le problème",

                    body: [

                        "Observe d’abord la carte.",

                        "Découpe ensuite la mission en petites parties : déplacement, décision, répétition et interaction."
                    ]
                },

                {

                    title:
                        "Réutiliser une fonction",

                    body:
                        "Une fonction peut éviter de répéter plusieurs fois la même logique."
                },

                {

                    title:
                        "Choisir la bonne structure",

                    body: [

                        "Une liste est utile pour conserver une suite de valeurs.",

                        "Un dictionnaire est utile pour associer des noms à des informations.",

                        "for convient lorsque le nombre de répétitions est connu.",

                        "while convient lorsque l’arrêt dépend d’une condition."
                    ]
                }
            ],


            levels: [

                /* =========================================
                   9-1
                ========================================= */

                {

                    chapter:
                        9,

                    level:
                        1,

                    room:
                        "jardin",

                    title:
                        "Traversée du jardin",

                    difficulty:
                        "Avancé",

                    instruction:
                        "Crée une fonction et utilise une boucle pour rejoindre l’autre côté du jardin.",

                    guideMessage:
                        "Combine une variable, une fonction et une boucle for.",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            1,

                        y:
                            4,

                        direction:
                            "E"
                    },

                    blocked: [

                        cell(
                            0,
                            0
                        ),

                        cell(
                            7,
                            0
                        ),

                        cell(
                            5,
                            2
                        ),

                        cell(
                            6,
                            2
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "jardin",
                            1
                        ),

                    objects:
                        [],

                    targets: [

                        target(
                            "goal",
                            "goal",
                            6,
                            1
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                6,

                            y:
                                1
                        }
                    },

                    requiredConcepts: [

                        "variable",

                        "function",

                        "for",

                        "range",

                        "left",

                        "forward"
                    ],

                    starterCode:
`# Combine plusieurs notions apprises dans les chapitres précédents.
`,

                    hints: [

                        "Une fonction peut recevoir une distance.",

                        "La fonction peut elle-même contenir une boucle for.",

                        "Découpe le trajet en deux grands segments."
                    ]
                },


                /* =========================================
                   9-2
                ========================================= */

                {

                    chapter:
                        9,

                    level:
                        2,

                    room:
                        "jardin",

                    title:
                        "La clé du portail",

                    difficulty:
                        "Très avancé",

                    instruction:
                        "Récupère la clé et apporte-la au portail en utilisant une liste, un dictionnaire, une boucle et des conditions.",

                    guideMessage:
                        "La clé est ramassée automatiquement. Organise tes actions avec les structures Python apprises.",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            1,

                        y:
                            4,

                        direction:
                            "E"
                    },

                    blocked: [

                        cell(
                            3,
                            4
                        ),

                        cell(
                            4,
                            4
                        ),

                        cell(
                            5,
                            4
                        ),

                        cell(
                            5,
                            2
                        ),

                        cell(
                            6,
                            2
                        ),

                        cell(
                            0,
                            0
                        ),

                        cell(
                            7,
                            0
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "jardin",
                            2
                        ),

                    objects: [

                        object(
                            "cle_portail",
                            "cle",
                            2,
                            4,
                            {

                                pickable:
                                    true
                            }
                        )
                    ],

                    targets: [

                        target(
                            "portail",
                            "deposit",
                            6,
                            1,
                            {

                                object:
                                    "cle_portail"
                            }
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                6,

                            y:
                                1
                        },

                        requiredObject:
                            "cle_portail",

                        noCollisions:
                            true
                    },

                    requiredConcepts: [

                        "list",

                        "dictionary",

                        "for",

                        "condition",

                        "forward"
                    ],

                    starterCode:
`# La clé sera récupérée automatiquement.
# Organise les informations de ton trajet.
`,

                    hints: [

                        "Après la clé, le passage direct est bloqué.",

                        "Une liste peut représenter plusieurs actions.",

                        "Un dictionnaire peut contenir les valeurs utilisées par ces actions.",

                        "Une condition peut choisir quoi faire selon l’action actuellement parcourue."
                    ]
                },


                /* =========================================
                   9-3
                   FINAL
                ========================================= */

                {

                    chapter:
                        9,

                    level:
                        3,

                    room:
                        "jardin",

                    title:
                        "Mission PYT",

                    difficulty:
                        "Final",

                    instruction:
                        "Récupère l’arrosoir, traverse la zone boueuse, nettoie le passage et termine à la station de recharge.",

                    guideMessage:
                        "C’est la mission finale. Décompose le problème avant de commencer à coder.",

                    map: {

                        width:
                            PYT_MAP_WIDTH,

                        height:
                            PYT_MAP_HEIGHT
                    },

                    robotStart: {

                        x:
                            1,

                        y:
                            4,

                        direction:
                            "E"
                    },

                    blocked: [

                        /*
                         * Le chemin direct est fermé.
                         */

                        cell(
                            3,
                            4
                        ),

                        cell(
                            4,
                            4
                        ),

                        cell(
                            5,
                            4
                        ),


                        /*
                         * Piscine.
                         */

                        cell(
                            5,
                            2
                        ),

                        cell(
                            5,
                            3
                        ),

                        cell(
                            6,
                            3
                        ),


                        /*
                         * Décor haut.
                         */

                        cell(
                            0,
                            0
                        ),

                        cell(
                            7,
                            0
                        )
                    ],

                    decorations:
                        getRoomDecorations(
                            "jardin",
                            3
                        ),

                    objects: [

                        /*
                         * 1.
                         * Ramassage automatique.
                         */

                        object(
                            "arrosoir_final",
                            "arrosoir",
                            2,
                            4,
                            {

                                pickable:
                                    true
                            }
                        ),


                        /*
                         * 2.
                         * La boue disparaît automatiquement
                         * lorsque Pyt passe dessus.
                         */

                        object(
                            "boue_finale",
                            "boue",
                            3,
                            2,
                            {

                                cleanable:
                                    true,

                                solid:
                                    false
                            }
                        ),


                        /*
                         * 3.
                         * Station de recharge.
                         */

                        object(
                            "station_finale",
                            "station_recharge",
                            6,
                            1,
                            {

                                solid:
                                    false
                            }
                        )
                    ],

                    targets: [

                        target(
                            "goal_final",
                            "goal",
                            6,
                            1
                        )
                    ],

                    goal: {

                        position: {

                            x:
                                6,

                            y:
                                1
                        },

                        requiredObject:
                            "arrosoir_final",

                        cleaned:
                            1,

                        recharge:
                            true,

                        noCollisions:
                            true
                    },

                    requiredConcepts: [

                        "variable",

                        "list",

                        "dictionary",

                        "condition",

                        "while",

                        "function",

                        "forward"
                    ],

                    starterCode:
`# MISSION FINALE
#
# 1. Observe le jardin.
# 2. Découpe le trajet en plusieurs étapes.
# 3. Utilise les structures Python apprises.
#
`,

                    hints: [

                        "L’arrosoir est récupéré automatiquement lorsque Pyt passe dessus.",

                        "Le passage direct vers la droite est bloqué après l’arrosoir.",

                        "La boue se trouve plus haut dans le jardin.",

                        "Pyt nettoie automatiquement la boue lorsqu’il atteint sa case.",

                        "La dernière destination est la station de recharge.",

                        "Une fonction peut regrouper une partie répétitive du déplacement.",

                        "Une boucle while peut être utile lorsque l’arrêt dépend de la position ou d’un obstacle.",

                        "Une liste et un dictionnaire peuvent servir à organiser les informations du trajet."
                    ]
                }
            ]
        }
    ]
};



/* =========================================================
   HELPERS PUBLICS
========================================================= */

PYT_LEVEL_DATA.getChapter =
    function getChapter(
        chapterNumber
    ) {

        return this.chapters
            .find(
                chapter =>
                    Number(
                        chapter.chapter
                    ) ===
                    Number(
                        chapterNumber
                    )
            ) ||
            null;
    };



PYT_LEVEL_DATA.getLevel =
    function getLevel(
        chapterNumber,
        levelNumber
    ) {

        const chapter =
            this.getChapter(
                chapterNumber
            );


        if (
            !chapter
        ) {

            return null;
        }


        return chapter.levels
            .find(
                level =>
                    Number(
                        level.level
                    ) ===
                    Number(
                        levelNumber
                    )
            ) ||
            null;
    };



PYT_LEVEL_DATA.getAllLevels =
    function getAllLevels() {

        return this.chapters
            .flatMap(
                chapter =>
                    chapter.levels
            );
    };



PYT_LEVEL_DATA.getLevelCount =
    function getLevelCount() {

        return this.getAllLevels()
            .length;
    };



PYT_LEVEL_DATA.getLevelKey =
    function getLevelKey(
        chapter,
        level
    ) {

        return levelKey(
            chapter,
            level
        );
    };



/* =========================================================
   EXPORTS
========================================================= */

window.PYT_GAME_DATA =
    PYT_LEVEL_DATA;


window.PYT_LEVELS =
    PYT_LEVEL_DATA;


window.GAME_LEVELS =
    PYT_LEVEL_DATA;


window.LEVELS =
    PYT_LEVEL_DATA;


window.levels =
    PYT_LEVEL_DATA;