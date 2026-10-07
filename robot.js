"use strict";

/* =========================================================
   PYT - robot.js
   État et déplacements du robot.
========================================================= */

class Robot {

    static NORTH = "NORTH";
    static EAST = "EAST";
    static SOUTH = "SOUTH";
    static WEST = "WEST";


    constructor(
        row = 1,
        col = 1,
        direction = Robot.EAST
    ) {
        this.row = row;
        this.col = col;

        this.direction =
            this.normalizeDirection(
                direction
            );

        this.inventory = {};

        this.maxEnergy = 100;
        this.energy = 100;
    }


    /* =====================================================
       POSITION
    ===================================================== */

    getPosition() {
        return {
            row: this.row,
            col: this.col
        };
    }


    setPosition(
        row,
        col
    ) {
        const nextRow =
            Number(row);

        const nextCol =
            Number(col);

        if (
            !Number.isFinite(nextRow) ||
            !Number.isFinite(nextCol)
        ) {
            return false;
        }

        this.row =
            nextRow;

        this.col =
            nextCol;

        return true;
    }


    /* =====================================================
       DIRECTION
    ===================================================== */

    normalizeDirection(direction) {
        const value =
            String(
                direction ||
                Robot.EAST
            )
                .trim()
                .toUpperCase();

        const aliases = {
            N: Robot.NORTH,
            NORTH: Robot.NORTH,
            UP: Robot.NORTH,

            E: Robot.EAST,
            EAST: Robot.EAST,
            RIGHT: Robot.EAST,

            S: Robot.SOUTH,
            SOUTH: Robot.SOUTH,
            DOWN: Robot.SOUTH,

            W: Robot.WEST,
            WEST: Robot.WEST,
            LEFT: Robot.WEST
        };

        return (
            aliases[value] ||
            Robot.EAST
        );
    }


    getDirection() {
        return this.direction;
    }


    setDirection(direction) {
        this.direction =
            this.normalizeDirection(
                direction
            );

        return this.direction;
    }


    getDirectionIndex() {
        const directions = [
            Robot.NORTH,
            Robot.EAST,
            Robot.SOUTH,
            Robot.WEST
        ];

        return directions.indexOf(
            this.direction
        );
    }


    getDirectionVector() {
        switch (
            this.normalizeDirection(
                this.direction
            )
        ) {
            case Robot.NORTH:
                return {
                    row: -1,
                    col: 0
                };

            case Robot.SOUTH:
                return {
                    row: 1,
                    col: 0
                };

            case Robot.WEST:
                return {
                    row: 0,
                    col: -1
                };

            case Robot.EAST:
            default:
                return {
                    row: 0,
                    col: 1
                };
        }
    }


    getForwardPosition(
        steps = 1
    ) {
        const amount =
            this.normalizeSteps(
                steps
            );

        const vector =
            this.getDirectionVector();

        return {
            row:
                this.row +
                vector.row *
                amount,

            col:
                this.col +
                vector.col *
                amount
        };
    }


    getBackwardPosition(
        steps = 1
    ) {
        const amount =
            this.normalizeSteps(
                steps
            );

        const vector =
            this.getDirectionVector();

        return {
            row:
                this.row -
                vector.row *
                amount,

            col:
                this.col -
                vector.col *
                amount
        };
    }


    /* =====================================================
       ROTATIONS
    ===================================================== */

    turnRight() {
        const directions = [
            Robot.NORTH,
            Robot.EAST,
            Robot.SOUTH,
            Robot.WEST
        ];

        const index =
            this.getDirectionIndex();

        this.direction =
            directions[
                (
                    index + 1
                ) % 4
            ];

        return this.direction;
    }


    turnLeft() {
        const directions = [
            Robot.NORTH,
            Robot.EAST,
            Robot.SOUTH,
            Robot.WEST
        ];

        const index =
            this.getDirectionIndex();

        this.direction =
            directions[
                (
                    index + 3
                ) % 4
            ];

        return this.direction;
    }


    turnAround() {
        this.turnRight();
        this.turnRight();

        return this.direction;
    }


    rotateRight(
        degrees = 90
    ) {
        return this.rotate(
            degrees
        );
    }


    rotateLeft(
        degrees = 90
    ) {
        return this.rotate(
            -degrees
        );
    }


    rotate(degrees) {
        const value =
            Number(degrees);

        if (
            !Number.isFinite(value)
        ) {
            return false;
        }

        if (
            value % 90 !== 0
        ) {
            return false;
        }

        let turns =
            Math.round(
                value / 90
            );

        while (
            turns > 0
        ) {
            this.turnRight();
            turns--;
        }

        while (
            turns < 0
        ) {
            this.turnLeft();
            turns++;
        }

        return this.direction;
    }


    /* =====================================================
       DÉPLACEMENTS
    ===================================================== */

    forward(
        game,
        steps = 1
    ) {
        if (
            !game ||
            typeof game.moveForward !==
            "function"
        ) {
            return false;
        }

        const amount =
            this.normalizeSteps(
                steps
            );

        for (
            let i = 0;
            i < amount;
            i++
        ) {
            if (
                !game.moveForward()
            ) {
                return false;
            }
        }

        return true;
    }


