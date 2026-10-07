"use strict";

/* =========================================================
   PYT
   game.js

   Moteur principal du jeu.

   - rendu Canvas
   - art.js pour tous les graphismes
   - déplacement de Pyt
   - collisions
   - objets
   - mini-interpréteur Python
   - variables
   - listes
   - dictionnaires
   - if / elif / else
   - for / range
   - while
   - fonctions
   - print
   - validation des missions
========================================================= */


class PytGame {

    constructor() {

        this.canvas = null;
        this.ctx = null;

        this.levelData = null;
        this.world = null;
        this.robot = null;

        this.running = false;

        this.animationFrame = null;

        this.renderRobotX = 0;
        this.renderRobotY = 0;

        this.moveAnimation = null;

        this.execution = null;

        this.maxInstructions = 4000;
        this.maxLoopIterations = 500;
        this.maxCallDepth = 50;

        this.resizeObserver = null;

        this.init();
    }



    /* =====================================================
       INITIALISATION
    ===================================================== */

    init() {

        if (
            document.readyState ===
            "loading"
        ) {

            document.addEventListener(
                "DOMContentLoaded",
                () => this.start(),
                {
                    once: true
                }
            );

        } else {

            this.start();
        }
    }



    start() {

        this.canvas =
            document.getElementById(
                "game-canvas"
            );


        if (!this.canvas) {

            console.warn(
                "PYT : canvas introuvable."
            );

            return;
        }


        this.ctx =
            this.canvas.getContext(
                "2d"
            );


        this.ctx.imageSmoothingEnabled =
            false;


        this.bindEvents();

        this.prepareResize();

        this.drawEmptyWorld();
    }



    /* =====================================================
       EVENTS
    ===================================================== */

    bindEvents() {

        window.addEventListener(
            "pyt:load-level",
            event => {

                const data =
                    event.detail?.data;


                if (data) {

                    this.loadLevel(
                        data
                    );
                }
            }
        );


        window.addEventListener(
            "pyt:reload-world",
            event => {

                const data =
                    event.detail?.data ||
                    this.levelData;


                if (data) {

                    this.loadLevel(
                        data
                    );
                }
            }
        );


        window.addEventListener(
            "pyt:run-code",
            event => {

                const code =
                    String(
                        event.detail?.code ??
                        ""
                    );


                this.executeCode(
                    code
                );
            }
        );
    }



    /* =====================================================
       REDIMENSIONNEMENT
    ===================================================== */

    prepareResize() {

        const container =
            this.canvas
                ?.parentElement;


        if (
            !container ||
            typeof ResizeObserver ===
                "undefined"
        ) {

            return;
        }


        this.resizeObserver =
            new ResizeObserver(
                () => {

                    this.draw();
                }
            );


        this.resizeObserver.observe(
            container
        );
    }



    /* =====================================================
       CHARGEMENT D'UN NIVEAU
    ===================================================== */

    loadLevel(data) {

        this.cancelExecution();


        this.levelData =
            this.clone(
                data
            );


        this.world =
            this.clone(
                data
            );


        if (
            !this.world.map
        ) {

            this.world.map = {

                width: 8,

                height: 6,

                blocked: [],

                decorations: []
            };
        }


        if (
            !Array.isArray(
                this.world.map.blocked
            )
        ) {

            this.world.map.blocked =
                [];
        }


        if (
            !Array.isArray(
                this.world.map.decorations
            )
        ) {

            this.world.map.decorations =
                [];
        }


        if (
            !Array.isArray(
                this.world.objects
            )
        ) {

            this.world.objects =
                [];
        }


        if (
            !Array.isArray(
                this.world.targets
            )
        ) {

            this.world.targets =
                [];
        }


        this.createRobot();

        this.draw();


        this.setStatus(
            "Prêt"
        );


        window.dispatchEvent(
            new CustomEvent(
                "pyt:world-ready",
                {
                    detail: {

                        level:
                            this.levelData,

                        world:
                            this.world,

                        robot:
                            this.robot
                    }
                }
            )
        );
    }



    createRobot() {

        if (
            typeof window.PytRobot !==
            "function"
        ) {

            console.error(
                "PYT : robot.js n'est pas chargé."
            );

            return;
        }


        this.robot =
            new window.PytRobot({

                world:
                    this.world,

                state:
                    this.world.robot || {
                        x: 0,
                        y: 0,
                        direction: "E"
                    },

                stepDuration:
                    500,

                turnDuration:
                    180,

                onChange:
                    state => {

                        if (
                            !this.moveAnimation
                        ) {

                            this.renderRobotX =
                                state.x;

                            this.renderRobotY =
                                state.y;
                        }


                        this.draw();
                    },

                onAction:
                    action => {

                        this.handleRobotAction(
                            action
                        );
                    }
            });


        this.renderRobotX =
            this.robot.x;

        this.renderRobotY =
            this.robot.y;
    }



    /* =====================================================
       ACTIONS DU ROBOT
    ===================================================== */

    handleRobotAction(action) {

        if (
            action.type ===
            "move_start"
        ) {

            this.animateRobotMove(
                action
            );

            return;
        }


        this.draw();
    }



    animateRobotMove(action) {

        if (
            !action.from ||
            !action.to
        ) {

            return;
        }


        const start =
            performance.now();


        const duration =
            Number(
                action.duration
            ) || 500;


        this.moveAnimation = {

            from:
                action.from,

            to:
                action.to
        };


        const animate =
            now => {

                if (
                    !this.moveAnimation
                ) {

                    return;
                }


                const progress =
                    Math.min(
                        1,
                        (
                            now -
                            start
                        ) /
                        duration
                    );


                const smooth =
                    progress < 0.5
                        ? 2 *
                            progress *
                            progress
                        : 1 -
                            Math.pow(
                                -2 *
                                progress +
                                2,
                                2
                            ) /
                            2;


                this.renderRobotX =
                    action.from.x +
                    (
                        action.to.x -
                        action.from.x
                    ) *
                    smooth;


                this.renderRobotY =
                    action.from.y +
                    (
                        action.to.y -
                        action.from.y
                    ) *
                    smooth;


                this.draw();


                if (
                    progress < 1
                ) {

                    this.animationFrame =
                        requestAnimationFrame(
                            animate
                        );

                } else {

                    this.renderRobotX =
                        action.to.x;

                    this.renderRobotY =
                        action.to.y;


                    this.moveAnimation =
                        null;


                    this.draw();
                }
            };


        if (
            this.animationFrame
        ) {

            cancelAnimationFrame(
                this.animationFrame
            );
        }


        this.animationFrame =
            requestAnimationFrame(
                animate
            );
    }



    /* =====================================================
       RENDU PRINCIPAL
    ===================================================== */

    drawEmptyWorld() {

        if (
            !this.ctx ||
            !this.canvas
        ) {

            return;
        }


        this.ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        this.ctx.fillStyle =
            "#18191c";


        this.ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
    }



    draw() {

        if (
            !this.ctx ||
            !this.canvas
        ) {

            return;
        }


        if (
            !this.world
        ) {

            this.drawEmptyWorld();

            return;
        }


        const layout =
            this.getCanvasLayout();


        this.ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        this.drawBackground(
            layout
        );


        this.drawFloor(
            layout
        );


        this.drawGrid(
            layout
        );


        this.drawTargets(
            layout
        );


        this.drawDecorations(
            layout
        );


        this.drawObjects(
            layout
        );


        this.drawRobot(
            layout
        );
    }



    /* =====================================================
       LAYOUT
    ===================================================== */

    getCanvasLayout() {

        const map =
            this.world?.map ||
            {};


        const columns =
            Math.max(
                1,
                Number(
                    map.width
                ) || 8
            );


        const rows =
            Math.max(
                1,
                Number(
                    map.height
                ) || 6
            );


        const padding =
            34;


        const tile =
            Math.max(
                16,
                Math.floor(
                    Math.min(
                        (
                            this.canvas.width -
                            padding * 2
                        ) /
                        columns,

                        (
                            this.canvas.height -
                            padding * 2
                        ) /
                        rows
                    )
                )
            );


        const width =
            tile *
            columns;


        const height =
            tile *
            rows;


        return {

            columns,

            rows,

            tile,

            width,

            height,

            x:
                Math.floor(
                    (
                        this.canvas.width -
                        width
                    ) /
                    2
                ),

            y:
                Math.floor(
                    (
                        this.canvas.height -
                        height
                    ) /
                    2
                )
        };
    }



    /* =====================================================
       FOND
    ===================================================== */

    drawBackground(layout) {

        const ctx =
            this.ctx;


        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                this.canvas.height
            );


        gradient.addColorStop(
            0,
            "#25262b"
        );


        gradient.addColorStop(
            1,
            "#111215"
        );


