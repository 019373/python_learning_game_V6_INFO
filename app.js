"use strict";

/* =========================================================
   PYT
   app.js

   Navigation générale du jeu :
   - introduction
   - menu
   - paramètres
   - crédits
   - carte
   - cours
   - écran de jeu
   - fenêtre de code
   - paramètres audio
   - chargement des assets
========================================================= */


class PytApplication {

    constructor() {

        /* =================================================
           ÉTAT
        ================================================= */

        this.started = false;

        this.introReady = false;
        this.introFinished = false;

        this.currentScreen = "intro";

        this.settingsReturnScreen = "menu";

        this.currentChapter = 1;
        this.currentLevel = 1;

        this.totalChapters = 9;

        this.currentLevelData = null;

        this.previousVolume = 50;

        this.codeWindowDragging = false;

        this.dragOffsetX = 0;
        this.dragOffsetY = 0;


        /* =================================================
           PARAMÈTRES
        ================================================= */

        this.settings = {
            musicEnabled: true,
            volume: 50
        };


        /* =================================================
           DOM
        ================================================= */

        this.dom = {};


        /* =================================================
           INITIALISATION
        ================================================= */

        this.init();
    }



    /* =====================================================
       INITIALISATION
    ===================================================== */

    async init() {

        if (this.started) {
            return;
        }

        this.started = true;

        this.cacheDom();

        this.loadSettings();

        this.bindEvents();

        this.applySettings();

        this.prepareIntro();

        this.prepareCodeWindow();

        await this.prepareAssets();

        this.emit(
            "pyt:app-ready",
            {
                app: this
            }
        );
    }



    /* =====================================================
       DOM
    ===================================================== */

    cacheDom() {

        const ids = [

            /* INTRO */

            "intro-screen",
            "intro-scene",
            "intro-pyt",
            "intro-continue-message",
            "skip-intro-button",


            /* MENU */

            "main-menu",
            "play-button",
            "settings-button",


            /* SETTINGS */

            "settings-screen",
            "settings-back-button",
            "game-settings-button",

            "music-enabled",
            "volume-slider",
            "volume-value",

            "credits-button",


            /* CREDITS */

            "credits-screen",
            "credits-scroll",
            "close-credits-button",


            /* GAME */

            "game-interface",

            "chapter-screen",
            "map-screen",
            "game-screen",

            "course-button",
            "map-button",
            "menu-button",

            "course-map-button",
            "map-course-button",


            /* MAP */

            "map-title",
            "map-subtitle",
            "map-decoration",

            "level-node-1",
            "level-node-2",
            "level-node-3",

            "previous-chapter-button",
            "next-chapter-button",
            "map-chapter-indicator",


            /* BADGES */

            "chapter-badge",
            "difficulty-badge",
            "room-name",


            /* COURSE */

            "course-chapter-number",
            "course-title",
            "course-subtitle",
            "course-content",


            /* MISSION */

            "mission-title",
            "mission-instruction",

            "open-code-button",
            "restart-button",


            /* CODE */

            "code-window",
            "code-window-header",

            "code-editor",
            "code-error-highlights",

            "close-code-button",
            "clear-code-button",
            "run-code-button",
            "code-restart-button",

            "console-output",


            /* PYT GUIDE */

            "pyt-guide",
            "pyt-guide-message",
            "pyt-guide-actions",
            "close-pyt-guide-button",


            /* ROBOT THOUGHT */

            "robot-thought-bubble",


            /* MODAL */

            "modal-background",
            "message-modal",

            "modal-label",
            "modal-title",
            "modal-message",

            "modal-primary-button",
            "modal-secondary-button",


            /* AUDIO */

            "music-audio",
            "theory-audio",


            /* CANVAS */

            "game-canvas",

            "game-status"
        ];


        ids.forEach(
            id => {

                this.dom[id] =
                    document.getElementById(id);
            }
        );
    }



    get(id) {

        return (
            this.dom[id] ||
            document.getElementById(id)
        );
    }



    /* =====================================================
       EVENTS
    ===================================================== */

