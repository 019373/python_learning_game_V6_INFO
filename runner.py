"""
runner.py
Jeu éducatif Python - Pyt

Ce fichier fait le lien entre :
- le code Python écrit par l'élève
- Pyt
- le moteur du jeu

Le joueur peut utiliser du vrai Python ainsi que les
commandes de déplacement apprises avec Turtle :

    forward(...)
    backward(...)
    left(...)
    right(...)

Les interactions comme ramasser un objet sont automatiques
et restent gérées par game.py.
"""

import ast
import math


class Runner:
    """
    Exécute le code Python écrit par l'élève
    dans un environnement limité.
    """

    def __init__(self, game):
        """
        game :
            instance de Game
        """

        self.game = game
        self.robot = game.robot

        self.output = []

        self.last_error = None

        self.running = False

        # Limite simple destinée à éviter qu'un programme
        # exécute énormément d'instructions.
        self.max_operations = 10000

        self.operation_count = 0

    # ========================================================
    # COMMANDES DE PYT
    # ========================================================

    def forward(self, distance=1):
        """
        Fait avancer Pyt.

        Exemple :
            forward(3)
        """

        self._count_operation()

        distance = self._validate_distance(
            distance
        )

        return self.robot.forward(
            self.game,
            distance
        )

    def backward(self, distance=1):
        """
        Fait reculer Pyt.

        Exemple :
            backward(2)
        """

        self._count_operation()

        distance = self._validate_distance(
            distance
        )

        return self.robot.backward(
            self.game,
            distance
        )

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

        self.robot.rotate_right(angle)

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

        self.robot.rotate_left(angle)

        return True

    # ========================================================
    # VALIDATION DES COMMANDES
    # ========================================================

    def _validate_distance(self, distance):
        """
        Vérifie qu'une distance est correcte.
        """

        if isinstance(distance, bool):
            raise ValueError(
                "La distance doit être un nombre entier."
            )

        if not isinstance(distance, int):
            raise ValueError(
                "La distance doit être un nombre entier."
            )

        if distance < 0:
            raise ValueError(
                "La distance ne peut pas être négative."
            )

        return distance

    def _validate_angle(self, angle):
        """
        Vérifie qu'un angle est utilisable
        sur la grille.
        """

        if isinstance(angle, bool):
            raise ValueError(
                "L'angle doit être un nombre entier."
            )

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
                "Dans ce jeu, Pyt tourne par multiples "
                "de 90 degrés."
            )

        return angle

    # ========================================================
    # PRINT
    # ========================================================

    def game_print(self, *values, sep=" ", end="\n"):
        """
        Remplace print() pendant l'exécution.

        Le texte est enregistré afin que ui.py puisse
        l'afficher dans une console du jeu.
        """

        text = sep.join(
            str(value)
            for value in values
        )

        text += end

        self.output.append(text)

    def get_output(self):
        """
        Retourne tout ce qui a été envoyé avec print().
        """

        return "".join(self.output)

    # ========================================================
    # ENVIRONNEMENT PYTHON
    # ========================================================

    def create_environment(self):
        """
        Construit l'environnement disponible pour
        le programme de l'élève.

        On fournit les notions Python utiles au projet
        sans exposer directement le moteur du jeu.
        """

        safe_builtins = {
            # Affichage
            "print": self.game_print,

            # Conversions
            "int": int,
            "float": float,
            "str": str,
            "bool": bool,

            # Mathématiques simples
            "round": round,
            "min": min,
            "max": max,
            "abs": abs,
            "pow": pow,

            # Listes / parcours
            "len": len,
            "range": range,
            "enumerate": enumerate,

            # Types simples
            "list": list,
            "tuple": tuple,

            # Utilitaires
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
        Analyse le code avant son exécution.

        Retourne :
            (True, None)

        ou :
            (False, message_erreur)
        """

        if not isinstance(code, str):
            return (
                False,
                "Le programme doit être du texte."
            )

        if code.strip() == "":
            return (
                False,
                "Écris d'abord un programme."
            )

        try:
            tree = ast.parse(
                code,
                mode="exec"
            )

        except SyntaxError as error:
            return (
                False,
                self._format_syntax_error(error)
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
                return (
                    False,
                    "Cette instruction n'est pas "
                    "autorisée dans le jeu."
                )

            # Empêche l'accès à des attributs spéciaux
            # du type objet.__class__.
            if isinstance(
                node,
                ast.Attribute
            ):
                if node.attr.startswith("__"):
                    return (
                        False,
                        "Cet accès n'est pas autorisé."
                    )

            # Empêche les noms spéciaux Python.
            if isinstance(
                node,
                ast.Name
            ):
                if node.id.startswith("__"):
                    return (
                        False,
                        "Ce nom n'est pas autorisé."
                    )

        return (
            True,
            None
        )

    # ========================================================
    # EXÉCUTION
    # ========================================================

    def run(self, code):
        """
        Vérifie puis exécute le programme de l'élève.

        Retourne un dictionnaire que ui.py pourra utiliser.
        """

        self.output = []
        self.last_error = None
        self.operation_count = 0

        valid, error = self.check_code(
            code
        )

        if not valid:
            self.last_error = error

            return self._create_result(
                success=False,
                error=error
            )

        environment = (
            self.create_environment()
        )

        self.running = True

        try:
            compiled_code = compile(
                code,
                "<programme de l'élève>",
                "exec"
            )

            exec(
                compiled_code,
                environment,
                environment
            )

        except NameError as error:
            self.last_error = (
                self._format_name_error(error)
            )

        except TypeError as error:
            self.last_error = (
                "Erreur de type : "
                + str(error)
            )

        except ValueError as error:
            self.last_error = (
                str(error)
            )

        except RuntimeError as error:
            self.last_error = (
                str(error)
            )

        except Exception as error:
            self.last_error = (
                "Erreur pendant l'exécution : "
                + str(error)
            )

        finally:
            self.running = False

        if self.last_error is not None:
            return self._create_result(
                success=False,
                error=self.last_error
            )

        # On vérifie une dernière fois l'objectif
        # après l'exécution complète du programme.
        self.game.check_success()

        return self._create_result(
            success=True,
            error=None
        )

    # ========================================================
    # COMPTEUR D'OPÉRATIONS
    # ========================================================

    def _count_operation(self):
        """
        Compte les actions de Pyt.

        Cela évite par exemple :
            forward(1)
        répété un nombre énorme de fois.

        Une protection supplémentaire contre les vraies
        boucles infinies sera gérée séparément.
        """

        self.operation_count += 1

        if (
            self.operation_count
            > self.max_operations
        ):
            raise RuntimeError(
                "Le programme effectue trop d'actions."
            )

    # ========================================================
    # FORMAT DES ERREURS
    # ========================================================

    def _format_syntax_error(self, error):
        """
        Transforme une SyntaxError Python en message
        plus lisible pour un élève.
        """

        line = error.lineno

        if line is None:
            return (
                "Erreur de syntaxe dans le programme."
            )

        return (
            "Erreur de syntaxe à la ligne "
            + str(line)
            + "."
        )

    def _format_name_error(self, error):
        """
        Rend les NameError un peu plus compréhensibles.
        """

        return (
            "Nom inconnu : "
            + str(error)
        )

    # ========================================================
    # RÉSULTAT POUR UI.PY
    # ========================================================

    def _create_result(
        self,
        success,
        error
    ):
        """
        Crée un résultat uniforme pour l'interface.
        """

        return {
            "execution_success": success,

            "level_completed":
                self.game.completed,

            "error": error,

            "output":
                self.get_output(),

            "game_message":
                self.game.message,

            "operations":
                self.operation_count,
        }

    # ========================================================
    # RESET
    # ========================================================

    def reset(self):
        """
        Réinitialise le runner et le niveau.
        """

        self.output = []
        self.last_error = None
        self.operation_count = 0
        self.running = False

        self.game.reset()