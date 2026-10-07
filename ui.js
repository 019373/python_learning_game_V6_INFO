"use strict";

/* =========================================================
   PYT - ui.js
========================================================= */

class PytUI {

    constructor() {
        this.game = null;
        this.level = null;

        this.currentChapter = 1;
        this.currentExercise = 1;

        this.completedLevels = new Set();
        this.unlockedLevels = new Set(["1-1"]);
        this.seenCourses = new Set();

        this.attempts = {};

        this.actionDelay = 500;

        this.onRunCode = null;
        this.onRestart = null;
        this.onSelectLevel = null;

        this.savedCodeBeforeTheory = "";
        this.returnToExerciseAfterTheory = false;

        this.guideHideTimer = null;

        this.cacheElements();
        this.connectEvents();
        this.prepareCanvas();
        this.updateMobileState();

        window.addEventListener(
            "resize",
            () => {
                this.updateMobileState();
                this.resizeCanvas();
                this.render();
            }
        );
    }


    /* =====================================================
       ÉLÉMENTS
    ===================================================== */

    cacheElements() {
        const $ =
            id =>
                document.getElementById(id);

        this.gameInterface =
            $("game-interface");

        this.gameScreen =
            $("game-screen");

        this.chapterScreen =
            $("chapter-screen");

        this.mapScreen =
            $("map-screen");

        this.canvas =
            $("game-canvas");

        this.ctx =
            this.canvas?.getContext("2d") || null;

        this.roomName =
            $("room-name");

        this.gameStatus =
            $("game-status");

        this.chapterBadge =
            $("chapter-badge");

        this.difficultyBadge =
            $("difficulty-badge");

        this.missionTitle =
            $("mission-title");

        this.missionInstruction =
            $("mission-instruction");

        this.courseButton =
            $("course-button");

        this.mapButton =
            $("map-button");

        this.openCodeButton =
            $("open-code-button");

        this.restartButton =
            $("restart-button");

        this.codeRestartButton =
            $("code-restart-button");

        this.closeCodeButton =
            $("close-code-button");

        this.clearCodeButton =
            $("clear-code-button");

        this.runCodeButton =
            $("run-code-button");

        this.codeWindow =
            $("code-window");

        this.codeWindowHeader =
            $("code-window-header");

        this.codeEditor =
            $("code-editor");

        this.codeEditorWrapper =
            $("code-editor-wrapper");

        this.codeErrorHighlights =
            $("code-error-highlights");

        this.consoleOutput =
            $("console-output");

        this.courseChapterNumber =
            $("course-chapter-number");

        this.courseTitle =
            $("course-title");

        this.courseSubtitle =
            $("course-subtitle");

        this.courseContent =
            $("course-content");

        this.courseMapButton =
            $("course-map-button");

        this.mapBackground =
            $("map-background");

        this.mapTitle =
            $("map-title");

        this.mapSubtitle =
            $("map-subtitle");

        this.mapCourseButton =
            $("map-course-button");

        this.mapDecoration =
            $("map-decoration");

        this.levelNodes = [
            $("level-node-1"),
            $("level-node-2"),
            $("level-node-3")
        ];

        this.previousChapterButton =
            $("previous-chapter-button");

        this.nextChapterButton =
            $("next-chapter-button");

        this.mapChapterIndicator =
            $("map-chapter-indicator");

        this.pytGuide =
            $("pyt-guide");

        this.pytGuideMessage =
            $("pyt-guide-message");

        this.pytGuideActions =
            $("pyt-guide-actions");

        this.closePytGuideButton =
            $("close-pyt-guide-button");

        this.robotThoughtBubble =
            $("robot-thought-bubble");

        this.modalBackground =
            $("modal-background");

        this.messageModal =
            $("message-modal");

        this.modalLabel =
            $("modal-label");

        this.modalTitle =
            $("modal-title");

        this.modalMessage =
            $("modal-message");

        this.modalPrimaryButton =
            $("modal-primary-button");

        this.modalSecondaryButton =
            $("modal-secondary-button");
    }


    /* =====================================================
       ÉVÉNEMENTS
    ===================================================== */

