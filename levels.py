"""
levels.py
PYT - Jeu éducatif Python

Contient :
- les cours des chapitres
- les 27 exercices fixes
- les informations de progression

Chaque chapitre contient exactement :
1. Facile
2. Moyen
3. Difficile
"""


# ============================================================
# OUTILS DE CRÉATION DES CARTES
# ============================================================

def border_walls(rows, cols):
    """Crée automatiquement les murs autour d'une carte."""

    walls = []

    for col in range(cols):
        walls.append((0, col))
        walls.append((rows - 1, col))

    for row in range(1, rows - 1):
        walls.append((row, 0))
        walls.append((row, cols - 1))

    return walls


def make_level(
    chapter,
    exercise,
    difficulty,
    title,
    instruction,
    rows,
    cols,
    start,
    start_direction,
    goal,
    walls=None,
    objects=None,
    deposits=None,
    buttons=None,
    doors=None,
    dirt=None,
    boxes=None,
    chargers=None,
    objective="reach_goal",
    required_deposits=1,
    box_targets=None,
):
    """Crée la structure commune d'un exercice."""

    level_walls = border_walls(
        rows,
        cols
    )

    if walls:
        level_walls.extend(
            walls
        )

    return {
        "chapter": chapter,
        "exercise": exercise,
        "difficulty": difficulty,
        "title": title,
        "instruction": instruction,

        "rows": rows,
        "cols": cols,

        "start": start,
        "start_direction": start_direction,

        "goal": goal,

        "walls": level_walls,

        "objects": objects or [],
        "deposits": deposits or [],
        "buttons": buttons or [],
        "doors": doors or [],
        "dirt": dirt or [],
        "boxes": boxes or [],
        "chargers": chargers or [],

        "objective": objective,

        "required_deposits": required_deposits,
        "box_targets": box_targets or [],
    }


# ============================================================
# COURS
# ============================================================

