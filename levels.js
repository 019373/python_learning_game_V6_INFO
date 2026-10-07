"use strict";

/*
============================================================
PYT - levels.js

27 exercices :
- 9 chapitres
- 3 exercices par chapitre
- difficulté progressive

Chaque chapitre correspond à une pièce de la maison.

Chapitre 1 : Entrée        -> déplacements
Chapitre 2 : Cuisine       -> variables
Chapitre 3 : Salon         -> conditions
Chapitre 4 : Bibliothèque  -> for / range
Chapitre 5 : Salle de bain -> while / break
Chapitre 6 : Chambre       -> listes
Chapitre 7 : Atelier       -> fonctions
Chapitre 8 : Grenier       -> combinaison
Chapitre 9 : Laboratoire   -> examen final
============================================================
*/


// =========================================================
// OUTILS
// =========================================================

function borderWalls(rows, cols) {

    const grid = [];

    for (let row = 0; row < rows; row++) {

        const line = [];

        for (let col = 0; col < cols; col++) {

            const border =
                row === 0 ||
                col === 0 ||
                row === rows - 1 ||
                col === cols - 1;

            line.push(
                border
                    ? "wall"
                    : "floor"
            );
        }

        grid.push(line);
    }

    return grid;
}


function cloneGrid(grid) {

    return grid.map(
        row => [...row]
    );
}


function place(grid, row, col, type) {

    if (
        grid[row] &&
        typeof grid[row][col] !== "undefined"
    ) {

        grid[row][col] = type;
    }

    return grid;
}


function wall(grid, row, col) {

    return place(
        grid,
        row,
        col,
        "wall"
    );
}


function goal(grid, row, col) {

    return place(
        grid,
        row,
        col,
        "goal"
    );
}


function object(grid, row, col) {

    return place(
        grid,
        row,
        col,
        "object"
    );
}


function dirt(grid, row, col) {

    return place(
        grid,
        row,
        col,
        "dirt"
    );
}


function button(grid, row, col) {

    return place(
        grid,
        row,
        col,
        "button"
    );
}


function door(grid, row, col) {

    return place(
        grid,
        row,
        col,
        "door"
    );
}


function charger(grid, row, col) {

    return place(
        grid,
        row,
        col,
        "charger"
    );
}


function deposit(grid, row, col) {

    return place(
        grid,
        row,
        col,
        "deposit"
    );
}


function box(grid, row, col) {

    return place(
        grid,
        row,
        col,
        "box"
    );
}


function makeLevel(config) {

    return {

        id:
            `${config.chapter}-${config.exercise}`,

        chapter:
            config.chapter,

        exercise:
            config.exercise,

        difficulty:
            config.difficulty,

        room:
            config.room,

        title:
            config.title,

        instruction:
            config.instruction,

        hint:
            config.hint || "",

        concept:
            config.concept || "",

        grid:
            cloneGrid(config.grid),

        robotStart: {
            row:
                config.robotStart.row,

            col:
                config.robotStart.col,

            direction:
                config.robotStart.direction || "NORTH"
        },

        objective:
            config.objective || {
                type: "reach_goal"
            },

        requiredConcepts:
            config.requiredConcepts || [],

        starterCode:
            config.starterCode || "",

        successMessage:
            config.successMessage ||
            "Mission réussie !"
    };
}


// =========================================================
// CHAPITRE 1
// ENTRÉE
// DÉPLACEMENTS
// =========================================================

const chapter1Level1Grid =
    borderWalls(7, 9);

/*
Départ :
Pyt est en bas à gauche.

Il doit :
1. aller chercher le livre ;
2. le ramasser automatiquement ;
3. revenir sur la case jaune.

Le but n'est donc pas simplement
d'atteindre une case une fois.
*/

object(
    chapter1Level1Grid,
    2,
    2
);

goal(
    chapter1Level1Grid,
    5,
    2
);


const chapter1Level2Grid =
    borderWalls(8, 10);

wall(chapter1Level2Grid, 5, 3);
wall(chapter1Level2Grid, 4, 3);
wall(chapter1Level2Grid, 3, 3);

wall(chapter1Level2Grid, 3, 4);
wall(chapter1Level2Grid, 3, 5);

goal(
    chapter1Level2Grid,
    2,
    7
);


const chapter1Level3Grid =
    borderWalls(9, 11);

wall(chapter1Level3Grid, 6, 3);
wall(chapter1Level3Grid, 5, 3);
wall(chapter1Level3Grid, 4, 3);
wall(chapter1Level3Grid, 3, 3);

wall(chapter1Level3Grid, 3, 4);
wall(chapter1Level3Grid, 3, 5);
wall(chapter1Level3Grid, 3, 6);

wall(chapter1Level3Grid, 4, 6);
wall(chapter1Level3Grid, 5, 6);

object(
    chapter1Level3Grid,
    2,
    8
);

goal(
    chapter1Level3Grid,
    7,
    2
);


