"use strict";

/*
============================================================
PYT - game.js

Moteur principal du jeu.

Responsabilités :
- charger un niveau ;
- gérer la grille ;
- déplacer Pyt ;
- gérer les collisions ;
- pousser les caisses ;
- ramasser automatiquement les objets ;
- nettoyer automatiquement les saletés ;
- activer les boutons ;
- ouvrir les portes ;
- déposer automatiquement les objets ;
- gérer les chargeurs ;
- vérifier les objectifs.

IMPORTANT :
L'interface reste dans ui.js.
L'exécution du Python reste dans app.js.
Le robot reste dans robot.js.
============================================================
*/

class Game {

    constructor(level = null, robot = null) {

        this.level = null;
        this.robot = robot;

        this.grid = [];

        this.rows = 0;
        this.cols = 0;

        this.objects = new Set();
        this.dirt = new Set();
        this.buttons = new Set();
        this.activatedButtons = new Set();

        this.doors = new Set();
        this.openDoors = new Set();

        this.chargers = new Set();
        this.deposits = new Set();

        this.boxes = new Set();
        this.boxGoals = new Set();

        this.goal = null;

        this.collectedObjects = 0;
        this.cleanedTiles = 0;
        this.depositedObjects = 0;

        this.initialObjectCount = 0;
        this.initialDirtCount = 0;
        this.initialButtonCount = 0;
        this.initialBoxCount = 0;

        this.message = "";

        this.finished = false;

        if (level) {

            this.loadLevel(
                level,
                robot
            );
        }
    }


    // =====================================================
    // CHARGEMENT
    // =====================================================

    loadLevel(level, robot = null) {

        if (!level) {

            throw new Error(
                "Impossible de charger un niveau vide."
            );
        }

        this.level = level;

        if (robot) {

            this.robot = robot;
        }

        this.grid =
            Array.isArray(level.grid)
                ? level.grid.map(
                    row => [...row]
                )
                : [];

        this.rows =
            this.grid.length;

        this.cols =
            this.rows > 0
                ? this.grid[0].length
                : 0;


        this.objects.clear();
        this.dirt.clear();
        this.buttons.clear();
        this.activatedButtons.clear();

        this.doors.clear();
        this.openDoors.clear();

        this.chargers.clear();
        this.deposits.clear();

        this.boxes.clear();
        this.boxGoals.clear();


        this.goal = null;

        this.collectedObjects = 0;
        this.cleanedTiles = 0;
        this.depositedObjects = 0;

        this.message = "";
        this.finished = false;


        this.scanGrid();


        this.initialObjectCount =
            this.objects.size;

        this.initialDirtCount =
            this.dirt.size;

        this.initialButtonCount =
            this.buttons.size;

        this.initialBoxCount =
            this.boxes.size;


        this.resetRobot();

        /*
        Si Pyt commence directement sur une case
        interactive, l'interaction est appliquée.
        */

        const position =
            this.getRobotPosition();

        if (position) {

            this.handleAutomaticInteraction(
                position.row,
                position.col
            );
        }

        return this;
    }