COURSES = {

    # --------------------------------------------------------
    # CHAPITRE 1
    # --------------------------------------------------------

    1: {
        "chapter": 1,
        "title": "Déplacer Pyt",
        "subtitle": "Les déplacements de base",

        "introduction": (
            "Dans ce chapitre, tu apprends à déplacer Pyt "
            "sur la grille.\n\n"
            "Pyt regarde toujours dans une direction. "
            "Il peut avancer, reculer et tourner."
        ),

        "sections": [
            {
                "title": "Avancer",
                "text": (
                    "forward() fait avancer Pyt dans "
                    "la direction qu'il regarde."
                ),
                "example": "forward(1)\nforward(3)",
                "explanation": (
                    "Le nombre indique le nombre de cases."
                ),
            },

            {
                "title": "Reculer",
                "text": (
                    "backward() fait reculer Pyt sans "
                    "changer la direction de son regard."
                ),
                "example": "backward(1)\nbackward(2)",
                "explanation": (
                    "Pyt recule du nombre de cases indiqué."
                ),
            },

            {
                "title": "Tourner",
                "text": (
                    "right() tourne vers la droite et "
                    "left() vers la gauche."
                ),
                "example": "right(90)\nleft(90)",
                "explanation": (
                    "90 degrés correspond à un quart de tour."
                ),
            },

            {
                "title": "Ordre des instructions",
                "text": (
                    "Python lit le programme de haut en bas."
                ),
                "example": (
                    "forward(3)\n"
                    "right(90)\n"
                    "forward(2)"
                ),
                "explanation": (
                    "Pyt effectue les actions dans cet ordre."
                ),
            },
        ],
    },

    # --------------------------------------------------------
    # CHAPITRE 2
    # --------------------------------------------------------

    2: {
        "chapter": 2,
        "title": "Variables et opérations",
        "subtitle": "Mémoriser et calculer",

        "introduction": (
            "Une variable permet de conserver une valeur "
            "dans le programme.\n\n"
            "On peut ensuite utiliser cette valeur dans "
            "des calculs ou pour déplacer Pyt."
        ),

        "sections": [
            {
                "title": "Créer une variable",
                "text": (
                    "Le signe = permet de donner une valeur "
                    "à une variable."
                ),
                "example": (
                    "distance = 4\n"
                    "forward(distance)"
                ),
                "explanation": (
                    "Ici, distance contient la valeur 4."
                ),
            },

            {
                "title": "Calculer",
                "text": (
                    "Les variables peuvent être utilisées "
                    "dans des opérations."
                ),
                "example": (
                    "a = 2\n"
                    "b = 3\n"
                    "distance = a + b\n"
                    "forward(distance)"
                ),
                "explanation": (
                    "+ additionne, - soustrait, "
                    "* multiplie et / divise."
                ),
            },

            {
                "title": "Modifier une variable",
                "text": (
                    "Une variable peut recevoir une "
                    "nouvelle valeur."
                ),
                "example": (
                    "x = 2\n"
                    "x = x + 3\n"
                    "forward(x)"
                ),
                "explanation": (
                    "À la fin, x vaut 5."
                ),
            },

            {
                "title": "Conversions simples",
                "text": (
                    "int(), float() et str() permettent "
                    "de convertir certaines valeurs."
                ),
                "example": (
                    "nombre = int(3.8)\n"
                    "forward(nombre)"
                ),
                "explanation": (
                    "int(3.8) donne ici le nombre entier 3."
                ),
            },
        ],
    },

    # --------------------------------------------------------
    # CHAPITRE 3
    # --------------------------------------------------------

    3: {
        "chapter": 3,
        "title": "Conditions",
        "subtitle": "Faire des choix",

        "introduction": (
            "Une condition permet au programme de choisir "
            "quoi faire selon une situation."
        ),

        "sections": [
            {
                "title": "if",
                "text": (
                    "if exécute du code seulement si "
                    "une condition est vraie."
                ),
                "example": (
                    "distance = 4\n\n"
                    "if distance == 4:\n"
                    "    forward(distance)"
                ),
                "explanation": (
                    "Attention à l'indentation après if."
                ),
            },

            {
                "title": "else",
                "text": (
                    "else permet de choisir une autre action "
                    "si la condition est fausse."
                ),
                "example": (
                    "x = 3\n\n"
                    "if x > 5:\n"
                    "    left(90)\n"
                    "else:\n"
                    "    right(90)"
                ),
                "explanation": (
                    "Une seule des deux parties est exécutée."
                ),
            },

            {
                "title": "elif",
                "text": (
                    "elif permet de tester plusieurs cas."
                ),
                "example": (
                    "x = 2\n\n"
                    "if x == 1:\n"
                    "    left(90)\n"
                    "elif x == 2:\n"
                    "    right(90)\n"
                    "else:\n"
                    "    forward(1)"
                ),
                "explanation": (
                    "Les conditions sont testées dans l'ordre."
                ),
            },

            {
                "title": "and, or et not",
                "text": (
                    "On peut combiner plusieurs conditions."
                ),
                "example": (
                    "x = 4\n\n"
                    "if x > 0 and x < 6:\n"
                    "    forward(x)"
                ),
                "explanation": (
                    "and exige les deux conditions. "
                    "or en exige au moins une. "
                    "not inverse une condition."
                ),
            },
        ],
    },

    # --------------------------------------------------------
    # CHAPITRE 4
    # --------------------------------------------------------

    4: {
        "chapter": 4,
        "title": "Boucles for",
        "subtitle": "Répéter des instructions",

        "introduction": (
            "Une boucle for permet de répéter une action "
            "un nombre connu de fois."
        ),

        "sections": [
            {
                "title": "for et range",
                "text": (
                    "range(n) permet de répéter une boucle "
                    "n fois."
                ),
                "example": (
                    "for i in range(4):\n"
                    "    forward(1)"
                ),
                "explanation": (
                    "forward(1) est exécuté quatre fois."
                ),
            },

            {
                "title": "La variable de boucle",
                "text": (
                    "La variable de boucle change à chaque tour."
                ),
                "example": (
                    "for i in range(3):\n"
                    "    print(i)"
                ),
                "explanation": (
                    "i prend successivement les valeurs "
                    "0, 1 et 2."
                ),
            },

            {
                "title": "Début, fin et pas",
                "text": (
                    "range() peut recevoir plusieurs valeurs."
                ),
                "example": (
                    "for i in range(1, 6, 2):\n"
                    "    print(i)"
                ),
                "explanation": (
                    "Cette boucle utilise 1, 3 puis 5."
                ),
            },
        ],
    },

    # --------------------------------------------------------
    # CHAPITRE 5
    # --------------------------------------------------------

    5: {
        "chapter": 5,
        "title": "Boucles while",
        "subtitle": "Répéter tant qu'une condition est vraie",

        "introduction": (
            "while répète du code tant qu'une condition "
            "reste vraie."
        ),

        "sections": [
            {
                "title": "while",
                "text": (
                    "La condition est vérifiée avant "
                    "chaque répétition."
                ),
                "example": (
                    "x = 0\n\n"
                    "while x < 4:\n"
                    "    forward(1)\n"
                    "    x = x + 1"
                ),
                "explanation": (
                    "La variable x évite que la boucle "
                    "continue pour toujours."
                ),
            },

            {
                "title": "while True",
                "text": (
                    "while True crée une boucle qui continue "
                    "jusqu'à ce qu'on l'arrête."
                ),
                "example": (
                    "x = 0\n\n"
                    "while True:\n"
                    "    x = x + 1\n"
                    "    if x == 3:\n"
                    "        break"
                ),
                "explanation": (
                    "Il faut prévoir une manière de sortir "
                    "de la boucle."
                ),
            },

            {
                "title": "break",
                "text": (
                    "break arrête immédiatement une boucle."
                ),
                "example": (
                    "x = 0\n\n"
                    "while True:\n"
                    "    forward(1)\n"
                    "    x = x + 1\n"
                    "    if x == 4:\n"
                    "        break"
                ),
                "explanation": (
                    "La boucle s'arrête lorsque x vaut 4."
                ),
            },
        ],
    },

    # --------------------------------------------------------
    # CHAPITRE 6
    # --------------------------------------------------------

    6: {
        "chapter": 6,
        "title": "Listes",
        "subtitle": "Conserver plusieurs valeurs",

        "introduction": (
            "Une liste permet de conserver plusieurs valeurs "
            "dans une seule variable."
        ),

        "sections": [
            {
                "title": "Créer une liste",
                "text": (
                    "Les éléments sont placés entre "
                    "crochets et séparés par des virgules."
                ),
                "example": (
                    "trajet = [2, 1, 3]"
                ),
                "explanation": (
                    "Cette liste contient trois nombres."
                ),
            },

            {
                "title": "Index et len",
                "text": (
                    "Un index permet d'accéder à un élément. "
                    "Le premier index est 0."
                ),
                "example": (
                    "trajet = [2, 1, 3]\n"
                    "forward(trajet[0])\n"
                    "print(len(trajet))"
                ),
                "explanation": (
                    "trajet[0] vaut 2 et len(trajet) vaut 3."
                ),
            },

            {
                "title": "append et appartenance",
                "text": (
                    "append ajoute une valeur. "
                    "in vérifie si une valeur est présente."
                ),
                "example": (
                    "trajet = [1, 2]\n"
                    "trajet.append(3)\n\n"
                    "if 3 in trajet:\n"
                    "    forward(3)"
                ),
                "explanation": (
                    "La liste devient [1, 2, 3]."
                ),
            },

            {
                "title": "Parcourir une liste",
                "text": (
                    "Une boucle for peut parcourir "
                    "directement les éléments."
                ),
                "example": (
                    "trajet = [2, 1, 2]\n\n"
                    "for distance in trajet:\n"
                    "    forward(distance)"
                ),
                "explanation": (
                    "distance reçoit chaque valeur de la liste."
                ),
            },
        ],
    },

    # --------------------------------------------------------
    # CHAPITRE 7
    # --------------------------------------------------------

    7: {
        "chapter": 7,
        "title": "Fonctions",
        "subtitle": "Créer ses propres outils",

        "introduction": (
            "Une fonction permet de regrouper plusieurs "
            "instructions sous un nom."
        ),

        "sections": [
            {
                "title": "def",
                "text": (
                    "def permet de créer une fonction."
                ),
                "example": (
                    "def avancer():\n"
                    "    forward(2)\n\n"
                    "avancer()"
                ),
                "explanation": (
                    "Le code de la fonction est exécuté "
                    "lorsqu'on l'appelle."
                ),
            },

            {
                "title": "Paramètres",
                "text": (
                    "Un paramètre permet de transmettre "
                    "une valeur à la fonction."
                ),
                "example": (
                    "def avancer(distance):\n"
                    "    forward(distance)\n\n"
                    "avancer(4)"
                ),
                "explanation": (
                    "distance reçoit ici la valeur 4."
                ),
            },

            {
                "title": "return",
                "text": (
                    "return permet à une fonction de "
                    "renvoyer une valeur."
                ),
                "example": (
                    "def double(nombre):\n"
                    "    return nombre * 2\n\n"
                    "distance = double(2)\n"
                    "forward(distance)"
                ),
                "explanation": (
                    "double(2) renvoie 4."
                ),
            },
        ],
    },

    # --------------------------------------------------------
    # CHAPITRE 8
    # --------------------------------------------------------

    8: {
        "chapter": 8,
        "title": "Combiner Python",
        "subtitle": "Utiliser plusieurs notions ensemble",

        "introduction": (
            "Tu connais maintenant les principales notions "
            "du jeu.\n\n"
            "Dans ce chapitre, tu vas les combiner pour "
            "écrire des programmes plus intelligents."
        ),

        "sections": [
            {
                "title": "Variables et boucles",
                "text": (
                    "Une variable peut contrôler le nombre "
                    "de répétitions."
                ),
                "example": (
                    "distance = 4\n\n"
                    "for i in range(distance):\n"
                    "    forward(1)"
                ),
                "explanation": (
                    "Plusieurs notions peuvent fonctionner "
                    "ensemble."
                ),
            },

            {
                "title": "Listes et fonctions",
                "text": (
                    "Une fonction peut traiter les valeurs "
                    "d'une liste."
                ),
                "example": (
                    "def avancer(trajet):\n"
                    "    for distance in trajet:\n"
                    "        forward(distance)\n\n"
                    "avancer([1, 2, 1])"
                ),
                "explanation": (
                    "On réutilise les notions précédentes."
                ),
            },

            {
                "title": "Choisir la bonne solution",
                "text": (
                    "Il existe souvent plusieurs programmes "
                    "capables de réussir une mission."
                ),
                "example": (
                    "distance = 3\n\n"
                    "if distance > 0:\n"
                    "    for i in range(distance):\n"
                    "        forward(1)"
                ),
                "explanation": (
                    "L'objectif est d'écrire du Python clair "
                    "et logique."
                ),
            },
        ],
    },

    # --------------------------------------------------------
    # CHAPITRE 9
    # --------------------------------------------------------

    9: {
        "chapter": 9,
        "title": "Mission finale",
        "subtitle": "Examen final de Pyt",

        "introduction": (
            "Bienvenue dans le dernier chapitre.\n\n"
            "Aucune nouvelle notion n'est ajoutée. "
            "Tu dois utiliser ce que tu as appris dans "
            "les chapitres précédents."
        ),

        "sections": [
            {
                "title": "Ton objectif",
                "text": (
                    "Observe la carte, réfléchis à ton "
                    "algorithme puis écris ton programme."
                ),
                "example": (
                    "# À toi de construire la solution."
                ),
                "explanation": (
                    "Variables, conditions, boucles, listes "
                    "et fonctions peuvent être combinées."
                ),
            },

            {
                "title": "Avant de lancer Pyt",
                "text": (
                    "Vérifie l'ordre des instructions, "
                    "les indentations et les valeurs."
                ),
                "example": (
                    "# Observer\n"
                    "# Réfléchir\n"
                    "# Programmer\n"
                    "# Tester"
                ),
                "explanation": (
                    "Une erreur fait partie du processus "
                    "d'apprentissage."
                ),
            },
        ],
    },
}


