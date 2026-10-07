"use strict";

(() => {

    class PytApplication {

        constructor() {

            this.currentChapter = 1;
            this.currentLevel = 1;

            this.activeGameScreen = "map";

            this.settingsReturnState = {
                screen: "game",
                gameScreen: "map"
            };

            this.introFinished = false;
            this.introReady = false;

            this.guideVisible = false;

            this.codeWindowOpen = false;
            this.draggingCodeWindow = false;

            this.creditsTimers = [];

            this.settingsKey = "pyt-settings";

            this.settings = this.loadSettings();

            this.cacheDom();

            this.prepareInitialState();

            this.prepareIntro();

            this.prepareSettings();

            this.prepareCredits();

            this.prepareNavigation();

            this.prepareCodeWindow();

            this.prepareGuide();

            this.prepareModal();

            this.prepareResponsive();

            this.applySettings();

            this.dispatchReady();
        }



        /* =====================================================
           DOM
        ===================================================== */

        cacheDom() {

            const byId = id =>
                document.getElementById(id);


            /* INTRO */

            this.introScreen =
                byId("intro-screen");

            this.skipIntroButton =
                byId("skip-intro-button");

            this.introScene =
                byId("intro-scene");

            this.introContinueMessage =
                byId("intro-continue-message");


            /* MENU */

            this.mainMenu =
                byId("main-menu");

            this.playButton =
                byId("play-button");

            this.settingsButton =
                byId("settings-button");


            /* SETTINGS */

            this.settingsScreen =
                byId("settings-screen");

            this.musicEnabled =
                byId("music-enabled");

            this.volumeSlider =
                byId("volume-slider");

            this.volumeValue =
                byId("volume-value");

            this.creditsButton =
                byId("credits-button");

            this.settingsBackButton =
                byId("settings-back-button");


            /* CREDITS */

            this.creditsScreen =
                byId("credits-screen");

            this.closeCreditsButton =
                byId("close-credits-button");

            this.creditsScroll =
                byId("credits-scroll");


            /* GAME INTERFACE */

            this.gameInterface =
                byId("game-interface");

            this.chapterBadge =
                byId("chapter-badge");

            this.difficultyBadge =
                byId("difficulty-badge");

            this.roomName =
                byId("room-name");

            this.courseButton =
                byId("course-button");

            this.mapButton =
                byId("map-button");

            this.gameSettingsButton =
                byId("game-settings-button");

            this.menuButton =
                byId("menu-button");


            /* GAME SCREENS */

            this.chapterScreen =
                byId("chapter-screen");

            this.mapScreen =
                byId("map-screen");

            this.gameScreen =
                byId("game-screen");


            /* CODE */

            this.openCodeButton =
                byId("open-code-button");

            this.codeWindow =
                byId("code-window");

            this.codeWindowHeader =
                byId("code-window-header");

            this.codeRestartButton =
                byId("code-restart-button");

            this.closeCodeButton =
                byId("close-code-button");

            this.codeEditor =
                byId("code-editor");

            this.clearCodeButton =
                byId("clear-code-button");

            this.runCodeButton =
                byId("run-code-button");

            this.consoleOutput =
                byId("console-output");


            /* GAME */

            this.restartButton =
                byId("restart-button");

            this.gameCanvas =
                byId("game-canvas");

            this.robotThoughtBubble =
                byId("robot-thought-bubble");


            /* GUIDE */

            this.pytGuide =
                byId("pyt-guide");

            this.closePytGuideButton =
                byId("close-pyt-guide-button");

            this.pytGuideMessage =
                byId("pyt-guide-message");

            this.pytGuideActions =
                byId("pyt-guide-actions");


            /* MODAL */

            this.modalBackground =
                byId("modal-background");

            this.messageModal =
                byId("message-modal");

            this.modalLabel =
                byId("modal-label");

            this.modalTitle =
                byId("modal-title");

            this.modalMessage =
                byId("modal-message");

            this.modalSecondaryButton =
                byId("modal-secondary-button");

            this.modalPrimaryButton =
                byId("modal-primary-button");


            /* AUDIO */

            this.musicAudio =
                byId("music-audio");

            this.theoryAudio =
                byId("theory-audio");
        }



        /* =====================================================
           UTILITAIRES
        ===================================================== */

        show(element) {

            if (!element) {
                return;
            }

            element.hidden = false;

            element.classList.remove(
                "hidden"
            );
        }



        hide(element) {

            if (!element) {
                return;
            }

            element.hidden = true;

            element.classList.add(
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



        /* =====================================================
           SETTINGS STORAGE
        ===================================================== */

        loadSettings() {

            const defaults = {
                music: true,
                volume: 0.55
            };


            try {

                const value =
                    JSON.parse(
                        localStorage.getItem(
                            this.settingsKey
                        ) ||
                        "{}"
                    );


                return {
                    ...defaults,
                    ...value
                };

            } catch (error) {

                console.warn(
                    "[PYT] Réglages illisibles.",
                    error
                );

                return defaults;
            }
        }



        saveSettings() {

            try {

                localStorage.setItem(
                    this.settingsKey,
                    JSON.stringify(
                        this.settings
                    )
                );

            } catch (error) {

                console.warn(
                    "[PYT] Impossible de sauvegarder les réglages.",
                    error
                );
            }
        }



        /* =====================================================
           ÉTAT INITIAL
        ===================================================== */

        prepareInitialState() {

            /*
             * L'intro est la seule chose visible
             * au chargement.
             */

            this.show(
                this.introScreen
            );

            this.hide(
                this.mainMenu
            );

            this.hide(
                this.settingsScreen
            );

            this.hide(
                this.creditsScreen
            );

            this.hide(
                this.gameInterface
            );

            this.hide(
                this.codeWindow
            );

            this.hide(
                this.pytGuide
            );

            this.hide(
                this.modalBackground
            );

            this.hide(
                this.robotThoughtBubble
            );


            /*
             * On retire définitivement
             * les anciennes infos du haut.
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
        }



        /* =====================================================
           INTRO
        ===================================================== */

        prepareIntro() {

            if (
                !this.introScreen
            ) {

                this.enterGame();

                return;
            }


            this.introReady =
                false;


            if (
                this.introContinueMessage
            ) {

                this.introContinueMessage
                    .classList
                    .remove(
                        "visible"
                    );
            }


            /*
             * Après l'animation d'intro,
             * l'utilisateur peut continuer.
             */

            setTimeout(
                () => {

                    if (
                        this.introFinished
                    ) {

                        return;
                    }


                    this.introReady =
                        true;


                    if (
                        this.introContinueMessage
                    ) {

                        this.introContinueMessage
                            .classList
                            .add(
                                "visible"
                            );
                    }

                },
                3500
            );


            if (
                this.skipIntroButton
            ) {

                this.skipIntroButton
                    .addEventListener(
                        "click",
                        () =>
                            this.finishIntro()
                    );
            }


            this.introScreen
                .addEventListener(
                    "click",
                    event => {

                        if (
                            event.target ===
                            this.skipIntroButton
                        ) {

                            return;
                        }


                        if (
                            this.introReady
                        ) {

                            this.finishIntro();
                        }
                    }
                );


            window.addEventListener(
                "keydown",
                event => {

                    if (
                        this.introFinished
                    ) {

                        return;
                    }


                    if (
                        !this.introReady
                    ) {

                        return;
                    }


                    if (
                        [
                            "Enter",
                            " ",
                            "Spacebar"
                        ].includes(
                            event.key
                        )
                    ) {

                        event.preventDefault();

                        this.finishIntro();
                    }
                }
            );
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
                this.introScreen
            ) {

                this.introScreen
                    .classList
                    .add(
                        "intro-leaving"
                    );
            }


            setTimeout(
                () => {

                    this.hide(
                        this.introScreen
                    );


                    this.enterGame();

                },
                500
            );
        }



        /* =====================================================
           ENTRÉE DANS LE JEU
        ===================================================== */

        enterGame() {

            /*
             * IMPORTANT :
             *
             * pas de menu intermédiaire.
             *
             * Après l'intro :
             * directement le plan de la maison.
             */

            this.hide(
                this.mainMenu
            );

            this.hide(
                this.settingsScreen
            );

            this.hide(
                this.creditsScreen
            );

            this.show(
                this.gameInterface
            );


            this.activeGameScreen =
                "map";


            this.showMap();


            requestAnimationFrame(
                () => {

                    if (
                        window.pytUI &&
                        typeof
                        window.pytUI
                            .openHouseMap ===
                        "function"
                    ) {

                        window.pytUI
                            .openHouseMap(
                                true
                            );
                    }
                }
            );
        }



        /*
         * Ancienne compatibilité.
         *
         * Si un ancien bouton appelle
         * showMainMenu(), il retourne
         * maintenant simplement à la carte.
         */

        showMainMenu() {

            this.enterGame();
        }



        /* =====================================================
           NAVIGATION
        ===================================================== */

        prepareNavigation() {

            if (
                this.playButton
            ) {

                this.playButton
                    .addEventListener(
                        "click",
                        () =>
                            this.enterGame()
                    );
            }


            if (
                this.settingsButton
            ) {

                this.settingsButton
                    .addEventListener(
                        "click",
                        () =>
                            this.showSettings()
                    );
            }


            if (
                this.gameSettingsButton
            ) {

                this.gameSettingsButton
                    .addEventListener(
                        "click",
                        () =>
                            this.showSettings()
                    );
            }


            if (
                this.menuButton
            ) {

                this.menuButton
                    .addEventListener(
                        "click",
                        () => {

                            if (
                                window.pytUI &&
                                typeof
                                window.pytUI
                                    .openHouseMap ===
                                "function"
                            ) {

                                window.pytUI
                                    .openHouseMap();

                            } else {

                                this.showMap();
                            }
                        }
                    );
            }
        }



        hideGameScreens() {

            this.hide(
                this.chapterScreen
            );

            this.hide(
                this.mapScreen
            );

            this.hide(
                this.gameScreen
            );
        }



        showMap() {

            this.show(
                this.gameInterface
            );


            this.hideGameScreens();


            this.show(
                this.mapScreen
            );


            this.activeGameScreen =
                "map";


            this.closeCodeWindow();


            requestAnimationFrame(
                () => {

                    if (
                        window.pytUI &&
                        typeof
                        window.pytUI
                            .resizeHouseCanvas ===
                        "function"
                    ) {

                        window.pytUI
                            .resizeHouseCanvas();
                    }


                    if (
                        window.pytUI &&
                        typeof
                        window.pytUI
                            .refresh ===
                        "function"
                    ) {

                        window.pytUI
                            .refresh();
                    }
                }
            );
        }



        showCourse() {

            this.show(
                this.gameInterface
            );


            this.hideGameScreens();


            this.show(
                this.chapterScreen
            );


            this.activeGameScreen =
                "course";


            this.closeCodeWindow();
        }



        showGame() {

            this.show(
                this.gameInterface
            );


            this.hideGameScreens();


            this.show(
                this.gameScreen
            );


            this.activeGameScreen =
                "game";


            /*
             * Canvas visible avant rendu.
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


            requestAnimationFrame(
                () => {

                    requestAnimationFrame(
                        () => {

                            if (
                                window.pytGame &&
                                typeof
                                window.pytGame
                                    .resizeCanvas ===
                                "function"
                            ) {

                                window.pytGame
                                    .resizeCanvas();
                            }


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
            );
        }



        /* =====================================================
           SETTINGS
        ===================================================== */

        prepareSettings() {

            if (
                this.musicEnabled
            ) {

                this.musicEnabled
                    .addEventListener(
                        "change",
                        () => {

                            this.settings.music =
                                Boolean(
                                    this.musicEnabled
                                        .checked
                                );


                            /*
                             * Music = Non
                             * => volume réellement à zéro.
                             */

                            if (
                                !this.settings.music
                            ) {

                                this.settings.volume =
                                    0;


                                if (
                                    this.volumeSlider
                                ) {

                                    this.volumeSlider.value =
                                        "0";
                                }
                            }


                            this.applySettings();

                            this.saveSettings();
                        }
                    );
            }


            if (
                this.volumeSlider
            ) {

                this.volumeSlider
                    .addEventListener(
                        "input",
                        () => {

                            const value =
                                this.clamp(
                                    Number(
                                        this.volumeSlider
                                            .value
                                    ) /
                                    100,
                                    0,
                                    1
                                );


                            this.settings.volume =
                                value;


                            /*
                             * Si l'utilisateur remonte
                             * le volume, Musique repasse
                             * automatiquement à Oui.
                             */

                            if (
                                value >
                                0
                            ) {

                                this.settings.music =
                                    true;


                                if (
                                    this.musicEnabled
                                ) {

                                    this.musicEnabled.checked =
                                        true;
                                }
                            }


                            this.applySettings();

                            this.saveSettings();
                        }
                    );
            }


            if (
                this.settingsBackButton
            ) {

                this.settingsBackButton
                    .addEventListener(
                        "click",
                        () =>
                            this.closeSettings()
                    );
            }
        }



        applySettings() {

            this.settings.volume =
                this.clamp(
                    Number(
                        this.settings.volume ??
                        0.55
                    ),
                    0,
                    1
                );


            if (
                !this.settings.music
            ) {

                this.settings.volume =
                    0;
            }


            if (
                this.musicEnabled
            ) {

                this.musicEnabled.checked =
                    Boolean(
                        this.settings.music
                    );
            }


            if (
                this.volumeSlider
            ) {

                this.volumeSlider.value =
                    String(
                        Math.round(
                            this.settings.volume *
                            100
                        )
                    );
            }


            if (
                this.volumeValue
            ) {

                this.volumeValue.textContent =
                    `${Math.round(
                        this.settings.volume *
                        100
                    )}%`;
            }


            [
                this.musicAudio,
                this.theoryAudio
            ]
                .forEach(
                    audio => {

                        if (
                            !audio
                        ) {

                            return;
                        }


                        audio.volume =
                            this.settings.music
                                ? this.settings.volume
                                : 0;


                        audio.muted =
                            !this.settings.music ||
                            this.settings.volume ===
                                0;
                    }
                );
        }



        showSettings() {

            this.settingsReturnState = {

                screen:
                    this.gameInterface &&
                    !this.gameInterface
                        .classList
                        .contains(
                            "hidden"
                        )
                        ? "game"
                        : "menu",

                gameScreen:
                    this.activeGameScreen
            };


            this.hide(
                this.mainMenu
            );

            this.hide(
                this.gameInterface
            );

            this.hide(
                this.creditsScreen
            );

            this.closeCodeWindow();


            this.show(
                this.settingsScreen
            );


            this.applySettings();
        }



        closeSettings() {

            this.hide(
                this.settingsScreen
            );


            if (
                this.settingsReturnState
                    .screen ===
                "game"
            ) {

                this.show(
                    this.gameInterface
                );


                switch (
                    this.settingsReturnState
                        .gameScreen
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

            } else {

                /*
                 * Le jeu n'utilise normalement
                 * plus le menu.
                 */

                this.enterGame();
            }
        }



        /* =====================================================
           CREDITS
        ===================================================== */

        prepareCredits() {

            if (
                this.creditsButton
            ) {

                this.creditsButton
                    .addEventListener(
                        "click",
                        () =>
                            this.openCredits()
                    );
            }


            if (
                this.closeCreditsButton
            ) {

                this.closeCreditsButton
                    .addEventListener(
                        "click",
                        () =>
                            this.closeCredits()
                    );
            }


            if (
                !this.creditsScreen
            ) {

                return;
            }


            /*
             * On retire un éventuel PYT
             * présent au début des crédits.
             */

            if (
                this.creditsScroll
            ) {

                const children =
                    Array.from(
                        this.creditsScroll
                            .children
                    );


                children.forEach(
                    (
                        child,
                        index
                    ) => {

                        if (
                            index >
                            1
                        ) {

                            return;
                        }


                        const text =
                            child.textContent
                                ?.trim()
                                .toUpperCase();


                        if (
                            text ===
                            "PYT"
                        ) {

                            child.classList.add(
                                "credits-opening-title"
                            );


                            child.hidden =
                                true;
                        }
                    }
                );
            }


            /*
             * Overlay final.
             *
             * Le PYT final ne dépend donc
             * plus de la longueur des noms.
             */

            let overlay =
                document.getElementById(
                    "credits-final-overlay"
                );


            if (
                !overlay
            ) {

                overlay =
                    document.createElement(
                        "div"
                    );


                overlay.id =
                    "credits-final-overlay";


                overlay.className =
                    "credits-final-overlay";


                overlay.innerHTML = `
                    <div class="credits-final-title">PYT</div>
                    <div class="credits-final-subtitle">apprentissage Python</div>
                `;


                this.creditsScreen
                    .appendChild(
                        overlay
                    );
            }


            this.creditsFinalOverlay =
                overlay;


            this.creditsFinalTitle =
                overlay.querySelector(
                    ".credits-final-title"
                );


            this.creditsFinalSubtitle =
                overlay.querySelector(
                    ".credits-final-subtitle"
                );


            this.resetCreditsAnimation();
        }



        clearCreditsTimers() {

            this.creditsTimers
                .forEach(
                    timer =>
                        clearTimeout(
                            timer
                        )
                );


            this.creditsTimers =
                [];
        }



        resetCreditsAnimation() {

            this.clearCreditsTimers();


            if (
                this.creditsScreen
            ) {

                this.creditsScreen
                    .classList
                    .remove(
                        "credits-running",
                        "credits-show-final",
                        "credits-show-subtitle"
                    );
            }


            if (
                this.creditsScroll
            ) {

                this.creditsScroll
                    .classList
                    .remove(
                        "credits-scroll-running"
                    );


                /*
                 * Force le navigateur à remettre
                 * l'animation CSS à zéro.
                 */

                void this.creditsScroll
                    .offsetWidth;
            }


            if (
                this.creditsFinalOverlay
            ) {

                this.creditsFinalOverlay
                    .classList
                    .remove(
                        "visible",
                        "subtitle-visible"
                    );
            }
        }



        openCredits() {

            this.hide(
                this.settingsScreen
            );

            this.show(
                this.creditsScreen
            );


            this.resetCreditsAnimation();


            requestAnimationFrame(
                () => {

                    if (
                        this.creditsScreen
                    ) {

                        this.creditsScreen
                            .classList
                            .add(
                                "credits-running"
                            );
                    }


                    if (
                        this.creditsScroll
                    ) {

                        this.creditsScroll
                            .classList
                            .add(
                                "credits-scroll-running"
                            );
                    }
                }
            );


            /*
             * Temps du défilement.
             *
             * 30 secondes :
             * PYT arrive et reste au centre.
             */

            const finalTimer =
                setTimeout(
                    () => {

                        if (
                            !this.creditsScreen ||
                            this.creditsScreen
                                .classList
                                .contains(
                                    "hidden"
                                )
                        ) {

                            return;
                        }


                        this.creditsScreen
                            .classList
                            .add(
                                "credits-show-final"
                            );


                        if (
                            this.creditsFinalOverlay
                        ) {

                            this.creditsFinalOverlay
                                .classList
                                .add(
                                    "visible"
                                );
                        }

                    },
                    30000
                );


            /*
             * EXACTEMENT 3 secondes
             * après l'arrivée de PYT :
             *
             * apprentissage Python
             */

            const subtitleTimer =
                setTimeout(
                    () => {

                        if (
                            !this.creditsScreen ||
                            this.creditsScreen
                                .classList
                                .contains(
                                    "hidden"
                                )
                        ) {

                            return;
                        }


                        this.creditsScreen
                            .classList
                            .add(
                                "credits-show-subtitle"
                            );


                        if (
                            this.creditsFinalOverlay
                        ) {

                            this.creditsFinalOverlay
                                .classList
                                .add(
                                    "subtitle-visible"
                                );
                        }

                    },
                    33000
                );


            this.creditsTimers.push(
                finalTimer,
                subtitleTimer
            );
        }



        closeCredits() {

            this.resetCreditsAnimation();


            this.hide(
                this.creditsScreen
            );


            this.show(
                this.settingsScreen
            );
        }



        /* =====================================================
           CODE WINDOW
        ===================================================== */

        prepareCodeWindow() {

            if (
                this.openCodeButton
            ) {

                this.openCodeButton
                    .addEventListener(
                        "click",
                        () =>
                            this.openCodeWindow()
                    );
            }


            if (
                this.closeCodeButton
            ) {

                this.closeCodeButton
                    .addEventListener(
                        "click",
                        () =>
                            this.closeCodeWindow()
                    );
            }


            if (
                this.clearCodeButton
            ) {

                this.clearCodeButton
                    .addEventListener(
                        "click",
                        () => {

                            if (
                                this.codeEditor
                            ) {

                                this.codeEditor.value =
                                    "";


                                this.codeEditor.focus();
                            }


                            this.clearConsole();
                        }
                    );
            }


            if (
                this.runCodeButton
            ) {

                this.runCodeButton
                    .addEventListener(
                        "click",
                        () =>
                            this.runCode()
                    );
            }


            if (
                this.codeRestartButton
            ) {

                this.codeRestartButton
                    .addEventListener(
                        "click",
                        () =>
                            this.restartLevel()
                    );
            }


            if (
                this.restartButton
            ) {

                this.restartButton
                    .addEventListener(
                        "click",
                        () =>
                            this.restartLevel()
                    );
            }


            /*
             * CTRL + ENTER
             */

            if (
                this.codeEditor
            ) {

                this.codeEditor
                    .addEventListener(
                        "keydown",
                        event => {

                            if (
                                (
                                    event.ctrlKey ||
                                    event.metaKey
                                ) &&
                                event.key ===
                                    "Enter"
                            ) {

                                event.preventDefault();

                                this.runCode();
                            }
                        }
                    );
            }


            this.prepareCodeDragging();
        }



        openCodeWindow() {

            if (
                !this.codeWindow
            ) {

                return;
            }


            this.codeWindowOpen =
                true;


            this.show(
                this.codeWindow
            );


            if (
                this.isMobileLayout()
            ) {

                this.resetCodeWindowPosition();

            } else {

                this.keepCodeWindowInsideViewport();
            }


            requestAnimationFrame(
                () => {

                    if (
                        this.codeEditor
                    ) {

                        this.codeEditor.focus();
                    }
                }
            );
        }



        closeCodeWindow() {

            if (
                !this.codeWindow
            ) {

                return;
            }


            this.codeWindowOpen =
                false;


            this.hide(
                this.codeWindow
            );
        }



        runCode() {

            if (
                !this.codeEditor
            ) {

                return;
            }


            const source =
                this.codeEditor.value;


            this.clearConsole();


            /*
             * Un seul événement.
             *
             * game.js peut l'écouter
             * et ui.js l'utilise aussi
             * pour compter la tentative.
             */

            window.dispatchEvent(
                new CustomEvent(
                    "pyt:run-code",
                    {

                        detail: {
                            source
                        }
                    }
                )
            );
        }



        restartLevel() {

            this.clearConsole();


            if (
                window.pytGame &&
                typeof
                window.pytGame
                    .restartLevel ===
                "function"
            ) {

                window.pytGame
                    .restartLevel();

                return;
            }


            if (
                window.pytGame &&
                typeof
                window.pytGame
                    .resetLevel ===
                "function"
            ) {

                window.pytGame
                    .resetLevel();

                return;
            }


            window.dispatchEvent(
                new CustomEvent(
                    "pyt:restart-level"
                )
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



        /* =====================================================
           CODE WINDOW DRAG
        ===================================================== */

        isMobileLayout() {

            return (
                window.innerWidth <=
                    820 ||
                window.matchMedia(
                    "(pointer: coarse)"
                ).matches
            );
        }



        prepareCodeDragging() {

            if (
                !this.codeWindow ||
                !this.codeWindowHeader
            ) {

                return;
            }


            let startX =
                0;

            let startY =
                0;

            let startLeft =
                0;

            let startTop =
                0;


            const move =
                event => {

                    if (
                        !this.draggingCodeWindow ||
                        this.isMobileLayout()
                    ) {

                        return;
                    }


                    const dx =
                        event.clientX -
                        startX;


                    const dy =
                        event.clientY -
                        startY;


                    const maxLeft =
                        Math.max(
                            0,
                            window.innerWidth -
                                this.codeWindow
                                    .offsetWidth
                        );


                    const maxTop =
                        Math.max(
                            0,
                            window.innerHeight -
                                this.codeWindow
                                    .offsetHeight
                        );


                    this.codeWindow.style.left =
                        `${this.clamp(
                            startLeft +
                                dx,
                            0,
                            maxLeft
                        )}px`;


                    this.codeWindow.style.top =
                        `${this.clamp(
                            startTop +
                                dy,
                            0,
                            maxTop
                        )}px`;


                    this.codeWindow.style.right =
                        "auto";


                    this.codeWindow.style.bottom =
                        "auto";
                };


            const stop =
                () => {

                    this.draggingCodeWindow =
                        false;


                    document.body
                        .classList
                        .remove(
                            "dragging-code-window"
                        );
                };


            this.codeWindowHeader
                .addEventListener(
                    "pointerdown",
                    event => {

                        if (
                            this.isMobileLayout()
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
                            this.codeWindow
                                .getBoundingClientRect();


                        this.draggingCodeWindow =
                            true;


                        startX =
                            event.clientX;


                        startY =
                            event.clientY;


                        startLeft =
                            rect.left;


                        startTop =
                            rect.top;


                        document.body
                            .classList
                            .add(
                                "dragging-code-window"
                            );


                        this.codeWindowHeader
                            .setPointerCapture?.(
                                event.pointerId
                            );


                        event.preventDefault();
                    }
                );


            window.addEventListener(
                "pointermove",
                move
            );


            window.addEventListener(
                "pointerup",
                stop
            );


            window.addEventListener(
                "pointercancel",
                stop
            );
        }



        resetCodeWindowPosition() {

            if (
                !this.codeWindow
            ) {

                return;
            }


            this.codeWindow.style.left =
                "";

            this.codeWindow.style.top =
                "";

            this.codeWindow.style.right =
                "";

            this.codeWindow.style.bottom =
                "";
        }



        keepCodeWindowInsideViewport() {

            if (
                !this.codeWindow ||
                this.isMobileLayout()
            ) {

                return;
            }


            const rect =
                this.codeWindow
                    .getBoundingClientRect();


            const margin =
                12;


            let left =
                rect.left;


            let top =
                rect.top;


            if (
                rect.right >
                window.innerWidth -
                    margin
            ) {

                left =
                    window.innerWidth -
                    rect.width -
                    margin;
            }


            if (
                rect.bottom >
                window.innerHeight -
                    margin
            ) {

                top =
                    window.innerHeight -
                    rect.height -
                    margin;
            }


            left =
                Math.max(
                    margin,
                    left
                );


            top =
                Math.max(
                    margin,
                    top
                );


            this.codeWindow.style.left =
                `${left}px`;


            this.codeWindow.style.top =
                `${top}px`;


            this.codeWindow.style.right =
                "auto";


            this.codeWindow.style.bottom =
                "auto";
        }



        /* =====================================================
           GUIDE PYT
        ===================================================== */

        prepareGuide() {

            if (
                this.closePytGuideButton
            ) {

                this.closePytGuideButton
                    .addEventListener(
                        "click",
                        () =>
                            this.hideGuide()
                    );
            }
        }



        showGuide(
            message,
            actions = []
        ) {

            if (
                !this.pytGuide ||
                !this.pytGuideMessage
            ) {

                return;
            }


            this.pytGuideMessage.textContent =
                String(
                    message ?? ""
                );


            if (
                this.pytGuideActions
            ) {

                this.pytGuideActions
                    .replaceChildren();


                actions
                    .filter(
                        action =>
                            action &&
                            action.label
                    )
                    .forEach(
                        action => {

                            const button =
                                document.createElement(
                                    "button"
                                );


                            button.type =
                                "button";


                            button.className =
                                action.primary
                                    ? "primary-button"
                                    : "secondary-button";


                            button.textContent =
                                action.label;


                            button.addEventListener(
                                "click",
                                () => {

                                    if (
                                        typeof
                                        action.onClick ===
                                        "function"
                                    ) {

                                        action.onClick();
                                    }
                                }
                            );


                            this.pytGuideActions
                                .appendChild(
                                    button
                                );
                        }
                    );
            }


            this.guideVisible =
                true;


            this.show(
                this.pytGuide
            );


            requestAnimationFrame(
                () => {

                    this.pytGuide
                        .classList
                        .add(
                            "guide-visible"
                        );
                }
            );
        }



        hideGuide() {

            if (
                !this.pytGuide
            ) {

                return;
            }


            this.guideVisible =
                false;


            this.pytGuide
                .classList
                .remove(
                    "guide-visible"
                );


            setTimeout(
                () => {

                    if (
                        !this.guideVisible
                    ) {

                        this.hide(
                            this.pytGuide
                        );
                    }

                },
                220
            );
        }



        /* =====================================================
           BULLE ROBOT
        ===================================================== */

        showThought(
            message,
            duration = 2300
        ) {

            if (
                !this.robotThoughtBubble
            ) {

                return;
            }


            this.robotThoughtBubble.textContent =
                String(
                    message ||
                    "Ce n'est pas là que je voulais aller..."
                );


            this.show(
                this.robotThoughtBubble
            );


            this.robotThoughtBubble
                .classList
                .add(
                    "thought-visible"
                );


            clearTimeout(
                this.thoughtTimer
            );


            this.thoughtTimer =
                setTimeout(
                    () => {

                        this.robotThoughtBubble
                            .classList
                            .remove(
                                "thought-visible"
                            );


                        setTimeout(
                            () =>
                                this.hide(
                                    this.robotThoughtBubble
                                ),
                            180
                        );

                    },
                    duration
                );
        }



        /* =====================================================
           MODAL
        ===================================================== */

        prepareModal() {

            if (
                this.modalBackground
            ) {

                this.modalBackground
                    .addEventListener(
                        "click",
                        event => {

                            if (
                                event.target ===
                                this.modalBackground
                            ) {

                                /*
                                 * On ne ferme pas automatiquement
                                 * les modales importantes.
                                 */
                            }
                        }
                    );
            }
        }



        showModal({
            label = "PYT",
            title = "",
            message = "",
            primaryText = "Continuer",
            primaryAction = null,
            secondaryText = "",
            secondaryAction = null
        } = {}) {

            if (
                !this.modalBackground
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
                    label;
            }


            if (
                this.modalTitle
            ) {

                this.modalTitle.textContent =
                    title;
            }


            if (
                this.modalMessage
            ) {

                this.modalMessage.textContent =
                    message;
            }


            if (
                this.modalPrimaryButton
            ) {

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
            }


            if (
                this.modalSecondaryButton
            ) {

                if (
                    secondaryText
                ) {

                    this.show(
                        this.modalSecondaryButton
                    );


                    this.modalSecondaryButton.textContent =
                        secondaryText;


                    this.modalSecondaryButton.onclick =
                        () => {

                            this.hideModal();


                            if (
                                typeof
                                secondaryAction ===
                                "function"
                            ) {

                                secondaryAction();
                            }
                        };

                } else {

                    this.hide(
                        this.modalSecondaryButton
                    );


                    this.modalSecondaryButton.onclick =
                        null;
                }
            }


            this.show(
                this.modalBackground
            );
        }



        hideModal() {

            this.hide(
                this.modalBackground
            );
        }



        /* =====================================================
           SFX
           AUDIO PLUS TARD
        ===================================================== */

        playSfx(
            name,
            options = {}
        ) {

            /*
             * Aucun fichier audio ajouté ici.
             *
             * Plus tard, le plugin audio pourra
             * écouter cet événement.
             */

            window.dispatchEvent(
                new CustomEvent(
                    "pyt:sfx-request",
                    {

                        detail: {
                            name,
                            options
                        }
                    }
                )
            );
        }



        /* =====================================================
           RESPONSIVE
        ===================================================== */

        prepareResponsive() {

            const update =
                () => {

                    document.documentElement
                        .classList
                        .toggle(
                            "pyt-mobile",
                            this.isMobileLayout()
                        );


                    if (
                        this.isMobileLayout()
                    ) {

                        this.resetCodeWindowPosition();

                    } else if (
                        this.codeWindowOpen
                    ) {

                        this.keepCodeWindowInsideViewport();
                    }


                    /*
                     * Carte.
                     */

                    if (
                        window.pytUI &&
                        typeof
                        window.pytUI
                            .resizeHouseCanvas ===
                        "function"
                    ) {

                        window.pytUI
                            .resizeHouseCanvas();
                    }


                    /*
                     * Exercice.
                     */

                    requestAnimationFrame(
                        () => {

                            if (
                                window.pytGame &&
                                typeof
                                window.pytGame
                                    .resizeCanvas ===
                                "function"
                            ) {

                                window.pytGame
                                    .resizeCanvas();
                            }


                            if (
                                window.pytGame &&
                                typeof
                                window.pytGame
                                    .render ===
                                "function" &&
                                this.activeGameScreen ===
                                    "game"
                            ) {

                                window.pytGame
                                    .render();
                            }
                        }
                    );
                };


            window.addEventListener(
                "resize",
                update,
                {
                    passive: true
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


            update();
        }



        /* =====================================================
           READY
        ===================================================== */

        dispatchReady() {

            setTimeout(
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
    }



    /* =========================================================
       EXPORT
    ========================================================= */

    window.PytApplication =
        PytApplication;



    const start =
        () => {

            if (
                window.pytApp
            ) {

                return;
            }


            window.pytApp =
                new PytApplication();
        };


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            start,
            {
                once: true
            }
        );

    } else {

        start();
    }

})();