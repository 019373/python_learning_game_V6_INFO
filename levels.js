"use strict";

/* =========================================================
   PYT
   levels.js

   9 chapitres
   3 exercices par chapitre
   27 exercices au total

   API Python prévue dans le jeu :

   avancer()
   avancer(nombre)

   tourner_gauche()
   tourner_droite()

   ramasser()
   ramasser("objet")

   deposer()
   deposer("objet")

   devant_libre()
   sur_objet()
   sur_objet("objet")

   inventaire_contient("objet")

   position_x()
   position_y()
   direction()

   print(...)
========================================================= */


(() => {

    /* =====================================================
       OUTILS
    ===================================================== */

    function level(config) {

        return {
            difficulty:
                "Facile",

            starterCode:
                "",

            guideMessage:
                "Écris un programme pour aider Pyt.",

            firstAttemptMessage:
                "Ça ne fonctionne pas encore. Tu peux revoir le cours avant de réessayer.",

            hints:
                [],

            objects:
                [],

            targets:
                [],

            requiredConcepts:
                [],

            map: {
                width: 8,
                height: 6,
                blocked: [],
                decorations: []
            },

            robot: {
                x: 0,
                y: 0,
                direction: "E"
            },

            goal: {
                rules: []
            },

            ...config
        };
    }



    function chapter(config) {

        return {
            subtitle:
                "",

            theory:
                [],

            levels:
                [],

            ...config
        };
    }



    /* =====================================================
       DONNÉES
    ===================================================== */

    const chapters = [

        /* =================================================
           CHAPITRE 1
           SÉQUENCES
        ================================================= */

        chapter({

            chapter: 1,

            title:
                "Premiers déplacements",

            subtitle:
                "Découvre comment donner des instructions à Pyt.",

            room:
                "Entrée",

            theory: [

                {
                    title:
                        "Un programme est une suite d’instructions",

                    body: [
                        "Python exécute normalement les instructions dans l’ordre, de la première ligne à la dernière.",
                        "Dans PYT, chaque instruction peut faire avancer ou tourner le robot."
                    ],

                    code:
`avancer()
tourner_droite()
avancer()`
                },


                {
                    title:
                        "Avancer",

                    body:
                        "La fonction avancer() déplace Pyt d’une case dans la direction qu’il regarde.",

                    code:
`avancer()`
                },


                {
                    title:
                        "Tourner",

                    body:
                        "Pyt peut tourner de 90 degrés vers la gauche ou vers la droite.",

                    code:
`tourner_gauche()
tourner_droite()`
                },


                {
                    title:
                        "Plusieurs cases",

                    body:
                        "Tu peux aussi donner un nombre à avancer(). Le déplacement reste effectué case par case.",

                    code:
`avancer(3)`
                }
            ],


            levels: [

                level({

                    level: 1,

                    title:
                        "Vers le tapis",

                    instruction:
                        "Amène Pyt jusqu’au tapis violet.",

                    difficulty:
                        "Facile",

                    guideMessage:
                        "Commençons simplement. Fais avancer Pyt jusqu’au tapis violet.",

                    starterCode:
`# Fais avancer Pyt jusqu'au tapis.
avancer()`,

                    requiredConcepts: [
                        "sequence"
                    ],

                    map: {

                        width: 7,
                        height: 5,

                        blocked: [
                            [0, 0],
                            [0, 4],
                            [6, 0],
                            [6, 4]
                        ],

                        decorations: [
                            {
                                type: "plante",
                                x: 0,
                                y: 0
                            },
                            {
                                type: "plante",
                                x: 6,
                                y: 4
                            },
                            {
                                type: "tapis",
                                x: 5,
                                y: 2
                            }
                        ]
                    },

                    robot: {
                        x: 1,
                        y: 2,
                        direction: "E"
                    },

                    targets: [
                        {
                            id: "tapis",
                            type: "destination",
                            x: 5,
                            y: 2,
                            label: "Tapis violet"
                        }
                    ],

                    goal: {
                        rules: [
                            {
                                type: "position",
                                x: 5,
                                y: 2
                            }
                        ]
                    },

                    hints: [
                        "Pyt regarde déjà vers la droite.",
                        "Il doit avancer quatre cases."
                    ]
                }),



                level({

                    level: 2,

                    title:
                        "Premier virage",

                    instruction:
                        "Rejoins la porte sans toucher les meubles.",

                    difficulty:
                        "Facile",

                    guideMessage:
                        "Cette fois, avancer tout droit ne suffit plus. Il faudra aussi tourner.",

                    starterCode:
`# Rejoins la porte.
avancer()
`,

                    requiredConcepts: [
                        "sequence",
                        "turn"
                    ],

                    map: {

                        width: 7,
                        height: 6,

                        blocked: [
                            [3, 1],
                            [3, 2],
                            [3, 3],
                            [1, 4]
                        ],

                        decorations: [
                            {
                                type: "console",
                                x: 3,
                                y: 1
                            },
                            {
                                type: "console",
                                x: 3,
                                y: 2
                            },
                            {
                                type: "porte",
                                x: 5,
                                y: 4
                            }
                        ]
                    },

                    robot: {
                        x: 1,
                        y: 1,
                        direction: "E"
                    },

                    targets: [
                        {
                            id: "porte",
                            type: "destination",
                            x: 5,
                            y: 4,
                            label: "Porte"
                        }
                    ],

                    goal: {
                        rules: [
                            {
                                type: "position",
                                x: 5,
                                y: 4
                            }
                        ]
                    },

                    hints: [
                        "Le meuble bloque le passage direct.",
                        "Essaie de descendre avant de repartir vers la droite."
                    ]
                }),



                level({

                    level: 3,

                    title:
                        "Le colis",

                    instruction:
                        "Va chercher le colis puis apporte-le devant la porte.",

                    difficulty:
                        "Moyen",

                    guideMessage:
                        "Pyt doit maintenant se déplacer, récupérer un objet puis l’emporter ailleurs.",

                    starterCode:
`# Trouve le colis.
# Utilise ramasser() quand Pyt est dessus.
`,

                    requiredConcepts: [
                        "sequence",
                        "pickup"
                    ],

                    map: {

                        width: 8,
                        height: 6,

                        blocked: [
                            [3, 0],
                            [3, 1],
                            [3, 2],
                            [5, 3]
                        ],

                        decorations: [
                            {
                                type: "plante",
                                x: 1,
                                y: 4
                            },
                            {
                                type: "porte",
                                x: 6,
                                y: 4
                            }
                        ]
                    },

                    robot: {
                        x: 1,
                        y: 1,
                        direction: "S"
                    },

                    objects: [
                        {
                            id: "colis",
                            type: "caisse",
                            label: "Colis",
                            x: 1,
                            y: 4,
                            pickable: true
                        }
                    ],

                    targets: [
                        {
                            id: "porte",
                            type: "deposit",
                            x: 6,
                            y: 4,
                            label: "Devant la porte"
                        }
                    ],

                    goal: {
                        rules: [
                            {
                                type: "position",
                                x: 6,
                                y: 4
                            },
                            {
                                type: "inventory_has",
                                object: "colis"
                            }
                        ]
                    },

                    hints: [
                        "Commence par descendre jusqu’au colis.",
                        "Quand Pyt se trouve sur le colis, utilise ramasser()."
                    ]
                })

            ]
        }),



        /* =================================================
           CHAPITRE 2
           VARIABLES
        ================================================= */

        chapter({

            chapter: 2,

            title:
                "Variables",

            subtitle:
                "Stocke des informations pour les réutiliser.",

            room:
                "Cuisine",

            theory: [

                {
                    title:
                        "Une variable mémorise une valeur",

                    body:
                        "Une variable possède un nom. On peut lui donner une valeur puis utiliser ce nom plus tard.",

                    code:
`distance = 3
avancer(distance)`
                },


                {
                    title:
                        "Les nombres",

                    body:
                        "Un entier peut servir à stocker une distance, un compteur ou une quantité.",

                    code:
`pas = 2
avancer(pas)`
                },


                {
                    title:
                        "Les chaînes de caractères",

                    body:
                        "Du texte peut être placé entre guillemets.",

                    code:
`objet = "pomme"
ramasser(objet)`
                },


                {
                    title:
                        "Modifier une variable",

                    body:
                        "Une variable peut recevoir une nouvelle valeur pendant le programme.",

                    code:
`distance = 2
avancer(distance)

distance = 1
avancer(distance)`
                }
            ],


            levels: [

                level({

                    level: 1,

                    title:
                        "Distance jusqu’au frigo",

                    instruction:
                        "Utilise une variable pour envoyer Pyt devant le frigo.",

                    difficulty:
                        "Facile",

                    guideMessage:
                        "Au lieu d’écrire directement le nombre dans avancer(), place la distance dans une variable.",

                    starterCode:
`distance = 0

# Modifie la variable.
avancer(distance)`,

                    requiredConcepts: [
                        "assignment"
                    ],

                    map: {

                        width: 8,
                        height: 5,

                        blocked: [
                            [2, 0],
                            [3, 0],
                            [4, 0]
                        ],

                        decorations: [
                            {
                                type: "frigo",
                                x: 6,
                                y: 2
                            },
                            {
                                type: "table",
                                x: 3,
                                y: 4
                            }
                        ]
                    },

                    robot: {
                        x: 1,
                        y: 2,
                        direction: "E"
                    },

                    targets: [
                        {
                            id: "frigo",
                            type: "destination",
                            x: 5,
                            y: 2,
                            label: "Frigo"
                        }
                    ],

                    goal: {
                        rules: [
                            {
                                type: "position",
                                x: 5,
                                y: 2
                            }
                        ]
                    },

                    hints: [
                        "Compte le nombre de cases entre Pyt et le frigo.",
                        "Place ce nombre dans distance."
                    ]
                }),



                level({

                    level: 2,

                    title:
                        "La bonne pomme",

                    instruction:
                        "Stocke le nom de l’objet dans une variable puis ramasse la pomme.",

                    difficulty:
                        "Moyen",

                    guideMessage:
                        "Une variable peut aussi contenir du texte.",

                    starterCode:
`objet = ""

avancer(2)

# Ramasse l'objet contenu dans la variable.
`,

                    requiredConcepts: [
                        "assignment",
                        "string",
                        "pickup"
                    ],

                    map: {

                        width: 7,
                        height: 5,

                        blocked: [
                            [4, 1],
                            [4, 3]
                        ],

                        decorations: [
                            {
                                type: "table",
                                x: 3,
                                y: 1
                            }
                        ]
                    },

                    robot: {
                        x: 1,
                        y: 2,
                        direction: "E"
                    },

                    objects: [
                        {
                            id: "pomme",
                            type: "pomme",
                            label: "Pomme",
                            x: 3,
                            y: 2,
                            pickable: true
                        },
                        {
                            id: "tasse",
                            type: "tasse",
                            label: "Tasse",
                            x: 5,
                            y: 2,
                            pickable: true
                        }
                    ],

                    goal: {
                        rules: [
                            {
                                type: "inventory_has",
                                object: "pomme"
                            },
                            {
                                type: "inventory_not_has",
                                object: "tasse"
                            }
                        ]
                    },

                    hints: [
                        "Le texte doit être écrit entre guillemets.",
                        "La variable peut contenir \"pomme\"."
                    ]
                }),



                level({

                    level: 3,

                    title:
                        "Préparer la table",

                    instruction:
                        "Récupère l’assiette et apporte-la jusqu’à la table en utilisant plusieurs variables.",

                    difficulty:
                        "Moyen",

                    guideMessage:
                        "Utilise des variables pour les distances et pour le nom de l’objet.",

                    starterCode:
`objet = "assiette"
aller_objet = 0
aller_table = 0

# Complète le programme.
`,

                    requiredConcepts: [
                        "assignment",
                        "variables_multiple",
                        "pickup"
                    ],

                    map: {

                        width: 9,
                        height: 6,

                        blocked: [
                            [4, 0],
                            [4, 1],
                            [4, 2],
                            [6, 4]
                        ],

                        decorations: [
                            {
                                type: "plan_travail",
                                x: 2,
                                y: 4
                            },
                            {
                                type: "table",
                                x: 7,
                                y: 4
                            }
                        ]
                    },

                    robot: {
                        x: 1,
                        y: 1,
                        direction: "S"
                    },

                    objects: [
                        {
                            id: "assiette",
                            type: "assiette",
                            label: "Assiette",
                            x: 1,
                            y: 4,
                            pickable: true
                        }
                    ],

                    targets: [
                        {
                            id: "table",
                            type: "deposit",
                            x: 7,
                            y: 4,
                            label: "Table"
                        }
                    ],

                    goal: {
                        rules: [
                            {
                                type: "position",
                                x: 7,
                                y: 4
                            },
                            {
                                type: "inventory_has",
                                object: "assiette"
                            }
                        ]
                    },

                    hints: [
                        "Une première variable peut stocker la distance jusqu’à l’assiette.",
                        "Une deuxième variable peut être utilisée pour une autre partie du trajet."
                    ]
                })

            ]
        }),



        /* =================================================
           CHAPITRE 3
           CONDITIONS
        ================================================= */

        chapter({

            chapter: 3,

            title:
                "Conditions",

            subtitle:
                "Permets à Pyt de prendre une décision.",

            room:
                "Salon",

            theory: [

                {
                    title:
                        "if",

                    body:
                        "Une condition permet d’exécuter du code uniquement si une expression est vraie.",

                    code:
`if devant_libre():
    avancer()`
                },


                {
                    title:
                        "Indentation",

                    body:
                        "En Python, le code placé à l’intérieur d’un if doit être indenté.",

                    code:
`if sur_objet("livre"):
    ramasser("livre")`
                },


                {
                    title:
                        "else",

                    body:
                        "else permet d’exécuter autre chose quand la condition est fausse.",

                    code:
`if devant_libre():
    avancer()
else:
    tourner_droite()`
                },


                {
                    title:
                        "Comparer des valeurs",

                    body:
                        "On peut comparer des nombres ou du texte avec ==, !=, < ou >.",

                    code:
`x = position_x()

if x == 4:
    tourner_gauche()`
                }
            ],


            levels: [

                level({

                    level: 1,

                    title:
                        "Passage libre",

                    instruction:
                        "Utilise if et devant_libre() avant de faire avancer Pyt.",

                    difficulty:
                        "Facile",

                    guideMessage:
                        "Demande d’abord à Pyt si la case devant lui est libre.",

                    starterCode:
`if devant_libre():
    # Ajoute l'instruction ici.
    pass`,

                    requiredConcepts: [
                        "if"
                    ],

                    map: {

                        width: 7,
                        height: 5,

                        blocked: [
                            [5, 1],
                            [5, 3]
                        ],

                        decorations: [
                            {
                                type: "canape",
                                x: 5,
                                y: 1
                            }
                        ]
                    },

                    robot: {
                        x: 2,
                        y: 2,
                        direction: "E"
                    },

                    goal: {
                        rules: [
                            {
                                type: "position",
                                x: 3,
                                y: 2
                            }
                        ]
                    },

                    hints: [
                        "Le déplacement doit se trouver sous le if.",
                        "N’oublie pas l’indentation."
                    ]
                }),



                level({

                    level: 2,

                    title:
                        "Choisir le passage",

                    instruction:
                        "Fais avancer Pyt si le chemin est libre, sinon fais-le tourner.",

                    difficulty:
                        "Moyen",

                    guideMessage:
                        "Tu vas maintenant utiliser if et else.",

                    starterCode:
`if devant_libre():
    avancer()
else:
    # Que doit faire Pyt ?
    pass`,

                    requiredConcepts: [
                        "if",
                        "else"
                    ],

                    map: {

                        width: 7,
                        height: 6,

                        blocked: [
                            [3, 1],
                            [3, 2],
                            [5, 4]
                        ],

                        decorations: [
                            {
                                type: "canape",
                                x: 3,
                                y: 1
                            },
                            {
                                type: "table",
                                x: 5,
                                y: 4
                            }
                        ]
                    },

                    robot: {
                        x: 3,
                        y: 3,
                        direction: "N"
                    },

                    targets: [
                        {
                            id: "sortie",
                            type: "destination",
                            x: 5,
                            y: 3,
                            label: "Sortie"
                        }
                    ],

                    goal: {
                        rules: [
                            {
                                type: "position",
                                x: 5,
                                y: 3
                            }
                        ]
                    },

                    hints: [
                        "La case située devant Pyt au départ est bloquée.",
                        "Quand devant_libre() est faux, le bloc else est exécuté."
                    ]
                }),



                level({

                    level: 3,

                    title:
                        "Le livre bleu",

                    instruction:
                        "Récupère uniquement le livre bleu en utilisant une condition.",

                    difficulty:
                        "Difficile",

                    guideMessage:
                        "Pyt trouvera plusieurs objets. Vérifie lequel se trouve sous lui avant de le ramasser.",

                    starterCode:
`objet = "livre_bleu"

# Déplace Pyt puis vérifie l'objet.
`,

                    requiredConcepts: [
                        "if",
                        "comparison",
                        "pickup"
                    ],

                    map: {

                        width: 9,
                        height: 6,

                        blocked: [
                            [4, 1],
                            [4, 2],
                            [6, 4]
                        ],

                        decorations: [
                            {
                                type: "bibliotheque",
                                x: 7,
                                y: 1
                            }
                        ]
                    },

                    robot: {
                        x: 1,
                        y: 3,
                        direction: "E"
                    },

                    objects: [
                        {
                            id: "livre_rouge",
                            type: "livre",
                            label: "Livre rouge",
                            x: 3,
                            y: 3,
                            pickable: true
                        },
                        {
                            id: "livre_bleu",
                            type: "livre",
                            label: "Livre bleu",
                            x: 7,
                            y: 3,
                            pickable: true
                        }
                    ],

                    goal: {
                        rules: [
                            {
                                type: "inventory_has",
                                object: "livre_bleu"
                            },
                            {
                                type: "inventory_not_has",
                                object: "livre_rouge"
                            }
                        ]
                    },

                    hints: [
                        "sur_objet(\"livre_bleu\") renvoie vrai uniquement sur le bon livre.",
                        "Le livre rouge ne doit pas finir dans l’inventaire."
                    ]
                })

            ]
        }),



        /* =================================================
           CHAPITRE 4
           BOUCLES FOR
        ================================================= */

        chapter({

            chapter: 4,

            title:
                "Boucles for",

            subtitle:
                "Répète automatiquement des instructions.",

            room:
                "Chambre",

            theory: [

                {
                    title:
                        "Pourquoi une boucle ?",

                    body:
                        "Quand la même instruction doit être exécutée plusieurs fois, une boucle évite de la recopier.",

                    code:
`for i in range(4):
    avancer()`
                },


                {
                    title:
                        "range",

                    body:
                        "range(4) permet d’effectuer quatre tours de boucle.",

                    code:
`for i in range(4):
    print(i)`
                },


                {
                    title:
                        "Plusieurs instructions",

                    body:
                        "Une boucle peut répéter plusieurs instructions à chaque tour.",

                    code:
`for i in range(3):
    avancer()
    tourner_droite()`
                }
            ],


            levels: [

                level({

                    level: 1,

                    title:
                        "Long couloir",

                    instruction:
                        "Rejoins le lit avec une boucle for.",

                    difficulty:
                        "Facile",

                    guideMessage:
                        "Pyt doit effectuer plusieurs fois exactement la même action.",

                    starterCode:
`for i in range(0):
    avancer()`,

                    requiredConcepts: [
                        "for",
                        "range"
                    ],

                    map: {

                        width: 9,
                        height: 5,

                        blocked: [
                            [0, 0],
                            [8, 0]
                        ],

                        decorations: [
                            {
                                type: "lit",
                                x: 7,
                                y: 2
                            }
                        ]
                    },

                    robot: {
                        x: 1,
                        y: 2,
                        direction: "E"
                    },

                    goal: {
                        rules: [
                            {
                                type: "position",
                                x: 7,
                                y: 2
                            }
                        ]
                    },

                    hints: [
                        "Compte les déplacements nécessaires.",
                        "Change uniquement la valeur donnée à range()."
                    ]
                }),



                level({

                    level: 2,

                    title:
                        "Le tour du tapis",

                    instruction:
                        "Fais faire à Pyt le tour complet du tapis avec une boucle.",

                    difficulty:
                        "Moyen",

                    guideMessage:
                        "Un carré possède quatre côtés. Cherche quelles instructions doivent être répétées.",

                    starterCode:
`for i in range(4):
    # Avance le long d'un côté.
    # Puis tourne.
    pass`,

                    requiredConcepts: [
                        "for",
                        "range",
                        "turn"
                    ],

                    map: {

                        width: 8,
                        height: 7,

                        blocked: [
                            [3, 2],
                            [4, 2],
                            [3, 3],
                            [4, 3],
                            [3, 4],
                            [4, 4]
                        ],

                        decorations: [
                            {
                                type: "tapis",
                                x: 3,
                                y: 3
                            }
                        ]
                    },

                    robot: {
                        x: 2,
                        y: 1,
                        direction: "E"
                    },

                    targets: [
                        {
                            id: "depart",
                            type: "destination",
                            x: 2,
                            y: 1
                        }
                    ],

                    goal: {
                        rules: [
                            {
                                type: "position",
                                x: 2,
                                y: 1
                            },
                            {
                                type: "minimum_moves",
                                count: 12
                            }
                        ]
                    },

                    hints: [
                        "Chaque côté du trajet fait trois cases.",
                        "Le déplacement et le virage doivent être dans la boucle."
                    ]
                }),



                level({

                    level: 3,

                    title:
                        "Ranger les jouets",

                    instruction:
                        "Passe sur les trois jouets et récupère-les avec une boucle.",

                    difficulty:
                        "Difficile",

                    guideMessage:
                        "Les jouets sont alignés. Une boucle peut effectuer le déplacement et le ramassage plusieurs fois.",

                    starterCode:
`for i in range(3):
    # Avance jusqu'au prochain jouet.
    # Puis ramasse-le.
    pass`,

                    requiredConcepts: [
                        "for",
                        "pickup"
                    ],

                    map: {

                        width: 9,
                        height: 5,

                        blocked: [],

                        decorations: [
                            {
                                type: "lit",
                                x: 8,
                                y: 0
                            }
                        ]
                    },

                    robot: {
                        x: 1,
                        y: 2,
                        direction: "E"
                    },

                    objects: [
                        {
                            id: "jouet_1",
                            type: "jouet",
                            label: "Jouet 1",
                            x: 3,
                            y: 2,
                            pickable: true
                        },
                        {
                            id: "jouet_2",
                            type: "jouet",
                            label: "Jouet 2",
                            x: 5,
                            y: 2,
                            pickable: true
                        },
                        {
                            id: "jouet_3",
                            type: "jouet",
                            label: "Jouet 3",
                            x: 7,
                            y: 2,
                            pickable: true
                        }
                    ],

                    goal: {
                        rules: [
                            {
                                type: "inventory_has",
                                object: "jouet_1"
                            },
                            {
                                type: "inventory_has",
                                object: "jouet_2"
                            },
                            {
                                type: "inventory_has",
                                object: "jouet_3"
                            }
                        ]
                    },

                    hints: [
                        "Il y a toujours deux cases entre deux jouets.",
                        "Chaque tour de boucle peut avancer puis ramasser."
                    ]
                })

            ]
        }),



        /* =================================================
           CHAPITRE 5
           FONCTIONS
        ================================================= */

        chapter({

            chapter: 5,

            title:
                "Fonctions",

            subtitle:
                "Regroupe des instructions dans des blocs réutilisables.",

            room:
                "Garage",

            theory: [

                {
                    title:
                        "Créer une fonction",

                    body:
                        "def permet de donner un nom à un groupe d’instructions.",

                    code:
`def avancer_deux():
    avancer()
    avancer()`
                },


                {
                    title:
                        "Appeler une fonction",

                    body:
                        "Créer la fonction ne suffit pas. Il faut ensuite l’appeler.",

                    code:
`def avancer_deux():
    avancer(2)

avancer_deux()`
                },


                {
                    title:
                        "Paramètres",

                    body:
                        "Une fonction peut recevoir une valeur.",

                    code:
`def avancer_de(n):
    avancer(n)

avancer_de(4)`
                }
            ],


            levels: [

                level({

                    level: 1,

                    title:
                        "Une fonction simple",

                    instruction:
                        "Crée une fonction avancer_trois() puis utilise-la.",

                    difficulty:
                        "Facile",

                    guideMessage:
                        "Place les déplacements dans une fonction puis appelle cette fonction.",

                    starterCode:
`def avancer_trois():
    pass

# Appelle la fonction ici.
`,

                    requiredConcepts: [
                        "function_definition",
                        "function_call"
                    ],

                    map: {

                        width: 7,
                        height: 5,

                        blocked: [],

                        decorations: [
                            {
                                type: "etabli",
                                x: 5,
                                y: 2
                            }
                        ]
                    },

                    robot: {
                        x: 2,
                        y: 2,
                        direction: "E"
                    },

                    goal: {
                        rules: [
                            {
                                type: "position",
                                x: 5,
                                y: 2
                            }
                        ]
                    },

                    hints: [
                        "Le corps de la fonction doit être indenté.",
                        "N’oublie pas d’écrire avancer_trois() après la définition."
                    ]
                }),



                level({

                    level: 2,

                    title:
                        "Fonction avec paramètre",

                    instruction:
                        "Crée une fonction avancer_de(distance) et utilise-la pour atteindre l’établi.",

                    difficulty:
                        "Moyen",

                    guideMessage:
                        "Le nombre de cases peut devenir un paramètre de fonction.",

                    starterCode:
`def avancer_de(distance):
    # Utilise distance.
    pass

avancer_de(4)`,

                    requiredConcepts: [
                        "function_definition",
                        "parameter"
                    ],

                    map: {

                        width: 8,
                        height: 5,

                        blocked: [],

                        decorations: [
                            {
                                type: "etabli",
                                x: 6,
                                y: 2
                            }
                        ]
                    },

                    robot: {
                        x: 2,
                        y: 2,
                        direction: "E"
                    },

                    goal: {
                        rules: [
                            {
                                type: "position",
                                x: 6,
                                y: 2
                            }
                        ]
                    },

                    hints: [
                        "distance est disponible à l’intérieur de la fonction.",
                        "Tu peux transmettre distance à avancer()."
                    ]
                }),



                level({

                    level: 3,

                    title:
                        "Livraison au garage",

                    instruction:
                        "Crée une fonction capable d’avancer puis tourner. Utilise-la plusieurs fois pour récupérer la boîte à outils et rejoindre l’établi.",

                    difficulty:
                        "Difficile",

                    guideMessage:
                        "Cherche un motif de déplacement qui apparaît plusieurs fois dans le trajet.",

                    starterCode:
`def trajet():
    # Écris ici un morceau réutilisable du trajet.
    pass

# Utilise ta fonction.
`,

                    requiredConcepts: [
                        "function_definition",
                        "function_call_multiple",
                        "pickup"
                    ],

                    map: {

                        width: 9,
                        height: 7,

                        blocked: [
                            [4, 2],
                            [4, 3],
                            [4, 4]
                        ],

                        decorations: [
                            {
                                type: "voiture",
                                x: 4,
                                y: 3
                            },
                            {
                                type: "etabli",
                                x: 7,
                                y: 5
                            }
                        ]
                    },

                    robot: {
                        x: 1,
                        y: 1,
                        direction: "E"
                    },

                    objects: [
                        {
                            id: "boite_outils",
                            type: "outils",
                            label: "Boîte à outils",
                            x: 7,
                            y: 1,
                            pickable: true
                        }
                    ],

                    goal: {
                        rules: [
                            {
                                type: "inventory_has",
                                object: "boite_outils"
                            },
                            {
                                type: "position",
                                x: 7,
                                y: 5
                            }
                        ]
                    },

                    hints: [
                        "Tu dois d’abord rejoindre la boîte à outils.",
                        "Une fonction peut être appelée plusieurs fois."
                    ]
                })

            ]
        }),



        /* =================================================
           CHAPITRE 6
           LISTES
        ================================================= */

        chapter({

            chapter: 6,

            title:
                "Listes",

            subtitle:
                "Regroupe plusieurs valeurs dans une seule variable.",

            room:
                "Cave à vin",

            theory: [

                {
                    title:
                        "Créer une liste",

                    body:
                        "Une liste Python utilise des crochets et peut contenir plusieurs valeurs.",

                    code:
`objets = ["rouge", "bleu", "vert"]`
                },


                {
                    title:
                        "Lire un élément",

                    body:
                        "Les positions dans une liste commencent à zéro.",

                    code:
`objets = ["pomme", "livre", "clé"]

print(objets[0])`
                },


                {
                    title:
                        "Parcourir une liste",

                    body:
                        "Une boucle for peut parcourir directement tous les éléments d’une liste.",

                    code:
`distances = [2, 1, 3]

for distance in distances:
    avancer(distance)`
                }
            ],


            levels: [

                level({

                    level: 1,

                    title:
                        "Liste de distances",

                    instruction:
                        "Utilise une liste et une boucle pour effectuer trois déplacements successifs.",

                    difficulty:
                        "Facile",

                    guideMessage:
                        "Les distances sont différentes. Range-les dans une liste puis parcours cette liste.",

                    starterCode:
`distances = [2, 1, 3]

for distance in distances:
    # Utilise distance.
    pass`,

                    requiredConcepts: [
                        "list",
                        "for"
                    ],

                    map: {

                        width: 9,
                        height: 7,

                        blocked: [
                            [4, 0],
                            [4, 1],
                            [4, 2],
                            [6, 4]
                        ],

                        decorations: [
                            {
                                type: "casier_vin",
                                x: 7,
                                y: 5
                            }
                        ]
                    },

                    robot: {
                        x: 1,
                        y: 5,
                        direction: "E"
                    },

                    goal: {
                        rules: [
                            {
                                type: "minimum_moves",
                                count: 6
                            }
                        ]
                    },

                    hints: [
                        "À chaque tour, distance contient une valeur de la liste.",
                        "Passe distance à avancer()."
                    ]
                }),



                level({

                    level: 2,

                    title:
                        "Liste de bouteilles",

                    instruction:
                        "Ramasse uniquement les trois bouteilles indiquées dans la liste.",

                    difficulty:
                        "Moyen",

                    guideMessage:
                        "La liste te donne les objets que Pyt doit récupérer.",

                    starterCode:
`bouteilles = [
    "bouteille_rouge",
    "bouteille_bleue",
    "bouteille_verte"
]

# Parcours la cave.
`,

                    requiredConcepts: [
                        "list",
                        "membership",
                        "pickup"
                    ],

                    map: {

                        width: 10,
                        height: 6,

                        blocked: [
                            [5, 1],
                            [5, 2],
                            [5, 3]
                        ],

                        decorations: [
                            {
                                type: "casier_vin",
                                x: 2,
                                y: 0
                            },
                            {
                                type: "casier_vin",
                                x: 7,
                                y: 0
                            }
                        ]
                    },

                    robot: {
                        x: 1,
                        y: 4,
                        direction: "E"
                    },

                    objects: [
                        {
                            id: "bouteille_rouge",
                            type: "bouteille",
                            label: "Bouteille rouge",
                            x: 3,
                            y: 4,
                            pickable: true
                        },
                        {
                            id: "bouteille_jaune",
                            type: "bouteille",
                            label: "Bouteille jaune",
                            x: 4,
                            y: 4,
                            pickable: true
                        },
                        {
                            id: "bouteille_bleue",
                            type: "bouteille",
                            label: "Bouteille bleue",
                            x: 6,
                            y: 4,
                            pickable: true
                        },
                        {
                            id: "bouteille_verte",
                            type: "bouteille",
                            label: "Bouteille verte",
                            x: 8,
                            y: 4,
                            pickable: true
                        }
                    ],

                    goal: {
                        rules: [
                            {
                                type: "inventory_has",
                                object: "bouteille_rouge"
                            },
                            {
                                type: "inventory_has",
                                object: "bouteille_bleue"
                            },
                            {
                                type: "inventory_has",
                                object: "bouteille_verte"
                            },
                            {
                                type: "inventory_not_has",
                                object: "bouteille_jaune"
                            }
                        ]
                    },

                    hints: [
                        "La bouteille jaune n’est pas dans la liste.",
                        "Tu peux vérifier si un nom appartient à une liste avec in."
                    ]
                }),



                level({

                    level: 3,

                    title:
                        "Programme d’actions",

                    instruction:
                        "Crée une liste d’actions puis parcours-la pour rejoindre la sortie.",

                    difficulty:
                        "Difficile",

                    guideMessage:
                        "Cette fois, la liste décrit le trajet lui-même.",

                    starterCode:
`actions = [
    "avancer",
    "droite",
    "avancer"
]

for action in actions:
    # Exécute l'action correspondante.
    pass`,

                    requiredConcepts: [
                        "list",
                        "for",
                        "if"
                    ],

                    map: {

                        width: 9,
                        height: 7,

                        blocked: [
                            [3, 1],
                            [3, 2],
                            [5, 4],
                            [6, 4]
                        ],

                        decorations: [
                            {
                                type: "tonneau",
                                x: 3,
                                y: 1
                            },
                            {
                                type: "porte",
                                x: 7,
                                y: 5
                            }
                        ]
                    },

                    robot: {
                        x: 1,
                        y: 1,
                        direction: "E"
                    },

                    goal: {
                        rules: [
                            {
                                type: "position",
                                x: 7,
                                y: 5
                            }
                        ]
                    },

                    hints: [
                        "Compare action à \"avancer\", \"gauche\" ou \"droite\".",
                        "Chaque valeur peut déclencher une instruction différente."
                    ]
                })

            ]
        }),



        /* =================================================
           CHAPITRE 7
           DICTIONNAIRES
        ================================================= */

        chapter({

            chapter: 7,

            title:
                "Dictionnaires",

            subtitle:
                "Associe des noms à des valeurs.",

            room:
                "Balcon",

            theory: [

                {
                    title:
                        "Clé et valeur",

                    body:
                        "Un dictionnaire associe une clé à une valeur.",

                    code:
`distances = {
    "table": 2,
    "porte": 4
}`
                },


                {
                    title:
                        "Lire une valeur",

                    body:
                        "On utilise la clé entre crochets.",

                    code:
`distances = {
    "table": 2
}

avancer(distances["table"])`
                },


                {
                    title:
                        "Plusieurs informations",

                    body:
                        "Les valeurs peuvent aussi être du texte, des listes ou d’autres dictionnaires.",

                    code:
`mission = {
    "objet": "clé",
    "distance": 3
}`
                }
            ],


            levels: [

                level({

                    level: 1,

                    title:
                        "Distance enregistrée",

                    instruction:
                        "Lis la distance dans le dictionnaire pour rejoindre la table du balcon.",

                    difficulty:
                        "Facile",

                    guideMessage:
                        "La valeur dont tu as besoin est déjà enregistrée dans le dictionnaire.",

                    starterCode:
`distances = {
    "table": 4
}

# Utilise la valeur associée à "table".
`,

                    requiredConcepts: [
                        "dictionary",
                        "dictionary_access"
                    ],

                    map: {

                        width: 8,
                        height: 5,

                        blocked: [],

                        decorations: [
                            {
                                type: "table",
                                x: 6,
                                y: 2
                            },
                            {
                                type: "plante",
                                x: 7,
                                y: 4
                            }
                        ]
                    },

                    robot: {
                        x: 2,
                        y: 2,
                        direction: "E"
                    },

                    goal: {
                        rules: [
                            {
                                type: "position",
                                x: 6,
                                y: 2
                            }
                        ]
                    },

                    hints: [
                        "La valeur se lit avec distances[\"table\"]."
                    ]
                }),



                level({

                    level: 2,

                    title:
                        "Mission enregistrée",

                    instruction:
                        "Utilise les informations du dictionnaire pour récupérer l’arrosoir.",

                    difficulty:
                        "Moyen",

                    guideMessage:
                        "Le nom de l’objet et la distance sont tous les deux stockés dans mission.",

                    starterCode:
`mission = {
    "objet": "arrosoir",
    "distance": 3
}

# Utilise les deux valeurs.
`,

                    requiredConcepts: [
                        "dictionary",
                        "dictionary_access",
                        "pickup"
                    ],

                    map: {

                        width: 8,
                        height: 5,

                        blocked: [
                            [6, 1]
                        ],

                        decorations: [
                            {
                                type: "plante",
                                x: 6,
                                y: 1
                            }
                        ]
                    },

                    robot: {
                        x: 1,
                        y: 3,
                        direction: "E"
                    },

                    objects: [
                        {
                            id: "arrosoir",
                            type: "arrosoir",
                            label: "Arrosoir",
                            x: 4,
                            y: 3,
                            pickable: true
                        }
                    ],

                    goal: {
                        rules: [
                            {
                                type: "inventory_has",
                                object: "arrosoir"
                            }
                        ]
                    },

                    hints: [
                        "mission[\"distance\"] donne le nombre de cases.",
                        "mission[\"objet\"] donne le nom à transmettre à ramasser()."
                    ]
                }),



                level({

                    level: 3,

                    title:
                        "Plan du balcon",

                    instruction:
                        "Utilise un dictionnaire contenant plusieurs étapes pour arroser les deux plantes.",

                    difficulty:
                        "Difficile",

                    guideMessage:
                        "Une structure de données peut décrire toute une mission.",

                    starterCode:
`trajet = {
    "premiere": 2,
    "seconde": 3
}

# Rejoins les deux plantes.
`,

                    requiredConcepts: [
                        "dictionary",
                        "dictionary_access_multiple",
                        "sequence"
                    ],

                    map: {

                        width: 9,
                        height: 7,

                        blocked: [
                            [4, 2],
                            [4, 3]
                        ],

                        decorations: [
                            {
                                type: "plante",
                                x: 3,
                                y: 1
                            },
                            {
                                type: "plante",
                                x: 7,
                                y: 5
                            }
                        ]
                    },

                    robot: {
                        x: 1,
                        y: 1,
                        direction: "E"
                    },

                    targets: [
                        {
                            id: "plante_1",
                            type: "visit",
                            x: 3,
                            y: 1
                        },
                        {
                            id: "plante_2",
                            type: "visit",
                            x: 7,
                            y: 5
                        }
                    ],

                    goal: {
                        rules: [
                            {
                                type: "visited",
                                x: 3,
                                y: 1
                            },
                            {
                                type: "visited",
                                x: 7,
                                y: 5
                            }
                        ]
                    },

                    hints: [
                        "La première distance permet d’atteindre la première plante.",
                        "Tu peux ensuite tourner et continuer vers la seconde."
                    ]
                })

            ]
        }),



        /* =================================================
           CHAPITRE 8
           WHILE
        ================================================= */

        chapter({

            chapter: 8,

            title:
                "Boucles while",

            subtitle:
                "Répète des instructions tant qu’une condition est vraie.",

            room:
                "Toilette",

            theory: [

                {
                    title:
                        "while",

                    body:
                        "Une boucle while continue tant que sa condition reste vraie.",

                    code:
`while devant_libre():
    avancer()`
                },


                {
                    title:
                        "Attention aux boucles infinies",

                    body:
                        "Le code exécuté dans la boucle doit finir par modifier la situation ou la condition risque de rester vraie pour toujours.",

                    code:
`while position_x() < 5:
    avancer()`
                },


                {
                    title:
                        "while avec une condition",

                    body:
                        "Une boucle peut contenir des if, des virages et d’autres instructions.",

                    code:
`while not sur_objet("clé"):
    if devant_libre():
        avancer()
    else:
        tourner_droite()`
                }
            ],


            levels: [

                level({

                    level: 1,

                    title:
                        "Jusqu’au mur",

                    instruction:
                        "Fais avancer Pyt tant que la case devant lui est libre.",

                    difficulty:
                        "Facile",

                    guideMessage:
                        "Tu ne connais pas la distance. La condition devant_libre() peut décider quand arrêter la boucle.",

                    starterCode:
`while devant_libre():
    # Complète.
    pass`,

                    requiredConcepts: [
                        "while"
                    ],

                    map: {

                        width: 9,
                        height: 5,

                        blocked: [
                            [7, 2]
                        ],

                        decorations: [
                            {
                                type: "lavabo",
                                x: 7,
                                y: 2
                            }
                        ]
                    },

                    robot: {
                        x: 1,
                        y: 2,
                        direction: "E"
                    },

                    goal: {
                        rules: [
                            {
                                type: "position",
                                x: 6,
                                y: 2
                            }
                        ]
                    },

                    hints: [
                        "La boucle s’arrête automatiquement quand devant_libre() devient faux."
                    ]
                }),



                level({

                    level: 2,

                    title:
                        "Contourner l’obstacle",

                    instruction:
                        "Utilise while et une condition pour avancer jusqu’à la sortie.",

                    difficulty:
                        "Moyen",

                    guideMessage:
                        "Quand la route est bloquée, Pyt devra changer de direction.",

                    starterCode:
`while position_x() < 7:
    if devant_libre():
        avancer()
    else:
        # Que faire ?
        pass`,

                    requiredConcepts: [
                        "while",
                        "if",
                        "else"
                    ],

                    map: {

                        width: 9,
                        height: 7,

                        blocked: [
                            [4, 1],
                            [4, 2],
                            [4, 3]
                        ],

                        decorations: [
                            {
                                type: "meuble",
                                x: 4,
                                y: 2
                            }
                        ]
                    },

                    robot: {
                        x: 1,
                        y: 2,
                        direction: "E"
                    },

                    targets: [
                        {
                            id: "sortie",
                            type: "destination",
                            x: 7,
                            y: 5
                        }
                    ],

                    goal: {
                        rules: [
                            {
                                type: "position",
                                x: 7,
                                y: 5
                            }
                        ]
                    },

                    hints: [
                        "La boucle peut contenir un if.",
                        "Teste devant_libre() avant chaque déplacement."
                    ]
                }),



                level({

                    level: 3,

                    title:
                        "Trouver la clé",

                    instruction:
                        "Continue à explorer jusqu’à ce que Pyt trouve la clé.",

                    difficulty:
                        "Difficile",

                    guideMessage:
                        "La boucle peut s’arrêter quand Pyt se trouve enfin sur la clé.",

                    starterCode:
`while not sur_objet("cle"):
    if devant_libre():
        avancer()
    else:
        tourner_droite()

# Que faire une fois la clé trouvée ?
`,

                    requiredConcepts: [
                        "while",
                        "if",
                        "pickup"
                    ],

                    map: {

                        width: 9,
                        height: 7,

                        blocked: [
                            [3, 1],
                            [3, 2],
                            [5, 4],
                            [6, 4],
                            [7, 2]
                        ],

                        decorations: [
                            {
                                type: "meuble",
                                x: 3,
                                y: 1
                            }
                        ]
                    },

                    robot: {
                        x: 1,
                        y: 1,
                        direction: "E"
                    },

                    objects: [
                        {
                            id: "cle",
                            type: "cle",
                            label: "Clé",
                            x: 7,
                            y: 5,
                            pickable: true
                        }
                    ],

                    goal: {
                        rules: [
                            {
                                type: "inventory_has",
                                object: "cle"
                            }
                        ]
                    },

                    hints: [
                        "La boucle doit se terminer lorsque sur_objet(\"cle\") devient vrai.",
                        "Après la boucle, Pyt se trouve normalement sur la clé."
                    ]
                })

            ]
        }),



        /* =================================================
           CHAPITRE 9
           SYNTHÈSE
        ================================================= */

        chapter({

            chapter: 9,

            title:
                "Mission finale",

            subtitle:
                "Combine tout ce que tu as appris.",

            room:
                "Jardin",

            theory: [

                {
                    title:
                        "Construire un programme",

                    body: [
                        "Un programme peut mélanger variables, conditions, boucles, fonctions et structures de données.",
                        "Il n’existe pas toujours une seule bonne solution."
                    ]
                },


                {
                    title:
                        "Décomposer le problème",

                    body: [
                        "Commence par identifier les petites tâches : se déplacer, récupérer un objet, contourner un obstacle puis atteindre la destination.",
                        "Une fonction peut représenter une tâche. Une liste ou un dictionnaire peut stocker les informations nécessaires."
                    ]
                },


                {
                    title:
                        "Tester progressivement",

                    body:
                        "Un programme complexe est plus facile à corriger si tu testes chaque partie avant d’ajouter la suivante."
                }
            ],


            levels: [

                level({

                    level: 1,

                    title:
                        "Préparer la piscine",

                    instruction:
                        "Récupère la bouée puis apporte-la jusqu’à la piscine.",

                    difficulty:
                        "Moyen",

                    guideMessage:
                        "Tu peux choisir ta méthode. Utilise au moins une structure de contrôle.",

                    starterCode:
`# Récupère la bouée puis rejoins la piscine.
`,

                    requiredConcepts: [
                        "control_structure"
                    ],

                    map: {

                        width: 10,
                        height: 8,

                        blocked: [
                            [4, 1],
                            [4, 2],
                            [4, 3],
                            [6, 5]
                        ],

                        decorations: [
                            {
                                type: "piscine",
                                x: 8,
                                y: 5
                            },
                            {
                                type: "transat",
                                x: 8,
                                y: 2
                            },
                            {
                                type: "arbre",
                                x: 4,
                                y: 1
                            }
                        ]
                    },

                    robot: {
                        x: 1,
                        y: 1,
                        direction: "E"
                    },

                    objects: [
                        {
                            id: "bouee",
                            type: "bouee",
                            label: "Bouée",
                            x: 2,
                            y: 6,
                            pickable: true
                        }
                    ],

                    targets: [
                        {
                            id: "piscine",
                            type: "destination",
                            x: 8,
                            y: 6
                        }
                    ],

                    goal: {
                        rules: [
                            {
                                type: "inventory_has",
                                object: "bouee"
                            },
                            {
                                type: "position",
                                x: 8,
                                y: 6
                            }
                        ]
                    },

                    hints: [
                        "Commence par découper la mission en deux étapes.",
                        "Tu peux créer une fonction pour une partie du trajet."
                    ]
                }),



                level({

                    level: 2,

                    title:
                        "Entretien du jardin",

                    instruction:
                        "Récupère l’arrosoir et visite les trois plantes du jardin.",

                    difficulty:
                        "Difficile",

                    guideMessage:
                        "Plusieurs plantes doivent être visitées. Une liste peut être utile pour organiser la mission.",

                    starterCode:
`plantes = [
    "plante_1",
    "plante_2",
    "plante_3"
]

# Organise ton programme.
`,

                    requiredConcepts: [
                        "list",
                        "loop",
                        "function_or_condition"
                    ],

                    map: {

                        width: 11,
                        height: 8,

                        blocked: [
                            [4, 2],
                            [4, 3],
                            [7, 4],
                            [7, 5]
                        ],

                        decorations: [
                            {
                                type: "plante",
                                x: 3,
                                y: 1
                            },
                            {
                                type: "plante",
                                x: 6,
                                y: 6
                            },
                            {
                                type: "plante",
                                x: 9,
                                y: 2
                            },
                            {
                                type: "fontaine",
                                x: 5,
                                y: 4
                            }
                        ]
                    },

                    robot: {
                        x: 1,
                        y: 6,
                        direction: "E"
                    },

                    objects: [
                        {
                            id: "arrosoir",
                            type: "arrosoir",
                            label: "Arrosoir",
                            x: 2,
                            y: 6,
                            pickable: true
                        }
                    ],

                    targets: [
                        {
                            id: "plante_1",
                            type: "visit",
                            x: 3,
                            y: 1
                        },
                        {
                            id: "plante_2",
                            type: "visit",
                            x: 6,
                            y: 6
                        },
                        {
                            id: "plante_3",
                            type: "visit",
                            x: 9,
                            y: 2
                        }
                    ],

                    goal: {
                        rules: [
                            {
                                type: "inventory_has",
                                object: "arrosoir"
                            },
                            {
                                type: "visited",
                                x: 3,
                                y: 1
                            },
                            {
                                type: "visited",
                                x: 6,
                                y: 6
                            },
                            {
                                type: "visited",
                                x: 9,
                                y: 2
                            }
                        ]
                    },

                    hints: [
                        "L’arrosoir doit être récupéré avant de terminer le parcours.",
                        "Une fonction de déplacement peut éviter de recopier du code."
                    ]
                }),



                level({

                    level: 3,

                    title:
                        "La grande mission PYT",

                    instruction:
                        "Récupère la clé, récupère le colis, passe par la piscine puis dépose le colis devant la porte de la maison.",

                    difficulty:
                        "Final",

                    guideMessage:
                        "C’est la mission finale. Utilise librement tout ce que tu as appris pour construire ton programme.",

                    starterCode:
`mission = {
    "cle": "cle",
    "colis": "colis",
    "destination": "porte"
}

def mission_finale():
    # Construis ta solution.
    pass

mission_finale()
`,

                    requiredConcepts: [
                        "function_definition",
                        "dictionary",
                        "control_structure",
                        "loop"
                    ],

                    map: {

                        width: 12,
                        height: 9,

                        blocked: [
                            [4, 1],
                            [4, 2],
                            [4, 3],

                            [7, 4],
                            [7, 5],

                            [9, 2],
                            [9, 3]
                        ],

                        decorations: [
                            {
                                type: "arbre",
                                x: 4,
                                y: 1
                            },
                            {
                                type: "piscine",
                                x: 8,
                                y: 6
                            },
                            {
                                type: "transat",
                                x: 9,
                                y: 7
                            },
                            {
                                type: "porte",
                                x: 10,
                                y: 1
                            },
                            {
                                type: "fleurs",
                                x: 2,
                                y: 7
                            },
                            {
                                type: "fontaine",
                                x: 6,
                                y: 2
                            }
                        ]
                    },

                    robot: {
                        x: 1,
                        y: 1,
                        direction: "S"
                    },

                    objects: [
                        {
                            id: "cle",
                            type: "cle",
                            label: "Clé",
                            x: 1,
                            y: 6,
                            pickable: true
                        },
                        {
                            id: "colis",
                            type: "caisse",
                            label: "Colis",
                            x: 6,
                            y: 7,
                            pickable: true
                        }
                    ],

                    targets: [
                        {
                            id: "piscine",
                            type: "visit",
                            x: 8,
                            y: 7,
                            label: "Piscine"
                        },
                        {
                            id: "porte",
                            type: "deposit",
                            x: 10,
                            y: 1,
                            label: "Porte"
                        }
                    ],

                    goal: {
                        rules: [
                            {
                                type: "inventory_has",
                                object: "cle"
                            },
                            {
                                type: "visited",
                                x: 8,
                                y: 7
                            },
                            {
                                type: "object_at",
                                object: "colis",
                                x: 10,
                                y: 1
                            },
                            {
                                type: "position",
                                x: 10,
                                y: 1
                            }
                        ]
                    },

                    hints: [
                        "Résous d’abord chaque partie séparément.",
                        "Une fonction peut gérer une étape du trajet.",
                        "Le colis doit être déposé devant la porte, pas seulement conservé dans l’inventaire.",
                        "Il existe plusieurs programmes corrects. Seul le résultat et l’utilisation des notions demandées comptent."
                    ]
                })

            ]
        })

    ];



    /* =====================================================
       EXPORT
    ===================================================== */

    const data = {

        version:
            1,

        chapterCount:
            chapters.length,

        levelCount:
            chapters.reduce(
                (
                    total,
                    currentChapter
                ) =>
                    total +
                    currentChapter.levels.length,
                0
            ),

        chapters
    };


    window.PYT_LEVELS =
        data;


    /*
    Alias pratiques pour éviter de casser
    une ancienne partie du projet qui chercherait
    encore LEVELS.
    */

    window.GAME_LEVELS =
        data;

    window.LEVELS =
        data;

})();