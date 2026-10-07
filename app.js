"use strict";

/* =========================================================
   PYT - app.js

   CONTRÔLEUR PRINCIPAL DE L'APPLICATION

   PARCOURS :

   INTRO
      ↓
   CARTE DE LA MAISON
      ↓
   THÉORIE
      ↓
   CARTE DE LA PIÈCE
      ↓
   EXERCICE

   ---------------------------------------------------------

   Ce fichier gère :

   - cinématique d'introduction
   - entrée directe dans la maison
   - changement d'écrans
   - paramètres
   - crédits
   - futur système audio
   - éditeur Python
   - fenêtre déplaçable sur ordinateur
   - guide de Pyt
   - bulle de pensée
   - modales
   - console
   - informations du niveau
   - clavier / tactile
   - stockage des paramètres

========================================================= */


class PytApplication {

    constructor() {

        /* =====================================================
           JEU
        ===================================================== */

        this.currentChapter =
            1;


        this.currentLevel =
            1;


        this.totalChapters =
            9;


        this.currentLevelData =
            null;


        /* =====================================================
           ÉCRANS
        ===================================================== */

        this.activeGameScreen =
            "map";


        this.settingsReturnScreen =
            "map";


        /* =====================================================
           INTRO
        ===================================================== */

        this.introReady =
            false;


        this.introFinished =
            false;


        this.introTimer =
            null;


        /* =====================================================
           GUIDE
        ===================================================== */

        this.guideClosing =
            false;


        /* =====================================================
           MODALE
        ===================================================== */

        this.modalPrimaryAction =
            null;


        this.modalSecondaryAction =
            null;


        /* =====================================================
           CODE WINDOW
        ===================================================== */

        this.codeDragging =
            false;


        this.codeDragOffsetX =
            0;


        this.codeDragOffsetY =
            0;


        /* =====================================================
           CRÉDITS
        ===================================================== */

        this.creditsAnimationFrame =
            null;


        this.creditsStartTime =
            null;


        this.creditsDuration =
            34000;


        /* =====================================================
           PARAMÈTRES
        ===================================================== */

        this.settings = {

            music:
                true,

            volume:
                50,

            sfx:
                true,

            sfxVolume:
                70
        };


        this.init();
    }



    /* =========================================================
       INITIALISATION
    ========================================================= */

    init() {

        this.loadSettings();

        this.bindEvents();

        this.applySettings();

        this.prepareIntro();

        this.prepareCredits();

        this.prepareCodeWindow();

        this.prepareInitialState();


        window.setTimeout(
            () => {

                window.dispatchEvent(
                    new CustomEvent(
                        "pyt:app-ready"
                    )
                );

            },
            0
        );
    }



    /* =========================================================
       ÉTAT INITIAL
    ========================================================= */

    prepareInitialState() {

        /*
         * L'intro est le seul écran visible au départ.
         */

        this.hideElement(
            "main-menu"
        );


        this.hideElement(
            "settings-screen"
        );


        this.hideElement(
            "credits-screen"
        );


        this.hideElement(
            "game-interface"
        );


        this.hideElement(
            "code-window"
        );


        this.hideElement(
            "pyt-guide"
        );


        this.hideElement(
            "modal-background"
        );


        this.hideElement(
            "robot-thought-bubble"
        );


        this.showElement(
            "intro-screen"
        );
    }



    /* =========================================================
       EVENTS GÉNÉRAUX
    ========================================================= */

