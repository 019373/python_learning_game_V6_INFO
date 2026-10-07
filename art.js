"use strict";

/* =========================================================
   PYT
   art.js

   Tous les graphismes sont dessinés directement avec Canvas.

   Aucun PNG nécessaire pour :
   - Pyt
   - meubles
   - objets
   - jardin
   - éléments de gameplay
   - sols / murs

   Style :
   - pixel art propre
   - vue du dessus
   - formes originales
========================================================= */

(() => {

    class PytArt {

        constructor() {

            this.pixelated = true;

            this.palette = {

                /* ROBOT */

                white: "#f4f4f0",
                whiteShadow: "#d8d8d4",

                black: "#16171a",
                dark: "#23252a",
                metal: "#4b4e55",

                eye: "#fff4a8",
                eyeCore: "#ffd84a",
                eyeGlow: "rgba(255, 221, 80, 0.60)",


                /* MAISON */

                woodLight: "#b8895c",
                woodDark: "#8b613e",

                wall: "#d8d2c9",
                wallShadow: "#aaa39a",

                tileLight: "#c9c4bd",
                tileDark: "#a9a49f",

                stone: "#77716d",

                concrete: "#76787c",


                /* NATURE */

                grass: "#5c8a53",
                grassDark: "#416a3d",

                leaf: "#487b45",
                leafDark: "#315c34",

                flowerPink: "#d875a5",
                flowerPurple: "#9877c9",
                flowerYellow: "#e3c45a",

                water: "#4f9fc4",
                waterLight: "#7bc8df",
                waterDark: "#347693",


                /* OBJETS */

                red: "#b84d4d",
                blue: "#4f70ad",
                green: "#5f9a67",
                yellow: "#d9b94c",

                purple: "#7c64a9",

                brown: "#76543d",
                brownDark: "#503728",

                glass: "#a9dce8",

                outline: "#25262a",


                /* GAMEPLAY */

                goal: "#f0d96d",
                selected: "#f6eea0",
                blocked: "#593f4d"
            };


            /*
            Tous les noms acceptés dans levels.js.
            */

            this.supportedObjects =
                new Set([

                    /* STRUCTURE */

                    "wall",
                    "mur",
                    "window",
                    "fenetre",
                    "door",
                    "porte",
                    "garage_door",
                    "porte_garage",
                    "stairs",
                    "escalier",

                    /* SOLS */

                    "floor_wood",
                    "sol_bois",
                    "floor_tile",
                    "carrelage",
                    "floor_stone",
                    "sol_pierre",
                    "floor_concrete",
                    "beton",
                    "grass",
                    "herbe",
                    "path",
                    "chemin",

                    /* ENTREE */

                    "console",
                    "shoe_rack",
                    "meuble_chaussures",
                    "coat_rack",
                    "porte_manteau",
                    "umbrella",
                    "parapluie",
                    "mirror",
                    "miroir",

                    /* CUISINE */

                    "kitchen_counter",
                    "plan_travail",
                    "sink",
                    "evier",
                    "faucet",
                    "robinet",
                    "oven",
                    "four",
                    "stove",
                    "plaques",
                    "fridge",
                    "frigo",
                    "cabinet",
                    "placard",
                    "drawer",
                    "tiroir",

                    /* SALON */

                    "sofa",
                    "canape",
                    "armchair",
                    "fauteuil",
                    "coffee_table",
                    "table_basse",
                    "tv",
                    "television",
                    "tv_unit",
                    "meuble_tv",
                    "bookshelf",
                    "bibliotheque",
                    "shelf",
                    "etagere",

                    /* CHAMBRE */

                    "bed",
                    "lit",
                    "pillow",
                    "oreiller",
                    "blanket",
                    "couverture",
                    "nightstand",
                    "table_nuit",
                    "wardrobe",
                    "armoire",
                    "dresser",
                    "commode",
                    "desk",
                    "bureau",

                    /* GARAGE */

                    "car",
                    "voiture",
                    "workbench",
                    "etabli",
                    "toolbox",
                    "boite_outils",
                    "tools",
                    "outils",
                    "tire",
                    "pneu",
                    "bike",
                    "velo",
                    "metal_cabinet",

                    /* CAVE */

                    "wine_rack",
                    "casier_vin",
                    "barrel",
                    "tonneau",
                    "crate",
                    "caisse_bois",

                    /* BALCON */

                    "railing",
                    "rambarde",
                    "flower_box",
                    "jardiniere",
                    "watering_can",
                    "arrosoir",

                    /* TOILETTE */

                    "toilet",
                    "toilette",
                    "bathroom_sink",
                    "lavabo",
                    "toilet_paper",
                    "papier_toilette",
                    "towel",
                    "serviette",

                    /* JARDIN */

                    "tree",
                    "arbre",
                    "small_tree",
                    "petit_arbre",
                    "bush",
                    "buisson",
                    "hedge",
                    "haie",
                    "flowers",
                    "fleurs",
                    "pool",
                    "piscine",
                    "pool_ladder",
                    "echelle_piscine",
                    "sunbed",
                    "transat",
                    "parasol",
                    "float",
                    "bouee",
                    "bench",
                    "banc",
                    "fountain",
                    "fontaine",
                    "fence",
                    "cloture",
                    "gate",
                    "portail",
                    "mud",
                    "boue",

                    /* COMMUN */

                    "table",
                    "chair",
                    "chaise",
                    "stool",
                    "tabouret",
                    "plant",
                    "plante",
                    "lamp",
                    "lampe",
                    "rug",
                    "tapis",
                    "basket",
                    "panier",
                    "trash",
                    "poubelle",
                    "box",
                    "carton",

                    /* OBJETS INTERACTIFS */

                    "book",
                    "livre",
                    "livre_rouge",
                    "livre_bleu",

                    "package",
                    "colis",
                    "caisse",

                    "key",
                    "cle",

                    "apple",
                    "pomme",

                    "cup",
                    "tasse",

                    "plate",
                    "assiette",

                    "toy",
                    "jouet",
                    "jouet_1",
                    "jouet_2",
                    "jouet_3",

                    "bottle",
                    "bouteille",
                    "bouteille_rouge",
                    "bouteille_bleue",
                    "bouteille_verte",
                    "bouteille_jaune",

                    "charger",
                    "chargeur",

                    "button",
                    "bouton",

                    /* GAMEPLAY */

                    "goal",
                    "objectif",

                    "deposit",
                    "depot",

                    "visited",
                    "case_visitee",

                    "blocked",
                    "case_bloquee",

                    "start",
                    "depart"
                ]);
        }



        /* =================================================
           OUTILS
        ================================================= */

        normalize(value) {

            return String(
                value ?? ""
            )
                .normalize("NFD")
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



        px(value) {

            return Math.round(
                value
            );
        }



        rect(
            ctx,
            x,
            y,
            width,
            height,
            color
        ) {

            ctx.fillStyle =
                color;

            ctx.fillRect(
                this.px(x),
                this.px(y),
                this.px(width),
                this.px(height)
            );
        }



        strokeRect(
            ctx,
            x,
            y,
            width,
            height,
            color,
            thickness = 2
        ) {

            ctx.strokeStyle =
                color;

            ctx.lineWidth =
                thickness;

            ctx.strokeRect(
                this.px(x),
                this.px(y),
                this.px(width),
                this.px(height)
            );
        }



        circle(
            ctx,
            x,
            y,
            radius,
            color
        ) {

            ctx.fillStyle =
                color;

            ctx.beginPath();

            ctx.arc(
                this.px(x),
                this.px(y),
                this.px(radius),
                0,
                Math.PI * 2
            );

            ctx.fill();
        }



        ellipse(
            ctx,
            x,
            y,
            rx,
            ry,
            color
        ) {

            ctx.fillStyle =
                color;

            ctx.beginPath();

            ctx.ellipse(
                this.px(x),
                this.px(y),
                this.px(rx),
                this.px(ry),
                0,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }



        line(
            ctx,
            x1,
            y1,
            x2,
            y2,
            color,
            thickness = 2
        ) {

            ctx.strokeStyle =
                color;

            ctx.lineWidth =
                thickness;

            ctx.beginPath();

            ctx.moveTo(
                this.px(x1),
                this.px(y1)
            );

            ctx.lineTo(
                this.px(x2),
                this.px(y2)
            );

            ctx.stroke();
        }



        shadow(
            ctx,
            x,
            y,
            width,
            height
        ) {

            ctx.save();

            ctx.globalAlpha =
                0.18;

            this.ellipse(
                ctx,
                x + width / 2,
                y + height * 0.86,
                width * 0.37,
                height * 0.11,
                "#000000"
            );

            ctx.restore();
        }



        /* =================================================
           PYT
        ================================================= */

        drawPyt(
            ctx,
            x,
            y,
            size,
            direction = "S",
            options = {}
        ) {

            const p =
                this.palette;

            const dir =
                String(
                    direction
                )
                    .toUpperCase();


            ctx.save();

            ctx.imageSmoothingEnabled =
                false;


            if (
                options.bob
            ) {

                y +=
                    Math.sin(
                        performance.now() /
                        110
                    ) *
                    size *
                    0.035;
            }


            this.shadow(
                ctx,
                x,
                y,
                size,
                size
            );


            /* jambes */

            this.rect(
                ctx,
                x + size * 0.29,
                y + size * 0.69,
                size * 0.14,
                size * 0.18,
                p.black
            );

            this.rect(
                ctx,
                x + size * 0.57,
                y + size * 0.69,
                size * 0.14,
                size * 0.18,
                p.black
            );


            /* pieds */

            this.rect(
                ctx,
                x + size * 0.25,
                y + size * 0.83,
                size * 0.2,
                size * 0.08,
                p.white
            );

            this.rect(
                ctx,
                x + size * 0.55,
                y + size * 0.83,
                size * 0.2,
                size * 0.08,
                p.white
            );


            /* corps */

            this.rect(
                ctx,
                x + size * 0.23,
                y + size * 0.39,
                size * 0.54,
                size * 0.36,
                p.black
            );

            this.rect(
                ctx,
                x + size * 0.29,
                y + size * 0.42,
                size * 0.42,
                size * 0.27,
                p.white
            );


            /* bras */

            this.rect(
                ctx,
                x + size * 0.13,
                y + size * 0.44,
                size * 0.1,
                size * 0.27,
                p.black
            );

            this.rect(
                ctx,
                x + size * 0.77,
                y + size * 0.44,
                size * 0.1,
                size * 0.27,
                p.black
            );


            /* mains */

            this.circle(
                ctx,
                x + size * 0.18,
                y + size * 0.7,
                size * 0.07,
                p.white
            );

            this.circle(
                ctx,
                x + size * 0.82,
                y + size * 0.7,
                size * 0.07,
                p.white
            );


            /* tête noire */

            this.rect(
                ctx,
                x + size * 0.17,
                y + size * 0.12,
                size * 0.66,
                size * 0.3,
                p.black
            );


            /* coque blanche */

            this.rect(
                ctx,
                x + size * 0.21,
                y + size * 0.08,
                size * 0.58,
                size * 0.08,
                p.white
            );

            this.rect(
                ctx,
                x + size * 0.14,
                y + size * 0.17,
                size * 0.08,
                size * 0.19,
                p.white
            );

            this.rect(
                ctx,
                x + size * 0.78,
                y + size * 0.17,
                size * 0.08,
                size * 0.19,
                p.white
            );


            /* antenne */

            this.rect(
                ctx,
                x + size * 0.48,
                y + size * 0.01,
                size * 0.04,
                size * 0.09,
                p.metal
            );

            this.circle(
                ctx,
                x + size * 0.5,
                y + size * 0.015,
                size * 0.045,
                p.eyeCore
            );


            /*
            Face différente suivant direction.
            */

            if (
                dir !== "N"
            ) {

                let eyeOffsetX =
                    0;


                if (
                    dir === "E"
                ) {

                    eyeOffsetX =
                        size * 0.035;
                }


                if (
                    dir === "W"
                ) {

                    eyeOffsetX =
                        -size * 0.035;
                }


                const happy =
                    options.happy ===
                    true;


                this.drawPytEye(
                    ctx,
                    x +
                        size *
                        0.38 +
                        eyeOffsetX,
                    y +
                        size *
                        0.27,
                    size,
                    happy
                );


                this.drawPytEye(
                    ctx,
                    x +
                        size *
                        0.62 +
                        eyeOffsetX,
                    y +
                        size *
                        0.27,
                    size,
                    happy
                );

            } else {

                /* arrière de la tête */

                this.rect(
                    ctx,
                    x + size * 0.33,
                    y + size * 0.25,
                    size * 0.34,
                    size * 0.04,
                    p.metal
                );
            }


            /* petit symbole directionnel */

            this.drawDirectionMark(
                ctx,
                x,
                y,
                size,
                dir
            );


            ctx.restore();
        }



        drawPytEye(
            ctx,
            x,
            y,
            size,
            happy = false
        ) {

            const p =
                this.palette;


            ctx.save();

            ctx.shadowColor =
                p.eyeGlow;

            ctx.shadowBlur =
                size * 0.12;


            if (happy) {

                this.line(
                    ctx,
                    x - size * 0.045,
                    y,
                    x,
                    y + size * 0.025,
                    p.eye,
                    Math.max(
                        2,
                        size * 0.035
                    )
                );

                this.line(
                    ctx,
                    x,
                    y + size * 0.025,
                    x + size * 0.045,
                    y,
                    p.eye,
                    Math.max(
                        2,
                        size * 0.035
                    )
                );

            } else {

                this.rect(
                    ctx,
                    x - size * 0.035,
                    y - size * 0.045,
                    size * 0.07,
                    size * 0.09,
                    p.eye
                );

                this.rect(
                    ctx,
                    x - size * 0.018,
                    y - size * 0.025,
                    size * 0.035,
                    size * 0.05,
                    p.eyeCore
                );
            }


            ctx.restore();
        }



        drawDirectionMark(
            ctx,
            x,
            y,
            size,
            direction
        ) {

            const p =
                this.palette;


            ctx.fillStyle =
                p.metal;

            ctx.font =
                `bold ${Math.floor(
                    size * 0.11
                )}px monospace`;

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";


            const arrows = {

                N: "↑",
                E: "→",
                S: "↓",
                W: "←"
            };


            ctx.fillText(
                arrows[direction] ||
                "↓",
                x + size * 0.5,
                y + size * 0.61
            );
        }



        /* =================================================
           STRUCTURE
        ================================================= */

        drawWall(
            ctx,
            x,
            y,
            size,
            options = {}
        ) {

            const p =
                this.palette;


            this.rect(
                ctx,
                x,
                y,
                size,
                size,
                p.wallShadow
            );


            this.rect(
                ctx,
                x + size * 0.06,
                y + size * 0.06,
                size * 0.88,
                size * 0.88,
                p.wall
            );


            this.line(
                ctx,
                x,
                y + size * 0.75,
                x + size,
                y + size * 0.75,
                "rgba(0,0,0,0.1)",
                2
            );
        }



        drawWindow(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.rect(
                ctx,
                x + size * 0.12,
                y + size * 0.18,
                size * 0.76,
                size * 0.64,
                p.white
            );


            this.rect(
                ctx,
                x + size * 0.18,
                y + size * 0.24,
                size * 0.64,
                size * 0.52,
                p.glass
            );


            this.line(
                ctx,
                x + size * 0.5,
                y + size * 0.24,
                x + size * 0.5,
                y + size * 0.76,
                p.white,
                3
            );
        }



        drawDoor(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.rect(
                ctx,
                x + size * 0.14,
                y + size * 0.08,
                size * 0.72,
                size * 0.84,
                p.brownDark
            );


            this.rect(
                ctx,
                x + size * 0.2,
                y + size * 0.12,
                size * 0.6,
                size * 0.76,
                p.brown
            );


            this.circle(
                ctx,
                x + size * 0.69,
                y + size * 0.52,
                size * 0.035,
                p.yellow
            );
        }



        drawGarageDoor(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.rect(
                ctx,
                x + size * 0.05,
                y + size * 0.08,
                size * 0.9,
                size * 0.84,
                p.metal
            );


            for (
                let index = 0;
                index < 5;
                index += 1
            ) {

                this.line(
                    ctx,
                    x + size * 0.1,
                    y +
                        size *
                        (
                            0.2 +
                            index * 0.14
                        ),
                    x + size * 0.9,
                    y +
                        size *
                        (
                            0.2 +
                            index * 0.14
                        ),
                    p.dark,
                    2
                );
            }
        }



        /* =================================================
           SOLS
        ================================================= */

        drawFloorWood(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.rect(
                ctx,
                x,
                y,
                size,
                size,
                p.woodLight
            );


            for (
                let index = 1;
                index < 4;
                index += 1
            ) {

                this.line(
                    ctx,
                    x,
                    y +
                        size *
                        index /
                        4,
                    x + size,
                    y +
                        size *
                        index /
                        4,
                    p.woodDark,
                    1
                );
            }
        }



        drawFloorTile(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.rect(
                ctx,
                x,
                y,
                size,
                size,
                p.tileLight
            );


            this.line(
                ctx,
                x + size / 2,
                y,
                x + size / 2,
                y + size,
                p.tileDark,
                1
            );


            this.line(
                ctx,
                x,
                y + size / 2,
                x + size,
                y + size / 2,
                p.tileDark,
                1
            );
        }



        drawGrass(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.rect(
                ctx,
                x,
                y,
                size,
                size,
                p.grass
            );


            for (
                let index = 0;
                index < 7;
                index += 1
            ) {

                const px =
                    x +
                    (
                        (
                            index *
                            37
                        ) %
                        83
                    ) /
                    100 *
                    size;


                const py =
                    y +
                    (
                        (
                            index *
                            53
                        ) %
                        79
                    ) /
                    100 *
                    size;


                this.rect(
                    ctx,
                    px,
                    py,
                    size * 0.035,
                    size * 0.08,
                    p.grassDark
                );
            }
        }



        drawPath(
            ctx,
            x,
            y,
            size
        ) {

            this.rect(
                ctx,
                x,
                y,
                size,
                size,
                "#9b9185"
            );


            this.rect(
                ctx,
                x + size * 0.08,
                y + size * 0.12,
                size * 0.36,
                size * 0.3,
                "#aaa096"
            );


            this.rect(
                ctx,
                x + size * 0.53,
                y + size * 0.51,
                size * 0.32,
                size * 0.28,
                "#80776f"
            );
        }



        /* =================================================
           MOBILIER COMMUN
        ================================================= */

        drawTable(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.shadow(
                ctx,
                x,
                y,
                size,
                size
            );


            this.rect(
                ctx,
                x + size * 0.15,
                y + size * 0.2,
                size * 0.7,
                size * 0.56,
                p.brownDark
            );


            this.rect(
                ctx,
                x + size * 0.1,
                y + size * 0.14,
                size * 0.8,
                size * 0.52,
                p.brown
            );
        }



        drawChair(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.rect(
                ctx,
                x + size * 0.25,
                y + size * 0.2,
                size * 0.5,
                size * 0.55,
                p.brown
            );


            this.rect(
                ctx,
                x + size * 0.2,
                y + size * 0.12,
                size * 0.6,
                size * 0.13,
                p.brownDark
            );
        }



        drawSofa(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.shadow(
                ctx,
                x,
                y,
                size,
                size
            );


            this.rect(
                ctx,
                x + size * 0.08,
                y + size * 0.18,
                size * 0.84,
                size * 0.62,
                "#72637e"
            );


            this.rect(
                ctx,
                x + size * 0.17,
                y + size * 0.28,
                size * 0.66,
                size * 0.38,
                "#9786a7"
            );


            this.line(
                ctx,
                x + size * 0.5,
                y + size * 0.3,
                x + size * 0.5,
                y + size * 0.64,
                "#73637d",
                2
            );
        }



        drawBed(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.rect(
                ctx,
                x + size * 0.09,
                y + size * 0.08,
                size * 0.82,
                size * 0.82,
                p.brownDark
            );


            this.rect(
                ctx,
                x + size * 0.14,
                y + size * 0.14,
                size * 0.72,
                size * 0.7,
                "#9279a8"
            );


            this.rect(
                ctx,
                x + size * 0.2,
                y + size * 0.18,
                size * 0.6,
                size * 0.18,
                p.white
            );


            this.rect(
                ctx,
                x + size * 0.18,
                y + size * 0.42,
                size * 0.64,
                size * 0.35,
                "#67567f"
            );
        }



        drawPlant(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.rect(
                ctx,
                x + size * 0.36,
                y + size * 0.61,
                size * 0.28,
                size * 0.26,
                "#8c5f3f"
            );


            this.ellipse(
                ctx,
                x + size * 0.5,
                y + size * 0.42,
                size * 0.24,
                size * 0.15,
                p.leaf
            );


            this.ellipse(
                ctx,
                x + size * 0.36,
                y + size * 0.5,
                size * 0.16,
                size * 0.21,
                p.leafDark
            );


            this.ellipse(
                ctx,
                x + size * 0.64,
                y + size * 0.5,
                size * 0.16,
                size * 0.21,
                p.leaf
            );
        }



        drawRug(
            ctx,
            x,
            y,
            size
        ) {

            this.rect(
                ctx,
                x + size * 0.08,
                y + size * 0.18,
                size * 0.84,
                size * 0.64,
                "#806da0"
            );


            this.strokeRect(
                ctx,
                x + size * 0.14,
                y + size * 0.24,
                size * 0.72,
                size * 0.52,
                "#b4a3cf",
                2
            );
        }



        drawLamp(
            ctx,
            x,
            y,
            size
        ) {

            this.rect(
                ctx,
                x + size * 0.47,
                y + size * 0.36,
                size * 0.06,
                size * 0.4,
                "#47474a"
            );


            this.rect(
                ctx,
                x + size * 0.34,
                y + size * 0.74,
                size * 0.32,
                size * 0.08,
                "#37373a"
            );


            this.ellipse(
                ctx,
                x + size * 0.5,
                y + size * 0.29,
                size * 0.22,
                size * 0.17,
                "#e1c66b"
            );
        }



        /* =================================================
           CUISINE
        ================================================= */

        drawKitchenCounter(
            ctx,
            x,
            y,
            size
        ) {

            this.rect(
                ctx,
                x + size * 0.05,
                y + size * 0.12,
                size * 0.9,
                size * 0.72,
                "#65574e"
            );


            this.rect(
                ctx,
                x + size * 0.05,
                y + size * 0.1,
                size * 0.9,
                size * 0.18,
                "#b8afa4"
            );
        }



        drawSink(
            ctx,
            x,
            y,
            size
        ) {

            this.drawKitchenCounter(
                ctx,
                x,
                y,
                size
            );


            this.rect(
                ctx,
                x + size * 0.29,
                y + size * 0.23,
                size * 0.42,
                size * 0.34,
                "#8ba4aa"
            );


            this.rect(
                ctx,
                x + size * 0.34,
                y + size * 0.28,
                size * 0.32,
                size * 0.24,
                "#b9d0d3"
            );


            this.line(
                ctx,
                x + size * 0.5,
                y + size * 0.11,
                x + size * 0.5,
                y + size * 0.26,
                "#44494c",
                3
            );
        }



        drawFridge(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.rect(
                ctx,
                x + size * 0.17,
                y + size * 0.07,
                size * 0.66,
                size * 0.84,
                p.whiteShadow
            );


            this.line(
                ctx,
                x + size * 0.17,
                y + size * 0.48,
                x + size * 0.83,
                y + size * 0.48,
                "#999b9d",
                2
            );


            this.rect(
                ctx,
                x + size * 0.72,
                y + size * 0.22,
                size * 0.04,
                size * 0.15,
                p.metal
            );
        }



        drawOven(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.rect(
                ctx,
                x + size * 0.12,
                y + size * 0.1,
                size * 0.76,
                size * 0.8,
                p.metal
            );


            this.rect(
                ctx,
                x + size * 0.2,
                y + size * 0.38,
                size * 0.6,
                size * 0.38,
                p.black
            );


            for (
                let i = 0;
                i < 4;
                i += 1
            ) {

                this.circle(
                    ctx,
                    x +
                        size *
                        (
                            0.28 +
                            i * 0.15
                        ),
                    y + size * 0.24,
                    size * 0.035,
                    p.black
                );
            }
        }



        /* =================================================
           SALON
        ================================================= */

        drawBookshelf(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.rect(
                ctx,
                x + size * 0.1,
                y + size * 0.08,
                size * 0.8,
                size * 0.84,
                p.brownDark
            );


            for (
                let shelf = 0;
                shelf < 3;
                shelf += 1
            ) {

                const py =
                    y +
                    size *
                    (
                        0.19 +
                        shelf * 0.26
                    );


                this.line(
                    ctx,
                    x + size * 0.16,
                    py + size * 0.16,
                    x + size * 0.84,
                    py + size * 0.16,
                    p.brown,
                    3
                );


                for (
                    let book = 0;
                    book < 5;
                    book += 1
                ) {

                    const colors = [
                        p.red,
                        p.blue,
                        p.green,
                        p.yellow,
                        p.purple
                    ];


                    this.rect(
                        ctx,
                        x +
                            size *
                            (
                                0.18 +
                                book * 0.125
                            ),
                        py,
                        size * 0.08,
                        size * 0.15,
                        colors[
                            book %
                            colors.length
                        ]
                    );
                }
            }
        }



        drawTV(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.rect(
                ctx,
                x + size * 0.12,
                y + size * 0.14,
                size * 0.76,
                size * 0.52,
                p.black
            );


            this.rect(
                ctx,
                x + size * 0.17,
                y + size * 0.19,
                size * 0.66,
                size * 0.42,
                "#405668"
            );


            this.rect(
                ctx,
                x + size * 0.45,
                y + size * 0.66,
                size * 0.1,
                size * 0.12,
                p.metal
            );
        }



        /* =================================================
           GARAGE
        ================================================= */

        drawCar(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.shadow(
                ctx,
                x,
                y,
                size,
                size
            );


            this.rect(
                ctx,
                x + size * 0.19,
                y + size * 0.1,
                size * 0.62,
                size * 0.8,
                "#40464d"
            );


            this.rect(
                ctx,
                x + size * 0.26,
                y + size * 0.23,
                size * 0.48,
                size * 0.28,
                p.glass
            );


            this.rect(
                ctx,
                x + size * 0.11,
                y + size * 0.21,
                size * 0.1,
                size * 0.19,
                p.black
            );

            this.rect(
                ctx,
                x + size * 0.79,
                y + size * 0.21,
                size * 0.1,
                size * 0.19,
                p.black
            );


            this.rect(
                ctx,
                x + size * 0.11,
                y + size * 0.62,
                size * 0.1,
                size * 0.19,
                p.black
            );

            this.rect(
                ctx,
                x + size * 0.79,
                y + size * 0.62,
                size * 0.1,
                size * 0.19,
                p.black
            );


            this.rect(
                ctx,
                x + size * 0.28,
                y + size * 0.78,
                size * 0.14,
                size * 0.06,
                "#fff3ad"
            );

            this.rect(
                ctx,
                x + size * 0.58,
                y + size * 0.78,
                size * 0.14,
                size * 0.06,
                "#fff3ad"
            );
        }



        drawToolbox(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.rect(
                ctx,
                x + size * 0.15,
                y + size * 0.37,
                size * 0.7,
                size * 0.42,
                p.red
            );


            this.rect(
                ctx,
                x + size * 0.34,
                y + size * 0.24,
                size * 0.32,
                size * 0.13,
                p.dark
            );


            this.rect(
                ctx,
                x + size * 0.46,
                y + size * 0.54,
                size * 0.08,
                size * 0.09,
                p.yellow
            );
        }



        /* =================================================
           CAVE
        ================================================= */

        drawWineRack(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.rect(
                ctx,
                x + size * 0.08,
                y + size * 0.08,
                size * 0.84,
                size * 0.84,
                p.brownDark
            );


            for (
                let row = 0;
                row < 3;
                row += 1
            ) {

                for (
                    let column = 0;
                    column < 3;
                    column += 1
                ) {

                    this.circle(
                        ctx,
                        x +
                            size *
                            (
                                0.25 +
                                column * 0.25
                            ),
                        y +
                            size *
                            (
                                0.25 +
                                row * 0.25
                            ),
                        size * 0.065,
                        "#5b2738"
                    );
                }
            }
        }



        drawBarrel(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.ellipse(
                ctx,
                x + size * 0.5,
                y + size * 0.5,
                size * 0.3,
                size * 0.38,
                p.brown
            );


            this.line(
                ctx,
                x + size * 0.23,
                y + size * 0.38,
                x + size * 0.77,
                y + size * 0.38,
                p.dark,
                3
            );


            this.line(
                ctx,
                x + size * 0.23,
                y + size * 0.63,
                x + size * 0.77,
                y + size * 0.63,
                p.dark,
                3
            );
        }



        /* =================================================
           SALLE D'EAU
        ================================================= */

        drawToilet(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.rect(
                ctx,
                x + size * 0.31,
                y + size * 0.12,
                size * 0.38,
                size * 0.27,
                p.whiteShadow
            );


            this.ellipse(
                ctx,
                x + size * 0.5,
                y + size * 0.61,
                size * 0.27,
                size * 0.3,
                p.white
            );


            this.ellipse(
                ctx,
                x + size * 0.5,
                y + size * 0.59,
                size * 0.15,
                size * 0.17,
                "#9cb9c0"
            );
        }



        drawBathroomSink(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.ellipse(
                ctx,
                x + size * 0.5,
                y + size * 0.5,
                size * 0.31,
                size * 0.23,
                p.white
            );


            this.ellipse(
                ctx,
                x + size * 0.5,
                y + size * 0.5,
                size * 0.19,
                size * 0.12,
                "#b1cdd2"
            );


            this.line(
                ctx,
                x + size * 0.5,
                y + size * 0.18,
                x + size * 0.5,
                y + size * 0.38,
                p.metal,
                3
            );
        }



        /* =================================================
           JARDIN
        ================================================= */

        drawTree(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.shadow(
                ctx,
                x,
                y,
                size,
                size
            );


            this.rect(
                ctx,
                x + size * 0.44,
                y + size * 0.55,
                size * 0.12,
                size * 0.32,
                p.brownDark
            );


            this.circle(
                ctx,
                x + size * 0.5,
                y + size * 0.37,
                size * 0.3,
                p.leafDark
            );


            this.circle(
                ctx,
                x + size * 0.34,
                y + size * 0.42,
                size * 0.2,
                p.leaf
            );


            this.circle(
                ctx,
                x + size * 0.66,
                y + size * 0.43,
                size * 0.21,
                p.leaf
            );


            this.circle(
                ctx,
                x + size * 0.5,
                y + size * 0.22,
                size * 0.21,
                "#579253"
            );
        }



        drawBush(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.circle(
                ctx,
                x + size * 0.33,
                y + size * 0.55,
                size * 0.21,
                p.leafDark
            );


            this.circle(
                ctx,
                x + size * 0.51,
                y + size * 0.45,
                size * 0.26,
                p.leaf
            );


            this.circle(
                ctx,
                x + size * 0.69,
                y + size * 0.57,
                size * 0.2,
                p.leafDark
            );
        }



        drawFlowers(
            ctx,
            x,
            y,
            size,
            color = null
        ) {

            const p =
                this.palette;


            const flowerColors =
                color
                    ? [color]
                    : [
                        p.flowerPink,
                        p.flowerPurple,
                        p.flowerYellow
                    ];


            for (
                let index = 0;
                index < 6;
                index += 1
            ) {

                const px =
                    x +
                    size *
                    (
                        0.2 +
                        (
                            index %
                            3
                        ) *
                        0.3
                    );


                const py =
                    y +
                    size *
                    (
                        0.3 +
                        Math.floor(
                            index /
                            3
                        ) *
                        0.35
                    );


                this.circle(
                    ctx,
                    px,
                    py,
                    size * 0.07,
                    flowerColors[
                        index %
                        flowerColors.length
                    ]
                );


                this.circle(
                    ctx,
                    px,
                    py,
                    size * 0.025,
                    p.yellow
                );
            }
        }



        drawPool(
            ctx,
            x,
            y,
            size,
            options = {}
        ) {

            const p =
                this.palette;


            this.rect(
                ctx,
                x + size * 0.04,
                y + size * 0.12,
                size * 0.92,
                size * 0.76,
                "#d3c9b9"
            );


            this.rect(
                ctx,
                x + size * 0.12,
                y + size * 0.2,
                size * 0.76,
                size * 0.6,
                p.waterDark
            );


            this.rect(
                ctx,
                x + size * 0.17,
                y + size * 0.25,
                size * 0.66,
                size * 0.5,
                p.water
            );


            const offset =
                options.animate
                    ? (
                        performance.now() /
                        160
                    ) %
                    10
                    : 0;


            for (
                let lineIndex = 0;
                lineIndex < 3;
                lineIndex += 1
            ) {

                this.line(
                    ctx,
                    x +
                        size *
                        (
                            0.22 +
                            offset /
                            100
                        ),
                    y +
                        size *
                        (
                            0.35 +
                            lineIndex *
                            0.15
                        ),
                    x + size * 0.72,
                    y +
                        size *
                        (
                            0.35 +
                            lineIndex *
                            0.15
                        ),
                    p.waterLight,
                    2
                );
            }
        }



        drawSunbed(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.rect(
                ctx,
                x + size * 0.2,
                y + size * 0.16,
                size * 0.6,
                size * 0.68,
                p.whiteShadow
            );


            this.rect(
                ctx,
                x + size * 0.26,
                y + size * 0.22,
                size * 0.48,
                size * 0.58,
                "#d7a56c"
            );


            this.line(
                ctx,
                x + size * 0.25,
                y + size * 0.84,
                x + size * 0.16,
                y + size * 0.94,
                p.dark,
                3
            );


            this.line(
                ctx,
                x + size * 0.75,
                y + size * 0.84,
                x + size * 0.84,
                y + size * 0.94,
                p.dark,
                3
            );
        }



        drawParasol(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.line(
                ctx,
                x + size * 0.5,
                y + size * 0.42,
                x + size * 0.5,
                y + size * 0.88,
                p.metal,
                3
            );


            this.ctxTriangle(
                ctx,
                x + size * 0.15,
                y + size * 0.43,
                x + size * 0.5,
                y + size * 0.1,
                x + size * 0.85,
                y + size * 0.43,
                "#d76568"
            );
        }



        drawFloat(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.circle(
                ctx,
                x + size * 0.5,
                y + size * 0.5,
                size * 0.28,
                "#dc6a87"
            );


            this.circle(
                ctx,
                x + size * 0.5,
                y + size * 0.5,
                size * 0.13,
                p.water
            );
        }



        drawBench(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.rect(
                ctx,
                x + size * 0.12,
                y + size * 0.37,
                size * 0.76,
                size * 0.14,
                p.brown
            );


            this.rect(
                ctx,
                x + size * 0.12,
                y + size * 0.56,
                size * 0.76,
                size * 0.14,
                p.brownDark
            );


            this.rect(
                ctx,
                x + size * 0.23,
                y + size * 0.7,
                size * 0.08,
                size * 0.18,
                p.dark
            );


            this.rect(
                ctx,
                x + size * 0.69,
                y + size * 0.7,
                size * 0.08,
                size * 0.18,
                p.dark
            );
        }



        drawFountain(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.circle(
                ctx,
                x + size * 0.5,
                y + size * 0.6,
                size * 0.32,
                "#85817c"
            );


            this.circle(
                ctx,
                x + size * 0.5,
                y + size * 0.6,
                size * 0.24,
                p.water
            );


            this.rect(
                ctx,
                x + size * 0.46,
                y + size * 0.25,
                size * 0.08,
                size * 0.35,
                "#8e8b86"
            );


            this.circle(
                ctx,
                x + size * 0.5,
                y + size * 0.25,
                size * 0.08,
                p.waterLight
            );
        }



        /* =================================================
           PETITS OBJETS
        ================================================= */

        drawBook(
            ctx,
            x,
            y,
            size,
            color = null
        ) {

            const p =
                this.palette;


            const bookColor =
                color ||
                p.blue;


            this.rect(
                ctx,
                x + size * 0.22,
                y + size * 0.21,
                size * 0.56,
                size * 0.61,
                p.outline
            );


            this.rect(
                ctx,
                x + size * 0.27,
                y + size * 0.19,
                size * 0.51,
                size * 0.58,
                bookColor
            );


            this.line(
                ctx,
                x + size * 0.36,
                y + size * 0.22,
                x + size * 0.36,
                y + size * 0.73,
                "#e5d9bc",
                2
            );
        }



        drawBox(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.rect(
                ctx,
                x + size * 0.16,
                y + size * 0.2,
                size * 0.68,
                size * 0.62,
                p.brown
            );


            this.line(
                ctx,
                x + size * 0.16,
                y + size * 0.41,
                x + size * 0.84,
                y + size * 0.41,
                p.brownDark,
                2
            );


            this.line(
                ctx,
                x + size * 0.5,
                y + size * 0.2,
                x + size * 0.5,
                y + size * 0.82,
                p.brownDark,
                2
            );
        }



        drawKey(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.circle(
                ctx,
                x + size * 0.38,
                y + size * 0.42,
                size * 0.15,
                p.yellow
            );


            this.circle(
                ctx,
                x + size * 0.38,
                y + size * 0.42,
                size * 0.07,
                "#655229"
            );


            this.rect(
                ctx,
                x + size * 0.48,
                y + size * 0.38,
                size * 0.34,
                size * 0.08,
                p.yellow
            );


            this.rect(
                ctx,
                x + size * 0.7,
                y + size * 0.45,
                size * 0.07,
                size * 0.14,
                p.yellow
            );
        }



        drawApple(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.circle(
                ctx,
                x + size * 0.5,
                y + size * 0.56,
                size * 0.23,
                p.red
            );


            this.rect(
                ctx,
                x + size * 0.48,
                y + size * 0.25,
                size * 0.05,
                size * 0.16,
                p.brownDark
            );


            this.ellipse(
                ctx,
                x + size * 0.6,
                y + size * 0.3,
                size * 0.13,
                size * 0.07,
                p.green
            );
        }



        drawCup(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.rect(
                ctx,
                x + size * 0.28,
                y + size * 0.3,
                size * 0.4,
                size * 0.48,
                p.white
            );


            this.circle(
                ctx,
                x + size * 0.7,
                y + size * 0.48,
                size * 0.12,
                p.white
            );


            this.circle(
                ctx,
                x + size * 0.7,
                y + size * 0.48,
                size * 0.06,
                "#6d635b"
            );
        }



        drawPlate(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.circle(
                ctx,
                x + size * 0.5,
                y + size * 0.5,
                size * 0.29,
                p.whiteShadow
            );


            this.circle(
                ctx,
                x + size * 0.5,
                y + size * 0.5,
                size * 0.19,
                p.white
            );
        }



        drawBottle(
            ctx,
            x,
            y,
            size,
            color = null
        ) {

            const p =
                this.palette;


            const bottleColor =
                color ||
                "#526b4d";


            this.rect(
                ctx,
                x + size * 0.42,
                y + size * 0.16,
                size * 0.16,
                size * 0.18,
                bottleColor
            );


            this.rect(
                ctx,
                x + size * 0.31,
                y + size * 0.31,
                size * 0.38,
                size * 0.51,
                bottleColor
            );


            this.rect(
                ctx,
                x + size * 0.35,
                y + size * 0.5,
                size * 0.3,
                size * 0.12,
                "#ded0a1"
            );
        }



        drawWateringCan(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.rect(
                ctx,
                x + size * 0.28,
                y + size * 0.37,
                size * 0.42,
                size * 0.37,
                "#5c8790"
            );


            this.line(
                ctx,
                x + size * 0.7,
                y + size * 0.48,
                x + size * 0.89,
                y + size * 0.35,
                "#5c8790",
                size * 0.09
            );


            ctx.strokeStyle =
                "#5c8790";

            ctx.lineWidth =
                Math.max(
                    2,
                    size * 0.06
                );


            ctx.beginPath();

            ctx.arc(
                x + size * 0.45,
                y + size * 0.38,
                size * 0.2,
                Math.PI,
                0
            );

            ctx.stroke();
        }



        /* =================================================
           GAMEPLAY
        ================================================= */

        drawGoal(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            ctx.save();

            ctx.globalAlpha =
                0.75;


            ctx.strokeStyle =
                p.goal;

            ctx.lineWidth =
                Math.max(
                    3,
                    size * 0.05
                );


            ctx.strokeRect(
                x + size * 0.14,
                y + size * 0.14,
                size * 0.72,
                size * 0.72
            );


            ctx.restore();
        }



        drawDeposit(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            ctx.save();

            ctx.globalAlpha =
                0.65;


            ctx.strokeStyle =
                p.blue;

            ctx.lineWidth =
                Math.max(
                    3,
                    size * 0.05
                );


            ctx.setLineDash([
                size * 0.12,
                size * 0.08
            ]);


            ctx.strokeRect(
                x + size * 0.16,
                y + size * 0.16,
                size * 0.68,
                size * 0.68
            );


            ctx.restore();
        }



        drawBlocked(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            ctx.save();

            ctx.globalAlpha =
                0.35;


            this.rect(
                ctx,
                x + size * 0.08,
                y + size * 0.08,
                size * 0.84,
                size * 0.84,
                p.blocked
            );


            ctx.restore();
        }



        /* =================================================
           ROUTEUR PRINCIPAL

           game.js pourra simplement appeler :

           PYTArt.draw(ctx, type, x, y, size)
        ================================================= */

        draw(
            ctx,
            type,
            x,
            y,
            size,
            options = {}
        ) {

            const value =
                this.normalize(
                    type
                );


            switch (value) {

                /* STRUCTURE */

                case "wall":
                case "mur":

                    return this.drawWall(
                        ctx,
                        x,
                        y,
                        size,
                        options
                    );


                case "window":
                case "fenetre":

                    return this.drawWindow(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "door":
                case "porte":

                    return this.drawDoor(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "garage_door":
                case "porte_garage":

                    return this.drawGarageDoor(
                        ctx,
                        x,
                        y,
                        size
                    );


                /* SOL */

                case "floor_wood":
                case "sol_bois":

                    return this.drawFloorWood(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "floor_tile":
                case "carrelage":

                    return this.drawFloorTile(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "grass":
                case "herbe":

                    return this.drawGrass(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "path":
                case "chemin":

                    return this.drawPath(
                        ctx,
                        x,
                        y,
                        size
                    );


                /* MEUBLES */

                case "table":
                case "coffee_table":
                case "table_basse":

                    return this.drawTable(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "chair":
                case "chaise":
                case "stool":
                case "tabouret":

                    return this.drawChair(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "sofa":
                case "canape":
                case "armchair":
                case "fauteuil":

                    return this.drawSofa(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "bed":
                case "lit":

                    return this.drawBed(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "plant":
                case "plante":

                    return this.drawPlant(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "rug":
                case "tapis":

                    return this.drawRug(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "lamp":
                case "lampe":

                    return this.drawLamp(
                        ctx,
                        x,
                        y,
                        size
                    );


                /* CUISINE */

                case "kitchen_counter":
                case "plan_travail":
                case "console":
                case "workbench":
                case "etabli":

                    return this.drawKitchenCounter(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "sink":
                case "evier":

                    return this.drawSink(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "fridge":
                case "frigo":

                    return this.drawFridge(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "oven":
                case "four":
                case "stove":
                case "plaques":

                    return this.drawOven(
                        ctx,
                        x,
                        y,
                        size
                    );


                /* SALON */

                case "bookshelf":
                case "bibliotheque":
                case "shelf":
                case "etagere":

                    return this.drawBookshelf(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "tv":
                case "television":
                case "tv_unit":
                case "meuble_tv":

                    return this.drawTV(
                        ctx,
                        x,
                        y,
                        size
                    );


                /* GARAGE */

                case "car":
                case "voiture":

                    return this.drawCar(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "toolbox":
                case "boite_outils":
                case "tools":
                case "outils":

                    return this.drawToolbox(
                        ctx,
                        x,
                        y,
                        size
                    );


                /* CAVE */

                case "wine_rack":
                case "casier_vin":

                    return this.drawWineRack(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "barrel":
                case "tonneau":

                    return this.drawBarrel(
                        ctx,
                        x,
                        y,
                        size
                    );


                /* TOILETTE */

                case "toilet":
                case "toilette":

                    return this.drawToilet(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "bathroom_sink":
                case "lavabo":

                    return this.drawBathroomSink(
                        ctx,
                        x,
                        y,
                        size
                    );


                /* JARDIN */

                case "tree":
                case "arbre":
                case "small_tree":
                case "petit_arbre":

                    return this.drawTree(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "bush":
                case "buisson":
                case "hedge":
                case "haie":

                    return this.drawBush(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "flowers":
                case "fleurs":

                    return this.drawFlowers(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "pool":
                case "piscine":

                    return this.drawPool(
                        ctx,
                        x,
                        y,
                        size,
                        options
                    );


                case "sunbed":
                case "transat":

                    return this.drawSunbed(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "parasol":

                    return this.drawParasol(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "float":
                case "bouee":

                    return this.drawFloat(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "bench":
                case "banc":

                    return this.drawBench(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "fountain":
                case "fontaine":

                    return this.drawFountain(
                        ctx,
                        x,
                        y,
                        size
                    );


                /* OBJETS */

                case "book":
                case "livre":

                    return this.drawBook(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "livre_rouge":

                    return this.drawBook(
                        ctx,
                        x,
                        y,
                        size,
                        this.palette.red
                    );


                case "livre_bleu":

                    return this.drawBook(
                        ctx,
                        x,
                        y,
                        size,
                        this.palette.blue
                    );


                case "box":
                case "caisse":
                case "package":
                case "colis":
                case "carton":
                case "crate":
                case "caisse_bois":

                    return this.drawBox(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "key":
                case "cle":

                    return this.drawKey(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "apple":
                case "pomme":

                    return this.drawApple(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "cup":
                case "tasse":

                    return this.drawCup(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "plate":
                case "assiette":

                    return this.drawPlate(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "watering_can":
                case "arrosoir":

                    return this.drawWateringCan(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "bottle":
                case "bouteille":

                    return this.drawBottle(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "bouteille_rouge":

                    return this.drawBottle(
                        ctx,
                        x,
                        y,
                        size,
                        "#74343b"
                    );


                case "bouteille_bleue":

                    return this.drawBottle(
                        ctx,
                        x,
                        y,
                        size,
                        "#3d6680"
                    );


                case "bouteille_verte":

                    return this.drawBottle(
                        ctx,
                        x,
                        y,
                        size,
                        "#406341"
                    );


                case "bouteille_jaune":

                    return this.drawBottle(
                        ctx,
                        x,
                        y,
                        size,
                        "#9a843e"
                    );


                /* GAMEPLAY */

                case "goal":
                case "objectif":
                case "start":
                case "depart":

                    return this.drawGoal(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "deposit":
                case "depot":

                    return this.drawDeposit(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "blocked":
                case "case_bloquee":

                    return this.drawBlocked(
                        ctx,
                        x,
                        y,
                        size
                    );


                default:

                    return this.drawUnknown(
                        ctx,
                        x,
                        y,
                        size,
                        value
                    );
            }
        }



        drawUnknown(
            ctx,
            x,
            y,
            size,
            name
        ) {

            const p =
                this.palette;


            ctx.save();

            ctx.globalAlpha =
                0.6;


            this.rect(
                ctx,
                x + size * 0.2,
                y + size * 0.2,
                size * 0.6,
                size * 0.6,
                p.metal
            );


            ctx.fillStyle =
                p.white;

            ctx.font =
                `${Math.floor(
                    size * 0.14
                )}px monospace`;

            ctx.textAlign =
                "center";

            ctx.textBaseline =
                "middle";


            ctx.fillText(
                "?",
                x + size * 0.5,
                y + size * 0.5
            );


            ctx.restore();
        }



        /* =================================================
           FORMES SUPPLÉMENTAIRES
        ================================================= */

        ctxTriangle(
            ctx,
            x1,
            y1,
            x2,
            y2,
            x3,
            y3,
            color
        ) {

            ctx.fillStyle =
                color;

            ctx.beginPath();

            ctx.moveTo(
                x1,
                y1
            );

            ctx.lineTo(
                x2,
                y2
            );

            ctx.lineTo(
                x3,
                y3
            );

            ctx.closePath();

            ctx.fill();
        }

    }



    /* =====================================================
       INSTANCE GLOBALE
    ===================================================== */

    window.PytArt =
        PytArt;


    window.PYTArt =
        new PytArt();

})();