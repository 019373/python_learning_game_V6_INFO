"""
levels.py
Jeu éducatif Python - Pyt

Ce fichier contient :
- les cours des chapitres
- les exercices
- les cartes
- les objectifs
- la progression entre les exercices

IMPORTANT :
Le cours explique les notions.
Les exercices servent uniquement à s'entraîner.
"""


# ============================================================
# COURS DU CHAPITRE 1
# ============================================================

CHAPTER_1_COURSE = {
    "chapter": 1,

    "title": "Déplacer Pyt",

    "subtitle": "Les déplacements de base",

    "introduction": (
        "Dans ce chapitre, tu vas apprendre à déplacer Pyt "
        "sur une grille avec des instructions Python.\n\n"
        "Pyt regarde toujours dans une direction. "
        "Il peut avancer, reculer et tourner."
    ),

    "sections": [
        {
            "title": "1. Avancer",

            "text": (
                "La fonction forward() permet de faire "
                "avancer Pyt dans la direction qu'il regarde."
            ),

            "example": (
                "forward(1)\n"
                "forward(3)"
            ),

            "explanation": (
                "Le nombre entre parenthèses indique "
                "le nombre de cases à parcourir."
            ),
        },

        {
            "title": "2. Reculer",

            "text": (
                "La fonction backward() permet de faire "
                "reculer Pyt sans changer sa direction."
            ),

            "example": (
                "backward(1)\n"
                "backward(2)"
            ),

            "explanation": (
                "Pyt recule du nombre de cases indiqué "
                "entre parenthèses."
            ),
        },

        {
            "title": "3. Tourner à droite",

            "text": (
                "La fonction right() permet à Pyt de "
                "tourner vers la droite."
            ),

            "example": (
                "right(90)"
            ),

            "explanation": (
                "Dans nos exercices, 90 degrés correspond "
                "à un quart de tour."
            ),
        },

        {
            "title": "4. Tourner à gauche",

            "text": (
                "La fonction left() permet à Pyt de "
                "tourner vers la gauche."
            ),

            "example": (
                "left(90)"
            ),

            "explanation": (
                "Comme avec right(), 90 degrés correspond "
                "à un quart de tour."
            ),
        },

        {
            "title": "5. Plusieurs instructions",

            "text": (
                "Python exécute les instructions dans "
                "l'ordre, de haut en bas."
            ),

            "example": (
                "forward(3)\n"
                "right(90)\n"
                "forward(2)"
            ),

            "explanation": (
                "Ici, Pyt avance de 3 cases, tourne à droite, "
                "puis avance encore de 2 cases."
            ),
        },
    ],
}


# ============================================================
# CHAPITRE 1 - EXERCICES
# ============================================================