# ============================================================
# CHAPITRE 1 - DÉPLACEMENTS
# ============================================================

CHAPTER_1 = [

    make_level(
        1, 1, "Facile",
        "Ligne droite",
        "Amène Pyt jusqu'au cristal jaune.",
        7, 9,
        (3, 1),
        "east",
        (3, 6),
    ),

    make_level(
        1, 2, "Moyen",
        "Premier virage",
        "Amène Pyt jusqu'au cristal jaune.",
        8, 10,
        (2, 1),
        "east",
        (5, 7),

        walls=[
            (3, 1),
            (3, 2),
            (3, 3),
            (3, 4),
            (3, 5),
            (3, 6),

            (4, 6),
            (5, 6),
            (6, 6),
        ],
    ),

    make_level(
        1, 3, "Difficile",
        "Les trois virages",
        "Trouve le chemin jusqu'au cristal.",
        9, 11,
        (1, 1),
        "east",
        (7, 9),

        walls=[
            (2, 2),
            (2, 3),
            (2, 4),

            (2, 6),
            (2, 7),
            (2, 8),

            (3, 4),
            (3, 6),

            (4, 2),
            (4, 3),
            (4, 4),

            (4, 6),
            (4, 7),
            (4, 8),

            (5, 2),
            (5, 8),

            (6, 2),

            (6, 4),
            (6, 5),
            (6, 6),

            (6, 8),
        ],
    ),
]