        ctx.fillStyle =
            gradient;


        ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );


        ctx.fillStyle =
            "rgba(0,0,0,0.25)";


        this.roundRect(
            layout.x - 14,
            layout.y - 14,
            layout.width + 28,
            layout.height + 28,
            18
        );


        ctx.fill();
    }



    /* =====================================================
       SOL
    ===================================================== */

    drawFloor(layout) {

        const room =
            this.normalize(
                this.levelData?.room ||
                ""
            );


        let floorType =
            "sol_bois";


        if (
            room === "cuisine" ||
            room === "toilette" ||
            room === "salle_d_eau"
        ) {

            floorType =
                "carrelage";
        }


        if (
            room === "jardin"
        ) {

            floorType =
                "herbe";
        }


        for (
            let y = 0;
            y < layout.rows;
            y += 1
        ) {

            for (
                let x = 0;
                x < layout.columns;
                x += 1
            ) {

                const point =
                    this.cellTopLeft(
                        x,
                        y,
                        layout
                    );


                if (
                    window.PYTArt
                ) {

                    if (
                        room === "garage"
                    ) {

                        this.ctx.fillStyle =
                            "#76787c";


                        this.ctx.fillRect(
                            point.x,
                            point.y,
                            layout.tile,
                            layout.tile
                        );

                    } else if (
                        room ===
                        "cave_a_vin"
                    ) {

                        this.ctx.fillStyle =
                            (
                                (
                                    x +
                                    y
                                ) %
                                2 ===
                                0
                            )
                                ? "#77716d"
                                : "#6b6562";


                        this.ctx.fillRect(
                            point.x,
                            point.y,
                            layout.tile,
                            layout.tile
                        );

                    } else if (
                        room ===
                        "balcon"
                    ) {

                        window.PYTArt.draw(
                            this.ctx,
                            "chemin",
                            point.x,
                            point.y,
                            layout.tile
                        );

                    } else {

                        window.PYTArt.draw(
                            this.ctx,
                            floorType,
                            point.x,
                            point.y,
                            layout.tile
                        );
                    }

                } else {

                    this.ctx.fillStyle =
                        this.getFallbackFloorColor(
                            room
                        );


                    this.ctx.fillRect(
                        point.x,
                        point.y,
                        layout.tile,
                        layout.tile
                    );
                }
            }
        }
    }



    getFallbackFloorColor(room) {

        const colors = {

            entree:
                "#b8895c",

            cuisine:
                "#c9c4bd",

            salon:
                "#b8895c",

            chambre:
                "#a87b55",

            garage:
                "#76787c",

            cave_a_vin:
                "#77716d",

            balcon:
                "#9b9185",

            toilette:
                "#c9c4bd",

            jardin:
                "#5c8a53"
        };


        return (
            colors[room] ||
            "#8b735f"
        );
    }



    /* =====================================================
       GRILLE
    ===================================================== */

    drawGrid(layout) {

        for (
            let y = 0;
            y < layout.rows;
            y += 1
        ) {

            for (
                let x = 0;
                x < layout.columns;
                x += 1
            ) {

                const point =
                    this.cellTopLeft(
                        x,
                        y,
                        layout
                    );


                this.ctx.strokeStyle =
                    "rgba(0,0,0,0.10)";


                this.ctx.lineWidth =
                    1;


                this.ctx.strokeRect(
                    point.x + 0.5,
                    point.y + 0.5,
                    layout.tile - 1,
                    layout.tile - 1
                );


                if (
                    this.isBlocked(
                        x,
                        y
                    )
                ) {

                    this.drawBlockedCell(
                        x,
                        y,
                        layout
                    );
                }
            }
        }
    }



    drawBlockedCell(
        x,
        y,
        layout
    ) {

        const point =
            this.cellTopLeft(
                x,
                y,
                layout
            );


        if (
            window.PYTArt
        ) {

            window.PYTArt.draw(
                this.ctx,
                "case_bloquee",
                point.x,
                point.y,
                layout.tile
            );

            return;
        }


        this.ctx.save();

        this.ctx.globalAlpha =
            0.35;

        this.ctx.fillStyle =
            "#593f4d";


        this.ctx.fillRect(
            point.x +
                layout.tile *
                0.08,
            point.y +
                layout.tile *
                0.08,
            layout.tile *
                0.84,
            layout.tile *
                0.84
        );


        this.ctx.restore();
    }



    /* =====================================================
       OBJECTIFS
    ===================================================== */

    drawTargets(layout) {

        const targets =
            this.world.targets ||
            [];


        targets.forEach(
            target => {

                const x =
                    Number(
                        target.x
                    );


                const y =
                    Number(
                        target.y
                    );


                if (
                    !Number.isFinite(x) ||
                    !Number.isFinite(y)
                ) {

                    return;
                }


                const point =
                    this.cellTopLeft(
                        x,
                        y,
                        layout
                    );


                const type =
                    target.type ===
                    "deposit"
                        ? "depot"
                        : "objectif";


                if (
                    window.PYTArt
                ) {

                    window.PYTArt.draw(
                        this.ctx,
                        type,
                        point.x,
                        point.y,
                        layout.tile
                    );

                } else {

                    this.ctx.save();

                    this.ctx.strokeStyle =
                        "#ffe575";

                    this.ctx.lineWidth =
                        3;


                    this.ctx.strokeRect(
                        point.x +
                            layout.tile *
                            0.15,
                        point.y +
                            layout.tile *
                            0.15,
                        layout.tile *
                            0.7,
                        layout.tile *
                            0.7
                    );


                    this.ctx.restore();
                }
            }
        );
    }



    /* =====================================================
       DÉCORATIONS
    ===================================================== */

    drawDecorations(layout) {

        const decorations =
            this.world
                ?.map
                ?.decorations ||
            [];


        decorations.forEach(
            decoration => {

                this.drawDecoration(
                    decoration,
                    layout
                );
            }
        );
    }



    drawDecoration(
        decoration,
        layout
    ) {

        const x =
            Number(
                decoration.x
            );


        const y =
            Number(
                decoration.y
            );


        if (
            !Number.isFinite(x) ||
            !Number.isFinite(y)
        ) {

            return;
        }


        const point =
            this.cellTopLeft(
                x,
                y,
                layout
            );


        const type =
            this.normalize(
                decoration.type
            );


        if (
            window.PYTArt
        ) {

            window.PYTArt.draw(
                this.ctx,
                type,
                point.x,
                point.y,
                layout.tile,
                {
                    animate:
                        type ===
                        "piscine"
                }
            );

            return;
        }


        this.drawDecorationFallback(
            decoration,
            point,
            layout.tile
        );
    }



    drawDecorationFallback(
        decoration,
        point,
        size
    ) {

        this.ctx.save();


        this.ctx.fillStyle =
            "rgba(25,25,28,0.45)";


        this.ctx.fillRect(
            point.x +
                size *
                0.15,
            point.y +
                size *
                0.15,
            size *
                0.7,
            size *
                0.7
        );


        this.ctx.fillStyle =
            "#ffffff";


        this.ctx.font =
            `${Math.max(
                9,
                Math.floor(
                    size *
                    0.12
                )
            )}px monospace`;


        this.ctx.textAlign =
            "center";


        this.ctx.textBaseline =
            "middle";


        this.ctx.fillText(
            decoration.type || "?",
            point.x +
                size / 2,
            point.y +
                size / 2
        );


        this.ctx.restore();
    }



    /* =====================================================
       OBJETS INTERACTIFS
    ===================================================== */

    drawObjects(layout) {

        const objects =
            this.world.objects ||
            [];


        objects.forEach(
            object => {

                this.drawObject(
                    object,
                    layout
                );
            }
        );
    }



    drawObject(
        object,
        layout
    ) {

        const x =
            Number(
                object.x
            );


        const y =
            Number(
                object.y
            );


        if (
            !Number.isFinite(x) ||
            !Number.isFinite(y)
        ) {

            return;
        }


        const point =
            this.cellTopLeft(
                x,
                y,
                layout
            );


        const artType =
            this.getObjectArtType(
                object
            );


        if (
            window.PYTArt
        ) {

            /*
            Léger cercle derrière les objets ramassables.

            Ils restent donc faciles à distinguer
            du simple décor.
            */

            if (
                object.pickable !==
                false
            ) {

                this.ctx.save();


                this.ctx.globalAlpha =
                    0.16;


                this.ctx.fillStyle =
                    "#fff2a8";


                this.ctx.beginPath();


                this.ctx.arc(
                    point.x +
                        layout.tile /
                        2,
                    point.y +
                        layout.tile /
                        2,
                    layout.tile *
                        0.38,
                    0,
                    Math.PI *
                        2
                );


                this.ctx.fill();


                this.ctx.restore();
            }


            window.PYTArt.draw(
                this.ctx,
                artType,
                point.x,
                point.y,
                layout.tile
            );


            return;
        }


        this.ctx.fillStyle =
            "#ffe575";


        this.ctx.fillRect(
            point.x +
                layout.tile *
                0.3,
            point.y +
                layout.tile *
                0.3,
            layout.tile *
                0.4,
            layout.tile *
                0.4
        );
    }



    getObjectArtType(object) {

        const id =
            this.normalize(
                object.id
            );


        const type =
            this.normalize(
                object.type
            );


        /*
        On utilise l'identifiant quand il contient
        une information graphique particulière.
        */

        const specialIds =
            new Set([

                "livre_rouge",
                "livre_bleu",

                "bouteille_rouge",
                "bouteille_bleue",
                "bouteille_verte",
                "bouteille_jaune",

                "bouee",
                "cle",
                "colis",
                "boite_outils",
                "arrosoir",

                "jouet_1",
                "jouet_2",
                "jouet_3"
            ]);


        if (
            specialIds.has(
                id
            )
        ) {

            if (
                id.startsWith(
                    "jouet_"
                )
            ) {

                return "jouet";
            }


            return id;
        }


        return (
            type ||
            id ||
            "objet"
        );
    }



    /* =====================================================
       PYT
    ===================================================== */

    drawRobot(layout) {

        if (
            !this.robot
        ) {

            return;
        }


        const point =
            this.cellTopLeft(
                this.renderRobotX,
                this.renderRobotY,
                layout
            );


        const size =
            layout.tile *
            0.82;


        const x =
            point.x +
            (
                layout.tile -
                size
            ) /
            2;


        const y =
            point.y +
            (
                layout.tile -
                size
            ) /
            2;


        if (
            window.PYTArt &&
            typeof window.PYTArt
                .drawPyt ===
                "function"
        ) {

            window.PYTArt.drawPyt(
                this.ctx,
                x,
                y,
                size,
                this.robot.direction,
                {
                    bob:
                        Boolean(
                            this.moveAnimation
                        ),

                    happy:
                        false
                }
            );


            return;
        }


        this.drawRobotFallback(
            x,
            y,
            size
        );
    }



    drawRobotFallback(
        x,
        y,
        size
    ) {

        const ctx =
            this.ctx;


        ctx.save();


        ctx.fillStyle =
            "#151619";


        ctx.fillRect(
            x +
                size *
                0.2,
            y +
                size *
                0.15,
            size *
                0.6,
            size *
                0.65
        );


        ctx.fillStyle =
            "#f3f3ef";


        ctx.fillRect(
            x +
                size *
                0.27,
            y +
                size *
                0.22,
            size *
                0.46,
            size *
                0.45
        );


        ctx.fillStyle =
            "#fff4a8";


        ctx.fillRect(
            x +
                size *
                0.34,
            y +
                size *
                0.31,
            size *
                0.07,
            size *
                0.09
        );


        ctx.fillRect(
            x +
                size *
                0.59,
            y +
                size *
                0.31,
            size *
                0.07,
            size *
                0.09
        );


        ctx.restore();
    }



    /* =====================================================
       EXÉCUTION DU PROGRAMME
    ===================================================== */

    async executeCode(source) {

        if (
            this.running ||
            !this.robot ||
            !this.levelData
        ) {

            if (
                this.running
            ) {

                this.dispatchExecutionResult({

                    success:
                        false,

                    reason:
                        "already_running",

                    message:
                        "Un programme est déjà en cours."
                });
            }


            return;
        }


        this.running =
            true;


        this.execution = {

            cancelled:
                false,

            instructionCount:
                0,

            callDepth:
                0,

            currentLine:
                null,

            actionFailures:
                [],

            output:
                [],

            ast:
                null
        };


        this.setStatus(
            "Programme en cours..."
        );


        window.pytApp
            ?.hideThought();


        window.pytApp
            ?.clearCodeError();


        window.pytApp
            ?.clearConsole();


        try {

            const parser =
                new PytPythonParser(
                    source
                );


            const ast =
                parser.parse();


            this.execution.ast =
                ast;


            const interpreter =
                new PytPythonInterpreter({

                    game:
                        this,

                    robot:
                        this.robot,

                    world:
                        this.world,

                    execution:
                        this.execution,

                    maxInstructions:
                        this.maxInstructions,

                    maxLoopIterations:
                        this.maxLoopIterations,

                    maxCallDepth:
                        this.maxCallDepth
                });


            await interpreter.execute(
                ast
            );


            if (
                this.execution.cancelled
            ) {

                return;
            }


            const validation =
                this.validateMission(
                    source,
                    ast
                );


            validation.output =
                [
                    ...this.execution.output
                ];


            this.dispatchExecutionResult(
                validation
            );

        } catch (error) {

            if (
                this.execution
                    ?.cancelled
            ) {

                return;
            }


            console.error(
                error
            );


            const line =
                Number(
                    error.line ||
                    this.execution
                        ?.currentLine ||
                    0
                );


            this.dispatchExecutionResult({

                success:
                    false,

                reason:
                    error.reason ||
                    "python_error",

                errorLine:
                    line > 0
                        ? line
                        : undefined,

                error:
                    error.message ||
                    "Erreur dans le programme.",

                message:
                    this.formatPythonError(
                        error
                    ),

                output:
                    [
                        ...(
                            this.execution
                                ?.output ||
                            []
                        )
                    ]
            });

        } finally {

            this.running =
                false;
        }
    }



    cancelExecution() {

        if (
            this.execution
        ) {

            this.execution.cancelled =
                true;
        }


        this.running =
            false;


        if (
            this.animationFrame
        ) {

            cancelAnimationFrame(
                this.animationFrame
            );
        }


        this.animationFrame =
            null;

        this.moveAnimation =
            null;
    }



    /* =====================================================
       API PYTHON
    ===================================================== */

    createBuiltins() {

        const action =
            async (
                callback,
                name
            ) => {

                this.assertExecutionActive();


                const result =
                    await callback();


                if (
                    result &&
                    result.success ===
                        false &&
                    result.reason !==
                        "cancelled"
                ) {

                    this.execution
                        .actionFailures
                        .push({

                            line:
                                this.execution
                                    .currentLine,

                            name,

                            reason:
                                result.reason,

                            result
                        });
                }


                return null;
            };


        return {

            avancer:
                async (
                    amount = 1
                ) =>
                    action(
                        () =>
                            this.robot
                                .forward(
                                    amount
                                ),

                        "avancer"
                    ),


            tourner_gauche:
                async () =>
                    action(
                        () =>
                            this.robot
                                .turnLeft(),

                        "tourner_gauche"
                    ),


            tourner_droite:
                async () =>
                    action(
                        () =>
                            this.robot
                                .turnRight(),

                        "tourner_droite"
                    ),


            ramasser:
                async (
                    objectName = null
                ) =>
                    action(
                        () =>
                            this.robot
                                .pickUp(
                                    objectName
                                ),

                        "ramasser"
                    ),


            deposer:
                async (
                    objectName = null
                ) =>
                    action(
                        () =>
                            this.robot
                                .drop(
                                    objectName
                                ),

                        "deposer"
                    ),


            devant_libre:
                async () =>
                    this.robot
                        .frontIsFree(),


            sur_objet:
                async (
                    objectName = null
                ) =>
                    this.robot
                        .isOnObject(
                            objectName
                        ),


            inventaire_contient:
                async objectName =>
                    this.robot
                        .inventoryContains(
                            objectName
                        ),


            position_x:
                async () =>
                    this.robot.x,


            position_y:
                async () =>
                    this.robot.y,


            direction:
                async () =>
                    this.robot
                        .direction,


            range:
                async (
                    start,
                    stop = undefined,
                    step = 1
                ) =>
                    this.pythonRange(
                        start,
                        stop,
                        step
                    ),


            len:
                async value => {

                    if (
                        Array.isArray(
                            value
                        ) ||
                        typeof value ===
                            "string"
                    ) {

                        return value.length;
                    }


                    if (
                        value &&
                        typeof value ===
                            "object"
                    ) {

                        return Object.keys(
                            value
                        ).length;
                    }


                    throw this.runtimeError(
                        "len() ne peut pas être utilisé avec cette valeur."
                    );
                },


            print:
                async (
                    ...values
                ) => {

                    const text =
                        values
                            .map(
                                value =>
                                    this.pythonString(
                                        value
                                    )
                            )
                            .join(
                                " "
                            );


                    this.execution
                        .output
                        .push(
                            text
                        );


                    window.pytApp
                        ?.appendConsole(
                            text
                        );


                    return null;
                }
        };
    }



    pythonRange(
        start,
        stop = undefined,
        step = 1
    ) {

        let realStart =
            Number(
                start
            );


        let realStop =
            Number(
                stop
            );


        let realStep =
            Number(
                step
            );


        if (
            stop === undefined
        ) {

            realStop =
                realStart;

            realStart =
                0;
        }


        if (
            !Number.isFinite(
                realStart
            ) ||
            !Number.isFinite(
                realStop
            ) ||
            !Number.isFinite(
                realStep
            )
        ) {

            throw this.runtimeError(
                "range() attend des nombres."
            );
        }


        if (
            realStep ===
            0
        ) {

            throw this.runtimeError(
                "Le pas de range() ne peut pas être 0."
            );
        }


        const values =
            [];


        if (
            realStep > 0
        ) {

            for (
                let value = realStart;
                value < realStop;
                value += realStep
            ) {

                values.push(
                    value
                );


                if (
                    values.length >
                    this.maxLoopIterations
                ) {

                    throw this.runtimeError(
                        "range() produit trop de valeurs."
                    );
                }
            }

        } else {

            for (
                let value = realStart;
                value > realStop;
                value += realStep
            ) {

                values.push(
                    value
                );


                if (
                    values.length >
                    this.maxLoopIterations
                ) {

                    throw this.runtimeError(
                        "range() produit trop de valeurs."
                    );
                }
            }
        }


        return values;
    }



    /* =====================================================
       VALIDATION DE LA MISSION
    ===================================================== */

    validateMission(
        source,
        ast
    ) {

        const rules =
            this.levelData
                ?.goal
                ?.rules ||
            [];


        for (
            const rule
            of rules
        ) {

            const result =
                this.validateRule(
                    rule
                );


            if (
                !result.success
            ) {

                return this.decorateFailure(
                    result
                );
            }
        }


        const conceptResult =
            this.validateConcepts(
                source,
                ast
            );


        if (
            !conceptResult.success
        ) {

            return this.decorateFailure(
                conceptResult
            );
        }


        return {

            success:
                true,

            reason:
                "success",

            message:
                this.levelData
                    ?.successMessage ||
                "Mission réussie !"
        };
    }



    validateRule(rule) {

        switch (
            rule.type
        ) {

            case "position": {

                const success =
                    this.robot.isAt(
                        rule.x,
                        rule.y
                    );


                return success
                    ? {
                        success:
                            true
                    }
                    : {
                        success:
                            false,

                        reason:
                            "wrong_destination",

                        wrongDestination:
                            true,

                        message:
                            "Pyt n’est pas encore arrivé au bon endroit."
                    };
            }


            case "inventory_has": {

                const success =
                    this.robot
                        .inventoryContains(
                            rule.object
                        );


                return success
                    ? {
                        success:
                            true
                    }
                    : {
                        success:
                            false,

                        reason:
                            "missing_object",

                        message:
                            `Il manque encore ${this.objectLabel(rule.object)}.`
                    };
            }


            case "inventory_not_has": {

                const success =
                    !this.robot
                        .inventoryContains(
                            rule.object
                        );


                return success
                    ? {
                        success:
                            true
                    }
                    : {
                        success:
                            false,

                        reason:
                            "wrong_object",

                        message:
                            "Pyt a ramassé un objet qu’il ne fallait pas prendre."
                    };
            }


            case "visited": {

                const success =
                    this.robot
                        .hasVisited(
                            rule.x,
                            rule.y
                        );


                return success
                    ? {
                        success:
                            true
                    }
                    : {
                        success:
                            false,

                        reason:
                            "incomplete_route",

                        message:
                            "Le trajet n’est pas encore complet."
                    };
            }


            case "object_at": {

                const success =
                    this.world
                        .objects
                        .some(
                            object =>
                                this.normalize(
                                    object.id
                                ) ===
                                    this.normalize(
                                        rule.object
                                    ) &&
                                Number(
                                    object.x
                                ) ===
                                    Number(
                                        rule.x
                                    ) &&
                                Number(
                                    object.y
                                ) ===
                                    Number(
                                        rule.y
                                    )
                        );


                return success
                    ? {
                        success:
                            true
                    }
                    : {
                        success:
                            false,

                        reason:
                            "misplaced_object",

                        message:
                            "L’objet n’a pas encore été déposé au bon endroit."
                    };
            }


            case "minimum_moves": {

                const success =
                    this.robot.moveCount >=
                    Number(
                        rule.count
                    );


                return success
                    ? {
                        success:
                            true
                    }
                    : {
                        success:
                            false,

                        reason:
                            "incomplete_route",

                        message:
                            "Pyt n’a pas encore effectué tout le trajet demandé."
                    };
            }


            default:

                return {
                    success:
                        true
                };
        }
    }



    decorateFailure(result) {

        const actionFailure =
            this.execution
                ?.actionFailures
                ?.find(
                    item =>
                        Number(
                            item.line
                        ) > 0
                );


        if (
            actionFailure &&
            !result.errorLine
        ) {

            result.errorLine =
                actionFailure.line;


            result.hint =
                this.actionFailureHint(
                    actionFailure
                );
        }


        return result;
    }



    actionFailureHint(failure) {

        switch (
            failure.reason
        ) {

            case "blocked":

                return (
                    `Pyt rencontre un obstacle près de la ligne ${failure.line}. Vérifie le déplacement ou le virage juste avant.`
                );


            case "outside_map":

                return (
                    `Pyt essaie de sortir de la carte près de la ligne ${failure.line}.`
                );


            case "no_object":

                return (
                    `À la ligne ${failure.line}, Pyt essaie de ramasser un objet alors qu’il n’y en a aucun sous lui.`
                );


            case "wrong_object":

                return (
                    `À la ligne ${failure.line}, le nom demandé ne correspond pas à l’objet sous Pyt.`
                );


            case "empty_inventory":

                return (
                    `À la ligne ${failure.line}, l’inventaire de Pyt est vide.`
                );


            case "object_not_in_inventory":

                return (
                    `À la ligne ${failure.line}, Pyt essaie de déposer un objet qu’il ne possède pas.`
                );


            case "invalid_distance":

                return (
                    `La distance utilisée près de la ligne ${failure.line} n’est pas valide.`
                );


            default:

                return (
                    `Regarde plus attentivement la ligne ${failure.line}.`
                );
        }
    }



    /* =====================================================
       VALIDATION DES NOTIONS
    ===================================================== */

    validateConcepts(
        source,
        ast
    ) {

        const requirements =
            this.levelData
                ?.requiredConcepts ||
            [];


        if (
            requirements.length ===
            0
        ) {

            return {
                success:
                    true
            };
        }


        const features =
            PytCodeAnalyzer.analyze(
                source,
                ast
            );


        for (
            const requirement
            of requirements
        ) {

            if (
                !this.conceptSatisfied(
                    requirement,
                    features
                )
            ) {

                return {

                    success:
                        false,

                    reason:
                        "missing_concept",

                    message:
                        this.conceptMessage(
                            requirement
                        )
                };
            }
        }


        return {
            success:
                true
        };
    }



    conceptSatisfied(
        concept,
        features
    ) {

        switch (
            concept
        ) {

            case "sequence":

                return (
                    features.actionCalls >
                    0
                );


            case "turn":

                return (
                    features.turnCalls >
                    0
                );


            case "pickup":

                return (
                    features.pickupCalls >
                    0
                );


            case "assignment":

                return (
                    features.assignments >
                    0
                );


            case "variables_multiple":

                return (
                    features.assignments >=
                    2
                );


            case "string":

                return (
                    features.stringLiterals >
                    0
                );


            case "if":
            case "comparison":

                return (
                    features.ifStatements >
                    0
                );


            case "else":

                return (
                    features.elseBranches >
                    0
                );


            case "for":

                return (
                    features.forLoops >
                    0
                );


            case "range":

                return (
                    features.forLoops >
                        0 &&
                    features.rangeCalls >
                        0
                );


            case "function_definition":

                return (
                    features.functions >
                    0
                );


            case "function_call":

                return (
                    features.userFunctionCalls >
                    0
                );


            case "function_call_multiple":

                return (
                    features.userFunctionCalls >=
                    2
                );


            case "parameter":

                return (
                    features.functionParameters >
                    0
                );


            case "list":

                return (
                    features.listLiterals >
                    0
                );


            case "membership":

                return (
                    features.membershipTests >
                    0
                );


            case "dictionary":

                return (
                    features.dictionaryLiterals >
                    0
                );


            case "dictionary_access":

                return (
                    features.subscripts >
                    0
                );


            case "dictionary_access_multiple":

                return (
                    features.subscripts >=
                    2
                );


            case "while":

                return (
                    features.whileLoops >
                    0
                );


            case "control_structure":

                return (
                    features.ifStatements >
                        0 ||
                    features.forLoops >
                        0 ||
                    features.whileLoops >
                        0
                );


            case "loop":

                return (
                    features.forLoops >
                        0 ||
                    features.whileLoops >
                        0
                );


            case "function_or_condition":

                return (
                    features.functions >
                        0 ||
                    features.ifStatements >
                        0
                );


            default:

                /*
                Une notion inconnue ne doit pas
                bloquer une solution valide.
                */

                return true;
        }
    }



    conceptMessage(concept) {

        const messages = {

            assignment:
                "La mission fonctionne, mais cet exercice te demande aussi d’utiliser une variable.",

            variables_multiple:
                "Cet exercice te demande d’utiliser plusieurs variables.",

            string:
                "Cet exercice te demande d’utiliser une chaîne de caractères.",

            if:
                "Le résultat est bon, mais cet exercice doit aussi utiliser une condition if.",

            else:
                "Cet exercice doit utiliser if et else.",

            comparison:
                "Utilise une condition pour prendre la décision demandée.",

            for:
                "Le trajet fonctionne, mais cet exercice doit être résolu avec une boucle for.",

            range:
                "Utilise range() avec ta boucle for.",

            function_definition:
                "Le résultat est bon, mais crée une fonction avec def.",

            function_call:
                "N’oublie pas d’appeler la fonction que tu as créée.",

            function_call_multiple:
                "Essaie de réutiliser plusieurs fois ta fonction.",

            parameter:
                "La fonction doit recevoir un paramètre.",

            list:
                "Cet exercice doit utiliser une liste.",

            membership:
                "Utilise la liste pour décider quels objets doivent être pris.",

            dictionary:
                "Cet exercice doit utiliser un dictionnaire.",

            dictionary_access:
                "Lis une information enregistrée dans le dictionnaire.",

            dictionary_access_multiple:
                "Utilise plusieurs informations du dictionnaire.",

            while:
                "Le résultat est bon, mais cet exercice doit utiliser une boucle while.",

            control_structure:
                "Utilise au moins une condition ou une boucle pour cette mission.",

            loop:
                "Utilise une boucle pour organiser cette mission.",

            function_or_condition:
                "Utilise une fonction ou une condition pour structurer ton programme."
        };


        return (
            messages[concept] ||
            "Le résultat est presque bon, mais utilise aussi la notion demandée dans ce chapitre."
        );
    }



    /* =====================================================
       RÉSULTAT
    ===================================================== */

    dispatchExecutionResult(result) {

        this.setStatus(
            result.success
                ? "Mission réussie"
                : "Mission non terminée"
        );


        window.dispatchEvent(
            new CustomEvent(
                "pyt:execution-result",
                {
                    detail:
                        result
                }
            )
        );
    }



    formatPythonError(error) {

        if (
            error.reason ===
            "instruction_limit"
        ) {

            return (
                "Le programme exécute trop d’instructions. Vérifie qu’une boucle ne tourne pas sans fin."
            );
        }


        if (
            error.reason ===
            "loop_limit"
        ) {

            return (
                "Cette boucle semble ne jamais se terminer."
            );
        }


        if (
            error.reason ===
            "name_error"
        ) {

            return (
                error.message
            );
        }


        if (
            error.reason ===
            "syntax_error"
        ) {

            return (
                `Erreur Python : ${error.message}`
            );
        }


        return (
            error.message ||
            "Python n’a pas pu exécuter ce programme."
        );
    }



    /* =====================================================
       OUTILS DU MOTEUR
    ===================================================== */

    assertExecutionActive() {

        if (
            !this.execution ||
            this.execution.cancelled
        ) {

            const error =
                new Error(
                    "Exécution annulée."
                );


            error.reason =
                "cancelled";


            throw error;
        }
    }



    runtimeError(
        message,
        line = null,
        reason = "runtime_error"
    ) {

        const error =
            new Error(
                message
            );


        error.line =
            line ||
            this.execution
                ?.currentLine ||
            null;


        error.reason =
            reason;


        return error;
    }



    setStatus(message) {

        const element =
            document.getElementById(
                "game-status"
            );


        if (
            element
        ) {

            element.textContent =
                message;
        }
    }



    isBlocked(
        x,
        y
    ) {

        const blocked =
            this.world
                ?.map
                ?.blocked ||
            [];


        return blocked.some(
            cell => {

                if (
                    Array.isArray(
                        cell
                    )
                ) {

                    return (
                        Number(
                            cell[0]
                        ) ===
                            Number(x) &&
                        Number(
                            cell[1]
                        ) ===
                            Number(y)
                    );
                }


                return (
                    Number(
                        cell?.x
                    ) ===
                        Number(x) &&
                    Number(
                        cell?.y
                    ) ===
                        Number(y)
                );
            }
        );
    }



    cellTopLeft(
        x,
        y,
        layout
    ) {

        return {

            x:
                layout.x +
                Number(x) *
                layout.tile,

            y:
                layout.y +
                Number(y) *
                layout.tile
        };
    }



    roundRect(
        x,
        y,
        width,
        height,
        radius
    ) {

        const ctx =
            this.ctx;


        const r =
            Math.min(
                radius,
                width / 2,
                height / 2
            );


        ctx.beginPath();


        ctx.moveTo(
            x + r,
            y
        );


        ctx.lineTo(
            x + width - r,
            y
        );


        ctx.quadraticCurveTo(
            x + width,
            y,
            x + width,
            y + r
        );


        ctx.lineTo(
            x + width,
            y + height - r
        );


        ctx.quadraticCurveTo(
            x + width,
            y + height,
            x + width - r,
            y + height
        );


        ctx.lineTo(
            x + r,
            y + height
        );


        ctx.quadraticCurveTo(
            x,
            y + height,
            x,
            y + height - r
        );


        ctx.lineTo(
            x,
            y + r
        );


        ctx.quadraticCurveTo(
            x,
            y,
            x + r,
            y
        );


        ctx.closePath();
    }



    objectLabel(object) {

        return String(
            object ||
            "un objet"
        )
            .replace(
                /_/g,
                " "
            );
    }



    pythonString(value) {

        if (
            value ===
                null ||
            value ===
                undefined
        ) {

            return "None";
        }


        if (
            value === true
        ) {

            return "True";
        }


        if (
            value === false
        ) {

            return "False";
        }


        if (
            Array.isArray(
                value
            )
        ) {

            return (
                "[" +
                value
                    .map(
                        item =>
                            this.pythonString(
                                item
                            )
                    )
                    .join(
                        ", "
                    ) +
                "]"
            );
        }


        if (
            typeof value ===
                "object"
        ) {

            const entries =
                Object.entries(
                    value
                )
                    .map(
                        (
                            [
                                key,
                                item
                            ]
                        ) =>
                            `"${key}": ${this.pythonString(item)}`
                    );


            return (
                "{" +
                entries.join(
                    ", "
                ) +
                "}"
            );
        }


        return String(
            value
        );
    }



    normalize(value) {

        return String(
            value ?? ""
        )
            .normalize(
                "NFD"
            )
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .trim()
            .toLowerCase()
            .replace(
                /[\s-]+/g,
                "_"
            );
    }



    clone(value) {

        if (
            typeof structuredClone ===
            "function"
        ) {

            return structuredClone(
                value
            );
        }


        return JSON.parse(
            JSON.stringify(
                value
            )
        );
    }

}



