"use strict";

/*
============================================================
PYT - robot.js

Ce fichier représente Pyt :
- sa position ;
- sa direction ;
- son inventaire ;
- son énergie ;
- ses rotations ;
- ses déplacements logiques.

Le moteur game.js décide si un déplacement est autorisé.
============================================================
*/


class Robot {

    // =====================================================
    // DIRECTIONS
    // =====================================================

    static NORTH = "north";
    static EAST = "east";
    static SOUTH = "south";
    static WEST = "west";

    static DIRECTIONS = [
        Robot.NORTH,
        Robot.EAST,
        Robot.SOUTH,
        Robot.WEST
    ];


    // =====================================================
    // CRÉATION
    // =====================================================

    constructor(
        row = 0,
        col = 0,
        direction = Robot.EAST
    ) {

        this.row = 0;
        this.col = 0;

        this.direction =
            Robot.EAST;


        // Inventaire simple
        this.inventory = 0;


        // Énergie prévue pour les niveaux futurs
        this.maxEnergy = 100;
        this.energy = 100;


        this.active = true;


        this.setPosition(
            row,
            col
        );


        this.direction =
            this.validateDirection(
                direction
            );
    }


    // =====================================================
    // POSITION
    // =====================================================

    getPosition() {

        return [
            this.row,
            this.col
        ];
    }


    setPosition(
        row,
        col
    ) {

        row = Number(row);
        col = Number(col);


        if (
            !Number.isInteger(row)
            ||
            !Number.isInteger(col)
        ) {

            throw new Error(
                "La position de Pyt doit utiliser des coordonnées entières."
            );
        }


        this.row = row;
        this.col = col;


        return true;
    }


    // =====================================================
    // DIRECTION
    // =====================================================

    validateDirection(direction) {

        const value =
            String(direction)
                .toLowerCase();


        if (
            !Robot.DIRECTIONS.includes(
                value
            )
        ) {

            throw new Error(
                `Direction inconnue : ${direction}`
            );
        }


        return value;
    }


    getDirectionVector() {

        switch (
            this.direction
        ) {

            case Robot.NORTH:

                return [
                    -1,
                    0
                ];


            case Robot.SOUTH:

                return [
                    1,
                    0
                ];


            case Robot.WEST:

                return [
                    0,
                    -1
                ];


            case Robot.EAST:

                return [
                    0,
                    1
                ];


            default:

                return [
                    0,
                    0
                ];
        }
    }


    getBackwardVector() {

        const [
            rowChange,
            colChange
        ] =
            this.getDirectionVector();


        return [
            -rowChange,
            -colChange
        ];
    }


    // =====================================================
    // POSITION DEVANT / DERRIÈRE
    // =====================================================

    getForwardPosition() {

        const [
            rowChange,
            colChange
        ] =
            this.getDirectionVector();


        return [
            this.row
            +
            rowChange,

            this.col
            +
            colChange
        ];
    }


    getBackwardPosition() {

        const [
            rowChange,
            colChange
        ] =
            this.getBackwardVector();


        return [
            this.row
            +
            rowChange,

            this.col
            +
            colChange
        ];
    }


    // =====================================================
    // ROTATIONS SIMPLES
    // =====================================================

    turnRight() {

        const currentIndex =
            Robot.DIRECTIONS.indexOf(
                this.direction
            );


        const nextIndex =
            (
                currentIndex + 1
            )
            %
            Robot.DIRECTIONS.length;


        this.direction =
            Robot.DIRECTIONS[
                nextIndex
            ];


        return this.direction;
    }


    turnLeft() {

        const currentIndex =
            Robot.DIRECTIONS.indexOf(
                this.direction
            );


        const nextIndex =
            (
                currentIndex
                -
                1
                +
                Robot.DIRECTIONS.length
            )
            %
            Robot.DIRECTIONS.length;


        this.direction =
            Robot.DIRECTIONS[
                nextIndex
            ];


        return this.direction;
    }


    turnAround() {

        this.turnRight();
        this.turnRight();


        return this.direction;
    }


    // =====================================================
    // ROTATIONS AVEC ANGLE
    // =====================================================

    rotateRight(
        angle = 90
    ) {

        const turns =
            this.validateAngle(
                angle
            );


        for (
            let i = 0;
            i < turns;
            i++
        ) {

            this.turnRight();
        }


        return this.direction;
    }


