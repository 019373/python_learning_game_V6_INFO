"use strict";

/*
============================================================
PYT - ui.js

Interface graphique de la version navigateur.

Ce fichier gère :
- les différents écrans
- le cours
- la carte
- la fenêtre de code
- le Canvas
- l'affichage de Pyt
- l'animation des actions
- les messages

La logique du moteur reste dans game.js / robot.js.
============================================================
*/


class PytUI {

    constructor() {

        // -------------------------------------------------
        // ÉTAT GÉNÉRAL
        // -------------------------------------------------

        this.game = null;
        this.level = null;

        this.currentChapter = 1;
        this.currentExercise = 1;

        this.completedLevels = new Set();
        this.unlockedLevels = new Set(["1-1"]);
        this.seenCourses = new Set();

        this.attempts = new Map();

        // -------------------------------------------------
        // ANIMATION
        // -------------------------------------------------

        this.actionDelay = 2000;

        this.animationRunning = false;
        this.actionQueue = [];
        this.actionIndex = 0;
        this.animationTimer = null;

        // -------------------------------------------------
        // CANVAS
        // -------------------------------------------------

        this.canvas = document.getElementById(
            "game-canvas"
        );

        this.ctx = this.canvas.getContext(
            "2d"
        );

        this.cellSize = 64;
        this.gridX = 0;
        this.gridY = 0;

        // -------------------------------------------------
        // ÉLÉMENTS HTML
        // -------------------------------------------------

        this.gameScreen = document.getElementById(
            "game-screen"
        );

        this.chapterScreen = document.getElementById(
            "chapter-screen"
        );

        this.mapScreen = document.getElementById(
            "map-screen"
        );

        this.codeWindow = document.getElementById(
            "code-window"
        );

        this.codeEditor = document.getElementById(
            "code-editor"
        );

        this.consoleOutput = document.getElementById(
            "console-output"
        );

        this.gameStatus = document.getElementById(
            "game-status"
        );

        this.chapterBadge = document.getElementById(
            "chapter-badge"
        );

        this.difficultyBadge = document.getElementById(
            "difficulty-badge"
        );

        this.missionTitle = document.getElementById(
            "mission-title"
        );

        this.missionInstruction = document.getElementById(
            "mission-instruction"
        );

        // -------------------------------------------------
        // MODALE
        // -------------------------------------------------

        this.modalBackground = document.getElementById(
            "modal-background"
        );

        this.modalTitle = document.getElementById(
            "modal-title"
        );

        this.modalMessage = document.getElementById(
            "modal-message"
        );

        this.modalPrimaryButton = document.getElementById(
            "modal-primary-button"
        );

        this.modalSecondaryButton = document.getElementById(
            "modal-secondary-button"
        );

        // -------------------------------------------------
        // CALLBACKS
        //
        // app.js pourra les remplacer.
        // -------------------------------------------------

        this.onRunCode = null;
        this.onRestart = null;
        this.onSelectLevel = null;

        // -------------------------------------------------
        // DÉMARRAGE INTERFACE
        // -------------------------------------------------

        this.installEvents();
        this.makeCodeWindowDraggable();
        this.resizeCanvas();

        window.addEventListener(
            "resize",
            () => {
                this.resizeCanvas();
                this.drawWorld();
            }
        );
    }


    // =====================================================
    // CONNEXION AU MOTEUR
    // =====================================================

    setGame(game) {

        this.game = game;

        if (game && game.level) {
            this.setLevel(
                game.level
            );
        }

        this.drawWorld();
    }


    setLevel(level) {

        if (!level) {
            return;
        }

        this.level = level;

        this.currentChapter =
            Number(level.chapter) || 1;

        this.currentExercise =
            Number(level.exercise) || 1;

        this.refreshLevelInformation();
    }


    // =====================================================
    // ÉVÉNEMENTS
    // =====================================================

    installEvents() {

        document
            .getElementById("open-code-button")
            .addEventListener(
                "click",
                () => this.openCodeWindow()
            );


        document
            .getElementById("close-code-button")
            .addEventListener(
                "click",
                () => this.closeCodeWindow()
            );


        document
            .getElementById("clear-code-button")
            .addEventListener(
                "click",
                () => this.clearEditor()
            );


        document
            .getElementById("run-code-button")
            .addEventListener(
                "click",
                () => this.requestRunCode()
            );


        document
            .getElementById("restart-button")
            .addEventListener(
                "click",
                () => this.requestRestart()
            );


        document
            .getElementById("code-restart-button")
            .addEventListener(
                "click",
                () => this.requestRestart()
            );


        document
            .getElementById("map-button")
            .addEventListener(
                "click",
                () => this.showMap()
            );


        document
            .getElementById("course-button")
            .addEventListener(
                "click",
                () => this.showCourse(
                    this.currentChapter
                )
            );


        document
            .getElementById("course-map-button")
            .addEventListener(
                "click",
                () => this.showMap()
            );


        document
            .getElementById("map-course-button")
            .addEventListener(
                "click",
                () => this.showCourse(
                    this.currentChapter
                )
            );


        for (let exercise = 1; exercise <= 3; exercise++) {

            const node = document.getElementById(
                `level-node-${exercise}`
            );

            node.addEventListener(
                "click",
                () => {
                    this.selectExercise(
                        exercise
                    );
                }
            );
        }
    }


