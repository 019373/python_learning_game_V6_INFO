"use strict";

/*
============================================================
PYT - robot.js

Ce fichier gère uniquement Pyt :
- position
- orientation
- déplacements logiques
- inventaire
- énergie
- état

Les collisions et les règles du niveau
restent dans game.js.
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
    // CONSTRUCTEUR
    // =====================================================

    constructor(
        row = 0,
        col = 0,
        direction = Robot.EAST
    ) {

        this.row = Number(row);
        this.col = Number(col);

        this.direction =
            this.validateDirection(direction);

        this.inventory = 0;

        this.maxEnergy = 100;
        this.energy = this.maxEnergy;

        this.active = true;
    }


    // =====================================================
    // VALIDATION DIRECTION
    // =====================================================

    validateDirection(direction) {

        const normalized =
            String(direction).toLowerCase();

        if (
            !Robot.DIRECTIONS.includes(
                normalized
            )
        ) {

            throw new Error(
                `Direction invalide : ${direction}`
            );
        }

        return normalized;
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


    setPosition(row, col) {

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
    }


    // =====================================================
    // VECTEUR DE DIRECTION
    // =====================================================

    getDirectionVector() {

        switch (this.direction) {

            case Robot.NORTH:
                return [-1, 0];

            case Robot.EAST:
                return [0, 1];

            case Robot.SOUTH:
                return [1, 0];

            case Robot.WEST:
                return [0, -1];

            default:
                return [0, 0];
        }
    }


    getBackwardVector() {

        const [rowDelta, colDelta] =
            this.getDirectionVector();

        return [
            -rowDelta,
            -colDelta
        ];
    }


    // =====================================================
    // ROTATIONS SIMPLES
    // =====================================================

    turnRight() {

        const index =
            Robot.DIRECTIONS.indexOf(
                this.direction
            );

        this.direction =
            Robot.DIRECTIONS[
                (index + 1)
                % Robot.DIRECTIONS.length
            ];

        return this.direction;
    }


    turnLeft() {

        const index =
            Robot.DIRECTIONS.indexOf(
                this.direction
            );

        this.direction =
            Robot.DIRECTIONS[
                (
                    index
                    - 1
                    + Robot.DIRECTIONS.length
                )
                % Robot.DIRECTIONS.length
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

    rotateRight(angle = 90) {

        this.validateAngle(angle);

        const turns =
            angle / 90;

        for (
            let i = 0;
            i < turns;
            i++
        ) {

            this.turnRight();
        }

        return this.direction;
    }


    rotateLeft(angle = 90) {

        this.validateAngle(angle);

        const turns =
            angle / 90;

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

        angle = Number(angle);

        if (
            !Number.isInteger(angle)
            ||
            angle < 0
        ) {

            throw new Error(
                "L'angle doit être un entier positif."
            );
        }

        if (
            angle % 90 !== 0
        ) {

            throw new Error(
                "L'angle doit être un multiple de 90."
            );
        }

        if (
            angle > 3600
        ) {

            throw new Error(
                "L'angle demandé est trop grand."
            );
        }
    }


    // =====================================================
    // PROCHAINE POSITION
    // =====================================================

    getForwardPosition() {

        const [rowDelta, colDelta] =
            this.getDirectionVector();

        return [
            this.row + rowDelta,
            this.col + colDelta
        ];
    }


    getBackwardPosition() {

        const [rowDelta, colDelta] =
            this.getBackwardVector();

        return [
            this.row + rowDelta,
            this.col + colDelta
        ];
    }


    // =====================================================
    // DÉPLACEMENTS VIA LE MOTEUR
    // =====================================================

    forward(game, steps = 1) {

        this.validateSteps(
            steps
        );

        for (
            let i = 0;
            i < steps;
            i++
        ) {

            const position =
                this.getForwardPosition();

            const moved =
                game.moveRobotTo(
                    position[0],
                    position[1]
                );

            if (!moved) {
                return false;
            }
        }

        return true;
    }


    backward(game, steps = 1) {

        this.validateSteps(
            steps
        );

        for (
            let i = 0;
            i < steps;
            i++
        ) {

            const position =
                this.getBackwardPosition();

            const moved =
                game.moveRobotTo(
                    position[0],
                    position[1]
                );

            if (!moved) {
                return false;
            }
        }

        return true;
    }


    validateSteps(steps) {

        steps = Number(steps);

        if (
            !Number.isInteger(steps)
            ||
            steps < 0
        ) {

            throw new Error(
                "Le nombre de cases doit être un entier positif."
            );
        }

        if (
            steps > 100
        ) {

            throw new Error(
                "Le déplacement demandé est trop grand."
            );
        }
    }


    // =====================================================
    // INVENTAIRE
    // =====================================================

    hasObject() {

        return (
            this.inventory > 0
        );
    }


    addObject(amount = 1) {

        amount = Number(amount);

        if (
            !Number.isInteger(amount)
            ||
            amount < 0
        ) {
            return false;
        }

        this.inventory += amount;

        return true;
    }


    removeObject(amount = 1) {

        amount = Number(amount);

        if (
            !Number.isInteger(amount)
            ||
            amount < 0
        ) {
            return false;
        }

        if (
            this.inventory < amount
        ) {
            return false;
        }

        this.inventory -= amount;

        return true;
    }


    clearInventory() {

        this.inventory = 0;
    }


    // =====================================================
    // ÉNERGIE
    // =====================================================

    recharge(amount = null) {

        if (
            amount === null
            ||
            amount === undefined
        ) {

            this.energy =
                this.maxEnergy;

            return this.energy;
        }

        amount = Number(amount);

        if (
            !Number.isFinite(amount)
            ||
            amount < 0
        ) {

            return this.energy;
        }

        this.energy =
            Math.min(
                this.maxEnergy,
                this.energy + amount
            );

        return this.energy;
    }


    consumeEnergy(amount = 1) {

        amount = Number(amount);

        if (
            !Number.isFinite(amount)
            ||
            amount < 0
        ) {

            return false;
        }

        if (
            this.energy < amount
        ) {

            this.energy = 0;
            this.active = false;

            return false;
        }

        this.energy -= amount;

        if (
            this.energy <= 0
        ) {
            this.active = false;
        }

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

        row = Number(row);
        col = Number(col);

        if (
            !Number.isInteger(row)
            ||
            !Number.isInteger(col)
        ) {

            throw new Error(
                "Position de départ invalide."
            );
        }

        this.row = row;
        this.col = col;

        this.direction =
            this.validateDirection(
                direction
            );

        this.inventory = 0;

        this.energy =
            this.maxEnergy;

        this.active = true;
    }


    // =====================================================
    // ÉTAT COMPLET
    // =====================================================

    getState() {

        return {
            row: this.row,
            col: this.col,

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
    // SYMBOLE DIRECTION
    // =====================================================

    getDirectionSymbol() {

        switch (this.direction) {

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
            `Pyt(${this.row}, ${this.col}, ` +
            `${this.direction})`
        );
    }

}


// =========================================================
// EXPOSITION GLOBALE
// =========================================================

window.Robot = Robot;