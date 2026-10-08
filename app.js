
"use strict";

/* =========================================================
   PYT - app.js

   APPLICATION PRINCIPALE

   Gère :
   - l'introduction
   - la navigation générale
   - les paramètres
   - la musique
   - les crédits
   - la fenêtre de code Python
   - les messages de Pyt
   - les fenêtres de réussite

   ui.js gère les chapitres et la progression.
   game.js gère l'interpréteur et les déplacements.
   art.js conserve tous les graphismes.
========================================================= */

(() => {

    class PytApplication {

        constructor() {

            this.byId = id =>
                document.getElementById(id);

            this.primaryIds = [
                "intro-screen",
                "main-menu",
                "settings-screen",
                "credits-screen",
                "game-interface"
            ];

            this.subscreenIds = [
                "chapter-screen",
                "map-screen",
                "game-screen"
            ];

            this.activeSubscreen = "map-screen";

            this.settingsReturn = "game";
            this.creditsReturn = "settings";

            this.introReady = false;
            this.introDone = false;
            this.introTimers = [];

            this.creditsFrame = null;
            this.creditsSubtitleTimer = null;
            this.creditsToken = 0;

            this.modalActions = {
                primary: null,
                secondary: null
            };

            this.storage = {
                music: "pyt-music-enabled",
                volume: "pyt-music-volume",
                drafts: "pyt-code-drafts"
            };

            this.musicEnabled =
                this.readStorage(
                    this.storage.music,
                    "1"
                ) !== "0";

            this.volume =
                this.clamp(
                    Number(
                        this.readStorage(
                            this.storage.volume,
                            "50"
                        )
                    ),
                    0,
                    100
                );

            this.drafts =
                this.readJSON(
                    this.storage.drafts
                );

            this.cacheElements();

            this.bindEvents();

            this.applyAudioSettings();

            this.setupIntro();
        }

        /* =====================================================
           RÉCUPÉRATION DES ÉLÉMENTS HTML
        ===================================================== */

        cacheElements() {

            const get = this.byId;

            this.introScreen =
                get("intro-screen");

            this.introScene =
                get("intro-scene");

            this.introContinue =
                get("intro-continue-message");

            this.skipIntroButton =
                get("skip-intro-button");

            this.settingsScreen =
                get("settings-screen");

            this.gameInterface =
                get("game-interface");

            this.creditsScreen =
                get("credits-screen");

            this.creditsScroll =
                get("credits-scroll");

            this.creditsPerspective =
                this.creditsScreen
                    ?.querySelector(
                        ".credits-perspective"
                    ) || null;

            this.creditsTitle =
                this.creditsScroll
                    ?.querySelector(
                        ".credits-final-title"
                    ) || null;

            this.codeWindow =
                get("code-window");

            this.codeEditor =
                get("code-editor");

            this.consoleOutput =
                get("console-output");

            this.runButton =
                get("run-code-button");

            this.guide =
                get("pyt-guide");

            this.guideMessage =
                get("pyt-guide-message");

            this.guideActions =
                get("pyt-guide-actions");

            this.modalBackground =
                get("modal-background");

            this.musicInput =
                get("music-enabled");

            this.volumeSlider =
                get("volume-slider");

            this.volumeValue =
                get("volume-value");

            this.musicAudio =
                get("music-audio");

            this.theoryAudio =
                get("theory-audio");

            this.thought =
                get("robot-thought-bubble");
        }

        /* =====================================================
           STOCKAGE LOCAL
        ===================================================== */

        readStorage(key, fallback = null) {

            try {

                return (
                    localStorage.getItem(key) ??
                    fallback
                );

            } catch (error) {

                return fallback;
            }
        }

        writeStorage(key, value) {

            try {

                localStorage.setItem(
                    key,
                    String(value)
                );

            } catch (error) {

                console.warn(
                    "[PYT] Sauvegarde indisponible.",
                    error
                );
            }
        }

        readJSON(key) {

            try {

                const value =
                    JSON.parse(
                        this.readStorage(
                            key,
                            "{}"
                        )
                    );

                if (
                    value &&
                    typeof value === "object" &&
                    !Array.isArray(value)
                ) {

                    return value;
                }

            } catch (error) {

                console.warn(
                    "[PYT] Lecture des données impossible.",
                    error
                );
            }

            return {};
        }

        /* =====================================================
           OUTILS GÉNÉRAUX
        ===================================================== */

        clamp(value, min, max) {

            return Math.max(
                min,
                Math.min(
                    max,
                    Number.isFinite(value)
                        ? value
                        : min
                )
            );
        }

        setVisible(element, visible) {

            if (!element) {
                return;
            }

            element.hidden = !visible;

            element.classList.toggle(
                "hidden",
                !visible
            );
        }

        isVisible(element) {

            return Boolean(
                element &&
                !element.hidden &&
                !element.classList.contains(
                    "hidden"
                )
            );
        }

        bind(id, callback) {

            const button =
                this.byId(id);

            if (!button) {
                return;
            }

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    callback(event);
                }
            );
        }

        /* =====================================================
           ÉVÉNEMENTS DES BOUTONS
        ===================================================== */

        bindEvents() {

            /* INTRO */

            this.bind(
                "skip-intro-button",
                () => this.finishIntro()
            );

            this.bind(
                "play-button",
                () => this.enterGame()
            );

            /* PARAMÈTRES */

            this.bind(
                "settings-button",
                () => this.openSettings()
            );

            this.bind(
                "game-settings-button",
                () => this.openSettings()
            );

            this.bind(
                "settings-back-button",
                () => this.closeSettings()
            );

            /* CRÉDITS */

            this.bind(
                "credits-button",
                () => this.openCredits()
            );

            this.bind(
                "close-credits-button",
                () => this.closeCredits()
            );

            /* LOGO PYT : RETOUR MAISON */

            this.bind(
                "menu-button",
                () => {

                    this.hideCodeWindow();

                    if (
                        window.pytUI &&
                        typeof window.pytUI
                            .openHouseMap === "function"
                    ) {

                        window.pytUI.openHouseMap();

                    } else {

                        this.showMap();
                    }
                }
            );

            /*
             * Les boutons Carte et Théorie
             * sont déjà gérés par ui.js.
             *
             * On ne leur ajoute pas ici
             * de deuxième événement.
             */

            /* FENÊTRE DE CODE */

            this.bind(
                "open-code-button",
                () => this.openCodeWindow()
            );

            this.bind(
                "close-code-button",
                () => this.hideCodeWindow()
            );

            this.bind(
                "clear-code-button",
                () => {

                    if (!this.codeEditor) {
                        return;
                    }

                    this.codeEditor.value = "";

                    this.saveDraft();

                    window.pytUI
                        ?.clearCodeError?.();

                    this.codeEditor.focus();
                }
            );

            this.bind(
                "run-code-button",
                () => this.runCode()
            );

            /* RECOMMENCER */

            this.bind(
                "restart-button",
                () => this.restartLevel()
            );

            this.bind(
                "code-restart-button",
                () => this.restartLevel()
            );

            /* GUIDE */

            this.bind(
                "close-pyt-guide-button",
                () => this.hideGuide()
            );

            /* MODALES */

            this.bind(
                "modal-primary-button",
                () => this.chooseModal("primary")
            );

            this.bind(
                "modal-secondary-button",
                () => this.chooseModal("secondary")
            );

            /* ÉDITEUR : SAUVEGARDE */

            this.codeEditor
                ?.addEventListener(
                    "input",
                    () => this.saveDraft()
                );

            /* ÉDITEUR : TAB ET CTRL+ENTRÉE */

            this.codeEditor
                ?.addEventListener(
                    "keydown",
                    event => {

                        if (event.key === "Tab") {

                            event.preventDefault();

                            const from =
                                event.target.selectionStart;

                            const to =
                                event.target.selectionEnd;

                            const text =
                                event.target.value;

                            event.target.value =
                                text.slice(0, from) +
                                "    " +
                                text.slice(to);

                            event.target.selectionStart =
                                from + 4;

                            event.target.selectionEnd =
                                from + 4;

                            this.saveDraft();
                        }

                        if (
                            event.key === "Enter" &&
                            (
                                event.ctrlKey ||
                                event.metaKey
                            )
                        ) {

                            event.preventDefault();

                            this.runCode();
                        }
                    }
                );

            /* CLAVIER GLOBAL */

            document.addEventListener(
                "keydown",
                event => {

                    if (event.key === "Escape") {

                        if (
                            this.isVisible(
                                this.modalBackground
                            )
                        ) {

                            this.closeModal();

                        } else if (
                            this.isVisible(
                                this.creditsScreen
                            )
                        ) {

                            this.closeCredits();

                        } else if (
                            this.isVisible(
                                this.settingsScreen
                            )
                        ) {

                            this.closeSettings();

                        } else if (
                            this.isVisible(
                                this.codeWindow
                            )
                        ) {

                            this.hideCodeWindow();

                        } else if (
                            this.isVisible(
                                this.guide
                            )
                        ) {

                            this.hideGuide();
                        }

                        return;
                    }

                    /*
                     * Une touche continue l'intro
                     * uniquement lorsque
                     * l'animation est terminée.
                     */

                    if (
                        !this.introDone &&
                        this.introReady &&
                        this.isVisible(
                            this.introScreen
                        )
                    ) {

                        const ignored = [
                            "Tab",
                            "Shift",
                            "Control",
                            "Alt",
                            "Meta"
                        ];

                        if (
                            !ignored.includes(
                                event.key
                            )
                        ) {

                            this.finishIntro();
                        }
                    }
                }
            );

            /* CLIC OU TOUCHER SUR L'INTRO */

            this.introScreen
                ?.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target ===
                            this.skipIntroButton
                        ) {

                            return;
                        }

                        if (this.introReady) {

                            this.finishIntro();
                        }
                    }
                );

            /* FERMER MODALE EN DEHORS */

            this.modalBackground
                ?.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target ===
                            this.modalBackground
                        ) {

                            this.closeModal();
                        }
                    }
                );

            /* MUSIQUE */

            this.musicInput
                ?.addEventListener(
                    "change",
                    () => {

                        this.musicEnabled =
                            Boolean(
                                this.musicInput.checked
                            );

                        this.writeStorage(
                            this.storage.music,
                            this.musicEnabled
                                ? "1"
                                : "0"
                        );

                        this.applyAudioSettings(true);
                    }
                );

            /* VOLUME */

            this.volumeSlider
                ?.addEventListener(
                    "input",
                    () => {

                        this.volume =
                            this.clamp(
                                Number(
                                    this.volumeSlider.value
                                ),
                                0,
                                100
                            );

                        this.writeStorage(
                            this.storage.volume,
                            this.volume
                        );

                        this.applyAudioSettings(true);
                    }
                );

            /* EXERCICE OUVERT PAR UI.JS */

            window.addEventListener(
                "pyt:level-opened",
                () => {

                    this.restoreDraft();

                    this.hideCodeWindow();

                    this.hideGuide();

                    this.hideThought();

                    this.showGame();
                }
            );

            /* RÉSULTAT DU MOTEUR */

            window.addEventListener(
                "pyt:execution-result",
                event => {

                    this.showExecutionResult(
                        event.detail || {}
                    );
                }
            );
        }

        /* =====================================================
           INTRO
        ===================================================== */

        setupIntro() {

            /*
             * Au lancement, seule l'intro
             * doit être visible.
             */

            this.primaryIds.forEach(
                id => {

                    this.setVisible(
                        this.byId(id),
                        id === "intro-screen"
                    );
                }
            );

            this.setVisible(
                this.introContinue,
                false
            );

            this.setVisible(
                this.skipIntroButton,
                false
            );

            this.setVisible(
                this.codeWindow,
                false
            );

            this.setVisible(
                this.guide,
                false
            );

            this.setVisible(
                this.modalBackground,
                false
            );

            /* SOUS-TITRE */

            this.ensureIntroSubtitle();

            /*
             * Le robot de l'intro seulement.
             * Celui du jeu n'est pas modifié.
             *
             * On supprime toute animation
             * de saut sur le corps.
             *
             * L'arrivée depuis la droite
             * reste gérée par style.css
             * sur .intro-robot-wrapper.
             */

            const introRobot =
                this.introScreen
                    ?.querySelector(
                        ".intro-pyt"
                    );

            if (introRobot) {

                introRobot.style.animation =
                    "none";

                introRobot.style.transform =
                    "scale(1.04)";
            }

            /*
             * Le bouton Passer apparaît
             * rapidement.
             */

            this.introTimers.push(
                setTimeout(
                    () => {

                        this.setVisible(
                            this.skipIntroButton,
                            true
                        );

                    },
                    950
                )
            );

            /*
             * L'intro dure environ 4 secondes.
             *
             * Le robot :
             * 1. arrive depuis la droite
             * 2. se place entre P et T
             * 3. lève les bras
             *
             * Puis le message pour continuer
             * apparaît.
             */

            this.introTimers.push(
                setTimeout(
                    () => {

                        this.introReady = true;

                        this.setVisible(
                            this.introContinue,
                            true
                        );

                        this.introContinue
                            ?.classList
                            .add("visible");

                    },
                    3950
                )
            );
        }

        ensureIntroSubtitle() {

            if (!this.introScreen) {
                return;
            }

            let subtitle =
                this.byId(
                    "intro-subtitle"
                );

            /*
             * Si le sous-titre existe déjà
             * dans index.html, on le réutilise.
             *
             * Sinon app.js le crée
             * automatiquement.
             */

            if (!subtitle) {

                subtitle =
                    document.createElement(
                        "div"
                    );

                subtitle.id =
                    "intro-subtitle";

                subtitle.className =
                    "intro-subtitle";

                this.introScreen
                    .appendChild(
                        subtitle
                    );
            }

            subtitle.textContent =
                "apprentissage Python";

            subtitle.style.textTransform =
                "none";
        }

        finishIntro() {

            if (this.introDone) {
                return;
            }

            this.introDone = true;

            this.introReady = false;

            this.introTimers.forEach(
                timer =>
                    clearTimeout(timer)
            );

            this.introTimers = [];

            this.introContinue
                ?.classList
                .remove("visible");

            /*
             * Petit fondu avant
             * d'afficher la maison.
             */

            this.introScreen
                ?.classList
                .add("intro-leaving");

            setTimeout(
                () => this.enterGame(),
                450
            );
        }

        /* =====================================================
           ENTRER DANS LE JEU
        ===================================================== */

        enterGame() {

            this.introDone = true;

            this.setVisible(
                this.introScreen,
                false
            );

            this.setVisible(
                this.byId("main-menu"),
                false
            );

            this.setVisible(
                this.settingsScreen,
                false
            );

            this.setVisible(
                this.creditsScreen,
                false
            );

            this.setVisible(
                this.gameInterface,
                true
            );

            this.hideCodeWindow();

            this.hideGuide();

            /*
             * La maison est ouverte par ui.js,
             * qui conserve sa carte et
             * ses règles de progression.
             */

            if (
                window.pytUI &&
                typeof window.pytUI
                    .openHouseMap === "function"
            ) {

                window.pytUI
                    .openHouseMap(true);

            } else {

                this.showMap();
            }

            this.applyAudioSettings(true);
        }

        /* =====================================================
           AFFICHAGE GÉNÉRAL
        ===================================================== */

        showPrimary(id) {

            this.primaryIds.forEach(
                name => {

                    this.setVisible(
                        this.byId(name),
                        name === id
                    );
                }
            );
        }

        showSubscreen(id) {

            this.activeSubscreen = id;

            /*
             * Afficher d'abord
             * l'interface principale.
             */

            this.showPrimary(
                "game-interface"
            );

            /*
             * Une seule sous-page
             * doit être visible.
             */

            this.subscreenIds.forEach(
                name => {

                    this.setVisible(
                        this.byId(name),
                        name === id
                    );
                }
            );

            /*
             * On cache la fenêtre de code
             * quand on quitte l'exercice,
             * mais son contenu reste intact.
             */

            if (
                id !== "game-screen"
            ) {

                this.hideCodeWindow();

                this.hideThought();
            }

            this.hideGuide();

            this.applyAudioSettings(true);

            /*
             * Important :
             * le canvas doit être visible
             * avant le redimensionnement.
             */

            if (
                id === "game-screen"
            ) {

                requestAnimationFrame(
                    () => {

                        window.pytGame
                            ?.resizeCanvas?.();

                        window.pytGame
                            ?.render?.();
                    }
                );
            }
        }

        /* =====================================================
           MÉTHODES UTILISÉES PAR UI.JS
        ===================================================== */

        showMap() {

            this.showSubscreen(
                "map-screen"
            );
        }

        showCourse() {

            this.showSubscreen(
                "chapter-screen"
            );
        }

        showGame() {

            this.showSubscreen(
                "game-screen"
            );
        }

        /* =====================================================
           PARAMÈTRES
        ===================================================== */

        openSettings() {

            this.settingsReturn =
                this.isVisible(
                    this.gameInterface
                )
                    ? "game"
                    : "intro";

            this.showPrimary(
                "settings-screen"
            );

            this.hideCodeWindow();

            this.hideGuide();

            this.applyAudioSettings();
        }

        closeSettings() {

            if (
                this.settingsReturn === "intro" &&
                !this.introDone
            ) {

                this.showPrimary(
                    "intro-screen"
                );

            } else {

                this.showSubscreen(
                    this.activeSubscreen
                );
            }
        }

        /* =====================================================
           AUDIO
        ===================================================== */

        hasAudioSource(audio) {

            return Boolean(
                audio &&
                (
                    audio.currentSrc ||
                    audio.getAttribute("src") ||
                    audio.querySelector(
                        "source[src]"
                    )
                )
            );
        }

        applyAudioSettings(
            userGesture = false
        ) {

            if (this.musicInput) {

                this.musicInput.checked =
                    this.musicEnabled;
            }

            if (this.volumeSlider) {

                this.volumeSlider.value =
                    String(this.volume);
            }

            if (this.volumeValue) {

                this.volumeValue.textContent =
                    `${this.volume}%`;
            }

            const inTheory =
                this.activeSubscreen ===
                    "chapter-screen" &&
                this.isVisible(
                    this.gameInterface
                );

            const selected =
                inTheory
                    ? this.theoryAudio
                    : this.musicAudio;

            for (
                const audio of [
                    this.musicAudio,
                    this.theoryAudio
                ]
            ) {

                if (!audio) {
                    continue;
                }

                audio.volume =
                    this.volume / 100;

                if (
                    !this.musicEnabled ||
                    audio !== selected ||
                    !this.hasAudioSource(audio)
                ) {

                    audio.pause();

                } else if (userGesture) {

                    const result =
                        audio.play();

                    if (
                        result &&
                        typeof result.catch ===
                            "function"
                    ) {

                        result.catch(
                            () => {}
                        );
                    }
                }
            }
        }

        playSfx(name) {

            /*
             * Les bruitages sont prévus
             * pour une version ultérieure.
             *
             * Cette méthode reste présente
             * pour les appels depuis game.js.
             */

        }

        /* =====================================================
           CRÉDITS
        ===================================================== */

        openCredits() {

            this.creditsReturn =
                this.isVisible(
                    this.settingsScreen
                )
                    ? "settings"
                    : "game";

            this.showPrimary(
                "credits-screen"
            );

            this.startCredits();
        }

        /* =====================================================
           DÉFILEMENT STAR WARS
        ===================================================== */

        startCredits() {

            if (
                !this.creditsScreen ||
                !this.creditsScroll ||
                !this.creditsTitle
            ) {

                return;
            }

            this.stopCredits();

            const token =
                ++this.creditsToken;

            const viewer =
                this.creditsPerspective ||
                this.creditsScreen;

            const scroll =
                this.creditsScroll;

            const title =
                this.creditsTitle;

            /*
             * On conserve les noms
             * des contributeurs déjà écrits
             * dans index.html.
             */

            scroll.style.animation =
                "none";

            scroll.style.position =
                "absolute";

            scroll.style.left =
                "50%";

            scroll.style.width =
                "min(88vw, 720px)";

            scroll.style.textAlign =
                "center";

            scroll.style.transformOrigin =
                "50% 50%";

            scroll.style.willChange =
                "transform";

            viewer.style.perspective =
                "900px";

            /*
             * Titre final PYT géant.
             */

            title.style.textAlign =
                "center";

            title.style.fontSize =
                "clamp(88px, 18vw, 220px)";

            title.style.lineHeight =
                "1.15";

            /*
             * Sous-titre final.
             * Il apparaît 3 secondes
             * après l'arrêt du défilement.
             */

            let subtitle =
                scroll.querySelector(
                    ".credits-final-subtitle"
                );

            if (!subtitle) {

                subtitle =
                    document.createElement(
                        "div"
                    );

                subtitle.className =
                    "credits-final-subtitle";

                subtitle.textContent =
                    "apprentissage Python";

                title.insertAdjacentElement(
                    "afterend",
                    subtitle
                );
            }

            Object.assign(
                subtitle.style,
                {

                    textAlign:
                        "center",

                    fontSize:
                        "clamp(12px, 2vw, 22px)",

                    fontWeight:
                        "700",

                    letterSpacing:
                        "0.08em",

                    color:
                        "#fff1d2",

                    textShadow:
                        "2px 3px 0 #171424",

                    opacity:
                        "0",

                    transition:
                        "opacity 650ms ease",

                    marginTop:
                        "10px"
                }
            );

            /*
             * Position initiale du défilement :
             * sous l'écran.
             */

            scroll.style.transform =
                "translate3d(-50%, 0px, 0) rotateX(18deg)";

            const height =
                Math.max(
                    1,
                    viewer
                        .getBoundingClientRect()
                        .height ||
                    window.innerHeight
                );

            const initial =
                height * 1.10;

            /*
             * Destination :
             * le grand titre final
             * doit finir au centre.
             */

            const titleCenter =
                title.offsetTop +
                title.offsetHeight / 2;

            const destination =
                height / 2 -
                titleCenter;

            const duration =
                30000;

            const started =
                performance.now();

            const drawAt =
                y => {

                    scroll.style.transform =
                        `translate3d(-50%, ${y}px, 0) rotateX(18deg)`;
                };

            drawAt(initial);

            const step =
                now => {

                    if (
                        token !==
                            this.creditsToken ||
                        !this.isVisible(
                            this.creditsScreen
                        )
                    ) {

                        return;
                    }

                    const progress =
                        Math.min(
                            1,
                            (
                                now -
                                started
                            ) /
                            duration
                        );

                    const y =
                        initial +
                        (
                            destination -
                            initial
                        ) *
                        progress;

                    drawAt(y);

                    if (
                        progress < 1
                    ) {

                        this.creditsFrame =
                            requestAnimationFrame(
                                step
                            );

                        return;
                    }

                    this.creditsFrame =
                        null;

                    /*
                     * Corriger précisément
                     * la position du titre
                     * une fois le défilement
                     * terminé.
                     */

                    const targetY =
                        window.innerHeight / 2;

                    const rect =
                        title
                            .getBoundingClientRect();

                    const correction =
                        targetY -
                        (
                            rect.top +
                            rect.height / 2
                        );

                    drawAt(
                        destination +
                        correction
                    );

                    /*
                     * Le défilement est arrêté.
                     * PYT reste au centre.
                     *
                     * Trois secondes plus tard :
                     * apprentissage Python.
                     */

                    this.creditsSubtitleTimer =
                        setTimeout(
                            () => {

                                if (
                                    token ===
                                        this.creditsToken &&
                                    this.isVisible(
                                        this.creditsScreen
                                    )
                                ) {

                                    subtitle.style.opacity =
                                        "1";
                                }

                            },
                            3000
                        );
                };

            this.creditsFrame =
                requestAnimationFrame(
                    step
                );
        }

        stopCredits() {

            this.creditsToken++;

            if (
                this.creditsFrame !==
                    null
            ) {

                cancelAnimationFrame(
                    this.creditsFrame
                );
            }

            if (
                this.creditsSubtitleTimer !==
                    null
            ) {

                clearTimeout(
                    this.creditsSubtitleTimer
                );
            }

            this.creditsFrame =
                null;

            this.creditsSubtitleTimer =
                null;
        }

        closeCredits() {

            this.stopCredits();

            if (
                this.creditsReturn ===
                    "settings"
            ) {

                this.showPrimary(
                    "settings-screen"
                );

            } else {

                this.showSubscreen(
                    this.activeSubscreen
                );
            }
        }

        /* =====================================================
           SAUVEGARDE DU CODE PYTHON
        ===================================================== */

        currentLevelKey() {

            return (
                window.pytUI
                    ?.currentLevelKey ||
                null
            );
        }

        saveDraft() {

            const key =
                this.currentLevelKey();

            if (
                !key ||
                !this.codeEditor
            ) {

                return;
            }

            this.drafts[key] =
                this.codeEditor.value;

            this.writeStorage(
                this.storage.drafts,
                JSON.stringify(
                    this.drafts
                )
            );
        }

        restoreDraft() {

            const key =
                this.currentLevelKey();

            if (
                !key ||
                !this.codeEditor
            ) {

                return;
            }

            if (
                Object.prototype
                    .hasOwnProperty
                    .call(
                        this.drafts,
                        key
                    )
            ) {

                this.codeEditor.value =
                    this.drafts[key];
            }
        }

        /* =====================================================
           FENÊTRE DE CODE
        ===================================================== */

        openCodeWindow() {

            if (
                !this.isVisible(
                    this.byId("game-screen")
                )
            ) {

                return;
            }

            this.setVisible(
                this.codeWindow,
                true
            );

            this.codeEditor
                ?.focus(
                    {
                        preventScroll: true
                    }
                );
        }

        hideCodeWindow() {

            this.setVisible(
                this.codeWindow,
                false
            );
        }

        /* =====================================================
           RECOMMENCER L'EXERCICE
        ===================================================== */

        restartLevel() {

            if (
                !window.pytGame
                    ?.levelData
            ) {

                return;
            }

            this.hideThought();

            window.pytUI
                ?.clearCodeError?.();

            window.pytGame
                .restartLevel();

            if (
                this.consoleOutput
            ) {

                this.consoleOutput.textContent =
                    "";
            }

            /*
             * Le code écrit n'est pas effacé.
             */
        }

        /* =====================================================
           EXÉCUTER LE CODE
        ===================================================== */

        runCode() {

            if (
                !this.codeEditor ||
                !window.pytGame
                    ?.levelData ||
                window.pytGame
                    .executing
            ) {

                return;
            }

            this.saveDraft();

            this.hideGuide();

            this.hideThought();

            window.pytUI
                ?.clearCodeError?.();

            if (
                this.consoleOutput
            ) {

                this.consoleOutput.textContent =
                    "Exécution du programme...";
            }

            /*
             * Événement écouté par game.js.
             *
             * On utilise la propriété source,
             * attendue par le nouveau moteur.
             */

            window.dispatchEvent(
                new CustomEvent(
                    "pyt:run-code",
                    {

                        detail: {

                            source:
                                this.codeEditor.value
                        }
                    }
                )
            );
        }

        /* =====================================================
           AFFICHAGE DU RÉSULTAT
        ===================================================== */

        showExecutionResult(detail) {

            const lines =
                Array.isArray(
                    detail.output
                )
                    ? detail.output.map(
                        String
                    )
                    : [];

            if (
                detail.success
            ) {

                lines.push(
                    "✓ Mission réussie !"
                );

            } else {

                lines.push(
                    `✗ ${detail.message || "Mission incomplète."}`
                );
            }

            if (
                this.consoleOutput
            ) {

                this.consoleOutput.textContent =
                    lines.join("\n");
            }

            if (
                detail.success
            ) {

                this.hideThought();

            } else if (
                this.isVisible(
                    this.byId("game-screen")
                )
            ) {

                /*
                 * Retour de Pyt après un échec.
                 * Le niveau reste jouable.
                 */

                this.showThought(
                    "Ce n’est pas là que je voulais aller..."
                );
            }

            /*
             * Le premier/deuxième échec
             * est géré par ui.js.
             * Aucun soulignement forcé ici.
             */
        }

        /* =====================================================
           GUIDE DE PYT
        ===================================================== */

        showGuide(
            message,
            actions = null
        ) {

            if (
                this.guideMessage
            ) {

                this.guideMessage.textContent =
                    String(
                        message ||
                        ""
                    );
            }

            if (
                this.guideActions
            ) {

                this.guideActions
                    .replaceChildren();

                if (
                    Array.isArray(
                        actions
                    )
                ) {

                    for (
                        const action
                        of actions
                    ) {

                        const button =
                            document.createElement(
                                "button"
                            );

                        button.type =
                            "button";

                        button.className =
                            "pixel-button pixel-button-secondary";

                        button.textContent =
                            String(
                                action.text ||
                                action.label ||
                                "Continuer"
                            );

                        button.addEventListener(
                            "click",
                            () => {

                                this.hideGuide();

                                action.action?.();
                            }
                        );

                        this.guideActions
                            .appendChild(
                                button
                            );
                    }
                }
            }

            this.setVisible(
                this.guide,
                true
            );
        }

        hideGuide() {

            this.setVisible(
                this.guide,
                false
            );
        }

        /* =====================================================
           BULLE DE PENSÉE
        ===================================================== */

        showThought(message) {

            if (
                this.thought
            ) {

                this.thought.textContent =
                    message;
            }

            this.setVisible(
                this.thought,
                true
            );
        }

        hideThought() {

            this.setVisible(
                this.thought,
                false
            );
        }

        /* =====================================================
           MODALE DE MESSAGE OU RÉUSSITE
        ===================================================== */

        showModal(options = {}) {

            const setText =
                (id, value) => {

                    const element =
                        this.byId(id);

                    if (
                        element
                    ) {

                        element.textContent =
                            String(
                                value ?? ""
                            );
                    }
                };

            setText(
                "modal-label",
                options.label ||
                    "PYT"
            );

            setText(
                "modal-title",
                options.title ||
                    "Information"
            );

            setText(
                "modal-message",
                options.message ||
                    ""
            );

            setText(
                "modal-primary-button",
                options.primaryText ||
                    "Continuer"
            );

            const secondary =
                this.byId(
                    "modal-secondary-button"
                );

            this.setVisible(
                secondary,
                Boolean(
                    options.secondaryText
                )
            );

            if (
                secondary &&
                options.secondaryText
            ) {

                secondary.textContent =
                    options.secondaryText;
            }

            this.modalActions = {

                primary:
                    typeof options.primaryAction ===
                        "function"
                        ? options.primaryAction
                        : null,

                secondary:
                    typeof options.secondaryAction ===
                        "function"
                        ? options.secondaryAction
                        : null
            };

            this.hideGuide();

            this.setVisible(
                this.modalBackground,
                true
            );
        }

        closeModal() {

            this.setVisible(
                this.modalBackground,
                false
            );

            this.modalActions = {

                primary: null,

                secondary: null
            };
        }

        chooseModal(which) {

            const action =
                this.modalActions[which];

            this.closeModal();

            if (
                typeof action ===
                    "function"
            ) {

                action();
            }
        }
    }

    /* =========================================================
       EXPORT ET INITIALISATION
    ========================================================= */

    window.PytApplication =
        PytApplication;

    const start = () => {

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
