"use strict";

/* =========================================================
   PYT - ui.js

   NAVIGATION DU JEU

   INTRO
      ↓
   CARTE GÉNÉRALE DE LA MAISON
      ↓
   CHAPITRE
      ↓
   THÉORIE OBLIGATOIRE
      ↓
   PIÈCE DU CHAPITRE
      ↓
   EXERCICE 1 → 2 → 3
      ↓
   CHAPITRE SUIVANT DÉBLOQUÉ

   ---------------------------------------------------------

   Cette version gère :

   - carte complète de la maison
   - 9 chapitres placés dans les pièces
   - badges dessinés en pixel art
   - chapitres verrouillés
   - théorie obligatoire
   - vue détaillée de la pièce
   - exercices verrouillés progressivement
   - progression sauvegardée
   - retour aux anciens chapitres
   - erreurs
   - aide de Pyt
   - code conservé après retour au cours
   - aucune solution affichée dans la progression

========================================================= */


class PytUI {

    constructor() {

        /* =====================================================
           PROGRESSION
        ===================================================== */

        this.progress = {

            completed: {}
        };


        /* =====================================================
           ÉTAT
        ===================================================== */

        this.mapMode =
            "house";


        this.selectedChapter =
            1;


        this.currentLevelData =
            null;


        this.loadedLevelKey =
            null;


        this.failureCounts =
            {};


        /* =====================================================
           THÉORIE
        ===================================================== */

        this.theoryEntryPending =
            false;


        this.reviewMode =
            false;


        this.reviewContext =
            null;


        /* =====================================================
           CARTE
        ===================================================== */

        this.mapCanvas =
            null;


        this.mapCtx =
            null;


        this.chapterHitboxes =
            [];


        this.mapAnimationFrame =
            null;


        this.lastMapAnimationTime =
            0;


        /* =====================================================
           AIDE
        ===================================================== */

        this.firstHouseHintShown =
            false;


        this.init();
    }



    /* =========================================================
       INITIALISATION
    ========================================================= */

    init() {

        this.loadProgress();

        this.repairArtCompatibility();

        this.prepareHouseCanvas();

        this.bindEvents();

        this.prepareEditor();


        window.setTimeout(
            () => {

                this.refresh();

            },
            0
        );
    }



    /* =========================================================
       COMPATIBILITÉ ART.JS
    ========================================================= */

    repairArtCompatibility() {

        /*
         * Le gros art.js précédent utilisait deux helpers
         * directement depuis palette.
         *
         * On les fournit ici pour éviter une erreur avant
         * qu'on fasse le prochain passage complet sur art.js.
         */

        const palette =
            window.PYTArt
                ?.palette;


        if (
            !palette
        ) {

            return;
        }


        if (
            typeof palette.glassBlue !==
            "function"
        ) {

            palette.glassBlue =
                () =>
                    "#74c9dd";
        }


        if (
            typeof palette.glassSteel !==
            "function"
        ) {

            palette.glassSteel =
                () =>
                    "#9dc3c8";
        }
    }



    /* =========================================================
       EVENTS
    ========================================================= */

    bindEvents() {

        window.addEventListener(
            "pyt:app-ready",
            () => {

                this.openHouseMap(
                    false
                );
            }
        );


        window.addEventListener(
            "pyt:map-open",
            () => {

                this.renderMap();
            }
        );


        window.addEventListener(
            "pyt:course-open",
            () => {

                this.renderCourse();
            }
        );


        window.addEventListener(
            "pyt:execution-result",
            event => {

                this.handleExecutionResult(
                    event.detail ||
                    {}
                );
            }
        );


        window.addEventListener(
            "pyt:restart-level",
            () => {

                this.restartLevel();
            }
        );


        window.addEventListener(
            "resize",
            () => {

                this.resizeMapCanvas();
            }
        );


        this.bindMapButtons();

        this.bindLevelButtons();

        this.bindCourseButton();

        this.bindChapterNavigation();
    }



    /* =========================================================
       BOUTONS CARTE
    ========================================================= */