const CHAPTER_1 = [

    makeLevel({

        chapter: 1,
        exercise: 1,

        difficulty:
            "easy",

        room:
            "Entrée",

        title:
            "Le livre oublié",

        instruction:
            "Va jusqu'au livre. Pyt le ramassera automatiquement. Ensuite, reviens sur la case jaune.",

        hint:
            "Pyt regarde vers le nord. Utilise forward() pour avancer et backward() pour revenir sans te retourner.",

        concept:
            "forward() et backward()",

        grid:
            chapter1Level1Grid,

        robotStart: {
            row: 5,
            col: 2,
            direction: "NORTH"
        },

        objective: {
            type: "combined",

            requirements: [
                {
                    type:
                        "collect_all"
                },
                {
                    type:
                        "reach_goal"
                }
            ]
        },

        requiredConcepts: [
            "forward",
            "backward"
        ],

        starterCode:
`# Va chercher le livre puis reviens.
forward(1)`

    }),


    makeLevel({

        chapter: 1,
        exercise: 2,

        difficulty:
            "medium",

        room:
            "Entrée",

        title:
            "Contourne le meuble",

        instruction:
            "Rejoins la case jaune sans traverser les meubles.",

        hint:
            "Tu vas devoir changer de direction avec right(90) ou left(90).",

        concept:
            "forward(), left() et right()",

        grid:
            chapter1Level2Grid,

        robotStart: {
            row: 6,
            col: 2,
            direction: "NORTH"
        },

        objective: {
            type:
                "reach_goal"
        },

        requiredConcepts: [
            "forward",
            "turn"
        ],

        starterCode:
`# Rejoins la case jaune.
forward(1)`

    }),


    makeLevel({

        chapter: 1,
        exercise: 3,

        difficulty:
            "hard",

        room:
            "Entrée",

        title:
            "Le courrier de Pyt",

        instruction:
            "Récupère l'objet dans l'entrée puis reviens sur la case jaune. Choisis toi-même ton trajet.",

        hint:
            "Découpe le trajet en lignes droites et en virages.",

        concept:
            "Combiner tous les déplacements",

        grid:
            chapter1Level3Grid,

        robotStart: {
            row: 7,
            col: 2,
            direction: "NORTH"
        },

        objective: {
            type: "combined",

            requirements: [
                {
                    type:
                        "collect_all"
                },
                {
                    type:
                        "reach_goal"
                }
            ]
        },

        requiredConcepts: [
            "forward",
            "backward",
            "turn"
        ],

        starterCode:
`# Récupère l'objet puis reviens.
`

    })
];


// =========================================================
// CHAPITRE 2
// CUISINE
// VARIABLES ET CALCULS
// =========================================================

const chapter2Level1Grid =
    borderWalls(7, 10);

goal(
    chapter2Level1Grid,
    2,
    2
);


const chapter2Level2Grid =
    borderWalls(8, 10);

wall(chapter2Level2Grid, 5, 4);
wall(chapter2Level2Grid, 4, 4);
wall(chapter2Level2Grid, 3, 4);

goal(
    chapter2Level2Grid,
    2,
    7
);


const chapter2Level3Grid =
    borderWalls(9, 11);

object(
    chapter2Level3Grid,
    2,
    7
);

goal(
    chapter2Level3Grid,
    7,
    2
);

wall(chapter2Level3Grid, 6, 5);
wall(chapter2Level3Grid, 5, 5);
wall(chapter2Level3Grid, 4, 5);


const CHAPTER_2 = [

    makeLevel({

        chapter: 2,
        exercise: 1,

        difficulty:
            "easy",

        room:
            "Cuisine",

        title:
            "La bonne distance",

        instruction:
            "Crée une variable distance contenant le nombre de cases à parcourir, puis utilise-la pour rejoindre la case jaune.",

        hint:
            "Exemple : distance = 3 puis forward(distance).",

        concept:
            "Créer et utiliser une variable",

        grid:
            chapter2Level1Grid,

        robotStart: {
            row: 5,
            col: 2,
            direction: "NORTH"
        },

        objective: {
            type:
                "reach_goal"
        },

        requiredConcepts: [
            "variable"
        ],

        starterCode:
`distance = 1

forward(distance)`

    }),


    makeLevel({

        chapter: 2,
        exercise: 2,

        difficulty:
            "medium",

        room:
            "Cuisine",

        title:
            "Mesure la cuisine",

        instruction:
            "Utilise plusieurs variables et un calcul pour atteindre la case jaune en contournant le plan de travail.",

        hint:
            "Tu peux créer des variables comme vertical = 3 et horizontal = 5.",

        concept:
            "Variables et opérations",

        grid:
            chapter2Level2Grid,

        robotStart: {
            row: 6,
            col: 2,
            direction: "NORTH"
        },

        objective: {
            type:
                "reach_goal"
        },

        requiredConcepts: [
            "variable",
            "arithmetic",
            "movement"
        ],

        starterCode:
`a = 1
b = 2
distance = a + b

# Utilise tes variables pour le trajet.
`

    }),


    makeLevel({

        chapter: 2,
        exercise: 3,

        difficulty:
            "hard",

        room:
            "Cuisine",

        title:
            "La recette perdue",

        instruction:
            "Calcule les distances avec des variables, récupère la recette puis reviens sur la case jaune.",

        hint:
            "Les variables peuvent être réutilisées plusieurs fois dans le même programme.",

        concept:
            "Variables, calculs et déplacements",

        grid:
            chapter2Level3Grid,

        robotStart: {
            row: 7,
            col: 2,
            direction: "NORTH"
        },

        objective: {
            type: "combined",

            requirements: [
                {
                    type:
                        "collect_all"
                },
                {
                    type:
                        "reach_goal"
                }
            ]
        },

        requiredConcepts: [
            "variable",
            "arithmetic",
            "movement"
        ],

        starterCode:
`vertical = 2
horizontal = 3

# Calcule les bonnes distances.
`

    })
];