    // =====================================================
    // INFORMATIONS DU NIVEAU
    // =====================================================

    refreshLevelInformation() {

        if (!this.level) {
            return;
        }

        this.chapterBadge.textContent =
            `CHAPITRE ${this.currentChapter} · ` +
            `EXERCICE ${this.currentExercise}/3`;

        this.difficultyBadge.textContent =
            String(
                this.level.difficulty || ""
            ).toUpperCase();

        this.missionTitle.textContent =
            this.level.title || "Mission";

        this.missionInstruction.textContent =
            this.level.instruction || "";

        this.refreshStatus();
    }


    // =====================================================
    // ÉCRANS
    // =====================================================

    hidePages() {

        this.chapterScreen.classList.add(
            "hidden"
        );

        this.mapScreen.classList.add(
            "hidden"
        );
    }


    showGame() {

        this.hidePages();

        this.gameScreen.classList.remove(
            "hidden"
        );

        this.resizeCanvas();
        this.drawWorld();
    }


    // =====================================================
    // COURS
    // =====================================================

    showCourse(chapter, automatic = false) {

        this.stopAnimation();

        this.closeCodeWindow();

        const course = this.getCourseData(
            chapter
        );

        if (!course) {

            this.showMessage(
                "Cours indisponible",
                "Le cours de ce chapitre n'est pas disponible."
            );

            return;
        }

        this.currentChapter = chapter;

        this.gameScreen.classList.add(
            "hidden"
        );

        this.mapScreen.classList.add(
            "hidden"
        );

        this.chapterScreen.classList.remove(
            "hidden"
        );

        document.getElementById(
            "course-chapter-number"
        ).textContent =
            `CHAPITRE ${chapter}`;

        document.getElementById(
            "course-title"
        ).textContent =
            course.title || `Chapitre ${chapter}`;

        document.getElementById(
            "course-subtitle"
        ).textContent =
            course.subtitle || "";

        const container = document.getElementById(
            "course-content"
        );

        container.innerHTML = "";

        // -------------------------------------------------
        // INTRODUCTION
        // -------------------------------------------------

        const introduction =
            course.introduction ||
            course.intro ||
            "";

        if (introduction) {

            const intro = document.createElement(
                "p"
            );

            intro.className =
                "course-introduction";

            intro.textContent =
                introduction;

            container.appendChild(
                intro
            );
        }

        // -------------------------------------------------
        // SECTIONS
        // -------------------------------------------------

        const sections =
            Array.isArray(course.sections)
                ? course.sections
                : [];

        for (const section of sections) {

            const card = document.createElement(
                "article"
            );

            card.className =
                "course-card";


            const title = document.createElement(
                "h3"
            );

            title.textContent =
                section.title || "";

            card.appendChild(
                title
            );


            if (section.text) {

                const text = document.createElement(
                    "p"
                );

                text.textContent =
                    section.text;

                card.appendChild(
                    text
                );
            }


            const exampleText =
                section.example ||
                section.code ||
                "";

            if (exampleText) {

                const example = document.createElement(
                    "pre"
                );

                example.className =
                    "course-example";

                example.textContent =
                    exampleText;

                card.appendChild(
                    example
                );
            }


            if (section.explanation) {

                const explanation =
                    document.createElement(
                        "p"
                    );

                explanation.className =
                    "course-explanation";

                explanation.textContent =
                    section.explanation;

                card.appendChild(
                    explanation
                );
            }


            container.appendChild(
                card
            );
        }

        this.seenCourses.add(
            chapter
        );

        if (automatic) {

            this.setStatus(
                "Consulte le cours avant de continuer."
            );
        }
    }


    showCourseAtChapterStart(chapter) {

        if (
            this.seenCourses.has(chapter)
        ) {
            return false;
        }

        this.showCourse(
            chapter,
            true
        );

        return true;
    }


    getCourseData(chapter) {

        /*
        levels.js pourra exposer soit :

        getCourse(chapter)

        soit :

        COURSES[chapter]

        On accepte les deux formes afin que
        l'interface reste simple à raccorder.
        */

        if (
            typeof getCourse === "function"
        ) {

            return getCourse(
                chapter
            );
        }

        if (
            typeof COURSES !== "undefined"
            &&
            COURSES
        ) {

            return (
                COURSES[chapter] ||
                COURSES[String(chapter)] ||
                null
            );
        }

        return null;
    }


    // =====================================================
    // CARTE
    // =====================================================

    showMap() {

        this.stopAnimation();
        this.closeCodeWindow();

        this.gameScreen.classList.add(
            "hidden"
        );

        this.chapterScreen.classList.add(
            "hidden"
        );

        this.mapScreen.classList.remove(
            "hidden"
        );

        this.refreshMap();
    }