    bindEvents() {

        /* =================================================
           INTRO
        ================================================= */

        window.addEventListener(
            "keydown",
            event => {

                if (
                    this.currentScreen === "intro" &&
                    this.introReady
                ) {

                    event.preventDefault();

                    this.finishIntro();
                }
            }
        );


        const intro =
            this.get(
                "intro-screen"
            );


        if (intro) {

            intro.addEventListener(
                "pointerdown",
                () => {

                    if (
                        this.introReady
                    ) {

                        this.finishIntro();
                    }
                }
            );
        }



        /* =================================================
           MENU
        ================================================= */

        this.on(
            "play-button",
            "click",
            () => {

                this.openGame();
            }
        );


        this.on(
            "settings-button",
            "click",
            () => {

                this.settingsReturnScreen =
                    "menu";

                this.showSettings();
            }
        );



        /* =================================================
           SETTINGS
        ================================================= */

        this.on(
            "settings-back-button",
            "click",
            () => {

                this.closeSettings();
            }
        );


        this.on(
            "game-settings-button",
            "click",
            () => {

                this.settingsReturnScreen =
                    "game";

                this.showSettings();
            }
        );


        this.on(
            "music-enabled",
            "change",
            event => {

                this.setMusicEnabled(
                    event.target.checked
                );
            }
        );


        this.on(
            "volume-slider",
            "input",
            event => {

                const value =
                    Number(
                        event.target.value
                    );

                this.setVolume(
                    value,
                    true
                );
            }
        );



        /* =================================================
           CREDITS
        ================================================= */

        this.on(
            "credits-button",
            "click",
            () => {

                this.showCredits();
            }
        );


        this.on(
            "close-credits-button",
            "click",
            () => {

                this.closeCredits();
            }
        );



        /* =================================================
           GAME NAVIGATION
        ================================================= */

        this.on(
            "course-button",
            "click",
            () => {

                this.showCourse();
            }
        );


        this.on(
            "map-button",
            "click",
            () => {

                this.showMap();
            }
        );


        this.on(
            "course-map-button",
            "click",
            () => {

                this.showMap();
            }
        );


        this.on(
            "map-course-button",
            "click",
            () => {

                this.showCourse();
            }
        );


        this.on(
            "menu-button",
            "click",
            () => {

                this.showMainMenu();
            }
        );



        /* =================================================
           LEVELS
        ================================================= */

        for (
            let index = 1;
            index <= 3;
            index += 1
        ) {

            this.on(
                `level-node-${index}`,
                "click",
                () => {

                    this.selectLevel(
                        index
                    );
                }
            );
        }



        /* =================================================
           CHAPTERS
        ================================================= */

        this.on(
            "previous-chapter-button",
            "click",
            () => {

                this.changeChapter(
                    -1
                );
            }
        );


        this.on(
            "next-chapter-button",
            "click",
            () => {

                this.changeChapter(
                    1
                );
            }
        );



        /* =================================================
           CODE
        ================================================= */

        this.on(
            "open-code-button",
            "click",
            () => {

                this.openCodeWindow();
            }
        );


        this.on(
            "close-code-button",
            "click",
            () => {

                this.closeCodeWindow();
            }
        );


        this.on(
            "clear-code-button",
            "click",
            () => {

                this.clearCode();
            }
        );


        this.on(
            "run-code-button",
            "click",
            () => {

                this.runCode();
            }
        );


        this.on(
            "restart-button",
            "click",
            () => {

                this.restartLevel();
            }
        );


        this.on(
            "code-restart-button",
            "click",
            () => {

                this.restartLevel();
            }
        );



        /* =================================================
           GUIDE PYT
        ================================================= */

        this.on(
            "close-pyt-guide-button",
            "click",
            () => {

                this.hideGuide();
            }
        );



        /* =================================================
           RESIZE
        ================================================= */

        window.addEventListener(
            "resize",
            () => {

                this.updateResponsiveState();
            }
        );
    }



    on(
        id,
        event,
        callback
    ) {

        const element =
            this.get(id);

        if (!element) {
            return;
        }

        element.addEventListener(
            event,
            callback
        );
    }



    /* =====================================================
       INTRO
    ===================================================== */

    prepareIntro() {

        const message =
            this.get(
                "intro-continue-message"
            );


        if (message) {

            if (
                this.isTouchDevice()
            ) {

                message.textContent =
                    "Touchez l’écran pour continuer";

            } else {

                message.textContent =
                    "Appuyez sur une touche pour continuer";
            }
        }


        /*
        L'animation CSS dure environ 3.2 secondes.

        On ne passe PAS automatiquement au menu.
        On affiche simplement le message.
        */

        window.setTimeout(
            () => {

                this.introReady = true;

                if (message) {

                    message.classList.remove(
                        "hidden"
                    );
                }

            },
            3700
        );
    }



