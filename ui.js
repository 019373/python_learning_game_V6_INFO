"use strict";

(() => {

    class PytUI {

        constructor() {

            /* =====================================================
               STOCKAGE
            ===================================================== */

            this.progressKey =
                "pyt-progress";

            this.startedKey =
                "pyt-started-levels";


            this.completed =
                this.loadStorageObject(
                    this.progressKey
                );


            this.started =
                this.loadStorageObject(
                    this.startedKey
                );


            /* =====================================================
               ÉTAT
            ===================================================== */

            this.mapMode =
                "house";


            this.selectedChapter =
                null;


            this.currentLevelData =
                null;


            this.currentChapterData =
                null;


            this.currentLevelKey =
                null;


            this.theoryReturnMode =
                "chapter";


            this.savedEditorCode =
                "";


            this.failureCounts =
                {};


            this.houseBadges =
                [];


            this.resizeObserver =
                null;


            this.redrawFrame =
                null;


            this.cacheDom();

            this.ensureArtCompatibility();

            this.ensureHouseCanvas();

            this.prepareStaticUi();

            this.bindEvents();

            this.prepareResizeHandling();


            requestAnimationFrame(
                () => {

                    this.resizeHouseCanvas();

                    this.refresh();
                }
            );
        }



        /* =========================================================
           DOM
        ========================================================= */

        cacheDom() {

            const get =
                id =>
                    document.getElementById(
                        id
                    );


            /* TOPBAR */

            this.chapterBadge =
                get(
                    "chapter-badge"
                );

            this.difficultyBadge =
                get(
                    "difficulty-badge"
                );

            this.roomName =
                get(
                    "room-name"
                );

            this.courseButton =
                get(
                    "course-button"
                );

            this.mapButton =
                get(
                    "map-button"
                );


            /* THÉORIE */

            this.chapterScreen =
                get(
                    "chapter-screen"
                );

            this.courseChapterNumber =
                get(
                    "course-chapter-number"
                );

            this.courseTitle =
                get(
                    "course-title"
                );

            this.courseSubtitle =
                get(
                    "course-subtitle"
                );

            this.courseContent =
                get(
                    "course-content"
                );

            this.courseMapButton =
                get(
                    "course-map-button"
                );


            /* CARTE */

            this.mapScreen =
                get(
                    "map-screen"
                );

            this.mapDecoration =
                get(
                    "map-decoration"
                );

            this.mapTitle =
                get(
                    "map-title"
                );

            this.mapSubtitle =
                get(
                    "map-subtitle"
                );

            this.mapCourseButton =
                get(
                    "map-course-button"
                );


            this.levelNodes = [

                get(
                    "level-node-1"
                ),

                get(
                    "level-node-2"
                ),

                get(
                    "level-node-3"
                )
            ];


            this.previousChapterButton =
                get(
                    "previous-chapter-button"
                );

            this.mapChapterIndicator =
                get(
                    "map-chapter-indicator"
                );

            this.nextChapterButton =
                get(
                    "next-chapter-button"
                );


            /* JEU */

            this.gameScreen =
                get(
                    "game-screen"
                );

            this.gameCanvas =
                get(
                    "game-canvas"
                );

            this.gameStatus =
                get(
                    "game-status"
                );

            this.missionTitle =
                get(
                    "mission-title"
                );

            this.missionInstruction =
                get(
                    "mission-instruction"
                );


            /* CODE */

            this.editor =
                get(
                    "code-editor"
                );

            this.consoleOutput =
                get(
                    "console-output"
                );

            this.codeErrorHighlights =
                get(
                    "code-error-highlights"
                );
        }



        /* =========================================================
           STORAGE
        ========================================================= */

        loadStorageObject(
            key
        ) {

            try {

                const value =
                    JSON.parse(
                        localStorage.getItem(
                            key
                        ) ||
                        "{}"
                    );


                if (
                    !value ||
                    typeof value !==
                        "object" ||
                    Array.isArray(
                        value
                    )
                ) {

                    return {};
                }


                return value;

            } catch (
                error
            ) {

                console.warn(
                    `[PYT] Lecture impossible : ${key}`,
                    error
                );


                return {};
            }
        }



        saveStorageObject(
            key,
            value
        ) {

            try {

                localStorage.setItem(
                    key,
                    JSON.stringify(
                        value
                    )
                );

            } catch (
                error
            ) {

                console.warn(
                    `[PYT] Sauvegarde impossible : ${key}`,
                    error
                );
            }
        }



        /* =========================================================
           DONNÉES
        ========================================================= */

        getDataSource() {

            return (
                window.PYT_GAME_DATA ||
                window.PYT_LEVELS ||
                window.GAME_LEVELS ||
                window.LEVELS ||
                window.levels ||
                null
            );
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
                    source
                )
            ) {

                return source;
            }


            if (
                Array.isArray(
                    source.chapters
                )
            ) {

                return source.chapters;
            }


            return [];
        }



        getChapterCount() {

            const count =
                this.getChapters()
                    .length;


            return (
                count >
                0
            )
                ? count
                : 9;
        }



        getChapterData(
            chapterNumber
        ) {

            const number =
                Number(
                    chapterNumber
                );


            const source =
                this.getDataSource();


            /*
             * API levels.js si elle existe.
             */

            if (
                source &&
                typeof source.getChapter ===
                    "function"
            ) {

                const result =
                    source.getChapter(
                        number
                    );


                if (
                    result
                ) {

                    return result;
                }
            }


            const chapters =
                this.getChapters();


            return (
                chapters.find(
                    (
                        chapter,
                        index
                    ) => {

                        const current =
                            Number(
                                chapter.chapter ??
                                chapter.number ??
                                chapter.id ??
                                index +
                                    1
                            );


                        return (
                            current ===
                            number
                        );
                    }
                ) ||
                null
            );
        }



        getLevelData(
            chapterNumber,
            levelNumber
        ) {

            const chapter =
                Number(
                    chapterNumber
                );


            const level =
                Number(
                    levelNumber
                );


            const source =
                this.getDataSource();


            /*
             * API levels.js si disponible.
             */

            if (
                source &&
                typeof source.getLevel ===
                    "function"
            ) {

                const result =
                    source.getLevel(
                        chapter,
                        level
                    );


                if (
                    result
                ) {

                    return result;
                }
            }


            const chapterData =
                this.getChapterData(
                    chapter
                );


            if (
                !chapterData
            ) {

                return null;
            }


            const levels =
                chapterData.levels ||
                chapterData.exercises ||
                chapterData.exercices ||
                [];


            if (
                !Array.isArray(
                    levels
                )
            ) {

                return null;
            }


            return (
                levels.find(
                    (
                        item,
                        index
                    ) => {

                        const current =
                            Number(
                                item.level ??
                                item.number ??
                                item.id ??
                                index +
                                    1
                            );


                        return (
                            current ===
                            level
                        );
                    }
                ) ||
                null
            );
        }



        getChapterNumber(
            chapterData
        ) {

            if (
                !chapterData
            ) {

                return Number(
                    this.selectedChapter ||
                    1
                );
            }


            return Number(
                chapterData.chapter ??
                chapterData.number ??
                chapterData.id ??
                this.selectedChapter ??
                1
            );
        }



        getLevelNumber(
            levelData
        ) {

            if (
                !levelData
            ) {

                return 1;
            }


            return Number(
                levelData.level ??
                levelData.number ??
                levelData.id ??
                1
            );
        }



        makeLevelKey(
            chapter,
            level
        ) {

            return (
                `${Number(
                    chapter
                )}-${Number(
                    level
                )}`
            );
        }



        getChapterTitle(
            chapterNumber,
            chapterData = null
        ) {

            const chapter =
                chapterData ||
                this.getChapterData(
                    chapterNumber
                );


            if (
                chapter
            ) {

                const title =
                    chapter.title ||
                    chapter.name;


                if (
                    title
                ) {

                    return String(
                        title
                    );
                }
            }


            const fallback = {

                1:
                    "Premiers pas",

                2:
                    "Variables et opérations",

                3:
                    "Conditions",

                4:
                    "Boucles for",

                5:
                    "Boucles while",

                6:
                    "Listes",

                7:
                    "Fonctions",

                8:
                    "Combinaison",

                9:
                    "Test final"
            };


            return (
                fallback[
                    Number(
                        chapterNumber
                    )
                ] ||
                `Chapitre ${chapterNumber}`
            );
        }



        /* =========================================================
           PROGRESSION
        ========================================================= */

        isLevelCompleted(
            chapter,
            level
        ) {

            return Boolean(
                this.completed[
                    this.makeLevelKey(
                        chapter,
                        level
                    )
                ]
            );
        }



        isLevelStarted(
            chapter,
            level
        ) {

            return Boolean(
                this.started[
                    this.makeLevelKey(
                        chapter,
                        level
                    )
                ]
            );
        }



        markLevelStarted(
            chapter,
            level
        ) {

            const key =
                this.makeLevelKey(
                    chapter,
                    level
                );


            if (
                this.started[
                    key
                ]
            ) {

                return;
            }


            this.started[
                key
            ] =
                true;


            this.saveStorageObject(
                this.startedKey,
                this.started
            );
        }



        markLevelCompleted(
            chapter,
            level
        ) {

            const key =
                this.makeLevelKey(
                    chapter,
                    level
                );


            this.completed[
                key
            ] =
                true;


            this.saveStorageObject(
                this.progressKey,
                this.completed
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


            /*
             * Chapitre suivant seulement après
             * exercice 3 du précédent.
             */

            return this.isLevelCompleted(
                number -
                    1,
                3
            );
        }



        isLevelUnlocked(
            chapter,
            level
        ) {

            const c =
                Number(
                    chapter
                );


            const l =
                Number(
                    level
                );


            if (
                !this.isChapterUnlocked(
                    c
                )
            ) {

                return false;
            }


            if (
                l ===
                1
            ) {

                return true;
            }


            return this.isLevelCompleted(
                c,
                l -
                    1
            );
        }



        /* =========================================================
           RÈGLE THÉORIE
        ========================================================= */

        isTheoryAvailable(
            chapter
        ) {

            const number =
                Number(
                    chapter
                );


            /*
             * RÈGLE EXACTE :
             *
             * 1. Avant d'avoir commencé exercice 1 :
             *    théorie disponible.
             *
             * 2. Exercice 1 commencé mais pas terminé :
             *    théorie inaccessible.
             *
             * 3. Exercice 1 terminé :
             *    théorie disponible définitivement
             *    pour le reste du chapitre.
             */

            const levelOneStarted =
                this.isLevelStarted(
                    number,
                    1
                );


            const levelOneCompleted =
                this.isLevelCompleted(
                    number,
                    1
                );


            if (
                !levelOneStarted
            ) {

                return true;
            }


            return levelOneCompleted;
        }



        updateTheoryControls() {

            const chapter =
                Number(
                    this.selectedChapter ||
                    this.currentLevelData
                        ?.chapter ||
                    0
                );


            if (
                !chapter
            ) {

                this.setButtonVisibility(
                    this.courseButton,
                    false
                );


                this.setButtonVisibility(
                    this.mapCourseButton,
                    false
                );


                return;
            }


            const available =
                this.isTheoryAvailable(
                    chapter
                );


            /*
             * BOUTON DU HAUT
             */

            if (
                this.courseButton
            ) {

                this.setButtonVisibility(
                    this.courseButton,
                    true
                );


                this.courseButton.disabled =
                    !available;


                this.courseButton
                    .classList
                    .toggle(
                        "theory-locked",
                        !available
                    );


                this.courseButton
                    .setAttribute(
                        "aria-disabled",
                        String(
                            !available
                        )
                    );


                this.courseButton.textContent =
                    "Théorie";


                this.courseButton.title =
                    available
                        ? "Ouvrir la théorie"
                        : "Termine l'exercice 1 pour redébloquer la théorie";
            }


            /*
             * BOUTON SUR LA CARTE DU CHAPITRE
             */

            if (
                this.mapCourseButton
            ) {

                const onChapterMap =
                    (
                        this.mapMode ===
                            "chapter"
                    );


                this.setButtonVisibility(
                    this.mapCourseButton,
                    onChapterMap
                );


                if (
                    onChapterMap
                ) {

                    this.mapCourseButton.disabled =
                        !available;


                    this.mapCourseButton
                        .classList
                        .toggle(
                            "theory-locked",
                            !available
                        );


                    this.mapCourseButton.textContent =
                        available
                            ? "Théorie"
                            : "Théorie verrouillée";


                    this.mapCourseButton.title =
                        available
                            ? "Ouvrir la théorie"
                            : "Termine l'exercice 1 pour la redébloquer";
                }
            }
        }



        /* =========================================================
           ART.JS COMPATIBILITÉ
           ON NE CHANGE PAS LE GRAPHISME
        ========================================================= */

        ensureArtCompatibility() {

            const art =
                window.PYTArt;


            if (
                !art ||
                !art.palette
            ) {

                return;
            }


            /*
             * Compatibilité pour l'ancien art.js.
             * Pas de modification graphique.
             */

            if (
                typeof
                art.palette.glassBlue !==
                "function"
            ) {

                const color =
                    typeof
                    art.palette.glassBlue ===
                    "string"
                        ? art.palette.glassBlue
                        : "#74c9dd";


                art.palette.glassBlue =
                    () =>
                        color;
            }


            if (
                typeof
                art.palette.glassSteel !==
                "function"
            ) {

                const color =
                    typeof
                    art.palette.glassSteel ===
                    "string"
                        ? art.palette.glassSteel
                        : "#9fc5ca";


                art.palette.glassSteel =
                    () =>
                        color;
            }
        }



        /* =========================================================
           CANVAS CARTE
        ========================================================= */

        ensureHouseCanvas() {

            if (
                !this.mapDecoration
            ) {

                return;
            }


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


                canvas.setAttribute(
                    "aria-label",
                    "Carte de la maison de Pyt"
                );


                this.mapDecoration
                    .appendChild(
                        canvas
                    );
            }


            this.houseCanvas =
                canvas;


            this.houseContext =
                canvas.getContext(
                    "2d"
                );


            this.houseCanvas
                .style.position =
                "absolute";


            this.houseCanvas
                .style.inset =
                "0";


            this.houseCanvas
                .style.width =
                "100%";


            this.houseCanvas
                .style.height =
                "100%";


            this.houseCanvas
                .style.display =
                "block";


            this.houseCanvas
                .style.imageRendering =
                "pixelated";


            this.houseCanvas
                .style.touchAction =
                "manipulation";
        }



        resizeHouseCanvas() {

            if (
                !this.houseCanvas ||
                !this.mapDecoration ||
                !this.houseContext
            ) {

                return false;
            }


            const rect =
                this.mapDecoration
                    .getBoundingClientRect();


            if (
                rect.width <
                    10 ||
                rect.height <
                    10
            ) {

                return false;
            }


            /*
             * Important :
             * on garde les coordonnées CSS simples
             * pour rester compatible avec art.js.
             */

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
                this.houseCanvas.width !==
                    width
            ) {

                this.houseCanvas.width =
                    width;
            }


            if (
                this.houseCanvas.height !==
                    height
            ) {

                this.houseCanvas.height =
                    height;
            }


            this.houseContext
                .setTransform(
                    1,
                    0,
                    0,
                    1,
                    0,
                    0
                );


            this.houseContext
                .imageSmoothingEnabled =
                false;


            return true;
        }



        prepareResizeHandling() {

            const update =
                () => {

                    if (
                        this.redrawFrame
                    ) {

                        cancelAnimationFrame(
                            this.redrawFrame
                        );
                    }


                    this.redrawFrame =
                        requestAnimationFrame(
                            () => {

                                this.resizeHouseCanvas();

                                this.refresh();
                            }
                        );
                };


            window.addEventListener(
                "resize",
                update,
                {
                    passive:
                        true
                }
            );


            window.addEventListener(
                "orientationchange",
                () => {

                    setTimeout(
                        update,
                        120
                    );
                }
            );


            if (
                this.mapDecoration &&
                typeof
                ResizeObserver !==
                    "undefined"
            ) {

                this.resizeObserver =
                    new ResizeObserver(
                        update
                    );


                this.resizeObserver
                    .observe(
                        this.mapDecoration
                    );
            }
        }



        /* =========================================================
           UI STATIQUE
        ========================================================= */

        prepareStaticUi() {

            /*
             * SUPPRIMER :
             * "Découverte"
             */

            if (
                this.difficultyBadge
            ) {

                this.difficultyBadge.hidden =
                    true;


                this.difficultyBadge.style.display =
                    "none";
            }


            /*
             * SUPPRIMER :
             * "Entrée"
             */

            if (
                this.roomName
            ) {

                this.roomName.hidden =
                    true;


                this.roomName.style.display =
                    "none";


                this.roomName.textContent =
                    "";
            }


            /*
             * CARTE toujours visible.
             */

            if (
                this.mapButton
            ) {

                this.mapButton.hidden =
                    false;


                this.mapButton
                    .classList
                    .remove(
                        "hidden"
                    );


                this.mapButton.textContent =
                    "Carte";
            }
        }



        /* =========================================================
           EVENTS
        ========================================================= */

        bindEvents() {

            /*
             * CARTE GLOBALE
             */

            this.bindButton(
                this.mapButton,
                () =>
                    this.openHouseMap()
            );


            /*
             * THÉORIE TOPBAR
             */

            this.bindButton(
                this.courseButton,
                () =>
                    this.handleTheoryRequest()
            );


            /*
             * THÉORIE DEPUIS CARTE CHAPITRE
             */

            this.bindButton(
                this.mapCourseButton,
                () =>
                    this.handleTheoryRequest()
            );


            /*
             * RETOUR DE THÉORIE
             */

            this.bindButton(
                this.courseMapButton,
                () =>
                    this.returnFromTheory()
            );


            /*
             * EXERCICES
             */

            this.levelNodes
                .forEach(
                    (
                        button,
                        index
                    ) => {

                        this.bindButton(
                            button,
                            () => {

                                if (
                                    !this.selectedChapter
                                ) {

                                    return;
                                }


                                this.openLevel(
                                    this.selectedChapter,
                                    index +
                                        1
                                );
                            }
                        );
                    }
                );


            /*
             * CHAPITRE PRÉCÉDENT.
             *
             * Si on est au chapitre 1 :
             * retour maison.
             */

            this.bindButton(
                this.previousChapterButton,
                () => {

                    if (
                        !this.selectedChapter
                    ) {

                        this.openHouseMap();

                        return;
                    }


                    if (
                        this.selectedChapter <=
                        1
                    ) {

                        this.openHouseMap();

                        return;
                    }


                    this.openChapterRoom(
                        this.selectedChapter -
                            1
                    );
                }
            );


            /*
             * CHAPITRE SUIVANT
             */

            this.bindButton(
                this.nextChapterButton,
                () => {

                    if (
                        !this.selectedChapter
                    ) {

                        return;
                    }


                    const next =
                        this.selectedChapter +
                        1;


                    if (
                        !this.isChapterUnlocked(
                            next
                        )
                    ) {

                        this.showGuide(
                            "Termine les trois exercices de ce chapitre pour débloquer le suivant."
                        );


                        return;
                    }


                    this.openChapterRoom(
                        next
                    );
                }
            );


            /*
             * CARTE MAISON :
             * clic badges.
             */

            if (
                this.houseCanvas
            ) {

                this.houseCanvas
                    .addEventListener(
                        "click",
                        event => {

                            this.handleHousePointer(
                                event.clientX,
                                event.clientY
                            );
                        }
                    );


                this.houseCanvas
                    .addEventListener(
                        "touchend",
                        event => {

                            const touch =
                                event.changedTouches
                                    ?.[0];


                            if (
                                !touch
                            ) {

                                return;
                            }


                            event.preventDefault();


                            this.handleHousePointer(
                                touch.clientX,
                                touch.clientY
                            );

                        },
                        {
                            passive:
                                false
                        }
                    );
            }


            /*
             * SUCCÈS.
             *
             * Plusieurs noms acceptés
             * pour compatibilité game.js.
             */

            [
                "pyt:level-complete",
                "pyt:level-completed",
                "pyt:game-success"
            ]
                .forEach(
                    eventName => {

                        window.addEventListener(
                            eventName,
                            event =>
                                this.handleCompletionEvent(
                                    event
                                )
                        );
                    }
                );


            /*
             * ÉCHEC.
             */

            [
                "pyt:level-failed",
                "pyt:game-failure"
            ]
                .forEach(
                    eventName => {

                        window.addEventListener(
                            eventName,
                            event => {

                                this.handleFailure(
                                    event.detail ||
                                    {}
                                );
                            }
                        );
                    }
                );


            /*
             * ERREUR DE LIGNE.
             */

            window.addEventListener(
                "pyt:code-error-line",
                event => {

                    const detail =
                        event.detail ||
                        {};


                    this.renderCodeError(
                        detail.line,
                        detail.message
                    );
                }
            );
        }



        bindButton(
            button,
            callback
        ) {

            if (
                !button
            ) {

                return;
            }


            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    callback(
                        event
                    );
                }
            );
        }



        /* =========================================================
           ÉCRANS
        ========================================================= */

        showMapScreen() {

            if (
                window.pytApp &&
                typeof
                window.pytApp.showMap ===
                    "function"
            ) {

                window.pytApp
                    .showMap();

            } else {

                this.fallbackShow(
                    this.mapScreen
                );
            }


            this.setElementVisibility(
                this.mapScreen,
                true
            );
        }



        showTheoryScreen() {

            if (
                window.pytApp &&
                typeof
                window.pytApp.showCourse ===
                    "function"
            ) {

                window.pytApp
                    .showCourse();

            } else {

                this.fallbackShow(
                    this.chapterScreen
                );
            }


            this.setElementVisibility(
                this.chapterScreen,
                true
            );
        }



        showGameScreen() {

            if (
                window.pytApp &&
                typeof
                window.pytApp.showGame ===
                    "function"
            ) {

                window.pytApp
                    .showGame();

            } else {

                this.fallbackShow(
                    this.gameScreen
                );
            }


            this.setElementVisibility(
                this.gameScreen,
                true
            );


            /*
             * Sécurité écran noir.
             */

            if (
                this.gameCanvas
            ) {

                this.gameCanvas.hidden =
                    false;


                this.gameCanvas.style.display =
                    "block";


                this.gameCanvas.style.visibility =
                    "visible";


                this.gameCanvas.style.opacity =
                    "1";
            }
        }



        fallbackShow(
            target
        ) {

            [
                this.chapterScreen,
                this.mapScreen,
                this.gameScreen
            ]
                .forEach(
                    screen => {

                        if (
                            !screen
                        ) {

                            return;
                        }


                        this.setElementVisibility(
                            screen,
                            screen ===
                                target
                        );
                    }
                );
        }



        setElementVisibility(
            element,
            visible
        ) {

            if (
                !element
            ) {

                return;
            }


            element.hidden =
                !visible;


            element
                .classList
                .toggle(
                    "hidden",
                    !visible
                );
        }



        setButtonVisibility(
            element,
            visible
        ) {

            this.setElementVisibility(
                element,
                visible
            );
        }



        /* =========================================================
           TOPBAR
        ========================================================= */

        updateTopBar(
            chapter = null
        ) {

            if (
                this.chapterBadge
            ) {

                if (
                    chapter
                ) {

                    this.chapterBadge.textContent =
                        `Chapitre ${chapter}`;


                    this.setElementVisibility(
                        this.chapterBadge,
                        true
                    );

                } else {

                    this.setElementVisibility(
                        this.chapterBadge,
                        false
                    );
                }
            }


            /*
             * Ces deux éléments ne doivent
             * jamais revenir.
             */

            if (
                this.difficultyBadge
            ) {

                this.difficultyBadge.hidden =
                    true;


                this.difficultyBadge.style.display =
                    "none";
            }


            if (
                this.roomName
            ) {

                this.roomName.hidden =
                    true;


                this.roomName.style.display =
                    "none";
            }


            /*
             * Carte toujours disponible.
             */

            if (
                this.mapButton
            ) {

                this.setElementVisibility(
                    this.mapButton,
                    true
                );


                this.mapButton.textContent =
                    "Carte";
            }


            this.updateTheoryControls();
        }



        /* =========================================================
           MAISON
        ========================================================= */

        openHouseMap(
            firstEntry = false
        ) {

            this.mapMode =
                "house";


            this.selectedChapter =
                null;


            this.currentChapterData =
                null;


            this.currentLevelData =
                null;


            this.currentLevelKey =
                null;


            this.theoryReturnMode =
                "chapter";


            this.showMapScreen();


            this.updateTopBar(
                null
            );


            if (
                this.mapTitle
            ) {

                this.mapTitle.textContent =
                    "Maison de Pyt";
            }


            if (
                this.mapSubtitle
            ) {

                this.mapSubtitle.textContent =
                    "Choisis un chapitre dans la maison.";
            }


            this.setLevelNodesVisible(
                false
            );


            this.setChapterNavigationVisible(
                false
            );


            this.setButtonVisibility(
                this.mapCourseButton,
                false
            );


            requestAnimationFrame(
                () => {

                    if (
                        this.resizeHouseCanvas()
                    ) {

                        this.drawHouseMap();
                    }
                }
            );


            if (
                firstEntry
            ) {

                this.showFirstHouseHint();
            }
        }



        drawHouseMap() {

            if (
                this.mapMode !==
                    "house" ||
                !this.houseContext ||
                !window.PYTArt ||
                typeof
                window.PYTArt
                    .drawHouseMap !==
                    "function"
            ) {

                return;
            }


            this.ensureArtCompatibility();


            const width =
                this.houseCanvas.width;


            const height =
                this.houseCanvas.height;


            if (
                width <
                    10 ||
                height <
                    10
            ) {

                return;
            }


            const radius =
                this.clamp(
                    Math.min(
                        width,
                        height
                    ) *
                        0.040,
                    24,
                    38
                );


            const positions =
                this.getChapterPositions(
                    width,
                    height,
                    radius
                );


            this.houseBadges =
                positions.map(
                    item => {

                        const title =
                            this.getChapterTitle(
                                item.number
                            );


                        return {

                            ...item,

                            title,

                            locked:
                                !this.isChapterUnlocked(
                                    item.number
                                ),

                            completed:
                                this.isLevelCompleted(
                                    item.number,
                                    3
                                )
                        };
                    }
                );


            this.houseContext
                .clearRect(
                    0,
                    0,
                    width,
                    height
                );


            /*
             * IMPORTANT :
             *
             * le rendu est toujours celui
             * de art.js.
             */

            window.PYTArt
                .drawHouseMap(
                    this.houseContext,
                    0,
                    0,
                    width,
                    height,
                    {

                        chapters:
                            this.houseBadges
                                .map(
                                    badge => ({

                                        number:
                                            badge.number,

                                        x:
                                            badge.x,

                                        y:
                                            badge.y,

                                        radius:
                                            badge.radius,

                                        label:
                                            `CHAPITRE ${badge.number}`,

                                        locked:
                                            badge.locked,

                                        active:
                                            false
                                    })
                                )
                    }
                );


            /*
             * Nom du chapitre en petit
             * sous le cercle.
             */

            this.drawChapterNames();
        }



        getChapterPositions(
            width,
            height,
            radius
        ) {

            /*
             * On conserve les positions liées
             * au plan actuel.
             *
             * Pas de refonte graphique ici.
             */

            const values = [

                [
                    1,
                    0.480,
                    0.628
                ],

                [
                    2,
                    0.238,
                    0.628
                ],

                [
                    3,
                    0.238,
                    0.383
                ],

                [
                    4,
                    0.532,
                    0.383
                ],

                [
                    5,
                    0.790,
                    0.628
                ],

                [
                    6,
                    0.790,
                    0.383
                ],

                [
                    7,
                    0.105,
                    0.430
                ],

                [
                    8,
                    0.617,
                    0.628
                ],

                [
                    9,
                    0.520,
                    0.835
                ]
            ];


            return values
                .slice(
                    0,
                    this.getChapterCount()
                )
                .map(
                    item => ({

                        number:
                            item[0],

                        x:
                            width *
                            item[1],

                        y:
                            height *
                            item[2],

                        radius
                    })
                );
        }



        drawChapterNames() {

            if (
                !window.PYTArt ||
                typeof
                window.PYTArt
                    .drawPixelText !==
                    "function"
            ) {

                return;
            }


            const art =
                window.PYTArt;


            this.houseBadges
                .forEach(
                    badge => {

                        const value =
                            this.normalizePixelText(
                                badge.title
                            );


                        art.drawPixelText(
                            this.houseContext,
                            value,
                            badge.x,
                            badge.y +
                                badge.radius +
                                9,
                            {

                                scale:
                                    1,

                                align:
                                    "center",

                                color:
                                    badge.locked
                                        ? "#85828e"
                                        : "#fff1d2",

                                shadow:
                                    "#0c0c14"
                            }
                        );
                    }
                );
        }



        normalizePixelText(
            text
        ) {

            let value =
                String(
                    text ||
                    ""
                )
                    .normalize(
                        "NFD"
                    )
                    .replace(
                        /[\u0300-\u036f]/g,
                        ""
                    )
                    .toUpperCase();


            /*
             * Police pixel art limitée.
             */

            value =
                value.replace(
                    /[^A-Z0-9 .-]/g,
                    " "
                );


            if (
                value.length >
                20
            ) {

                value =
                    value.slice(
                        0,
                        20
                    );
            }


            return value;
        }



        handleHousePointer(
            clientX,
            clientY
        ) {

            if (
                this.mapMode !==
                    "house" ||
                !this.houseCanvas
            ) {

                return;
            }


            const rect =
                this.houseCanvas
                    .getBoundingClientRect();


            if (
                rect.width ===
                    0 ||
                rect.height ===
                    0
            ) {

                return;
            }


            /*
             * Conversion CSS -> canvas.
             */

            const x =
                (
                    clientX -
                    rect.left
                ) *
                (
                    this.houseCanvas.width /
                    rect.width
                );


            const y =
                (
                    clientY -
                    rect.top
                ) *
                (
                    this.houseCanvas.height /
                    rect.height
                );


            const hit =
                this.houseBadges
                    .find(
                        badge => {

                            return (
                                Math.hypot(
                                    x -
                                        badge.x,
                                    y -
                                        badge.y
                                ) <=
                                badge.radius *
                                    1.30
                            );
                        }
                    );


            if (
                !hit
            ) {

                return;
            }


            if (
                hit.locked
            ) {

                this.showGuide(
                    `Le chapitre ${hit.number} est verrouillé. Termine les trois exercices du chapitre précédent.`
                );


                return;
            }


            this.openChapterRoom(
                hit.number
            );
        }



        showFirstHouseHint() {

            const key =
                "pyt-house-intro-seen";


            if (
                localStorage.getItem(
                    key
                ) ===
                "1"
            ) {

                return;
            }


            localStorage.setItem(
                key,
                "1"
            );


            setTimeout(
                () => {

                    this.showGuide(
                        "Commence par le Chapitre 1. Tu peux lire sa théorie avant de commencer l'exercice 1."
                    );

                },
                350
            );
        }



        /* =========================================================
           CARTE D'UN CHAPITRE
        ========================================================= */

        openChapterRoom(
            chapterNumber
        ) {

            const chapter =
                Number(
                    chapterNumber
                );


            if (
                !this.isChapterUnlocked(
                    chapter
                )
            ) {

                this.showGuide(
                    "Ce chapitre n'est pas encore débloqué."
                );


                return;
            }


            const chapterData =
                this.getChapterData(
                    chapter
                );


            if (
                !chapterData
            ) {

                this.showGuide(
                    "Impossible de charger ce chapitre."
                );


                return;
            }


            this.mapMode =
                "chapter";


            this.selectedChapter =
                chapter;


            this.currentChapterData =
                chapterData;


            this.currentLevelData =
                null;


            this.currentLevelKey =
                null;


            this.theoryReturnMode =
                "chapter";


            this.showMapScreen();


            this.updateTopBar(
                chapter
            );


            if (
                this.mapTitle
            ) {

                this.mapTitle.textContent =
                    `Chapitre ${chapter}`;
            }


            if (
                this.mapSubtitle
            ) {

                this.mapSubtitle.textContent =
                    this.getChapterTitle(
                        chapter,
                        chapterData
                    );
            }


            this.setLevelNodesVisible(
                true
            );


            this.setChapterNavigationVisible(
                true
            );


            this.updateLevelNodes();

            this.updateChapterNavigation();

            this.updateTheoryControls();


            requestAnimationFrame(
                () => {

                    if (
                        this.resizeHouseCanvas()
                    ) {

                        this.drawChapterRoom(
                            chapterData
                        );
                    }
                }
            );
        }



        drawChapterRoom(
            chapterData
        ) {

            if (
                this.mapMode !==
                    "chapter" ||
                !this.houseContext ||
                !window.PYTArt ||
                typeof
                window.PYTArt
                    .drawRoomScene !==
                    "function"
            ) {

                return;
            }


            const width =
                this.houseCanvas.width;


            const height =
                this.houseCanvas.height;


            if (
                width <
                    10 ||
                height <
                    10
            ) {

                return;
            }


            this.houseContext
                .clearRect(
                    0,
                    0,
                    width,
                    height
                );


            const margin =
                this.clamp(
                    Math.min(
                        width,
                        height
                    ) *
                        0.035,
                    14,
                    28
                );


            const room =
                chapterData.room ||
                chapterData.location ||
                "entree";


            this.houseContext.save();


            /*
             * Empêche le décor de dépasser
             * de son écran quand la fenêtre
             * est petite.
             */

            this.houseContext
                .beginPath();


            this.houseContext
                .rect(
                    margin,
                    margin,
                    width -
                        margin *
                            2,
                    height -
                        margin *
                            2
                );


            this.houseContext
                .clip();


            window.PYTArt
                .drawRoomScene(
                    this.houseContext,
                    room,
                    margin,
                    margin,
                    width -
                        margin *
                            2,
                    height -
                        margin *
                            2,
                    {

                        furniture:
                            true
                    }
                );


            this.houseContext
                .restore();
        }



        updateLevelNodes() {

            if (
                !this.selectedChapter
            ) {

                return;
            }


            const chapter =
                this.selectedChapter;


            this.levelNodes
                .forEach(
                    (
                        button,
                        index
                    ) => {

                        if (
                            !button
                        ) {

                            return;
                        }


                        const level =
                            index +
                            1;


                        const levelData =
                            this.getLevelData(
                                chapter,
                                level
                            );


                        const unlocked =
                            this.isLevelUnlocked(
                                chapter,
                                level
                            );


                        const completed =
                            this.isLevelCompleted(
                                chapter,
                                level
                            );


                        button.disabled =
                            !unlocked;


                        button.dataset.chapter =
                            String(
                                chapter
                            );


                        button.dataset.level =
                            String(
                                level
                            );


                        button
                            .classList
                            .toggle(
                                "locked",
                                !unlocked
                            );


                        button
                            .classList
                            .toggle(
                                "completed",
                                completed
                            );


                        button
                            .classList
                            .toggle(
                                "available",
                                unlocked &&
                                !completed
                            );


                        const numberNode =
                            button.querySelector(
                                ".level-node-number"
                            );


                        const stateNode =
                            button.querySelector(
                                ".level-node-state"
                            );


                        if (
                            numberNode
                        ) {

                            numberNode.textContent =
                                String(
                                    level
                                );
                        }


                        if (
                            stateNode
                        ) {

                            if (
                                completed
                            ) {

                                stateNode.textContent =
                                    "Terminé";

                            } else if (
                                !unlocked
                            ) {

                                stateNode.textContent =
                                    "Verrouillé";

                            } else {

                                stateNode.textContent =
                                    (
                                        levelData
                                            ?.title ||
                                        `Exercice ${level}`
                                    );
                            }
                        }


                        button.title =
                            completed
                                ? `Rejouer l'exercice ${level}`
                                : !unlocked
                                    ? "Termine l'exercice précédent"
                                    : (
                                        levelData
                                            ?.title ||
                                        `Exercice ${level}`
                                    );
                    }
                );
        }



        setLevelNodesVisible(
            visible
        ) {

            this.levelNodes
                .forEach(
                    button =>
                        this.setElementVisibility(
                            button,
                            visible
                        )
                );
        }



        setChapterNavigationVisible(
            visible
        ) {

            this.setElementVisibility(
                this.previousChapterButton,
                visible
            );


            this.setElementVisibility(
                this.mapChapterIndicator,
                visible
            );


            this.setElementVisibility(
                this.nextChapterButton,
                visible
            );
        }



        updateChapterNavigation() {

            if (
                !this.selectedChapter
            ) {

                return;
            }


            const chapter =
                this.selectedChapter;


            if (
                this.mapChapterIndicator
            ) {

                this.mapChapterIndicator.textContent =
                    `${chapter} / ${this.getChapterCount()}`;
            }


            if (
                this.previousChapterButton
            ) {

                this.previousChapterButton.disabled =
                    false;


                this.previousChapterButton.textContent =
                    chapter ===
                        1
                        ? "← Maison"
                        : `← Chapitre ${chapter - 1}`;
            }


            if (
                this.nextChapterButton
            ) {

                const next =
                    chapter +
                    1;


                const exists =
                    next <=
                    this.getChapterCount();


                this.nextChapterButton.disabled =
                    (
                        !exists ||
                        !this.isChapterUnlocked(
                            next
                        )
                    );


                this.nextChapterButton.textContent =
                    exists
                        ? `Chapitre ${next} →`
                        : "Terminé";
            }
        }



        /* =========================================================
           THÉORIE
        ========================================================= */

        handleTheoryRequest() {

            const chapter =
                Number(
                    this.selectedChapter ||
                    this.currentLevelData
                        ?.chapter ||
                    0
                );


            if (
                !chapter
            ) {

                return;
            }


            if (
                !this.isTheoryAvailable(
                    chapter
                )
            ) {

                this.showGuide(
                    "Tu as commencé l'exercice 1. Termine-le pour redébloquer la théorie."
                );


                return;
            }


            const returnMode =
                this.currentLevelData
                    ? "game"
                    : "chapter";


            this.openTheory(
                chapter,
                returnMode
            );
        }



        openTheory(
            chapterNumber,
            returnMode = "chapter"
        ) {

            const chapter =
                Number(
                    chapterNumber
                );


            if (
                !this.isTheoryAvailable(
                    chapter
                )
            ) {

                this.showGuide(
                    "La théorie sera de nouveau disponible après avoir terminé l'exercice 1."
                );


                return;
            }


            const chapterData =
                this.getChapterData(
                    chapter
                );


            if (
                !chapterData
            ) {

                return;
            }


            this.selectedChapter =
                chapter;


            this.currentChapterData =
                chapterData;


            this.theoryReturnMode =
                returnMode;


            /*
             * Conserve le code si théorie
             * ouverte depuis un exercice.
             */

            if (
                returnMode ===
                    "game" &&
                this.editor
            ) {

                this.savedEditorCode =
                    this.editor.value;
            }


            this.renderTheory(
                chapterData
            );


            this.showTheoryScreen();


            this.updateTopBar(
                chapter
            );


            if (
                this.courseMapButton
            ) {

                this.courseMapButton.textContent =
                    returnMode ===
                        "game"
                        ? "Retour à l'exercice"
                        : "Retour aux exercices";
            }
        }



        returnFromTheory() {

            if (
                this.theoryReturnMode ===
                    "game" &&
                this.currentLevelData
            ) {

                this.showGameScreen();


                if (
                    this.editor
                ) {

                    this.editor.value =
                        this.savedEditorCode;
                }


                this.updateTopBar(
                    this.selectedChapter
                );


                requestAnimationFrame(
                    () => {

                        if (
                            window.pytGame &&
                            typeof
                            window.pytGame
                                .render ===
                                "function"
                        ) {

                            window.pytGame
                                .render();
                        }
                    }
                );


                return;
            }


            this.openChapterRoom(
                this.selectedChapter ||
                1
            );
        }



        renderTheory(
            chapterData
        ) {

            const chapter =
                this.getChapterNumber(
                    chapterData
                );


            if (
                this.courseChapterNumber
            ) {

                this.courseChapterNumber.textContent =
                    `Chapitre ${chapter}`;
            }


            if (
                this.courseTitle
            ) {

                this.courseTitle.textContent =
                    this.getChapterTitle(
                        chapter,
                        chapterData
                    );
            }


            if (
                this.courseSubtitle
            ) {

                this.courseSubtitle.textContent =
                    chapterData.subtitle ||
                    "Théorie Python";
            }


            if (
                !this.courseContent
            ) {

                return;
            }


            this.courseContent
                .replaceChildren();


            const sections =
                this.normalizeTheory(
                    chapterData.theory
                );


            if (
                sections.length ===
                0
            ) {

                const paragraph =
                    document.createElement(
                        "p"
                    );


                paragraph.textContent =
                    "La théorie de ce chapitre sera affichée ici.";


                this.courseContent
                    .appendChild(
                        paragraph
                    );


                return;
            }


            sections
                .forEach(
                    section => {

                        const article =
                            document.createElement(
                                "article"
                            );


                        article.className =
                            "theory-section";


                        if (
                            section.title
                        ) {

                            const heading =
                                document.createElement(
                                    "h3"
                                );


                            heading.textContent =
                                section.title;


                            article
                                .appendChild(
                                    heading
                                );
                        }


                        const paragraphs =
                            Array.isArray(
                                section.body
                            )
                                ? section.body
                                : [
                                    section.body
                                ];


                        paragraphs
                            .filter(
                                Boolean
                            )
                            .forEach(
                                text => {

                                    const paragraph =
                                        document.createElement(
                                            "p"
                                        );


                                    paragraph.textContent =
                                        String(
                                            text
                                        );


                                    article
                                        .appendChild(
                                            paragraph
                                        );
                                }
                            );


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
                                String(
                                    section.code
                                );


                            pre.appendChild(
                                code
                            );


                            article.appendChild(
                                pre
                            );
                        }


                        this.courseContent
                            .appendChild(
                                article
                            );
                    }
                );
        }



        normalizeTheory(
            theory
        ) {

            if (
                !theory
            ) {

                return [];
            }


            if (
                typeof theory ===
                    "string"
            ) {

                return [
                    {
                        body:
                            theory
                    }
                ];
            }


            if (
                Array.isArray(
                    theory
                )
            ) {

                return theory.map(
                    item => {

                        if (
                            typeof item ===
                                "string"
                        ) {

                            return {
                                body:
                                    item
                            };
                        }


                        return {

                            title:
                                item.title ||
                                item.heading ||
                                "",

                            body:
                                item.body ||
                                item.text ||
                                item.description ||
                                "",

                            code:
                                item.code ||
                                item.example ||
                                ""
                        };
                    }
                );
            }


            if (
                Array.isArray(
                    theory.sections
                )
            ) {

                const result =
                    [];


                if (
                    theory.intro
                ) {

                    result.push(
                        {
                            body:
                                theory.intro
                        }
                    );
                }


                theory.sections
                    .forEach(
                        item => {

                            result.push(
                                {

                                    title:
                                        item.title ||
                                        item.heading ||
                                        "",

                                    body:
                                        item.body ||
                                        item.text ||
                                        item.description ||
                                        "",

                                    code:
                                        item.code ||
                                        item.example ||
                                        ""
                                }
                            );
                        }
                    );


                return result;
            }


            return [
                {

                    title:
                        theory.title ||
                        "",

                    body:
                        theory.body ||
                        theory.text ||
                        theory.intro ||
                        "",

                    code:
                        theory.code ||
                        theory.example ||
                        ""
                }
            ];
        }



        /* =========================================================
           EXERCICE
        ========================================================= */

        openLevel(
            chapterNumber,
            levelNumber
        ) {

            const chapter =
                Number(
                    chapterNumber
                );


            const level =
                Number(
                    levelNumber
                );


            if (
                !this.isLevelUnlocked(
                    chapter,
                    level
                )
            ) {

                this.showGuide(
                    "Termine d'abord l'exercice précédent."
                );


                return;
            }


            const levelData =
                this.getLevelData(
                    chapter,
                    level
                );


            if (
                !levelData
            ) {

                this.showGuide(
                    "Impossible de charger cet exercice."
                );


                return;
            }


            /*
             * Dès que exercice 1 est réellement
             * ouvert, la théorie se verrouille
             * jusqu'à sa réussite.
             */

            this.markLevelStarted(
                chapter,
                level
            );


            this.selectedChapter =
                chapter;


            this.currentChapterData =
                this.getChapterData(
                    chapter
                );


            this.currentLevelData =
                levelData;


            this.currentLevelKey =
                this.makeLevelKey(
                    chapter,
                    level
                );


            this.theoryReturnMode =
                "game";


            this.savedEditorCode =
                "";


            if (
                this.missionTitle
            ) {

                this.missionTitle.textContent =
                    levelData.title ||
                    `Exercice ${level}`;
            }


            if (
                this.missionInstruction
            ) {

                this.missionInstruction.textContent =
                    levelData.instruction ||
                    levelData.mission ||
                    levelData.objective ||
                    "Aide Pyt à terminer sa mission.";
            }


            if (
                this.gameStatus
            ) {

                this.gameStatus.textContent =
                    `Chapitre ${chapter} · Exercice ${level}`;
            }


            /*
             * Starter code.
             */

            if (
                this.editor
            ) {

                this.editor.value =
                    String(
                        levelData.starterCode ??
                        levelData.startCode ??
                        levelData.code ??
                        ""
                    );
            }


            this.clearCodeError();

            this.clearConsole();


            /*
             * IMPORTANT ÉCRAN NOIR :
             *
             * on rend l'écran visible AVANT
             * d'appeler loadLevel().
             */

            this.showGameScreen();


            this.updateTopBar(
                chapter
            );


            requestAnimationFrame(
                () => {

                    requestAnimationFrame(
                        () => {

                            try {

                                if (
                                    !window.pytGame
                                ) {

                                    throw new Error(
                                        "Le moteur du jeu n'est pas disponible."
                                    );
                                }


                                if (
                                    typeof
                                    window.pytGame
                                        .loadLevel ===
                                        "function"
                                ) {

                                    window.pytGame
                                        .loadLevel(
                                            levelData
                                        );

                                } else if (
                                    typeof
                                    window.pytGame
                                        .openLevel ===
                                        "function"
                                ) {

                                    window.pytGame
                                        .openLevel(
                                            levelData
                                        );

                                } else {

                                    throw new Error(
                                        "Aucune méthode de chargement de niveau trouvée."
                                    );
                                }


                                if (
                                    typeof
                                    window.pytGame
                                        .resizeCanvas ===
                                        "function"
                                ) {

                                    window.pytGame
                                        .resizeCanvas();
                                }


                                if (
                                    typeof
                                    window.pytGame
                                        .render ===
                                        "function"
                                ) {

                                    window.pytGame
                                        .render();
                                }


                                window.dispatchEvent(
                                    new CustomEvent(
                                        "pyt:level-opened",
                                        {

                                            detail: {

                                                chapter,

                                                level,

                                                levelData
                                            }
                                        }
                                    )
                                );

                            } catch (
                                error
                            ) {

                                console.error(
                                    "[PYT] Erreur exercice :",
                                    error
                                );


                                if (
                                    this.gameStatus
                                ) {

                                    this.gameStatus.textContent =
                                        "Erreur de chargement";
                                }


                                this.showGuide(
                                    "L'exercice n'a pas pu se charger correctement."
                                );
                            }
                        }
                    );
                }
            );
        }



        /* =========================================================
           SUCCÈS
        ========================================================= */

        handleCompletionEvent(
            event
        ) {

            const detail =
                event?.detail ||
                {};


            /*
             * Évite le double traitement
             * si game.js envoie plusieurs
             * événements compatibles.
             */

            const detailData =
                detail.levelData ||
                detail.level;


            if (
                detailData &&
                typeof detailData ===
                    "object"
            ) {

                this.completeLevel(
                    detailData
                );

                return;
            }


            this.completeLevel(
                this.currentLevelData
            );
        }



        completeLevel(
            levelData
        ) {

            const data =
                levelData ||
                this.currentLevelData;


            if (
                !data
            ) {

                return;
            }


            const chapter =
                Number(
                    data.chapter ??
                    this.selectedChapter ??
                    1
                );


            const level =
                Number(
                    data.level ??
                    data.number ??
                    this.currentLevelData
                        ?.level ??
                    1
                );


            const key =
                this.makeLevelKey(
                    chapter,
                    level
                );


            /*
             * Si déjà traité :
             * ne pas refaire la progression.
             */

            const wasCompleted =
                Boolean(
                    this.completed[
                        key
                    ]
                );


            this.markLevelCompleted(
                chapter,
                level
            );


            /*
             * Exercice 1 terminé :
             * théorie immédiatement
             * disponible à nouveau.
             */

            this.updateTheoryControls();


            if (
                wasCompleted
            ) {

                return;
            }


            if (
                level <
                3
            ) {

                this.showCompletion(
                    "Exercice réussi",
                    `L'exercice ${level + 1} est maintenant débloqué.`,
                    "Exercice suivant",
                    () => {

                        this.openLevel(
                            chapter,
                            level +
                                1
                        );
                    },
                    "Retour aux exercices",
                    () => {

                        this.openChapterRoom(
                            chapter
                        );
                    }
                );


                return;
            }


            const lastChapter =
                chapter >=
                this.getChapterCount();


            if (
                lastChapter
            ) {

                this.showCompletion(
                    "Mission terminée",
                    "Tu as terminé tous les chapitres de PYT.",
                    "Retour à la maison",
                    () =>
                        this.openHouseMap()
                );

            } else {

                this.showCompletion(
                    `Chapitre ${chapter} terminé`,
                    `Le Chapitre ${chapter + 1} est maintenant débloqué.`,
                    "Retour à la maison",
                    () =>
                        this.openHouseMap()
                );
            }
        }



        /* =========================================================
           ÉCHECS
        ========================================================= */

        handleFailure(
            detail = {}
        ) {

            if (
                !this.currentLevelKey
            ) {

                return;
            }


            this.failureCounts[
                this.currentLevelKey
            ] =
                Number(
                    this.failureCounts[
                        this.currentLevelKey
                    ] ||
                    0
                ) +
                1;


            const count =
                this.failureCounts[
                    this.currentLevelKey
                ];


            /*
             * PREMIER ÉCHEC :
             * aucune ligne soulignée.
             */

            if (
                count ===
                1
            ) {

                this.clearCodeError();


                this.showGuide(
                    "Ce n’est pas là que je voulais aller... Observe ce que Pyt a fait et réessaie."
                );


                return;
            }


            /*
             * DEUXIÈME ÉCHEC ET PLUS :
             * ligne seulement si réellement fournie.
             */

            const line =
                Number(
                    detail.line ??
                    detail.lineNumber ??
                    detail.errorLine ??
                    0
                );


            if (
                line >
                0
            ) {

                this.renderCodeError(
                    line,
                    detail.message ||
                    detail.error ||
                    "Vérifie cette ligne."
                );
            }


            this.showGuide(
                "Regarde attentivement le trajet de Pyt et vérifie la logique de ton programme."
            );
        }



        renderCodeError(
            line,
            message = ""
        ) {

            if (
                !this.codeErrorHighlights ||
                !line
            ) {

                return;
            }


            this.codeErrorHighlights
                .replaceChildren();


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "code-error-line";


            item.textContent =
                message
                    ? `Ligne ${line} : ${message}`
                    : `Vérifie la ligne ${line}.`;


            this.codeErrorHighlights
                .appendChild(
                    item
                );


            this.setElementVisibility(
                this.codeErrorHighlights,
                true
            );
        }



        clearCodeError() {

            if (
                !this.codeErrorHighlights
            ) {

                return;
            }


            this.codeErrorHighlights
                .replaceChildren();


            this.setElementVisibility(
                this.codeErrorHighlights,
                false
            );
        }



        clearConsole() {

            if (
                this.consoleOutput
            ) {

                this.consoleOutput.textContent =
                    "";
            }
        }



        /* =========================================================
           GUIDE
        ========================================================= */

        showGuide(
            message
        ) {

            if (
                window.pytApp &&
                typeof
                window.pytApp.showGuide ===
                    "function"
            ) {

                window.pytApp
                    .showGuide(
                        message
                    );


                return;
            }


            console.info(
                "[PYT]",
                message
            );
        }



        /* =========================================================
           MODALE
        ========================================================= */

        showCompletion(
            title,
            message,
            primaryText,
            primaryAction,
            secondaryText = "",
            secondaryAction = null
        ) {

            if (
                window.pytApp &&
                typeof
                window.pytApp.showModal ===
                    "function"
            ) {

                window.pytApp
                    .showModal(
                        {

                            label:
                                "PYT",

                            title,

                            message,

                            primaryText,

                            primaryAction,

                            secondaryText,

                            secondaryAction
                        }
                    );


                return;
            }


            /*
             * Fallback minimal.
             */

            if (
                typeof
                primaryAction ===
                    "function"
            ) {

                primaryAction();
            }
        }



        /* =========================================================
           REFRESH
        ========================================================= */

        refresh() {

            this.prepareStaticUi();


            if (
                this.mapMode ===
                    "house"
            ) {

                this.drawHouseMap();

            } else if (
                this.mapMode ===
                    "chapter" &&
                this.currentChapterData
            ) {

                this.drawChapterRoom(
                    this.currentChapterData
                );
            }


            this.updateTheoryControls();
        }



        /* =========================================================
           RESET DEBUG
        ========================================================= */

        resetProgress() {

            this.completed =
                {};


            this.started =
                {};


            this.failureCounts =
                {};


            this.saveStorageObject(
                this.progressKey,
                this.completed
            );


            this.saveStorageObject(
                this.startedKey,
                this.started
            );


            this.openHouseMap();
        }



        /* =========================================================
           UTILS
        ========================================================= */

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
    }



    /* =============================================================
       EXPORT
    ============================================================= */

    window.PytUI =
        PytUI;



    const start =
        () => {

            if (
                window.pytUI
            ) {

                return;
            }


            window.pytUI =
                new PytUI();
        };


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            start,
            {
                once:
                    true
            }
        );

    } else {

        start();
    }

})();