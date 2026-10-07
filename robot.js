"use strict";

/* =========================================================
   PYT
   robot.js

   Gestion complète de Pyt :
   - position
   - direction
   - déplacements
   - animation ~0,5 s par case
   - collisions
   - inventaire
   - ramassage
   - dépôt
   - historique
   - cases visitées
========================================================= */


class PytRobot {

    constructor(options = {}) {

        /* =================================================
           CONFIGURATION
        ================================================= */

        this.stepDuration =
            Number(options.stepDuration) || 500;

        this.turnDuration =
            Number(options.turnDuration) || 180;


        /* =================================================
           MONDE
        ================================================= */

        this.world =
            options.world || null;


        /* =================================================
           ÉTAT INITIAL
        ================================================= */

        this.initialState = {
            x: 0,
            y: 0,
            direction: "E"
        };


        /* =================================================
           ÉTAT ACTUEL
        ================================================= */

        this.x = 0;
        this.y = 0;

        this.direction = "E";

        this.inventory = [];

        this.visited = new Set();

        this.history = [];

        this.moveCount = 0;

        this.running = false;

        this.cancelVersion = 0;


        /* =================================================
           CALLBACKS
        ================================================= */

        this.onChange =
            typeof options.onChange === "function"
                ? options.onChange
                : null;


        this.onAction =
            typeof options.onAction === "function"
                ? options.onAction
                : null;


        /* =================================================
           INITIALISATION
        ================================================= */

        if (options.state) {

            this.setInitialState(
                options.state
            );

        } else {

            this.reset();
        }
    }



    /* =====================================================
       CONFIGURATION
    ===================================================== */

    setWorld(world) {

        this.world =
            world || null;

        return this;
    }



    setInitialState(state = {}) {

        this.initialState = {

            x:
                Number.isFinite(
                    Number(state.x)
                )
                    ? Number(state.x)
                    : 0,

            y:
                Number.isFinite(
                    Number(state.y)
                )
                    ? Number(state.y)
                    : 0,

            direction:
                this.normalizeDirection(
                    state.direction || "E"
                )
        };


        this.reset();

        return this;
    }



    /* =====================================================
       RESET
    ===================================================== */

    reset() {

        /*
        Incrémente la version.

        Toute animation encore en cours comprend
        ainsi qu'elle doit s'arrêter.
        */

        this.cancelVersion += 1;


        this.x =
            this.initialState.x;

        this.y =
            this.initialState.y;

        this.direction =
            this.initialState.direction;


        this.inventory =
            [];


        this.visited =
            new Set();


        this.history =
            [];


        this.moveCount =
            0;


        this.running =
            false;


        this.markVisited(
            this.x,
            this.y
        );


        this.addHistory({
            type: "reset",
            x: this.x,
            y: this.y,
            direction: this.direction
        });


        this.notifyChange();


        return this.getState();
    }



    /* =====================================================
       DIRECTIONS
    ===================================================== */

    normalizeDirection(direction) {

        const value =
            String(
                direction || "E"
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


            E:
                "E",

            EAST:
                "E",

            EST:
                "E",

            RIGHT:
                "E",


            S:
                "S",

            SOUTH:
                "S",

            SUD:
                "S",

            DOWN:
                "S",


            W:
                "W",

            WEST:
                "W",

            O:
                "W",

            OUEST:
                "W",

            LEFT:
                "W"
        };


        return (
            aliases[value] ||
            "E"
        );
    }



    getDirectionVector(
        direction =
            this.direction
    ) {

        switch (
            this.normalizeDirection(
                direction
            )
        ) {

            case "N":

                return {
                    x: 0,
                    y: -1
                };


            case "S":

                return {
                    x: 0,
                    y: 1
                };


            case "W":

                return {
                    x: -1,
                    y: 0
                };


            case "E":
            default:

                return {
                    x: 1,
                    y: 0
                };
        }
    }