    bindEvents() {

        /* =====================================================
           ANCIEN BOUTON JOUER

           Il reste compatible si le bouton existe encore,
           mais n'est plus utilisé dans le parcours normal.
        ===================================================== */

        document
            .getElementById(
                "play-button"
            )
            ?.addEventListener(
                "click",
                () => {

                    this.enterGame();
                }
            );


        /* =====================================================
           PARAMÈTRES
        ===================================================== */

        document
            .getElementById(
                "settings-button"
            )
            ?.addEventListener(
                "click",
                () => {

                    this.showSettings();
                }
            );


        document
            .getElementById(
                "game-settings-button"
            )
            ?.addEventListener(
                "click",
                () => {

                    this.showSettings();
                }
            );


        document
            .getElementById(
                "settings-back-button"
            )
            ?.addEventListener(
                "click",
                () => {

                    this.closeSettings();
                }
            );


        document
            .getElementById(
                "music-enabled"
            )
            ?.addEventListener(
                "change",
                event => {

                    this.settings.music =
                        Boolean(
                            event.target.checked
                        );


                    /*
                     * Musique désactivée =
                     * volume automatiquement à zéro.
                     */

                    if (
                        !this.settings.music
                    ) {

                        this.settings.volume =
                            0;


                        const slider =
                            document.getElementById(
                                "volume-slider"
                            );


                        if (
                            slider
                        ) {

                            slider.value =
                                "0";
                        }
                    }


                    this.applySettings();

                    this.saveSettings();
                }
            );


        document
            .getElementById(
                "volume-slider"
            )
            ?.addEventListener(
                "input",
                event => {

                    const volume =
                        this.clamp(
                            Number(
                                event.target.value
                            ),
                            0,
                            100
                        );


                    this.settings.volume =
                        volume;


                    /*
                     * Remonter le volume réactive
                     * automatiquement la musique.
                     */

                    if (
                        volume >
                        0
                    ) {

                        this.settings.music =
                            true;
                    }


                    this.applySettings();

                    this.saveSettings();
                }
            );


        /* =====================================================
           CRÉDITS
        ===================================================== */

        document
            .getElementById(
                "credits-button"
            )
            ?.addEventListener(
                "click",
                () => {

                    this.showCredits();
                }
            );


        document
            .getElementById(
                "close-credits-button"
            )
            ?.addEventListener(
                "click",
                () => {

                    this.closeCredits();
                }
            );


        /* =====================================================
           BARRE DU JEU
        ===================================================== */

        document
            .getElementById(
                "course-button"
            )
            ?.addEventListener(
                "click",
                () => {

                    /*
                     * Le bouton Cours depuis un exercice
                     * sert à revoir le chapitre.
                     */

                    if (
                        window.pytUI
                    ) {

                        window.pytUI
                            .selectedChapter =
                            Number(
                                this.currentChapter
                            );


                        window.pytUI
                            .theoryEntryPending =
                            false;


                        window.pytUI
                            .reviewMode =
                            false;
                    }


                    this.showCourse();
                }
            );


        document
            .getElementById(
                "map-button"
            )
            ?.addEventListener(
                "click",
                () => {

                    /*
                     * Depuis un exercice on retourne
                     * à la carte de la pièce.
                     */

                    if (
                        window.pytUI
                    ) {

                        window.pytUI
                            .openChapterRoom(
                                this.currentChapter
                            );

                    } else {

                        this.showMap();
                    }
                }
            );


        document
            .getElementById(
                "menu-button"
            )
            ?.addEventListener(
                "click",
                () => {

                    /*
                     * Il n'y a plus de menu principal.
                     *
                     * Ce bouton ramène à la maison.
                     */

                    if (
                        window.pytUI
                    ) {

                        window.pytUI
                            .openHouseMap();

                    } else {

                        this.showMap();
                    }
                }
            );


        /* =====================================================
           ÉDITEUR
        ===================================================== */

        document
            .getElementById(
                "open-code-button"
            )
            ?.addEventListener(
                "click",
                () => {

                    this.openCodeWindow();
                }
            );


        document
            .getElementById(
                "close-code-button"
            )
            ?.addEventListener(
                "click",
                () => {

                    this.closeCodeWindow();
                }
            );


        document
            .getElementById(
                "clear-code-button"
            )
            ?.addEventListener(
                "click",
                () => {

                    const editor =
                        document.getElementById(
                            "code-editor"
                        );


                    if (
                        editor
                    ) {

                        editor.value =
                            "";


                        editor.focus();
                    }


                    this.clearCodeError();
                }
            );


        document
            .getElementById(
                "run-code-button"
            )
            ?.addEventListener(
                "click",
                () => {

                    this.runCode();
                }
            );


        document
            .getElementById(
                "restart-button"
            )
            ?.addEventListener(
                "click",
                () => {

                    this.restartLevel();
                }
            );


        document
            .getElementById(
                "code-restart-button"
            )
            ?.addEventListener(
                "click",
                () => {

                    this.restartLevel();
                }
            );


        /* =====================================================
           GUIDE
        ===================================================== */

        document
            .getElementById(
                "close-pyt-guide-button"
            )
            ?.addEventListener(
                "click",
                () => {

                    this.hideGuide();
                }
            );


        /* =====================================================
           MODALE
        ===================================================== */

        document
            .getElementById(
                "modal-primary-button"
            )
            ?.addEventListener(
                "click",
                () => {

                    const action =
                        this.modalPrimaryAction;


                    this.hideModal();


                    if (
                        typeof action ===
                        "function"
                    ) {

                        action();
                    }
                }
            );


        document
            .getElementById(
                "modal-secondary-button"
            )
            ?.addEventListener(
                "click",
                () => {

                    const action =
                        this.modalSecondaryAction;


                    this.hideModal();


                    if (
                        typeof action ===
                        "function"
                    ) {

                        action();
                    }
                }
            );


        /* =====================================================
           CLAVIER
        ===================================================== */

        window.addEventListener(
            "keydown",
            event => {

                this.handleGlobalKeyDown(
                    event
                );
            }
        );


        /* =====================================================
           REDIMENSIONNEMENT
        ===================================================== */

        window.addEventListener(
            "resize",
            () => {

                this.keepCodeWindowInsideViewport();
            }
        );
    }



