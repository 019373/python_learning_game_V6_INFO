"use strict";

/*
============================================================
PYT - ui.js

Interface navigateur :
- affichage du monde ;
- cours ;
- carte ;
- progression ;
- éditeur de code ;
- animation des actions ;
- guide Pyt ;
- erreurs pédagogiques ;
- retour au même exercice après la théorie.
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

        this.isAnimating = false;

        this.onRunCode = null;
        this.onRestart = null;
        this.onSelectLevel = null;

        this.savedCodeBeforeTheory = "";
        this.returnToExerciseAfterTheory = false;

        this.mapFirstVisit = true;

        this.guideTimeout = null;
        this.thoughtTimeout = null;

        this.cacheDOM();
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
    // DOM
    // =====================================================

    cacheDOM() {

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


        this.canvas =
            document.getElementById(
                "game-canvas"
            );

        this.ctx =
            this.canvas
                ? this.canvas.getContext("2d")
                : null;


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

        this.roomName =
            document.getElementById(
                "room-name"
            );


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


        this.mapTitle =
            document.getElementById(
                "map-title"
            );

        this.mapSubtitle =
            document.getElementById(
                "map-subtitle"
            );

        this.mapBackground =
            document.getElementById(
                "map-background"
            );

        this.mapDecoration =
            document.getElementById(
                "map-decoration"
            );

        this.mapChapterIndicator =
            document.getElementById(
                "map-chapter-indicator"
            );


        this.previousChapterButton =
            document.getElementById(
                "previous-chapter-button"
            );

        this.nextChapterButton =
            document.getElementById(
                "next-chapter-button"
            );


        this.levelNodes = [
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

        this.codeEditorWrapper =
            document.getElementById(
                "code-editor-wrapper"
            );

        this.codeErrorHighlights =
            document.getElementById(
                "code-error-highlights"
            );

        this.consoleOutput =
            document.getElementById(
                "console-output"
            );

        this.runCodeButton =
            document.getElementById(
                "run-code-button"
            );


        this.pytGuide =
            document.getElementById(
                "pyt-guide"
            );

        this.pytGuideMessage =
            document.getElementById(
                "pyt-guide-message"
            );

        this.pytGuideActions =
            document.getElementById(
                "pyt-guide-actions"
            );


        this.thoughtBubble =
            document.getElementById(
                "robot-thought-bubble"
            );


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

                    this.reviewTheory();
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

                    this.clearCode();
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

                    if (
                        this.returnToExerciseAfterTheory
                    ) {

                        const saved =
                            this.savedCodeBeforeTheory;

                        this.returnToExerciseAfterTheory =
                            false;

                        this.showGame();

                        if (
                            this.codeEditor
                        ) {

                            this.codeEditor.value =
                                saved;
                        }

                        this.showGuide(
                            "Tu es revenu au même exercice. Ton code a été conservé."
                        );

                    } else {

                        this.showMap();
                    }
                }
            );
        }


        if (mapCourseButton) {

            mapCourseButton.addEventListener(
                "click",
                () => {

                    this.showCourse();
                }
            );
        }


        if (this.previousChapterButton) {

            this.previousChapterButton.addEventListener(
                "click",
                () => {

                    this.changeMapChapter(
                        -1
                    );
                }
            );
        }


        if (this.nextChapterButton) {

            this.nextChapterButton.addEventListener(
                "click",
                () => {

                    this.changeMapChapter(
                        1
                    );
                }
            );
        }


        this.levelNodes.forEach(
            (
                node,
                index
            ) => {

                if (!node) {

                    return;
                }

                node.addEventListener(
                    "click",
                    () => {

                        this.selectExercise(
                            index + 1
                        );
                    }
                );
            }
        );


        if (this.codeEditor) {

            this.codeEditor.addEventListener(
                "input",
                () => {

                    this.clearCodeError();
                }
            );


            this.codeEditor.addEventListener(
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
                            this.codeEditor
                                .value;

                        this.codeEditor.value =
                            value.slice(
                                0,
                                start
                            ) +
                            "    " +
                            value.slice(
                                end
                            );

                        this.codeEditor
                            .selectionStart =
                            start + 4;

                        this.codeEditor
                            .selectionEnd =
                            start + 4;
                    }


                    if (
                        event.ctrlKey &&
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        this.requestRunCode();
                    }
                }
            );
        }
    }


    // =====================================================
    // GAME / LEVEL
    // =====================================================

    setGame(game) {

        this.game =
            game;

        this.resizeCanvas();
        this.drawWorld();
    }


    setLevel(level) {

        this.level =
            level;

        if (!level) {

            return;
        }

        this.currentChapter =
            Number(
                level.chapter
            );

        this.currentExercise =
            Number(
                level.exercise
            );

        this.refreshLevelInformation();

        if (
            this.codeEditor
        ) {

            this.codeEditor.value =
                level.starterCode ||
                "";
        }

        this.clearCodeError();

        this.setConsole(
            "Prêt."
        );

        this.setStatus(
            "PRÊT"
        );

        this.hideThought();

        this.drawWorld();
    }


    refreshLevelInformation() {

        if (!this.level) {

            return;
        }


        if (
            this.chapterBadge
        ) {

            this.chapterBadge.textContent =
                `CHAPITRE ${this.currentChapter}`;
        }


        if (
            this.difficultyBadge
        ) {

            this.difficultyBadge.textContent =
                this.getDifficultyLabel(
                    this.level.difficulty
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


        if (
            this.roomName
        ) {

            this.roomName.textContent =
                (
                    this.level.room ||
                    this.getRoomName(
                        this.currentChapter
                    )
                ).toUpperCase();
        }
    }


    getDifficultyLabel(
        difficulty
    ) {

        switch (
            String(
                difficulty
            ).toLowerCase()
        ) {

            case "easy":
                return "FACILE";

            case "medium":
                return "MOYEN";

            case "hard":
                return "DIFFICILE";

            default:
                return String(
                    difficulty ||
                    ""
                ).toUpperCase();
        }
    }


    getRoomName(chapter) {

        const rooms = {

            1:
                "Entrée",

            2:
                "Cuisine",

            3:
                "Salon",

            4:
                "Bibliothèque",

            5:
                "Salle de bain",

            6:
                "Chambre",

            7:
                "Atelier",

            8:
                "Grenier",

            9:
                "Laboratoire"
        };

        return (
            rooms[
                Number(chapter)
            ] ||
            "Maison"
        );
    }


    // =====================================================
    // ÉCRANS
    // =====================================================

    hideGameScreens() {

        if (
            this.gameScreen
        ) {

            this.gameScreen.classList.add(
                "hidden"
            );
        }

        if (
            this.chapterScreen
        ) {

            this.chapterScreen.classList.add(
                "hidden"
            );
        }

        if (
            this.mapScreen
        ) {

            this.mapScreen.classList.add(
                "hidden"
            );
        }
    }


    showGame() {

        this.hideGameScreens();

        if (
            this.gameScreen
        ) {

            this.gameScreen.classList.remove(
                "hidden"
            );
        }

        requestAnimationFrame(
            () => {

                this.resizeCanvas();
                this.drawWorld();
            }
        );
    }


    showMap() {

        this.hideGameScreens();

        if (
            this.mapScreen
        ) {

            this.mapScreen.classList.remove(
                "hidden"
            );
        }

        this.refreshMap();


        if (
            this.mapFirstVisit
        ) {

            this.mapFirstVisit =
                false;

            this.showGuide(
                "Voici la carte de la maison. Clique sur l'exercice 1 pour commencer. Les exercices suivants se débloquent progressivement."
            );
        }
    }


    showCourse() {

        this.hideGameScreens();

        if (
            this.chapterScreen
        ) {

            this.chapterScreen.classList.remove(
                "hidden"
            );
        }

        this.renderCourse(
            this.currentChapter
        );

        this.seenCourses.add(
            this.currentChapter
        );
    }


    showCourseAtChapterStart() {

        if (
            this.seenCourses.has(
                this.currentChapter
            )
        ) {

            return false;
        }

        this.showCourse();

        return true;
    }


    // =====================================================
    // COURS
    // =====================================================

    renderCourse(chapter) {

        const courses =
            this.getCourseData();

        const course =
            courses[
                Number(chapter)
            ];

        if (!course) {

            return;
        }


        if (
            this.courseChapterNumber
        ) {

            this.courseChapterNumber
                .textContent =
                `CHAPITRE ${chapter}`;
        }


        if (
            this.courseTitle
        ) {

            this.courseTitle
                .textContent =
                course.title;
        }


        if (
            this.courseSubtitle
        ) {

            this.courseSubtitle
                .textContent =
                course.subtitle;
        }


        if (
            this.courseContent
        ) {

            this.courseContent.innerHTML =
                "";

            for (
                const card
                of course.cards
            ) {

                const element =
                    document.createElement(
                        "article"
                    );

                element.className =
                    "course-card";

                const title =
                    document.createElement(
                        "h3"
                    );

                title.textContent =
                    card.title;

                const text =
                    document.createElement(
                        "p"
                    );

                text.innerHTML =
                    card.text;

                element.appendChild(
                    title
                );

                element.appendChild(
                    text
                );


                if (
                    card.code
                ) {

                    const pre =
                        document.createElement(
                            "pre"
                        );

                    pre.textContent =
                        card.code;

                    element.appendChild(
                        pre
                    );
                }


                this.courseContent
                    .appendChild(
                        element
                    );
            }
        }
    }


    getCourseData() {

        return {

            1: {

                title:
                    "Déplacer Pyt",

                subtitle:
                    "Apprends à contrôler les déplacements du robot.",

                cards: [

                    {
                        title:
                            "Avancer",

                        text:
                            "La commande <code>forward()</code> fait avancer Pyt dans la direction qu'il regarde.",

                        code:
`forward(1)
forward(3)`
                    },

                    {
                        title:
                            "Reculer",

                        text:
                            "<code>backward()</code> permet de reculer sans changer la direction de Pyt.",

                        code:
`backward(1)`
                    },

                    {
                        title:
                            "Tourner",

                        text:
                            "Utilise <code>right(90)</code> ou <code>left(90)</code> pour tourner de 90 degrés.",

                        code:
`right(90)
forward(2)

left(90)
forward(1)`
                    }
                ]
            },


            2: {

                title:
                    "Variables et calculs",

                subtitle:
                    "Stocke des informations et réutilise-les dans ton programme.",

                cards: [

                    {
                        title:
                            "Créer une variable",

                        text:
                            "Une variable permet de donner un nom à une valeur.",

                        code:
`distance = 3
forward(distance)`
                    },

                    {
                        title:
                            "Faire des calculs",

                        text:
                            "Python peut calculer avec <code>+</code>, <code>-</code>, <code>*</code> et <code>/</code>.",

                        code:
`a = 2
b = 3
distance = a + b`
                    },

                    {
                        title:
                            "Conversions",

                        text:
                            "Tu peux convertir une valeur avec <code>int()</code>, <code>float()</code> ou <code>str()</code>.",

                        code:
`nombre = int("4")
texte = str(nombre)`
                    }
                ]
            },


            3: {

                title:
                    "Conditions",

                subtitle:
                    "Fais prendre des décisions à ton programme.",

                cards: [

                    {
                        title:
                            "if",

                        text:
                            "Le bloc sous <code>if</code> est exécuté seulement si la condition est vraie.",

                        code:
`distance = 3

if distance == 3:
    forward(distance)`
                    },

                    {
                        title:
                            "else et elif",

                        text:
                            "<code>else</code> donne une autre possibilité. <code>elif</code> permet d'ajouter d'autres tests.",

                        code:
`choix = 2

if choix == 1:
    left(90)
elif choix == 2:
    right(90)
else:
    forward(1)`
                    },

                    {
                        title:
                            "and / or / not",

                        text:
                            "Ces mots permettent de combiner ou inverser plusieurs conditions.",

                        code:
`porte = True
cle = True

if porte and cle:
    forward(1)`
                    }
                ]
            },


            4: {

                title:
                    "Boucles for",

                subtitle:
                    "Répète automatiquement des instructions.",

                cards: [

                    {
                        title:
                            "for",

                        text:
                            "Une boucle <code>for</code> répète le bloc indenté.",

                        code:
`for i in range(4):
    forward(1)`
                    },

                    {
                        title:
                            "range()",

                        text:
                            "<code>range()</code> permet de choisir combien de fois la boucle se répète.",

                        code:
`for i in range(3):
    forward(1)`
                    },

                    {
                        title:
                            "Plusieurs actions",

                        text:
                            "Une boucle peut répéter plusieurs commandes.",

                        code:
`for i in range(2):
    forward(2)
    right(90)`
                    }
                ]
            },


            5: {

                title:
                    "Boucles while",

                subtitle:
                    "Répète tant qu'une condition reste vraie.",

                cards: [

                    {
                        title:
                            "while",

                        text:
                            "<code>while</code> répète un bloc tant que sa condition vaut vrai.",

                        code:
`distance = 0

while distance < 3:
    forward(1)
    distance += 1`
                    },

                    {
                        title:
                            "Faire évoluer la condition",

                        text:
                            "La condition doit pouvoir devenir fausse, sinon la boucle ne s'arrête jamais.",

                        code:
`compteur = 0

while compteur < 4:
    forward(1)
    compteur += 1`
                    },

                    {
                        title:
                            "break",

                        text:
                            "<code>break</code> permet de quitter immédiatement une boucle.",

                        code:
`compteur = 0

while True:
    forward(1)
    compteur += 1

    if compteur == 3:
        break`
                    }
                ]
            },


            6: {

                title:
                    "Listes",

                subtitle:
                    "Stocke plusieurs valeurs dans une seule variable.",

                cards: [

                    {
                        title:
                            "Créer une liste",

                        text:
                            "Une liste utilise des crochets et peut contenir plusieurs valeurs.",

                        code:
`distances = [2, 3, 1]`
                    },

                    {
                        title:
                            "Les indices",

                        text:
                            "Le premier élément d'une liste est à l'indice <code>0</code>.",

                        code:
`distances = [2, 3, 1]

forward(distances[0])`
                    },

                    {
                        title:
                            "Parcourir une liste",

                        text:
                            "Une boucle <code>for</code> peut parcourir directement les valeurs d'une liste.",

                        code:
`trajet = [2, 3, 1]

for distance in trajet:
    forward(distance)`
                    }
                ]
            },


            7: {

                title:
                    "Fonctions",

                subtitle:
                    "Crée tes propres commandes réutilisables.",

                cards: [

                    {
                        title:
                            "def",

                        text:
                            "Le mot <code>def</code> permet de créer une fonction.",

                        code:
`def avancer():
    forward(2)

avancer()`
                    },

                    {
                        title:
                            "Paramètres",

                        text:
                            "Un paramètre permet de donner une valeur différente à chaque appel.",

                        code:
`def avancer(distance):
    forward(distance)

avancer(3)`
                    },

                    {
                        title:
                            "Réutiliser",

                        text:
                            "Une fonction peut être appelée plusieurs fois.",

                        code:
`def tourner():
    right(90)

tourner()
forward(2)
tourner()`
                    }
                ]
            },


            8: {

                title:
                    "Tout combiner",

                subtitle:
                    "Utilise plusieurs notions dans le même programme.",

                cards: [

                    {
                        title:
                            "Organiser",

                        text:
                            "Un bon programme peut séparer les données, les fonctions et les actions.",

                        code:
`trajet = [2, 3]

def avancer(distance):
    forward(distance)

for distance in trajet:
    avancer(distance)`
                    },

                    {
                        title:
                            "Choisir les bons outils",

                        text:
                            "Utilise une variable pour une valeur, une boucle pour une répétition et une fonction pour une action réutilisable."
                    },

                    {
                        title:
                            "Plusieurs solutions",

                        text:
                            "Il n'existe pas toujours une seule bonne façon d'écrire un programme. L'objectif est d'obtenir le bon résultat en utilisant correctement les notions demandées."
                    }
                ]
            },


            9: {

                title:
                    "Examen final",

                subtitle:
                    "Aucune nouvelle notion : utilise tout ce que tu as appris.",

                cards: [

                    {
                        title:
                            "Prépare ton trajet",

                        text:
                            "Observe la carte avant d'écrire ton programme. Repère les objets, les obstacles, les boutons et la case finale."
                    },

                    {
                        title:
                            "Organise ton programme",

                        text:
                            "Tu peux utiliser les variables, conditions, boucles, listes et fonctions des chapitres précédents."
                    },

                    {
                        title:
                            "Teste et corrige",

                        text:
                            "Si Pyt n'arrive pas au bon endroit, observe exactement où il s'arrête puis corrige ton programme."
                    }
                ]
            }
        };
    }


    // =====================================================
    // RETOUR THÉORIE
    // =====================================================

    reviewTheory() {

        this.savedCodeBeforeTheory =
            this.codeEditor
                ? this.codeEditor.value
                : "";

        this.returnToExerciseAfterTheory =
            Boolean(
                this.level
            );

        this.showCourse();
    }


    // =====================================================
    // CARTE
    // =====================================================

    refreshMap() {

        const chapter =
            Number(
                this.currentChapter
            );


        if (
            this.mapTitle
        ) {

            this.mapTitle.textContent =
                `Chapitre ${chapter} — ${this.getRoomName(chapter).toUpperCase()}`;
        }


        if (
            this.mapSubtitle
        ) {

            this.mapSubtitle.textContent =
                "Choisis un exercice.";
        }


        if (
            this.mapChapterIndicator
        ) {

            this.mapChapterIndicator.textContent =
                `${chapter} / 9`;
        }


        if (
            this.mapBackground
        ) {

            for (
                let i = 1;
                i <= 9;
                i++
            ) {

                this.mapBackground
                    .classList
                    .remove(
                        `chapter-theme-${i}`
                    );
            }

            this.mapBackground
                .classList
                .add(
                    `chapter-theme-${chapter}`
                );
        }


        if (
            this.mapDecoration
        ) {

            this.mapDecoration.textContent =
                this.getRoomDecoration(
                    chapter
                );
        }


        for (
            let exercise = 1;
            exercise <= 3;
            exercise++
        ) {

            this.refreshLevelNode(
                exercise
            );
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
                !this.canOpenChapter(
                    chapter + 1
                );
        }
    }


    getRoomDecoration(chapter) {

        const decorations = {

            1:
                "▥   ▣   ▤   ▥",

            2:
                "▦   ▤   ▧   ▦",

            3:
                "▣   ▰   ▣   ▱",

            4:
                "▥   ▥   ▥   ▥",

            5:
                "▧   ◇   ▧   ◇",

            6:
                "▰   ▣   ▰   ▣",

            7:
                "⚙   ▤   ⚙   ▤",

            8:
                "▱   ▣   ▱   ▣",

            9:
                "◇   ⚙   ◇   ⚙"
        };

        return (
            decorations[
                Number(chapter)
            ] ||
            "▣   ▣   ▣"
        );
    }


    refreshLevelNode(
        exercise
    ) {

        const node =
            this.levelNodes[
                exercise - 1
            ];

        if (!node) {

            return;
        }

        const key =
            `${this.currentChapter}-${exercise}`;

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
            "unlocked",
            unlocked
        );

        node.classList.toggle(
            "completed",
            completed
        );


        const state =
            node.querySelector(
                ".level-state"
            );

        if (state) {

            if (completed) {

                state.textContent =
                    "REJOUER";

            } else if (
                unlocked
            ) {

                state.textContent =
                    "JOUER";

            } else {

                state.textContent =
                    "VERROUILLÉ";
            }
        }
    }


    canOpenChapter(chapter) {

        chapter =
            Number(chapter);

        if (
            chapter <= 1
        ) {

            return true;
        }

        if (
            chapter > 9
        ) {

            return false;
        }

        /*
        Un chapitre est disponible dès que
        son premier exercice est débloqué.
        */

        return this.unlockedLevels.has(
            `${chapter}-1`
        );
    }


    changeMapChapter(direction) {

        const target =
            this.currentChapter +
            Number(direction);

        if (
            target < 1 ||
            target > 9
        ) {

            return;
        }

        if (
            target > this.currentChapter &&
            !this.canOpenChapter(
                target
            )
        ) {

            this.showGuide(
                "Termine d'abord le chapitre actuel pour débloquer la pièce suivante."
            );

            return;
        }

        this.currentChapter =
            target;

        this.currentExercise = 1;

        this.refreshMap();
    }


    selectExercise(exercise) {

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
            Number(exercise);

        this.clearCodeError();
        this.hideThought();

        if (
            typeof this.onSelectLevel ===
            "function"
        ) {

            this.onSelectLevel(
                this.currentChapter,
                this.currentExercise
            );
        }
    }


    // =====================================================
    // PROGRESSION
    // =====================================================

    completeCurrentLevel() {

        const chapter =
            Number(
                this.currentChapter
            );

        const exercise =
            Number(
                this.currentExercise
            );

        const key =
            `${chapter}-${exercise}`;


        this.completedLevels.add(
            key
        );


        if (
            exercise < 3
        ) {

            const nextKey =
                `${chapter}-${exercise + 1}`;

            this.unlockedLevels.add(
                nextKey
            );


            this.showGuide(
                "Bravo ! L'exercice suivant est maintenant débloqué.",
                [
                    {
                        label:
                            "VOIR LA CARTE",

                        action:
                            () => {

                                this.showMap();
                            }
                    },

                    {
                        label:
                            "REJOUER",

                        action:
                            () => {

                                this.requestRestart();
                            }
                    }
                ]
            );

            return;
        }


        /*
        Fin d'un chapitre.
        */

        if (
            chapter < 9
        ) {

            const nextChapter =
                chapter + 1;

            this.unlockedLevels.add(
                `${nextChapter}-1`
            );


            this.showGuide(
                `Chapitre ${chapter} terminé ! La pièce suivante de la maison est débloquée.`,
                [
                    {
                        label:
                            "CHAPITRE SUIVANT",

                        action:
                            () => {

                                this.currentChapter =
                                    nextChapter;

                                this.currentExercise =
                                    1;

                                this.showCourse();
                            }
                    },

                    {
                        label:
                            "VOIR LA CARTE",

                        action:
                            () => {

                                this.showMap();
                            }
                    }
                ]
            );

            return;
        }


        /*
        Fin du jeu.
        */

        this.showGuide(
            "Tu as terminé les 9 chapitres de PYT ! Bravo, la maison est entièrement terminée.",
            [
                {
                    label:
                        "VOIR LA CARTE",

                    action:
                        () => {

                            this.showMap();
                        }
                },

                {
                    label:
                        "REJOUER",

                    action:
                        () => {

                            this.requestRestart();
                        }
                }
            ]
        );
    }


    // =====================================================
    // ESSAIS / ERREURS
    // =====================================================

    registerAttempt() {

        const key =
            `${this.currentChapter}-${this.currentExercise}`;

        const current =
            this.attempts.get(
                key
            ) || 0;

        const next =
            current + 1;

        this.attempts.set(
            key,
            next
        );

        return next;
    }


    getAttemptCount() {

        const key =
            `${this.currentChapter}-${this.currentExercise}`;

        return (
            this.attempts.get(
                key
            ) || 0
        );
    }


    handleFailedAttempt(
        details = {}
    ) {

        const attempt =
            this.getAttemptCount();

        const message =
            details.message ||
            "La mission n'est pas encore terminée.";


        /*
        PREMIER ÉCHEC :
        pas de ligne rouge immédiatement.
        On propose d'abord de revoir la théorie.
        */

        if (
            attempt <= 1
        ) {

            this.clearCodeError();

            this.showGuide(
                `${message} Tu peux réessayer ou revoir la théorie du chapitre.`,
                [
                    {
                        label:
                            "RÉESSAYER",

                        action:
                            () => {

                                this.openCodeWindow();
                            }
                    },

                    {
                        label:
                            "REVOIR LA THÉORIE",

                        action:
                            () => {

                                this.reviewTheory();
                            }
                    }
                ]
            );

            return;
        }


        /*
        À PARTIR DU DEUXIÈME ÉCHEC :
        on souligne seulement si on connaît
        réellement une ligne techniquement liée
        à l'erreur.
        */

        const technicalTypes =
            new Set([
                "python_error",
                "blocked"
            ]);


        if (
            technicalTypes.has(
                details.type
            ) &&
            Number.isInteger(
                Number(
                    details.line
                )
            )
        ) {

            this.highlightCodeLine(
                Number(
                    details.line
                )
            );
        } else {

            /*
            Une bonne syntaxe qui mène au mauvais
            endroit ne doit pas être marquée
            arbitrairement comme fausse.
            */

            this.clearCodeError();
        }


        this.showGuide(
            message,
            [
                {
                    label:
                        "CORRIGER",

                    action:
                        () => {

                            this.openCodeWindow();
                        }
                },

                {
                    label:
                        "REVOIR LA THÉORIE",

                    action:
                        () => {

                            this.reviewTheory();
                        }
                }
            ]
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
            !this.pytGuide ||
            !this.pytGuideMessage
        ) {

            return;
        }

        clearTimeout(
            this.guideTimeout
        );


        this.pytGuideMessage
            .textContent =
            message;


        if (
            this.pytGuideActions
        ) {

            this.pytGuideActions
                .innerHTML =
                "";

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
                    "pyt-guide-action";

                button.textContent =
                    action.label;


                button.addEventListener(
                    "click",
                    () => {

                        if (
                            typeof action.action ===
                            "function"
                        ) {

                            action.action();
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
            .remove(
                "hidden"
            );
    }


    hideGuide() {

        if (
            this.pytGuide
        ) {

            this.pytGuide
                .classList
                .add(
                    "hidden"
                );
        }
    }


    // =====================================================
    // BULLE DE PENSÉE
    // =====================================================

    showThought(
        message
    ) {

        if (
            !this.thoughtBubble
        ) {

            return;
        }

        clearTimeout(
            this.thoughtTimeout
        );

        this.thoughtBubble
            .textContent =
            message;

        this.thoughtBubble
            .classList
            .remove(
                "hidden"
            );


        this.thoughtTimeout =
            setTimeout(
                () => {

                    this.hideThought();
                },
                4500
            );
    }


    hideThought() {

        clearTimeout(
            this.thoughtTimeout
        );

        if (
            this.thoughtBubble
        ) {

            this.thoughtBubble
                .classList
                .add(
                    "hidden"
                );
        }
    }


    // =====================================================
    // CODE
    // =====================================================

    openCodeWindow() {

        if (
            !this.codeWindow
        ) {

            return;
        }

        this.codeWindow
            .classList
            .remove(
                "hidden"
            );


        if (
            this.codeEditor
        ) {

            setTimeout(
                () => {

                    this.codeEditor.focus();
                },
                0
            );
        }
    }


    closeCodeWindow() {

        if (
            this.codeWindow
        ) {

            this.codeWindow
                .classList
                .add(
                    "hidden"
                );
        }
    }


    clearCode() {

        if (
            this.codeEditor
        ) {

            this.codeEditor.value =
                "";

            this.clearCodeError();

            this.codeEditor.focus();
        }
    }


    requestRunCode() {

        if (
            this.isAnimating
        ) {

            return;
        }

        const code =
            this.codeEditor
                ? this.codeEditor.value
                : "";

        this.registerAttempt();

        this.clearCodeError();
        this.hideThought();

        if (
            typeof this.onRunCode ===
            "function"
        ) {

            this.onRunCode(
                code
            );
        }
    }


    requestRestart() {

        if (
            this.isAnimating
        ) {

            return;
        }

        this.clearCodeError();
        this.hideThought();

        if (
            typeof this.onRestart ===
            "function"
        ) {

            this.onRestart();
        }
    }


    setConsole(text) {

        if (
            this.consoleOutput
        ) {

            this.consoleOutput.textContent =
                String(
                    text ?? ""
                );
        }
    }


    setStatus(text) {

        if (
            this.gameStatus
        ) {

            this.gameStatus.textContent =
                String(
                    text || ""
                ).toUpperCase();
        }
    }


    // =====================================================
    // ERREUR DANS L'ÉDITEUR
    // =====================================================

    clearCodeError() {

        if (
            this.codeErrorHighlights
        ) {

            this.codeErrorHighlights
                .innerHTML =
                "";
        }

        if (
            this.codeEditor
        ) {

            this.codeEditor
                .classList
                .remove(
                    "has-code-error"
                );
        }
    }


    highlightCodeLine(
        lineNumber
    ) {

        if (
            !this.codeEditor ||
            !this.codeErrorHighlights
        ) {

            return;
        }

        const line =
            Number(
                lineNumber
            );

        if (
            !Number.isInteger(line) ||
            line < 1
        ) {

            return;
        }


        this.clearCodeError();


        const style =
            window.getComputedStyle(
                this.codeEditor
            );

        const lineHeight =
            parseFloat(
                style.lineHeight
            ) || 22;


        const highlight =
            document.createElement(
                "div"
            );

        highlight.className =
            "code-error-line";


        highlight.style.top =
            `${(line - 1) * lineHeight}px`;

        highlight.style.height =
            `${lineHeight}px`;


        this.codeErrorHighlights
            .appendChild(
                highlight
            );


        this.codeEditor
            .classList
            .add(
                "has-code-error"
            );


        /*
        On déplace aussi doucement la zone visible
        vers la ligne concernée.
        */

        const targetScroll =
            Math.max(
                0,
                (
                    line - 3
                ) *
                lineHeight
            );

        this.codeEditor.scrollTop =
            targetScroll;
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
            this.isAnimating
        ) {

            return;
        }


        const queue =
            Array.isArray(
                actions
            )
                ? [...actions]
                : [];


        this.isAnimating =
            true;

        this.setStatus(
            "EXÉCUTION..."
        );


        let index = 0;


        const finish = (
            completed,
            details = null
        ) => {

            this.isAnimating =
                false;

            this.drawWorld();

            if (
                typeof onFinished ===
                "function"
            ) {

                onFinished(
                    completed,
                    details
                );
            }
        };


        const next = () => {

            if (
                index >=
                queue.length
            ) {

                finish(
                    true,
                    null
                );

                return;
            }


            const action =
                queue[index];

            index++;


            let result = true;


            try {

                result =
                    performAction(
                        action
                    );

            } catch (error) {

                finish(
                    false,
                    {
                        action,
                        error
                    }
                );

                return;
            }


            this.drawWorld();


            if (
                result === false
            ) {

                finish(
                    false,
                    {
                        action
                    }
                );

                return;
            }


            setTimeout(
                next,
                this.actionDelay
            );
        };


        /*
        Petit délai avant la première action
        pour que l'élève voie clairement le départ.
        */

        setTimeout(
            next,
            120
        );
    }


    // =====================================================
    // CANVAS
    // =====================================================

    resizeCanvas() {

        if (
            !this.canvas
        ) {

            return;
        }

        const parent =
            this.canvas.parentElement;

        if (!parent) {

            return;
        }

        const rect =
            parent.getBoundingClientRect();


        const width =
            Math.max(
                320,
                Math.floor(
                    rect.width
                )
            );

        const height =
            Math.max(
                280,
                Math.floor(
                    rect.height
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
    }


    drawWorld() {

        if (
            !this.ctx ||
            !this.canvas
        ) {

            return;
        }


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


        if (
            !this.level ||
            !Array.isArray(
                this.level.grid
            )
        ) {

            return;
        }


        const grid =
            this.level.grid;

        const rows =
            grid.length;

        const cols =
            rows > 0
                ? grid[0].length
                : 0;


        if (
            rows === 0 ||
            cols === 0
        ) {

            return;
        }


        const availableWidth =
            width * 0.88;

        const availableHeight =
            height * 0.80;


        const cellSize =
            Math.max(
                18,
                Math.floor(
                    Math.min(
                        availableWidth /
                        cols,

                        availableHeight /
                        rows
                    )
                )
            );


        const boardWidth =
            cols *
            cellSize;

        const boardHeight =
            rows *
            cellSize;


        const offsetX =
            Math.floor(
                (
                    width -
                    boardWidth
                ) /
                2
            );

        const offsetY =
            Math.floor(
                (
                    height -
                    boardHeight
                ) /
                2
            );


        this.drawRoomDecorations(
            ctx,
            width,
            height,
            cellSize
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

                const type =
                    this.getTileType(
                        row,
                        col
                    );


                this.drawTile(
                    ctx,
                    type,
                    offsetX +
                        col *
                        cellSize,
                    offsetY +
                        row *
                        cellSize,
                    cellSize,
                    row,
                    col
                );
            }
        }


        const robotPosition =
            this.getRobotPosition();


        if (
            robotPosition
        ) {

            this.drawRobot(
                ctx,
                offsetX +
                    robotPosition.col *
                    cellSize,
                offsetY +
                    robotPosition.row *
                    cellSize,
                cellSize,
                this.getRobotDirection()
            );
        }
    }


    // =====================================================
    // FOND DES PIÈCES
    // =====================================================

    drawRoomBackground(
        ctx,
        width,
        height
    ) {

        const chapter =
            Number(
                this.currentChapter
            );


        const palettes = {

            1: [
                "#241833",
                "#3b2546"
            ],

            2: [
                "#2d1c2a",
                "#53323b"
            ],

            3: [
                "#15253a",
                "#1d4658"
            ],

            4: [
                "#291d26",
                "#51382e"
            ],

            5: [
                "#123044",
                "#175567"
            ],

            6: [
                "#241a3c",
                "#44305a"
            ],

            7: [
                "#20232b",
                "#4a3b31"
            ],

            8: [
                "#251c26",
                "#533a30"
            ],

            9: [
                "#101c2a",
                "#174557"
            ]
        };


        const palette =
            palettes[chapter] ||
            palettes[1];


        ctx.fillStyle =
            palette[0];

        ctx.fillRect(
            0,
            0,
            width,
            height
        );


        /*
        Bandes pixelisées du mur.
        */

        ctx.fillStyle =
            palette[1];

        const bandHeight = 24;

        for (
            let y = 0;
            y < height;
            y += bandHeight * 2
        ) {

            ctx.fillRect(
                0,
                y,
                width,
                bandHeight
            );
        }


        /*
        Sol.
        */

        ctx.fillStyle =
            "rgba(0, 0, 0, 0.18)";

        ctx.fillRect(
            0,
            height * 0.72,
            width,
            height * 0.28
        );
    }


    drawRoomDecorations(
        ctx,
        width,
        height,
        cellSize
    ) {

        const chapter =
            Number(
                this.currentChapter
            );


        ctx.save();

        ctx.globalAlpha =
            0.75;


        switch (chapter) {

            // -----------------------------------------
            // ENTRÉE
            // -----------------------------------------

            case 1:

                this.drawPixelRect(
                    ctx,
                    25,
                    30,
                    75,
                    120,
                    "#4f2e48",
                    "#08070d"
                );

                this.drawPixelRect(
                    ctx,
                    width - 100,
                    45,
                    50,
                    75,
                    "#365641",
                    "#08070d"
                );

                break;


            // -----------------------------------------
            // CUISINE
            // -----------------------------------------

            case 2:

                this.drawPixelRect(
                    ctx,
                    20,
                    35,
                    115,
                    60,
                    "#9c5549",
                    "#08070d"
                );

                this.drawPixelRect(
                    ctx,
                    width - 145,
                    35,
                    110,
                    60,
                    "#d9c6a2",
                    "#08070d"
                );

                break;


            // -----------------------------------------
            // SALON
            // -----------------------------------------

            case 3:

                this.drawPixelRect(
                    ctx,
                    25,
                    height - 120,
                    145,
                    60,
                    "#7b3f63",
                    "#08070d"
                );

                this.drawPixelRect(
                    ctx,
                    width - 110,
                    30,
                    70,
                    85,
                    "#264c5d",
                    "#08070d"
                );

                break;


            // -----------------------------------------
            // BIBLIOTHÈQUE
            // -----------------------------------------

            case 4:

                for (
                    let i = 0;
                    i < 4;
                    i++
                ) {

                    this.drawPixelRect(
                        ctx,
                        20 +
                            i *
                            28,
                        25,
                        22,
                        95,
                        i % 2 === 0
                            ? "#9f594b"
                            : "#d0a65a",
                        "#08070d"
                    );
                }

                break;


            // -----------------------------------------
            // SALLE DE BAIN
            // -----------------------------------------

            case 5:

                for (
                    let x = 15;
                    x < width;
                    x += 35
                ) {

                    ctx.fillStyle =
                        "rgba(90, 210, 225, 0.16)";

                    ctx.fillRect(
                        x,
                        20,
                        2,
                        110
                    );
                }

                break;


            // -----------------------------------------
            // CHAMBRE
            // -----------------------------------------

            case 6:

                this.drawPixelRect(
                    ctx,
                    25,
                    height - 125,
                    150,
                    70,
                    "#76548d",
                    "#08070d"
                );

                this.drawPixelRect(
                    ctx,
                    width - 95,
                    30,
                    55,
                    80,
                    "#4b3568",
                    "#08070d"
                );

                break;


            // -----------------------------------------
            // ATELIER
            // -----------------------------------------

            case 7:

                this.drawGear(
                    ctx,
                    70,
                    65,
                    30
                );

                this.drawGear(
                    ctx,
                    width - 80,
                    95,
                    22
                );

                break;


            // -----------------------------------------
            // GRENIER
            // -----------------------------------------

            case 8:

                this.drawPixelRect(
                    ctx,
                    25,
                    35,
                    65,
                    55,
                    "#73533f",
                    "#08070d"
                );

                this.drawPixelRect(
                    ctx,
                    width - 110,
                    height - 115,
                    75,
                    60,
                    "#624432",
                    "#08070d"
                );

                break;


            // -----------------------------------------
            // LABORATOIRE
            // -----------------------------------------

            case 9:

                this.drawPixelRect(
                    ctx,
                    20,
                    25,
                    110,
                    65,
                    "#183f51",
                    "#08070d"
                );

                ctx.fillStyle =
                    "#39d9e6";

                ctx.fillRect(
                    40,
                    42,
                    12,
                    12
                );

                ctx.fillStyle =
                    "#ff4fa3";

                ctx.fillRect(
                    65,
                    42,
                    12,
                    12
                );

                ctx.fillStyle =
                    "#ffd447";

                ctx.fillRect(
                    90,
                    42,
                    12,
                    12
                );

                break;
        }


        ctx.restore();
    }


    drawPixelRect(
        ctx,
        x,
        y,
        width,
        height,
        fill,
        border
    ) {

        ctx.fillStyle =
            border;

        ctx.fillRect(
            x - 4,
            y - 4,
            width + 8,
            height + 8
        );

        ctx.fillStyle =
            fill;

        ctx.fillRect(
            x,
            y,
            width,
            height
        );
    }


    drawGear(
        ctx,
        centerX,
        centerY,
        radius
    ) {

        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            centerX - radius - 4,
            centerY - 7,
            radius * 2 + 8,
            14
        );

        ctx.fillRect(
            centerX - 7,
            centerY - radius - 4,
            14,
            radius * 2 + 8
        );


        ctx.fillStyle =
            "#b78c55";

        ctx.fillRect(
            centerX - radius,
            centerY - 5,
            radius * 2,
            10
        );

        ctx.fillRect(
            centerX - 5,
            centerY - radius,
            10,
            radius * 2
        );


        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            centerX - 5,
            centerY - 5,
            10,
            10
        );
    }


    // =====================================================
    // TUILES
    // =====================================================

    getTileType(
        row,
        col
    ) {

        if (
            this.game &&
            typeof this.game.getTileType ===
            "function"
        ) {

            return this.game.getTileType(
                row,
                col
            );
        }


        return (
            this.level?.grid?.[row]?.[col] ||
            "floor"
        );
    }


    drawTile(
        ctx,
        type,
        x,
        y,
        size,
        row,
        col
    ) {

        /*
        Sol.
        */

        ctx.fillStyle =
            (
                row + col
            ) % 2 === 0
                ? "#312a3e"
                : "#393148";

        ctx.fillRect(
            x,
            y,
            size,
            size
        );


        ctx.strokeStyle =
            "rgba(8, 7, 13, 0.45)";

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


        switch (type) {

            case "wall":
                this.drawWall(
                    ctx,
                    x,
                    y,
                    size
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
                this.drawButton(
                    ctx,
                    x,
                    y,
                    size
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
        }
    }


    drawWall(
        ctx,
        x,
        y,
        size
    ) {

        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            x,
            y,
            size,
            size
        );


        const margin =
            size * 0.08;

        ctx.fillStyle =
            "#554963";

        ctx.fillRect(
            x + margin,
            y + margin,
            size - margin * 2,
            size - margin * 2
        );


        ctx.fillStyle =
            "#6c5d7b";

        ctx.fillRect(
            x + margin,
            y + margin,
            size - margin * 2,
            size * 0.18
        );


        ctx.fillStyle =
            "#332b3d";

        ctx.fillRect(
            x + size * 0.18,
            y + size * 0.47,
            size * 0.64,
            size * 0.08
        );
    }


    drawGoal(
        ctx,
        x,
        y,
        size
    ) {

        const margin =
            size * 0.17;

        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            x + margin - 3,
            y + margin - 3,
            size - margin * 2 + 6,
            size - margin * 2 + 6
        );


        ctx.fillStyle =
            "#ffd447";

        ctx.fillRect(
            x + margin,
            y + margin,
            size - margin * 2,
            size - margin * 2
        );


        ctx.fillStyle =
            "#fff1a6";

        ctx.fillRect(
            x + size * 0.34,
            y + size * 0.34,
            size * 0.32,
            size * 0.32
        );
    }


    drawObject(
        ctx,
        x,
        y,
        size
    ) {

        /*
        Objet représenté comme un petit livre.
        */

        const w =
            size * 0.5;

        const h =
            size * 0.4;

        const ox =
            x +
            (
                size - w
            ) / 2;

        const oy =
            y +
            (
                size - h
            ) / 2;


        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            ox - 3,
            oy - 3,
            w + 6,
            h + 6
        );


        ctx.fillStyle =
            "#ff4fa3";

        ctx.fillRect(
            ox,
            oy,
            w,
            h
        );


        ctx.fillStyle =
            "#ffd447";

        ctx.fillRect(
            ox + w * 0.12,
            oy,
            w * 0.12,
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
            "#6f513a";

        ctx.fillRect(
            x + size * 0.25,
            y + size * 0.43,
            size * 0.48,
            size * 0.23
        );

        ctx.fillRect(
            x + size * 0.38,
            y + size * 0.28,
            size * 0.23,
            size * 0.18
        );

        ctx.fillStyle =
            "#3c2c25";

        ctx.fillRect(
            x + size * 0.48,
            y + size * 0.49,
            size * 0.09,
            size * 0.09
        );
    }


    drawButton(
        ctx,
        x,
        y,
        size
    ) {

        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            x + size * 0.2,
            y + size * 0.55,
            size * 0.6,
            size * 0.2
        );


        ctx.fillStyle =
            "#ff5964";

        ctx.fillRect(
            x + size * 0.3,
            y + size * 0.37,
            size * 0.4,
            size * 0.22
        );
    }


    drawDoor(
        ctx,
        x,
        y,
        size
    ) {

        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            x + size * 0.17,
            y + size * 0.06,
            size * 0.66,
            size * 0.88
        );


        ctx.fillStyle =
            "#68415b";

        ctx.fillRect(
            x + size * 0.23,
            y + size * 0.12,
            size * 0.54,
            size * 0.82
        );


        ctx.fillStyle =
            "#ffd447";

        ctx.fillRect(
            x + size * 0.62,
            y + size * 0.52,
            size * 0.08,
            size * 0.08
        );
    }


    drawCharger(
        ctx,
        x,
        y,
        size
    ) {

        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            x + size * 0.22,
            y + size * 0.17,
            size * 0.56,
            size * 0.66
        );


        ctx.fillStyle =
            "#39d9e6";

        ctx.fillRect(
            x + size * 0.29,
            y + size * 0.24,
            size * 0.42,
            size * 0.52
        );


        ctx.fillStyle =
            "#ffd447";

        ctx.beginPath();

        ctx.moveTo(
            x + size * 0.54,
            y + size * 0.28
        );

        ctx.lineTo(
            x + size * 0.38,
            y + size * 0.53
        );

        ctx.lineTo(
            x + size * 0.5,
            y + size * 0.53
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
    }


    drawDeposit(
        ctx,
        x,
        y,
        size
    ) {

        ctx.strokeStyle =
            "#39d9e6";

        ctx.lineWidth =
            Math.max(
                3,
                size * 0.08
            );

        ctx.strokeRect(
            x + size * 0.2,
            y + size * 0.2,
            size * 0.6,
            size * 0.6
        );


        ctx.fillStyle =
            "rgba(57, 217, 230, 0.16)";

        ctx.fillRect(
            x + size * 0.2,
            y + size * 0.2,
            size * 0.6,
            size * 0.6
        );
    }


    drawBox(
        ctx,
        x,
        y,
        size
    ) {

        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            x + size * 0.16,
            y + size * 0.16,
            size * 0.68,
            size * 0.68
        );


        ctx.fillStyle =
            "#b77a45";

        ctx.fillRect(
            x + size * 0.22,
            y + size * 0.22,
            size * 0.56,
            size * 0.56
        );


        ctx.fillStyle =
            "#d89b5c";

        ctx.fillRect(
            x + size * 0.46,
            y + size * 0.22,
            size * 0.08,
            size * 0.56
        );
    }


    // =====================================================
    // ROBOT
    // =====================================================

    getRobotPosition() {

        const robot =
            this.game?.robot ||
            this.game?.player ||
            null;

        if (!robot) {

            return null;
        }


        if (
            typeof robot.getPosition ===
            "function"
        ) {

            const position =
                robot.getPosition();

            if (
                Array.isArray(position)
            ) {

                return {
                    row:
                        position[0],

                    col:
                        position[1]
                };
            }

            if (
                position &&
                typeof position ===
                "object"
            ) {

                return {
                    row:
                        position.row,

                    col:
                        position.col
                };
            }
        }


        if (
            Number.isFinite(
                robot.row
            ) &&
            Number.isFinite(
                robot.col
            )
        ) {

            return {
                row:
                    robot.row,

                col:
                    robot.col
            };
        }


        return null;
    }


    getRobotDirection() {

        const robot =
            this.game?.robot ||
            this.game?.player ||
            null;

        if (!robot) {

            return "NORTH";
        }


        if (
            typeof robot.getDirection ===
            "function"
        ) {

            return robot.getDirection();
        }


        return (
            robot.direction ||
            "NORTH"
        );
    }


    drawRobot(
        ctx,
        x,
        y,
        size,
        direction
    ) {

        const scale =
            size / 64;


        const px =
            value =>
                Math.round(
                    value *
                    scale
                );


        const centerX =
            x +
            size / 2;


        // ---------------------------------------------
        // OMBRE
        // ---------------------------------------------

        ctx.fillStyle =
            "rgba(0, 0, 0, 0.35)";

        ctx.fillRect(
            centerX - px(18),
            y + px(49),
            px(36),
            px(7)
        );


        // ---------------------------------------------
        // JAMBES
        // ---------------------------------------------

        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            centerX - px(15),
            y + px(42),
            px(11),
            px(15)
        );

        ctx.fillRect(
            centerX + px(4),
            y + px(42),
            px(11),
            px(15)
        );


        ctx.fillStyle =
            "#d8d6e1";

        ctx.fillRect(
            centerX - px(12),
            y + px(42),
            px(6),
            px(11)
        );

        ctx.fillRect(
            centerX + px(6),
            y + px(42),
            px(6),
            px(11)
        );


        // ---------------------------------------------
        // CORPS
        // ---------------------------------------------

        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            centerX - px(18),
            y + px(24),
            px(36),
            px(25)
        );


        ctx.fillStyle =
            "#e3e1eb";

        ctx.fillRect(
            centerX - px(14),
            y + px(27),
            px(28),
            px(18)
        );


        // ---------------------------------------------
        // CŒUR
        // ---------------------------------------------

        ctx.fillStyle =
            "#ff4fa3";

        ctx.fillRect(
            centerX - px(4),
            y + px(32),
            px(8),
            px(8)
        );


        // ---------------------------------------------
        // BRAS
        // ---------------------------------------------

        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            centerX - px(24),
            y + px(28),
            px(8),
            px(18)
        );

        ctx.fillRect(
            centerX + px(16),
            y + px(28),
            px(8),
            px(18)
        );


        ctx.fillStyle =
            "#d8d6e1";

        ctx.fillRect(
            centerX - px(21),
            y + px(30),
            px(4),
            px(13)
        );

        ctx.fillRect(
            centerX + px(17),
            y + px(30),
            px(4),
            px(13)
        );


        // ---------------------------------------------
        // TÊTE
        // ---------------------------------------------

        ctx.fillStyle =
            "#08070d";

        ctx.fillRect(
            centerX - px(20),
            y + px(5),
            px(40),
            px(24)
        );


        ctx.fillStyle =
            "#f0eef5";

        ctx.fillRect(
            centerX - px(16),
            y + px(8),
            px(32),
            px(17)
        );


        // ---------------------------------------------
        // VISIÈRE
        // ---------------------------------------------

        ctx.fillStyle =
            "#151322";

        ctx.fillRect(
            centerX - px(12),
            y + px(12),
            px(24),
            px(9)
        );


        // ---------------------------------------------
        // YEUX
        // ---------------------------------------------

        ctx.fillStyle =
            "#39d9e6";

        ctx.fillRect(
            centerX - px(8),
            y + px(15),
            px(4),
            px(3)
        );

        ctx.fillRect(
            centerX + px(4),
            y + px(15),
            px(4),
            px(3)
        );


        // ---------------------------------------------
        // INDICATEUR DIRECTION
        // ---------------------------------------------

        const directionName =
            String(
                direction
            ).toUpperCase();


        ctx.strokeStyle =
            "#ffd447";

        ctx.lineWidth =
            Math.max(
                2,
                px(3)
            );

        ctx.beginPath();

        ctx.moveTo(
            centerX,
            y + px(4)
        );


        switch (
            directionName
        ) {

            case "SOUTH":

                ctx.lineTo(
                    centerX,
                    y + px(14)
                );

                break;


            case "EAST":

                ctx.lineTo(
                    centerX + px(10),
                    y + px(4)
                );

                break;


            case "WEST":

                ctx.lineTo(
                    centerX - px(10),
                    y + px(4)
                );

                break;


            case "NORTH":
            default:

                ctx.lineTo(
                    centerX,
                    y - px(6)
                );

                break;
        }

        ctx.stroke();
    }


    // =====================================================
    // FENÊTRE CODE DÉPLAÇABLE
    // =====================================================

    makeCodeWindowDraggable() {

        if (
            !this.codeWindow ||
            !this.codeWindowHeader
        ) {

            return;
        }


        let dragging = false;

        let startMouseX = 0;
        let startMouseY = 0;

        let startLeft = 0;
        let startTop = 0;


        const move =
            event => {

                if (!dragging) {

                    return;
                }


                const x =
                    event.clientX;

                const y =
                    event.clientY;


                const nextLeft =
                    startLeft +
                    (
                        x -
                        startMouseX
                    );

                const nextTop =
                    startTop +
                    (
                        y -
                        startMouseY
                    );


                const maxLeft =
                    Math.max(
                        0,
                        window.innerWidth -
                        this.codeWindow.offsetWidth
                    );

                const maxTop =
                    Math.max(
                        0,
                        window.innerHeight -
                        this.codeWindow.offsetHeight
                    );


                this.codeWindow.style.left =
                    `${Math.max(
                        0,
                        Math.min(
                            maxLeft,
                            nextLeft
                        )
                    )}px`;


                this.codeWindow.style.top =
                    `${Math.max(
                        0,
                        Math.min(
                            maxTop,
                            nextTop
                        )
                    )}px`;


                this.codeWindow.style.right =
                    "auto";

                this.codeWindow.style.bottom =
                    "auto";
            };


        const stop =
            () => {

                dragging = false;

                document.removeEventListener(
                    "mousemove",
                    move
                );

                document.removeEventListener(
                    "mouseup",
                    stop
                );
            };


        this.codeWindowHeader
            .addEventListener(
                "mousedown",
                event => {

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


                    dragging = true;

                    startMouseX =
                        event.clientX;

                    startMouseY =
                        event.clientY;

                    startLeft =
                        rect.left;

                    startTop =
                        rect.top;


                    document.addEventListener(
                        "mousemove",
                        move
                    );

                    document.addEventListener(
                        "mouseup",
                        stop
                    );
                }
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

        if (
            !this.messageModal ||
            !this.modalBackground
        ) {

            return;
        }


        if (
            this.modalLabel
        ) {

            this.modalLabel.textContent =
                options.label ||
                "PYT";
        }


        if (
            this.modalTitle
        ) {

            this.modalTitle.textContent =
                title ||
                "Information";
        }


        if (
            this.modalMessage
        ) {

            this.modalMessage.textContent =
                message ||
                "";
        }


        if (
            this.modalPrimaryButton
        ) {

            this.modalPrimaryButton.textContent =
                options.primaryLabel ||
                "OK";


            this.modalPrimaryButton.onclick =
                () => {

                    this.hideMessage();

                    if (
                        typeof options.onPrimary ===
                        "function"
                    ) {

                        options.onPrimary();
                    }
                };
        }


        if (
            this.modalSecondaryButton
        ) {

            if (
                options.secondaryLabel
            ) {

                this.modalSecondaryButton
                    .classList
                    .remove(
                        "hidden"
                    );

                this.modalSecondaryButton
                    .textContent =
                    options.secondaryLabel;


                this.modalSecondaryButton.onclick =
                    () => {

                        this.hideMessage();

                        if (
                            typeof options.onSecondary ===
                            "function"
                        ) {

                            options.onSecondary();
                        }
                    };

            } else {

                this.modalSecondaryButton
                    .classList
                    .add(
                        "hidden"
                    );
            }
        }


        this.modalBackground
            .classList
            .remove(
                "hidden"
            );

        this.messageModal
            .classList
            .remove(
                "hidden"
            );
    }


    hideMessage() {

        if (
            this.modalBackground
        ) {

            this.modalBackground
                .classList
                .add(
                    "hidden"
                );
        }

        if (
            this.messageModal
        ) {

            this.messageModal
                .classList
                .add(
                    "hidden"
                );
        }
    }
}


// =========================================================
// EXPOSITION
// =========================================================

window.PytUI =
    PytUI;