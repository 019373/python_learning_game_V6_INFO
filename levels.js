"use strict";

/*
============================================================
PYT - levels.js

Cours + 27 exercices fixes.
Coordonnées : [ligne, colonne]

IMPORTANT :
- aucune génération aléatoire ;
- 3 exercices par chapitre ;
- le moteur interprète ces données ;
- l'interface ne décide pas de la réussite.
============================================================
*/


// =========================================================
// OUTILS
// =========================================================

function borderWalls(rows, cols) {

    const walls = [];

    for (let col = 0; col < cols; col++) {
        walls.push([0, col]);
        walls.push([rows - 1, col]);
    }

    for (let row = 1; row < rows - 1; row++) {
        walls.push([row, 0]);
        walls.push([row, cols - 1]);
    }

    return walls;
}


function makeLevel({
    chapter,
    exercise,
    difficulty,
    title,
    instruction,
    concept,
    rows,
    cols,
    start,
    startDirection = "east",
    goal,
    walls = [],
    objects = [],
    deposits = [],
    buttons = [],
    doors = [],
    dirt = [],
    boxes = [],
    chargers = [],
    objective = "reach_goal",
    requiredDeposits = 1,
    boxTargets = []
}) {

    return {
        chapter,
        exercise,
        difficulty,
        title,
        instruction,
        concept,

        rows,
        cols,

        start: [...start],
        startDirection,

        goal: goal ? [...goal] : null,

        walls: [
            ...borderWalls(rows, cols),
            ...walls
        ],

        objects: objects.map(p => [...p]),
        deposits: deposits.map(p => [...p]),
        buttons: buttons.map(p => [...p]),
        doors: doors.map(p => [...p]),
        dirt: dirt.map(p => [...p]),
        boxes: boxes.map(p => [...p]),
        chargers: chargers.map(p => [...p]),
        boxTargets: boxTargets.map(p => [...p]),

        objective,
        requiredDeposits
    };
}


// =========================================================
// COURS
// =========================================================

