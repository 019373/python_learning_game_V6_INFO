"use strict";

/* =========================================================
   PYT - robot.js
   =========================================================

   MOTEUR LOGIQUE DU ROBOT PYT

   ---------------------------------------------------------

   Ce fichier NE dessine rien.

   Il gère uniquement :

   - position logique
   - direction
   - cap
   - inventaire
   - historique
   - cases visitées
   - énergie
   - état du robot
   - utilitaires de déplacement
   - compatibilité avec game.js
   - compatibilité avec l'ancienne API française

   ---------------------------------------------------------

   API PRINCIPALE :

       robot.forward()
       robot.backward()
       robot.left()
       robot.right()

   Équivalents historiques :

       robot.avancer()
       robot.reculer()
       robot.tournerGauche()
       robot.tournerDroite()

   ---------------------------------------------------------

   Directions internes :

       N = nord
       E = est
       S = sud
       W = ouest

   Convention des angles :

       0   = Est
       90  = Sud
       180 = Ouest
       270 = Nord

========================================================= */


class PytRobot {

    /* =====================================================
       CONSTRUCTEUR
    ===================================================== */

    constructor(
        options = {},
        legacyY = undefined,
        legacyDirection = undefined
    ) {

        /*
         * Compatibilité :
         *
         * new PytRobot({
         *     x: 2,
         *     y: 3,
         *     direction: "E"
         * })
         *
         * ou :
         *
         * new PytRobot(
         *     2,
         *     3,
         *     "E"
         * )
         */

        if (
            typeof options ===
            "number"
        ) {

            options = {

                x:
                    options,

                y:
                    Number(
                        legacyY ??
                        0
                    ),

                direction:
                    legacyDirection ??
                    "E"
            };
        }


        if (
            !options ||
            typeof options !==
            "object"
        ) {

            options =
                {};
        }


        /* =================================================
           IDENTITÉ
        ================================================= */

        this.name =
            options.name ||
            "Pyt";


        /* =================================================
           POSITION
        ================================================= */

        this.x =
            this.toInteger(
                options.x ??
                options.col ??
                options.column ??
                0
            );


        this.y =
            this.toInteger(
                options.y ??
                options.row ??
                options.line ??
                0
            );


        /* =================================================
           DIRECTION
        ================================================= */

        this.direction =
            this.normalizeDirection(
                options.direction ??
                options.heading ??
                "E"
            );


        /* =================================================
           ÉTAT INITIAL
        ================================================= */

        this.initialState = {

            x:
                this.x,

            y:
                this.y,

            direction:
                this.direction
        };


        /* =================================================
           INVENTAIRE
        ================================================= */

        this.inventory =
            Array.isArray(
                options.inventory
            )
                ? this.clone(
                    options.inventory
                )
                : [];


        /* =================================================
           CASES VISITÉES
        ================================================= */

        this.visited = [

            {

                x:
                    this.x,

                y:
                    this.y
            }
        ];


        /* =================================================
           HISTORIQUE
        ================================================= */

        this.history =
            [];


        /* =================================================
           ÉNERGIE
        ================================================= */

        this.maxEnergy =
            this.normalizeEnergy(
                options.maxEnergy ??
                100
            );


        this.energy =
            this.clamp(
                Number(
                    options.energy ??
                    this.maxEnergy
                ),
                0,
                this.maxEnergy
            );


        /* =================================================
           ÉTAT
        ================================================= */

        this.active =
            true;


        this.moving =
            false;


        this.blocked =
            false;


        this.lastAction =
            null;


        /* =================================================
           MONDE OPTIONNEL
        ================================================= */

        this.world =
            options.world ||
            null;


        /* =================================================
           CALLBACKS
        ================================================= */

        this.callbacks = {

            onMove:
                typeof options.onMove ===
                "function"
                    ? options.onMove
                    : null,

            onTurn:
                typeof options.onTurn ===
                "function"
                    ? options.onTurn
                    : null,

            onCollision:
                typeof options.onCollision ===
                "function"
                    ? options.onCollision
                    : null,

            onStateChange:
                typeof options.onStateChange ===
                "function"
                    ? options.onStateChange
                    : null,

            onPickup:
                typeof options.onPickup ===
                "function"
                    ? options.onPickup
                    : null,

            onDrop:
                typeof options.onDrop ===
                "function"
                    ? options.onDrop
                    : null,

            onRecharge:
                typeof options.onRecharge ===
                "function"
                    ? options.onRecharge
                    : null
        };


        this.recordHistory(
            "spawn",
            {

                x:
                    this.x,

                y:
                    this.y,

                direction:
                    this.direction
            }
        );
    }