    /* =========================================================
       INTRO
    ========================================================= */

    prepareIntro() {

        const message =
            document.getElementById(
                "intro-continue-message"
            );


        if (
            message
        ) {

            const touch =
                window.matchMedia(
                    "(pointer: coarse)"
                ).matches;


            message.textContent =
                touch
                    ? "Touchez l’écran pour continuer"
                    : "Appuyez sur une touche pour continuer";


            message.classList.add(
                "hidden"
            );
        }


        /*
         * On attend la fin de l'arrivée de Pyt.
         *
         * Aucune continuation automatique.
         */

        this.introTimer =
            window.setTimeout(
                () => {

                    this.introReady =
                        true;


                    message
                        ?.classList
                        .remove(
                            "hidden"
                        );

                },
                3500
            );


        const intro =
            document.getElementById(
                "intro-screen"
            );


        intro
            ?.addEventListener(
                "pointerdown",
                event => {

                    /*
                     * On évite de déclencher sur un bouton
                     * séparé si un jour on en remet un.
                     */

                    if (
                        event.target.closest(
                            "button"
                        )
                    ) {

                        return;
                    }


                    this.tryFinishIntro();
                }
            );


        document
            .getElementById(
                "skip-intro-button"
            )
            ?.addEventListener(
                "click",
                () => {

                    /*
                     * Le bouton reste caché actuellement,
                     * mais son comportement est propre.
                     */

                    this.introReady =
                        true;


                    this.finishIntro();
                }
            );
    }



    tryFinishIntro() {

        if (
            !this.introReady ||
            this.introFinished
        ) {

            return;
        }


        this.finishIntro();
    }



    finishIntro() {

        if (
            this.introFinished
        ) {

            return;
        }


        this.introFinished =
            true;


        if (
            this.introTimer
        ) {

            clearTimeout(
                this.introTimer
            );


            this.introTimer =
                null;
        }


        const intro =
            document.getElementById(
                "intro-screen"
            );


        if (
            intro
        ) {

            intro.style.opacity =
                "0";


            intro.style.transition =
                "opacity 350ms ease";
        }


        window.setTimeout(
            () => {

                this.hideElement(
                    "intro-screen"
                );


                this.enterGame();

            },
            360
        );
    }



    handleGlobalKeyDown(
        event
    ) {

        /*
         * INTRO
         */

        if (
            !this.introFinished
        ) {

            if (
                this.introReady
            ) {

                event.preventDefault();

                this.finishIntro();
            }


            return;
        }


        /*
         * ÉCHAP
         */

        if (
            event.key ===
            "Escape"
        ) {

            const modal =
                document.getElementById(
                    "modal-background"
                );


            if (
                modal &&
                !modal.classList.contains(
                    "hidden"
                )
            ) {

                this.hideModal();

                return;
            }


            const credits =
                document.getElementById(
                    "credits-screen"
                );


            if (
                credits &&
                !credits.classList.contains(
                    "hidden"
                )
            ) {

                this.closeCredits();

                return;
            }


            const code =
                document.getElementById(
                    "code-window"
                );


            if (
                code &&
                !code.classList.contains(
                    "hidden"
                )
            ) {

                this.closeCodeWindow();

                return;
            }


            const guide =
                document.getElementById(
                    "pyt-guide"
                );


            if (
                guide &&
                !guide.classList.contains(
                    "hidden"
                )
            ) {

                this.hideGuide();
            }
        }


        /*
         * Ctrl + Entrée
         * exécute le programme.
         */

        if (
            event.key ===
                "Enter" &&
            (
                event.ctrlKey ||
                event.metaKey
            )
        ) {

            const code =
                document.getElementById(
                    "code-window"
                );


            if (
                code &&
                !code.classList.contains(
                    "hidden"
                )
            ) {

                event.preventDefault();

                this.runCode();
            }
        }
    }