// =========================================================
// CHAPITRE 3
// SALON
// CONDITIONS
// =========================================================

const chapter3Level1Grid =
    borderWalls(7, 9);

goal(
    chapter3Level1Grid,
    2,
    2
);


const chapter3Level2Grid =
    borderWalls(8, 10);

goal(
    chapter3Level2Grid,
    2,
    7
);

wall(chapter3Level2Grid, 4, 4);
wall(chapter3Level2Grid, 5, 4);


const chapter3Level3Grid =
    borderWalls(9, 11);

button(
    chapter3Level3Grid,
    6,
    3
);

door(
    chapter3Level3Grid,
    4,
    5
);

goal(
    chapter3Level3Grid,
    2,
    8
);

wall(chapter3Level3Grid, 3, 5);
wall(chapter3Level3Grid, 5, 5);


const CHAPTER_3 = [

    makeLevel({

        chapter: 3,
        exercise: 1,

        difficulty:
            "easy",

        room:
            "Salon",

        title:
            "Choisis le mouvement",

        instruction:
            "Utilise une condition if pour décider si Pyt doit avancer jusqu'à la case jaune.",

        hint:
            "Crée une variable puis teste sa valeur avec if.",

        concept:
            "if",

        grid:
            chapter3Level1Grid,

        robotStart: {
            row: 5,
            col: 2,
            direction: "NORTH"
        },

        objective: {
            type:
                "reach_goal"
        },

        requiredConcepts: [
            "if"
        ],

        starterCode:
`distance = 3

if distance == 3:
    forward(distance)`

    }),


    makeLevel({

        chapter: 3,
        exercise: 2,

        difficulty:
            "medium",

        room:
            "Salon",

        title:
            "Deux possibilités",

        instruction:
            "Utilise if et else pour choisir le bon trajet jusqu'à la case jaune.",

        hint:
            "Une condition choisit le bloc de code qui sera exécuté.",

        concept:
            "if / else",

        grid:
            chapter3Level2Grid,

        robotStart: {
            row: 6,
            col: 2,
            direction: "NORTH"
        },

        objective: {
            type:
                "reach_goal"
        },

        requiredConcepts: [
            "if",
            "else",
            "movement"
        ],

        starterCode:
`passage_libre = False

if passage_libre:
    forward(1)
else:
    # Écris le trajet alternatif ici.
    forward(1)`

    }),


    makeLevel({

        chapter: 3,
        exercise: 3,

        difficulty:
            "hard",

        room:
            "Salon",

        title:
            "La porte du salon",

        instruction:
            "Active le bouton pour ouvrir la porte puis rejoins la sortie. Utilise des conditions dans ton programme.",

        hint:
            "Tu peux combiner plusieurs tests avec and, or ou not.",

        concept:
            "if / elif / else / and / or / not",

        grid:
            chapter3Level3Grid,

        robotStart: {
            row: 7,
            col: 2,
            direction: "NORTH"
        },

        objective: {
            type: "combined",

            requirements: [
                {
                    type:
                        "activate_all"
                },
                {
                    type:
                        "reach_goal"
                }
            ]
        },

        requiredConcepts: [
            "condition",
            "boolean",
            "movement"
        ],

        starterCode:
`bouton_necessaire = True

if bouton_necessaire:
    # Va d'abord sur le bouton.
    pass
`

    })
];


// =========================================================
// CHAPITRE 4
// BIBLIOTHÈQUE
// FOR / RANGE
// =========================================================

const chapter4Level1Grid =
    borderWalls(8, 9);

goal(
    chapter4Level1Grid,
    2,
    2
);


const chapter4Level2Grid =
    borderWalls(9, 10);

goal(
    chapter4Level2Grid,
    2,
    7
);

wall(chapter4Level2Grid, 5, 4);
wall(chapter4Level2Grid, 4, 4);
wall(chapter4Level2Grid, 3, 4);


const chapter4Level3Grid =
    borderWalls(9, 11);

object(chapter4Level3Grid, 6, 4);
object(chapter4Level3Grid, 4, 4);
object(chapter4Level3Grid, 2, 4);

