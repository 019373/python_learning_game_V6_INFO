"use strict";

/* PYT - levels.js | 9 chapitres, 27 exercices. */
/* Les décors et textes de théorie proviennent de la version existante. */
/* Les objectifs sont renforcés sans modifier art.js. */

const PYT_MAP_WIDTH = 8;
const PYT_MAP_HEIGHT = 6;

// Décorations originales de chaque pièce : aucune modification visuelle.
const ROOM_DECOR = {
    "entree": [
        ["plante", 0, 0, 0.8],
        ["table", 6, 0, 1.18],
        ["lampe", 7, 0, 0.62],
        ["tapis", 3, 2, 1.45],
        ["caisse", 0, 4, 0.66],
        ["chaise", 7, 4, 0.72],
    ],
    "cuisine": [
        ["frigo", 0, 0, 1.04],
        ["evier", 2, 0, 1.34],
        ["four", 6, 0, 0.96],
        ["table", 3, 2, 1.55],
        ["chaise", 2, 2, 0.63],
        ["chaise", 5, 2, 0.63],
        ["plante", 7, 4, 0.67],
        ["tasse", 4, 2, 0.38],
    ],
    "salon": [
        ["canape", 0, 1, 1.75],
        ["table", 3, 2, 1.16],
        ["bibliotheque", 6, 0, 1.2],
        ["lampe", 5, 0, 0.63],
        ["plante", 7, 4, 0.72],
        ["tapis", 3, 3, 1.55],
        ["livre", 4, 2, 0.34],
    ],
    "chambre": [
        ["lit", 5, 0, 1.82],
        ["tapis", 3, 2, 1.5],
        ["table", 0, 0, 0.8],
        ["lampe", 1, 0, 0.56],
        ["plante", 7, 4, 0.69],
        ["livre_bleu", 1, 1, 0.35],
    ],
    "garage": [
        ["voiture", 5, 1, 1.95],
        ["boite_outils", 7, 0, 0.84],
        ["caisse", 0, 0, 0.72],
        ["caisse", 0, 1, 0.6],
        ["lampe", 7, 4, 0.63],
    ],
    "cave_a_vin": [
        ["casier_vin", 0, 0, 1.3],
        ["casier_vin", 6, 0, 1.3],
        ["tonneau", 0, 4, 0.88],
        ["tonneau", 7, 4, 0.88],
        ["table", 3, 2, 1.08],
        ["lampe", 4, 0, 0.58],
        ["bouteille_rouge", 4, 2, 0.32],
    ],
    "balcon": [
        ["table", 3, 2, 1.12],
        ["chaise", 2, 2, 0.63],
        ["chaise", 5, 2, 0.63],
        ["plante", 0, 0, 0.78],
        ["fleurs", 7, 0, 0.75],
        ["arrosoir", 7, 4, 0.52],
        ["lampe", 0, 4, 0.58],
    ],
    "toilette": [
        ["toilette", 0, 1, 1],
        ["lavabo", 6, 0, 1],
        ["plante", 7, 4, 0.6],
        ["lampe", 4, 0, 0.5],
        ["tapis", 3, 3, 1.2],
    ],
    "jardin": [
        ["arbre", 0, 0, 1.18],
        ["arbre", 7, 0, 1.18],
        ["buisson", 0, 4, 0.9],
        ["fleurs", 1, 0, 0.72],
        ["fleurs", 7, 4, 0.72],
        ["piscine", 5, 2, 1.75, {"animate": true}],
        ["transat", 4, 0, 0.73],
        ["transat", 5, 0, 0.73],
        ["banc", 1, 4, 0.92],
        ["fontaine", 3, 0, 0.76],
    ],
};

function getRoomDecorations(room) {
    return (ROOM_DECOR[room] || []).map(
        ([type, x, y, scale, options]) => ({
            type,
            x,
            y,
            scale,
            ...(options || {})
        })
    );
}