    /* =========================================================
       RESET
    ========================================================= */

    reset(
        state = null
    ) {

        const source =
            state &&
            typeof state ===
                "object"
                ? state
                : this.initialState;


        this.x =
            this.toInteger(
                source.x ??
                0
            );


        this.y =
            this.toInteger(
                source.y ??
                0
            );


        this.direction =
            this.normalizeDirection(
                source.direction ??
                "E"
            );


        this.inventory =
            [];


        this.visited = [

            {

                x:
                    this.x,

                y:
                    this.y
            }
        ];


        this.history =
            [];


        this.energy =
            this.maxEnergy;


        this.active =
            true;


        this.moving =
            false;


        this.blocked =
            false;


        this.lastAction =
            null;


        this.recordHistory(
            "reset",
            this.getState()
        );


        this.emitStateChange(
            "reset"
        );


        return this;
    }



    /* =========================================================
       WORLD
    ========================================================= */

    setWorld(world) {

        this.world =
            world ||
            null;


        return this;
    }



    getWorld() {

        return this.world;
    }



    /* =========================================================
       STATE
    ========================================================= */

    getState() {

        return {

            name:
                this.name,

            x:
                this.x,

            y:
                this.y,

            direction:
                this.direction,

            heading:
                this.getHeading(),

            energy:
                this.energy,

            maxEnergy:
                this.maxEnergy,

            active:
                this.active,

            moving:
                this.moving,

            blocked:
                this.blocked,

            inventory:
                this.clone(
                    this.inventory
                ),

            visited:
                this.clone(
                    this.visited
                ),

            lastAction:
                this.clone(
                    this.lastAction
                )
        };
    }



    setState(state) {

        if (
            !state ||
            typeof state !==
            "object"
        ) {

            return this;
        }


        if (
            state.x !==
            undefined
        ) {

            this.x =
                this.toInteger(
                    state.x
                );
        }


        if (
            state.y !==
            undefined
        ) {

            this.y =
                this.toInteger(
                    state.y
                );
        }


        if (
            state.direction !==
            undefined
        ) {

            this.direction =
                this.normalizeDirection(
                    state.direction
                );
        }


        if (
            state.energy !==
            undefined
        ) {

            this.energy =
                this.clamp(
                    Number(
                        state.energy
                    ),
                    0,
                    this.maxEnergy
                );
        }


        if (
            Array.isArray(
                state.inventory
            )
        ) {

            this.inventory =
                this.clone(
                    state.inventory
                );
        }


        this.emitStateChange(
            "set-state"
        );


        return this;
    }



    /* =========================================================
       POSITION
    ========================================================= */

    setPosition(
        x,
        y,
        options = {}
    ) {

        const from = {

            x:
                this.x,

            y:
                this.y
        };


        this.x =
            this.toInteger(
                x
            );


        this.y =
            this.toInteger(
                y
            );


        if (
            options.record !==
            false
        ) {

            this.markVisited(
                this.x,
                this.y
            );


            this.recordHistory(
                "teleport",
                {

                    from,

                    to: {

                        x:
                            this.x,

                        y:
                            this.y
                    }
                }
            );
        }


        this.emitStateChange(
            "position"
        );


        return this;
    }



    getPosition() {

        return {

            x:
                this.x,

            y:
                this.y
        };
    }



    positionEquals(
        x,
        y
    ) {

        return (
            this.x ===
                Number(
                    x
                ) &&
            this.y ===
                Number(
                    y
                )
        );
    }



    /* =========================================================
       DIRECTION
    ========================================================= */

    setDirection(direction) {

        const from =
            this.direction;


        const to =
            this.normalizeDirection(
                direction
            );


        this.direction =
            to;


        this.lastAction = {

            type:
                "direction",

            from,

            to
        };


        this.recordHistory(
            "direction",
            this.lastAction
        );


        this.emitTurn(
            from,
            to
        );


        this.emitStateChange(
            "direction"
        );


        return this.direction;
    }