    connectEvents() {
        this.courseButton?.addEventListener(
            "click",
            () =>
                this.reviewTheory()
        );

        this.mapButton?.addEventListener(
            "click",
            () =>
                this.showMap()
        );

        this.openCodeButton?.addEventListener(
            "click",
            () =>
                this.openCode()
        );

        this.closeCodeButton?.addEventListener(
            "click",
            () =>
                this.closeCode()
        );

        this.restartButton?.addEventListener(
            "click",
            () =>
                this.onRestart?.()
        );

        this.codeRestartButton?.addEventListener(
            "click",
            () =>
                this.onRestart?.()
        );

        this.runCodeButton?.addEventListener(
            "click",
            () =>
                this.runCode()
        );

        this.clearCodeButton?.addEventListener(
            "click",
            () => {
                if (this.codeEditor) {
                    this.codeEditor.value = "";
                    this.codeEditor.focus();
                }

                this.clearErrorHighlight();
            }
        );

        this.courseMapButton?.addEventListener(
            "click",
            () =>
                this.leaveCourse()
        );

        this.mapCourseButton?.addEventListener(
            "click",
            () =>
                this.showCourse()
        );

        this.previousChapterButton
            ?.addEventListener(
                "click",
                () =>
                    this.changeMapChapter(-1)
            );

        this.nextChapterButton
            ?.addEventListener(
                "click",
                () =>
                    this.changeMapChapter(1)
            );

        this.levelNodes.forEach(
            (node, index) => {
                node?.addEventListener(
                    "click",
                    () =>
                        this.selectLevel(
                            index + 1
                        )
                );
            }
        );

        this.closePytGuideButton
            ?.addEventListener(
                "click",
                () =>
                    this.hideGuide()
            );

        this.codeEditor?.addEventListener(
            "keydown",
            event => {
                if (
                    event.key === "Tab"
                ) {
                    event.preventDefault();

                    const start =
                        this.codeEditor
                            .selectionStart;

                    const end =
                        this.codeEditor
                            .selectionEnd;

                    const value =
                        this.codeEditor.value;

                    this.codeEditor.value =
                        value.slice(0, start) +
                        "    " +
                        value.slice(end);

                    this.codeEditor
                        .selectionStart =
                        start + 4;

                    this.codeEditor
                        .selectionEnd =
                        start + 4;
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

        this.connectCodeDragging();
    }


    /* =====================================================
       MOBILE
    ===================================================== */

    isMobile() {
        return window.matchMedia(
            "(max-width: 760px)"
        ).matches;
    }


    updateMobileState() {
        document.body.classList.toggle(
            "mobile-layout",
            this.isMobile()
        );

        /*
        Sur mobile les éléments flottants sont
        intégrés dans la page par le CSS.

        On supprime aussi toute position de fenêtre
        éventuellement ajoutée par le glisser-déposer.
        */

        if (
            this.isMobile() &&
            this.codeWindow
        ) {
            this.codeWindow.style.left = "";
            this.codeWindow.style.right = "";
            this.codeWindow.style.top = "";
            this.codeWindow.style.bottom = "";
        }
    }


    /* =====================================================
       JEU / NIVEAU
    ===================================================== */

    setGame(game) {
        this.game = game;

        this.render();
    }


    setLevel(level) {
        this.level = level;

        if (!level) {
            return;
        }

        this.currentChapter =
            Number(level.chapter) || 1;

        this.currentExercise =
            Number(level.exercise) || 1;

        this.refreshLevelInformation();

        /*
        Le starter code n'est placé que lorsqu'on
        change réellement de niveau.
        */

        if (this.codeEditor) {
            this.codeEditor.value =
                level.starterCode || "";
        }

        if (this.consoleOutput) {
            this.consoleOutput.textContent = "";
        }

        this.clearErrorHighlight();
        this.hideThoughtBubble();

        this.render();
    }


    refreshLevelInformation() {
        if (!this.level) {
            return;
        }

        const chapter =
            Number(this.level.chapter) || 1;

        const exercise =
            Number(this.level.exercise) || 1;

        if (this.chapterBadge) {
            this.chapterBadge.textContent =
                `Chapitre ${chapter} · Exercice ${exercise}`;
        }

        if (this.difficultyBadge) {
            this.difficultyBadge.textContent =
                this.translateDifficulty(
                    this.level.difficulty
                );
        }

        if (this.roomName) {
            this.roomName.textContent =
                this.level.room ||
                this.getRoomName(chapter);
        }

        if (this.missionTitle) {
            this.missionTitle.textContent =
                this.level.title ||
                `Exercice ${exercise}`;
        }

        if (this.missionInstruction) {
            this.missionInstruction.textContent =
                this.level.instruction ||
                "";
        }
    }


    translateDifficulty(value) {
        const difficulty =
            String(value || "")
                .toLowerCase();

        if (
            difficulty === "easy" ||
            difficulty === "facile"
        ) {
            return "Facile";
        }

        if (
            difficulty === "medium" ||
            difficulty === "moyen"
        ) {
            return "Moyen";
        }

        if (
            difficulty === "hard" ||
            difficulty === "difficile"
        ) {
            return "Difficile";
        }

        return value || "Facile";
    }


    getRoomName(chapter) {
        const rooms = {
            1: "Entrée",
            2: "Cuisine",
            3: "Salon",
            4: "Bibliothèque",
            5: "Salle de bain",
            6: "Chambre",
            7: "Atelier",
            8: "Grenier",
            9: "Laboratoire"
        };

        return (
            rooms[chapter] ||
            `Chapitre ${chapter}`
        );
    }


    /* =====================================================
       NAVIGATION
    ===================================================== */

    hideGameSections() {
        this.gameScreen?.classList.add(
            "hidden"
        );

        this.chapterScreen?.classList.add(
            "hidden"
        );

        this.mapScreen?.classList.add(
            "hidden"
        );
    }


    showGame() {
        this.hideGameSections();

        this.gameScreen?.classList.remove(
            "hidden"
        );

        this.refreshLevelInformation();
        this.resizeCanvas();
        this.render();

        window.setTimeout(
            () => {
                this.resizeCanvas();
                this.render();
            },
            50
        );
    }


    showMap(chapter = null) {
        this.hideGameSections();

        this.mapScreen?.classList.remove(
            "hidden"
        );

        if (
            Number.isInteger(chapter)
        ) {
            this.currentChapter =
                Math.max(
                    1,
                    Math.min(
                        9,
                        chapter
                    )
                );
        } else if (this.level) {
            this.currentChapter =
                Number(
                    this.level.chapter
                ) || 1;
        }

        this.refreshMap();
    }


    showCourse(chapter = null) {
        this.hideGameSections();

        this.chapterScreen
            ?.classList.remove(
                "hidden"
            );

        if (
            Number.isInteger(chapter)
        ) {
            this.currentChapter =
                Math.max(
                    1,
                    Math.min(
                        9,
                        chapter
                    )
                );
        } else if (this.level) {
            this.currentChapter =
                Number(
                    this.level.chapter
                ) || 1;
        }

        this.renderCourse(
            this.currentChapter
        );
    }


    showCourseAtChapterStart() {
        const chapter =
            this.level?.chapter || 1;

        const key =
            String(chapter);

        if (
            this.seenCourses.has(key)
        ) {
            this.showMap(
                Number(chapter)
            );

            return;
        }

        this.seenCourses.add(key);

        this.returnToExerciseAfterTheory =
            false;

        this.showCourse(
            Number(chapter)
        );
    }


    reviewTheory() {
        this.savedCodeBeforeTheory =
            this.codeEditor?.value || "";

        this.returnToExerciseAfterTheory =
            true;

        this.closeCode();

        this.showCourse(
            this.level?.chapter ||
            this.currentChapter
        );
    }


    leaveCourse() {
        if (
            this.returnToExerciseAfterTheory &&
            this.level
        ) {
            this.returnToExerciseAfterTheory =
                false;

            this.showGame();

            if (this.codeEditor) {
                this.codeEditor.value =
                    this.savedCodeBeforeTheory;
            }

            this.openCode();

            return;
        }

        this.showMap(
            this.currentChapter
        );
    }


    /* =====================================================
       COURS
    ===================================================== */

    getCourseData(chapter) {
        const courses = {

            1: {
                title: "Déplacer Pyt",
                subtitle:
                    "Apprends à avancer, reculer et tourner.",
                html: `
                    <p>
                        Pyt se déplace case par case.
                        Les premières instructions sont :
                    </p>

                    <pre>forward(1)
backward(1)
right(90)
left(90)</pre>

                    <p>
                        <strong>forward(1)</strong>
                        avance d'une case.
                    </p>

                    <p>
                        <strong>backward(1)</strong>
                        recule d'une case.
                    </p>

                    <p>
                        <strong>right(90)</strong>
                        tourne Pyt de 90° vers la droite.
                    </p>

                    <p>
                        <strong>left(90)</strong>
                        tourne Pyt de 90° vers la gauche.
                    </p>
                `
            },

            2: {
                title: "Variables et calculs",
                subtitle:
                    "Stocke des valeurs et utilise-les dans tes programmes.",
                html: `
                    <p>
                        Une variable permet de garder une valeur
                        pour la réutiliser plus tard.
                    </p>

                    <pre>distance = 3
forward(distance)</pre>

                    <p>
                        Python permet aussi de faire des calculs :
                    </p>

                    <pre>a = 2
b = 3
distance = a + b</pre>

                    <p>
                        Tu peux convertir certaines valeurs avec
                        <strong>int()</strong>,
                        <strong>float()</strong> et
                        <strong>str()</strong>.
                    </p>
                `
            },

            3: {
                title: "Conditions",
                subtitle:
                    "Fais prendre des décisions à ton programme.",
                html: `
                    <p>
                        Une condition permet d'exécuter du code
                        seulement dans certaines situations.
                    </p>

                    <pre>distance = 3

if distance > 2:
    forward(1)
else:
    backward(1)</pre>

                    <p>
                        Tu peux utiliser
                        <strong>if</strong>,
                        <strong>elif</strong>,
                        <strong>else</strong>,
                        ainsi que
                        <strong>and</strong>,
                        <strong>or</strong> et
                        <strong>not</strong>.
                    </p>
                `
            },

            4: {
                title: "Boucles for",
                subtitle:
                    "Répète une action un nombre précis de fois.",
                html: `
                    <p>
                        Une boucle <strong>for</strong>
                        évite de répéter plusieurs fois
                        la même ligne.
                    </p>

                    <pre>for i in range(4):
    forward(1)</pre>

                    <p>
                        <strong>range(4)</strong>
                        produit ici quatre répétitions.
                    </p>
                `
            },

            5: {
                title: "Boucles while",
                subtitle:
                    "Répète tant qu'une condition reste vraie.",
                html: `
                    <p>
                        Une boucle <strong>while</strong>
                        continue tant que sa condition est vraie.
                    </p>

                    <pre>distance = 3

while distance > 0:
    forward(1)
    distance -= 1</pre>

                    <p>
                        <strong>break</strong>
                        permet de quitter une boucle.
                    </p>
                `
            },

            6: {
                title: "Listes",
                subtitle:
                    "Regroupe plusieurs valeurs dans une seule variable.",
                html: `
                    <p>
                        Une liste contient plusieurs valeurs.
                    </p>

                    <pre>mouvements = [1, 1, 2]

for distance in mouvements:
    forward(distance)</pre>

                    <p>
                        Tu peux ajouter une valeur avec :
                    </p>

                    <pre>mouvements.append(3)</pre>
                `
            },

            7: {
                title: "Fonctions",
                subtitle:
                    "Crée tes propres instructions.",
                html: `
                    <p>
                        Une fonction permet de regrouper plusieurs
                        instructions sous un même nom.
                    </p>

                    <pre>def avancer_deux():
    forward(1)
    forward(1)

avancer_deux()</pre>

                    <p>
                        Une fonction peut également recevoir
                        des paramètres.
                    </p>
                `
            },

            8: {
                title: "Combiner les notions",
                subtitle:
                    "Utilise plusieurs outils Python ensemble.",
                html: `
                    <p>
                        Tu connais maintenant les variables,
                        conditions, boucles, listes et fonctions.
                    </p>

                    <pre>def avancer(distance):
    for i in range(distance):
        forward(1)

distances = [2, 1]

for distance in distances:
    avancer(distance)</pre>

                    <p>
                        Il existe souvent plusieurs solutions
                        correctes pour une même mission.
                    </p>
                `
            },

            9: {
                title: "Examen final",
                subtitle:
                    "Utilise tout ce que tu as appris.",
                html: `
                    <p>
                        Le dernier chapitre n'introduit
                        aucune nouvelle notion.
                    </p>

                    <p>
                        Observe la mission, réfléchis à ton
                        algorithme et combine les outils appris
                        pendant les chapitres précédents.
                    </p>

                    <pre># À toi de jouer !

# variables
# conditions
# boucles
# listes
# fonctions</pre>
                `
            }
        };

        return (
            courses[chapter] ||
            courses[1]
        );
    }


    renderCourse(chapter) {
        const course =
            this.getCourseData(chapter);

        if (this.courseChapterNumber) {
            this.courseChapterNumber.textContent =
                `Chapitre ${chapter}`;
        }

        if (this.courseTitle) {
            this.courseTitle.textContent =
                course.title;
        }

        if (this.courseSubtitle) {
            this.courseSubtitle.textContent =
                course.subtitle;
        }

        if (this.courseContent) {
            this.courseContent.innerHTML =
                course.html;
        }

        if (this.courseMapButton) {
            this.courseMapButton.textContent =
                this.returnToExerciseAfterTheory
                    ? "Retour à l'exercice"
                    : "Voir la carte";
        }
    }


    /* =====================================================
       CARTE
    ===================================================== */

    refreshMap() {
        const chapter =
            this.currentChapter;

        if (this.mapTitle) {
            this.mapTitle.textContent =
                `Chapitre ${chapter} — ${this.getRoomName(chapter)}`;
        }

        if (this.mapSubtitle) {
            this.mapSubtitle.textContent =
                "Choisis un exercice pour commencer.";
        }

        if (this.mapChapterIndicator) {
            this.mapChapterIndicator.textContent =
                `${chapter} / 9`;
        }

        if (this.mapBackground) {
            for (
                let i = 1;
                i <= 9;
                i++
            ) {
                this.mapBackground.classList.remove(
                    `chapter-theme-${i}`
                );
            }

            this.mapBackground.classList.add(
                `chapter-theme-${chapter}`
            );
        }

        this.renderMapDecoration(
            chapter
        );

        this.levelNodes.forEach(
            (node, index) => {
                if (!node) {
                    return;
                }

                const exercise =
                    index + 1;

                const key =
                    `${chapter}-${exercise}`;

                const unlocked =
                    this.unlockedLevels.has(key);

                const completed =
                    this.completedLevels.has(key);

                node.classList.toggle(
                    "locked",
                    !unlocked
                );

                node.classList.toggle(
                    "completed",
                    completed
                );

                node.disabled =
                    !unlocked;

                const state =
                    node.querySelector(
                        ".level-node-state"
                    );

                if (state) {
                    if (completed) {
                        state.textContent =
                            "Rejouer";

                    } else if (unlocked) {
                        state.textContent =
                            "Exercice";

                    } else {
                        state.textContent =
                            "Verrouillé";
                    }
                }
            }
        );

        if (
            this.previousChapterButton
        ) {
            this.previousChapterButton.disabled =
                chapter <= 1;
        }

        if (
            this.nextChapterButton
        ) {
            const nextChapter =
                chapter + 1;

            this.nextChapterButton.disabled =
                chapter >= 9 ||
                !this.unlockedLevels.has(
                    `${nextChapter}-1`
                );
        }
    }


    renderMapDecoration(chapter) {
        if (!this.mapDecoration) {
            return;
        }

        /*
        Décoration simple correspondant aux pièces.
        Elle utilise le style déjà présent et ne
        remplace pas les graphismes du jeu.
        */

        const decorations = {
            1: "🚪",
            2: "🍳",
            3: "🛋️",
            4: "📚",
            5: "🛁",
            6: "🛏️",
            7: "🔧",
            8: "📦",
            9: "⚗️"
        };

        this.mapDecoration.textContent =
            decorations[chapter] || "";
    }


    changeMapChapter(direction) {
        const target =
            this.currentChapter +
            direction;

        if (
            target < 1 ||
            target > 9
        ) {
            return;
        }

        if (
            direction > 0 &&
            !this.unlockedLevels.has(
                `${target}-1`
            )
        ) {
            return;
        }

        this.currentChapter =
            target;

        this.refreshMap();
    }


    selectLevel(exercise) {
        const key =
            `${this.currentChapter}-${exercise}`;

        if (
            !this.unlockedLevels.has(key)
        ) {
            return;
        }

        this.currentExercise =
            exercise;

        this.onSelectLevel?.(
            this.currentChapter,
            exercise
        );
    }


    /* =====================================================
       PROGRESSION
    ===================================================== */

    registerAttempt(levelId) {
        const id =
            String(
                levelId ||
                `${this.currentChapter}-${this.currentExercise}`
            );

        if (!this.attempts[id]) {
            this.attempts[id] = 0;
        }

        this.attempts[id]++;

        return this.attempts[id];
    }


    completeCurrentLevel() {
        if (!this.level) {
            return;
        }

        const chapter =
            Number(this.level.chapter);

        const exercise =
            Number(this.level.exercise);

        const key =
            `${chapter}-${exercise}`;

        this.completedLevels.add(
            key
        );

        if (exercise < 3) {
            this.unlockedLevels.add(
                `${chapter}-${exercise + 1}`
            );

        } else if (chapter < 9) {
            this.unlockedLevels.add(
                `${chapter + 1}-1`
            );
        }

        this.refreshMap();

        if (
            chapter === 9 &&
            exercise === 3
        ) {
            this.showGuide(
                "Incroyable ! Tu as terminé l'aventure PYT. Tu as utilisé toutes les notions apprises pendant le jeu.",
                [
                    {
                        label: "Revoir la carte",
                        action:
                            () =>
                                this.showMap(9)
                    }
                ]
            );

            return;
        }

        const actions = [];

        if (exercise < 3) {
            actions.push({
                label:
                    `Exercice ${exercise + 1}`,
                action:
                    () => {
                        this.hideGuide();

                        this.onSelectLevel?.(
                            chapter,
                            exercise + 1
                        );
                    }
            });

        } else if (chapter < 9) {
            actions.push({
                label:
                    `Chapitre ${chapter + 1}`,
                action:
                    () => {
                        this.hideGuide();

                        this.currentChapter =
                            chapter + 1;

                        this.showCourseAtChapterStart();
                    }
            });
        }

        actions.push({
            label: "Carte",
            action:
                () => {
                    this.hideGuide();
                    this.showMap(chapter);
                }
        });

        this.showGuide(
            this.level.successMessage ||
            "Bravo ! Mission réussie.",
            actions
        );
    }


    /* =====================================================
       CODE
    ===================================================== */

    openCode() {
        if (!this.codeWindow) {
            return;
        }

        this.codeWindow.classList.remove(
            "hidden"
        );

        /*
        Sur mobile la fenêtre fait partie de la page.
        On la fait simplement apparaître dans la zone
        visible sans la transformer en pop-up.
        */

        if (this.isMobile()) {
            window.setTimeout(
                () => {
                    this.codeWindow.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                },
                20
            );
        }

        window.setTimeout(
            () =>
                this.codeEditor?.focus(),
            50
        );
    }


    closeCode() {
        this.codeWindow?.classList.add(
            "hidden"
        );
    }


    runCode() {
        if (
            !this.onRunCode ||
            !this.codeEditor
        ) {
            return;
        }

        this.clearErrorHighlight();

        this.onRunCode(
            this.codeEditor.value
        );
    }


    connectCodeDragging() {
        if (
            !this.codeWindow ||
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
                        this.isMobile() ||
                        event.target.closest(
                            "button"
                        )
                    ) {
                        return;
                    }

                    dragging = true;

                    const rect =
                        this.codeWindow
                            .getBoundingClientRect();

                    offsetX =
                        event.clientX -
                        rect.left;

                    offsetY =
                        event.clientY -
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
                if (
                    !dragging ||
                    this.isMobile()
                ) {
                    return;
                }

                const maxX =
                    window.innerWidth -
                    this.codeWindow.offsetWidth;

                const maxY =
                    window.innerHeight -
                    this.codeWindow.offsetHeight;

                const x =
                    Math.max(
                        0,
                        Math.min(
                            maxX,
                            event.clientX -
                            offsetX
                        )
                    );

                const y =
                    Math.max(
                        0,
                        Math.min(
                            maxY,
                            event.clientY -
                            offsetY
                        )
                    );

                this.codeWindow.style.left =
                    `${x}px`;

                this.codeWindow.style.top =
                    `${y}px`;

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


    /* =====================================================
       ERREURS
    ===================================================== */

    clearErrorHighlight() {
        if (
            this.codeErrorHighlights
        ) {
            this.codeErrorHighlights.innerHTML =
                "";
        }
    }


    highlightErrorLine(lineNumber) {
        if (
            !this.codeEditor ||
            !this.codeErrorHighlights ||
            !Number.isInteger(lineNumber) ||
            lineNumber < 1
        ) {
            return;
        }

        const lines =
            this.codeEditor.value
                .split("\n");

        if (
            lineNumber >
            lines.length
        ) {
            return;
        }

        this.codeErrorHighlights.innerHTML =
            "";

        for (
            let i = 0;
            i < lines.length;
            i++
        ) {
            const line =
                document.createElement(
                    "span"
                );

            line.textContent =
                lines[i] || " ";

            if (
                i ===
                lineNumber - 1
            ) {
                line.className =
                    "code-error-line";
            }

            this.codeErrorHighlights
                .appendChild(line);

            if (
                i <
                lines.length - 1
            ) {
                this.codeErrorHighlights
                    .appendChild(
                        document.createTextNode(
                            "\n"
                        )
                    );
            }
        }

        const lineHeight =
            parseFloat(
                window
                    .getComputedStyle(
                        this.codeEditor
                    )
                    .lineHeight
            ) || 23;

        this.codeEditor.scrollTop =
            Math.max(
                0,
                (
                    lineNumber - 3
                ) * lineHeight
            );

        this.codeErrorHighlights.scrollTop =
            this.codeEditor.scrollTop;
    }


    /* =====================================================
       GUIDE PYT
    ===================================================== */

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

        if (
            this.guideHideTimer
        ) {
            window.clearTimeout(
                this.guideHideTimer
            );

            this.guideHideTimer = null;
        }

        this.pytGuideMessage.textContent =
            message;

        if (
            this.pytGuideActions
        ) {
            this.pytGuideActions.innerHTML =
                "";

            actions.forEach(
                actionData => {
                    const button =
                        document.createElement(
                            "button"
                        );

                    button.type =
                        "button";

                    button.textContent =
                        actionData.label;

                    button.addEventListener(
                        "click",
                        () =>
                            actionData.action?.()
                    );

                    this.pytGuideActions
                        .appendChild(button);
                }
            );
        }

        this.pytGuide.classList.remove(
            "hidden",
            "guide-leaving",
            "guide-entering"
        );

        /*
        Relance l'animation à chaque apparition.
        */

        void this.pytGuide.offsetWidth;

        this.pytGuide.classList.add(
            "guide-entering"
        );

        window.setTimeout(
            () => {
                this.pytGuide?.classList.remove(
                    "guide-entering"
                );
            },
            450
        );

        if (this.isMobile()) {
            window.setTimeout(
                () => {
                    this.pytGuide
                        ?.scrollIntoView({
                            behavior: "smooth",
                            block: "nearest"
                        });
                },
                80
            );
        }
    }


    hideGuide() {
        if (
            !this.pytGuide ||
            this.pytGuide.classList.contains(
                "hidden"
            )
        ) {
            return;
        }

        if (
            this.guideHideTimer
        ) {
            window.clearTimeout(
                this.guideHideTimer
            );
        }

        this.pytGuide.classList.remove(
            "guide-entering"
        );

        this.pytGuide.classList.add(
            "guide-leaving"
        );

        this.guideHideTimer =
            window.setTimeout(
                () => {
                    this.pytGuide.classList.add(
                        "hidden"
                    );

                    this.pytGuide.classList.remove(
                        "guide-leaving"
                    );

                    this.guideHideTimer =
                        null;
                },
                320
            );
    }


    showFailureGuide(
        message,
        information = {}
    ) {
        const actions = [
            {
                label: "Réessayer",
                action:
                    () => {
                        this.hideGuide();
                        this.openCode();
                    }
            },
            {
                label: "Revoir le cours",
                action:
                    () => {
                        this.hideGuide();
                        this.reviewTheory();
                    }
            }
        ];

        let guideMessage =
            message;

        if (
            information.attempt === 1
        ) {
            guideMessage +=
                " Tu peux réessayer ou revoir le cours si tu veux un rappel.";
        } else {
            guideMessage +=
                " Regarde bien ton programme et essaie de comprendre ce qui ne fonctionne pas.";
        }

        this.showGuide(
            guideMessage,
            actions
        );
    }


    /* =====================================================
       PENSÉE
    ===================================================== */

    showThoughtBubble(message) {
        if (
            !this.robotThoughtBubble
        ) {
            return;
        }

        this.robotThoughtBubble.textContent =
            message;

        this.robotThoughtBubble.classList.remove(
            "hidden"
        );
    }


    hideThoughtBubble() {
        this.robotThoughtBubble?.classList.add(
            "hidden"
        );
    }


    /* =====================================================
       STATUT
    ===================================================== */

    setStatus(message) {
        if (this.gameStatus) {
            this.gameStatus.textContent =
                message || "";
        }
    }


    /* =====================================================
       MODALE
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
        if (
            !this.modalBackground
        ) {
            return;
        }

        if (this.modalLabel) {
            this.modalLabel.textContent =
                label;
        }

        if (this.modalTitle) {
            this.modalTitle.textContent =
                title;
        }

        if (this.modalMessage) {
            this.modalMessage.textContent =
                message;
        }

        if (this.modalPrimaryButton) {
            this.modalPrimaryButton.textContent =
                primaryText;

            this.modalPrimaryButton.onclick =
                () => {
                    this.hideModal();
                    onPrimary?.();
                };
        }

        if (this.modalSecondaryButton) {
            if (secondaryText) {
                this.modalSecondaryButton
                    .classList.remove(
                        "hidden"
                    );

                this.modalSecondaryButton.textContent =
                    secondaryText;

                this.modalSecondaryButton.onclick =
                    () => {
                        this.hideModal();
                        onSecondary?.();
                    };

            } else {
                this.modalSecondaryButton
                    .classList.add(
                        "hidden"
                    );

                this.modalSecondaryButton.onclick =
                    null;
            }
        }

        this.modalBackground.classList.remove(
            "hidden"
        );

        /*
        Sur mobile la modale est dans la page.
        */

        if (this.isMobile()) {
            window.setTimeout(
                () => {
                    this.modalBackground
                        ?.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });
                },
                50
            );
        }
    }