// Textes de théorie et noms des chapitres conservés.
const PYT_LEVEL_DATA = {
    version: "9.0",
    chapters: [
        {
            chapter: 1,
            title: "Premiers pas",
            subtitle: "Déplacer Pyt dans la maison",
            room: "entree",
            theory: [
                {
                    "title": "Bienvenue dans PYT",
                    "body": [
                        "Pyt se déplace sur une grille. Chaque case correspond à un déplacement.",
                        "Tu vas écrire de petites instructions Python pour lui indiquer où aller."
                    ]
                },
                {
                    "title": "Avancer",
                    "body": "La commande forward() fait avancer Pyt dans la direction qu’il regarde.",
                    "code": "forward(1)\n\nforward(3)"
                },
                {
                    "title": "Tourner",
                    "body": "Pyt peut tourner à gauche ou à droite. Un quart de tour correspond à 90 degrés.",
                    "code": "left(90)\n\nright(90)"
                },
                {
                    "title": "Reculer",
                    "body": "backward() déplace Pyt vers l’arrière sans changer la direction dans laquelle il regarde.",
                    "code": "backward(2)"
                },
                {
                    "title": "Une instruction après l’autre",
                    "body": "Python exécute les lignes dans l’ordre, de haut en bas.",
                    "code": "forward(2)\nright(90)\nforward(1)"
                },
            ],
            levels: []
        },
        {
            chapter: 2,
            title: "Variables",
            subtitle: "Donner un nom aux valeurs",
            room: "cuisine",
            theory: [
                {
                    "title": "Une variable",
                    "body": "Une variable permet de stocker une valeur sous un nom.",
                    "code": "distance = 3"
                },
                {
                    "title": "Réutiliser une valeur",
                    "body": "Une fois créée, la variable peut être utilisée à la place du nombre.",
                    "code": "distance = 3\n\nforward(distance)"
                },
                {
                    "title": "Plusieurs variables",
                    "body": "Tu peux stocker plusieurs informations séparément.",
                    "code": "horizontal = 2\nvertical = 4"
                },
                {
                    "title": "Modifier une variable",
                    "body": "La valeur d’une variable peut changer pendant le programme.",
                    "code": "distance = 2\ndistance = distance + 1"
                },
            ],
            levels: []
        },
        {
            chapter: 3,
            title: "Conditions",
            subtitle: "Permettre à Pyt de prendre une décision",
            room: "salon",
            theory: [
                {
                    "title": "La condition if",
                    "body": "if permet d’exécuter du code seulement lorsqu’une condition est vraie.",
                    "code": "if front_is_clear():\n    forward(1)"
                },
                {
                    "title": "Sinon",
                    "body": "else permet de prévoir une autre action lorsque la condition est fausse.",
                    "code": "if front_is_clear():\n    forward(1)\nelse:\n    left(90)"
                },
                {
                    "title": "not",
                    "body": "not inverse une condition.",
                    "code": "if not front_is_clear():\n    right(90)"
                },
                {
                    "title": "Indentation",
                    "body": "En Python, les lignes qui appartiennent au if doivent être décalées vers la droite."
                },
            ],
            levels: []
        },
        {
            chapter: 4,
            title: "Boucles for",
            subtitle: "Répéter une action un nombre connu de fois",
            room: "chambre",
            theory: [
                {
                    "title": "Répéter",
                    "body": "Une boucle for évite de recopier plusieurs fois la même instruction.",
                    "code": "for i in range(4):\n    forward(1)"
                },
                {
                    "title": "range()",
                    "body": "range(4) produit quatre répétitions : 0, 1, 2 et 3."
                },
                {
                    "title": "La variable de boucle",
                    "body": "Dans for i in range(...), i change automatiquement à chaque répétition.",
                    "code": "for i in range(3):\n    print(i)"
                },
                {
                    "title": "Plusieurs boucles",
                    "body": "Un programme peut contenir plusieurs boucles pour différentes parties d’un trajet."
                },
            ],
            levels: []
        },
        {
            chapter: 5,
            title: "Fonctions",
            subtitle: "Créer ses propres commandes",
            room: "garage",
            theory: [
                {
                    "title": "Créer une fonction",
                    "body": "def permet de regrouper plusieurs instructions sous un seul nom.",
                    "code": "def avancer_deux():\n    forward(1)\n    forward(1)"
                },
                {
                    "title": "Appeler la fonction",
                    "body": "Définir une fonction ne l’exécute pas. Il faut ensuite l’appeler.",
                    "code": "avancer_deux()"
                },
                {
                    "title": "Paramètres",
                    "body": "Une fonction peut recevoir une valeur.",
                    "code": "def avancer_de(distance):\n    forward(distance)"
                },
                {
                    "title": "return",
                    "body": "return permet à une fonction de renvoyer une valeur.",
                    "code": "def distance():\n    return 3"
                },
            ],
            levels: []
        },
        {
            chapter: 6,
            title: "Listes",
            subtitle: "Stocker plusieurs valeurs dans un ordre précis",
            room: "cave_a_vin",
            theory: [
                {
                    "title": "Créer une liste",
                    "body": "Une liste regroupe plusieurs valeurs entre crochets.",
                    "code": "distances = [2, 4, 1]"
                },
                {
                    "title": "Lire une valeur",
                    "body": "Les positions commencent à 0.",
                    "code": "distances = [2, 4, 1]\n\nprint(distances[0])\nprint(distances[1])"
                },
                {
                    "title": "Liste et boucle",
                    "body": "Une boucle for peut parcourir directement les valeurs d’une liste.",
                    "code": "distances = [1, 2, 1]\n\nfor distance in distances:\n    forward(distance)"
                },
            ],
            levels: []
        },
        {
            chapter: 7,
            title: "Dictionnaires",
            subtitle: "Associer une clé à une valeur",
            room: "balcon",
            theory: [
                {
                    "title": "Créer un dictionnaire",
                    "body": "Un dictionnaire associe des noms, appelés clés, à des valeurs.",
                    "code": "trajet = {\n    \"distance\": 3,\n    \"angle\": 90\n}"
                },
                {
                    "title": "Lire une valeur",
                    "body": "On utilise la clé entre crochets.",
                    "code": "trajet = {\"distance\": 3}\n\nforward(trajet[\"distance\"])"
                },
                {
                    "title": "Plusieurs informations",
                    "body": "Un dictionnaire est utile lorsque chaque valeur possède une signification précise."
                },
                {
                    "title": "Dictionnaire et condition",
                    "body": "La valeur associée à une clé peut aussi être utilisée dans une condition.",
                    "code": "config = {\"tour\": \"left\"}\n\nif config[\"tour\"] == \"left\":\n    left(90)"
                },
            ],
            levels: []
        },
        {
            chapter: 8,
            title: "Boucles while",
            subtitle: "Répéter tant qu’une condition est vraie",
            room: "toilette",
            theory: [
                {
                    "title": "while",
                    "body": "Une boucle while continue tant que sa condition reste vraie.",
                    "code": "while front_is_clear():\n    forward(1)"
                },
                {
                    "title": "Attention aux boucles infinies",
                    "body": "Si la condition ne devient jamais fausse, la boucle ne peut pas s’arrêter."
                },
                {
                    "title": "Utiliser une position",
                    "body": "Pyt peut connaître sa position avec position_x() et position_y().",
                    "code": "while position_x() < 5:\n    forward(1)"
                },
                {
                    "title": "Plusieurs while",
                    "body": "Une mission peut utiliser une première boucle pour un segment puis une seconde pour un autre."
                },
            ],
            levels: []
        },
        {
            chapter: 9,
            title: "Mission finale",
            subtitle: "Combiner les outils Python appris dans la maison",
            room: "jardin",
            theory: [
                {
                    "title": "La mission finale",
                    "body": [
                        "Dans le jardin, tu vas combiner plusieurs notions apprises dans les chapitres précédents.",
                        "Il n’existe pas une seule bonne façon d’écrire le programme. PYT vérifie principalement le résultat obtenu et les notions demandées."
                    ]
                },
                {
                    "title": "Décomposer le problème",
                    "body": [
                        "Observe d’abord la carte.",
                        "Découpe ensuite la mission en petites parties : déplacement, décision, répétition et interaction."
                    ]
                },
                {
                    "title": "Réutiliser une fonction",
                    "body": "Une fonction peut éviter de répéter plusieurs fois la même logique."
                },
                {
                    "title": "Choisir la bonne structure",
                    "body": [
                        "Une liste est utile pour conserver une suite de valeurs.",
                        "Un dictionnaire est utile pour associer des noms à des informations.",
                        "for convient lorsque le nombre de répétitions est connu.",
                        "while convient lorsque l’arrêt dépend d’une condition."
                    ]
                },
            ],
            levels: []
        },
    ]
};