    scanGrid() {

        for (
            let row = 0;
            row < this.rows;
            row++
        ) {

            for (
                let col = 0;
                col < this.cols;
                col++
            ) {

                const tile =
                    this.normalizeTile(
                        this.grid[row][col]
                    );

                const key =
                    this.positionKey(
                        row,
                        col
                    );


                switch (tile) {

                    case "object":

                        this.objects.add(
                            key
                        );

                        break;


                    case "dirt":

                        this.dirt.add(
                            key
                        );

                        break;


                    case "button":

                        this.buttons.add(
                            key
                        );

                        break;


                    case "door":

                        this.doors.add(
                            key
                        );

                        break;


                    case "charger":

                        this.chargers.add(
                            key
                        );

                        break;


                    case "deposit":

                        this.deposits.add(
                            key
                        );

                        break;


                    case "box":

                        this.boxes.add(
                            key
                        );

                        break;


                    case "box_goal":

                        this.boxGoals.add(
                            key
                        );

                        break;


                    case "goal":

                        this.goal = {
                            row,
                            col
                        };

                        break;
                }
            }
        }


        /*
        Certains niveaux peuvent définir les éléments
        séparément de la grille.
        */

        this.loadExtraPositions(
            this.level.objects,
            this.objects
        );

        this.loadExtraPositions(
            this.level.dirt,
            this.dirt
        );

        this.loadExtraPositions(
            this.level.buttons,
            this.buttons
        );

        this.loadExtraPositions(
            this.level.doors,
            this.doors
        );

        this.loadExtraPositions(
            this.level.chargers,
            this.chargers
        );

        this.loadExtraPositions(
            this.level.deposits,
            this.deposits
        );

        this.loadExtraPositions(
            this.level.boxes,
            this.boxes
        );

        this.loadExtraPositions(
            this.level.boxGoals,
            this.boxGoals
        );


        if (
            this.level.goal &&
            typeof this.level.goal === "object"
        ) {

            this.goal = {
                row:
                    Number(
                        this.level.goal.row
                    ),

                col:
                    Number(
                        this.level.goal.col
                    )
            };
        }
    }


    loadExtraPositions(
        positions,
        targetSet
    ) {

        if (
            !Array.isArray(
                positions
            )
        ) {

            return;
        }


        for (
            const position
            of positions
        ) {

            const parsed =
                this.parsePosition(
                    position
                );

            if (!parsed) {

                continue;
            }

            targetSet.add(
                this.positionKey(
                    parsed.row,
                    parsed.col
                )
            );
        }
    }


    resetRobot() {

        if (!this.robot) {

            return;
        }


        const start =
            this.getStartPosition();


        if (
            typeof this.robot.reset ===
            "function"
        ) {

            this.robot.reset(
                start.row,
                start.col,
                start.direction
            );

            return;
        }


        if (
            typeof this.robot.setPosition ===
            "function"
        ) {

            this.robot.setPosition(
                start.row,
                start.col
            );

        } else {

            this.robot.row =
                start.row;

            this.robot.col =
                start.col;
        }


        if (
            typeof this.robot.setDirection ===
            "function"
        ) {

            this.robot.setDirection(
                start.direction
            );

        } else {

            this.robot.direction =
                start.direction;
        }


        if (
            Array.isArray(
                this.robot.inventory
            )
        ) {

            this.robot.inventory.length =
                0;
        }
    }


    getStartPosition() {

        const candidates = [

            this.level?.start,

            this.level?.robotStart,

            this.level?.robot,

            this.level?.startPosition

        ];


        for (
            const candidate
            of candidates
        ) {

            const position =
                this.parsePosition(
                    candidate
                );

            if (position) {

                return {
                    row:
                        position.row,

                    col:
                        position.col,

                    direction:
                        this.normalizeDirection(
                            candidate?.direction ||
                            this.level?.startDirection ||
                            this.level?.direction ||
                            "NORTH"
                        )
                };
            }
        }


        /*
        Recherche éventuelle d'une case "start"
        dans la grille.
        */

        for (
            let row = 0;
            row < this.rows;
            row++
        ) {

            for (
                let col = 0;
                col < this.cols;
                col++
            ) {

                if (
                    this.normalizeTile(
                        this.grid[row][col]
                    ) === "start"
                ) {

                    return {
                        row,
                        col,
                        direction:
                            this.normalizeDirection(
                                this.level?.startDirection ||
                                "NORTH"
                            )
                    };
                }
            }
        }


        return {
            row: 1,
            col: 1,
            direction:
                this.normalizeDirection(
                    this.level?.startDirection ||
                    "EAST"
                )
        };
    }


    // =====================================================
    // POSITIONS
    // =====================================================

    parsePosition(position) {

        if (!position) {

            return null;
        }


        if (
            Array.isArray(
                position
            ) &&
            position.length >= 2
        ) {

            return {
                row:
                    Number(
                        position[0]
                    ),

                col:
                    Number(
                        position[1]
                    )
            };
        }


        if (
            typeof position ===
            "object" &&
            position.row !== undefined &&
            position.col !== undefined
        ) {

            return {
                row:
                    Number(
                        position.row
                    ),

                col:
                    Number(
                        position.col
                    )
            };
        }


        return null;
    }