    bindMapButtons() {

        const courseButton =
            document.getElementById(
                "map-course-button"
            );


        if (
            courseButton
        ) {

            courseButton.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopImmediatePropagation();


                    if (
                        this.mapMode ===
                        "house"
                    ) {

                        return;
                    }


                    this.openTheoryForChapter(
                        this.selectedChapter,
                        false
                    );

                },
                true
            );
        }
    }



    /* =========================================================
       BOUTONS EXERCICES
    ========================================================= */

    bindLevelButtons() {

        for (
            let level = 1;
            level <= 3;
            level += 1
        ) {

            const button =
                document.getElementById(
                    `level-node-${level}`
                );


            if (
                !button
            ) {

                continue;
            }


            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopImmediatePropagation();


                    if (
                        this.mapMode !==
                        "chapter"
                    ) {

                        return;
                    }


                    if (
                        !this.isLevelUnlocked(
                            this.selectedChapter,
                            level
                        )
                    ) {

                        window.pytApp
                            ?.showGuide(
                                "Cet exercice est encore verrouillé. Termine l’exercice précédent."
                            );

                        return;
                    }


                    this.openLevel(
                        this.selectedChapter,
                        level
                    );

                },
                true
            );
        }
    }



    /* =========================================================
       BOUTON COURS
    ========================================================= */

    bindCourseButton() {

        const button =
            document.getElementById(
                "course-map-button"
            );


        if (
            !button
        ) {

            return;
        }


        button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopImmediatePropagation();


                /*
                 * Entrée normale dans un chapitre.
                 */

                if (
                    this.theoryEntryPending
                ) {

                    this.finishMandatoryTheory();

                    return;
                }


                /*
                 * Retour au jeu après consultation du cours
                 * depuis une erreur.
                 */

                if (
                    this.reviewMode &&
                    this.reviewContext
                ) {

                    this.returnFromTheoryReview();

                    return;
                }


                /*
                 * Sinon on revient à la carte de la pièce.
                 */

                this.openChapterRoom(
                    this.selectedChapter
                );

            },
            true
        );
    }



    /* =========================================================
       NAVIGATION CHAPITRES
    ========================================================= */

    bindChapterNavigation() {

        const previous =
            document.getElementById(
                "previous-chapter-button"
            );


        const next =
            document.getElementById(
                "next-chapter-button"
            );


        if (
            previous
        ) {

            previous.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopImmediatePropagation();


                    if (
                        this.mapMode ===
                        "chapter"
                    ) {

                        this.openHouseMap();

                        return;
                    }


                    this.openHouseMap();

                },
                true
            );
        }


        if (
            next
        ) {

            next.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopImmediatePropagation();


                    if (
                        this.mapMode !==
                        "chapter"
                    ) {

                        return;
                    }


                    const nextChapter =
                        this.selectedChapter +
                        1;


                    if (
                        nextChapter >
                        this.getTotalChapters()
                    ) {

                        return;
                    }


                    if (
                        !this.isChapterUnlocked(
                            nextChapter
                        )
                    ) {

                        window.pytApp
                            ?.showGuide(
                                "Le chapitre suivant est encore verrouillé."
                            );

                        return;
                    }


                    this.openTheoryForChapter(
                        nextChapter,
                        true
                    );

                },
                true
            );
        }
    }



    /* =========================================================
       DONNÉES
    ========================================================= */

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

            if (
                source
            ) {

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



    getTotalChapters() {

        const chapters =
            this.getChapters();


        return chapters.length ||
            9;
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


        return Array.isArray(
            chapter.levels
        )
            ? chapter.levels
            : [];
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


        const chapter =
            this.getChapterData(
                chapterNumber
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
                    ),

                room:
                    level.room ||
                    chapter.room
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

            room:
                chapter.room,

            title:
                `Exercice ${levelNumber}`,

            instruction:
                "Termine la mission.",

            difficulty:
                "Exercice",

            starterCode:
                ""
        };
    }



    /* =========================================================
       CANVAS CARTE
    ========================================================= */

    prepareHouseCanvas() {

        const decoration =
            document.getElementById(
                "map-decoration"
            );


        if (
            !decoration
        ) {

            return;
        }


        decoration.innerHTML =
            "";


        decoration.style.background =
            "none";


        decoration.style.pointerEvents =
            "none";


        const canvas =
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

        canvas.style.imageRendering =
            "pixelated";

        canvas.style.pointerEvents =
            "auto";

        canvas.style.cursor =
            "default";


        decoration.appendChild(
            canvas
        );


        /*
         * Le parent doit recevoir les événements.
         */

        decoration.style.pointerEvents =
            "auto";


        this.mapCanvas =
            canvas;


        this.mapCtx =
            canvas.getContext(
                "2d"
            );


        this.mapCtx.imageSmoothingEnabled =
            false;


        canvas.addEventListener(
            "click",
            event => {

                this.handleMapCanvasClick(
                    event
                );
            }
        );


        canvas.addEventListener(
            "mousemove",
            event => {

                this.handleMapMouseMove(
                    event
                );
            }
        );


        canvas.addEventListener(
            "mouseleave",
            () => {

                canvas.style.cursor =
                    "default";
            }
        );


        this.resizeMapCanvas();

        this.startMapAnimation();
    }



    resizeMapCanvas() {

        if (
            !this.mapCanvas
        ) {

            return;
        }


        const parent =
            this.mapCanvas
                .parentElement;


        if (
            !parent
        ) {

            return;
        }


        const rect =
            parent
                .getBoundingClientRect();


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


        this.drawCurrentMap();
    }



    /* =========================================================
       ANIMATION CARTE
    ========================================================= */

    startMapAnimation() {

        if (
            this.mapAnimationFrame
        ) {

            cancelAnimationFrame(
                this.mapAnimationFrame
            );
        }


        const animate =
            time => {

                this.mapAnimationFrame =
                    requestAnimationFrame(
                        animate
                    );


                /*
                 * On ne redessine pas 60 fois par seconde.
                 * La grande carte est volontairement lourde.
                 */

                if (
                    time -
                    this.lastMapAnimationTime <
                    160
                ) {

                    return;
                }


                this.lastMapAnimationTime =
                    time;


                const map =
                    document.getElementById(
                        "map-screen"
                    );


                if (
                    !map ||
                    map.classList.contains(
                        "hidden"
                    )
                ) {

                    return;
                }


                if (
                    this.mapMode ===
                    "house"
                ) {

                    this.drawHouseOverview();
                }
            };


        this.mapAnimationFrame =
            requestAnimationFrame(
                animate
            );
    }



    /* =========================================================
       OUVERTURE MAISON
    ========================================================= */

    openHouseMap(
        showScreen = true
    ) {

        this.mapMode =
            "house";


        this.theoryEntryPending =
            false;


        this.reviewMode =
            false;


        this.reviewContext =
            null;


        if (
            showScreen
        ) {

            window.pytApp
                ?.showMap();
        }


        this.renderHouseInterface();

        this.resizeMapCanvas();

        this.showFirstHouseHint();
    }



    renderHouseInterface() {

        this.setText(
            "map-title",
            "Maison de Pyt"
        );


        this.setText(
            "map-subtitle",
            "Choisis un chapitre dans la maison."
        );


        const courseButton =
            document.getElementById(
                "map-course-button"
            );


        if (
            courseButton
        ) {

            courseButton.classList.add(
                "hidden"
            );
        }


        const levels =
            document.querySelector(
                ".map-levels"
            );


        if (
            levels
        ) {

            levels.classList.add(
                "hidden"
            );
        }


        const navigation =
            document.querySelector(
                ".map-navigation"
            );


        if (
            navigation
        ) {

            navigation.classList.add(
                "hidden"
            );
        }


        this.drawHouseOverview();
    }



    /* =========================================================
       DESSIN MAISON
    ========================================================= */

    drawHouseOverview() {

        const ctx =
            this.mapCtx;


        const canvas =
            this.mapCanvas;


        if (
            !ctx ||
            !canvas ||
            !window.PYTArt
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


        const positions =
            this.getChapterPositions(
                width,
                height
            );


        this.chapterHitboxes =
            [];


        const chapters =
            [];


        for (
            let chapter = 1;
            chapter <= this.getTotalChapters();
            chapter += 1
        ) {

            const position =
                positions[
                    chapter
                ];


            if (
                !position
            ) {

                continue;
            }


            const unlocked =
                this.isChapterUnlocked(
                    chapter
                );


            chapters.push({

                number:
                    chapter,

                x:
                    position.x,

                y:
                    position.y,

                radius:
                    position.radius,

                label:
                    `CHAPITRE ${chapter}`,

                locked:
                    !unlocked,

                active:
                    unlocked &&
                    !this.isChapterCompleted(
                        chapter
                    )
            });


            this.chapterHitboxes.push({

                chapter,

                x:
                    position.x,

                y:
                    position.y,

                radius:
                    position.radius +
                    9,

                unlocked
            });
        }


        window.PYTArt
            .drawHouseMap(
                ctx,
                0,
                0,
                width,
                height,
                {
                    chapters
                }
            );
    }



    getChapterPositions(
        width,
        height
    ) {

        /*
         * Ces positions correspondent aux pièces
         * dessinées dans art.js.
         */

        const radius =
            Math.max(
                34,
                Math.min(
                    48,
                    width *
                    0.041
                )
            );


        const houseX =
            width *
            0.08;


        const houseY =
            height *
            0.265;


        const houseW =
            width *
            0.83;


        const houseH =
            height *
            0.49;


        const leftW =
            houseW *
            0.38;


        const middleW =
            houseW *
            0.33;


        const rightW =
            houseW -
            leftW -
            middleW;


        const upperH =
            houseH *
            0.48;


        const lowerH =
            houseH -
            upperH;


        return {

            /*
             * 1 - Entrée
             */

            1: {

                x:
                    houseX +
                    leftW +
                    middleW *
                    0.31,

                y:
                    houseY +
                    upperH +
                    lowerH *
                    0.5,

                radius
            },


            /*
             * 2 - Cuisine
             */

            2: {

                x:
                    houseX +
                    leftW *
                    0.5,

                y:
                    houseY +
                    upperH +
                    lowerH *
                    0.5,

                radius
            },


            /*
             * 3 - Salon
             */

            3: {

                x:
                    houseX +
                    leftW *
                    0.5,

                y:
                    houseY +
                    upperH *
                    0.5,

                radius
            },


            /*
             * 4 - Chambre
             */

            4: {

                x:
                    houseX +
                    leftW +
                    middleW *
                    0.5,

                y:
                    houseY +
                    upperH *
                    0.5,

                radius
            },


            /*
             * 5 - Garage
             */

            5: {

                x:
                    houseX +
                    leftW +
                    middleW +
                    rightW *
                    0.5,

                y:
                    houseY +
                    upperH +
                    lowerH *
                    0.5,

                radius
            },


            /*
             * 6 - Cave
             */

            6: {

                x:
                    houseX +
                    leftW +
                    middleW +
                    rightW *
                    0.5,

                y:
                    houseY +
                    upperH *
                    0.5,

                radius
            },


            /*
             * 7 - Balcon
             */

            7: {

                x:
                    houseX -
                    width *
                    0.031,

                y:
                    houseY +
                    houseH *
                    0.34,

                radius:
                    radius *
                    0.86
            },


            /*
             * 8 - Toilette
             */

            8: {

                x:
                    houseX +
                    leftW +
                    middleW *
                    0.81,

                y:
                    houseY +
                    upperH +
                    lowerH *
                    0.5,

                radius:
                    radius *
                    0.82
            },


            /*
             * 9 - Jardin
             */

            9: {

                x:
                    width *
                    0.30,

                y:
                    height *
                    0.15,

                radius
            }
        };
    }



    /* =========================================================
       CLIC CARTE
    ========================================================= */

    handleMapCanvasClick(
        event
    ) {

        if (
            this.mapMode !==
            "house"
        ) {

            return;
        }


        const point =
            this.getCanvasPointer(
                event
            );


        const hit =
            this.chapterHitboxes
                .find(
                    item => {

                        const dx =
                            point.x -
                            item.x;


                        const dy =
                            point.y -
                            item.y;


                        return (
                            Math.sqrt(
                                dx *
                                    dx +
                                dy *
                                    dy
                            ) <=
                            item.radius
                        );
                    }
                );


        if (
            !hit
        ) {

            return;
        }


        if (
            !hit.unlocked
        ) {

            window.pytApp
                ?.showGuide(
                    "Ce chapitre est verrouillé. Termine les trois exercices du chapitre précédent pour le débloquer."
                );

            return;
        }


        this.openTheoryForChapter(
            hit.chapter,
            true
        );
    }



    handleMapMouseMove(
        event
    ) {

        if (
            !this.mapCanvas ||
            this.mapMode !==
            "house"
        ) {

            return;
        }


        const point =
            this.getCanvasPointer(
                event
            );


        const hit =
            this.chapterHitboxes
                .some(
                    item => {

                        const dx =
                            point.x -
                            item.x;


                        const dy =
                            point.y -
                            item.y;


                        return (
                            Math.sqrt(
                                dx *
                                    dx +
                                dy *
                                    dy
                            ) <=
                            item.radius
                        );
                    }
                );


        this.mapCanvas.style.cursor =
            hit
                ? "pointer"
                : "default";
    }



    getCanvasPointer(
        event
    ) {

        const rect =
            this.mapCanvas
                .getBoundingClientRect();


        return {

            x:
                (
                    event.clientX -
                    rect.left
                ) *
                (
                    this.mapCanvas.width /
                    rect.width
                ),

            y:
                (
                    event.clientY -
                    rect.top
                ) *
                (
                    this.mapCanvas.height /
                    rect.height
                )
        };
    }



    /* =========================================================
       THÉORIE OBLIGATOIRE
    ========================================================= */

    openTheoryForChapter(
        chapterNumber,
        mandatory = true
    ) {

        if (
            !this.isChapterUnlocked(
                chapterNumber
            )
        ) {

            return;
        }


        this.selectedChapter =
            Number(
                chapterNumber
            );


        if (
            window.pytApp
        ) {

            window.pytApp.currentChapter =
                this.selectedChapter;
        }


        this.theoryEntryPending =
            mandatory;


        this.reviewMode =
            false;


        this.reviewContext =
            null;


        this.renderCourse();


        window.pytApp
            ?.showCourse();
    }



    finishMandatoryTheory() {

        this.theoryEntryPending =
            false;


        this.openChapterRoom(
            this.selectedChapter
        );
    }



    /* =========================================================
       COURS
    ========================================================= */

    renderCourse() {

        const chapter =
            this.getChapterData(
                this.selectedChapter
            );


        this.setText(
            "course-chapter-number",
            `Chapitre ${this.selectedChapter}`
        );


        this.setText(
            "course-title",
            chapter.title ||
            `Chapitre ${this.selectedChapter}`
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

            if (
                this.theoryEntryPending
            ) {

                button.textContent =
                    "Continuer vers les exercices";

            } else if (
                this.reviewMode
            ) {

                button.textContent =
                    "Retour à l'exercice";

            } else {

                button.textContent =
                    "Voir les exercices";
            }
        }
    }



    renderTheoryContent(
        container,
        theory
    ) {

        if (
            !Array.isArray(
                theory
            ) ||
            theory.length ===
                0
        ) {

            const paragraph =
                document.createElement(
                    "p"
                );


            paragraph.textContent =
                "Lis les explications de ce chapitre avant de commencer les exercices.";


            container.appendChild(
                paragraph
            );


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


                const body =
                    section.body;


                if (
                    body
                ) {

                    const paragraphs =
                        Array.isArray(
                            body
                        )
                            ? body
                            : [
                                body
                            ];


                    paragraphs.forEach(
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



    /* =========================================================
       CARTE DE LA PIÈCE
    ========================================================= */

    openChapterRoom(
        chapterNumber
    ) {

        this.selectedChapter =
            Number(
                chapterNumber
            );


        this.mapMode =
            "chapter";


        if (
            window.pytApp
        ) {

            window.pytApp.currentChapter =
                this.selectedChapter;
        }


        window.pytApp
            ?.showMap();


        this.renderChapterInterface();

        this.resizeMapCanvas();
    }



    renderChapterInterface() {

        const chapter =
            this.getChapterData(
                this.selectedChapter
            );


        this.setText(
            "map-title",
            `Chapitre ${this.selectedChapter} · ${chapter.room || chapter.title || ""}`
        );


        this.setText(
            "map-subtitle",
            "Choisis un exercice. Les exercices se débloquent dans l’ordre."
        );


        const courseButton =
            document.getElementById(
                "map-course-button"
            );


        if (
            courseButton
        ) {

            courseButton.classList.remove(
                "hidden"
            );


            courseButton.textContent =
                "Revoir la théorie";
        }


        const levels =
            document.querySelector(
                ".map-levels"
            );


        if (
            levels
        ) {

            levels.classList.remove(
                "hidden"
            );
        }


        const navigation =
            document.querySelector(
                ".map-navigation"
            );


        if (
            navigation
        ) {

            navigation.classList.remove(
                "hidden"
            );
        }


        this.renderLevelNodes();

        this.renderChapterNavigation();

        this.drawChapterRoom();
    }



    drawChapterRoom() {

        if (
            !this.mapCtx ||
            !this.mapCanvas ||
            !window.PYTArt
        ) {

            return;
        }


        const chapter =
            this.getChapterData(
                this.selectedChapter
            );


        const room =
            this.normalize(
                chapter.room ||
                ""
            );


        const ctx =
            this.mapCtx;


        const width =
            this.mapCanvas.width;


        const height =
            this.mapCanvas.height;


        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        /*
         * Fond sombre extérieur.
         */

        ctx.fillStyle =
            "#11121d";


        ctx.fillRect(
            0,
            0,
            width,
            height
        );


        const marginX =
            Math.max(
                18,
                width *
                    0.045
            );


        const marginTop =
            Math.max(
                110,
                height *
                    0.17
            );


        const marginBottom =
            Math.max(
                75,
                height *
                    0.12
            );


        window.PYTArt
            .drawRoomScene(
                ctx,
                room ||
                    "entree",
                marginX,
                marginTop,
                width -
                    marginX *
                    2,
                height -
                    marginTop -
                    marginBottom,
                {
                    furniture:
                        true
                }
            );


        /*
         * Numéro de chapitre en pixel art dans un coin.
         */

        window.PYTArt
            .drawPixelText(
                ctx,
                `CHAPITRE ${this.selectedChapter}`,
                marginX +
                    20,
                marginTop +
                    24,
                {
                    scale:
                        Math.max(
                            1,
                            Math.floor(
                                width /
                                600
                            )
                        ),

                    color:
                        "#fff3ca",

                    shadow:
                        "#11121d"
                }
            );
    }



    renderLevelNodes() {

        for (
            let level = 1;
            level <= 3;
            level += 1
        ) {

            const node =
                document.getElementById(
                    `level-node-${level}`
                );


            if (
                !node
            ) {

                continue;
            }


            const unlocked =
                this.isLevelUnlocked(
                    this.selectedChapter,
                    level
                );


            const completed =
                this.isLevelCompleted(
                    this.selectedChapter,
                    level
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
                !completed
            );


            const number =
                node.querySelector(
                    ".level-node-number"
                );


            if (
                number
            ) {

                number.textContent =
                    String(
                        level
                    );
            }


            const state =
                node.querySelector(
                    ".level-node-state"
                );


            if (
                state
            ) {

                if (
                    completed
                ) {

                    state.textContent =
                        "Terminé";

                } else if (
                    !unlocked
                ) {

                    state.textContent =
                        "Verrouillé";

                } else {

                    state.textContent =
                        `Exercice ${level}`;
                }
            }
        }
    }



    renderChapterNavigation() {

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
                false;


            previous.textContent =
                "← Maison";
        }


        if (
            next
        ) {

            const nextChapter =
                this.selectedChapter +
                1;


            next.textContent =
                "Chapitre suivant →";


            next.disabled =
                nextChapter >
                    this.getTotalChapters() ||
                !this.isChapterUnlocked(
                    nextChapter
                );
        }


        if (
            indicator
        ) {

            indicator.textContent =
                `${this.selectedChapter} / ${this.getTotalChapters()}`;
        }
    }



    /* =========================================================
       RENDER MAP
    ========================================================= */

    renderMap() {

        if (
            this.mapMode ===
            "house"
        ) {

            this.renderHouseInterface();

        } else {

            this.renderChapterInterface();
        }
    }



    drawCurrentMap() {

        if (
            this.mapMode ===
            "house"
        ) {

            this.drawHouseOverview();

        } else {

            this.drawChapterRoom();
        }
    }



    /* =========================================================
       EXERCICE
    ========================================================= */

    openLevel(
        chapterNumber,
        levelNumber
    ) {

        const data =
            this.getLevelData(
                chapterNumber,
                levelNumber
            );


        this.currentLevelData =
            data;


        this.selectedChapter =
            Number(
                chapterNumber
            );


        if (
            window.pytApp
        ) {

            window.pytApp.currentChapter =
                Number(
                    chapterNumber
                );


            window.pytApp.currentLevel =
                Number(
                    levelNumber
                );
        }


        const key =
            this.getLevelKey(
                chapterNumber,
                levelNumber
            );


        const editor =
            document.getElementById(
                "code-editor"
            );


        /*
         * On met le starter code uniquement
         * la première fois qu'on ouvre l'exercice.
         *
         * Aucun écran de progression ne montre
         * la solution.
         */

        if (
            this.loadedLevelKey !==
            key
        ) {

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


        window.pytApp
            ?.showGame();


        window.dispatchEvent(
            new CustomEvent(
                "pyt:load-level",
                {
                    detail: {

                        chapter:
                            Number(
                                chapterNumber
                            ),

                        level:
                            Number(
                                levelNumber
                            ),

                        data
                    }
                }
            )
        );


        window.setTimeout(
            () => {

                window.pytApp
                    ?.showGuide(
                        data.guideMessage ||
                        data.instruction ||
                        "Lis la mission puis écris ton programme."
                    );

            },
            120
        );
    }



    /* =========================================================
       EXÉCUTION
    ========================================================= */

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



    setExecuting(
        value
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
                    value
                );


            button.textContent =
                value
                    ? "Exécution..."
                    : "Exécuter";
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
        }


        if (
            result.error
        ) {

            lines.push(
                String(
                    result.error
                )
            );
        }


        output.textContent =
            lines.join(
                "\n"
            );
    }



    /* =========================================================
       RÉUSSITE
    ========================================================= */

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


                        this.openChapterRoom(
                            chapter
                        );


                        window.setTimeout(
                            () => {

                                window.pytApp
                                    ?.showGuide(
                                        `L’exercice ${level + 1} est maintenant débloqué.`
                                    );

                            },
                            150
                        );
                    }
            });

        } else {

            const nextChapter =
                chapter +
                1;


            if (
                nextChapter <=
                this.getTotalChapters()
            ) {

                actions.push({

                    label:
                        "Retour à la maison",

                    onClick:
                        () => {

                            app.hideGuide();

                            this.openHouseMap();


                            window.setTimeout(
                                () => {

                                    window.pytApp
                                        ?.showGuide(
                                            `Chapitre ${nextChapter} débloqué.`
                                        );

                                },
                                160
                            );
                        }
                });

            } else {

                actions.push({

                    label:
                        "Retour à la maison",

                    onClick:
                        () => {

                            app.hideGuide();

                            this.openHouseMap();
                        }
                });
            }
        }


        app.showGuide(
            result.message ||
            "Mission réussie.",
            actions
        );
    }



    /* =========================================================
       ÉCHEC
    ========================================================= */

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


        this.failureCounts[
            key
        ] =
            (
                this.failureCounts[
                    key
                ] ||
                0
            ) +
            1;


        const failures =
            this.failureCounts[
                key
            ];


        const reason =
            String(
                result.reason ||
                ""
            );


        if (
            reason ===
                "wrong_destination" ||
            result.wrongDestination
        ) {

            app.showThought(
                "Ce n’est pas là que je voulais aller..."
            );

        } else {

            app.hideThought();
        }


        /*
         * PREMIER ÉCHEC
         *
         * Pas de ligne rouge.
         * Pas de solution.
         */

        if (
            failures ===
            1
        ) {

            this.clearCodeError();


            app.showGuide(
                "Ça ne fonctionne pas encore. Tu peux revoir la théorie puis reprendre exactement ton programme.",
                [

                    {

                        label:
                            "Revoir la théorie",

                        onClick:
                            () => {

                                this.openTheoryReview();
                            }
                    },

                    {

                        label:
                            "Modifier mon code",

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
         * À partir du deuxième échec,
         * on peut montrer une ligne uniquement
         * lorsque le moteur sait réellement laquelle.
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


        /*
         * Toujours pas de réponse complète.
         */

        let message =
            result.hint ||
            result.message ||
            "Le programme s’exécute, mais la mission n’est pas encore complètement réussie.";


        if (
            errorLine >
            0
        ) {

            message +=
                ` Regarde notamment autour de la ligne ${errorLine}.`;
        }


        app.showGuide(
            message,
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
                        "Revoir la théorie",

                    onClick:
                        () => {

                            this.openTheoryReview();
                        }
                }
            ]
        );
    }



    /* =========================================================
       RETOUR THÉORIE
    ========================================================= */

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


        this.selectedChapter =
            Number(
                app.currentChapter
            );


        this.reviewMode =
            true;


        this.theoryEntryPending =
            false;


        app.hideGuide();

        this.renderCourse();

        app.showCourse();
    }



    returnFromTheoryReview() {

        const context =
            this.reviewContext;


        if (
            !context
        ) {

            return;
        }


        const editor =
            document.getElementById(
                "code-editor"
            );


        if (
            editor
        ) {

            editor.value =
                context.code;
        }


        this.reviewMode =
            false;


        this.reviewContext =
            null;


        window.pytApp
            ?.showGame();


        window.setTimeout(
            () => {

                window.pytApp
                    ?.showGuide(
                        "Tu peux reprendre ton programme là où tu l’avais laissé.",
                        [

                            {

                                label:
                                    "Continuer",

                                onClick:
                                    () => {

                                        window.pytApp
                                            ?.hideGuide();

                                        window.pytApp
                                            ?.openCodeWindow();
                                    }
                            }
                        ]
                    );

            },
            100
        );
    }



    /* =========================================================
       RESTART
    ========================================================= */

    restartLevel() {

        this.clearCodeError();


        window.pytApp
            ?.hideThought();


        if (
            !this.currentLevelData
        ) {

            return;
        }


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



    /* =========================================================
       ÉDITEUR
    ========================================================= */

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


        const lines =
            editor.value
                .replace(
                    /\t/g,
                    "    "
                )
                .split(
                    "\n"
                );


        overlay.innerHTML =
            "";


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



    /* =========================================================
       PROGRESSION
    ========================================================= */

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
                "PYT : progression impossible à charger.",
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
                "PYT : progression impossible à enregistrer.",
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



    isChapterCompleted(
        chapter
    ) {

        return (
            this.isLevelCompleted(
                chapter,
                1
            ) &&
            this.isLevelCompleted(
                chapter,
                2
            ) &&
            this.isLevelCompleted(
                chapter,
                3
            )
        );
    }



    isChapterUnlocked(
        chapter
    ) {

        const number =
            Number(
                chapter
            );


        if (
            number <=
            1
        ) {

            return true;
        }


        return this.isChapterCompleted(
            number -
                1
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



    getLevelKey(
        chapter,
        level
    ) {

        return (
            `${Number(chapter)}-${Number(level)}`
        );
    }



    /* =========================================================
       PREMIÈRE AIDE MAISON
    ========================================================= */

    showFirstHouseHint() {

        if (
            this.firstHouseHintShown
        ) {

            return;
        }


        let seen =
            false;


        try {

            seen =
                localStorage.getItem(
                    "pyt-house-help-seen"
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

            this.firstHouseHintShown =
                true;

            return;
        }


        this.firstHouseHintShown =
            true;


        window.setTimeout(
            () => {

                window.pytApp
                    ?.showGuide(
                        "Voici la maison de Pyt. Commence par le chapitre 1. Les autres pièces se débloqueront progressivement."
                    );


                try {

                    localStorage.setItem(
                        "pyt-house-help-seen",
                        "1"
                    );

                } catch (
                error
                ) {

                    /*
                     * localStorage indisponible.
                     */
                }

            },
            250
        );
    }



    /* =========================================================
       REFRESH
    ========================================================= */

    refresh() {

        if (
            !window.pytApp
        ) {

            return;
        }


        this.renderMap();

        this.renderCourse();

        this.resizeMapCanvas();
    }



    /* =========================================================
       OUTILS
    ========================================================= */

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