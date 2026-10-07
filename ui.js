"use strict";

/* =========================================================
   PYT - ui.js
   Interface, carte, cours, guide Pyt et rendu du jeu.
========================================================= */

class PytUI {

    constructor() {
        this.game = null;
        this.level = null;

        this.currentChapter = 1;
        this.currentExercise = 1;

        this.completedLevels =
            new Set();

        this.unlockedLevels =
            new Set([
                "1-1"
            ]);

        this.seenCourses =
            new Set();

        this.attempts = {};

        this.actionDelay = 500;

        this.onRunCode = null;
        this.onRestart = null;
        this.onSelectLevel = null;

        this.savedCodeBeforeTheory = "";
        this.returnToExerciseAfterTheory = false;

        this.mapFirstVisit = true;

        this.guideAnimationTimer = null;

        this.cacheElements();
        this.connectEvents();
        this.setupCanvas();
        this.setupCodeWindowDrag();
    }


    /* =====================================================
       ÉLÉMENTS
    ===================================================== */

    cacheElements() {
        this.gameInterface =
            document.getElementById(
                "game-interface"
            );

        this.gameScreen =
            document.getElementById(
                "game-screen"
            );

        this.courseScreen =
            document.getElementById(
                "course-screen"
            );

        this.mapScreen =
            document.getElementById(
                "map-screen"
            );


        this.chapterDisplay =
            document.getElementById(
                "chapter-display"
            );

        this.difficultyDisplay =
            document.getElementById(
                "difficulty-display"
            );

        this.roomName =
            document.getElementById(
                "room-name"
            );

        this.gameStatus =
            document.getElementById(
                "game-status"
            );


        this.courseButton =
            document.getElementById(
                "course-button"
            );

        this.mapButton =
            document.getElementById(
                "map-button"
            );

        this.openCodeButton =
            document.getElementById(
                "open-code-button"
            );

        this.restartButton =
            document.getElementById(
                "restart-button"
            );


        this.canvas =
            document.getElementById(
                "game-canvas"
            );

        this.context =
            this.canvas
                ?.getContext(
                    "2d"
                ) || null;


        this.missionTitle =
            document.getElementById(
                "mission-title"
            );

        this.missionInstruction =
            document.getElementById(
                "mission-instruction"
            );

        this.missionCodeButton =
            document.getElementById(
                "mission-code-button"
            );


        this.thoughtBubble =
            document.getElementById(
                "thought-bubble"
            );

        this.thoughtText =
            document.getElementById(
                "thought-text"
            );


        /*
        Cours
        */

        this.courseTitle =
            document.getElementById(
                "course-title"
            );

        this.courseContent =
            document.getElementById(
                "course-content"
            );

        this.courseMapButton =
            document.getElementById(
                "course-map-button"
            );


        /*
        Carte
        */

        this.mapTitle =
            document.getElementById(
                "map-title"
            );

        this.mapSubtitle =
            document.getElementById(
                "map-subtitle"
            );

        this.mapRoom =
            document.getElementById(
                "map-room"
            );

        this.mapCourseButton =
            document.getElementById(
                "map-course-button"
            );

        this.previousChapterButton =
            document.getElementById(
                "previous-chapter-button"
            );

        this.nextChapterButton =
            document.getElementById(
                "next-chapter-button"
            );

        this.levelNodes =
            Array.from(
                document.querySelectorAll(
                    "[data-level-exercise]"
                )
            );


        /*
        Éditeur
        */

        this.codeWindow =
            document.getElementById(
                "code-window"
            );

        this.codeWindowHeader =
            document.getElementById(
                "code-window-header"
            );

        this.closeCodeButton =
            document.getElementById(
                "close-code-button"
            );

        this.codeEditor =
            document.getElementById(
                "code-editor"
            );

        this.runCodeButton =
            document.getElementById(
                "run-code-button"
            );

        this.clearCodeButton =
            document.getElementById(
                "clear-code-button"
            );

        this.consoleOutput =
            document.getElementById(
                "console-output"
            );

        this.codeErrorHighlight =
            document.getElementById(
                "code-error-highlight"
            );


        /*
        Guide Pyt
        */

        this.pytGuide =
            document.getElementById(
                "pyt-guide"
            );

        this.pytGuideText =
            document.getElementById(
                "pyt-guide-text"
            );

        this.closePytGuideButton =
            document.getElementById(
                "close-pyt-guide-button"
            );


        /*
        Modal
        */

        this.modal =
            document.getElementById(
                "general-modal"
            );

        this.modalTitle =
            document.getElementById(
                "modal-title"
            );

        this.modalText =
            document.getElementById(
                "modal-text"
            );

        this.modalPrimaryButton =
            document.getElementById(
                "modal-primary-button"
            );

        this.modalSecondaryButton =
            document.getElementById(
                "modal-secondary-button"
            );
    }


    /* =====================================================
       ÉVÉNEMENTS
    ===================================================== */

