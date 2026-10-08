"use strict";

/*
 * PYT — MEUBLES SOLIDES
 *
 * Les gros objets décoratifs bloquent le passage.
 * Les objets à ramasser et les étapes obligatoires
 * restent accessibles.
 *
 * Aucun niveau ni chemin n'est déplacé.
 */

(() => {
    const FURNITURE = new Set([
        "plante",
        "lampe",
        "table",
        "chaise",
        "caisse",
        "frigo",
        "evier",
        "four",
        "canape",
        "bibliotheque",
        "lit",
        "voiture",
        "casier_vin",
        "tonneau",
        "toilette",
        "lavabo",
        "arbre",
        "buisson",
        "piscine",
        "transat",
        "banc",
        "fontaine"
    ]);

    const key = (x, y) => `${x},${y}`;

    function position(item) {
        if (Array.isArray(item)) {
            return [
                Number(item[0]),
                Number(item[1])
            ];
        }

        if (!item || typeof item !== "object") {
            return [NaN, NaN];
        }

        return [
            Number(item.x ?? item.col),
            Number(item.y ?? item.row)
        ];
    }

    function valid(x, y) {
        return Number.isInteger(x) &&
               Number.isInteger(y);
    }

    function normalize(value) {
        return String(value || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    const cache = new WeakMap();

    /* ============================================
       RECENSER LES MEUBLES BLOQUANTS
    ============================================ */

    function collisionCells(game) {
        const level = game.levelData;

        if (!level || typeof level !== "object") {
            return new Map();
        }

        if (cache.has(level)) {
            return cache.get(level);
        }

        const protectedCells = new Set();

        function protect(item) {
            const [x, y] = position(item);

            if (valid(x, y)) {
                protectedCells.add(key(x, y));
            }
        }

        const start =
            level.robotStart ||
            level.start ||
            null;

        const finish =
            level.goal?.position ||
            level.goal ||
            null;

        const milestones = [start];

        const visits =
            level.goal?.visitInOrder || [];

        if (Array.isArray(visits)) {
            milestones.push(...visits);
        }

        milestones.push(finish);

        for (const point of milestones) {
            protect(point);
        }

        /*
         * Garder accessibles les segments droits
         * prévus par les consignes des exercices.
         */

        for (
            let i = 1;
            i < milestones.length;
            i++
        ) {
            const [ax, ay] =
                position(milestones[i - 1]);

            const [bx, by] =
                position(milestones[i]);

            if (
                ![ax, ay, bx, by].every(
                    Number.isInteger
                )
            ) {
                continue;
            }

            if (ax === bx) {
                for (
                    let y = Math.min(ay, by);
                    y <= Math.max(ay, by);
                    y++
                ) {
                    protectedCells.add(
                        key(ax, y)
                    );
                }
            } else if (ay === by) {
                for (
                    let x = Math.min(ax, bx);
                    x <= Math.max(ax, bx);
                    x++
                ) {
                    protectedCells.add(
                        key(x, ay)
                    );
                }
            }
        }

        /*
         * Ne pas bloquer les objets de mission,
         * les boutons ni les cases de dépôt.
         */

        const interactive = [
            ...(level.objects || []),
            ...(level.targets || []),
            ...(level.buttons || [])
        ];

        for (const item of interactive) {
            protect(item);
        }

        const result = new Map();

        const decorations =
            level.decorations ||
            level.map?.decorations ||
            [];

        const width = Number(
            level.map?.width ||
            level.width ||
            game.mapWidth ||
            8
        );

        const height = Number(
            level.map?.height ||
            level.height ||
            game.mapHeight ||
            6
        );

        for (
            const item of Array.isArray(decorations)
                ? decorations
                : []
        ) {
            const [x, y] = position(item);

            const type = normalize(
                item.type || item.id
            );

            if (
                !valid(x, y) ||
                x < 0 ||
                y < 0 ||
                x >= width ||
                y >= height
            ) {
                continue;
            }

            if (
                item.walkable === true ||
                item.solid === false
            ) {
                continue;
            }

            if (
                !FURNITURE.has(type) &&
                item.solid !== true
            ) {
                continue;
            }

            if (
                protectedCells.has(
                    key(x, y)
                )
            ) {
                continue;
            }

            result.set(
                key(x, y),
                { x, y, type }
            );
        }

        cache.set(level, result);

        return result;
    }

    /* ============================================
       INSTALLATION DES COLLISIONS
    ============================================ */

    function install() {
        const game = window.pytGame;

        if (
            !game ||
            game.__pytMeublesSolides ||
            typeof game.isBlockedCell !== "function" ||
            typeof game.render !== "function"
        ) {
            return;
        }

        game.__pytMeublesSolides = true;

        const previousCollision =
            game.isBlockedCell;

        game.isBlockedCell = function(
            x,
            y,
            ignoreId = null
        ) {
            /*
             * Garder les collisions originales :
             * murs, caisses, objets solides...
             */

            if (
                previousCollision.call(
                    this,
                    x,
                    y,
                    ignoreId
                )
            ) {
                return true;
            }

            /*
             * Ajouter les meubles fixes.
             */

            return collisionCells(this).has(
                key(Number(x), Number(y))
            );
        };

        /* ========================================
           RENDRE LES MEUBLES BLOQUANTS VISIBLES
        ======================================== */

        const previousRender =
            game.render;

        game.render = function(...args) {
            const result =
                previousRender.apply(
                    this,
                    args
                );

            const ctx = this.ctx;

            if (
                !ctx ||
                !this.levelData ||
                typeof this.cellRect !== "function"
            ) {
                return result;
            }

            for (
                const { x, y }
                of collisionCells(this).values()
            ) {
                const cell =
                    this.cellRect(x, y);

                if (
                    !cell ||
                    !Number.isFinite(cell.x) ||
                    !Number.isFinite(cell.y) ||
                    !Number.isFinite(cell.size) ||
                    cell.size <= 0
                ) {
                    continue;
                }

                const size = cell.size;

                const inset = Math.max(
                    2,
                    size * 0.065
                );

                ctx.save();

                ctx.globalAlpha = 1;

                ctx.globalCompositeOperation =
                    "source-over";

                /*
                 * Léger fond rouge transparent :
                 * on voit encore le meuble.
                 */

                ctx.fillStyle =
                    "rgba(91, 11, 26, 0.20)";

                ctx.fillRect(
                    cell.x + inset,
                    cell.y + inset,
                    size - 2 * inset,
                    size - 2 * inset
                );

                /*
                 * Contour rouge foncé.
                 */

                ctx.strokeStyle =
                    "#a42542";

                ctx.lineWidth = Math.max(
                    3,
                    size * 0.058
                );

                ctx.strokeRect(
                    cell.x + inset,
                    cell.y + inset,
                    size - 2 * inset,
                    size - 2 * inset
                );

                /*
                 * Petit symbole d'interdiction
                 * dans le coin supérieur droit.
                 */

                const centerX =
                    cell.x + size * 0.79;

                const centerY =
                    cell.y + size * 0.21;

                const radius = Math.max(
                    5,
                    size * 0.125
                );

                ctx.fillStyle =
                    "#41101d";

                ctx.strokeStyle =
                    "#ff8590";

                ctx.lineWidth = Math.max(
                    2,
                    size * 0.04
                );

                ctx.beginPath();

                ctx.arc(
                    centerX,
                    centerY,
                    radius,
                    0,
                    Math.PI * 2
                );

                ctx.fill();
                ctx.stroke();

                ctx.beginPath();

                ctx.moveTo(
                    centerX - radius * 0.62,
                    centerY + radius * 0.62
                );

                ctx.lineTo(
                    centerX + radius * 0.62,
                    centerY - radius * 0.62
                );

                ctx.stroke();

                ctx.restore();
            }

            return result;
        };

        game.render();

        console.info(
            "[PYT] Meubles solides activés."
        );
    }

    if (
        document.readyState === "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            install,
            { once: true }
        );
    } else {
        install();
    }
})();