    hideModal() {
        this.modalBackground?.classList.add(
            "hidden"
        );
    }


    /* =====================================================
       CANVAS
    ===================================================== */

    prepareCanvas() {
        if (
            !this.canvas ||
            !this.ctx
        ) {
            return;
        }

        this.resizeCanvas();
    }


    resizeCanvas() {
        if (
            !this.canvas ||
            !this.canvas.parentElement
        ) {
            return;
        }

        const container =
            this.canvas.parentElement;

        const rect =
            container.getBoundingClientRect();

        if (
            rect.width <= 0 ||
            rect.height <= 0
        ) {
            return;
        }

        const ratio =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );

        const width =
            Math.max(
                320,
                Math.floor(
                    rect.width * ratio
                )
            );

        const height =
            Math.max(
                220,
                Math.floor(
                    rect.height * ratio
                )
            );

        if (
            this.canvas.width !== width ||
            this.canvas.height !== height
        ) {
            this.canvas.width =
                width;

            this.canvas.height =
                height;
        }
    }


    render() {
        if (
            !this.ctx ||
            !this.canvas ||
            !this.game
        ) {
            return;
        }

        this.resizeCanvas();

        const ctx =
            this.ctx;

        const width =
            this.canvas.width;

        const height =
            this.canvas.height;

        ctx.clearRect(
            0,
            0,
            width,
            height
        );

        this.drawRoomBackground(
            ctx,
            width,
            height
        );

        const grid =
            this.game.grid ||
            this.level?.grid;

        if (
            !Array.isArray(grid) ||
            grid.length === 0
        ) {
            return;
        }

        const rows =
            grid.length;

        const cols =
            Math.max(
                ...grid.map(
                    row =>
                        Array.isArray(row)
                            ? row.length
                            : 0
                )
            );

        if (
            rows <= 0 ||
            cols <= 0
        ) {
            return;
        }

        const padding =
            Math.max(
                16,
                Math.min(
                    width,
                    height
                ) * 0.05
            );

        const availableWidth =
            width -
            padding * 2;

        const availableHeight =
            height -
            padding * 2;

        const tileSize =
            Math.floor(
                Math.min(
                    availableWidth / cols,
                    availableHeight / rows
                )
            );

        const boardWidth =
            tileSize * cols;

        const boardHeight =
            tileSize * rows;

        const startX =
            Math.floor(
                (
                    width -
                    boardWidth
                ) / 2
            );

        const startY =
            Math.floor(
                (
                    height -
                    boardHeight
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
                const tile =
                    this.game.getTileType
                        ? this.game.getTileType(
                            row,
                            col
                        )
                        : grid[row]?.[col];

                this.drawTile(
                    ctx,
                    tile,
                    row,
                    col,
                    startX,
                    startY,
                    tileSize
                );
            }
        }

        this.drawRobot(
            ctx,
            startX,
            startY,
            tileSize
        );
    }


    /* =====================================================
       DÉCOR
    ===================================================== */

    drawRoomBackground(
        ctx,
        width,
        height
    ) {
        const chapter =
            Number(
                this.level?.chapter ||
                this.currentChapter ||
                1
            );

        /*
        Palette volontairement proche du style actuel :
        violet / bleu nuit avec accents colorés.
        */

        const palettes = {
            1: ["#17102e", "#28164b"],
            2: ["#24122e", "#51233d"],
            3: ["#141735", "#242c58"],
            4: ["#17122e", "#3a2450"],
            5: ["#0e2036", "#17435a"],
            6: ["#19132f", "#38264e"],
            7: ["#21172c", "#49372d"],
            8: ["#171225", "#382d49"],
            9: ["#071d2b", "#123e49"]
        };

        const palette =
            palettes[chapter] ||
            palettes[1];

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                height
            );

        gradient.addColorStop(
            0,
            palette[0]
        );

        gradient.addColorStop(
            1,
            palette[1]
        );

        ctx.fillStyle =
            gradient;

        ctx.fillRect(
            0,
            0,
            width,
            height
        );


        /*
        Petites lignes de décor rétro.
        */

        ctx.save();

        ctx.globalAlpha = 0.08;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;

        const spacing =
            Math.max(
                28,
                Math.floor(
                    Math.min(
                        width,
                        height
                    ) / 12
                )
            );

        for (
            let x = 0;
            x < width;
            x += spacing
        ) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        for (
            let y = 0;
            y < height;
            y += spacing
        ) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        ctx.restore();
    }


    drawTile(
        ctx,
        tile,
        row,
        col,
        startX,
        startY,
        size
    ) {
        const x =
            startX +
            col * size;

        const y =
            startY +
            row * size;

        const type =
            String(
                tile || "floor"
            ).toLowerCase();


        /*
        Sol.
        */

        ctx.fillStyle =
            (row + col) % 2 === 0
                ? "#2a1b4b"
                : "#251742";

        ctx.fillRect(
            x,
            y,
            size,
            size
        );

        ctx.strokeStyle =
            "rgba(0,0,0,0.45)";

        ctx.lineWidth =
            Math.max(
                1,
                size * 0.035
            );

        ctx.strokeRect(
            x,
            y,
            size,
            size
        );


        if (
            type === "floor" ||
            type === "start" ||
            type === "." ||
            type === "empty"
        ) {
            return;
        }


        if (
            type === "wall" ||
            type === "#"
        ) {
            ctx.fillStyle =
                "#100b1d";

            ctx.fillRect(
                x + size * 0.05,
                y + size * 0.05,
                size * 0.9,
                size * 0.9
            );

            ctx.strokeStyle =
                "#05040b";

            ctx.lineWidth =
                Math.max(
                    2,
                    size * 0.07
                );

            ctx.strokeRect(
                x + size * 0.05,
                y + size * 0.05,
                size * 0.9,
                size * 0.9
            );

            return;
        }


        if (
            type === "goal"
        ) {
            this.drawGoal(
                ctx,
                x,
                y,
                size
            );

            return;
        }


        if (
            type === "object" ||
            type === "item"
        ) {
            this.drawObject(
                ctx,
                x,
                y,
                size
            );

            return;
        }


        if (
            type === "dirt"
        ) {
            this.drawDirt(
                ctx,
                x,
                y,
                size
            );

            return;
        }


        if (
            type === "button"
        ) {
            this.drawButton(
                ctx,
                x,
                y,
                size
            );

            return;
        }


        if (
            type === "door"
        ) {
            this.drawDoor(
                ctx,
                x,
                y,
                size
            );

            return;
        }


        if (
            type === "charger"
        ) {
            this.drawCharger(
                ctx,
                x,
                y,
                size
            );

            return;
        }


        if (
            type === "deposit"
        ) {
            this.drawDeposit(
                ctx,
                x,
                y,
                size
            );

            return;
        }


        if (
            type === "box"
        ) {
            this.drawBox(
                ctx,
                x,
                y,
                size
            );

            return;
        }


        if (
            type === "box_goal"
        ) {
            this.drawBoxGoal(
                ctx,
                x,
                y,
                size
            );
        }
    }


    drawGoal(
        ctx,
        x,
        y,
        size
    ) {
        ctx.save();

        ctx.strokeStyle =
            "#ffe45e";

        ctx.lineWidth =
            Math.max(
                3,
                size * 0.07
            );

        ctx.beginPath();

        ctx.arc(
            x + size / 2,
            y + size / 2,
            size * 0.28,
            0,
            Math.PI * 2
        );

        ctx.stroke();

        ctx.fillStyle =
            "#ffe45e";

        ctx.beginPath();

        ctx.arc(
            x + size / 2,
            y + size / 2,
            size * 0.08,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }


    drawObject(
        ctx,
        x,
        y,
        size
    ) {
        ctx.save();

        ctx.fillStyle =
            "#42e8ff";

        ctx.strokeStyle =
            "#05040b";

        ctx.lineWidth =
            Math.max(
                2,
                size * 0.06
            );

        ctx.fillRect(
            x + size * 0.29,
            y + size * 0.25,
            size * 0.42,
            size * 0.5
        );

        ctx.strokeRect(
            x + size * 0.29,
            y + size * 0.25,
            size * 0.42,
            size * 0.5
        );

        ctx.fillStyle =
            "#f7f5ff";

        ctx.fillRect(
            x + size * 0.36,
            y + size * 0.33,
            size * 0.28,
            size * 0.07
        );

        ctx.restore();
    }


    drawDirt(
        ctx,
        x,
        y,
        size
    ) {
        ctx.save();

        ctx.fillStyle =
            "#6e4c35";

        const points = [
            [0.32, 0.42, 0.12],
            [0.55, 0.55, 0.15],
            [0.43, 0.65, 0.09],
            [0.68, 0.38, 0.07]
        ];

        for (
            const point
            of points
        ) {
            ctx.beginPath();

            ctx.arc(
                x + size * point[0],
                y + size * point[1],
                size * point[2],
                0,
                Math.PI * 2
            );

            ctx.fill();
        }

        ctx.restore();
    }


    drawButton(
        ctx,
        x,
        y,
        size
    ) {
        ctx.save();

        ctx.fillStyle =
            "#ff4fa3";

        ctx.strokeStyle =
            "#05040b";

        ctx.lineWidth =
            Math.max(
                2,
                size * 0.06
            );

        ctx.beginPath();

        ctx.arc(
            x + size / 2,
            y + size / 2,
            size * 0.22,
            0,
            Math.PI * 2
        );

        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }


    drawDoor(
        ctx,
        x,
        y,
        size
    ) {
        ctx.save();

        ctx.fillStyle =
            "#ff9d3d";

        ctx.strokeStyle =
            "#05040b";

        ctx.lineWidth =
            Math.max(
                2,
                size * 0.06
            );

        ctx.fillRect(
            x + size * 0.18,
            y + size * 0.08,
            size * 0.64,
            size * 0.84
        );

        ctx.strokeRect(
            x + size * 0.18,
            y + size * 0.08,
            size * 0.64,
            size * 0.84
        );

        ctx.fillStyle =
            "#05040b";

        ctx.beginPath();

        ctx.arc(
            x + size * 0.68,
            y + size * 0.5,
            size * 0.045,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }


    drawCharger(
        ctx,
        x,
        y,
        size
    ) {
        ctx.save();

        ctx.fillStyle =
            "#29e6c5";

        ctx.strokeStyle =
            "#05040b";

        ctx.lineWidth =
            Math.max(
                2,
                size * 0.06
            );

        ctx.fillRect(
            x + size * 0.2,
            y + size * 0.2,
            size * 0.6,
            size * 0.6
        );

        ctx.strokeRect(
            x + size * 0.2,
            y + size * 0.2,
            size * 0.6,
            size * 0.6
        );

        ctx.fillStyle =
            "#05040b";

        ctx.beginPath();

        ctx.moveTo(
            x + size * 0.55,
            y + size * 0.27
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
            x + size * 0.65,
            y + size * 0.45
        );

        ctx.lineTo(
            x + size * 0.53,
            y + size * 0.45
        );

        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }


    drawDeposit(
        ctx,
        x,
        y,
        size
    ) {
        ctx.save();

        ctx.strokeStyle =
            "#42e8ff";

        ctx.lineWidth =
            Math.max(
                3,
                size * 0.07
            );

        ctx.strokeRect(
            x + size * 0.18,
            y + size * 0.18,
            size * 0.64,
            size * 0.64
        );

        ctx.beginPath();

        ctx.moveTo(
            x + size * 0.3,
            y + size * 0.5
        );

        ctx.lineTo(
            x + size * 0.7,
            y + size * 0.5
        );

        ctx.moveTo(
            x + size * 0.5,
            y + size * 0.3
        );

        ctx.lineTo(
            x + size * 0.5,
            y + size * 0.7
        );

        ctx.stroke();

        ctx.restore();
    }


    drawBox(
        ctx,
        x,
        y,
        size
    ) {
        ctx.save();

        ctx.fillStyle =
            "#a56c3f";

        ctx.strokeStyle =
            "#05040b";

        ctx.lineWidth =
            Math.max(
                2,
                size * 0.06
            );

        ctx.fillRect(
            x + size * 0.14,
            y + size * 0.14,
            size * 0.72,
            size * 0.72
        );

        ctx.strokeRect(
            x + size * 0.14,
            y + size * 0.14,
            size * 0.72,
            size * 0.72
        );

        ctx.beginPath();

        ctx.moveTo(
            x + size * 0.2,
            y + size * 0.2
        );

        ctx.lineTo(
            x + size * 0.8,
            y + size * 0.8
        );

        ctx.moveTo(
            x + size * 0.8,
            y + size * 0.2
        );

        ctx.lineTo(
            x + size * 0.2,
            y + size * 0.8
        );

        ctx.stroke();

        ctx.restore();
    }


    drawBoxGoal(
        ctx,
        x,
        y,
        size
    ) {
        ctx.save();

        ctx.strokeStyle =
            "#ff9d3d";

        ctx.lineWidth =
            Math.max(
                3,
                size * 0.06
            );

        ctx.setLineDash([
            size * 0.09,
            size * 0.06
        ]);

        ctx.strokeRect(
            x + size * 0.17,
            y + size * 0.17,
            size * 0.66,
            size * 0.66
        );

        ctx.restore();
    }


    /* =====================================================
       ROBOT
    ===================================================== */

    drawRobot(
        ctx,
        startX,
        startY,
        size
    ) {
        if (
            !this.game ||
            !this.game.robot
        ) {
            return;
        }

        const robot =
            this.game.robot;

        const position =
            robot.getPosition
                ? robot.getPosition()
                : {
                    row: robot.row,
                    col: robot.col
                };

        if (
            !position ||
            !Number.isFinite(position.row) ||
            !Number.isFinite(position.col)
        ) {
            return;
        }

        const centerX =
            startX +
            position.col * size +
            size / 2;

        const centerY =
            startY +
            position.row * size +
            size / 2;

        const robotSize =
            size * 0.62;

        ctx.save();

        ctx.translate(
            centerX,
            centerY
        );

        const direction =
            robot.getDirection
                ? robot.getDirection()
                : robot.direction;

        const rotation = {
            NORTH: 0,
            EAST: Math.PI / 2,
            SOUTH: Math.PI,
            WEST: -Math.PI / 2,
            N: 0,
            E: Math.PI / 2,
            S: Math.PI,
            W: -Math.PI / 2
        }[
            String(direction || "EAST")
                .toUpperCase()
        ] ?? Math.PI / 2;

        ctx.rotate(rotation);


        /*
        Corps.
        */

        ctx.fillStyle =
            "#f4f1ff";

        ctx.strokeStyle =
            "#05040b";

        ctx.lineWidth =
            Math.max(
                2,
                size * 0.055
            );

        ctx.beginPath();

        ctx.roundRect(
            -robotSize * 0.31,
            -robotSize * 0.17,
            robotSize * 0.62,
            robotSize * 0.55,
            robotSize * 0.12
        );

        ctx.fill();
        ctx.stroke();


        /*
        Tête.
        */

        ctx.beginPath();

        ctx.roundRect(
            -robotSize * 0.38,
            -robotSize * 0.46,
            robotSize * 0.76,
            robotSize * 0.38,
            robotSize * 0.16
        );

        ctx.fill();
        ctx.stroke();


        /*
        Visage.
        */

        ctx.fillStyle =
            "#17132b";

        ctx.beginPath();

        ctx.roundRect(
            -robotSize * 0.29,
            -robotSize * 0.39,
            robotSize * 0.58,
            robotSize * 0.22,
            robotSize * 0.08
        );

        ctx.fill();


        /*
        Yeux.
        */

        ctx.fillStyle =
            "#42e8ff";

        ctx.beginPath();

        ctx.arc(
            -robotSize * 0.14,
            -robotSize * 0.28,
            robotSize * 0.045,
            0,
            Math.PI * 2
        );

        ctx.arc(
            robotSize * 0.14,
            -robotSize * 0.28,
            robotSize * 0.045,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /*
        Cœur.
        */

        ctx.fillStyle =
            "#ff4fa3";

        ctx.strokeStyle =
            "#05040b";

        ctx.beginPath();

        ctx.arc(
            0,
            robotSize * 0.09,
            robotSize * 0.09,
            0,
            Math.PI * 2
        );

        ctx.fill();
        ctx.stroke();


        /*
        Indicateur de direction.
        Le robot regarde toujours vers le haut
        dans son repère local.
        */

        ctx.fillStyle =
            "#ffe45e";

        ctx.beginPath();

        ctx.moveTo(
            0,
            -robotSize * 0.58
        );

        ctx.lineTo(
            -robotSize * 0.09,
            -robotSize * 0.47
        );

        ctx.lineTo(
            robotSize * 0.09,
            -robotSize * 0.47
        );

        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }


    /* =====================================================
       ACTIONS ANIMÉES
    ===================================================== */

    playActions(
        actions,
        performAction,
        finished
    ) {
        const queue =
            Array.isArray(actions)
                ? [...actions]
                : [];

        const next =
            () => {
                if (
                    queue.length === 0
                ) {
                    finished?.();
                    return;
                }

                const action =
                    queue.shift();

                const result =
                    performAction?.(
                        action
                    );

                this.render();

                if (result === false) {
                    finished?.(
                        action
                    );

                    return;
                }

                window.setTimeout(
                    next,
                    this.actionDelay
                );
            };

        next();
    }
}


/* =========================================================
   EXPORT
========================================================= */

window.PytUI =
    PytUI;