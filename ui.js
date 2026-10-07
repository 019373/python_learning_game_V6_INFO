"use strict";

/*
============================================================
PYT - ui.js
Interface navigateur
============================================================
*/

class PytUI {

    constructor() {

        this.game = null;
        this.level = null;

        this.currentChapter = 1;
        this.currentExercise = 1;

        this.completedLevels = new Set();
        this.unlockedLevels = new Set(["1-1"]);
        this.seenCourses = new Set();

        this.attempts = new Map();

        this.actionDelay = 500;

        this.animationStopped = false;
        this.animationRunning = false;

        this.onRunCode = null;
        this.onRestart = null;
        this.onSelectLevel = null;

        this.savedExerciseCode = Object.create(null);

        this.reviewingTheory = false;
        this.reviewCode = "";
        this.reviewChapter = null;
        this.reviewExercise = null;

        this.currentGuideTimeout = null;

        this.cacheElements();
        this.installEvents();
        this.installCodeWindowDrag();

        this.updateProgress();
        this.updateMap();
    }


    // =====================================================
    // DOM
    // =====================================================

    el(id) {
        return document.getElementById(id);
    }


    cacheElements() {

        this.gameScreen =
            this.el("game-screen");

        this.canvas =
            this.el("game-canvas");

        this.ctx =
            this.canvas
                ? this.canvas.getContext("2d")
                : null;


        this.courseScreen =
            this.el("course-screen");

        this.mapScreen =
            this.el("map-screen");


        this.courseButton =
            this.el("course-button");

        this.mapButton =
            this.el("map-button");

        this.courseMapButton =
            this.el("course-map-button");

        this.mapCourseButton =
            this.el("map-course-button");


        this.previousChapterButton =
            this.el("previous-chapter-button");

        this.nextChapterButton =
            this.el("next-chapter-button");

        this.mapChapterIndicator =
            this.el("map-chapter-indicator");

        this.mapBackground =
            this.el("map-background");

        this.mapDecoration =
            this.el("map-decoration");


        this.levelTitle =
            this.el("level-title");

        this.levelDescription =
            this.el("level-description");

        this.levelObjective =
            this.el("level-objective");

        this.gameStatus =
            this.el("game-status");

        this.roomName =
            this.el("room-name");


        this.chapterBadge =
            this.el("chapter-badge");

        this.exerciseBadge =
            this.el("exercise-badge");


        this.codeWindow =
            this.el("code-window");

        this.codeWindowHeader =
            this.el("code-window-header");

        this.codeEditor =
            this.el("code-editor");

        this.codeEditorWrapper =
            this.el("code-editor-wrapper");

        this.codeErrorHighlights =
            this.el("code-error-highlights");

        this.consoleOutput =
            this.el("console-output");


        this.runCodeButton =
            this.el("run-code-button");

        this.restartButton =
            this.el("restart-button");

        this.closeCodeButton =
            this.el("close-code-button");

        this.openCodeButton =
            this.el("open-code-button");


        this.pytGuide =
            this.el("pyt-guide");

        this.pytGuideMessage =
            this.el("pyt-guide-message");

        this.pytGuideActions =
            this.el("pyt-guide-actions");


        this.robotThoughtBubble =
            this.el("robot-thought-bubble");


        this.modalBackground =
            this.el("modal-background");

        this.messageModal =
            this.el("message-modal");

        this.modalTitle =
            this.el("modal-title");

        this.modalMessage =
            this.el("modal-message");

        this.modalPrimaryButton =
            this.el("modal-primary-button");

        this.modalSecondaryButton =
            this.el("modal-secondary-button");
    }


    // =====================================================
    // ÉVÉNEMENTS
    // =====================================================

    installEvents() {

        this.courseButton
            ?.addEventListener(
                "click",
                () => {
                    this.showCourse();
                }
            );


        this.mapButton
            ?.addEventListener(
                "click",
                () => {
                    this.showMap();
                }
            );


        this.courseMapButton
            ?.addEventListener(
                "click",
                () => {

                    if (this.reviewingTheory) {

                        this.returnFromTheoryReview();
                        return;
                    }

                    this.showMap();
                }
            );


        this.mapCourseButton
            ?.addEventListener(
                "click",
                () => {
                    this.showCourse();
                }
            );


        this.previousChapterButton
            ?.addEventListener(
                "click",
                () => {
                    this.changeMapChapter(-1);
                }
            );


        this.nextChapterButton
            ?.addEventListener(
                "click",
                () => {
                    this.changeMapChapter(1);
                }
            );


        this.runCodeButton
            ?.addEventListener(
                "click",
                () => {
                    this.requestRunCode();
                }
            );


        this.restartButton
            ?.addEventListener(
                "click",
                () => {

                    this.stopAnimation();
                    this.hideThought();
                    this.clearCodeErrorHighlight();

                    if (
                        typeof this.onRestart
                        === "function"
                    ) {
                        this.onRestart();
                    }
                }
            );


        this.closeCodeButton
            ?.addEventListener(
                "click",
                () => {
                    this.closeCodeWindow();
                }
            );


        this.openCodeButton
            ?.addEventListener(
                "click",
                () => {
                    this.openCodeWindow();
                }
            );


        this.codeEditor
            ?.addEventListener(
                "input",
                () => {

                    this.saveCurrentCode();
                    this.clearCodeErrorHighlight();
                }
            );


        document
            .querySelectorAll(
                ".level-node"
            )
            .forEach(
                node => {

                    node.addEventListener(
                        "click",
                        () => {

                            const exercise =
                                Number(
                                    node.dataset.exercise
                                    ||
                                    node.dataset.level
                                );

                            if (
                                Number.isInteger(exercise)
                            ) {
                                this.selectExercise(
                                    this.currentChapter,
                                    exercise
                                );
                            }
                        }
                    );
                }
            );


        window.addEventListener(
            "resize",
            () => {
                this.drawWorld();
            }
        );
    }


    // =====================================================
    // GAME / LEVEL
    // =====================================================

    setGame(game) {

        this.game = game;

        this.drawWorld();
    }