    normalizeDirection(direction) {

        if (
            typeof direction ===
            "number"
        ) {

            return this.headingToDirection(
                direction
            );
        }


        const value =
            String(
                direction ??
                "E"
            )
                .trim()
                .toUpperCase();


        const aliases = {

            N:
                "N",

            NORTH:
                "N",

            NORD:
                "N",

            UP:
                "N",

            HAUT:
                "N",


            E:
                "E",

            EAST:
                "E",

            EST:
                "E",

            RIGHT:
                "E",

            DROITE:
                "E",


            S:
                "S",

            SOUTH:
                "S",

            SUD:
                "S",

            DOWN:
                "S",

            BAS:
                "S",


            W:
                "W",

            WEST:
                "W",

            OUEST:
                "W",

            LEFT:
                "W",

            GAUCHE:
                "W"
        };


        return aliases[
            value
        ] ||
            "E";
    }



    getDirection() {

        return this.direction;
    }



    getDirectionVector(
        direction = this.direction
    ) {

        switch (
            this.normalizeDirection(
                direction
            )
        ) {

            case "N":

                return {

                    x:
                        0,

                    y:
                        -1
                };


            case "S":

                return {

                    x:
                        0,

                    y:
                        1
                };


            case "W":

                return {

                    x:
                        -1,

                    y:
                        0
                };


            case "E":

            default:

                return {

                    x:
                        1,

                    y:
                        0
                };
        }
    }



    rotateDirection(
        direction,
        quarterTurns
    ) {

        const directions = [

            "N",
            "E",
            "S",
            "W"
        ];


        const normalized =
            this.normalizeDirection(
                direction
            );


        let index =
            directions.indexOf(
                normalized
            );


        index =
            (
                index +
                quarterTurns %
                4 +
                4
            ) %
            4;


        return directions[
            index
        ];
    }



    /* =========================================================
       CAP
    ========================================================= */

    getHeading() {

        const headings = {

            E:
                0,

            S:
                90,

            W:
                180,

            N:
                270
        };


        return headings[
            this.direction
        ];
    }



    setHeading(degrees) {

        const direction =
            this.headingToDirection(
                degrees
            );


        return this.setDirection(
            direction
        );
    }



    headingToDirection(degrees) {

        const number =
            Number(
                degrees
            );


        if (
            !Number.isFinite(
                number
            )
        ) {

            return "E";
        }


        const normalized =
            (
                number %
                360 +
                360
            ) %
            360;


        /*
         * Angle le plus proche d'un multiple de 90.
         */

        const snapped =
            (
                Math.round(
                    normalized /
                    90
                ) *
                90
            ) %
            360;


        const directions = {

            0:
                "E",

            90:
                "S",

            180:
                "W",

            270:
                "N"
        };


        return directions[
            snapped
        ] ||
            "E";
    }



    /* =========================================================
       ROTATIONS PRINCIPALES
    ========================================================= */

    left(degrees = 90) {

        return this.rotate(
            -Number(
                degrees ??
                90
            )
        );
    }



    right(degrees = 90) {

        return this.rotate(
            Number(
                degrees ??
                90
            )
        );
    }



    rotate(degrees) {

        const number =
            Number(
                degrees
            );


        if (
            !Number.isFinite(
                number
            )
        ) {

            throw new Error(
                "L'angle doit être un nombre."
            );
        }


        if (
            number %
            90 !==
            0
        ) {

            throw new Error(
                "Pyt tourne uniquement par multiples de 90°."
            );
        }


        const quarterTurns =
            number /
            90;


        const from =
            this.direction;


        const to =
            this.rotateDirection(
                from,
                quarterTurns
            );


        this.direction =
            to;


        this.blocked =
            false;


        this.lastAction = {

            type:
                "turn",

            degrees:
                number,

            from,

            to
        };


        this.recordHistory(
            "turn",
            this.lastAction
        );


        this.emitTurn(
            from,
            to
        );


        this.emitStateChange(
            "turn"
        );


        return this.direction;
    }



    /* =========================================================
       DÉPLACEMENTS PRINCIPAUX
    ========================================================= */

    forward(distance = 1) {

        return this.move(
            distance,
            1
        );
    }