goal(
    chapter4Level3Grid,
    2,
    8
);


const CHAPTER_4 = [

    makeLevel({

        chapter: 4,
        exercise: 1,

        difficulty:
            "easy",

        room:
            "Bibliothèque",

        title:
            "Le long couloir",

        instruction:
            "Utilise une boucle for avec range() pour faire avancer Pyt jusqu'à la case jaune.",

        hint:
            "Évite d'écrire forward(1) plusieurs fois.",

        concept:
            "for et range",

        grid:
            chapter4Level1Grid,

        robotStart: {
            row: 6,
            col: 2,
            direction: "NORTH"
        },

        objective: {
            type:
                "reach_goal"
        },

        requiredConcepts: [
            "for",
            "range"
        ],

        starterCode:
`for i in range(1):
    forward(1)`

    }),


    makeLevel({

        chapter: 4,
        exercise: 2,

        difficulty:
            "medium",

        room:
            "Bibliothèque",

        title:
            "Répète le motif",

        instruction:
            "Utilise une boucle for pour répéter une partie du trajet et atteindre la sortie.",

        hint:
            "Une boucle peut contenir plusieurs instructions.",

        concept:
            "Boucle contenant plusieurs actions",

        grid:
            chapter4Level2Grid,

        robotStart: {
            row: 7,
            col: 2,
            direction: "NORTH"
        },

        objective: {
            type:
                "reach_goal"
        },

        requiredConcepts: [
            "for",
            "range",
            "turn"
        ],

        starterCode:
`for i in range(2):
    # Complète le motif.
    forward(1)`

    }),


    makeLevel({

        chapter: 4,
        exercise: 3,

        difficulty:
            "hard",

        room:
            "Bibliothèque",

        title:
            "Range les livres",

        instruction:
            "Récupère tous les livres puis rejoins la case jaune. Utilise au moins une boucle for pour éviter les répétitions.",

        hint:
            "Repère les déplacements qui se répètent.",

        concept:
            "Boucles et trajet complet",

        grid:
            chapter4Level3Grid,

        robotStart: {
            row: 7,
            col: 4,
            direction: "NORTH"
        },

        objective: {
            type: "combined",

            requirements: [
                {
                    type:
                        "collect_all"
                },
                {
                    type:
                        "reach_goal"
                }
            ]
        },

        requiredConcepts: [
            "for",
            "range",
            "movement"
        ],

        starterCode:
`# Ramasse les livres avec une boucle.
for i in range(1):
    forward(1)
`

    })
];


// =========================================================
// CHAPITRE 5
// SALLE DE BAIN
// WHILE / BREAK
// =========================================================

const chapter5Level1Grid =
    borderWalls(8, 9);

goal(
    chapter5Level1Grid,
    2,
    2
);


const chapter5Level2Grid =
    borderWalls(9, 10);

goal(
    chapter5Level2Grid,
    2,
    7
);

wall(chapter5Level2Grid, 4, 5);
wall(chapter5Level2Grid, 5, 5);


const chapter5Level3Grid =
    borderWalls(9, 11);

dirt(chapter5Level3Grid, 6, 3);
dirt(chapter5Level3Grid, 5, 3);
dirt(chapter5Level3Grid, 4, 3);
dirt(chapter5Level3Grid, 3, 3);

goal(
    chapter5Level3Grid,
    2,
    7
);


const CHAPTER_5 = [

    makeLevel({

        chapter: 5,
        exercise: 1,

        difficulty:
            "easy",

        room:
            "Salle de bain",

        title:
            "Avance tant que...",

        instruction:
            "Utilise while pour faire avancer Pyt jusqu'à la case jaune.",

        hint:
            "Fais évoluer une variable dans la boucle pour qu'elle finisse par s'arrêter.",

        concept:
            "while",

        grid:
            chapter5Level1Grid,

        robotStart: {
            row: 6,
            col: 2,
            direction: "NORTH"
        },

        objective: {
            type:
                "reach_goal"
        },

        requiredConcepts: [
            "while"
        ],

        starterCode:
`distance = 0

while distance < 1:
    forward(1)
    distance += 1`

    }),


    makeLevel({

        chapter: 5,
        exercise: 2,

        difficulty:
            "medium",

        room:
            "Salle de bain",

        title:
            "Arrête la boucle",

        instruction:
            "Utilise while et break pour contrôler le déplacement de Pyt jusqu'à la sortie.",

        hint:
            "break permet de quitter immédiatement une boucle.",

        concept:
            "while et break",

        grid:
            chapter5Level2Grid,

        robotStart: {
            row: 7,
            col: 2,
            direction: "NORTH"
        },

        objective: {
            type:
                "reach_goal"
        },

        requiredConcepts: [
            "while",
            "break",
            "condition"
        ],

        starterCode:
`distance = 0

while True:
    forward(1)
    distance += 1

    if distance == 1:
        break`

    }),


    makeLevel({

        chapter: 5,
        exercise: 3,

        difficulty:
            "hard",

        room:
            "Salle de bain",

        title:
            "Nettoyage automatique",

        instruction:
            "Traverse la zone sale, nettoie toutes les cases automatiquement puis rejoins la sortie. Utilise une boucle while.",

        hint:
            "Les saletés sont nettoyées automatiquement lorsque Pyt passe dessus.",

        concept:
            "while, condition et déplacements",

        grid:
            chapter5Level3Grid,

        robotStart: {
            row: 7,
            col: 3,
            direction: "NORTH"
        },

        objective: {
            type: "combined",

            requirements: [
                {
                    type:
                        "clean_all"
                },
                {
                    type:
                        "reach_goal"
                }
            ]
        },

        requiredConcepts: [
            "while",
            "condition",
            "movement"
        ],

        starterCode:
`nettoyees = 0

while nettoyees < 4:
    forward(1)
    nettoyees += 1

# Rejoins ensuite la sortie.
`

    })
];