// Titres existants des 27 missions.
const LEVEL_TITLES = [
    ["Le couloir", "Tourner dans l’entrée", "Marche arrière"],
    ["La bonne distance", "Deux distances", "Le service"],
    ["Le canapé bloque le passage", "Changer de direction", "La clé du salon"],
    ["Répéter les pas", "Deux répétitions", "Les livres oubliés"],
    ["Une commande personnalisée", "Fonction avec paramètre", "Une fonction qui calcule"],
    ["Une distance dans une liste", "Deux valeurs", "Une liste d’actions"],
    ["La distance nommée", "Le trajet organisé", "Configuration de Pyt"],
    ["Jusqu’au mur", "Jusqu’à la coordonnée", "Deux couloirs"],
    ["Traversée du jardin", "La clé du portail", "Mission PYT"],
];

/* =========================================================
   SCÉNARIOS : départ, étapes, obstacles et missions.
   Les étapes doivent être atteintes dans l'ordre indiqué.
   Toutes les coordonnées sont sur la grille 8 × 6.
========================================================= */

const MISSIONS = [

    // CHAPITRE 1 : séquences et déplacements.

    {
        c: 1, n: 1,
        start: [1,4,"E"], end: [5,4],
        walls: [[0,0],[6,0],[7,0],[0,4],[7,4]],
        concepts: ["forward"],
        instruction: "Traverse le couloir jusqu'à la zone lumineuse. Compte exactement les cases.",
        guide: "Commence par une seule commande forward(distance).",
        hints: [
            "Pyt regarde vers l'est.",
            "Il y a quatre cases à parcourir."
        ]
    },

    {
        c: 1, n: 2,
        start: [1,4,"E"], end: [4,1],
        via: [[5,4],[5,1]],
        walls: [[2,2],[3,2],[3,3],[6,0]],
        concepts: ["forward","left"],
        instruction: "Effectue trois segments : avance vers la droite, monte dans l'entrée, puis rejoins l'objectif à gauche.",
        guide: "Il faut organiser plusieurs changements de direction.",
        hints: [
            "Va d'abord jusqu'à (5,4).",
            "Tourne vers le nord puis termine vers l'ouest."
        ]
    },

    {
        c: 1, n: 3,
        start: [5,4,"E"], end: [3,2],
        via: [[3,4],[5,2]],
        walls: [[0,0],[6,3],[2,3],[7,0]],
        buttons: [["interrupteur_entree",5,2]],
        needButtons: 1,
        concepts: ["backward","left","right","forward"],
        instruction: "Recule d'abord, atteins l'interrupteur en haut à droite, active-le et reviens à l'objectif. Combine reculer et plusieurs rotations.",
        guide: "Le bouton s'active automatiquement quand Pyt passe dessus.",
        hints: [
            "Commence par backward(2).",
            "Passe par (3,4), puis (5,2), avant le point final."
        ]
    },

    // CHAPITRE 2 : variables et opérations.

    {
        c: 2, n: 1,
        start: [1,3,"E"], end: [6,3],
        via: [[3,3]],
        walls: [[0,0],[2,0],[3,0],[6,0],[3,2],[4,2]],
        concepts: ["variable","forward"],
        instruction: "Définis une variable distance et utilise-la pour traverser la cuisine jusqu'à l'objectif.",
        guide: "Calcule le nombre de cases, puis passe la variable à forward().",
        hints: [
            "Utilise distance = 5.",
            "L'objectif est sur la même ligne que Pyt."
        ]
    },

    {
        c: 2, n: 2,
        start: [1,1,"E"], end: [5,3],
        via: [[3,1],[5,1]],
        walls: [[0,0],[3,2],[4,2],[6,0]],
        objects: [["pomme_service","pomme",3,1]],
        deposits: [["assiette_service",5,3,"pomme_service"]],
        must: ["pomme_service"],
        concepts: ["variable","right","forward"],
        instruction: "Avec deux distances stockées dans des variables, ramasse la pomme sur le trajet horizontal, puis dépose-la au bout du trajet vertical.",
        guide: "La pomme se ramasse automatiquement; la zone bleue effectue le dépôt.",
        hints: [
            "Avance jusqu'à la colonne 5.",
            "right(90) fait ensuite regarder vers le bas."
        ]
    },

    {
        c: 2, n: 3,
        start: [6,4,"W"], end: [2,1],
        via: [[4,4],[2,4],[2,3]],
        walls: [[0,0],[2,0],[3,2],[4,2],[5,2],[7,0]],
        objects: [["tasse_service","tasse",4,4]],
        deposits: [["table_service",2,1,"tasse_service"]],
        buttons: [["bouton_cuisine",2,3]],
        must: ["tasse_service"],
        needButtons: 1,
        concepts: ["variable","right","forward"],
        instruction: "Organise les distances avec des variables et un calcul. Ramasse la tasse, active le bouton du couloir et livre la tasse à la table.",
        guide: "Trois objectifs à réussir en une seule exécution.",
        hints: [
            "Commence vers l'ouest en passant par (4,4).",
            "Depuis l'ouest, right(90) tourne vers le nord."
        ]
    },

    // CHAPITRE 3 : conditions.

    {
        c: 3, n: 1,
        start: [1,4,"E"], end: [2,1],
        via: [[2,4]],
        walls: [[3,4],[0,1],[1,1],[6,0],[7,0]],
        concepts: ["condition","left","forward"],
        noCollisions: true,
        instruction: "Un mur ferme la route. Utilise if et front_is_clear() pour éviter l'obstacle, puis monte vers la zone finale sans collision.",
        guide: "Au niveau de (2,4), la case devant est bloquée.",
        hints: [
            "Vérifie le passage avant de tourner.",
            "Depuis l'est, left(90) oriente vers le nord."
        ]
    },

    {
        c: 3, n: 2,
        start: [1,1,"E"], end: [3,4],
        via: [[2,1],[2,4]],
        walls: [[0,1],[4,1],[3,2],[6,0],[7,0]],
        concepts: ["condition","right","left","forward"],
        noCollisions: true,
        instruction: "Analyse les obstacles pour descendre par un passage sûr, puis reviens vers la droite au bas du salon. Utilise if/else.",
        guide: "Le passage direct vers la droite est fermé et une case au centre bloque aussi.",
        hints: [
            "Passe par (2,1), puis (2,4).",
            "Tourne vers le sud puis vers l'est."
        ]
    },

    {
        c: 3, n: 3,
        start: [1,4,"E"], end: [5,1],
        via: [[2,4],[2,1]],
        walls: [[3,4],[0,1],[4,3],[6,0],[7,0]],
        objects: [["cle_salon","cle",2,4]],
        deposits: [["depot_cle",5,1,"cle_salon"]],
        buttons: [["bouton_salon",2,1]],
        must: ["cle_salon"],
        needButtons: 1,
        concepts: ["condition","left","right","forward"],
        noCollisions: true,
        instruction: "Avec des conditions, évite les obstacles, ramasse la clé, active l'interrupteur et dépose la clé à l'autre bout du salon.",
        guide: "La clé et le bouton sont sur le parcours imposé.",
        hints: [
            "Récupère la clé à (2,4).",
            "Monte jusqu'à (2,1) avant de traverser vers l'est."
        ]
    },

    // CHAPITRE 4 : boucles for.

    {
        c: 4, n: 1,
        start: [1,3,"E"], end: [6,3],
        via: [[3,3]],
        walls: [[0,0],[5,0],[6,0],[3,2]],
        concepts: ["for","range","forward"],
        instruction: "Traverse la chambre avec une boucle for et range(), sans répéter manuellement chaque ligne.",
        guide: "Il faut cinq déplacements en direction de l'est.",
        hints: [
            "for i in range(5):",
            "Pense à indenter forward(1)."
        ]
    },

    {
        c: 4, n: 2,
        start: [1,4,"E"], end: [5,1],
        via: [[5,4]],
        walls: [[0,0],[5,0],[6,0],[3,2]],
        buttons: [["lampe_chambre",5,4]],
        needButtons: 1,
        concepts: ["for","range","left","forward"],
        noCollisions: true,
        instruction: "Avec deux boucles for, traverse la chambre, active la lampe au bout de la ligne, puis rejoins l'objectif en hauteur.",
        guide: "Deux séries de déplacements et un quart de tour.",
        hints: [
            "La première boucle comporte quatre pas.",
            "La deuxième boucle remonte trois cases."
        ]
    },

    {
        c: 4, n: 3,
        start: [1,4,"E"], end: [6,1],
        via: [[2,4],[4,4],[6,4]],
        walls: [[0,0],[5,0],[3,2]],
        objects: [
            ["livre_1","livre_rouge",2,4],
            ["livre_2","livre_bleu",4,4],
            ["livre_3","livre",6,4]
        ],
        must: ["livre_1","livre_2","livre_3"],
        concepts: ["for","range","left","forward"],
        noCollisions: true,
        instruction: "Ramasse les trois livres dans l'ordre avec des répétitions, puis monte vers le rangement en haut à droite.",
        guide: "Un livre oublié signifie que la mission n'est pas terminée.",
        hints: [
            "Les trois livres sont sur la ligne du bas.",
            "Après le troisième, tourne vers le nord."
        ]
    },

    // CHAPITRE 5 : fonctions.

    {
        c: 5, n: 1,
        start: [1,3,"E"], end: [6,3],
        via: [[3,3]],
        walls: [[5,1],[6,1],[7,0],[0,0]],
        buttons: [["commande_garage",3,3]],
        needButtons: 1,
        concepts: ["function","forward"],
        instruction: "Définis et appelle une fonction de déplacement, active la commande au milieu du garage et rejoins la zone finale.",
        guide: "Une fonction ne s'exécute que si tu l'appelles.",
        hints: [
            "def avancer_deux():",
            "Appelle ta fonction pour passer sur (3,3)."
        ]
    },

    {
        c: 5, n: 2,
        start: [1,4,"E"], end: [5,2],
        via: [[4,4],[4,2]],
        walls: [[5,1],[6,1],[7,0],[0,0]],
        objects: [["outil_garage","boite_outils",4,4]],
        deposits: [["rangement_outils",5,2,"outil_garage"]],
        must: ["outil_garage"],
        concepts: ["function","left","right","forward"],
        noCollisions: true,
        instruction: "Crée une fonction avec un paramètre distance. Ramasse les outils, puis réutilise la fonction sur plusieurs segments pour les déposer.",
        guide: "La fonction peut être appelée avec des nombres différents.",
        hints: [
            "La boîte est à (4,4).",
            "Monte vers (4,2), puis tourne à droite."
        ]
    },

    {
        c: 5, n: 3,
        start: [1,4,"E"], end: [4,1],
        via: [[3,4],[3,1]],
        walls: [[5,1],[6,1],[7,0]],
        objects: [["outil_final_garage","boite_outils",3,4]],
        deposits: [["atelier_garage",4,1,"outil_final_garage"]],
        buttons: [["bouton_porte_garage",3,1]],
        must: ["outil_final_garage"],
        needButtons: 1,
        concepts: ["function","return","left","right","forward"],
        noCollisions: true,
        instruction: "Écris une fonction qui renvoie un calcul de distance avec return. Récupère l'outil, active la porte et dépose l'outil à l'atelier.",
        guide: "Le résultat de return peut devenir l'argument de forward().",
        hints: [
            "Passe par (3,4), puis (3,1).",
            "Il faut changer de direction à plusieurs reprises."
        ]
    },

    // CHAPITRE 6 : listes.

    {
        c: 6, n: 1,
        start: [1,3,"E"], end: [5,3],
        via: [[3,3]],
        walls: [[0,0],[1,0],[6,0],[7,0],[3,2]],
        objects: [["bouteille_1","bouteille_rouge",3,3]],
        deposits: [["casier_1",5,3,"bouteille_1"]],
        must: ["bouteille_1"],
        concepts: ["list","forward"],
        instruction: "Place la distance dans une liste, récupère la bouteille sur le trajet et dépose-la dans le casier.",
        guide: "Lis une valeur de liste grâce à son indice.",
        hints: [
            "distances = [4]",
            "forward(distances[0]) permet de rejoindre le casier."
        ]
    },

    {
        c: 6, n: 2,
        start: [1,4,"E"], end: [4,1],
        via: [[3,4],[4,3],[4,2]],
        walls: [[0,0],[6,0],[7,0],[3,2]],
        objects: [
            ["bouteille_rouge_2","bouteille_rouge",3,4],
            ["bouteille_bleue_2","bouteille_bleue",4,3]
        ],
        deposits: [
            ["depot_bleu",4,2,"bouteille_bleue_2"],
            ["depot_rouge",4,1,"bouteille_rouge_2"]
        ],
        must: ["bouteille_rouge_2","bouteille_bleue_2"],
        concepts: ["list","left","forward"],
        noCollisions: true,
        instruction: "Conserve les distances dans une liste : ramasse les deux bouteilles et dépose chacune dans son casier, en respectant les étapes.",
        guide: "Tu dois atteindre les deux dépôts, chacun accepte une bouteille différente.",
        hints: [
            "Ramasse la rouge en (3,4) et la bleue en (4,3).",
            "La bleue se dépose en (4,2), la rouge en (4,1)."
        ]
    },

    {
        c: 6, n: 3,
        start: [1,4,"E"], end: [4,2],
        via: [[3,4],[3,1],[4,1]],
        walls: [[0,0],[6,0],[7,0],[5,2]],
        objects: [
            ["vin_rouge","bouteille_rouge",3,4],
            ["vin_bleu","bouteille_bleue",3,1]
        ],
        deposits: [
            ["casier_rouge",4,1,"vin_rouge"],
            ["casier_bleu",4,2,"vin_bleu"]
        ],
        must: ["vin_rouge","vin_bleu"],
        concepts: ["list","for","condition","left","right","forward"],
        noCollisions: true,
        instruction: "Programme une liste d'actions et parcours-la avec for et if. Ramasse deux bouteilles dans l'ordre et réalise leurs deux dépôts.",
        guide: "Une action peut être un mot comme 'forward', 'left' ou 'right'.",
        hints: [
            "Passe par (3,4), puis (3,1).",
            "Effectue ensuite les dépôts en (4,1) et (4,2)."
        ]
    },

    // CHAPITRE 7 : dictionnaires.

    {
        c: 7, n: 1,
        start: [1,3,"E"], end: [5,3],
        via: [[3,3]],
        walls: [[0,0],[7,0],[3,2]],
        buttons: [["commande_balcon",3,3]],
        needButtons: 1,
        concepts: ["dictionary","forward"],
        instruction: "Range la distance dans un dictionnaire. Utilise-la pour traverser le balcon et activer l'interrupteur.",
        guide: "Un dictionnaire associe une clé à une valeur.",
        hints: [
            "config = {'distance': 4}",
            "Lis config['distance'] pour avancer."
        ]
    },

    {
        c: 7, n: 2,
        start: [1,4,"E"], end: [5,2],
        via: [[3,4],[5,4]],
        walls: [[0,0],[7,0],[3,2]],
        objects: [["arrosoir_balcon","arrosoir",3,4]],
        deposits: [["bac_fleurs",5,2,"arrosoir_balcon"]],
        must: ["arrosoir_balcon"],
        concepts: ["dictionary","left","forward"],
        noCollisions: true,
        instruction: "Décris les deux segments du trajet dans un dictionnaire. Prends l'arrosoir au sol et apporte-le aux fleurs.",
        guide: "Utilise deux clés pour les parties horizontale et verticale.",
        hints: [
            "L'arrosoir est en (3,4).",
            "Monte après avoir atteint la colonne 5."
        ]
    },

    {
        c: 7, n: 3,
        start: [1,4,"E"], end: [4,1],
        via: [[2,4],[3,4],[3,1]],
        walls: [[0,0],[7,0],[4,3]],
        objects: [["arrosoir_config","arrosoir",2,4]],
        deposits: [["jardiniere_balcon",4,1,"arrosoir_config"]],
        buttons: [["bouton_arrosage",3,1]],
        must: ["arrosoir_config"],
        needButtons: 1,
        concepts: ["dictionary","condition","left","right","forward"],
        noCollisions: true,
        instruction: "Lis une configuration dans un dictionnaire et choisis les virages avec if. Ramasse l'arrosoir, active la pompe puis dépose-le.",
        guide: "Cette mission combine dictionnaire, condition et plusieurs actions automatiques.",
        hints: [
            "Passe par (2,4) et (3,1).",
            "Tu peux stocker les rotations dans config."
        ]
    },

    // CHAPITRE 8 : boucles while.

    {
        c: 8, n: 1,
        start: [1,3,"E"], end: [5,3],
        via: [[3,3]],
        walls: [[6,3],[0,1],[6,0],[7,0]],
        buttons: [["robinet",3,3]],
        needButtons: 1,
        concepts: ["while","forward"],
        noCollisions: true,
        instruction: "Avance tant que la route est libre. Active le robinet en passant dessus et arrête-toi avant le mur.",
        guide: "while front_is_clear() répète jusqu'au blocage.",
        hints: [
            "Le mur est juste après l'objectif.",
            "L'interrupteur se déclenche en (3,3)."
        ]
    },

    {
        c: 8, n: 2,
        start: [1,4,"E"], end: [5,4],
        via: [[3,4]],
        walls: [[0,1],[6,0],[7,0],[6,4]],
        objects: [["boue_salle_eau","boue",3,4]],
        cleaned: 1,
        concepts: ["while","forward"],
        noCollisions: true,
        instruction: "Avec while position_x(), rejoins la colonne 5 et nettoie automatiquement la tache d'eau sur le trajet.",
        guide: "La valeur position_x() change après chaque pas.",
        hints: [
            "La tache est en (3,4).",
            "Vise la colonne 5 sans avancer dans le mur."
        ]
    },

    {
        c: 8, n: 3,
        start: [1,4,"E"], end: [3,1],
        via: [[2,4],[3,4],[3,2]],
        walls: [[4,4],[0,1],[6,0],[7,0]],
        objects: [
            ["boue_couloir","boue",2,4],
            ["boue_cuve","boue",3,2],
            ["charge_salle_eau","station_recharge",3,1]
        ],
        cleaned: 2,
        recharge: true,
        concepts: ["while","left","forward"],
        noCollisions: true,
        instruction: "Utilise plusieurs while pour nettoyer deux zones, éviter le mur, puis rejoindre la recharge sans collision.",
        guide: "L'une des boucles peut contrôler la position x et l'autre la position y.",
        hints: [
            "Nettoie en (2,4), puis (3,2).",
            "La recharge est au bout du couloir, en (3,1)."
        ]
    },

    // CHAPITRE 9 : synthèse finale.

    {
        c: 9, n: 1,
        start: [1,4,"E"], end: [6,1],
        via: [[3,4],[4,4],[4,1]],
        walls: [[0,0],[7,0],[5,2],[6,2]],
        buttons: [["portillon_jardin",3,4]],
        needButtons: 1,
        concepts: ["variable","function","for","range","left","right","forward"],
        noCollisions: true,
        instruction: "Traverse le jardin grâce à une fonction et une boucle for. Active le portillon puis contourne la piscine pour atteindre l'autre côté.",
        guide: "Décompose le parcours en trois segments, sans traverser la piscine.",
        hints: [
            "Passe par (3,4), (4,4), puis (4,1).",
            "Une fonction avec une boucle rend les segments réutilisables."
        ]
    },

    {
        c: 9, n: 2,
        start: [1,4,"E"], end: [6,1],
        via: [[2,4],[2,1],[4,1]],
        walls: [[3,4],[4,4],[5,4],[5,2],[6,2],[0,0],[7,0]],
        objects: [
            ["cle_portail","cle",2,4],
            ["boue_portail","boue",3,1]
        ],
        deposits: [["portail",6,1,"cle_portail"]],
        buttons: [["commande_portail",4,1]],
        must: ["cle_portail"],
        cleaned: 1,
        needButtons: 1,
        concepts: ["list","dictionary","for","condition","forward"],
        noCollisions: true,
        instruction: "Récupère la clé, contourne les obstacles, nettoie le passage et active la commande avant de livrer la clé au portail. Utilise liste, dictionnaire, boucle et if.",
        guide: "Quatre opérations obligatoires avant le portail.",
        hints: [
            "Après (2,4), remonte en colonne 2.",
            "Le bouton est sur la route, en (4,1)."
        ]
    },

    {
        c: 9, n: 3,
        start: [1,4,"E"], end: [6,1],
        via: [[2,4],[2,2],[3,2],[4,1]],
        walls: [[3,4],[4,4],[5,4],[5,2],[5,3],[6,3],[0,0],[7,0]],
        objects: [
            ["arrosoir_final","arrosoir",2,4],
            ["boue_finale","boue",3,2],
            ["boue_suivante","boue",4,1],
            ["station_finale","station_recharge",6,1]
        ],
        buttons: [["commande_finale",4,1]],
        must: ["arrosoir_final"],
        cleaned: 2,
        recharge: true,
        needButtons: 1,
        concepts: [
            "variable",
            "list",
            "dictionary",
            "condition",
            "while",
            "function",
            "forward"
        ],
        noCollisions: true,
        instruction: "MISSION PYT : récupère l'arrosoir, traverse la zone boueuse dans le bon ordre, nettoie deux cases, active la commande et rejoins la station de recharge. Combine toutes tes notions.",
        guide: "Mission finale à objectifs multiples : observe la carte et prépare ton algorithme.",
        hints: [
            "D'abord (2,4), puis (2,2) et (3,2).",
            "Passe ensuite par (4,1) avant la recharge (6,1).",
            "Utilise une fonction et au moins une boucle while pour structurer ton code."
        ]
    }
];

