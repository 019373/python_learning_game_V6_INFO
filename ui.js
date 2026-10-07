"use strict";

/*
============================================================
PYT - ui.js
Interface complète de la version navigateur.

Ce fichier gère :
- affichage du monde ;
- cours ;
- carte des exercices ;
- progression visuelle ;
- fenêtre de code ;
- console ;
- animation ;
- messages ;
- passage entre les chapitres.

Les règles du jeu restent dans game.js.
============================================================
*/


class PytUI {

    constructor() {

        // =================================================
        // ÉTAT
        // =================================================

        this.game = null;
        this.level = null;

        this.currentChapter = 1;
        this.currentExercise = 1;

        this.completedLevels =
            new Set();

        this.unlockedLevels =
            new Set(["1-1"]);

        this.seenCourses =
            new Set();

        this.attempts =
            new Map();


        // =================================================
        // ANIMATION
        // =================================================

        this.actionDelay = 2000;

        this.animationRunning = false;
        this.animationTimer = null;


        // =================================================
        // CALLBACKS FOURNIS PAR APP.JS
        // =================================================

        this.onRunCode = null;
        this.onRestart = null;
        this.onSelectLevel = null;


        // =================================================
        // CANVAS
        // =================================================

        this.canvas =
            document.getElementById(
                "game-canvas"
            );

        if (!this.canvas) {

            throw new Error(
                "Canvas #game-canvas introuvable."
            );
        }

        this.ctx =
            this.canvas.getContext("2d");

        this.cellSize = 64;
        this.gridX = 0;
        this.gridY = 0;


        // =================================================
        // ÉCRANS
        // =================================================

        this.gameScreen =
            document.getElementById(
                "game-screen"
            );

        this.chapterScreen =
            document.getElementById(
                "chapter-screen"
            );

        this.mapScreen =
            document.getElementById(
                "map-screen"
            );


        // =================================================
        // INFORMATIONS DU NIVEAU
        // =================================================

        this.chapterBadge =
            document.getElementById(
                "chapter-badge"
            );

        this.difficultyBadge =
            document.getElementById(
                "difficulty-badge"
            );

        this.missionTitle =
            document.getElementById(
                "mission-title"
            );

        this.missionInstruction =
            document.getElementById(
                "mission-instruction"
            );

        this.gameStatus =
            document.getElementById(
                "game-status"
            );


        // =================================================
        // COURS
        // =================================================

        this.courseChapterNumber =
            document.getElementById(
                "course-chapter-number"
            );

        this.courseTitle =
            document.getElementById(
                "course-title"
            );

        this.courseSubtitle =
            document.getElementById(
                "course-subtitle"
            );

        this.courseContent =
            document.getElementById(
                "course-content"
            );


        // =================================================
        // CARTE
        // =================================================

        this.mapTitle =
            document.getElementById(
                "map-title"
            );

        this.mapSubtitle =
            document.getElementById(
                "map-subtitle"
            );

        this.levelNodes =
            [
                document.getElementById(
                    "level-node-1"
                ),

                document.getElementById(
                    "level-node-2"
                ),

                document.getElementById(
                    "level-node-3"
                )
            ];


        // =================================================
        // FENÊTRE DE CODE
        // =================================================

        this.codeWindow =
            document.getElementById(
                "code-window"
            );

        this.codeWindowHeader =
            document.getElementById(
                "code-window-header"
            );

        this.codeEditor =
            document.getElementById(
                "code-editor"
            );

        this.consoleOutput =
            document.getElementById(
                "console-output"
            );

        this.runCodeButton =
            document.getElementById(
                "run-code-button"
            );


        // =================================================
        // MODALE
        // =================================================

        this.modalBackground =
            document.getElementById(
                "modal-background"
            );

        this.messageModal =
            document.getElementById(
                "message-modal"
            );

        this.modalLabel =
            document.getElementById(
                "modal-label"
            );

        this.modalTitle =
            document.getElementById(
                "modal-title"
            );

        this.modalMessage =
            document.getElementById(
                "modal-message"
            );

        this.modalPrimaryButton =
            document.getElementById(
                "modal-primary-button"
            );

        this.modalSecondaryButton =
            document.getElementById(
                "modal-secondary-button"
            );


        // =================================================
        // INSTALLATION
        // =================================================

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


        if (
            game
            &&
            game.level
        ) {

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
            Number(
                level.chapter
            );

        this.currentExercise =
            Number(
                level.exercise
            );


        this.refreshLevelInformation();
    }


    // =====================================================
    // ÉVÉNEMENTS
    // =====================================================

    installEvents() {

        const courseButton =
            document.getElementById(
                "course-button"
            );

        const mapButton =
            document.getElementById(
                "map-button"
            );

        const openCodeButton =
            document.getElementById(
                "open-code-button"
            );

        const restartButton =
            document.getElementById(
                "restart-button"
            );

        const closeCodeButton =
            document.getElementById(
                "close-code-button"
            );

        const clearCodeButton =
            document.getElementById(
                "clear-code-button"
            );

        const codeRestartButton =
            document.getElementById(
                "code-restart-button"
            );

        const courseMapButton =
            document.getElementById(
                "course-map-button"
            );

        const mapCourseButton =
            document.getElementById(
                "map-course-button"
            );


        if (courseButton) {

            courseButton.addEventListener(
                "click",
                () => {

                    this.showCourse(
                        this.currentChapter
                    );
                }
            );
        }


        if (mapButton) {

            mapButton.addEventListener(
                "click",
                () => {

                    this.showMap();
                }
            );
        }


        if (openCodeButton) {

            openCodeButton.addEventListener(
                "click",
                () => {

                    this.openCodeWindow();
                }
            );
        }


        if (restartButton) {

            restartButton.addEventListener(
                "click",
                () => {

                    this.requestRestart();
                }
            );
        }


        if (closeCodeButton) {

            closeCodeButton.addEventListener(
                "click",
                () => {

                    this.closeCodeWindow();
                }
            );
        }


        if (clearCodeButton) {

            clearCodeButton.addEventListener(
                "click",
                () => {

                    this.codeEditor.value = "";

                    this.codeEditor.focus();
                }
            );
        }


        if (codeRestartButton) {

            codeRestartButton.addEventListener(
                "click",
                () => {

                    this.requestRestart();
                }
            );
        }


        if (this.runCodeButton) {

            this.runCodeButton.addEventListener(
                "click",
                () => {

                    this.requestRunCode();
                }
            );
        }


        if (courseMapButton) {

            courseMapButton.addEventListener(
                "click",
                () => {

                    this.showMap();
                }
            );
        }


        if (mapCourseButton) {

            mapCourseButton.addEventListener(
                "click",
                () => {

                    this.showCourse(
                        this.currentChapter
                    );
                }
            );
        }


        for (
            const node
            of this.levelNodes
        ) {

            if (!node) {
                continue;
            }


            node.addEventListener(
                "click",
                () => {

                    const exercise =
                        Number(
                            node.dataset.exercise
                        );


                    this.selectExercise(
                        exercise
                    );
                }
            );
        }
    }


    // =====================================================
    // INFORMATIONS
    // =====================================================

    refreshLevelInformation() {

        if (!this.level) {
            return;
        }


        if (this.chapterBadge) {

            this.chapterBadge.textContent =
                `CHAPITRE ${this.currentChapter}`;
        }


        if (this.difficultyBadge) {

            this.difficultyBadge.textContent =
                this.level.difficulty
                || "";
        }


        if (this.missionTitle) {

            this.missionTitle.textContent =
                this.level.title
                || "Mission";
        }


        if (this.missionInstruction) {

            this.missionInstruction.textContent =
                this.level.instruction
                || "";
        }


        this.setStatus(
            "Pyt attend ton programme."
        );
    }


    setStatus(text) {

        if (!this.gameStatus) {
            return;
        }


        this.gameStatus.textContent =
            text;
    }


    // =====================================================
    // ÉCRANS
    // =====================================================

    hidePages() {

        if (this.gameScreen) {

            this.gameScreen.classList.add(
                "hidden"
            );
        }


        if (this.chapterScreen) {

            this.chapterScreen.classList.add(
                "hidden"
            );
        }


        if (this.mapScreen) {

            this.mapScreen.classList.add(
                "hidden"
            );
        }
    }


    showGame() {

        this.hidePages();


        if (this.gameScreen) {

            this.gameScreen.classList.remove(
                "hidden"
            );
        }


        this.resizeCanvas();
        this.drawWorld();
    }


    // =====================================================
    // COURS
    // =====================================================

    getCourseData(chapter) {

        if (
            typeof window.getCourse
            === "function"
        ) {

            return window.getCourse(
                chapter
            );
        }


        if (
            window.COURSES
        ) {

            return (
                window.COURSES[
                    chapter
                ]
                || null
            );
        }


        return null;
    }


    showCourse(
        chapter,
        automatic = false
    ) {

        chapter =
            Number(chapter);


        const course =
            this.getCourseData(
                chapter
            );


        if (!course) {

            this.showMessage(
                "Cours introuvable",
                "Le cours de ce chapitre n'est pas disponible."
            );

            return false;
        }


        this.stopAnimation();
        this.closeCodeWindow();
        this.hidePages();


        this.currentChapter =
            chapter;


        if (this.chapterScreen) {

            this.chapterScreen.classList.remove(
                "hidden"
            );
        }


        if (this.courseChapterNumber) {

            this.courseChapterNumber.textContent =
                `CHAPITRE ${chapter}`;
        }


        if (this.courseTitle) {

            this.courseTitle.textContent =
                course.title
                || `Chapitre ${chapter}`;
        }


        if (this.courseSubtitle) {

            this.courseSubtitle.textContent =
                course.subtitle
                || "";
        }


        if (this.courseContent) {

            this.courseContent.innerHTML = "";


            const intro =
                course.introduction
                ||
                course.intro;


            if (intro) {

                const introduction =
                    document.createElement(
                        "div"
                    );


                introduction.className =
                    "course-introduction";


                introduction.textContent =
                    intro;


                this.courseContent.appendChild(
                    introduction
                );
            }


            const sections =
                Array.isArray(
                    course.sections
                )
                    ? course.sections
                    : [];


            for (
                const section
                of sections
            ) {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "course-card";


                const title =
                    document.createElement(
                        "h3"
                    );


                title.textContent =
                    section.title
                    || "";


                const text =
                    document.createElement(
                        "p"
                    );


                text.textContent =
                    section.text
                    || "";


                card.appendChild(
                    title
                );


                card.appendChild(
                    text
                );


                const example =
                    section.example
                    ||
                    section.code;


                if (example) {

                    const pre =
                        document.createElement(
                            "pre"
                        );


                    const code =
                        document.createElement(
                            "code"
                        );


                    code.textContent =
                        example;


                    pre.appendChild(
                        code
                    );


                    card.appendChild(
                        pre
                    );
                }


                if (
                    section.explanation
                ) {

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


                this.courseContent.appendChild(
                    card
                );
            }
        }


        this.seenCourses.add(
            chapter
        );


        return true;
    }


    showCourseAtChapterStart(
        chapter
    ) {

        chapter =
            Number(chapter);


        if (
            this.seenCourses.has(
                chapter
            )
        ) {

            return false;
        }


        return this.showCourse(
            chapter,
            true
        );
    }


    // =====================================================
    // CARTE
    // =====================================================

    showMap() {

        this.stopAnimation();
        this.closeCodeWindow();
        this.hidePages();


        if (this.mapScreen) {

            this.mapScreen.classList.remove(
                "hidden"
            );
        }


        this.refreshMap();
    }


    refreshMap() {

        const course =
            this.getCourseData(
                this.currentChapter
            );


        if (this.mapTitle) {

            this.mapTitle.textContent =
                `CHAPITRE ${this.currentChapter}`;
        }


        if (this.mapSubtitle) {

            this.mapSubtitle.textContent =
                course
                    ? course.title
                    : "Choisis un exercice";
        }


        for (
            let exercise = 1;
            exercise <= 3;
            exercise++
        ) {

            const node =
                this.levelNodes[
                    exercise - 1
                ];


            if (!node) {
                continue;
            }


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
                exercise
                ===
                this.currentExercise
            );


            const circle =
                node.querySelector(
                    ".level-circle"
                );


            if (circle) {

                if (completed) {

                    circle.textContent =
                        "✓";

                } else if (
                    !unlocked
                ) {

                    circle.textContent =
                        "×";

                } else {

                    circle.textContent =
                        String(exercise);
                }
            }
        }
    }


    selectExercise(exercise) {

        exercise =
            Number(exercise);


        const key =
            this.levelKey(
                this.currentChapter,
                exercise
            );


        if (
            !this.unlockedLevels.has(
                key
            )
        ) {

            return;
        }


        this.currentExercise =
            exercise;


        this.showGame();


        this.codeEditor.value = "";

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
    }


    // =====================================================
    // PROGRESSION
    // =====================================================

    levelKey(
        chapter,
        exercise
    ) {

        return (
            `${chapter}-${exercise}`
        );
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


        // -------------------------------------------------
        // EXERCICE 1 OU 2
        // -------------------------------------------------

        if (
            exercise < 3
        ) {

            const nextExercise =
                exercise + 1;


            this.unlockedLevels.add(
                this.levelKey(
                    chapter,
                    nextExercise
                )
            );


            this.refreshMap();


            if (
                firstCompletion
            ) {

                this.showMessage(
                    "Mission réussie !",
                    `L'exercice ${nextExercise} est maintenant débloqué.`,
                    {
                        label:
                            "MISSION TERMINÉE",

                        primaryText:
                            "VOIR LA CARTE",

                        primaryAction:
                            () => {

                                this.showMap();
                            },

                        secondaryText:
                            "RESTER ICI",

                        secondaryAction:
                            () => {

                                this.showGame();
                            }
                    }
                );

            } else {

                this.showMessage(
                    "Mission réussie !",
                    "Tu avais déjà terminé cet exercice.",
                    {
                        primaryText:
                            "VOIR LA CARTE",

                        primaryAction:
                            () => {

                                this.showMap();
                            }
                    }
                );
            }


            return;
        }


        // -------------------------------------------------
        // FIN D'UN CHAPITRE 1 À 8
        // -------------------------------------------------

        if (
            chapter < 9
        ) {

            const nextChapter =
                chapter + 1;


            this.unlockedLevels.add(
                this.levelKey(
                    nextChapter,
                    1
                )
            );


            this.showMessage(
                "Chapitre terminé !",
                `Bravo ! Tu as terminé le chapitre ${chapter}. Le chapitre ${nextChapter} est débloqué.`,
                {
                    label:
                        "NOUVEAU CHAPITRE",

                    primaryText:
                        "CONTINUER",

                    primaryAction:
                        () => {

                            this.goToNextChapter(
                                nextChapter
                            );
                        },

                    secondaryText:
                        "RESTER ICI",

                    secondaryAction:
                        () => {

                            this.showGame();
                        }
                }
            );


            return;
        }


        // -------------------------------------------------
        // FIN DU JEU
        // -------------------------------------------------

        this.showMessage(
            "PYT terminé !",
            "Bravo ! Tu as réussi les 27 exercices et terminé l'épreuve finale.",
            {
                label:
                    "MISSION ACCOMPLIE",

                primaryText:
                    "VOIR LA CARTE",

                primaryAction:
                    () => {

                        this.showMap();
                    },

                secondaryText:
                    "RESTER ICI",

                secondaryAction:
                    () => {

                        this.showGame();
                    }
            }
        );
    }


    goToNextChapter(
        chapter
    ) {

        chapter =
            Number(chapter);


        if (
            chapter < 1
            ||
            chapter > 9
        ) {
            return;
        }


        this.currentChapter =
            chapter;

        this.currentExercise = 1;


        /*
        On charge d'abord le niveau 1 du
        nouveau chapitre pour synchroniser
        app.js, game.js et ui.js.
        */

        if (
            typeof this.onSelectLevel
            === "function"
        ) {

            this.onSelectLevel(
                chapter,
                1
            );
        }


        /*
        Puis le joueur voit le cours avant
        d'accéder à la carte.
        */

        this.showCourse(
            chapter,
            true
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


        const previous =
            this.attempts.get(
                key
            )
            || 0;


        const next =
            previous + 1;


        this.attempts.set(
            key,
            next
        );


        return next;
    }


    getAttemptCount() {

        const key =
            this.levelKey(
                this.currentChapter,
                this.currentExercise
            );


        return (
            this.attempts.get(
                key
            )
            || 0
        );
    }


    handleFailedAttempt() {

        const attempts =
            this.getAttemptCount();


        /*
        Proposition du cours uniquement
        après le premier échec.
        */

        if (
            attempts !== 1
        ) {

            return;
        }


        this.showMessage(
            "Besoin d'un rappel ?",
            "Tu peux revoir le cours de ce chapitre avant de réessayer.",
            {
                label:
                    "PREMIER ESSAI",

                primaryText:
                    "REVOIR LE COURS",

                primaryAction:
                    () => {

                        this.showCourse(
                            this.currentChapter
                        );
                    },

                secondaryText:
                    "RÉESSAYER",

                secondaryAction:
                    () => {

                        this.showGame();
                    }
            }
        );
    }


    // =====================================================
    // FENÊTRE DE CODE
    // =====================================================

    openCodeWindow() {

        if (!this.codeWindow) {
            return;
        }


        this.codeWindow.classList.remove(
            "hidden"
        );


        this.codeWindow.style.zIndex =
            "60";


        if (this.codeEditor) {

            this.codeEditor.focus();
        }
    }


    closeCodeWindow() {

        if (!this.codeWindow) {
            return;
        }


        this.codeWindow.classList.add(
            "hidden"
        );
    }


    makeCodeWindowDraggable() {

        if (
            !this.codeWindow
            ||
            !this.codeWindowHeader
        ) {

            return;
        }


        let dragging = false;

        let offsetX = 0;
        let offsetY = 0;


        this.codeWindowHeader.addEventListener(
            "mousedown",
            event => {

                if (
                    event.target.closest(
                        "#close-code-button"
                    )
                ) {

                    return;
                }


                dragging = true;


                const rect =
                    this.codeWindow
                        .getBoundingClientRect();


                offsetX =
                    event.clientX
                    -
                    rect.left;

                offsetY =
                    event.clientY
                    -
                    rect.top;


                this.codeWindow.style.left =
                    `${rect.left}px`;

                this.codeWindow.style.top =
                    `${rect.top}px`;

                this.codeWindow.style.right =
                    "auto";


                event.preventDefault();
            }
        );


        document.addEventListener(
            "mousemove",
            event => {

                if (!dragging) {
                    return;
                }


                const rect =
                    this.codeWindow
                        .getBoundingClientRect();


                let left =
                    event.clientX
                    -
                    offsetX;

                let top =
                    event.clientY
                    -
                    offsetY;


                left =
                    Math.max(
                        0,
                        Math.min(
                            left,
                            window.innerWidth
                            -
                            rect.width
                        )
                    );


                top =
                    Math.max(
                        0,
                        Math.min(
                            top,
                            window.innerHeight
                            -
                            rect.height
                        )
                    );


                this.codeWindow.style.left =
                    `${left}px`;

                this.codeWindow.style.top =
                    `${top}px`;
            }
        );


        document.addEventListener(
            "mouseup",
            () => {

                dragging = false;
            }
        );
    }


    // =====================================================
    // CONSOLE
    // =====================================================

    setConsole(text) {

        if (!this.consoleOutput) {
            return;
        }


        this.consoleOutput.textContent =
            String(text);
    }


    clearConsole() {

        this.setConsole(
            "Prêt."
        );
    }


    // =====================================================
    // EXÉCUTER LE CODE
    // =====================================================

    requestRunCode() {

        if (
            this.animationRunning
        ) {

            this.setConsole(
                "Attends la fin de l'animation."
            );

            return;
        }


        const code =
            this.codeEditor
                ? this.codeEditor.value
                : "";


        if (
            code.trim() === ""
        ) {

            this.setConsole(
                "Écris un programme avant de l'exécuter."
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
            "Le runner n'est pas connecté."
        );
    }


    // =====================================================
    // RECOMMENCER
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
    // ANIMATION DES ACTIONS
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

                onFinished(true);
            }

            return;
        }


        this.stopAnimation();


        this.animationRunning = true;

        this.setRunButtonEnabled(
            false
        );


        this.setStatus(
            "Pyt exécute ton programme..."
        );


        let index = 0;


        const next =
            () => {

                if (
                    index >= actions.length
                ) {

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

                        onFinished(true);
                    }

                    return;
                }


                const action =
                    actions[index];


                let success = false;


                try {

                    success =
                        performAction(
                            action
                        )
                        !== false;

                } catch (error) {

                    console.error(
                        error
                    );

                    success = false;
                }


                this.drawWorld();


                if (!success) {

                    this.animationRunning =
                        false;

                    this.animationTimer =
                        null;

                    this.setRunButtonEnabled(
                        true
                    );


                    if (
                        this.game
                        &&
                        this.game.message
                    ) {

                        this.setStatus(
                            this.game.message
                        );

                    } else {

                        this.setStatus(
                            "Pyt est bloqué."
                        );
                    }


                    if (
                        typeof onFinished
                        === "function"
                    ) {

                        onFinished(false);
                    }

                    return;
                }


                index++;


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
            this.animationTimer
            !== null
        ) {

            window.clearTimeout(
                this.animationTimer
            );
        }