// =========================================================
// CHAPITRE 6
// CHAMBRE
// LISTES
// =========================================================

const chapter6Level1Grid =
    borderWalls(8, 10);

goal(
    chapter6Level1Grid,
    2,
    2
);


const chapter6Level2Grid =
    borderWalls(9, 11);

goal(
    chapter6Level2Grid,
    2,
    8
);

wall(chapter6Level2Grid, 5, 4);
wall(chapter6Level2Grid, 4, 4);


const chapter6Level3Grid =
    borderWalls(10, 12);

object(chapter6Level3Grid, 7, 4);
object(chapter6Level3Grid, 4, 4);
object(chapter6Level3Grid, 4, 8);

goal(
    chapter6Level3Grid,
    2,
    9
);

wall(chapter6Level3Grid, 6, 6);
wall(chapter6Level3Grid, 5, 6);
wall(chapter6Level3Grid, 4, 6);


const CHAPTER_6 = [

    makeLevel({

        chapter: 6,
        exercise: 1,

        difficulty:
            "easy",

        room:
            "Chambre",

        title:
            "Une liste de distances",

        instruction:
            "Crée une liste de distances et utilise une valeur de la liste pour rejoindre la case jaune.",

        hint:
            "Le premier élément d'une liste est à l'indice 0.",

        concept:
            "Créer et lire une liste",

        grid:
            chapter6Level1Grid,

        robotStart: {
            row: 6,
            col: 2,
            direction: "NORTH"
        },

        objective: {
            type:
                "reach_goal"
        },

        requiredConcepts: [
            "list",
            "index"
        ],

        starterCode:
`distances = [1, 2, 4]

forward(distances[0])`

    }),


    makeLevel({

        chapter: 6,
        exercise: 2,

        difficulty:
            "medium",

        room:
            "Chambre",

        title:
            "Le trajet enregistré",

        instruction:
            "Stocke plusieurs distances dans une liste puis parcours-la avec une boucle for pour rejoindre la sortie.",

        hint:
            "Tu peux écrire : for distance in trajet:",

        concept:
            "Liste et boucle for",

        grid:
            chapter6Level2Grid,

        robotStart: {
            row: 7,
            col: 2,
            direction: "NORTH"
        },

        objective: {
            type:
                "reach_goal"
        },

        requiredConcepts: [
            "list",
            "for",
            "movement"
        ],

        starterCode:
`trajet = [2, 3]

for distance in trajet:
    forward(distance)
    # Il faut peut-être tourner ici.
`

    }),


    makeLevel({

        chapter: 6,
        exercise: 3,

        difficulty:
            "hard",

        room:
            "Chambre",

        title:
            "Les objets perdus",

        instruction:
            "Utilise une liste pour organiser ton trajet, récupère tous les objets puis rejoins la case jaune.",

        hint:
            "Une liste peut décrire les différentes longueurs de ton parcours.",

        concept:
            "Listes, boucles et déplacements",

        grid:
            chapter6Level3Grid,

        robotStart: {
            row: 8,
            col: 2,
            direction: "NORTH"
        },

        objective: {
            type: "combined",

            requirements: [
                {
                    type:
                        "collect_all"
                },
                {
                    type:
                        "reach_goal"
                }
            ]
        },

        requiredConcepts: [
            "list",
            "for",
            "movement"
        ],

        starterCode:
`trajet = []

# Ajoute les distances utiles dans la liste.

for distance in trajet:
    forward(distance)
`

    })
];


// =========================================================
// CHAPITRE 7
// ATELIER
// FONCTIONS
// =========================================================

const chapter7Level1Grid =
    borderWalls(8, 10);

goal(
    chapter7Level1Grid,
    2,
    2
);


const chapter7Level2Grid =
    borderWalls(9, 11);

goal(
    chapter7Level2Grid,
    2,
    8
);

wall(chapter7Level2Grid, 5, 4);
wall(chapter7Level2Grid, 4, 4);


const chapter7Level3Grid =
    borderWalls(10, 12);

button(chapter7Level3Grid, 7, 4);

door(chapter7Level3Grid, 4, 7);

