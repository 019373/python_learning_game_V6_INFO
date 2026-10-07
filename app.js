"use strict";

/*
============================================================
PYT - app.js

Point de départ de la version navigateur.

Ce fichier :
- démarre l'application
- charge le premier niveau
- crée Pyt
- crée le moteur
- crée l'interface
- connecte les différentes parties

Il ne contient pas les règles du jeu.
============================================================
*/


document.addEventListener(
    "DOMContentLoaded",
    () => {

        // =================================================
        // VÉRIFICATIONS
        // =================================================

        if (typeof PytUI !== "function") {

            console.error(
                "Erreur : ui.js n'est pas chargé."
            );

            return;
        }


        if (typeof Robot !== "function") {

            console.error(
                "Erreur : robot.js n'est pas chargé."
            );

            return;
        }


        if (typeof Game !== "function") {

            console.error(
                "Erreur : game.js n'est pas chargé."
            );

            return;
        }


        if (typeof getLevel !== "function") {

            console.error(
                "Erreur : levels.js n'est pas chargé."
            );

            return;
        }


        // =================================================
        // ÉTAT PRINCIPAL
        // =================================================

        let currentChapter = 1;
        let currentExercise = 1;

        let level = null;
        let robot = null;
        let game = null;


        // =================================================
        // INTERFACE
        // =================================================

        const ui = new PytUI();


        // =================================================
        // CHARGER UN NIVEAU
        // =================================================

        function loadLevel(
            chapter,
            exercise
        ) {

            const newLevel =
                getLevel(
                    chapter,
                    exercise
                );


            if (!newLevel) {

                ui.showMessage(
                    "Niveau introuvable",
                    "Impossible de charger cet exercice."
                );

                return false;
            }


            currentChapter =
                chapter;

            currentExercise =
                exercise;

            level =
                newLevel;


            // ---------------------------------------------
            // CRÉATION DE PYT
            // ---------------------------------------------

            robot =
                new Robot();


            // ---------------------------------------------
            // CRÉATION DU MOTEUR
            // ---------------------------------------------

            game =
                new Game(
                    level,
                    robot
                );


            // ---------------------------------------------
            // CONNEXION INTERFACE
            // ---------------------------------------------

            ui.setGame(
                game
            );

            ui.setLevel(
                level
            );

            ui.currentChapter =
                currentChapter;

            ui.currentExercise =
                currentExercise;


            ui.clearConsole();
            ui.drawWorld();


            return true;
        }


        // =================================================
        // CHOIX D'UN EXERCICE
        // =================================================

        ui.onSelectLevel =
            (
                chapter,
                exercise
            ) => {

                const loaded =
                    loadLevel(
                        chapter,
                        exercise
                    );


                if (!loaded) {
                    return;
                }


                ui.showGame();

                ui.setStatus(
                    "Pyt attend ton programme."
                );
            };


        // =================================================
        // RECOMMENCER
        // =================================================

        ui.onRestart =
            () => {

                if (!game) {
                    return;
                }


                ui.stopAnimation();


                if (
                    typeof game.reset
                    === "function"
                ) {

                    game.reset();

                } else {

                    /*
                    Solution de secours :
                    on recharge complètement le niveau.
                    */

                    loadLevel(
                        currentChapter,
                        currentExercise
                    );
                }


                ui.drawWorld();

                ui.setStatus(
                    "Niveau recommencé."
                );
            };


        // =================================================
        // EXÉCUTION DU CODE
        // =================================================

        ui.onRunCode =
            async (code) => {

                if (!game) {
                    return;
                }


                ui.setConsole(
                    "Analyse du programme..."
                );


                /*
                runner.py sera raccordé ensuite.

                L'interface attend simplement un résultat
                de cette forme :

                {
                    success: true,
                    error: null,
                    output: "",
                    actions: [
                        ["forward", 1],
                        ["right", 90]
                    ]
                }

                On ne met PAS ici un faux interpréteur
                Python en JavaScript.
                */


                if (
                    typeof window.runPythonCode
                    !== "function"
                ) {

                    ui.setConsole(
                        "Le moteur Python n'est pas encore connecté."
                    );

                    return;
                }


                let result;


                try {

                    result =
                        await window.runPythonCode(
                            code
                        );

                } catch (error) {

                    ui.setConsole(
                        "Erreur interne :\n"
                        + error.message
                    );

                    ui.handleFailedAttempt();

                    return;
                }


                // -----------------------------------------
                // ERREUR PYTHON
                // -----------------------------------------

                if (
                    !result
                    ||
                    result.success === false
                ) {

                    const errorMessage =
                        result
                        &&
                        result.error
                            ? result.error
                            : "Programme invalide.";


                    ui.setConsole(
                        errorMessage
                    );

                    ui.handleFailedAttempt();

                    return;
                }


                // -----------------------------------------
                // SORTIE PRINT()
                // -----------------------------------------

                if (result.output) {

                    ui.setConsole(
                        result.output
                    );

                } else {

                    ui.setConsole(
                        "Programme accepté."
                    );
                }


                // -----------------------------------------
                // ACTIONS
                // -----------------------------------------

                const actions =
                    Array.isArray(
                        result.actions
                    )
                        ? result.actions
                        : [];


                if (
                    actions.length === 0
                ) {

                    ui.setConsole(
                        (
                            result.output
                            ? result.output + "\n"
                            : ""
                        )
                        +
                        "Aucun déplacement n'a été effectué."
                    );

                    finishAttempt();

                    return;
                }


                // -----------------------------------------
                // ANIMATION
                // -----------------------------------------

                ui.playActions(

                    actions,

                    performAction,

                    () => {

                        finishAttempt();

                    }

                );
            };


        // =================================================
        // EXÉCUTER UNE ACTION
        // =================================================

        function performAction(action) {

            if (
                !game
                ||
                !game.robot
            ) {

                return false;
            }


            /*
            Le runner peut fournir :

            ["forward", 1]

            ou :

            {
                type: "forward",
                value: 1
            }
            */


            let type;
            let value;


            if (Array.isArray(action)) {

                type =
                    action[0];

                value =
                    action.length > 1
                        ? action[1]
                        : 1;

            } else if (
                action
                &&
                typeof action === "object"
            ) {

                type =
                    action.type
                    || action.action;

                value =
                    action.value
                    ?? action.amount
                    ?? 1;

            } else {

                return false;
            }


            // ---------------------------------------------
            // AVANCER
            // ---------------------------------------------

            if (type === "forward") {

                if (
                    typeof game.moveForward
                    === "function"
                ) {

                    return game.moveForward();
                }


                if (
                    typeof game.robot
                        .getForwardPosition
                    === "function"
                    &&
                    typeof game.moveRobotTo
                    === "function"
                ) {

                    const position =
                        game.robot
                            .getForwardPosition();


                    return game.moveRobotTo(
                        position[0],
                        position[1]
                    );
                }


                return false;
            }


            // ---------------------------------------------
            // RECULER
            // ---------------------------------------------

            if (type === "backward") {

                if (
                    typeof game.moveBackward
                    === "function"
                ) {

                    return game.moveBackward();
                }


                if (
                    typeof game.robot
                        .getBackwardPosition
                    === "function"
                    &&
                    typeof game.moveRobotTo
                    === "function"
                ) {

                    const position =
                        game.robot
                            .getBackwardPosition();


                    return game.moveRobotTo(
                        position[0],
                        position[1]
                    );
                }


                return false;
            }


            // ---------------------------------------------
            // DROITE
            // ---------------------------------------------

            if (type === "right") {

                if (
                    typeof game.robot.rotateRight
                    === "function"
                ) {

                    game.robot.rotateRight(
                        Number(value) || 90
                    );

                    return true;
                }


                return false;
            }


            // ---------------------------------------------
            // GAUCHE
            // ---------------------------------------------

            if (type === "left") {

                if (
                    typeof game.robot.rotateLeft
                    === "function"
                ) {

                    game.robot.rotateLeft(
                        Number(value) || 90
                    );

                    return true;
                }


                return false;
            }


            console.warn(
                "Action inconnue :",
                action
            );


            return false;
        }


        // =================================================
        // FIN D'UNE TENTATIVE
        // =================================================

        function finishAttempt() {

            if (!game) {
                return;
            }


            ui.drawWorld();


            /*
            IMPORTANT :

            La réussite est vérifiée seulement APRÈS
            la dernière action animée.

            Ce n'est donc pas ui.js qui décide
            si le niveau est gagné.
            */


            let success = false;


            if (
                typeof game.checkSuccess
                === "function"
            ) {

                success =
                    Boolean(
                        game.checkSuccess()
                    );

            } else if (
                typeof game.completed
                === "boolean"
            ) {

                success =
                    game.completed;
            }


            if (success) {

                ui.setConsole(
                    appendConsoleText(
                        "✓ Mission réussie !"
                    )
                );


                ui.completeCurrentLevel();

                return;
            }


            ui.setConsole(
                appendConsoleText(
                    "✗ La mission n'est pas encore réussie."
                )
            );


            ui.setStatus(
                "Essaie encore."
            );


            ui.handleFailedAttempt();
        }


        // =================================================
        // AJOUTER DU TEXTE À LA CONSOLE
        // =================================================

        function appendConsoleText(text) {

            const current =
                ui.consoleOutput.textContent.trim();


            if (
                !current
                ||
                current === "Prêt."
                ||
                current === "Programme accepté."
            ) {

                return text;
            }


            return (
                current
                + "\n"
                + text
            );
        }


        // =================================================
        // DÉMARRAGE DU JEU
        // =================================================

        const started =
            loadLevel(
                1,
                1
            );


        if (!started) {
            return;
        }


        /*
        Au lancement :

        le joueur voit d'abord le cours.

        Le jeu lui-même n'est donc pas l'écran
        présenté en premier.
        */

        const courseOpened =
            ui.showCourseAtChapterStart(
                1
            );


        if (!courseOpened) {

            ui.showMap();
        }


        // =================================================
        // DEBUG PRATIQUE
        // =================================================

        window.pytApp = {
            get ui() {
                return ui;
            },

            get game() {
                return game;
            },

            get robot() {
                return robot;
            },

            get level() {
                return level;
            },

            loadLevel
        };

    }
);