const COURSES = {

    1: {
        title: "Déplacer Pyt",
        subtitle: "Découvre les commandes de déplacement.",
        introduction:
            "Dans ce chapitre, tu vas apprendre à déplacer Pyt sur la grille avec des commandes proches de Turtle.",

        sections: [
            {
                title: "Avancer",
                text:
                    "forward(n) fait avancer Pyt de n cases dans la direction qu'il regarde.",
                example:
`forward(1)
forward(2)`,
                explanation:
                    "Chaque case est parcourue séparément."
            },
            {
                title: "Reculer",
                text:
                    "backward(n) fait reculer Pyt sans changer son orientation.",
                example:
`backward(1)`,
                explanation:
                    "Pyt continue de regarder dans la même direction."
            },
            {
                title: "Tourner",
                text:
                    "right(90) tourne Pyt vers la droite et left(90) vers la gauche.",
                example:
`forward(2)
right(90)
forward(1)`,
                explanation:
                    "Dans PYT, les rotations utilisent principalement des angles de 90°."
            }
        ]
    },


    2: {
        title: "Variables et opérations",
        subtitle: "Stocke des valeurs et utilise-les dans ton programme.",
        introduction:
            "Une variable permet de donner un nom à une valeur. Elle peut ensuite être réutilisée ou modifiée.",

        sections: [
            {
                title: "Créer une variable",
                text:
                    "On utilise le signe = pour enregistrer une valeur dans une variable.",
                example:
`distance = 4
forward(distance)`,
                explanation:
                    "Ici, distance contient la valeur 4."
            },
            {
                title: "Faire des calculs",
                text:
                    "Python permet d'utiliser +, -, *, /, //, % et **.",
                example:
`a = 2
b = 3
distance = a + b
forward(distance)`,
                explanation:
                    "Le résultat du calcul peut être utilisé directement par Pyt."
            },
            {
                title: "Conversions",
                text:
                    "int(), float() et str() permettent de convertir certaines valeurs.",
                example:
`valeur = "3"
distance = int(valeur)
forward(distance)`,
                explanation:
                    "int(\"3\") transforme le texte 3 en nombre entier."
            }
        ]
    },


    3: {
        title: "Conditions",
        subtitle: "Fais prendre des décisions à ton programme.",
        introduction:
            "Les conditions permettent d'exécuter du code seulement lorsqu'une expression est vraie.",

        sections: [
            {
                title: "if",
                text:
                    "if permet de tester une condition.",
                example:
`distance = 4

if distance > 2:
    forward(distance)`,
                explanation:
                    "Le bloc indenté est exécuté seulement si la condition est vraie."
            },
            {
                title: "else et elif",
                text:
                    "else donne une autre possibilité. elif permet de tester une nouvelle condition.",
                example:
`distance = 3

if distance > 5:
    forward(5)
elif distance == 3:
    forward(3)
else:
    forward(1)`,
                explanation:
                    "Python teste les conditions dans l'ordre."
            },
            {
                title: "and, or et not",
                text:
                    "Ces opérateurs permettent de combiner ou inverser des conditions.",
                example:
`a = 4
b = 2

if a > 3 and b == 2:
    forward(2)`,
                explanation:
                    "Avec and, les deux conditions doivent être vraies."
            }
        ]
    },


    4: {
        title: "Boucles for",
        subtitle: "Répète des instructions sans recopier le même code.",
        introduction:
            "Une boucle for est pratique lorsqu'on connaît le nombre de répétitions à effectuer.",

        sections: [
            {
                title: "for et range",
                text:
                    "range(n) produit une suite de valeurs permettant de répéter une action n fois.",
                example:
`for i in range(4):
    forward(1)`,
                explanation:
                    "forward(1) est exécuté quatre fois."
            },
            {
                title: "Variable de boucle",
                text:
                    "La variable de boucle peut être utilisée dans le programme.",
                example:
`for i in range(3):
    forward(1)
    right(90)`,
                explanation:
                    "À chaque tour, Python exécute tout le bloc indenté."
            },
            {
                title: "Début, fin et pas",
                text:
                    "range(debut, fin, pas) permet de contrôler plus précisément les valeurs.",
                example:
`for i in range(0, 6, 2):
    forward(1)`,
                explanation:
                    "Ici, i prend successivement les valeurs 0, 2 et 4."
            }
        ]
    },


    5: {
        title: "Boucles while",
        subtitle: "Répète des actions tant qu'une condition est vraie.",
        introduction:
            "while est utile lorsqu'une répétition dépend d'une condition.",

        sections: [
            {
                title: "while",
                text:
                    "La boucle continue tant que sa condition vaut True.",
                example:
`distance = 0

while distance < 4:
    forward(1)
    distance = distance + 1`,
                explanation:
                    "La variable change à chaque passage dans la boucle."
            },
            {
                title: "while True",
                text:
                    "while True crée une boucle qui continue jusqu'à ce qu'on l'arrête.",
                example:
`compteur = 0

while True:
    forward(1)
    compteur += 1

    if compteur == 3:
        break`,
                explanation:
                    "Il faut prévoir une manière de quitter la boucle."
            },
            {
                title: "break",
                text:
                    "break arrête immédiatement la boucle en cours.",
                example:
`i = 0

while i < 10:
    if i == 4:
        break

    forward(1)
    i += 1`,
                explanation:
                    "La boucle s'arrête lorsque i vaut 4."
            }
        ]
    },


    6: {
        title: "Listes",
        subtitle: "Range plusieurs valeurs dans une même variable.",
        introduction:
            "Une liste contient plusieurs éléments ordonnés que le programme peut consulter ou modifier.",

        sections: [
            {
                title: "Créer et lire une liste",
                text:
                    "Les éléments sont placés entre crochets. Le premier index est 0.",
                example:
`distances = [2, 3, 1]

forward(distances[0])`,
                explanation:
                    "distances[0] correspond à la première valeur : 2."
            },
            {
                title: "len et append",
                text:
                    "len() donne la longueur d'une liste et append() ajoute un élément.",
                example:
`trajet = [1, 2]
trajet.append(3)

print(len(trajet))`,
                explanation:
                    "La liste contient maintenant trois éléments."
            },
            {
                title: "Parcourir une liste",
                text:
                    "Une boucle for peut lire successivement tous les éléments.",
                example:
`trajet = [2, 1, 3]

for distance in trajet:
    forward(distance)`,
                explanation:
                    "La variable distance reçoit chaque élément de la liste."
            }
        ]
    },


    7: {
        title: "Fonctions",
        subtitle: "Crée tes propres blocs de code réutilisables.",
        introduction:
            "Une fonction permet de regrouper des instructions sous un nom.",

        sections: [
            {
                title: "Créer une fonction",
                text:
                    "Le mot-clé def permet de définir une fonction.",
                example:
`def avancer_deux():
    forward(2)

avancer_deux()`,
                explanation:
                    "La fonction est définie puis appelée."
            },
            {
                title: "Paramètres",
                text:
                    "Un paramètre permet de transmettre une valeur à une fonction.",
                example:
`def avancer(distance):
    forward(distance)

avancer(3)`,
                explanation:
                    "La même fonction peut être réutilisée avec différentes valeurs."
            },
            {
                title: "return",
                text:
                    "return permet à une fonction de renvoyer un résultat.",
                example:
`def double(nombre):
    return nombre * 2

distance = double(2)
forward(distance)`,
                explanation:
                    "double(2) renvoie 4."
            }
        ]
    },


    8: {
        title: "Combiner Python",
        subtitle: "Utilise plusieurs notions dans le même programme.",
        introduction:
            "Tu connais maintenant les principaux outils nécessaires. Il faut apprendre à choisir et combiner les bons.",

        sections: [
            {
                title: "Variables et boucles",
                text:
                    "Une variable peut déterminer le nombre de répétitions.",
                example:
`distance = 4

for i in range(distance):
    forward(1)`,
                explanation:
                    "Changer distance permet de changer facilement le programme."
            },
            {
                title: "Listes et fonctions",
                text:
                    "Les fonctions peuvent recevoir les valeurs provenant d'une liste.",
                example:
`def avancer(n):
    forward(n)

trajet = [2, 1, 3]

for distance in trajet:
    avancer(distance)`,
                explanation:
                    "Chaque outil Python a un rôle différent."
            },
            {
                title: "Construire une solution",
                text:
                    "Décompose le trajet en petites étapes avant d'écrire ton programme.",
                example:
`def ligne(n):
    for i in range(n):
        forward(1)

ligne(3)
right(90)
ligne(2)`,
                explanation:
                    "Une solution claire est souvent plus facile à corriger."
            }
        ]
    },


    9: {
        title: "Épreuve finale",
        subtitle: "Réutilise tout ce que tu as appris.",
        introduction:
            "Aucune nouvelle notion n'est introduite. Les trois missions combinent les connaissances des chapitres précédents.",

        sections: [
            {
                title: "Préparer ton programme",
                text:
                    "Observe la carte et décompose le problème en plusieurs parties.",
                example:
`# 1. Observer
# 2. Préparer les valeurs
# 3. Répéter les actions
# 4. Vérifier le trajet`,
                explanation:
                    "Il peut exister plusieurs solutions correctes."
            },
            {
                title: "Réutiliser les outils",
                text:
                    "Variables, conditions, boucles, listes et fonctions peuvent être combinées.",
                example:
`def avancer(n):
    for i in range(n):
        forward(1)`,
                explanation:
                    "Utilise seulement les outils réellement utiles à ta solution."
            },
            {
                title: "Objectif final",
                text:
                    "Le moteur vérifie le résultat obtenu et non une unique manière d'écrire le programme.",
                example:
`# À toi de construire
# ta propre solution.`,
                explanation:
                    "Le dernier exercice est le défi le plus complet de PYT."
            }
        ]
    }

};