/* =========================================================
   PARSER PYTHON
========================================================= */


class PytPythonParser {

    constructor(source) {

        this.source =
            String(
                source ??
                ""
            );


        this.lines =
            this.prepareLines(
                this.source
            );


        this.index =
            0;
    }



    /* =====================================================
       PRÉPARATION DES LIGNES

       Supporte maintenant les listes/dictionnaires
       écrits sur plusieurs lignes.
    ===================================================== */

    prepareLines(source) {

        const rawLines =
            source
                .replace(
                    /\r\n?/g,
                    "\n"
                )
                .split(
                    "\n"
                );


        const result =
            [];


        let buffer =
            null;


        let bracketDepth =
            0;


        rawLines.forEach(
            (
                raw,
                index
            ) => {

                const expanded =
                    raw.replace(
                        /\t/g,
                        "    "
                    );


                const clean =
                    this.stripComment(
                        expanded
                    );


                if (
                    buffer ===
                    null
                ) {

                    if (
                        !clean.trim()
                    ) {

                        return;
                    }


                    const indentMatch =
                        clean.match(
                            /^ */
                        );


                    const indentation =
                        indentMatch
                            ? indentMatch[0]
                                .length
                            : 0;


                    buffer = {

                        line:
                            index + 1,

                        indent:
                            indentation,

                        text:
                            clean.trim()
                    };


                    bracketDepth =
                        this.bracketDelta(
                            buffer.text
                        );


                    if (
                        bracketDepth <=
                        0
                    ) {

                        result.push(
                            buffer
                        );


                        buffer =
                            null;


                        bracketDepth =
                            0;
                    }


                    return;
                }


                const continuation =
                    clean.trim();


                if (
                    continuation
                ) {

                    buffer.text +=
                        " " +
                        continuation;


                    bracketDepth +=
                        this.bracketDelta(
                            continuation
                        );
                }


                if (
                    bracketDepth <=
                    0
                ) {

                    result.push(
                        buffer
                    );


                    buffer =
                        null;


                    bracketDepth =
                        0;
                }
            }
        );


        if (
            buffer !==
            null
        ) {

            result.push(
                buffer
            );
        }


        return result;
    }