    positionKey(
        row,
        col
    ) {

        return `${row},${col}`;
    }


    positionFromKey(key) {

        const [
            row,
            col
        ] =
            String(key)
                .split(",")
                .map(Number);

        return {
            row,
            col
        };
    }


    samePosition(
        a,
        b
    ) {

        if (
            !a ||
            !b
        ) {

            return false;
        }

        return (
            Number(a.row) ===
            Number(b.row) &&
            Number(a.col) ===
            Number(b.col)
        );
    }


    getRobotPosition() {

        if (!this.robot) {

            return null;
        }


        if (
            typeof this.robot.getPosition ===
            "function"
        ) {

            const position =
                this.robot.getPosition();

            const parsed =
                this.parsePosition(
                    position
                );

            if (parsed) {

                return parsed;
            }
        }


        if (
            Number.isFinite(
                Number(
                    this.robot.row
                )
            ) &&
            Number.isFinite(
                Number(
                    this.robot.col
                )
            )
        ) {

            return {
                row:
                    Number(
                        this.robot.row
                    ),

                col:
                    Number(
                        this.robot.col
                    )
            };
        }


        return null;
    }


    setRobotPosition(
        row,
        col
    ) {

        if (!this.robot) {

            return;
        }


        if (
            typeof this.robot.setPosition ===
            "function"
        ) {

            this.robot.setPosition(
                row,
                col
            );

            return;
        }


        this.robot.row =
            row;

        this.robot.col =
            col;
    }


    // =====================================================
    // DIRECTIONS
    // =====================================================

    normalizeDirection(direction) {

        const value =
            String(
                direction ||
                "NORTH"
            )
                .trim()
                .toUpperCase();


        const aliases = {

            N:
                "NORTH",

            NORTH:
                "NORTH",

            UP:
                "NORTH",

            E:
                "EAST",

            EAST:
                "EAST",

            RIGHT:
                "EAST",

            S:
                "SOUTH",

            SOUTH:
                "SOUTH",

            DOWN:
                "SOUTH",

            W:
                "WEST",

            WEST:
                "WEST",

            LEFT:
                "WEST"
        };


        return (
            aliases[value] ||
            "NORTH"
        );
    }


    getRobotDirection() {

        if (!this.robot) {

            return "NORTH";
        }


        if (
            typeof this.robot.getDirection ===
            "function"
        ) {

            return this.normalizeDirection(
                this.robot.getDirection()
            );
        }


        return this.normalizeDirection(
            this.robot.direction
        );
    }


    directionVector(
        direction
    ) {

        switch (
            this.normalizeDirection(
                direction
            )
        ) {

            case "EAST":

                return {
                    row: 0,
                    col: 1
                };


            case "SOUTH":

                return {
                    row: 1,
                    col: 0
                };


            case "WEST":

                return {
                    row: 0,
                    col: -1
                };


            case "NORTH":
            default:

                return {
                    row: -1,
                    col: 0
                };
        }
    }


    // =====================================================
    // DÉPLACEMENT
    // =====================================================

    moveForward() {

        return this.moveRobot(
            1
        );
    }


    moveBackward() {

        return this.moveRobot(
            -1
        );
    }


    moveRobot(directionMultiplier = 1) {

        this.message = "";


        const position =
            this.getRobotPosition();

        if (!position) {

            this.message =
                "Pyt n'a pas de position valide.";

            return false;
        }


        const vector =
            this.directionVector(
                this.getRobotDirection()
            );


        const targetRow =
            position.row +
            vector.row *
            directionMultiplier;

        const targetCol =
            position.col +
            vector.col *
            directionMultiplier;


        return this.moveRobotTo(
            targetRow,
            targetCol
        );
    }