# ============================================================
# CHAPITRE 2 - VARIABLES
# ============================================================

CHAPTER_2 = [

    make_level(
        2, 1, "Facile",
        "Distance mémorisée",
        (
            "Utilise une variable pour amener Pyt "
            "jusqu'au cristal."
        ),
        7, 10,
        (3, 1),
        "east",
        (3, 7),
    ),

    make_level(
        2, 2, "Moyen",
        "Calcul de trajet",
        (
            "Calcule les distances avec des variables "
            "et rejoins le cristal."
        ),
        9, 10,
        (2, 1),
        "east",
        (6, 7),

        walls=[
            (3, 1),
            (3, 2),
            (3, 3),
            (3, 4),
            (3, 5),
            (3, 6),
        ],
    ),

    make_level(
        2, 3, "Difficile",
        "Coordonnées secrètes",
        (
            "Utilise plusieurs variables et opérations "
            "pour atteindre le cristal."
        ),
        10, 12,
        (1, 1),
        "east",
        (8, 10),

        walls=[
            (2, 3),
            (3, 3),
            (4, 3),
            (5, 3),

            (5, 4),
            (5, 5),
            (5, 6),
            (5, 7),
            (5, 8),

            (2, 8),
            (3, 8),
            (4, 8),
        ],
    ),
]


