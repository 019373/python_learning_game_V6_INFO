"""
main.py
Jeu éducatif Python - Pyt

Point de départ du programme.

Ce fichier :
- crée la fenêtre principale
- charge le premier niveau
- crée Pyt
- crée le moteur du jeu
- crée l'interface
- lance Tkinter

La logique du jeu reste dans les autres fichiers.
"""

import tkinter as tk

from game import Game
from robot import Robot
from levels import get_level
from ui import GameUI


# ============================================================
# CONFIGURATION
# ============================================================

WINDOW_TITLE = "Pyt - Apprendre Python"

START_CHAPTER = 1
START_EXERCISE = 1


# ============================================================
# LANCEMENT DU JEU
# ============================================================

def main():
    """
    Crée et lance le jeu.
    """

    # --------------------------------------------------------
    # FENÊTRE PRINCIPALE
    # --------------------------------------------------------

    root = tk.Tk()

    root.title(WINDOW_TITLE)

    # Taille de départ.
    # La fenêtre reste redimensionnable.
    root.geometry("1200x750")

    root.minsize(900, 600)

    # --------------------------------------------------------
    # CHARGEMENT DU PREMIER NIVEAU
    # --------------------------------------------------------

    level = get_level(
        START_CHAPTER,
        START_EXERCISE
    )

    # --------------------------------------------------------
    # CRÉATION DE PYT
    # --------------------------------------------------------

    robot = Robot()

    # --------------------------------------------------------
    # CRÉATION DU MOTEUR
    # --------------------------------------------------------

    game = Game(
        level,
        robot
    )

    # --------------------------------------------------------
    # CRÉATION DE L'INTERFACE
    # --------------------------------------------------------

    interface = GameUI(
        root=root,
        game=game,
        level=level
    )

    # On garde la référence.
    # Cela évite que l'objet interface soit supprimé.
    root.game_interface = interface

    # --------------------------------------------------------
    # LANCEMENT DE TKINTER
    # --------------------------------------------------------

    root.mainloop()


# ============================================================
# POINT D'ENTRÉE
# ============================================================

if __name__ == "__main__":
    main()