    bracketDelta(text) {

        let depth =
            0;


        let quote =
            null;


        let escaped =
            false;


        for (
            let index = 0;
            index < text.length;
            index += 1
        ) {

            const char =
                text[index];


            if (
                escaped
            ) {

                escaped =
                    false;

                continue;
            }


            if (
                char === "\\"
            ) {

                escaped =
                    true;

                continue;
            }


            if (
                quote
            ) {

                if (
                    char ===
                    quote
                ) {

                    quote =
                        null;
                }


                continue;
            }


            if (
                char === "\"" ||
                char === "'"
            ) {

                quote =
                    char;

                continue;
            }


            if (
                char === "(" ||
                char === "[" ||
                char === "{"
            ) {

                depth +=
                    1;
            }


            if (
                char === ")" ||
                char === "]" ||
                char === "}"
            ) {

                depth -=
                    1;
            }
        }


        return depth;
    }



    stripComment(line) {

        let quote =
            null;


        let escaped =
            false;


        for (
            let index = 0;
            index < line.length;
            index += 1
        ) {

            const char =
                line[index];


            if (
                escaped
            ) {

                escaped =
                    false;

                continue;
            }


            if (
                char === "\\"
            ) {

                escaped =
                    true;

                continue;
            }


            if (
                quote
            ) {

                if (
                    char ===
                    quote
                ) {

                    quote =
                        null;
                }


                continue;
            }


            if (
                char === "\"" ||
                char === "'"
            ) {

                quote =
                    char;

                continue;
            }


            if (
                char === "#"
            ) {

                return line.slice(
                    0,
                    index
                );
            }
        }


        return line;
    }



