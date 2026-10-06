"""
runner.py
Exécution du code Python écrit par l'élève.

Ce fichier :
- vérifie le code
- fournit les commandes de Pyt
- exécute le programme
- récupère les erreurs
- limite les programmes trop longs

Les commandes de déplacement sont :
    forward()
    backward()
    left()
    right()
"""

import ast
import math
import sys


class Runner:
    """Exécute le code Python de l'élève."""

    def __init__(self, game):
        self.game = game
        self.robot = game.robot

        self.output = []
        self.last_error = None
        self.running = False

        # Sécurité générale.
        self.max_operations = 10000
        self.operation_count = 0

        # Sécurité contre les boucles infinies.
        # Le compteur Python compte les lignes exécutées.
        self.max_python_steps = 50000
        self.python_steps = 0

    # ========================================================
    # COMMANDES DE PYT
    # ========================================================

    def forward(self, distance=1):
        """
        Fait avancer Pyt.

        Exemple :
            forward(3)
        """

        distance = self._validate_distance(
            distance
        )

        for _ in range(distance):
            self._count_operation()

            moved = self.robot.forward(
                self.game,
                1
            )

            if not moved:
                return False

        return True

    def backward(self, distance=1):
        """
        Fait reculer Pyt.

        Exemple :
            backward(2)
        """

        distance = self._validate_distance(
            distance
        )

        for _ in range(distance):
            self._count_operation()

            moved = self.robot.backward(
                self.game,
                1
            )

            if not moved:
                return False

        return True

    def right(self, angle=90):
        """
        Tourne Pyt vers la droite.

        Exemple :
            right(90)
        """

        self._count_operation()

        angle = self._validate_angle(
            angle
        )

        self.robot.rotate_right(
            angle
        )

        return True

    def left(self, angle=90):
        """
        Tourne Pyt vers la gauche.

        Exemple :
            left(90)
        """

        self._count_operation()

        angle = self._validate_angle(
            angle
        )

        self.robot.rotate_left(
            angle
        )

        return True

    # ========================================================
    # VALIDATION DES VALEURS
    # ========================================================

    def _validate_distance(self, distance):

        if isinstance(distance, bool):
            raise TypeError(
                "La distance doit être un nombre entier."
            )

        if not isinstance(distance, int):
            raise TypeError(
                "La distance doit être un nombre entier."
            )

        if distance < 0:
            raise ValueError(
                "La distance ne peut pas être négative."
            )

        # Évite qu'un élève écrive par accident
        # forward(999999999).
        if distance > 1000:
            raise ValueError(
                "La distance est trop grande."
            )

        return distance

    def _validate_angle(self, angle):

        if isinstance(angle, bool):
            raise TypeError(
                "L'angle doit être un nombre entier."
            )

        if not isinstance(angle, int):
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
        Remplace print() afin d'afficher le résultat
        dans la console du jeu.
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
        Crée l'environnement dans lequel
        le programme de l'élève est exécuté.
        """

        safe_builtins = {
            "print": self.game_print,

            "int": int,
            "float": float,
            "str": str,
            "bool": bool,

            "round": round,
            "min": min,
            "max": max,
            "abs": abs,
            "pow": pow,

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

            # Quelques fonctions mathématiques
            # utiles pour les futurs chapitres.
            "sqrt": math.sqrt,
            "floor": math.floor,
            "ceil": math.ceil,
        }

        return environment

    # ========================================================
    # VÉRIFICATION DU CODE
    # ========================================================

    def check_code(self, code):
        """
        Vérifie le programme avant son exécution.
        """

        if not isinstance(code, str):
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

        for node in ast.walk(tree):

            if isinstance(
                node,
                forbidden_nodes
            ):
                raise ValueError(
                    "Cette instruction n'est pas "
                    "disponible dans PYT."
                )

            # Bloque les noms spéciaux Python
            # comme __import__.
            if isinstance(
                node,
                ast.Name
            ):
                if node.id.startswith("__"):
                    raise ValueError(
                        "Ce nom n'est pas autorisé."
                    )

            # Autorise par exemple :
            # liste.append(...)
            #
            # mais bloque les attributs spéciaux
            # comme objet.__class__.
            if isinstance(
                node,
                ast.Attribute
            ):
                if node.attr.startswith("__"):
                    raise ValueError(
                        "Cet attribut n'est pas autorisé."
                    )

    # ========================================================
    # PROTECTION CONTRE LES BOUCLES INFINIES
    # ========================================================

    def _trace_execution(
        self,
        frame,
        event,
        arg
    ):
        """
        Compte les lignes Python exécutées.

        Cela permet d'arrêter par exemple :

            while True:
                x = 1

        au lieu de bloquer complètement l'interface.
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
    # EXÉCUTION
    # ========================================================

    def run(self, code):
        """
        Exécute le programme de l'élève.

        Retourne un dictionnaire contenant :
        - l'erreur éventuelle
        - la sortie print()
        - la réussite du niveau
        """

        self.output = []
        self.last_error = None

        self.operation_count = 0
        self.python_steps = 0

        self.running = True

        try:
            self.check_code(
                code
            )

            environment = (
                self.create_environment()
            )

            compiled_code = compile(
                code,
                "<programme de l'élève>",
                "exec"
            )

            # Active temporairement la protection
            # contre les boucles infinies.
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
                # IMPORTANT :
                # toujours désactiver le traceur.
                sys.settrace(
                    None
                )

            self.game.check_success()

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
            # Sécurité supplémentaire :
            # le traceur ne doit jamais rester actif.
            sys.settrace(
                None
            )

            self.running = False

        return self._create_result()

    # ========================================================
    # COMPTEUR D'OPÉRATIONS
    # ========================================================

    def _count_operation(self):

        self.operation_count += 1

        if (
            self.operation_count
            > self.max_operations
        ):
            raise RuntimeError(
                "Le programme a effectué trop "
                "d'actions avec Pyt."
            )

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
    # RÉSULTAT
    # ========================================================

    def _create_result(self):

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

            "level_completed": (
                self.game.completed
            ),

            "operations": (
                self.operation_count
            ),
        }

    # ========================================================
    # RESET
    # ========================================================

    def reset(self):
        """
        Replace le niveau dans son état initial.
        """

        self.output = []
        self.last_error = None

        self.operation_count = 0
        self.python_steps = 0

        self.running = False

        self.game.reset()