    moveRobotTo(
        row,
        col
    ) {

        this.message = "";


        if (
            !this.isInside(
                row,
                col
            )
        ) {

            this.message =
                "Pyt essaie de sortir de la pièce.";

            return false;
        }


        const key =
            this.positionKey(
                row,
                col
            );


        /*
        Une caisse peut être poussée.
        */

        if (
            this.boxes.has(
                key
            )
        ) {

            const pushed =
                this.pushBox(
                    row,
                    col
                );

            if (!pushed) {

                return false;
            }
        }


        if (
            !this.canEnter(
                row,
                col
            )
        ) {

            const tile =
                this.getTileType(
                    row,
                    col
                );


            if (
                tile === "wall"
            ) {

                this.message =
                    "Un mur bloque le chemin.";

            } else if (
                tile === "door"
            ) {

                this.message =
                    "La porte est encore fermée.";

            } else if (
                tile === "box"
            ) {

                this.message =
                    "La caisse ne peut pas être déplacée.";

            } else {

                this.message =
                    "Le chemin est bloqué.";
            }

            return false;
        }


        this.setRobotPosition(
            row,
            col
        );


        this.handleAutomaticInteraction(
            row,
            col
        );


        return true;
    }


    canEnter(
        row,
        col
    ) {

        if (
            !this.isInside(
                row,
                col
            )
        ) {

            return false;
        }


        const key =
            this.positionKey(
                row,
                col
            );


        if (
            this.boxes.has(
                key
            )
        ) {

            return false;
        }


        const tile =
            this.getTileType(
                row,
                col
            );


        if (
            tile === "wall"
        ) {

            return false;
        }


        if (
            tile === "door" &&
            !this.openDoors.has(
                key
            )
        ) {

            return false;
        }


        return true;
    }


    isInside(
        row,
        col
    ) {

        return (
            row >= 0 &&
            col >= 0 &&
            row < this.rows &&
            col < this.cols
        );
    }


    // =====================================================
    // CAISSES
    // =====================================================

    pushBox(
        boxRow,
        boxCol
    ) {

        const robotPosition =
            this.getRobotPosition();

        if (!robotPosition) {

            return false;
        }


        const rowDelta =
            boxRow -
            robotPosition.row;

        const colDelta =
            boxCol -
            robotPosition.col;


        /*
        La caisse doit être juste devant Pyt.
        */

        if (
            Math.abs(rowDelta) +
            Math.abs(colDelta) !==
            1
        ) {

            this.message =
                "La caisse ne peut pas être poussée.";

            return false;
        }


        const targetRow =
            boxRow +
            rowDelta;

        const targetCol =
            boxCol +
            colDelta;


        if (
            !this.isInside(
                targetRow,
                targetCol
            )
        ) {

            this.message =
                "La caisse est bloquée.";

            return false;
        }


        const targetKey =
            this.positionKey(
                targetRow,
                targetCol
            );


        if (
            this.boxes.has(
                targetKey
            )
        ) {

            this.message =
                "Une autre caisse bloque le passage.";

            return false;
        }


        const targetTile =
            this.getBaseTileType(
                targetRow,
                targetCol
            );


        if (
            targetTile === "wall"
        ) {

            this.message =
                "La caisse est bloquée par un mur.";

            return false;
        }


        if (
            targetTile === "door" &&
            !this.openDoors.has(
                targetKey
            )
        ) {

            this.message =
                "La caisse est bloquée par une porte fermée.";

            return false;
        }


        const oldKey =
            this.positionKey(
                boxRow,
                boxCol
            );


        this.boxes.delete(
            oldKey
        );

        this.boxes.add(
            targetKey
        );


        return true;
    }


    // =====================================================
    // INTERACTIONS AUTOMATIQUES
    // =====================================================

