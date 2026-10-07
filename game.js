"use strict";

/*
============================================================
PYT - game.js

Moteur principal du jeu.

Ce fichier gère :
- la grille
- les murs
- les objets
- les collisions
- les interactions automatiques
- les caisses
- les portes / boutons
- les dépôts
- le nettoyage
- les chargeurs
- la condition de réussite

L'affichage reste dans ui.js.
============================================================
*/


class Game {

    // =====================================================
    // TYPES DE CASES
    // =====================================================

    static EMPTY = "empty";
    static WALL = "wall";
    static GOAL = "goal";
    static OBJECT = "object";
    static DEPOSIT = "deposit";
    static BUTTON = "button";
    static DOOR = "door";
    static DIRT = "dirt";
    static BOX = "box";
    static CHARGER = "charger";


    // =====================================================
    // CONSTRUCTEUR
    // =====================================================

    constructor(level, robot) {

        if (!level) {
            throw new Error(
                "Game a besoin d'un niveau."
            );
        }

        if (!robot) {
            throw new Error(
                "Game a besoin de Pyt."
            );
        }


        this.robot = robot;

        this.level = null;

        this.rows = 0;
        this.cols = 0;

        this.walls = new Set();
        this.objects = new Set();
        this.deposits = new Set();
        this.buttons = new Set();
        this.doors = new Set();
        this.dirt = new Set();
        this.boxes = new Set();
        this.chargers = new Set();
        this.boxTargets = new Set();

        this.goal = null;

        this.objective =
            "reach_goal";

        this.requiredDeposits = 1;

        this.collectedObjects = 0;
        this.depositedObjects = 0;
        this.cleanedTiles = 0;
        this.activatedButtons = 0;

        this.completed = false;
        this.failed = false;

        this.message = "";

        this.loadLevel(
            level
        );
    }


    // =====================================================
    // CHARGEMENT DU NIVEAU
    // =====================================================

    loadLevel(level) {

        if (!level) {

            throw new Error(
                "Niveau invalide."
            );
        }


        this.level =
            level;

        this.rows =
            Number(level.rows);

        this.cols =
            Number(level.cols);


        if (
            !Number.isInteger(this.rows)
            ||
            !Number.isInteger(this.cols)
            ||
            this.rows <= 0
            ||
            this.cols <= 0
        ) {

            throw new Error(
                "Dimensions du niveau invalides."
            );
        }


        this.walls =
            this.positionsToSet(
                level.walls
            );

        this.objects =
            this.positionsToSet(
                level.objects
            );

        this.deposits =
            this.positionsToSet(
                level.deposits
            );

        this.buttons =
            this.positionsToSet(
                level.buttons
            );

        this.doors =
            this.positionsToSet(
                level.doors
            );

        this.dirt =
            this.positionsToSet(
                level.dirt
            );

        this.boxes =
            this.positionsToSet(
                level.boxes
            );

        this.chargers =
            this.positionsToSet(
                level.chargers
            );

        this.boxTargets =
            this.positionsToSet(
                level.boxTargets
            );


        this.goal =
            Array.isArray(level.goal)
                ? [
                    Number(level.goal[0]),
                    Number(level.goal[1])
                ]
                : null;


        this.objective =
            level.objective
            || "reach_goal";


        this.requiredDeposits =
            Number(
                level.requiredDeposits
                ?? 1
            );


        this.collectedObjects = 0;
        this.depositedObjects = 0;
        this.cleanedTiles = 0;
        this.activatedButtons = 0;

        this.completed = false;
        this.failed = false;

        this.message = "";


        // -------------------------------------------------
        // POSITION DE DÉPART DE PYT
        // -------------------------------------------------

        const start =
            Array.isArray(level.start)
                ? level.start
                : [0, 0];


        const startRow =
            Number(start[0]);

        const startCol =
            Number(start[1]);

        const startDirection =
            level.startDirection
            || "east";


        this.robot.reset(
            startRow,
            startCol,
            startDirection
        );


        /*
        Si la case de départ possède une
        interaction automatique, elle peut
        être traitée sans valider le niveau.
        */

        this.checkAutomaticInteractions(
            false
        );
    }


