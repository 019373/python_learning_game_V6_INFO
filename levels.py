"""
levels.py
Jeu éducatif Python - Pyt

Ce fichier contient les niveaux du jeu.

IMPORTANT :
- Les niveaux sont créés à l'avance.
- Ils ne sont pas générés aléatoirement.
- Chaque chapitre contient 3 exercices :
    1. Facile
    2. Moyen
    3. Difficile
- Tous les niveaux utilisent le même format.
"""


# ============================================================
# CHAPITRE 1
# DÉPLACEMENTS DE BASE / TURTLE
# ============================================================

CHAPTER_1 = [
    # --------------------------------------------------------
    # EXERCICE 1 - FACILE
    # --------------------------------------------------------
    {
        "chapter": 1,
        "exercise": 1,
        "difficulty": "Facile",

        "title": "Premier déplacement",

        "instruction": (
            "Aide Pyt à atteindre le cristal jaune.\n\n"
            "Utilise forward() pour faire avancer Pyt."
        ),

        "python_concept": [
            "forward"
        ],

        # Taille logique de la carte
        "rows": 7,
        "cols": 9,

        # Position de départ : (ligne, colonne)
        "start": (3, 1),

        # Pyt regarde vers la droite
        "start_direction": "east",

        # Destination
        "goal": (3, 6),

        # Murs
        "walls": [
            (0, 0),
            (0, 1),
            (0, 2),
            (0, 3),
            (0, 4),
            (0, 5),
            (0, 6),
            (0, 7),
            (0, 8),

            (6, 0),
            (6, 1),
            (6, 2),
            (6, 3),
            (6, 4),
            (6, 5),
            (6, 6),
            (6, 7),
            (6, 8),

            (1, 0),
            (2, 0),
            (3, 0),
            (4, 0),
            (5, 0),

            (1, 8),
            (2, 8),
            (3, 8),
            (4, 8),
            (5, 8),
        ],

        # Éléments interactifs
        "objects": [],
        "deposits": [],
        "buttons": [],
        "doors": [],
        "dirt": [],
        "boxes": [],
        "chargers": [],

        # Condition de réussite utilisée par game.py
        "objective": "reach_goal",
    },

    # --------------------------------------------------------
    # EXERCICE 2 - MOYEN
    # --------------------------------------------------------
    {
        "chapter": 1,
        "exercise": 2,
        "difficulty": "Moyen",

        "title": "Premier virage",

        "instruction": (
            "Le chemin n'est plus tout droit !\n\n"
            "Fais avancer Pyt puis utilise right(90) "
            "pour tourner à droite et atteindre le cristal."
        ),

        "python_concept": [
            "forward",
            "right"
        ],

        "rows": 7,
        "cols": 9,

        "start": (2, 1),

        "start_direction": "east",

        "goal": (5, 6),

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

            # Obstacles
            (3, 2),
            (3, 3),
            (3, 4),
            (3, 5),

            (4, 2),
            (4, 3),
            (4, 4),
            (4, 5),
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

    # --------------------------------------------------------
    # EXERCICE 3 - DIFFICILE
    # --------------------------------------------------------
    {
        "chapter": 1,
        "exercise": 3,
        "difficulty": "Difficile",

        "title": "Le petit labyrinthe",

        "instruction": (
            "Guide Pyt jusqu'au cristal en évitant les murs.\n\n"
            "Tu peux utiliser :\n"
            "forward()\n"
            "backward()\n"
            "left()\n"
            "right()"
        ),

        "python_concept": [
            "forward",
            "backward",
            "left",
            "right"
        ],

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

            # Labyrinthe intérieur
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
# TOUS LES CHAPITRES
# ============================================================

CHAPTERS = {
    1: CHAPTER_1,
}


# ============================================================
# FONCTIONS D'ACCÈS AUX NIVEAUX
# ============================================================

def get_level(chapter, exercise):
    """
    Retourne un niveau précis.

    Exemple :
        get_level(1, 1)

    retourne l'exercice facile du chapitre 1.
    """

    if chapter not in CHAPTERS:
        raise ValueError(
            f"Le chapitre {chapter} n'existe pas."
        )

    levels = CHAPTERS[chapter]

    for level in levels:
        if level["exercise"] == exercise:
            return level

    raise ValueError(
        f"L'exercice {exercise} du chapitre "
        f"{chapter} n'existe pas."
    )


def get_chapter(chapter):
    """
    Retourne tous les exercices d'un chapitre.
    """

    if chapter not in CHAPTERS:
        raise ValueError(
            f"Le chapitre {chapter} n'existe pas."
        )

    return CHAPTERS[chapter]


def get_number_of_chapters():
    """
    Retourne le nombre de chapitres actuellement créés.
    """

    return len(CHAPTERS)


def get_number_of_levels(chapter):
    """
    Retourne le nombre d'exercices d'un chapitre.
    """

    return len(get_chapter(chapter))


def get_next_level(chapter, exercise):
    """
    Retourne le prochain niveau.

    Si l'exercice actuel est le dernier du chapitre,
    la fonction essaie de passer au chapitre suivant.

    Retourne None s'il n'y a pas encore de niveau suivant.
    """

    levels = get_chapter(chapter)

    current_index = None

    for index, level in enumerate(levels):
        if level["exercise"] == exercise:
            current_index = index
            break

    if current_index is None:
        return None

    # Exercice suivant dans le même chapitre
    next_index = current_index + 1

    if next_index < len(levels):
        return levels[next_index]

    # Chapitre suivant
    next_chapter = chapter + 1

    if next_chapter in CHAPTERS:
        next_levels = CHAPTERS[next_chapter]

        if len(next_levels) > 0:
            return next_levels[0]

    return None


def level_exists(chapter, exercise):
    """
    Vérifie simplement si un niveau existe.
    """

    if chapter not in CHAPTERS:
        return False

    for level in CHAPTERS[chapter]:
        if level["exercise"] == exercise:
            return True

    return False


# ============================================================
# PETIT TEST DU FICHIER
# ============================================================

if __name__ == "__main__":
    print("Test de levels.py")
    print("-----------------")

    print(
        "Nombre de chapitres :",
        get_number_of_chapters()
    )

    print(
        "Nombre de niveaux dans le chapitre 1 :",
        get_number_of_levels(1)
    )

    level = get_level(1, 1)

    print()
    print("Premier niveau :")
    print("Titre :", level["title"])
    print("Difficulté :", level["difficulty"])
    print("Départ :", level["start"])
    print("Objectif :", level["goal"])