# ============================================================
# CHAPITRE 3 - CONDITIONS
# ============================================================

CHAPTER_3 = [

    make_level(
        3, 1, "Facile",
        "Le bon choix",
        (
            "Utilise une condition pour choisir "
            "le déplacement de Pyt."
        ),
        7, 9,
        (3, 1),
        "east",
        (3, 6),
    ),

    make_level(
        3, 2, "Moyen",
        "Gauche ou droite ?",
        (
            "Utilise if et else pour choisir "
            "le bon chemin."
        ),
        9, 10,
        (4, 1),
        "east",
        (2, 8),

        walls=[
            (3, 4),
            (4, 4),
            (5, 4),

            (5, 5),
            (5, 6),
            (5, 7),
        ],
    ),

    make_level(
        3, 3, "Difficile",
        "Trois décisions",
        (
            "Utilise plusieurs conditions pour "
            "atteindre le cristal."
        ),
        10, 12,
        (8, 1),
        "east",
        (1, 10),

        walls=[
            (7, 3),
            (6, 3),
            (5, 3),

            (5, 4),
            (5, 5),
            (5, 6),

            (4, 6),
            (3, 6),

            (3, 7),
            (3, 8),
            (3, 9),
        ],
    ),
]


# ============================================================
# CHAPITRE 4 - FOR
# ============================================================

