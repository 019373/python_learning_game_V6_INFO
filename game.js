"use strict";

/* =========================================================
   PYT - game.js
   Moteur du niveau : collisions, objets, interactions,
   objectifs et état du jeu.
========================================================= */

class Game {

    constructor(level = null, robot = null) {
        this.level = null;
        this.robot = robot || new Robot();

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

        this.initialObjectCount = 0;
        this.initialDirtCount = 0;
        this.initialButtonCount = 0;
        this.initialBoxCount = 0;

        this.collectedObjects = 0;
        this.cleanedDirt = 0;
        this.depositedObjects = 0;

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
            Array.isArray(level?.grid)
                ? level.grid.map(
                    row =>
                        Array.isArray(row)
                            ? [...row]
                            : []
                )
                : [];

        this.clearDynamicState();
        this.scanGrid();
        this.scanSeparateLevelData();

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
        this.cleanedDirt = 0;
        this.depositedObjects = 0;

        this.message = "";
    }


    scanGrid() {
        for (
            let row = 0;
            row < this.grid.length;
            row++
        ) {
            const line =
                this.grid[row];

            if (!Array.isArray(line)) {
                continue;
            }

            for (
                let col = 0;
                col < line.length;
                col++
            ) {
                const type =
                    this.normalizeTile(
                        line[col]
                    );

                const key =
                    this.positionKey(
                        row,
                        col
                    );

                switch (type) {
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
    }


    scanSeparateLevelData() {
        if (!this.level) {
            return;
        }

        this.addPositionsToSet(
            this.objects,
            this.level.objects
        );

        this.addPositionsToSet(
            this.dirt,
            this.level.dirt
        );

        this.addPositionsToSet(
            this.buttons,
            this.level.buttons
        );

        this.addPositionsToSet(
            this.doors,
            this.level.doors
        );

        this.addPositionsToSet(
            this.chargers,
            this.level.chargers
        );

        this.addPositionsToSet(
            this.deposits,
            this.level.deposits
        );

        this.addPositionsToSet(
            this.boxes,
            this.level.boxes
        );

        this.addPositionsToSet(
            this.boxGoals,
            this.level.boxGoals
        );


        if (
            this.level.goal
        ) {
            const goal =
                this.parsePosition(
                    this.level.goal
                );

            if (goal) {
                this.goal = goal;
            }
        }
    }


    addPositionsToSet(
        target,
        positions
    ) {
        if (
            !target ||
            !Array.isArray(positions)
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

            if (parsed) {
                target.add(
                    this.positionKey(
                        parsed.row,
                        parsed.col
                    )
                );
            }
        }
    }


    /* =====================================================
       ROBOT
    ===================================================== */

    resetRobot() {
        const start =
            this.getStartPosition();

        if (
            typeof this.robot?.reset ===
            "function"
        ) {
            this.robot.reset(
                start.row,
                start.col,
                start.direction
            );

            return;
        }

        if (!this.robot) {
            this.robot =
                new Robot(
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
        const possibleStarts = [
            this.level?.start,
            this.level?.robotStart,
            this.level?.robot,
            this.level?.startPosition
        ];

        for (
            const possible
            of possibleStarts
        ) {
            const parsed =
                this.parsePosition(
                    possible
                );

            if (parsed) {
                return {
                    row:
                        parsed.row,

                    col:
                        parsed.col,

                    direction:
                        possible?.direction ||
                        possible?.dir ||
                        Robot.EAST
                };
            }
        }


        /*
        Compatibilité si le départ est placé
        directement dans la grille.
        */

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
                const raw =
                    String(
                        this.grid[row][col] ??
                        ""
                    )
                        .trim()
                        .toLowerCase();

                if (
                    [
                        "start",
                        "robot",
                        "pyt"
                    ].includes(raw)
                ) {
                    return {
                        row,
                        col,
                        direction:
                            Robot.EAST
                    };
                }
            }
        }


        return {
            row: 1,
            col: 1,
            direction:
                Robot.EAST
        };
    }


    /* =====================================================
       POSITIONS
    ===================================================== */

    parsePosition(value) {
        if (!value) {
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
            typeof value ===
            "object"
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
            typeof value ===
            "string"
        ) {
            const match =
                value.match(
                    /^\s*(-?\d+)\s*[,;:]\s*(-?\d+)\s*$/
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


    positionKey(
        row,
        col
    ) {
        return `${row},${col}`;
    }


    positionsEqual(
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


    getRobotPosition() {
        if (
            typeof this.robot
                ?.getPosition ===
            "function"
        ) {
            return this.robot
                .getPosition();
        }

        return {
            row:
                this.robot?.row ??
                0,

            col:
                this.robot?.col ??
                0
        };
    }


    setRobotPosition(
        row,
        col
    ) {
        if (
            typeof this.robot
                ?.setPosition ===
            "function"
        ) {
            return this.robot
                .setPosition(
                    row,
                    col
                );
        }

        if (!this.robot) {
            return false;
        }

        this.robot.row =
            row;

        this.robot.col =
            col;

        return true;
    }


    /* =====================================================
       DIRECTION
    ===================================================== */

    getDirectionVector() {
        if (
            typeof this.robot
                ?.getDirectionVector ===
            "function"
        ) {
            return this.robot
                .getDirectionVector();
        }


        const direction =
            String(
                this.robot?.direction ||
                Robot.EAST
            ).toUpperCase();


        switch (direction) {
            case "N":
            case "NORTH":
                return {
                    row: -1,
                    col: 0
                };

            case "S":
            case "SOUTH":
                return {
                    row: 1,
                    col: 0
                };

            case "W":
            case "WEST":
                return {
                    row: 0,
                    col: -1
                };

            case "E":
            case "EAST":
            default:
                return {
                    row: 0,
                    col: 1
                };
        }
    }


    /* =====================================================
       DÉPLACEMENTS
    ===================================================== */

    moveForward() {
        const vector =
            this.getDirectionVector();

        return this.moveRobot(
            vector.row,
            vector.col
        );
    }


    moveBackward() {
        const vector =
            this.getDirectionVector();

        return this.moveRobot(
            -vector.row,
            -vector.col
        );
    }


    moveRobot(
        deltaRow,
        deltaCol
    ) {
        const current =
            this.getRobotPosition();

        const target = {
            row:
                current.row +
                deltaRow,

            col:
                current.col +
                deltaCol
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

        const target = {
            row,
            col
        };


        /*
        Si une caisse est devant Pyt, on essaie
        automatiquement de la pousser.
        */

        const targetKey =
            this.positionKey(
                target.row,
                target.col
            );


        if (
            this.boxes.has(
                targetKey
            )
        ) {
            const pushed =
                this.pushBox(
                    current,
                    target
                );

            if (!pushed) {
                this.message =
                    "La caisse ne peut pas être poussée plus loin.";

                return false;
            }
        }


        if (
            !this.canEnter(
                target.row,
                target.col
            )
        ) {
            this.message =
                "Pyt ne peut pas aller sur cette case.";

            return false;
        }


        this.setRobotPosition(
            target.row,
            target.col
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
            this.boxes.has(
                key
            )
        ) {
            return false;
        }


        const tile =
            this.getStaticTileType(
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


    isInsideGrid(
        row,
        col
    ) {
        return (
            row >= 0 &&
            col >= 0 &&
            row <
            this.grid.length &&
            col <
            (
                this.grid[row]?.length ||
                0
            )
        );
    }


    /* =====================================================
       CAISSES
    ===================================================== */

    pushBox(
        robotPosition,
        boxPosition
    ) {
        const deltaRow =
            boxPosition.row -
            robotPosition.row;

        const deltaCol =
            boxPosition.col -
            robotPosition.col;


        /*
        Une caisse ne peut être poussée que
        vers une case directement adjacente.
        */

        if (
            Math.abs(deltaRow) +
            Math.abs(deltaCol) !==
            1
        ) {
            return false;
        }


        const destination = {
            row:
                boxPosition.row +
                deltaRow,

            col:
                boxPosition.col +
                deltaCol
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
            this.getStaticTileType(
                destination.row,
                destination.col
            );


        if (
            destinationTile ===
            "wall"
        ) {
            return false;
        }


        if (
            destinationTile ===
            "door" &&
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


    /* =====================================================
       INTERACTIONS AUTOMATIQUES
    ===================================================== */

    applyAutomaticInteraction() {
        const position =
            this.getRobotPosition();

        const key =
            this.positionKey(
                position.row,
                position.col
            );


        /*
        Objet
        */

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
                typeof this.robot
                    ?.addItem ===
                "function"
            ) {
                this.robot.addItem(
                    "object",
                    1
                );
            }
        }


        /*
        Saleté
        */

        if (
            this.dirt.has(
                key
            )
        ) {
            this.dirt.delete(
                key
            );

            this.cleanedDirt++;
        }


        /*
        Bouton
        */

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
        }


        /*
        Recharge
        */

        if (
            this.chargers.has(
                key
            )
        ) {
            if (
                typeof this.robot
                    ?.restoreEnergy ===
                "function"
            ) {
                this.robot
                    .restoreEnergy();
            }
        }


        /*
        Dépôt
        */

        if (
            this.deposits.has(
                key
            )
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
        let amount = 0;


        if (
            typeof this.robot
                ?.getInventoryCount ===
            "function"
        ) {
            amount =
                this.robot
                    .getInventoryCount();

        } else if (
            typeof this.robot
                ?.getCount ===
            "function"
        ) {
            amount =
                this.robot
                    .getCount();
        }


        if (
            amount <= 0
        ) {
            return 0;
        }


        this.depositedObjects +=
            amount;


        if (
            typeof this.robot
                ?.clearInventory ===
            "function"
        ) {
            this.robot
                .clearInventory();
        }


        return amount;
    }


    /* =====================================================
       TYPES DE CASE
    ===================================================== */

    normalizeTile(value) {
        if (
            value === null ||
            value === undefined
        ) {
            return "floor";
        }


        const tile =
            String(value)
                .trim()
                .toLowerCase();


        const aliases = {
            "": "floor",
            ".": "floor",
            "0": "floor",
            floor: "floor",
            empty: "floor",

            "#": "wall",
            wall: "wall",
            mur: "wall",

            g: "goal",
            goal: "goal",
            finish: "goal",
            target: "goal",

            o: "object",
            object: "object",
            item: "object",
            collectible: "object",

            dirt: "dirt",
            dirty: "dirt",
            dust: "dirt",

            button: "button",
            switch: "button",

            door: "door",

            charger: "charger",
            charge: "charger",

            deposit: "deposit",
            drop: "deposit",

            box: "box",
            crate: "box",

            box_goal: "box_goal",
            boxgoal: "box_goal",
            crate_goal: "box_goal",

            start: "floor",
            robot: "floor",
            pyt: "floor"
        };


        return (
            aliases[tile] ||
            tile
        );
    }


    getStaticTileType(
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
        Les états dynamiques ont priorité.
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


        const staticType =
            this.getStaticTileType(
                row,
                col
            );


        /*
        Les objets supprimés ne doivent pas
        réapparaître simplement parce qu'ils
        existent encore dans la grille originale.
        */

        if (
            [
                "object",
                "dirt",
                "box"
            ].includes(
                staticType
            )
        ) {
            return "floor";
        }


        if (
            staticType === "door" &&
            this.openDoors.has(
                key
            )
        ) {
            return "floor";
        }


        return staticType;
    }


    /* =====================================================
       OBJECTIFS
    ===================================================== */

    checkSuccess() {
        if (
            !this.level
        ) {
            return false;
        }


        const objective =
            this.level.objective ||
            "reach_goal";


        return this.checkObjective(
            objective
        );
    }


    checkObjective(objective) {
        if (
            !objective
        ) {
            return this.checkReachGoal();
        }


        /*
        Un objectif peut être un objet :
        { type: "collect_all" }
        ou
        {
            type: "combined",
            requirements: [...]
        }
        */

        if (
            typeof objective ===
            "object" &&
            !Array.isArray(objective)
        ) {
            const type =
                objective.type ||
                "combined";


            if (
                type === "combined"
            ) {
                const requirements =
                    objective.requirements ||
                    objective.objectives ||
                    [];

                return requirements.every(
                    requirement =>
                        this.checkObjective(
                            requirement
                        )
                );
            }


            return this.checkObjective(
                type
            );
        }


        /*
        Une liste signifie que toutes les
        conditions doivent être réussies.
        */

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
            String(objective)
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
            case "activate":
                return this.checkActivateAll();


            case "deposit":
            case "deposit_all":
                return this.checkDeposit();


            case "boxes":
            case "boxes_all":
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


            case "combined": {
                const requirements =
                    this.level?.requirements ||
                    this.level?.objectives ||
                    this.level?.objectiveRequirements ||
                    [];

                if (
                    Array.isArray(
                        requirements
                    ) &&
                    requirements.length > 0
                ) {
                    return requirements.every(
                        requirement =>
                            this.checkObjective(
                                requirement
                            )
                    );
                }

                /*
                Si "combined" n'a pas de liste séparée,
                on vérifie les éléments réellement
                présents dans le niveau.
                */

                const checks = [];


                if (
                    this.initialObjectCount >
                    0
                ) {
                    checks.push(
                        this.checkCollectAll()
                    );
                }


                if (
                    this.initialDirtCount >
                    0
                ) {
                    checks.push(
                        this.checkCleanAll()
                    );
                }


                if (
                    this.initialButtonCount >
                    0
                ) {
                    checks.push(
                        this.checkActivateAll()
                    );
                }


                if (
                    this.initialBoxCount >
                    0 &&
                    this.boxGoals.size >
                    0
                ) {
                    checks.push(
                        this.checkBoxes()
                    );
                }


                if (
                    this.goal
                ) {
                    checks.push(
                        this.checkReachGoal()
                    );
                }


                if (
                    checks.length === 0
                ) {
                    return this.checkReachGoal();
                }


                return checks.every(
                    Boolean
                );
            }


            default:
                return this.checkReachGoal();
        }
    }


    checkReachGoal() {
        if (
            !this.goal
        ) {
            return true;
        }

        return this.positionsEqual(
            this.getRobotPosition(),
            this.goal
        );
    }


    checkCollectAll() {
        if (
            this.initialObjectCount ===
            0
        ) {
            return true;
        }

        return (
            this.objects.size ===
            0
        );
    }


    checkCleanAll() {
        if (
            this.initialDirtCount ===
            0
        ) {
            return true;
        }

        return (
            this.dirt.size ===
            0
        );
    }


    checkActivateAll() {
        if (
            this.initialButtonCount ===
            0
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
            this.initialObjectCount ===
            0
        ) {
            return true;
        }

        return (
            this.depositedObjects >=
            this.initialObjectCount
        );
    }


    checkBoxes() {
        if (
            this.boxGoals.size ===
            0
        ) {
            return (
                this.initialBoxCount ===
                0
            );
        }


        for (
            const goal
            of this.boxGoals
        ) {
            if (
                !this.boxes.has(
                    goal
                )
            ) {
                return false;
            }
        }


        return true;
    }


    /* =====================================================
       ÉTAT
    ===================================================== */

    getState() {
        return {
            robot:
                typeof this.robot
                    ?.getState ===
                "function"
                    ? this.robot
                        .getState()
                    : {
                        row:
                            this.robot?.row,

                        col:
                            this.robot?.col,

                        direction:
                            this.robot
                                ?.direction
                    },

            objects:
                [...this.objects],

            dirt:
                [...this.dirt],

            buttons:
                [...this.buttons],

            activatedButtons:
                [
                    ...this
                        .activatedButtons
                ],

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

            cleanedDirt:
                this.cleanedDirt,

            depositedObjects:
                this.depositedObjects,

            success:
                this.checkSuccess(),

            message:
                this.message
        };
    }


    /* =====================================================
       RESET COMPLET
    ===================================================== */

    reset() {
        if (
            !this.level
        ) {
            return this;
        }

        return this.loadLevel(
            this.level
        );
    }
}


/* =========================================================
   EXPORT
========================================================= */

window.Game = Game;