"""
ui.py
Jeu éducatif Python - Pyt

Interface graphique du jeu.

Technologies :
- Tkinter
- Canvas

Ce fichier gère uniquement l'affichage et les interactions
avec l'utilisateur.

La logique du jeu reste dans game.py.
"""

import tkinter as tk
from tkinter import messagebox

from runner import Runner
from levels import get_next_level


# ============================================================
# COULEURS
# ============================================================

BACKGROUND = "#151126"
PANEL = "#211943"
PANEL_LIGHT = "#302653"

GRID_DARK = "#352c59"
GRID_LIGHT = "#40356a"

BLACK = "#090812"
WHITE = "#f4f1f6"
MUTED = "#b9b1ca"

PINK = "#dc4d9b"
CYAN = "#42d6d1"
YELLOW = "#f4d75e"
ORANGE = "#ee9147"

WALL_COLOR = "#765081"
DOOR_COLOR = "#b84f72"
DIRT_COLOR = "#80573f"
BOX_COLOR = "#d28443"
BUTTON_COLOR = "#49a8bd"
CHARGER_COLOR = "#55d69a"


class GameUI:
    """Interface principale du jeu Pyt."""

    def __init__(
        self,
        root,
        game,
        level
    ):
        self.root = root
        self.game = game
        self.level = level

        self.runner = Runner(
            self.game
        )

        self.code_window = None
        self.code_text = None

        self.console_text = None

        self.canvas = None

        self.status_label = None
        self.chapter_label = None
        self.difficulty_label = None
        self.title_label = None
        self.instruction_label = None
        self.concept_label = None
        self.next_button = None

        self.cell_size = 50
        self.grid_x = 0
        self.grid_y = 0

        self.configure_root()
        self.create_interface()

        self.root.after(
            50,
            self.draw_world
        )

    # ========================================================
    # FENÊTRE PRINCIPALE
    # ========================================================

    def configure_root(self):
        """Configure la fenêtre principale."""

        self.root.configure(
            bg=BACKGROUND
        )

        self.root.protocol(
            "WM_DELETE_WINDOW",
            self.close_game
        )

    # ========================================================
    # CONSTRUCTION DE L'INTERFACE
    # ========================================================

    def create_interface(self):
        """Construit toute l'interface principale."""

        self.create_top_bar()

        self.main_frame = tk.Frame(
            self.root,
            bg=BACKGROUND
        )

        self.main_frame.pack(
            fill="both",
            expand=True,
            padx=14,
            pady=14
        )

        self.main_frame.grid_rowconfigure(
            0,
            weight=1
        )

        self.main_frame.grid_columnconfigure(
            0,
            weight=3
        )

        self.main_frame.grid_columnconfigure(
            1,
            weight=2
        )

        self.create_game_area()
        self.create_mission_panel()

        self.refresh_level_information()

    # ========================================================
    # BARRE SUPÉRIEURE
    # ========================================================

    def create_top_bar(self):
        """Crée la barre supérieure."""

        top_bar = tk.Frame(
            self.root,
            bg=PANEL,
            padx=18,
            pady=10
        )

        top_bar.pack(
            fill="x"
        )

        logo = tk.Label(
            top_bar,
            text="PYT",
            bg=PANEL,
            fg=WHITE,
            font=(
                "Courier New",
                22,
                "bold"
            )
        )

        logo.pack(
            side="left"
        )

        subtitle = tk.Label(
            top_bar,
            text="APPRENDRE PYTHON",
            bg=PANEL,
            fg=CYAN,
            font=(
                "Arial",
                9,
                "bold"
            )
        )

        subtitle.pack(
            side="left",
            padx=(10, 20)
        )

        self.chapter_label = tk.Label(
            top_bar,
            text="",
            bg=PINK,
            fg=WHITE,
            padx=10,
            pady=5,
            font=(
                "Arial",
                9,
                "bold"
            )
        )

        self.chapter_label.pack(
            side="left"
        )

        self.difficulty_label = tk.Label(
            top_bar,
            text="",
            bg=CYAN,
            fg=BLACK,
            padx=10,
            pady=5,
            font=(
                "Arial",
                9,
                "bold"
            )
        )

        self.difficulty_label.pack(
            side="right"
        )

    # ========================================================
    # ZONE DE JEU
    # ========================================================

    def create_game_area(self):
        """Crée la partie gauche contenant la carte."""

        left_frame = tk.Frame(
            self.main_frame,
            bg=BACKGROUND
        )

        left_frame.grid(
            row=0,
            column=0,
            sticky="nsew",
            padx=(0, 10)
        )

        title = tk.Label(
            left_frame,
            text="ZONE D'ENTRAÎNEMENT",
            bg=BACKGROUND,
            fg=WHITE,
            font=(
                "Courier New",
                11,
                "bold"
            )
        )

        title.pack(
            anchor="w",
            pady=(0, 7)
        )

        canvas_frame = tk.Frame(
            left_frame,
            bg=BLACK,
            padx=3,
            pady=3
        )

        canvas_frame.pack(
            fill="both",
            expand=True
        )

        self.canvas = tk.Canvas(
            canvas_frame,
            bg=BLACK,
            highlightthickness=0
        )

        self.canvas.pack(
            fill="both",
            expand=True
        )

        self.canvas.bind(
            "<Configure>",
            self.on_canvas_resize
        )

        self.status_label = tk.Label(
            left_frame,
            text="",
            bg=PANEL,
            fg=WHITE,
            anchor="w",
            justify="left",
            padx=12,
            pady=10,
            font=(
                "Arial",
                10
            )
        )

        self.status_label.pack(
            fill="x",
            pady=(8, 0)
        )

    # ========================================================
    # PANNEAU DE MISSION
    # ========================================================

    def create_mission_panel(self):
        """Crée le panneau situé à droite."""

        right_frame = tk.Frame(
            self.main_frame,
            bg=PANEL,
            padx=18,
            pady=18,
            highlightbackground=BLACK,
            highlightthickness=3
        )

        right_frame.grid(
            row=0,
            column=1,
            sticky="nsew"
        )

        mission_title = tk.Label(
            right_frame,
            text="MISSION",
            bg=PANEL,
            fg=YELLOW,
            font=(
                "Courier New",
                14,
                "bold"
            )
        )

        mission_title.pack(
            anchor="w"
        )

        self.title_label = tk.Label(
            right_frame,
            text="",
            bg=PANEL,
            fg=WHITE,
            anchor="w",
            justify="left",
            font=(
                "Arial",
                16,
                "bold"
            )
        )

        self.title_label.pack(
            fill="x",
            pady=(15, 6)
        )

        self.instruction_label = tk.Label(
            right_frame,
            text="",
            bg=PANEL_LIGHT,
            fg=WHITE,
            anchor="nw",
            justify="left",
            wraplength=330,
            padx=14,
            pady=14,
            font=(
                "Arial",
                11
            )
        )

        self.instruction_label.pack(
            fill="x"
        )

        self.concept_label = tk.Label(
            right_frame,
            text="",
            bg=PANEL,
            fg=ORANGE,
            anchor="w",
            justify="left",
            font=(
                "Arial",
                10,
                "bold"
            )
        )

        self.concept_label.pack(
            fill="x",
            pady=(14, 20)
        )

        code_button = tk.Button(
            right_frame,
            text="OUVRIR LE CODE",
            command=self.open_code_window,
            bg=CYAN,
            fg=BLACK,
            activebackground=YELLOW,
            activeforeground=BLACK,
            relief="flat",
            cursor="hand2",
            padx=12,
            pady=11,
            font=(
                "Arial",
                11,
                "bold"
            )
        )

        code_button.pack(
            fill="x"
        )

        reset_button = tk.Button(
            right_frame,
            text="↻ RECOMMENCER",
            command=self.reset_level,
            bg="#4c3a69",
            fg=WHITE,
            activebackground="#604c80",
            activeforeground=WHITE,
            relief="flat",
            cursor="hand2",
            padx=12,
            pady=10,
            font=(
                "Arial",
                10,
                "bold"
            )
        )

        reset_button.pack(
            fill="x",
            pady=8
        )

        self.next_button = tk.Button(
            right_frame,
            text="NIVEAU SUIVANT →",
            command=self.next_level,
            bg=PINK,
            fg=WHITE,
            activebackground=ORANGE,
            activeforeground=BLACK,
            disabledforeground=MUTED,
            relief="flat",
            cursor="hand2",
            padx=12,
            pady=10,
            font=(
                "Arial",
                10,
                "bold"
            ),
            state="disabled"
        )

        self.next_button.pack(
            fill="x"
        )

        separator = tk.Frame(
            right_frame,
            bg="#4a3c69",
            height=2
        )

        separator.pack(
            fill="x",
            pady=20
        )

        help_title = tk.Label(
            right_frame,
            text="COMMANDES",
            bg=PANEL,
            fg=CYAN,
            font=(
                "Courier New",
                10,
                "bold"
            )
        )

        help_title.pack(
            anchor="w"
        )

        help_text = tk.Label(
            right_frame,
            text=(
                "forward(1)\n"
                "backward(1)\n"
                "left(90)\n"
                "right(90)"
            ),
            bg=PANEL,
            fg=MUTED,
            justify="left",
            font=(
                "Courier New",
                10
            )
        )

        help_text.pack(
            anchor="w",
            pady=(8, 0)
        )

    # ========================================================
    # INFORMATIONS DU NIVEAU
    # ========================================================

    def refresh_level_information(self):
        """Actualise les textes du niveau."""

        chapter = self.level[
            "chapter"
        ]

        exercise = self.level[
            "exercise"
        ]

        difficulty = self.level[
            "difficulty"
        ]

        self.chapter_label.config(
            text=(
                f"CHAPITRE {chapter} "
                f"· EXERCICE {exercise}/3"
            )
        )

        self.difficulty_label.config(
            text=difficulty.upper()
        )

        self.title_label.config(
            text=self.level[
                "title"
            ]
        )

        self.instruction_label.config(
            text=self.level[
                "instruction"
            ]
        )

        concepts = self.level.get(
            "python_concept",
            []
        )

        concept_text = ", ".join(
            concepts
        )

        self.concept_label.config(
            text=(
                "Notions : "
                + concept_text
            )
        )

        self.refresh_status()

    # ========================================================
    # DESSIN DE LA CARTE
    # ========================================================

    def on_canvas_resize(self, event):
        """Redessine la carte si la fenêtre change de taille."""

        self.draw_world()

    def draw_world(self):
        """Dessine entièrement le monde."""

        if self.canvas is None:
            return

        self.canvas.delete(
            "all"
        )

        canvas_width = max(
            self.canvas.winfo_width(),
            400
        )

        canvas_height = max(
            self.canvas.winfo_height(),
            350
        )

        available_width = (
            canvas_width - 30
        )

        available_height = (
            canvas_height - 30
        )

        width_size = (
            available_width
            // self.game.cols
        )

        height_size = (
            available_height
            // self.game.rows
        )

        self.cell_size = max(
            20,
            min(
                width_size,
                height_size
            )
        )

        map_width = (
            self.cell_size
            * self.game.cols
        )

        map_height = (
            self.cell_size
            * self.game.rows
        )

        self.grid_x = (
            canvas_width
            - map_width
        ) // 2

        self.grid_y = (
            canvas_height
            - map_height
        ) // 2

        self.draw_tiles()

        self.draw_robot()

        self.refresh_status()

    def draw_tiles(self):
        """Dessine chaque case de la grille."""

        for row in range(
            self.game.rows
        ):

            for col in range(
                self.game.cols
            ):

                self.draw_tile(
                    row,
                    col
                )

    def draw_tile(
        self,
        row,
        col
    ):
        """Dessine une case."""

        x1 = (
            self.grid_x
            + col * self.cell_size
        )

        y1 = (
            self.grid_y
            + row * self.cell_size
        )

        x2 = x1 + self.cell_size
        y2 = y1 + self.cell_size

        if (
            row + col
        ) % 2 == 0:
            floor_color = GRID_DARK
        else:
            floor_color = GRID_LIGHT

        self.canvas.create_rectangle(
            x1,
            y1,
            x2,
            y2,
            fill=floor_color,
            outline=BLACK,
            width=2
        )

        tile_type = (
            self.game.get_tile_type(
                row,
                col
            )
        )

        if tile_type == self.game.WALL:
            self.draw_wall(
                x1,
                y1,
                x2,
                y2
            )

        elif tile_type == self.game.GOAL:
            self.draw_goal(
                x1,
                y1,
                x2,
                y2
            )

        elif tile_type == self.game.OBJECT:
            self.draw_object(
                x1,
                y1,
                x2,
                y2
            )

        elif tile_type == self.game.DEPOSIT:
            self.draw_deposit(
                x1,
                y1,
                x2,
                y2
            )

        elif tile_type == self.game.BUTTON:
            self.draw_button(
                x1,
                y1,
                x2,
                y2
            )

        elif tile_type == self.game.DOOR:
            self.draw_door(
                x1,
                y1,
                x2,
                y2
            )

        elif tile_type == self.game.DIRT:
            self.draw_dirt(
                x1,
                y1,
                x2,
                y2
            )

        elif tile_type == self.game.BOX:
            self.draw_box(
                x1,
                y1,
                x2,
                y2
            )

        elif tile_type == self.game.CHARGER:
            self.draw_charger(
                x1,
                y1,
                x2,
                y2
            )

    # ========================================================
    # ÉLÉMENTS VISUELS
    # ========================================================

    def draw_wall(
        self,
        x1,
        y1,
        x2,
        y2
    ):
        """Dessine un mur rétro."""

        margin = max(
            3,
            self.cell_size // 12
        )

        self.canvas.create_rectangle(
            x1 + margin,
            y1 + margin,
            x2 - margin,
            y2 - margin,
            fill=WALL_COLOR,
            outline=BLACK,
            width=3
        )

        middle_y = (
            y1 + y2
        ) / 2

        self.canvas.create_line(
            x1 + margin,
            middle_y,
            x2 - margin,
            middle_y,
            fill=BLACK,
            width=2
        )

        middle_x = (
            x1 + x2
        ) / 2

        self.canvas.create_line(
            middle_x,
            y1 + margin,
            middle_x,
            middle_y,
            fill=BLACK,
            width=2
        )

    def draw_goal(
        self,
        x1,
        y1,
        x2,
        y2
    ):
        """Dessine le cristal de destination."""

        center_x = (
            x1 + x2
        ) / 2

        center_y = (
            y1 + y2
        ) / 2

        size = (
            self.cell_size
            * 0.28
        )

        points = [
            center_x,
            center_y - size,

            center_x + size,
            center_y,

            center_x,
            center_y + size,

            center_x - size,
            center_y,
        ]

        self.canvas.create_polygon(
            points,
            fill=YELLOW,
            outline=BLACK,
            width=3
        )

        self.canvas.create_line(
            center_x,
            center_y - size,
            center_x,
            center_y + size,
            fill=WHITE,
            width=2
        )

    def draw_object(
        self,
        x1,
        y1,
        x2,
        y2
    ):
        """Dessine un objet à ramasser."""

        margin = (
            self.cell_size
            * 0.30
        )

        self.canvas.create_rectangle(
            x1 + margin,
            y1 + margin,
            x2 - margin,
            y2 - margin,
            fill=ORANGE,
            outline=BLACK,
            width=3
        )

    def draw_deposit(
        self,
        x1,
        y1,
        x2,
        y2
    ):
        """Dessine une zone de dépôt."""

        margin = (
            self.cell_size
            * 0.20
        )

        self.canvas.create_rectangle(
            x1 + margin,
            y1 + margin,
            x2 - margin,
            y2 - margin,
            outline=YELLOW,
            width=4
        )

    def draw_button(
        self,
        x1,
        y1,
        x2,
        y2
    ):
        """Dessine un bouton au sol."""

        margin = (
            self.cell_size
            * 0.30
        )

        self.canvas.create_oval(
            x1 + margin,
            y1 + margin,
            x2 - margin,
            y2 - margin,
            fill=BUTTON_COLOR,
            outline=BLACK,
            width=3
        )

    def draw_door(
        self,
        x1,
        y1,
        x2,
        y2
    ):
        """Dessine une porte fermée."""

        margin = (
            self.cell_size
            * 0.15
        )

        self.canvas.create_rectangle(
            x1 + margin,
            y1 + margin,
            x2 - margin,
            y2,
            fill=DOOR_COLOR,
            outline=BLACK,
            width=3
        )

        self.canvas.create_oval(
            x2 - self.cell_size * 0.35,
            (y1 + y2) / 2,
            x2 - self.cell_size * 0.27,
            (y1 + y2) / 2
            + self.cell_size * 0.08,
            fill=YELLOW,
            outline=BLACK
        )

    def draw_dirt(
        self,
        x1,
        y1,
        x2,
        y2
    ):
        """Dessine une case sale."""

        self.canvas.create_oval(
            x1 + self.cell_size * 0.20,
            y1 + self.cell_size * 0.45,
            x1 + self.cell_size * 0.48,
            y1 + self.cell_size * 0.70,
            fill=DIRT_COLOR,
            outline=""
        )

        self.canvas.create_oval(
            x1 + self.cell_size * 0.48,
            y1 + self.cell_size * 0.25,
            x1 + self.cell_size * 0.76,
            y1 + self.cell_size * 0.56,
            fill=DIRT_COLOR,
            outline=""
        )

    def draw_box(
        self,
        x1,
        y1,
        x2,
        y2
    ):
        """Dessine une caisse."""

        margin = (
            self.cell_size
            * 0.15
        )

        self.canvas.create_rectangle(
            x1 + margin,
            y1 + margin,
            x2 - margin,
            y2 - margin,
            fill=BOX_COLOR,
            outline=BLACK,
            width=3
        )

        self.canvas.create_line(
            x1 + margin,
            y1 + margin,
            x2 - margin,
            y2 - margin,
            fill=BLACK,
            width=2
        )

        self.canvas.create_line(
            x2 - margin,
            y1 + margin,
            x1 + margin,
            y2 - margin,
            fill=BLACK,
            width=2
        )

    def draw_charger(
        self,
        x1,
        y1,
        x2,
        y2
    ):
        """Dessine une station de recharge."""

        center_x = (
            x1 + x2
        ) / 2

        center_y = (
            y1 + y2
        ) / 2

        self.canvas.create_rectangle(
            center_x - self.cell_size * 0.24,
            center_y - self.cell_size * 0.24,
            center_x + self.cell_size * 0.24,
            center_y + self.cell_size * 0.24,
            fill=CHARGER_COLOR,
            outline=BLACK,
            width=3
        )

        self.canvas.create_text(
            center_x,
            center_y,
            text="+",
            fill=BLACK,
            font=(
                "Arial",
                max(
                    10,
                    int(
                        self.cell_size
                        * 0.35
                    )
                ),
                "bold"
            )
        )

    # ========================================================
    # PYT
    # ========================================================

    def draw_robot(self):
        """Dessine Pyt sur sa position logique."""

        row = self.game.robot.row
        col = self.game.robot.col

        x1 = (
            self.grid_x
            + col * self.cell_size
        )

        y1 = (
            self.grid_y
            + row * self.cell_size
        )

        x2 = x1 + self.cell_size
        y2 = y1 + self.cell_size

        center_x = (
            x1 + x2
        ) / 2

        center_y = (
            y1 + y2
        ) / 2

        # Ombre
        self.canvas.create_oval(
            center_x
            - self.cell_size * 0.25,
            center_y
            + self.cell_size * 0.18,

            center_x
            + self.cell_size * 0.25,
            center_y
            + self.cell_size * 0.32,

            fill="#17121e",
            outline=""
        )

        # Corps blanc
        self.canvas.create_rectangle(
            center_x
            - self.cell_size * 0.23,
            center_y
            - self.cell_size * 0.17,

            center_x
            + self.cell_size * 0.23,
            center_y
            + self.cell_size * 0.24,

            fill="#e9e6ef",
            outline=BLACK,
            width=3
        )

        # Tête
        self.canvas.create_rectangle(
            center_x
            - self.cell_size * 0.29,
            center_y
            - self.cell_size * 0.34,

            center_x
            + self.cell_size * 0.29,
            center_y
            - self.cell_size * 0.05,

            fill="#f4f1f6",
            outline=BLACK,
            width=3
        )

        # Écran du visage
        self.canvas.create_rectangle(
            center_x
            - self.cell_size * 0.19,
            center_y
            - self.cell_size * 0.27,

            center_x
            + self.cell_size * 0.19,
            center_y
            - self.cell_size * 0.12,

            fill="#19152b",
            outline=BLACK,
            width=2
        )

        # Yeux cyan
        eye_size = max(
            2,
            self.cell_size * 0.035
        )

        self.canvas.create_rectangle(
            center_x
            - self.cell_size * 0.10
            - eye_size,

            center_y
            - self.cell_size * 0.205
            - eye_size,

            center_x
            - self.cell_size * 0.10
            + eye_size,

            center_y
            - self.cell_size * 0.205
            + eye_size,

            fill=CYAN,
            outline=""
        )

        self.canvas.create_rectangle(
            center_x
            + self.cell_size * 0.10
            - eye_size,

            center_y
            - self.cell_size * 0.205
            - eye_size,

            center_x
            + self.cell_size * 0.10
            + eye_size,

            center_y
            - self.cell_size * 0.205
            + eye_size,

            fill=CYAN,
            outline=""
        )

        # Direction
        symbol = (
            self.game.robot
            .get_direction_symbol()
        )

        self.canvas.create_text(
            center_x,
            center_y
            + self.cell_size * 0.11,
            text=symbol,
            fill=PINK,
            font=(
                "Arial",
                max(
                    10,
                    int(
                        self.cell_size
                        * 0.20
                    )
                ),
                "bold"
            )
        )

    # ========================================================
    # FENÊTRE DE CODE
    # ========================================================

    def open_code_window(self):
        """Ouvre l'éditeur Python dans une fenêtre séparée."""

        if (
            self.code_window is not None
            and self.code_window.winfo_exists()
        ):
            self.code_window.lift()
            self.code_window.focus_force()
            return

        self.code_window = tk.Toplevel(
            self.root
        )

        self.code_window.title(
            "PYT - Éditeur Python"
        )

        self.code_window.geometry(
            "600x520"
        )

        self.code_window.minsize(
            450,
            350
        )

        self.code_window.configure(
            bg="#0d0d14"
        )

        header = tk.Frame(
            self.code_window,
            bg="#0d0d14"
        )

        header.pack(
            fill="x",
            padx=14,
            pady=(14, 6)
        )

        tk.Label(
            header,
            text="CODE PYTHON",
            bg="#0d0d14",
            fg=WHITE,
            font=(
                "Arial",
                12,
                "bold"
            )
        ).pack(
            side="left"
        )

        tk.Label(
            header,
            text="Pyt",
            bg=PINK,
            fg=WHITE,
            padx=8,
            pady=3,
            font=(
                "Arial",
                9,
                "bold"
            )
        ).pack(
            side="right"
        )

        editor_frame = tk.Frame(
            self.code_window,
            bg=BLACK,
            padx=2,
            pady=2
        )

        editor_frame.pack(
            fill="both",
            expand=True,
            padx=14
        )

        self.code_text = tk.Text(
            editor_frame,
            bg="#11111a",
            fg="#f2eff4",
            insertbackground=CYAN,
            selectbackground="#54377b",
            selectforeground=WHITE,
            relief="flat",
            undo=True,
            wrap="none",
            padx=12,
            pady=12,
            font=(
                "Courier New",
                12
            )
        )

        self.code_text.pack(
            fill="both",
            expand=True
        )

        self.insert_starter_code()

        console_label = tk.Label(
            self.code_window,
            text="CONSOLE",
            bg="#0d0d14",
            fg=MUTED,
            anchor="w",
            font=(
                "Arial",
                9,
                "bold"
            )
        )

        console_label.pack(
            fill="x",
            padx=14,
            pady=(10, 3)
        )

        self.console_text = tk.Text(
            self.code_window,
            height=4,
            bg="#171720",
            fg=CYAN,
            relief="flat",
            state="disabled",
            padx=8,
            pady=8,
            font=(
                "Courier New",
                9
            )
        )

        self.console_text.pack(
            fill="x",
            padx=14
        )

        button_bar = tk.Frame(
            self.code_window,
            bg="#0d0d14"
        )

        button_bar.pack(
            fill="x",
            padx=14,
            pady=14
        )

        run_button = tk.Button(
            button_bar,
            text="▶ EXÉCUTER",
            command=self.execute_code,
            bg=CYAN,
            fg=BLACK,
            activebackground=YELLOW,
            activeforeground=BLACK,
            relief="flat",
            cursor="hand2",
            padx=15,
            pady=9,
            font=(
                "Arial",
                10,
                "bold"
            )
        )

        run_button.pack(
            side="left"
        )

        clear_button = tk.Button(
            button_bar,
            text="EFFACER",
            command=self.clear_code,
            bg="#4c3a69",
            fg=WHITE,
            activebackground="#604c80",
            activeforeground=WHITE,
            relief="flat",
            cursor="hand2",
            padx=15,
            pady=9
        )

        clear_button.pack(
            side="left",
            padx=8
        )

        reset_button = tk.Button(
            button_bar,
            text="RESET",
            command=self.reset_level,
            bg=PINK,
            fg=WHITE,
            activebackground=ORANGE,
            relief="flat",
            cursor="hand2",
            padx=15,
            pady=9
        )

        reset_button.pack(
            side="left"
        )

    def insert_starter_code(self):
        """Insère une petite aide selon l'exercice."""

        if self.code_text is None:
            return

        exercise = self.level[
            "exercise"
        ]

        if exercise == 1:
            code = (
                "# Fais avancer Pyt jusqu'au cristal\n"
                "forward(1)\n"
            )

        elif exercise == 2:
            code = (
                "# Utilise forward() et right(90)\n"
                "\n"
            )

        else:
            code = (
                "# Trouve le chemin jusqu'au cristal\n"
                "# forward(), backward(), left(), right()\n"
                "\n"
            )

        self.code_text.insert(
            "1.0",
            code
        )

    def clear_code(self):
        """Efface l'éditeur."""

        if self.code_text is None:
            return

        self.code_text.delete(
            "1.0",
            "end"
        )

    # ========================================================
    # EXÉCUTION DU CODE
    # ========================================================

    def execute_code(self):
        """Exécute le programme écrit par l'élève."""

        if self.code_text is None:
            return

        code = self.code_text.get(
            "1.0",
            "end-1c"
        )

        # Chaque exécution recommence le niveau
        # depuis son état initial.
        self.game.reset()

        self.next_button.config(
            state="disabled"
        )

        result = self.runner.run(
            code
        )

        self.draw_world()

        self.show_console_result(
            result
        )

        if result[
            "level_completed"
        ]:
            self.next_button.config(
                state="normal"
            )

            messagebox.showinfo(
                "Mission réussie",
                "Bravo ! Pyt a réussi la mission."
            )

    def show_console_result(
        self,
        result
    ):
        """Affiche le résultat dans la console."""

        if self.console_text is None:
            return

        self.console_text.config(
            state="normal"
        )

        self.console_text.delete(
            "1.0",
            "end"
        )

        if result["error"]:
            text = (
                "ERREUR\n"
                + result["error"]
            )

        else:
            output = result[
                "output"
            ]

            if output.strip():
                text = output

            elif result[
                "level_completed"
            ]:
                text = (
                    "Mission réussie !"
                )

            else:
                text = (
                    "Programme terminé.\n"
                    "La mission n'est pas encore réussie."
                )

        self.console_text.insert(
            "1.0",
            text
        )

        self.console_text.config(
            state="disabled"
        )

    # ========================================================
    # RESET
    # ========================================================

    def reset_level(self):
        """Recommence le niveau."""

        self.runner.reset()

        self.next_button.config(
            state="disabled"
        )

        self.clear_console()

        self.draw_world()

    def clear_console(self):
        """Vide la console."""

        if self.console_text is None:
            return

        if not self.console_text.winfo_exists():
            return

        self.console_text.config(
            state="normal"
        )

        self.console_text.delete(
            "1.0",
            "end"
        )

        self.console_text.config(
            state="disabled"
        )

    # ========================================================
    # NIVEAU SUIVANT
    # ========================================================

    def next_level(self):
        """Passe au prochain exercice."""

        if not self.game.completed:
            return

        new_level = get_next_level(
            self.level["chapter"],
            self.level["exercise"]
        )

        if new_level is None:
            messagebox.showinfo(
                "PYT",
                "Chapitre 1 terminé !"
            )

            return

        self.level = new_level

        self.game.load_level(
            new_level
        )

        self.runner = Runner(
            self.game
        )

        self.next_button.config(
            state="disabled"
        )

        self.refresh_level_information()

        self.draw_world()

        self.prepare_code_for_new_level()

    def prepare_code_for_new_level(self):
        """Prépare l'éditeur pour le nouveau niveau."""

        if self.code_text is None:
            return

        if not self.code_text.winfo_exists():
            return

        self.code_text.delete(
            "1.0",
            "end"
        )

        self.insert_starter_code()

        self.clear_console()

    # ========================================================
    # STATUT
    # ========================================================

    def refresh_status(self):
        """Actualise le message sous la carte."""

        if self.status_label is None:
            return

        message = self.game.message

        if not message:
            message = (
                "Pyt attend ton programme."
            )

        if self.game.completed:
            message = (
                "✓ Mission réussie ! "
                "Le niveau suivant est débloqué."
            )

        self.status_label.config(
            text=message
        )

    # ========================================================
    # FERMETURE
    # ========================================================

    def close_game(self):
        """Ferme proprement le jeu."""

        if (
            self.code_window is not None
            and self.code_window.winfo_exists()
        ):
            self.code_window.destroy()

        self.root.destroy()