CHAPTER_4 = [

    make_level(
        4, 1, "Facile",
        "Répéter pour avancer",
        (
            "Utilise une boucle for pour atteindre "
            "le cristal."
        ),
        7, 10,
        (3, 1),
        "east",
        (3, 8),
    ),

    make_level(
        4, 2, "Moyen",
        "Le carré",
        (
            "Utilise une boucle for pour répéter "
            "une suite de déplacements."
        ),
        9, 10,
        (2, 2),
        "east",
        (6, 7),

        walls=[
            (3, 4),
            (4, 4),
            (5, 4),
        ],
    ),

    make_level(
        4, 3, "Difficile",
        "Escalier",
        (
            "Utilise une boucle for et plusieurs "
            "instructions pour parcourir la carte."
        ),
        11, 12,
        (9, 1),
        "east",
        (1, 10),

        walls=[
            (8, 3),
            (7, 3),

            (6, 5),
            (5, 5),

            (4, 7),
            (3, 7),

            (2, 9),
        ],
    ),
]


# ============================================================
# CHAPITRE 5 - WHILE
# ============================================================

CHAPTER_5 = [

    make_level(
        5, 1, "Facile",
        "Compteur while",
        (
            "Utilise une boucle while pour faire "
            "avancer Pyt jusqu'au cristal."
        ),
        7, 10,
        (3, 1),
        "east",
        (3, 7),
    ),

    make_level(
        5, 2, "Moyen",
        "Deux compteurs",
        (
            "Utilise while pour gérer les différentes "
            "parties du trajet."
        ),
        9, 11,
        (2, 1),
        "east",
        (7, 8),

        walls=[
            (3, 2),
            (3, 3),
            (3, 4),
            (3, 5),
            (3, 6),

            (4, 6),
            (5, 6),
            (6, 6),
        ],
    ),

    make_level(
        5, 3, "Difficile",
        "Sortir de la boucle",
        (
            "Utilise while et break pour construire "
            "le trajet jusqu'au cristal."
        ),
        10, 12,
        (8, 1),
        "east",
        (1, 10),

        walls=[
            (7, 4),
            (6, 4),
            (5, 4),

            (5, 5),
            (5, 6),
            (5, 7),

            (4, 7),
            (3, 7),
            (2, 7),
        ],
    ),
]


# ============================================================
# CHAPITRE 6 - LISTES
# ============================================================

CHAPTER_6 = [

    make_level(
        6, 1, "Facile",
        "Liste de distances",
        (
            "Crée une liste de distances et utilise-la "
            "pour déplacer Pyt."
        ),
        8, 10,
        (2, 1),
        "east",
        (6, 7),

        walls=[
            (3, 1),
            (3, 2),
            (3, 3),
            (3, 4),
            (3, 5),
        ],
    ),

    make_level(
        6, 2, "Moyen",
        "Parcourir la liste",
        (
            "Parcours une liste avec une boucle for "
            "pour réaliser le trajet."
        ),
        10, 11,
        (8, 1),
        "east",
        (2, 9),

        walls=[
            (7, 3),
            (6, 3),

            (5, 5),
            (4, 5),

            (3, 7),
            (2, 7),
        ],
    ),

    make_level(
        6, 3, "Difficile",
        "Programme de navigation",
        (
            "Utilise une liste, ses valeurs et une boucle "
            "pour atteindre le cristal."
        ),
        11, 13,
        (9, 1),
        "east",
        (1, 11),

        walls=[
            (8, 3),
            (7, 3),
            (6, 3),

            (6, 4),
            (6, 5),

            (5, 7),
            (4, 7),
            (3, 7),

            (3, 8),
            (3, 9),
        ],
    ),
]


# ============================================================
# CHAPITRE 7 - FONCTIONS
# ============================================================

