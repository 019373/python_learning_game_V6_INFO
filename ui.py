"""
ui.py
Interface graphique du jeu éducatif PYT.

L'interface utilise uniquement Tkinter et Canvas.
La logique du jeu reste dans game.py.
"""

import tkinter as tk
from tkinter import messagebox

from runner import Runner
from levels import get_level, get_course


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

WALL_COLOR = "#765081"
DOOR_COLOR = "#b84f72"
DIRT_COLOR = "#80573f"
BOX_COLOR = "#d28443"
BUTTON_COLOR = "#49a8bd"
CHARGER_COLOR = "#55d69a"


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

        # Progression du chapitre.
        # Au début, seul l'exercice 1 est accessible.
        self.unlocked_exercise = 1

        self.completed_exercises = set()

        self.course_seen = False

        # Fenêtres secondaires
        self.code_window = None
        self.code_text = None
        self.console_text = None

        self.map_window = None
        self.course_window = None

        # Widgets principaux
        self.canvas = None
        self.status_label = None

        self.chapter_label = None
        self.difficulty_label = None

        self.title_label = None
        self.instruction_label = None

        # Dimensions carte
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

        # Le cours s'ouvre automatiquement
        # au début du chapitre.
        self.root.after(
            300,
            self.open_course_window
        )

    # ========================================================
    # FENÊTRE PRINCIPALE
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
    # CONSTRUCTION
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
            side="left",
            padx=(8, 0)
        )

        map_button = tk.Button(
            top_bar,
            text="CARTE",
            command=self.open_map_window,
            bg=YELLOW,
            fg=BLACK,
            activebackground=ORANGE,
            activeforeground=BLACK,
            relief="flat",
            cursor="hand2",
            padx=14,
            pady=5,
            font=(
                "Arial",
                9,
                "bold"
            )
        )

        map_button.pack(
            side="right"
        )

        course_button = tk.Button(
            top_bar,
            text="COURS",
            command=self.open_course_window,
            bg="#4c3a69",
            fg=WHITE,
            activebackground=PINK,
            activeforeground=WHITE,
            relief="flat",
            cursor="hand2",
            padx=14,
            pady=5,
            font=(
                "Arial",
                9,
                "bold"
            )
        )

        course_button.pack(
            side="right",
            padx=(0, 8)
        )

    # ========================================================
    # ZONE DE JEU
    # ========================================================

    def create_game_area(self):

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
    # MISSION
    # ========================================================

    def create_mission_panel(self):

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

        mission = tk.Label(
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

        mission.pack(
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

        # Plus de "Notions"
        # Plus de "Commandes"
        # Plus de "Niveau suivant"

        open_code_button = tk.Button(
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

        open_code_button.pack(
            fill="x",
            pady=(20, 0)
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

        map_button = tk.Button(
            right_frame,
            text="VOIR LA CARTE",
            command=self.open_map_window,
            bg=PINK,
            fg=WHITE,
            activebackground=ORANGE,
            activeforeground=BLACK,
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

        map_button.pack(
            fill="x"
        )

    # ========================================================
    # INFORMATIONS NIVEAU
    # ========================================================

    def refresh_level_information(self):

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

        self.refresh_status()

    # ========================================================
    # COURS DU CHAPITRE
    # ========================================================

    def open_course_window(self):

        if (
            self.course_window is not None
            and self.course_window.winfo_exists()
        ):
            self.course_window.lift()
            return

        course = get_course(
            self.level["chapter"]
        )

        window = tk.Toplevel(
            self.root
        )

        self.course_window = window

        window.title(
            "PYT - Cours"
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

        # Rend le cours prioritaire au premier lancement.
        if not self.course_seen:
            window.transient(
                self.root
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
            text=(
                f"CHAPITRE "
                f"{course['chapter']}"
            ),
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
            text=course[
                "title"
            ],
            bg=PANEL,
            fg=WHITE,
            font=(
                "Arial",
                22,
                "bold"
            )
        ).pack(
            anchor="w",
            pady=(3, 0)
        )

        tk.Label(
            header,
            text=course[
                "subtitle"
            ],
            bg=PANEL,
            fg=YELLOW,
            font=(
                "Arial",
                11,
                "bold"
            )
        ).pack(
            anchor="w",
            pady=(3, 0)
        )

        # Zone défilable
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

        content.bind(
            "<Configure>",
            lambda event:
            course_canvas.configure(
                scrollregion=
                course_canvas.bbox(
                    "all"
                )
            )
        )

        course_canvas.create_window(
            (0, 0),
            window=content,
            anchor="nw"
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

        introduction = tk.Label(
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
        )

        introduction.pack(
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

            code_box = tk.Label(
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
            )

            code_box.pack(
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
            pady=16
        )

        bottom.pack(
            fill="x"
        )

        start_button = tk.Button(
            bottom,
            text="COMMENCER LES EXERCICES",
            command=self.close_course_and_start,
            bg=PINK,
            fg=WHITE,
            activebackground=ORANGE,
            activeforeground=BLACK,
            relief="flat",
            cursor="hand2",
            padx=16,
            pady=11,
            font=(
                "Arial",
                11,
                "bold"
            )
        )

        start_button.pack(
            side="right"
        )

    def close_course_and_start(self):

        self.course_seen = True

        if (
            self.course_window is not None
            and self.course_window.winfo_exists()
        ):
            self.course_window.destroy()

        self.course_window = None

        self.open_map_window()

    # ========================================================
    # CARTE DES EXERCICES
    # ========================================================

    def open_map_window(self):

        if (
            self.map_window is not None
            and self.map_window.winfo_exists()
        ):
            self.map_window.lift()
            self.draw_level_map()
            return

        window = tk.Toplevel(
            self.root
        )

        self.map_window = window

        window.title(
            "PYT - Carte du chapitre"
        )

        window.geometry(
            "700x420"
        )

        window.minsize(
            600,
            360
        )

        window.configure(
            bg=BACKGROUND
        )

        tk.Label(
            window,
            text="CARTE DU CHAPITRE 1",
            bg=BACKGROUND,
            fg=WHITE,
            font=(
                "Courier New",
                18,
                "bold"
            )
        ).pack(
            pady=(24, 4)
        )

        tk.Label(
            window,
            text="Déplacements de base",
            bg=BACKGROUND,
            fg=CYAN,
            font=(
                "Arial",
                10,
                "bold"
            )
        ).pack()

        self.map_canvas = tk.Canvas(
            window,
            bg=BACKGROUND,
            highlightthickness=0,
            height=230
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

        tk.Label(
            window,
            text=(
                "Termine un exercice pour "
                "débloquer le suivant."
            ),
            bg=BACKGROUND,
            fg=MUTED,
            font=(
                "Arial",
                10
            )
        ).pack(
            pady=(0, 18)
        )

        self.root.after(
            50,
            self.draw_level_map
        )

    def draw_level_map(self):

        if (
            not hasattr(
                self,
                "map_canvas"
            )
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
            200
        )

        center_y = (
            height // 2
        )

        positions = [
            width * 0.20,
            width * 0.50,
            width * 0.80,
        ]

        # Lignes entre les exercices
        canvas.create_line(
            positions[0],
            center_y,
            positions[2],
            center_y,
            fill="#54466e",
            width=6
        )

        difficulties = [
            "FACILE",
            "MOYEN",
            "DIFFICILE",
        ]

        for index in range(3):

            exercise = index + 1

            x = positions[index]

            completed = (
                exercise
                in self.completed_exercises
            )

            unlocked = (
                exercise
                <= self.unlocked_exercise
            )

            current = (
                exercise
                == self.level[
                    "exercise"
                ]
            )

            if completed:
                color = GREEN
                text = "✓"

            elif current:
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
                text = "🔒"

            radius = 34

            circle = canvas.create_oval(
                x - radius,
                center_y - radius,
                x + radius,
                center_y + radius,
                fill=color,
                outline=BLACK,
                width=4
            )

            number = canvas.create_text(
                x,
                center_y,
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
                    17,
                    "bold"
                )
            )

            canvas.create_text(
                x,
                center_y + 58,
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
                center_y + 77,
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
                    self.select_exercise(
                        ex
                    )
                )

                canvas.tag_bind(
                    circle,
                    "<Button-1>",
                    callback
                )

                canvas.tag_bind(
                    number,
                    "<Button-1>",
                    callback
                )

                canvas.tag_bind(
                    circle,
                    "<Enter>",
                    lambda event:
                    canvas.config(
                        cursor="hand2"
                    )
                )

                canvas.tag_bind(
                    circle,
                    "<Leave>",
                    lambda event:
                    canvas.config(
                        cursor=""
                    )
                )

    def select_exercise(
        self,
        exercise
    ):

        if (
            exercise
            > self.unlocked_exercise
        ):
            return

        new_level = get_level(
            1,
            exercise
        )

        self.level = new_level

        self.game.load_level(
            new_level
        )

        self.runner = Runner(
            self.game
        )

        self.refresh_level_information()

        self.draw_world()

        self.clear_editor()

        self.clear_console()

        if (
            self.map_window is not None
            and self.map_window.winfo_exists()
        ):
            self.map_window.destroy()

        self.map_window = None

    # ========================================================
    # CARTE DU JEU
    # ========================================================

    def on_canvas_resize(
        self,
        event
    ):
        self.draw_world()

    def draw_world(self):

        if self.canvas is None:
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

        width_size = (
            width - 30
        ) // self.game.cols

        height_size = (
            height - 30
        ) // self.game.rows

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

        if (
            row + col
        ) % 2 == 0:
            color = GRID_DARK

        else:
            color = GRID_LIGHT

        self.canvas.create_rectangle(
            x1,
            y1,
            x2,
            y2,
            fill=color,
            outline=BLACK,
            width=2
        )

        tile = (
            self.game.get_tile_type(
                row,
                col
            )
        )

        if tile == self.game.WALL:
            self.draw_wall(
                x1,
                y1,
                x2,
                y2
            )

        elif tile == self.game.GOAL:
            self.draw_goal(
                x1,
                y1,
                x2,
                y2
            )

        elif tile == self.game.OBJECT:
            self.draw_object(
                x1,
                y1,
                x2,
                y2
            )

        elif tile == self.game.DEPOSIT:
            self.draw_deposit(
                x1,
                y1,
                x2,
                y2
            )

        elif tile == self.game.BUTTON:
            self.draw_button(
                x1,
                y1,
                x2,
                y2
            )

        elif tile == self.game.DOOR:
            self.draw_door(
                x1,
                y1,
                x2,
                y2
            )

        elif tile == self.game.DIRT:
            self.draw_dirt(
                x1,
                y1,
                x2,
                y2
            )

        elif tile == self.game.BOX:
            self.draw_box(
                x1,
                y1,
                x2,
                y2
            )

        elif tile == self.game.CHARGER:
            self.draw_charger(
                x1,
                y1,
                x2,
                y2
            )

    # ========================================================
    # DESSINS
    # ========================================================

    def draw_wall(
        self,
        x1,
        y1,
        x2,
        y2
    ):

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

    def draw_goal(
        self,
        x1,
        y1,
        x2,
        y2
    ):

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

        self.canvas.create_polygon(
            center_x,
            center_y - size,

            center_x + size,
            center_y,

            center_x,
            center_y + size,

            center_x - size,
            center_y,

            fill=YELLOW,
            outline=BLACK,
            width=3
        )

    def draw_object(
        self,
        x1,
        y1,
        x2,
        y2
    ):

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

    def draw_dirt(
        self,
        x1,
        y1,
        x2,
        y2
    ):

        self.canvas.create_oval(
            x1 + self.cell_size * 0.20,
            y1 + self.cell_size * 0.40,
            x1 + self.cell_size * 0.55,
            y1 + self.cell_size * 0.70,
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

        center_x = (
            x1 + x2
        ) / 2

        center_y = (
            y1 + y2
        ) / 2

        self.canvas.create_rectangle(
            center_x
            - self.cell_size * 0.24,

            center_y
            - self.cell_size * 0.24,

            center_x
            + self.cell_size * 0.24,

            center_y
            + self.cell_size * 0.24,

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

        center_x = (
            x1
            + self.cell_size / 2
        )

        center_y = (
            y1
            + self.cell_size / 2
        )

        # Ombre
        self.canvas.create_oval(
            center_x
            - self.cell_size * 0.25,

            center_y
            + self.cell_size * 0.18,

            center_x
            + self.cell_size * 0.25,

            center_y
            + self.cell_size * 0.30,

            fill="#17121e",
            outline=""
        )

        # Corps
        self.canvas.create_rectangle(
            center_x
            - self.cell_size * 0.23,

            center_y
            - self.cell_size * 0.14,

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

            fill=WHITE,
            outline=BLACK,
            width=3
        )

        # Écran visage
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

        eye = max(
            2,
            self.cell_size * 0.035
        )

        # Yeux
        for offset in (
            -0.10,
            0.10
        ):

            eye_x = (
                center_x
                + self.cell_size
                * offset
            )

            eye_y = (
                center_y
                - self.cell_size
                * 0.195
            )

            self.canvas.create_rectangle(
                eye_x - eye,
                eye_y - eye,
                eye_x + eye,
                eye_y + eye,
                fill=CYAN,
                outline=""
            )

        # Orientation
        self.canvas.create_text(
            center_x,
            center_y
            + self.cell_size * 0.10,

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
    # ÉDITEUR DE CODE
    # ========================================================

    def open_code_window(self):

        if (
            self.code_window is not None
            and self.code_window.winfo_exists()
        ):
            self.code_window.lift()
            return

        window = tk.Toplevel(
            self.root
        )

        self.code_window = window

        window.title(
            "PYT - Code Python"
        )

        window.geometry(
            "620x520"
        )

        window.minsize(
            450,
            350
        )

        window.configure(
            bg="#0d0d14"
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

        # Le bouton rose PYT lance le programme.
        pyt_button = tk.Button(
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

        pyt_button.pack(
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

        # IMPORTANT :
        # aucun code prérempli.
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

        clear_button = tk.Button(
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
        )

        clear_button.pack(
            side="left"
        )

        reset_button = tk.Button(
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
        )

        reset_button.pack(
            side="left",
            padx=8
        )

    # ========================================================
    # EXÉCUTION
    # ========================================================

    def execute_code(self):

        if self.code_text is None:
            return

        code = self.code_text.get(
            "1.0",
            "end-1c"
        )

        # Si l'éditeur est vide :
        # aucun mouvement.
        if not code.strip():

            self.show_console_message(
                "Écris un programme avant de lancer Pyt."
            )

            return

        # Chaque lancement repart du début.
        self.game.reset()

        result = self.runner.run(
            code
        )

        self.draw_world()

        if result["error"]:

            self.show_console_message(
                result["error"]
            )

            return

        if result["output"].strip():

            self.show_console_message(
                result["output"]
            )

        elif result[
            "level_completed"
        ]:

            self.show_console_message(
                "Mission réussie !"
            )

        else:

            self.show_console_message(
                "Programme terminé.\n"
                "Pyt n'a pas encore réussi la mission."
            )

        if result[
            "level_completed"
        ]:

            self.complete_current_exercise()

    # ========================================================
    # RÉUSSITE / PROGRESSION
    # ========================================================

    def complete_current_exercise(self):

        exercise = self.level[
            "exercise"
        ]

        # Évite de refaire le déblocage
        # plusieurs fois.
        already_completed = (
            exercise
            in self.completed_exercises
        )

        self.completed_exercises.add(
            exercise
        )

        if (
            exercise < 3
            and self.unlocked_exercise
            < exercise + 1
        ):

            self.unlocked_exercise = (
                exercise + 1
            )

        self.refresh_status()

        if already_completed:
            return

        if exercise < 3:

            answer = messagebox.askyesno(
                "Mission réussie",
                (
                    "Bravo ! Exercice réussi.\n\n"
                    f"L'exercice "
                    f"{exercise + 1} "
                    "est maintenant débloqué.\n\n"
                    "Ouvrir la carte ?"
                )
            )

            if answer:
                self.open_map_window()

        else:

            messagebox.showinfo(
                "Chapitre terminé",
                (
                    "Bravo !\n\n"
                    "Tu as terminé les trois "
                    "exercices du chapitre 1."
                )
            )

            self.open_map_window()

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
    # RESET
    # ========================================================

    def reset_level(self):

        self.runner.reset()

        self.clear_console()

        self.draw_world()

    # ========================================================
    # STATUT
    # ========================================================

    def refresh_status(self):

        if self.status_label is None:
            return

        exercise = self.level[
            "exercise"
        ]

        if (
            exercise
            in self.completed_exercises
        ):

            message = (
                "✓ Exercice réussi."
            )

        elif self.game.message:

            message = (
                self.game.message
            )

        else:

            message = (
                "Pyt attend ton programme."
            )

        self.status_label.config(
            text=message
        )

    # ========================================================
    # FERMETURE
    # ========================================================

    def close_game(self):

        if (
            self.code_window is not None
            and self.code_window.winfo_exists()
        ):
            self.code_window.destroy()

        if (
            self.map_window is not None
            and self.map_window.winfo_exists()
        ):
            self.map_window.destroy()

        if (
            self.course_window is not None
            and self.course_window.winfo_exists()
        ):
            self.course_window.destroy()

        self.root.destroy()