    handleAutomaticInteraction(
        row,
        col
    ) {

        const key =
            this.positionKey(
                row,
                col
            );


        // ---------------------------------------------
        // OBJET
        // ---------------------------------------------

        if (
            this.objects.has(
                key
            )
        ) {

            this.objects.delete(
                key
            );

            this.collectedObjects++;


            if (
                this.robot &&
                typeof this.robot.addItem ===
                "function"
            ) {

                this.robot.addItem(
                    "object"
                );

            } else if (
                this.robot
            ) {

                if (
                    !Array.isArray(
                        this.robot.inventory
                    )
                ) {

                    this.robot.inventory =
                        [];
                }

                this.robot.inventory.push(
                    "object"
                );
            }


            this.message =
                "Objet ramassé automatiquement.";
        }


        // ---------------------------------------------
        // SALETÉ
        // ---------------------------------------------

        if (
            this.dirt.has(
                key
            )
        ) {

            this.dirt.delete(
                key
            );

            this.cleanedTiles++;

            this.message =
                "Zone nettoyée automatiquement.";
        }


        // ---------------------------------------------
        // BOUTON
        // ---------------------------------------------

        if (
            this.buttons.has(
                key
            ) &&
            !this.activatedButtons.has(
                key
            )
        ) {

            this.activatedButtons.add(
                key
            );

            this.openAllDoors();

            this.message =
                "Bouton activé. Les portes s'ouvrent.";
        }


        // ---------------------------------------------
        // CHARGEUR
        // ---------------------------------------------

        if (
            this.chargers.has(
                key
            )
        ) {

            if (
                this.robot &&
                typeof this.robot.restoreEnergy ===
                "function"
            ) {

                this.robot.restoreEnergy();

            } else if (
                this.robot &&
                typeof this.robot.setEnergy ===
                "function"
            ) {

                this.robot.setEnergy(
                    100
                );

            } else if (
                this.robot &&
                "energy" in this.robot
            ) {

                this.robot.energy =
                    100;
            }

            this.message =
                "Énergie rechargée.";
        }


        // ---------------------------------------------
        // DÉPÔT
        // ---------------------------------------------

        if (
            this.deposits.has(
                key
            )
        ) {

            const deposited =
                this.depositInventory();

            if (
                deposited > 0
            ) {

                this.message =
                    deposited === 1
                        ? "Objet déposé automatiquement."
                        : `${deposited} objets déposés automatiquement.`;
            }
        }
    }


    depositInventory() {

        if (!this.robot) {

            return 0;
        }


        let count = 0;


        if (
            typeof this.robot.getInventoryCount ===
            "function"
        ) {

            count =
                Number(
                    this.robot.getInventoryCount()
                ) || 0;

        } else if (
            Array.isArray(
                this.robot.inventory
            )
        ) {

            count =
                this.robot.inventory.length;
        }


        if (
            count <= 0
        ) {

            return 0;
        }


        if (
            typeof this.robot.clearInventory ===
            "function"
        ) {

            this.robot.clearInventory();

        } else if (
            Array.isArray(
                this.robot.inventory
            )
        ) {

            this.robot.inventory.length =
                0;
        }


        this.depositedObjects +=
            count;


        return count;
    }


    // =====================================================
    // PORTES
    // =====================================================

    openAllDoors() {

        for (
            const key
            of this.doors
        ) {

            this.openDoors.add(
                key
            );
        }
    }


    closeAllDoors() {

        this.openDoors.clear();
    }


    // =====================================================
    // TUILES
    // =====================================================

    normalizeTile(tile) {

        if (
            tile === null ||
            tile === undefined
        ) {

            return "floor";
        }


        if (
            typeof tile ===
            "object"
        ) {

            if (
                tile.type
            ) {

                return this.normalizeTile(
                    tile.type
                );
            }

            return "floor";
        }


        const value =
            String(tile)
                .trim()
                .toLowerCase();


        const aliases = {

            "":
                "floor",

            ".":
                "floor",

            floor:
                "floor",

            ground:
                "floor",


            "#":
                "wall",

            wall:
                "wall",


            "g":
                "goal",

            goal:
                "goal",

            finish:
                "goal",

            target:
                "goal",


            "o":
                "object",

            object:
                "object",

            item:
                "object",

            book:
                "object",


            "x":
                "dirt",

            dirt:
                "dirt",

            dirty:
                "dirt",


            "b":
                "button",

            button:
                "button",

            switch:
                "button",


            "d":
                "door",

            door:
                "door",


            "c":
                "charger",

            charger:
                "charger",


            "p":
                "deposit",

            deposit:
                "deposit",


            "box":
                "box",

            crate:
                "box",


            "box_goal":
                "box_goal",

            boxgoal:
                "box_goal",


            "s":
                "start",

            start:
                "start"
        };


        return (
            aliases[value] ||
            value
        );
    }