    setLevel(level) {

        this.level = level;

        if (!level) {
            return;
        }


        if (this.levelTitle) {

            this.levelTitle.textContent =
                level.title
                ||
                `Exercice ${this.currentExercise}`;
        }


        if (this.levelDescription) {

            this.levelDescription.textContent =
                level.description
                ||
                level.mission
                ||
                "";
        }


        if (this.levelObjective) {

            this.levelObjective.textContent =
                level.objectiveText
                ||
                level.objectiveDescription
                ||
                level.mission
                ||
                "Termine la mission.";
        }


        if (this.roomName) {

            this.roomName.textContent =
                level.room
                ||
                this.getChapterRoom(
                    this.currentChapter
                );
        }


        this.updateProgress();
        this.restoreCurrentCode();
        this.clearCodeErrorHighlight();
        this.hideThought();

        this.drawWorld();
    }


    // =====================================================
    // ÉCRANS
    // =====================================================

    hideMainScreens() {

        this.gameScreen
            ?.classList
            .add("hidden");

        this.courseScreen
            ?.classList
            .add("hidden");

        this.mapScreen
            ?.classList
            .add("hidden");
    }


    showGame() {

        this.hideMainScreens();

        this.gameScreen
            ?.classList
            .remove("hidden");

        this.openCodeWindow();

        this.updateProgress();
        this.drawWorld();

        this.showGuide(
            "Écris ton programme puis appuie sur EXÉCUTER. Je suivrai exactement tes instructions."
        );
    }


    showMap() {

        this.stopAnimation();

        this.hideMainScreens();

        this.mapScreen
            ?.classList
            .remove("hidden");

        this.closeCodeWindow();

        this.updateMap();

        this.showGuide(
            "Clique sur un exercice pour le lancer. Tu peux aussi revenir aux chapitres déjà débloqués."
        );
    }


    showCourse(chapter = this.currentChapter) {

        this.currentChapter =
            Math.max(
                1,
                Math.min(
                    9,
                    Number(chapter) || 1
                )
            );

        this.hideMainScreens();

        this.courseScreen
            ?.classList
            .remove("hidden");

        this.closeCodeWindow();

        this.seenCourses.add(
            this.currentChapter
        );

        this.renderCourse();

        this.showGuide(
            `Voici la théorie du chapitre ${this.currentChapter}. Lis-la tranquillement avant de continuer.`
        );

        return true;
    }


    showCourseAtChapterStart(chapter) {

        const number =
            Number(chapter);

        if (
            this.seenCourses.has(number)
        ) {
            return false;
        }

        this.showCourse(number);

        return true;
    }


    // =====================================================
    // THÉORIE
    // =====================================================

    renderCourse() {

        const course =
            typeof getCourse === "function"
                ? getCourse(
                    this.currentChapter
                )
                : null;


        const title =
            this.el("course-title");

        const content =
            this.el("course-content");


        if (title) {

            title.textContent =
                course?.title
                ||
                this.getChapterTitle(
                    this.currentChapter
                );
        }


        if (!content) {
            return;
        }


        if (course?.html) {

            content.innerHTML =
                course.html;

            return;
        }


        if (course?.content) {

            if (
                Array.isArray(
                    course.content
                )
            ) {

                content.innerHTML =
                    course.content
                        .map(
                            paragraph =>
                                `<p>${this.escapeHTML(paragraph)}</p>`
                        )
                        .join("");

            } else {

                content.textContent =
                    course.content;
            }

            return;
        }


        content.innerHTML =
            this.defaultCourseHTML(
                this.currentChapter
            );
    }


    defaultCourseHTML(chapter) {

        const courses = {

            1: `
                <h3>Déplacer Pyt</h3>
                <p>
                    Pyt avance case par case.
                </p>
                <pre>forward(1)</pre>
                <p>
                    Pour reculer :
                </p>
                <pre>backward(1)</pre>
                <p>
                    Pour tourner :
                </p>
                <pre>right(90)
left(90)</pre>
                <p>
                    Une rotation change la direction de Pyt,
                    mais pas sa position.
                </p>
            `,

            2: `
                <h3>Variables</h3>
                <p>
                    Une variable permet de mémoriser une valeur.
                </p>
                <pre>distance = 3
forward(distance)</pre>
                <p>
                    Tu peux effectuer des calculs :
                </p>
                <pre>distance = 2 + 2
forward(distance)</pre>
            `,

            3: `
                <h3>Conditions</h3>
                <p>
                    Une condition permet de choisir.
                </p>
                <pre>distance = 3

if distance > 2:
    forward(distance)
else:
    forward(1)</pre>
                <p>
                    Tu peux utiliser <code>if</code>,
                    <code>elif</code>, <code>else</code>,
                    <code>and</code>, <code>or</code> et
                    <code>not</code>.
                </p>
            `,

            4: `
                <h3>Boucle for</h3>
                <p>
                    Une boucle <code>for</code> répète
                    des instructions.
                </p>
                <pre>for i in range(4):
    forward(1)</pre>
                <p>
                    <code>range(4)</code> produit quatre passages
                    dans la boucle.
                </p>
            `,

            5: `
                <h3>Boucle while</h3>
                <p>
                    <code>while</code> répète tant qu'une
                    condition est vraie.
                </p>
                <pre>distance = 0

while distance < 4:
    forward(1)
    distance += 1</pre>
                <p>
                    <code>break</code> permet de sortir
                    d'une boucle.
                </p>
            `,

            6: `
                <h3>Listes</h3>
                <p>
                    Une liste contient plusieurs valeurs.
                </p>
                <pre>trajet = [2, 1, 3]

for distance in trajet:
    forward(distance)</pre>
                <p>
                    Tu peux ajouter une valeur avec
                    <code>append()</code>.
                </p>
            `,

            7: `
                <h3>Fonctions</h3>
                <p>
                    Une fonction permet de réutiliser
                    une série d'instructions.
                </p>
                <pre>def avance(distance):
    forward(distance)

avance(3)</pre>
                <p>
                    Une fonction peut avoir des paramètres
                    et retourner une valeur avec
                    <code>return</code>.
                </p>
            `,

            8: `
                <h3>Combiner les notions</h3>
                <p>
                    Tu connais maintenant les déplacements,
                    variables, conditions, boucles,
                    listes et fonctions.
                </p>
                <p>
                    Les missions vont demander de choisir
                    les bons outils et de les combiner.
                </p>
            `,

            9: `
                <h3>Épreuve finale</h3>
                <p>
                    Aucun nouveau concept ici.
                </p>
                <p>
                    Tu dois utiliser ce que tu as appris
                    pendant les huit chapitres précédents.
                </p>
                <p>
                    Il peut exister plusieurs programmes
                    corrects : c'est le résultat de la mission
                    qui compte.
                </p>
            `
        };


        return (
            courses[chapter]
            ||
            "<p>Théorie du chapitre.</p>"
        );
    }