    /* =========================================================
       ENTRÉE DANS LE JEU
    ========================================================= */

    enterGame() {

        /*
         * Plus de menu principal.
         */

        this.hideElement(
            "main-menu"
        );


        this.hideElement(
            "settings-screen"
        );


        this.hideElement(
            "credits-screen"
        );


        this.showElement(
            "game-interface"
        );


        /*
         * PREMIER ÉCRAN :
         * LA MAISON.
         */

        if (
            window.pytUI
        ) {

            window.pytUI
                .openHouseMap(
                    true
                );

        } else {

            this.showMap();
        }
    }



    /* =========================================================
       ÉCRANS DU JEU
    ========================================================= */

    hideAllGameSubscreens() {

        this.hideElement(
            "chapter-screen"
        );


        this.hideElement(
            "map-screen"
        );


        this.hideElement(
            "game-screen"
        );
    }



    showMap() {

        this.showElement(
            "game-interface"
        );


        this.hideElement(
            "settings-screen"
        );


        this.hideElement(
            "credits-screen"
        );


        this.hideAllGameSubscreens();


        this.showElement(
            "map-screen"
        );


        this.activeGameScreen =
            "map";


        this.closeCodeWindow();


        window.dispatchEvent(
            new CustomEvent(
                "pyt:map-open"
            )
        );
    }



    showCourse() {

        this.showElement(
            "game-interface"
        );


        this.hideElement(
            "settings-screen"
        );


        this.hideElement(
            "credits-screen"
        );


        this.hideAllGameSubscreens();


        this.showElement(
            "chapter-screen"
        );


        this.activeGameScreen =
            "course";


        this.closeCodeWindow();


        window.dispatchEvent(
            new CustomEvent(
                "pyt:course-open"
            )
        );
    }



    showGame() {

        this.showElement(
            "game-interface"
        );


        this.hideElement(
            "settings-screen"
        );


        this.hideElement(
            "credits-screen"
        );


        this.hideAllGameSubscreens();


        this.showElement(
            "game-screen"
        );


        this.activeGameScreen =
            "game";


        this.updateTopbar();
    }



    /*
     * Ancien nom conservé pour éviter qu'un ancien
     * appel casse le projet.
     */

    showMainMenu() {

        this.enterGame();
    }



    /* =========================================================
       PARAMÈTRES
    ========================================================= */

    showSettings() {

        this.settingsReturnScreen =
            this.activeGameScreen;


        this.hideElement(
            "game-interface"
        );


        this.hideElement(
            "main-menu"
        );


        this.hideElement(
            "credits-screen"
        );


        this.showElement(
            "settings-screen"
        );


        this.closeCodeWindow();

        this.hideGuide();

        this.syncSettingsControls();
    }



    closeSettings() {

        this.hideElement(
            "settings-screen"
        );


        this.showElement(
            "game-interface"
        );


        switch (
            this.settingsReturnScreen
        ) {

            case "course":

                this.showCourse();

                break;


            case "game":

                this.showGame();

                break;


            default:

                this.showMap();
        }
    }



    syncSettingsControls() {

        const music =
            document.getElementById(
                "music-enabled"
            );


        const slider =
            document.getElementById(
                "volume-slider"
            );


        const value =
            document.getElementById(
                "volume-value"
            );


        if (
            music
        ) {

            music.checked =
                Boolean(
                    this.settings.music
                );
        }


        if (
            slider
        ) {

            slider.value =
                String(
                    this.settings.volume
                );
        }


        if (
            value
        ) {

            value.textContent =
                `${this.settings.volume}%`;
        }
    }



    applySettings() {

        const music =
            document.getElementById(
                "music-audio"
            );


        const theory =
            document.getElementById(
                "theory-audio"
            );


        const volume =
            this.clamp(
                Number(
                    this.settings.volume
                ) /
                100,
                0,
                1
            );


        [
            music,
            theory
        ].forEach(
            audio => {

                if (
                    !audio
                ) {

                    return;
                }


                audio.volume =
                    volume;


                if (
                    !this.settings.music ||
                    volume ===
                        0
                ) {

                    audio.pause();
                }
            }
        );


        this.syncSettingsControls();
    }