    getBaseTileType(
        row,
        col
    ) {

        if (
            !this.isInside(
                row,
                col
            )
        ) {

            return "wall";
        }


        return this.normalizeTile(
            this.grid[row][col]
        );
    }


    getTileType(
        row,
        col
    ) {

        if (
            !this.isInside(
                row,
                col
            )
        ) {

            return "wall";
        }


        const key =
            this.positionKey(
                row,
                col
            );


        /*
        Les éléments dynamiques ont priorité.
        */

        if (
            this.boxes.has(
                key
            )
        ) {

            return "box";
        }


        if (
            this.objects.has(
                key
            )
        ) {

            return "object";
        }


        if (
            this.dirt.has(
                key
            )
        ) {

            return "dirt";
        }


        if (
            this.buttons.has(
                key
            )
        ) {

            return "button";
        }


        if (
            this.doors.has(
                key
            )
        ) {

            if (
                this.openDoors.has(
                    key
                )
            ) {

                return "floor";
            }

            return "door";
        }


        if (
            this.chargers.has(
                key
            )
        ) {

            return "charger";
        }


        if (
            this.deposits.has(
                key
            )
        ) {

            return "deposit";
        }


        if (
            this.boxGoals.has(
                key
            )
        ) {

            return "box_goal";
        }


        if (
            this.goal &&
            this.goal.row === row &&
            this.goal.col === col
        ) {

            return "goal";
        }


        const base =
            this.getBaseTileType(
                row,
                col
            );


        /*
        Si un objet dynamique de la grille a déjà
        disparu, on affiche simplement le sol.
        */

        if (
            [
                "object",
                "dirt",
                "box"
            ].includes(
                base
            )
        ) {

            return "floor";
        }


        if (
            base === "door" &&
            this.openDoors.has(
                key
            )
        ) {

            return "floor";
        }


        return base;
    }


    // =====================================================
    // INVENTAIRE
    // =====================================================

    getInventoryCount() {

        if (!this.robot) {

            return 0;
        }


        if (
            typeof this.robot.getInventoryCount ===
            "function"
        ) {

            return Number(
                this.robot.getInventoryCount()
            ) || 0;
        }


        if (
            Array.isArray(
                this.robot.inventory
            )
        ) {

            return this.robot.inventory.length;
        }


        return 0;
    }


    // =====================================================
    // OBJECTIFS
    // =====================================================

    checkSuccess() {

        if (!this.level) {

            this.message =
                "Aucun niveau n'est chargé.";

            return false;
        }


        const objective =
            this.level.objective ||
            this.level.objectiveType ||
            "reach_goal";


        const success =
            this.checkObjective(
                objective
            );


        this.finished =
            success;


        return success;
    }


