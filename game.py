"""
game.py
PYT - Moteur logique du jeu.

Ce fichier gère :
- la grille
- les murs
- les objets
- les portes
- les boutons
- les caisses
- les cases à nettoyer
- les chargeurs
- les objectifs
- les interactions automatiques

IMPORTANT :
game.py ne gère aucune fenêtre Tkinter.
L'affichage de la victoire appartient à ui.py.
"""


class Game:
    """État logique d'un exercice de PYT."""

    # ========================================================
    # TYPES DE CASES
    # ========================================================

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

    # ========================================================
    # INITIALISATION
    # ========================================================

    def __init__(
        self,
        level,
        robot
    ):

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

        self.load_level(
            level
        )

    # ========================================================
    # CHARGEMENT DU NIVEAU
    # ========================================================

    def load_level(
        self,
        level
    ):

        self.level = level

        self.rows = level.get(
            "rows",
            8
        )

        self.cols = level.get(
            "cols",
            10
        )

        self.walls = self._positions_to_set(
            level.get(
                "walls",
                []
            )
        )

        self.objects = self._positions_to_set(
            level.get(
                "objects",
                []
            )
        )

        self.deposits = self._positions_to_set(
            level.get(
                "deposits",
                []
            )
        )

        self.buttons = self._positions_to_set(
            level.get(
                "buttons",
                []
            )
        )

        self.doors = self._positions_to_set(
            level.get(
                "doors",
                []
            )
        )

        self.dirt = self._positions_to_set(
            level.get(
                "dirt",
                []
            )
        )

        self.boxes = self._positions_to_set(
            level.get(
                "boxes",
                []
            )
        )

        self.chargers = self._positions_to_set(
            level.get(
                "chargers",
                []
            )
        )

        goal = level.get(
            "goal"
        )

        if goal is None:
            self.goal = None

        else:
            self.goal = tuple(
                goal
            )

        # ----------------------------------------------------
        # STATISTIQUES
        # ----------------------------------------------------

        self.collected_objects = 0
        self.deposited_objects = 0
        self.cleaned_tiles = 0

        self.activated_buttons = set()

        self.completed = False
        self.failed = False

        self.message = ""

        # ----------------------------------------------------
        # POSITION DE DÉPART
        # ----------------------------------------------------

        start = level.get(
            "start",
            (0, 0)
        )

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

        # Les interactions sur la case de départ
        # peuvent être effectuées automatiquement.
        #
        # Mais on ne valide PAS encore la réussite.
        self.check_automatic_interactions(
            check_completion=False
        )

    # ========================================================
    # CONVERSION POSITIONS
    # ========================================================

    def _positions_to_set(
        self,
        positions
    ):

        result = set()

        for position in positions:

            result.add(
                tuple(
                    position
                )
            )

        return result

    # ========================================================
    # LIMITES
    # ========================================================

    def is_inside(
        self,
        row,
        col
    ):

        return (
            0 <= row < self.rows
            and
            0 <= col < self.cols
        )

    # ========================================================
    # OBSTACLES
    # ========================================================

    def is_wall(
        self,
        row,
        col
    ):

        return (
            row,
            col
        ) in self.walls

    def is_door(
        self,
        row,
        col
    ):

        return (
            row,
            col
        ) in self.doors

    def is_box(
        self,
        row,
        col
    ):

        return (
            row,
            col
        ) in self.boxes

    def is_blocked(
        self,
        row,
        col
    ):

        if not self.is_inside(
            row,
            col
        ):
            return True

        if self.is_wall(
            row,
            col
        ):
            return True

        if self.is_door(
            row,
            col
        ):
            return True

        if self.is_box(
            row,
            col
        ):
            return True

        return False

    def can_move_to(
        self,
        row,
        col
    ):

        return not self.is_blocked(
            row,
            col
        )

    # ========================================================
    # DÉPLACEMENT DU ROBOT
    # ========================================================

    def move_robot_to(
        self,
        row,
        col
    ):
        """
        Déplace Pyt sur une case.

        Cette méthode :
        - vérifie les collisions
        - déplace Pyt
        - déclenche les interactions automatiques

        Elle ne déclenche aucun message Tkinter.
        """

        if not self.is_inside(
            row,
            col
        ):

            self.message = (
                "Pyt ne peut pas sortir de la carte."
            )

            return False

        if self.is_wall(
            row,
            col
        ):

            self.message = (
                "Pyt est bloqué par un mur."
            )

            return False

        if self.is_door(
            row,
            col
        ):

            self.message = (
                "La porte est fermée."
            )

            return False

        # ----------------------------------------------------
        # CAISSE
        # ----------------------------------------------------

        if self.is_box(
            row,
            col
        ):

            pushed = self.try_push_box(
                row,
                col
            )

            if not pushed:

                self.message = (
                    "Pyt ne peut pas pousser "
                    "cette caisse."
                )

                return False

        # ----------------------------------------------------
        # DÉPLACEMENT
        # ----------------------------------------------------

        self.robot.row = row
        self.robot.col = col

        self.message = ""

        # Interactions automatiques.
        self.check_automatic_interactions(
            check_completion=True
        )

        return True

    # ========================================================
    # POUSSER UNE CAISSE
    # ========================================================

    def try_push_box(
        self,
        box_row,
        box_col
    ):
        """
        Pousse une caisse dans la direction
        vers laquelle Pyt regarde.

        Cette mécanique sera surtout utile
        pour des missions futures.
        """

        delta_row, delta_col = (
            self.robot
            .get_direction_vector()
        )

        new_row = (
            box_row
            + delta_row
        )

        new_col = (
            box_col
            + delta_col
        )

        if not self.is_inside(
            new_row,
            new_col
        ):
            return False

        if self.is_wall(
            new_row,
            new_col
        ):
            return False

        if self.is_door(
            new_row,
            new_col
        ):
            return False

        if self.is_box(
            new_row,
            new_col
        ):
            return False

        old_position = (
            box_row,
            box_col
        )

        new_position = (
            new_row,
            new_col
        )

        self.boxes.remove(
            old_position
        )

        self.boxes.add(
            new_position
        )

        return True

    # ========================================================
    # INTERACTIONS AUTOMATIQUES
    # ========================================================

    def check_automatic_interactions(
        self,
        check_completion=True
    ):

        position = (
            self.robot.row,
            self.robot.col
        )

        if position in self.objects:

            self.collect_object(
                position
            )

        if position in self.deposits:

            self.deposit_object(
                position
            )

        if position in self.dirt:

            self.clean_tile(
                position
            )

        if position in self.buttons:

            self.activate_button(
                position
            )

        if position in self.chargers:

            self.recharge_robot()

        # On peut mettre completed à True ici,
        # mais aucune fenêtre de victoire n'est affichée.
        #
        # ui.py attend la fin de l'animation
        # avant d'appeler handle_success().
        if check_completion:

            self.check_success()

    # ========================================================
    # RAMASSAGE AUTOMATIQUE
    # ========================================================

    def collect_object(
        self,
        position
    ):

        if position not in self.objects:
            return

        self.objects.remove(
            position
        )

        self.collected_objects += 1

        if hasattr(
            self.robot,
            "inventory"
        ):

            self.robot.inventory += 1

        self.message = (
            "Pyt a ramassé un objet."
        )

    # ========================================================
    # DÉPÔT AUTOMATIQUE
    # ========================================================

    def deposit_object(
        self,
        position
    ):

        if not hasattr(
            self.robot,
            "inventory"
        ):
            return

        if self.robot.inventory <= 0:
            return

        self.robot.inventory -= 1

        self.deposited_objects += 1

        self.message = (
            "Pyt a déposé un objet."
        )

    # ========================================================
    # NETTOYAGE AUTOMATIQUE
    # ========================================================

    def clean_tile(
        self,
        position
    ):

        if position not in self.dirt:
            return

        self.dirt.remove(
            position
        )

        self.cleaned_tiles += 1

        self.message = (
            "Pyt a nettoyé la case."
        )

    # ========================================================
    # BOUTON
    # ========================================================

    def activate_button(
        self,
        position
    ):

        if position in self.activated_buttons:
            return

        self.activated_buttons.add(
            position
        )

        # Pour l'instant, un bouton ouvre
        # toutes les portes du niveau.
        if self.doors:

            self.doors.clear()

        self.message = (
            "Pyt a activé un mécanisme."
        )

    # ========================================================
    # CHARGEUR
    # ========================================================

    def recharge_robot(self):

        if hasattr(
            self.robot,
            "energy"
        ):

            if hasattr(
                self.robot,
                "max_energy"
            ):

                self.robot.energy = (
                    self.robot.max_energy
                )

        self.message = (
            "Pyt est rechargé."
        )

    # ========================================================
    # CRISTAL
    # ========================================================

    def robot_is_on_goal(self):

        if self.goal is None:
            return False

        return (
            self.robot.row,
            self.robot.col
        ) == self.goal

    # ========================================================
    # RÉUSSITE
    # ========================================================

    def check_success(self):
        """
        Vérifie si l'objectif logique est réussi.

        IMPORTANT :
        cette méthode ne crée aucun messagebox.
        ui.py décide quand annoncer la réussite.
        """

        objective = self.level.get(
            "objective",
            "reach_goal"
        )

        success = False

        # ----------------------------------------------------
        # ATTEINDRE LE CRISTAL
        # ----------------------------------------------------

        if objective == "reach_goal":

            success = (
                self.robot_is_on_goal()
            )

        # ----------------------------------------------------
        # RAMASSER TOUS LES OBJETS
        # ----------------------------------------------------

        elif objective == "collect_all":

            success = (
                len(self.objects) == 0
            )

        # ----------------------------------------------------
        # NETTOYER
        # ----------------------------------------------------

        elif objective == "clean_all":

            success = (
                len(self.dirt) == 0
            )

        # ----------------------------------------------------
        # BOUTONS
        # ----------------------------------------------------

        elif objective == "activate_all":

            success = (
                len(
                    self.activated_buttons
                )
                >=
                len(
                    self.buttons
                )
                and
                len(
                    self.buttons
                ) > 0
            )

        # ----------------------------------------------------
        # DÉPÔT
        # ----------------------------------------------------

        elif objective == "deposit":

            required = self.level.get(
                "required_deposits",
                1
            )

            success = (
                self.deposited_objects
                >= required
            )

        # ----------------------------------------------------
        # CAISSES
        # ----------------------------------------------------

        elif objective == "boxes":

            targets = (
                self._positions_to_set(
                    self.level.get(
                        "box_targets",
                        []
                    )
                )
            )

            success = (
                len(targets) > 0
                and
                targets.issubset(
                    self.boxes
                )
            )

        # ----------------------------------------------------
        # OBJECTIF COMBINÉ
        # ----------------------------------------------------

        elif objective == "combined":

            success = (
                self.robot_is_on_goal()
                and
                len(self.objects) == 0
                and
                len(self.dirt) == 0
            )

        # ----------------------------------------------------
        # RÉSULTAT
        # ----------------------------------------------------

        self.completed = bool(
            success
        )

        return self.completed

    # ========================================================
    # TYPE D'UNE CASE
    # ========================================================

    def get_tile_type(
        self,
        row,
        col
    ):

        position = (
            row,
            col
        )

        # Obstacles prioritaires.
        if position in self.walls:
            return self.WALL

        if position in self.doors:
            return self.DOOR

        if position in self.boxes:
            return self.BOX

        # Interactions.
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

        # Objectif.
        if self.goal == position:
            return self.GOAL

        return self.EMPTY

    # ========================================================
    # ÉTAT COMPLET
    # ========================================================

    def get_state(self):

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

            "walls": set(
                self.walls
            ),

            "objects": set(
                self.objects
            ),

            "deposits": set(
                self.deposits
            ),

            "buttons": set(
                self.buttons
            ),

            "doors": set(
                self.doors
            ),

            "dirt": set(
                self.dirt
            ),

            "boxes": set(
                self.boxes
            ),

            "chargers": set(
                self.chargers
            ),

            "goal": self.goal,

            "completed": (
                self.completed
            ),

            "failed": (
                self.failed
            ),

            "message": (
                self.message
            ),

            "collected_objects": (
                self.collected_objects
            ),

            "deposited_objects": (
                self.deposited_objects
            ),

            "cleaned_tiles": (
                self.cleaned_tiles
            ),

            "activated_buttons": set(
                self.activated_buttons
            ),
        }

    # ========================================================
    # RESET
    # ========================================================

    def reset(self):
        """
        Replace entièrement l'exercice
        dans son état initial.
        """

        self.load_level(
            self.level
        )