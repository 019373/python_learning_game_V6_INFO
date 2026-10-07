"use strict";

/* =========================================================
   PYT
   ui.js

   Interface générale :
   - carte de la maison dessinée en code
   - progression
   - chapitres
   - niveaux
   - cours
   - aide de Pyt
   - gestion des erreurs
   - retour au cours sans perdre le code
========================================================= */


class PytUI {

    constructor() {

        this.progress = {
            completed: {}
        };

        this.currentLevelData = null;

        this.loadedLevelKey = null;

        this.failureCounts = {};

        this.reviewMode = false;

        this.reviewContext = null;

        this.firstMapHintShown = false;

        this.mapCanvas = null;

        this.mapCtx = null;

        this.mapAnimationFrame = null;

        this.init();
    }



    /* =====================================================
       INITIALISATION
    ===================================================== */

    init() {

        this.loadProgress();

        this.bindEvents();

        this.prepareEditor();

        this.prepareHouseMap();

        window.setTimeout(
            () => {

                this.refresh();

            },
            0
        );
    }



    /* =====================================================
       EVENTS
    ===================================================== */

    bindEvents() {

        window.addEventListener(
            "pyt:app-ready",
            () => {

                this.refresh();
            }
        );


        window.addEventListener(
            "pyt:map-open",
            () => {

                this.renderMap();

                this.showFirstMapHint();
            }
        );


        window.addEventListener(
            "pyt:course-open",
            () => {

                this.renderCourse();
            }
        );


        window.addEventListener(
            "pyt:chapter-change",
            () => {

                this.renderMap();

                this.renderCourse();
            }
        );


        window.addEventListener(
            "pyt:chapter-request",
            event => {

                this.handleChapterRequest(
                    event
                );
            }
        );


        window.addEventListener(
            "pyt:level-select",
            event => {

                const detail =
                    event.detail || {};


                this.loadLevel(
                    detail.chapter,
                    detail.level
                );
            }
        );


        window.addEventListener(
            "pyt:run-code",
            () => {

                this.setExecuting(
                    true
                );
            }
        );


        window.addEventListener(
            "pyt:execution-result",
            event => {

                this.handleExecutionResult(
                    event.detail || {}
                );
            }
        );


        window.addEventListener(
            "pyt:robot-thought",
            event => {

                window.pytApp?.showThought(
                    event.detail?.message
                );
            }
        );


        window.addEventListener(
            "pyt:code-error-line",
            event => {

                this.renderCodeError(
                    Number(
                        event.detail?.line
                    )
                );
            }
        );


        window.addEventListener(
            "pyt:restart-level",
            () => {

                this.handleRestart();
            }
        );


        window.addEventListener(
            "resize",
            () => {

                this.resizeHouseMap();
            }
        );


        const courseButton =
            document.getElementById(
                "course-map-button"
            );


        if (courseButton) {

            courseButton.addEventListener(
                "click",
                event => {

                    if (
                        !this.reviewMode
                    ) {

                        return;
                    }


                    event.preventDefault();

                    event.stopImmediatePropagation();

                    this.returnFromTheory();

                },
                true
            );
        }
    }



    /* =====================================================
       RAFRAÎCHISSEMENT
    ===================================================== */

    refresh() {

        if (
            !window.pytApp
        ) {

            return;
        }


        this.renderMap();

        this.renderCourse();

        this.resizeHouseMap();
    }



    /* =====================================================
       DONNÉES
    ===================================================== */

    getDataSource() {

        const sources = [

            window.PYT_LEVELS,

            window.PYT_GAME_DATA,

            window.GAME_LEVELS,

            window.LEVELS,

            window.levels
        ];


        for (
            const source
            of sources
        ) {

            if (source) {

                return source;
            }
        }


        return null;
    }



    getChapters() {

        const source =
            this.getDataSource();


        if (
            !source
        ) {

            return [];
        }


        if (
            Array.isArray(
                source.chapters
            )
        ) {

            return source.chapters;
        }


        if (
            Array.isArray(
                source
            )
        ) {

            return source;
        }


        return [];
    }



    getChapterData(
        chapterNumber
    ) {

        const chapters =
            this.getChapters();


        const chapter =
            chapters.find(
                (
                    item,
                    index
                ) => {

                    const number =
                        Number(
                            item.chapter ??
                            item.number ??
                            item.id ??
                            index + 1
                        );


                    return (
                        number ===
                        Number(
                            chapterNumber
                        )
                    );
                }
            );


        if (
            chapter
        ) {

            return chapter;
        }


        return {

            chapter:
                chapterNumber,

            title:
                `Chapitre ${chapterNumber}`,

            subtitle:
                "",

            room:
                "",

            theory:
                [],

            levels:
                []
        };
    }



    getLevelsForChapter(
        chapterNumber
    ) {

        const chapter =
            this.getChapterData(
                chapterNumber
            );


        if (
            Array.isArray(
                chapter.levels
            )
        ) {

            return chapter.levels;
        }


        return [];
    }



    getLevelData(
        chapterNumber,
        levelNumber
    ) {

        const levels =
            this.getLevelsForChapter(
                chapterNumber
            );


        const level =
            levels.find(
                (
                    item,
                    index
                ) => {

                    const number =
                        Number(
                            item.level ??
                            item.number ??
                            item.id ??
                            index + 1
                        );


                    return (
                        number ===
                        Number(
                            levelNumber
                        )
                    );
                }
            );


        if (
            level
        ) {

            return {

                ...level,

                chapter:
                    Number(
                        chapterNumber
                    ),

                level:
                    Number(
                        levelNumber
                    )
            };
        }


        return {

            chapter:
                Number(
                    chapterNumber
                ),

            level:
                Number(
                    levelNumber
                ),

            title:
                `Exercice ${levelNumber}`,

            instruction:
                "Termine la mission.",

            difficulty:
                "Facile",

            room:
                this.getChapterData(
                    chapterNumber
                ).room,

            starterCode:
                ""
        };
    }