    // =====================================================
    // RETOUR APRÈS RÉVISION
    // =====================================================

    reviewTheory() {

        this.reviewingTheory = true;

        this.reviewCode =
            this.codeEditor?.value
            ||
            "";

        this.reviewChapter =
            this.currentChapter;

        this.reviewExercise =
            this.currentExercise;

        this.showCourse(
            this.currentChapter
        );


        if (this.courseMapButton) {

            this.courseMapButton.textContent =
                "RETOURNER À L'EXERCICE";
        }
    }


    returnFromTheoryReview() {

        if (!this.reviewingTheory) {

            this.showMap();
            return;
        }


        this.currentChapter =
            this.reviewChapter;

        this.currentExercise =
            this.reviewExercise;


        this.reviewingTheory =
            false;


        if (this.courseMapButton) {

            this.courseMapButton.textContent =
                "CARTE";
        }


        this.showGame();


        if (this.codeEditor) {

            this.codeEditor.value =
                this.reviewCode;
        }


        this.saveCurrentCode();


        this.showGuide(
            "Tu es revenu au même exercice. Ton code a été conservé."
        );
    }


    // =====================================================
    // CARTE
    // =====================================================

    changeMapChapter(direction) {

        const target =
            this.currentChapter
            +
            Number(direction);


        if (
            target < 1
            ||
            target > 9
        ) {
            return;
        }


        if (
            target >
            this.getHighestUnlockedChapter()
        ) {

            this.showGuide(
                "Ce chapitre n'est pas encore débloqué."
            );

            return;
        }


        this.currentChapter =
            target;

        this.updateMap();
    }


    updateMap() {

        this.updateMapTheme();
        this.updateMapNodes();


        if (
            this.mapChapterIndicator
        ) {

            this.mapChapterIndicator.textContent =
                `Chapitre ${this.currentChapter} / 9 — ${
                    this.getChapterTitle(
                        this.currentChapter
                    )
                }`;
        }


        if (
            this.previousChapterButton
        ) {

            this.previousChapterButton.disabled =
                this.currentChapter <= 1;
        }


        if (
            this.nextChapterButton
        ) {

            this.nextChapterButton.disabled =
                (
                    this.currentChapter >= 9
                    ||
                    this.currentChapter
                    >=
                    this.getHighestUnlockedChapter()
                );
        }
    }


    updateMapNodes() {

        document
            .querySelectorAll(
                ".level-node"
            )
            .forEach(
                node => {

                    const exercise =
                        Number(
                            node.dataset.exercise
                            ||
                            node.dataset.level
                        );


                    if (
                        !Number.isInteger(exercise)
                    ) {
                        return;
                    }


                    const key =
                        `${this.currentChapter}-${exercise}`;


                    node.dataset.chapter =
                        String(
                            this.currentChapter
                        );


                    node.classList.toggle(
                        "completed",
                        this.completedLevels.has(
                            key
                        )
                    );


                    node.classList.toggle(
                        "locked",
                        !this.unlockedLevels.has(
                            key
                        )
                    );


                    node.disabled =
                        !this.unlockedLevels.has(
                            key
                        );


                    const label =
                        node.querySelector(
                            ".level-label"
                        );


                    if (label) {

                        label.textContent =
                            exercise === 1
                                ? "FACILE"
                                : exercise === 2
                                    ? "MOYEN"
                                    : "DIFFICILE";
                    }
                }
            );
    }


    updateMapTheme() {

        if (
            this.mapBackground
        ) {

            for (
                let chapter = 1;
                chapter <= 9;
                chapter++
            ) {

                this.mapBackground
                    .classList
                    .remove(
                        `chapter-theme-${chapter}`
                    );
            }


            this.mapBackground
                .classList
                .add(
                    `chapter-theme-${this.currentChapter}`
                );
        }


        if (
            this.mapDecoration
        ) {

            this.mapDecoration.innerHTML =
                this.getMapDecoration(
                    this.currentChapter
                );
        }
    }


    getMapDecoration(chapter) {

        const decorations = {

            1: `
                <span class="map-decor decor-book">📚</span>
                <span class="map-decor decor-pencil">✏️</span>
                <span class="map-decor decor-lamp">💡</span>
            `,

            2: `
                <span class="map-decor decor-box">📦</span>
                <span class="map-decor decor-ruler">📏</span>
                <span class="map-decor decor-calculator">🧮</span>
            `,

            3: `
                <span class="map-decor decor-door">🚪</span>
                <span class="map-decor decor-key">🔑</span>
                <span class="map-decor decor-switch">🔘</span>
            `,

            4: `
                <span class="map-decor decor-plant">🪴</span>
                <span class="map-decor decor-table">🪑</span>
                <span class="map-decor decor-loop">↻</span>
            `,

            5: `
                <span class="map-decor decor-clock">⏰</span>
                <span class="map-decor decor-battery">🔋</span>
                <span class="map-decor decor-loop">↻</span>
            `,

            6: `
                <span class="map-decor decor-shelf">🗄️</span>
                <span class="map-decor decor-books">📚</span>
                <span class="map-decor decor-list">📋</span>
            `,

            7: `
                <span class="map-decor decor-tools">🧰</span>
                <span class="map-decor decor-gear">⚙️</span>
                <span class="map-decor decor-function">ƒ</span>
            `,

            8: `
                <span class="map-decor decor-house">🏠</span>
                <span class="map-decor decor-gear">⚙️</span>
                <span class="map-decor decor-star">⭐</span>
            `,

            9: `
                <span class="map-decor decor-trophy">🏆</span>
                <span class="map-decor decor-star">⭐</span>
                <span class="map-decor decor-robot">🤖</span>
            `
        };


        return (
            decorations[chapter]
            ||
            ""
        );
    }