    // =====================================================
    // CONVERSION POSITIONS -> SET
    // =====================================================

    positionsToSet(positions) {

        const result =
            new Set();


        if (!Array.isArray(positions)) {
            return result;
        }


        for (const position of positions) {

            if (
                !Array.isArray(position)
                ||
                position.length < 2
            ) {
                continue;
            }


            const row =
                Number(position[0]);

            const col =
                Number(position[1]);


            if (
                !Number.isInteger(row)
                ||
                !Number.isInteger(col)
            ) {
                continue;
            }


            result.add(
                this.positionKey(
                    row,
                    col
                )
            );
        }


        return result;
    }


    // =====================================================
    // CLÉ DE POSITION
    // =====================================================

    positionKey(row, col) {

        return `${row},${col}`;
    }


    // =====================================================
    // LIMITES
    // =====================================================

    isInside(row, col) {

        return (
            row >= 0
            &&
            row < this.rows
            &&
            col >= 0
            &&
            col < this.cols
        );
    }


    // =====================================================
    // OBSTACLES
    // =====================================================

    isWall(row, col) {

        return this.walls.has(
            this.positionKey(
                row,
                col
            )
        );
    }


    isDoor(row, col) {

        return this.doors.has(
            this.positionKey(
                row,
                col
            )
        );
    }


    isBox(row, col) {

        return this.boxes.has(
            this.positionKey(
                row,
                col
            )
        );
    }


    isObstacle(row, col) {

        if (
            !this.isInside(
                row,
                col
            )
        ) {
            return true;
        }


        return (
            this.isWall(row, col)
            ||
            this.isDoor(row, col)
            ||
            this.isBox(row, col)
        );
    }


    // =====================================================
    // DÉPLACEMENT DE PYT
    // =====================================================

    moveRobotTo(row, col) {

        row =
            Number(row);

        col =
            Number(col);


        if (
            !Number.isInteger(row)
            ||
            !Number.isInteger(col)
        ) {

            this.message =
                "Déplacement invalide.";

            return false;
        }


        if (
            !this.isInside(
                row,
                col
            )
        ) {

            this.message =
                "Pyt ne peut pas sortir de la carte.";

            return false;
        }


        if (
            this.isWall(
                row,
                col
            )
        ) {

            this.message =
                "Un mur bloque Pyt.";

            return false;
        }


        if (
            this.isDoor(
                row,
                col
            )
        ) {

            this.message =
                "La porte est fermée.";

            return false;
        }


        // -------------------------------------------------
        // CAISSE
        // -------------------------------------------------

        if (
            this.isBox(
                row,
                col
            )
        ) {

            const pushed =
                this.tryPushBox(
                    row,
                    col
                );


            if (!pushed) {

                this.message =
                    "La caisse ne peut pas être poussée.";

                return false;
            }
        }


        // -------------------------------------------------
        // DÉPLACEMENT ACCEPTÉ
        // -------------------------------------------------

        this.robot.setPosition(
            row,
            col
        );


        this.message = "";


        this.checkAutomaticInteractions(
            true
        );


        return true;
    }


    // =====================================================
    // AVANCER / RECULER
    // =====================================================

    moveForward() {

        const position =
            this.robot
                .getForwardPosition();


        return this.moveRobotTo(
            position[0],
            position[1]
        );
    }


    moveBackward() {

        const position =
            this.robot
                .getBackwardPosition();


        return this.moveRobotTo(
            position[0],
            position[1]
        );
    }


    // =====================================================
    // POUSSER UNE CAISSE
    // =====================================================