    loadSettings() {

        try {

            const saved =
                localStorage.getItem(
                    "pyt-settings"
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

                this.settings = {

                    ...this.settings,

                    ...parsed
                };
            }

        } catch (
            error
        ) {

            console.warn(
                "PYT : paramètres impossibles à charger.",
                error
            );
        }
    }



    saveSettings() {

        try {

            localStorage.setItem(
                "pyt-settings",
                JSON.stringify(
                    this.settings
                )
            );

        } catch (
            error
        ) {

            console.warn(
                "PYT : paramètres impossibles à enregistrer.",
                error
            );
        }
    }



    /* =========================================================
       FUTUR SYSTÈME DE BRUITAGES
    ========================================================= */

    playSfx(
        name
    ) {

        /*
         * Pour l'instant :
         * aucune dépendance audio.
         *
         * Plus tard, le plugin audio pourra remplacer
         * cette méthode sans modifier game.js ou robot.js.
         */

        if (
            !this.settings.sfx
        ) {

            return;
        }


        window.dispatchEvent(
            new CustomEvent(
                "pyt:sfx-request",
                {
                    detail: {

                        name,

                        volume:
                            this.settings
                                .sfxVolume /
                            100
                    }
                }
            )
        );
    }



    /* =========================================================
       CRÉDITS
    ========================================================= */

    prepareCredits() {

        /*
         * Le HTML actuel contient encore un PYT au début.
         * On le cache immédiatement.
         *
         * On modifiera ensuite index.html pour le retirer
         * définitivement.
         */

        const openingTitle =
            document.querySelector(
                "#credits-scroll > h1"
            );


        if (
            openingTitle
        ) {

            openingTitle.style.display =
                "none";
        }
    }



    showCredits() {

        this.hideElement(
            "settings-screen"
        );


        this.showElement(
            "credits-screen"
        );


        this.startCreditsAnimation();
    }



    closeCredits() {

        this.stopCreditsAnimation();


        this.hideElement(
            "credits-screen"
        );


        this.showElement(
            "settings-screen"
        );
    }



    startCreditsAnimation() {

        this.stopCreditsAnimation();


        const screen =
            document.getElementById(
                "credits-screen"
            );


        const scroll =
            document.getElementById(
                "credits-scroll"
            );


        const finalTitle =
            scroll
                ?.querySelector(
                    ".credits-final-title"
                );


        if (
            !screen ||
            !scroll ||
            !finalTitle
        ) {

            return;
        }


        /*
         * Désactivation de l'ancienne animation CSS.
         */

        scroll.style.animation =
            "none";


        scroll.style.transform =
            "rotateX(18deg)";


        scroll.style.top =
            `${screen.clientHeight}px`;


        /*
         * On laisse au navigateur le temps
         * de recalculer les dimensions.
         */

        requestAnimationFrame(
            () => {

                const startTop =
                    screen.clientHeight;


                /*
                 * Position finale :
                 * PYT exactement au centre de l'écran.
                 */

                const targetTop =
                    (
                        screen.clientHeight /
                        2
                    ) -
                    finalTitle.offsetTop -
                    (
                        finalTitle.offsetHeight /
                        2
                    );


                this.creditsStartTime =
                    performance.now();


                const animate =
                    now => {

                        const elapsed =
                            now -
                            this.creditsStartTime;


                        const progress =
                            this.clamp(
                                elapsed /
                                this.creditsDuration,
                                0,
                                1
                            );


                        /*
                         * Mouvement quasi constant avec
                         * léger ralentissement final.
                         */

                        const eased =
                            progress <
                            0.90
                                ? progress
                                : (
                                    0.90 +
                                    (
                                        1 -
                                        Math.pow(
                                            1 -
                                            (
                                                (
                                                    progress -
                                                    0.90
                                                ) /
                                                0.10
                                            ),
                                            2
                                        )
                                    ) *
                                    0.10
                                );


                        const top =
                            startTop +
                            (
                                targetTop -
                                startTop
                            ) *
                            eased;


                        scroll.style.top =
                            `${top}px`;


                        if (
                            progress >=
                            1
                        ) {

                            /*
                             * ARRÊT TOTAL.
                             *
                             * Le titre PYT reste exactement
                             * au centre jusqu'à fermeture.
                             */

                            scroll.style.top =
                                `${targetTop}px`;


                            this.creditsAnimationFrame =
                                null;


                            return;
                        }


                        this.creditsAnimationFrame =
                            requestAnimationFrame(
                                animate
                            );
                    };


                this.creditsAnimationFrame =
                    requestAnimationFrame(
                        animate
                    );
            }
        );
    }