    parse() {

        if (
            this.lines.length ===
            0
        ) {

            return [];
        }


        if (
            this.lines[0].indent !==
            0
        ) {

            throw this.syntaxError(
                "Indentation inattendue.",
                this.lines[0].line
            );
        }


        const result =
            this.parseBlock(
                0
            );


        if (
            this.index <
            this.lines.length
        ) {

            throw this.syntaxError(
                "Indentation incorrecte.",
                this.lines[
                    this.index
                ].line
            );
        }


        return result;
    }



    parseBlock(indent) {

        const statements =
            [];


        while (
            this.index <
            this.lines.length
        ) {

            const current =
                this.lines[
                    this.index
                ];


            if (
                current.indent <
                indent
            ) {

                break;
            }


            if (
                current.indent >
                indent
            ) {

                throw this.syntaxError(
                    "Indentation inattendue.",
                    current.line
                );
            }


            if (
                current.text ===
                    "else:" ||
                current.text.startsWith(
                    "elif "
                )
            ) {

                break;
            }


            statements.push(
                this.parseStatement(
                    indent
                )
            );
        }


        return statements;
    }



    parseStatement(indent) {

        const current =
            this.lines[
                this.index
            ];


        const text =
            current.text;


        if (
            /^if\s+.+:$/.test(
                text
            )
        ) {

            return this.parseIf(
                indent
            );
        }


        if (
            /^while\s+.+:$/.test(
                text
            )
        ) {

            return this.parseWhile(
                indent
            );
        }


        if (
            /^for\s+[A-Za-z_]\w*\s+in\s+.+:$/.test(
                text
            )
        ) {

            return this.parseFor(
                indent
            );
        }


        if (
            /^def\s+[A-Za-z_]\w*\s*\(.*\)\s*:$/.test(
                text
            )
        ) {

            return this.parseFunction(
                indent
            );
        }


        this.index +=
            1;


        if (
            text ===
            "pass"
        ) {

            return {

                type:
                    "pass",

                line:
                    current.line
            };
        }


        if (
            text ===
                "return" ||
            text.startsWith(
                "return "
            )
        ) {

            const value =
                text ===
                    "return"
                    ? null
                    : this.parseExpression(
                        text.slice(
                            6
                        ).trim(),
                        current.line
                    );


            return {

                type:
                    "return",

                value,

                line:
                    current.line
            };
        }


        const assignment =
            text.match(
                /^([A-Za-z_]\w*)\s*(\+=|-=|\*=|\/=|=)\s*(.+)$/
            );


        if (
            assignment
        ) {

            return {

                type:
                    "assign",

                name:
                    assignment[1],

                operator:
                    assignment[2],

                value:
                    this.parseExpression(
                        assignment[3],
                        current.line
                    ),

                line:
                    current.line
            };
        }


        return {

            type:
                "expression",

            expression:
                this.parseExpression(
                    text,
                    current.line
                ),

            line:
                current.line
        };
    }



    parseIf(indent) {

        const current =
            this.lines[
                this.index
            ];


        const conditionText =
            current.text
                .slice(
                    2,
                    -1
                )
                .trim();


        this.index +=
            1;


        const body =
            this.parseChildBlock(
                indent,
                current.line
            );


        const branches = [
            {

                condition:
                    this.parseExpression(
                        conditionText,
                        current.line
                    ),

                body,

                line:
                    current.line
            }
        ];


        let elseBody =
            null;


        while (
            this.index <
            this.lines.length
        ) {

            const next =
                this.lines[
                    this.index
                ];


            if (
                next.indent !==
                indent
            ) {

                break;
            }


            if (
                next.text.startsWith(
                    "elif "
                ) &&
                next.text.endsWith(
                    ":"
                )
            ) {

                const condition =
                    next.text
                        .slice(
                            5,
                            -1
                        )
                        .trim();


                this.index +=
                    1;


                const branchBody =
                    this.parseChildBlock(
                        indent,
                        next.line
                    );


                branches.push({

                    condition:
                        this.parseExpression(
                            condition,
                            next.line
                        ),

                    body:
                        branchBody,

                    line:
                        next.line
                });


                continue;
            }


            if (
                next.text ===
                "else:"
            ) {

                this.index +=
                    1;


                elseBody =
                    this.parseChildBlock(
                        indent,
                        next.line
                    );


                break;
            }


            break;
        }


        return {

            type:
                "if",

            branches,

            elseBody,

            line:
                current.line
        };
    }



    parseWhile(indent) {

        const current =
            this.lines[
                this.index
            ];


        const condition =
            current.text
                .slice(
                    5,
                    -1
                )
                .trim();


        this.index +=
            1;


        return {

            type:
                "while",

            condition:
                this.parseExpression(
                    condition,
                    current.line
                ),

            body:
                this.parseChildBlock(
                    indent,
                    current.line
                ),

            line:
                current.line
        };
    }



    parseFor(indent) {

        const current =
            this.lines[
                this.index
            ];


        const match =
            current.text.match(
                /^for\s+([A-Za-z_]\w*)\s+in\s+(.+):$/
            );


        if (
            !match
        ) {

            throw this.syntaxError(
                "Boucle for invalide.",
                current.line
            );
        }


        this.index +=
            1;


        return {

            type:
                "for",

            variable:
                match[1],

            iterable:
                this.parseExpression(
                    match[2],
                    current.line
                ),

            body:
                this.parseChildBlock(
                    indent,
                    current.line
                ),

            line:
                current.line
        };
    }



    parseFunction(indent) {

        const current =
            this.lines[
                this.index
            ];


        const match =
            current.text.match(
                /^def\s+([A-Za-z_]\w*)\s*\((.*)\)\s*:$/
            );


        if (
            !match
        ) {

            throw this.syntaxError(
                "Définition de fonction invalide.",
                current.line
            );
        }


        const paramsText =
            match[2].trim();


        const parameters =
            paramsText
                ? paramsText
                    .split(
                        ","
                    )
                    .map(
                        value =>
                            value.trim()
                    )
                : [];


        parameters.forEach(
            parameter => {

                if (
                    !/^[A-Za-z_]\w*$/.test(
                        parameter
                    )
                ) {

                    throw this.syntaxError(
                        `Paramètre invalide : ${parameter}`,
                        current.line
                    );
                }
            }
        );


        this.index +=
            1;


        return {

            type:
                "function",

            name:
                match[1],

            parameters,

            body:
                this.parseChildBlock(
                    indent,
                    current.line
                ),

            line:
                current.line
        };
    }



    parseChildBlock(
        parentIndent,
        line
    ) {

        if (
            this.index >=
            this.lines.length
        ) {

            throw this.syntaxError(
                "Un bloc indenté est attendu.",
                line
            );
        }


        const next =
            this.lines[
                this.index
            ];


        if (
            next.indent <=
            parentIndent
        ) {

            throw this.syntaxError(
                "Un bloc indenté est attendu.",
                next.line
            );
        }


        return this.parseBlock(
            next.indent
        );
    }



    parseExpression(
        source,
        line
    ) {

        const parser =
            new PytExpressionParser(
                source,
                line
            );


        return parser.parse();
    }



    syntaxError(
        message,
        line
    ) {

        const error =
            new Error(
                message
            );


        error.line =
            line;


        error.reason =
            "syntax_error";


        return error;
    }

}



/* =========================================================
   PARSER D'EXPRESSIONS
========================================================= */


class PytExpressionParser {

    constructor(
        source,
        line
    ) {

        this.source =
            source;

        this.line =
            line;

        this.tokens =
            this.tokenize(
                source
            );

        this.index =
            0;
    }



