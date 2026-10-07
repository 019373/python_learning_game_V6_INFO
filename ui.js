"use strict";

(() => {

    class PytUI {

        constructor() {

            this.progressKey =
                "pyt-progress";

            this.attemptsKey =
                "pyt-attempts";


            this.completed =
                this.loadObject(
                    this.progressKey
                );


            this.attempts =
                this.loadObject(
                    this.attemptsKey
                );


            this.failureCounts =
                {};


            this.mapMode =
                "house";


            this.selectedChapter =
                null;


            this.currentLevelData =
                null;


            this.loadedLevelKey =
                null;


            this.theoryReturnToGame =
                false;


            this.savedEditorCode =
                "";


            this.houseBadges =
                [];


            this.houseAnimationTimer =
                null;


            this.resizeObserver =
                null;


            this.cacheDom();

            this.repairArtCompatibility();

            this.ensureHouseCanvas();

            this.bindEvents();

            this.prepareStaticUi();

            this.startResizeObserver();

            this.startMapAnimation();


            setTimeout(
                () => {

                    this.resizeHouseCanvas();

                    this.refresh();

                },
                0
            );
        }



        /* =====================================================
           DOM
        ===================================================== */

        cacheDom() {

            const byId =
                id =>
                    document.getElementById(
                        id
                    );


            this.chapterScreen =
                byId(
                    "chapter-screen"
                );


            this.courseChapterNumber =
                byId(
                    "course-chapter-number"
                );


            this.courseTitle =
                byId(
                    "course-title"
                );


            this.courseSubtitle =
                byId(
                    "course-subtitle"
                );


            this.courseContent =
                byId(
                    "course-content"
                );


            this.courseMapButton =
                byId(
                    "course-map-button"
                );


            this.mapScreen =
                byId(
                    "map-screen"
                );


            this.mapBackground =
                byId(
                    "map-background"
                );


            this.mapTitle =
                byId(
                    "map-title"
                );


            this.mapSubtitle =
                byId(
                    "map-subtitle"
                );


            this.mapCourseButton =
                byId(
                    "map-course-button"
                );


            this.mapDecoration =
                byId(
                    "map-decoration"
                );


            this.levelNodes = [

                byId(
                    "level-node-1"
                ),

                byId(
                    "level-node-2"
                ),

                byId(
                    "level-node-3"
                )
            ];


            this.previousChapterButton =
                byId(
                    "previous-chapter-button"
                );


            this.mapChapterIndicator =
                byId(
                    "map-chapter-indicator"
                );


            this.nextChapterButton =
                byId(
                    "next-chapter-button"
                );


            this.gameScreen =
                byId(
                    "game-screen"
                );


            this.gameCanvas =
                byId(
                    "game-canvas"
                );


            this.gameStatus =
                byId(
                    "game-status"
                );


            this.missionTitle =
                byId(
                    "mission-title"
                );


            this.missionInstruction =
                byId(
                    "mission-instruction"
                );


            this.chapterBadge =
                byId(
                    "chapter-badge"
                );


            this.difficultyBadge =
                byId(
                    "difficulty-badge"
                );


            this.roomName =
                byId(
                    "room-name"
                );


            this.courseButton =
                byId(
                    "course-button"
                );


            this.mapButton =
                byId(
                    "map-button"
                );


            this.editor =
                byId(
                    "code-editor"
                );


            this.consoleOutput =
                byId(
                    "console-output"
                );


            this.codeErrorHighlights =
                byId(
                    "code-error-highlights"
                );


            this.guide =
                byId(
                    "pyt-guide"
                );


            this.guideMessage =
                byId(
                    "pyt-guide-message"
                );


            this.guideActions =
                byId(
                    "pyt-guide-actions"
                );


            this.modalBackground =
                byId(
                    "modal-background"
                );


            this.modalLabel =
                byId(
                    "modal-label"
                );


            this.modalTitle =
                byId(
                    "modal-title"
                );


            this.modalMessage =
                byId(
                    "modal-message"
                );


            this.modalPrimaryButton =
                byId(
                    "modal-primary-button"
                );


            this.modalSecondaryButton =
                byId(
                    "modal-secondary-button"
                );
        }



        /* =====================================================
           SAUVEGARDE
        ===================================================== */

        loadObject(
            key
        ) {

            try {

                const parsed =
                    JSON.parse(
                        localStorage.getItem(
                            key
                        ) ||
                        "{}"
                    );


                return (
                    parsed &&
                    typeof parsed ===
                    "object" &&
                    !Array.isArray(
                        parsed
                    )
                )
                    ? parsed
                    : {};

            } catch (
                error
            ) {

                console.warn(
                    `[PYT] Impossible de lire ${key}.`,
                    error
                );


                return {};
            }
        }



        saveObject(
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
                    `[PYT] Impossible de sauvegarder ${key}.`,
                    error
                );
            }
        }



        /* =====================================================
           COMPATIBILITÉ ART.JS
           ON NE MODIFIE PAS ART.JS
        ===================================================== */

        repairArtCompatibility() {

            const art =
                window.PYTArt;


            if (
                !art ||
                !art.palette
            ) {

                return;
            }


            /*
             * L'ancien art.js appelle parfois :
             *
             * palette.glassBlue()
             * palette.glassSteel()
             *
             * On ajoute donc la compatibilité depuis ici
             * sans toucher au fichier art.js.
             */

            if (
                typeof
                art.palette
                    .glassBlue !==
                "function"
            ) {

                const value =
                    art.palette
                        .glassBlue ||
                    "#74c9dd";


                art.palette
                    .glassBlue =
                    () =>
                        value;
            }


            if (
                typeof
                art.palette
                    .glassSteel !==
                "function"
            ) {

                const value =
                    art.palette
                        .glassSteel ||
                    "#9dc3c8";


                art.palette
                    .glassSteel =
                    () =>
                        value;
            }
        }



        /* =====================================================
           CANVAS CARTE
        ===================================================== */

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
                    "Plan de la maison PYT"
                );


                canvas.style.position =
                    "absolute";


                canvas.style.inset =
                    "0";


                canvas.style.width =
                    "100%";


                canvas.style.height =
                    "100%";


                canvas.style.display =
                    "block";


                canvas.style.imageRendering =
                    "pixelated";


                canvas.style.touchAction =
                    "manipulation";


                canvas.style.pointerEvents =
                    "auto";


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


            this.mapDecoration
                .style.position =
                "relative";


            this.mapDecoration
                .style.overflow =
                "hidden";


            this.mapDecoration
                .style.pointerEvents =
                "auto";
        }



        resizeHouseCanvas() {

            if (
                !this.houseCanvas ||
                !this.mapDecoration ||
                !this.houseContext
            ) {

                return;
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

                return;
            }


            const dpr =
                Math.min(
                    window.devicePixelRatio ||
                    1,
                    2
                );


            const targetWidth =
                Math.max(
                    1,
                    Math.round(
                        rect.width *
                        dpr
                    )
                );


            const targetHeight =
                Math.max(
                    1,
                    Math.round(
                        rect.height *
                        dpr
                    )
                );


            if (
                this.houseCanvas.width !==
                    targetWidth ||
                this.houseCanvas.height !==
                    targetHeight
            ) {

                this.houseCanvas.width =
                    targetWidth;


                this.houseCanvas.height =
                    targetHeight;
            }


            this.houseCanvas
                .dataset.logicalWidth =
                String(
                    rect.width
                );


            this.houseCanvas
                .dataset.logicalHeight =
                String(
                    rect.height
                );


            this.houseContext
                .setTransform(
                    dpr,
                    0,
                    0,
                    dpr,
                    0,
                    0
                );


            this.houseContext
                .imageSmoothingEnabled =
                false;
        }



        getCanvasLogicalSize() {

            if (
                !this.houseCanvas ||
                !this.mapDecoration
            ) {

                return {
                    width: 0,
                    height: 0
                };
            }


            const rect =
                this.mapDecoration
                    .getBoundingClientRect();


            return {

                width:
                    Math.max(
                        0,
                        rect.width
                    ),

                height:
                    Math.max(
                        0,
                        rect.height
                    )
            };
        }



        startResizeObserver() {

            if (
                !this.mapDecoration ||
                typeof
                ResizeObserver ===
                "undefined"
            ) {

                return;
            }


            this.resizeObserver =
                new ResizeObserver(
                    () => {

                        this.resizeHouseCanvas();

                        this.refresh();
                    }
                );


            this.resizeObserver
                .observe(
                    this.mapDecoration
                );
        }



        startMapAnimation() {

            if (
                this.houseAnimationTimer
            ) {

                clearInterval(
                    this.houseAnimationTimer
                );
            }


            this.houseAnimationTimer =
                setInterval(
                    () => {

                        if (
                            !this.mapScreen ||
                            this.mapScreen
                                .classList
                                .contains(
                                    "hidden"
                                )
                        ) {

                            return;
                        }


                        this.refresh();

                    },
                    220
                );
        }



        /* =====================================================
           EVENTS
        ===================================================== */

        bindEvents() {

            /*
             * Carte.
             */

            this.bindCapture(
                this.mapButton,
                () =>
                    this.openHouseMap()
            );


            /*
             * Théorie.
             */

            this.bindCapture(
                this.courseButton,
                () => {

                    if (
                        !this.currentLevelData
                    ) {

                        this.showGuideMessage(
                            "La théorie se débloque après ton premier essai dans un exercice."
                        );


                        return;
                    }


                    if (
                        !this
                            .isTheoryUnlockedForCurrentLevel()
                    ) {

                        this.showGuideMessage(
                            "Essaie d'abord l'exercice une fois. La théorie sera ensuite disponible ici."
                        );


                        return;
                    }


                    this.openTheoryReview();
                }
            );


            /*
             * Retour depuis théorie.
             */

            this.bindCapture(
                this.courseMapButton,
                () => {

                    if (
                        this.theoryReturnToGame &&
                        this.currentLevelData
                    ) {

                        this.returnFromTheoryToGame();

                        return;
                    }


                    if (
                        this.selectedChapter
                    ) {

                        this.openChapterRoom(
                            this.selectedChapter
                        );

                    } else {

                        this.openHouseMap();
                    }
                }
            );


            /*
             * Le bouton théorie présent
             * directement sur la carte n'est plus
             * accessible.
             */

            if (
                this.mapCourseButton
            ) {

                this.mapCourseButton
                    .classList
                    .add(
                        "hidden"
                    );


                this.mapCourseButton.hidden =
                    true;
            }


            /*
             * Navigation entre chapitres.
             */

            this.bindCapture(
                this.previousChapterButton,
                () => {

                    if (
                        !this.selectedChapter
                    ) {

                        return;
                    }


                    const target =
                        this.selectedChapter -
                        1;


                    if (
                        target >=
                        1
                    ) {

                        this.openChapterRoom(
                            target
                        );
                    }
                }
            );


            this.bindCapture(
                this.nextChapterButton,
                () => {

                    if (
                        !this.selectedChapter
                    ) {

                        return;
                    }


                    const target =
                        this.selectedChapter +
                        1;


                    if (
                        target <=
                            this.getChapterCount() &&
                        this.isChapterUnlocked(
                            target
                        )
                    ) {

                        this.openChapterRoom(
                            target
                        );
                    }
                }
            );


            /*
             * Exercices.
             */

            this.levelNodes
                .forEach(
                    (
                        button,
                        index
                    ) => {

                        this.bindCapture(
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
             * Clic plan maison.
             */

            if (
                this.houseCanvas
            ) {

                this.houseCanvas
                    .addEventListener(
                        "click",
                        event =>
                            this.handleHouseCanvasClick(
                                event
                            )
                    );


                this.houseCanvas
                    .addEventListener(
                        "touchend",
                        event => {

                            if (
                                !event.changedTouches ||
                                !event.changedTouches[
                                    0
                                ]
                            ) {

                                return;
                            }


                            event.preventDefault();


                            this.handleHousePointer(
                                event.changedTouches[
                                    0
                                ].clientX,
                                event.changedTouches[
                                    0
                                ].clientY
                            );

                        },
                        {
                            passive:
                                false
                        }
                    );
            }


            /*
             * PREMIER ESSAI.
             *
             * Dès que Exécuter est pressé,
             * la théorie devient accessible.
             */

            const attemptHandler =
                event => {

                    if (
                        !this.currentLevelData
                    ) {

                        return;
                    }


                    if (
                        event &&
                        event
                            .__pytAttemptCounted
                    ) {

                        return;
                    }


                    if (
                        event
                    ) {

                        event
                            .__pytAttemptCounted =
                            true;
                    }


                    this.registerCurrentAttempt();
                };


            window.addEventListener(
                "pyt:run-code",
                attemptHandler
            );


            document.addEventListener(
                "pyt:run-code",
                attemptHandler
            );


            /*
             * Succès.
             */

            [
                "pyt:level-complete",
                "pyt:level-completed",
                "pyt:game-success"
            ]
                .forEach(
                    name => {

                        window.addEventListener(
                            name,
                            event => {

                                const detail =
                                    event.detail ||
                                    {};


                                this.completeLevel(
                                    detail.level ||
                                    detail.levelData ||
                                    this.currentLevelData
                                );
                            }
                        );
                    }
                );


            /*
             * Échec.
             */

            [
                "pyt:level-failed",
                "pyt:game-failure"
            ]
                .forEach(
                    name => {

                        window.addEventListener(
                            name,
                            event => {

                                this.handleLevelFailure(
                                    event.detail ||
                                    {}
                                );
                            }
                        );
                    }
                );


            window.addEventListener(
                "pyt:app-ready",
                () => {

                    this.resizeHouseCanvas();

                    this.refresh();
                }
            );


            window.addEventListener(
                "resize",
                () => {

                    this.resizeHouseCanvas();

                    this.refresh();
                },
                {
                    passive:
                        true
                }
            );
        }



        bindCapture(
            element,
            handler
        ) {

            if (
                !element ||
                element
                    .dataset
                    .pytUiBound ===
                    "1"
            ) {

                return;
            }


            element
                .dataset
                .pytUiBound =
                "1";


            element.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopImmediatePropagation();

                    handler(
                        event
                    );

                },
                true
            );
        }



        /* =====================================================
           UI FIXE
        ===================================================== */

        prepareStaticUi() {

            /*
             * On supprime visuellement
             * "Découverte".
             */

            if (
                this.difficultyBadge
            ) {

                this.difficultyBadge
                    .classList
                    .add(
                        "hidden"
                    );


                this.difficultyBadge.hidden =
                    true;


                this.difficultyBadge
                    .style.display =
                    "none";
            }


            /*
             * On supprime le nom de pièce
             * comme "Entrée" dans la barre.
             */

            if (
                this.roomName
            ) {

                this.roomName
                    .classList
                    .add(
                        "hidden"
                    );


                this.roomName.hidden =
                    true;


                this.roomName
                    .style.display =
                    "none";
            }


            /*
             * Carte reste disponible.
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


            if (
                this.courseButton
            ) {

                this.courseButton.textContent =
                    "Théorie";
            }


            if (
                this.mapCourseButton
            ) {

                this.mapCourseButton.hidden =
                    true;


                this.mapCourseButton
                    .classList
                    .add(
                        "hidden"
                    );
            }
        }



        /* =====================================================
           DONNÉES
        ===================================================== */

        getDataSource() {

            return (
                window.PYT_LEVELS ||
                window.PYTLevels ||
                {
                    chapters:
                        []
                }
            );
        }



        getChapters() {

            const source =
                this.getDataSource();


            return Array.isArray(
                source.chapters
            )
                ? source.chapters
                : [];
        }



        getChapterCount() {

            return (
                this.getChapters()
                    .length ||
                9
            );
        }



        getChapterData(
            chapterNumber
        ) {

            const chapters =
                this.getChapters();


            return (
                chapters.find(
                    (
                        chapter,
                        index
                    ) => {

                        const value =
                            Number(
                                chapter.chapter ??
                                chapter.number ??
                                index +
                                    1
                            );


                        return (
                            value ===
                            Number(
                                chapterNumber
                            )
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
                this.getChapterData(
                    chapterNumber
                );


            if (
                !chapter ||
                !Array.isArray(
                    chapter.levels
                )
            ) {

                return null;
            }


            return (
                chapter.levels
                    .find(
                        (
                            level,
                            index
                        ) => {

                            const value =
                                Number(
                                    level.level ??
                                    level.number ??
                                    index +
                                        1
                                );


                            return (
                                value ===
                                Number(
                                    levelNumber
                                )
                            );
                        }
                    ) ||
                null
            );
        }



        levelKey(
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



        levelKeyFromData(
            levelData
        ) {

            if (
                !levelData
            ) {

                return null;
            }


            const chapter =
                Number(
                    levelData.chapter ??
                    this.selectedChapter ??
                    1
                );


            const level =
                Number(
                    levelData.level ??
                    levelData.number ??
                    1
                );


            return this.levelKey(
                chapter,
                level
            );
        }



        /* =====================================================
           PROGRESSION
        ===================================================== */

        isLevelComplete(
            chapter,
            level
        ) {

            return Boolean(
                this.completed[
                    this.levelKey(
                        chapter,
                        level
                    )
                ]
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


            return this.isLevelComplete(
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
                l <=
                1
            ) {

                return true;
            }


            return this.isLevelComplete(
                c,
                l -
                    1
            );
        }



        /* =====================================================
           TENTATIVES / THÉORIE
        ===================================================== */

        getAttemptCount(
            chapter,
            level
        ) {

            return Number(
                this.attempts[
                    this.levelKey(
                        chapter,
                        level
                    )
                ] ||
                0
            );
        }



        registerCurrentAttempt() {

            if (
                !this.currentLevelData
            ) {

                return;
            }


            const key =
                this.levelKeyFromData(
                    this.currentLevelData
                );


            if (
                !key
            ) {

                return;
            }


            this.attempts[
                key
            ] =
                Number(
                    this.attempts[
                        key
                    ] ||
                    0
                ) +
                1;


            this.saveObject(
                this.attemptsKey,
                this.attempts
            );


            this.updateTheoryButton();


            window.dispatchEvent(
                new CustomEvent(
                    "pyt:theory-unlocked",
                    {

                        detail: {

                            chapter:
                                Number(
                                    this.currentLevelData
                                        .chapter ??
                                    this.selectedChapter
                                ),

                            level:
                                Number(
                                    this.currentLevelData
                                        .level ??
                                    this.currentLevelData
                                        .number ??
                                    1
                                ),

                            attempts:
                                this.attempts[
                                    key
                                ]
                        }
                    }
                )
            );
        }



        isTheoryUnlockedForCurrentLevel() {

            if (
                !this.currentLevelData
            ) {

                return false;
            }


            const key =
                this.levelKeyFromData(
                    this.currentLevelData
                );


            return (
                key
                    ? Number(
                        this.attempts[
                            key
                        ] ||
                        0
                    ) >=
                        1
                    : false
            );
        }



        updateTheoryButton() {

            if (
                !this.courseButton
            ) {

                return;
            }


            const inExercise =
                Boolean(
                    this.currentLevelData
                );


            const unlocked =
                inExercise &&
                this
                    .isTheoryUnlockedForCurrentLevel();


            /*
             * Hors exercice :
             * pas de bouton théorie.
             */

            this.courseButton.hidden =
                !inExercise;


            this.courseButton
                .classList
                .toggle(
                    "hidden",
                    !inExercise
                );


            /*
             * Pendant exercice :
             * visible mais verrouillé
             * avant le premier essai.
             */

            this.courseButton.disabled =
                !unlocked;


            this.courseButton
                .classList
                .toggle(
                    "theory-locked",
                    inExercise &&
                    !unlocked
                );


            this.courseButton
                .setAttribute(
                    "aria-disabled",
                    String(
                        !unlocked
                    )
                );


            this.courseButton.title =
                unlocked
                    ? "Ouvrir la théorie"
                    : "Fais d'abord un essai dans cet exercice";
        }



        /* =====================================================
           TOP BAR
        ===================================================== */

        updateTopBar(
            chapterNumber = null
        ) {

            if (
                this.chapterBadge
            ) {

                if (
                    chapterNumber
                ) {

                    this.chapterBadge.hidden =
                        false;


                    this.chapterBadge
                        .classList
                        .remove(
                            "hidden"
                        );


                    this.chapterBadge.textContent =
                        `Chapitre ${chapterNumber}`;

                } else {

                    this.chapterBadge.hidden =
                        true;


                    this.chapterBadge
                        .classList
                        .add(
                            "hidden"
                        );
                }
            }


            /*
             * Jamais "Découverte".
             */

            if (
                this.difficultyBadge
            ) {

                this.difficultyBadge.hidden =
                    true;


                this.difficultyBadge
                    .style.display =
                    "none";
            }


            /*
             * Jamais "Entrée" en haut.
             */

            if (
                this.roomName
            ) {

                this.roomName.hidden =
                    true;


                this.roomName
                    .style.display =
                    "none";
            }


            /*
             * Carte toujours présente.
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
            }


            this.updateTheoryButton();
        }



        /* =====================================================
           AFFICHAGE ÉCRANS
        ===================================================== */

        showMapScreen() {

            if (
                window.pytApp &&
                typeof
                window.pytApp
                    .showMap ===
                "function"
            ) {

                window.pytApp
                    .showMap();

            } else {

                this.fallbackShowScreen(
                    this.mapScreen
                );
            }


            if (
                this.mapScreen
            ) {

                this.mapScreen
                    .classList
                    .remove(
                        "hidden"
                    );


                this.mapScreen.hidden =
                    false;
            }
        }



        showCourseScreen() {

            if (
                window.pytApp &&
                typeof
                window.pytApp
                    .showCourse ===
                "function"
            ) {

                window.pytApp
                    .showCourse();

            } else {

                this.fallbackShowScreen(
                    this.chapterScreen
                );
            }


            if (
                this.chapterScreen
            ) {

                this.chapterScreen
                    .classList
                    .remove(
                        "hidden"
                    );


                this.chapterScreen.hidden =
                    false;
            }
        }



        showGameScreen() {

            if (
                window.pytApp &&
                typeof
                window.pytApp
                    .showGame ===
                "function"
            ) {

                window.pytApp
                    .showGame();

            } else {

                this.fallbackShowScreen(
                    this.gameScreen
                );
            }


            if (
                this.gameScreen
            ) {

                this.gameScreen
                    .classList
                    .remove(
                        "hidden"
                    );


                this.gameScreen.hidden =
                    false;
            }
        }



        fallbackShowScreen(
            target
        ) {

            [
                this.mapScreen,
                this.chapterScreen,
                this.gameScreen
            ]
                .forEach(
                    screen => {

                        if (
                            !screen
                        ) {

                            return;
                        }


                        const active =
                            screen ===
                            target;


                        screen.hidden =
                            !active;


                        screen
                            .classList
                            .toggle(
                                "hidden",
                                !active
                            );
                    }
                );
        }



        /* =====================================================
           CARTE GLOBALE
        ===================================================== */

        openHouseMap(
            firstEntry = false
        ) {

            this.mapMode =
                "house";


            this.selectedChapter =
                null;


            this.theoryReturnToGame =
                false;


            this.currentLevelData =
                null;


            this.loadedLevelKey =
                null;


            this.showMapScreen();

            this.updateTopBar(
                null
            );


            if (
                this.mapTitle
            ) {

                this.mapTitle.textContent =
                    "Maison PYT";
            }


            if (
                this.mapSubtitle
            ) {

                this.mapSubtitle.textContent =
                    "Choisis un chapitre. Les chapitres se débloquent dans l'ordre.";
            }


            this.setChapterNavigationVisible(
                false
            );


            this.setLevelNodesVisible(
                false
            );


            if (
                this.mapCourseButton
            ) {

                this.mapCourseButton.hidden =
                    true;


                this.mapCourseButton
                    .classList
                    .add(
                        "hidden"
                    );
            }


            requestAnimationFrame(
                () => {

                    this.resizeHouseCanvas();

                    this.drawHouseOverview();
                }
            );


            if (
                firstEntry
            ) {

                this.showFirstHouseHint();
            }
        }



        showFirstHouseHint() {

            const key =
                "pyt-house-hint-seen";


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

                    this.showGuideMessage(
                        "Commence par le Chapitre 1. Termine ses trois exercices pour débloquer le chapitre suivant."
                    );

                },
                350
            );
        }



        drawHouseOverview() {

            if (
                this.mapMode !==
                    "house" ||
                !this.houseContext ||
                !window.PYTArt
            ) {

                return;
            }


            this.repairArtCompatibility();


            const {
                width,
                height
            } =
                this.getCanvasLogicalSize();


            if (
                width <
                    10 ||
                height <
                    10
            ) {

                return;
            }


            const ctx =
                this.houseContext;


            ctx.clearRect(
                0,
                0,
                width,
                height
            );


            /*
             * Taille proportionnelle.
             */

            const radius =
                this.clamp(
                    Math.min(
                        width,
                        height
                    ) *
                    0.042,
                    25,
                    39
                );


            const positions =
                this.getHouseChapterPositions(
                    width,
                    height,
                    radius
                );


            this.houseBadges =
                positions.map(
                    position => {

                        const chapter =
                            this.getChapterData(
                                position.number
                            );


                        return {

                            ...position,

                            label:
                                `CHAPITRE ${position.number}`,

                            title:
                                this.getChapterDisplayTitle(
                                    chapter,
                                    position.number
                                ),

                            locked:
                                !this.isChapterUnlocked(
                                    position.number
                                ),

                            active:
                                false,

                            completed:
                                this.isLevelComplete(
                                    position.number,
                                    3
                                )
                        };
                    }
                );


            /*
             * ON UTILISE art.js TEL QUEL.
             */

            window.PYTArt
                .drawHouseMap(
                    ctx,
                    0,
                    0,
                    width,
                    height,
                    {

                        chapters:
                            this.houseBadges
                                .map(
                                    badge => ({

                                        x:
                                            badge.x,

                                        y:
                                            badge.y,

                                        radius:
                                            badge.radius,

                                        number:
                                            badge.number,

                                        label:
                                            badge.label,

                                        locked:
                                            badge.locked,

                                        active:
                                            badge.active
                                    })
                                )
                    }
                );


            /*
             * Le nom du chapitre est dessiné
             * PAR UI.JS sous le cercle.
             *
             * Donc art.js reste intact.
             */

            this.drawHouseChapterSubtitles(
                ctx,
                this.houseBadges,
                width,
                height
            );
        }



        getHouseChapterPositions(
            width,
            height,
            radius
        ) {

            /*
             * Positions adaptées au plan stable
             * de art.js.
             *
             * 1 Entrée
             * 2 Cuisine
             * 3 Salon
             * 4 Chambre
             * 5 Garage
             * 6 Cave
             * 7 Balcon
             * 8 Toilette
             * 9 Jardin
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
                    0.090,
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
                    (
                        [
                            number,
                            rx,
                            ry
                        ]
                    ) => ({

                        number,

                        x:
                            width *
                            rx,

                        y:
                            height *
                            ry,

                        radius
                    })
                );
        }



        drawHouseChapterSubtitles(
            ctx,
            badges,
            width,
            height
        ) {

            const art =
                window.PYTArt;


            if (
                !art ||
                typeof
                art.drawPixelText !==
                "function"
            ) {

                return;
            }


            badges.forEach(
                badge => {

                    const title =
                        this.shortenPixelTitle(
                            badge.title
                        );


                    const subtitleY =
                        Math.min(
                            height -
                                12,
                            badge.y +
                                badge.radius +
                                Math.max(
                                    8,
                                    badge.radius *
                                    0.24
                                )
                        );


                    art.drawPixelText(
                        ctx,
                        title,
                        badge.x,
                        subtitleY,
                        {

                            scale:
                                1,

                            align:
                                "center",

                            color:
                                badge.locked
                                    ? "#8d8998"
                                    : "#fff1d2",

                            shadow:
                                "#0c0c14"
                        }
                    );
                }
            );
        }



        getChapterDisplayTitle(
            chapter,
            number
        ) {

            if (
                chapter
            ) {

                const title =
                    chapter.title ||
                    chapter.name ||
                    chapter.subtitle;


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
                    "Variables",

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
                    number
                ] ||
                `Chapitre ${number}`
            );
        }



        shortenPixelTitle(
            title
        ) {

            const value =
                String(
                    title ||
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


            return (
                value.length >
                    20
            )
                ? `${value.slice(
                    0,
                    18
                )}.`
                : value;
        }



        handleHouseCanvasClick(
            event
        ) {

            this.handleHousePointer(
                event.clientX,
                event.clientY
            );
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


            const x =
                clientX -
                rect.left;


            const y =
                clientY -
                rect.top;


            const hit =
                this.houseBadges
                    .find(
                        badge => {

                            const dx =
                                x -
                                badge.x;


                            const dy =
                                y -
                                badge.y;


                            return (
                                Math.hypot(
                                    dx,
                                    dy
                                ) <=
                                badge.radius *
                                1.2
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

                this.showGuideMessage(
                    `Le Chapitre ${hit.number} est verrouillé. Termine les trois exercices du chapitre précédent.`
                );


                return;
            }


            /*
             * IMPORTANT :
             *
             * PLUS DE THÉORIE AUTOMATIQUE.
             *
             * On entre directement dans les
             * exercices.
             */

            this.openChapterRoom(
                hit.number
            );
        }



        /* =====================================================
           CHAPITRE
        ===================================================== */

        openChapterRoom(
            chapterNumber
        ) {

            const number =
                Number(
                    chapterNumber
                );


            if (
                !this.isChapterUnlocked(
                    number
                )
            ) {

                this.showGuideMessage(
                    "Ce chapitre n'est pas encore débloqué."
                );


                return;
            }


            const chapter =
                this.getChapterData(
                    number
                );


            if (
                !chapter
            ) {

                this.showGuideMessage(
                    "Les données de ce chapitre sont introuvables."
                );


                return;
            }


            this.mapMode =
                "chapter";


            this.selectedChapter =
                number;


            this.currentLevelData =
                null;


            this.loadedLevelKey =
                null;


            this.theoryReturnToGame =
                false;


            this.showMapScreen();

            this.updateTopBar(
                number
            );


            if (
                this.mapTitle
            ) {

                this.mapTitle.textContent =
                    `Chapitre ${number}`;
            }


            if (
                this.mapSubtitle
            ) {

                this.mapSubtitle.textContent =
                    this.getChapterDisplayTitle(
                        chapter,
                        number
                    );
            }


            this.setChapterNavigationVisible(
                true
            );


            this.updateChapterNavigation();


            this.setLevelNodesVisible(
                true
            );


            this.updateLevelNodes();


            /*
             * Théorie inaccessible depuis
             * la carte.
             */

            if (
                this.mapCourseButton
            ) {

                this.mapCourseButton.hidden =
                    true;


                this.mapCourseButton
                    .classList
                    .add(
                        "hidden"
                    );
            }


            requestAnimationFrame(
                () => {

                    this.resizeHouseCanvas();

                    this.drawChapterRoom(
                        chapter
                    );
                }
            );
        }



        drawChapterRoom(
            chapter
        ) {

            if (
                this.mapMode !==
                    "chapter" ||
                !this.houseContext ||
                !window.PYTArt
            ) {

                return;
            }


            this.repairArtCompatibility();


            const {
                width,
                height
            } =
                this.getCanvasLogicalSize();


            if (
                width <
                    10 ||
                height <
                    10
            ) {

                return;
            }


            const ctx =
                this.houseContext;


            ctx.clearRect(
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
                    30
                );


            const room =
                chapter.room ||
                chapter.location ||
                "entree";


            /*
             * Clip pour empêcher tout décor
             * de dépasser lorsque la fenêtre
             * devient petite.
             */

            ctx.save();


            ctx.beginPath();


            ctx.rect(
                margin,
                margin,
                width -
                    margin *
                    2,
                height -
                    margin *
                    2
            );


            ctx.clip();


            window.PYTArt
                .drawRoomScene(
                    ctx,
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


            ctx.restore();
        }



        /* =====================================================
           EXERCICES SUR CARTE
        ===================================================== */

        setLevelNodesVisible(
            visible
        ) {

            this.levelNodes
                .forEach(
                    button => {

                        if (
                            !button
                        ) {

                            return;
                        }


                        button.hidden =
                            !visible;


                        button
                            .classList
                            .toggle(
                                "hidden",
                                !visible
                            );
                    }
                );
        }



        setChapterNavigationVisible(
            visible
        ) {

            [
                this.previousChapterButton,
                this.mapChapterIndicator,
                this.nextChapterButton
            ]
                .forEach(
                    element => {

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
                );
        }



        updateChapterNavigation() {

            const chapter =
                Number(
                    this.selectedChapter ||
                    1
                );


            const count =
                this.getChapterCount();


            if (
                this.mapChapterIndicator
            ) {

                this.mapChapterIndicator
                    .textContent =
                    `Chapitre ${chapter} / ${count}`;
            }


            if (
                this.previousChapterButton
            ) {

                this.previousChapterButton
                    .disabled =
                    chapter <=
                    1;
            }


            if (
                this.nextChapterButton
            ) {

                const next =
                    chapter +
                    1;


                this.nextChapterButton
                    .disabled =
                    (
                        next >
                            count ||
                        !this.isChapterUnlocked(
                            next
                        )
                    );
            }
        }



        updateLevelNodes() {

            const chapter =
                Number(
                    this.selectedChapter ||
                    1
                );


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
                            this.isLevelComplete(
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


                        button
                            .setAttribute(
                                "aria-disabled",
                                String(
                                    !unlocked
                                )
                            );


                        const titleNode =
                            button.querySelector(
                                ".level-title, .node-title, .exercise-title"
                            );


                        const numberNode =
                            button.querySelector(
                                ".level-number, .node-number, .exercise-number"
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
                            titleNode
                        ) {

                            titleNode.textContent =
                                levelData
                                    ?.title ||
                                `Exercice ${level}`;

                        } else if (
                            !button.children.length
                        ) {

                            button.textContent =
                                `Exercice ${level}`;
                        }


                        button.title =
                            !unlocked
                                ? "Termine l'exercice précédent"
                                : completed
                                    ? "Rejouer cet exercice"
                                    : (
                                        levelData
                                            ?.title ||
                                        `Exercice ${level}`
                                    );
                    }
                );
        }



        /* =====================================================
           OUVERTURE EXERCICE
        ===================================================== */

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

                this.showGuideMessage(
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

                this.showGuideMessage(
                    "Cet exercice n'a pas pu être chargé."
                );


                return;
            }


            this.selectedChapter =
                chapter;


            this.currentLevelData =
                levelData;


            this.loadedLevelKey =
                this.levelKey(
                    chapter,
                    level
                );


            this.theoryReturnToGame =
                false;


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
                    "";
            }


            if (
                this.gameStatus
            ) {

                this.gameStatus.textContent =
                    `Chapitre ${chapter} · Exercice ${level}`;
            }


            if (
                this.editor
            ) {

                this.editor.value =
                    String(
                        levelData.starterCode ??
                        levelData.code ??
                        ""
                    );
            }


            this.clearCodeError();

            this.clearConsole();


            /*
             * IMPORTANT :
             *
             * On affiche d'abord l'écran du jeu,
             * PUIS seulement on demande au moteur
             * de dessiner.
             *
             * Cela évite le canvas noir lorsque
             * le moteur calculait les dimensions
             * pendant que l'écran était caché.
             */

            this.showGameScreen();

            this.updateTopBar(
                chapter
            );


            if (
                this.gameCanvas
            ) {

                if (
                    !this.gameCanvas.width
                ) {

                    this.gameCanvas.width =
                        960;
                }


                if (
                    !this.gameCanvas.height
                ) {

                    this.gameCanvas.height =
                        640;
                }


                this.gameCanvas
                    .style.visibility =
                    "visible";


                this.gameCanvas
                    .style.opacity =
                    "1";
            }


            requestAnimationFrame(
                () => {

                    requestAnimationFrame(
                        () => {

                            try {

                                if (
                                    !window.pytGame
                                ) {

                                    throw new Error(
                                        "Le moteur de jeu n'est pas prêt."
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
                                        "Aucune fonction de chargement de niveau n'est disponible."
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
                                    "[PYT] Erreur de chargement de l'exercice :",
                                    error
                                );


                                if (
                                    this.gameStatus
                                ) {

                                    this.gameStatus.textContent =
                                        "Erreur de chargement de l'exercice";
                                }


                                this.showGuideMessage(
                                    "L'exercice n'a pas pu s'afficher. Ouvre la console du navigateur et envoie-moi la première erreur rouge si cela recommence."
                                );
                            }
                        }
                    );
                }
            );
        }



        /* =====================================================
           THÉORIE
        ===================================================== */

        openTheoryForChapter(
            chapterNumber,
            returnToGame = false
        ) {

            const chapter =
                this.getChapterData(
                    chapterNumber
                );


            if (
                !chapter
            ) {

                return;
            }


            /*
             * La théorie ne peut plus être
             * ouverte avant le premier essai.
             */

            if (
                returnToGame &&
                this.currentLevelData &&
                !this
                    .isTheoryUnlockedForCurrentLevel()
            ) {

                this.showGuideMessage(
                    "Fais d'abord un essai dans l'exercice avant d'ouvrir la théorie."
                );


                return;
            }


            this.theoryReturnToGame =
                Boolean(
                    returnToGame &&
                    this.currentLevelData
                );


            /*
             * On conserve le code.
             */

            if (
                this.theoryReturnToGame &&
                this.editor
            ) {

                this.savedEditorCode =
                    this.editor.value;
            }


            this.renderTheory(
                chapter
            );


            this.showCourseScreen();


            this.updateTopBar(
                Number(
                    chapter.chapter ??
                    chapter.number ??
                    chapterNumber
                )
            );


            if (
                this.courseMapButton
            ) {

                this.courseMapButton.hidden =
                    false;


                this.courseMapButton
                    .classList
                    .remove(
                        "hidden"
                    );


                this.courseMapButton.textContent =
                    this.theoryReturnToGame
                        ? "Retour à l'exercice"
                        : "Retour aux exercices";
            }
        }



        openTheoryReview() {

            if (
                !this.currentLevelData ||
                !this
                    .isTheoryUnlockedForCurrentLevel()
            ) {

                this.showGuideMessage(
                    "Fais d'abord un essai dans cet exercice."
                );


                return;
            }


            const chapter =
                Number(
                    this.currentLevelData
                        .chapter ??
                    this.selectedChapter ??
                    1
                );


            this.openTheoryForChapter(
                chapter,
                true
            );
        }



        returnFromTheoryToGame() {

            if (
                !this.currentLevelData
            ) {

                this.openHouseMap();

                return;
            }


            this.showGameScreen();


            this.updateTopBar(
                Number(
                    this.currentLevelData
                        .chapter ??
                    this.selectedChapter ??
                    1
                )
            );


            /*
             * Code restauré exactement.
             */

            if (
                this.editor
            ) {

                this.editor.value =
                    this.savedEditorCode;
            }


            this.theoryReturnToGame =
                false;


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
        }



        renderTheory(
            chapter
        ) {

            const chapterNumber =
                Number(
                    chapter.chapter ??
                    chapter.number ??
                    this.selectedChapter ??
                    1
                );


            if (
                this.courseChapterNumber
            ) {

                this.courseChapterNumber.textContent =
                    `Chapitre ${chapterNumber}`;
            }


            if (
                this.courseTitle
            ) {

                this.courseTitle.textContent =
                    chapter.title ||
                    chapter.name ||
                    `Chapitre ${chapterNumber}`;
            }


            if (
                this.courseSubtitle
            ) {

                this.courseSubtitle.textContent =
                    chapter.subtitle ||
                    "Théorie";
            }


            if (
                !this.courseContent
            ) {

                return;
            }


            this.courseContent
                .replaceChildren();


            const sections =
                this.normalizeTheorySections(
                    chapter.theory
                );


            if (
                !sections.length
            ) {

                const paragraph =
                    document.createElement(
                        "p"
                    );


                paragraph.textContent =
                    "La théorie de ce chapitre sera disponible ici.";


                this.courseContent
                    .appendChild(
                        paragraph
                    );


                return;
            }


            sections.forEach(
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


                        article.appendChild(
                            heading
                        );
                    }


                    const bodyValues =
                        Array.isArray(
                            section.body
                        )
                            ? section.body
                            : [
                                section.body
                            ];


                    bodyValues
                        .filter(
                            Boolean
                        )
                        .forEach(
                            body => {

                                const paragraph =
                                    document.createElement(
                                        "p"
                                    );


                                paragraph.textContent =
                                    String(
                                        body
                                    );


                                article.appendChild(
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



        normalizeTheorySections(
            theory
        ) {

            if (
                !theory
            ) {

                return [];
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
                    theory.sections
                )
            ) {

                const intro =
                    theory.intro
                        ? [
                            {
                                body:
                                    theory.intro
                            }
                        ]
                        : [];


                return intro.concat(
                    theory.sections
                        .map(
                            item => ({

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
                            })
                        )
                );
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



        /* =====================================================
           FIN EXERCICE
        ===================================================== */

        completeLevel(
            levelData = null
        ) {

            const data =
                (
                    levelData &&
                    typeof levelData ===
                    "object"
                )
                    ? levelData
                    : this.currentLevelData;


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
                this.levelKey(
                    chapter,
                    level
                );


            this.completed[
                key
            ] =
                true;


            this.saveObject(
                this.progressKey,
                this.completed
            );


            this.clearCodeError();


            const isLastExercise =
                level >=
                3;


            const isLastChapter =
                chapter >=
                this.getChapterCount();


            if (
                isLastExercise
            ) {

                this.showCompletionModal(

                    isLastChapter
                        ? "Mission terminée"
                        : `Chapitre ${chapter} terminé`,

                    isLastChapter
                        ? "Tu as terminé les exercices de PYT."
                        : `Le Chapitre ${chapter + 1} est maintenant débloqué.`,

                    "Retour à la carte",

                    () =>
                        this.openHouseMap()
                );

            } else {

                this.showCompletionModal(

                    "Exercice réussi",

                    `L'exercice ${level + 1} est maintenant débloqué.`,

                    "Exercice suivant",

                    () =>
                        this.openLevel(
                            chapter,
                            level +
                                1
                        ),

                    "Retour aux exercices",

                    () =>
                        this.openChapterRoom(
                            chapter
                        )
                );
            }


            window.dispatchEvent(
                new CustomEvent(
                    "pyt:progress-changed",
                    {

                        detail: {

                            chapter,

                            level,

                            completed:
                                true
                        }
                    }
                )
            );
        }



        /* =====================================================
           ÉCHEC
        ===================================================== */

        handleLevelFailure(
            result = {}
        ) {

            if (
                !this.currentLevelData
            ) {

                return;
            }


            const key =
                this.levelKeyFromData(
                    this.currentLevelData
                );


            this.failureCounts[
                key
            ] =
                Number(
                    this.failureCounts[
                        key
                    ] ||
                    0
                ) +
                1;


            const failureNumber =
                this.failureCounts[
                    key
                ];


            /*
             * Premier échec :
             *
             * pas de ligne rouge.
             * juste théorie disponible.
             */

            if (
                failureNumber ===
                1
            ) {

                this.clearCodeError();


                this.showGuideMessage(
                    "Ce n'est pas encore ça. La théorie est maintenant disponible avec le bouton Théorie. Ton code est conservé."
                );


                this.updateTheoryButton();


                return;
            }


            /*
             * Deuxième échec ou plus :
             * on peut indiquer une ligne
             * si le moteur en fournit une.
             */

            const line =
                Number(
                    result.line ??
                    result.lineNumber ??
                    result.errorLine ??
                    0
                );


            const message =
                result.message ||
                result.error ||
                "Regarde la ligne indiquée et vérifie la logique de ton programme.";


            if (
                line >
                0
            ) {

                this.renderCodeError(
                    line,
                    message
                );
            }


            this.showGuideMessage(
                "Réessaie en observant le trajet de Pyt. La théorie reste disponible sans effacer ton code."
            );
        }



        renderCodeError(
            line,
            message = ""
        ) {

            if (
                !this.codeErrorHighlights
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


            item.dataset.line =
                String(
                    line
                );


            item.textContent =
                message
                    ? `Ligne ${line} : ${message}`
                    : `Vérifie la ligne ${line}.`;


            this.codeErrorHighlights
                .appendChild(
                    item
                );


            this.codeErrorHighlights
                .classList
                .remove(
                    "hidden"
                );


            this.codeErrorHighlights.hidden =
                false;
        }



        clearCodeError() {

            if (
                !this.codeErrorHighlights
            ) {

                return;
            }


            this.codeErrorHighlights
                .replaceChildren();


            this.codeErrorHighlights
                .classList
                .add(
                    "hidden"
                );


            this.codeErrorHighlights.hidden =
                true;
        }



        clearConsole() {

            if (
                this.consoleOutput
            ) {

                this.consoleOutput.textContent =
                    "";
            }
        }



        /* =====================================================
           GUIDE
        ===================================================== */

        showGuideMessage(
            message
        ) {

            if (
                window.pytApp &&
                typeof
                window.pytApp
                    .showGuide ===
                "function"
            ) {

                try {

                    window.pytApp
                        .showGuide(
                            message
                        );


                    return;

                } catch (
                    error
                ) {

                    console.warn(
                        "[PYT] showGuide indisponible, fallback utilisé.",
                        error
                    );
                }
            }


            if (
                !this.guide ||
                !this.guideMessage
            ) {

                return;
            }


            this.guideMessage.textContent =
                String(
                    message
                );


            this.guide
                .classList
                .remove(
                    "hidden"
                );


            this.guide.hidden =
                false;
        }



        /* =====================================================
           MODAL
        ===================================================== */

        showCompletionModal(
            title,
            message,
            primaryText,
            primaryAction,
            secondaryText = "",
            secondaryAction = null
        ) {

            if (
                !this.modalBackground ||
                !this.modalTitle ||
                !this.modalMessage ||
                !this.modalPrimaryButton
            ) {

                if (
                    typeof
                    primaryAction ===
                    "function"
                ) {

                    primaryAction();
                }


                return;
            }


            if (
                this.modalLabel
            ) {

                this.modalLabel.textContent =
                    "PYT";
            }


            this.modalTitle.textContent =
                title;


            this.modalMessage.textContent =
                message;


            this.modalPrimaryButton.textContent =
                primaryText;


            this.modalPrimaryButton.onclick =
                () => {

                    this.hideModal();


                    if (
                        typeof
                        primaryAction ===
                        "function"
                    ) {

                        primaryAction();
                    }
                };


            if (
                this.modalSecondaryButton
            ) {

                if (
                    secondaryText &&
                    typeof
                    secondaryAction ===
                    "function"
                ) {

                    this.modalSecondaryButton.hidden =
                        false;


                    this.modalSecondaryButton
                        .classList
                        .remove(
                            "hidden"
                        );


                    this.modalSecondaryButton.textContent =
                        secondaryText;


                    this.modalSecondaryButton.onclick =
                        () => {

                            this.hideModal();

                            secondaryAction();
                        };

                } else {

                    this.modalSecondaryButton.hidden =
                        true;


                    this.modalSecondaryButton
                        .classList
                        .add(
                            "hidden"
                        );


                    this.modalSecondaryButton.onclick =
                        null;
                }
            }


            this.modalBackground
                .classList
                .remove(
                    "hidden"
                );


            this.modalBackground.hidden =
                false;
        }



        hideModal() {

            if (
                !this.modalBackground
            ) {

                return;
            }


            this.modalBackground
                .classList
                .add(
                    "hidden"
                );


            this.modalBackground.hidden =
                true;
        }



        /* =====================================================
           REFRESH
        ===================================================== */

        refresh() {

            this.prepareStaticUi();


            if (
                this.mapMode ===
                "house"
            ) {

                this.drawHouseOverview();

            } else if (
                this.mapMode ===
                    "chapter" &&
                this.selectedChapter
            ) {

                const chapter =
                    this.getChapterData(
                        this.selectedChapter
                    );


                if (
                    chapter
                ) {

                    this.drawChapterRoom(
                        chapter
                    );
                }
            }


            this.updateTheoryButton();
        }



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



        /* =====================================================
           DEBUG / RESET
        ===================================================== */

        resetProgress() {

            this.completed =
                {};


            this.attempts =
                {};


            this.failureCounts =
                {};


            this.saveObject(
                this.progressKey,
                this.completed
            );


            this.saveObject(
                this.attemptsKey,
                this.attempts
            );


            this.openHouseMap();
        }
    }



    /* =========================================================
       EXPORT
    ========================================================= */

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