    finishIntro() {

        if (
            this.introFinished ||
            !this.introReady
        ) {
            return;
        }


        this.introFinished = true;

        this.showMainMenu();
    }



    /* =====================================================
       AFFICHAGE PRINCIPAL
    ===================================================== */

    hideMainScreens() {

        const ids = [
            "intro-screen",
            "main-menu",
            "settings-screen",
            "credits-screen",
            "game-interface"
        ];


        ids.forEach(
            id => {

                const element =
                    this.get(id);

                if (element) {

                    element.classList.add(
                        "hidden"
                    );
                }
            }
        );
    }



    hideGameScreens() {

        const ids = [
            "chapter-screen",
            "map-screen",
            "game-screen"
        ];


        ids.forEach(
            id => {

                const element =
                    this.get(id);

                if (element) {

                    element.classList.add(
                        "hidden"
                    );
                }
            }
        );
    }



    showMainMenu() {

        this.hideMainScreens();

        this.closeCodeWindow(
            true
        );

        this.hideGuide(
            true
        );

        const menu =
            this.get(
                "main-menu"
            );


        if (menu) {

            menu.classList.remove(
                "hidden"
            );
        }


        this.currentScreen =
            "menu";


        this.emit(
            "pyt:screen-change",
            {
                screen: "menu"
            }
        );
    }



    openGame() {

        this.hideMainScreens();

        const game =
            this.get(
                "game-interface"
            );


        if (game) {

            game.classList.remove(
                "hidden"
            );
        }


        this.currentScreen =
            "game";


        /*
        À l'ouverture du jeu,
        on arrive sur la carte.
        */

        this.showMap();


        this.emit(
            "pyt:game-open",
            {
                chapter:
                    this.currentChapter,

                level:
                    this.currentLevel
            }
        );
    }



    /* =====================================================
       SETTINGS
    ===================================================== */

    showSettings() {

        this.hideMainScreens();


        const settings =
            this.get(
                "settings-screen"
            );


        if (settings) {

            settings.classList.remove(
                "hidden"
            );
        }


        this.currentScreen =
            "settings";
    }



    closeSettings() {

        if (
            this.settingsReturnScreen ===
            "game"
        ) {

            this.hideMainScreens();

            const game =
                this.get(
                    "game-interface"
                );

            if (game) {

                game.classList.remove(
                    "hidden"
                );
            }

            this.currentScreen =
                "game";

            return;
        }


        this.showMainMenu();
    }



    /* =====================================================
       CREDITS
    ===================================================== */

    showCredits() {

        this.hideMainScreens();


        const credits =
            this.get(
                "credits-screen"
            );


        if (credits) {

            credits.classList.remove(
                "hidden"
            );
        }


        this.restartCreditsAnimation();


        this.currentScreen =
            "credits";
    }



    closeCredits() {

        const credits =
            this.get(
                "credits-screen"
            );


        if (credits) {

            credits.classList.add(
                "hidden"
            );
        }


        this.showSettings();
    }



    restartCreditsAnimation() {

        const scroll =
            this.get(
                "credits-scroll"
            );


        if (!scroll) {
            return;
        }


        scroll.style.animation =
            "none";


        /*
        Force le navigateur à recalculer
        le style pour redémarrer l'animation.
        */

        void scroll.offsetHeight;


        scroll.style.animation =
            "";
    }



    /* =====================================================
       GAME SCREENS
    ===================================================== */

    showCourse() {

        this.ensureGameVisible();

        this.hideGameScreens();


        const screen =
            this.get(
                "chapter-screen"
            );


        if (screen) {

            screen.classList.remove(
                "hidden"
            );
        }


        this.emit(
            "pyt:course-open",
            {
                chapter:
                    this.currentChapter
            }
        );
    }



    showMap() {

        this.ensureGameVisible();

        this.hideGameScreens();


        const screen =
            this.get(
                "map-screen"
            );


        if (screen) {

            screen.classList.remove(
                "hidden"
            );
        }


        this.updateMapNavigation();


        this.emit(
            "pyt:map-open",
            {
                chapter:
                    this.currentChapter
            }
        );
    }