    /* =====================================================
       ROTATIONS
    ===================================================== */

    async turnLeft() {

        const directions = [
            "N",
            "W",
            "S",
            "E"
        ];


        const index =
            directions.indexOf(
                this.direction
            );


        this.direction =
            directions[
                (
                    index + 1
                ) %
                directions.length
            ];


        this.addHistory({
            type: "turn_left",
            direction: this.direction
        });


        this.emitAction({
            type: "turn_left",
            success: true
        });


        this.notifyChange();


        await this.wait(
            this.turnDuration
        );


        return {
            success: true,
            direction:
                this.direction
        };
    }



    async turnRight() {

        const directions = [
            "N",
            "E",
            "S",
            "W"
        ];


        const index =
            directions.indexOf(
                this.direction
            );


        this.direction =
            directions[
                (
                    index + 1
                ) %
                directions.length
            ];


        this.addHistory({
            type: "turn_right",
            direction: this.direction
        });


        this.emitAction({
            type: "turn_right",
            success: true
        });


        this.notifyChange();


        await this.wait(
            this.turnDuration
        );


        return {
            success: true,
            direction:
                this.direction
        };
    }



    /* =====================================================
       DÉPLACEMENTS
    ===================================================== */

    async forward(
        amount = 1
    ) {

        let count =
            Math.floor(
                Number(amount)
            );


        if (
            !Number.isFinite(
                count
            ) ||
            count < 0
        ) {

            return {
                success: false,
                reason: "invalid_distance",
                moved: 0
            };
        }


        if (count === 0) {

            return {
                success: true,
                moved: 0
            };
        }


        const version =
            this.cancelVersion;


        let moved =
            0;


        this.running =
            true;


        for (
            let index = 0;
            index < count;
            index += 1
        ) {

            /*
            Si un reset a été demandé,
            on stoppe l'ancienne animation.
            */

            if (
                version !==
                this.cancelVersion
            ) {

                this.running =
                    false;


                return {
                    success: false,
                    reason: "cancelled",
                    moved
                };
            }



            const result =
                await this.moveOneCell(
                    version
                );


            if (!result.success) {

                this.running =
                    false;


                return {
                    success: false,
                    reason:
                        result.reason,
                    moved
                };
            }


            moved += 1;
        }


        this.running =
            false;


        return {
            success: true,
            moved
        };
    }



    async moveOneCell(version) {

        const vector =
            this.getDirectionVector();


        const targetX =
            this.x +
            vector.x;


        const targetY =
            this.y +
            vector.y;


        if (
            !this.isInside(
                targetX,
                targetY
            )
        ) {

            const result = {
                type: "move",
                success: false,
                reason: "outside_map",
                x: this.x,
                y: this.y,
                targetX,
                targetY
            };


            this.addHistory(
                result
            );


            this.emitAction(
                result
            );


            return result;
        }



        if (
            this.isBlocked(
                targetX,
                targetY
            )
        ) {

            const result = {
                type: "move",
                success: false,
                reason: "blocked",
                x: this.x,
                y: this.y,
                targetX,
                targetY
            };


            this.addHistory(
                result
            );


            this.emitAction(
                result
            );


            return result;
        }



        /*
        On attend avant de valider la prochaine case.

        En pratique le rendu pourra interpoler
        entre les deux positions dans game.js.
        */

        const from = {
            x: this.x,
            y: this.y
        };


        const to = {
            x: targetX,
            y: targetY
        };


        this.emitAction({
            type: "move_start",
            success: true,
            from,
            to,
            duration:
                this.stepDuration
        });


        await this.wait(
            this.stepDuration
        );


        if (
            version !==
            this.cancelVersion
        ) {

            return {
                success: false,
                reason: "cancelled"
            };
        }



        this.x =
            targetX;

        this.y =
            targetY;


        this.moveCount += 1;


        this.markVisited(
            this.x,
            this.y
        );


        const result = {
            type: "move",
            success: true,
            from,
            to,
            x: this.x,
            y: this.y
        };


        this.addHistory(
            result
        );


        this.emitAction(
            result
        );


        this.notifyChange();


        return result;
    }



