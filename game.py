"""
game.py
Moteur principal du jeu Pyt.

Ce fichier gère :
- la carte logique
- les limites de la grille
- les murs
- les objets
- les cases spéciales
- les interactions automatiques
- la réussite du niveau

Il ne gère PAS :
- l'affichage Tkinter
- le Canvas
- la fenêtre de code
- l'exécution du code Python de l'élève
"""


class Game:
    """Représente l'état logique d'un niveau."""

    EMPTY = 0
    WALL = 1
    GOAL = 2
    OBJECT = 3
    DEPOSIT = 4
    BUTTON = 5
    DOOR = 6
    DIRT = 7
    BOX = 8
    CHARGER = 9

    def __init__(self, level, robot):
        """
        Crée une partie à partir d'un niveau.

        level :
            dictionnaire provenant de levels.py

        robot :
            objet Robot provenant de robot.py
        """

        self.level = level
        self.robot = robot

        self.rows = 0
        self.cols = 0

        self.walls = set()
        self.objects = set()
        self.deposits = set()
        self.buttons = set()
        self.doors = set()
        self.dirt = set()
        self.boxes = set()
        self.chargers = set()

        self.goal = None

        self.collected_objects = 0
        self.deposited_objects = 0
        self.cleaned_tiles = 0
        self.activated_buttons = set()

        self.completed = False
        self.failed = False

        self.message = ""

        self.load_level(level)

    # ---------------------------------------------------------
    # CHARGEMENT DU NIVEAU
    # ---------------------------------------------------------

    def load_level(self, level):
        """Charge toutes les données nécessaires au niveau."""

        self.level = level

        self.rows = level.get("rows", 8)
        self.cols = level.get("cols", 10)

        self.walls = self._positions_to_set(
            level.get("walls", [])
        )

        self.objects = self._positions_to_set(
            level.get("objects", [])
        )

        self.deposits = self._positions_to_set(
            level.get("deposits", [])
        )

        self.buttons = self._positions_to_set(
            level.get("buttons", [])
        )

        self.doors = self._positions_to_set(
            level.get("doors", [])
        )

        self.dirt = self._positions_to_set(
            level.get("dirt", [])
        )

        self.boxes = self._positions_to_set(
            level.get("boxes", [])
        )

        self.chargers = self._positions_to_set(
            level.get("chargers", [])
        )

        goal = level.get("goal")

        if goal is None:
            self.goal = None
        else:
            self.goal = tuple(goal)

        self.collected_objects = 0
        self.deposited_objects = 0
        self.cleaned_tiles = 0
        self.activated_buttons = set()

        self.completed = False
        self.failed = False

        self.message = ""

        start = level.get("start", (0, 0))

        start_row = start[0]
        start_col = start[1]

        start_direction = level.get(
            "start_direction",
            "east"
        )

        self.robot.reset(
            start_row,
            start_col,
            start_direction
        )

        self.check_automatic_interactions()

    def _positions_to_set(self, positions):
        """
        Transforme une liste de positions en ensemble de tuples.

        Exemple :
        [[1, 2], [3, 4]]

        devient :
        {(1, 2), (3, 4)}
        """

        result = set()

        for position in positions:
            result.add(tuple(position))

        return result

    # ---------------------------------------------------------
    # INFORMATIONS SUR LA CARTE
    # ---------------------------------------------------------

    def is_inside(self, row, col):
        """Vérifie qu'une position est dans la grille."""

        return (
            0 <= row < self.rows
            and 0 <= col < self.cols
        )

    def is_wall(self, row, col):
        """Retourne True si la case contient un mur."""

        return (row, col) in self.walls

    def is_door(self, row, col):
        """Retourne True si la case contient une porte fermée."""

        return (row, col) in self.doors

    def is_box(self, row, col):
        """Retourne True si la case contient une caisse."""

        return (row, col) in self.boxes

    def is_blocked(self, row, col):
        """
        Vérifie si Pyt ne peut pas entrer sur cette case.
        """

        if not self.is_inside(row, col):
            return True

        if self.is_wall(row, col):
            return True

        if self.is_door(row, col):
            return True

        if self.is_box(row, col):
            return True

        return False

    def can_move_to(self, row, col):
        """Retourne True si Pyt peut aller sur la case."""

        return not self.is_blocked(row, col)

    # ---------------------------------------------------------
    # DÉPLACEMENT
    # ---------------------------------------------------------

    def move_robot_to(self, row, col):
        """
        Demande au moteur de déplacer Pyt vers une position.

        Cette fonction ne décide pas de la direction.
        Elle reçoit simplement la prochaine case calculée
        par robot.py.
        """

        if not self.is_inside(row, col):
            self.message = (
                "Pyt ne peut pas sortir de la carte."
            )
            return False

        if self.is_wall(row, col):
            self.message = (
                "Pyt est bloqué par un mur."
            )
            return False

        if self.is_door(row, col):
            self.message = (
                "La porte est fermée."
            )
            return False

        if self.is_box(row, col):
            pushed = self.try_push_box(row, col)

            if not pushed:
                self.message = (
                    "Pyt ne peut pas pousser cette caisse."
                )
                return False

        self.robot.row = row
        self.robot.col = col

        self.message = ""

        self.check_automatic_interactions()
        self.check_success()

        return True

    # ---------------------------------------------------------
    # CAISSES
    # ---------------------------------------------------------

    def try_push_box(self, box_row, box_col):
        """
        Essaie de pousser automatiquement une caisse.

        La caisse est poussée dans la direction actuelle
        de Pyt.
        """

        delta_row, delta_col = (
            self.robot.get_direction_vector()
        )

        new_row = box_row + delta_row
        new_col = box_col + delta_col

        if not self.is_inside(new_row, new_col):
            return False

        if self.is_wall(new_row, new_col):
            return False

        if self.is_door(new_row, new_col):
            return False

        if self.is_box(new_row, new_col):
            return False

        old_position = (box_row, box_col)
        new_position = (new_row, new_col)

        self.boxes.remove(old_position)
        self.boxes.add(new_position)

        return True

    # ---------------------------------------------------------
    # INTERACTIONS AUTOMATIQUES
    # ---------------------------------------------------------

    def check_automatic_interactions(self):
        """
        Lance automatiquement les interactions correspondant
        à la case sur laquelle se trouve Pyt.
        """

        position = (
            self.robot.row,
            self.robot.col
        )

        if position in self.objects:
            self.collect_object(position)

        if position in self.deposits:
            self.deposit_object(position)

        if position in self.dirt:
            self.clean_tile(position)

        if position in self.buttons:
            self.activate_button(position)

        if position in self.chargers:
            self.recharge_robot()

        self.check_success()

    def collect_object(self, position):
        """Ramasse automatiquement un objet."""

        if position not in self.objects:
            return

        self.objects.remove(position)

        self.collected_objects += 1

        if hasattr(self.robot, "inventory"):
            self.robot.inventory += 1

        self.message = (
            "Pyt a ramassé un objet."
        )

    def deposit_object(self, position):
        """
        Dépose automatiquement un objet si Pyt en possède un.
        """

        if not hasattr(self.robot, "inventory"):
            return

        if self.robot.inventory <= 0:
            return

        self.robot.inventory -= 1
        self.deposited_objects += 1

        self.message = (
            "Pyt a déposé un objet."
        )

    def clean_tile(self, position):
        """Nettoie automatiquement une case sale."""

        if position not in self.dirt:
            return

        self.dirt.remove(position)

        self.cleaned_tiles += 1

        self.message = (
            "Pyt a nettoyé la case."
        )

    def activate_button(self, position):
        """
        Active automatiquement un bouton.

        Pour le MVP, un bouton peut ouvrir toutes les portes
        du niveau.
        """

        if position in self.activated_buttons:
            return

        self.activated_buttons.add(position)

        if len(self.doors) > 0:
            self.doors.clear()

        self.message = (
            "Pyt a activé un mécanisme."
        )

    def recharge_robot(self):
        """Recharge automatiquement Pyt."""

        if hasattr(self.robot, "energy"):
            if hasattr(self.robot, "max_energy"):
                self.robot.energy = self.robot.max_energy

        self.message = (
            "Pyt est rechargé."
        )

    # ---------------------------------------------------------
    # OBJECTIF
    # ---------------------------------------------------------

    def robot_is_on_goal(self):
        """Vérifie si Pyt se trouve sur la destination."""

        if self.goal is None:
            return False

        return (
            self.robot.row,
            self.robot.col
        ) == self.goal

    def check_success(self):
        """
        Vérifie la condition de réussite du niveau.

        Plusieurs types d'objectifs sont prévus afin que
        levels.py puisse créer différents exercices sans
        déplacer la logique dans l'interface.
        """

        objective = self.level.get(
            "objective",
            "reach_goal"
        )

        if objective == "reach_goal":
            success = self.robot_is_on_goal()

        elif objective == "collect_all":
            success = (
                len(self.objects) == 0
            )

        elif objective == "clean_all":
            success = (
                len(self.dirt) == 0
            )

        elif objective == "activate_all":
            success = (
                len(self.activated_buttons)
                >= len(self.buttons)
            )

        elif objective == "deposit":
            required = self.level.get(
                "required_deposits",
                1
            )

            success = (
                self.deposited_objects
                >= required
            )

        elif objective == "boxes":
            targets = self._positions_to_set(
                self.level.get(
                    "box_targets",
                    []
                )
            )

            success = (
                len(targets) > 0
                and targets.issubset(self.boxes)
            )

        elif objective == "combined":
            success = (
                self.robot_is_on_goal()
                and len(self.objects) == 0
                and len(self.dirt) == 0
            )

        else:
            success = False

        if success:
            self.completed = True

            self.message = (
                "Niveau réussi !"
            )

        return success

    # ---------------------------------------------------------
    # ÉTAT POUR L'INTERFACE
    # ---------------------------------------------------------

    def get_tile_type(self, row, col):
        """
        Donne à ui.py le contenu logique d'une case.

        ui.py pourra ensuite décider comment dessiner
        graphiquement cette information.
        """

        position = (row, col)

        if position in self.walls:
            return self.WALL

        if position in self.doors:
            return self.DOOR

        if position in self.boxes:
            return self.BOX

        if position in self.objects:
            return self.OBJECT

        if position in self.deposits:
            return self.DEPOSIT

        if position in self.buttons:
            return self.BUTTON

        if position in self.dirt:
            return self.DIRT

        if position in self.chargers:
            return self.CHARGER

        if self.goal == position:
            return self.GOAL

        return self.EMPTY

    def get_state(self):
        """
        Retourne une copie simple de l'état actuel.

        Utile pour ui.py sans lui demander de recréer
        une deuxième logique de jeu.
        """

        return {
            "rows": self.rows,
            "cols": self.cols,

            "robot_position": (
                self.robot.row,
                self.robot.col
            ),

            "robot_direction": (
                self.robot.direction
            ),

            "walls": set(self.walls),
            "objects": set(self.objects),
            "deposits": set(self.deposits),
            "buttons": set(self.buttons),
            "doors": set(self.doors),
            "dirt": set(self.dirt),
            "boxes": set(self.boxes),
            "chargers": set(self.chargers),

            "goal": self.goal,

            "completed": self.completed,
            "failed": self.failed,

            "message": self.message,

            "collected_objects":
                self.collected_objects,

            "deposited_objects":
                self.deposited_objects,

            "cleaned_tiles":
                self.cleaned_tiles,
        }

    # ---------------------------------------------------------
    # RESET
    # ---------------------------------------------------------

    def reset(self):
        """
        Remet entièrement le niveau dans son état initial.
        """

        self.load_level(self.level)