/* =========================================================
   CONSTRUCTION DES NIVEAUX
========================================================= */

function point(value) {
    return {
        x: value[0],
        y: value[1]
    };
}

function createLevel(m) {
    const chapter =
        PYT_LEVEL_DATA.chapters[m.c - 1];

    const objects = [];
    const targets = [];
    const end = point(m.end);

    // Objets ramassables, boue et stations.
    for (
        const [id, type, x, y]
        of (m.objects || [])
    ) {
        const special =
            type === "boue";

        const charging =
            type === "station_recharge";

        objects.push({
            id,
            type,
            x,
            y,
            ...(
                special
                    ? {
                        cleanable: true,
                        solid: false
                    }
                    : charging
                        ? {
                            pickable: false,
                            solid: false
                        }
                        : {
                            pickable: true
                        }
            )
        });
    }

    // Boutons à activer automatiquement.
    for (
        const [id, x, y]
        of (m.buttons || [])
    ) {
        objects.push({
            id,
            type: "bouton",
            x,
            y,
            solid: false
        });
    }

    // Dépôts automatiques.
    for (
        const [id, x, y, expected]
        of (m.deposits || [])
    ) {
        targets.push({
            id,
            type: "deposit",
            x,
            y,
            object: expected
        });
    }

    // Destination finale.
    targets.push({
        id: "goal",
        type: "goal",
        ...end
    });

    // Validation des objectifs.
    const goal = {
        position: end
    };

    if (m.via?.length) {
        goal.visitInOrder =
            m.via.map(point).concat([end]);
    }

    if (m.must) {
        goal.requiredObject = m.must;
    }

    if (m.needButtons) {
        goal.buttons = m.needButtons;
    }

    if (m.cleaned) {
        goal.cleaned = m.cleaned;
    }

    if (m.recharge) {
        goal.recharge = true;
    }

    if (m.noCollisions) {
        goal.noCollisions = true;
    }

    // Difficulté de plus en plus élevée.
    let difficulty;

    if (m.c === 1 && m.n === 1) {
        difficulty = "Découverte";
    } else if (m.c <= 2) {
        difficulty =
            m.n === 3
                ? "Intermédiaire"
                : "Progression";
    } else if (m.c <= 4) {
        difficulty =
            m.n === 3
                ? "Avancé"
                : "Intermédiaire";
    } else if (m.c <= 6) {
        difficulty =
            m.n === 3
                ? "Expert"
                : "Avancé";
    } else if (m.c <= 8) {
        difficulty =
            m.n === 3
                ? "Maître"
                : "Expert";
    } else {
        difficulty =
            m.n === 3
                ? "Final"
                : "Très avancé";
    }

    return {
        chapter: m.c,
        level: m.n,
        room: chapter.room,

        title:
            LEVEL_TITLES[m.c - 1][m.n - 1],

        difficulty,

        instruction: m.instruction,
        guideMessage: m.guide,

        map: {
            width: PYT_MAP_WIDTH,
            height: PYT_MAP_HEIGHT
        },

        robotStart: {
            x: m.start[0],
            y: m.start[1],
            direction: m.start[2]
        },

        blocked:
            (m.walls || []).map(point),

        decorations:
            getRoomDecorations(chapter.room),

        objects,
        targets,
        goal,

        requiredConcepts:
            m.concepts || [],

        starterCode:
            `# ${m.instruction}\n`,

        hints:
            m.hints || []
    };
}