    rotateLeft(
        angle = 90
    ) {

        const turns =
            this.validateAngle(
                angle
            );


        for (
            let i = 0;
            i < turns;
            i++
        ) {

            this.turnLeft();
        }


        return this.direction;
    }


    validateAngle(angle) {

        angle =
            Number(angle);


        if (
            !Number.isInteger(angle)
            ||
            angle < 0
            ||
            angle % 90 !== 0
        ) {

            throw new Error(
                "L'angle doit être un multiple positif de 90."
            );
        }


        if (
            angle > 3600
        ) {

            throw new Error(
                "La rotation demandée est trop grande."
            );
        }


        return angle / 90;
    }


    // =====================================================
    // DÉPLACEMENT AVEC LE MOTEUR
    // =====================================================

    forward(
        game,
        steps = 1
    ) {

        steps =
            this.validateSteps(
                steps
            );


        for (
            let i = 0;
            i < steps;
            i++
        ) {

            const [
                nextRow,
                nextCol
            ] =
                this.getForwardPosition();


            const moved =
                game.moveRobotTo(
                    nextRow,
                    nextCol
                );


            if (!moved) {

                return false;
            }
        }


        return true;
    }


    backward(
        game,
        steps = 1
    ) {

        steps =
            this.validateSteps(
                steps
            );


        for (
            let i = 0;
            i < steps;
            i++
        ) {

            const [
                nextRow,
                nextCol
            ] =
                this.getBackwardPosition();


            const moved =
                game.moveRobotTo(
                    nextRow,
                    nextCol
                );


            if (!moved) {

                return false;
            }
        }


        return true;
    }


    validateSteps(steps) {

        steps =
            Number(steps);


        if (
            !Number.isInteger(steps)
            ||
            steps < 0
        ) {

            throw new Error(
                "La distance doit être un entier positif."
            );
        }


        if (
            steps > 100
        ) {

            throw new Error(
                "La distance demandée est trop grande."
            );
        }


        return steps;
    }


    // =====================================================
    // INVENTAIRE
    // =====================================================

    hasObject() {

        return (
            this.inventory > 0
        );
    }


    addObject(
        amount = 1
    ) {

        amount =
            Number(amount);


        if (
            !Number.isInteger(amount)
            ||
            amount < 0
        ) {

            return false;
        }


        this.inventory +=
            amount;


        return true;
    }


    removeObject(
        amount = 1
    ) {

        amount =
            Number(amount);


        if (
            !Number.isInteger(amount)
            ||
            amount < 0
        ) {

            return false;
        }


        if (
            this.inventory
            <
            amount
        ) {

            return false;
        }


        this.inventory -=
            amount;


        return true;
    }


    clearInventory() {

        this.inventory = 0;
    }


    // =====================================================
    // ÉNERGIE
    // =====================================================

    recharge(
        amount = null
    ) {

        if (
            amount === null
        ) {

            this.energy =
                this.maxEnergy;

            return this.energy;
        }


        amount =
            Number(amount);


        if (
            Number.isNaN(amount)
            ||
            amount < 0
        ) {

            return this.energy;
        }


        this.energy =
            Math.min(
                this.maxEnergy,
                this.energy
                +
                amount
            );


        return this.energy;
    }


    consumeEnergy(
        amount = 1
    ) {

        amount =
            Number(amount);


        if (
            Number.isNaN(amount)
            ||
            amount < 0
        ) {

            return false;
        }


        if (
            this.energy
            <
            amount
        ) {

            return false;
        }


        this.energy -=
            amount;


        return true;
    }


    // =====================================================
    // RESET
    // =====================================================

    reset(
        row = 0,
        col = 0,
        direction = Robot.EAST
    ) {

        this.setPosition(
            row,
            col
        );


        this.direction =
            this.validateDirection(
                direction
            );


        this.inventory = 0;

        this.energy =
            this.maxEnergy;

        this.active = true;


        return true;
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

            direction:
                this.direction,

            inventory:
                this.inventory,

            energy:
                this.energy,

            maxEnergy:
                this.maxEnergy,

            active:
                this.active
        };
    }


    // =====================================================
    // OUTILS DE DEBUG
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


    toString() {

        return (
            `Pyt (${this.row}, ${this.col}) `
            +
            `${this.getDirectionSymbol()}`
        );
    }

}


// =========================================================
// ACCESSIBLE AUX AUTRES FICHIERS
// =========================================================

window.Robot = Robot;