// =========================================================
// CHAPITRE 1 - DÉPLACEMENTS
// =========================================================

const CHAPTER_1 = [

    makeLevel({
        chapter: 1,
        exercise: 1,
        difficulty: "Facile",
        title: "Premier déplacement",
        instruction:
            "Guide Pyt jusqu'au cristal en utilisant forward().",
        concept: "forward",
        rows: 7,
        cols: 9,
        start: [3, 1],
        startDirection: "east",
        goal: [3, 6]
    }),

    makeLevel({
        chapter: 1,
        exercise: 2,
        difficulty: "Moyen",
        title: "Tourner au bon moment",
        instruction:
            "Atteins le cristal avec forward() et les rotations.",
        concept: "forward / right / left",
        rows: 8,
        cols: 10,
        start: [2, 1],
        startDirection: "east",
        goal: [5, 7],
        walls: [
            [3, 1],
            [3, 2],
            [3, 3],
            [3, 4],
            [3, 5],
            [3, 6],
            [4, 6],
            [5, 6],
            [6, 6]
        ]
    }),

    makeLevel({
        chapter: 1,
        exercise: 3,
        difficulty: "Difficile",
        title: "Le parcours",
        instruction:
            "Combine avance, recul et rotations pour atteindre le cristal.",
        concept: "déplacements Turtle",
        rows: 9,
        cols: 11,
        start: [1, 1],
        startDirection: "east",
        goal: [7, 9],
        walls: [
            [2, 3],
            [3, 3],
            [4, 3],
            [5, 3],

            [5, 4],
            [5, 5],
            [5, 6],
            [5, 7],

            [2, 7],
            [3, 7],
            [4, 7]
        ]
    })

];