    tokenize(source) {

        const tokens =
            [];


        let index =
            0;


        while (
            index <
            source.length
        ) {

            const char =
                source[index];


            if (
                /\s/.test(
                    char
                )
            ) {

                index +=
                    1;

                continue;
            }


            if (
                char === "\"" ||
                char === "'"
            ) {

                const quote =
                    char;


                let value =
                    "";


                let escaped =
                    false;


                index +=
                    1;


                let closed =
                    false;


                while (
                    index <
                    source.length
                ) {

                    const current =
                        source[index];


                    if (
                        escaped
                    ) {

                        const escapes = {

                            n: "\n",
                            t: "\t",
                            r: "\r",

                            "\\": "\\",

                            "\"": "\"",

                            "'": "'"
                        };


                        value +=
                            escapes[current] ??
                            current;


                        escaped =
                            false;


                        index +=
                            1;


                        continue;
                    }


                    if (
                        current === "\\"
                    ) {

                        escaped =
                            true;

                        index +=
                            1;

                        continue;
                    }


                    if (
                        current ===
                        quote
                    ) {

                        closed =
                            true;

                        index +=
                            1;

                        break;
                    }


                    value +=
                        current;


                    index +=
                        1;
                }


                if (
                    !closed
                ) {

                    throw this.error(
                        "Chaîne de caractères non terminée."
                    );
                }


                tokens.push({

                    type:
                        "string",

                    value
                });


                continue;
            }


            const number =
                source
                    .slice(
                        index
                    )
                    .match(
                        /^\d+(?:\.\d+)?/
                    );


            if (
                number
            ) {

                tokens.push({

                    type:
                        "number",

                    value:
                        Number(
                            number[0]
                        )
                });


                index +=
                    number[0]
                        .length;


                continue;
            }


            const identifier =
                source
                    .slice(
                        index
                    )
                    .match(
                        /^[A-Za-z_]\w*/
                    );


            if (
                identifier
            ) {

                tokens.push({

                    type:
                        "identifier",

                    value:
                        identifier[0]
                });


                index +=
                    identifier[0]
                        .length;


                continue;
            }


            const two =
                source.slice(
                    index,
                    index + 2
                );


            if (
                [
                    "==",
                    "!=",
                    "<=",
                    ">=",
                    "//"
                ].includes(
                    two
                )
            ) {

                tokens.push({

                    type:
                        "operator",

                    value:
                        two
                });


                index +=
                    2;


                continue;
            }


            if (
                "+-*/%<>()[]{}:,"
                    .includes(
                        char
                    )
            ) {

                tokens.push({

                    type:
                        "operator",

                    value:
                        char
                });


                index +=
                    1;


                continue;
            }


            throw this.error(
                `Caractère inattendu : ${char}`
            );
        }


        tokens.push({

            type:
                "eof",

            value:
                null
        });


        return tokens;
    }



    parse() {

        const expression =
            this.parseOr();


        if (
            !this.isEnd()
        ) {

            throw this.error(
                `Expression invalide près de "${this.peek().value}".`
            );
        }


        return expression;
    }



    parseOr() {

        let left =
            this.parseAnd();


        while (
            this.matchKeyword(
                "or"
            )
        ) {

            left = {

                type:
                    "binary",

                operator:
                    "or",

                left,

                right:
                    this.parseAnd()
            };
        }


        return left;
    }



    parseAnd() {

        let left =
            this.parseNot();


        while (
            this.matchKeyword(
                "and"
            )
        ) {

            left = {

                type:
                    "binary",

                operator:
                    "and",

                left,

                right:
                    this.parseNot()
            };
        }


        return left;
    }



    parseNot() {

        if (
            this.matchKeyword(
                "not"
            )
        ) {

            return {

                type:
                    "unary",

                operator:
                    "not",

                argument:
                    this.parseNot()
            };
        }


        return this.parseComparison();
    }



    parseComparison() {

        let left =
            this.parseAdditive();


        while (
            true
        ) {

            let operator =
                null;


            if (
                this.matchOperator(
                    "=="
                )
            ) {

                operator =
                    "==";

            } else if (
                this.matchOperator(
                    "!="
                )
            ) {

                operator =
                    "!=";

            } else if (
                this.matchOperator(
                    "<="
                )
            ) {

                operator =
                    "<=";

            } else if (
                this.matchOperator(
                    ">="
                )
            ) {

                operator =
                    ">=";

            } else if (
                this.matchOperator(
                    "<"
                )
            ) {

                operator =
                    "<";

            } else if (
                this.matchOperator(
                    ">"
                )
            ) {

                operator =
                    ">";

            } else if (
                this.matchKeyword(
                    "in"
                )
            ) {

                operator =
                    "in";

            } else if (
                this.checkKeyword(
                    "not"
                ) &&
                this.checkKeyword(
                    "in",
                    1
                )
            ) {

                this.index +=
                    2;


                operator =
                    "not in";
            }


            if (
                !operator
            ) {

                break;
            }


            left = {

                type:
                    "binary",

                operator,

                left,

                right:
                    this.parseAdditive()
            };
        }


        return left;
    }



    parseAdditive() {

        let left =
            this.parseMultiplicative();


        while (
            true
        ) {

            let operator =
                null;


            if (
                this.matchOperator(
                    "+"
                )
            ) {

                operator =
                    "+";

            } else if (
                this.matchOperator(
                    "-"
                )
            ) {

                operator =
                    "-";
            }


            if (
                !operator
            ) {

                break;
            }


            left = {

                type:
                    "binary",

                operator,

                left,

                right:
                    this.parseMultiplicative()
            };
        }


        return left;
    }



    parseMultiplicative() {

        let left =
            this.parseUnary();


        while (
            true
        ) {

            let operator =
                null;


            for (
                const candidate
                of [
                    "*",
                    "/",
                    "//",
                    "%"
                ]
            ) {

                if (
                    this.matchOperator(
                        candidate
                    )
                ) {

                    operator =
                        candidate;

                    break;
                }
            }


            if (
                !operator
            ) {

                break;
            }


            left = {

                type:
                    "binary",

                operator,

                left,

                right:
                    this.parseUnary()
            };
        }


        return left;
    }



    parseUnary() {

        if (
            this.matchOperator(
                "+"
            )
        ) {

            return {

                type:
                    "unary",

                operator:
                    "+",

                argument:
                    this.parseUnary()
            };
        }


        if (
            this.matchOperator(
                "-"
            )
        ) {

            return {

                type:
                    "unary",

                operator:
                    "-",

                argument:
                    this.parseUnary()
            };
        }


        return this.parsePostfix();
    }



    parsePostfix() {

        let expression =
            this.parsePrimary();


        while (
            true
        ) {

            if (
                this.matchOperator(
                    "("
                )
            ) {

                const args =
                    [];


                if (
                    !this.checkOperator(
                        ")"
                    )
                ) {

                    do {

                        args.push(
                            this.parseOr()
                        );

                    } while (
                        this.matchOperator(
                            ","
                        ) &&
                        !this.checkOperator(
                            ")"
                        )
                    );
                }


                this.expectOperator(
                    ")"
                );


                expression = {

                    type:
                        "call",

                    callee:
                        expression,

                    args
                };


                continue;
            }


            if (
                this.matchOperator(
                    "["
                )
            ) {

                const index =
                    this.parseOr();


                this.expectOperator(
                    "]"
                );


                expression = {

                    type:
                        "subscript",

                    object:
                        expression,

                    index
                };


                continue;
            }


            break;
        }


        return expression;
    }



    parsePrimary() {

        const token =
            this.peek();


        if (
            token.type ===
            "number"
        ) {

            this.index +=
                1;


            return {

                type:
                    "literal",

                value:
                    token.value
            };
        }


        if (
            token.type ===
            "string"
        ) {

            this.index +=
                1;


            return {

                type:
                    "literal",

                value:
                    token.value
            };
        }


        if (
            token.type ===
            "identifier"
        ) {

            this.index +=
                1;


            if (
                token.value ===
                "True"
            ) {

                return {

                    type:
                        "literal",

                    value:
                        true
                };
            }


            if (
                token.value ===
                "False"
            ) {

                return {

                    type:
                        "literal",

                    value:
                        false
                };
            }


            if (
                token.value ===
                "None"
            ) {

                return {

                    type:
                        "literal",

                    value:
                        null
                };
            }


            return {

                type:
                    "identifier",

                name:
                    token.value
            };
        }


        if (
            this.matchOperator(
                "("
            )
        ) {

            const expression =
                this.parseOr();


            this.expectOperator(
                ")"
            );


            return expression;
        }


        if (
            this.matchOperator(
                "["
            )
        ) {

            const values =
                [];


            if (
                !this.checkOperator(
                    "]"
                )
            ) {

                do {

                    values.push(
                        this.parseOr()
                    );

                } while (
                    this.matchOperator(
                        ","
                    ) &&
                    !this.checkOperator(
                        "]"
                    )
                );
            }


            this.expectOperator(
                "]"
            );


            return {

                type:
                    "list",

                values
            };
        }


        if (
            this.matchOperator(
                "{"
            )
        ) {

            const entries =
                [];


            if (
                !this.checkOperator(
                    "}"
                )
            ) {

                do {

                    const key =
                        this.parseOr();


                    this.expectOperator(
                        ":"
                    );


                    const value =
                        this.parseOr();


                    entries.push({
                        key,
                        value
                    });

                } while (
                    this.matchOperator(
                        ","
                    ) &&
                    !this.checkOperator(
                        "}"
                    )
                );
            }


            this.expectOperator(
                "}"
            );


            return {

                type:
                    "dictionary",

                entries
            };
        }


        throw this.error(
            "Expression incomplète."
        );
    }



    peek(
        offset = 0
    ) {

        return (
            this.tokens[
                this.index +
                offset
            ] ||
            {
                type:
                    "eof",

                value:
                    null
            }
        );
    }



    isEnd() {

        return (
            this.peek().type ===
            "eof"
        );
    }



    checkOperator(
        value,
        offset = 0
    ) {

        const token =
            this.peek(
                offset
            );


        return (
            token.type ===
                "operator" &&
            token.value ===
                value
        );
    }



    matchOperator(value) {

        if (
            !this.checkOperator(
                value
            )
        ) {

            return false;
        }


        this.index +=
            1;


        return true;
    }



    expectOperator(value) {

        if (
            !this.matchOperator(
                value
            )
        ) {

            throw this.error(
                `« ${value} » attendu.`
            );
        }
    }



    checkKeyword(
        value,
        offset = 0
    ) {

        const token =
            this.peek(
                offset
            );


        return (
            token.type ===
                "identifier" &&
            token.value ===
                value
        );
    }



    matchKeyword(value) {

        if (
            !this.checkKeyword(
                value
            )
        ) {

            return false;
        }


        this.index +=
            1;


        return true;
    }



    error(message) {

        const error =
            new Error(
                message
            );


        error.line =
            this.line;


        error.reason =
            "syntax_error";


        return error;
    }

}



/* =========================================================
   INTERPRÉTEUR
========================================================= */