CHAPTER_1 = [

    # ========================================================
    # EXERCICE 1 - FACILE
    # ========================================================

    {
        "chapter": 1,
        "exercise": 1,

        "difficulty": "Facile",

        "title": "Ligne droite",

        "instruction": (
            "Amène Pyt jusqu'au cristal jaune."
        ),

        "rows": 7,
        "cols": 9,

        "start": (3, 1),

        "start_direction": "east",

        "goal": (3, 6),

        "walls": [
            # Bord supérieur
            (0, 0),
            (0, 1),
            (0, 2),
            (0, 3),
            (0, 4),
            (0, 5),
            (0, 6),
            (0, 7),
            (0, 8),

            # Bord inférieur
            (6, 0),
            (6, 1),
            (6, 2),
            (6, 3),
            (6, 4),
            (6, 5),
            (6, 6),
            (6, 7),
            (6, 8),

            # Bord gauche
            (1, 0),
            (2, 0),
            (3, 0),
            (4, 0),
            (5, 0),

            # Bord droit
            (1, 8),
            (2, 8),
            (3, 8),
            (4, 8),
            (5, 8),
        ],

        "objects": [],
        "deposits": [],
        "buttons": [],
        "doors": [],
        "dirt": [],
        "boxes": [],
        "chargers": [],

        "objective": "reach_goal",
    },

    # ========================================================
    # EXERCICE 2 - MOYEN
    # ========================================================

    {
        "chapter": 1,
        "exercise": 2,

        "difficulty": "Moyen",

        "title": "Premier virage",

        "instruction": (
            "Amène Pyt jusqu'au cristal jaune "
            "en suivant le chemin."
        ),

        "rows": 8,
        "cols": 10,

        "start": (2, 1),

        "start_direction": "east",

        "goal": (5, 7),

        "walls": [
            # Bord supérieur
            (0, 0),
            (0, 1),
            (0, 2),
            (0, 3),
            (0, 4),
            (0, 5),
            (0, 6),
            (0, 7),
            (0, 8),
            (0, 9),

            # Bord inférieur
            (7, 0),
            (7, 1),
            (7, 2),
            (7, 3),
            (7, 4),
            (7, 5),
            (7, 6),
            (7, 7),
            (7, 8),
            (7, 9),

            # Bord gauche
            (1, 0),
            (2, 0),
            (3, 0),
            (4, 0),
            (5, 0),
            (6, 0),

            # Bord droit
            (1, 9),
            (2, 9),
            (3, 9),
            (4, 9),
            (5, 9),
            (6, 9),

            # Mur horizontal
            (3, 1),
            (3, 2),
            (3, 3),
            (3, 4),
            (3, 5),
            (3, 6),

            # Mur vertical
            (4, 6),
            (5, 6),
            (6, 6),
        ],

        "objects": [],
        "deposits": [],
        "buttons": [],
        "doors": [],
        "dirt": [],
        "boxes": [],
        "chargers": [],

        "objective": "reach_goal",
    },

    # ========================================================
    # EXERCICE 3 - DIFFICILE
    # ========================================================

    {
        "chapter": 1,
        "exercise": 3,

        "difficulty": "Difficile",

        "title": "Le labyrinthe",

        "instruction": (
            "Trouve le chemin et amène Pyt "
            "jusqu'au cristal jaune."
        ),

        "rows": 9,
        "cols": 11,

        "start": (1, 1),

        "start_direction": "east",

        "goal": (7, 9),

        "walls": [
            # Bord supérieur
            (0, 0),
            (0, 1),
            (0, 2),
            (0, 3),
            (0, 4),
            (0, 5),
            (0, 6),
            (0, 7),
            (0, 8),
            (0, 9),
            (0, 10),

            # Bord inférieur
            (8, 0),
            (8, 1),
            (8, 2),
            (8, 3),
            (8, 4),
            (8, 5),
            (8, 6),
            (8, 7),
            (8, 8),
            (8, 9),
            (8, 10),

            # Bord gauche
            (1, 0),
            (2, 0),
            (3, 0),
            (4, 0),
            (5, 0),
            (6, 0),
            (7, 0),

            # Bord droit
            (1, 10),
            (2, 10),
            (3, 10),
            (4, 10),
            (5, 10),
            (6, 10),
            (7, 10),

            # Obstacles intérieurs
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

        "objects": [],
        "deposits": [],
        "buttons": [],
        "doors": [],
        "dirt": [],
        "boxes": [],
        "chargers": [],

        "objective": "reach_goal",
    },
]


# ============================================================
# CHAPITRES
# ============================================================

CHAPTERS = {
    1: CHAPTER_1,
}


COURSES = {
    1: CHAPTER_1_COURSE,
}


# ============================================================
# RÉCUPÉRER UN COURS
# ============================================================

def get_course(chapter):
    """
    Retourne le cours complet d'un chapitre.
    """

    if chapter not in COURSES:
        raise ValueError(
            f"Le cours du chapitre {chapter} "
            f"n'existe pas."
        )

    return COURSES[chapter]


# ============================================================
# RÉCUPÉRER UN NIVEAU
# ============================================================

def get_level(chapter, exercise):
    """
    Retourne un exercice précis.

    Exemple :
        get_level(1, 2)
    """

    if chapter not in CHAPTERS:
        raise ValueError(
            f"Le chapitre {chapter} "
            f"n'existe pas."
        )

    for level in CHAPTERS[chapter]:

        if (
            level["exercise"]
            == exercise
        ):
            return level

    raise ValueError(
        f"L'exercice {exercise} "
        f"du chapitre {chapter} "
        f"n'existe pas."
    )


# ============================================================
# RÉCUPÉRER UN CHAPITRE
# ============================================================

def get_chapter(chapter):
    """
    Retourne les exercices d'un chapitre.
    """

    if chapter not in CHAPTERS:
        raise ValueError(
            f"Le chapitre {chapter} "
            f"n'existe pas."
        )

    return CHAPTERS[chapter]


# ============================================================
# NOMBRE DE CHAPITRES
# ============================================================

def get_number_of_chapters():
    """
    Retourne le nombre de chapitres créés.
    """

    return len(
        CHAPTERS
    )


# ============================================================
# NOMBRE D'EXERCICES
# ============================================================

def get_number_of_levels(chapter):
    """
    Retourne le nombre d'exercices du chapitre.
    """

    return len(
        get_chapter(chapter)
    )


# ============================================================
# NIVEAU SUIVANT
# ============================================================

def get_next_level(
    chapter,
    exercise
):
    """
    Retourne l'exercice suivant.

    Retourne None si aucun exercice suivant
    n'est disponible.
    """

    levels = get_chapter(
        chapter
    )

    for index, level in enumerate(
        levels
    ):

        if (
            level["exercise"]
            == exercise
        ):

            next_index = (
                index + 1
            )

            if (
                next_index
                < len(levels)
            ):
                return levels[
                    next_index
                ]

            break

    next_chapter = (
        chapter + 1
    )

    if next_chapter in CHAPTERS:

        next_levels = CHAPTERS[
            next_chapter
        ]

        if next_levels:
            return next_levels[0]

    return None


# ============================================================
# VÉRIFIER UN NIVEAU
# ============================================================

def level_exists(
    chapter,
    exercise
):
    """
    Vérifie si un exercice existe.
    """

    if chapter not in CHAPTERS:
        return False

    for level in CHAPTERS[
        chapter
    ]:

        if (
            level["exercise"]
            == exercise
        ):
            return True

    return False