    refreshMap() {

        const course = this.getCourseData(
            this.currentChapter
        );

        document.getElementById(
            "map-title"
        ).textContent =
            `CARTE DU CHAPITRE ${this.currentChapter}`;

        document.getElementById(
            "map-subtitle"
        ).textContent =
            course
                ? course.title
                : "";


        for (
            let exercise = 1;
            exercise <= 3;
            exercise++
        ) {

            const node =
                document.getElementById(
                    `level-node-${exercise}`
                );

            const circle =
                node.querySelector(
                    ".node-circle"
                );

            const key =
                this.levelKey(
                    this.currentChapter,
                    exercise
                );

            const unlocked =
                this.unlockedLevels.has(
                    key
                );

            const completed =
                this.completedLevels.has(
                    key
                );

            const current =
                this.currentExercise === exercise;


            node.classList.remove(
                "locked",
                "completed",
                "current"
            );


            if (completed) {

                node.classList.add(
                    "completed"
                );

                circle.textContent = "✓";

                node.disabled = false;

            } else if (unlocked) {

                circle.textContent =
                    String(exercise);

                node.disabled = false;

                if (current) {

                    node.classList.add(
                        "current"
                    );
                }

            } else {

                node.classList.add(
                    "locked"
                );

                circle.textContent = "×";

                node.disabled = true;
            }
        }
    }


    selectExercise(exercise) {

        const key =
            this.levelKey(
                this.currentChapter,
                exercise
            );

        if (
            !this.unlockedLevels.has(key)
        ) {
            return;
        }

        this.currentExercise =
            exercise;

        this.hidePages();

        this.gameScreen.classList.remove(
            "hidden"
        );

        this.clearEditor();
        this.clearConsole();

        if (
            typeof this.onSelectLevel
            === "function"
        ) {

            this.onSelectLevel(
                this.currentChapter,
                exercise
            );
        }

        this.resizeCanvas();
        this.drawWorld();
    }


    // =====================================================
    // PROGRESSION
    // =====================================================

    levelKey(chapter, exercise) {

        return `${chapter}-${exercise}`;
    }


    completeCurrentLevel() {

        const chapter =
            this.currentChapter;

        const exercise =
            this.currentExercise;

        const key =
            this.levelKey(
                chapter,
                exercise
            );

        const firstCompletion =
            !this.completedLevels.has(
                key
            );

        this.completedLevels.add(
            key
        );


        if (exercise < 3) {

            const nextKey =
                this.levelKey(
                    chapter,
                    exercise + 1
                );

            this.unlockedLevels.add(
                nextKey
            );

        } else if (chapter < 9) {

            const nextKey =
                this.levelKey(
                    chapter + 1,
                    1
                );

            this.unlockedLevels.add(
                nextKey
            );
        }


        this.refreshStatus();


        if (!firstCompletion) {
            return;
        }


        if (exercise < 3) {

            this.showMessage(
                "Mission réussie !",
                `Bravo ! L'exercice ${exercise + 1} ` +
                "est maintenant débloqué.\n\n" +
                "Ouvre la carte quand tu veux continuer."
            );

            return;
        }


        if (chapter < 9) {

            this.showMessage(
                "Chapitre terminé !",
                `Tu as terminé le chapitre ${chapter}.\n\n` +
                `Le chapitre ${chapter + 1} est débloqué.`
            );

            return;
        }


        this.showMessage(
            "PYT terminé !",
            "Félicitations ! Tu as terminé les 9 chapitres " +
            "et les 27 exercices."
        );
    }


    // =====================================================
    // TENTATIVES
    // =====================================================

    registerAttempt() {

        const key =
            this.levelKey(
                this.currentChapter,
                this.currentExercise
            );

        const oldValue =
            this.attempts.get(key) || 0;

        this.attempts.set(
            key,
            oldValue + 1
        );

        return oldValue + 1;
    }


    handleFailedAttempt() {

        const key =
            this.levelKey(
                this.currentChapter,
                this.currentExercise
            );

        const attempts =
            this.attempts.get(key) || 0;

        /*
        Le cours ne revient automatiquement
        qu'après le premier échec de l'exercice.
        */

        if (attempts !== 1) {
            return;
        }


        this.showMessage(
            "Besoin d'aide ?",
            "La mission n'est pas encore réussie.\n\n" +
            "Tu peux revoir le cours avant de réessayer.",
            {
                primaryText: "REVOIR LE COURS",

                secondaryText: "RÉESSAYER",

                onPrimary: () => {
                    this.showCourse(
                        this.currentChapter
                    );
                },

                onSecondary: () => {
                    this.showGame();
                }
            }
        );
    }


    // =====================================================
    // FENÊTRE DE CODE
    // =====================================================

    openCodeWindow() {

        /*
        Dans le navigateur il n'y a plus le bug
        de la fenêtre Tkinter cachée dans la
        barre des tâches.

        L'éditeur est toujours dans la même page.
        */

        this.codeWindow.classList.remove(
            "hidden"
        );

        this.codeWindow.style.zIndex =
            "60";

        this.codeEditor.focus();
    }


    closeCodeWindow() {

        this.codeWindow.classList.add(
            "hidden"
        );
    }


    // =====================================================
    // DÉPLACEMENT DE LA FENÊTRE DE CODE
    // =====================================================