    backward(distance = 1) {

        return this.move(
            distance,
            -1
        );
    }



    move(
        distance = 1,
        sign = 1
    ) {

        const amount =
            this.normalizeDistance(
                distance
            );


        const results =
            [];


        for (
            let step = 0;
            step < amount;
            step += 1
        ) {

            const result =
                this.moveOneCell(
                    sign
                );


            results.push(
                result
            );


            if (
                !result.success
            ) {

                break;
            }
        }


        return {

            success:
                results.every(
                    result =>
                        result.success
                ),

            completed:
                results.filter(
                    result =>
                        result.success
                ).length,

            requested:
                amount,

            steps:
                results
        };
    }



    moveOneCell(sign = 1) {

        if (
            !this.active
        ) {

            return {

                success:
                    false,

                reason:
                    "inactive"
            };
        }


        const vector =
            this.getDirectionVector(
                this.direction
            );


        const from = {

            x:
                this.x,

            y:
                this.y
        };


        const target = {

            x:
                this.x +
                vector.x *
                sign,

            y:
                this.y +
                vector.y *
                sign
        };


        this.moving =
            true;


        this.blocked =
            false;


        /*
         * Vérification monde optionnelle.
         */

        if (
            !this.canEnter(
                target.x,
                target.y
            )
        ) {

            this.moving =
                false;


            this.blocked =
                true;


            this.lastAction = {

                type:
                    "collision",

                from,

                target
            };


            this.recordHistory(
                "collision",
                this.lastAction
            );


            this.emitCollision(
                target
            );


            this.emitStateChange(
                "collision"
            );


            return {

                success:
                    false,

                reason:
                    "blocked",

                from,

                target
            };
        }


        /*
         * Déplacement.
         */

        this.x =
            target.x;


        this.y =
            target.y;


        this.consumeEnergy(
            1
        );


        this.markVisited(
            this.x,
            this.y
        );


        this.lastAction = {

            type:
                sign >
                0
                    ? "forward"
                    : "backward",

            from,

            to:
                {

                    x:
                        this.x,

                    y:
                        this.y
                },

            direction:
                this.direction
        };


        this.recordHistory(
            "move",
            this.lastAction
        );


        this.moving =
            false;


        this.emitMove(
            from,
            {

                x:
                    this.x,

                y:
                    this.y
            }
        );


        this.emitStateChange(
            "move"
        );


        return {

            success:
                true,

            from,

            to:
                {

                    x:
                        this.x,

                    y:
                        this.y
                }
        };
    }



    normalizeDistance(value) {

        const number =
            Number(
                value ??
                1
            );


        if (
            !Number.isFinite(
                number
            )
        ) {

            throw new Error(
                "La distance doit être un nombre."
            );
        }


        if (
            number <
            0
        ) {

            throw new Error(
                "La distance ne peut pas être négative."
            );
        }


        if (
            !Number.isInteger(
                number
            )
        ) {

            throw new Error(
                "Pyt se déplace uniquement d'un nombre entier de cases."
            );
        }


        return number;
    }



    /* =========================================================
       POSITION DEVANT / DERRIÈRE
    ========================================================= */

    getFrontPosition() {

        const vector =
            this.getDirectionVector(
                this.direction
            );


        return {

            x:
                this.x +
                vector.x,

            y:
                this.y +
                vector.y
        };
    }



    getBackPosition() {

        const vector =
            this.getDirectionVector(
                this.direction
            );


        return {

            x:
                this.x -
                vector.x,

            y:
                this.y -
                vector.y
        };
    }



    frontIsClear() {

        const target =
            this.getFrontPosition();


        return this.canEnter(
            target.x,
            target.y
        );
    }



    backIsClear() {

        const target =
            this.getBackPosition();


        return this.canEnter(
            target.x,
            target.y
        );
    }



    /* =========================================================
       COLLISIONS AVEC MONDE OPTIONNEL
    ========================================================= */