    /* =====================================================
       COLLISIONS
    ===================================================== */

    isInside(
        x,
        y
    ) {

        const width =
            Number(
                this.world
                    ?.map
                    ?.width ??
                this.world
                    ?.width ??
                0
            );


        const height =
            Number(
                this.world
                    ?.map
                    ?.height ??
                this.world
                    ?.height ??
                0
            );


        if (
            width <= 0 ||
            height <= 0
        ) {

            return true;
        }


        return (
            x >= 0 &&
            y >= 0 &&
            x < width &&
            y < height
        );
    }



    isBlocked(
        x,
        y
    ) {

        const blocked =
            this.world
                ?.map
                ?.blocked ||
            this.world
                ?.blocked ||
            [];


        return blocked.some(
            cell => {

                if (
                    Array.isArray(
                        cell
                    )
                ) {

                    return (
                        Number(cell[0]) === x &&
                        Number(cell[1]) === y
                    );
                }


                return (
                    Number(cell?.x) === x &&
                    Number(cell?.y) === y
                );
            }
        );
    }



    frontIsFree() {

        const vector =
            this.getDirectionVector();


        const x =
            this.x +
            vector.x;


        const y =
            this.y +
            vector.y;


        return (
            this.isInside(
                x,
                y
            ) &&
            !this.isBlocked(
                x,
                y
            )
        );
    }



    /* =====================================================
       OBJETS
    ===================================================== */

    getWorldObjects() {

        if (
            !this.world
        ) {
            return [];
        }


        if (
            !Array.isArray(
                this.world.objects
            )
        ) {

            this.world.objects =
                [];
        }


        return this.world.objects;
    }



    getObjectsAt(
        x = this.x,
        y = this.y
    ) {

        return this
            .getWorldObjects()
            .filter(
                object =>
                    Number(
                        object.x
                    ) ===
                        Number(x) &&
                    Number(
                        object.y
                    ) ===
                        Number(y)
            );
    }



    getPickableObjectsAt(
        x = this.x,
        y = this.y
    ) {

        return this
            .getObjectsAt(
                x,
                y
            )
            .filter(
                object =>
                    object.pickable !==
                    false
            );
    }



    isOnObject(
        objectName = null
    ) {

        const objects =
            this.getObjectsAt();


        if (
            objectName === null ||
            objectName === undefined
        ) {

            return (
                objects.length >
                0
            );
        }


        const target =
            this.normalizeObjectName(
                objectName
            );


        return objects.some(
            object => {

                return (
                    this.normalizeObjectName(
                        object.id
                    ) ===
                        target ||

                    this.normalizeObjectName(
                        object.type
                    ) ===
                        target ||

                    this.normalizeObjectName(
                        object.label
                    ) ===
                        target
                );
            }
        );
    }



    /* =====================================================
       RAMASSER
    ===================================================== */