    showGame() {

        this.ensureGameVisible();

        this.hideGameScreens();


        const screen =
            this.get(
                "game-screen"
            );


        if (screen) {

            screen.classList.remove(
                "hidden"
            );
        }


        this.emit(
            "pyt:level-screen-open",
            {
                chapter:
                    this.currentChapter,

                level:
                    this.currentLevel
            }
        );
    }



    ensureGameVisible() {

        const interfaceElement =
            this.get(
                "game-interface"
            );


        if (interfaceElement) {

            interfaceElement.classList.remove(
                "hidden"
            );
        }


        const menu =
            this.get(
                "main-menu"
            );

        const settings =
            this.get(
                "settings-screen"
            );

        const credits =
            this.get(
                "credits-screen"
            );


        menu?.classList.add(
            "hidden"
        );

        settings?.classList.add(
            "hidden"
        );

        credits?.classList.add(
            "hidden"
        );


        this.currentScreen =
            "game";
    }



    /* =====================================================
       CHAPTER
    ===================================================== */

    changeChapter(
        difference
    ) {

        const nextChapter =
            this.currentChapter +
            difference;


        if (
            nextChapter < 1 ||
            nextChapter > this.totalChapters
        ) {
            return;
        }


        /*
        Le verrouillage réel sera géré
        par ui.js avec la progression.

        Ici on ne force jamais l'accès
        à un chapitre verrouillé.
        */

        const event =
            new CustomEvent(
                "pyt:chapter-request",
                {
                    detail: {
                        currentChapter:
                            this.currentChapter,

                        requestedChapter:
                            nextChapter
                    },

                    cancelable:
                        true
                }
            );


        const accepted =
            window.dispatchEvent(
                event
            );


        if (!accepted) {
            return;
        }


        this.currentChapter =
            nextChapter;

        this.currentLevel =
            1;


        this.updateMapNavigation();


        this.emit(
            "pyt:chapter-change",
            {
                chapter:
                    this.currentChapter
            }
        );
    }



    updateMapNavigation() {

        const previous =
            this.get(
                "previous-chapter-button"
            );

        const next =
            this.get(
                "next-chapter-button"
            );

        const indicator =
            this.get(
                "map-chapter-indicator"
            );


        if (previous) {

            previous.disabled =
                this.currentChapter <= 1;
        }


        /*
        ui.js peut modifier cet état
        selon la progression du joueur.
        */

        if (next) {

            next.disabled =
                this.currentChapter >=
                this.totalChapters;
        }


        if (indicator) {

            indicator.textContent =
                `${this.currentChapter} / ${this.totalChapters}`;
        }


        const title =
            this.get(
                "map-title"
            );


        if (
            title &&
            !title.dataset.customTitle
        ) {

            title.textContent =
                `Chapitre ${this.currentChapter}`;
        }
    }



    /* =====================================================
       LEVEL SELECTION
    ===================================================== */

    selectLevel(
        levelNumber
    ) {

        const node =
            this.get(
                `level-node-${levelNumber}`
            );


        if (
            !node ||
            node.disabled ||
            node.classList.contains(
                "locked"
            )
        ) {
            return;
        }


        this.currentLevel =
            levelNumber;


        this.emit(
            "pyt:level-select",
            {
                chapter:
                    this.currentChapter,

                level:
                    this.currentLevel
            }
        );


        this.showGame();
    }



    /* =====================================================
       CODE WINDOW
    ===================================================== */

    openCodeWindow() {

        const windowElement =
            this.get(
                "code-window"
            );


        if (!windowElement) {
            return;
        }


        windowElement.classList.remove(
            "hidden"
        );


        const editor =
            this.get(
                "code-editor"
            );


        if (
            editor &&
            !this.isMobile()
        ) {

            window.setTimeout(
                () => {

                    editor.focus();
                },
                50
            );
        }


        this.emit(
            "pyt:code-window-open"
        );
    }



    closeCodeWindow(
        immediate = false
    ) {

        const windowElement =
            this.get(
                "code-window"
            );


        if (!windowElement) {
            return;
        }


        windowElement.classList.add(
            "hidden"
        );


        if (!immediate) {

            this.emit(
                "pyt:code-window-close"
            );
        }
    }