    backward(
        game,
        steps = 1
    ) {
        if (
            !game ||
            typeof game.moveBackward !==
            "function"
        ) {
            return false;
        }

        const amount =
            this.normalizeSteps(
                steps
            );

        for (
            let i = 0;
            i < amount;
            i++
        ) {
            if (
                !game.moveBackward()
            ) {
                return false;
            }
        }

        return true;
    }


    normalizeSteps(steps) {
        const amount =
            Number(steps);

        if (
            !Number.isFinite(amount)
        ) {
            return 1;
        }

        return Math.max(
            0,
            Math.floor(
                Math.abs(amount)
            )
        );
    }


    /* =====================================================
       INVENTAIRE
    ===================================================== */

    addItem(
        item = "object",
        amount = 1
    ) {
        const name =
            String(
                item ||
                "object"
            );

        const quantity =
            Math.max(
                0,
                Math.floor(
                    Number(amount) || 0
                )
            );

        if (
            quantity === 0
        ) {
            return this.getItemCount(
                name
            );
        }

        if (
            !Object.prototype
                .hasOwnProperty.call(
                    this.inventory,
                    name
                )
        ) {
            this.inventory[name] = 0;
        }

        this.inventory[name] +=
            quantity;

        return this.inventory[name];
    }


    removeItem(
        item = "object",
        amount = 1
    ) {
        const name =
            String(
                item ||
                "object"
            );

        const quantity =
            Math.max(
                0,
                Math.floor(
                    Number(amount) || 0
                )
            );

        const current =
            this.getItemCount(
                name
            );

        if (
            current <
            quantity
        ) {
            return false;
        }

        this.inventory[name] =
            current -
            quantity;

        if (
            this.inventory[name] <= 0
        ) {
            delete this.inventory[name];
        }

        return true;
    }


    hasItem(
        item = "object",
        amount = 1
    ) {
        return (
            this.getItemCount(item) >=
            Math.max(
                0,
                Number(amount) || 0
            )
        );
    }


    getItemCount(
        item = "object"
    ) {
        const name =
            String(
                item ||
                "object"
            );

        return (
            Number(
                this.inventory[name]
            ) || 0
        );
    }


    getInventory() {
        return {
            ...this.inventory
        };
    }


    getInventoryCount() {
        return Object.values(
            this.inventory
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


    /*
    Compatibilité avec d'anciennes versions.
    */

    getCount() {
        return this.getInventoryCount();
    }


    clearInventory() {
        this.inventory = {};
    }


    /* =====================================================
       ÉNERGIE
    ===================================================== */

    getEnergy() {
        return this.energy;
    }


    setEnergy(value) {
        const energy =
            Number(value);

        if (
            !Number.isFinite(energy)
        ) {
            return this.energy;
        }

        this.energy =
            Math.max(
                0,
                Math.min(
                    this.maxEnergy,
                    energy
                )
            );

        return this.energy;
    }


    useEnergy(amount = 1) {
        const value =
            Math.max(
                0,
                Number(amount) || 0
            );

        if (
            this.energy <
            value
        ) {
            return false;
        }

        this.energy -=
            value;

        return true;
    }


    addEnergy(amount = 1) {
        const value =
            Math.max(
                0,
                Number(amount) || 0
            );

        return this.setEnergy(
            this.energy +
            value
        );
    }


    restoreEnergy() {
        this.energy =
            this.maxEnergy;

        return this.energy;
    }


    isOutOfEnergy() {
        return (
            this.energy <= 0
        );
    }


    /*
    Compatibilité courte.
    */

    isOut() {
        return this.isOutOfEnergy();
    }


    /* =====================================================
       RESET
    ===================================================== */

    reset(
        row = 1,
        col = 1,
        direction = Robot.EAST
    ) {
        this.setPosition(
            row,
            col
        );

        this.setDirection(
            direction
        );

        this.clearInventory();
        this.restoreEnergy();

        return this;
    }


    /* =====================================================
       ÉTAT
    ===================================================== */

    getState() {
        return {
            row:
                this.row,

            col:
                this.col,

            position: {
                row:
                    this.row,

                col:
                    this.col
            },

            direction:
                this.direction,

            inventory:
                this.getInventory(),

            count:
                this.getInventoryCount(),

            energy:
                this.energy,

            maxEnergy:
                this.maxEnergy
        };
    }


    getDirectionSymbol() {
        switch (
            this.direction
        ) {
            case Robot.NORTH:
                return "↑";

            case Robot.EAST:
                return "→";

            case Robot.SOUTH:
                return "↓";

            case Robot.WEST:
                return "←";

            default:
                return "?";
        }
    }


    symbol() {
        return this.getDirectionSymbol();
    }


    toString() {
        return (
            `Pyt(${this.row}, ${this.col}) ` +
            `${this.getDirectionSymbol()}`
        );
    }
}


/* =========================================================
   EXPORT
========================================================= */

window.Robot = Robot;