object(chapter7Level3Grid, 3, 9);

goal(
    chapter7Level3Grid,
    8,
    2
);


const CHAPTER_7 = [

    makeLevel({

        chapter: 7,
        exercise: 1,

        difficulty:
            "easy",

        room:
            "Atelier",

        title:
            "Ta première commande",

        instruction:
            "Crée une fonction qui fait avancer Pyt jusqu'à la case jaune puis appelle cette fonction.",

        hint:
            "Une fonction commence par def.",

        concept:
            "Créer et appeler une fonction",

        grid:
            chapter7Level1Grid,

        robotStart: {
            row: 6,
            col: 2,
            direction: "NORTH"
        },

        objective: {
            type:
                "reach_goal"
        },

        requiredConcepts: [
            "function"
        ],

        starterCode:
`def avancer():
    forward(1)

avancer()`

    }),


    makeLevel({

        chapter: 7,
        exercise: 2,

        difficulty:
            "medium",

        room:
            "Atelier",

        title:
            "Une fonction avec paramètre",

        instruction:
            "Crée une fonction qui reçoit une distance en paramètre et utilise-la plusieurs fois pour rejoindre la sortie.",

        hint:
            "Exemple : def avancer(distance):",

        concept:
            "Paramètres de fonction",

        grid:
            chapter7Level2Grid,

        robotStart: {
            row: 7,
            col: 2,
            direction: "NORTH"
        },

        objective: {
            type:
                "reach_goal"
        },

        requiredConcepts: [
            "function",
            "parameter",
            "movement"
        ],

        starterCode:
`def avancer(distance):
    forward(distance)

# Appelle ta fonction avec les bonnes valeurs.
`

    }),


    makeLevel({

        chapter: 7,
        exercise: 3,

        difficulty:
            "hard",

        room:
            "Atelier",

        title:
            "Programme l'atelier",

        instruction:
            "Crée des fonctions réutilisables, active le bouton, récupère l'objet puis reviens sur la case jaune.",

        hint:
            "Une fonction peut contenir des déplacements et des virages.",

        concept:
            "Fonctions réutilisables",

        grid:
            chapter7Level3Grid,

        robotStart: {
            row: 8,
            col: 2,
            direction: "NORTH"
        },

        objective: {
            type: "combined",

            requirements: [
                {
                    type:
                        "activate_all"
                },
                {
                    type:
                        "collect_all"
                },
                {
                    type:
                        "reach_goal"
                }
            ]
        },

        requiredConcepts: [
            "function",
            "parameter",
            "condition",
            "movement"
        ],

        starterCode:
`def avancer(distance):
    forward(distance)

def tourner():
    right(90)

# Construis ton programme avec tes fonctions.
`

    })
];


// =========================================================
// CHAPITRE 8
// GRENIER
// COMBINAISON
// =========================================================

const chapter8Level1Grid =
    borderWalls(9, 11);

object(chapter8Level1Grid, 3, 7);

goal(
    chapter8Level1Grid,
    7,
    2
);

wall(chapter8Level1Grid, 5, 5);
wall(chapter8Level1Grid, 4, 5);


const chapter8Level2Grid =
    borderWalls(10, 12);

button(chapter8Level2Grid, 7, 4);
door(chapter8Level2Grid, 5, 7);
object(chapter8Level2Grid, 3, 9);

goal(
    chapter8Level2Grid,
    8,
    2
);


const chapter8Level3Grid =
    borderWalls(11, 13);

object(chapter8Level3Grid, 8, 4);
dirt(chapter8Level3Grid, 6, 4);
button(chapter8Level3Grid, 4, 4);
door(chapter8Level3Grid, 4, 7);
object(chapter8Level3Grid, 3, 10);

goal(
    chapter8Level3Grid,
    9,
    2
);

wall(chapter8Level3Grid, 7, 6);
wall(chapter8Level3Grid, 6, 6);
wall(chapter8Level3Grid, 5, 6);


