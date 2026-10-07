"use strict";

/*
============================================================
PYT - robot.js

État et comportement du robot Pyt.

Responsabilités :
- position ;
- direction ;
- rotations ;
- déplacements ;
- inventaire ;
- énergie ;
- état du robot.

Les collisions et interactions avec le monde
restent gérées par game.js.
============================================================
*/

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

        this.row =
            Number(row);

        this.col =
            Number(col);

        this.direction =
            this.normalizeDirection(
                direction
            );

        this.inventory = [];

        this.maxEnergy = 100;
        this.energy = 100;
    }


    // =====================================================
    // POSITION
    // =====================================================

    getPosition() {

        return {
            row:
                this.row,

            col:
                this.col
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
            !Number.isFinite(
                nextRow
            ) ||
            !Number.isFinite(
                nextCol
            )
        ) {

            return false;
        }


        this.row =
            nextRow;

        this.col =
            nextCol;

        return true;
    }


    // =====================================================
    // DIRECTION
    // =====================================================

    normalizeDirection(direction) {

        const value =
            String(
                direction ||
                Robot.NORTH
            )
                .trim()
                .toUpperCase();


        const aliases = {

            N:
                Robot.NORTH,

            NORTH:
                Robot.NORTH,

            UP:
                Robot.NORTH,


            E:
                Robot.EAST,

            EAST:
                Robot.EAST,

            RIGHT:
                Robot.EAST,


            S:
                Robot.SOUTH,

            SOUTH:
                Robot.SOUTH,

            DOWN:
                Robot.SOUTH,


            W:
                Robot.WEST,

            WEST:
                Robot.WEST,

            LEFT:
                Robot.WEST
        };


        return (
            aliases[value] ||
            Robot.NORTH
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

        return [
            Robot.NORTH,
            Robot.EAST,
            Robot.SOUTH,
            Robot.WEST
        ].indexOf(
            this.direction
        );
    }


    getDirectionVector() {

        switch (
            this.direction
        ) {

            case Robot.NORTH:

                return {
                    row: -1,
                    col: 0
                };


            case Robot.EAST:

                return {
                    row: 0,
                    col: 1
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


            default:

                return {
                    row: -1,
                    col: 0
                };
        }
    }


    getForwardPosition(
        steps = 1
    ) {

        const amount =
            Math.max(
                0,
                Math.floor(
                    Number(steps) || 0
                )
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
            Math.max(
                0,
                Math.floor(
                    Number(steps) || 0
                )
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


    // =====================================================
    // ROTATIONS
    // =====================================================

    turnRight() {

        const directions = [
            Robot.NORTH,
            Robot.EAST,
            Robot.SOUTH,
            Robot.WEST
        ];


        const current =
            this.getDirectionIndex();


        this.direction =
            directions[
                (
                    current + 1
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


        const current =
            this.getDirectionIndex();


        this.direction =
            directions[
                (
                    current + 3
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
        angle = 90
    ) {

        return this.rotate(
            angle
        );
    }


    rotateLeft(
        angle = 90
    ) {

        return this.rotate(
            -Number(angle)
        );
    }


    rotate(angle = 90) {

        const numericAngle =
            Number(angle);


        if (
            !Number.isFinite(
                numericAngle
            )
        ) {

            return false;
        }


        if (
            numericAngle % 90 !== 0
        ) {

            return false;
        }


        let turns =
            Math.abs(
                numericAngle / 90
            ) % 4;


        while (
            turns > 0
        ) {

            if (
                numericAngle > 0
            ) {

                this.turnRight();

            } else {

                this.turnLeft();
            }

            turns--;
        }


        return this.direction;
    }


    // =====================================================
    // DÉPLACEMENTS
    // =====================================================

    forward(
        game,
        steps = 1
    ) {

        if (
            !game
        ) {

            return false;
        }


        const amount =
            this.normalizeSteps(
                steps
            );


        if (
            amount === null
        ) {

            return false;
        }


        for (
            let i = 0;
            i < amount;
            i++
        ) {

            let moved = false;


            if (
                typeof game.moveForward ===
                "function"
            ) {

                moved =
                    game.moveForward();

            } else {

                const position =
                    this.getForwardPosition(
                        1
                    );


                if (
                    typeof game.moveRobotTo ===
                    "function"
                ) {

                    moved =
                        game.moveRobotTo(
                            position.row,
                            position.col
                        );
                }
            }


            if (
                moved === false
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
            !game
        ) {

            return false;
        }


        const amount =
            this.normalizeSteps(
                steps
            );


        if (
            amount === null
        ) {

            return false;
        }


        for (
            let i = 0;
            i < amount;
            i++
        ) {

            let moved = false;


            if (
                typeof game.moveBackward ===
                "function"
            ) {

                moved =
                    game.moveBackward();

            } else {

                const position =
                    this.getBackwardPosition(
                        1
                    );


                if (
                    typeof game.moveRobotTo ===
                    "function"
                ) {

                    moved =
                        game.moveRobotTo(
                            position.row,
                            position.col
                        );
                }
            }


            if (
                moved === false
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
            !Number.isFinite(
                amount
            )
        ) {

            return null;
        }


        if (
            amount < 0
        ) {

            return null;
        }


        if (
            !Number.isInteger(
                amount
            )
        ) {

            return null;
        }


        return amount;
    }


    // =====================================================
    // INVENTAIRE
    // =====================================================

    addItem(
        item = "object"
    ) {

        this.inventory.push(
            item
        );

        return this.inventory.length;
    }


    removeItem(
        item = null
    ) {

        if (
            this.inventory.length === 0
        ) {

            return null;
        }


        if (
            item === null ||
            item === undefined
        ) {

            return this.inventory.pop();
        }


        const index =
            this.inventory.indexOf(
                item
            );


        if (
            index === -1
        ) {

            return null;
        }


        const removed =
            this.inventory.splice(
                index,
                1
            );


        return (
            removed[0] ||
            null
        );
    }


    hasItem(
        item = null
    ) {

        if (
            item === null ||
            item === undefined
        ) {

            return (
                this.inventory.length >
                0
            );
        }


        return this.inventory.includes(
            item
        );
    }


    getInventory() {

        return [
            ...this.inventory
        ];
    }


    getInventoryCount() {

        return this.inventory.length;
    }


    clearInventory() {

        const oldInventory =
            [
                ...this.inventory
            ];


        this.inventory.length =
            0;


        return oldInventory;
    }


    // =====================================================
    // ÉNERGIE
    // =====================================================

    getEnergy() {

        return this.energy;
    }


    setEnergy(value) {

        const numericValue =
            Number(value);


        if (
            !Number.isFinite(
                numericValue
            )
        ) {

            return this.energy;
        }


        this.energy =
            Math.max(
                0,
                Math.min(
                    this.maxEnergy,
                    numericValue
                )
            );


        return this.energy;
    }


    useEnergy(
        amount = 1
    ) {

        const cost =
            Math.max(
                0,
                Number(amount) || 0
            );


        if (
            this.energy <
            cost
        ) {

            return false;
        }


        this.energy -=
            cost;


        return true;
    }


    addEnergy(
        amount = 1
    ) {

        return this.setEnergy(
            this.energy +
            Math.max(
                0,
                Number(amount) || 0
            )
        );
    }


    restoreEnergy() {

        this.energy =
            this.maxEnergy;

        return this.energy;
    }


    isOutOfEnergy() {

        return (
            this.energy <=
            0
        );
    }


    // =====================================================
    // RESET
    // =====================================================

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


    // =====================================================
    // ÉTAT
    // =====================================================

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

            inventoryCount:
                this.getInventoryCount(),

            energy:
                this.energy,

            maxEnergy:
                this.maxEnergy
        };
    }


    // =====================================================
    // AFFICHAGE / DEBUG
    // =====================================================

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


// =========================================================
// EXPOSITION NAVIGATEUR
// =========================================================

window.Robot =
    Robot;