    stopCreditsAnimation() {

        if (
            this.creditsAnimationFrame
        ) {

            cancelAnimationFrame(
                this.creditsAnimationFrame
            );


            this.creditsAnimationFrame =
                null;
        }


        this.creditsStartTime =
            null;
    }



    /* =========================================================
       NIVEAU ACTUEL
    ========================================================= */

    setCurrentLevelData(
        data
    ) {

        this.currentLevelData =
            data ||
            null;


        if (
            data?.chapter
        ) {

            this.currentChapter =
                Number(
                    data.chapter
                );
        }


        if (
            data?.level
        ) {

            this.currentLevel =
                Number(
                    data.level
                );
        }


        this.updateTopbar();

        this.updateMission();
    }



    updateTopbar() {

        const chapter =
            document.getElementById(
                "chapter-badge"
            );


        const difficulty =
            document.getElementById(
                "difficulty-badge"
            );


        const room =
            document.getElementById(
                "room-name"
            );


        if (
            chapter
        ) {

            chapter.textContent =
                `Chapitre ${this.currentChapter}`;
        }


        if (
            difficulty
        ) {

            difficulty.textContent =
                this.currentLevelData
                    ?.difficulty ||
                `Exercice ${this.currentLevel}`;
        }


        if (
            room
        ) {

            const chapterData =
                window.pytUI
                    ?.getChapterData(
                        this.currentChapter
                    );


            room.textContent =
                this.currentLevelData
                    ?.room ||
                chapterData
                    ?.room ||
                "";
        }
    }



    updateMission() {

        const title =
            document.getElementById(
                "mission-title"
            );


        const instruction =
            document.getElementById(
                "mission-instruction"
            );


        if (
            title
        ) {

            title.textContent =
                this.currentLevelData
                    ?.title ||
                `Exercice ${this.currentLevel}`;
        }


        if (
            instruction
        ) {

            instruction.textContent =
                this.currentLevelData
                    ?.instruction ||
                "Aide Pyt à terminer sa mission.";
        }
    }



    /* =========================================================
       CODE WINDOW
    ========================================================= */

    prepareCodeWindow() {

        const header =
            document.getElementById(
                "code-window-header"
            );


        const windowElement =
            document.getElementById(
                "code-window"
            );


        if (
            !header ||
            !windowElement
        ) {

            return;
        }


        header.addEventListener(
            "pointerdown",
            event => {

                /*
                 * Sur mobile la fenêtre est intégrée
                 * normalement dans la page.
                 */

                if (
                    window.innerWidth <=
                    720
                ) {

                    return;
                }


                if (
                    event.target.closest(
                        "button"
                    )
                ) {

                    return;
                }


                const rect =
                    windowElement
                        .getBoundingClientRect();


                this.codeDragging =
                    true;


                this.codeDragOffsetX =
                    event.clientX -
                    rect.left;


                this.codeDragOffsetY =
                    event.clientY -
                    rect.top;


                try {

                    header.setPointerCapture(
                        event.pointerId
                    );

                } catch (
                error
                ) {

                    /*
                     * Certains navigateurs peuvent
                     * refuser le capture.
                     */
                }


                event.preventDefault();
            }
        );


        header.addEventListener(
            "pointermove",
            event => {

                if (
                    !this.codeDragging
                ) {

                    return;
                }


                const width =
                    windowElement
                        .offsetWidth;


                const height =
                    windowElement
                        .offsetHeight;


                const maxLeft =
                    Math.max(
                        0,
                        window.innerWidth -
                        width
                    );


                const maxTop =
                    Math.max(
                        0,
                        window.innerHeight -
                        height
                    );


                const left =
                    this.clamp(
                        event.clientX -
                        this.codeDragOffsetX,
                        0,
                        maxLeft
                    );


                const top =
                    this.clamp(
                        event.clientY -
                        this.codeDragOffsetY,
                        0,
                        maxTop
                    );


                windowElement.style.left =
                    `${left}px`;


                windowElement.style.top =
                    `${top}px`;
            }
        );


        const stopDrag =
            event => {

                if (
                    !this.codeDragging
                ) {

                    return;
                }


                this.codeDragging =
                    false;


                try {

                    header.releasePointerCapture(
                        event.pointerId
                    );

                } catch (
                error
                ) {

                    /*
                     * Rien à faire.
                     */
                }
            };


        header.addEventListener(
            "pointerup",
            stopDrag
        );


        header.addEventListener(
            "pointercancel",
            stopDrag
        );
    }