const CHAPTER_8 = [

    makeLevel({

        chapter: 8,
        exercise: 1,

        difficulty:
            "easy",

        room:
            "Grenier",

        title:
            "Prépare ton trajet",

        instruction:
            "Combine variables, liste, boucle et fonction pour récupérer l'objet puis revenir sur la case jaune.",

        hint:
            "Décompose ton programme : données, fonction, puis exécution.",

        concept:
            "Combiner les notions précédentes",

        grid:
            chapter8Level1Grid,

        robotStart: {
            row: 7,
            col: 2,
            direction: "NORTH"
        },

        objective: {
            type: "combined",

            requirements: [
                {
                    type:
                        "collect_all"
                },
                {
                    type:
                        "reach_goal"
                }
            ]
        },

        requiredConcepts: [
            "variable",
            "list",
            "for",
            "function"
        ],

        starterCode:
`trajet = []

def avancer(distance):
    forward(distance)

# Complète le programme.
`

    }),


    makeLevel({

        chapter: 8,
        exercise: 2,

        difficulty:
            "medium",

        room:
            "Grenier",

        title:
            "La clé du grenier",

        instruction:
            "Active le bouton, traverse la porte, récupère l'objet puis retourne à la case jaune.",

        hint:
            "Utilise des fonctions pour les parties du trajet qui se ressemblent.",

        concept:
            "Conditions, boucles et fonctions",

        grid:
            chapter8Level2Grid,

        robotStart: {
            row: 8,
            col: 2,
            direction: "NORTH"
        },

        objective: {
            type: "combined",

            requirements: [
                {
                    type:
                        "activate_all"
                },
                {
                    type:
                        "collect_all"
                },
                {
                    type:
                        "reach_goal"
                }
            ]
        },

        requiredConcepts: [
            "condition",
            "loop",
            "function",
            "movement"
        ],

        starterCode:
`def avancer(distance):
    for i in range(distance):
        forward(1)

# Active le bouton avant d'aller vers la porte.
`

    }),


    makeLevel({

        chapter: 8,
        exercise: 3,

        difficulty:
            "hard",

        room:
            "Grenier",

        title:
            "Remets le grenier en ordre",

        instruction:
            "Récupère tous les objets, nettoie les saletés, active le bouton et reviens sur la case jaune.",

        hint:
            "Tu peux créer plusieurs petites fonctions au lieu d'une seule très grande.",

        concept:
            "Programme complet",

        grid:
            chapter8Level3Grid,

        robotStart: {
            row: 9,
            col: 2,
            direction: "NORTH"
        },

        objective: {
            type: "combined",

            requirements: [
                {
                    type:
                        "collect_all"
                },
                {
                    type:
                        "clean_all"
                },
                {
                    type:
                        "activate_all"
                },
                {
                    type:
                        "reach_goal"
                }
            ]
        },

        requiredConcepts: [
            "variable",
            "condition",
            "for",
            "while",
            "list",
            "function"
        ],

        starterCode:
`def avancer(distance):
    for i in range(distance):
        forward(1)

def tourner():
    right(90)

# Organise la mission en plusieurs étapes.
`

    })
];


// =========================================================
// CHAPITRE 9
// LABORATOIRE
// EXAMEN FINAL
// AUCUNE NOUVELLE NOTION
// =========================================================

const chapter9Level1Grid =
    borderWalls(10, 12);

object(chapter9Level1Grid, 3, 8);

goal(
    chapter9Level1Grid,
    8,
    2
);

wall(chapter9Level1Grid, 6, 5);
wall(chapter9Level1Grid, 5, 5);
wall(chapter9Level1Grid, 4, 5);


const chapter9Level2Grid =
    borderWalls(11, 13);

button(chapter9Level2Grid, 8, 4);
door(chapter9Level2Grid, 5, 7);
object(chapter9Level2Grid, 3, 10);
dirt(chapter9Level2Grid, 7, 9);

goal(
    chapter9Level2Grid,
    9,
    2
);


const chapter9Level3Grid =
    borderWalls(12, 14);

object(chapter9Level3Grid, 9, 4);
dirt(chapter9Level3Grid, 7, 4);

button(chapter9Level3Grid, 5, 4);

door(chapter9Level3Grid, 5, 8);

object(chapter9Level3Grid, 3, 11);
dirt(chapter9Level3Grid, 7, 10);

charger(chapter9Level3Grid, 9, 10);

goal(
    chapter9Level3Grid,
    10,
    2
);

wall(chapter9Level3Grid, 8, 6);
wall(chapter9Level3Grid, 7, 6);
wall(chapter9Level3Grid, 6, 6);

wall(chapter9Level3Grid, 6, 9);
wall(chapter9Level3Grid, 5, 9);
wall(chapter9Level3Grid, 4, 9);