    /* =====================================================
       CARTE GÉNÉRALE
    ===================================================== */

    prepareHouseMap() {

        const decoration =
            document.getElementById(
                "map-decoration"
            );


        if (
            !decoration
        ) {

            return;
        }


        /*
        Plus aucune image de fond externe.
        */

        decoration.style.backgroundImage =
            "none";


        decoration.style.position =
            "absolute";

        decoration.style.inset =
            "0";

        decoration.style.pointerEvents =
            "none";

        decoration.style.overflow =
            "hidden";


        let canvas =
            document.getElementById(
                "house-map-canvas"
            );


        if (
            !canvas
        ) {

            canvas =
                document.createElement(
                    "canvas"
                );


            canvas.id =
                "house-map-canvas";


            canvas.style.position =
                "absolute";

            canvas.style.inset =
                "0";

            canvas.style.width =
                "100%";

            canvas.style.height =
                "100%";

            canvas.style.pointerEvents =
                "none";

            canvas.style.imageRendering =
                "pixelated";


            decoration.appendChild(
                canvas
            );
        }


        this.mapCanvas =
            canvas;


        this.mapCtx =
            canvas.getContext(
                "2d"
            );


        this.mapCtx.imageSmoothingEnabled =
            false;


        this.resizeHouseMap();
    }



    resizeHouseMap() {

        if (
            !this.mapCanvas
        ) {

            return;
        }


        const parent =
            this.mapCanvas.parentElement;


        if (
            !parent
        ) {

            return;
        }


        const rect =
            parent.getBoundingClientRect();


        const width =
            Math.max(
                1,
                Math.round(
                    rect.width
                )
            );


        const height =
            Math.max(
                1,
                Math.round(
                    rect.height
                )
            );


        if (
            this.mapCanvas.width !==
            width
        ) {

            this.mapCanvas.width =
                width;
        }


        if (
            this.mapCanvas.height !==
            height
        ) {

            this.mapCanvas.height =
                height;
        }


        this.drawHouseMap();
    }



    drawHouseMap() {

        const ctx =
            this.mapCtx;


        const canvas =
            this.mapCanvas;


        if (
            !ctx ||
            !canvas
        ) {

            return;
        }


        const width =
            canvas.width;


        const height =
            canvas.height;


        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        /*
        Fond général.
        */

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                height
            );


        gradient.addColorStop(
            0,
            "#8bb67c"
        );


        gradient.addColorStop(
            1,
            "#577d52"
        );


        ctx.fillStyle =
            gradient;


        ctx.fillRect(
            0,
            0,
            width,
            height
        );


        /*
        Petites variations d'herbe.
        */

        this.drawMapGrassNoise(
            ctx,
            width,
            height
        );


        const margin =
            Math.max(
                20,
                width *
                0.04
            );


        const gardenWidth =
            width *
            0.27;


        const houseX =
            margin;


        const houseY =
            margin;


        const houseWidth =
            width -
            gardenWidth -
            margin *
            2;


        const houseHeight =
            height -
            margin *
            2;


        this.drawHouseBuilding(
            ctx,
            houseX,
            houseY,
            houseWidth,
            houseHeight
        );


        this.drawGarden(
            ctx,
            houseX +
                houseWidth +
                margin *
                0.45,
            houseY,
            gardenWidth,
            houseHeight
        );