    tryPushBox(
        boxRow,
        boxCol
    ) {

        /*
        On détermine ici le sens réel du
        déplacement de Pyt vers la caisse.

        Cela fonctionne aussi lorsque Pyt recule.
        */

        const moveRow =
            boxRow
            - this.robot.row;

        const moveCol =
            boxCol
            - this.robot.col;


        if (
            Math.abs(moveRow)
            +
            Math.abs(moveCol)
            !== 1
        ) {

            return false;
        }


        const targetRow =
            boxRow
            + moveRow;

        const targetCol =
            boxCol
            + moveCol;


        if (
            !this.isInside(
                targetRow,
                targetCol
            )
        ) {
            return false;
        }


        if (
            this.isWall(
                targetRow,
                targetCol
            )
            ||
            this.isDoor(
                targetRow,
                targetCol
            )
            ||
            this.isBox(
                targetRow,
                targetCol
            )
        ) {

            return false;
        }


        const oldKey =
            this.positionKey(
                boxRow,
                boxCol
            );

        const newKey =
            this.positionKey(
                targetRow,
                targetCol
            );


        this.boxes.delete(
            oldKey
        );

        this.boxes.add(
            newKey
        );


        return true;
    }


    // =====================================================
    // INTERACTIONS AUTOMATIQUES
    // =====================================================

    checkAutomaticInteractions(
        checkCompletion = true
    ) {

        const row =
            this.robot.row;

        const col =
            this.robot.col;

        const key =
            this.positionKey(
                row,
                col
            );


        // -------------------------------------------------
        // RAMASSER
        // -------------------------------------------------

        if (
            this.objects.has(
                key
            )
        ) {

            this.objects.delete(
                key
            );

            this.robot.addObject(1);

            this.collectedObjects += 1;

            this.message =
                "Objet ramassé automatiquement.";
        }


        // -------------------------------------------------
        // DÉPOSER
        // -------------------------------------------------

        if (
            this.deposits.has(key)
            &&
            this.robot.hasObject()
        ) {

            this.robot.removeObject(1);

            this.depositedObjects += 1;

            this.message =
                "Objet déposé automatiquement.";
        }


        // -------------------------------------------------
        // NETTOYER
        // -------------------------------------------------

        if (
            this.dirt.has(
                key
            )
        ) {

            this.dirt.delete(
                key
            );

            this.cleanedTiles += 1;

            this.message =
                "Case nettoyée automatiquement.";
        }


        // -------------------------------------------------
        // BOUTON
        // -------------------------------------------------

        if (
            this.buttons.has(
                key
            )
        ) {

            this.activateButton(
                key
            );
        }


        // -------------------------------------------------
        // CHARGEUR
        // -------------------------------------------------

        if (
            this.chargers.has(
                key
            )
        ) {

            this.robot.recharge();

            this.message =
                "Pyt est rechargé.";
        }


        if (checkCompletion) {

            this.checkSuccess();
        }
    }


    // =====================================================
    // BOUTONS / PORTES
    // =====================================================

    activateButton(key) {

        if (
            !this.buttons.has(
                key
            )
        ) {
            return false;
        }


        this.buttons.delete(
            key
        );

        this.activatedButtons += 1;


        /*
        MVP :
        activer un bouton ouvre les portes
        encore fermées du niveau.
        */

        this.doors.clear();


        this.message =
            "Mécanisme activé : la porte est ouverte.";


        return true;
    }


    // =====================================================
    // OBJECTIF
    // =====================================================

    robotIsOnGoal() {

        if (!this.goal) {
            return false;
        }


        return (
            this.robot.row
            === this.goal[0]
            &&
            this.robot.col
            === this.goal[1]
        );
    }


    // =====================================================
    // VÉRIFICATION DE RÉUSSITE
    // =====================================================

