"use strict";

/* =========================================================
   PYT - game.js
   Moteur logique du monde.
========================================================= */

class Game {

    constructor(level = null, robot = null) {
        this.level = null;
        this.robot = robot || null;

        this.grid = [];

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
        this.depositedObjects = 0;

        this.initialObjectCount = 0;
        this.initialDirtCount = 0;
        this.initialButtonCount = 0;
        this.initialBoxCount = 0;

        this.message = "";

        if (level) {
            this.loadLevel(level);
        }
    }


    /* =====================================================
       CHARGEMENT
    ===================================================== */

    loadLevel(level) {
        this.level = level;

        this.grid =
            this.cloneGrid(
                level.grid || []
            );

        this.clearDynamicState();

        this.scanGrid();

        this.loadSeparateLevelData();

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
        this.applyAutomaticInteraction();

        return this;
    }


    cloneGrid(grid) {
        if (!Array.isArray(grid)) {
            return [];
        }

        return grid.map(
            row =>
                Array.isArray(row)
                    ? [...row]
                    : []
        );
    }


    clearDynamicState() {
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
        this.depositedObjects = 0;

        this.message = "";
    }


    /* =====================================================
       LECTURE DE LA GRILLE
    ===================================================== */

    scanGrid() {
        for (
            let row = 0;
            row < this.grid.length;
            row++
        ) {
            const gridRow =
                this.grid[row];

            if (!Array.isArray(gridRow)) {
                continue;
            }

            for (
                let col = 0;
                col < gridRow.length;
                col++
            ) {
                const tile =
                    this.normalizeTile(
                        gridRow[col]
                    );

                const key =
                    this.positionKey(
                        row,
                        col
                    );

                switch (tile) {
                    case "object":
                        this.objects.add(key);
                        break;

                    case "dirt":
                        this.dirt.add(key);
                        break;

                    case "button":
                        this.buttons.add(key);
                        break;

                    case "door":
                        this.doors.add(key);
                        break;

                    case "charger":
                        this.chargers.add(key);
                        break;

                    case "deposit":
                        this.deposits.add(key);
                        break;

                    case "box":
                        this.boxes.add(key);
                        break;

                    case "box_goal":
                        this.boxGoals.add(key);
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
    }


    loadSeparateLevelData() {
        const level =
            this.level || {};

        this.addPositionsToSet(
            level.objects,
            this.objects
        );

        this.addPositionsToSet(
            level.dirt,
            this.dirt
        );

        this.addPositionsToSet(
            level.buttons,
            this.buttons
        );

        this.addPositionsToSet(
            level.doors,
            this.doors
        );

        this.addPositionsToSet(
            level.chargers,
            this.chargers
        );

        this.addPositionsToSet(
            level.deposits,
            this.deposits
        );

        this.addPositionsToSet(
            level.boxes,
            this.boxes
        );

        this.addPositionsToSet(
            level.boxGoals,
            this.boxGoals
        );


        if (level.goal) {
            const goal =
                this.parsePosition(
                    level.goal
                );

            if (goal) {
                this.goal = goal;
            }
        }
    }


    addPositionsToSet(
        positions,
        targetSet
    ) {
        if (!Array.isArray(positions)) {
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


    normalizeTile(tile) {
        if (
            tile === null ||
            tile === undefined
        ) {
            return "floor";
        }

        const value =
            String(tile)
                .trim()
                .toLowerCase();

        const aliases = {
            "": "floor",
            ".": "floor",
            "floor": "floor",
            "empty": "floor",

            "#": "wall",
            "wall": "wall",

            "s": "start",
            "start": "start",
            "robot": "start",

            "g": "goal",
            "goal": "goal",

            "o": "object",
            "object": "object",
            "item": "object",

            "dirt": "dirt",
            "clean": "dirt",

            "button": "button",
            "switch": "button",

            "door": "door",

            "charger": "charger",
            "charge": "charger",

            "deposit": "deposit",
            "drop": "deposit",

            "box": "box",
            "crate": "box",

            "box_goal": "box_goal",
            "box-goal": "box_goal",
            "crate_goal": "box_goal"
        };

        return aliases[value] || value;
    }


    /* =====================================================
       ROBOT
    ===================================================== */

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

        this.robot.row =
            start.row;

        this.robot.col =
            start.col;

        this.robot.direction =
            start.direction;
    }


    getStartPosition() {
        const level =
            this.level || {};

        const candidates = [
            level.start,
            level.robotStart,
            level.robot,
            level.startPosition
        ];

        for (
            const candidate
            of candidates
        ) {
            const parsed =
                this.parsePosition(
                    candidate
                );

            if (parsed) {
                return {
                    row: parsed.row,
                    col: parsed.col,
                    direction:
                        candidate?.direction ||
                        candidate?.dir ||
                        "EAST"
                };
            }
        }


        for (
            let row = 0;
            row < this.grid.length;
            row++
        ) {
            for (
                let col = 0;
                col <
                (
                    this.grid[row]?.length ||
                    0
                );
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
                        direction: "EAST"
                    };
                }
            }
        }


        return {
            row: 1,
            col: 1,
            direction: "EAST"
        };
    }


    getRobotPosition() {
        if (!this.robot) {
            return null;
        }

        if (
            typeof this.robot.getPosition ===
            "function"
        ) {
            return this.robot.getPosition();
        }

        return {
            row: this.robot.row,
            col: this.robot.col
        };
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

        this.robot.row = row;
        this.robot.col = col;
    }


    /* =====================================================
       DÉPLACEMENTS
    ===================================================== */

    moveForward() {
        if (!this.robot) {
            return false;
        }

        const vector =
            this.getDirectionVector();

        return this.moveRobot(
            vector.row,
            vector.col
        );
    }


    moveBackward() {
        if (!this.robot) {
            return false;
        }

        const vector =
            this.getDirectionVector();

        return this.moveRobot(
            -vector.row,
            -vector.col
        );
    }


    moveRobot(
        rowDelta,
        colDelta
    ) {
        const current =
            this.getRobotPosition();

        if (!current) {
            return false;
        }

        const target = {
            row:
                current.row +
                rowDelta,

            col:
                current.col +
                colDelta
        };

        return this.moveRobotTo(
            target.row,
            target.col
        );
    }


    moveRobotTo(
        row,
        col
    ) {
        const current =
            this.getRobotPosition();

        if (!current) {
            return false;
        }

        const targetKey =
            this.positionKey(
                row,
                col
            );


        /*
        Si une caisse se trouve devant Pyt,
        on essaie de la pousser.
        */

        if (
            this.boxes.has(
                targetKey
            )
        ) {
            const pushed =
                this.pushBox(
                    current,
                    {
                        row,
                        col
                    }
                );

            if (!pushed) {
                this.message =
                    "La caisse ne peut pas être poussée dans cette direction.";

                return false;
            }
        }


        if (
            !this.canEnter(
                row,
                col
            )
        ) {
            this.message =
                "Pyt ne peut pas aller sur cette case.";

            return false;
        }


        this.setRobotPosition(
            row,
            col
        );

        this.message = "";

        this.applyAutomaticInteraction();

        return true;
    }


    canEnter(
        row,
        col
    ) {
        if (
            !this.isInsideGrid(
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
            this.boxes.has(key)
        ) {
            return false;
        }


        const tile =
            this.getBaseTileType(
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
            !this.openDoors.has(key)
        ) {
            return false;
        }


        return true;
    }


    pushBox(
        robotPosition,
        boxPosition
    ) {
        const rowDelta =
            boxPosition.row -
            robotPosition.row;

        const colDelta =
            boxPosition.col -
            robotPosition.col;


        if (
            Math.abs(rowDelta) +
            Math.abs(colDelta) !== 1
        ) {
            return false;
        }


        const destination = {
            row:
                boxPosition.row +
                rowDelta,

            col:
                boxPosition.col +
                colDelta
        };


        if (
            !this.isInsideGrid(
                destination.row,
                destination.col
            )
        ) {
            return false;
        }


        const destinationKey =
            this.positionKey(
                destination.row,
                destination.col
            );


        if (
            this.boxes.has(
                destinationKey
            )
        ) {
            return false;
        }


        const destinationTile =
            this.getBaseTileType(
                destination.row,
                destination.col
            );


        if (
            destinationTile === "wall"
        ) {
            return false;
        }


        if (
            destinationTile === "door" &&
            !this.openDoors.has(
                destinationKey
            )
        ) {
            return false;
        }


        const oldKey =
            this.positionKey(
                boxPosition.row,
                boxPosition.col
            );

        this.boxes.delete(
            oldKey
        );

        this.boxes.add(
            destinationKey
        );

        return true;
    }


    getDirectionVector() {
        if (
            this.robot &&
            typeof this.robot.getDirectionVector ===
            "function"
        ) {
            return this.robot
                .getDirectionVector();
        }

        const direction =
            String(
                this.robot?.direction ||
                "EAST"
            ).toUpperCase();

        switch (direction) {
            case "N":
            case "NORTH":
            case "UP":
                return {
                    row: -1,
                    col: 0
                };

            case "S":
            case "SOUTH":
            case "DOWN":
                return {
                    row: 1,
                    col: 0
                };

            case "W":
            case "WEST":
            case "LEFT":
                return {
                    row: 0,
                    col: -1
                };

            case "E":
            case "EAST":
            case "RIGHT":
            default:
                return {
                    row: 0,
                    col: 1
                };
        }
    }


    /* =====================================================
       INTERACTIONS AUTOMATIQUES
    ===================================================== */

    applyAutomaticInteraction() {
        const position =
            this.getRobotPosition();

        if (!position) {
            return;
        }

        const key =
            this.positionKey(
                position.row,
                position.col
            );


        /*
        Objet :
        ramassé automatiquement.
        */

        if (
            this.objects.has(key)
        ) {
            this.objects.delete(key);

            this.collectedObjects++;

            if (
                this.robot &&
                typeof this.robot.addItem ===
                "function"
            ) {
                this.robot.addItem(
                    "object",
                    1
                );
            }
        }


        /*
        Saleté :
        nettoyée automatiquement.
        */

        if (
            this.dirt.has(key)
        ) {
            this.dirt.delete(key);
        }


        /*
        Bouton :
        activation automatique.
        */

        if (
            this.buttons.has(key)
        ) {
            this.activatedButtons.add(
                key
            );

            this.openAllDoors();
        }


        /*
        Chargeur :
        énergie restaurée automatiquement.
        */

        if (
            this.chargers.has(key)
        ) {
            if (
                this.robot &&
                typeof this.robot.restoreEnergy ===
                "function"
            ) {
                this.robot.restoreEnergy();
            }
        }


        /*
        Zone de dépôt :
        les objets transportés sont déposés.
        */

        if (
            this.deposits.has(key)
        ) {
            this.depositInventory();
        }
    }


    openAllDoors() {
        for (
            const door
            of this.doors
        ) {
            this.openDoors.add(
                door
            );
        }
    }


    depositInventory() {
        const count =
            this.getInventoryCount();

        if (
            count <= 0
        ) {
            return 0;
        }

        this.depositedObjects +=
            count;


        if (
            this.robot &&
            typeof this.robot.clearInventory ===
            "function"
        ) {
            this.robot.clearInventory();

        } else if (
            this.robot &&
            this.robot.inventory
        ) {
            if (
                this.robot.inventory instanceof
                Map
            ) {
                this.robot.inventory.clear();

            } else {
                this.robot.inventory = {};
            }
        }

        return count;
    }


    getInventoryCount() {
        if (!this.robot) {
            return 0;
        }

        if (
            typeof this.robot.getInventoryCount ===
            "function"
        ) {
            return this.robot
                .getInventoryCount();
        }

        if (
            typeof this.robot.getCount ===
            "function"
        ) {
            return this.robot
                .getCount();
        }

        const inventory =
            this.robot.inventory;

        if (
            inventory instanceof Map
        ) {
            let count = 0;

            for (
                const amount
                of inventory.values()
            ) {
                count +=
                    Number(amount) || 0;
            }

            return count;
        }

        if (
            inventory &&
            typeof inventory === "object"
        ) {
            return Object.values(
                inventory
            ).reduce(
                (
                    total,
                    amount
                ) =>
                    total +
                    (
                        Number(amount) ||
                        0
                    ),
                0
            );
        }

        return 0;
    }


    /* =====================================================
       TUILES
    ===================================================== */

    getBaseTileType(
        row,
        col
    ) {
        if (
            !this.isInsideGrid(
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
            !this.isInsideGrid(
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
        Éléments dynamiques prioritaires.
        */

        if (
            this.boxes.has(key)
        ) {
            return "box";
        }

        if (
            this.objects.has(key)
        ) {
            return "object";
        }

        if (
            this.dirt.has(key)
        ) {
            return "dirt";
        }

        if (
            this.buttons.has(key)
        ) {
            return "button";
        }

        if (
            this.chargers.has(key)
        ) {
            return "charger";
        }

        if (
            this.deposits.has(key)
        ) {
            return "deposit";
        }

        if (
            this.boxGoals.has(key)
        ) {
            return "box_goal";
        }


        const base =
            this.getBaseTileType(
                row,
                col
            );


        /*
        Porte ouverte :
        elle devient visuellement du sol.
        */

        if (
            base === "door" &&
            this.openDoors.has(key)
        ) {
            return "floor";
        }


        /*
        Objet ou saleté déjà récupéré/nettoyé :
        ne doit plus être dessiné.
        */

        if (
            base === "object" &&
            !this.objects.has(key)
        ) {
            return "floor";
        }

        if (
            base === "dirt" &&
            !this.dirt.has(key)
        ) {
            return "floor";
        }


        return base;
    }


    /* =====================================================
       OBJECTIFS
    ===================================================== */

    checkSuccess() {
        if (!this.level) {
            return false;
        }

        return this.checkObjective(
            this.level.objective ||
            "reach_goal"
        );
    }


    checkObjective(objective) {
        if (
            objective &&
            typeof objective === "object" &&
            !Array.isArray(objective)
        ) {
            /*
            Objectif combiné.
            */

            if (
                Array.isArray(
                    objective.requirements
                )
            ) {
                return objective.requirements
                    .every(
                        requirement =>
                            this.checkObjective(
                                requirement
                            )
                    );
            }

            if (
                Array.isArray(
                    objective.objectives
                )
            ) {
                return objective.objectives
                    .every(
                        requirement =>
                            this.checkObjective(
                                requirement
                            )
                    );
            }

            if (objective.type) {
                return this.checkObjective(
                    objective.type
                );
            }
        }


        if (
            Array.isArray(objective)
        ) {
            return objective.every(
                requirement =>
                    this.checkObjective(
                        requirement
                    )
            );
        }


        const type =
            String(
                objective ||
                "reach_goal"
            )
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
            case "activate":
                return this.checkActivateAll();

            case "deposit":
            case "deposit_all":
                return this.checkDeposit();

            case "boxes":
            case "boxes_on_goals":
                return this.checkBoxes();

            case "collect_and_goal":
                return (
                    this.checkCollectAll() &&
                    this.checkReachGoal()
                );

            case "clean_and_goal":
                return (
                    this.checkCleanAll() &&
                    this.checkReachGoal()
                );

            case "activate_and_goal":
                return (
                    this.checkActivateAll() &&
                    this.checkReachGoal()
                );

            case "deposit_and_goal":
                return (
                    this.checkDeposit() &&
                    this.checkReachGoal()
                );

            case "combined":
                return this.checkCombinedObjective();

            default:
                /*
                Si un ancien niveau contient un nom
                inconnu, on garde un comportement
                raisonnable : atteindre l'objectif.
                */
                return this.checkReachGoal();
        }
    }


    checkReachGoal() {
        if (!this.goal) {
            return true;
        }

        const position =
            this.getRobotPosition();

        if (!position) {
            return false;
        }

        return this.samePosition(
            position,
            this.goal
        );
    }


    checkCollectAll() {
        return (
            this.objects.size === 0 &&
            this.collectedObjects >=
            this.initialObjectCount
        );
    }


    checkCleanAll() {
        return (
            this.dirt.size === 0
        );
    }


    checkActivateAll() {
        if (
            this.initialButtonCount === 0
        ) {
            return true;
        }

        return (
            this.activatedButtons.size >=
            this.initialButtonCount
        );
    }


    checkDeposit() {
        if (
            this.initialObjectCount === 0
        ) {
            return true;
        }

        return (
            this.objects.size === 0 &&
            this.getInventoryCount() === 0 &&
            this.depositedObjects >=
            this.initialObjectCount
        );
    }


    checkBoxes() {
        if (
            this.boxes.size === 0 &&
            this.initialBoxCount === 0
        ) {
            return true;
        }

        if (
            this.boxGoals.size === 0
        ) {
            return false;
        }

        if (
            this.boxes.size !==
            this.boxGoals.size
        ) {
            return false;
        }

        for (
            const box
            of this.boxes
        ) {
            if (
                !this.boxGoals.has(box)
            ) {
                return false;
            }
        }

        return true;
    }


    checkCombinedObjective() {
        const objective =
            this.level?.objective;

        if (
            objective &&
            typeof objective === "object"
        ) {
            const requirements =
                objective.requirements ||
                objective.objectives;

            if (
                Array.isArray(requirements)
            ) {
                return requirements.every(
                    requirement =>
                        this.checkObjective(
                            requirement
                        )
                );
            }
        }


        /*
        Ancienne compatibilité :
        un objectif "combined" sans détails
        vérifie les éléments présents dans le niveau.
        */

        const checks = [];


        if (
            this.initialObjectCount > 0
        ) {
            checks.push(
                this.checkCollectAll()
            );
        }


        if (
            this.initialDirtCount > 0
        ) {
            checks.push(
                this.checkCleanAll()
            );
        }


        if (
            this.initialButtonCount > 0
        ) {
            checks.push(
                this.checkActivateAll()
            );
        }


        if (
            this.initialBoxCount > 0
        ) {
            checks.push(
                this.checkBoxes()
            );
        }


        if (this.goal) {
            checks.push(
                this.checkReachGoal()
            );
        }


        return (
            checks.length === 0 ||
            checks.every(Boolean)
        );
    }


    /* =====================================================
       ÉTAT
    ===================================================== */

    getState() {
        return {
            levelId:
                this.level?.id || null,

            robot:
                this.robot?.getState
                    ? this.robot.getState()
                    : this.getRobotPosition(),

            objects:
                [...this.objects],

            dirt:
                [...this.dirt],

            buttons:
                [...this.buttons],

            activatedButtons:
                [...this.activatedButtons],

            doors:
                [...this.doors],

            openDoors:
                [...this.openDoors],

            chargers:
                [...this.chargers],

            deposits:
                [...this.deposits],

            boxes:
                [...this.boxes],

            boxGoals:
                [...this.boxGoals],

            goal:
                this.goal
                    ? {...this.goal}
                    : null,

            collectedObjects:
                this.collectedObjects,

            depositedObjects:
                this.depositedObjects,

            success:
                this.checkSuccess(),

            message:
                this.message
        };
    }


    reset() {
        if (!this.level) {
            return;
        }

        this.loadLevel(
            this.level
        );
    }


    /* =====================================================
       POSITIONS
    ===================================================== */

    positionKey(
        row,
        col
    ) {
        return `${row},${col}`;
    }


    parsePosition(value) {
        if (
            value === null ||
            value === undefined
        ) {
            return null;
        }


        if (
            Array.isArray(value) &&
            value.length >= 2
        ) {
            const row =
                Number(value[0]);

            const col =
                Number(value[1]);

            if (
                Number.isFinite(row) &&
                Number.isFinite(col)
            ) {
                return {
                    row,
                    col
                };
            }

            return null;
        }


        if (
            typeof value === "object"
        ) {
            const row =
                Number(
                    value.row ??
                    value.r ??
                    value.y
                );

            const col =
                Number(
                    value.col ??
                    value.column ??
                    value.c ??
                    value.x
                );

            if (
                Number.isFinite(row) &&
                Number.isFinite(col)
            ) {
                return {
                    row,
                    col
                };
            }
        }


        if (
            typeof value === "string"
        ) {
            const match =
                value.match(
                    /^\s*(-?\d+)\s*,\s*(-?\d+)\s*$/
                );

            if (match) {
                return {
                    row:
                        Number(match[1]),

                    col:
                        Number(match[2])
                };
            }
        }


        return null;
    }


    samePosition(
        first,
        second
    ) {
        if (
            !first ||
            !second
        ) {
            return false;
        }

        return (
            Number(first.row) ===
            Number(second.row) &&
            Number(first.col) ===
            Number(second.col)
        );
    }


    isInsideGrid(
        row,
        col
    ) {
        return (
            Number.isInteger(row) &&
            Number.isInteger(col) &&
            row >= 0 &&
            col >= 0 &&
            row < this.grid.length &&
            Array.isArray(
                this.grid[row]
            ) &&
            col <
            this.grid[row].length
        );
    }
}


/* =========================================================
   EXPORT
========================================================= */

window.Game = Game;