    makeCodeWindowDraggable() {

        const header =
            document.getElementById(
                "code-window-header"
            );

        let dragging = false;

        let offsetX = 0;
        let offsetY = 0;


        header.addEventListener(
            "mousedown",
            (event) => {

                /*
                Le bouton X doit rester cliquable.
                */

                if (
                    event.target.closest(
                        ".window-control"
                    )
                ) {
                    return;
                }

                const rect =
                    this.codeWindow
                        .getBoundingClientRect();

                dragging = true;

                offsetX =
                    event.clientX
                    - rect.left;

                offsetY =
                    event.clientY
                    - rect.top;

                document.body.style.userSelect =
                    "none";
            }
        );


        document.addEventListener(
            "mousemove",
            (event) => {

                if (!dragging) {
                    return;
                }

                const width =
                    this.codeWindow.offsetWidth;

                const height =
                    this.codeWindow.offsetHeight;

                let left =
                    event.clientX
                    - offsetX;

                let top =
                    event.clientY
                    - offsetY;


                const maxLeft =
                    Math.max(
                        0,
                        window.innerWidth
                        - width
                    );

                const maxTop =
                    Math.max(
                        0,
                        window.innerHeight
                        - 45
                    );


                left = Math.max(
                    0,
                    Math.min(
                        left,
                        maxLeft
                    )
                );

                top = Math.max(
                    0,
                    Math.min(
                        top,
                        maxTop
                    )
                );


                this.codeWindow.style.left =
                    `${left}px`;

                this.codeWindow.style.top =
                    `${top}px`;

                this.codeWindow.style.right =
                    "auto";
            }
        );


        document.addEventListener(
            "mouseup",
            () => {

                dragging = false;

                document.body.style.userSelect =
                    "";
            }
        );
    }


    // =====================================================
    // ÉDITEUR
    // =====================================================

    getCode() {

        return this.codeEditor.value;
    }


    clearEditor() {

        this.codeEditor.value = "";

        this.codeEditor.focus();
    }


    // =====================================================
    // CONSOLE
    // =====================================================

    setConsole(text) {

        this.consoleOutput.textContent =
            text || "";
    }


    clearConsole() {

        this.setConsole(
            "Prêt."
        );
    }


    // =====================================================
    // DEMANDE EXÉCUTION
    // =====================================================

    requestRunCode() {

        if (this.animationRunning) {

            this.setConsole(
                "Pyt est déjà en mouvement."
            );

            return;
        }


        const code =
            this.getCode();

        if (!code.trim()) {

            this.setConsole(
                "Écris un programme avant de lancer Pyt."
            );

            return;
        }


        this.registerAttempt();


        if (
            typeof this.onRunCode
            === "function"
        ) {

            this.onRunCode(
                code
            );

            return;
        }


        this.setConsole(
            "Le moteur d'exécution n'est pas encore connecté."
        );
    }


    // =====================================================
    // RESET
    // =====================================================

    requestRestart() {

        this.stopAnimation();

        if (
            typeof this.onRestart
            === "function"
        ) {

            this.onRestart();
        }

        this.clearConsole();
        this.drawWorld();
    }


    // =====================================================
    // ANIMATION
    // =====================================================

    playActions(
        actions,
        performAction,
        onFinished
    ) {

        if (
            !Array.isArray(actions)
            ||
            actions.length === 0
        ) {

            if (
                typeof onFinished
                === "function"
            ) {
                onFinished();
            }

            return;
        }


        this.stopAnimation();

        this.actionQueue =
            actions.slice();

        this.actionIndex = 0;

        this.animationRunning = true;

        this.setRunButtonEnabled(
            false
        );

        this.setStatus(
            "Pyt exécute ton programme..."
        );


        const next = () => {

            if (!this.animationRunning) {
                return;
            }


            if (
                this.actionIndex
                >=
                this.actionQueue.length
            ) {

                this.animationRunning =
                    false;

                this.animationTimer =
                    null;

                this.setRunButtonEnabled(
                    true
                );

                this.drawWorld();


                if (
                    typeof onFinished
                    === "function"
                ) {

                    onFinished();
                }

                return;
            }


            const action =
                this.actionQueue[
                    this.actionIndex
                ];

            this.actionIndex += 1;


            let result = true;

            if (
                typeof performAction
                === "function"
            ) {

                result =
                    performAction(
                        action
                    );
            }


            this.drawWorld();


            if (result === false) {

                this.animationRunning =
                    false;

                this.animationTimer =
                    null;

                this.setRunButtonEnabled(
                    true
                );


                if (
                    typeof onFinished
                    === "function"
                ) {

                    onFinished(
                        false
                    );
                }

                return;
            }


            /*
            Une action toutes les 2 secondes.

            forward(3) doit être fourni par le runner
            sous forme de trois actions distinctes.
            */

            this.animationTimer =
                window.setTimeout(
                    next,
                    this.actionDelay
                );
        };


        next();
    }


    stopAnimation() {

        if (
            this.animationTimer !== null
        ) {

            window.clearTimeout(
                this.animationTimer
            );
        }

        this.animationTimer = null;
        this.animationRunning = false;

        this.actionQueue = [];
        this.actionIndex = 0;

        this.setRunButtonEnabled(
            true
        );
    }