class PytPythonInterpreter {

    constructor(options) {

        this.game =
            options.game;

        this.robot =
            options.robot;

        this.world =
            options.world;

        this.execution =
            options.execution;

        this.maxInstructions =
            options.maxInstructions;

        this.maxLoopIterations =
            options.maxLoopIterations;

        this.maxCallDepth =
            options.maxCallDepth;


        this.globalScope =
            new PytScope();


        const builtins =
            this.game
                .createBuiltins();


        Object.entries(
            builtins
        )
            .forEach(
                (
                    [
                        name,
                        fn
                    ]
                ) => {

                    this.globalScope
                        .set(
                            name,
                            {

                                __pytCallable:
                                    true,

                                type:
                                    "builtin",

                                call:
                                    fn
                            }
                        );
                }
            );
    }



    async execute(statements) {

        await this.executeBlock(
            statements,
            this.globalScope
        );
    }



    async executeBlock(
        statements,
        scope
    ) {

        for (
            const statement
            of statements
        ) {

            this.assertActive();


            this.execution
                .currentLine =
                statement.line;


            this.execution
                .instructionCount +=
                1;


            if (
                this.execution
                    .instructionCount >
                this.maxInstructions
            ) {

                const error =
                    new Error(
                        "Trop d’instructions exécutées."
                    );


                error.line =
                    statement.line;


                error.reason =
                    "instruction_limit";


                throw error;
            }


            const result =
                await this.executeStatement(
                    statement,
                    scope
                );


            if (
                result?.type ===
                "return"
            ) {

                return result;
            }
        }


        return null;
    }



    async executeStatement(
        statement,
        scope
    ) {

        switch (
            statement.type
        ) {

            case "pass":

                return null;


            case "assign": {

                const value =
                    await this.evaluate(
                        statement.value,
                        scope
                    );


                if (
                    statement.operator ===
                    "="
                ) {

                    scope.set(
                        statement.name,
                        value
                    );


                    return null;
                }


                const current =
                    scope.get(
                        statement.name,
                        statement.line
                    );


                let newValue;


                switch (
                    statement.operator
                ) {

                    case "+=":

                        newValue =
                            this.add(
                                current,
                                value
                            );

                        break;


                    case "-=":

                        newValue =
                            Number(
                                current
                            ) -
                            Number(
                                value
                            );

                        break;


                    case "*=":

                        newValue =
                            Number(
                                current
                            ) *
                            Number(
                                value
                            );

                        break;


                    case "/=":

                        if (
                            Number(
                                value
                            ) ===
                            0
                        ) {

                            throw this.runtimeError(
                                "Division par zéro.",
                                statement.line
                            );
                        }


                        newValue =
                            Number(
                                current
                            ) /
                            Number(
                                value
                            );

                        break;


                    default:

                        newValue =
                            value;
                }


                scope.set(
                    statement.name,
                    newValue
                );


                return null;
            }


            case "expression":

                await this.evaluate(
                    statement.expression,
                    scope
                );


                return null;


            case "if": {

                for (
                    const branch
                    of statement.branches
                ) {

                    const condition =
                        await this.evaluate(
                            branch.condition,
                            scope
                        );


                    if (
                        this.truthy(
                            condition
                        )
                    ) {

                        return this.executeBlock(
                            branch.body,
                            scope
                        );
                    }
                }


                if (
                    statement.elseBody
                ) {

                    return this.executeBlock(
                        statement.elseBody,
                        scope
                    );
                }


                return null;
            }


            case "while": {

                let iterations =
                    0;


                while (
                    true
                ) {

                    this.assertActive();


                    const condition =
                        await this.evaluate(
                            statement.condition,
                            scope
                        );


                    if (
                        !this.truthy(
                            condition
                        )
                    ) {

                        break;
                    }


                    iterations +=
                        1;


                    if (
                        iterations >
                        this.maxLoopIterations
                    ) {

                        const error =
                            new Error(
                                "Cette boucle semble infinie."
                            );


                        error.line =
                            statement.line;


                        error.reason =
                            "loop_limit";


                        throw error;
                    }


                    const result =
                        await this.executeBlock(
                            statement.body,
                            scope
                        );


                    if (
                        result?.type ===
                        "return"
                    ) {

                        return result;
                    }
                }


                return null;
            }


            case "for": {

                const iterable =
                    await this.evaluate(
                        statement.iterable,
                        scope
                    );


                const values =
                    this.toIterable(
                        iterable,
                        statement.line
                    );


                if (
                    values.length >
                    this.maxLoopIterations
                ) {

                    const error =
                        new Error(
                            "La boucle contient trop d’itérations."
                        );


                    error.line =
                        statement.line;


                    error.reason =
                        "loop_limit";


                    throw error;
                }


                for (
                    const value
                    of values
                ) {

                    scope.set(
                        statement.variable,
                        value
                    );


                    const result =
                        await this.executeBlock(
                            statement.body,
                            scope
                        );


                    if (
                        result?.type ===
                        "return"
                    ) {

                        return result;
                    }
                }


                return null;
            }


            case "function": {

                scope.set(
                    statement.name,
                    {

                        __pytCallable:
                            true,

                        type:
                            "function",

                        name:
                            statement.name,

                        parameters:
                            statement.parameters,

                        body:
                            statement.body,

                        definingScope:
                            scope
                    }
                );


                return null;
            }


            case "return": {

                const value =
                    statement.value
                        ? await this.evaluate(
                            statement.value,
                            scope
                        )
                        : null;


                return {

                    type:
                        "return",

                    value
                };
            }


            default:

                throw this.runtimeError(
                    `Instruction non prise en charge : ${statement.type}`,
                    statement.line
                );
        }
    }



    async evaluate(
        node,
        scope
    ) {

        this.assertActive();


        switch (
            node.type
        ) {

            case "literal":

                return node.value;


            case "identifier":

                return scope.get(
                    node.name,
                    this.execution
                        .currentLine
                );


            case "list": {

                const values =
                    [];


                for (
                    const value
                    of node.values
                ) {

                    values.push(
                        await this.evaluate(
                            value,
                            scope
                        )
                    );
                }


                return values;
            }


            case "dictionary": {

                const object =
                    {};


                for (
                    const entry
                    of node.entries
                ) {

                    const key =
                        await this.evaluate(
                            entry.key,
                            scope
                        );


                    const value =
                        await this.evaluate(
                            entry.value,
                            scope
                        );


                    object[
                        String(
                            key
                        )
                    ] =
                        value;
                }


                return object;
            }


            case "unary": {

                const value =
                    await this.evaluate(
                        node.argument,
                        scope
                    );


                switch (
                    node.operator
                ) {

                    case "not":

                        return (
                            !this.truthy(
                                value
                            )
                        );


                    case "+":

                        return Number(
                            value
                        );


                    case "-":

                        return -Number(
                            value
                        );


                    default:

                        return value;
                }
            }


            case "binary":

                return this.evaluateBinary(
                    node,
                    scope
                );


            case "call":

                return this.evaluateCall(
                    node,
                    scope
                );


            case "subscript":

                return this.evaluateSubscript(
                    node,
                    scope
                );


            default:

                throw this.runtimeError(
                    `Expression inconnue : ${node.type}`
                );
        }
    }



    async evaluateBinary(
        node,
        scope
    ) {

        if (
            node.operator ===
            "and"
        ) {

            const left =
                await this.evaluate(
                    node.left,
                    scope
                );


            if (
                !this.truthy(
                    left
                )
            ) {

                return left;
            }


            return this.evaluate(
                node.right,
                scope
            );
        }


        if (
            node.operator ===
            "or"
        ) {

            const left =
                await this.evaluate(
                    node.left,
                    scope
                );


            if (
                this.truthy(
                    left
                )
            ) {

                return left;
            }


            return this.evaluate(
                node.right,
                scope
            );
        }


        const left =
            await this.evaluate(
                node.left,
                scope
            );


        const right =
            await this.evaluate(
                node.right,
                scope
            );


        switch (
            node.operator
        ) {

            case "==":

                return this.equal(
                    left,
                    right
                );


            case "!=":

                return !this.equal(
                    left,
                    right
                );


            case "<":

                return (
                    left <
                    right
                );


            case ">":

                return (
                    left >
                    right
                );


            case "<=":

                return (
                    left <=
                    right
                );


            case ">=":

                return (
                    left >=
                    right
                );


            case "+":

                return this.add(
                    left,
                    right
                );


            case "-":

                return (
                    Number(left) -
                    Number(right)
                );


            case "*":

                return (
                    Number(left) *
                    Number(right)
                );


            case "/": {

                if (
                    Number(
                        right
                    ) ===
                    0
                ) {

                    throw this.runtimeError(
                        "Division par zéro."
                    );
                }


                return (
                    Number(left) /
                    Number(right)
                );
            }


            case "//": {

                if (
                    Number(
                        right
                    ) ===
                    0
                ) {

                    throw this.runtimeError(
                        "Division par zéro."
                    );
                }


                return Math.floor(
                    Number(left) /
                    Number(right)
                );
            }


            case "%": {

                if (
                    Number(
                        right
                    ) ===
                    0
                ) {

                    throw this.runtimeError(
                        "Modulo par zéro."
                    );
                }


                return (
                    Number(left) %
                    Number(right)
                );
            }


            case "in":

                return this.contains(
                    right,
                    left
                );


            case "not in":

                return !this.contains(
                    right,
                    left
                );


            default:

                throw this.runtimeError(
                    `Opérateur inconnu : ${node.operator}`
                );
        }
    }



    async evaluateCall(
        node,
        scope
    ) {

        const callable =
            await this.evaluate(
                node.callee,
                scope
            );


        if (
            !callable ||
            callable.__pytCallable !==
                true
        ) {

            throw this.runtimeError(
                "Cette valeur n’est pas une fonction."
            );
        }


        const args =
            [];


        for (
            const argument
            of node.args
        ) {

            args.push(
                await this.evaluate(
                    argument,
                    scope
                )
            );
        }


        if (
            callable.type ===
            "builtin"
        ) {

            return callable.call(
                ...args
            );
        }


        if (
            callable.type ===
            "function"
        ) {

            if (
                args.length !==
                callable.parameters.length
            ) {

                throw this.runtimeError(
                    `${callable.name}() attend ${callable.parameters.length} argument(s), mais ${args.length} ont été fournis.`
                );
            }


            this.execution
                .callDepth +=
                1;


            if (
                this.execution
                    .callDepth >
                this.maxCallDepth
            ) {

                throw this.runtimeError(
                    "Trop d’appels de fonctions imbriqués."
                );
            }


            const functionScope =
                new PytScope(
                    callable.definingScope
                );


            callable.parameters
                .forEach(
                    (
                        name,
                        index
                    ) => {

                        functionScope.set(
                            name,
                            args[index]
                        );
                    }
                );


            try {

                const result =
                    await this.executeBlock(
                        callable.body,
                        functionScope
                    );


                return (
                    result?.type ===
                    "return"
                        ? result.value
                        : null
                );

            } finally {

                this.execution
                    .callDepth -=
                    1;
            }
        }


        return null;
    }