    canEnter(
        x,
        y
    ) {

        if (
            !this.world
        ) {

            return true;
        }


        /*
         * API préférée.
         */

        if (
            typeof this.world.canEnter ===
            "function"
        ) {

            return Boolean(
                this.world.canEnter(
                    x,
                    y,
                    this
                )
            );
        }


        /*
         * Compatibilité.
         */

        if (
            typeof this.world.isBlocked ===
            "function"
        ) {

            return !Boolean(
                this.world.isBlocked(
                    x,
                    y,
                    this
                )
            );
        }


        if (
            typeof this.world.frontIsFree ===
            "function"
        ) {

            return Boolean(
                this.world.frontIsFree(
                    x,
                    y,
                    this
                )
            );
        }


        return true;
    }



    /* =========================================================
       GOTO LOGIQUE
    ========================================================= */

    goto(
        targetX,
        targetY
    ) {

        targetX =
            this.toInteger(
                targetX
            );


        targetY =
            this.toInteger(
                targetY
            );


        const actions =
            [];


        let guard =
            0;


        /*
         * Horizontal.
         */

        while (
            this.x !==
                targetX &&
            guard <
                1000
        ) {

            guard +=
                1;


            const desired =
                this.x <
                targetX
                    ? "E"
                    : "W";


            this.turnToward(
                desired
            );


            const result =
                this.forward(
                    1
                );


            actions.push(
                result
            );


            if (
                !result.success
            ) {

                break;
            }
        }


        /*
         * Vertical.
         */

        while (
            this.y !==
                targetY &&
            guard <
                1000
        ) {

            guard +=
                1;


            const desired =
                this.y <
                targetY
                    ? "S"
                    : "N";


            this.turnToward(
                desired
            );


            const result =
                this.forward(
                    1
                );


            actions.push(
                result
            );


            if (
                !result.success
            ) {

                break;
            }
        }


        return {

            success:
                this.x ===
                    targetX &&
                this.y ===
                    targetY,

            x:
                this.x,

            y:
                this.y,

            actions
        };
    }



    turnToward(direction) {

        const target =
            this.normalizeDirection(
                direction
            );


        let guard =
            0;


        while (
            this.direction !==
                target &&
            guard <
                4
        ) {

            this.right(
                90
            );


            guard +=
                1;
        }


        return this.direction;
    }



    /* =========================================================
       INVENTAIRE
    ========================================================= */

    pickup(item) {

        if (
            item ===
                undefined ||
            item ===
                null
        ) {

            return false;
        }


        const stored =
            this.clone(
                item
            );


        this.inventory.push(
            stored
        );


        this.lastAction = {

            type:
                "pickup",

            item:
                stored
        };


        this.recordHistory(
            "pickup",
            this.lastAction
        );


        if (
            typeof this.callbacks
                .onPickup ===
            "function"
        ) {

            this.callbacks
                .onPickup(
                    stored,
                    this
                );
        }


        this.emitStateChange(
            "pickup"
        );


        return true;
    }



    drop(
        identifier = null
    ) {

        if (
            this.inventory.length ===
            0
        ) {

            return null;
        }


        let index =
            0;


        if (
            identifier !==
                null &&
            identifier !==
                undefined
        ) {

            index =
                this.inventory
                    .findIndex(
                        item =>
                            this.itemMatches(
                                item,
                                identifier
                            )
                    );


            if (
                index <
                0
            ) {

                return null;
            }
        }


        const item =
            this.inventory
                .splice(
                    index,
                    1
                )[0];


        this.lastAction = {

            type:
                "drop",

            item
        };


        this.recordHistory(
            "drop",
            this.lastAction
        );


        if (
            typeof this.callbacks
                .onDrop ===
            "function"
        ) {

            this.callbacks
                .onDrop(
                    item,
                    this
                );
        }


        this.emitStateChange(
            "drop"
        );


        return item;
    }



    hasItem(identifier) {

        return this.inventory
            .some(
                item =>
                    this.itemMatches(
                        item,
                        identifier
                    )
            );
    }



    inventoryContains(identifier) {

        return this.hasItem(
            identifier
        );
    }



    clearInventory() {

        this.inventory =
            [];


        this.emitStateChange(
            "inventory-clear"
        );


        return this;
    }



    getInventory() {

        return this.clone(
            this.inventory
        );
    }