    async pickUp(
        objectName = null
    ) {

        const objects =
            this.getPickableObjectsAt();


        if (
            objects.length ===
            0
        ) {

            const result = {
                type: "pickup",
                success: false,
                reason: "no_object",
                x: this.x,
                y: this.y
            };


            this.addHistory(
                result
            );


            this.emitAction(
                result
            );


            return result;
        }



        let object =
            null;


        if (
            objectName === null ||
            objectName === undefined
        ) {

            object =
                objects[0];

        } else {

            const target =
                this.normalizeObjectName(
                    objectName
                );


            object =
                objects.find(
                    candidate => {

                        return (
                            this.normalizeObjectName(
                                candidate.id
                            ) ===
                                target ||

                            this.normalizeObjectName(
                                candidate.type
                            ) ===
                                target ||

                            this.normalizeObjectName(
                                candidate.label
                            ) ===
                                target
                        );
                    }
                );
        }



        if (!object) {

            const result = {
                type: "pickup",
                success: false,
                reason:
                    "wrong_object",
                requested:
                    objectName,
                x: this.x,
                y: this.y
            };


            this.addHistory(
                result
            );


            this.emitAction(
                result
            );


            return result;
        }



        /*
        On garde une copie dans l'inventaire.
        */

        const inventoryObject = {
            ...object
        };


        delete inventoryObject.x;
        delete inventoryObject.y;


        this.inventory.push(
            inventoryObject
        );



        /*
        Retire l'objet du monde.
        */

        const index =
            this.getWorldObjects()
                .indexOf(
                    object
                );


        if (
            index !== -1
        ) {

            this.getWorldObjects()
                .splice(
                    index,
                    1
                );
        }



        const result = {
            type: "pickup",
            success: true,
            object:
                inventoryObject.id ||
                inventoryObject.type,
            data:
                inventoryObject,
            x: this.x,
            y: this.y
        };


        this.addHistory(
            result
        );


        this.emitAction(
            result
        );


        this.notifyChange();


        await this.wait(
            150
        );


        return result;
    }



    /* =====================================================
       INVENTAIRE
    ===================================================== */

    inventoryContains(
        objectName
    ) {

        const target =
            this.normalizeObjectName(
                objectName
            );


        return this.inventory.some(
            object => {

                return (
                    this.normalizeObjectName(
                        object.id
                    ) ===
                        target ||

                    this.normalizeObjectName(
                        object.type
                    ) ===
                        target ||

                    this.normalizeObjectName(
                        object.label
                    ) ===
                        target
                );
            }
        );
    }



    getInventoryObject(
        objectName
    ) {

        const target =
            this.normalizeObjectName(
                objectName
            );


        return (
            this.inventory.find(
                object => {

                    return (
                        this.normalizeObjectName(
                            object.id
                        ) ===
                            target ||

                        this.normalizeObjectName(
                            object.type
                        ) ===
                            target ||

                        this.normalizeObjectName(
                            object.label
                        ) ===
                            target
                    );
                }
            ) ||
            null
        );
    }



    /* =====================================================
       DÉPOSER
    ===================================================== */

    async drop(
        objectName = null
    ) {

        if (
            this.inventory.length ===
            0
        ) {

            const result = {
                type: "drop",
                success: false,
                reason:
                    "empty_inventory"
            };


            this.addHistory(
                result
            );


            this.emitAction(
                result
            );


            return result;
        }



        let object =
            null;


        if (
            objectName === null ||
            objectName === undefined
        ) {

            object =
                this.inventory[0];

        } else {

            object =
                this.getInventoryObject(
                    objectName
                );
        }



        if (!object) {

            const result = {
                type: "drop",
                success: false,
                reason:
                    "object_not_in_inventory",
                requested:
                    objectName
            };


            this.addHistory(
                result
            );


            this.emitAction(
                result
            );


            return result;
        }



        const inventoryIndex =
            this.inventory.indexOf(
                object
            );


        if (
            inventoryIndex !== -1
        ) {

            this.inventory.splice(
                inventoryIndex,
                1
            );
        }



        const worldObject = {

            ...object,

            x:
                this.x,

            y:
                this.y,

            pickable:
                object.pickable !==
                false
        };


        this.getWorldObjects()
            .push(
                worldObject
            );



        const result = {
            type: "drop",
            success: true,
            object:
                worldObject.id ||
                worldObject.type,
            x:
                this.x,
            y:
                this.y
        };


        this.addHistory(
            result
        );


        this.emitAction(
            result
        );


        this.notifyChange();


        await this.wait(
            150
        );


        return result;
    }



    /* =====================================================
       CASES VISITÉES
    ===================================================== */