    connectEvents() {

        this.courseButton
            ?.addEventListener(
                "click",
                () =>
                    this.reviewTheory()
            );


        this.mapButton
            ?.addEventListener(
                "click",
                () =>
                    this.showMap()
            );


        this.openCodeButton
            ?.addEventListener(
                "click",
                () =>
                    this.openCodeWindow()
            );


        this.missionCodeButton
            ?.addEventListener(
                "click",
                () =>
                    this.openCodeWindow()
            );


        this.closeCodeButton
            ?.addEventListener(
                "click",
                () =>
                    this.closeCodeWindow()
            );


        this.restartButton
            ?.addEventListener(
                "click",
                () => {
                    if (
                        typeof this.onRestart ===
                        "function"
                    ) {
                        this.onRestart();
                    }
                }
            );


        this.clearCodeButton
            ?.addEventListener(
                "click",
                () => {
                    if (
                        this.codeEditor
                    ) {
                        this.codeEditor.value =
                            "";
                    }

                    this.clearErrorHighlight();

                    if (
                        this.consoleOutput
                    ) {
                        this.consoleOutput.textContent =
                            "";
                    }

                    this.codeEditor?.focus();
                }
            );


        this.runCodeButton
            ?.addEventListener(
                "click",
                () =>
                    this.requestRun()
            );


        this.courseMapButton
            ?.addEventListener(
                "click",
                () => {
                    if (
                        this.returnToExerciseAfterTheory
                    ) {
                        this.returnToExerciseAfterTheory =
                            false;

                        this.showGame();

                        if (
                            this.codeEditor
                        ) {
                            this.codeEditor.value =
                                this.savedCodeBeforeTheory;
                        }

                        return;
                    }

                    this.showMap();
                }
            );


        this.mapCourseButton
            ?.addEventListener(
                "click",
                () =>
                    this.showCourse()
            );


        this.previousChapterButton
            ?.addEventListener(
                "click",
                () =>
                    this.changeMapChapter(
                        -1
                    )
            );


        this.nextChapterButton
            ?.addEventListener(
                "click",
                () =>
                    this.changeMapChapter(
                        1
                    )
            );


        for (
            const node
            of this.levelNodes
        ) {
            node.addEventListener(
                "click",
                () => {
                    const exercise =
                        Number(
                            node.dataset
                                .levelExercise
                        );

                    this.selectLevelFromMap(
                        exercise
                    );
                }
            );
        }


        this.codeEditor
            ?.addEventListener(
                "keydown",
                event =>
                    this.handleEditorKeydown(
                        event
                    )
            );


        /*
        Nouveau :
        la bulle de Pyt peut être fermée.
        */

        this.closePytGuideButton
            ?.addEventListener(
                "click",
                () =>
                    this.hideGuide()
            );


        window.addEventListener(
            "resize",
            () => {
                this.resizeCanvas();
                this.render();
            }
        );
    }


    handleEditorKeydown(event) {
        if (
            event.key === "Tab"
        ) {
            event.preventDefault();

            const editor =
                this.codeEditor;

            if (!editor) {
                return;
            }

            const start =
                editor.selectionStart;

            const end =
                editor.selectionEnd;

            const value =
                editor.value;

            editor.value =
                value.slice(
                    0,
                    start
                ) +
                "    " +
                value.slice(
                    end
                );

            editor.selectionStart =
                start + 4;

            editor.selectionEnd =
                start + 4;

            return;
        }


        if (
            event.key === "Enter" &&
            (
                event.ctrlKey ||
                event.metaKey
            )
        ) {
            event.preventDefault();

            this.requestRun();
        }
    }


    requestRun() {
        if (
            typeof this.onRunCode !==
            "function"
        ) {
            return;
        }

        this.clearErrorHighlight();

        this.onRunCode(
            this.codeEditor?.value ||
            ""
        );
    }


    /* =====================================================
       GAME / LEVEL
    ===================================================== */

    setGame(game) {
        this.game =
            game;

        this.render();
    }


    setLevel(level) {
        this.level =
            level;

        this.currentChapter =
            Number(
                level?.chapter ||
                1
            );

        this.currentExercise =
            Number(
                level?.exercise ||
                1
            );


        this.refreshLevelInformation();


        /*
        setLevel() n'est appelé que lors d'un vrai
        changement de niveau.

        Le code de départ peut donc être chargé ici.
        Un simple Run/Restart ne doit PAS rappeler
        setLevel(), ce qui permet de conserver le
        programme écrit par l'élève.
        */

        if (
            this.codeEditor
        ) {
            this.codeEditor.value =
                level?.starterCode ||
                "";
        }


        if (
            this.consoleOutput
        ) {
            this.consoleOutput.textContent =
                "";
        }


        this.clearErrorHighlight();
        this.hideThoughtBubble();

        this.render();
    }


    refreshLevelInformation() {
        if (!this.level) {
            return;
        }


        if (
            this.chapterDisplay
        ) {
            this.chapterDisplay.textContent =
                `Chapitre ${this.currentChapter} · Exercice ${this.currentExercise}`;
        }


        if (
            this.difficultyDisplay
        ) {
            this.difficultyDisplay.textContent =
                this.translateDifficulty(
                    this.level.difficulty
                );
        }


        if (
            this.roomName
        ) {
            this.roomName.textContent =
                this.level.room ||
                this.getRoomName(
                    this.currentChapter
                );
        }


        if (
            this.missionTitle
        ) {
            this.missionTitle.textContent =
                this.level.title ||
                "Mission";
        }


        if (
            this.missionInstruction
        ) {
            this.missionInstruction.textContent =
                this.level.instruction ||
                "";
        }
    }