    itemMatches(
        item,
        identifier
    ) {

        const expected =
            this.normalizeText(
                identifier
            );


        if (
            !expected
        ) {

            return false;
        }


        const values = [

            item?.id,

            item?.type,

            item?.name,

            item?.original?.id,

            item?.original?.type,

            typeof item ===
            "string"
                ? item
                : null
        ];


        return values
            .filter(
                value =>
                    value !==
                        null &&
                    value !==
                        undefined
            )
            .map(
                value =>
                    this.normalizeText(
                        value
                    )
            )
            .includes(
                expected
            );
    }



    /* =========================================================
       ÉNERGIE
    ========================================================= */

    normalizeEnergy(value) {

        const number =
            Number(
                value
            );


        if (
            !Number.isFinite(
                number
            ) ||
            number <=
                0
        ) {

            return 100;
        }


        return number;
    }



    consumeEnergy(amount = 1) {

        const value =
            Math.max(
                0,
                Number(
                    amount
                ) ||
                0
            );


        this.energy =
            this.clamp(
                this.energy -
                value,
                0,
                this.maxEnergy
            );


        if (
            this.energy <=
            0
        ) {

            this.energy =
                0;
        }


        return this.energy;
    }



    recharge(amount = null) {

        const before =
            this.energy;


        if (
            amount ===
                null ||
            amount ===
                undefined
        ) {

            this.energy =
                this.maxEnergy;

        } else {

            this.energy =
                this.clamp(
                    this.energy +
                    Number(
                        amount
                    ),
                    0,
                    this.maxEnergy
                );
        }


        this.lastAction = {

            type:
                "recharge",

            before,

            after:
                this.energy
        };


        this.recordHistory(
            "recharge",
            this.lastAction
        );


        if (
            typeof this.callbacks
                .onRecharge ===
            "function"
        ) {

            this.callbacks
                .onRecharge(
                    this.energy,
                    this
                );
        }


        this.emitStateChange(
            "recharge"
        );


        return this.energy;
    }



    isCharged() {

        return (
            this.energy >
            0
        );
    }



    getEnergyRatio() {

        if (
            this.maxEnergy <=
            0
        ) {

            return 0;
        }


        return this.energy /
            this.maxEnergy;
    }



    /* =========================================================
       VISITED
    ========================================================= */

    markVisited(
        x,
        y
    ) {

        this.visited.push({

            x:
                Number(
                    x
                ),

            y:
                Number(
                    y
                )
        });


        return this;
    }



    hasVisited(
        x,
        y
    ) {

        return this.visited
            .some(
                cell =>
                    cell.x ===
                        Number(
                            x
                        ) &&
                    cell.y ===
                        Number(
                            y
                        )
            );
    }



    getVisited() {

        return this.clone(
            this.visited
        );
    }



    getUniqueVisited() {

        const seen =
            new Set();


        const result =
            [];


        for (
            const cell
            of this.visited
        ) {

            const key =
                `${cell.x},${cell.y}`;


            if (
                seen.has(
                    key
                )
            ) {

                continue;
            }


            seen.add(
                key
            );


            result.push({

                x:
                    cell.x,

                y:
                    cell.y
            });
        }


        return result;
    }



    /* =========================================================
       HISTORY
    ========================================================= */

    recordHistory(
        type,
        data = {}
    ) {

        this.history.push({

            index:
                this.history.length,

            type,

            data:
                this.clone(
                    data
                )
        });


        return this;
    }



    getHistory() {

        return this.clone(
            this.history
        );
    }



    clearHistory() {

        this.history =
            [];


        return this;
    }



    /* =========================================================
       CALLBACKS
    ========================================================= */

    setCallback(
        name,
        callback
    ) {

        if (
            !Object.prototype
                .hasOwnProperty
                .call(
                    this.callbacks,
                    name
                )
        ) {

            return false;
        }


        this.callbacks[
            name
        ] =
            typeof callback ===
            "function"
                ? callback
                : null;


        return true;
    }



    emitMove(
        from,
        to
    ) {

        if (
            typeof this.callbacks
                .onMove ===
            "function"
        ) {

            this.callbacks
                .onMove(
                    {

                        from:
                            this.clone(
                                from
                            ),

                        to:
                            this.clone(
                                to
                            ),

                        direction:
                            this.direction,

                        robot:
                            this
                    }
                );
        }
    }



    emitTurn(
        from,
        to
    ) {

        if (
            typeof this.callbacks
                .onTurn ===
            "function"
        ) {

            this.callbacks
                .onTurn(
                    {

                        from,

                        to,

                        robot:
                            this
                    }
                );
        }
    }