    // =====================================================
    // CHAPITRES
    // =====================================================

    getChapterTitle(chapter) {

        const titles = {
            1: "Premiers déplacements",
            2: "Variables",
            3: "Conditions",
            4: "Boucle for",
            5: "Boucle while",
            6: "Listes",
            7: "Fonctions",
            8: "Combinaison",
            9: "Épreuve finale"
        };

        return (
            titles[chapter]
            ||
            `Chapitre ${chapter}`
        );
    }


    getChapterRoom(chapter) {

        const rooms = {
            1: "Bureau",
            2: "Atelier",
            3: "Entrée",
            4: "Salon",
            5: "Buanderie",
            6: "Bibliothèque",
            7: "Garage",
            8: "Maison",
            9: "Laboratoire final"
        };

        return (
            rooms[chapter]
            ||
            "Maison de Pyt"
        );
    }


    getHighestUnlockedChapter() {

        let highest = 1;

        for (
            const key
            of this.unlockedLevels
        ) {

            const chapter =
                Number(
                    key.split("-")[0]
                );

            if (
                chapter > highest
            ) {
                highest = chapter;
            }
        }

        return highest;
    }


    // =====================================================
    // SÉLECTION EXERCICE
    // =====================================================

    selectExercise(
        chapter,
        exercise
    ) {

        const key =
            `${chapter}-${exercise}`;


        if (
            !this.unlockedLevels.has(
                key
            )
        ) {

            this.showGuide(
                "Cet exercice est encore verrouillé."
            );

            return;
        }


        this.saveCurrentCode();


        this.currentChapter =
            Number(chapter);

        this.currentExercise =
            Number(exercise);


        this.clearConsole();
        this.clearCodeErrorHighlight();
        this.hideThought();


        if (
            typeof this.onSelectLevel
            === "function"
        ) {

            this.onSelectLevel(
                this.currentChapter,
                this.currentExercise
            );
        }


        this.restoreCurrentCode();
    }


    // =====================================================
    // PROGRESSION
    // =====================================================

    completeCurrentLevel() {

        const chapter =
            this.currentChapter;

        const exercise =
            this.currentExercise;

        const key =
            `${chapter}-${exercise}`;


        this.completedLevels.add(
            key
        );


        if (
            exercise < 3
        ) {

            this.unlockedLevels.add(
                `${chapter}-${exercise + 1}`
            );

        } else if (
            chapter < 9
        ) {

            this.unlockedLevels.add(
                `${chapter + 1}-1`
            );
        }


        this.updateProgress();
        this.updateMap();


        if (
            chapter === 9
            &&
            exercise === 3
        ) {

            this.showGuide(
                "Mission accomplie ! Tu as terminé le parcours principal de PYT !"
            );

            this.showMessage(
                "PARCOURS TERMINÉ !",
                "Bravo ! Tu as terminé les neuf chapitres de PYT.",
                {
                    primaryText:
                        "RETOURNER À LA CARTE",

                    primaryAction:
                        () => {
                            this.showMap();
                        }
                }
            );

            return;
        }


        this.showGuide(
            "Bravo ! Mission réussie. Le prochain exercice est maintenant débloqué."
        );


        this.showMessage(
            "MISSION RÉUSSIE !",
            "Bravo ! Tu peux continuer ou rejouer cet exercice.",
            {
                primaryText:
                    "CONTINUER",

                primaryAction:
                    () => {

                        if (
                            exercise < 3
                        ) {

                            this.selectExercise(
                                chapter,
                                exercise + 1
                            );

                        } else {

                            this.currentChapter =
                                Math.min(
                                    9,
                                    chapter + 1
                                );

                            const opened =
                                this.showCourseAtChapterStart(
                                    this.currentChapter
                                );

                            if (!opened) {
                                this.showMap();
                            }
                        }
                    },

                secondaryText:
                    "CARTE",

                secondaryAction:
                    () => {
                        this.showMap();
                    }
            }
        );
    }


    updateProgress() {

        if (
            this.chapterBadge
        ) {

            this.chapterBadge.textContent =
                `CHAPITRE ${this.currentChapter}`;
        }


        if (
            this.exerciseBadge
        ) {

            this.exerciseBadge.textContent =
                `EXERCICE ${this.currentExercise}/3`;
        }
    }


    // =====================================================
    // CODE
    // =====================================================

    getCurrentLevelKey() {

        return (
            `${this.currentChapter}-${this.currentExercise}`
        );
    }


    saveCurrentCode() {

        if (
            !this.codeEditor
        ) {
            return;
        }


        this.savedExerciseCode[
            this.getCurrentLevelKey()
        ] =
            this.codeEditor.value;
    }


    restoreCurrentCode() {

        if (
            !this.codeEditor
        ) {
            return;
        }


        const key =
            this.getCurrentLevelKey();


        if (
            Object.prototype
                .hasOwnProperty
                .call(
                    this.savedExerciseCode,
                    key
                )
        ) {

            this.codeEditor.value =
                this.savedExerciseCode[key];

            return;
        }


        this.codeEditor.value =
            this.level?.starterCode
            ||
            this.level?.code
            ||
            "";
    }


    requestRunCode() {

        if (
            this.animationRunning
        ) {

            this.showGuide(
                "Attends que j'aie terminé le programme en cours."
            );

            return;
        }


        const code =
            this.codeEditor?.value
            ||
            "";


        this.saveCurrentCode();
        this.hideThought();
        this.clearCodeErrorHighlight();


        const key =
            this.getCurrentLevelKey();


        this.attempts.set(
            key,
            (
                this.attempts.get(key)
                ||
                0
            )
            +
            1
        );


        if (
            typeof this.onRunCode
            === "function"
        ) {

            this.onRunCode(
                code
            );
        }
    }


    // =====================================================
    // ERREURS / TENTATIVES
    // =====================================================