// =========================================================
// CHAPITRE 2 - VARIABLES
// =========================================================

const CHAPTER_2 = [

    makeLevel({
        chapter: 2,
        exercise: 1,
        difficulty: "Facile",
        title: "Une distance variable",
        instruction:
            "Crée une variable contenant la distance jusqu'au cristal puis utilise-la avec forward().",
        concept: "variables",
        rows: 7,
        cols: 10,
        start: [3, 1],
        startDirection: "east",
        goal: [3, 7]
    }),

    makeLevel({
        chapter: 2,
        exercise: 2,
        difficulty: "Moyen",
        title: "Calculer le trajet",
        instruction:
            "Utilise des variables et un calcul pour construire ton déplacement.",
        concept: "variables et opérations",
        rows: 9,
        cols: 10,
        start: [2, 1],
        startDirection: "east",
        goal: [6, 7],
        walls: [
            [3, 1],
            [3, 2],
            [3, 3],
            [3, 4],
            [3, 5],
            [3, 6]
        ]
    }),

    makeLevel({
        chapter: 2,
        exercise: 3,
        difficulty: "Difficile",
        title: "Variables en chaîne",
        instruction:
            "Combine plusieurs variables et opérations pour guider Pyt.",
        concept: "variables / calculs / conversions",
        rows: 10,
        cols: 12,
        start: [1, 1],
        startDirection: "east",
        goal: [8, 10],
        walls: [
            [2, 3],
            [3, 3],
            [4, 3],
            [5, 3],

            [5, 4],
            [5, 5],
            [5, 6],
            [5, 7],
            [5, 8],

            [2, 8],
            [3, 8],
            [4, 8]
        ]
    })

];


// =========================================================
// CHAPITRE 3 - CONDITIONS
// =========================================================

const CHAPTER_3 = [

    makeLevel({
        chapter: 3,
        exercise: 1,
        difficulty: "Facile",
        title: "Une première décision",
        instruction:
            "Utilise une condition if avant de déplacer Pyt.",
        concept: "if",
        rows: 7,
        cols: 9,
        start: [3, 1],
        startDirection: "east",
        goal: [3, 6]
    }),

    makeLevel({
        chapter: 3,
        exercise: 2,
        difficulty: "Moyen",
        title: "Choisir une direction",
        instruction:
            "Utilise if, elif ou else pour choisir les actions de Pyt.",
        concept: "if / elif / else",
        rows: 9,
        cols: 10,
        start: [4, 1],
        startDirection: "east",
        goal: [2, 8],
        walls: [
            [3, 4],
            [4, 4],
            [5, 4],

            [5, 5],
            [5, 6],
            [5, 7]
        ]
    }),

    makeLevel({
        chapter: 3,
        exercise: 3,
        difficulty: "Difficile",
        title: "Plusieurs conditions",
        instruction:
            "Combine des comparaisons et des opérateurs logiques pour préparer le trajet.",
        concept: "and / or / not",
        rows: 10,
        cols: 12,
        start: [8, 1],
        startDirection: "east",
        goal: [1, 10],
        walls: [
            [5, 3],
            [6, 3],
            [7, 3],

            [5, 4],
            [5, 5],
            [5, 6],

            [3, 6],
            [4, 6],

            [3, 7],
            [3, 8],
            [3, 9]
        ]
    })

];


// =========================================================
// CHAPITRE 4 - FOR
// =========================================================