    async evaluateSubscript(
        node,
        scope
    ) {

        const object =
            await this.evaluate(
                node.object,
                scope
            );


        const index =
            await this.evaluate(
                node.index,
                scope
            );


        if (
            Array.isArray(
                object
            ) ||
            typeof object ===
                "string"
        ) {

            let position =
                Number(
                    index
                );


            if (
                !Number.isInteger(
                    position
                )
            ) {

                throw this.runtimeError(
                    "L’indice d’une liste doit être un entier."
                );
            }


            if (
                position <
                0
            ) {

                position =
                    object.length +
                    position;
            }


            if (
                position <
                    0 ||
                position >=
                    object.length
            ) {

                throw this.runtimeError(
                    "Indice hors de la liste."
                );
            }


            return object[
                position
            ];
        }


        if (
            object &&
            typeof object ===
                "object"
        ) {

            const key =
                String(
                    index
                );


            if (
                !Object.prototype
                    .hasOwnProperty
                    .call(
                        object,
                        key
                    )
            ) {

                throw this.runtimeError(
                    `La clé "${key}" n’existe pas dans ce dictionnaire.`
                );
            }


            return object[
                key
            ];
        }


        throw this.runtimeError(
            "Cette valeur ne peut pas être indexée."
        );
    }



    add(
        left,
        right
    ) {

        if (
            typeof left ===
                "string" ||
            typeof right ===
                "string"
        ) {

            return (
                String(
                    left
                ) +
                String(
                    right
                )
            );
        }


        if (
            Array.isArray(
                left
            ) &&
            Array.isArray(
                right
            )
        ) {

            return [
                ...left,
                ...right
            ];
        }


        return (
            Number(
                left
            ) +
            Number(
                right
            )
        );
    }



    equal(
        left,
        right
    ) {

        if (
            typeof left !==
            typeof right
        ) {

            return (
                left ==
                right
            );
        }


        if (
            typeof left ===
                "object" &&
            left !==
                null &&
            right !==
                null
        ) {

            return (
                JSON.stringify(
                    left
                ) ===
                JSON.stringify(
                    right
                )
            );
        }


        return (
            left ===
            right
        );
    }



    contains(
        container,
        item
    ) {

        if (
            Array.isArray(
                container
            )
        ) {

            return container.some(
                value =>
                    this.equal(
                        value,
                        item
                    )
            );
        }


        if (
            typeof container ===
            "string"
        ) {

            return container.includes(
                String(
                    item
                )
            );
        }


        if (
            container &&
            typeof container ===
                "object"
        ) {

            return Object.prototype
                .hasOwnProperty
                .call(
                    container,
                    String(
                        item
                    )
                );
        }


        return false;
    }



    toIterable(
        value,
        line
    ) {

        if (
            Array.isArray(
                value
            )
        ) {

            return [
                ...value
            ];
        }


        if (
            typeof value ===
            "string"
        ) {

            return [
                ...value
            ];
        }


        if (
            value &&
            typeof value ===
                "object"
        ) {

            return Object.keys(
                value
            );
        }


        throw this.runtimeError(
            "Cette valeur ne peut pas être parcourue avec for.",
            line
        );
    }



    truthy(value) {

        if (
            value ===
                null ||
            value ===
                false
        ) {

            return false;
        }


        if (
            typeof value ===
            "number"
        ) {

            return (
                value !==
                0
            );
        }


        if (
            typeof value ===
            "string"
        ) {

            return (
                value.length >
                0
            );
        }


        if (
            Array.isArray(
                value
            )
        ) {

            return (
                value.length >
                0
            );
        }


        return true;
    }



    assertActive() {

        this.game
            .assertExecutionActive();
    }



    runtimeError(
        message,
        line = null
    ) {

        return this.game
            .runtimeError(
                message,
                line
            );
    }

}



/* =========================================================
   PORTÉE DES VARIABLES
========================================================= */


class PytScope {

    constructor(
        parent = null
    ) {

        this.parent =
            parent;


        this.values =
            new Map();
    }



    set(
        name,
        value
    ) {

        this.values.set(
            name,
            value
        );
    }



    hasOwn(name) {

        return this.values
            .has(
                name
            );
    }



    has(name) {

        if (
            this.hasOwn(
                name
            )
        ) {

            return true;
        }


        return (
            this.parent
                ? this.parent.has(
                    name
                )
                : false
        );
    }



    get(
        name,
        line = null
    ) {

        if (
            this.values.has(
                name
            )
        ) {

            return this.values.get(
                name
            );
        }


        if (
            this.parent
        ) {

            return this.parent.get(
                name,
                line
            );
        }


        const error =
            new Error(
                `Le nom "${name}" n’est pas défini.`
            );


        error.line =
            line;


        error.reason =
            "name_error";


        throw error;
    }

}



/* =========================================================
   ANALYSE DU CODE
========================================================= */


class PytCodeAnalyzer {

    static analyze(
        source,
        ast
    ) {

        const features = {

            assignments:
                0,

            stringLiterals:
                0,

            listLiterals:
                0,

            dictionaryLiterals:
                0,

            ifStatements:
                0,

            elseBranches:
                0,

            forLoops:
                0,

            whileLoops:
                0,

            functions:
                0,

            functionParameters:
                0,

            userFunctionCalls:
                0,

            actionCalls:
                0,

            turnCalls:
                0,

            pickupCalls:
                0,

            membershipTests:
                0,

            subscripts:
                0,

            rangeCalls:
                0
        };


        const functionNames =
            new Set();



        const collectFunctions =
            statements => {

                statements.forEach(
                    statement => {

                        if (
                            statement.type ===
                            "function"
                        ) {

                            functionNames.add(
                                statement.name
                            );
                        }


                        if (
                            statement.body
                        ) {

                            collectFunctions(
                                statement.body
                            );
                        }


                        if (
                            statement.branches
                        ) {

                            statement.branches
                                .forEach(
                                    branch => {

                                        collectFunctions(
                                            branch.body
                                        );
                                    }
                                );
                        }


                        if (
                            statement.elseBody
                        ) {

                            collectFunctions(
                                statement.elseBody
                            );
                        }
                    }
                );
            };



        const walkExpression =
            expression => {

                if (
                    !expression
                ) {

                    return;
                }


                switch (
                    expression.type
                ) {

                    case "literal":

                        if (
                            typeof expression.value ===
                            "string"
                        ) {

                            features.stringLiterals +=
                                1;
                        }


                        break;


                    case "list":

                        features.listLiterals +=
                            1;


                        expression.values
                            .forEach(
                                walkExpression
                            );


                        break;


                    case "dictionary":

                        features.dictionaryLiterals +=
                            1;


                        expression.entries
                            .forEach(
                                entry => {

                                    walkExpression(
                                        entry.key
                                    );


                                    walkExpression(
                                        entry.value
                                    );
                                }
                            );


                        break;


                    case "binary":

                        if (
                            expression.operator ===
                                "in" ||
                            expression.operator ===
                                "not in"
                        ) {

                            features.membershipTests +=
                                1;
                        }


                        walkExpression(
                            expression.left
                        );


                        walkExpression(
                            expression.right
                        );


                        break;


                    case "unary":

                        walkExpression(
                            expression.argument
                        );


                        break;


                    case "subscript":

                        features.subscripts +=
                            1;


                        walkExpression(
                            expression.object
                        );


                        walkExpression(
                            expression.index
                        );


                        break;


                    case "call": {

                        if (
                            expression.callee
                                ?.type ===
                                "identifier"
                        ) {

                            const name =
                                expression.callee
                                    .name;


                            const actions = [

                                "avancer",
                                "tourner_gauche",
                                "tourner_droite",
                                "ramasser",
                                "deposer"
                            ];


                            if (
                                actions.includes(
                                    name
                                )
                            ) {

                                features.actionCalls +=
                                    1;
                            }


                            if (
                                name ===
                                    "tourner_gauche" ||
                                name ===
                                    "tourner_droite"
                            ) {

                                features.turnCalls +=
                                    1;
                            }


                            if (
                                name ===
                                "ramasser"
                            ) {

                                features.pickupCalls +=
                                    1;
                            }


                            if (
                                name ===
                                "range"
                            ) {

                                features.rangeCalls +=
                                    1;
                            }


                            if (
                                functionNames.has(
                                    name
                                )
                            ) {

                                features.userFunctionCalls +=
                                    1;
                            }
                        }


                        walkExpression(
                            expression.callee
                        );


                        expression.args
                            .forEach(
                                walkExpression
                            );


                        break;
                    }
                }
            };



        const walkStatement =
            statement => {

                switch (
                    statement.type
                ) {

                    case "assign":

                        features.assignments +=
                            1;


                        walkExpression(
                            statement.value
                        );


                        break;


                    case "expression":

                        walkExpression(
                            statement.expression
                        );


                        break;


                    case "if":

                        features.ifStatements +=
                            1;


                        if (
                            statement.elseBody
                        ) {

                            features.elseBranches +=
                                1;
                        }


                        statement.branches
                            .forEach(
                                branch => {

                                    walkExpression(
                                        branch.condition
                                    );


                                    branch.body
                                        .forEach(
                                            walkStatement
                                        );
                                }
                            );


                        statement.elseBody
                            ?.forEach(
                                walkStatement
                            );


                        break;


                    case "for":

                        features.forLoops +=
                            1;


                        walkExpression(
                            statement.iterable
                        );


                        statement.body
                            .forEach(
                                walkStatement
                            );


                        break;


                    case "while":

                        features.whileLoops +=
                            1;


                        walkExpression(
                            statement.condition
                        );


                        statement.body
                            .forEach(
                                walkStatement
                            );


                        break;


                    case "function":

                        features.functions +=
                            1;


                        features.functionParameters +=
                            statement
                                .parameters
                                .length;


                        statement.body
                            .forEach(
                                walkStatement
                            );


                        break;


                    case "return":

                        if (
                            statement.value
                        ) {

                            walkExpression(
                                statement.value
                            );
                        }


                        break;
                }
            };



        collectFunctions(
            ast
        );


        ast.forEach(
            walkStatement
        );


        return features;
    }

}



/* =========================================================
   EXPORT
========================================================= */


window.PytGame =
    PytGame;


function startPytGame() {

    if (
        window.pytGame
    ) {

        return;
    }


    window.pytGame =
        new PytGame();
}


startPytGame();