    openCodeWindow() {

        const code =
            document.getElementById(
                "code-window"
            );


        if (
            !code
        ) {

            return;
        }


        code.classList.remove(
            "hidden"
        );


        this.keepCodeWindowInsideViewport();


        window.setTimeout(
            () => {

                document
                    .getElementById(
                        "code-editor"
                    )
                    ?.focus();

            },
            20
        );


        this.playSfx(
            "ui-open"
        );
    }



    closeCodeWindow() {

        const code =
            document.getElementById(
                "code-window"
            );


        if (
            !code ||
            code.classList.contains(
                "hidden"
            )
        ) {

            return;
        }


        code.classList.add(
            "hidden"
        );


        this.codeDragging =
            false;


        this.playSfx(
            "ui-close"
        );
    }



    keepCodeWindowInsideViewport() {

        const code =
            document.getElementById(
                "code-window"
            );


        if (
            !code ||
            code.classList.contains(
                "hidden"
            ) ||
            window.innerWidth <=
                720
        ) {

            return;
        }


        const rect =
            code.getBoundingClientRect();


        const left =
            this.clamp(
                rect.left,
                0,
                Math.max(
                    0,
                    window.innerWidth -
                    rect.width
                )
            );


        const top =
            this.clamp(
                rect.top,
                0,
                Math.max(
                    0,
                    window.innerHeight -
                    rect.height
                )
            );


        code.style.left =
            `${left}px`;


        code.style.top =
            `${top}px`;
    }



    runCode() {

        const editor =
            document.getElementById(
                "code-editor"
            );


        if (
            !editor
        ) {

            return;
        }


        const code =
            editor.value;


        this.hideThought();


        this.setConsole(
            ""
        );


        const runButton =
            document.getElementById(
                "run-code-button"
            );


        if (
            runButton
        ) {

            runButton.disabled =
                true;


            runButton.textContent =
                "Exécution...";
        }


        window.dispatchEvent(
            new CustomEvent(
                "pyt:run-code",
                {
                    detail: {

                        code,

                        chapter:
                            this.currentChapter,

                        level:
                            this.currentLevel,

                        data:
                            this.currentLevelData
                    }
                }
            )
        );
    }



    restartLevel() {

        this.hideThought();

        this.clearCodeError();

        this.setConsole(
            ""
        );


        window.dispatchEvent(
            new CustomEvent(
                "pyt:restart-level",
                {
                    detail: {

                        chapter:
                            this.currentChapter,

                        level:
                            this.currentLevel
                    }
                }
            )
        );
    }



    /* =========================================================
       CONSOLE
    ========================================================= */

    setConsole(
        text
    ) {

        const output =
            document.getElementById(
                "console-output"
            );


        if (
            output
        ) {

            output.textContent =
                String(
                    text ??
                    ""
                );
        }
    }



    clearConsole() {

        this.setConsole(
            ""
        );
    }



    writeConsole(
        text
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


        const value =
            String(
                text ??
                ""
            );


        if (
            !output.textContent
        ) {

            output.textContent =
                value;

        } else {

            output.textContent +=
                `\n${value}`;
        }


        output.scrollTop =
            output.scrollHeight;
    }



    /* =========================================================
       GUIDE DE PYT
    ========================================================= */

    showGuide(
        message,
        actions = []
    ) {

        const guide =
            document.getElementById(
                "pyt-guide"
            );


        const text =
            document.getElementById(
                "pyt-guide-message"
            );


        const container =
            document.getElementById(
                "pyt-guide-actions"
            );


        if (
            !guide ||
            !text ||
            !container
        ) {

            return;
        }


        this.guideClosing =
            false;


        guide.classList.remove(
            "closing"
        );


        text.textContent =
            String(
                message ??
                ""
            );


        container.innerHTML =
            "";


        if (
            Array.isArray(
                actions
            )
        ) {

            actions.forEach(
                (
                    action,
                    index
                ) => {

                    if (
                        !action ||
                        !action.label
                    ) {

                        return;
                    }


                    const button =
                        document.createElement(
                            "button"
                        );


                    button.type =
                        "button";


                    button.textContent =
                        action.label;


                    if (
                        index >
                        0
                    ) {

                        button.classList.add(
                            "guide-secondary-action"
                        );
                    }


                    button.addEventListener(
                        "click",
                        () => {

                            if (
                                typeof action.onClick ===
                                "function"
                            ) {

                                action.onClick();
                            }
                        }
                    );


                    container.appendChild(
                        button
                    );
                }
            );
        }


        guide.classList.remove(
            "hidden"
        );
    }