const CHAPTER_4 = [

    makeLevel({
        chapter: 4,
        exercise: 1,
        difficulty: "Facile",
        title: "Répéter pour avancer",
        instruction:
            "Utilise une boucle for pour avancer jusqu'au cristal.",
        concept: "for / range",
        rows: 7,
        cols: 10,
        start: [3, 1],
        startDirection: "east",
        goal: [3, 8]
    }),

    makeLevel({
        chapter: 4,
        exercise: 2,
        difficulty: "Moyen",
        title: "Répéter un motif",
        instruction:
            "Utilise une boucle for pour répéter une partie du trajet.",
        concept: "boucle for",
        rows: 9,
        cols: 10,
        start: [2, 2],
        startDirection: "east",
        goal: [6, 7],
        walls: [
            [3, 4],
            [4, 4],
            [5, 4]
        ]
    }),

    makeLevel({
        chapter: 4,
        exercise: 3,
        difficulty: "Difficile",
        title: "Escalier",
        instruction:
            "Utilise une boucle et range() pour parcourir ce chemin.",
        concept: "range(debut, fin, pas)",
        rows: 11,
        cols: 12,
        start: [9, 1],
        startDirection: "east",
        goal: [1, 10],
        walls: [
            [8, 3],
            [7, 3],
            [6, 5],
            [5, 5],
            [4, 7],
            [3, 7],
            [2, 9]
        ]
    })

];


// =========================================================
// CHAPITRE 5 - WHILE
// =========================================================

const CHAPTER_5 = [

    makeLevel({
        chapter: 5,
        exercise: 1,
        difficulty: "Facile",
        title: "Tant que...",
        instruction:
            "Utilise while pour répéter les déplacements nécessaires.",
        concept: "while",
        rows: 7,
        cols: 10,
        start: [3, 1],
        startDirection: "east",
        goal: [3, 7]
    }),

    makeLevel({
        chapter: 5,
        exercise: 2,
        difficulty: "Moyen",
        title: "Contrôler la boucle",
        instruction:
            "Utilise une variable avec while pour contrôler ton trajet.",
        concept: "while condition",
        rows: 9,
        cols: 11,
        start: [2, 1],
        startDirection: "east",
        goal: [7, 8],
        walls: [
            [3, 2],
            [3, 3],
            [3, 4],
            [3, 5],
            [3, 6],

            [4, 6],
            [5, 6],
            [6, 6]
        ]
    }),

    makeLevel({
        chapter: 5,
        exercise: 3,
        difficulty: "Difficile",
        title: "Sortir au bon moment",
        instruction:
            "Combine while et break pour construire le trajet.",
        concept: "while True / break",
        rows: 10,
        cols: 12,
        start: [8, 1],
        startDirection: "east",
        goal: [1, 10],
        walls: [
            [5, 4],
            [6, 4],
            [7, 4],

            [5, 5],
            [5, 6],
            [5, 7],

            [2, 7],
            [3, 7],
            [4, 7]
        ]
    })

];


// =========================================================
// CHAPITRE 6 - LISTES
// =========================================================

const CHAPTER_6 = [

    makeLevel({
        chapter: 6,
        exercise: 1,
        difficulty: "Facile",
        title: "Liste de déplacements",
        instruction:
            "Crée une liste de valeurs et utilise ses éléments pour déplacer Pyt.",
        concept: "listes / index",
        rows: 8,
        cols: 10,
        start: [2, 1],
        startDirection: "east",
        goal: [6, 7],
        walls: [
            [3, 1],
            [3, 2],
            [3, 3],
            [3, 4],
            [3, 5]
        ]
    }),

    makeLevel({
        chapter: 6,
        exercise: 2,
        difficulty: "Moyen",
        title: "Parcourir une liste",
        instruction:
            "Parcours une liste avec for pour construire le trajet.",
        concept: "for dans une liste",
        rows: 10,
        cols: 11,
        start: [8, 1],
        startDirection: "east",
        goal: [2, 9],
        walls: [
            [6, 3],
            [7, 3],

            [4, 5],
            [5, 5],

            [2, 7],
            [3, 7]
        ]
    }),

    makeLevel({
        chapter: 6,
        exercise: 3,
        difficulty: "Difficile",
        title: "Organiser le trajet",
        instruction:
            "Utilise une liste, len(), append() ou in pour préparer ton programme.",
        concept: "listes",
        rows: 11,
        cols: 13,
        start: [9, 1],
        startDirection: "east",
        goal: [1, 11],
        walls: [
            [6, 3],
            [7, 3],
            [8, 3],

            [6, 4],
            [6, 5],

            [3, 7],
            [4, 7],
            [5, 7],

            [3, 8],
            [3, 9]
        ]
    })

];