    setRunButtonEnabled(enabled) {

        const button =
            document.getElementById(
                "run-code-button"
            );

        button.disabled =
            !enabled;

        button.textContent =
            enabled
                ? "PYT ▶"
                : "PYT...";
    }


    // =====================================================
    // CANVAS
    // =====================================================

    resizeCanvas() {

        if (!this.canvas) {
            return;
        }

        const container =
            document.getElementById(
                "game-container"
            );

        const rect =
            container.getBoundingClientRect();


        const width =
            Math.max(
                300,
                Math.floor(
                    rect.width
                )
            );

        const height =
            Math.max(
                300,
                Math.floor(
                    rect.height
                )
            );


        /*
        Le Canvas utilise sa vraie résolution
        interne, pas seulement sa taille CSS.
        */

        if (
            this.canvas.width !== width
            ||
            this.canvas.height !== height
        ) {

            this.canvas.width =
                width;

            this.canvas.height =
                height;
        }
    }


    // =====================================================
    // DESSIN DU MONDE
    // =====================================================

    drawWorld() {

        if (
            !this.ctx
            ||
            !this.game
        ) {
            return;
        }


        this.resizeCanvas();


        const ctx =
            this.ctx;

        const rows =
            Number(
                this.game.rows
            ) || 8;

        const cols =
            Number(
                this.game.cols
            ) || 10;


        ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        const availableWidth =
            this.canvas.width - 30;

        const availableHeight =
            this.canvas.height - 30;


        this.cellSize =
            Math.max(
                18,
                Math.floor(
                    Math.min(
                        availableWidth / cols,
                        availableHeight / rows
                    )
                )
            );


        const mapWidth =
            this.cellSize * cols;

        const mapHeight =
            this.cellSize * rows;


        this.gridX =
            Math.floor(
                (
                    this.canvas.width
                    - mapWidth
                ) / 2
            );

        this.gridY =
            Math.floor(
                (
                    this.canvas.height
                    - mapHeight
                ) / 2
            );


        for (
            let row = 0;
            row < rows;
            row++
        ) {

            for (
                let col = 0;
                col < cols;
                col++
            ) {

                this.drawTile(
                    row,
                    col
                );
            }
        }


        this.drawRobot();
        this.refreshStatus();
    }


    // =====================================================
    // DESSIN CASE
    // =====================================================

    drawTile(row, col) {

        const ctx =
            this.ctx;

        const size =
            this.cellSize;

        const x =
            this.gridX
            + col * size;

        const y =
            this.gridY
            + row * size;


        // Sol en damier.
        ctx.fillStyle =
            (
                (row + col) % 2 === 0
            )
                ? "#352c59"
                : "#40356a";

        ctx.fillRect(
            x,
            y,
            size,
            size
        );


        ctx.strokeStyle =
            "#08070d";

        ctx.lineWidth =
            Math.max(
                1,
                Math.floor(
                    size * 0.04
                )
            );

        ctx.strokeRect(
            x,
            y,
            size,
            size
        );


        const tile =
            this.getTileType(
                row,
                col
            );


        switch (tile) {

            case "wall":
                this.drawWall(
                    x,
                    y,
                    size
                );
                break;

            case "goal":
                this.drawGoal(
                    x,
                    y,
                    size
                );
                break;

            case "object":
                this.drawObject(
                    x,
                    y,
                    size
                );
                break;

            case "deposit":
                this.drawDeposit(
                    x,
                    y,
                    size
                );
                break;

            case "button":
                this.drawButtonTile(
                    x,
                    y,
                    size
                );
                break;

            case "door":
                this.drawDoor(
                    x,
                    y,
                    size
                );
                break;

            case "dirt":
                this.drawDirt(
                    x,
                    y,
                    size
                );
                break;

            case "box":
                this.drawBox(
                    x,
                    y,
                    size
                );
                break;

            case "charger":
                this.drawCharger(
                    x,
                    y,
                    size
                );
                break;
        }
    }


    // =====================================================
    // TYPE DE CASE
    // =====================================================

    getTileType(row, col) {

        if (
            this.game
            &&
            typeof this.game.getTileType
            === "function"
        ) {

            return this.normalizeTileType(
                this.game.getTileType(
                    row,
                    col
                )
            );
        }


        /*
        Solution de secours :
        on lit directement les collections
        du moteur si getTileType n'existe pas.
        */

        if (
            this.hasPosition(
                this.game.walls,
                row,
                col
            )
        ) {
            return "wall";
        }

        if (
            this.hasPosition(
                this.game.doors,
                row,
                col
            )
        ) {
            return "door";
        }

        if (
            this.hasPosition(
                this.game.boxes,
                row,
                col
            )
        ) {
            return "box";
        }

        if (
            this.hasPosition(
                this.game.objects,
                row,
                col
            )
        ) {
            return "object";
        }

        if (
            this.hasPosition(
                this.game.deposits,
                row,
                col
            )
        ) {
            return "deposit";
        }

        if (
            this.hasPosition(
                this.game.buttons,
                row,
                col
            )
        ) {
            return "button";
        }

        if (
            this.hasPosition(
                this.game.dirt,
                row,
                col
            )
        ) {
            return "dirt";
        }

        if (
            this.hasPosition(
                this.game.chargers,
                row,
                col
            )
        ) {
            return "charger";
        }


        if (
            this.positionEquals(
                this.game.goal,
                row,
                col
            )
        ) {
            return "goal";
        }


        return "empty";
    }