CHAPTER_7 = [

    make_level(
        7, 1, "Facile",
        "Ma première fonction",
        (
            "Crée une fonction puis appelle-la pour "
            "amener Pyt au cristal."
        ),
        7, 10,
        (3, 1),
        "east",
        (3, 7),
    ),

    make_level(
        7, 2, "Moyen",
        "Fonction avec paramètre",
        (
            "Crée une fonction avec un paramètre "
            "pour gérer les distances."
        ),
        9, 11,
        (2, 1),
        "east",
        (7, 8),

        walls=[
            (3, 1),
            (3, 2),
            (3, 3),
            (3, 4),
            (3, 5),
            (3, 6),
        ],
    ),

    make_level(
        7, 3, "Difficile",
        "Fonction de navigation",
        (
            "Crée et réutilise une fonction pour "
            "parcourir le trajet."
        ),
        11, 13,
        (9, 1),
        "east",
        (1, 11),

        walls=[
            (8, 4),
            (7, 4),
            (6, 4),

            (6, 5),
            (6, 6),
            (6, 7),

            (5, 8),
            (4, 8),
            (3, 8),

            (3, 9),
            (3, 10),
        ],
    ),
]


# ============================================================
# CHAPITRE 8 - COMBINAISON
# ============================================================

CHAPTER_8 = [

    make_level(
        8, 1, "Facile",
        "Programme complet",
        (
            "Combine plusieurs notions déjà apprises "
            "pour atteindre le cristal."
        ),
        9, 11,
        (7, 1),
        "east",
        (2, 9),

        walls=[
            (6, 3),
            (5, 3),

            (4, 5),
            (3, 5),

            (3, 7),
            (2, 7),
        ],
    ),

    make_level(
        8, 2, "Moyen",
        "Le long trajet",
        (
            "Combine variables, boucles et fonctions "
            "pour programmer le trajet."
        ),
        11, 13,
        (9, 1),
        "east",
        (1, 11),

        walls=[
            (8, 3),
            (7, 3),

            (6, 5),
            (5, 5),

            (4, 7),
            (3, 7),

            (2, 9),
            (2, 10),
        ],
    ),

    make_level(
        8, 3, "Difficile",
        "Le grand labyrinthe",
        (
            "Utilise librement les notions précédentes "
            "pour rejoindre le cristal."
        ),
        12, 14,
        (10, 1),
        "east",
        (1, 12),

        walls=[
            (9, 3),
            (8, 3),
            (7, 3),

            (7, 4),
            (7, 5),

            (6, 7),
            (5, 7),
            (4, 7),

            (4, 8),
            (4, 9),

            (3, 11),
            (2, 11),
        ],
    ),
]


# ============================================================
# CHAPITRE 9 - EXAMEN FINAL
# ============================================================

CHAPTER_9 = [

    make_level(
        9, 1, "Facile",
        "Mission finale I",
        (
            "Utilise les notions apprises pour atteindre "
            "le premier cristal de l'examen final."
        ),
        10, 12,
        (8, 1),
        "east",
        (1, 10),

        walls=[
            (7, 3),
            (6, 3),

            (5, 5),
            (4, 5),

            (3, 7),
            (2, 7),
        ],
    ),

    make_level(
        9, 2, "Moyen",
        "Mission finale II",
        (
            "Construis un programme clair et efficace "
            "pour traverser cette carte."
        ),
        12, 14,
        (10, 1),
        "east",
        (1, 12),

        walls=[
            (9, 4),
            (8, 4),
            (7, 4),

            (7, 5),
            (7, 6),

            (6, 8),
            (5, 8),
            (4, 8),

            (4, 9),
            (4, 10),

            (3, 11),
            (2, 11),
        ],
    ),

    make_level(
        9, 3, "Difficile",
        "Épreuve finale de Pyt",
        (
            "Dernière mission. Utilise tout ce que "
            "tu as appris pour atteindre le cristal."
        ),
        13, 15,
        (11, 1),
        "east",
        (1, 13),

        walls=[
            (10, 3),
            (9, 3),
            (8, 3),

            (8, 4),
            (8, 5),

            (7, 7),
            (6, 7),
            (5, 7),

            (5, 8),
            (5, 9),

            (4, 11),
            (3, 11),
            (2, 11),

            (9, 10),
            (9, 11),
            (9, 12),

            (7, 12),
            (6, 12),
        ],
    ),
]