        this.animationTimer =
            null;

        this.animationRunning =
            false;


        this.setRunButtonEnabled(
            true
        );
    }


    setRunButtonEnabled(
        enabled
    ) {

        if (!this.runCodeButton) {
            return;
        }


        this.runCodeButton.disabled =
            !enabled;
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


        if (!container) {
            return;
        }


        const rect =
            container
                .getBoundingClientRect();


        const width =
            Math.max(
                320,
                Math.floor(
                    rect.width
                )
            );


        const height =
            Math.max(
                320,
                Math.floor(
                    rect.height
                )
            );


        if (
            this.canvas.width
            !== width
        ) {

            this.canvas.width =
                width;
        }


        if (
            this.canvas.height
            !== height
        ) {

            this.canvas.height =
                height;
        }
    }


    // =====================================================
    // DESSIN PRINCIPAL
    // =====================================================

    drawWorld() {

        if (
            !this.ctx
            ||
            !this.canvas
        ) {

            return;
        }


        const ctx =
            this.ctx;


        ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        // Fond
        ctx.fillStyle =
            "#100d1c";

        ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        if (
            !this.game
            ||
            !this.game.rows
            ||
            !this.game.cols
        ) {

            return;
        }


        const availableWidth =
            this.canvas.width
            - 32;

        const availableHeight =
            this.canvas.height
            - 32;


        this.cellSize =
            Math.floor(
                Math.min(
                    availableWidth
                    /
                    this.game.cols,

                    availableHeight
                    /
                    this.game.rows
                )
            );


        this.cellSize =
            Math.max(
                16,
                this.cellSize
            );


        const gridWidth =
            this.cellSize
            *
            this.game.cols;

        const gridHeight =
            this.cellSize
            *
            this.game.rows;


        this.gridX =
            Math.floor(
                (
                    this.canvas.width
                    -
                    gridWidth
                )
                /
                2
            );


        this.gridY =
            Math.floor(
                (
                    this.canvas.height
                    -
                    gridHeight
                )
                /
                2
            );


        // ---------------------------------------------
        // CASES
        // ---------------------------------------------

        for (
            let row = 0;
            row < this.game.rows;
            row++
        ) {

            for (
                let col = 0;
                col < this.game.cols;
                col++
            ) {

                this.drawTile(
                    row,
                    col
                );
            }
        }


        // ---------------------------------------------
        // PYT
        // ---------------------------------------------

        this.drawRobot();
    }


    // =====================================================
    // CASE
    // =====================================================

    drawTile(
        row,
        col
    ) {

        const ctx =
            this.ctx;

        const size =
            this.cellSize;

        const x =
            this.gridX
            +
            col * size;

        const y =
            this.gridY
            +
            row * size;


        // Sol
        ctx.fillStyle =
            (
                row + col
            )
            % 2 === 0
                ? "#211943"
                : "#281f4d";


        ctx.fillRect(
            x,
            y,
            size,
            size
        );


        // Bordure
        ctx.strokeStyle =
            "#382b65";

        ctx.lineWidth =
            Math.max(
                1,
                Math.floor(
                    size * 0.03
                )
            );


        ctx.strokeRect(
            x,
            y,
            size,
            size
        );


        const type =
            this.getTileType(
                row,
                col
            );


        switch (type) {

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

                this.drawButton(
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


    getTileType(
        row,
        col
    ) {

        if (
            this.game
            &&
            typeof this.game.getTileType
            === "function"
        ) {

            return this.game.getTileType(
                row,
                col
            );
        }


        return "empty";
    }


    // =====================================================
    // DÉCOR
    // =====================================================

    drawWall(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            x + size * 0.08,
            y + size * 0.08,
            size * 0.84,
            size * 0.84
        );


        ctx.fillStyle =
            "#493878";

        ctx.fillRect(
            x + size * 0.14,
            y + size * 0.14,
            size * 0.72,
            size * 0.25
        );


        ctx.fillStyle =
            "#30245a";

        ctx.fillRect(
            x + size * 0.14,
            y + size * 0.48,
            size * 0.72,
            size * 0.34
        );
    }


    drawGoal(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.save();


        ctx.shadowColor =
            "#42d6d1";

        ctx.shadowBlur =
            size * 0.25;


        ctx.fillStyle =
            "#42d6d1";


        ctx.beginPath();

        ctx.moveTo(
            x + size * 0.5,
            y + size * 0.12
        );

        ctx.lineTo(
            x + size * 0.78,
            y + size * 0.5
        );

        ctx.lineTo(
            x + size * 0.5,
            y + size * 0.88
        );

        ctx.lineTo(
            x + size * 0.22,
            y + size * 0.5
        );

        ctx.closePath();

        ctx.fill();


        ctx.fillStyle =
            "#d9ffff";


        ctx.beginPath();

        ctx.moveTo(
            x + size * 0.5,
            y + size * 0.22
        );

        ctx.lineTo(
            x + size * 0.62,
            y + size * 0.5
        );

        ctx.lineTo(
            x + size * 0.5,
            y + size * 0.64
        );

        ctx.closePath();

        ctx.fill();


        ctx.restore();
    }


    drawObject(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#f4d75e";

        ctx.fillRect(
            x + size * 0.28,
            y + size * 0.28,
            size * 0.44,
            size * 0.44
        );


        ctx.fillStyle =
            "#ee9147";

        ctx.fillRect(
            x + size * 0.38,
            y + size * 0.18,
            size * 0.24,
            size * 0.12
        );
    }


    drawDeposit(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.strokeStyle =
            "#f4d75e";

        ctx.lineWidth =
            Math.max(
                2,
                size * 0.08
            );


        ctx.strokeRect(
            x + size * 0.2,
            y + size * 0.2,
            size * 0.6,
            size * 0.6
        );


        ctx.fillStyle =
            "#f4d75e";

        ctx.fillRect(
            x + size * 0.4,
            y + size * 0.4,
            size * 0.2,
            size * 0.2
        );
    }


    drawButton(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            x + size * 0.2,
            y + size * 0.55,
            size * 0.6,
            size * 0.2
        );


        ctx.fillStyle =
            "#dc4d9b";

        ctx.fillRect(
            x + size * 0.28,
            y + size * 0.38,
            size * 0.44,
            size * 0.22
        );
    }


    drawDoor(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            x + size * 0.18,
            y + size * 0.08,
            size * 0.64,
            size * 0.84
        );


        ctx.fillStyle =
            "#dc4d9b";


        for (
            let i = 0;
            i < 3;
            i++
        ) {

            ctx.fillRect(
                x
                +
                size
                *
                (
                    0.27
                    +
                    i * 0.18
                ),

                y + size * 0.14,

                size * 0.08,

                size * 0.72
            );
        }
    }


    drawDirt(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#8c6247";


        ctx.fillRect(
            x + size * 0.25,
            y + size * 0.55,
            size * 0.18,
            size * 0.13
        );


        ctx.fillRect(
            x + size * 0.48,
            y + size * 0.34,
            size * 0.22,
            size * 0.16
        );


        ctx.fillRect(
            x + size * 0.58,
            y + size * 0.63,
            size * 0.12,
            size * 0.1
        );
    }


    drawBox(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            x + size * 0.16,
            y + size * 0.16,
            size * 0.68,
            size * 0.68
        );


        ctx.fillStyle =
            "#ee9147";

        ctx.fillRect(
            x + size * 0.22,
            y + size * 0.22,
            size * 0.56,
            size * 0.56
        );


        ctx.fillStyle =
            "#f4d75e";

        ctx.fillRect(
            x + size * 0.45,
            y + size * 0.22,
            size * 0.1,
            size * 0.56
        );
    }


    drawCharger(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#42d6d1";

        ctx.fillRect(
            x + size * 0.2,
            y + size * 0.2,
            size * 0.6,
            size * 0.6
        );


        ctx.fillStyle =
            "#100d1c";


        ctx.beginPath();

        ctx.moveTo(
            x + size * 0.56,
            y + size * 0.25
        );

        ctx.lineTo(
            x + size * 0.36,
            y + size * 0.53
        );

        ctx.lineTo(
            x + size * 0.5,
            y + size * 0.53
        );

        ctx.lineTo(
            x + size * 0.42,
            y + size * 0.75
        );

        ctx.lineTo(
            x + size * 0.68,
            y + size * 0.43
        );

        ctx.lineTo(
            x + size * 0.53,
            y + size * 0.43
        );

        ctx.closePath();

        ctx.fill();
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

        const size =
            this.cellSize;


        const x =
            this.gridX
            +
            robot.col * size;

        const y =
            this.gridY
            +
            robot.row * size;


        const ctx =
            this.ctx;


        // Ombre
        ctx.fillStyle =
            "rgba(0, 0, 0, 0.35)";

        ctx.fillRect(
            x + size * 0.25,
            y + size * 0.75,
            size * 0.5,
            size * 0.1
        );


        // Corps noir extérieur
        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            x + size * 0.2,
            y + size * 0.18,
            size * 0.6,
            size * 0.6
        );


        // Corps blanc
        ctx.fillStyle =
            "#f4f5f8";

        ctx.fillRect(
            x + size * 0.25,
            y + size * 0.22,
            size * 0.5,
            size * 0.5
        );


        // Visage
        ctx.fillStyle =
            "#171329";

        ctx.fillRect(
            x + size * 0.3,
            y + size * 0.32,
            size * 0.4,
            size * 0.22
        );


        // Yeux
        ctx.fillStyle =
            "#42d6d1";

        ctx.fillRect(
            x + size * 0.36,
            y + size * 0.38,
            size * 0.08,
            size * 0.07
        );


        ctx.fillRect(
            x + size * 0.56,
            y + size * 0.38,
            size * 0.08,
            size * 0.07
        );


        // Indicateur de direction
        this.drawDirectionIndicator(
            x,
            y,
            size,
            robot.direction
        );
    }


    drawDirectionIndicator(
        x,
        y,
        size,
        direction
    ) {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#f4d75e";


        const centerX =
            x + size * 0.5;

        const centerY =
            y + size * 0.5;


        ctx.beginPath();


        switch (direction) {

            case "north":

                ctx.moveTo(
                    centerX,
                    y + size * 0.08
                );

                ctx.lineTo(
                    centerX - size * 0.09,
                    y + size * 0.18
                );

                ctx.lineTo(
                    centerX + size * 0.09,
                    y + size * 0.18
                );

                break;


            case "south":

                ctx.moveTo(
                    centerX,
                    y + size * 0.92
                );

                ctx.lineTo(
                    centerX - size * 0.09,
                    y + size * 0.82
                );

                ctx.lineTo(
                    centerX + size * 0.09,
                    y + size * 0.82
                );

                break;


            case "west":

                ctx.moveTo(
                    x + size * 0.08,
                    centerY
                );

                ctx.lineTo(
                    x + size * 0.18,
                    centerY - size * 0.09
                );

                ctx.lineTo(
                    x + size * 0.18,
                    centerY + size * 0.09
                );

                break;


            default:

                ctx.moveTo(
                    x + size * 0.92,
                    centerY
                );

                ctx.lineTo(
                    x + size * 0.82,
                    centerY - size * 0.09
                );

                ctx.lineTo(
                    x + size * 0.82,
                    centerY + size * 0.09
                );

                break;
        }


        ctx.closePath();
        ctx.fill();
    }


    // =====================================================
    // MODALE
    // =====================================================

    showMessage(
        title,
        message,
        options = {}
    ) {

        if (
            !this.modalBackground
            ||
            !this.messageModal
        ) {

            return;
        }


        if (this.modalLabel) {

            this.modalLabel.textContent =
                options.label
                || "PYT";
        }


        if (this.modalTitle) {

            this.modalTitle.textContent =
                title;
        }


        if (this.modalMessage) {

            this.modalMessage.textContent =
                message;
        }


        const primaryText =
            options.primaryText
            || "CONTINUER";


        if (this.modalPrimaryButton) {

            this.modalPrimaryButton.textContent =
                primaryText;


            this.modalPrimaryButton.onclick =
                () => {

                    this.closeMessage();


                    if (
                        typeof options.primaryAction
                        === "function"
                    ) {

                        options.primaryAction();
                    }
                };
        }


        if (this.modalSecondaryButton) {

            if (
                options.secondaryText
            ) {

                this.modalSecondaryButton.textContent =
                    options.secondaryText;


                this.modalSecondaryButton.classList.remove(
                    "hidden"
                );


                this.modalSecondaryButton.onclick =
                    () => {

                        this.closeMessage();


                        if (
                            typeof options.secondaryAction
                            === "function"
                        ) {

                            options.secondaryAction();
                        }
                    };

            } else {

                this.modalSecondaryButton.classList.add(
                    "hidden"
                );


                this.modalSecondaryButton.onclick =
                    null;
            }
        }


        this.modalBackground.classList.remove(
            "hidden"
        );


        this.messageModal.classList.remove(
            "hidden"
        );
    }


    closeMessage() {

        if (this.modalBackground) {

            this.modalBackground.classList.add(
                "hidden"
            );
        }


        if (this.messageModal) {

            this.messageModal.classList.add(
                "hidden"
            );
        }
    }

}


// =========================================================
// EXPOSITION GLOBALE
// =========================================================

window.PytUI = PytUI;