// Ajoute les 27 exercices dans les 9 chapitres.
for (const mission of MISSIONS) {
    PYT_LEVEL_DATA
        .chapters[mission.c - 1]
        .levels
        .push(createLevel(mission));
}

/* =========================================================
   API PUBLIQUE
========================================================= */

PYT_LEVEL_DATA.getChapter =
    function(number) {
        return this.chapters.find(
            chapter =>
                chapter.chapter === Number(number)
        ) || null;
    };

PYT_LEVEL_DATA.getLevel =
    function(chapter, level) {
        return this.getChapter(chapter)
            ?.levels.find(
                item =>
                    item.level === Number(level)
            ) || null;
    };

PYT_LEVEL_DATA.getAllLevels =
    function() {
        return this.chapters.flatMap(
            chapter => chapter.levels
        );
    };

PYT_LEVEL_DATA.getLevelCount =
    function() {
        return this.getAllLevels().length;
    };

PYT_LEVEL_DATA.getLevelKey =
    function(chapter, level) {
        return `${Number(chapter)}-${Number(level)}`;
    };

/* =========================================================
   EXPORTS
========================================================= */

window.PYT_GAME_DATA = PYT_LEVEL_DATA;
window.PYT_LEVELS = PYT_LEVEL_DATA;
window.GAME_LEVELS = PYT_LEVEL_DATA;
window.LEVELS = PYT_LEVEL_DATA;
window.levels = PYT_LEVEL_DATA;