# ============================================================
# TOUS LES CHAPITRES
# ============================================================

CHAPTERS = {
    1: CHAPTER_1,
    2: CHAPTER_2,
    3: CHAPTER_3,
    4: CHAPTER_4,
    5: CHAPTER_5,
    6: CHAPTER_6,
    7: CHAPTER_7,
    8: CHAPTER_8,
    9: CHAPTER_9,
}


# ============================================================
# COURS
# ============================================================

def get_course(chapter):
    """Retourne le cours d'un chapitre."""

    if chapter not in COURSES:
        raise ValueError(
            f"Le chapitre {chapter} n'existe pas."
        )

    return COURSES[chapter]


# ============================================================
# NIVEAU
# ============================================================

def get_level(chapter, exercise):
    """Retourne un exercice précis."""

    if chapter not in CHAPTERS:
        raise ValueError(
            f"Le chapitre {chapter} n'existe pas."
        )

    for level in CHAPTERS[chapter]:

        if level["exercise"] == exercise:
            return level

    raise ValueError(
        f"L'exercice {exercise} du chapitre "
        f"{chapter} n'existe pas."
    )


# ============================================================
# CHAPITRE
# ============================================================

def get_chapter(chapter):
    """Retourne les trois exercices d'un chapitre."""

    if chapter not in CHAPTERS:
        raise ValueError(
            f"Le chapitre {chapter} n'existe pas."
        )

    return CHAPTERS[chapter]


# ============================================================
# NOMBRE DE CHAPITRES
# ============================================================

def get_number_of_chapters():
    return len(CHAPTERS)


# ============================================================
# NOMBRE D'EXERCICES
# ============================================================

def get_number_of_levels(chapter):
    return len(
        get_chapter(chapter)
    )


# ============================================================
# EXISTENCE D'UN NIVEAU
# ============================================================

def level_exists(chapter, exercise):

    if chapter not in CHAPTERS:
        return False

    for level in CHAPTERS[chapter]:

        if level["exercise"] == exercise:
            return True

    return False


# ============================================================
# NIVEAU SUIVANT
# ============================================================

def get_next_level(chapter, exercise):
    """
    Retourne l'exercice suivant.

    Après l'exercice 3, retourne l'exercice 1
    du chapitre suivant.

    Retourne None après le chapitre 9 exercice 3.
    """

    if not level_exists(
        chapter,
        exercise
    ):
        return None

    if exercise < 3:

        return get_level(
            chapter,
            exercise + 1
        )

    next_chapter = chapter + 1

    if next_chapter in CHAPTERS:

        return get_level(
            next_chapter,
            1
        )

    return None


# ============================================================
# NIVEAU PRÉCÉDENT
# ============================================================

def get_previous_level(chapter, exercise):

    if not level_exists(
        chapter,
        exercise
    ):
        return None

    if exercise > 1:

        return get_level(
            chapter,
            exercise - 1
        )

    previous_chapter = chapter - 1

    if previous_chapter in CHAPTERS:

        return get_level(
            previous_chapter,
            3
        )

    return None


# ============================================================
# INFORMATIONS POUR LA CARTE
# ============================================================

def get_chapter_map_data(chapter):
    """
    Retourne les informations nécessaires
    pour afficher les trois cercles d'un chapitre.
    """

    levels = get_chapter(
        chapter
    )

    result = []

    for level in levels:

        result.append(
            {
                "chapter": level["chapter"],
                "exercise": level["exercise"],
                "difficulty": level["difficulty"],
                "title": level["title"],
            }
        )

    return result


# ============================================================
# TEST LOCAL DU FICHIER
# ============================================================

if __name__ == "__main__":

    print(
        "Nombre de chapitres :",
        get_number_of_chapters()
    )

    total = 0

    for chapter_number in CHAPTERS:

        number = get_number_of_levels(
            chapter_number
        )

        total += number

        print(
            f"Chapitre {chapter_number} : "
            f"{number} exercices"
        )

    print(
        "Nombre total d'exercices :",
        total
    )