    checkObjective(objective) {

        /*
        Objectif sous forme d'objet :
        {
            type: "combined",
            requirements: [...]
        }
        */

        if (
            objective &&
            typeof objective ===
            "object" &&
            !Array.isArray(
                objective
            )
        ) {

            const type =
                objective.type ||
                "combined";


            if (
                type === "combined"
            ) {

                return this.checkCombinedObjective(
                    objective
                );
            }


            return this.checkObjective(
                type
            );
        }


        /*
        Tableau = tous les objectifs doivent être vrais.
        */

        if (
            Array.isArray(
                objective
            )
        ) {

            for (
                const item
                of objective
            ) {

                if (
                    !this.checkObjective(
                        item
                    )
                ) {

                    return false;
                }
            }

            this.message =
                "Mission réussie.";

            return true;
        }


        const type =
            String(
                objective ||
                "reach_goal"
            )
                .trim()
                .toLowerCase();


        switch (type) {

            case "reach_goal":
            case "goal":

                return this.checkReachGoal();


            case "collect_all":
            case "collect":

                return this.checkCollectAll();


            case "clean_all":
            case "clean":

                return this.checkCleanAll();


            case "activate_all":
            case "buttons":

                return this.checkActivateAll();


            case "deposit":
            case "deposit_all":

                return this.checkDeposit();


            case "boxes":
            case "box":
            case "boxes_on_goals":

                return this.checkBoxes();


            case "collect_and_goal":

                return this.checkCollectAndGoal();


            case "clean_and_goal":

                return this.checkCleanAndGoal();


            case "activate_and_goal":

                return this.checkActivateAndGoal();


            case "deposit_and_goal":

                return this.checkDepositAndGoal();


            case "combined":

                return this.checkCombinedObjective(
                    this.level.objectiveDetails ||
                    this.level
                );


            default:

                /*
                Si un ancien niveau utilise un objectif
                inconnu, on privilégie l'arrivée au but
                plutôt que de casser le jeu.
                */

                return this.checkReachGoal();
        }
    }


    checkReachGoal() {

        if (!this.goal) {

            this.message =
                "La mission n'a pas de case d'arrivée.";

            return false;
        }


        const position =
            this.getRobotPosition();


        if (
            !this.samePosition(
                position,
                this.goal
            )
        ) {

            this.message =
                "Ce n’est pas là que je voulais aller...";

            return false;
        }


        this.message =
            "Destination atteinte.";

        return true;
    }


    checkCollectAll() {

        if (
            this.objects.size > 0
        ) {

            const remaining =
                this.objects.size;


            this.message =
                remaining === 1
                    ? "Il reste encore un objet à récupérer."
                    : `Il reste encore ${remaining} objets à récupérer.`;

            return false;
        }


        if (
            this.initialObjectCount > 0 &&
            this.collectedObjects <
            this.initialObjectCount
        ) {

            this.message =
                "Tous les objets n'ont pas encore été récupérés.";

            return false;
        }


        this.message =
            "Tous les objets ont été récupérés.";

        return true;
    }


    checkCleanAll() {

        if (
            this.dirt.size > 0
        ) {

            const remaining =
                this.dirt.size;


            this.message =
                remaining === 1
                    ? "Il reste encore une zone à nettoyer."
                    : `Il reste encore ${remaining} zones à nettoyer.`;

            return false;
        }


        this.message =
            "Tout est propre.";

        return true;
    }


    checkActivateAll() {

        const missing =
            this.buttons.size -
            this.activatedButtons.size;


        if (
            missing > 0
        ) {

            this.message =
                missing === 1
                    ? "Il reste encore un bouton à activer."
                    : `Il reste encore ${missing} boutons à activer.`;

            return false;
        }


        this.message =
            "Tous les boutons sont activés.";

        return true;
    }


    checkDeposit() {

        if (
            this.objects.size > 0
        ) {

            this.message =
                "Il reste encore un objet à récupérer avant de terminer.";

            return false;
        }


        const inventory =
            this.getInventoryCount();


        if (
            inventory > 0
        ) {

            this.message =
                "Pyt transporte encore un objet. Il faut l'apporter à la zone de dépôt.";

            return false;
        }


        if (
            this.initialObjectCount > 0 &&
            this.depositedObjects <
            this.initialObjectCount
        ) {

            this.message =
                "Tous les objets n'ont pas encore été déposés.";

            return false;
        }


        this.message =
            "Tous les objets ont été déposés.";

        return true;
    }


    checkBoxes() {

        if (
            this.boxGoals.size === 0
        ) {

            this.message =
                "Aucune destination de caisse n'est définie.";

            return false;
        }


        for (
            const goalKey
            of this.boxGoals
        ) {

            if (
                !this.boxes.has(
                    goalKey
                )
            ) {

                this.message =
                    "Une caisse n'est pas encore à la bonne place.";

                return false;
            }
        }


        this.message =
            "Toutes les caisses sont bien placées.";

        return true;
    }


