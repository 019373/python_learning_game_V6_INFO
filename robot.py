"""
robot.py
Jeu éducatif Python - Pyt

Ce fichier gère le robot Pyt.

Responsabilités :
- position de Pyt
- orientation de Pyt
- rotations
- calcul de la prochaine case
- inventaire
- énergie
- remise à zéro

Les collisions et les règles du niveau sont gérées
par game.py.
"""


class Robot:
    """Représente Pyt, le robot contrôlé par l'élève."""

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
    # CRÉATION
    # ========================================================

    def __init__(
        self,
        row=0,
        col=0,
        direction=EAST
    ):
        """
        Crée Pyt.

        row :
            ligne actuelle dans la grille

        col :
            colonne actuelle dans la grille

        direction :
            direction dans laquelle Pyt regarde
        """

        self.row = row
        self.col = col

        self.direction = direction

        # Nombre d'objets transportés.
        self.inventory = 0

        # Énergie prévue pour certains niveaux futurs.
        self.max_energy = 100
        self.energy = self.max_energy

        # Indique si Pyt est actuellement actif.
        self.active = True

    # ========================================================
    # POSITION
    # ========================================================

    def get_position(self):
        """
        Retourne la position logique actuelle de Pyt.

        Exemple :
            (3, 5)
        """

        return (
            self.row,
            self.col
        )

    def set_position(self, row, col):
        """
        Change directement la position logique.

        Cette fonction doit surtout être utilisée par
        le moteur du jeu.
        """

        self.row = row
        self.col = col

    # ========================================================
    # DIRECTION
    # ========================================================

    def get_direction_vector(self):
        """
        Retourne le déplacement correspondant à
        l'orientation actuelle.

        north -> ligne - 1
        east  -> colonne + 1
        south -> ligne + 1
        west  -> colonne - 1
        """

        if self.direction == self.NORTH:
            return (-1, 0)

        if self.direction == self.EAST:
            return (0, 1)

        if self.direction == self.SOUTH:
            return (1, 0)

        if self.direction == self.WEST:
            return (0, -1)

        # Sécurité si la direction est invalide.
        return (0, 0)

    def get_backward_vector(self):
        """
        Retourne le vecteur opposé à l'orientation
        actuelle de Pyt.
        """

        row_change, col_change = (
            self.get_direction_vector()
        )

        return (
            -row_change,
            -col_change
        )

    # ========================================================
    # ROTATIONS
    # ========================================================

    def turn_right(self):
        """
        Tourne Pyt de 90 degrés vers la droite.
        """

        current_index = self.DIRECTIONS.index(
            self.direction
        )

        new_index = (
            current_index + 1
        ) % len(self.DIRECTIONS)

        self.direction = self.DIRECTIONS[
            new_index
        ]

    def turn_left(self):
        """
        Tourne Pyt de 90 degrés vers la gauche.
        """

        current_index = self.DIRECTIONS.index(
            self.direction
        )

        new_index = (
            current_index - 1
        ) % len(self.DIRECTIONS)

        self.direction = self.DIRECTIONS[
            new_index
        ]

    def turn_around(self):
        """
        Fait faire un demi-tour à Pyt.
        """

        self.turn_right()
        self.turn_right()

    def rotate_right(self, angle):
        """
        Tourne Pyt vers la droite.

        Les angles autorisés sont des multiples de 90.

        Exemples :
            90
            180
            270
            360
        """

        self._validate_angle(angle)

        number_of_turns = (
            angle // 90
        ) % 4

        for _ in range(number_of_turns):
            self.turn_right()

    def rotate_left(self, angle):
        """
        Tourne Pyt vers la gauche.

        Les angles autorisés sont des multiples de 90.
        """

        self._validate_angle(angle)

        number_of_turns = (
            angle // 90
        ) % 4

        for _ in range(number_of_turns):
            self.turn_left()

    def _validate_angle(self, angle):
        """
        Vérifie qu'un angle est compatible avec
        la grille du jeu.
        """

        if not isinstance(angle, int):
            raise ValueError(
                "L'angle doit être un nombre entier."
            )

        if angle < 0:
            raise ValueError(
                "L'angle ne peut pas être négatif."
            )

        if angle % 90 != 0:
            raise ValueError(
                "Pyt doit tourner par multiples de 90 degrés."
            )

    # ========================================================
    # CALCUL DES DÉPLACEMENTS
    # ========================================================

    def get_forward_position(self):
        """
        Calcule la prochaine case devant Pyt.

        Cette fonction ne déplace PAS directement Pyt.
        game.py doit vérifier que le mouvement est autorisé.
        """

        row_change, col_change = (
            self.get_direction_vector()
        )

        new_row = (
            self.row + row_change
        )

        new_col = (
            self.col + col_change
        )

        return (
            new_row,
            new_col
        )

    def get_backward_position(self):
        """
        Calcule la prochaine case derrière Pyt.

        Pyt recule sans changer son orientation.
        """

        row_change, col_change = (
            self.get_backward_vector()
        )

        new_row = (
            self.row + row_change
        )

        new_col = (
            self.col + col_change
        )

        return (
            new_row,
            new_col
        )

    # ========================================================
    # DÉPLACEMENTS AVEC LE MOTEUR
    # ========================================================

    def forward(self, game, steps=1):
        """
        Fait avancer Pyt.

        Chaque déplacement est envoyé à game.py afin que
        le moteur vérifie les murs, portes, caisses et
        interactions automatiques.
        """

        self._validate_steps(steps)

        for _ in range(steps):

            if not self.active:
                return False

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

    def backward(self, game, steps=1):
        """
        Fait reculer Pyt sans changer son orientation.
        """

        self._validate_steps(steps)

        for _ in range(steps):

            if not self.active:
                return False

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

    def _validate_steps(self, steps):
        """
        Vérifie le nombre de cases demandé.
        """

        if not isinstance(steps, int):
            raise ValueError(
                "Le nombre de cases doit être un entier."
            )

        if steps < 0:
            raise ValueError(
                "Le nombre de cases ne peut pas être négatif."
            )

    # ========================================================
    # INVENTAIRE
    # ========================================================

    def has_object(self):
        """
        Indique si Pyt transporte au moins un objet.
        """

        return self.inventory > 0

    def add_object(self):
        """
        Ajoute un objet à l'inventaire.
        """

        self.inventory += 1

    def remove_object(self):
        """
        Retire un objet de l'inventaire.

        Retourne True si un objet a été retiré.
        """

        if self.inventory <= 0:
            return False

        self.inventory -= 1

        return True

    # ========================================================
    # ÉNERGIE
    # ========================================================

    def recharge(self):
        """
        Recharge complètement Pyt.
        """

        self.energy = self.max_energy

    def use_energy(self, amount=1):
        """
        Retire de l'énergie à Pyt.

        Cette fonction est prête pour de futurs exercices.
        """

        if amount < 0:
            raise ValueError(
                "La quantité d'énergie doit être positive."
            )

        self.energy -= amount

        if self.energy <= 0:
            self.energy = 0
            self.active = False

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
        Remet Pyt dans son état initial.

        game.py appelle cette fonction lorsqu'un niveau
        commence ou recommence.
        """

        if direction not in self.DIRECTIONS:
            direction = self.EAST

        self.row = row
        self.col = col
        self.direction = direction

        self.inventory = 0

        self.energy = self.max_energy

        self.active = True

    # ========================================================
    # INFORMATIONS POUR L'INTERFACE
    # ========================================================

    def get_state(self):
        """
        Retourne l'état actuel de Pyt.

        ui.py pourra lire ces informations sans créer
        une deuxième position indépendante.
        """

        return {
            "row": self.row,
            "col": self.col,
            "direction": self.direction,
            "inventory": self.inventory,
            "energy": self.energy,
            "max_energy": self.max_energy,
            "active": self.active,
        }

    def get_direction_symbol(self):
        """
        Retourne un symbole simple correspondant à
        l'orientation.

        Il pourra être utile pour les premiers tests
        avant d'avoir les sprites définitifs.
        """

        symbols = {
            self.NORTH: "↑",
            self.EAST: "→",
            self.SOUTH: "↓",
            self.WEST: "←",
        }

        return symbols.get(
            self.direction,
            "?"
        )

    # ========================================================
    # AFFICHAGE TEXTE / DEBUG
    # ========================================================

    def __str__(self):
        """
        Représentation simple de Pyt pour le débogage.
        """

        return (
            f"Pyt("
            f"position=({self.row}, {self.col}), "
            f"direction={self.direction}, "
            f"inventaire={self.inventory}, "
            f"energie={self.energy}"
            f")"
        )