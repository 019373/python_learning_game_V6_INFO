"""
runner.py
PYT - Exécution du code Python de l'élève.

Principe :
1. Le code Python de l'élève est vérifié.
2. Il est exécuté sans déplacer immédiatement Pyt.
3. Les commandes forward(), backward(), left() et right()
   sont transformées en une liste d'actions.
4. ui.py joue ensuite ces actions une par une.

Exemple :

    forward(3)
    right(90)
    forward(2)

devient :

    [
        ("forward", 1),
        ("forward", 1),
        ("forward", 1),
        ("right", 90),
        ("forward", 1),
        ("forward", 1),
    ]

Cela permet d'animer Pyt sans bloquer Tkinter.
"""

import ast
import math
import sys


class Runner:
    """Analyse et prépare le programme de l'élève."""

    def __init__(self, game):

        self.game = game
        self.robot = game.robot

        self.output = []
        self.actions = []

        self.last_error = None

        self.running = False

        # Nombre maximal d'actions de Pyt.
        self.max_actions = 500

        # Protection contre les programmes
        # qui exécutent énormément de Python.
        self.max_python_steps = 50000

        self.python_steps = 0

    # ========================================================
    # COMMANDES PYT
    # ========================================================

    def forward(self, distance=1):
        """
        Ajoute des déplacements vers l'avant.

        forward(3) devient trois actions distinctes.
        """

        distance = self._validate_distance(
            distance
        )

        for _ in range(distance):

            self._add_action(
                "forward",
                1
            )

        return True

    def backward(self, distance=1):
        """
        Ajoute des déplacements vers l'arrière.
        """

        distance = self._validate_distance(
            distance
        )

        for _ in range(distance):

            self._add_action(
                "backward",
                1
            )

        return True

    def right(self, angle=90):
        """
        Ajoute une ou plusieurs rotations à droite.

        right(180) devient :
            right(90)
            right(90)

        Ainsi chaque quart de tour pourra prendre
        deux secondes dans l'interface.
        """

        angle = self._validate_angle(
            angle
        )

        turns = angle // 90

        for _ in range(turns):

            self._add_action(
                "right",
                90
            )

        return True

    def left(self, angle=90):
        """
        Ajoute une ou plusieurs rotations à gauche.
        """

        angle = self._validate_angle(
            angle
        )

        turns = angle // 90

        for _ in range(turns):

            self._add_action(
                "left",
                90
            )

        return True

    # ========================================================
    # AJOUT D'UNE ACTION
    # ========================================================

    def _add_action(
        self,
        action_type,
        value
    ):

        if (
            len(self.actions)
            >= self.max_actions
        ):
            raise RuntimeError(
                "Ton programme demande trop d'actions à Pyt."
            )

        self.actions.append(
            (
                action_type,
                value
            )
        )

    # ========================================================
    # VALIDATION DISTANCE
    # ========================================================

    def _validate_distance(
        self,
        distance
    ):

        if isinstance(
            distance,
            bool
        ):
            raise TypeError(
                "La distance doit être un nombre entier."
            )

        if not isinstance(
            distance,
            int
        ):
            raise TypeError(
                "La distance doit être un nombre entier."
            )

        if distance < 0:
            raise ValueError(
                "La distance ne peut pas être négative."
            )

        if distance > 100:
            raise ValueError(
                "Cette distance est trop grande."
            )

        return distance

    # ========================================================
    # VALIDATION ANGLE
    # ========================================================

    def _validate_angle(
        self,
        angle
    ):

        if isinstance(
            angle,
            bool
        ):
            raise TypeError(
                "L'angle doit être un nombre entier."
            )

        if not isinstance(
            angle,
            int
        ):
            raise TypeError(
                "L'angle doit être un nombre entier."
            )

        if angle < 0:
            raise ValueError(
                "L'angle ne peut pas être négatif."
            )

        if angle % 90 != 0:
            raise ValueError(
                "L'angle doit être un multiple de 90."
            )

        if angle > 3600:
            raise ValueError(
                "L'angle est trop grand."
            )

        return angle

    # ========================================================
    # PRINT
    # ========================================================

    def game_print(
        self,
        *values,
        sep=" ",
        end="\n"
    ):
        """
        Remplace print().

        Le texte sera affiché dans la console
        de la fenêtre de code.
        """

        text = sep.join(
            str(value)
            for value in values
        )

        self.output.append(
            text + end
        )

    # ========================================================
    # ENVIRONNEMENT PYTHON
    # ========================================================

    def create_environment(self):
        """
        Crée l'environnement Python disponible
        pour l'élève.
        """

        safe_builtins = {

            # Affichage
            "print": self.game_print,

            # Types
            "int": int,
            "float": float,
            "str": str,
            "bool": bool,

            # Calculs
            "round": round,
            "min": min,
            "max": max,
            "abs": abs,
            "pow": pow,

            # Collections
            "len": len,
            "range": range,
            "enumerate": enumerate,

            "list": list,
            "tuple": tuple,

            "sum": sum,
            "sorted": sorted,
        }

        environment = {

            "__builtins__": safe_builtins,

            # Commandes de Pyt
            "forward": self.forward,
            "backward": self.backward,
            "left": self.left,
            "right": self.right,

            # Mathématiques simples
            "sqrt": math.sqrt,
            "floor": math.floor,
            "ceil": math.ceil,
        }

        return environment

    # ========================================================
    # VÉRIFICATION DU CODE
    # ========================================================

    def check_code(
        self,
        code
    ):
        """
        Vérifie le programme avant exécution.
        """

        if not isinstance(
            code,
            str
        ):
            raise TypeError(
                "Le programme doit être du texte."
            )

        if not code.strip():
            return

        try:

            tree = ast.parse(
                code,
                mode="exec"
            )

        except SyntaxError as error:

            raise SyntaxError(
                self._format_syntax_error(
                    error
                )
            )

        forbidden_nodes = (
            ast.Import,
            ast.ImportFrom,

            ast.With,
            ast.AsyncWith,

            ast.AsyncFunctionDef,
            ast.Await,

            ast.Lambda,
            ast.ClassDef,

            ast.Global,
            ast.Nonlocal,

            ast.Delete,
        )

        for node in ast.walk(
            tree
        ):

            if isinstance(
                node,
                forbidden_nodes
            ):

                raise ValueError(
                    "Cette instruction n'est pas "
                    "disponible dans PYT."
                )

            # Bloque __import__, __class__, etc.
            if isinstance(
                node,
                ast.Name
            ):

                if node.id.startswith(
                    "__"
                ):
                    raise ValueError(
                        "Ce nom n'est pas autorisé."
                    )

            if isinstance(
                node,
                ast.Attribute
            ):

                if node.attr.startswith(
                    "__"
                ):
                    raise ValueError(
                        "Cet attribut n'est pas autorisé."
                    )

    # ========================================================
    # PROTECTION CONTRE BOUCLES INFINIES
    # ========================================================

    def _trace_execution(
        self,
        frame,
        event,
        arg
    ):
        """
        Compte les lignes Python exécutées.

        Exemple dangereux :

            while True:
                x = 1

        sera arrêté.
        """

        if event == "line":

            self.python_steps += 1

            if (
                self.python_steps
                > self.max_python_steps
            ):

                raise RuntimeError(
                    "Le programme a été arrêté : "
                    "il semble contenir une boucle infinie "
                    "ou trop d'instructions."
                )

        return self._trace_execution

    # ========================================================
    # PRÉPARATION DU PROGRAMME
    # ========================================================

    def prepare(
        self,
        code
    ):
        """
        Analyse et exécute le Python de l'élève
        uniquement pour fabriquer la liste d'actions.

        Pyt ne bouge PAS ici.
        """

        self.output = []
        self.actions = []

        self.last_error = None

        self.python_steps = 0

        self.running = True

        try:

            self.check_code(
                code
            )

            if not code.strip():

                return self._create_result()

            environment = (
                self.create_environment()
            )

            compiled_code = compile(
                code,
                "<programme de l'élève>",
                "exec"
            )

            sys.settrace(
                self._trace_execution
            )

            try:

                exec(
                    compiled_code,
                    environment,
                    environment
                )

            finally:

                sys.settrace(
                    None
                )

        except SyntaxError as error:

            self.last_error = str(
                error
            )

        except NameError as error:

            self.last_error = (
                self._format_name_error(
                    error
                )
            )

        except TypeError as error:

            self.last_error = (
                "Erreur de type : "
                + str(error)
            )

        except ValueError as error:

            self.last_error = (
                "Erreur : "
                + str(error)
            )

        except RuntimeError as error:

            self.last_error = str(
                error
            )

        except Exception as error:

            self.last_error = (
                "Erreur Python : "
                + str(error)
            )

        finally:

            sys.settrace(
                None
            )

            self.running = False

        return self._create_result()

    # ========================================================
    # COMPATIBILITÉ
    # ========================================================

    def run(
        self,
        code
    ):
        """
        Alias temporaire de prepare().

        Cela évite de casser immédiatement un ancien ui.py
        qui appelle encore runner.run(code).

        ATTENTION :
        cette fonction prépare seulement les actions.
        Elle ne déplace plus directement Pyt.
        """

        return self.prepare(
            code
        )

    # ========================================================
    # RÉSULTAT
    # ========================================================

    def _create_result(
        self
    ):

        return {

            "success": (
                self.last_error
                is None
            ),

            "error": (
                self.last_error
            ),

            "output": "".join(
                self.output
            ),

            # Copie de la liste pour éviter
            # qu'elle soit modifiée de l'extérieur.
            "actions": list(
                self.actions
            ),

            "action_count": len(
                self.actions
            ),

            # La réussite ne peut plus être connue ici.
            # Elle sera vérifiée APRÈS l'animation.
            "level_completed": False,
        }

    # ========================================================
    # ERREURS
    # ========================================================

    def _format_syntax_error(
        self,
        error
    ):

        if error.lineno is None:

            return (
                "Erreur de syntaxe."
            )

        return (
            "Erreur de syntaxe "
            f"à la ligne {error.lineno}."
        )

    def _format_name_error(
        self,
        error
    ):

        message = str(
            error
        )

        return (
            "Nom inconnu : "
            + message
        )

    # ========================================================
    # RESET
    # ========================================================

    def reset(
        self
    ):
        """
        Réinitialise le Runner et le niveau.
        """

        self.output = []
        self.actions = []

        self.last_error = None

        self.python_steps = 0

        self.running = False

        self.game.reset()