    markVisited(
        x,
        y
    ) {

        this.visited.add(
            this.positionKey(
                x,
                y
            )
        );
    }



    hasVisited(
        x,
        y
    ) {

        return this.visited.has(
            this.positionKey(
                x,
                y
            )
        );
    }



    positionKey(
        x,
        y
    ) {

        return (
            `${Number(x)},${Number(y)}`
        );
    }



    /* =====================================================
       INFORMATIONS DE POSITION
    ===================================================== */

    getX() {

        return this.x;
    }



    getY() {

        return this.y;
    }



    getDirection() {

        return this.direction;
    }



    isAt(
        x,
        y
    ) {

        return (
            this.x ===
                Number(x) &&
            this.y ===
                Number(y)
        );
    }



    /* =====================================================
       HISTORIQUE
    ===================================================== */

    addHistory(action) {

        this.history.push({

            index:
                this.history.length,

            timestamp:
                Date.now(),

            ...action
        });
    }



    getHistory() {

        return this.history.map(
            action => ({
                ...action
            })
        );
    }



    /* =====================================================
       ÉTAT COMPLET
    ===================================================== */

    getState() {

        return {

            x:
                this.x,

            y:
                this.y,

            direction:
                this.direction,

            inventory:
                this.inventory.map(
                    object => ({
                        ...object
                    })
                ),

            visited:
                Array.from(
                    this.visited
                ),

            history:
                this.getHistory(),

            moveCount:
                this.moveCount,

            running:
                this.running
        };
    }



    /* =====================================================
       API PYTHON

       game.js utilisera ces méthodes.
    ===================================================== */

    createPythonAPI() {

        return {

            avancer:
                async (
                    amount = 1
                ) =>
                    this.forward(
                        amount
                    ),


            tourner_gauche:
                async () =>
                    this.turnLeft(),


            tourner_droite:
                async () =>
                    this.turnRight(),


            ramasser:
                async (
                    objectName = null
                ) =>
                    this.pickUp(
                        objectName
                    ),


            deposer:
                async (
                    objectName = null
                ) =>
                    this.drop(
                        objectName
                    ),


            devant_libre:
                () =>
                    this.frontIsFree(),


            sur_objet:
                (
                    objectName = null
                ) =>
                    this.isOnObject(
                        objectName
                    ),


            inventaire_contient:
                objectName =>
                    this.inventoryContains(
                        objectName
                    ),


            position_x:
                () =>
                    this.getX(),


            position_y:
                () =>
                    this.getY(),


            direction:
                () =>
                    this.getDirection()
        };
    }



    /* =====================================================
       EVENTS
    ===================================================== */

    notifyChange() {

        const state =
            this.getState();


        if (
            this.onChange
        ) {

            this.onChange(
                state
            );
        }


        window.dispatchEvent(
            new CustomEvent(
                "pyt:robot-change",
                {
                    detail: {
                        robot:
                            this,

                        state
                    }
                }
            )
        );
    }



    emitAction(action) {

        if (
            this.onAction
        ) {

            this.onAction(
                action
            );
        }


        window.dispatchEvent(
            new CustomEvent(
                "pyt:robot-action",
                {
                    detail: {
                        robot:
                            this,

                        action
                    }
                }
            )
        );
    }



    /* =====================================================
       UTILITAIRES
    ===================================================== */

    normalizeObjectName(
        value
    ) {

        return String(
            value ?? ""
        )
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .trim()
            .toLowerCase()
            .replace(
                /\s+/g,
                "_"
            );
    }



    wait(
        duration
    ) {

        return new Promise(
            resolve => {

                window.setTimeout(
                    resolve,
                    Math.max(
                        0,
                        Number(
                            duration
                        ) || 0
                    )
                );
            }
        );
    }

}



/* =========================================================
   EXPORT
========================================================= */

window.PytRobot =
    PytRobot;