    normalizeTileType(tile) {

        if (
            tile === null
            ||
            tile === undefined
        ) {
            return "empty";
        }


        if (typeof tile === "string") {

            return tile.toLowerCase();
        }


        /*
        Compatibilité si game.js utilise les
        mêmes numéros que l'ancien moteur Python.
        */

        const names = {
            0: "empty",
            1: "wall",
            2: "goal",
            3: "object",
            4: "deposit",
            5: "button",
            6: "door",
            7: "dirt",
            8: "box",
            9: "charger"
        };


        return names[tile] || "empty";
    }


    // =====================================================
    // OUTILS POSITIONS
    // =====================================================

    hasPosition(collection, row, col) {

        if (!collection) {
            return false;
        }


        const key =
            `${row},${col}`;


        if (collection instanceof Set) {

            if (
                collection.has(key)
            ) {
                return true;
            }


            for (
                const value
                of collection
            ) {

                if (
                    this.positionEquals(
                        value,
                        row,
                        col
                    )
                ) {
                    return true;
                }
            }

            return false;
        }


        if (Array.isArray(collection)) {

            return collection.some(
                position =>
                    this.positionEquals(
                        position,
                        row,
                        col
                    )
            );
        }


        return false;
    }


    positionEquals(position, row, col) {

        if (!position) {
            return false;
        }


        if (Array.isArray(position)) {

            return (
                Number(position[0]) === row
                &&
                Number(position[1]) === col
            );
        }


        if (
            typeof position === "object"
        ) {

            const positionRow =
                position.row
                ?? position.r
                ?? position[0];

            const positionCol =
                position.col
                ?? position.column
                ?? position.c
                ?? position[1];


            return (
                Number(positionRow) === row
                &&
                Number(positionCol) === col
            );
        }


        if (typeof position === "string") {

            return (
                position ===
                `${row},${col}`
            );
        }


        return false;
    }


    // =====================================================
    // MUR
    // =====================================================

    drawWall(x, y, size) {

        const ctx =
            this.ctx;

        const margin =
            Math.max(
                3,
                Math.floor(
                    size * 0.08
                )
            );


        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            x + margin,
            y + margin,
            size - margin * 2,
            size - margin * 2
        );


        ctx.fillStyle =
            "#765081";

        ctx.fillRect(
            x + margin + 3,
            y + margin + 3,
            size - margin * 2 - 6,
            size - margin * 2 - 6
        );


        // Partie claire pseudo-3D.
        ctx.fillStyle =
            "#9a6da1";

