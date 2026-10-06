"""
ui.py
PYT - Interface graphique principale.

Cette interface gère :
- l'affichage du monde
- le cours des chapitres
- la carte de progression
- la fenêtre de code
- l'animation de Pyt
- le déblocage des exercices
"""

import tkinter as tk
from tkinter import messagebox

from runner import Runner
from levels import (
    get_level,
    get_course,
    get_number_of_chapters,
)


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
GREEN = "#58d68d"
RED = "#e05b6f"

WALL_COLOR = "#765081"
DOOR_COLOR = "#b84f72"
DIRT_COLOR = "#80573f"
BOX_COLOR = "#d28443"
BUTTON_COLOR = "#49a8bd"
CHARGER_COLOR = "#55d69a"


# ============================================================
# VITESSE
# ============================================================

# 2 secondes entre chaque action.
ACTION_DELAY = 2000


# ============================================================
# INTERFACE
# ============================================================

class GameUI:

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

        # ----------------------------------------------------
        # PROGRESSION
        # ----------------------------------------------------

        # Ensemble de couples :
        # (chapitre, exercice)
        self.completed_levels = set()

        # Au début seul chapitre 1 exercice 1
        # est débloqué.
        self.highest_unlocked = (
            1,
            1
        )

        # Chapitres dont le cours a déjà
        # été présenté.
        self.course_seen = set()

        # Nombre d'essais pour chaque exercice.
        self.attempts = {}

        # ----------------------------------------------------
        # ANIMATION
        # ----------------------------------------------------

        self.animation_running = False

        self.action_queue = []

        self.action_index = 0

        self.animation_after_id = None

        # ----------------------------------------------------
        # FENÊTRES
        # ----------------------------------------------------

        self.code_window = None
        self.course_window = None
        self.map_window = None

        self.code_text = None
        self.console_text = None

        # ----------------------------------------------------
        # WIDGETS
        # ----------------------------------------------------

        self.canvas = None

        self.chapter_label = None
        self.difficulty_label = None

        self.title_label = None
        self.instruction_label = None

        self.status_label = None

        self.pyt_button = None

        # ----------------------------------------------------
        # AFFICHAGE CARTE
        # ----------------------------------------------------

        self.cell_size = 50
        self.grid_x = 0
        self.grid_y = 0

        self.configure_root()
        self.create_interface()

        self.refresh_level_information()

        self.root.after(
            100,
            self.draw_world
        )

        # Le cours apparaît au début du chapitre 1.
        self.root.after(
            300,
            self.show_initial_chapter_screen
        )

    # ========================================================
    # ROOT
    # ========================================================

    def configure_root(self):

        self.root.configure(
            bg=BACKGROUND
        )

        self.root.protocol(
            "WM_DELETE_WINDOW",
            self.close_game
        )

    # ========================================================
    # INTERFACE PRINCIPALE
    # ========================================================

    def create_interface(self):

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

    # ========================================================
    # BARRE DU HAUT
    # ========================================================

    def create_top_bar(self):

        bar = tk.Frame(
            self.root,
            bg=PANEL,
            padx=18,
            pady=10
        )

        bar.pack(
            fill="x"
        )

        tk.Label(
            bar,
            text="PYT",
            bg=PANEL,
            fg=WHITE,
            font=(
                "Courier New",
                22,
                "bold"
            )
        ).pack(
            side="left"
        )

        tk.Label(
            bar,
            text="APPRENDRE PYTHON",
            bg=PANEL,
            fg=CYAN,
            font=(
                "Arial",
                9,
                "bold"
            )
        ).pack(
            side="left",
            padx=(10, 20)
        )

        self.chapter_label = tk.Label(
            bar,
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
            bar,
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
            side="left",
            padx=(8, 0)
        )

        tk.Button(
            bar,
            text="CARTE",
            command=self.open_map_window,
            bg=YELLOW,
            fg=BLACK,
            activebackground=ORANGE,
            relief="flat",
            cursor="hand2",
            padx=14,
            pady=5,
            font=(
                "Arial",
                9,
                "bold"
            )
        ).pack(
            side="right"
        )

    # ========================================================
    # ZONE DU JEU
    # ========================================================

    def create_game_area(self):

        frame = tk.Frame(
            self.main_frame,
            bg=BACKGROUND
        )

        frame.grid(
            row=0,
            column=0,
            sticky="nsew",
            padx=(0, 10)
        )

        tk.Label(
            frame,
            text="ZONE D'ENTRAÎNEMENT",
            bg=BACKGROUND,
            fg=WHITE,
            font=(
                "Courier New",
                11,
                "bold"
            )
        ).pack(
            anchor="w",
            pady=(0, 7)
        )

        canvas_frame = tk.Frame(
            frame,
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
            lambda event:
            self.draw_world()
        )

        self.status_label = tk.Label(
            frame,
            text="",
            bg=PANEL,
            fg=WHITE,
            anchor="w",
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
    # PANNEAU MISSION
    # ========================================================

    def create_mission_panel(self):

        frame = tk.Frame(
            self.main_frame,
            bg=PANEL,
            padx=18,
            pady=18,
            highlightbackground=BLACK,
            highlightthickness=3
        )

        frame.grid(
            row=0,
            column=1,
            sticky="nsew"
        )

        tk.Label(
            frame,
            text="MISSION",
            bg=PANEL,
            fg=YELLOW,
            font=(
                "Courier New",
                14,
                "bold"
            )
        ).pack(
            anchor="w"
        )

        self.title_label = tk.Label(
            frame,
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
            frame,
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

        tk.Button(
            frame,
            text="OUVRIR LE CODE",
            command=self.open_code_window,
            bg=CYAN,
            fg=BLACK,
            activebackground=YELLOW,
            relief="flat",
            cursor="hand2",
            padx=12,
            pady=11,
            font=(
                "Arial",
                11,
                "bold"
            )
        ).pack(
            fill="x",
            pady=(20, 0)
        )

        tk.Button(
            frame,
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
        ).pack(
            fill="x",
            pady=8
        )

    # ========================================================
    # INFORMATIONS
    # ========================================================

    def refresh_level_information(self):

        chapter = self.level[
            "chapter"
        ]

        exercise = self.level[
            "exercise"
        ]

        self.chapter_label.config(
            text=(
                f"CHAPITRE {chapter} "
                f"· EXERCICE {exercise}/3"
            )
        )

        self.difficulty_label.config(
            text=self.level[
                "difficulty"
            ].upper()
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

        self.refresh_status()

    # ========================================================
    # ÉCRAN INITIAL DU CHAPITRE
    # ========================================================

    def show_initial_chapter_screen(self):

        chapter = self.level[
            "chapter"
        ]

        if chapter not in self.course_seen:

            self.open_course_window(
                force=True
            )

    # ========================================================
    # COURS
    # ========================================================

    def open_course_window(
        self,
        force=False
    ):

        chapter = self.level[
            "chapter"
        ]

        if (
            not force
            and chapter in self.course_seen
        ):
            return

        if (
            self.course_window is not None
            and self.course_window.winfo_exists()
        ):

            self.restore_window(
                self.course_window
            )

            return

        course = get_course(
            chapter
        )

        window = tk.Toplevel(
            self.root
        )

        self.course_window = window

        window.title(
            f"PYT - Chapitre {chapter}"
        )

        window.geometry(
            "720x650"
        )

        window.minsize(
            550,
            450
        )

        window.configure(
            bg=BACKGROUND
        )

        header = tk.Frame(
            window,
            bg=PANEL,
            padx=20,
            pady=16
        )

        header.pack(
            fill="x"
        )

        tk.Label(
            header,
            text=f"CHAPITRE {chapter}",
            bg=PANEL,
            fg=CYAN,
            font=(
                "Arial",
                10,
                "bold"
            )
        ).pack(
            anchor="w"
        )

        tk.Label(
            header,
            text=course["title"],
            bg=PANEL,
            fg=WHITE,
            font=(
                "Arial",
                22,
                "bold"
            )
        ).pack(
            anchor="w"
        )

        tk.Label(
            header,
            text=course["subtitle"],
            bg=PANEL,
            fg=YELLOW,
            font=(
                "Arial",
                11,
                "bold"
            )
        ).pack(
            anchor="w"
        )

        container = tk.Frame(
            window,
            bg=BACKGROUND
        )

        container.pack(
            fill="both",
            expand=True
        )

        course_canvas = tk.Canvas(
            container,
            bg=BACKGROUND,
            highlightthickness=0
        )

        scrollbar = tk.Scrollbar(
            container,
            orient="vertical",
            command=course_canvas.yview
        )

        content = tk.Frame(
            course_canvas,
            bg=BACKGROUND
        )

        canvas_window = course_canvas.create_window(
            (0, 0),
            window=content,
            anchor="nw"
        )

        def update_scroll(event=None):

            course_canvas.configure(
                scrollregion=
                course_canvas.bbox(
                    "all"
                )
            )

        def update_width(event):

            course_canvas.itemconfigure(
                canvas_window,
                width=event.width
            )

        content.bind(
            "<Configure>",
            update_scroll
        )

        course_canvas.bind(
            "<Configure>",
            update_width
        )

        course_canvas.configure(
            yscrollcommand=
            scrollbar.set
        )

        course_canvas.pack(
            side="left",
            fill="both",
            expand=True
        )

        scrollbar.pack(
            side="right",
            fill="y"
        )

        tk.Label(
            content,
            text=course[
                "introduction"
            ],
            bg=BACKGROUND,
            fg=WHITE,
            justify="left",
            anchor="w",
            wraplength=620,
            padx=22,
            pady=18,
            font=(
                "Arial",
                11
            )
        ).pack(
            fill="x"
        )

        for section in course[
            "sections"
        ]:

            card = tk.Frame(
                content,
                bg=PANEL,
                padx=16,
                pady=14
            )

            card.pack(
                fill="x",
                padx=22,
                pady=7
            )

            tk.Label(
                card,
                text=section[
                    "title"
                ],
                bg=PANEL,
                fg=YELLOW,
                anchor="w",
                font=(
                    "Arial",
                    13,
                    "bold"
                )
            ).pack(
                fill="x"
            )

            tk.Label(
                card,
                text=section[
                    "text"
                ],
                bg=PANEL,
                fg=WHITE,
                justify="left",
                anchor="w",
                wraplength=580,
                font=(
                    "Arial",
                    10
                )
            ).pack(
                fill="x",
                pady=(7, 8)
            )

            tk.Label(
                card,
                text=section[
                    "example"
                ],
                bg="#101019",
                fg=CYAN,
                justify="left",
                anchor="w",
                padx=12,
                pady=10,
                font=(
                    "Courier New",
                    11
                )
            ).pack(
                fill="x"
            )

            tk.Label(
                card,
                text=section[
                    "explanation"
                ],
                bg=PANEL,
                fg=MUTED,
                justify="left",
                anchor="w",
                wraplength=580,
                font=(
                    "Arial",
                    10
                )
            ).pack(
                fill="x",
                pady=(8, 0)
            )

        bottom = tk.Frame(
            window,
            bg=BACKGROUND,
            padx=22,
            pady=15
        )

        bottom.pack(
            fill="x"
        )

        tk.Button(
            bottom,
            text="VOIR LA CARTE",
            command=self.course_to_map,
            bg=PINK,
            fg=WHITE,
            activebackground=ORANGE,
            activeforeground=BLACK,
            relief="flat",
            cursor="hand2",
            padx=18,
            pady=10,
            font=(
                "Arial",
                11,
                "bold"
            )
        ).pack(
            side="right"
        )

    def course_to_map(self):

        chapter = self.level[
            "chapter"
        ]

        self.course_seen.add(
            chapter
        )

        if (
            self.course_window is not None
            and self.course_window.winfo_exists()
        ):

            self.course_window.destroy()

        self.course_window = None

        self.open_map_window()

    # ========================================================
    # CARTE
    # ========================================================

    def open_map_window(self):

        if (
            self.map_window is not None
            and self.map_window.winfo_exists()
        ):

            self.restore_window(
                self.map_window
            )

            self.draw_level_map()

            return

        window = tk.Toplevel(
            self.root
        )

        self.map_window = window

        window.title(
            "PYT - Carte"
        )

        window.geometry(
            "760x500"
        )

        window.minsize(
            620,
            400
        )

        window.configure(
            bg=BACKGROUND
        )

        chapter = self.level[
            "chapter"
        ]

        course = get_course(
            chapter
        )

        tk.Label(
            window,
            text=(
                f"CARTE DU CHAPITRE "
                f"{chapter}"
            ),
            bg=BACKGROUND,
            fg=WHITE,
            font=(
                "Courier New",
                18,
                "bold"
            )
        ).pack(
            pady=(22, 4)
        )

        tk.Label(
            window,
            text=course[
                "title"
            ],
            bg=BACKGROUND,
            fg=CYAN,
            font=(
                "Arial",
                11,
                "bold"
            )
        ).pack()

        self.map_canvas = tk.Canvas(
            window,
            bg=BACKGROUND,
            highlightthickness=0,
            height=250
        )

        self.map_canvas.pack(
            fill="both",
            expand=True,
            padx=20,
            pady=10
        )

        self.map_canvas.bind(
            "<Configure>",
            lambda event:
            self.draw_level_map()
        )

        bottom = tk.Frame(
            window,
            bg=BACKGROUND
        )

        bottom.pack(
            fill="x",
            padx=20,
            pady=(0, 20)
        )

        tk.Button(
            bottom,
            text="REVOIR LE COURS",
            command=self.reopen_course_from_map,
            bg="#4c3a69",
            fg=WHITE,
            activebackground=PINK,
            activeforeground=WHITE,
            relief="flat",
            cursor="hand2",
            padx=14,
            pady=8
        ).pack(
            side="left"
        )

        tk.Label(
            bottom,
            text=(
                "Clique sur un exercice débloqué "
                "pour commencer."
            ),
            bg=BACKGROUND,
            fg=MUTED,
            font=(
                "Arial",
                9
            )
        ).pack(
            side="right"
        )

        self.root.after(
            50,
            self.draw_level_map
        )

    def reopen_course_from_map(self):

        if (
            self.map_window is not None
            and self.map_window.winfo_exists()
        ):
            self.map_window.destroy()

        self.map_window = None

        # Ici le joueur demande volontairement
        # à revoir le cours.
        self.open_course_window(
            force=True
        )

    # ========================================================
    # DESSIN CARTE
    # ========================================================

    def draw_level_map(self):

        if not hasattr(
            self,
            "map_canvas"
        ):
            return

        if not self.map_canvas.winfo_exists():
            return

        canvas = self.map_canvas

        canvas.delete(
            "all"
        )

        width = max(
            canvas.winfo_width(),
            600
        )

        height = max(
            canvas.winfo_height(),
            220
        )

        y = (
            height // 2
            - 20
        )

        positions = [
            width * 0.20,
            width * 0.50,
            width * 0.80,
        ]

        canvas.create_line(
            positions[0],
            y,
            positions[2],
            y,
            fill="#55476e",
            width=7
        )

        chapter = self.level[
            "chapter"
        ]

        difficulties = [
            "FACILE",
            "MOYEN",
            "DIFFICILE",
        ]

        for index in range(3):

            exercise = index + 1

            key = (
                chapter,
                exercise
            )

            completed = (
                key
                in self.completed_levels
            )

            unlocked = (
                self.is_level_unlocked(
                    chapter,
                    exercise
                )
            )

            current = (
                self.level[
                    "chapter"
                ] == chapter
                and
                self.level[
                    "exercise"
                ] == exercise
            )

            if completed:

                color = GREEN
                text = "✓"

            elif current and unlocked:

                color = PINK
                text = str(
                    exercise
                )

            elif unlocked:

                color = CYAN
                text = str(
                    exercise
                )

            else:

                color = "#413852"
                text = "X"

            radius = 38
            x = positions[index]

            circle = canvas.create_oval(
                x - radius,
                y - radius,
                x + radius,
                y + radius,
                fill=color,
                outline=BLACK,
                width=4
            )

            label = canvas.create_text(
                x,
                y,
                text=text,
                fill=(
                    BLACK
                    if color in (
                        CYAN,
                        GREEN
                    )
                    else WHITE
                ),
                font=(
                    "Arial",
                    18,
                    "bold"
                )
            )

            canvas.create_text(
                x,
                y + 65,
                text=(
                    f"EXERCICE "
                    f"{exercise}"
                ),
                fill=WHITE,
                font=(
                    "Arial",
                    9,
                    "bold"
                )
            )

            canvas.create_text(
                x,
                y + 84,
                text=difficulties[
                    index
                ],
                fill=MUTED,
                font=(
                    "Arial",
                    8
                )
            )

            if unlocked:

                callback = (
                    lambda event,
                    ex=exercise:
                    self.start_exercise_from_map(
                        ex
                    )
                )

                canvas.tag_bind(
                    circle,
                    "<Button-1>",
                    callback
                )

                canvas.tag_bind(
                    label,
                    "<Button-1>",
                    callback
                )

                canvas.tag_bind(
                    circle,
                    "<Enter>",
                    lambda event:
                    canvas.configure(
                        cursor="hand2"
                    )
                )

                canvas.tag_bind(
                    circle,
                    "<Leave>",
                    lambda event:
                    canvas.configure(
                        cursor=""
                    )
                )

    # ========================================================
    # DÉBLOCAGE
    # ========================================================

    def level_number(
        self,
        chapter,
        exercise
    ):

        return (
            (chapter - 1) * 3
            + exercise
        )

    def is_level_unlocked(
        self,
        chapter,
        exercise
    ):

        requested = self.level_number(
            chapter,
            exercise
        )

        unlocked = self.level_number(
            self.highest_unlocked[0],
            self.highest_unlocked[1]
        )

        return requested <= unlocked

    def unlock_next_level(self):

        chapter = self.level[
            "chapter"
        ]

        exercise = self.level[
            "exercise"
        ]

        if exercise < 3:

            next_level = (
                chapter,
                exercise + 1
            )

        elif chapter < get_number_of_chapters():

            next_level = (
                chapter + 1,
                1
            )

        else:

            return

        if (
            self.level_number(
                next_level[0],
                next_level[1]
            )
            >
            self.level_number(
                self.highest_unlocked[0],
                self.highest_unlocked[1]
            )
        ):

            self.highest_unlocked = (
                next_level
            )

    # ========================================================
    # COMMENCER EXERCICE
    # ========================================================

    def start_exercise_from_map(
        self,
        exercise
    ):

        chapter = self.level[
            "chapter"
        ]

        if not self.is_level_unlocked(
            chapter,
            exercise
        ):
            return

        new_level = get_level(
            chapter,
            exercise
        )

        self.load_level(
            new_level
        )

        # La carte se ferme.
        if (
            self.map_window is not None
            and self.map_window.winfo_exists()
        ):

            self.map_window.destroy()

        self.map_window = None

        # La fenêtre principale du jeu
        # revient au premier plan.
        self.restore_window(
            self.root
        )

    # ========================================================
    # CHARGER NIVEAU
    # ========================================================

    def load_level(
        self,
        level
    ):

        self.stop_animation()

        self.level = level

        self.game.load_level(
            level
        )

        self.runner = Runner(
            self.game
        )

        self.clear_editor()
        self.clear_console()

        self.refresh_level_information()
        self.draw_world()

    # ========================================================
    # DESSIN DU MONDE
    # ========================================================

    def draw_world(self):

        if self.canvas is None:
            return

        if not self.canvas.winfo_exists():
            return

        self.canvas.delete(
            "all"
        )

        width = max(
            self.canvas.winfo_width(),
            400
        )

        height = max(
            self.canvas.winfo_height(),
            350
        )

        size_x = (
            width - 30
        ) // self.game.cols

        size_y = (
            height - 30
        ) // self.game.rows

        self.cell_size = max(
            20,
            min(
                size_x,
                size_y
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
            width - map_width
        ) // 2

        self.grid_y = (
            height - map_height
        ) // 2

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

        self.draw_robot()
        self.refresh_status()

    # ========================================================
    # CASE
    # ========================================================

    def draw_tile(
        self,
        row,
        col
    ):

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

        color = (
            GRID_DARK
            if (row + col) % 2 == 0
            else GRID_LIGHT
        )

        self.canvas.create_rectangle(
            x1,
            y1,
            x2,
            y2,
            fill=color,
            outline=BLACK,
            width=2
        )

        tile = self.game.get_tile_type(
            row,
            col
        )

        if tile == self.game.WALL:

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

        elif tile == self.game.GOAL:

            cx = (
                x1 + x2
            ) / 2

            cy = (
                y1 + y2
            ) / 2

            size = (
                self.cell_size
                * 0.28
            )

            self.canvas.create_polygon(
                cx,
                cy - size,

                cx + size,
                cy,

                cx,
                cy + size,

                cx - size,
                cy,

                fill=YELLOW,
                outline=BLACK,
                width=3
            )

        elif tile == self.game.OBJECT:

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

        elif tile == self.game.DEPOSIT:

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

        elif tile == self.game.BUTTON:

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

        elif tile == self.game.DOOR:

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

        elif tile == self.game.DIRT:

            self.canvas.create_oval(
                x1 + self.cell_size * 0.20,
                y1 + self.cell_size * 0.40,
                x1 + self.cell_size * 0.55,
                y1 + self.cell_size * 0.70,
                fill=DIRT_COLOR,
                outline=""
            )

        elif tile == self.game.BOX:

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

        elif tile == self.game.CHARGER:

            cx = (
                x1 + x2
            ) / 2

            cy = (
                y1 + y2
            ) / 2

            self.canvas.create_text(
                cx,
                cy,
                text="+",
                fill=CHARGER_COLOR,
                font=(
                    "Arial",
                    max(
                        12,
                        int(
                            self.cell_size
                            * 0.4
                        )
                    ),
                    "bold"
                )
            )

    # ========================================================
    # ROBOT
    # ========================================================

    def draw_robot(self):

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

        cx = (
            x1
            + self.cell_size / 2
        )

        cy = (
            y1
            + self.cell_size / 2
        )

        # Ombre
        self.canvas.create_oval(
            cx - self.cell_size * 0.25,
            cy + self.cell_size * 0.18,

            cx + self.cell_size * 0.25,
            cy + self.cell_size * 0.30,

            fill="#17121e",
            outline=""
        )

        # Corps
        self.canvas.create_rectangle(
            cx - self.cell_size * 0.23,
            cy - self.cell_size * 0.14,

            cx + self.cell_size * 0.23,
            cy + self.cell_size * 0.24,

            fill="#e9e6ef",
            outline=BLACK,
            width=3
        )

        # Tête
        self.canvas.create_rectangle(
            cx - self.cell_size * 0.29,
            cy - self.cell_size * 0.34,

            cx + self.cell_size * 0.29,
            cy - self.cell_size * 0.05,

            fill=WHITE,
            outline=BLACK,
            width=3
        )

        # Visage
        self.canvas.create_rectangle(
            cx - self.cell_size * 0.19,
            cy - self.cell_size * 0.27,

            cx + self.cell_size * 0.19,
            cy - self.cell_size * 0.12,

            fill="#19152b",
            outline=BLACK,
            width=2
        )

        eye_size = max(
            2,
            self.cell_size * 0.035
        )

        for offset in (
            -0.10,
            0.10
        ):

            eye_x = (
                cx
                + self.cell_size
                * offset
            )

            eye_y = (
                cy
                - self.cell_size
                * 0.195
            )

            self.canvas.create_rectangle(
                eye_x - eye_size,
                eye_y - eye_size,
                eye_x + eye_size,
                eye_y + eye_size,
                fill=CYAN,
                outline=""
            )

        # Direction
        self.canvas.create_text(
            cx,
            cy + self.cell_size * 0.10,
            text=(
                self.game.robot
                .get_direction_symbol()
            ),
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
    # FENÊTRE CODE
    # ========================================================

    def open_code_window(self):

        # Si elle existe déjà, on la restaure.
        if (
            self.code_window is not None
            and self.code_window.winfo_exists()
        ):

            self.restore_window(
                self.code_window
            )

            return

        window = tk.Toplevel(
            self.root
        )

        self.code_window = window

        window.title(
            "PYT - Code Python"
        )

        window.geometry(
            "620x540"
        )

        window.minsize(
            450,
            350
        )

        window.configure(
            bg="#0d0d14"
        )

        window.protocol(
            "WM_DELETE_WINDOW",
            self.hide_code_window
        )

        header = tk.Frame(
            window,
            bg="#0d0d14"
        )

        header.pack(
            fill="x",
            padx=14,
            pady=(14, 7)
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

        self.pyt_button = tk.Button(
            header,
            text="PYT ▶",
            command=self.execute_code,
            bg=PINK,
            fg=WHITE,
            activebackground=ORANGE,
            activeforeground=BLACK,
            relief="flat",
            cursor="hand2",
            padx=14,
            pady=6,
            font=(
                "Arial",
                10,
                "bold"
            )
        )

        self.pyt_button.pack(
            side="right"
        )

        editor_frame = tk.Frame(
            window,
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
            fg=WHITE,
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

        # Aucun code automatique.
        self.code_text.delete(
            "1.0",
            "end"
        )

        tk.Label(
            window,
            text="CONSOLE",
            bg="#0d0d14",
            fg=MUTED,
            anchor="w",
            font=(
                "Arial",
                9,
                "bold"
            )
        ).pack(
            fill="x",
            padx=14,
            pady=(10, 3)
        )

        self.console_text = tk.Text(
            window,
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

        bottom = tk.Frame(
            window,
            bg="#0d0d14"
        )

        bottom.pack(
            fill="x",
            padx=14,
            pady=14
        )

        tk.Button(
            bottom,
            text="EFFACER",
            command=self.clear_editor,
            bg="#4c3a69",
            fg=WHITE,
            activebackground="#604c80",
            activeforeground=WHITE,
            relief="flat",
            cursor="hand2",
            padx=14,
            pady=8
        ).pack(
            side="left"
        )

        tk.Button(
            bottom,
            text="RECOMMENCER",
            command=self.reset_level,
            bg="#4c3a69",
            fg=WHITE,
            activebackground="#604c80",
            activeforeground=WHITE,
            relief="flat",
            cursor="hand2",
            padx=14,
            pady=8
        ).pack(
            side="left",
            padx=8
        )

        self.restore_window(
            window
        )

    # ========================================================
    # RESTAURER UNE FENÊTRE
    # ========================================================

    def restore_window(
        self,
        window
    ):

        try:

            window.deiconify()

            window.lift()

            window.focus_force()

            # Petit topmost temporaire :
            # utile si la fenêtre était cachée
            # derrière une autre.
            window.attributes(
                "-topmost",
                True
            )

            window.after(
                150,
                lambda:
                self.remove_topmost(
                    window
                )
            )

        except tk.TclError:
            pass

    def remove_topmost(
        self,
        window
    ):

        try:

            window.attributes(
                "-topmost",
                False
            )

        except tk.TclError:
            pass

    def hide_code_window(self):

        if (
            self.code_window is not None
            and self.code_window.winfo_exists()
        ):

            # On ne détruit pas l'éditeur.
            # On le cache.
            self.code_window.withdraw()

    # ========================================================
    # EXÉCUTER LE CODE
    # ========================================================

    def execute_code(self):

        if self.animation_running:

            self.show_console_message(
                "Pyt est déjà en mouvement."
            )

            return

        if self.code_text is None:
            return

        code = self.code_text.get(
            "1.0",
            "end-1c"
        )

        if not code.strip():

            self.show_console_message(
                "Écris un programme avant de lancer Pyt."
            )

            return

        # Nouvel essai.
        key = (
            self.level["chapter"],
            self.level["exercise"]
        )

        self.attempts[key] = (
            self.attempts.get(
                key,
                0
            )
            + 1
        )

        # On replace Pyt au départ avant
        # chaque tentative.
        self.game.reset()

        self.draw_world()

        result = self.runner.prepare(
            code
        )

        if result["error"]:

            self.show_console_message(
                result["error"]
            )

            self.handle_failed_attempt()

            return

        if result["output"].strip():

            self.show_console_message(
                result["output"]
            )

        else:

            self.show_console_message(
                "Programme lancé..."
            )

        self.action_queue = result[
            "actions"
        ]

        self.action_index = 0

        if not self.action_queue:

            self.show_console_message(
                "Le programme n'a donné "
                "aucune action à Pyt."
            )

            self.handle_failed_attempt()

            return

        self.animation_running = True

        self.set_pyt_button_enabled(
            False
        )

        # Première action immédiatement.
        self.play_next_action()

    # ========================================================
    # ANIMATION
    # ========================================================

    def play_next_action(self):

        if not self.animation_running:
            return

        if (
            self.action_index
            >= len(
                self.action_queue
            )
        ):

            self.finish_animation()

            return

        action_type, value = (
            self.action_queue[
                self.action_index
            ]
        )

        success = self.perform_action(
            action_type,
            value
        )

        self.action_index += 1

        self.draw_world()

        # Si Pyt essaie de traverser un mur,
        # on arrête le programme.
        if not success:

            self.animation_running = False

            self.set_pyt_button_enabled(
                True
            )

            self.show_console_message(
                self.game.message
                or
                "Pyt est bloqué."
            )

            self.handle_failed_attempt()

            return

        # IMPORTANT :
        # Même si Pyt arrive sur le cristal,
        # on attend la fin logique du programme.
        #
        # La réussite sera annoncée dans
        # finish_animation().
        self.animation_after_id = (
            self.root.after(
                ACTION_DELAY,
                self.play_next_action
            )
        )

    # ========================================================
    # UNE ACTION
    # ========================================================

    def perform_action(
        self,
        action_type,
        value
    ):

        if action_type == "forward":

            return self.robot_forward_one()

        if action_type == "backward":

            return self.robot_backward_one()

        if action_type == "right":

            self.game.robot.rotate_right(
                value
            )

            return True

        if action_type == "left":

            self.game.robot.rotate_left(
                value
            )

            return True

        return False

    def robot_forward_one(self):

        row, col = (
            self.game.robot
            .get_forward_position()
        )

        return self.game.move_robot_to(
            row,
            col
        )

    def robot_backward_one(self):

        row, col = (
            self.game.robot
            .get_backward_position()
        )

        return self.game.move_robot_to(
            row,
            col
        )

    # ========================================================
    # FIN ANIMATION
    # ========================================================

    def finish_animation(self):

        self.animation_running = False

        self.animation_after_id = None

        self.set_pyt_button_enabled(
            True
        )

        self.game.check_success()

        self.draw_world()

        if self.game.completed:

            self.handle_success()

        else:

            self.show_console_message(
                "Programme terminé.\n"
                "La mission n'est pas encore réussie."
            )

            self.handle_failed_attempt()

    # ========================================================
    # ÉCHEC
    # ========================================================

    def handle_failed_attempt(self):

        key = (
            self.level["chapter"],
            self.level["exercise"]
        )

        attempts = self.attempts.get(
            key,
            0
        )

        # Le cours n'est proposé qu'après
        # un premier échec.
        if attempts != 1:
            return

        chapter = self.level[
            "chapter"
        ]

        answer = messagebox.askyesno(
            "Besoin d'aide ?",
            (
                "La mission n'est pas encore réussie.\n\n"
                "Veux-tu revoir le cours de ce chapitre ?"
            )
        )

        if answer:

            # L'utilisateur choisit de le revoir.
            self.open_course_window(
                force=True
            )

    # ========================================================
    # RÉUSSITE
    # ========================================================

    def handle_success(self):

        chapter = self.level[
            "chapter"
        ]

        exercise = self.level[
            "exercise"
        ]

        key = (
            chapter,
            exercise
        )

        first_completion = (
            key
            not in self.completed_levels
        )

        self.completed_levels.add(
            key
        )

        self.unlock_next_level()

        self.show_console_message(
            "✓ Mission réussie !"
        )

        self.refresh_status()

        if not first_completion:
            return

        # ----------------------------------------------------
        # EXERCICE 1 OU 2
        # ----------------------------------------------------

        if exercise < 3:

            messagebox.showinfo(
                "Mission réussie",
                (
                    "Bravo !\n\n"
                    f"L'exercice {exercise} "
                    "est réussi.\n"
                    f"L'exercice {exercise + 1} "
                    "est maintenant débloqué.\n\n"
                    "Utilise le bouton CARTE "
                    "quand tu veux continuer."
                )
            )

            return

        # ----------------------------------------------------
        # FIN D'UN CHAPITRE
        # ----------------------------------------------------

        if chapter < get_number_of_chapters():

            messagebox.showinfo(
                "Chapitre terminé",
                (
                    f"Bravo !\n\n"
                    f"Tu as terminé le chapitre "
                    f"{chapter}.\n\n"
                    f"Le chapitre {chapter + 1} "
                    "est maintenant débloqué."
                )
            )

            # Charge le premier exercice du prochain
            # chapitre pour que CARTE affiche ce chapitre.
            next_level = get_level(
                chapter + 1,
                1
            )

            self.load_level(
                next_level
            )

            # Le cours du nouveau chapitre
            # apparaît une seule fois.
            self.root.after(
                250,
                lambda:
                self.open_course_window(
                    force=True
                )
            )

            return

        # ----------------------------------------------------
        # FIN DU JEU
        # ----------------------------------------------------

        messagebox.showinfo(
            "PYT terminé",
            (
                "Félicitations !\n\n"
                "Tu as terminé les 9 chapitres "
                "et les 27 exercices de PYT."
            )
        )

    # ========================================================
    # ARRÊTER ANIMATION
    # ========================================================

    def stop_animation(self):

        if self.animation_after_id is not None:

            try:

                self.root.after_cancel(
                    self.animation_after_id
                )

            except tk.TclError:
                pass

        self.animation_after_id = None
        self.animation_running = False

        self.set_pyt_button_enabled(
            True
        )

    # ========================================================
    # BOUTON PYT
    # ========================================================

    def set_pyt_button_enabled(
        self,
        enabled
    ):

        if self.pyt_button is None:
            return

        if not self.pyt_button.winfo_exists():
            return

        if enabled:

            self.pyt_button.config(
                state="normal",
                text="PYT ▶"
            )

        else:

            self.pyt_button.config(
                state="disabled",
                text="PYT..."
            )

    # ========================================================
    # RESET
    # ========================================================

    def reset_level(self):

        self.stop_animation()

        self.game.reset()

        self.runner = Runner(
            self.game
        )

        self.clear_console()

        self.draw_world()

    # ========================================================
    # ÉDITEUR
    # ========================================================

    def clear_editor(self):

        if self.code_text is None:
            return

        if not self.code_text.winfo_exists():
            return

        self.code_text.delete(
            "1.0",
            "end"
        )

    # ========================================================
    # CONSOLE
    # ========================================================

    def show_console_message(
        self,
        message
    ):

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

        self.console_text.insert(
            "1.0",
            message
        )

        self.console_text.config(
            state="disabled"
        )

    def clear_console(self):

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
    # STATUT
    # ========================================================

    def refresh_status(self):

        if self.status_label is None:
            return

        key = (
            self.level["chapter"],
            self.level["exercise"]
        )

        if self.animation_running:

            text = (
                "Pyt exécute ton programme..."
            )

        elif key in self.completed_levels:

            text = (
                "✓ Exercice réussi."
            )

        elif self.game.message:

            text = self.game.message

        else:

            text = (
                "Pyt attend ton programme."
            )

        self.status_label.config(
            text=text
        )

    # ========================================================
    # FERMETURE
    # ========================================================

    def close_game(self):

        self.stop_animation()

        windows = [
            self.code_window,
            self.course_window,
            self.map_window,
        ]

        for window in windows:

            try:

                if (
                    window is not None
                    and window.winfo_exists()
                ):
                    window.destroy()

            except tk.TclError:
                pass

        self.root.destroy()