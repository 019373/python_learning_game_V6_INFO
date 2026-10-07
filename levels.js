"use strict";

/* =========================================================
   PYT - levels.js
   9 chapitres × 3 exercices = 27 niveaux.
========================================================= */


/* =========================================================
   OUTILS DE CRÉATION DES GRILLES
========================================================= */

function borderWalls(rows = 7, cols = 9) {
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


function place(
    grid,
    row,
    col,
    type
) {
    if (
        grid[row] &&
        col >= 0 &&
        col < grid[row].length
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


function boxGoal(grid, row, col) {
    return place(
        grid,
        row,
        col,
        "box_goal"
    );
}


/* =========================================================
   CRÉATION D'UN NIVEAU
========================================================= */

function makeLevel({
    chapter,
    exercise,
    difficulty,
    room,
    title,
    instruction,
    hint,
    concept,
    grid,
    robotStart,
    objective,
    requiredConcepts = [],
    starterCode = "",
    successMessage = "Bravo ! Mission réussie."
}) {
    return {
        id:
            `${chapter}-${exercise}`,

        chapter,
        exercise,
        difficulty,
        room,
        title,
        instruction,
        hint,
        concept,

        grid:
            cloneGrid(grid),

        robotStart: {
            ...robotStart
        },

        objective,

        requiredConcepts:
            [...requiredConcepts],

        starterCode,

        successMessage
    };
}


/* =========================================================
   CHAPITRE 1
   DÉPLACEMENTS
========================================================= */

function createChapter1() {
    const levels = [];


    /*
    1-1
    */

    {
        const grid =
            borderWalls();

        object(
            grid,
            2,
            2
        );

        goal(
            grid,
            5,
            2
        );


        levels.push(
            makeLevel({
                chapter: 1,
                exercise: 1,
                difficulty: "easy",
                room: "Entrée",

                title:
                    "Le livre oublié",

                instruction:
                    "Pyt a oublié un livre. Avance jusqu'au livre, récupère-le automatiquement, puis reviens à la case de départ.",

                hint:
                    "Commence par avancer jusqu'au livre. Pour revenir sans te retourner, backward() peut être utile.",

                concept:
                    "forward() et backward()",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective: {
                    type: "combined",
                    requirements: [
                        "collect_all",
                        "reach_goal"
                    ]
                },

                requiredConcepts: [
                    "forward",
                    "backward"
                ],

                starterCode:
`# Va chercher le livre puis reviens.
forward(3)

# Reviens au départ.
`,

                successMessage:
                    "Parfait ! Pyt a récupéré le livre et est revenu à sa place."
            })
        );
    }


    /*
    1-2
    */

    {
        const grid =
            borderWalls();

        wall(
            grid,
            3,
            3
        );

        wall(
            grid,
            3,
            4
        );

        goal(
            grid,
            2,
            5
        );


        levels.push(
            makeLevel({
                chapter: 1,
                exercise: 2,
                difficulty: "medium",
                room: "Entrée",

                title:
                    "Contourner le meuble",

                instruction:
                    "Le passage direct est bloqué. Fais tourner Pyt pour contourner le meuble et atteindre la case jaune.",

                hint:
                    "Utilise right(90) ou left(90) pour changer la direction de Pyt.",

                concept:
                    "left() et right()",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective:
                    "reach_goal",

                requiredConcepts: [
                    "movement",
                    "right"
                ],

                starterCode:
`# Contourne l'obstacle.
forward(1)
right(90)
`,

                successMessage:
                    "Bien joué ! Pyt sait maintenant contourner un obstacle."
            })
        );
    }


    /*
    1-3
    */

    {
        const grid =
            borderWalls();

        object(
            grid,
            2,
            6
        );

        goal(
            grid,
            5,
            2
        );

        wall(
            grid,
            3,
            4
        );

        wall(
            grid,
            4,
            4
        );


        levels.push(
            makeLevel({
                chapter: 1,
                exercise: 3,
                difficulty: "hard",
                room: "Entrée",

                title:
                    "Mission aller-retour",

                instruction:
                    "Va chercher l'objet de l'autre côté de l'entrée puis reviens au point de départ.",

                hint:
                    "Découpe le trajet en plusieurs lignes droites séparées par des rotations.",

                concept:
                    "Déplacements complets",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective: {
                    type: "combined",
                    requirements: [
                        "collect_all",
                        "reach_goal"
                    ]
                },

                requiredConcepts: [
                    "forward",
                    "right",
                    "left"
                ],

                starterCode:
`# Trouve un trajet jusqu'à l'objet,
# puis reviens au départ.
`,

                successMessage:
                    "Excellent ! Le chapitre des déplacements est terminé."
            })
        );
    }


    return levels;
}


/* =========================================================
   CHAPITRE 2
   VARIABLES, CALCULS ET CONVERSIONS
========================================================= */

function createChapter2() {
    const levels = [];


    /*
    2-1
    */

    {
        const grid =
            borderWalls();

        goal(
            grid,
            2,
            2
        );


        levels.push(
            makeLevel({
                chapter: 2,
                exercise: 1,
                difficulty: "easy",
                room: "Cuisine",

                title:
                    "La bonne distance",

                instruction:
                    "Stocke la distance dans une variable puis utilise cette variable pour faire avancer Pyt jusqu'à la case jaune.",

                hint:
                    "Une variable peut contenir un nombre : distance = 3.",

                concept:
                    "Variables",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective:
                    "reach_goal",

                requiredConcepts: [
                    "variable",
                    "forward"
                ],

                starterCode:
`distance = 3

forward(distance)
`,

                successMessage:
                    "Parfait ! Tu viens d'utiliser une variable pour contrôler Pyt."
            })
        );
    }


    /*
    2-2
    */

    {
        const grid =
            borderWalls();

        goal(
            grid,
            1,
            2
        );


        levels.push(
            makeLevel({
                chapter: 2,
                exercise: 2,
                difficulty: "medium",
                room: "Cuisine",

                title:
                    "Calcul de trajet",

                instruction:
                    "Calcule la distance avec plusieurs variables puis utilise le résultat pour atteindre la case jaune.",

                hint:
                    "Tu peux additionner des variables : total = distance + bonus.",

                concept:
                    "Calculs",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective:
                    "reach_goal",

                requiredConcepts: [
                    "variable",
                    "calculation"
                ],

                starterCode:
`distance = 2
bonus = 2

total = distance + bonus

forward(total)
`,

                successMessage:
                    "Bien joué ! Pyt peut maintenant utiliser le résultat d'un calcul."
            })
        );
    }


    /*
    2-3
    */

    {
        const grid =
            borderWalls();

        goal(
            grid,
            2,
            6
        );


        levels.push(
            makeLevel({
                chapter: 2,
                exercise: 3,
                difficulty: "hard",
                room: "Cuisine",

                title:
                    "La recette numérique",

                instruction:
                    "Une distance est écrite sous forme de texte. Convertis-la en nombre, effectue un calcul, puis guide Pyt jusqu'à l'objectif.",

                hint:
                    "int(\"3\") transforme le texte \"3\" en nombre.",

                concept:
                    "Conversions",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective:
                    "reach_goal",

                requiredConcepts: [
                    "variable",
                    "conversion",
                    "calculation"
                ],

                starterCode:
`distance_texte = "3"
distance = int(distance_texte)

forward(distance)
right(90)

reste = 4
forward(reste)
`,

                successMessage:
                    "Super ! Variables, calculs et conversions sont maîtrisés."
            })
        );
    }


    return levels;
}


/* =========================================================
   CHAPITRE 3
   CONDITIONS
========================================================= */

function createChapter3() {
    const levels = [];


    /*
    3-1
    */

    {
        const grid =
            borderWalls();

        goal(
            grid,
            2,
            2
        );


        levels.push(
            makeLevel({
                chapter: 3,
                exercise: 1,
                difficulty: "easy",
                room: "Salon",

                title:
                    "Une décision simple",

                instruction:
                    "Utilise if pour vérifier la distance avant de faire avancer Pyt.",

                hint:
                    "La condition doit être suivie de deux-points et le code à exécuter doit être indenté.",

                concept:
                    "if",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective:
                    "reach_goal",

                requiredConcepts: [
                    "if"
                ],

                starterCode:
`distance = 3

if distance == 3:
    forward(distance)
`,

                successMessage:
                    "Bravo ! Pyt vient de prendre une décision avec if."
            })
        );
    }


    /*
    3-2
    */

    {
        const grid =
            borderWalls();

        goal(
            grid,
            2,
            5
        );


        levels.push(
            makeLevel({
                chapter: 3,
                exercise: 2,
                difficulty: "medium",
                room: "Salon",

                title:
                    "Deux possibilités",

                instruction:
                    "Utilise if et else pour choisir le bon trajet.",

                hint:
                    "Le bloc else s'exécute lorsque la condition du if est fausse.",

                concept:
                    "if / else",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective:
                    "reach_goal",

                requiredConcepts: [
                    "if",
                    "else"
                ],

                starterCode:
`passage_libre = True

if passage_libre:
    forward(3)
    right(90)
    forward(3)
else:
    forward(1)
`,

                successMessage:
                    "Très bien ! Tu sais maintenant gérer deux situations différentes."
            })
        );
    }


    /*
    3-3
    */

    {
        const grid =
            borderWalls();

        goal(
            grid,
            1,
            6
        );


        levels.push(
            makeLevel({
                chapter: 3,
                exercise: 3,
                difficulty: "hard",
                room: "Salon",

                title:
                    "Le bon choix",

                instruction:
                    "Utilise if, elif, else et une combinaison logique pour choisir le trajet qui mène à l'objectif.",

                hint:
                    "and demande que deux conditions soient vraies. or demande qu'au moins une condition soit vraie.",

                concept:
                    "elif, and, or, not",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective:
                    "reach_goal",

                requiredConcepts: [
                    "if",
                    "elif",
                    "else",
                    "and"
                ],

                starterCode:
`distance = 4
passage_libre = True

if distance == 4 and passage_libre:
    forward(4)
    right(90)
    forward(4)
elif distance == 3:
    forward(3)
else:
    forward(1)
`,

                successMessage:
                    "Excellent ! Les conditions n'ont plus de secret pour toi."
            })
        );
    }


    return levels;
}


/* =========================================================
   CHAPITRE 4
   FOR ET RANGE
========================================================= */

function createChapter4() {
    const levels = [];


    /*
    4-1
    */

    {
        const grid =
            borderWalls();

        goal(
            grid,
            2,
            2
        );


        levels.push(
            makeLevel({
                chapter: 4,
                exercise: 1,
                difficulty: "easy",
                room: "Bibliothèque",

                title:
                    "Répéter sans recopier",

                instruction:
                    "Utilise une boucle for pour faire avancer Pyt trois fois.",

                hint:
                    "for i in range(3): répète le bloc trois fois.",

                concept:
                    "for",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective:
                    "reach_goal",

                requiredConcepts: [
                    "for",
                    "range"
                ],

                starterCode:
`for i in range(3):
    forward(1)
`,

                successMessage:
                    "Parfait ! Une boucle évite de répéter les mêmes lignes."
            })
        );
    }


    /*
    4-2
    */

    {
        const grid =
            borderWalls();

        goal(
            grid,
            2,
            5
        );


        levels.push(
            makeLevel({
                chapter: 4,
                exercise: 2,
                difficulty: "medium",
                room: "Bibliothèque",

                title:
                    "Le coin de la bibliothèque",

                instruction:
                    "Utilise des boucles for pour parcourir les deux parties du trajet.",

                hint:
                    "Une boucle peut être utilisée avant puis après une rotation.",

                concept:
                    "Plusieurs boucles for",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective:
                    "reach_goal",

                requiredConcepts: [
                    "for",
                    "range"
                ],

                starterCode:
`for i in range(3):
    forward(1)

right(90)

for i in range(3):
    forward(1)
`,

                successMessage:
                    "Bien joué ! Tu sais utiliser plusieurs boucles dans un trajet."
            })
        );
    }


    /*
    4-3
    */

    {
        const grid =
            borderWalls();

        object(
            grid,
            2,
            6
        );

        goal(
            grid,
            5,
            2
        );


        levels.push(
            makeLevel({
                chapter: 4,
                exercise: 3,
                difficulty: "hard",
                room: "Bibliothèque",

                title:
                    "La tournée des rayons",

                instruction:
                    "Utilise for et range pour récupérer l'objet puis revenir au départ.",

                hint:
                    "Tu peux répéter un trajet, tourner, puis utiliser une autre boucle.",

                concept:
                    "Boucles et déplacements",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective: {
                    type: "combined",
                    requirements: [
                        "collect_all",
                        "reach_goal"
                    ]
                },

                requiredConcepts: [
                    "for",
                    "range"
                ],

                starterCode:
`# Utilise des boucles pour éviter
# de recopier les déplacements.
`,

                successMessage:
                    "Excellent ! Le chapitre des boucles for est terminé."
            })
        );
    }


    return levels;
}


/* =========================================================
   CHAPITRE 5
   WHILE ET BREAK
========================================================= */

function createChapter5() {
    const levels = [];


    /*
    5-1
    */

    {
        const grid =
            borderWalls();

        goal(
            grid,
            2,
            2
        );


        levels.push(
            makeLevel({
                chapter: 5,
                exercise: 1,
                difficulty: "easy",
                room: "Salle de bain",

                title:
                    "Tant que ce n'est pas fini",

                instruction:
                    "Utilise while pour faire avancer Pyt jusqu'à ce que la variable distance atteigne 3.",

                hint:
                    "N'oublie pas de modifier la variable dans la boucle, sinon elle ne s'arrêtera jamais.",

                concept:
                    "while",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective:
                    "reach_goal",

                requiredConcepts: [
                    "while"
                ],

                starterCode:
`distance = 0

while distance < 3:
    forward(1)
    distance += 1
`,

                successMessage:
                    "Bravo ! Tu sais maintenant répéter avec while."
            })
        );
    }


    /*
    5-2
    */

    {
        const grid =
            borderWalls();

        goal(
            grid,
            2,
            5
        );


        levels.push(
            makeLevel({
                chapter: 5,
                exercise: 2,
                difficulty: "medium",
                room: "Salle de bain",

                title:
                    "Sortir de la boucle",

                instruction:
                    "Utilise une boucle while et break pour arrêter la répétition au bon moment.",

                hint:
                    "break quitte immédiatement la boucle dans laquelle il se trouve.",

                concept:
                    "break",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective:
                    "reach_goal",

                requiredConcepts: [
                    "while",
                    "break"
                ],

                starterCode:
`etapes = 0

while True:
    forward(1)
    etapes += 1

    if etapes == 3:
        break

right(90)
forward(3)
`,

                successMessage:
                    "Très bien ! break t'a permis de contrôler la fin de la boucle."
            })
        );
    }


    /*
    5-3
    */

    {
        const grid =
            borderWalls();

        object(
            grid,
            1,
            6
        );

        goal(
            grid,
            5,
            2
        );


        levels.push(
            makeLevel({
                chapter: 5,
                exercise: 3,
                difficulty: "hard",
                room: "Salle de bain",

                title:
                    "Nettoyage automatique",

                instruction:
                    "Utilise while et break dans ton trajet pour récupérer l'objet puis revenir au départ.",

                hint:
                    "Une variable peut servir de compteur pour savoir quand quitter une boucle.",

                concept:
                    "while + break",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective: {
                    type: "combined",
                    requirements: [
                        "collect_all",
                        "reach_goal"
                    ]
                },

                requiredConcepts: [
                    "while",
                    "break"
                ],

                starterCode:
`compteur = 0

while True:
    forward(1)
    compteur += 1

    if compteur == 4:
        break

# Continue le trajet.
`,

                successMessage:
                    "Excellent ! Tu maîtrises while et break."
            })
        );
    }


    return levels;
}


/* =========================================================
   CHAPITRE 6
   LISTES
========================================================= */

function createChapter6() {
    const levels = [];


    /*
    6-1
    */

    {
        const grid =
            borderWalls();

        goal(
            grid,
            2,
            2
        );


        levels.push(
            makeLevel({
                chapter: 6,
                exercise: 1,
                difficulty: "easy",
                room: "Chambre",

                title:
                    "Une liste d'actions",

                instruction:
                    "Crée une liste contenant trois déplacements puis parcours-la avec une boucle.",

                hint:
                    "Une liste s'écrit avec des crochets : [1, 1, 1].",

                concept:
                    "Listes",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective:
                    "reach_goal",

                requiredConcepts: [
                    "list",
                    "for"
                ],

                starterCode:
`distances = [1, 1, 1]

for distance in distances:
    forward(distance)
`,

                successMessage:
                    "Bravo ! Tu viens de parcourir une liste."
            })
        );
    }


    /*
    6-2
    */

    {
        const grid =
            borderWalls();

        goal(
            grid,
            2,
            5
        );


        levels.push(
            makeLevel({
                chapter: 6,
                exercise: 2,
                difficulty: "medium",
                room: "Chambre",

                title:
                    "Compléter la liste",

                instruction:
                    "Ajoute une valeur avec append(), puis utilise la liste pour guider Pyt.",

                hint:
                    "liste.append(valeur) ajoute une valeur à la fin de la liste.",

                concept:
                    "append()",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective:
                    "reach_goal",

                requiredConcepts: [
                    "list",
                    "append"
                ],

                starterCode:
`distances = [1, 1]
distances.append(1)

for distance in distances:
    forward(distance)

right(90)
forward(3)
`,

                successMessage:
                    "Très bien ! Tu sais maintenant ajouter une valeur à une liste."
            })
        );
    }


    /*
    6-3
    */

    {
        const grid =
            borderWalls();

        object(
            grid,
            2,
            6
        );

        goal(
            grid,
            5,
            2
        );


        levels.push(
            makeLevel({
                chapter: 6,
                exercise: 3,
                difficulty: "hard",
                room: "Chambre",

                title:
                    "Le trajet enregistré",

                instruction:
                    "Utilise une liste pour organiser le trajet jusqu'à l'objet puis revenir au départ.",

                hint:
                    "Une liste peut contenir les distances utilisées dans plusieurs parties du trajet.",

                concept:
                    "Listes et boucles",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective: {
                    type: "combined",
                    requirements: [
                        "collect_all",
                        "reach_goal"
                    ]
                },

                requiredConcepts: [
                    "list",
                    "for"
                ],

                starterCode:
`distances = [3, 4]

# Utilise les valeurs de la liste
# pour construire ton trajet.
`,

                successMessage:
                    "Excellent ! Tu sais utiliser une liste pour organiser un programme."
            })
        );
    }


    return levels;
}


/* =========================================================
   CHAPITRE 7
   FONCTIONS
========================================================= */

function createChapter7() {
    const levels = [];


    /*
    7-1
    */

    {
        const grid =
            borderWalls();

        goal(
            grid,
            2,
            2
        );


        levels.push(
            makeLevel({
                chapter: 7,
                exercise: 1,
                difficulty: "easy",
                room: "Atelier",

                title:
                    "Créer une fonction",

                instruction:
                    "Crée une fonction qui fait avancer Pyt de trois cases, puis appelle-la.",

                hint:
                    "Une fonction commence par def nom(): puis son contenu est indenté.",

                concept:
                    "def",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective:
                    "reach_goal",

                requiredConcepts: [
                    "function"
                ],

                starterCode:
`def avancer_trois():
    forward(3)

avancer_trois()
`,

                successMessage:
                    "Bravo ! Tu viens de créer et d'appeler une fonction."
            })
        );
    }


    /*
    7-2
    */

    {
        const grid =
            borderWalls();

        goal(
            grid,
            2,
            5
        );


        levels.push(
            makeLevel({
                chapter: 7,
                exercise: 2,
                difficulty: "medium",
                room: "Atelier",

                title:
                    "Une fonction avec paramètre",

                instruction:
                    "Crée une fonction qui reçoit une distance et utilise-la pour effectuer le trajet.",

                hint:
                    "Un paramètre permet de donner une valeur différente à chaque appel.",

                concept:
                    "Paramètres",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective:
                    "reach_goal",

                requiredConcepts: [
                    "function"
                ],

                starterCode:
`def avancer(distance):
    forward(distance)

avancer(3)
right(90)
avancer(3)
`,

                successMessage:
                    "Très bien ! Ta fonction peut maintenant recevoir une valeur."
            })
        );
    }


    /*
    7-3
    */

    {
        const grid =
            borderWalls();

        object(
            grid,
            1,
            6
        );

        goal(
            grid,
            5,
            2
        );


        levels.push(
            makeLevel({
                chapter: 7,
                exercise: 3,
                difficulty: "hard",
                room: "Atelier",

                title:
                    "Le trajet réutilisable",

                instruction:
                    "Crée une ou plusieurs fonctions pour aller chercher l'objet puis revenir au départ.",

                hint:
                    "Une fonction peut appeler forward(), right() ou left(), et tu peux l'appeler plusieurs fois.",

                concept:
                    "Fonctions réutilisables",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective: {
                    type: "combined",
                    requirements: [
                        "collect_all",
                        "reach_goal"
                    ]
                },

                requiredConcepts: [
                    "function"
                ],

                starterCode:
`def avancer(distance):
    forward(distance)

# Construis la suite du programme.
`,

                successMessage:
                    "Excellent ! Les fonctions te permettent maintenant d'organiser tes programmes."
            })
        );
    }


    return levels;
}


/* =========================================================
   CHAPITRE 8
   COMBINAISON DES NOTIONS
========================================================= */

function createChapter8() {
    const levels = [];


    /*
    8-1
    */

    {
        const grid =
            borderWalls();

        object(
            grid,
            2,
            5
        );

        goal(
            grid,
            5,
            2
        );


        levels.push(
            makeLevel({
                chapter: 8,
                exercise: 1,
                difficulty: "easy",
                room: "Grenier",

                title:
                    "Tout commence à se combiner",

                instruction:
                    "Utilise une variable, une boucle et des déplacements pour récupérer l'objet puis revenir au départ.",

                hint:
                    "Commence par stocker une distance dans une variable, puis utilise-la dans une boucle ou un déplacement.",

                concept:
                    "Révision combinée",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective: {
                    type: "combined",
                    requirements: [
                        "collect_all",
                        "reach_goal"
                    ]
                },

                requiredConcepts: [
                    "variable",
                    "for"
                ],

                starterCode:
`distance = 3

for i in range(distance):
    forward(1)

# Continue le trajet.
`,

                successMessage:
                    "Bien joué ! Tu commences à combiner plusieurs notions."
            })
        );
    }


    /*
    8-2
    */

    {
        const grid =
            borderWalls();

        button(
            grid,
            4,
            2
        );

        door(
            grid,
            3,
            2
        );

        goal(
            grid,
            1,
            5
        );


        levels.push(
            makeLevel({
                chapter: 8,
                exercise: 2,
                difficulty: "medium",
                room: "Grenier",

                title:
                    "La porte du grenier",

                instruction:
                    "Passe sur le bouton pour ouvrir la porte, puis utilise une condition et une boucle pour atteindre l'objectif.",

                hint:
                    "Le bouton s'active automatiquement lorsque Pyt passe dessus.",

                concept:
                    "Conditions et boucles",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective: {
                    type: "combined",
                    requirements: [
                        "activate_all",
                        "reach_goal"
                    ]
                },

                requiredConcepts: [
                    "if",
                    "for"
                ],

                starterCode:
`passage = True

if passage:
    forward(1)

# La porte est maintenant ouverte.
# Continue avec une boucle.
`,

                successMessage:
                    "Parfait ! Pyt a ouvert la porte et traversé le grenier."
            })
        );
    }


    /*
    8-3
    */

    {
        const grid =
            borderWalls();

        object(
            grid,
            2,
            6
        );

        deposit(
            grid,
            5,
            5
        );

        goal(
            grid,
            5,
            2
        );


        levels.push(
            makeLevel({
                chapter: 8,
                exercise: 3,
                difficulty: "hard",
                room: "Grenier",

                title:
                    "La grande mission",

                instruction:
                    "Utilise plusieurs notions pour récupérer l'objet, le déposer sur la zone prévue puis revenir au départ.",

                hint:
                    "Organise ton programme avec une fonction. Les interactions avec l'objet et le dépôt sont automatiques.",

                concept:
                    "Combinaison générale",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective: {
                    type: "combined",
                    requirements: [
                        "collect_all",
                        "deposit",
                        "reach_goal"
                    ]
                },

                requiredConcepts: [
                    "function",
                    "for",
                    "variable"
                ],

                starterCode:
`def avancer(distance):
    for i in range(distance):
        forward(1)

distance = 3

# Termine la mission.
`,

                successMessage:
                    "Excellent ! Tu es prêt pour le laboratoire final."
            })
        );
    }


    return levels;
}


/* =========================================================
   CHAPITRE 9
   EXAMEN FINAL
   AUCUNE NOUVELLE NOTION
========================================================= */

function createChapter9() {
    const levels = [];


    /*
    9-1
    */

    {
        const grid =
            borderWalls();

        object(
            grid,
            2,
            5
        );

        goal(
            grid,
            5,
            2
        );


        levels.push(
            makeLevel({
                chapter: 9,
                exercise: 1,
                difficulty: "easy",
                room: "Laboratoire",

                title:
                    "Examen final — Partie 1",

                instruction:
                    "Récupère l'objet puis reviens au départ. Choisis toi-même les notions apprises qui rendent ton programme clair et efficace.",

                hint:
                    "Tu peux utiliser des variables, des boucles ou une fonction. Aucune nouvelle notion n'est nécessaire.",

                concept:
                    "Révision générale",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective: {
                    type: "combined",
                    requirements: [
                        "collect_all",
                        "reach_goal"
                    ]
                },

                requiredConcepts: [
                    "revision"
                ],

                starterCode:
`# Examen final.
# À toi de choisir ta solution.
`,

                successMessage:
                    "Première partie de l'examen réussie."
            })
        );
    }


    /*
    9-2
    */

    {
        const grid =
            borderWalls();

        button(
            grid,
            4,
            2
        );

        door(
            grid,
            3,
            2
        );

        object(
            grid,
            1,
            6
        );

        goal(
            grid,
            5,
            2
        );


        levels.push(
            makeLevel({
                chapter: 9,
                exercise: 2,
                difficulty: "medium",
                room: "Laboratoire",

                title:
                    "Examen final — Partie 2",

                instruction:
                    "Active le bouton, traverse la porte, récupère l'objet puis retourne au point de départ.",

                hint:
                    "Réutilise les outils des chapitres précédents pour éviter un programme inutilement long.",

                concept:
                    "Révision générale",

                grid,

                robotStart: {
                    row: 5,
                    col: 2,
                    direction: "NORTH"
                },

                objective: {
                    type: "combined",
                    requirements: [
                        "activate_all",
                        "collect_all",
                        "reach_goal"
                    ]
                },

                requiredConcepts: [
                    "revision"
                ],

                starterCode:
`# Examen final - partie 2.
`,

                successMessage:
                    "Deuxième partie réussie. Il ne reste plus qu'une mission."
            })
        );
    }


    /*
    9-3
    */

    {
        const grid =
            borderWalls(
                8,
                10
            );

        button(
            grid,
            6,
            2
        );

        door(
            grid,
            4,
            2
        );

        object(
            grid,
            1,
            7
        );

        deposit(
            grid,
            6,
            6
        );

        goal(
            grid,
            6,
            2
        );

        wall(
            grid,
            3,
            4
        );

        wall(
            grid,
            4,
            4
        );

        wall(
            grid,
            5,
            4
        );


        levels.push(
            makeLevel({
                chapter: 9,
                exercise: 3,
                difficulty: "hard",
                room: "Laboratoire",

                title:
                    "Examen final — Mission PYT",

                instruction:
                    "Dernière mission : active le système, récupère l'objet, dépose-le dans la zone prévue puis ramène Pyt au point de départ.",

                hint:
                    "Prends le temps d'organiser ton programme. Toutes les notions nécessaires ont déjà été vues.",

                concept:
                    "Examen final",

                grid,

                robotStart: {
                    row: 6,
                    col: 2,
                    direction: "NORTH"
                },

                objective: {
                    type: "combined",
                    requirements: [
                        "activate_all",
                        "collect_all",
                        "deposit",
                        "reach_goal"
                    ]
                },

                requiredConcepts: [
                    "revision"
                ],

                starterCode:
`# EXAMEN FINAL
#
# Aucune nouvelle notion.
# Utilise ce que tu as appris
# pour terminer la mission.
`,

                successMessage:
                    "Félicitations ! Tu as terminé PYT et réussi l'examen final."
            })
        );
    }


    return levels;
}


/* =========================================================
   TOUS LES NIVEAUX
========================================================= */

const LEVELS = [
    ...createChapter1(),
    ...createChapter2(),
    ...createChapter3(),
    ...createChapter4(),
    ...createChapter5(),
    ...createChapter6(),
    ...createChapter7(),
    ...createChapter8(),
    ...createChapter9()
];


/* =========================================================
   INFORMATIONS DES CHAPITRES
========================================================= */

const CHAPTER_INFO = {

    1: {
        number: 1,
        title: "Déplacements",
        room: "Entrée",
        concept:
            "forward(), backward(), left(), right()"
    },

    2: {
        number: 2,
        title: "Variables et calculs",
        room: "Cuisine",
        concept:
            "Variables, opérations et conversions"
    },

    3: {
        number: 3,
        title: "Conditions",
        room: "Salon",
        concept:
            "if, elif, else, and, or, not"
    },

    4: {
        number: 4,
        title: "Boucles for",
        room: "Bibliothèque",
        concept:
            "for et range()"
    },

    5: {
        number: 5,
        title: "Boucles while",
        room: "Salle de bain",
        concept:
            "while et break"
    },

    6: {
        number: 6,
        title: "Listes",
        room: "Chambre",
        concept:
            "Listes, index et append()"
    },

    7: {
        number: 7,
        title: "Fonctions",
        room: "Atelier",
        concept:
            "def, appels et paramètres"
    },

    8: {
        number: 8,
        title: "Combinaison",
        room: "Grenier",
        concept:
            "Combinaison des notions précédentes"
    },

    9: {
        number: 9,
        title: "Examen final",
        room: "Laboratoire",
        concept:
            "Révision générale"
    }
};


/* =========================================================
   COURS
========================================================= */

const COURSES = {

    1: {
        title:
            "Chapitre 1 — Déplacements",

        description:
            "Apprends à déplacer Pyt case par case et à le faire tourner.",

        concepts: [
            "forward(distance)",
            "backward(distance)",
            "right(90)",
            "left(90)"
        ]
    },


    2: {
        title:
            "Chapitre 2 — Variables et calculs",

        description:
            "Stocke des valeurs, effectue des calculs et convertis des données.",

        concepts: [
            "variables",
            "+ - * / %",
            "int()",
            "float()",
            "str()"
        ]
    },


    3: {
        title:
            "Chapitre 3 — Conditions",

        description:
            "Permets à ton programme de choisir quoi faire selon une situation.",

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
        title:
            "Chapitre 4 — Boucles for",

        description:
            "Répète des instructions un nombre déterminé de fois.",

        concepts: [
            "for",
            "range()"
        ]
    },


    5: {
        title:
            "Chapitre 5 — Boucles while",

        description:
            "Répète des instructions tant qu'une condition est vraie.",

        concepts: [
            "while",
            "break"
        ]
    },


    6: {
        title:
            "Chapitre 6 — Listes",

        description:
            "Regroupe plusieurs valeurs dans une même variable.",

        concepts: [
            "[]",
            "index",
            "append()",
            "for"
        ]
    },


    7: {
        title:
            "Chapitre 7 — Fonctions",

        description:
            "Regroupe des instructions dans des blocs réutilisables.",

        concepts: [
            "def",
            "paramètres",
            "appel de fonction"
        ]
    },


    8: {
        title:
            "Chapitre 8 — Combinaison",

        description:
            "Combine les notions apprises pour construire des programmes plus complets.",

        concepts: [
            "variables",
            "conditions",
            "boucles",
            "listes",
            "fonctions"
        ]
    },


    9: {
        title:
            "Chapitre 9 — Examen final",

        description:
            "Trois exercices finaux sans nouvelle notion.",

        concepts: [
            "révision générale"
        ]
    }
};


/* =========================================================
   FONCTIONS D'ACCÈS
========================================================= */

function getLevel(
    chapter,
    exercise
) {
    return (
        LEVELS.find(
            level =>
                Number(level.chapter) ===
                Number(chapter) &&
                Number(level.exercise) ===
                Number(exercise)
        ) ||
        null
    );
}


function getChapterLevels(chapter) {
    return LEVELS.filter(
        level =>
            Number(level.chapter) ===
            Number(chapter)
    );
}


function getAllLevels() {
    return [...LEVELS];
}


/* =========================================================
   VÉRIFICATION
========================================================= */

if (LEVELS.length !== 27) {
    console.error(
        `PYT : ${LEVELS.length} niveaux trouvés au lieu de 27.`
    );
}


/* =========================================================
   EXPORTS
========================================================= */

window.LEVELS =
    LEVELS;

window.CHAPTER_INFO =
    CHAPTER_INFO;

window.COURSES =
    COURSES;

window.getLevel =
    getLevel;

window.getChapterLevels =
    getChapterLevels;

window.getAllLevels =
    getAllLevels;