const CHAPTER_9 = [

    makeLevel({

        chapter: 9,
        exercise: 1,

        difficulty:
            "easy",

        room:
            "Laboratoire",

        title:
            "Examen — Mission 1",

        instruction:
            "Récupère l'objet puis reviens sur la case jaune. Choisis toi-même les notions Python les plus utiles.",

        hint:
            "Il n'y a aucune nouvelle commande dans ce chapitre.",

        concept:
            "Révision générale",

        grid:
            chapter9Level1Grid,

        robotStart: {
            row: 8,
            col: 2,
            direction: "NORTH"
        },

        objective: {
            type: "combined",

            requirements: [
                {
                    type:
                        "collect_all"
                },
                {
                    type:
                        "reach_goal"
                }
            ]
        },

        requiredConcepts: [
            "revision"
        ],

        starterCode:
`# Examen final.
# Construis ton programme.
`

    }),


    makeLevel({

        chapter: 9,
        exercise: 2,

        difficulty:
            "medium",

        room:
            "Laboratoire",

        title:
            "Examen — Mission 2",

        instruction:
            "Active le bouton, traverse la porte, récupère l'objet, nettoie la zone sale puis reviens au départ.",

        hint:
            "Réutilise les notions des huit chapitres précédents.",

        concept:
            "Révision générale",

        grid:
            chapter9Level2Grid,

        robotStart: {
            row: 9,
            col: 2,
            direction: "NORTH"
        },

        objective: {
            type: "combined",

            requirements: [
                {
                    type:
                        "activate_all"
                },
                {
                    type:
                        "collect_all"
                },
                {
                    type:
                        "clean_all"
                },
                {
                    type:
                        "reach_goal"
                }
            ]
        },

        requiredConcepts: [
            "revision"
        ],

        starterCode:
`# Examen final - mission 2.
`

    }),


    makeLevel({

        chapter: 9,
        exercise: 3,

        difficulty:
            "hard",

        room:
            "Laboratoire",

        title:
            "Mission finale de Pyt",

        instruction:
            "Termine toutes les tâches du laboratoire et ramène Pyt sur la case jaune. Il existe plusieurs solutions correctes.",

        hint:
            "Planifie d'abord ton trajet. Utilise ensuite les structures Python qui rendent ton programme clair.",

        concept:
            "Examen final",

        grid:
            chapter9Level3Grid,

        robotStart: {
            row: 10,
            col: 2,
            direction: "NORTH"
        },

        objective: {
            type: "combined",

            requirements: [
                {
                    type:
                        "collect_all"
                },
                {
                    type:
                        "clean_all"
                },
                {
                    type:
                        "activate_all"
                },
                {
                    type:
                        "reach_goal"
                }
            ]
        },

        requiredConcepts: [
            "movement",
            "variable",
            "condition",
            "for",
            "while",
            "list",
            "function"
        ],

        starterCode:
`# MISSION FINALE
#
# Utilise tout ce que tu as appris.
#

`

    })
];


// =========================================================
// TOUS LES CHAPITRES
// =========================================================

const COURSES = {

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
// ACCÈS AUX NIVEAUX
// =========================================================

function getLevel(
    chapter,
    exercise
) {

    chapter =
        Number(chapter);

    exercise =
        Number(exercise);


    const levels =
        COURSES[chapter];


    if (
        !levels ||
        exercise < 1 ||
        exercise > levels.length
    ) {

        return null;
    }


    return levels[
        exercise - 1
    ];
}


function getChapterLevels(
    chapter
) {

    chapter =
        Number(chapter);


    return (
        COURSES[chapter] ||
        []
    );
}


function getAllLevels() {

    const result = [];


    for (
        let chapter = 1;
        chapter <= 9;
        chapter++
    ) {

        const levels =
            getChapterLevels(
                chapter
            );


        for (
            const level
            of levels
        ) {

            result.push(
                level
            );
        }
    }


    return result;
}


// =========================================================
// INFORMATIONS SUR LES CHAPITRES
// =========================================================

const CHAPTER_INFO = {

    1: {
        room:
            "Entrée",

        title:
            "Déplacements",

        concepts: [
            "forward",
            "backward",
            "left",
            "right"
        ]
    },


    2: {
        room:
            "Cuisine",

        title:
            "Variables",

        concepts: [
            "variables",
            "opérations",
            "conversions"
        ]
    },


    3: {
        room:
            "Salon",

        title:
            "Conditions",

        concepts: [
            "if",
            "elif",
            "else",
            "and",
            "or",
            "not"
        ]
    },


    4: {
        room:
            "Bibliothèque",

        title:
            "Boucles for",

        concepts: [
            "for",
            "range"
        ]
    },


    5: {
        room:
            "Salle de bain",

        title:
            "Boucles while",

        concepts: [
            "while",
            "break"
        ]
    },


    6: {
        room:
            "Chambre",

        title:
            "Listes",

        concepts: [
            "listes",
            "index",
            "append"
        ]
    },


    7: {
        room:
            "Atelier",

        title:
            "Fonctions",

        concepts: [
            "def",
            "paramètres",
            "appel de fonction"
        ]
    },


    8: {
        room:
            "Grenier",

        title:
            "Combinaison",

        concepts: [
            "variables",
            "conditions",
            "boucles",
            "listes",
            "fonctions"
        ]
    },


    9: {
        room:
            "Laboratoire",

        title:
            "Examen final",

        concepts: [
            "révision générale"
        ]
    }
};


// =========================================================
// EXPOSITION GLOBALE
// =========================================================

window.COURSES =
    COURSES;

window.CHAPTER_1 =
    CHAPTER_1;

window.CHAPTER_2 =
    CHAPTER_2;

window.CHAPTER_3 =
    CHAPTER_3;

window.CHAPTER_4 =
    CHAPTER_4;

window.CHAPTER_5 =
    CHAPTER_5;

window.CHAPTER_6 =
    CHAPTER_6;

window.CHAPTER_7 =
    CHAPTER_7;

window.CHAPTER_8 =
    CHAPTER_8;

window.CHAPTER_9 =
    CHAPTER_9;

window.CHAPTER_INFO =
    CHAPTER_INFO;

window.getLevel =
    getLevel;

window.getChapterLevels =
    getChapterLevels;

window.getAllLevels =
    getAllLevels;