    checkSuccess() {

        let success = false;


        switch (this.objective) {

            // ---------------------------------------------
            // ATTEINDRE LE CRISTAL
            // ---------------------------------------------

            case "reach_goal":

                success =
                    this.robotIsOnGoal();

                break;


            // ---------------------------------------------
            // RAMASSER TOUS LES OBJETS
            // ---------------------------------------------

            case "collect_all":

                success =
                    this.objects.size === 0;

                break;


            // ---------------------------------------------
            // NETTOYER TOUTES LES CASES
            // ---------------------------------------------

            case "clean_all":

                success =
                    this.dirt.size === 0;

                break;


            // ---------------------------------------------
            // ACTIVER TOUS LES BOUTONS
            // ---------------------------------------------

            case "activate_all":

                success =
                    this.buttons.size === 0
                    &&
                    this.activatedButtons > 0;

                break;


            // ---------------------------------------------
            // DÉPOSER LES OBJETS
            // ---------------------------------------------

            case "deposit":

                success =
                    this.depositedObjects
                    >=
                    this.requiredDeposits;

                break;


            // ---------------------------------------------
            // PLACER LES CAISSES
            // ---------------------------------------------

            case "boxes":

                success =
                    this.boxTargets.size > 0
                    &&
                    [...this.boxTargets]
                        .every(
                            target =>
                                this.boxes.has(
                                    target
                                )
                        );

                break;


            // ---------------------------------------------
            // OBJECTIF COMBINÉ
            // ---------------------------------------------

            case "combined":

                success =
                    this.robotIsOnGoal()
                    &&
                    this.objects.size === 0
                    &&
                    this.dirt.size === 0;

                break;


            default:

                success =
                    this.robotIsOnGoal();

                break;
        }


        /*
        On recalcule réellement l'état.

        Donc si Pyt passe sur le cristal puis
        continue et le quitte, le niveau n'est
        pas considéré comme terminé à la fin.
        */

        this.completed =
            Boolean(success);


        return this.completed;
    }


    // =====================================================
    // TYPE DE CASE POUR UI.JS
    // =====================================================

    getTileType(row, col) {

        const key =
            this.positionKey(
                row,
                col
            );


        if (
            this.walls.has(key)
        ) {
            return Game.WALL;
        }


        if (
            this.doors.has(key)
        ) {
            return Game.DOOR;
        }


        if (
            this.boxes.has(key)
        ) {
            return Game.BOX;
        }


        if (
            this.objects.has(key)
        ) {
            return Game.OBJECT;
        }


        if (
            this.deposits.has(key)
        ) {
            return Game.DEPOSIT;
        }


        if (
            this.buttons.has(key)
        ) {
            return Game.BUTTON;
        }


        if (
            this.dirt.has(key)
        ) {
            return Game.DIRT;
        }


        if (
            this.chargers.has(key)
        ) {
            return Game.CHARGER;
        }


        if (
            this.goal
            &&
            row === this.goal[0]
            &&
            col === this.goal[1]
        ) {
            return Game.GOAL;
        }


        return Game.EMPTY;
    }


    // =====================================================
    // ÉTAT COMPLET
    // =====================================================

    getState() {

        return {
            chapter:
                this.level.chapter,

            exercise:
                this.level.exercise,

            rows:
                this.rows,

            cols:
                this.cols,

            robot:
                this.robot.getState(),

            goal:
                this.goal
                    ? [...this.goal]
                    : null,

            walls:
                [...this.walls],

            objects:
                [...this.objects],

            deposits:
                [...this.deposits],

            buttons:
                [...this.buttons],

            doors:
                [...this.doors],

            dirt:
                [...this.dirt],

            boxes:
                [...this.boxes],

            chargers:
                [...this.chargers],

            boxTargets:
                [...this.boxTargets],

            collectedObjects:
                this.collectedObjects,

            depositedObjects:
                this.depositedObjects,

            cleanedTiles:
                this.cleanedTiles,

            activatedButtons:
                this.activatedButtons,

            objective:
                this.objective,

            completed:
                this.completed,

            failed:
                this.failed,

            message:
                this.message
        };
    }


    // =====================================================
    // RESET
    // =====================================================

    reset() {

        this.loadLevel(
            this.level
        );

        return true;
    }

}


// =========================================================
// EXPOSITION GLOBALE
// =========================================================

window.Game = Game;