        ctx.fillRect(
            x + margin + 6,
            y + margin + 6,
            size - margin * 2 - 12,
            Math.max(
                4,
                Math.floor(
                    size * 0.13
                )
            )
        );
    }


    // =====================================================
    // CRISTAL
    // =====================================================

    drawGoal(x, y, size) {

        const ctx =
            this.ctx;

        const cx =
            x + size / 2;

        const cy =
            y + size / 2;

        const radius =
            size * 0.28;


        // Halo carré rétro.
        ctx.fillStyle =
            "rgba(244, 215, 94, 0.18)";

        ctx.fillRect(
            cx - radius * 1.3,
            cy - radius * 1.3,
            radius * 2.6,
            radius * 2.6
        );


        ctx.beginPath();

        ctx.moveTo(
            cx,
            cy - radius
        );

        ctx.lineTo(
            cx + radius * 0.72,
            cy
        );

        ctx.lineTo(
            cx,
            cy + radius
        );

        ctx.lineTo(
            cx - radius * 0.72,
            cy
        );

        ctx.closePath();


        ctx.fillStyle =
            "#f4d75e";

        ctx.fill();


        ctx.strokeStyle =
            "#08070d";

        ctx.lineWidth =
            Math.max(
                2,
                size * 0.05
            );

        ctx.stroke();


        // Reflet.
        ctx.beginPath();

        ctx.moveTo(
            cx,
            cy - radius * 0.65
        );

        ctx.lineTo(
            cx + radius * 0.25,
            cy - radius * 0.1
        );

        ctx.lineTo(
            cx,
            cy
        );

        ctx.closePath();

        ctx.fillStyle =
            "#fff3a6";

        ctx.fill();
    }


    // =====================================================
    // OBJET
    // =====================================================

    drawObject(x, y, size) {

        const ctx =
            this.ctx;

        const margin =
            size * 0.28;


        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            x + margin - 3,
            y + margin - 3,
            size - margin * 2 + 6,
            size - margin * 2 + 6
        );


        ctx.fillStyle =
            "#ee9147";

        ctx.fillRect(
            x + margin,
            y + margin,
            size - margin * 2,
            size - margin * 2
        );


        ctx.fillStyle =
            "#f4d75e";

        ctx.fillRect(
            x + margin + 4,
            y + margin + 4,
            Math.max(
                3,
                size * 0.1
            ),
            Math.max(
                3,
                size * 0.1
            )
        );
    }


    // =====================================================
    // DÉPÔT
    // =====================================================

    drawDeposit(x, y, size) {

        const ctx =
            this.ctx;

        const margin =
            size * 0.18;


        ctx.strokeStyle =
            "#08070d";

        ctx.lineWidth =
            Math.max(
                6,
                size * 0.10
            );

        ctx.strokeRect(
            x + margin,
            y + margin,
            size - margin * 2,
            size - margin * 2
        );


        ctx.strokeStyle =
            "#f4d75e";

        ctx.lineWidth =
            Math.max(
                3,
                size * 0.05
            );

        ctx.strokeRect(
            x + margin,
            y + margin,
            size - margin * 2,
            size - margin * 2
        );
    }


    // =====================================================
    // BOUTON
    // =====================================================

    drawButtonTile(x, y, size) {

        const ctx =
            this.ctx;

        const cx =
            x + size / 2;

        const cy =
            y + size / 2;

        const radius =
            size * 0.20;


        ctx.beginPath();

        ctx.arc(
            cx,
            cy + 3,
            radius + 4,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#08070d";

        ctx.fill();


        ctx.beginPath();

        ctx.arc(
            cx,
            cy,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#42d6d1";

        ctx.fill();
    }


    // =====================================================
    // PORTE
    // =====================================================

    drawDoor(x, y, size) {

        const ctx =
            this.ctx;

        const margin =
            size * 0.16;


        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            x + margin - 3,
            y + margin - 3,
            size - margin * 2 + 6,
            size - margin + 3
        );


        ctx.fillStyle =
            "#b84f72";

        ctx.fillRect(
            x + margin,
            y + margin,
            size - margin * 2,
            size - margin
        );


        ctx.fillStyle =
            "#f4d75e";

        ctx.fillRect(
            x + size * 0.67,
            y + size * 0.52,
            Math.max(
                3,
                size * 0.07
            ),
            Math.max(
                3,
                size * 0.07
            )
        );
    }


    // =====================================================
    // SALETÉ
    // =====================================================

    drawDirt(x, y, size) {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#80573f";

        ctx.fillRect(
            x + size * 0.18,
            y + size * 0.48,
            size * 0.42,
            size * 0.20
        );

        ctx.fillRect(
            x + size * 0.46,
            y + size * 0.35,
            size * 0.30,
            size * 0.22
        );

        ctx.fillStyle =
            "#5d3c31";

        ctx.fillRect(
            x + size * 0.31,
            y + size * 0.39,
            size * 0.13,
            size * 0.11
        );
    }


    // =====================================================
    // CAISSE
    // =====================================================

    drawBox(x, y, size) {

        const ctx =
            this.ctx;

        const margin =
            size * 0.14;


        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            x + margin - 3,
            y + margin - 3,
            size - margin * 2 + 6,
            size - margin * 2 + 6
        );


        ctx.fillStyle =
            "#d28443";

        ctx.fillRect(
            x + margin,
            y + margin,
            size - margin * 2,
            size - margin * 2
        );


        ctx.strokeStyle =
            "#8c502f";

        ctx.lineWidth =
            Math.max(
                2,
                size * 0.05
            );

        ctx.beginPath();

        ctx.moveTo(
            x + margin,
            y + margin
        );

        ctx.lineTo(
            x + size - margin,
            y + size - margin
        );

        ctx.moveTo(
            x + size - margin,
            y + margin
        );

        ctx.lineTo(
            x + margin,
            y + size - margin
        );

        ctx.stroke();
    }


    // =====================================================
    // CHARGEUR
    // =====================================================

    drawCharger(x, y, size) {

        const ctx =
            this.ctx;

        const margin =
            size * 0.20;


        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            x + margin - 3,
            y + margin - 3,
            size - margin * 2 + 6,
            size - margin * 2 + 6
        );


        ctx.fillStyle =
            "#243d43";

        ctx.fillRect(
            x + margin,
            y + margin,
            size - margin * 2,
            size - margin * 2
        );


        ctx.fillStyle =
            "#58d68d";

        ctx.fillRect(
            x + size * 0.44,
            y + size * 0.28,
            size * 0.12,
            size * 0.44
        );

        ctx.fillRect(
            x + size * 0.28,
            y + size * 0.44,
            size * 0.44,
            size * 0.12
        );
    }


    // =====================================================
    // PYT
    // =====================================================

    drawRobot() {

        if (
            !this.game
            ||
            !this.game.robot
        ) {
            return;
        }


        const robot =
            this.game.robot;

        const row =
            Number(robot.row);

        const col =
            Number(robot.col);


        if (
            Number.isNaN(row)
            ||
            Number.isNaN(col)
        ) {
            return;
        }


        const size =
            this.cellSize;

        const x =
            this.gridX
            + col * size;

        const y =
            this.gridY
            + row * size;

        const cx =
            x + size / 2;

        const cy =
            y + size / 2;


        const ctx =
            this.ctx;


        // -------------------------------------------------
        // OMBRE PIXELISÉE
        // -------------------------------------------------

        ctx.fillStyle =
            "#15101d";

        ctx.fillRect(
            cx - size * 0.24,
            cy + size * 0.23,
            size * 0.48,
            size * 0.11
        );


        // -------------------------------------------------
        // CORPS
        // -------------------------------------------------

        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            cx - size * 0.24 - 3,
            cy - size * 0.09 - 3,
            size * 0.48 + 6,
            size * 0.34 + 6
        );


        ctx.fillStyle =
            "#e9e6ef";

        ctx.fillRect(
            cx - size * 0.24,
            cy - size * 0.09,
            size * 0.48,
            size * 0.34
        );


        // -------------------------------------------------
        // TÊTE
        // -------------------------------------------------

        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            cx - size * 0.31 - 3,
            cy - size * 0.35 - 3,
            size * 0.62 + 6,
            size * 0.28 + 6
        );


        ctx.fillStyle =
            "#f5f2f7";

        ctx.fillRect(
            cx - size * 0.31,
            cy - size * 0.35,
            size * 0.62,
            size * 0.28
        );


        // -------------------------------------------------
        // VISAGE
        // -------------------------------------------------

        ctx.fillStyle =
            "#171326";

        ctx.fillRect(
            cx - size * 0.21,
            cy - size * 0.29,
            size * 0.42,
            size * 0.14
        );


        // Yeux.
        ctx.fillStyle =
            "#42d6d1";

        const eyeSize =
            Math.max(
                3,
                Math.floor(
                    size * 0.055
                )
            );


        ctx.fillRect(
            cx - size * 0.12,
            cy - size * 0.245,
            eyeSize,
            eyeSize
        );

        ctx.fillRect(
            cx + size * 0.07,
            cy - size * 0.245,
            eyeSize,
            eyeSize
        );


        // -------------------------------------------------
        // INDICATEUR DE DIRECTION
        // -------------------------------------------------

        const direction =
            String(
                robot.direction || "east"
            ).toLowerCase();


        const directionColors = {
            north: "#f4d75e",
            east: "#dc4d9b",
            south: "#ee9147",
            west: "#42d6d1"
        };


        ctx.fillStyle =
            directionColors[direction]
            || "#dc4d9b";


        const indicator =
            Math.max(
                4,
                size * 0.08
            );


        if (direction === "north") {

            ctx.fillRect(
                cx - indicator / 2,
                cy - size * 0.43,
                indicator,
                indicator
            );

        } else if (direction === "south") {

            ctx.fillRect(
                cx - indicator / 2,
                cy + size * 0.31,
                indicator,
                indicator
            );

        } else if (direction === "west") {

            ctx.fillRect(
                cx - size * 0.40,
                cy - indicator / 2,
                indicator,
                indicator
            );

        } else {

            ctx.fillRect(
                cx + size * 0.32,
                cy - indicator / 2,
                indicator,
                indicator
            );
        }
    }


    // =====================================================
    // STATUT
    // =====================================================

    setStatus(text) {

        this.gameStatus.textContent =
            text || "";
    }


    refreshStatus() {

        if (!this.level) {
            return;
        }


        const key =
            this.levelKey(
                this.currentChapter,
                this.currentExercise
            );


        if (this.animationRunning) {

            this.setStatus(
                "Pyt exécute ton programme..."
            );

            return;
        }


        if (
            this.completedLevels.has(
                key
            )
        ) {

            this.setStatus(
                "✓ Exercice réussi."
            );

            return;
        }


        if (
            this.game
            &&
            this.game.message
        ) {

            this.setStatus(
                this.game.message
            );

            return;
        }


        this.setStatus(
            "Pyt attend ton programme."
        );
    }


    // =====================================================
    // MODALE
    // =====================================================

    showMessage(
        title,
        message,
        options = {}
    ) {

        this.modalTitle.textContent =
            title || "PYT";

        this.modalMessage.textContent =
            message || "";


        const primaryText =
            options.primaryText
            || "CONTINUER";

        const secondaryText =
            options.secondaryText
            || null;


        this.modalPrimaryButton.textContent =
            primaryText;


        this.modalPrimaryButton.onclick =
            () => {

                this.closeMessage();

                if (
                    typeof options.onPrimary
                    === "function"
                ) {

                    options.onPrimary();
                }
            };


        if (secondaryText) {

            this.modalSecondaryButton.classList.remove(
                "hidden"
            );

            this.modalSecondaryButton.textContent =
                secondaryText;

            this.modalSecondaryButton.onclick =
                () => {

                    this.closeMessage();

                    if (
                        typeof options.onSecondary
                        === "function"
                    ) {

                        options.onSecondary();
                    }
                };

        } else {

            this.modalSecondaryButton.classList.add(
                "hidden"
            );

            this.modalSecondaryButton.onclick =
                null;
        }


        this.modalBackground.classList.remove(
            "hidden"
        );
    }


    closeMessage() {

        this.modalBackground.classList.add(
            "hidden"
        );
    }

}


// =========================================================
// EXPOSITION GLOBALE
// =========================================================

window.PytUI = PytUI;