    handleFailedAttempt(details = {}) {

        const key =
            this.getCurrentLevelKey();

        const attempt =
            this.attempts.get(key)
            ||
            1;


        const message =
            details.message
            ||
            "La mission n'est pas encore terminée.";


        /*
        Première erreur :
        pas de soulignement rouge.
        On propose d'abord la théorie.
        */

        if (
            attempt <= 1
        ) {

            this.clearCodeErrorHighlight();


            this.showGuide(
                `${message} Tu peux revoir la théorie avant de réessayer.`,
                [
                    {
                        label:
                            "REVOIR LA THÉORIE",

                        action:
                            () => {
                                this.reviewTheory();
                            }
                    },

                    {
                        label:
                            "RÉESSAYER",

                        action:
                            () => {
                                this.openCodeWindow();
                            }
                    }
                ]
            );

            return;
        }


        /*
        À partir de la deuxième tentative,
        on souligne uniquement si une ligne
        réellement identifiable est fournie.
        */

        if (
            Number.isInteger(
                details.line
            )
            &&
            details.line > 0
        ) {

            this.highlightCodeLine(
                details.line
            );


            this.showGuide(
                `${message} Regarde la ligne ${details.line} : c'est là que j'ai détecté un problème.`
            );

        } else {

            this.clearCodeErrorHighlight();


            this.showGuide(
                `${message} Ton code peut être syntaxiquement correct : observe surtout le résultat de mon déplacement.`
            );
        }
    }


    // =====================================================
    // SOULIGNEMENT CODE
    // =====================================================

    clearCodeErrorHighlight() {

        if (
            this.codeErrorHighlights
        ) {

            this.codeErrorHighlights.innerHTML =
                "";
        }


        this.codeEditor
            ?.classList
            .remove(
                "has-code-error"
            );
    }


    highlightCodeLine(lineNumber) {

        this.clearCodeErrorHighlight();


        if (
            !this.codeEditor
            ||
            !this.codeErrorHighlights
        ) {
            return;
        }


        const lines =
            this.codeEditor
                .value
                .split("\n");


        if (
            lineNumber < 1
            ||
            lineNumber > lines.length
        ) {
            return;
        }


        const computed =
            window.getComputedStyle(
                this.codeEditor
            );


        const lineHeight =
            parseFloat(
                computed.lineHeight
            )
            ||
            20;


        const paddingTop =
            parseFloat(
                computed.paddingTop
            )
            ||
            0;


        const top =
            paddingTop
            +
            (
                lineNumber - 1
            )
            *
            lineHeight
            -
            this.codeEditor.scrollTop;


        const marker =
            document.createElement(
                "div"
            );


        marker.className =
            "code-error-line";


        marker.style.top =
            `${top}px`;


        marker.style.height =
            `${lineHeight}px`;


        this.codeErrorHighlights
            .appendChild(
                marker
            );


        this.codeEditor
            .classList
            .add(
                "has-code-error"
            );
    }


    // =====================================================
    // CODE WINDOW
    // =====================================================

    openCodeWindow() {

        this.codeWindow
            ?.classList
            .remove("hidden");
    }


    closeCodeWindow() {

        this.codeWindow
            ?.classList
            .add("hidden");
    }