// =========================================================
// CHAPITRE 7 - FONCTIONS
// =========================================================

const CHAPTER_7 = [

    makeLevel({
        chapter: 7,
        exercise: 1,
        difficulty: "Facile",
        title: "Ta première fonction",
        instruction:
            "Crée une fonction qui déplace Pyt puis appelle-la.",
        concept: "def",
        rows: 7,
        cols: 10,
        start: [3, 1],
        startDirection: "east",
        goal: [3, 7]
    }),

    makeLevel({
        chapter: 7,
        exercise: 2,
        difficulty: "Moyen",
        title: "Fonction avec paramètre",
        instruction:
            "Crée une fonction recevant une distance en paramètre.",
        concept: "paramètres",
        rows: 9,
        cols: 11,
        start: [2, 1],
        startDirection: "east",
        goal: [7, 8],
        walls: [
            [3, 1],
            [3, 2],
            [3, 3],
            [3, 4],
            [3, 5],
            [3, 6]
        ]
    }),

    makeLevel({
        chapter: 7,
        exercise: 3,
        difficulty: "Difficile",
        title: "Fonctions réutilisables",
        instruction:
            "Combine paramètres et return pour organiser une solution complète.",
        concept: "def / paramètres / return",
        rows: 11,
        cols: 13,
        start: [9, 1],
        startDirection: "east",
        goal: [1, 11],
        walls: [
            [6, 4],
            [7, 4],
            [8, 4],

            [6, 5],
            [6, 6],
            [6, 7],

            [3, 8],
            [4, 8],
            [5, 8],

            [3, 9],
            [3, 10]
        ]
    })

];


// =========================================================
// CHAPITRE 8 - COMBINAISON
// =========================================================

const CHAPTER_8 = [

    makeLevel({
        chapter: 8,
        exercise: 1,
        difficulty: "Facile",
        title: "Combiner les outils",
        instruction:
            "Combine variables et boucles pour atteindre le cristal.",
        concept: "variables / boucles",
        rows: 9,
        cols: 11,
        start: [7, 1],
        startDirection: "east",
        goal: [2, 9],
        walls: [
            [5, 3],
            [6, 3],

            [3, 5],
            [4, 5],

            [2, 7],
            [3, 7]
        ]
    }),

    makeLevel({
        chapter: 8,
        exercise: 2,
        difficulty: "Moyen",
        title: "Programme organisé",
        instruction:
            "Utilise une liste et une fonction pour organiser le trajet.",
        concept: "listes / fonctions",
        rows: 11,
        cols: 13,
        start: [9, 1],
        startDirection: "east",
        goal: [1, 11],
        walls: [
            [7, 3],
            [8, 3],

            [5, 5],
            [6, 5],

            [3, 7],
            [4, 7],

            [2, 9],
            [2, 10]
        ]
    }),

    makeLevel({
        chapter: 8,
        exercise: 3,
        difficulty: "Difficile",
        title: "Mission complexe",
        instruction:
            "Construis un programme clair combinant plusieurs notions déjà apprises.",
        concept: "combinaison Python",
        rows: 12,
        cols: 14,
        start: [10, 1],
        startDirection: "east",
        goal: [1, 12],
        walls: [
            [7, 3],
            [8, 3],
            [9, 3],

            [7, 4],
            [7, 5],

            [4, 7],
            [5, 7],
            [6, 7],

            [4, 8],
            [4, 9],

            [2, 11],
            [3, 11]
        ]
    })

];


// =========================================================
// CHAPITRE 9 - ÉPREUVE FINALE
// =========================================================