    translateDifficulty(
        difficulty
    ) {
        const value =
            String(
                difficulty ||
                ""
            )
                .trim()
                .toLowerCase();

        const names = {
            easy: "Facile",
            facile: "Facile",

            medium: "Moyen",
            moyen: "Moyen",

            hard: "Difficile",
            difficile: "Difficile"
        };

        return (
            names[value] ||
            difficulty ||
            ""
        );
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
            "Maison"
        );
    }


    /* =====================================================
       NAVIGATION
    ===================================================== */

    hideInternalScreens() {
        this.gameScreen?.classList.add(
            "hidden"
        );

        this.courseScreen?.classList.add(
            "hidden"
        );

        this.mapScreen?.classList.add(
            "hidden"
        );
    }


    showGame() {
        this.gameInterface?.classList.remove(
            "hidden"
        );

        this.hideInternalScreens();

        this.gameScreen?.classList.remove(
            "hidden"
        );

        this.resizeCanvas();
        this.render();
    }


    showMap() {
        this.gameInterface?.classList.remove(
            "hidden"
        );

        this.hideInternalScreens();

        this.mapScreen?.classList.remove(
            "hidden"
        );

        this.returnToExerciseAfterTheory =
            false;

        this.refreshMap();

        this.mapFirstVisit =
            false;
    }


    showCourse() {
        this.gameInterface?.classList.remove(
            "hidden"
        );

        this.hideInternalScreens();

        this.courseScreen?.classList.remove(
            "hidden"
        );

        this.refreshCourse();
    }


    showCourseAtChapterStart() {
        const key =
            String(
                this.currentChapter
            );

        if (
            this.seenCourses.has(key)
        ) {
            this.showGame();
            return;
        }

        this.seenCourses.add(
            key
        );

        this.returnToExerciseAfterTheory =
            false;

        this.showCourse();
    }


    reviewTheory() {
        this.savedCodeBeforeTheory =
            this.codeEditor?.value ||
            "";

        this.returnToExerciseAfterTheory =
            true;

        this.showCourse();
    }


    /* =====================================================
       COURS
    ===================================================== */

    getCourseData(chapter) {
        const courses = {

            1: {
                title:
                    "Chapitre 1 — Déplacements",

                text:
                    "Pyt se déplace case par case. forward() le fait avancer, backward() le fait reculer. right(90) et left(90) permettent de changer sa direction.",

                example:
`forward(2)
right(90)
forward(1)`
            },


            2: {
                title:
                    "Chapitre 2 — Variables et calculs",

                text:
                    "Une variable permet de garder une valeur pour la réutiliser. Python peut aussi effectuer des calculs et convertir des valeurs avec int(), float() et str().",

                example:
`distance = 2
bonus = 1
total = distance + bonus

forward(total)`
            },


            3: {
                title:
                    "Chapitre 3 — Conditions",

                text:
                    "Une condition permet de choisir quoi faire. if teste une situation. elif ajoute un autre cas et else traite le reste. On peut combiner des conditions avec and, or et not.",

                example:
`distance = 2

if distance == 2:
    forward(2)
else:
    forward(1)`
            },


            4: {
                title:
                    "Chapitre 4 — Boucles for",

                text:
                    "Une boucle for répète des instructions un nombre déterminé de fois. range() permet de créer une suite de nombres.",

                example:
`for i in range(3):
    forward(1)`
            },


            5: {
                title:
                    "Chapitre 5 — Boucles while",

                text:
                    "Une boucle while continue tant que sa condition est vraie. break permet de quitter la boucle immédiatement.",

                example:
`distance = 0

while distance < 3:
    forward(1)
    distance += 1`
            },


            6: {
                title:
                    "Chapitre 6 — Listes",

                text:
                    "Une liste permet de ranger plusieurs valeurs dans une même variable. On peut lire un élément avec son index et ajouter une valeur avec append().",

                example:
`actions = [1, 1, 1]

for distance in actions:
    forward(distance)`
            },


            7: {
                title:
                    "Chapitre 7 — Fonctions",

                text:
                    "Une fonction regroupe plusieurs instructions sous un nom. Elle permet de réutiliser facilement le même comportement.",

                example:
`def avancer_deux():
    forward(2)

avancer_deux()`
            },


            8: {
                title:
                    "Chapitre 8 — Combiner les notions",

                text:
                    "Les programmes deviennent plus intéressants quand plusieurs notions sont combinées : variables, conditions, boucles, listes et fonctions.",

                example:
`def avancer(distance):
    for i in range(distance):
        forward(1)

distance = 3

if distance > 0:
    avancer(distance)`
            },


            9: {
                title:
                    "Chapitre 9 — Examen final",

                text:
                    "Aucune nouvelle notion. Utilise tout ce que tu as appris pour résoudre les trois dernières missions de Pyt.",

                example:
`def trajet(actions):
    for action in actions:
        if action == 1:
            forward(1)

trajet([1, 1, 1])`
            }
        };


        return (
            courses[chapter] ||
            courses[1]
        );
    }


    refreshCourse() {
        const course =
            this.getCourseData(
                this.currentChapter
            );


        if (
            this.courseTitle
        ) {
            this.courseTitle.textContent =
                course.title;
        }


        if (
            this.courseContent
        ) {
            this.courseContent.innerHTML =
                "";

            const paragraph =
                document.createElement(
                    "p"
                );

            paragraph.textContent =
                course.text;


            const exampleTitle =
                document.createElement(
                    "h3"
                );

            exampleTitle.textContent =
                "Exemple";


            const pre =
                document.createElement(
                    "pre"
                );

            const code =
                document.createElement(
                    "code"
                );

            code.textContent =
                course.example;

            pre.appendChild(
                code
            );


            this.courseContent.append(
                paragraph,
                exampleTitle,
                pre
            );
        }
    }


    /* =====================================================
       CARTE
    ===================================================== */

    changeMapChapter(direction) {
        const next =
            this.currentChapter +
            direction;

        if (
            next < 1 ||
            next > 9
        ) {
            return;
        }


        if (
            direction > 0 &&
            !this.isChapterUnlocked(
                next
            )
        ) {
            this.showGuide(
                "Termine les exercices précédents avant d'aller dans cette pièce."
            );

            return;
        }


        this.currentChapter =
            next;

        this.refreshMap();
    }


    isChapterUnlocked(chapter) {
        if (
            chapter === 1
        ) {
            return true;
        }

        return this.unlockedLevels.has(
            `${chapter}-1`
        );
    }


    refreshMap() {
        const chapter =
            this.currentChapter;

        const room =
            this.getRoomName(
                chapter
            );


        if (
            this.mapTitle
        ) {
            this.mapTitle.textContent =
                `Chapitre ${chapter} — ${room}`;
        }


        if (
            this.mapSubtitle
        ) {
            if (
                chapter === 9
            ) {
                this.mapSubtitle.textContent =
                    "Le laboratoire · Examen final";

            } else {
                this.mapSubtitle.textContent =
                    "Choisis un exercice";
            }
        }


        if (
            this.mapRoom
        ) {
            this.mapRoom.dataset.chapter =
                String(chapter);

            this.mapRoom.dataset.room =
                room;
        }


        for (
            const node
            of this.levelNodes
        ) {
            const exercise =
                Number(
                    node.dataset
                        .levelExercise
                );

            const key =
                `${chapter}-${exercise}`;

            const unlocked =
                this.unlockedLevels.has(
                    key
                );

            const completed =
                this.completedLevels.has(
                    key
                );


            node.classList.toggle(
                "locked",
                !unlocked
            );

            node.classList.toggle(
                "unlocked",
                unlocked &&
                !completed
            );

            node.classList.toggle(
                "completed",
                completed
            );

            node.disabled =
                !unlocked;


            const label =
                node.querySelector(
                    ".level-node-label"
                );

            if (label) {
                label.textContent =
                    completed
                        ? `Exercice ${exercise} ✓`
                        : `Exercice ${exercise}`;
            }
        }


        if (
            this.previousChapterButton
        ) {
            this.previousChapterButton.disabled =
                chapter <= 1;
        }


        if (
            this.nextChapterButton
        ) {
            this.nextChapterButton.disabled =
                chapter >= 9 ||
                !this.isChapterUnlocked(
                    chapter + 1
                );
        }


        this.decorateMapRoom(
            chapter
        );
    }


    decorateMapRoom(chapter) {
        if (!this.mapRoom) {
            return;
        }

        const decoration =
            this.mapRoom.querySelector(
                ".map-room-decoration"
            );

        if (!decoration) {
            return;
        }


        const decorations = {
            1: "🚪",
            2: "🍳",
            3: "🛋️",
            4: "📚",
            5: "🫧",
            6: "🛏️",
            7: "🔧",
            8: "📦",
            9: "⚗️"
        };


        decoration.textContent =
            decorations[chapter] ||
            "✦";
    }


    selectLevelFromMap(exercise) {
        const key =
            `${this.currentChapter}-${exercise}`;

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


        this.currentExercise =
            exercise;


        if (
            typeof this.onSelectLevel ===
            "function"
        ) {
            this.onSelectLevel(
                this.currentChapter,
                exercise
            );
        }
    }


    /* =====================================================
       PROGRESSION
    ===================================================== */

    completeCurrentLevel() {
        if (!this.level) {
            return;
        }


        const chapter =
            Number(
                this.level.chapter
            );

        const exercise =
            Number(
                this.level.exercise
            );

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


        if (
            chapter === 9 &&
            exercise === 3
        ) {
            this.showGuide(
                "Tu as terminé l'aventure de Pyt ! Tous les chapitres sont maintenant accomplis."
            );

            return;
        }


        const successMessage =
            this.level.successMessage ||
            "Bravo ! Mission réussie.";

        this.showSuccessModal(
            successMessage
        );
    }


    showSuccessModal(message) {
        if (!this.modal) {
            this.showGuide(
                message
            );

            return;
        }


        if (
            this.modalTitle
        ) {
            this.modalTitle.textContent =
                "Mission réussie";
        }


        if (
            this.modalText
        ) {
            this.modalText.textContent =
                message;
        }


        this.modal.classList.remove(
            "hidden"
        );


        if (
            this.modalPrimaryButton
        ) {
            this.modalPrimaryButton.textContent =
                "Continuer";

            this.modalPrimaryButton.onclick =
                () => {
                    this.modal.classList.add(
                        "hidden"
                    );

                    this.showMap();
                };
        }


        if (
            this.modalSecondaryButton
        ) {
            this.modalSecondaryButton.textContent =
                "Rejouer";

            this.modalSecondaryButton.onclick =
                () => {
                    this.modal.classList.add(
                        "hidden"
                    );

                    if (
                        typeof this.onRestart ===
                        "function"
                    ) {
                        this.onRestart();
                    }
                };
        }
    }


    /* =====================================================
       TENTATIVES / AIDE
    ===================================================== */

    registerAttempt(levelId) {
        const key =
            String(levelId);

        if (
            !this.attempts[key]
        ) {
            this.attempts[key] =
                0;
        }

        this.attempts[key]++;

        return this.attempts[
            key
        ];
    }


    showFailureGuide(
        message,
        options = {}
    ) {
        const attempt =
            Number(
                options.attempt ||
                1
            );


        if (
            attempt <= 1
        ) {
            this.showGuide(
                `${message} Réessaie en observant bien le trajet de Pyt.`
            );

            return;
        }


        this.showGuide(
            `${message} Si tu veux, retourne voir le cours avant de réessayer.`
        );
    }


    /* =====================================================
       GUIDE PYT
    ===================================================== */

    showGuide(message) {
        if (
            !this.pytGuide
        ) {
            return;
        }


        window.clearTimeout(
            this.guideAnimationTimer
        );


        if (
            this.pytGuideText
        ) {
            this.pytGuideText.textContent =
                message;
        }


        /*
        Si une animation de sortie était en cours,
        on l'annule proprement.
        */

        this.pytGuide.classList.remove(
            "guide-leaving"
        );

        this.pytGuide.classList.remove(
            "hidden"
        );


        /*
        Force le navigateur à prendre en compte
        l'état initial avant l'animation d'entrée.
        */

        void this.pytGuide.offsetWidth;


        this.pytGuide.classList.add(
            "guide-entering"
        );


        this.guideAnimationTimer =
            window.setTimeout(
                () => {
                    this.pytGuide
                        ?.classList
                        .remove(
                            "guide-entering"
                        );
                },
                450
            );
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


        window.clearTimeout(
            this.guideAnimationTimer
        );


        this.pytGuide.classList.remove(
            "guide-entering"
        );

        this.pytGuide.classList.add(
            "guide-leaving"
        );


        this.guideAnimationTimer =
            window.setTimeout(
                () => {
                    if (
                        !this.pytGuide
                    ) {
                        return;
                    }

                    this.pytGuide.classList.add(
                        "hidden"
                    );

                    this.pytGuide.classList.remove(
                        "guide-leaving"
                    );
                },
                330
            );
    }


    /* =====================================================
       BULLE DE PENSÉE
    ===================================================== */

    showThoughtBubble(message) {
        if (
            !this.thoughtBubble
        ) {
            return;
        }


        if (
            this.thoughtText
        ) {
            this.thoughtText.textContent =
                message;
        }


        this.thoughtBubble.classList.remove(
            "hidden"
        );
    }


    hideThoughtBubble() {
        this.thoughtBubble?.classList.add(
            "hidden"
        );
    }


    /* =====================================================
       ÉDITEUR
    ===================================================== */

    openCodeWindow() {
        this.codeWindow?.classList.remove(
            "hidden"
        );

        this.codeEditor?.focus();


        /*
        Sur téléphone la fenêtre est intégrée
        directement dans la page grâce au CSS.
        On la rend visible sans essayer de la placer
        comme une popup.
        */

        if (
            this.isMobileLayout() &&
            this.codeWindow
        ) {
            window.setTimeout(
                () => {
                    this.codeWindow.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                },
                50
            );
        }
    }


    closeCodeWindow() {
        this.codeWindow?.classList.add(
            "hidden"
        );
    }


    isMobileLayout() {
        return window.matchMedia(
            "(max-width: 760px)"
        ).matches;
    }


    setupCodeWindowDrag() {
        if (
            !this.codeWindow ||
            !this.codeWindowHeader
        ) {
            return;
        }


        let dragging =
            false;

        let offsetX =
            0;

        let offsetY =
            0;


        this.codeWindowHeader.addEventListener(
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


                dragging =
                    true;

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


        this.codeWindowHeader.addEventListener(
            "pointermove",
            event => {
                if (
                    !dragging ||
                    this.isMobileLayout()
                ) {
                    return;
                }


                const width =
                    this.codeWindow
                        .offsetWidth;

                const height =
                    this.codeWindow
                        .offsetHeight;


                const maximumX =
                    Math.max(
                        0,
                        window.innerWidth -
                        width
                    );

                const maximumY =
                    Math.max(
                        0,
                        window.innerHeight -
                        height
                    );


                const left =
                    Math.max(
                        0,
                        Math.min(
                            maximumX,
                            event.clientX -
                            offsetX
                        )
                    );

                const top =
                    Math.max(
                        0,
                        Math.min(
                            maximumY,
                            event.clientY -
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


        const stopDragging =
            () => {
                dragging =
                    false;
            };


        this.codeWindowHeader.addEventListener(
            "pointerup",
            stopDragging
        );

        this.codeWindowHeader.addEventListener(
            "pointercancel",
            stopDragging
        );
    }


    /* =====================================================
       ERREURS DANS LE CODE
    ===================================================== */

    highlightErrorLine(lineNumber) {
        if (
            !this.codeEditor ||
            !lineNumber
        ) {
            return;
        }


        this.codeEditor.dataset.errorLine =
            String(
                lineNumber
            );

        this.codeEditor.classList.add(
            "has-error-line"
        );


        const lines =
            this.codeEditor.value
                .split("\n");

        let start =
            0;

        for (
            let index = 0;
            index <
            lineNumber - 1;
            index++
        ) {
            start +=
                (
                    lines[index] ||
                    ""
                ).length + 1;
        }


        const end =
            start +
            (
                lines[
                    lineNumber - 1
                ] ||
                ""
            ).length;


        this.openCodeWindow();

        this.codeEditor.focus();

        this.codeEditor.setSelectionRange(
            start,
            end
        );
    }


    clearErrorHighlight() {
        if (
            !this.codeEditor
        ) {
            return;
        }

        delete this.codeEditor.dataset
            .errorLine;

        this.codeEditor.classList.remove(
            "has-error-line"
        );
    }


    /* =====================================================
       STATUT
    ===================================================== */

    setStatus(message) {
        if (
            this.gameStatus
        ) {
            this.gameStatus.textContent =
                message || "";
        }
    }


    /* =====================================================
       ACTIONS / ANIMATIONS
    ===================================================== */

    playActions(
        actions,
        performAction,
        onFinished
    ) {
        const queue =
            Array.isArray(actions)
                ? [...actions]
                : [];


        let index =
            0;

        let blockedAction =
            null;


        const next =
            () => {
                if (
                    index >=
                    queue.length
                ) {
                    if (
                        typeof onFinished ===
                        "function"
                    ) {
                        onFinished(
                            blockedAction
                        );
                    }

                    return;
                }


                const action =
                    queue[index];

                index++;


                let success =
                    true;


                if (
                    typeof performAction ===
                    "function"
                ) {
                    success =
                        performAction(
                            action
                        ) !== false;
                }


                this.render();


                if (
                    !success
                ) {
                    blockedAction =
                        action;

                    if (
                        typeof onFinished ===
                        "function"
                    ) {
                        window.setTimeout(
                            () =>
                                onFinished(
                                    blockedAction
                                ),
                            this.actionDelay
                        );
                    }

                    return;
                }


                window.setTimeout(
                    next,
                    this.actionDelay
                );
            };


        if (
            queue.length === 0
        ) {
            if (
                typeof onFinished ===
                "function"
            ) {
                onFinished(null);
            }

            return;
        }


        next();
    }


    /* =====================================================
       CANVAS
    ===================================================== */

    setupCanvas() {
        if (
            !this.canvas ||
            !this.context
        ) {
            return;
        }

        this.context.imageSmoothingEnabled =
            false;

        this.resizeCanvas();
    }


    resizeCanvas() {
        if (
            !this.canvas
        ) {
            return;
        }


        const rect =
            this.canvas
                .getBoundingClientRect();

        const width =
            Math.max(
                320,
                Math.floor(
                    rect.width ||
                    this.canvas.clientWidth ||
                    800
                )
            );

        const height =
            Math.max(
                260,
                Math.floor(
                    rect.height ||
                    this.canvas.clientHeight ||
                    520
                )
            );


        if (
            this.canvas.width !==
            width
        ) {
            this.canvas.width =
                width;
        }


        if (
            this.canvas.height !==
            height
        ) {
            this.canvas.height =
                height;
        }


        if (
            this.context
        ) {
            this.context.imageSmoothingEnabled =
                false;
        }
    }


    render() {
        if (
            !this.canvas ||
            !this.context ||
            !this.game
        ) {
            return;
        }


        this.resizeCanvas();


        const ctx =
            this.context;

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
            this.game.grid;

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


        const margin =
            Math.max(
                16,
                Math.min(
                    48,
                    width * 0.05
                )
            );


        const availableWidth =
            width -
            margin * 2;

        const availableHeight =
            height -
            margin * 2;


        const tileSize =
            Math.floor(
                Math.min(
                    availableWidth /
                    cols,

                    availableHeight /
                    rows
                )
            );


        const boardWidth =
            tileSize *
            cols;

        const boardHeight =
            tileSize *
            rows;


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
                const x =
                    startX +
                    col *
                    tileSize;

                const y =
                    startY +
                    row *
                    tileSize;


                this.drawTile(
                    ctx,
                    row,
                    col,
                    x,
                    y,
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


    drawRoomBackground(
        ctx,
        width,
        height
    ) {
        /*
        On conserve volontairement le style actuel :
        fond violet / bleu nuit, sans refaire les
        graphismes du jeu.
        */

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                width,
                height
            );

        gradient.addColorStop(
            0,
            "#160f33"
        );

        gradient.addColorStop(
            0.55,
            "#24124b"
        );

        gradient.addColorStop(
            1,
            "#0d1733"
        );


        ctx.fillStyle =
            gradient;

        ctx.fillRect(
            0,
            0,
            width,
            height
        );


        this.drawRoomDecoration(
            ctx,
            width,
            height,
            this.currentChapter
        );
    }


    drawRoomDecoration(
        ctx,
        width,
        height,
        chapter
    ) {
        ctx.save();

        ctx.globalAlpha =
            0.14;

        ctx.fillStyle =
            "#58f4ff";

        const spacing =
            Math.max(
                36,
                Math.floor(
                    width / 15
                )
            );


        for (
            let x = 0;
            x < width;
            x += spacing
        ) {
            ctx.fillRect(
                x,
                0,
                1,
                height
            );
        }


        ctx.fillStyle =
            "#ff4fc8";


        for (
            let y = 0;
            y < height;
            y += spacing
        ) {
            ctx.fillRect(
                0,
                y,
                width,
                1
            );
        }


        ctx.globalAlpha =
            0.12;

        ctx.font =
            `${Math.max(
                42,
                width * 0.07
            )}px sans-serif`;

        ctx.textAlign =
            "right";

        ctx.textBaseline =
            "bottom";


        const symbols = {
            1: "⌂",
            2: "✦",
            3: "◆",
            4: "▤",
            5: "○",
            6: "☾",
            7: "⚙",
            8: "▣",
            9: "⌬"
        };


        ctx.fillText(
            symbols[chapter] ||
            "✦",
            width - 24,
            height - 18
        );

        ctx.restore();
    }


    drawTile(
        ctx,
        row,
        col,
        x,
        y,
        size
    ) {
        const type =
            this.game.getTileType(
                row,
                col
            );


        /*
        Sol
        */

        ctx.fillStyle =
            (
                row + col
            ) % 2 === 0
                ? "#30245d"
                : "#392a6b";

        ctx.fillRect(
            x,
            y,
            size,
            size
        );


        ctx.strokeStyle =
            "#17102c";

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


        const padding =
            size * 0.12;


        switch (type) {

            case "wall":
                ctx.fillStyle =
                    "#171226";

                ctx.fillRect(
                    x,
                    y,
                    size,
                    size
                );

                ctx.fillStyle =
                    "#4a3670";

                ctx.fillRect(
                    x + padding,
                    y + padding,
                    size -
                    padding * 2,
                    size -
                    padding * 2
                );

                break;


            case "goal":
                this.drawGoal(
                    ctx,
                    x,
                    y,
                    size
                );

                break;


            case "object":
                this.drawObject(
                    ctx,
                    x,
                    y,
                    size
                );

                break;


            case "dirt":
                this.drawDirt(
                    ctx,
                    x,
                    y,
                    size
                );

                break;


            case "button":
                this.drawButtonTile(
                    ctx,
                    x,
                    y,
                    size,
                    this.game
                        .activatedButtons
                        .has(
                            this.game.positionKey(
                                row,
                                col
                            )
                        )
                );

                break;


            case "door":
                this.drawDoor(
                    ctx,
                    x,
                    y,
                    size
                );

                break;


            case "charger":
                this.drawCharger(
                    ctx,
                    x,
                    y,
                    size
                );

                break;


            case "deposit":
                this.drawDeposit(
                    ctx,
                    x,
                    y,
                    size
                );

                break;


            case "box":
                this.drawBox(
                    ctx,
                    x,
                    y,
                    size
                );

                break;


            case "box_goal":
                this.drawBoxGoal(
                    ctx,
                    x,
                    y,
                    size
                );

                break;
        }
    }


    drawGoal(
        ctx,
        x,
        y,
        size
    ) {
        const centerX =
            x +
            size / 2;

        const centerY =
            y +
            size / 2;


        ctx.save();

        ctx.fillStyle =
            "#ffe55c";

        ctx.beginPath();

        for (
            let i = 0;
            i < 8;
            i++
        ) {
            const angle =
                (
                    Math.PI * 2 *
                    i
                ) / 8 -
                Math.PI / 2;

            const radius =
                i % 2 === 0
                    ? size * 0.3
                    : size * 0.14;

            const px =
                centerX +
                Math.cos(angle) *
                radius;

            const py =
                centerY +
                Math.sin(angle) *
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

        ctx.strokeStyle =
            "#201536";

        ctx.lineWidth =
            Math.max(
                2,
                size * 0.05
            );

        ctx.stroke();

        ctx.restore();
    }


    drawObject(
        ctx,
        x,
        y,
        size
    ) {
        const w =
            size * 0.48;

        const h =
            size * 0.56;

        const px =
            x +
            (
                size -
                w
            ) / 2;

        const py =
            y +
            (
                size -
                h
            ) / 2;


        ctx.fillStyle =
            "#ff9f43";

        ctx.fillRect(
            px,
            py,
            w,
            h
        );


        ctx.fillStyle =
            "#ffe7a3";

        ctx.fillRect(
            px +
            w * 0.14,
            py +
            h * 0.12,
            w * 0.72,
            h * 0.12
        );


        ctx.strokeStyle =
            "#21162f";

        ctx.lineWidth =
            Math.max(
                2,
                size * 0.05
            );

        ctx.strokeRect(
            px,
            py,
            w,
            h
        );
    }


    drawDirt(
        ctx,
        x,
        y,
        size
    ) {
        ctx.fillStyle =
            "#795548";

        ctx.beginPath();

        ctx.arc(
            x +
            size * 0.38,
            y +
            size * 0.55,
            size * 0.18,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x +
            size * 0.58,
            y +
            size * 0.5,
            size * 0.2,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    drawButtonTile(
        ctx,
        x,
        y,
        size,
        active
    ) {
        ctx.fillStyle =
            active
                ? "#55f5a3"
                : "#ff4f91";

        ctx.fillRect(
            x +
            size * 0.24,
            y +
            size * 0.36,
            size * 0.52,
            size * 0.3
        );


        ctx.strokeStyle =
            "#1c142b";

        ctx.lineWidth =
            Math.max(
                2,
                size * 0.05
            );

        ctx.strokeRect(
            x +
            size * 0.24,
            y +
            size * 0.36,
            size * 0.52,
            size * 0.3
        );
    }


    drawDoor(
        ctx,
        x,
        y,
        size
    ) {
        ctx.fillStyle =
            "#e95ab9";

        ctx.fillRect(
            x +
            size * 0.22,
            y +
            size * 0.08,
            size * 0.56,
            size * 0.84
        );


        ctx.fillStyle =
            "#ffe55c";

        ctx.fillRect(
            x +
            size * 0.63,
            y +
            size * 0.5,
            size * 0.08,
            size * 0.08
        );


        ctx.strokeStyle =
            "#1d132d";

        ctx.lineWidth =
            Math.max(
                2,
                size * 0.05
            );

        ctx.strokeRect(
            x +
            size * 0.22,
            y +
            size * 0.08,
            size * 0.56,
            size * 0.84
        );
    }


    drawCharger(
        ctx,
        x,
        y,
        size
    ) {
        ctx.fillStyle =
            "#43f2ff";

        ctx.fillRect(
            x +
            size * 0.22,
            y +
            size * 0.22,
            size * 0.56,
            size * 0.56
        );


        ctx.fillStyle =
            "#15223e";

        ctx.beginPath();

        ctx.moveTo(
            x +
            size * 0.54,
            y +
            size * 0.28
        );

        ctx.lineTo(
            x +
            size * 0.4,
            y +
            size * 0.53
        );

        ctx.lineTo(
            x +
            size * 0.51,
            y +
            size * 0.53
        );

        ctx.lineTo(
            x +
            size * 0.44,
            y +
            size * 0.72
        );

        ctx.lineTo(
            x +
            size * 0.65,
            y +
            size * 0.45
        );

        ctx.lineTo(
            x +
            size * 0.54,
            y +
            size * 0.45
        );

        ctx.closePath();
        ctx.fill();
    }


    drawDeposit(
        ctx,
        x,
        y,
        size
    ) {
        ctx.strokeStyle =
            "#59f6b5";

        ctx.lineWidth =
            Math.max(
                3,
                size * 0.07
            );

        ctx.strokeRect(
            x +
            size * 0.18,
            y +
            size * 0.18,
            size * 0.64,
            size * 0.64
        );


        ctx.fillStyle =
            "#59f6b5";

        ctx.fillRect(
            x +
            size * 0.42,
            y +
            size * 0.31,
            size * 0.16,
            size * 0.38
        );

        ctx.fillRect(
            x +
            size * 0.31,
            y +
            size * 0.51,
            size * 0.38,
            size * 0.16
        );
    }


    drawBox(
        ctx,
        x,
        y,
        size
    ) {
        ctx.fillStyle =
            "#d98032";

        ctx.fillRect(
            x +
            size * 0.14,
            y +
            size * 0.14,
            size * 0.72,
            size * 0.72
        );


        ctx.strokeStyle =
            "#4c2818";

        ctx.lineWidth =
            Math.max(
                2,
                size * 0.055
            );

        ctx.strokeRect(
            x +
            size * 0.14,
            y +
            size * 0.14,
            size * 0.72,
            size * 0.72
        );


        ctx.beginPath();

        ctx.moveTo(
            x +
            size * 0.22,
            y +
            size * 0.22
        );

        ctx.lineTo(
            x +
            size * 0.78,
            y +
            size * 0.78
        );

        ctx.moveTo(
            x +
            size * 0.78,
            y +
            size * 0.22
        );

        ctx.lineTo(
            x +
            size * 0.22,
            y +
            size * 0.78
        );

        ctx.stroke();
    }


    drawBoxGoal(
        ctx,
        x,
        y,
        size
    ) {
        ctx.strokeStyle =
            "#ffe55c";

        ctx.lineWidth =
            Math.max(
                2,
                size * 0.055
            );

        ctx.setLineDash([
            size * 0.1,
            size * 0.07
        ]);

        ctx.strokeRect(
            x +
            size * 0.16,
            y +
            size * 0.16,
            size * 0.68,
            size * 0.68
        );

        ctx.setLineDash([]);
    }


    /* =====================================================
       ROBOT
    ===================================================== */

    drawRobot(
        ctx,
        startX,
        startY,
        tileSize
    ) {
        const robot =
            this.game?.robot;

        if (!robot) {
            return;
        }


        const position =
            typeof robot.getPosition ===
            "function"
                ? robot.getPosition()
                : {
                    row:
                        robot.row,

                    col:
                        robot.col
                };


        const x =
            startX +
            position.col *
            tileSize;

        const y =
            startY +
            position.row *
            tileSize;


        const centerX =
            x +
            tileSize / 2;

        const centerY =
            y +
            tileSize / 2;


        const bodyWidth =
            tileSize * 0.48;

        const bodyHeight =
            tileSize * 0.38;

        const headWidth =
            tileSize * 0.56;

        const headHeight =
            tileSize * 0.32;


        ctx.save();


        /*
        Ombre.
        */

        ctx.globalAlpha =
            0.25;

        ctx.fillStyle =
            "#000000";

        ctx.beginPath();

        ctx.ellipse(
            centerX,
            y +
            tileSize * 0.78,
            tileSize * 0.28,
            tileSize * 0.09,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.globalAlpha =
            1;


        /*
        Corps blanc.
        */

        ctx.fillStyle =
            "#f5f3ff";

        ctx.fillRect(
            centerX -
            bodyWidth / 2,
            centerY,
            bodyWidth,
            bodyHeight
        );


        ctx.strokeStyle =
            "#181126";

        ctx.lineWidth =
            Math.max(
                2,
                tileSize * 0.045
            );

        ctx.strokeRect(
            centerX -
            bodyWidth / 2,
            centerY,
            bodyWidth,
            bodyHeight
        );


        /*
        Cœur cyan.
        */

        ctx.fillStyle =
            "#4ff4ff";

        ctx.fillRect(
            centerX -
            tileSize * 0.08,
            centerY +
            tileSize * 0.1,
            tileSize * 0.16,
            tileSize * 0.12
        );


        /*
        Tête.
        */

        ctx.fillStyle =
            "#f7f5ff";

        ctx.fillRect(
            centerX -
            headWidth / 2,
            y +
            tileSize * 0.22,
            headWidth,
            headHeight
        );


        ctx.strokeStyle =
            "#181126";

        ctx.strokeRect(
            centerX -
            headWidth / 2,
            y +
            tileSize * 0.22,
            headWidth,
            headHeight
        );


        /*
        Visage sombre.
        */

        ctx.fillStyle =
            "#211937";

        ctx.fillRect(
            centerX -
            headWidth * 0.34,
            y +
            tileSize * 0.29,
            headWidth * 0.68,
            headHeight * 0.48
        );


        /*
        Yeux.
        */

        ctx.fillStyle =
            "#55f5ff";

        ctx.fillRect(
            centerX -
            tileSize * 0.15,
            y +
            tileSize * 0.34,
            tileSize * 0.07,
            tileSize * 0.07
        );

        ctx.fillRect(
            centerX +
            tileSize * 0.08,
            y +
            tileSize * 0.34,
            tileSize * 0.07,
            tileSize * 0.07
        );


        /*
        Direction.
        */

        this.drawRobotDirection(
            ctx,
            centerX,
            centerY,
            tileSize,
            robot.direction
        );


        ctx.restore();
    }


    drawRobotDirection(
        ctx,
        centerX,
        centerY,
        size,
        direction
    ) {
        const normalized =
            String(
                direction ||
                "EAST"
            ).toUpperCase();


        let dx = 1;
        let dy = 0;


        if (
            normalized === "NORTH" ||
            normalized === "N"
        ) {
            dx = 0;
            dy = -1;

        } else if (
            normalized === "SOUTH" ||
            normalized === "S"
        ) {
            dx = 0;
            dy = 1;

        } else if (
            normalized === "WEST" ||
            normalized === "W"
        ) {
            dx = -1;
            dy = 0;
        }


        const startX =
            centerX +
            dx *
            size * 0.24;

        const startY =
            centerY +
            dy *
            size * 0.24;


        const endX =
            centerX +
            dx *
            size * 0.42;

        const endY =
            centerY +
            dy *
            size * 0.42;


        ctx.strokeStyle =
            "#ffe55c";

        ctx.fillStyle =
            "#ffe55c";

        ctx.lineWidth =
            Math.max(
                2,
                size * 0.05
            );


        ctx.beginPath();

        ctx.moveTo(
            startX,
            startY
        );

        ctx.lineTo(
            endX,
            endY
        );

        ctx.stroke();


        const perpendicularX =
            -dy;

        const perpendicularY =
            dx;


        ctx.beginPath();

        ctx.moveTo(
            endX,
            endY
        );

        ctx.lineTo(
            endX -
            dx *
            size * 0.11 +
            perpendicularX *
            size * 0.07,

            endY -
            dy *
            size * 0.11 +
            perpendicularY *
            size * 0.07
        );

        ctx.lineTo(
            endX -
            dx *
            size * 0.11 -
            perpendicularX *
            size * 0.07,

            endY -
            dy *
            size * 0.11 -
            perpendicularY *
            size * 0.07
        );

        ctx.closePath();
        ctx.fill();
    }
}


/* =========================================================
   EXPORT
========================================================= */

window.PytUI = PytUI;