    installCodeWindowDrag() {

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


        this.codeWindowHeader
            .addEventListener(
                "pointerdown",
                event => {

                    if (
                        event.target
                            .closest("button")
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


                    this.codeWindowHeader
                        .setPointerCapture?.(
                            event.pointerId
                        );
                }
            );


        window.addEventListener(
            "pointermove",
            event => {

                if (!dragging) {
                    return;
                }


                const maxX =
                    Math.max(
                        0,
                        window.innerWidth
                        -
                        this.codeWindow.offsetWidth
                    );


                const maxY =
                    Math.max(
                        0,
                        window.innerHeight
                        -
                        this.codeWindow.offsetHeight
                    );


                const left =
                    Math.max(
                        0,
                        Math.min(
                            maxX,
                            event.clientX
                            -
                            offsetX
                        )
                    );


                const top =
                    Math.max(
                        0,
                        Math.min(
                            maxY,
                            event.clientY
                            -
                            offsetY
                        )
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
        );


        window.addEventListener(
            "pointerup",
            () => {
                dragging = false;
            }
        );
    }


    // =====================================================
    // ANIMATION
    // =====================================================

    stopAnimation() {

        this.animationStopped =
            true;

        this.animationRunning =
            false;
    }


    async playActions(
        actions,
        performAction,
        onFinished
    ) {

        this.animationStopped =
            false;

        this.animationRunning =
            true;


        let completed = true;
        let failureDetails = null;


        for (
            let index = 0;
            index < actions.length;
            index++
        ) {

            if (
                this.animationStopped
            ) {

                completed = false;

                failureDetails = {
                    reason:
                        "stopped",

                    index,

                    action:
                        actions[index]
                };

                break;
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

                completed = false;

                failureDetails = {
                    reason:
                        "blocked",

                    index,

                    action
                };

                break;
            }


            await this.wait(
                this.actionDelay
            );
        }


        this.animationRunning =
            false;


        this.drawWorld();


        if (
            typeof onFinished
            === "function"
        ) {

            onFinished(
                completed,
                failureDetails
            );
        }
    }


    wait(milliseconds) {

        return new Promise(
            resolve => {

                setTimeout(
                    resolve,
                    milliseconds
                );
            }
        );
    }


    // =====================================================
    // GUIDE PYT
    // =====================================================

    showGuide(
        message,
        actions = []
    ) {

        if (
            !this.pytGuide
            ||
            !this.pytGuideMessage
        ) {

            return;
        }


        this.pytGuideMessage.textContent =
            message;


        if (
            this.pytGuideActions
        ) {

            this.pytGuideActions.innerHTML =
                "";


            for (
                const item
                of actions
            ) {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "guide-action-button";


                button.textContent =
                    item.label;


                button.addEventListener(
                    "click",
                    () => {

                        if (
                            typeof item.action
                            === "function"
                        ) {

                            item.action();
                        }
                    }
                );


                this.pytGuideActions
                    .appendChild(
                        button
                    );
            }
        }


        this.pytGuide
            .classList
            .remove("hidden");
    }


    hideGuide() {

        this.pytGuide
            ?.classList
            .add("hidden");


        if (
            this.pytGuideActions
        ) {

            this.pytGuideActions.innerHTML =
                "";
        }
    }


    // =====================================================
    // BULLE DE PENSÉE
    // =====================================================

    showThought(message) {

        if (
            !this.robotThoughtBubble
        ) {
            return;
        }


        this.robotThoughtBubble.textContent =
            message;


        this.robotThoughtBubble
            .classList
            .remove("hidden");
    }


    hideThought() {

        this.robotThoughtBubble
            ?.classList
            .add("hidden");
    }


    // =====================================================
    // STATUT / CONSOLE
    // =====================================================

    setStatus(text) {

        if (
            this.gameStatus
        ) {

            this.gameStatus.textContent =
                text;
        }
    }


    setConsole(text) {

        if (
            this.consoleOutput
        ) {

            this.consoleOutput.textContent =
                text;
        }
    }


    clearConsole() {

        this.setConsole(
            "Prêt."
        );
    }


    // =====================================================
    // DESSIN
    // =====================================================

    drawWorld() {

        if (
            !this.canvas
            ||
            !this.ctx
            ||
            !this.game
        ) {
            return;
        }


        const rows =
            this.game.rows
            ||
            this.level?.rows
            ||
            this.level?.grid?.length
            ||
            8;


        const cols =
            this.game.cols
            ||
            this.level?.cols
            ||
            this.level?.grid?.[0]?.length
            ||
            10;


        const width =
            this.canvas.clientWidth
            ||
            800;


        const height =
            this.canvas.clientHeight
            ||
            520;


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


        const cell =
            Math.min(
                width / cols,
                height / rows
            );


        const worldWidth =
            cell * cols;

        const worldHeight =
            cell * rows;


        const offsetX =
            (
                width
                -
                worldWidth
            )
            / 2;


        const offsetY =
            (
                height
                -
                worldHeight
            )
            / 2;


        this.ctx.clearRect(
            0,
            0,
            width,
            height
        );


        this.drawRoomBackground(
            width,
            height
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

                const x =
                    offsetX
                    +
                    col * cell;


                const y =
                    offsetY
                    +
                    row * cell;


                this.drawTile(
                    row,
                    col,
                    x,
                    y,
                    cell
                );
            }
        }


        this.drawRobot(
            offsetX,
            offsetY,
            cell
        );
    }


    drawRoomBackground(
        width,
        height
    ) {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#100d25";


        ctx.fillRect(
            0,
            0,
            width,
            height
        );


        /*
        Décoration différente par chapitre.
        Purement visuelle : elle ne modifie pas
        les collisions.
        */

        ctx.save();

        ctx.globalAlpha =
            0.16;


        switch (
            this.currentChapter
        ) {

            case 1:

                this.drawDecorBook(
                    30,
                    30,
                    55
                );

                this.drawDecorLamp(
                    width - 75,
                    35,
                    45
                );

                break;


            case 2:

                this.drawDecorBoxes(
                    30,
                    height - 100,
                    60
                );

                break;


            case 3:

                this.drawDecorDoor(
                    width - 90,
                    25,
                    60
                );

                break;


            case 4:

                this.drawDecorPlant(
                    25,
                    25,
                    55
                );

                break;


            case 5:

                this.drawDecorMachine(
                    width - 100,
                    height - 100,
                    70
                );

                break;


            case 6:

                this.drawDecorShelf(
                    20,
                    20,
                    70
                );

                break;


            case 7:

                this.drawDecorGear(
                    width - 80,
                    30,
                    50
                );

                break;


            case 8:

                this.drawDecorStar(
                    45,
                    45,
                    30
                );

                break;


            case 9:

                this.drawDecorStar(
                    width - 70,
                    45,
                    40
                );

                this.drawDecorStar(
                    35,
                    height - 65,
                    25
                );

                break;
        }


        ctx.restore();
    }


    drawTile(
        row,
        col,
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        const type =
            this.getTileType(
                row,
                col
            );


        ctx.fillStyle =
            (
                (
                    row + col
                )
                % 2
                === 0
            )
                ? "#29254a"
                : "#24203f";


        ctx.fillRect(
            x,
            y,
            size,
            size
        );


        ctx.strokeStyle =
            "rgba(116, 240, 255, 0.12)";


        ctx.lineWidth =
            1;


        ctx.strokeRect(
            x,
            y,
            size,
            size
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
            typeof this.game.getTileType
            === "function"
        ) {

            const result =
                this.game.getTileType(
                    row,
                    col
                );

            if (result) {
                return result;
            }
        }


        const key =
            `${row},${col}`;


        if (
            this.game.walls
            ?.has(key)
        ) {
            return "wall";
        }


        if (
            this.game.objects
            ?.has(key)
        ) {
            return "object";
        }


        if (
            this.game.deposits
            ?.has(key)
        ) {
            return "deposit";
        }


        if (
            this.game.dirt
            ?.has(key)
        ) {
            return "dirt";
        }


        if (
            this.game.boxes
            ?.has(key)
        ) {
            return "box";
        }


        if (
            this.game.buttons
            ?.has(key)
        ) {
            return "button";
        }


        if (
            this.game.doors
            ?.has(key)
        ) {
            return "door";
        }


        if (
            this.game.chargers
            ?.has(key)
        ) {
            return "charger";
        }


        const goal =
            this.level?.goal;


        if (
            Array.isArray(goal)
            &&
            goal[0] === row
            &&
            goal[1] === col
        ) {
            return "goal";
        }


        return "floor";
    }


    // =====================================================
    // TUILES
    // =====================================================

    drawWall(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#171329";


        ctx.fillRect(
            x + 2,
            y + 2,
            size - 4,
            size - 4
        );


        ctx.fillStyle =
            "#41386b";


        ctx.fillRect(
            x + 6,
            y + 6,
            size - 12,
            size - 12
        );


        ctx.strokeStyle =
            "#0b0916";


        ctx.lineWidth =
            3;


        ctx.strokeRect(
            x + 5,
            y + 5,
            size - 10,
            size - 10
        );
    }


    drawGoal(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#ffe76a";


        ctx.beginPath();


        ctx.arc(
            x + size / 2,
            y + size / 2,
            size * 0.25,
            0,
            Math.PI * 2
        );


        ctx.fill();


        ctx.strokeStyle =
            "#ff9d3f";


        ctx.lineWidth =
            Math.max(
                2,
                size * 0.05
            );


        ctx.stroke();
    }


    drawObject(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        const w =
            size * 0.46;


        const h =
            size * 0.34;


        const left =
            x
            +
            (
                size - w
            )
            / 2;


        const top =
            y
            +
            (
                size - h
            )
            / 2;


        ctx.fillStyle =
            "#ff5da2";


        ctx.fillRect(
            left,
            top,
            w,
            h
        );


        ctx.strokeStyle =
            "#0c0918";


        ctx.lineWidth =
            3;


        ctx.strokeRect(
            left,
            top,
            w,
            h
        );


        ctx.fillStyle =
            "#fff3c4";


        ctx.fillRect(
            left + w * 0.16,
            top + h * 0.18,
            w * 0.68,
            h * 0.12
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
            "#52f1e6";


        ctx.lineWidth =
            Math.max(
                3,
                size * 0.07
            );


        ctx.strokeRect(
            x + size * 0.22,
            y + size * 0.22,
            size * 0.56,
            size * 0.56
        );


        ctx.beginPath();


        ctx.moveTo(
            x + size * 0.35,
            y + size * 0.5
        );


        ctx.lineTo(
            x + size * 0.65,
            y + size * 0.5
        );


        ctx.stroke();
    }


    drawDirt(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#8d6246";


        const dots = [
            [0.34, 0.42],
            [0.55, 0.33],
            [0.63, 0.59],
            [0.42, 0.66]
        ];


        for (
            const dot
            of dots
        ) {

            ctx.beginPath();


            ctx.arc(
                x + size * dot[0],
                y + size * dot[1],
                size * 0.08,
                0,
                Math.PI * 2
            );


            ctx.fill();
        }
    }


    drawBox(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#e58b45";


        ctx.fillRect(
            x + size * 0.18,
            y + size * 0.18,
            size * 0.64,
            size * 0.64
        );


        ctx.strokeStyle =
            "#3a1d20";


        ctx.lineWidth =
            3;


        ctx.strokeRect(
            x + size * 0.18,
            y + size * 0.18,
            size * 0.64,
            size * 0.64
        );


        ctx.beginPath();


        ctx.moveTo(
            x + size * 0.18,
            y + size * 0.18
        );


        ctx.lineTo(
            x + size * 0.82,
            y + size * 0.82
        );


        ctx.moveTo(
            x + size * 0.82,
            y + size * 0.18
        );


        ctx.lineTo(
            x + size * 0.18,
            y + size * 0.82
        );


        ctx.stroke();
    }


    drawButton(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#ff5da2";


        ctx.beginPath();


        ctx.arc(
            x + size / 2,
            y + size / 2,
            size * 0.18,
            0,
            Math.PI * 2
        );


        ctx.fill();


        ctx.strokeStyle =
            "#ffffff";


        ctx.lineWidth =
            2;


        ctx.stroke();
    }


    drawDoor(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#49325f";


        ctx.fillRect(
            x + size * 0.25,
            y + size * 0.08,
            size * 0.5,
            size * 0.84
        );


        ctx.strokeStyle =
            "#0b0916";


        ctx.lineWidth =
            3;


        ctx.strokeRect(
            x + size * 0.25,
            y + size * 0.08,
            size * 0.5,
            size * 0.84
        );


        ctx.fillStyle =
            "#ffe76a";


        ctx.beginPath();


        ctx.arc(
            x + size * 0.64,
            y + size * 0.5,
            size * 0.04,
            0,
            Math.PI * 2
        );


        ctx.fill();
    }


    drawCharger(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#52f1e6";


        ctx.fillRect(
            x + size * 0.28,
            y + size * 0.2,
            size * 0.44,
            size * 0.6
        );


        ctx.fillStyle =
            "#151126";


        ctx.beginPath();


        ctx.moveTo(
            x + size * 0.55,
            y + size * 0.28
        );


        ctx.lineTo(
            x + size * 0.4,
            y + size * 0.52
        );


        ctx.lineTo(
            x + size * 0.51,
            y + size * 0.52
        );


        ctx.lineTo(
            x + size * 0.43,
            y + size * 0.72
        );


        ctx.lineTo(
            x + size * 0.64,
            y + size * 0.45
        );


        ctx.lineTo(
            x + size * 0.53,
            y + size * 0.45
        );


        ctx.closePath();
        ctx.fill();
    }


    // =====================================================
    // ROBOT
    // =====================================================

    drawRobot(
        offsetX,
        offsetY,
        cell
    ) {

        const robot =
            this.game?.robot;


        if (!robot) {
            return;
        }


        const row =
            Number(
                robot.row
                ??
                robot.position?.row
                ??
                0
            );


        const col =
            Number(
                robot.col
                ??
                robot.position?.col
                ??
                0
            );


        const x =
            offsetX
            +
            col * cell
            +
            cell / 2;


        const y =
            offsetY
            +
            row * cell
            +
            cell / 2;


        const ctx =
            this.ctx;


        ctx.save();


        ctx.translate(
            x,
            y
        );


        const direction =
            robot.direction
            ||
            "NORTH";


        const rotations = {
            NORTH: 0,
            EAST: Math.PI / 2,
            SOUTH: Math.PI,
            WEST: -Math.PI / 2
        };


        ctx.rotate(
            rotations[direction]
            ??
            0
        );


        const scale =
            cell * 0.62;


        /*
        Corps.
        */

        ctx.fillStyle =
            "#f4f5ff";


        ctx.strokeStyle =
            "#0b0916";


        ctx.lineWidth =
            Math.max(
                2,
                cell * 0.045
            );


        ctx.beginPath();


        ctx.roundRect(
            -scale * 0.32,
            -scale * 0.22,
            scale * 0.64,
            scale * 0.62,
            scale * 0.14
        );


        ctx.fill();
        ctx.stroke();


        /*
        Tête.
        */

        ctx.fillStyle =
            "#ffffff";


        ctx.beginPath();


        ctx.roundRect(
            -scale * 0.4,
            -scale * 0.48,
            scale * 0.8,
            scale * 0.42,
            scale * 0.16
        );


        ctx.fill();
        ctx.stroke();


        /*
        Écran visage.
        */

        ctx.fillStyle =
            "#16142b";


        ctx.beginPath();


        ctx.roundRect(
            -scale * 0.29,
            -scale * 0.39,
            scale * 0.58,
            scale * 0.23,
            scale * 0.08
        );


        ctx.fill();


        /*
        Yeux cyan.
        */

        ctx.fillStyle =
            "#52f1e6";


        ctx.fillRect(
            -scale * 0.18,
            -scale * 0.31,
            scale * 0.1,
            scale * 0.06
        );


        ctx.fillRect(
            scale * 0.08,
            -scale * 0.31,
            scale * 0.1,
            scale * 0.06
        );


        /*
        Indicateur avant.
        */

        ctx.fillStyle =
            "#ff5da2";


        ctx.beginPath();


        ctx.moveTo(
            0,
            -scale * 0.61
        );


        ctx.lineTo(
            -scale * 0.09,
            -scale * 0.49
        );


        ctx.lineTo(
            scale * 0.09,
            -scale * 0.49
        );


        ctx.closePath();
        ctx.fill();


        ctx.restore();
    }


    // =====================================================
    // DÉCORATIONS
    // =====================================================

    drawDecorBook(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#ff5da2";


        ctx.fillRect(
            x,
            y,
            size,
            size * 0.65
        );


        ctx.fillStyle =
            "#ffe76a";


        ctx.fillRect(
            x + size * 0.12,
            y + size * 0.12,
            size * 0.76,
            size * 0.1
        );
    }


    drawDecorLamp(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#ffe76a";


        ctx.beginPath();


        ctx.arc(
            x + size / 2,
            y + size * 0.3,
            size * 0.25,
            0,
            Math.PI * 2
        );


        ctx.fill();


        ctx.fillRect(
            x + size * 0.46,
            y + size * 0.52,
            size * 0.08,
            size * 0.4
        );
    }


    drawDecorBoxes(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#e58b45";


        ctx.fillRect(
            x,
            y + size * 0.35,
            size,
            size * 0.65
        );


        ctx.fillRect(
            x + size * 0.35,
            y,
            size * 0.65,
            size * 0.5
        );
    }


    drawDecorDoor(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#ff5da2";


        ctx.fillRect(
            x,
            y,
            size,
            size * 1.3
        );
    }


    drawDecorPlant(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#52f1e6";


        ctx.beginPath();


        ctx.arc(
            x + size * 0.35,
            y + size * 0.35,
            size * 0.24,
            0,
            Math.PI * 2
        );


        ctx.arc(
            x + size * 0.65,
            y + size * 0.28,
            size * 0.22,
            0,
            Math.PI * 2
        );


        ctx.fill();


        ctx.fillStyle =
            "#e58b45";


        ctx.fillRect(
            x + size * 0.28,
            y + size * 0.58,
            size * 0.44,
            size * 0.35
        );
    }


    drawDecorMachine(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#41386b";


        ctx.fillRect(
            x,
            y,
            size,
            size
        );


        ctx.fillStyle =
            "#52f1e6";


        ctx.beginPath();


        ctx.arc(
            x + size / 2,
            y + size / 2,
            size * 0.3,
            0,
            Math.PI * 2
        );


        ctx.strokeStyle =
            "#52f1e6";


        ctx.lineWidth =
            5;


        ctx.stroke();
    }


    drawDecorShelf(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#e58b45";


        ctx.fillRect(
            x,
            y,
            size,
            size * 1.2
        );


        ctx.fillStyle =
            "#ff5da2";


        ctx.fillRect(
            x + size * 0.1,
            y + size * 0.15,
            size * 0.18,
            size * 0.35
        );


        ctx.fillStyle =
            "#52f1e6";


        ctx.fillRect(
            x + size * 0.34,
            y + size * 0.1,
            size * 0.18,
            size * 0.4
        );


        ctx.fillStyle =
            "#ffe76a";


        ctx.fillRect(
            x + size * 0.58,
            y + size * 0.18,
            size * 0.2,
            size * 0.32
        );
    }


    drawDecorGear(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.strokeStyle =
            "#52f1e6";


        ctx.lineWidth =
            size * 0.16;


        ctx.beginPath();


        ctx.arc(
            x + size / 2,
            y + size / 2,
            size * 0.28,
            0,
            Math.PI * 2
        );


        ctx.stroke();
    }


    drawDecorStar(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.fillStyle =
            "#ffe76a";


        ctx.beginPath();


        for (
            let i = 0;
            i < 10;
            i++
        ) {

            const angle =
                -Math.PI / 2
                +
                i
                *
                Math.PI / 5;


            const radius =
                i % 2 === 0
                    ? size / 2
                    : size / 4;


            const px =
                x
                +
                size / 2
                +
                Math.cos(angle)
                *
                radius;


            const py =
                y
                +
                size / 2
                +
                Math.sin(angle)
                *
                radius;


            if (
                i === 0
            ) {

                ctx.moveTo(
                    px,
                    py
                );

            } else {

                ctx.lineTo(
                    px,
                    py
                );
            }
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
            !this.messageModal
            ||
            !this.modalBackground
        ) {

            return;
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


        const primaryText =
            options.primaryText
            ||
            "CONTINUER";


        if (
            this.modalPrimaryButton
        ) {

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


        if (
            this.modalSecondaryButton
        ) {

            if (
                options.secondaryText
            ) {

                this.modalSecondaryButton.textContent =
                    options.secondaryText;


                this.modalSecondaryButton
                    .classList
                    .remove("hidden");


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

                this.modalSecondaryButton
                    .classList
                    .add("hidden");


                this.modalSecondaryButton.onclick =
                    null;
            }
        }


        this.modalBackground
            .classList
            .remove("hidden");


        this.messageModal
            .classList
            .remove("hidden");
    }


    closeMessage() {

        this.modalBackground
            ?.classList
            .add("hidden");


        this.messageModal
            ?.classList
            .add("hidden");
    }


    // =====================================================
    // UTILITAIRE
    // =====================================================

    escapeHTML(value) {

        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }
}


// =========================================================
// EXPOSITION GLOBALE
// =========================================================

window.PytUI =
    PytUI;