    clearCode() {

        const editor =
            this.get(
                "code-editor"
            );


        if (!editor) {
            return;
        }


        editor.value =
            "";


        editor.focus();


        this.clearCodeError();


        this.emit(
            "pyt:code-clear"
        );
    }



    runCode() {

        const editor =
            this.get(
                "code-editor"
            );


        const code =
            editor
                ? editor.value
                : "";


        this.clearConsole();

        this.clearCodeError();


        /*
        ui.js / game.js écouteront cet événement.
        app.js n'interprète pas directement Python.
        */

        this.emit(
            "pyt:run-code",
            {
                code,

                chapter:
                    this.currentChapter,

                level:
                    this.currentLevel
            }
        );
    }



    restartLevel() {

        this.hideThought();

        this.clearCodeError();

        this.clearConsole();


        this.emit(
            "pyt:restart-level",
            {
                chapter:
                    this.currentChapter,

                level:
                    this.currentLevel
            }
        );
    }



    /* =====================================================
       DRAG CODE WINDOW
    ===================================================== */

    prepareCodeWindow() {

        const header =
            this.get(
                "code-window-header"
            );

        const codeWindow =
            this.get(
                "code-window"
            );


        if (
            !header ||
            !codeWindow
        ) {
            return;
        }


        header.addEventListener(
            "pointerdown",
            event => {

                if (
                    this.isMobile()
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


                this.codeWindowDragging =
                    true;


                const rect =
                    codeWindow.getBoundingClientRect();


                this.dragOffsetX =
                    event.clientX -
                    rect.left;


                this.dragOffsetY =
                    event.clientY -
                    rect.top;


                header.setPointerCapture?.(
                    event.pointerId
                );
            }
        );


        window.addEventListener(
            "pointermove",
            event => {

                if (
                    !this.codeWindowDragging ||
                    this.isMobile()
                ) {
                    return;
                }


                const rect =
                    codeWindow.getBoundingClientRect();


                let left =
                    event.clientX -
                    this.dragOffsetX;


                let top =
                    event.clientY -
                    this.dragOffsetY;


                const maxLeft =
                    Math.max(
                        0,
                        window.innerWidth -
                        rect.width
                    );


                const maxTop =
                    Math.max(
                        0,
                        window.innerHeight -
                        60
                    );


                left =
                    Math.min(
                        Math.max(
                            0,
                            left
                        ),
                        maxLeft
                    );


                top =
                    Math.min(
                        Math.max(
                            0,
                            top
                        ),
                        maxTop
                    );


                codeWindow.style.left =
                    `${left}px`;


                codeWindow.style.top =
                    `${top}px`;
            }
        );


        window.addEventListener(
            "pointerup",
            () => {

                this.codeWindowDragging =
                    false;
            }
        );
    }



    /* =====================================================
       PYT GUIDE
    ===================================================== */

    showGuide(
        message,
        actions = []
    ) {

        const guide =
            this.get(
                "pyt-guide"
            );

        const messageElement =
            this.get(
                "pyt-guide-message"
            );

        const actionsElement =
            this.get(
                "pyt-guide-actions"
            );


        if (
            !guide ||
            !messageElement
        ) {
            return;
        }


        guide.classList.remove(
            "hidden",
            "is-leaving"
        );


        messageElement.textContent =
            message || "";


        if (actionsElement) {

            actionsElement.innerHTML =
                "";


            actions.forEach(
                action => {

                    const button =
                        document.createElement(
                            "button"
                        );


                    button.type =
                        "button";


                    button.textContent =
                        action.label || "Continuer";


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


                    actionsElement.appendChild(
                        button
                    );
                }
            );
        }
    }



    hideGuide(
        immediate = false
    ) {

        const guide =
            this.get(
                "pyt-guide"
            );


        if (
            !guide ||
            guide.classList.contains(
                "hidden"
            )
        ) {
            return;
        }


        if (immediate) {

            guide.classList.add(
                "hidden"
            );

            guide.classList.remove(
                "is-leaving"
            );

            return;
        }


        guide.classList.add(
            "is-leaving"
        );


        window.setTimeout(
            () => {

                guide.classList.add(
                    "hidden"
                );

                guide.classList.remove(
                    "is-leaving"
                );

            },
            280
        );
    }



    /* =====================================================
       ROBOT THOUGHT
    ===================================================== */

    showThought(
        message =
            "Ce n’est pas là que je voulais aller..."
    ) {

        const bubble =
            this.get(
                "robot-thought-bubble"
            );


        if (!bubble) {
            return;
        }


        bubble.textContent =
            message;


        bubble.classList.remove(
            "hidden"
        );
    }



    hideThought() {

        const bubble =
            this.get(
                "robot-thought-bubble"
            );


        bubble?.classList.add(
            "hidden"
        );
    }



    /* =====================================================
       MODAL
    ===================================================== */

    showModal({
        label = "PYT",
        title = "Message",
        message = "",
        primaryText = "Continuer",
        secondaryText = null,
        onPrimary = null,
        onSecondary = null
    } = {}) {

        const background =
            this.get(
                "modal-background"
            );


        if (!background) {
            return;
        }


        this.setText(
            "modal-label",
            label
        );

        this.setText(
            "modal-title",
            title
        );

        this.setText(
            "modal-message",
            message
        );


        const primary =
            this.get(
                "modal-primary-button"
            );


        const secondary =
            this.get(
                "modal-secondary-button"
            );


        if (primary) {

            primary.textContent =
                primaryText;


            primary.onclick =
                () => {

                    this.hideModal();

                    if (
                        typeof onPrimary ===
                        "function"
                    ) {

                        onPrimary();
                    }
                };
        }


        if (secondary) {

            if (secondaryText) {

                secondary.textContent =
                    secondaryText;

                secondary.classList.remove(
                    "hidden"
                );


                secondary.onclick =
                    () => {

                        this.hideModal();

                        if (
                            typeof onSecondary ===
                            "function"
                        ) {

                            onSecondary();
                        }
                    };

            } else {

                secondary.classList.add(
                    "hidden"
                );

                secondary.onclick =
                    null;
            }
        }


        background.classList.remove(
            "hidden"
        );
    }



    hideModal() {

        this.get(
            "modal-background"
        )?.classList.add(
            "hidden"
        );
    }



    /* =====================================================
       CONSOLE
    ===================================================== */

    setConsole(
        text
    ) {

        const output =
            this.get(
                "console-output"
            );


        if (!output) {
            return;
        }


        output.textContent =
            text || "";
    }



    appendConsole(
        text
    ) {

        const output =
            this.get(
                "console-output"
            );


        if (!output) {
            return;
        }


        if (
            output.textContent
        ) {

            output.textContent +=
                "\n";
        }


        output.textContent +=
            text;
    }



    clearConsole() {

        this.setConsole(
            ""
        );
    }



    /* =====================================================
       CODE ERROR
    ===================================================== */

    showCodeError(
        lineNumber
    ) {

        const editor =
            this.get(
                "code-editor"
            );


        if (
            !editor ||
            !lineNumber
        ) {
            return;
        }


        /*
        Le surlignage visuel précis sera
        géré dans ui.js.

        Ici on stocke simplement la ligne.
        */

        editor.dataset.errorLine =
            String(
                lineNumber
            );


        this.emit(
            "pyt:code-error-line",
            {
                line:
                    lineNumber
            }
        );
    }



    clearCodeError() {

        const editor =
            this.get(
                "code-editor"
            );


        if (editor) {

            delete editor.dataset.errorLine;
        }


        const overlay =
            this.get(
                "code-error-highlights"
            );


        if (overlay) {

            overlay.innerHTML =
                "";
        }
    }



    /* =====================================================
       SETTINGS STORAGE
    ===================================================== */

    loadSettings() {

        try {

            const saved =
                localStorage.getItem(
                    "pyt-settings"
                );


            if (!saved) {
                return;
            }


            const parsed =
                JSON.parse(
                    saved
                );


            if (
                typeof parsed.musicEnabled ===
                "boolean"
            ) {

                this.settings.musicEnabled =
                    parsed.musicEnabled;
            }


            if (
                Number.isFinite(
                    Number(
                        parsed.volume
                    )
                )
            ) {

                this.settings.volume =
                    this.clamp(
                        Number(
                            parsed.volume
                        ),
                        0,
                        100
                    );
            }


            if (
                Number.isFinite(
                    Number(
                        parsed.previousVolume
                    )
                )
            ) {

                this.previousVolume =
                    this.clamp(
                        Number(
                            parsed.previousVolume
                        ),
                        1,
                        100
                    );
            }

        } catch (error) {

            console.warn(
                "Impossible de lire les paramètres PYT.",
                error
            );
        }
    }



    saveSettings() {

        try {

            localStorage.setItem(
                "pyt-settings",
                JSON.stringify({
                    musicEnabled:
                        this.settings.musicEnabled,

                    volume:
                        this.settings.volume,

                    previousVolume:
                        this.previousVolume
                })
            );

        } catch (error) {

            console.warn(
                "Impossible d'enregistrer les paramètres PYT.",
                error
            );
        }
    }



    applySettings() {

        const enabled =
            this.get(
                "music-enabled"
            );


        const slider =
            this.get(
                "volume-slider"
            );


        if (enabled) {

            enabled.checked =
                this.settings.musicEnabled;
        }


        if (slider) {

            slider.value =
                this.settings.volume;
        }


        this.updateVolumeDisplay();

        this.applyAudioVolume();
    }



    setMusicEnabled(
        enabled
    ) {

        this.settings.musicEnabled =
            Boolean(
                enabled
            );


        if (
            !this.settings.musicEnabled
        ) {

            if (
                this.settings.volume > 0
            ) {

                this.previousVolume =
                    this.settings.volume;
            }


            this.settings.volume =
                0;


            const slider =
                this.get(
                    "volume-slider"
                );


            if (slider) {

                slider.value =
                    "0";
            }

        } else {

            if (
                this.settings.volume === 0
            ) {

                this.settings.volume =
                    this.previousVolume > 0
                        ? this.previousVolume
                        : 50;


                const slider =
                    this.get(
                        "volume-slider"
                    );


                if (slider) {

                    slider.value =
                        String(
                            this.settings.volume
                        );
                }
            }
        }


        this.updateVolumeDisplay();

        this.applyAudioVolume();

        this.saveSettings();


        this.emit(
            "pyt:music-setting-change",
            {
                enabled:
                    this.settings.musicEnabled,

                volume:
                    this.settings.volume
            }
        );
    }



    setVolume(
        value,
        fromUser = false
    ) {

        const volume =
            this.clamp(
                Number(
                    value
                ),
                0,
                100
            );


        this.settings.volume =
            volume;


        if (
            volume > 0
        ) {

            this.previousVolume =
                volume;


            /*
            Si le joueur remet le volume
            au-dessus de zéro manuellement,
            la musique est réactivée.
            */

            if (fromUser) {

                this.settings.musicEnabled =
                    true;
            }

        } else if (fromUser) {

            this.settings.musicEnabled =
                false;
        }


        const checkbox =
            this.get(
                "music-enabled"
            );


        if (checkbox) {

            checkbox.checked =
                this.settings.musicEnabled;
        }


        this.updateVolumeDisplay();

        this.applyAudioVolume();

        this.saveSettings();


        this.emit(
            "pyt:volume-change",
            {
                volume:
                    volume,

                enabled:
                    this.settings.musicEnabled
            }
        );
    }



    updateVolumeDisplay() {

        const value =
            this.get(
                "volume-value"
            );


        if (value) {

            value.textContent =
                `${Math.round(
                    this.settings.volume
                )}%`;
        }
    }



    applyAudioVolume() {

        const volume =
            this.settings.musicEnabled
                ? this.settings.volume / 100
                : 0;


        const audioElements = [
            this.get(
                "music-audio"
            ),
            this.get(
                "theory-audio"
            )
        ];


        audioElements.forEach(
            audio => {

                if (!audio) {
                    return;
                }


                audio.volume =
                    this.clamp(
                        volume,
                        0,
                        1
                    );


                if (
                    !this.settings.musicEnabled
                ) {

                    audio.pause();
                }
            }
        );
    }



    /* =====================================================
       AUDIO PUBLIC API
    ===================================================== */

    async playMusic(
        source
    ) {

        if (
            !this.settings.musicEnabled ||
            !source
        ) {
            return false;
        }


        const audio =
            this.get(
                "music-audio"
            );


        if (!audio) {
            return false;
        }


        try {

            if (
                audio.dataset.source !==
                source
            ) {

                audio.pause();

                audio.src =
                    source;

                audio.dataset.source =
                    source;


                audio.load();
            }


            audio.volume =
                this.settings.volume /
                100;


            await audio.play();

            return true;

        } catch (error) {

            /*
            Certains navigateurs empêchent
            l'audio avant une interaction.
            Ce n'est pas une erreur du jeu.
            */

            return false;
        }
    }



    stopMusic() {

        const audio =
            this.get(
                "music-audio"
            );


        if (!audio) {
            return;
        }


        audio.pause();

        audio.currentTime =
            0;
    }



    async playTheoryMusic(
        source
    ) {

        if (
            !this.settings.musicEnabled ||
            !source
        ) {
            return false;
        }


        const audio =
            this.get(
                "theory-audio"
            );


        if (!audio) {
            return false;
        }


        try {

            if (
                audio.dataset.source !==
                source
            ) {

                audio.pause();

                audio.src =
                    source;

                audio.dataset.source =
                    source;

                audio.load();
            }


            audio.volume =
                this.settings.volume /
                100;


            await audio.play();

            return true;

        } catch (error) {

            return false;
        }
    }



    stopTheoryMusic() {

        const audio =
            this.get(
                "theory-audio"
            );


        if (!audio) {
            return;
        }


        audio.pause();

        audio.currentTime =
            0;
    }



    /* =====================================================
       ASSETS
    ===================================================== */

    async prepareAssets() {

        if (
            !window.pytAssets ||
            typeof window.pytAssets.loadAll !==
            "function"
        ) {
            return;
        }


        try {

            await window.pytAssets.loadAll();


            const stats =
                window.pytAssets.getStats?.();


            if (stats) {

                console.log(
                    `PYT images : ${stats.loaded}/${stats.total} chargées.`
                );
            }


            this.emit(
                "pyt:assets-ready",
                {
                    assets:
                        window.pytAssets,

                    stats:
                        stats || null
                }
            );

        } catch (error) {

            /*
            Les images sont facultatives.
            Le jeu continue même si leur
            chargement échoue.
            */

            console.warn(
                "Certaines images PYT n'ont pas pu être chargées."
            );
        }
    }



    /* =====================================================
       LEVEL DATA API

       ui.js pourra appeler cette fonction.
    ===================================================== */

    setCurrentLevelData(
        data
    ) {

        this.currentLevelData =
            data || null;


        if (!data) {
            return;
        }


        if (
            Number.isFinite(
                Number(
                    data.chapter
                )
            )
        ) {

            this.currentChapter =
                Number(
                    data.chapter
                );
        }


        if (
            Number.isFinite(
                Number(
                    data.level
                )
            )
        ) {

            this.currentLevel =
                Number(
                    data.level
                );
        }


        if (data.title) {

            this.setText(
                "mission-title",
                data.title
            );
        }


        if (
            data.instruction
        ) {

            this.setText(
                "mission-instruction",
                data.instruction
            );
        }


        if (
            data.difficulty
        ) {

            this.setText(
                "difficulty-badge",
                data.difficulty
            );
        }


        if (data.room) {

            this.setText(
                "room-name",
                data.room
            );
        }


        this.setText(
            "chapter-badge",
            `Chapitre ${this.currentChapter} · Exercice ${this.currentLevel}`
        );


        this.updateMapNavigation();
    }



    /* =====================================================
       RESPONSIVE
    ===================================================== */

    updateResponsiveState() {

        const codeWindow =
            this.get(
                "code-window"
            );


        if (
            codeWindow &&
            this.isMobile()
        ) {

            codeWindow.style.left =
                "";

            codeWindow.style.top =
                "";
        }
    }



    isMobile() {

        return window.matchMedia(
            "(max-width: 720px)"
        ).matches;
    }



    isTouchDevice() {

        return (
            "ontouchstart" in window ||
            navigator.maxTouchPoints > 0 ||
            window.matchMedia(
                "(pointer: coarse)"
            ).matches
        );
    }



    /* =====================================================
       UTILITAIRES
    ===================================================== */

    setText(
        id,
        text
    ) {

        const element =
            this.get(id);


        if (element) {

            element.textContent =
                text ?? "";
        }
    }



    clamp(
        value,
        min,
        max
    ) {

        return Math.min(
            max,
            Math.max(
                min,
                value
            )
        );
    }



    emit(
        name,
        detail = {}
    ) {

        window.dispatchEvent(
            new CustomEvent(
                name,
                {
                    detail
                }
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