        this.drawMapChapterMarker(
            ctx,
            houseX,
            houseY,
            houseWidth,
            houseHeight
        );
    }



    drawMapGrassNoise(
        ctx,
        width,
        height
    ) {

        ctx.save();


        ctx.globalAlpha =
            0.16;


        ctx.fillStyle =
            "#315d38";


        const amount =
            Math.floor(
                width *
                height /
                10000
            );


        for (
            let i = 0;
            i < amount;
            i += 1
        ) {

            const x =
                (
                    i *
                    73
                ) %
                width;


            const y =
                (
                    i *
                    131
                ) %
                height;


            ctx.fillRect(
                x,
                y,
                2,
                5
            );
        }


        ctx.restore();
    }



    drawHouseBuilding(
        ctx,
        x,
        y,
        width,
        height
    ) {

        /*
        Ombre maison.
        */

        ctx.fillStyle =
            "rgba(0,0,0,0.28)";


        ctx.fillRect(
            x + 12,
            y + 12,
            width,
            height
        );


        /*
        Coque extérieure.
        */

        ctx.fillStyle =
            "#3c3b3b";


        ctx.fillRect(
            x,
            y,
            width,
            height
        );


        const wall =
            Math.max(
                7,
                width *
                0.012
            );


        const innerX =
            x + wall;


        const innerY =
            y + wall;


        const innerWidth =
            width -
            wall * 2;


        const innerHeight =
            height -
            wall * 2;


        /*
        Distribution de la maison.

        3 colonnes × 3 rangées.
        */

        const col1 =
            innerWidth *
            0.31;


        const col2 =
            innerWidth *
            0.36;


        const col3 =
            innerWidth -
            col1 -
            col2;


        const row1 =
            innerHeight *
            0.33;


        const row2 =
            innerHeight *
            0.34;


        const row3 =
            innerHeight -
            row1 -
            row2;


        /*
        RANGÉE HAUTE
        */

        this.drawMapRoom(
            ctx,
            innerX,
            innerY,
            col1,
            row1,
            "chambre",
            4
        );


        this.drawMapRoom(
            ctx,
            innerX +
                col1,
            innerY,
            col2,
            row1,
            "salon",
            3
        );


        this.drawMapRoom(
            ctx,
            innerX +
                col1 +
                col2,
            innerY,
            col3,
            row1,
            "balcon",
            7
        );


        /*
        RANGÉE MILIEU
        */

        this.drawMapRoom(
            ctx,
            innerX,
            innerY +
                row1,
            col1,
            row2,
            "garage",
            5
        );


        this.drawMapRoom(
            ctx,
            innerX +
                col1,
            innerY +
                row1,
            col2,
            row2,
            "entree",
            1
        );


        this.drawMapRoom(
            ctx,
            innerX +
                col1 +
                col2,
            innerY +
                row1,
            col3,
            row2,
            "cuisine",
            2
        );


        /*
        RANGÉE BASSE
        */

        this.drawMapRoom(
            ctx,
            innerX,
            innerY +
                row1 +
                row2,
            col1,
            row3,
            "cave_a_vin",
            6
        );


        this.drawMapRoom(
            ctx,
            innerX +
                col1,
            innerY +
                row1 +
                row2,
            col2,
            row3,
            "couloir",
            null
        );


        this.drawMapRoom(
            ctx,
            innerX +
                col1 +
                col2,
            innerY +
                row1 +
                row2,
            col3,
            row3,
            "toilette",
            8
        );


        this.drawMapDoors(
            ctx,
            innerX,
            innerY,
            innerWidth,
            innerHeight,
            col1,
            col2,
            row1,
            row2
        );
    }



    drawMapRoom(
        ctx,
        x,
        y,
        width,
        height,
        room,
        chapter
    ) {

        const normalized =
            this.normalize(
                room
            );


        const colors = {

            entree:
                "#c29568",

            cuisine:
                "#c9c7be",

            salon:
                "#b68a68",

            chambre:
                "#9b7b83",

            garage:
                "#73777c",

            cave_a_vin:
                "#75645e",

            balcon:
                "#aaa08d",

            toilette:
                "#b9cbcc",

            couloir:
                "#b28a62"
        };


        ctx.fillStyle =
            colors[normalized] ||
            "#a78c73";


        ctx.fillRect(
            x,
            y,
            width,
            height
        );


        /*
        Sol texturé.
        */

        this.drawRoomFloorPattern(
            ctx,
            normalized,
            x,
            y,
            width,
            height
        );


        ctx.strokeStyle =
            "#45413e";


        ctx.lineWidth =
            Math.max(
                3,
                width *
                0.014
            );


        ctx.strokeRect(
            x,
            y,
            width,
            height
        );


        this.drawMapRoomFurniture(
            ctx,
            normalized,
            x,
            y,
            width,
            height
        );


        if (
            chapter
        ) {

            this.drawRoomLabel(
                ctx,
                normalized,
                chapter,
                x,
                y,
                width,
                height
            );
        }
    }



    drawRoomFloorPattern(
        ctx,
        room,
        x,
        y,
        width,
        height
    ) {

        ctx.save();

        ctx.globalAlpha =
            0.14;


        if (
            room === "cuisine" ||
            room === "toilette"
        ) {

            ctx.strokeStyle =
                "#444";


            ctx.lineWidth =
                1;


            const size =
                Math.max(
                    14,
                    Math.min(
                        width,
                        height
                    ) /
                    4
                );


            for (
                let px = x;
                px < x + width;
                px += size
            ) {

                ctx.beginPath();

                ctx.moveTo(
                    px,
                    y
                );

                ctx.lineTo(
                    px,
                    y + height
                );

                ctx.stroke();
            }


            for (
                let py = y;
                py < y + height;
                py += size
            ) {

                ctx.beginPath();

                ctx.moveTo(
                    x,
                    py
                );

                ctx.lineTo(
                    x + width,
                    py
                );

                ctx.stroke();
            }

        } else {

            ctx.strokeStyle =
                "#553c2c";


            const spacing =
                Math.max(
                    8,
                    height /
                    8
                );


            for (
                let py =
                    y +
                    spacing;

                py <
                    y +
                    height;

                py +=
                    spacing
            ) {

                ctx.beginPath();

                ctx.moveTo(
                    x,
                    py
                );

                ctx.lineTo(
                    x + width,
                    py
                );

                ctx.stroke();
            }
        }


        ctx.restore();
    }



    drawMapRoomFurniture(
        ctx,
        room,
        x,
        y,
        width,
        height
    ) {

        if (
            !window.PYTArt
        ) {

            return;
        }


        const size =
            Math.min(
                width,
                height
            ) *
            0.34;


        const draw =
            (
                type,
                px,
                py,
                multiplier = 1
            ) => {

                window.PYTArt.draw(
                    ctx,
                    type,
                    px,
                    py,
                    size *
                    multiplier
                );
            };


        switch (
            room
        ) {

            case "entree":

                draw(
                    "tapis",
                    x +
                        width *
                        0.37,
                    y +
                        height *
                        0.53,
                    0.9
                );


                draw(
                    "plante",
                    x +
                        width *
                        0.04,
                    y +
                        height *
                        0.08,
                    0.7
                );

                break;


            case "cuisine":

                draw(
                    "frigo",
                    x +
                        width *
                        0.68,
                    y +
                        height *
                        0.08,
                    0.85
                );


                draw(
                    "evier",
                    x +
                        width *
                        0.05,
                    y +
                        height *
                        0.08,
                    0.9
                );


                draw(
                    "table",
                    x +
                        width *
                        0.35,
                    y +
                        height *
                        0.49,
                    1.0
                );

                break;


            case "salon":

                draw(
                    "canape",
                    x +
                        width *
                        0.07,
                    y +
                        height *
                        0.16,
                    1.15
                );


                draw(
                    "table",
                    x +
                        width *
                        0.4,
                    y +
                        height *
                        0.52,
                    0.75
                );


                draw(
                    "bibliotheque",
                    x +
                        width *
                        0.71,
                    y +
                        height *
                        0.12,
                    0.85
                );

                break;


            case "chambre":

                draw(
                    "lit",
                    x +
                        width *
                        0.08,
                    y +
                        height *
                        0.12,
                    1.15
                );


                draw(
                    "plante",
                    x +
                        width *
                        0.7,
                    y +
                        height *
                        0.52,
                    0.7
                );

                break;


            case "garage":

                draw(
                    "voiture",
                    x +
                        width *
                        0.22,
                    y +
                        height *
                        0.08,
                    1.2
                );


                draw(
                    "boite_outils",
                    x +
                        width *
                        0.66,
                    y +
                        height *
                        0.58,
                    0.65
                );

                break;


            case "cave_a_vin":

                draw(
                    "casier_vin",
                    x +
                        width *
                        0.08,
                    y +
                        height *
                        0.11,
                    0.95
                );


                draw(
                    "tonneau",
                    x +
                        width *
                        0.62,
                    y +
                        height *
                        0.49,
                    0.68
                );

                break;


            case "balcon":

                draw(
                    "table",
                    x +
                        width *
                        0.28,
                    y +
                        height *
                        0.35,
                    0.8
                );


                draw(
                    "plante",
                    x +
                        width *
                        0.63,
                    y +
                        height *
                        0.12,
                    0.7
                );

                break;


            case "toilette":

                draw(
                    "toilette",
                    x +
                        width *
                        0.17,
                    y +
                        height *
                        0.18,
                    0.9
                );


                draw(
                    "lavabo",
                    x +
                        width *
                        0.56,
                    y +
                        height *
                        0.2,
                    0.72
                );

                break;
        }
    }



    drawRoomLabel(
        ctx,
        room,
        chapter,
        x,
        y,
        width,
        height
    ) {

        const names = {

            entree:
                "Entrée",

            cuisine:
                "Cuisine",

            salon:
                "Salon",

            chambre:
                "Chambre",

            garage:
                "Garage",

            cave_a_vin:
                "Cave",

            balcon:
                "Balcon",

            toilette:
                "Salle d’eau"
        };


        ctx.save();


        ctx.fillStyle =
            "rgba(15,15,17,0.74)";


        const boxWidth =
            Math.min(
                width *
                0.76,
                130
            );


        const boxHeight =
            Math.max(
                23,
                height *
                0.15
            );


        const bx =
            x +
            width *
            0.5 -
            boxWidth *
            0.5;


        const by =
            y +
            height -
            boxHeight -
            6;


        ctx.fillRect(
            bx,
            by,
            boxWidth,
            boxHeight
        );


        ctx.fillStyle =
            "#f7f5ef";


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.font =
            `600 ${Math.max(
                9,
                Math.min(
                    13,
                    width *
                    0.055
                )
            )}px sans-serif`;


        ctx.fillText(
            `${chapter}. ${names[room] || room}`,
            x +
                width *
                0.5,
            by +
                boxHeight *
                0.52
        );


        ctx.restore();
    }



    drawMapDoors(
        ctx,
        x,
        y,
        width,
        height,
        col1,
        col2,
        row1,
        row2
    ) {

        ctx.save();


        ctx.fillStyle =
            "#d8c2a2";


        const doorWidth =
            Math.max(
                14,
                width *
                0.025
            );


        const wall =
            Math.max(
                5,
                width *
                0.01
            );


        const verticals = [

            x + col1,

            x + col1 + col2
        ];


        const horizontals = [

            y + row1,

            y + row1 + row2
        ];


        verticals.forEach(
            px => {

                ctx.fillRect(
                    px -
                        wall,
                    y +
                        height *
                        0.45 -
                        doorWidth /
                        2,
                    wall *
                        2,
                    doorWidth
                );
            }
        );


        horizontals.forEach(
            py => {

                ctx.fillRect(
                    x +
                        width *
                        0.49 -
                        doorWidth /
                        2,
                    py -
                        wall,
                    doorWidth,
                    wall *
                        2
                );
            }
        );


        ctx.restore();
    }



    drawGarden(
        ctx,
        x,
        y,
        width,
        height
    ) {

        /*
        Chemin.
        */

        ctx.fillStyle =
            "#9e9486";


        ctx.fillRect(
            x +
                width *
                0.05,
            y +
                height *
                0.45,
            width *
                0.42,
            height *
                0.13
        );


        if (
            window.PYTArt
        ) {

            const tile =
                Math.min(
                    width,
                    height
                ) *
                0.18;


            window.PYTArt.draw(
                ctx,
                "arbre",
                x +
                    width *
                    0.03,
                y +
                    height *
                    0.05,
                tile *
                    1.15
            );


            window.PYTArt.draw(
                ctx,
                "arbre",
                x +
                    width *
                    0.68,
                y +
                    height *
                    0.08,
                tile
            );


            window.PYTArt.draw(
                ctx,
                "fleurs",
                x +
                    width *
                    0.05,
                y +
                    height *
                    0.72,
                tile *
                    0.9
            );


            window.PYTArt.draw(
                ctx,
                "buisson",
                x +
                    width *
                    0.7,
                y +
                    height *
                    0.72,
                tile
            );


            /*
            Piscine plus grande que les autres objets.
            */

            const poolSize =
                Math.min(
                    width *
                    0.72,
                    height *
                    0.38
                );


            window.PYTArt.draw(
                ctx,
                "piscine",
                x +
                    width *
                    0.16,
                y +
                    height *
                    0.2,
                poolSize,
                {
                    animate:
                        true
                }
            );


            window.PYTArt.draw(
                ctx,
                "transat",
                x +
                    width *
                    0.02,
                y +
                    height *
                    0.57,
                tile *
                    0.8
            );


            window.PYTArt.draw(
                ctx,
                "transat",
                x +
                    width *
                    0.34,
                y +
                    height *
                    0.61,
                tile *
                    0.8
            );


            window.PYTArt.draw(
                ctx,
                "bouee",
                x +
                    width *
                    0.57,
                y +
                    height *
                    0.31,
                tile *
                    0.55
            );


            window.PYTArt.draw(
                ctx,
                "fontaine",
                x +
                    width *
                    0.67,
                y +
                    height *
                    0.5,
                tile *
                    0.85
            );
        }


        /*
        Chapitre 9.
        */

        ctx.save();


        ctx.fillStyle =
            "rgba(15,15,17,0.78)";


        ctx.fillRect(
            x +
                width *
                0.2,
            y +
                height *
                0.85,
            width *
                0.62,
            Math.max(
                25,
                height *
                0.08
            )
        );


        ctx.fillStyle =
            "#f7f5ef";


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.font =
            `600 ${Math.max(
                10,
                Math.min(
                    14,
                    width *
                    0.08
                )
            )}px sans-serif`;


        ctx.fillText(
            "9. Jardin",
            x +
                width *
                0.51,
            y +
                height *
                0.89
        );


        ctx.restore();
    }



    drawMapChapterMarker(
        ctx,
        houseX,
        houseY,
        houseWidth,
        houseHeight
    ) {

        const current =
            Number(
                window.pytApp
                    ?.currentChapter ||
                1
            );


        const positions = {

            1: [
                0.49,
                0.49
            ],

            2: [
                0.84,
                0.49
            ],

            3: [
                0.49,
                0.16
            ],

            4: [
                0.15,
                0.16
            ],

            5: [
                0.15,
                0.49
            ],

            6: [
                0.15,
                0.84
            ],

            7: [
                0.84,
                0.16
            ],

            8: [
                0.84,
                0.84
            ]
        };


        /*
        Chapitre 9 est dans le jardin.
        Pas de marqueur sur la maison.
        */

        if (
            current ===
            9
        ) {

            return;
        }


        const position =
            positions[current];


        if (
            !position
        ) {

            return;
        }


        const x =
            houseX +
            houseWidth *
            position[0];


        const y =
            houseY +
            houseHeight *
            position[1];


        const radius =
            Math.max(
                10,
                Math.min(
                    houseWidth,
                    houseHeight
                ) *
                0.025
            );


        ctx.save();


        ctx.shadowColor =
            "#fff4a8";


        ctx.shadowBlur =
            radius *
            1.2;


        ctx.strokeStyle =
            "#fff4a8";


        ctx.lineWidth =
            Math.max(
                3,
                radius *
                0.25
            );


        ctx.beginPath();


        ctx.arc(
            x,
            y,
            radius,
            0,
            Math.PI *
            2
        );


        ctx.stroke();


        ctx.restore();
    }



    /* =====================================================
       CARTE / NIVEAUX
    ===================================================== */

    renderMap() {

        const app =
            window.pytApp;


        if (
            !app
        ) {

            return;
        }


        const chapterNumber =
            Number(
                app.currentChapter ||
                1
            );


        const chapter =
            this.getChapterData(
                chapterNumber
            );


        this.setText(
            "map-title",
            `Chapitre ${chapterNumber} · ${chapter.title || ""}`
        );


        this.setText(
            "map-subtitle",
            `Clique sur un exercice pour le lancer · ${chapter.room || ""}`
        );


        this.renderLevelNodes(
            chapterNumber
        );


        this.renderChapterButtons(
            chapterNumber
        );


        this.resizeHouseMap();
    }



    renderLevelNodes(
        chapterNumber
    ) {

        const levels =
            this.getLevelsForChapter(
                chapterNumber
            );


        for (
            let levelNumber = 1;
            levelNumber <= 3;
            levelNumber += 1
        ) {

            const node =
                document.getElementById(
                    `level-node-${levelNumber}`
                );


            if (
                !node
            ) {

                continue;
            }


            const completed =
                this.isLevelCompleted(
                    chapterNumber,
                    levelNumber
                );


            const unlocked =
                this.isLevelUnlocked(
                    chapterNumber,
                    levelNumber
                );


            node.disabled =
                !unlocked;


            node.classList.toggle(
                "locked",
                !unlocked
            );


            node.classList.toggle(
                "completed",
                completed
            );


            node.classList.toggle(
                "current",
                unlocked &&
                !completed &&
                Number(
                    window.pytApp
                        ?.currentLevel
                ) ===
                    levelNumber
            );


            const numberElement =
                node.querySelector(
                    ".level-node-number"
                );


            if (
                numberElement
            ) {

                numberElement.textContent =
                    String(
                        levelNumber
                    );
            }


            const stateElement =
                node.querySelector(
                    ".level-node-state"
                );


            if (
                stateElement
            ) {

                if (
                    completed
                ) {

                    stateElement.textContent =
                        "Terminé";

                } else if (
                    !unlocked
                ) {

                    stateElement.textContent =
                        "Verrouillé";

                } else {

                    const level =
                        levels[
                            levelNumber -
                            1
                        ];


                    stateElement.textContent =
                        level?.difficulty ||
                        "Exercice";
                }
            }
        }
    }



    renderChapterButtons(
        chapterNumber
    ) {

        const previous =
            document.getElementById(
                "previous-chapter-button"
            );


        const next =
            document.getElementById(
                "next-chapter-button"
            );


        const indicator =
            document.getElementById(
                "map-chapter-indicator"
            );


        if (
            previous
        ) {

            previous.disabled =
                chapterNumber <=
                1;
        }


        if (
            next
        ) {

            const nextChapter =
                chapterNumber +
                1;


            next.disabled =
                nextChapter >
                    Number(
                        window.pytApp
                            ?.totalChapters ||
                        9
                    ) ||
                !this.isChapterUnlocked(
                    nextChapter
                );
        }


        if (
            indicator
        ) {

            indicator.textContent =
                `${chapterNumber} / ${window.pytApp?.totalChapters || 9}`;
        }
    }



    handleChapterRequest(
        event
    ) {

        const requested =
            Number(
                event.detail
                    ?.requestedChapter
            );


        if (
            this.isChapterUnlocked(
                requested
            )
        ) {

            return;
        }


        event.preventDefault();


        window.pytApp?.showGuide(
            "Ce chapitre est encore verrouillé. Termine d’abord le chapitre précédent."
        );
    }



    /* =====================================================
       COURS
    ===================================================== */

    renderCourse() {

        const app =
            window.pytApp;


        if (
            !app
        ) {

            return;
        }


        const chapterNumber =
            Number(
                app.currentChapter ||
                1
            );


        const chapter =
            this.getChapterData(
                chapterNumber
            );


        this.setText(
            "course-chapter-number",
            `Chapitre ${chapterNumber}`
        );


        this.setText(
            "course-title",
            chapter.title ||
            `Chapitre ${chapterNumber}`
        );


        this.setText(
            "course-subtitle",
            chapter.subtitle ||
            ""
        );


        const container =
            document.getElementById(
                "course-content"
            );


        if (
            container
        ) {

            container.innerHTML =
                "";


            this.renderTheoryContent(
                container,
                chapter.theory
            );
        }


        const button =
            document.getElementById(
                "course-map-button"
            );


        if (
            button
        ) {

            button.textContent =
                this.reviewMode
                    ? "Retour à l'exercice"
                    : "Voir la carte";
        }
    }



    renderTheoryContent(
        container,
        theory
    ) {

        if (
            !Array.isArray(
                theory
            )
        ) {

            return;
        }


        theory.forEach(
            section => {

                if (
                    typeof section ===
                    "string"
                ) {

                    const paragraph =
                        document.createElement(
                            "p"
                        );


                    paragraph.textContent =
                        section;


                    container.appendChild(
                        paragraph
                    );


                    return;
                }


                if (
                    section.title
                ) {

                    const title =
                        document.createElement(
                            "h2"
                        );


                    title.textContent =
                        section.title;


                    container.appendChild(
                        title
                    );
                }


                if (
                    section.body
                ) {

                    const texts =
                        Array.isArray(
                            section.body
                        )
                            ? section.body
                            : [
                                section.body
                            ];


                    texts.forEach(
                        text => {

                            const paragraph =
                                document.createElement(
                                    "p"
                                );


                            paragraph.textContent =
                                text;


                            container.appendChild(
                                paragraph
                            );
                        }
                    );
                }


                if (
                    section.code
                ) {

                    const pre =
                        document.createElement(
                            "pre"
                        );


                    const code =
                        document.createElement(
                            "code"
                        );


                    code.textContent =
                        section.code;


                    pre.appendChild(
                        code
                    );


                    container.appendChild(
                        pre
                    );
                }
            }
        );
    }



    /* =====================================================
       NIVEAU
    ===================================================== */

    loadLevel(
        chapterNumber,
        levelNumber
    ) {

        const chapter =
            Number(
                chapterNumber ||
                1
            );


        const level =
            Number(
                levelNumber ||
                1
            );


        const data =
            this.getLevelData(
                chapter,
                level
            );


        this.currentLevelData =
            data;


        const key =
            this.getLevelKey(
                chapter,
                level
            );


        if (
            this.loadedLevelKey !==
            key
        ) {

            const editor =
                document.getElementById(
                    "code-editor"
                );


            if (
                editor
            ) {

                editor.value =
                    data.starterCode ||
                    "";
            }


            this.loadedLevelKey =
                key;


            this.clearCodeError();
        }


        window.pytApp
            ?.setCurrentLevelData(
                data
            );


        this.setText(
            "game-status",
            "Prêt"
        );


        window.dispatchEvent(
            new CustomEvent(
                "pyt:load-level",
                {
                    detail: {

                        chapter,

                        level,

                        data
                    }
                }
            )
        );


        window.setTimeout(
            () => {

                window.pytApp?.showGuide(
                    data.guideMessage ||
                    data.instruction ||
                    "Lis la mission puis écris ton programme."
                );

            },
            120
        );
    }



    /* =====================================================
       EXÉCUTION
    ===================================================== */

    setExecuting(
        executing
    ) {

        const button =
            document.getElementById(
                "run-code-button"
            );


        if (
            button
        ) {

            button.disabled =
                Boolean(
                    executing
                );


            button.textContent =
                executing
                    ? "Exécution..."
                    : "Exécuter";
        }


        this.setText(
            "game-status",
            executing
                ? "Programme en cours..."
                : "Prêt"
        );
    }



    handleExecutionResult(
        result
    ) {

        this.setExecuting(
            false
        );


        this.renderConsoleResult(
            result
        );


        if (
            result.success ===
            true
        ) {

            this.handleSuccess(
                result
            );

        } else {

            this.handleFailure(
                result
            );
        }
    }



    renderConsoleResult(
        result
    ) {

        const output =
            document.getElementById(
                "console-output"
            );


        if (
            !output
        ) {

            return;
        }


        const lines =
            [];


        if (
            Array.isArray(
                result.output
            )
        ) {

            lines.push(
                ...result.output
            );

        } else if (
            typeof result.output ===
                "string"
        ) {

            lines.push(
                result.output
            );
        }


        if (
            result.error
        ) {

            lines.push(
                result.error
            );
        }


        output.textContent =
            lines
                .filter(
                    Boolean
                )
                .join(
                    "\n"
                );
    }



    /* =====================================================
       RÉUSSITE
    ===================================================== */

    handleSuccess(
        result
    ) {

        const app =
            window.pytApp;


        if (
            !app
        ) {

            return;
        }


        const chapter =
            Number(
                app.currentChapter
            );


        const level =
            Number(
                app.currentLevel
            );


        this.completeLevel(
            chapter,
            level
        );


        this.failureCounts[
            this.getLevelKey(
                chapter,
                level
            )
        ] =
            0;


        this.clearCodeError();

        app.hideThought();


        this.setText(
            "game-status",
            "Mission réussie"
        );


        const actions =
            [];


        if (
            level <
            3
        ) {

            actions.push({

                label:
                    "Exercice suivant",

                onClick:
                    () => {

                        app.hideGuide();

                        this.openNextLevel();
                    }
            });

        } else {

            actions.push({

                label:
                    "Retour à la carte",

                onClick:
                    () => {

                        app.hideGuide();

                        app.showMap();
                    }
            });
        }


        app.showGuide(
            result.message ||
            "Bien joué ! La mission est réussie.",
            actions
        );


        this.renderMap();
    }



    openNextLevel() {

        const app =
            window.pytApp;


        if (
            !app
        ) {

            return;
        }


        const next =
            Number(
                app.currentLevel
            ) +
            1;


        if (
            next <=
                3 &&
            this.isLevelUnlocked(
                app.currentChapter,
                next
            )
        ) {

            app.currentLevel =
                next;


            this.loadLevel(
                app.currentChapter,
                next
            );


            app.showGame();

            return;
        }


        app.showMap();
    }



    /* =====================================================
       ÉCHECS
    ===================================================== */

    handleFailure(
        result
    ) {

        const app =
            window.pytApp;


        if (
            !app
        ) {

            return;
        }


        const key =
            this.getLevelKey(
                app.currentChapter,
                app.currentLevel
            );


        this.failureCounts[key] =
            (
                this.failureCounts[key] ||
                0
            ) +
            1;


        const failures =
            this.failureCounts[key];


        this.setText(
            "game-status",
            "Mission non terminée"
        );


        const reason =
            String(
                result.reason ||
                ""
            )
                .toLowerCase();


        if (
            reason ===
                "wrong_destination" ||
            reason ===
                "wrong_position" ||
            result.wrongDestination ===
                true
        ) {

            app.showThought(
                "Ce n’est pas là que je voulais aller..."
            );

        } else {

            app.hideThought();
        }


        /*
        Premier échec :
        aucune ligne rouge.
        */

        if (
            failures ===
            1
        ) {

            this.clearCodeError();


            app.showGuide(
                result.firstAttemptMessage ||
                "Ça ne fonctionne pas encore. Tu peux revoir le cours avant de réessayer. Si ça bloque encore, je pourrai t’indiquer plus précisément où chercher.",
                [

                    {

                        label:
                            "Revoir le cours",

                        onClick:
                            () => {

                                this.openTheoryReview();
                            }
                    },

                    {

                        label:
                            "Réessayer",

                        onClick:
                            () => {

                                app.hideGuide();

                                app.openCodeWindow();
                            }
                    }
                ]
            );


            return;
        }


        /*
        Deuxième erreur et suivantes.
        */

        const errorLine =
            Number(
                result.errorLine ||
                result.line ||
                0
            );


        if (
            Number.isInteger(
                errorLine
            ) &&
            errorLine >
                0
        ) {

            app.showCodeError(
                errorLine
            );

        } else {

            this.clearCodeError();
        }


        app.showGuide(
            result.hint ||
            result.message ||
            (
                errorLine >
                    0
                    ? `Regarde plus attentivement la ligne ${errorLine}.`
                    : "Ton programme s’exécute, mais la mission n’est pas encore complètement réussie."
            ),
            [

                {

                    label:
                        "Modifier mon code",

                    onClick:
                        () => {

                            app.hideGuide();

                            app.openCodeWindow();
                        }
                },

                {

                    label:
                        "Revoir le cours",

                    onClick:
                        () => {

                            this.openTheoryReview();
                        }
                }
            ]
        );
    }



    /* =====================================================
       RETOUR AU COURS
    ===================================================== */

    openTheoryReview() {

        const app =
            window.pytApp;


        if (
            !app
        ) {

            return;
        }


        const editor =
            document.getElementById(
                "code-editor"
            );


        this.reviewContext = {

            chapter:
                app.currentChapter,

            level:
                app.currentLevel,

            code:
                editor
                    ? editor.value
                    : ""
        };


        this.reviewMode =
            true;


        app.hideGuide();

        app.showCourse();
    }



    returnFromTheory() {

        const app =
            window.pytApp;


        if (
            !app
        ) {

            return;
        }


        if (
            this.reviewContext
        ) {

            app.currentChapter =
                this.reviewContext
                    .chapter;


            app.currentLevel =
                this.reviewContext
                    .level;


            const editor =
                document.getElementById(
                    "code-editor"
                );


            if (
                editor
            ) {

                editor.value =
                    this.reviewContext
                        .code;
            }
        }


        this.reviewMode =
            false;


        this.reviewContext =
            null;


        this.renderCourse();

        app.showGame();


        window.setTimeout(
            () => {

                app.showGuide(
                    "Tu peux reprendre ton programme exactement là où tu l’avais laissé.",
                    [

                        {

                            label:
                                "Continuer",

                            onClick:
                                () => {

                                    app.hideGuide();

                                    app.openCodeWindow();
                                }
                        }
                    ]
                );

            },
            100
        );
    }



    /* =====================================================
       RESTART
    ===================================================== */

    handleRestart() {

        window.pytApp
            ?.hideThought();


        this.clearCodeError();


        this.setText(
            "game-status",
            "Niveau recommencé"
        );


        if (
            this.currentLevelData
        ) {

            window.dispatchEvent(
                new CustomEvent(
                    "pyt:reload-world",
                    {
                        detail: {

                            data:
                                this.currentLevelData
                        }
                    }
                )
            );
        }
    }



    /* =====================================================
       ÉDITEUR / ERREURS
    ===================================================== */

    prepareEditor() {

        const editor =
            document.getElementById(
                "code-editor"
            );


        const overlay =
            document.getElementById(
                "code-error-highlights"
            );


        if (
            !editor ||
            !overlay
        ) {

            return;
        }


        overlay.style.zIndex =
            "3";

        overlay.style.pointerEvents =
            "none";

        overlay.style.overflow =
            "hidden";


        editor.addEventListener(
            "scroll",
            () => {

                overlay.scrollTop =
                    editor.scrollTop;

                overlay.scrollLeft =
                    editor.scrollLeft;
            }
        );


        editor.addEventListener(
            "input",
            () => {

                const line =
                    Number(
                        editor.dataset
                            .errorLine
                    );


                if (
                    Number.isInteger(
                        line
                    ) &&
                    line >
                        0
                ) {

                    this.renderCodeError(
                        line
                    );
                }
            }
        );
    }



    renderCodeError(
        lineNumber
    ) {

        const editor =
            document.getElementById(
                "code-editor"
            );


        const overlay =
            document.getElementById(
                "code-error-highlights"
            );


        if (
            !editor ||
            !overlay ||
            !Number.isInteger(
                lineNumber
            ) ||
            lineNumber <=
                0
        ) {

            this.clearCodeError();

            return;
        }


        editor.dataset.errorLine =
            String(
                lineNumber
            );


        overlay.innerHTML =
            "";


        const lines =
            editor.value
                .replace(
                    /\t/g,
                    "    "
                )
                .split(
                    "\n"
                );


        lines.forEach(
            (
                line,
                index
            ) => {

                const span =
                    document.createElement(
                        "span"
                    );


                span.textContent =
                    line.length
                        ? line
                        : " ";


                if (
                    index +
                        1 ===
                    lineNumber
                ) {

                    span.classList.add(
                        "code-line-error"
                    );
                }


                overlay.appendChild(
                    span
                );


                if (
                    index <
                    lines.length -
                    1
                ) {

                    overlay.appendChild(
                        document.createTextNode(
                            "\n"
                        )
                    );
                }
            }
        );


        overlay.scrollTop =
            editor.scrollTop;

        overlay.scrollLeft =
            editor.scrollLeft;
    }



    clearCodeError() {

        const editor =
            document.getElementById(
                "code-editor"
            );


        const overlay =
            document.getElementById(
                "code-error-highlights"
            );


        if (
            editor
        ) {

            delete editor.dataset
                .errorLine;
        }


        if (
            overlay
        ) {

            overlay.innerHTML =
                "";
        }
    }



    /* =====================================================
       PROGRESSION
    ===================================================== */

    loadProgress() {

        try {

            const saved =
                localStorage.getItem(
                    "pyt-progress"
                );


            if (
                !saved
            ) {

                return;
            }


            const parsed =
                JSON.parse(
                    saved
                );


            if (
                parsed &&
                typeof parsed ===
                    "object"
            ) {

                this.progress = {

                    completed:
                        parsed.completed &&
                        typeof parsed.completed ===
                            "object"
                            ? parsed.completed
                            : {}
                };
            }

        } catch (
            error
        ) {

            console.warn(
                "Impossible de charger la progression PYT.",
                error
            );
        }
    }



    saveProgress() {

        try {

            localStorage.setItem(
                "pyt-progress",
                JSON.stringify(
                    this.progress
                )
            );

        } catch (
            error
        ) {

            console.warn(
                "Impossible d'enregistrer la progression PYT.",
                error
            );
        }
    }



    completeLevel(
        chapter,
        level
    ) {

        this.progress.completed[
            this.getLevelKey(
                chapter,
                level
            )
        ] =
            true;


        this.saveProgress();
    }



    isLevelCompleted(
        chapter,
        level
    ) {

        return Boolean(
            this.progress.completed[
                this.getLevelKey(
                    chapter,
                    level
                )
            ]
        );
    }



    isLevelUnlocked(
        chapter,
        level
    ) {

        const chapterNumber =
            Number(
                chapter
            );


        const levelNumber =
            Number(
                level
            );


        if (
            !this.isChapterUnlocked(
                chapterNumber
            )
        ) {

            return false;
        }


        if (
            levelNumber <=
            1
        ) {

            return true;
        }


        return this.isLevelCompleted(
            chapterNumber,
            levelNumber -
                1
        );
    }



    isChapterUnlocked(
        chapter
    ) {

        const chapterNumber =
            Number(
                chapter
            );


        if (
            chapterNumber <=
            1
        ) {

            return true;
        }


        const previous =
            chapterNumber -
            1;


        const levels =
            this.getLevelsForChapter(
                previous
            );


        const count =
            levels.length
                ? Math.min(
                    levels.length,
                    3
                )
                : 3;


        for (
            let level = 1;
            level <= count;
            level += 1
        ) {

            if (
                !this.isLevelCompleted(
                    previous,
                    level
                )
            ) {

                return false;
            }
        }


        return true;
    }



    getLevelKey(
        chapter,
        level
    ) {

        return (
            `${Number(chapter)}-${Number(level)}`
        );
    }



    /* =====================================================
       AIDE PREMIÈRE CARTE
    ===================================================== */

    showFirstMapHint() {

        if (
            this.firstMapHintShown
        ) {

            return;
        }


        let seen =
            false;


        try {

            seen =
                localStorage.getItem(
                    "pyt-map-help-seen"
                ) ===
                "1";

        } catch (
            error
        ) {

            seen =
                false;
        }


        if (
            seen
        ) {

            this.firstMapHintShown =
                true;

            return;
        }


        this.firstMapHintShown =
            true;


        window.setTimeout(
            () => {

                window.pytApp?.showGuide(
                    "Voici la maison. Chaque chapitre correspond à une pièce. Clique sur l’exercice 1 pour commencer."
                );


                try {

                    localStorage.setItem(
                        "pyt-map-help-seen",
                        "1"
                    );

                } catch (
                    error
                ) {

                    /*
                    localStorage indisponible.
                    */
                }

            },
            200
        );
    }



    /* =====================================================
       UTILITAIRES
    ===================================================== */

    setText(
        id,
        value
    ) {

        const element =
            document.getElementById(
                id
            );


        if (
            element
        ) {

            element.textContent =
                value ??
                "";
        }
    }



    normalize(
        value
    ) {

        return String(
            value ??
            ""
        )
            .normalize(
                "NFD"
            )
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .trim()
            .toLowerCase()
            .replace(
                /[\s-]+/g,
                "_"
            );
    }

}



/* =========================================================
   DÉMARRAGE
========================================================= */

function startPytUI() {

    if (
        window.pytUI
    ) {

        return;
    }


    window.PytUI =
        PytUI;


    window.pytUI =
        new PytUI();
}



if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startPytUI,
        {
            once: true
        }
    );

} else {

    startPytUI();
}