const CHAPTER_9 = [

    makeLevel({
        chapter: 9,
        exercise: 1,
        difficulty: "Facile",
        title: "Épreuve finale I",
        instruction:
            "Combine déplacements, variables, conditions et boucle for pour atteindre le cristal.",
        concept: "révision",
        rows: 10,
        cols: 12,
        start: [8, 1],
        startDirection: "east",
        goal: [1, 10],
        walls: [
            [6, 3],
            [7, 3],

            [4, 5],
            [5, 5],

            [2, 7],
            [3, 7]
        ]
    }),

    makeLevel({
        chapter: 9,
        exercise: 2,
        difficulty: "Moyen",
        title: "Épreuve finale II",
        instruction:
            "Construis une solution combinant conditions, boucles et listes.",
        concept: "révision avancée",
        rows: 12,
        cols: 14,
        start: [10, 1],
        startDirection: "east",
        goal: [1, 12],
        walls: [
            [7, 4],
            [8, 4],
            [9, 4],

            [7, 5],
            [7, 6],

            [4, 8],
            [5, 8],
            [6, 8],

            [4, 9],
            [4, 10],

            [2, 11],
            [3, 11]
        ]
    }),

    makeLevel({
        chapter: 9,
        exercise: 3,
        difficulty: "Difficile",
        title: "Mission finale",
        instruction:
            "Atteins le dernier cristal avec un programme complet utilisant plusieurs notions apprises dans PYT.",
        concept: "épreuve finale complète",
        rows: 13,
        cols: 15,
        start: [11, 1],
        startDirection: "east",
        goal: [1, 13],
        walls: [
            [8, 3],
            [9, 3],
            [10, 3],

            [8, 4],
            [8, 5],

            [5, 7],
            [6, 7],
            [7, 7],

            [5, 8],
            [5, 9],

            [2, 11],
            [3, 11],
            [4, 11],

            [9, 10],
            [9, 11],
            [9, 12],

            [6, 12],
            [7, 12]
        ]
    })

];


// =========================================================
// TOUS LES CHAPITRES
// =========================================================

const CHAPTERS = {
    1: CHAPTER_1,
    2: CHAPTER_2,
    3: CHAPTER_3,
    4: CHAPTER_4,
    5: CHAPTER_5,
    6: CHAPTER_6,
    7: CHAPTER_7,
    8: CHAPTER_8,
    9: CHAPTER_9
};


// =========================================================
// FONCTIONS PUBLIQUES
// =========================================================

function getCourse(chapter) {

    return (
        COURSES[Number(chapter)]
        || null
    );
}


function getChapter(chapter) {

    return (
        CHAPTERS[Number(chapter)]
        || null
    );
}


function getLevel(chapter, exercise) {

    const chapterNumber =
        Number(chapter);

    const exerciseNumber =
        Number(exercise);

    const levels =
        CHAPTERS[chapterNumber];


    if (!levels) {
        return null;
    }


    const level =
        levels.find(
            item =>
                item.exercise
                === exerciseNumber
        );


    return level || null;
}


function levelExists(chapter, exercise) {

    return (
        getLevel(
            chapter,
            exercise
        )
        !== null
    );
}


function getNumberOfChapters() {

    return Object.keys(
        CHAPTERS
    ).length;
}


function getNumberOfLevels(chapter) {

    const levels =
        getChapter(chapter);

    return levels
        ? levels.length
        : 0;
}


function getNextLevel(chapter, exercise) {

    chapter =
        Number(chapter);

    exercise =
        Number(exercise);


    if (exercise < 3) {

        return getLevel(
            chapter,
            exercise + 1
        );
    }


    if (chapter < 9) {

        return getLevel(
            chapter + 1,
            1
        );
    }


    return null;
}


function getPreviousLevel(chapter, exercise) {

    chapter =
        Number(chapter);

    exercise =
        Number(exercise);


    if (exercise > 1) {

        return getLevel(
            chapter,
            exercise - 1
        );
    }


    if (chapter > 1) {

        return getLevel(
            chapter - 1,
            3
        );
    }


    return null;
}


// =========================================================
// EXPOSITION POUR LES AUTRES FICHIERS
// =========================================================

window.COURSES = COURSES;
window.CHAPTERS = CHAPTERS;

window.getCourse = getCourse;
window.getChapter = getChapter;
window.getLevel = getLevel;

window.levelExists = levelExists;

window.getNumberOfChapters =
    getNumberOfChapters;

window.getNumberOfLevels =
    getNumberOfLevels;

window.getNextLevel =
    getNextLevel;

window.getPreviousLevel =
    getPreviousLevel;