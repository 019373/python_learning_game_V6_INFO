"""
robot.py
PYT - Robot logique du jeu.

Ce fichier gère uniquement Pyt :
- sa position
- sa direction
- ses rotations
- ses déplacements
- son inventaire
- son énergie

Il ne contient aucun code Tkinter.
"""


class Robot:
    """Représente Pyt dans le moteur du jeu."""

    # ========================================================
    # DIRECTIONS
    # ========================================================

    NORTH = "north"
    EAST = "east"
    SOUTH = "south"
    WEST = "west"

    DIRECTIONS = [
        NORTH,
        EAST,
        SOUTH,
        WEST,
    ]

    # ========================================================
    # INITIALISATION
    # ========================================================

    def __init__(
        self,
        row=0,
        col=0,
        direction=EAST
    ):

        self.row = row
        self.col = col

        self.direction = direction

        self.inventory = 0

        self.max_energy = 100
        self.energy = self.max_energy

        self.active = True

        self._validate_direction(
            self.direction
        )

    # ========================================================
    # POSITION
    # ========================================================

    def get_position(self):
        """Retourne la position logique de Pyt."""

        return (
            self.row,
            self.col
        )

    def set_position(
        self,
        row,
        col
    ):
        """Modifie directement la position de Pyt."""

        self.row = row
        self.col = col

    # ========================================================
    # DIRECTION
    # ========================================================

    def _validate_direction(
        self,
        direction
    ):

        if direction not in self.DIRECTIONS:

            raise ValueError(
                f"Direction inconnue : {direction}"
            )

    def get_direction_vector(self):
        """
        Retourne le déplacement correspondant
        à la direction actuelle.

        north = ligne - 1
        east  = colonne + 1
        south = ligne + 1
        west  = colonne - 1
        """

        vectors = {
            self.NORTH: (-1, 0),
            self.EAST: (0, 1),
            self.SOUTH: (1, 0),
            self.WEST: (0, -1),
        }

        return vectors[
            self.direction
        ]

    def get_backward_vector(self):
        """
        Retourne le vecteur opposé à la direction
        actuelle de Pyt.
        """

        row_delta, col_delta = (
            self.get_direction_vector()
        )

        return (
            -row_delta,
            -col_delta
        )

    # ========================================================
    # ROTATIONS
    # ========================================================

    def turn_right(self):
        """Tourne Pyt de 90 degrés vers la droite."""

        index = self.DIRECTIONS.index(
            self.direction
        )

        index = (
            index + 1
        ) % len(
            self.DIRECTIONS
        )

        self.direction = (
            self.DIRECTIONS[
                index
            ]
        )

        return self.direction

    def turn_left(self):
        """Tourne Pyt de 90 degrés vers la gauche."""

        index = self.DIRECTIONS.index(
            self.direction
        )

        index = (
            index - 1
        ) % len(
            self.DIRECTIONS
        )

        self.direction = (
            self.DIRECTIONS[
                index
            ]
        )

        return self.direction

    def turn_around(self):
        """Fait faire un demi-tour à Pyt."""

        self.turn_right()
        self.turn_right()

        return self.direction

    # ========================================================
    # ROTATIONS AVEC ANGLE
    # ========================================================

    def rotate_right(
        self,
        angle=90
    ):
        """
        Tourne vers la droite.

        Normalement runner.py découpe déjà
        right(180) en deux actions de 90 degrés.

        Cette méthode reste néanmoins compatible
        avec plusieurs quarts de tour.
        """

        angle = self._validate_angle(
            angle
        )

        turns = (
            angle // 90
        )

        for _ in range(
            turns
        ):
            self.turn_right()

        return self.direction

    def rotate_left(
        self,
        angle=90
    ):
        """Tourne vers la gauche."""

        angle = self._validate_angle(
            angle
        )

        turns = (
            angle // 90
        )

        for _ in range(
            turns
        ):
            self.turn_left()

        return self.direction

    def _validate_angle(
        self,
        angle
    ):

        if isinstance(
            angle,
            bool
        ):

            raise TypeError(
                "L'angle doit être un entier."
            )

        if not isinstance(
            angle,
            int
        ):

            raise TypeError(
                "L'angle doit être un entier."
            )

        if angle < 0:

            raise ValueError(
                "L'angle ne peut pas être négatif."
            )

        if angle % 90 != 0:

            raise ValueError(
                "L'angle doit être un multiple de 90."
            )

        return angle

    # ========================================================
    # PROCHAINE CASE
    # ========================================================

    def get_forward_position(self):
        """
        Calcule la case située devant Pyt
        sans le déplacer.
        """

        row_delta, col_delta = (
            self.get_direction_vector()
        )

        return (
            self.row + row_delta,
            self.col + col_delta
        )

    def get_backward_position(self):
        """
        Calcule la case située derrière Pyt
        sans le déplacer.
        """

        row_delta, col_delta = (
            self.get_backward_vector()
        )

        return (
            self.row + row_delta,
            self.col + col_delta
        )

    # ========================================================
    # AVANCER
    # ========================================================

    def forward(
        self,
        game,
        steps=1
    ):
        """
        Déplace Pyt vers l'avant.

        Cette méthode reste disponible pour le moteur,
        même si l'animation actuelle utilise surtout
        get_forward_position().
        """

        steps = self._validate_steps(
            steps
        )

        for _ in range(
            steps
        ):

            new_row, new_col = (
                self.get_forward_position()
            )

            moved = game.move_robot_to(
                new_row,
                new_col
            )

            if not moved:
                return False

        return True

    # ========================================================
    # RECULER
    # ========================================================

    def backward(
        self,
        game,
        steps=1
    ):
        """
        Déplace Pyt vers l'arrière.

        Pyt conserve son orientation lorsqu'il recule.
        """

        steps = self._validate_steps(
            steps
        )

        for _ in range(
            steps
        ):

            new_row, new_col = (
                self.get_backward_position()
            )

            moved = game.move_robot_to(
                new_row,
                new_col
            )

            if not moved:
                return False

        return True

    # ========================================================
    # VALIDATION DES PAS
    # ========================================================

    def _validate_steps(
        self,
        steps
    ):

        if isinstance(
            steps,
            bool
        ):

            raise TypeError(
                "Le nombre de cases doit être un entier."
            )

        if not isinstance(
            steps,
            int
        ):

            raise TypeError(
                "Le nombre de cases doit être un entier."
            )

        if steps < 0:

            raise ValueError(
                "Le nombre de cases ne peut pas "
                "être négatif."
            )

        return steps

    # ========================================================
    # INVENTAIRE
    # ========================================================

    def has_object(self):
        """Indique si Pyt transporte un objet."""

        return (
            self.inventory > 0
        )

    def add_object(
        self,
        amount=1
    ):

        if amount < 0:
            return

        self.inventory += amount

    def remove_object(
        self,
        amount=1
    ):

        if amount < 0:
            return False

        if self.inventory < amount:
            return False

        self.inventory -= amount

        return True

    def clear_inventory(self):

        self.inventory = 0

    # ========================================================
    # ÉNERGIE
    # ========================================================

    def recharge(self):

        self.energy = (
            self.max_energy
        )

    def consume_energy(
        self,
        amount=1
    ):

        if amount < 0:
            return True

        if self.energy < amount:

            self.energy = 0

            return False

        self.energy -= amount

        return True

    # ========================================================
    # RESET
    # ========================================================

    def reset(
        self,
        row=0,
        col=0,
        direction=EAST
    ):
        """
        Replace Pyt dans son état initial.
        """

        self._validate_direction(
            direction
        )

        self.row = row
        self.col = col

        self.direction = direction

        self.inventory = 0

        self.energy = (
            self.max_energy
        )

        self.active = True

    # ========================================================
    # ÉTAT
    # ========================================================

    def get_state(self):

        return {
            "row": self.row,
            "col": self.col,

            "position": (
                self.row,
                self.col
            ),

            "direction": (
                self.direction
            ),

            "inventory": (
                self.inventory
            ),

            "energy": (
                self.energy
            ),

            "max_energy": (
                self.max_energy
            ),

            "active": (
                self.active
            ),
        }

    # ========================================================
    # SYMBOLE DE DIRECTION
    # ========================================================

    def get_direction_symbol(self):

        symbols = {
            self.NORTH: "↑",
            self.EAST: "→",
            self.SOUTH: "↓",
            self.WEST: "←",
        }

        return symbols[
            self.direction
        ]

    # ========================================================
    # TEXTE
    # ========================================================

    def __str__(self):

        return (
            "Pyt("
            f"row={self.row}, "
            f"col={self.col}, "
            f"direction={self.direction}"
            ")"
        )