    hideGuide() {

        const guide =
            document.getElementById(
                "pyt-guide"
            );


        if (
            !guide ||
            guide.classList.contains(
                "hidden"
            ) ||
            this.guideClosing
        ) {

            return;
        }


        this.guideClosing =
            true;


        guide.classList.add(
            "closing"
        );


        window.setTimeout(
            () => {

                guide.classList.add(
                    "hidden"
                );


                guide.classList.remove(
                    "closing"
                );


                this.guideClosing =
                    false;

            },
            220
        );
    }



    /* =========================================================
       BULLE DE PENSÉE
    ========================================================= */

    showThought(
        message
    ) {

        const bubble =
            document.getElementById(
                "robot-thought-bubble"
            );


        if (
            !bubble
        ) {

            return;
        }


        bubble.textContent =
            String(
                message ??
                ""
            );


        bubble.classList.remove(
            "hidden"
        );
    }



    hideThought() {

        this.hideElement(
            "robot-thought-bubble"
        );
    }



    /* =========================================================
       ERREUR DE CODE
    ========================================================= */

    showCodeError(
        line
    ) {

        const number =
            Number(
                line
            );


        if (
            !Number.isInteger(
                number
            ) ||
            number <=
                0
        ) {

            return;
        }


        window.dispatchEvent(
            new CustomEvent(
                "pyt:code-error-line",
                {
                    detail: {

                        line:
                            number
                    }
                }
            )
        );
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
       MODALES
    ========================================================= */

    showModal(
        options = {}
    ) {

        const background =
            document.getElementById(
                "modal-background"
            );


        const label =
            document.getElementById(
                "modal-label"
            );


        const title =
            document.getElementById(
                "modal-title"
            );


        const message =
            document.getElementById(
                "modal-message"
            );


        const primary =
            document.getElementById(
                "modal-primary-button"
            );


        const secondary =
            document.getElementById(
                "modal-secondary-button"
            );


        if (
            !background
        ) {

            return;
        }


        if (
            label
        ) {

            label.textContent =
                options.label ||
                "PYT";
        }


        if (
            title
        ) {

            title.textContent =
                options.title ||
                "Information";
        }


        if (
            message
        ) {

            message.textContent =
                options.message ||
                "";
        }


        if (
            primary
        ) {

            primary.textContent =
                options.primaryLabel ||
                "Continuer";
        }


        if (
            secondary
        ) {

            if (
                options.secondaryLabel
            ) {

                secondary.textContent =
                    options.secondaryLabel;


                secondary.classList.remove(
                    "hidden"
                );

            } else {

                secondary.classList.add(
                    "hidden"
                );
            }
        }


        this.modalPrimaryAction =
            typeof options.onPrimary ===
                "function"
                ? options.onPrimary
                : null;


        this.modalSecondaryAction =
            typeof options.onSecondary ===
                "function"
                ? options.onSecondary
                : null;


        background.classList.remove(
            "hidden"
        );
    }



    hideModal() {

        this.hideElement(
            "modal-background"
        );


        this.modalPrimaryAction =
            null;


        this.modalSecondaryAction =
            null;
    }



    /* =========================================================
       OUTILS DOM
    ========================================================= */

    showElement(
        id
    ) {

        document
            .getElementById(
                id
            )
            ?.classList
            .remove(
                "hidden"
            );
    }



    hideElement(
        id
    ) {

        document
            .getElementById(
                id
            )
            ?.classList
            .add(
                "hidden"
            );
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

}



/* =========================================================
   DÉMARRAGE
========================================================= */

function startPytApplication() {

    if (
        window.pytApp
    ) {

        return;
    }


    window.PytApplication =
        PytApplication;


    window.pytApp =
        new PytApplication();
}



if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startPytApplication,
        {
            once: true
        }
    );

} else {

    startPytApplication();
}