    emitCollision(target) {

        if (
            typeof this.callbacks
                .onCollision ===
            "function"
        ) {

            this.callbacks
                .onCollision(
                    {

                        target:
                            this.clone(
                                target
                            ),

                        robot:
                            this
                    }
                );
        }
    }



    emitStateChange(reason) {

        if (
            typeof this.callbacks
                .onStateChange ===
            "function"
        ) {

            this.callbacks
                .onStateChange(
                    {

                        reason,

                        state:
                            this.getState(),

                        robot:
                            this
                    }
                );
        }


        /*
         * Événement navigateur optionnel.
         *
         * Peut être utile plus tard pour :
         * - bruitages
         * - HUD énergie
         * - debug
         * - animations
         */

        try {

            window.dispatchEvent(
                new CustomEvent(
                    "pyt:robot-state",
                    {

                        detail: {

                            reason,

                            state:
                                this.getState()
                        }
                    }
                )
            );

        } catch (
            error
        ) {

            /*
             * Pas grave si CustomEvent
             * n'est pas disponible.
             */
        }
    }



    /* =========================================================
       COMPATIBILITÉ API FRANÇAISE
    ========================================================= */

    avancer(distance = 1) {

        return this.forward(
            distance
        );
    }



    reculer(distance = 1) {

        return this.backward(
            distance
        );
    }



    tournerGauche(
        degrees = 90
    ) {

        return this.left(
            degrees
        );
    }



    tournerDroite(
        degrees = 90
    ) {

        return this.right(
            degrees
        );
    }



    tourner_gauche(
        degrees = 90
    ) {

        return this.left(
            degrees
        );
    }



    tourner_droite(
        degrees = 90
    ) {

        return this.right(
            degrees
        );
    }



    devantLibre() {

        return this.frontIsClear();
    }



    devant_libre() {

        return this.frontIsClear();
    }



    positionX() {

        return this.x;
    }



    positionY() {

        return this.y;
    }



    position_x() {

        return this.x;
    }



    position_y() {

        return this.y;
    }



    directionActuelle() {

        return this.direction;
    }



    inventaireContient(identifier) {

        return this.hasItem(
            identifier
        );
    }



    inventaire_contient(identifier) {

        return this.hasItem(
            identifier
        );
    }



    ramasser(item) {

        return this.pickup(
            item
        );
    }



    deposer(identifier = null) {

        return this.drop(
            identifier
        );
    }



    /* =========================================================
       DEBUG
    ========================================================= */

    debug() {

        const state =
            this.getState();


        console.table({

            nom:
                state.name,

            x:
                state.x,

            y:
                state.y,

            direction:
                state.direction,

            heading:
                state.heading,

            energie:
                `${state.energy}/${state.maxEnergy}`,

            inventaire:
                state.inventory.length,

            visites:
                state.visited.length
        });


        return state;
    }



    /* =========================================================
       UTILS
    ========================================================= */

    toInteger(value) {

        const number =
            Number(
                value
            );


        if (
            !Number.isFinite(
                number
            )
        ) {

            return 0;
        }


        return Math.round(
            number
        );
    }



    clamp(
        value,
        min,
        max
    ) {

        return Math.max(
            min,
            Math.min(
                max,
                value
            )
        );
    }



    normalizeText(value) {

        return String(
            value ??
            ""
        )
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .toLowerCase()
            .trim()
            .replace(
                /[\s-]+/g,
                "_"
            );
    }



    clone(value) {

        if (
            value ===
            undefined
        ) {

            return undefined;
        }


        try {

            return JSON.parse(
                JSON.stringify(
                    value
                )
            );

        } catch (
            error
        ) {

            return value;
        }
    }

}



/* =========================================================
   CONSTANTES PUBLIQUES
========================================================= */

PytRobot.DIRECTIONS = {

    NORTH:
        "N",

    EAST:
        "E",

    SOUTH:
        "S",

    WEST:
        "W"
};


PytRobot.HEADINGS = {

    E:
        0,

    S:
        90,

    W:
        180,

    N:
        270
};



/* =========================================================
   EXPORT
========================================================= */

window.PytRobot =
    PytRobot;


window.PYTRobot =
    PytRobot;