
"use strict";

/* =========================================================
   PYT - APP.JS

   - Introduction et navigation
   - Musiques des 9 chapitres
   - Vérification des MP3
   - Cases interdites plus foncées
   - Éditeur déplaçable
   - Réussite et niveau suivant
   - Paramètres et crédits

   art.js, game.js et levels.js restent inchangés.
========================================================= */

(() => {
    class PytApplication {
        constructor() {
            this.byId = id => document.getElementById(id);

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

            this.audioTracks = new Map();
            this.audioUnlocked = false;
            this.audioStatus = null;
            this.audioPreviewTrack = null;
            this.lastPlayingTrack = null;
            this.lastGameTrack = "game";

            this.fallbackLevelKey = null;
            this.nextButton = null;
            this.pendingLevel = null;
            this.dragState = null;

            this.storage = {
                music: "pyt-music-enabled",
                volume: "pyt-music-volume",
                drafts: "pyt-code-drafts"
            };

            this.musicEnabled =
                this.readStorage(this.storage.music, "1") !== "0";

            this.volume = this.clamp(
                Number(this.readStorage(this.storage.volume, "50")),
                0,
                100
            );

            this.drafts = this.readJSON(this.storage.drafts);

            this.cacheElements();
            this.configureAudio();
            this.installBlockedContrast();
            this.bindEvents();
            this.applyAudioSettings();
            this.setupIntro();
        }

        /* =====================================================
           OUTILS
        ===================================================== */

        cacheElements() {
            const get = this.byId;

            this.introScreen = get("intro-screen");
            this.introScene = get("intro-scene");
            this.introContinue = get("intro-continue-message");
            this.skipIntroButton = get("skip-intro-button");

            this.settingsScreen = get("settings-screen");
            this.gameInterface = get("game-interface");

            this.creditsScreen = get("credits-screen");
            this.creditsScroll = get("credits-scroll");

            this.creditsPerspective =
                this.creditsScreen?.querySelector(
                    ".credits-perspective"
                ) || null;

            this.creditsTitle =
                this.creditsScroll?.querySelector(
                    ".credits-final-title"
                ) || null;

            this.codeWindow = get("code-window");
            this.codeHeader = get("code-window-header");
            this.codeEditor = get("code-editor");
            this.consoleOutput = get("console-output");
            this.runButton = get("run-code-button");

            this.guide = get("pyt-guide");
            this.guideMessage = get("pyt-guide-message");
            this.guideActions = get("pyt-guide-actions");

            this.modalBackground = get("modal-background");

            this.musicInput = get("music-enabled");
            this.volumeSlider = get("volume-slider");
            this.volumeValue = get("volume-value");

            this.musicAudio = get("music-audio");
            this.theoryAudio = get("theory-audio");

            this.thought = get("robot-thought-bubble");
        }

        readStorage(key, fallback = null) {
            try {
                return localStorage.getItem(key) ?? fallback;
            } catch (_) {
                return fallback;
            }
        }

        writeStorage(key, value) {
            try {
                localStorage.setItem(key, String(value));
            } catch (_) {
                // Le jeu continue si le stockage est indisponible.
            }
        }

        readJSON(key) {
            try {
                const value = JSON.parse(
                    this.readStorage(key, "{}")
                );

                if (
                    value &&
                    typeof value === "object" &&
                    !Array.isArray(value)
                ) {
                    return value;
                }
            } catch (_) {
                // Données absentes ou invalides.
            }

            return {};
        }

        clamp(value, min, max) {
            return Math.max(
                min,
                Math.min(
                    max,
                    Number.isFinite(value) ? value : min
                )
            );
        }

        setVisible(element, visible) {
            if (!element) return;

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
                !element.classList.contains("hidden")
            );
        }

        bind(id, callback) {
            const button = this.byId(id);

            if (!button) return;

            button.addEventListener("click", event => {
                event.preventDefault();
                callback(event);
            });
        }

        /* =====================================================
           ÉVÉNEMENTS
        ===================================================== */

        bindEvents() {
            this.bind(
                "skip-intro-button",
                () => this.finishIntro()
            );

            this.bind(
                "play-button",
                () => {
                    this.unlockAudio();
                    this.enterGame();
                }
            );

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

            this.bind(
                "credits-button",
                () => this.openCredits()
            );

            this.bind(
                "close-credits-button",
                () => this.closeCredits()
            );

            this.bind("menu-button", () => {
                this.hideCodeWindow();

                if (
                    typeof window.pytUI?.openHouseMap ===
                    "function"
                ) {
                    window.pytUI.openHouseMap();
                } else {
                    this.showMap();
                }
            });

            this.bind(
                "open-code-button",
                () => this.openCodeWindow()
            );

            this.bind(
                "close-code-button",
                () => this.hideCodeWindow()
            );

            this.bind("clear-code-button", () => {
                if (!this.codeEditor) return;

                this.codeEditor.value = "";
                this.saveDraft();
                this.codeEditor.focus();

                window.pytUI?.clearCodeError?.();
            });

            this.bind(
                "run-code-button",
                () => this.runCode()
            );

            this.bind(
                "restart-button",
                () => this.restartLevel()
            );

            this.bind(
                "code-restart-button",
                () => this.restartLevel()
            );

            this.bind(
                "close-pyt-guide-button",
                () => this.hideGuide()
            );

            this.bind(
                "modal-primary-button",
                () => this.chooseModal("primary")
            );

            this.bind(
                "modal-secondary-button",
                () => this.chooseModal("secondary")
            );

            /* Sauvegarder le Python pendant la saisie. */

            this.codeEditor?.addEventListener(
                "input",
                () => this.saveDraft()
            );

            this.codeEditor?.addEventListener(
                "keydown",
                event => {
                    if (event.key === "Tab") {
                        event.preventDefault();

                        const from = event.target.selectionStart;
                        const to = event.target.selectionEnd;
                        const value = event.target.value;

                        event.target.value =
                            value.slice(0, from) +
                            "    " +
                            value.slice(to);

                        event.target.selectionStart =
                            event.target.selectionEnd =
                            from + 4;

                        this.saveDraft();
                    }

                    if (
                        event.key === "Enter" &&
                        (event.ctrlKey || event.metaKey)
                    ) {
                        event.preventDefault();
                        this.runCode();
                    }
                }
            );

            /* Échap et introduction. */

            document.addEventListener(
                "keydown",
                event => {
                    if (event.key === "Escape") {
                        if (this.isVisible(this.modalBackground)) {
                            this.closeModal();
                        } else if (this.isVisible(this.creditsScreen)) {
                            this.closeCredits();
                        } else if (this.isVisible(this.settingsScreen)) {
                            this.closeSettings();
                        } else if (this.isVisible(this.codeWindow)) {
                            this.hideCodeWindow();
                        } else if (this.isVisible(this.guide)) {
                            this.hideGuide();
                        }

                        return;
                    }

                    if (
                        !this.introDone &&
                        this.introReady &&
                        this.isVisible(this.introScreen)
                    ) {
                        if (
                            ![
                                "Tab",
                                "Shift",
                                "Control",
                                "Alt",
                                "Meta"
                            ].includes(event.key)
                        ) {
                            this.finishIntro();
                        }
                    }
                }
            );

            this.introScreen?.addEventListener(
                "click",
                event => {
                    if (
                        event.target === this.skipIntroButton ||
                        event.target.closest?.("#intro-sound-button")
                    ) {
                        return;
                    }

                    if (this.introReady) {
                        this.finishIntro();
                    }
                }
            );

            this.modalBackground?.addEventListener(
                "click",
                event => {
                    if (event.target === this.modalBackground) {
                        this.closeModal();
                    }
                }
            );

            /* Interrupteur de musique. */

            this.musicInput?.addEventListener(
                "change",
                () => {
                    this.musicEnabled =
                        Boolean(this.musicInput.checked);

                    this.writeStorage(
                        this.storage.music,
                        this.musicEnabled ? "1" : "0"
                    );

                    this.unlockAudio();
                }
            );

            /* Volume. */

            this.volumeSlider?.addEventListener(
                "input",
                () => {
                    this.volume = this.clamp(
                        Number(this.volumeSlider.value),
                        0,
                        100
                    );

                    this.writeStorage(
                        this.storage.volume,
                        this.volume
                    );

                    this.unlockAudio();
                }
            );

            /* Événements du moteur et de ui.js. */

            window.addEventListener(
                "pyt:level-opened",
                () => {
                    this.restoreDraft();
                    this.hideCodeWindow();
                    this.hideGuide();
                    this.hideThought();
                    this.showGame();
                    this.clearNextButton();
                }
            );

            window.addEventListener(
                "pyt:execution-result",
                event => {
                    this.showExecutionResult(
                        event.detail || {}
                    );
                }
            );

            window.addEventListener(
                "pyt:level-complete",
                event => {
                    this.onLevelComplete(
                        event.detail || {}
                    );
                }
            );

            /*
             * Les navigateurs interdisent parfois
             * la lecture avant le premier geste.
             */

            document.addEventListener(
                "pointerdown",
                () => {
                    if (!this.audioUnlocked) {
                        this.unlockAudio();
                    }
                },
                { capture: true }
            );

            document.addEventListener(
                "keydown",
                event => {
                    if (
                        !this.audioUnlocked &&
                        ![
                            "Shift",
                            "Control",
                            "Alt",
                            "Meta",
                            "Tab"
                        ].includes(event.key)
                    ) {
                        this.unlockAudio();
                    }
                }
            );

            /* Fenêtre Python déplaçable. */

            this.codeHeader?.addEventListener(
                "pointerdown",
                event => this.beginCodeDrag(event)
            );

            window.addEventListener(
                "pointermove",
                event => this.moveCodeDrag(event)
            );

            window.addEventListener(
                "pointerup",
                event => this.endCodeDrag(event)
            );

            window.addEventListener(
                "pointercancel",
                event => this.endCodeDrag(event)
            );

            window.addEventListener(
                "blur",
                () => this.endCodeDrag()
            );

            window.addEventListener(
                "resize",
                () => this.keepCodeWindowOnScreen()
            );
        }

        /* =====================================================
           OBSTACLES ROUGES PLUS FONCÉS

           La fonction d'art.js reste intacte sur le disque.
           Seul le rendu des cases interdites est renforcé.
        ===================================================== */

        installBlockedContrast() {
            const art = window.PYTArt;

            if (
                !art ||
                typeof art.drawBlocked !== "function" ||
                art.__pytBlockedContrast
            ) {
                return;
            }

            const original = art.drawBlocked;

            art.drawBlocked = function(ctx, x, y, size) {
                if (
                    !ctx ||
                    !Number.isFinite(size) ||
                    size <= 0
                ) {
                    return;
                }

                ctx.save();

                const margin = size * 0.065;
                const left = x + margin;
                const top = y + margin;
                const side = size - margin * 2;

                /*
                 * Fond bordeaux foncé :
                 * opacité beaucoup plus importante
                 * que l'ancien dessin.
                 */

                ctx.fillStyle =
                    "rgba(65, 5, 19, 0.83)";

                ctx.fillRect(
                    left,
                    top,
                    side,
                    side
                );

                /* Contour presque noir. */

                ctx.strokeStyle = "#16070d";

                ctx.lineWidth = Math.max(
                    3,
                    size * 0.065
                );

                ctx.strokeRect(
                    left,
                    top,
                    side,
                    side
                );

                /*
                 * Rayures bien visibles.
                 * Elles ne changent pas
                 * les collisions du jeu.
                 */

                ctx.beginPath();
                ctx.rect(left, top, side, side);
                ctx.clip();

                ctx.strokeStyle = "#d5454f";

                ctx.lineWidth = Math.max(
                    3,
                    size * 0.065
                );

                for (
                    let offset = -side;
                    offset < side * 2;
                    offset += size * 0.28
                ) {
                    ctx.beginPath();

                    ctx.moveTo(
                        left + offset,
                        top
                    );

                    ctx.lineTo(
                        left + offset + side,
                        top + side
                    );

                    ctx.stroke();
                }

                ctx.restore();

                /* Motif original au-dessus. */

                original.call(
                    this,
                    ctx,
                    x,
                    y,
                    size
                );
            };

            art.__pytBlockedContrast = true;
        }

        /* =====================================================
           INTRODUCTION
        ===================================================== */

        setupIntro() {
            for (const id of this.primaryIds) {
                this.setVisible(
                    this.byId(id),
                    id === "intro-screen"
                );
            }

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

            this.ensureIntroSubtitle();
            this.ensureIntroSoundButton();

            const robot =
                this.introScreen?.querySelector(".intro-pyt");

            if (robot) {
                robot.style.animation = "none";
                robot.style.transform = "scale(1.04)";
            }

            this.introTimers.push(
                setTimeout(() => {
                    this.setVisible(
                        this.skipIntroButton,
                        true
                    );
                }, 950)
            );

            this.introTimers.push(
                setTimeout(() => {
                    this.introReady = true;

                    this.setVisible(
                        this.introContinue,
                        true
                    );

                    this.introContinue?.classList.add(
                        "visible"
                    );
                }, 3950)
            );
        }

        ensureIntroSubtitle() {
            if (!this.introScreen) return;

            let subtitle = this.byId("intro-subtitle");

            if (!subtitle) {
                subtitle = document.createElement("div");
                subtitle.id = "intro-subtitle";
                subtitle.className = "intro-subtitle";
                this.introScreen.appendChild(subtitle);
            }

            subtitle.textContent =
                "apprentissage Python";

            subtitle.style.textTransform = "none";
        }

        ensureIntroSoundButton() {
            if (
                !this.introScreen ||
                this.byId("intro-sound-button")
            ) {
                return;
            }

            const button =
                document.createElement("button");

            button.id = "intro-sound-button";
            button.type = "button";
            button.className =
                "pixel-button pixel-button-secondary";

            button.textContent =
                "🔊 Activer le son";

            Object.assign(button.style, {
                position: "absolute",
                zIndex: "7",
                left: "18px",
                top: "18px",
                fontSize: "10px",
                minHeight: "36px"
            });

            button.addEventListener(
                "pointerdown",
                event => event.stopPropagation()
            );

            button.addEventListener(
                "click",
                event => {
                    event.preventDefault();
                    event.stopPropagation();

                    this.musicEnabled = true;

                    this.writeStorage(
                        this.storage.music,
                        "1"
                    );

                    this.unlockAudio();

                    button.textContent =
                        "🔊 Son activé";
                }
            );

            this.introScreen.appendChild(button);
        }

        finishIntro() {
            if (this.introDone) return;

            this.unlockAudio();

            this.introDone = true;
            this.introReady = false;

            this.introTimers.forEach(
                timer => clearTimeout(timer)
            );

            this.introTimers = [];

            this.introContinue?.classList.remove(
                "visible"
            );

            this.introScreen?.classList.add(
                "intro-leaving"
            );

            setTimeout(
                () => this.enterGame(),
                450
            );
        }

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

            if (
                typeof window.pytUI?.openHouseMap ===
                "function"
            ) {
                window.pytUI.openHouseMap(true);
            } else {
                this.showMap();
            }

            this.applyAudioSettings();
        }

        /* =====================================================
           NAVIGATION
        ===================================================== */

        showPrimary(id) {
            for (const name of this.primaryIds) {
                this.setVisible(
                    this.byId(name),
                    name === id
                );
            }
        }

        showSubscreen(id) {
            this.activeSubscreen = id;

            this.showPrimary(
                "game-interface"
            );

            for (const name of this.subscreenIds) {
                this.setVisible(
                    this.byId(name),
                    name === id
                );
            }

            if (id !== "game-screen") {
                this.hideCodeWindow();
                this.hideThought();
            }

            this.hideGuide();
            this.applyAudioSettings();

            if (id === "game-screen") {
                requestAnimationFrame(() => {
                    window.pytGame?.resizeCanvas?.();
                    window.pytGame?.render?.();
                });
            }
        }

        showMap() {
            this.showSubscreen("map-screen");
        }

        showCourse() {
            this.showSubscreen("chapter-screen");
        }

        showGame() {
            this.showSubscreen("game-screen");
        }

        /* =====================================================
           PARAMÈTRES
        ===================================================== */

        openSettings() {
            this.settingsReturn =
                this.isVisible(this.gameInterface)
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
            this.audioPreviewTrack = null;

            if (
                this.settingsReturn === "intro" &&
                !this.introDone
            ) {
                this.showPrimary(
                    "intro-screen"
                );

                this.applyAudioSettings();
            } else {
                this.showSubscreen(
                    this.activeSubscreen
                );
            }
        }

        /* =====================================================
           MUSIQUES

           Le jeu essaie :
           1. audio/nom-du-fichier.mp3
           2. nom-du-fichier.mp3 à la racine

           Aucun changement de index.html nécessaire.
        ===================================================== */

        configureAudio() {
            const files = {
                intro: "intro.mp3",
                game: "game.mp3",
                theory: "theory.mp3",
                credit: "credit.mp3"
            };

            for (
                let chapter = 1;
                chapter <= 9;
                chapter++
            ) {
                files[`chapter-${chapter}`] =
                    `chapter-${chapter}.mp3`;
            }

            for (
                const [name, file]
                of Object.entries(files)
            ) {
                let audio = null;

                if (name === "game") {
                    audio = this.musicAudio;
                } else if (name === "theory") {
                    audio = this.theoryAudio;
                }

                if (!audio) {
                    audio = document.createElement("audio");
                }

                audio.pause();
                audio.removeAttribute("src");

                audio.querySelectorAll("source").forEach(
                    node => node.remove()
                );

                audio.preload = "none";
                audio.loop = true;

                const info = {
                    name,
                    file,
                    audio,
                    index: 0,
                    failed: false,
                    paths: [
                        `audio/${file}`,
                        file
                    ]
                };

                this.audioTracks.set(
                    name,
                    info
                );

                audio.src = info.paths[0];

                /* Fichier manquant : essayer la racine. */

                audio.addEventListener(
                    "error",
                    () => {
                        if (
                            this.audioStatus &&
                            this.getDesiredTrack() === name
                        ) {
                            this.audioStatus.textContent =
                                `Impossible de lire ${info.paths[info.index]}. Recherche d'un autre emplacement...`;
                        }

                        if (
                            info.index + 1 <
                            info.paths.length
                        ) {
                            info.index++;

                            audio.src =
                                info.paths[info.index];

                            audio.load();

                            if (this.audioUnlocked) {
                                this.applyAudioSettings();
                            }
                        } else {
                            info.failed = true;

                            if (this.audioStatus) {
                                this.audioStatus.textContent =
                                    `Fichier introuvable : ${file}. Vérifie qu'il est dans audio/ ou à côté de index.html.`;
                            }

                            console.warn(
                                "[PYT] MP3 introuvable :",
                                file
                            );

                            if (this.audioUnlocked) {
                                this.applyAudioSettings();
                            }
                        }
                    }
                );

                /* Un fichier a pu être chargé. */

                audio.addEventListener(
                    "canplay",
                    () => {
                        info.failed = false;

                        if (this.audioUnlocked) {
                            this.applyAudioSettings();
                        }
                    }
                );

                /* Confirmation réelle de lecture. */

                audio.addEventListener(
                    "playing",
                    () => {
                        this.lastPlayingTrack = name;

                        if (this.audioStatus) {
                            this.audioStatus.textContent =
                                `Lecture OK : ${file} (${info.paths[info.index]}).`;
                        }
                    }
                );
            }

            this.setupAudioStatus();
        }

        setupAudioStatus() {
            const settings =
                this.settingsScreen?.querySelector(
                    ".settings-card"
                );

            if (!settings) return;

            const notice =
                document.createElement("p");

            notice.id = "pyt-audio-status";

            notice.setAttribute(
                "aria-live",
                "polite"
            );

            Object.assign(notice.style, {
                color: "#ffe58a",
                fontSize: "12px",
                margin: "10px 0"
            });

            notice.textContent =
                "Musique : intro.mp3, game.mp3, theory.mp3, credit.mp3 et chapter-1.mp3 à chapter-9.mp3.";

            settings.appendChild(notice);

            this.audioStatus = notice;

            /* Bouton pour tester directement game.mp3. */

            const button =
                document.createElement("button");

            button.id = "pyt-test-sound-button";
            button.type = "button";

            button.className =
                "pixel-button pixel-button-secondary";

            button.textContent =
                "▶ Tester le son (game.mp3)";

            button.style.width = "100%";
            button.style.marginTop = "10px";

            button.addEventListener(
                "click",
                () => {
                    this.musicEnabled = true;

                    this.writeStorage(
                        this.storage.music,
                        "1"
                    );

                    if (this.volume === 0) {
                        this.volume = 60;

                        this.writeStorage(
                            this.storage.volume,
                            this.volume
                        );
                    }

                    const track =
                        this.audioTracks.get("game");

                    if (track?.failed) {
                        track.failed = false;
                        track.index = 0;
                        track.audio.src =
                            track.paths[0];
                        track.audio.load();
                    }

                    this.audioPreviewTrack = "game";

                    notice.textContent =
                        "Test en cours : recherche de game.mp3...";

                    this.unlockAudio();

                    if (
                        track &&
                        !track.audio.paused
                    ) {
                        notice.textContent =
                            "Lecture demandée : game.mp3. Si tu n'entends rien, vérifie le volume et ton appareil.";
                    }
                }
            );

            settings.appendChild(button);
        }

        getChapterNumber() {
            const sources = [
                this.fallbackLevelKey?.split("-")[0],
                window.pytGame?.levelData?.chapter,
                window.pytUI?.currentChapter,
                window.pytUI?.selectedChapter
            ];

            for (const source of sources) {
                const value = Number(source);

                if (
                    Number.isInteger(value) &&
                    value >= 1 &&
                    value <= 9
                ) {
                    return value;
                }
            }

            return 1;
        }

        getDesiredTrack() {
            if (
                this.isVisible(this.settingsScreen) &&
                this.audioPreviewTrack
            ) {
                return this.audioPreviewTrack;
            }

            if (this.isVisible(this.creditsScreen)) {
                return "credit";
            }

            if (this.isVisible(this.introScreen)) {
                return "intro";
            }

            if (this.isVisible(this.settingsScreen)) {
                return this.settingsReturn === "intro"
                    ? "intro"
                    : this.lastGameTrack || "game";
            }

            if (
                this.activeSubscreen ===
                "chapter-screen"
            ) {
                return "theory";
            }

            if (
                this.activeSubscreen ===
                "game-screen"
            ) {
                return `chapter-${this.getChapterNumber()}`;
            }

            return "game";
        }

        unlockAudio() {
            this.audioUnlocked = true;
            this.applyAudioSettings(true);
        }

        applyAudioSettings() {
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

            const chosenName =
                this.getDesiredTrack();

            if (
                !this.isVisible(this.settingsScreen) &&
                !this.isVisible(this.introScreen) &&
                !this.isVisible(this.creditsScreen)
            ) {
                this.lastGameTrack = chosenName;
            }

            const requested =
                this.audioTracks.get(chosenName);

            const selected =
                requested && !requested.failed
                    ? requested
                    : this.audioTracks.get("game");

            for (const info of this.audioTracks.values()) {
                const audio = info.audio;

                audio.loop = true;
                audio.muted = !this.musicEnabled;
                audio.volume = this.volume / 100;

                const shouldPlay =
                    this.musicEnabled &&
                    this.audioUnlocked &&
                    info === selected &&
                    !info.failed;

                if (!shouldPlay) {
                    audio.pause();
                    continue;
                }

                if (!audio.paused) {
                    continue;
                }

                try {
                    const result = audio.play();

                    if (
                        result &&
                        typeof result.catch === "function"
                    ) {
                        result.catch(error => {
                            if (
                                error?.name ===
                                "NotAllowedError"
                            ) {
                                this.audioUnlocked = false;

                                if (this.audioStatus) {
                                    this.audioStatus.textContent =
                                        "Lecture bloquée par le navigateur. Clique sur « Tester le son » dans les paramètres.";
                                }
                            } else if (
                                error?.name !== "AbortError"
                            ) {
                                if (this.audioStatus) {
                                    this.audioStatus.textContent =
                                        `Échec de lecture : ${info.file} (${error?.name || "erreur"}). Vérifie le MP3 et son chemin.`;
                                }

                                console.warn(
                                    "[PYT] Lecture audio :",
                                    info.file,
                                    error
                                );
                            }
                        });
                    }
                } catch (error) {
                    console.warn(
                        "[PYT] Impossible de lancer :",
                        info.file,
                        error
                    );
                }
            }
        }

        playSfx(_name) {
            // Aucun bruitage supplémentaire n'est requis ici.
        }

        /* =====================================================
           CRÉDITS
        ===================================================== */

        openCredits() {
            this.creditsReturn =
                this.isVisible(this.settingsScreen)
                    ? "settings"
                    : "game";

            this.showPrimary(
                "credits-screen"
            );

            this.applyAudioSettings();
            this.startCredits();
        }

        startCredits() {
            if (
                !this.creditsScreen ||
                !this.creditsScroll ||
                !this.creditsTitle
            ) {
                return;
            }

            this.stopCredits();

            const token = ++this.creditsToken;

            const viewer =
                this.creditsPerspective ||
                this.creditsScreen;

            const scroll = this.creditsScroll;
            const title = this.creditsTitle;

            scroll.style.animation = "none";
            scroll.style.position = "absolute";
            scroll.style.left = "50%";
            scroll.style.width = "min(88vw, 720px)";
            scroll.style.textAlign = "center";
            scroll.style.transformOrigin = "50% 50%";
            scroll.style.willChange = "transform";

            viewer.style.perspective = "900px";

            title.style.textAlign = "center";
            title.style.fontSize =
                "clamp(88px, 18vw, 220px)";
            title.style.lineHeight = "1.15";

            let subtitle = scroll.querySelector(
                ".credits-final-subtitle"
            );

            if (!subtitle) {
                subtitle =
                    document.createElement("div");

                subtitle.className =
                    "credits-final-subtitle";

                subtitle.textContent =
                    "apprentissage Python";

                title.insertAdjacentElement(
                    "afterend",
                    subtitle
                );
            }

            Object.assign(subtitle.style, {
                textAlign: "center",
                fontSize: "clamp(12px, 2vw, 22px)",
                fontWeight: "700",
                letterSpacing: "0.08em",
                color: "#fff1d2",
                textShadow: "2px 3px 0 #171424",
                opacity: "0",
                transition: "opacity 650ms ease",
                marginTop: "10px"
            });

            scroll.style.transform =
                "translate3d(-50%, 0px, 0) rotateX(18deg)";

            const height = Math.max(
                1,
                viewer.getBoundingClientRect().height ||
                window.innerHeight
            );

            const initial = height * 1.10;

            const titleCenter =
                title.offsetTop +
                title.offsetHeight / 2;

            const destination =
                height / 2 -
                titleCenter;

            const duration = 30000;
            const started = performance.now();

            const drawAt = y => {
                scroll.style.transform =
                    `translate3d(-50%, ${y}px, 0) rotateX(18deg)`;
            };

            drawAt(initial);

            const step = now => {
                if (
                    token !== this.creditsToken ||
                    !this.isVisible(this.creditsScreen)
                ) {
                    return;
                }

                const progress = Math.min(
                    1,
                    (now - started) / duration
                );

                drawAt(
                    initial +
                    (destination - initial) *
                    progress
                );

                if (progress < 1) {
                    this.creditsFrame =
                        requestAnimationFrame(step);
                } else {
                    this.creditsFrame = null;

                    const targetY =
                        window.innerHeight / 2;

                    const rect =
                        title.getBoundingClientRect();

                    const correction =
                        targetY -
                        (rect.top + rect.height / 2);

                    drawAt(
                        destination + correction
                    );

                    this.creditsSubtitleTimer =
                        setTimeout(() => {
                            if (
                                token === this.creditsToken &&
                                this.isVisible(this.creditsScreen)
                            ) {
                                subtitle.style.opacity = "1";
                            }
                        }, 3000);
                }
            };

            this.creditsFrame =
                requestAnimationFrame(step);
        }

        stopCredits() {
            this.creditsToken++;

            if (this.creditsFrame !== null) {
                cancelAnimationFrame(
                    this.creditsFrame
                );
            }

            if (this.creditsSubtitleTimer !== null) {
                clearTimeout(
                    this.creditsSubtitleTimer
                );
            }

            this.creditsFrame = null;
            this.creditsSubtitleTimer = null;
        }

        closeCredits() {
            this.stopCredits();

            if (this.creditsReturn === "settings") {
                this.showPrimary(
                    "settings-screen"
                );
            } else {
                this.showSubscreen(
                    this.activeSubscreen
                );
            }

            this.applyAudioSettings();
        }

        /* =====================================================
           CODE PYTHON
        ===================================================== */

        currentLevelKey() {
            const level =
                window.pytGame?.levelData;

            return (
                this.fallbackLevelKey ||
                window.pytUI?.currentLevelKey ||
                (
                    level
                        ? `${level.chapter}-${level.level}`
                        : null
                )
            );
        }

        saveDraft() {
            const key = this.currentLevelKey();

            if (!key || !this.codeEditor) {
                return;
            }

            this.drafts[key] =
                this.codeEditor.value;

            this.writeStorage(
                this.storage.drafts,
                JSON.stringify(this.drafts)
            );
        }

        restoreDraft() {
            const key = this.currentLevelKey();

            if (!key || !this.codeEditor) {
                return;
            }

            if (
                Object.prototype.hasOwnProperty.call(
                    this.drafts,
                    key
                )
            ) {
                this.codeEditor.value =
                    this.drafts[key];
            }
        }

        /* =====================================================
           FENÊTRE DÉPLAÇABLE
        ===================================================== */

        isCompactLayout() {
            return Boolean(
                window.matchMedia?.(
                    "(max-width: 820px)"
                ).matches
            );
        }

        beginCodeDrag(event) {
            if (
                !this.codeWindow ||
                !this.codeHeader ||
                this.isCompactLayout()
            ) {
                return;
            }

            if (!this.isVisible(this.codeWindow)) {
                return;
            }

            if (
                event.pointerType === "mouse" &&
                event.button !== 0
            ) {
                return;
            }

            if (
                event.target.closest?.(
                    "button, input, textarea, a, select"
                )
            ) {
                return;
            }

            const rect =
                this.codeWindow.getBoundingClientRect();

            this.dragState = {
                id: event.pointerId,
                x: event.clientX,
                y: event.clientY,
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height
            };

            this.codeWindow.style.left =
                `${rect.left}px`;

            this.codeWindow.style.top =
                `${rect.top}px`;

            this.codeWindow.style.right = "auto";

            document.body.classList.add(
                "dragging-code-window"
            );

            this.codeHeader.style.cursor =
                "grabbing";

            event.preventDefault();
        }

        moveCodeDrag(event) {
            const drag = this.dragState;

            if (
                !drag ||
                event.pointerId !== drag.id ||
                !this.codeWindow
            ) {
                return;
            }

            const maxLeft = Math.max(
                0,
                window.innerWidth - drag.width
            );

            const maxTop = Math.max(
                0,
                window.innerHeight - drag.height
            );

            const left = this.clamp(
                drag.left +
                event.clientX -
                drag.x,
                0,
                maxLeft
            );

            const top = this.clamp(
                drag.top +
                event.clientY -
                drag.y,
                0,
                maxTop
            );

            this.codeWindow.style.left =
                `${Math.round(left)}px`;

            this.codeWindow.style.top =
                `${Math.round(top)}px`;
        }

        endCodeDrag(event) {
            if (
                !this.dragState ||
                (
                    event &&
                    event.pointerId !==
                    this.dragState.id
                )
            ) {
                return;
            }

            this.dragState = null;

            document.body.classList.remove(
                "dragging-code-window"
            );

            if (this.codeHeader) {
                this.codeHeader.style.cursor =
                    "grab";
            }
        }

        keepCodeWindowOnScreen() {
            if (this.dragState) {
                this.endCodeDrag();
            }

            if (
                !this.codeWindow ||
                this.isCompactLayout()
            ) {
                return;
            }

            if (
                !this.codeWindow.style.left ||
                !this.codeWindow.style.top
            ) {
                return;
            }

            const rect =
                this.codeWindow.getBoundingClientRect();

            this.codeWindow.style.left =
                `${Math.round(this.clamp(
                    rect.left,
                    0,
                    Math.max(
                        0,
                        window.innerWidth - rect.width
                    )
                ))}px`;

            this.codeWindow.style.top =
                `${Math.round(this.clamp(
                    rect.top,
                    0,
                    Math.max(
                        0,
                        window.innerHeight - rect.height
                    )
                ))}px`;
        }

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

            if (
                this.codeHeader &&
                !this.isCompactLayout()
            ) {
                this.codeHeader.style.cursor =
                    "grab";
            }

            this.keepCodeWindowOnScreen();

            this.codeEditor?.focus({
                preventScroll: true
            });
        }

        hideCodeWindow() {
            this.endCodeDrag();

            this.setVisible(
                this.codeWindow,
                false
            );
        }

        restartLevel() {
            if (!window.pytGame?.levelData) {
                return;
            }

            this.hideThought();

            window.pytUI?.clearCodeError?.();

            window.pytGame.restartLevel();

            if (this.consoleOutput) {
                this.consoleOutput.textContent = "";
            }
        }

        runCode() {
            if (
                !this.codeEditor ||
                !window.pytGame?.levelData ||
                window.pytGame.executing
            ) {
                return;
            }

            this.saveDraft();
            this.hideGuide();
            this.hideThought();

            window.pytUI?.clearCodeError?.();

            if (this.consoleOutput) {
                this.consoleOutput.textContent =
                    "Exécution du programme...";
            }

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

        showExecutionResult(detail) {
            const lines =
                Array.isArray(detail.output)
                    ? detail.output.map(String)
                    : [];

            lines.push(
                detail.success
                    ? "✓ Mission réussie !"
                    : `✗ ${detail.message || "Mission incomplète."}`
            );

            if (this.consoleOutput) {
                this.consoleOutput.textContent =
                    lines.join("\n");
            }

            if (detail.success) {
                this.hideThought();
            } else if (
                this.isVisible(
                    this.byId("game-screen")
                )
            ) {
                this.showThought(
                    "Ce n’est pas là que je voulais aller..."
                );
            }
        }

        /* =====================================================
           NIVEAU SUIVANT

           On garde le bouton et la fenêtre de réussite.
        ===================================================== */

        clearNextButton() {
            this.nextButton?.remove();
            this.nextButton = null;
            this.pendingLevel = null;
        }

        nextDestination(chapter, level) {
            if (
                chapter === 9 &&
                level === 3
            ) {
                return null;
            }

            return level < 3
                ? {
                    chapter,
                    level: level + 1
                }
                : {
                    chapter: chapter + 1,
                    level: 1
                };
        }

        onLevelComplete(detail) {
            const current =
                detail.levelData ||
                window.pytGame?.levelData ||
                {};

            const chapter =
                Number(current.chapter);

            const level =
                Number(current.level);

            if (
                !(
                    chapter >= 1 &&
                    chapter <= 9 &&
                    level >= 1 &&
                    level <= 3
                )
            ) {
                return;
            }

            setTimeout(() => {
                if (
                    window.pytGame?.levelData &&
                    (
                        Number(window.pytGame.levelData.chapter) !== chapter ||
                        Number(window.pytGame.levelData.level) !== level
                    )
                ) {
                    return;
                }

                const next =
                    this.nextDestination(
                        chapter,
                        level
                    );

                this.clearNextButton();

                this.pendingLevel = next;

                this.createNextButton(next);

                this.showModal({
                    label: "MISSION RÉUSSIE",

                    title: next
                        ? "Bravo, exercice terminé !"
                        : "Bravo, PYT est terminé !",

                    message: next
                        ? `Chapitre ${chapter}, exercice ${level} réussi. Tu peux passer au ${next.chapter === chapter ? "niveau suivant" : "chapitre suivant"}.`
                        : "Tu as terminé les 9 chapitres et les 27 exercices !",

                    primaryText: next
                        ? next.chapter === chapter
                            ? "Niveau suivant →"
                            : "Chapitre suivant →"
                        : "Retour à la carte",

                    secondaryText: next
                        ? "Carte"
                        : null,

                    primaryAction: () => next
                        ? this.openNextLevel(
                            next.chapter,
                            next.level
                        )
                        : this.returnToMap(),

                    secondaryAction: () =>
                        this.returnToMap()
                });
            }, 0);
        }

        createNextButton(next) {
            const actions =
                this.byId("game-screen")
                    ?.querySelector(
                        ".mission-actions"
                    );

            if (!actions) return;

            const button =
                document.createElement("button");

            button.id = "next-level-button";
            button.type = "button";
            button.className =
                "pixel-button pixel-button-primary";

            button.textContent = next
                ? next.chapter === this.getChapterNumber()
                    ? "Niveau suivant →"
                    : "Chapitre suivant →"
                : "Retour à la carte";

            button.addEventListener(
                "click",
                () => {
                    if (next) {
                        this.openNextLevel(
                            next.chapter,
                            next.level
                        );
                    } else {
                        this.returnToMap();
                    }
                }
            );

            actions.appendChild(button);
            this.nextButton = button;
        }

        returnToMap() {
            this.closeModal();
            this.hideCodeWindow();
            this.clearNextButton();

            if (
                typeof window.pytUI?.openHouseMap ===
                "function"
            ) {
                window.pytUI.openHouseMap();
            } else {
                this.showMap();
            }
        }

        openNextLevel(chapter, level) {
            const data =
                window.PYT_GAME_DATA ||
                window.PYT_LEVELS ||
                window.GAME_LEVELS;

            const next =
                data?.getLevel?.(chapter, level) ||
                data?.chapters?.[chapter - 1]
                    ?.levels?.[level - 1];

            if (!next) {
                console.warn(
                    "[PYT] Niveau suivant introuvable :",
                    chapter,
                    level
                );

                this.returnToMap();
                return;
            }

            this.closeModal();
            this.saveDraft();
            this.clearNextButton();

            const ui = window.pytUI;

            for (
                const method of [
                    "openLevel",
                    "startLevel",
                    "openExercise",
                    "playLevel"
                ]
            ) {
                if (
                    typeof ui?.[method] ===
                    "function" &&
                    ui[method].length >= 2
                ) {
                    try {
                        this.fallbackLevelKey = null;

                        ui[method](
                            chapter,
                            level
                        );

                        this.applyAudioSettings();
                        return;
                    } catch (error) {
                        console.warn(
                            "[PYT] Navigation ui.js :",
                            error
                        );
                    }
                }
            }

            /*
             * Repli si ui.js ne fournit pas
             * de fonction publique de navigation.
             */

            this.fallbackLevelKey =
                `${chapter}-${level}`;

            if (ui) {
                ui.currentChapter = chapter;
                ui.currentLevel = level;
                ui.currentLevelKey =
                    this.fallbackLevelKey;
            }

            const missionTitle =
                this.byId("mission-title");

            const missionText =
                this.byId("mission-instruction");

            const badge =
                this.byId("chapter-badge");

            if (missionTitle) {
                missionTitle.textContent =
                    next.title ||
                    `Exercice ${level}`;
            }

            if (missionText) {
                missionText.textContent =
                    next.instruction || "";
            }

            if (badge) {
                badge.textContent =
                    `Chapitre ${chapter}`;
            }

            if (this.codeEditor) {
                this.codeEditor.value =
                    Object.prototype
                        .hasOwnProperty
                        .call(
                            this.drafts,
                            this.fallbackLevelKey
                        )
                        ? this.drafts[
                            this.fallbackLevelKey
                        ]
                        : next.starterCode || "";
            }

            if (this.consoleOutput) {
                this.consoleOutput.textContent = "";
            }

            window.dispatchEvent(
                new CustomEvent(
                    "pyt:load-level",
                    {
                        detail: {
                            data: next
                        }
                    }
                )
            );

            window.dispatchEvent(
                new CustomEvent(
                    "pyt:level-opened",
                    {
                        detail: {
                            data: next
                        }
                    }
                )
            );

            this.showGame();
            this.applyAudioSettings();
        }

        /* =====================================================
           GUIDE ET BULLES
        ===================================================== */

        showGuide(message, actions = null) {
            if (this.guideMessage) {
                this.guideMessage.textContent =
                    String(message || "");
            }

            if (this.guideActions) {
                this.guideActions.replaceChildren();

                if (Array.isArray(actions)) {
                    for (const action of actions) {
                        const button =
                            document.createElement(
                                "button"
                            );

                        button.type = "button";

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

                        this.guideActions.appendChild(
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

        showThought(message) {
            if (this.thought) {
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
           FENÊTRE DE MESSAGE
        ===================================================== */

        showModal(options = {}) {
            const setText = (id, value) => {
                const node = this.byId(id);

                if (node) {
                    node.textContent =
                        String(value ?? "");
                }
            };

            setText(
                "modal-label",
                options.label || "PYT"
            );

            setText(
                "modal-title",
                options.title || "Information"
            );

            setText(
                "modal-message",
                options.message || ""
            );

            setText(
                "modal-primary-button",
                options.primaryText || "Continuer"
            );

            const secondary =
                this.byId(
                    "modal-secondary-button"
                );

            this.setVisible(
                secondary,
                Boolean(options.secondaryText)
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
                    typeof options.primaryAction === "function"
                        ? options.primaryAction
                        : null,

                secondary:
                    typeof options.secondaryAction === "function"
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

            if (typeof action === "function") {
                action();
            }
        }
    }

    /* =====================================================
       DÉMARRAGE
    ===================================================== */

    window.PytApplication = PytApplication;

    const start = () => {
        if (!window.pytApp) {
            window.pytApp =
                new PytApplication();
        }
    };

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

/* Petite flèche indiquant la direction de Pyt. */
(() => {
    const art = window.PYTArt;
    if (!art || typeof art.drawPyt !== "function" || art.__directionMarker) return;

    const original = art.drawPyt;
    art.drawPyt = function (ctx, x, y, size, direction, options) {
        original.call(this, ctx, x, y, size, direction, options);

        const angles = { E: 0, S: Math.PI / 2, W: Math.PI, N: -Math.PI / 2 };
        const angle = angles[String(direction).toUpperCase()];
        if (angle === undefined) return;

        ctx.save();
        ctx.translate(
            x + size / 2 + Math.cos(angle) * size * 0.43,
            y + size / 2 + Math.sin(angle) * size * 0.43
        );
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(size * 0.105, 0);
        ctx.lineTo(-size * 0.07, -size * 0.075);
        ctx.lineTo(-size * 0.07, size * 0.075);
        ctx.closePath();
        ctx.fillStyle = "#ffe27a";
        ctx.strokeStyle = "#17131d";
        ctx.lineWidth = Math.max(2, size * 0.034);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    };
    art.__directionMarker = true;
})();

/* =====================================================
   PYT — CASES INTERDITES PLUS VISIBLES
   Le marquage est dessiné après tous les objets.
===================================================== */

(() => {
    function installer() {
        const jeu = window.pytGame;

        if (
            !jeu ||
            typeof jeu.render !== "function" ||
            jeu.__casesRougesFortes
        ) {
            return;
        }

        const renduOriginal = jeu.render;

        jeu.render = function (...argumentsRendu) {
            const resultat = renduOriginal.apply(
                this,
                argumentsRendu
            );

            const ctx = this.ctx;

            const cases =
                typeof this.getBlockedCells === "function"
                    ? this.getBlockedCells()
                    : (
                        this.levelData?.blocked ||
                        this.levelData?.map?.blocked ||
                        []
                    );

            if (
                !ctx ||
                !this.levelData ||
                !Array.isArray(cases) ||
                typeof this.cellRect !== "function"
            ) {
                return resultat;
            }

            for (const caseInterdite of cases) {
                const colonne = Number(
                    Array.isArray(caseInterdite)
                        ? caseInterdite[0]
                        : (
                            caseInterdite?.x ??
                            caseInterdite?.col
                        )
                );

                const ligne = Number(
                    Array.isArray(caseInterdite)
                        ? caseInterdite[1]
                        : (
                            caseInterdite?.y ??
                            caseInterdite?.row
                        )
                );

                if (
                    !Number.isInteger(colonne) ||
                    !Number.isInteger(ligne) ||
                    colonne < 0 ||
                    ligne < 0 ||
                    colonne >= this.mapWidth ||
                    ligne >= this.mapHeight
                ) {
                    continue;
                }

                const { x, y, size } =
                    this.cellRect(colonne, ligne);

                const marge = size * 0.045;
                const cote = size - 2 * marge;

                ctx.save();

                ctx.globalAlpha = 1;
                ctx.globalCompositeOperation = "source-over";
                ctx.setLineDash([]);

                /* Fond bordeaux foncé. */
                ctx.fillStyle = "rgba(68, 7, 21, 0.85)";

                ctx.fillRect(
                    x + marge,
                    y + marge,
                    cote,
                    cote
                );

                /* Contour très sombre. */
                ctx.lineWidth = Math.max(
                    3,
                    size * 0.07
                );

                ctx.strokeStyle = "#14060b";

                ctx.strokeRect(
                    x + marge,
                    y + marge,
                    cote,
                    cote
                );

                /* Croix rouge bien visible. */
                ctx.lineWidth = Math.max(
                    3,
                    size * 0.065
                );

                ctx.strokeStyle = "#ff5260";

                ctx.beginPath();

                ctx.moveTo(
                    x + size * 0.22,
                    y + size * 0.22
                );

                ctx.lineTo(
                    x + size * 0.78,
                    y + size * 0.78
                );

                ctx.moveTo(
                    x + size * 0.78,
                    y + size * 0.22
                );

                ctx.lineTo(
                    x + size * 0.22,
                    y + size * 0.78
                );

                ctx.stroke();
                ctx.restore();
            }

            return resultat;
        };

        jeu.__casesRougesFortes = true;
        jeu.render();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            installer,
            { once: true }
        );
    } else {
        installer();
    }
})();