    checkCollectAndGoal() {

        if (
            !this.checkCollectAll()
        ) {

            return false;
        }


        if (
            !this.checkReachGoal()
        ) {

            return false;
        }


        this.message =
            "Objet récupéré et destination atteinte.";

        return true;
    }


    checkCleanAndGoal() {

        if (
            !this.checkCleanAll()
        ) {

            return false;
        }


        if (
            !this.checkReachGoal()
        ) {

            return false;
        }


        this.message =
            "Nettoyage terminé et destination atteinte.";

        return true;
    }


    checkActivateAndGoal() {

        if (
            !this.checkActivateAll()
        ) {

            return false;
        }


        if (
            !this.checkReachGoal()
        ) {

            return false;
        }


        this.message =
            "Mécanisme activé et destination atteinte.";

        return true;
    }


    checkDepositAndGoal() {

        if (
            !this.checkDeposit()
        ) {

            return false;
        }


        if (
            !this.checkReachGoal()
        ) {

            return false;
        }


        this.message =
            "Livraison terminée et destination atteinte.";

        return true;
    }


    checkCombinedObjective(
        configuration = {}
    ) {

        let requirements =
            configuration.requirements ||
            configuration.objectives ||
            this.level.requirements ||
            this.level.objectives ||
            [];


        /*
        Compatibilité avec des booléens simples.
        */

        if (
            !Array.isArray(
                requirements
            ) ||
            requirements.length === 0
        ) {

            requirements = [];


            if (
                configuration.collectAll ||
                this.level.collectAll
            ) {

                requirements.push(
                    "collect_all"
                );
            }


            if (
                configuration.cleanAll ||
                this.level.cleanAll
            ) {

                requirements.push(
                    "clean_all"
                );
            }


            if (
                configuration.activateAll ||
                this.level.activateAll
            ) {

                requirements.push(
                    "activate_all"
                );
            }


            if (
                configuration.depositAll ||
                this.level.depositAll
            ) {

                requirements.push(
                    "deposit"
                );
            }


            if (
                configuration.boxes ||
                this.level.requireBoxes
            ) {

                requirements.push(
                    "boxes"
                );
            }


            if (
                configuration.reachGoal !== false &&
                this.level.reachGoal !== false
            ) {

                requirements.push(
                    "reach_goal"
                );
            }
        }


        if (
            requirements.length === 0
        ) {

            requirements = [
                "reach_goal"
            ];
        }


        for (
            const requirement
            of requirements
        ) {

            if (
                !this.checkObjective(
                    requirement
                )
            ) {

                return false;
            }
        }


        this.message =
            "Tous les objectifs sont terminés.";

        return true;
    }


    // =====================================================
    // ÉTAT / RESET
    // =====================================================

    getState() {

        return {

            chapter:
                this.level?.chapter ||
                null,

            exercise:
                this.level?.exercise ||
                null,

            robot:
                this.robot &&
                typeof this.robot.getState ===
                "function"
                    ? this.robot.getState()
                    : {
                        position:
                            this.getRobotPosition(),

                        direction:
                            this.getRobotDirection(),

                        inventory:
                            this.getInventoryCount()
                    },

            objectsRemaining:
                this.objects.size,

            dirtRemaining:
                this.dirt.size,

            buttonsActivated:
                this.activatedButtons.size,

            buttonsTotal:
                this.buttons.size,

            doorsOpen:
                this.openDoors.size,

            boxes:
                [...this.boxes]
                    .map(
                        key =>
                            this.positionFromKey(
                                key
                            )
                    ),

            depositedObjects:
                this.depositedObjects,

            goal:
                this.goal
                    ? {
                        ...this.goal
                    }
                    : null,

            success:
                this.finished,

            message:
                this.message
        };
    }


    reset() {

        if (!this.level) {

            return;
        }


        this.loadLevel(
            this.level,
            this.robot
        );
    }
}


// =========================================================
// EXPOSITION NAVIGATEUR
// =========================================================

window.Game =
    Game;