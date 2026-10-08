"use strict";

/*
 * PYT — AIDE PÉDAGOGIQUE
 *
 * - Consignes plus précises
 * - Repères des étapes obligatoires
 * - Explication à partir du deuxième échec
 * - Toutes les cases interdites clairement visibles
 *
 * Ne change ni les niveaux, ni les chemins,
 * ni les collisions, ni les conditions de victoire.
 */

(() => {
    const $ = id => document.getElementById(id);

    const attempts = new Map();

    let currentKey = "";

    const levelNow = () =>
        window.pytGame?.levelData || null;

    const gameNow = () =>
        window.pytGame;

    const idOf = level =>
        level
            ? `${level.chapter}-${level.level}`
            : "";

    function coord(value) {
        if (Array.isArray(value)) {
            return {
                x: Number(value[0]),
                y: Number(value[1])
            };
        }

        return {
            x: Number(value?.x ?? value?.col),
            y: Number(value?.y ?? value?.row)
        };
    }

    function same(a, b) {
        return Boolean(
            a && b &&
            a.x === b.x &&
            a.y === b.y
        );
    }

    /* =====================================================
       AFFICHAGE DES EXPLICATIONS
    ===================================================== */

    function createUI() {
        if (!$("pyt-help-styles")) {
            const style = document.createElement("style");

            style.id = "pyt-help-styles";

            style.textContent = `
                #pyt-help-legend {
                    margin: 11px 0 0;
                    padding: 10px 11px;
                    border-left: 4px solid #ffd66b;
                    background: rgba(12,13,22,.65);
                    color: #f2eadd;
                    font-size: 12px;
                    line-height: 1.5;
                }

                #pyt-help-legend strong {
                    color: #ffe59a;
                }

                #pyt-help-detail {
                    margin: 11px 0 0;
                    padding: 12px;
                    border: 2px solid #f2a259;
                    background: #372637;
                    color: #fff0db;
                    font-size: 12px;
                    line-height: 1.6;
                }

                #pyt-help-detail strong {
                    color: #ffe49c;
                }

                #pyt-help-detail[hidden] {
                    display: none !important;
                }

                @media (max-width: 600px) {
                    #pyt-help-legend,
                    #pyt-help-detail {
                        font-size: 10px;
                        padding: 7px;
                        margin-top: 6px;
                    }
                }
            `;

            document.head.appendChild(style);
        }

        const instruction = $("mission-instruction");

        if (!instruction) return;

        if (!$("pyt-help-legend")) {
            const legend = document.createElement("div");

            legend.id = "pyt-help-legend";

            instruction.insertAdjacentElement(
                "afterend",
                legend
            );
        }

        if (!$("pyt-help-detail")) {
            const detail = document.createElement("div");

            detail.id = "pyt-help-detail";
            detail.hidden = true;

            $("pyt-help-legend").insertAdjacentElement(
                "afterend",
                detail
            );
        }
    }

    /* =====================================================
       ÉTAPES OBLIGATOIRES
    ===================================================== */

    function checkpoints(level) {
        const mandatory =
            Array.isArray(level?.goal?.visitInOrder)
                ? level.goal.visitInOrder
                : [];

        return mandatory
            .map(coord)
            .filter(point =>
                Number.isInteger(point.x) &&
                Number.isInteger(point.y)
            );
    }

    function directions(level) {
        const direction = String(
            level?.robotStart?.direction || "E"
        ).toUpperCase();

        return {
            E: "vers la droite",
            W: "vers la gauche",
            N: "vers le haut",
            S: "vers le bas"
        }[direction] || "dans le sens de sa flèche";
    }

    /* =====================================================
       CONSIGNES AMÉLIORÉES
    ===================================================== */

    function updateInstructions() {
        createUI();

        const level = levelNow();

        if (!level) return;

        const key = idOf(level);

        if (currentKey !== key) {
            currentKey = key;

            const detail = $("pyt-help-detail");

            if (detail) {
                detail.hidden = true;
                detail.replaceChildren();
            }
        }

        const instruction = $("mission-instruction");

        if (instruction && level.instruction) {
            instruction.textContent = level.instruction;
        }

        const legend = $("pyt-help-legend");

        if (!legend) return;

        const points = checkpoints(level);
        const notes = [];

        notes.push(
            `<strong>Départ :</strong> ` +
            `Pyt regarde ${directions(level)}. ` +
            `Chaque déplacement se fait sur des cases entières.`
        );

        notes.push(
            `<strong>Cases interdites :</strong> ` +
            `une case rouge avec une croix est entièrement bloquée. ` +
            `Il faut la contourner. Une caisse entourée ` +
            `de jaune peut parfois être poussée.`
        );

        if (points.length > 1) {
            notes.push(
                `<strong>Trajet obligatoire :</strong> ` +
                `passe sur les repères jaunes ` +
                `1 à ${points.length - 1}, ` +
                `<strong>dans l'ordre</strong>, ` +
                `avant l'arrivée verte. ` +
                `Aller directement à l'arrivée ne suffit pas.`
            );
        }

        /*
         * Le chapitre 1, exercice 2 exige
         * deux étapes dans un ordre précis.
         */

        if (
            Number(level.chapter) === 1 &&
            Number(level.level) === 2
        ) {
            notes.push(
                `<strong>Exercice 2 :</strong> ` +
                `pars vers la droite, remonte par le couloir, ` +
                `puis reviens vers la gauche. ` +
                `Suis les repères 1 → 2 → ARRIVÉE.`
            );
        }

        /* Missions avec dépôt d'objets. */

        if (
            (level.targets || []).some(target =>
                /depo|deposit/i.test(
                    String(target.type)
                )
            )
        ) {
            notes.push(
                `Ramasse l'objet en passant sur sa case, ` +
                `puis rejoins la zone de dépôt.`
            );
        }

        /* Missions avec interrupteur. */

        if (
            (level.objects || []).some(object =>
                /bouton|switch|interrupteur/i.test(
                    String(object.type)
                )
            )
        ) {
            notes.push(
                `Passe sur l'interrupteur pour ` +
                `l'activer automatiquement.`
            );
        }

        legend.innerHTML = notes.join(
            '<div style="margin-top:5px"></div>'
        );
    }

    /* =====================================================
       DÉTECTER LA PREMIÈRE ÉTAPE MANQUÉE
    ===================================================== */

    function firstMissingCheckpoint(level, game) {
        const points = checkpoints(level);

        if (!points.length) return null;

        const visited =
            (game?.robot?.visited || []).map(coord);

        let lastIndex = -1;

        for (let i = 0; i < points.length; i++) {
            const next = visited.findIndex(
                (position, index) =>
                    index > lastIndex &&
                    same(position, points[i])
            );

            if (next < 0) {
                return {
                    index: i,
                    point: points[i],
                    count: points.length
                };
            }

            lastIndex = next;
        }

        return null;
    }

    /* =====================================================
       EXPLICATION PRÉCISE DES ERREURS
    ===================================================== */

    function explanation(detail, level, game) {
        const collision =
            (game?.runtimeIssues || []).find(
                issue => issue.type === "collision"
            );

        const missing =
            firstMissingCheckpoint(level, game);

        const destination =
            coord(level?.goal?.position || {});

        const position =
            coord(game?.robot || {});

        const reason = detail.reason || "";

        const messages = [];

        /* Collision avec un obstacle. */

        if (collision) {
            const blocked = coord(collision);

            const outside =
                blocked.x < 0 ||
                blocked.y < 0 ||
                blocked.x >= game.mapWidth ||
                blocked.y >= game.mapHeight;

            if (outside) {
                messages.push(
                    `Pyt a essayé de sortir de la grille. ` +
                    `Il faut tourner avant le bord.`
                );
            } else {
                messages.push(
                    `Pyt a essayé d'entrer dans la case ` +
                    `(${blocked.x}, ${blocked.y}). ` +
                    `Cette case est bloquée : même si son dessin ` +
                    `semble partiel, elle est entièrement interdite. ` +
                    `Tourne avant l'obstacle.`
                );
            }
        }

        /* Étapes obligatoires oubliées. */

        if (missing) {
            const name =
                missing.index === missing.count - 1
                    ? "l'arrivée"
                    : `le repère ${missing.index + 1}`;

            messages.push(
                `Il te manque <strong>${name}</strong> ` +
                `en colonne ${missing.point.x}, ` +
                `ligne ${missing.point.y}. ` +
                `La première colonne et la première ligne ` +
                `valent 0. ` +
                `Tu dois suivre les repères dans l'ordre.`
            );
        } else if (
            reason === "wrong_destination" &&
            Number.isFinite(destination.x)
        ) {
            messages.push(
                `Pyt termine en (${position.x}, ${position.y}), ` +
                `mais l'arrivée est en ` +
                `(${destination.x}, ${destination.y}). ` +
                `Recompte les cases après ton dernier virage.`
            );
        }

        /* Notion Python manquante. */

        if (reason === "concept_missing") {
            const concepts =
                detail.missingConcepts ||
                level.requiredConcepts ||
                [];

            messages.push(
                `Le chemin ne suffit pas : utilise aussi ` +
                `les notions Python demandées ` +
                `(${concepts.join(", ")}).`
            );
        }

        /* Erreur de code. */

        else if (
            reason === "runtime_error" ||
            reason === "engine_error"
        ) {
            messages.push(
                `Ton programme contient une erreur : ` +
                String(
                    detail.message ||
                    "Vérifie les commandes et l'indentation."
                )
            );
        }

        /* Objet manquant. */

        else if (reason === "object_missing") {
            messages.push(
                `Un objet obligatoire n'a pas été ramassé. ` +
                `Fais passer Pyt exactement sur sa case.`
            );
        }

        /* Dépôt manquant. */

        else if (reason === "deposit_missing") {
            messages.push(
                `Un dépôt n'est pas terminé. ` +
                `Rejoins la zone de dépôt avec le bon objet.`
            );
        }

        /* Mission incomplète. */

        else if (
            reason === "objective_incomplete" &&
            !missing &&
            !collision
        ) {
            messages.push(
                `La destination ne suffit pas : vérifie ` +
                `les interrupteurs, les objets à ramasser, ` +
                `les étapes obligatoires et les objectifs ` +
                `demandés dans la consigne.`
            );
        }

        if (!messages.length) {
            messages.push(
                `Regarde la flèche du robot et les ` +
                `repères du plateau. ` +
                `Une rotation change la direction de Pyt, ` +
                `mais ne le déplace pas.`
            );
        }

        /*
         * Indices progressifs.
         * Deuxième échec : premier indice.
         * Troisième échec : deuxième indice.
         */

        const hints =
            Array.isArray(level?.hints)
                ? level.hints
                : [];

        const count =
            attempts.get(idOf(level)) || 0;

        if (count >= 2 && hints.length) {
            const hint =
                hints[
                    Math.min(
                        count - 2,
                        hints.length - 1
                    )
                ];

            messages.push(
                `<strong>Indice :</strong> ${hint}`
            );
        }

        return messages.join(
            '<div style="margin-top:7px"></div>'
        );
    }

    /* =====================================================
       AIDE APRÈS LE DEUXIÈME ÉCHEC
    ===================================================== */

    function onFailure(detail) {
        const level =
            levelNow() || detail.levelData;

        if (!level) return;

        const key = idOf(level);

        const count =
            (attempts.get(key) || 0) + 1;

        attempts.set(key, count);

        /*
         * Premier essai raté :
         * on laisse l'élève réessayer.
         */

        if (count < 2) return;

        updateInstructions();

        const message =
            explanation(detail, level, gameNow());

        const detailNode =
            $("pyt-help-detail");

        if (detailNode) {
            detailNode.innerHTML =
                "<strong>Pourquoi ça ne marche pas ?</strong>" +
                '<div style="margin-top:6px"></div>' +
                message;

            detailNode.hidden = false;

            /*
             * Sur téléphone, on descend dans
             * le panneau pour montrer l'indice.
             */

            const panel =
                detailNode.closest(".mission-panel");

            if (panel) {
                panel.scrollTop =
                    panel.scrollHeight;
            }
        }

        if (
            typeof window.pytApp?.showThought ===
            "function"
        ) {
            window.pytApp.showThought(
                "Regarde l'explication sous la consigne : " +
                "elle indique ce qu'il faut corriger."
            );
        }
    }

    /* =====================================================
       DESSIN DE TOUTES LES CASES INFRANCHISSABLES
    ===================================================== */

    function drawMarkers(game) {
        const ctx = game?.ctx;
        const level = game?.levelData;

        if (
            !ctx ||
            !level ||
            typeof game.cellRect !== "function"
        ) {
            return;
        }

        const width =
            Math.floor(Number(game.mapWidth) || 0);

        const height =
            Math.floor(Number(game.mapHeight) || 0);

        if (!width || !height) return;

        /*
         * Murs déclarés dans le niveau.
         * On ne modifie pas cette liste.
         */

        const walls = new Set(
            (game.getBlockedCells?.() || [])
                .map(value => {
                    const point = coord(value);
                    return `${point.x},${point.y}`;
                })
        );

        /*
         * Objets présents dans le niveau.
         * Certains sont solides, d'autres
         * peuvent être traversés ou poussés.
         */

        const objects =
            game.executing &&
            Array.isArray(game.visualObjects)
                ? game.visualObjects
                : game.logicalObjects || [];

        ctx.save();

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";

        if (ctx.setLineDash) {
            ctx.setLineDash([]);
        }

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {

                const wall =
                    walls.has(`${x},${y}`);

                const occupants =
                    objects.filter(object =>
                        !object.hidden &&
                        Number(object.x) === x &&
                        Number(object.y) === y
                    );

                /*
                 * On respecte les mêmes catégories
                 * d'objets que le moteur.
                 */

                const solid =
                    occupants.some(object => {
                        const type =
                            typeof game.normalize ===
                            "function"
                                ? game.normalize(
                                    object.type ??
                                    object.id
                                )
                                : String(
                                    object.type ??
                                    object.id ??
                                    ""
                                ).toLowerCase();

                        return (
                            object.solid === true &&
                            !game.isPushableObject?.(object) &&
                            !game.isAutoPickupObject?.(object) &&
                            !game.isButtonType?.(type) &&
                            !game.isDoorType?.(type) &&
                            !game.isDirtyType?.(type) &&
                            !game.isChargerType?.(type)
                        );
                    });

                const pushable =
                    occupants.some(object =>
                        game.isPushableObject?.(object)
                    );

                if (
                    !wall &&
                    !solid &&
                    !pushable
                ) {
                    continue;
                }

                const cell =
                    game.cellRect(x, y);

                if (
                    !Number.isFinite(cell.x) ||
                    !Number.isFinite(cell.y) ||
                    !(cell.size > 0)
                ) {
                    continue;
                }

                const size = cell.size;
                const padding =
                    Math.max(1, size * 0.026);

                const left =
                    cell.x + padding;

                const top =
                    cell.y + padding;

                const side =
                    size - padding * 2;

                ctx.save();

                if (
                    pushable &&
                    !wall &&
                    !solid
                ) {
                    /*
                     * Caisse déplaçable :
                     * contour jaune, pas rouge.
                     */

                    ctx.strokeStyle =
                        "#ffe06c";

                    ctx.lineWidth =
                        Math.max(
                            3,
                            size * 0.075
                        );

                    ctx.strokeRect(
                        left,
                        top,
                        side,
                        side
                    );
                } else {
                    /*
                     * La case interdite entière
                     * est remplie de bordeaux.
                     */

                    ctx.fillStyle =
                        "#591222";

                    ctx.fillRect(
                        left,
                        top,
                        side,
                        side
                    );

                    ctx.strokeStyle =
                        "#20040c";

                    ctx.lineWidth =
                        Math.max(
                            2,
                            size * 0.045
                        );

                    ctx.strokeRect(
                        left,
                        top,
                        side,
                        side
                    );

                    /*
                     * Croix rouge bien visible.
                     */

                    ctx.strokeStyle =
                        "#ff6577";

                    ctx.lineWidth =
                        Math.max(
                            3,
                            size * 0.09
                        );

                    ctx.lineCap =
                        "round";

                    ctx.beginPath();

                    ctx.moveTo(
                        cell.x + size * 0.20,
                        cell.y + size * 0.20
                    );

                    ctx.lineTo(
                        cell.x + size * 0.80,
                        cell.y + size * 0.80
                    );

                    ctx.moveTo(
                        cell.x + size * 0.80,
                        cell.y + size * 0.20
                    );

                    ctx.lineTo(
                        cell.x + size * 0.20,
                        cell.y + size * 0.80
                    );

                    ctx.stroke();
                }

                ctx.restore();
            }
        }

        /* =================================================
           NUMÉROS DES ÉTAPES OBLIGATOIRES
        ================================================= */

        const points =
            checkpoints(level);

        for (
            let index = 0;
            index < points.length;
            index++
        ) {
            const point =
                points[index];

            if (
                point.x < 0 ||
                point.x >= width ||
                point.y < 0 ||
                point.y >= height
            ) {
                continue;
            }

            const cell =
                game.cellRect(
                    point.x,
                    point.y
                );

            const size = cell.size;

            const centerX =
                cell.x + size * 0.26;

            const centerY =
                cell.y + size * 0.25;

            const radius =
                size * 0.18;

            ctx.save();

            ctx.beginPath();

            ctx.arc(
                centerX,
                centerY,
                radius,
                0,
                Math.PI * 2
            );

            /*
             * Jaune = étape obligatoire.
             * Vert = arrivée.
             */

            ctx.fillStyle =
                index === points.length - 1
                    ? "#76c87d"
                    : "#ffe281";

            ctx.fill();

            ctx.strokeStyle =
                "#1a1624";

            ctx.lineWidth =
                Math.max(
                    2,
                    size * 0.04
                );

            ctx.stroke();

            ctx.fillStyle =
                "#181524";

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";

            ctx.font =
                `bold ${Math.max(
                    12,
                    Math.round(size * 0.23)
                )}px monospace`;

            ctx.fillText(
                index === points.length - 1
                    ? "✓"
                    : String(index + 1),
                centerX,
                centerY + 1
            );

            ctx.restore();
        }

        ctx.restore();
    }

    /* =====================================================
       AJOUTER LE DESSIN À LA FIN DU RENDU

       Cela évite que des objets ou des décors
       cachent les cases rouges.
    ===================================================== */

    function installRender() {
        const game = gameNow();

        if (
            !game ||
            game.__pytTeachingMarkers ||
            typeof game.render !== "function"
        ) {
            return;
        }

        const originalRender =
            game.render;

        game.render = function(...args) {
            const result =
                originalRender.apply(
                    this,
                    args
                );

            drawMarkers(this);

            return result;
        };

        game.__pytTeachingMarkers =
            true;

        game.render();
    }

    /* =====================================================
       DÉMARRAGE
    ===================================================== */

    function start() {
        createUI();

        installRender();

        updateInstructions();

        window.addEventListener(
            "pyt:load-level",
            () => {
                requestAnimationFrame(() => {
                    installRender();
                    updateInstructions();
                });
            }
        );

        window.addEventListener(
            "pyt:level-opened",
            () => {
                requestAnimationFrame(() => {
                    installRender();
                    updateInstructions();
                });
            }
        );

        window.addEventListener(
            "pyt:level-failed",
            event => {
                onFailure(
                    event.detail || {}
                );
            }
        );

        window.addEventListener(
            "pyt:level-complete",
            () => {
                const detail =
                    $("pyt-help-detail");

                if (detail) {
                    detail.hidden = true;
                }
            }
        );
    }

    if (
        document.readyState === "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            start,
            { once: true }
        );
    } else {
        start();
    }
})();
