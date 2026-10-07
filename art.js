"use strict";

/* =========================================================
   PYT - ART.JS
   =========================================================

   MOTEUR VISUEL PIXEL ART

   OBJECTIF :
   - maison riche vue du dessus
   - pseudo-3D pixelisé
   - murs épais
   - meubles détaillés
   - extérieur dense
   - éclairage chaud
   - ombres
   - textures
   - reflets
   - grille de gameplay lisible
   - Pyt blanc/noir, yeux jaune-blanc

   AUCUNE IMAGE EXTERNE.

   Le rendu fonctionne par multiples passes graphiques.

   Exemples de passes :
   01 fond
   02 matière principale
   03 variation matière
   04 bruit
   05 joints
   06 profondeur
   07 ombre large
   08 ombre de contact
   09 silhouette
   10 volume sombre
   11 volume intermédiaire
   12 volume clair
   13 highlight
   14 bords
   15 texture locale
   16 détails
   17 petits objets
   18 métal
   19 verre
   20 tissu
   21 végétation sombre
   22 végétation moyenne
   23 végétation claire
   24 fleurs
   25 lumière
   26 halo
   27 reflet
   28 micro-détails
   29 ambient occlusion
   30 finition

========================================================= */


(() => {

    class PytArt {

        constructor() {

            this.BASE = 64;

            this.palette = {

                /* =================================================
                   CONTOURS / NUIT
                ================================================= */

                ink0: "#0c0c14",
                ink1: "#151421",
                ink2: "#23223a",
                ink3: "#34324f",

                night0: "#171827",
                night1: "#252641",
                night2: "#34365b",
                night3: "#484a71",


                /* =================================================
                   ROBOT
                ================================================= */

                robotWhite0: "#fffef6",
                robotWhite1: "#f0efe9",
                robotWhite2: "#d3d4d2",
                robotWhite3: "#a9adb0",

                robotBlack0: "#111217",
                robotBlack1: "#1c1e25",
                robotBlack2: "#30343d",

                robotMetal0: "#8b929d",
                robotMetal1: "#59606c",

                eye0: "#fffbd2",
                eye1: "#fff19a",
                eye2: "#ffd84d",
                eye3: "#c89629",


                /* =================================================
                   BOIS
                ================================================= */

                wood0: "#f2c087",
                wood1: "#d99b65",
                wood2: "#b87550",
                wood3: "#87503d",
                wood4: "#5a352e",

                darkWood0: "#b87c5e",
                darkWood1: "#875645",
                darkWood2: "#603b36",
                darkWood3: "#3e292b",


                /* =================================================
                   MURS
                ================================================= */

                wallTop0: "#c9c8db",
                wallTop1: "#a8a5c0",

                wallFace0: "#777594",
                wallFace1: "#5c5979",
                wallFace2: "#3d3b5b",

                plaster0: "#f0dbc2",
                plaster1: "#d5bfa9",

                brick0: "#a66c67",
                brick1: "#7c4d53",
                brick2: "#513540",


                /* =================================================
                   SOL
                ================================================= */

                tile0: "#eadac4",
                tile1: "#cbbba6",
                tile2: "#aa9b8e",
                tile3: "#80756e",

                stone0: "#a5a1ad",
                stone1: "#7f7d8e",
                stone2: "#606071",
                stone3: "#454655",

                concrete0: "#a3a4aa",
                concrete1: "#83858d",
                concrete2: "#64666f",
                concrete3: "#4b4e57",


                /* =================================================
                   VIOLET
                ================================================= */

                purple0: "#e2b5f0",
                purple1: "#c18adc",
                purple2: "#9964bd",
                purple3: "#704795",
                purple4: "#483365",

                pink0: "#ffb7d8",
                pink1: "#ef7db8",
                pink2: "#c65399",


                /* =================================================
                   BLEU / EAU
                ================================================= */

                water0: "#8cf4ff",
                water1: "#4bd7ef",
                water2: "#24a8d5",
                water3: "#1677ad",
                water4: "#174e79",

                cyan0: "#a2ffff",
                cyan1: "#62e2ec",


                /* =================================================
                   NATURE
                ================================================= */

                grass0: "#8bca5c",
                grass1: "#69ad4e",
                grass2: "#4c8a42",
                grass3: "#32673a",
                grass4: "#244b34",

                leaf0: "#92cf5c",
                leaf1: "#6fb14c",
                leaf2: "#4b913f",
                leaf3: "#326f39",
                leaf4: "#255534",

                pine0: "#3f8963",
                pine1: "#2d684e",
                pine2: "#214d40",

                flowerPink: "#ff8cc2",
                flowerPurple: "#bd80f3",
                flowerBlue: "#6dbbf4",
                flowerYellow: "#ffe66e",
                flowerWhite: "#fff9dd",
                flowerRed: "#f26770",


                /* =================================================
                   LUMIÈRE
                ================================================= */

                light0: "#fff7bd",
                light1: "#ffe48b",
                light2: "#ffb650",
                light3: "#e87634",


                /* =================================================
                   MÉTAL
                ================================================= */

                metal0: "#c4cad0",
                metal1: "#9298a2",
                metal2: "#686f7b",
                metal3: "#434852",


                /* =================================================
                   AUTRES
                ================================================= */

                red0: "#f37a79",
                red1: "#ca525e",
                red2: "#8b3749",

                blue0: "#87a9ee",
                blue1: "#557ac2",
                blue2: "#374f91",

                green0: "#8bce8b",
                green1: "#5ea46e",
                green2: "#39764e",

                yellow0: "#ffdc62",
                yellow1: "#ddb041",

                cream0: "#fff1d2",
                cream1: "#dfc9aa",

                white: "#ffffff",

                shadow:
                    "rgba(8,7,15,0.36)",

                shadowDeep:
                    "rgba(4,4,10,0.56)",

                warmGlow:
                    "rgba(255,190,80,0.18)",

                coolGlow:
                    "rgba(80,210,255,0.14)"
            };


            this.font =
                this.createPixelFont();


            this.roomThemes = {

                entree: {
                    floor: "wood",
                    ambient: "#d7a977"
                },

                cuisine: {
                    floor: "tile",
                    ambient: "#e1caa9"
                },

                salon: {
                    floor: "wood",
                    ambient: "#c99674"
                },

                chambre: {
                    floor: "wood",
                    ambient: "#b889a6"
                },

                garage: {
                    floor: "concrete",
                    ambient: "#82858b"
                },

                cave_a_vin: {
                    floor: "stone",
                    ambient: "#79615e"
                },

                balcon: {
                    floor: "wood",
                    ambient: "#978267"
                },

                toilette: {
                    floor: "tile",
                    ambient: "#bcd2d2"
                },

                jardin: {
                    floor: "grass",
                    ambient: "#5b8d4f"
                }
            };

        }



        /* =========================================================
           UTILITAIRES
        ========================================================= */

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


        hash(
            x,
            y,
            seed = 0
        ) {

            let value =
                (
                    x * 374761393 +
                    y * 668265263 +
                    seed * 69069
                ) | 0;


            value =
                (
                    value ^
                    (
                        value >>
                        13
                    )
                ) *
                1274126177;


            value =
                value ^
                (
                    value >>
                    16
                );


            return (
                value >>>
                0
            ) /
            4294967295;
        }


        clamp(
            value,
            min,
            max
        ) {

            return Math.max(
                min,
                Math.min(
                    max,
                    value
                )
            );
        }


        withTile(
            ctx,
            x,
            y,
            size,
            callback
        ) {

            ctx.save();

            ctx.imageSmoothingEnabled =
                false;

            ctx.translate(
                Math.round(x),
                Math.round(y)
            );

            const scale =
                size /
                this.BASE;

            ctx.scale(
                scale,
                scale
            );

            callback(
                this.BASE
            );

            ctx.restore();
        }


        r(
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
                Math.round(x),
                Math.round(y),
                Math.round(width),
                Math.round(height)
            );
        }


        line(
            ctx,
            x1,
            y1,
            x2,
            y2,
            color,
            width = 1
        ) {

            ctx.strokeStyle =
                color;

            ctx.lineWidth =
                width;

            ctx.beginPath();

            ctx.moveTo(
                Math.round(x1) + 0.5,
                Math.round(y1) + 0.5
            );

            ctx.lineTo(
                Math.round(x2) + 0.5,
                Math.round(y2) + 0.5
            );

            ctx.stroke();
        }


        poly(
            ctx,
            points,
            color
        ) {

            if (
                !points ||
                points.length ===
                0
            ) {

                return;
            }


            ctx.fillStyle =
                color;

            ctx.beginPath();

            ctx.moveTo(
                points[0][0],
                points[0][1]
            );


            for (
                let i = 1;
                i < points.length;
                i += 1
            ) {

                ctx.lineTo(
                    points[i][0],
                    points[i][1]
                );
            }


            ctx.closePath();

            ctx.fill();
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
                x,
                y,
                radius,
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
                x,
                y,
                rx,
                ry,
                0,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }


        shadowRect(
            ctx,
            x,
            y,
            width,
            height,
            alpha = 0.30
        ) {

            ctx.save();

            ctx.globalAlpha =
                alpha;

            this.r(
                ctx,
                x,
                y,
                width,
                height,
                "#06060b"
            );

            ctx.restore();
        }


        pixelOutlineRect(
            ctx,
            x,
            y,
            width,
            height,
            outer,
            inner
        ) {

            this.r(
                ctx,
                x,
                y,
                width,
                height,
                outer
            );

            this.r(
                ctx,
                x + 2,
                y + 2,
                width - 4,
                height - 4,
                inner
            );
        }



        /* =========================================================
           PIXEL FONT
        ========================================================= */

        createPixelFont() {

            const font = {

                "A": [
                    "01110",
                    "10001",
                    "10001",
                    "11111",
                    "10001",
                    "10001",
                    "10001"
                ],

                "B": [
                    "11110",
                    "10001",
                    "10001",
                    "11110",
                    "10001",
                    "10001",
                    "11110"
                ],

                "C": [
                    "01111",
                    "10000",
                    "10000",
                    "10000",
                    "10000",
                    "10000",
                    "01111"
                ],

                "D": [
                    "11110",
                    "10001",
                    "10001",
                    "10001",
                    "10001",
                    "10001",
                    "11110"
                ],

                "E": [
                    "11111",
                    "10000",
                    "10000",
                    "11110",
                    "10000",
                    "10000",
                    "11111"
                ],

                "F": [
                    "11111",
                    "10000",
                    "10000",
                    "11110",
                    "10000",
                    "10000",
                    "10000"
                ],

                "G": [
                    "01111",
                    "10000",
                    "10000",
                    "10111",
                    "10001",
                    "10001",
                    "01111"
                ],

                "H": [
                    "10001",
                    "10001",
                    "10001",
                    "11111",
                    "10001",
                    "10001",
                    "10001"
                ],

                "I": [
                    "11111",
                    "00100",
                    "00100",
                    "00100",
                    "00100",
                    "00100",
                    "11111"
                ],

                "J": [
                    "00111",
                    "00010",
                    "00010",
                    "00010",
                    "10010",
                    "10010",
                    "01100"
                ],

                "K": [
                    "10001",
                    "10010",
                    "10100",
                    "11000",
                    "10100",
                    "10010",
                    "10001"
                ],

                "L": [
                    "10000",
                    "10000",
                    "10000",
                    "10000",
                    "10000",
                    "10000",
                    "11111"
                ],

                "M": [
                    "10001",
                    "11011",
                    "10101",
                    "10101",
                    "10001",
                    "10001",
                    "10001"
                ],

                "N": [
                    "10001",
                    "11001",
                    "10101",
                    "10011",
                    "10001",
                    "10001",
                    "10001"
                ],

                "O": [
                    "01110",
                    "10001",
                    "10001",
                    "10001",
                    "10001",
                    "10001",
                    "01110"
                ],

                "P": [
                    "11110",
                    "10001",
                    "10001",
                    "11110",
                    "10000",
                    "10000",
                    "10000"
                ],

                "Q": [
                    "01110",
                    "10001",
                    "10001",
                    "10001",
                    "10101",
                    "10010",
                    "01101"
                ],

                "R": [
                    "11110",
                    "10001",
                    "10001",
                    "11110",
                    "10100",
                    "10010",
                    "10001"
                ],

                "S": [
                    "01111",
                    "10000",
                    "10000",
                    "01110",
                    "00001",
                    "00001",
                    "11110"
                ],

                "T": [
                    "11111",
                    "00100",
                    "00100",
                    "00100",
                    "00100",
                    "00100",
                    "00100"
                ],

                "U": [
                    "10001",
                    "10001",
                    "10001",
                    "10001",
                    "10001",
                    "10001",
                    "01110"
                ],

                "V": [
                    "10001",
                    "10001",
                    "10001",
                    "10001",
                    "10001",
                    "01010",
                    "00100"
                ],

                "W": [
                    "10001",
                    "10001",
                    "10001",
                    "10101",
                    "10101",
                    "11011",
                    "10001"
                ],

                "X": [
                    "10001",
                    "10001",
                    "01010",
                    "00100",
                    "01010",
                    "10001",
                    "10001"
                ],

                "Y": [
                    "10001",
                    "10001",
                    "01010",
                    "00100",
                    "00100",
                    "00100",
                    "00100"
                ],

                "Z": [
                    "11111",
                    "00001",
                    "00010",
                    "00100",
                    "01000",
                    "10000",
                    "11111"
                ],

                "0": [
                    "01110",
                    "10001",
                    "10011",
                    "10101",
                    "11001",
                    "10001",
                    "01110"
                ],

                "1": [
                    "00100",
                    "01100",
                    "00100",
                    "00100",
                    "00100",
                    "00100",
                    "01110"
                ],

                "2": [
                    "01110",
                    "10001",
                    "00001",
                    "00010",
                    "00100",
                    "01000",
                    "11111"
                ],

                "3": [
                    "11110",
                    "00001",
                    "00001",
                    "01110",
                    "00001",
                    "00001",
                    "11110"
                ],

                "4": [
                    "00010",
                    "00110",
                    "01010",
                    "10010",
                    "11111",
                    "00010",
                    "00010"
                ],

                "5": [
                    "11111",
                    "10000",
                    "10000",
                    "11110",
                    "00001",
                    "00001",
                    "11110"
                ],

                "6": [
                    "01110",
                    "10000",
                    "10000",
                    "11110",
                    "10001",
                    "10001",
                    "01110"
                ],

                "7": [
                    "11111",
                    "00001",
                    "00010",
                    "00100",
                    "01000",
                    "01000",
                    "01000"
                ],

                "8": [
                    "01110",
                    "10001",
                    "10001",
                    "01110",
                    "10001",
                    "10001",
                    "01110"
                ],

                "9": [
                    "01110",
                    "10001",
                    "10001",
                    "01111",
                    "00001",
                    "00001",
                    "01110"
                ],

                " ": [
                    "00000",
                    "00000",
                    "00000",
                    "00000",
                    "00000",
                    "00000",
                    "00000"
                ],

                "-": [
                    "00000",
                    "00000",
                    "00000",
                    "11111",
                    "00000",
                    "00000",
                    "00000"
                ],

                ".": [
                    "00000",
                    "00000",
                    "00000",
                    "00000",
                    "00000",
                    "00110",
                    "00110"
                ]
            };


            return font;
        }


        measurePixelText(
            text,
            scale = 2
        ) {

            return (
                String(text).length *
                scale *
                6
            );
        }


        drawPixelText(
            ctx,
            text,
            x,
            y,
            options = {}
        ) {

            const scale =
                options.scale ||
                2;

            const color =
                options.color ||
                "#ffffff";

            const shadow =
                options.shadow ||
                null;

            const align =
                options.align ||
                "left";


            const value =
                String(text)
                    .toUpperCase();


            let startX =
                x;


            if (
                align ===
                "center"
            ) {

                startX -=
                    this.measurePixelText(
                        value,
                        scale
                    ) /
                    2;
            }


            const drawPass =
                (
                    offsetX,
                    offsetY,
                    renderColor
                ) => {

                    let cursor =
                        startX;


                    for (
                        const character
                        of value
                    ) {

                        const glyph =
                            this.font[
                                character
                            ] ||
                            this.font[" "];


                        for (
                            let row = 0;
                            row < glyph.length;
                            row += 1
                        ) {

                            for (
                                let column = 0;
                                column < 5;
                                column += 1
                            ) {

                                if (
                                    glyph[row][column] !==
                                    "1"
                                ) {

                                    continue;
                                }


                                ctx.fillStyle =
                                    renderColor;


                                ctx.fillRect(
                                    Math.round(
                                        cursor +
                                        column *
                                        scale +
                                        offsetX
                                    ),
                                    Math.round(
                                        y +
                                        row *
                                        scale +
                                        offsetY
                                    ),
                                    scale,
                                    scale
                                );
                            }
                        }


                        cursor +=
                            scale *
                            6;
                    }
                };


            if (
                shadow
            ) {

                drawPass(
                    scale,
                    scale,
                    shadow
                );
            }


            drawPass(
                0,
                0,
                color
            );
        }



        /* =========================================================
           SOLS
        ========================================================= */

        drawWoodFloor(
            ctx,
            x,
            y,
            size,
            options = {}
        ) {

            const p =
                this.palette;


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    /*
                     * PASS 01
                     * couleur générale
                     */

                    this.r(
                        ctx,
                        0,
                        0,
                        64,
                        64,
                        p.wood1
                    );


                    /*
                     * PASS 02
                     * grandes lattes
                     */

                    for (
                        let row = 0;
                        row < 8;
                        row += 1
                    ) {

                        const py =
                            row *
                            8;


                        const alt =
                            row %
                            2;


                        this.r(
                            ctx,
                            0,
                            py + 7,
                            64,
                            1,
                            p.wood3
                        );


                        const splitA =
                            alt
                                ? 18
                                : 31;


                        const splitB =
                            alt
                                ? 46
                                : 14;


                        this.r(
                            ctx,
                            splitA,
                            py,
                            1,
                            8,
                            p.wood2
                        );


                        this.r(
                            ctx,
                            splitB,
                            py,
                            1,
                            8,
                            p.wood2
                        );
                    }


                    /*
                     * PASS 03
                     * bords clairs
                     */

                    for (
                        let row = 0;
                        row < 8;
                        row += 1
                    ) {

                        this.r(
                            ctx,
                            0,
                            row * 8,
                            64,
                            1,
                            "rgba(255,240,210,0.10)"
                        );
                    }


                    /*
                     * PASS 04
                     * veines de bois
                     */

                    for (
                        let i = 0;
                        i < 18;
                        i += 1
                    ) {

                        const px =
                            Math.floor(
                                this.hash(
                                    i,
                                    3,
                                    11
                                ) *
                                56
                            );


                        const py =
                            Math.floor(
                                this.hash(
                                    i,
                                    9,
                                    17
                                ) *
                                60
                            );


                        const width =
                            2 +
                            Math.floor(
                                this.hash(
                                    i,
                                    4,
                                    20
                                ) *
                                8
                            );


                        this.r(
                            ctx,
                            px,
                            py,
                            width,
                            1,
                            i %
                            2
                                ? p.wood2
                                : "#c38859"
                        );
                    }


                    /*
                     * PASS 05
                     * micro-points
                     */

                    for (
                        let i = 0;
                        i < 10;
                        i += 1
                    ) {

                        const px =
                            Math.floor(
                                this.hash(
                                    i,
                                    10,
                                    5
                                ) *
                                64
                            );


                        const py =
                            Math.floor(
                                this.hash(
                                    i,
                                    11,
                                    8
                                ) *
                                64
                            );


                        this.r(
                            ctx,
                            px,
                            py,
                            1,
                            1,
                            p.wood3
                        );
                    }
                }
            );
        }


        drawTileFloor(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.r(
                        ctx,
                        0,
                        0,
                        64,
                        64,
                        p.tile1
                    );


                    /*
                     * Dalles 16×16.
                     */

                    for (
                        let gy = 0;
                        gy < 4;
                        gy += 1
                    ) {

                        for (
                            let gx = 0;
                            gx < 4;
                            gx += 1
                        ) {

                            const px =
                                gx *
                                16;

                            const py =
                                gy *
                                16;


                            const alt =
                                (
                                    gx +
                                    gy
                                ) %
                                2;


                            this.r(
                                ctx,
                                px + 1,
                                py + 1,
                                14,
                                14,
                                alt
                                    ? p.tile0
                                    : p.tile1
                            );


                            this.r(
                                ctx,
                                px + 2,
                                py + 2,
                                12,
                                1,
                                "rgba(255,255,255,0.18)"
                            );
                        }
                    }


                    /*
                     * Joints.
                     */

                    for (
                        let i = 16;
                        i < 64;
                        i += 16
                    ) {

                        this.r(
                            ctx,
                            i - 1,
                            0,
                            2,
                            64,
                            p.tile3
                        );

                        this.r(
                            ctx,
                            0,
                            i - 1,
                            64,
                            2,
                            p.tile3
                        );
                    }


                    /*
                     * Imperfections.
                     */

                    for (
                        let i = 0;
                        i < 14;
                        i += 1
                    ) {

                        const px =
                            Math.floor(
                                this.hash(
                                    i,
                                    5,
                                    12
                                ) *
                                60
                            );


                        const py =
                            Math.floor(
                                this.hash(
                                    i,
                                    9,
                                    13
                                ) *
                                60
                            );


                        this.r(
                            ctx,
                            px,
                            py,
                            2,
                            1,
                            p.tile2
                        );
                    }
                }
            );
        }


        drawStoneFloor(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.r(
                        ctx,
                        0,
                        0,
                        64,
                        64,
                        p.stone2
                    );


                    const stones = [

                        [
                            2,
                            2,
                            27,
                            18
                        ],

                        [
                            32,
                            2,
                            30,
                            15
                        ],

                        [
                            3,
                            23,
                            21,
                            18
                        ],

                        [
                            27,
                            20,
                            35,
                            22
                        ],

                        [
                            2,
                            44,
                            30,
                            18
                        ],

                        [
                            35,
                            45,
                            27,
                            17
                        ]
                    ];


                    stones.forEach(
                        (
                            stone,
                            index
                        ) => {

                            const [
                                sx,
                                sy,
                                sw,
                                sh
                            ] =
                                stone;


                            const color =
                                index %
                                3 ===
                                0
                                    ? p.stone0
                                    : index %
                                        3 ===
                                        1
                                        ? p.stone1
                                        : "#717081";


                            this.r(
                                ctx,
                                sx,
                                sy,
                                sw,
                                sh,
                                color
                            );


                            this.r(
                                ctx,
                                sx + 2,
                                sy + 2,
                                sw - 4,
                                1,
                                "rgba(255,255,255,0.10)"
                            );
                        }
                    );


                    /*
                     * Joints sombres.
                     */

                    this.r(
                        ctx,
                        29,
                        0,
                        3,
                        23,
                        p.stone3
                    );

                    this.r(
                        ctx,
                        24,
                        20,
                        3,
                        24,
                        p.stone3
                    );

                    this.r(
                        ctx,
                        32,
                        42,
                        3,
                        22,
                        p.stone3
                    );

                    this.r(
                        ctx,
                        0,
                        20,
                        64,
                        3,
                        p.stone3
                    );

                    this.r(
                        ctx,
                        0,
                        41,
                        64,
                        3,
                        p.stone3
                    );
                }
            );
        }


        drawConcreteFloor(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.r(
                        ctx,
                        0,
                        0,
                        64,
                        64,
                        p.concrete1
                    );


                    this.r(
                        ctx,
                        31,
                        0,
                        2,
                        64,
                        p.concrete2
                    );

                    this.r(
                        ctx,
                        0,
                        31,
                        64,
                        2,
                        p.concrete2
                    );


                    /*
                     * Petites fissures.
                     */

                    this.line(
                        ctx,
                        7,
                        13,
                        13,
                        17,
                        p.concrete3,
                        1
                    );

                    this.line(
                        ctx,
                        13,
                        17,
                        10,
                        21,
                        p.concrete3,
                        1
                    );


                    this.line(
                        ctx,
                        43,
                        48,
                        51,
                        44,
                        p.concrete3,
                        1
                    );

                    this.line(
                        ctx,
                        51,
                        44,
                        55,
                        48,
                        p.concrete3,
                        1
                    );


                    /*
                     * Taches.
                     */

                    for (
                        let i = 0;
                        i < 12;
                        i += 1
                    ) {

                        const px =
                            Math.floor(
                                this.hash(
                                    i,
                                    17,
                                    3
                                ) *
                                60
                            );


                        const py =
                            Math.floor(
                                this.hash(
                                    i,
                                    23,
                                    7
                                ) *
                                60
                            );


                        this.r(
                            ctx,
                            px,
                            py,
                            2,
                            2,
                            i %
                            2
                                ? p.concrete2
                                : "#8f9098"
                        );
                    }
                }
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


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    /*
                     * Base.
                     */

                    this.r(
                        ctx,
                        0,
                        0,
                        64,
                        64,
                        p.grass2
                    );


                    /*
                     * Variations.
                     */

                    for (
                        let i = 0;
                        i < 34;
                        i += 1
                    ) {

                        const px =
                            Math.floor(
                                this.hash(
                                    i,
                                    31,
                                    2
                                ) *
                                62
                            );


                        const py =
                            Math.floor(
                                this.hash(
                                    i,
                                    19,
                                    4
                                ) *
                                60
                            );


                        const color =
                            i %
                            4 ===
                            0
                                ? p.grass0
                                : i %
                                    4 ===
                                    1
                                    ? p.grass1
                                    : i %
                                        4 ===
                                        2
                                        ? p.grass3
                                        : p.leaf1;


                        this.r(
                            ctx,
                            px,
                            py,
                            1,
                            4,
                            color
                        );


                        if (
                            i %
                            3 ===
                            0
                        ) {

                            this.r(
                                ctx,
                                px + 1,
                                py + 2,
                                1,
                                2,
                                color
                            );
                        }
                    }


                    /*
                     * Petites zones sombres.
                     */

                    for (
                        let i = 0;
                        i < 8;
                        i += 1
                    ) {

                        const px =
                            Math.floor(
                                this.hash(
                                    i,
                                    22,
                                    15
                                ) *
                                58
                            );


                        const py =
                            Math.floor(
                                this.hash(
                                    i,
                                    33,
                                    12
                                ) *
                                58
                            );


                        this.r(
                            ctx,
                            px,
                            py,
                            4,
                            2,
                            p.grass3
                        );
                    }
                }
            );
        }


        drawPath(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.r(
                        ctx,
                        0,
                        0,
                        64,
                        64,
                        "#948a82"
                    );


                    const stones = [

                        [
                            1,
                            1,
                            29,
                            18,
                            "#ada39b"
                        ],

                        [
                            34,
                            0,
                            29,
                            20,
                            "#857c75"
                        ],

                        [
                            4,
                            23,
                            24,
                            19,
                            "#807771"
                        ],

                        [
                            31,
                            23,
                            31,
                            17,
                            "#a69c95"
                        ],

                        [
                            1,
                            45,
                            29,
                            18,
                            "#978d85"
                        ],

                        [
                            34,
                            44,
                            28,
                            19,
                            "#7f7770"
                        ]
                    ];


                    stones.forEach(
                        stone => {

                            this.r(
                                ctx,
                                stone[0],
                                stone[1],
                                stone[2],
                                stone[3],
                                stone[4]
                            );


                            this.r(
                                ctx,
                                stone[0] + 2,
                                stone[1] + 2,
                                stone[2] - 4,
                                1,
                                "rgba(255,255,255,0.12)"
                            );
                        }
                    );


                    /*
                     * Joints.
                     */

                    this.r(
                        ctx,
                        30,
                        0,
                        4,
                        23,
                        "#69625e"
                    );

                    this.r(
                        ctx,
                        28,
                        21,
                        4,
                        23,
                        "#69625e"
                    );

                    this.r(
                        ctx,
                        30,
                        42,
                        4,
                        22,
                        "#69625e"
                    );

                    this.r(
                        ctx,
                        0,
                        20,
                        64,
                        3,
                        "#69625e"
                    );

                    this.r(
                        ctx,
                        0,
                        41,
                        64,
                        3,
                        "#69625e"
                    );
                }
            );
        }



        /* =========================================================
           ARCHITECTURE
        ========================================================= */

        drawWall(
            ctx,
            x,
            y,
            size,
            options = {}
        ) {

            const p =
                this.palette;


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    /*
                     * PASS 01
                     * ombre mur
                     */

                    this.shadowRect(
                        ctx,
                        5,
                        10,
                        56,
                        47,
                        0.48
                    );


                    /*
                     * PASS 02
                     * silhouette
                     */

                    this.r(
                        ctx,
                        2,
                        5,
                        60,
                        52,
                        p.ink0
                    );


                    /*
                     * PASS 03
                     * façade profonde
                     */

                    this.r(
                        ctx,
                        4,
                        14,
                        56,
                        40,
                        p.wallFace2
                    );


                    /*
                     * PASS 04
                     */

                    this.r(
                        ctx,
                        6,
                        15,
                        52,
                        35,
                        p.wallFace1
                    );


                    /*
                     * PASS 05
                     * pan plâtre
                     */

                    this.r(
                        ctx,
                        9,
                        17,
                        46,
                        26,
                        "#6d6b89"
                    );


                    /*
                     * PASS 06
                     * dessus mur
                     */

                    this.r(
                        ctx,
                        1,
                        4,
                        62,
                        15,
                        p.ink0
                    );


                    /*
                     * PASS 07
                     */

                    this.r(
                        ctx,
                        3,
                        4,
                        58,
                        12,
                        p.wallTop1
                    );


                    /*
                     * PASS 08
                     */

                    this.r(
                        ctx,
                        5,
                        5,
                        54,
                        7,
                        p.wallTop0
                    );


                    /*
                     * PASS 09
                     * highlight haut
                     */

                    this.r(
                        ctx,
                        7,
                        5,
                        50,
                        2,
                        "#e0dfec"
                    );


                    /*
                     * PASS 10
                     * séparation
                     */

                    this.r(
                        ctx,
                        5,
                        16,
                        54,
                        2,
                        p.wallFace2
                    );


                    /*
                     * PASS 11
                     * plinthe
                     */

                    this.r(
                        ctx,
                        4,
                        49,
                        56,
                        7,
                        p.ink1
                    );


                    this.r(
                        ctx,
                        7,
                        49,
                        50,
                        3,
                        p.wallFace0
                    );


                    /*
                     * PASS 12
                     * micro textures
                     */

                    for (
                        let i = 0;
                        i < 11;
                        i += 1
                    ) {

                        const px =
                            8 +
                            Math.floor(
                                this.hash(
                                    i,
                                    8,
                                    12
                                ) *
                                46
                            );


                        const py =
                            20 +
                            Math.floor(
                                this.hash(
                                    i,
                                    9,
                                    14
                                ) *
                                24
                            );


                        this.r(
                            ctx,
                            px,
                            py,
                            3,
                            1,
                            i %
                            2
                                ? "#777591"
                                : "#575570"
                        );
                    }
                }
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


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    /*
                     * Ombre.
                     */

                    this.shadowRect(
                        ctx,
                        8,
                        12,
                        48,
                        38,
                        0.34
                    );


                    /*
                     * Cadre externe.
                     */

                    this.r(
                        ctx,
                        5,
                        8,
                        54,
                        43,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        8,
                        10,
                        48,
                        37,
                        p.wallTop1
                    );


                    /*
                     * Vitres.
                     */

                    this.r(
                        ctx,
                        12,
                        13,
                        17,
                        29,
                        p.water4
                    );

                    this.r(
                        ctx,
                        35,
                        13,
                        17,
                        29,
                        p.water4
                    );


                    this.r(
                        ctx,
                        14,
                        15,
                        13,
                        11,
                        this.glassBlue()
                    );


                    this.r(
                        ctx,
                        37,
                        15,
                        13,
                        11,
                        "#70c7de"
                    );


                    /*
                     * Reflets.
                     */

                    this.r(
                        ctx,
                        15,
                        16,
                        5,
                        2,
                        p.cyan0
                    );

                    this.r(
                        ctx,
                        21,
                        18,
                        4,
                        1,
                        p.cyan1
                    );


                    this.r(
                        ctx,
                        39,
                        16,
                        6,
                        2,
                        p.cyan0
                    );


                    /*
                     * Montant central.
                     */

                    this.r(
                        ctx,
                        29,
                        10,
                        6,
                        37,
                        p.ink2
                    );


                    this.r(
                        ctx,
                        31,
                        11,
                        2,
                        34,
                        p.wallTop0
                    );


                    /*
                     * Rebord.
                     */

                    this.r(
                        ctx,
                        5,
                        46,
                        54,
                        7,
                        p.ink0
                    );

                    this.r(
                        ctx,
                        8,
                        46,
                        48,
                        4,
                        "#b8b5cc"
                    );
                }
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


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        13,
                        8,
                        41,
                        51,
                        0.42
                    );


                    /*
                     * Encadrement.
                     */

                    this.r(
                        ctx,
                        8,
                        3,
                        48,
                        58,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        12,
                        6,
                        40,
                        53,
                        p.darkWood3
                    );


                    /*
                     * Porte.
                     */

                    this.r(
                        ctx,
                        15,
                        8,
                        34,
                        49,
                        p.darkWood2
                    );


                    /*
                     * Lumière bois.
                     */

                    this.r(
                        ctx,
                        17,
                        9,
                        30,
                        3,
                        p.darkWood0
                    );


                    /*
                     * Panneaux.
                     */

                    this.r(
                        ctx,
                        19,
                        15,
                        26,
                        14,
                        p.darkWood1
                    );

                    this.r(
                        ctx,
                        19,
                        35,
                        26,
                        15,
                        p.darkWood1
                    );


                    this.r(
                        ctx,
                        21,
                        17,
                        22,
                        2,
                        "#a86c53"
                    );

                    this.r(
                        ctx,
                        21,
                        37,
                        22,
                        2,
                        "#a86c53"
                    );


                    /*
                     * Serrure.
                     */

                    this.r(
                        ctx,
                        40,
                        29,
                        7,
                        7,
                        p.ink1
                    );

                    this.r(
                        ctx,
                        42,
                        30,
                        4,
                        4,
                        p.light2
                    );

                    this.r(
                        ctx,
                        43,
                        30,
                        2,
                        2,
                        p.light0
                    );


                    /*
                     * Seuil.
                     */

                    this.r(
                        ctx,
                        9,
                        57,
                        46,
                        5,
                        p.wallTop1
                    );


                    this.r(
                        ctx,
                        12,
                        58,
                        40,
                        2,
                        p.wallTop0
                    );
                }
            );
        }



        /* =========================================================
           OBJETS - CANAPÉ
        ========================================================= */

        drawSofa(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    /*
                     * PASS 01 grande ombre
                     */

                    this.shadowRect(
                        ctx,
                        4,
                        46,
                        56,
                        10,
                        0.34
                    );


                    /*
                     * PASS 02 silhouette
                     */

                    this.r(
                        ctx,
                        3,
                        10,
                        58,
                        42,
                        p.ink0
                    );


                    /*
                     * PASS 03 coque basse
                     */

                    this.r(
                        ctx,
                        5,
                        18,
                        54,
                        31,
                        p.purple4
                    );


                    /*
                     * PASS 04 accoudoirs
                     */

                    this.r(
                        ctx,
                        4,
                        19,
                        11,
                        30,
                        p.purple3
                    );

                    this.r(
                        ctx,
                        49,
                        19,
                        11,
                        30,
                        p.purple3
                    );


                    /*
                     * PASS 05 highlights accoudoirs
                     */

                    this.r(
                        ctx,
                        6,
                        20,
                        7,
                        4,
                        p.purple1
                    );

                    this.r(
                        ctx,
                        51,
                        20,
                        7,
                        4,
                        p.purple1
                    );


                    /*
                     * PASS 06 dossier
                     */

                    this.r(
                        ctx,
                        11,
                        8,
                        42,
                        24,
                        p.ink1
                    );


                    /*
                     * PASS 07 dossier principal
                     */

                    this.r(
                        ctx,
                        13,
                        10,
                        38,
                        20,
                        p.purple2
                    );


                    /*
                     * PASS 08 haut dossier
                     */

                    this.r(
                        ctx,
                        15,
                        11,
                        34,
                        4,
                        p.purple0
                    );


                    /*
                     * PASS 09 séparation
                     */

                    this.r(
                        ctx,
                        31,
                        11,
                        3,
                        19,
                        p.purple3
                    );


                    /*
                     * PASS 10 assises base
                     */

                    this.r(
                        ctx,
                        13,
                        31,
                        38,
                        16,
                        p.ink1
                    );


                    /*
                     * PASS 11 coussin gauche
                     */

                    this.r(
                        ctx,
                        14,
                        32,
                        17,
                        14,
                        "#a879c7"
                    );


                    /*
                     * PASS 12 coussin droit
                     */

                    this.r(
                        ctx,
                        34,
                        32,
                        17,
                        14,
                        "#a879c7"
                    );


                    /*
                     * PASS 13 haut coussin gauche
                     */

                    this.r(
                        ctx,
                        16,
                        33,
                        13,
                        3,
                        "#d2a6e4"
                    );


                    /*
                     * PASS 14 haut coussin droit
                     */

                    this.r(
                        ctx,
                        36,
                        33,
                        13,
                        3,
                        "#d2a6e4"
                    );


                    /*
                     * PASS 15 couture
                     */

                    this.r(
                        ctx,
                        31,
                        32,
                        3,
                        14,
                        p.purple4
                    );


                    /*
                     * PASS 16 coins
                     */

                    this.r(
                        ctx,
                        8,
                        46,
                        8,
                        5,
                        p.ink1
                    );

                    this.r(
                        ctx,
                        48,
                        46,
                        8,
                        5,
                        p.ink1
                    );


                    /*
                     * PASS 17 petit coussin
                     */

                    this.r(
                        ctx,
                        15,
                        20,
                        12,
                        10,
                        p.purple0
                    );


                    /*
                     * PASS 18 contour coussin
                     */

                    this.r(
                        ctx,
                        16,
                        21,
                        10,
                        1,
                        "#ebcef4"
                    );


                    /*
                     * PASS 19 seconde déco
                     */

                    this.r(
                        ctx,
                        40,
                        21,
                        8,
                        8,
                        p.pink2
                    );


                    /*
                     * PASS 20 micro texture
                     */

                    for (
                        let i = 0;
                        i < 8;
                        i += 1
                    ) {

                        const px =
                            17 +
                            Math.floor(
                                this.hash(
                                    i,
                                    7,
                                    8
                                ) *
                                30
                            );


                        const py =
                            15 +
                            Math.floor(
                                this.hash(
                                    i,
                                    11,
                                    9
                                ) *
                                29
                            );


                        this.r(
                            ctx,
                            px,
                            py,
                            2,
                            1,
                            "rgba(255,255,255,0.13)"
                        );
                    }
                }
            );
        }



        /* =========================================================
           TABLE
        ========================================================= */

        drawTable(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    /*
                     * Ombre.
                     */

                    this.shadowRect(
                        ctx,
                        6,
                        46,
                        52,
                        9,
                        0.30
                    );


                    /*
                     * Pieds arrière.
                     */

                    this.r(
                        ctx,
                        10,
                        36,
                        7,
                        19,
                        p.darkWood3
                    );

                    this.r(
                        ctx,
                        47,
                        36,
                        7,
                        19,
                        p.darkWood3
                    );


                    /*
                     * Pieds lumière.
                     */

                    this.r(
                        ctx,
                        12,
                        38,
                        3,
                        14,
                        p.darkWood1
                    );

                    this.r(
                        ctx,
                        49,
                        38,
                        3,
                        14,
                        p.darkWood1
                    );


                    /*
                     * Plateau silhouette.
                     */

                    this.r(
                        ctx,
                        4,
                        15,
                        56,
                        29,
                        p.ink0
                    );


                    /*
                     * Bord inférieur.
                     */

                    this.r(
                        ctx,
                        6,
                        34,
                        52,
                        8,
                        p.wood4
                    );


                    /*
                     * Plateau principal.
                     */

                    this.r(
                        ctx,
                        6,
                        12,
                        52,
                        25,
                        p.wood2
                    );


                    /*
                     * Zone centrale.
                     */

                    this.r(
                        ctx,
                        8,
                        14,
                        48,
                        19,
                        p.wood1
                    );


                    /*
                     * Highlight.
                     */

                    this.r(
                        ctx,
                        10,
                        15,
                        44,
                        3,
                        p.wood0
                    );


                    /*
                     * Planches.
                     */

                    this.r(
                        ctx,
                        31,
                        14,
                        2,
                        19,
                        p.wood2
                    );


                    /*
                     * Veines.
                     */

                    this.r(
                        ctx,
                        13,
                        22,
                        10,
                        1,
                        p.wood2
                    );

                    this.r(
                        ctx,
                        38,
                        27,
                        11,
                        1,
                        p.wood2
                    );

                    this.r(
                        ctx,
                        18,
                        30,
                        7,
                        1,
                        p.wood3
                    );


                    /*
                     * Petit objet déco.
                     */

                    this.r(
                        ctx,
                        27,
                        19,
                        10,
                        6,
                        p.ink2
                    );

                    this.r(
                        ctx,
                        29,
                        20,
                        6,
                        4,
                        p.green1
                    );

                    this.r(
                        ctx,
                        31,
                        20,
                        2,
                        2,
                        p.green0
                    );
                }
            );
        }



        /* =========================================================
           CHAISE
        ========================================================= */

        drawChair(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        14,
                        46,
                        36,
                        7,
                        0.26
                    );


                    /*
                     * Dossier silhouette.
                     */

                    this.r(
                        ctx,
                        14,
                        8,
                        36,
                        19,
                        p.ink0
                    );


                    /*
                     * Dossier.
                     */

                    this.r(
                        ctx,
                        17,
                        10,
                        30,
                        14,
                        p.darkWood1
                    );


                    this.r(
                        ctx,
                        20,
                        11,
                        24,
                        3,
                        p.wood0
                    );


                    /*
                     * Barrettes.
                     */

                    for (
                        let i = 0;
                        i < 4;
                        i += 1
                    ) {

                        this.r(
                            ctx,
                            21 +
                            i *
                            6,
                            14,
                            3,
                            9,
                            p.darkWood3
                        );
                    }


                    /*
                     * Assise silhouette.
                     */

                    this.r(
                        ctx,
                        12,
                        28,
                        40,
                        18,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        15,
                        29,
                        34,
                        14,
                        p.wood2
                    );


                    this.r(
                        ctx,
                        17,
                        30,
                        30,
                        3,
                        p.wood0
                    );


                    /*
                     * Pieds.
                     */

                    this.r(
                        ctx,
                        16,
                        43,
                        6,
                        15,
                        p.darkWood3
                    );

                    this.r(
                        ctx,
                        42,
                        43,
                        6,
                        15,
                        p.darkWood3
                    );
                }
            );
        }



        /* =========================================================
           LIT
        ========================================================= */

        drawBed(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        8,
                        55,
                        48,
                        6,
                        0.34
                    );


                    /*
                     * Cadre.
                     */

                    this.r(
                        ctx,
                        7,
                        3,
                        50,
                        57,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        10,
                        6,
                        44,
                        51,
                        p.darkWood2
                    );


                    /*
                     * Matelas.
                     */

                    this.r(
                        ctx,
                        13,
                        10,
                        38,
                        44,
                        p.purple3
                    );


                    /*
                     * Oreillers ombre.
                     */

                    this.r(
                        ctx,
                        15,
                        11,
                        15,
                        13,
                        p.ink1
                    );

                    this.r(
                        ctx,
                        34,
                        11,
                        15,
                        13,
                        p.ink1
                    );


                    /*
                     * Oreillers.
                     */

                    this.r(
                        ctx,
                        16,
                        10,
                        14,
                        12,
                        p.robotWhite1
                    );

                    this.r(
                        ctx,
                        34,
                        10,
                        14,
                        12,
                        p.robotWhite1
                    );


                    this.r(
                        ctx,
                        18,
                        11,
                        10,
                        3,
                        "#ffffff"
                    );

                    this.r(
                        ctx,
                        36,
                        11,
                        10,
                        3,
                        "#ffffff"
                    );


                    /*
                     * Drap.
                     */

                    this.r(
                        ctx,
                        13,
                        23,
                        38,
                        31,
                        p.purple2
                    );


                    /*
                     * Couverture haute.
                     */

                    this.r(
                        ctx,
                        14,
                        25,
                        36,
                        9,
                        p.purple1
                    );


                    this.r(
                        ctx,
                        16,
                        26,
                        32,
                        3,
                        "#d6a6e5"
                    );


                    /*
                     * Ombre couverture.
                     */

                    this.r(
                        ctx,
                        14,
                        49,
                        36,
                        5,
                        p.purple4
                    );


                    /*
                     * Motifs.
                     */

                    for (
                        let i = 0;
                        i < 4;
                        i += 1
                    ) {

                        this.r(
                            ctx,
                            18 +
                            i *
                            8,
                            38,
                            4,
                            4,
                            p.purple3
                        );
                    }
                }
            );
        }



        /* =========================================================
           TAPIS
        ========================================================= */

        drawRug(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        5,
                        53,
                        54,
                        4,
                        0.22
                    );


                    this.r(
                        ctx,
                        5,
                        9,
                        54,
                        46,
                        p.ink1
                    );


                    this.r(
                        ctx,
                        8,
                        11,
                        48,
                        42,
                        p.purple3
                    );


                    this.r(
                        ctx,
                        11,
                        14,
                        42,
                        36,
                        p.purple2
                    );


                    /*
                     * Bord.
                     */

                    this.r(
                        ctx,
                        13,
                        16,
                        38,
                        3,
                        p.purple0
                    );


                    this.r(
                        ctx,
                        13,
                        45,
                        38,
                        3,
                        p.purple4
                    );


                    /*
                     * Motif central.
                     */

                    this.r(
                        ctx,
                        28,
                        23,
                        8,
                        20,
                        p.purple4
                    );

                    this.r(
                        ctx,
                        22,
                        29,
                        20,
                        8,
                        p.purple4
                    );


                    this.r(
                        ctx,
                        30,
                        26,
                        4,
                        14,
                        p.pink1
                    );

                    this.r(
                        ctx,
                        25,
                        31,
                        14,
                        4,
                        p.pink1
                    );
                }
            );
        }



        /* =========================================================
           BIBLIOTHÈQUE
        ========================================================= */

        drawBookshelf(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        7,
                        57,
                        50,
                        5,
                        0.36
                    );


                    /*
                     * Cadre.
                     */

                    this.r(
                        ctx,
                        6,
                        3,
                        52,
                        57,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        9,
                        6,
                        46,
                        51,
                        p.darkWood2
                    );


                    /*
                     * Interior sombre.
                     */

                    this.r(
                        ctx,
                        13,
                        9,
                        38,
                        44,
                        "#33252c"
                    );


                    /*
                     * Étagères.
                     */

                    [
                        20,
                        34,
                        48
                    ].forEach(
                        py => {

                            this.r(
                                ctx,
                                11,
                                py,
                                42,
                                5,
                                p.ink0
                            );


                            this.r(
                                ctx,
                                13,
                                py,
                                38,
                                2,
                                p.darkWood0
                            );
                        }
                    );


                    /*
                     * Livres.
                     */

                    this.drawBookshelfRow(
                        ctx,
                        14,
                        10,
                        9
                    );

                    this.drawBookshelfRow(
                        ctx,
                        14,
                        24,
                        8
                    );

                    this.drawBookshelfRow(
                        ctx,
                        14,
                        38,
                        7
                    );


                    /*
                     * Highlights cadre.
                     */

                    this.r(
                        ctx,
                        10,
                        7,
                        3,
                        48,
                        "#a46b55"
                    );


                    this.r(
                        ctx,
                        13,
                        7,
                        36,
                        2,
                        "#b7795d"
                    );
                }
            );
        }


        drawBookshelfRow(
            ctx,
            x,
            y,
            count
        ) {

            const p =
                this.palette;


            const colors = [

                p.red1,
                p.blue1,
                p.green1,
                p.yellow1,
                p.purple2,
                p.pink2,
                "#8b6db1"
            ];


            let px =
                x;


            for (
                let i = 0;
                i < count;
                i += 1
            ) {

                const width =
                    i %
                    3 ===
                    0
                        ? 4
                        : 3;


                const height =
                    6 +
                    (
                        i %
                        4
                    );


                this.r(
                    ctx,
                    px,
                    y +
                    10 -
                    height,
                    width,
                    height,
                    colors[
                        i %
                        colors.length
                    ]
                );


                this.r(
                    ctx,
                    px,
                    y +
                    10 -
                    height,
                    1,
                    height,
                    "rgba(255,255,255,0.24)"
                );


                px +=
                    width +
                    1;
            }
        }



        /* =========================================================
           PLANTE
        ========================================================= */

        drawPlant(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        18,
                        52,
                        30,
                        5,
                        0.30
                    );


                    /*
                     * Pot contour.
                     */

                    this.r(
                        ctx,
                        18,
                        40,
                        28,
                        18,
                        p.ink0
                    );


                    /*
                     * Pot.
                     */

                    this.r(
                        ctx,
                        21,
                        41,
                        22,
                        15,
                        "#a85e4a"
                    );


                    this.r(
                        ctx,
                        23,
                        42,
                        18,
                        4,
                        "#d78160"
                    );


                    /*
                     * Terre.
                     */

                    this.r(
                        ctx,
                        23,
                        40,
                        18,
                        4,
                        p.darkWood3
                    );


                    /*
                     * Tiges.
                     */

                    this.r(
                        ctx,
                        31,
                        17,
                        3,
                        26,
                        p.leaf4
                    );

                    this.r(
                        ctx,
                        24,
                        23,
                        2,
                        20,
                        p.leaf4
                    );

                    this.r(
                        ctx,
                        40,
                        23,
                        2,
                        20,
                        p.leaf4
                    );


                    /*
                     * Feuilles multiples.
                     */

                    const leaves = [

                        [
                            14,
                            10,
                            p.leaf2
                        ],

                        [
                            25,
                            4,
                            p.leaf0
                        ],

                        [
                            35,
                            7,
                            p.leaf1
                        ],

                        [
                            44,
                            13,
                            p.leaf2
                        ],

                        [
                            12,
                            21,
                            p.leaf3
                        ],

                        [
                            22,
                            17,
                            p.leaf1
                        ],

                        [
                            36,
                            19,
                            p.leaf0
                        ],

                        [
                            46,
                            25,
                            p.leaf3
                        ],

                        [
                            18,
                            30,
                            p.leaf2
                        ],

                        [
                            33,
                            29,
                            p.leaf1
                        ]
                    ];


                    leaves.forEach(
                        leaf => {

                            this.drawLeafCluster(
                                ctx,
                                leaf[0],
                                leaf[1],
                                leaf[2]
                            );
                        }
                    );
                }
            );
        }


        drawLeafCluster(
            ctx,
            x,
            y,
            color
        ) {

            this.r(
                ctx,
                x + 4,
                y,
                8,
                3,
                color
            );

            this.r(
                ctx,
                x + 1,
                y + 3,
                14,
                7,
                color
            );

            this.r(
                ctx,
                x + 4,
                y + 10,
                8,
                3,
                color
            );


            this.r(
                ctx,
                x + 5,
                y + 2,
                5,
                2,
                "rgba(255,255,255,0.18)"
            );
        }



        /* =========================================================
           LAMPE
        ========================================================= */

        drawLamp(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    /*
                     * Halo.
                     */

                    ctx.save();

                    ctx.globalAlpha =
                        0.16;


                    this.r(
                        ctx,
                        8,
                        3,
                        48,
                        38,
                        p.light1
                    );


                    this.r(
                        ctx,
                        13,
                        7,
                        38,
                        29,
                        p.light2
                    );

                    ctx.restore();


                    /*
                     * Pied.
                     */

                    this.r(
                        ctx,
                        30,
                        28,
                        4,
                        27,
                        p.ink1
                    );


                    this.r(
                        ctx,
                        31,
                        29,
                        2,
                        25,
                        p.metal1
                    );


                    /*
                     * Base.
                     */

                    this.r(
                        ctx,
                        18,
                        53,
                        28,
                        6,
                        p.ink0
                    );

                    this.r(
                        ctx,
                        21,
                        53,
                        22,
                        3,
                        p.metal2
                    );


                    /*
                     * Abat-jour contour.
                     */

                    this.poly(
                        ctx,
                        [
                            [
                                19,
                                10
                            ],
                            [
                                45,
                                10
                            ],
                            [
                                52,
                                29
                            ],
                            [
                                12,
                                29
                            ]
                        ],
                        p.ink0
                    );


                    /*
                     * Abat-jour.
                     */

                    this.poly(
                        ctx,
                        [
                            [
                                21,
                                12
                            ],
                            [
                                43,
                                12
                            ],
                            [
                                48,
                                27
                            ],
                            [
                                16,
                                27
                            ]
                        ],
                        p.light2
                    );


                    this.r(
                        ctx,
                        23,
                        13,
                        18,
                        5,
                        p.light0
                    );


                    /*
                     * Ampoule.
                     */

                    this.r(
                        ctx,
                        29,
                        24,
                        6,
                        5,
                        p.light0
                    );
                }
            );
        }



        /* =========================================================
           CUISINE
        ========================================================= */

        drawKitchenCounter(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        3,
                        53,
                        58,
                        7,
                        0.34
                    );


                    /*
                     * Silhouette.
                     */

                    this.r(
                        ctx,
                        2,
                        10,
                        60,
                        48,
                        p.ink0
                    );


                    /*
                     * Meuble bas.
                     */

                    this.r(
                        ctx,
                        5,
                        21,
                        54,
                        34,
                        p.darkWood2
                    );


                    /*
                     * Portes.
                     */

                    this.r(
                        ctx,
                        8,
                        25,
                        20,
                        25,
                        p.darkWood1
                    );

                    this.r(
                        ctx,
                        36,
                        25,
                        20,
                        25,
                        p.darkWood1
                    );


                    /*
                     * Relief.
                     */

                    this.r(
                        ctx,
                        10,
                        27,
                        16,
                        3,
                        "#a26a50"
                    );

                    this.r(
                        ctx,
                        38,
                        27,
                        16,
                        3,
                        "#a26a50"
                    );


                    /*
                     * Poignées.
                     */

                    this.r(
                        ctx,
                        23,
                        37,
                        3,
                        5,
                        p.light2
                    );

                    this.r(
                        ctx,
                        38,
                        37,
                        3,
                        5,
                        p.light2
                    );


                    /*
                     * Plateau contour.
                     */

                    this.r(
                        ctx,
                        1,
                        8,
                        62,
                        17,
                        p.ink0
                    );


                    /*
                     * Plateau pierre.
                     */

                    this.r(
                        ctx,
                        3,
                        9,
                        58,
                        13,
                        p.tile1
                    );


                    this.r(
                        ctx,
                        5,
                        10,
                        54,
                        4,
                        p.tile0
                    );


                    /*
                     * Grain.
                     */

                    for (
                        let i = 0;
                        i < 12;
                        i += 1
                    ) {

                        const px =
                            7 +
                            Math.floor(
                                this.hash(
                                    i,
                                    4,
                                    1
                                ) *
                                48
                            );


                        const py =
                            14 +
                            Math.floor(
                                this.hash(
                                    i,
                                    7,
                                    2
                                ) *
                                6
                            );


                        this.r(
                            ctx,
                            px,
                            py,
                            2,
                            1,
                            p.tile2
                        );
                    }
                }
            );
        }


        drawSink(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.drawKitchenCounter(
                ctx,
                x,
                y,
                size
            );


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    /*
                     * Bassin contour.
                     */

                    this.r(
                        ctx,
                        18,
                        10,
                        28,
                        17,
                        p.metal3
                    );


                    /*
                     * Bassin.
                     */

                    this.r(
                        ctx,
                        21,
                        12,
                        22,
                        12,
                        this.glassSteel()
                    );


                    this.r(
                        ctx,
                        23,
                        13,
                        18,
                        5,
                        "#b6e3e7"
                    );


                    /*
                     * Bonde.
                     */

                    this.r(
                        ctx,
                        31,
                        20,
                        4,
                        3,
                        p.metal3
                    );


                    /*
                     * Robinet.
                     */

                    this.r(
                        ctx,
                        31,
                        2,
                        4,
                        11,
                        p.metal2
                    );


                    this.r(
                        ctx,
                        34,
                        2,
                        12,
                        4,
                        p.metal2
                    );


                    this.r(
                        ctx,
                        43,
                        5,
                        4,
                        7,
                        p.metal2
                    );


                    this.r(
                        ctx,
                        34,
                        3,
                        8,
                        1,
                        p.metal0
                    );
                }
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


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        13,
                        57,
                        40,
                        5,
                        0.34
                    );


                    /*
                     * Contour.
                     */

                    this.r(
                        ctx,
                        12,
                        3,
                        40,
                        57,
                        p.ink0
                    );


                    /*
                     * Coque.
                     */

                    this.r(
                        ctx,
                        15,
                        5,
                        34,
                        52,
                        p.robotWhite3
                    );


                    /*
                     * Porte haute.
                     */

                    this.r(
                        ctx,
                        17,
                        7,
                        30,
                        23,
                        p.robotWhite1
                    );


                    /*
                     * Porte basse.
                     */

                    this.r(
                        ctx,
                        17,
                        33,
                        30,
                        21,
                        p.robotWhite2
                    );


                    /*
                     * Highlights.
                     */

                    this.r(
                        ctx,
                        19,
                        8,
                        26,
                        3,
                        "#ffffff"
                    );


                    this.r(
                        ctx,
                        19,
                        34,
                        26,
                        2,
                        "#e9e9e6"
                    );


                    /*
                     * Séparation.
                     */

                    this.r(
                        ctx,
                        15,
                        30,
                        34,
                        3,
                        p.metal2
                    );


                    /*
                     * Poignées.
                     */

                    this.r(
                        ctx,
                        41,
                        13,
                        3,
                        11,
                        p.metal3
                    );


                    this.r(
                        ctx,
                        41,
                        38,
                        3,
                        10,
                        p.metal3
                    );


                    /*
                     * Magnets.
                     */

                    this.r(
                        ctx,
                        22,
                        15,
                        4,
                        4,
                        p.red1
                    );

                    this.r(
                        ctx,
                        28,
                        12,
                        3,
                        3,
                        p.blue1
                    );

                    this.r(
                        ctx,
                        24,
                        21,
                        5,
                        3,
                        p.yellow1
                    );
                }
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


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        8,
                        56,
                        48,
                        5,
                        0.33
                    );


                    this.r(
                        ctx,
                        8,
                        5,
                        48,
                        54,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        11,
                        8,
                        42,
                        48,
                        p.metal2
                    );


                    /*
                     * Plaque supérieure.
                     */

                    this.r(
                        ctx,
                        12,
                        9,
                        40,
                        15,
                        p.metal1
                    );


                    const burners = [

                        [
                            18,
                            14
                        ],

                        [
                            31,
                            14
                        ],

                        [
                            44,
                            14
                        ]
                    ];


                    burners.forEach(
                        burner => {

                            this.r(
                                ctx,
                                burner[0] - 4,
                                burner[1] - 3,
                                8,
                                6,
                                p.robotBlack0
                            );


                            this.r(
                                ctx,
                                burner[0] - 2,
                                burner[1] - 1,
                                4,
                                2,
                                p.metal3
                            );
                        }
                    );


                    /*
                     * Commandes.
                     */

                    this.r(
                        ctx,
                        12,
                        25,
                        40,
                        8,
                        p.metal3
                    );


                    for (
                        let i = 0;
                        i < 4;
                        i += 1
                    ) {

                        this.r(
                            ctx,
                            17 +
                            i *
                            9,
                            27,
                            4,
                            4,
                            p.ink1
                        );
                    }


                    /*
                     * Porte four.
                     */

                    this.r(
                        ctx,
                        14,
                        35,
                        36,
                        17,
                        p.robotBlack0
                    );


                    this.r(
                        ctx,
                        17,
                        38,
                        30,
                        11,
                        "#263743"
                    );


                    this.r(
                        ctx,
                        19,
                        39,
                        26,
                        3,
                        "#456575"
                    );
                }
            );
        }



        /* =========================================================
           GARAGE
        ========================================================= */

        drawCar(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    /*
                     * Grande ombre.
                     */

                    this.shadowRect(
                        ctx,
                        10,
                        58,
                        44,
                        5,
                        0.42
                    );


                    /*
                     * Pneus.
                     */

                    [
                        [
                            8,
                            15
                        ],

                        [
                            49,
                            15
                        ],

                        [
                            8,
                            42
                        ],

                        [
                            49,
                            42
                        ]
                    ].forEach(
                        wheel => {

                            this.r(
                                ctx,
                                wheel[0],
                                wheel[1],
                                8,
                                12,
                                p.ink0
                            );


                            this.r(
                                ctx,
                                wheel[0] + 2,
                                wheel[1] + 2,
                                4,
                                8,
                                p.metal3
                            );
                        }
                    );


                    /*
                     * Silhouette voiture.
                     */

                    this.r(
                        ctx,
                        13,
                        3,
                        38,
                        58,
                        p.ink0
                    );


                    /*
                     * Carrosserie sombre.
                     */

                    this.r(
                        ctx,
                        16,
                        5,
                        32,
                        54,
                        p.purple4
                    );


                    /*
                     * Capot.
                     */

                    this.r(
                        ctx,
                        18,
                        7,
                        28,
                        15,
                        p.purple3
                    );


                    this.r(
                        ctx,
                        21,
                        8,
                        22,
                        4,
                        p.purple1
                    );


                    /*
                     * Pare-brise.
                     */

                    this.r(
                        ctx,
                        20,
                        23,
                        24,
                        12,
                        "#24334b"
                    );


                    this.r(
                        ctx,
                        22,
                        24,
                        20,
                        5,
                        "#5aa3bc"
                    );


                    this.r(
                        ctx,
                        24,
                        25,
                        10,
                        2,
                        p.cyan1
                    );


                    /*
                     * Toit.
                     */

                    this.r(
                        ctx,
                        20,
                        36,
                        24,
                        14,
                        p.purple2
                    );


                    this.r(
                        ctx,
                        23,
                        37,
                        18,
                        4,
                        "#c08bd7"
                    );


                    /*
                     * Coffre.
                     */

                    this.r(
                        ctx,
                        18,
                        51,
                        28,
                        6,
                        p.purple3
                    );


                    /*
                     * Phares.
                     */

                    this.r(
                        ctx,
                        18,
                        7,
                        7,
                        4,
                        p.light0
                    );

                    this.r(
                        ctx,
                        39,
                        7,
                        7,
                        4,
                        p.light0
                    );


                    /*
                     * Feux arrière.
                     */

                    this.r(
                        ctx,
                        18,
                        54,
                        7,
                        3,
                        p.red0
                    );

                    this.r(
                        ctx,
                        39,
                        54,
                        7,
                        3,
                        p.red0
                    );


                    /*
                     * Pare-chocs.
                     */

                    this.r(
                        ctx,
                        21,
                        58,
                        22,
                        2,
                        p.metal1
                    );
                }
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


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        9,
                        52,
                        46,
                        6,
                        0.30
                    );


                    /*
                     * Poignée.
                     */

                    this.r(
                        ctx,
                        22,
                        8,
                        20,
                        6,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        25,
                        4,
                        14,
                        6,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        27,
                        6,
                        10,
                        3,
                        p.metal2
                    );


                    /*
                     * Boîte.
                     */

                    this.r(
                        ctx,
                        8,
                        14,
                        48,
                        40,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        11,
                        17,
                        42,
                        34,
                        p.red2
                    );


                    /*
                     * Couvercle.
                     */

                    this.r(
                        ctx,
                        11,
                        17,
                        42,
                        10,
                        p.red1
                    );


                    this.r(
                        ctx,
                        13,
                        18,
                        38,
                        3,
                        p.red0
                    );


                    /*
                     * Tiroirs.
                     */

                    this.r(
                        ctx,
                        14,
                        31,
                        36,
                        7,
                        "#aa3f50"
                    );


                    this.r(
                        ctx,
                        14,
                        41,
                        36,
                        7,
                        "#aa3f50"
                    );


                    /*
                     * Fermoirs.
                     */

                    this.r(
                        ctx,
                        18,
                        24,
                        6,
                        7,
                        p.yellow1
                    );


                    this.r(
                        ctx,
                        40,
                        24,
                        6,
                        7,
                        p.yellow1
                    );
                }
            );
        }



        /* =========================================================
           CAVE
        ========================================================= */

        drawWineRack(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        5,
                        58,
                        54,
                        5,
                        0.36
                    );


                    /*
                     * Cadre.
                     */

                    this.r(
                        ctx,
                        5,
                        4,
                        54,
                        56,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        8,
                        7,
                        48,
                        50,
                        p.darkWood3
                    );


                    /*
                     * Cases.
                     */

                    for (
                        let row = 0;
                        row < 4;
                        row += 1
                    ) {

                        for (
                            let col = 0;
                            col < 4;
                            col += 1
                        ) {

                            const px =
                                11 +
                                col *
                                11;

                            const py =
                                10 +
                                row *
                                11;


                            this.r(
                                ctx,
                                px,
                                py,
                                9,
                                9,
                                p.darkWood1
                            );


                            /*
                             * Bouteille.
                             */

                            this.r(
                                ctx,
                                px + 2,
                                py + 3,
                                5,
                                4,
                                row %
                                2
                                    ? "#593854"
                                    : "#713344"
                            );


                            this.r(
                                ctx,
                                px + 3,
                                py + 3,
                                2,
                                1,
                                "#d3a7ad"
                            );
                        }
                    }


                    /*
                     * Cadre highlight.
                     */

                    this.r(
                        ctx,
                        9,
                        8,
                        4,
                        47,
                        "#8d5748"
                    );
                }
            );
        }


        drawBarrel(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        12,
                        55,
                        40,
                        6,
                        0.34
                    );


                    /*
                     * Silhouette.
                     */

                    this.r(
                        ctx,
                        13,
                        7,
                        38,
                        50,
                        p.ink0
                    );


                    /*
                     * Corps tonneau.
                     */

                    this.r(
                        ctx,
                        16,
                        9,
                        32,
                        46,
                        p.wood3
                    );


                    /*
                     * Centre bombé.
                     */

                    this.r(
                        ctx,
                        13,
                        18,
                        38,
                        28,
                        p.wood2
                    );


                    /*
                     * Planches.
                     */

                    [
                        21,
                        28,
                        35,
                        42
                    ].forEach(
                        px => {

                            this.r(
                                ctx,
                                px,
                                11,
                                2,
                                42,
                                p.wood1
                            );
                        }
                    );


                    /*
                     * Cerclages.
                     */

                    [
                        17,
                        31,
                        45
                    ].forEach(
                        py => {

                            this.r(
                                ctx,
                                13,
                                py,
                                38,
                                4,
                                p.metal3
                            );


                            this.r(
                                ctx,
                                15,
                                py,
                                34,
                                1,
                                p.metal1
                            );
                        }
                    );
                }
            );
        }



        /* =========================================================
           SALLE D'EAU
        ========================================================= */

        drawToilet(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        13,
                        55,
                        38,
                        5,
                        0.28
                    );


                    /*
                     * Réservoir.
                     */

                    this.r(
                        ctx,
                        18,
                        5,
                        28,
                        19,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        21,
                        7,
                        22,
                        15,
                        p.robotWhite2
                    );


                    this.r(
                        ctx,
                        23,
                        8,
                        18,
                        4,
                        p.robotWhite0
                    );


                    /*
                     * Bouton.
                     */

                    this.r(
                        ctx,
                        31,
                        9,
                        5,
                        3,
                        p.metal1
                    );


                    /*
                     * Cuvette silhouette.
                     */

                    this.r(
                        ctx,
                        14,
                        23,
                        36,
                        32,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        17,
                        25,
                        30,
                        27,
                        p.robotWhite1
                    );


                    /*
                     * Eau.
                     */

                    this.r(
                        ctx,
                        21,
                        29,
                        22,
                        15,
                        p.water3
                    );


                    this.r(
                        ctx,
                        24,
                        31,
                        16,
                        8,
                        p.water1
                    );


                    /*
                     * Bord blanc.
                     */

                    this.r(
                        ctx,
                        19,
                        25,
                        26,
                        5,
                        p.robotWhite0
                    );


                    /*
                     * Pied.
                     */

                    this.r(
                        ctx,
                        24,
                        50,
                        16,
                        8,
                        p.robotWhite2
                    );
                }
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


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        8,
                        50,
                        48,
                        6,
                        0.28
                    );


                    /*
                     * Meuble.
                     */

                    this.r(
                        ctx,
                        12,
                        31,
                        40,
                        25,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        15,
                        34,
                        34,
                        20,
                        p.wood3
                    );


                    this.r(
                        ctx,
                        17,
                        36,
                        14,
                        15,
                        p.wood2
                    );


                    this.r(
                        ctx,
                        34,
                        36,
                        13,
                        15,
                        p.wood2
                    );


                    /*
                     * Lavabo contour.
                     */

                    this.r(
                        ctx,
                        8,
                        16,
                        48,
                        21,
                        p.ink0
                    );


                    /*
                     * Porcelaine.
                     */

                    this.r(
                        ctx,
                        11,
                        18,
                        42,
                        16,
                        p.robotWhite1
                    );


                    this.r(
                        ctx,
                        15,
                        20,
                        34,
                        11,
                        p.water3
                    );


                    this.r(
                        ctx,
                        19,
                        21,
                        26,
                        6,
                        p.water1
                    );


                    /*
                     * Robinet.
                     */

                    this.r(
                        ctx,
                        30,
                        5,
                        5,
                        15,
                        p.metal2
                    );


                    this.r(
                        ctx,
                        34,
                        6,
                        15,
                        5,
                        p.metal2
                    );


                    this.r(
                        ctx,
                        45,
                        10,
                        4,
                        9,
                        p.metal2
                    );


                    this.r(
                        ctx,
                        34,
                        7,
                        10,
                        2,
                        p.metal0
                    );
                }
            );
        }



        /* =========================================================
           NATURE
        ========================================================= */

        drawTree(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    /*
                     * Ombre large.
                     */

                    this.shadowRect(
                        ctx,
                        8,
                        52,
                        50,
                        8,
                        0.33
                    );


                    /*
                     * Tronc.
                     */

                    this.r(
                        ctx,
                        28,
                        36,
                        10,
                        25,
                        p.darkWood3
                    );


                    this.r(
                        ctx,
                        31,
                        37,
                        5,
                        22,
                        p.wood2
                    );


                    this.r(
                        ctx,
                        32,
                        38,
                        2,
                        14,
                        p.wood0
                    );


                    /*
                     * Gros feuillage sombre.
                     */

                    this.r(
                        ctx,
                        9,
                        11,
                        46,
                        34,
                        p.leaf4
                    );


                    this.r(
                        ctx,
                        5,
                        20,
                        54,
                        22,
                        p.leaf4
                    );


                    /*
                     * Clusters.
                     */

                    const clusters = [

                        [
                            7,
                            17,
                            p.leaf2
                        ],

                        [
                            16,
                            8,
                            p.leaf1
                        ],

                        [
                            27,
                            5,
                            p.leaf0
                        ],

                        [
                            39,
                            9,
                            p.leaf1
                        ],

                        [
                            47,
                            17,
                            p.leaf2
                        ],

                        [
                            5,
                            27,
                            p.leaf3
                        ],

                        [
                            18,
                            24,
                            p.leaf1
                        ],

                        [
                            31,
                            20,
                            p.leaf0
                        ],

                        [
                            43,
                            27,
                            p.leaf3
                        ],

                        [
                            15,
                            34,
                            p.leaf2
                        ],

                        [
                            34,
                            34,
                            p.leaf2
                        ]
                    ];


                    clusters.forEach(
                        cluster => {

                            this.drawTreeCluster(
                                ctx,
                                cluster[0],
                                cluster[1],
                                cluster[2]
                            );
                        }
                    );


                    /*
                     * Petites fleurs/lumières.
                     */

                    const accents = [

                        [
                            15,
                            16,
                            p.flowerPurple
                        ],

                        [
                            44,
                            18,
                            p.flowerPink
                        ],

                        [
                            24,
                            29,
                            p.flowerBlue
                        ],

                        [
                            37,
                            10,
                            p.flowerYellow
                        ]
                    ];


                    accents.forEach(
                        accent => {

                            this.r(
                                ctx,
                                accent[0],
                                accent[1],
                                3,
                                3,
                                accent[2]
                            );


                            this.r(
                                ctx,
                                accent[0] + 1,
                                accent[1],
                                1,
                                1,
                                p.light0
                            );
                        }
                    );
                }
            );
        }


        drawTreeCluster(
            ctx,
            x,
            y,
            color
        ) {

            this.r(
                ctx,
                x + 5,
                y,
                10,
                4,
                color
            );


            this.r(
                ctx,
                x + 2,
                y + 4,
                16,
                8,
                color
            );


            this.r(
                ctx,
                x,
                y + 7,
                20,
                6,
                color
            );


            this.r(
                ctx,
                x + 5,
                y + 13,
                10,
                4,
                color
            );


            this.r(
                ctx,
                x + 7,
                y + 2,
                7,
                2,
                "rgba(255,255,255,0.13)"
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


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        6,
                        49,
                        52,
                        6,
                        0.25
                    );


                    /*
                     * Masse basse.
                     */

                    this.r(
                        ctx,
                        5,
                        26,
                        54,
                        24,
                        p.leaf4
                    );


                    this.drawTreeCluster(
                        ctx,
                        3,
                        18,
                        p.leaf2
                    );

                    this.drawTreeCluster(
                        ctx,
                        17,
                        10,
                        p.leaf1
                    );

                    this.drawTreeCluster(
                        ctx,
                        34,
                        15,
                        p.leaf2
                    );


                    this.r(
                        ctx,
                        14,
                        25,
                        3,
                        3,
                        p.flowerPink
                    );

                    this.r(
                        ctx,
                        41,
                        24,
                        3,
                        3,
                        p.flowerPurple
                    );

                    this.r(
                        ctx,
                        29,
                        18,
                        2,
                        2,
                        p.flowerWhite
                    );
                }
            );
        }


        drawFlowers(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    const flowers = [

                        [
                            10,
                            13,
                            p.flowerPink
                        ],

                        [
                            22,
                            8,
                            p.flowerPurple
                        ],

                        [
                            38,
                            11,
                            p.flowerYellow
                        ],

                        [
                            52,
                            16,
                            p.flowerWhite
                        ],

                        [
                            15,
                            33,
                            p.flowerBlue
                        ],

                        [
                            31,
                            29,
                            p.flowerPink
                        ],

                        [
                            48,
                            34,
                            p.flowerPurple
                        ],

                        [
                            8,
                            50,
                            p.flowerWhite
                        ],

                        [
                            25,
                            49,
                            p.flowerYellow
                        ],

                        [
                            43,
                            51,
                            p.flowerBlue
                        ]
                    ];


                    flowers.forEach(
                        flower => {

                            const [
                                fx,
                                fy,
                                color
                            ] =
                                flower;


                            this.r(
                                ctx,
                                fx,
                                fy + 4,
                                2,
                                9,
                                p.leaf3
                            );


                            this.r(
                                ctx,
                                fx - 3,
                                fy,
                                8,
                                8,
                                color
                            );


                            this.r(
                                ctx,
                                fx,
                                fy - 3,
                                2,
                                14,
                                color
                            );


                            this.r(
                                ctx,
                                fx,
                                fy + 2,
                                2,
                                2,
                                p.light0
                            );


                            this.r(
                                ctx,
                                fx - 2,
                                fy + 9,
                                4,
                                2,
                                p.leaf1
                            );
                        }
                    );
                }
            );
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


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    /*
                     * Ombre.
                     */

                    this.shadowRect(
                        ctx,
                        4,
                        54,
                        56,
                        6,
                        0.24
                    );


                    /*
                     * Bord extérieur.
                     */

                    this.r(
                        ctx,
                        1,
                        4,
                        62,
                        54,
                        p.ink0
                    );


                    /*
                     * Dalles.
                     */

                    this.r(
                        ctx,
                        3,
                        6,
                        58,
                        50,
                        p.tile1
                    );


                    /*
                     * Eau sombre.
                     */

                    this.r(
                        ctx,
                        8,
                        11,
                        48,
                        40,
                        p.water4
                    );


                    /*
                     * Eau.
                     */

                    this.r(
                        ctx,
                        10,
                        13,
                        44,
                        36,
                        p.water2
                    );


                    /*
                     * Zone claire.
                     */

                    this.r(
                        ctx,
                        12,
                        15,
                        40,
                        14,
                        p.water1
                    );


                    /*
                     * Profondeur.
                     */

                    this.r(
                        ctx,
                        10,
                        40,
                        44,
                        9,
                        p.water3
                    );


                    /*
                     * Animation reflets.
                     */

                    const phase =
                        options.animate
                            ? Math.floor(
                                performance.now() /
                                170
                            ) %
                                6
                            : 0;


                    const reflections = [

                        [
                            14 +
                            phase,
                            18,
                            15
                        ],

                        [
                            34 -
                            phase,
                            23,
                            13
                        ],

                        [
                            18 +
                            phase,
                            31,
                            19
                        ],

                        [
                            38 -
                            phase,
                            37,
                            10
                        ],

                        [
                            12 +
                            phase,
                            44,
                            12
                        ]
                    ];


                    reflections.forEach(
                        reflection => {

                            this.r(
                                ctx,
                                reflection[0],
                                reflection[1],
                                reflection[2],
                                2,
                                p.cyan0
                            );


                            this.r(
                                ctx,
                                reflection[0] + 3,
                                reflection[1] + 2,
                                Math.max(
                                    4,
                                    reflection[2] - 6
                                ),
                                1,
                                p.cyan1
                            );
                        }
                    );


                    /*
                     * Joint bord piscine.
                     */

                    this.r(
                        ctx,
                        5,
                        8,
                        2,
                        45,
                        p.tile2
                    );

                    this.r(
                        ctx,
                        57,
                        8,
                        2,
                        45,
                        p.tile2
                    );


                    /*
                     * Échelle.
                     */

                    this.r(
                        ctx,
                        48,
                        8,
                        3,
                        12,
                        p.metal1
                    );

                    this.r(
                        ctx,
                        54,
                        8,
                        3,
                        12,
                        p.metal1
                    );


                    this.r(
                        ctx,
                        48,
                        12,
                        9,
                        2,
                        p.metal0
                    );


                    this.r(
                        ctx,
                        48,
                        17,
                        9,
                        2,
                        p.metal0
                    );
                }
            );
        }


        drawSunbed(
            ctx,
            x,
            y,
            size
        ) {

            const p =
                this.palette;


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        11,
                        55,
                        42,
                        5,
                        0.25
                    );


                    /*
                     * Structure.
                     */

                    this.r(
                        ctx,
                        14,
                        5,
                        36,
                        54,
                        p.ink0
                    );


                    /*
                     * Cadre.
                     */

                    this.r(
                        ctx,
                        17,
                        7,
                        30,
                        49,
                        p.robotWhite2
                    );


                    /*
                     * Dossier.
                     */

                    this.r(
                        ctx,
                        19,
                        9,
                        26,
                        18,
                        p.purple3
                    );


                    this.r(
                        ctx,
                        21,
                        11,
                        22,
                        4,
                        p.purple1
                    );


                    /*
                     * Assise.
                     */

                    this.r(
                        ctx,
                        19,
                        29,
                        26,
                        25,
                        p.purple2
                    );


                    this.r(
                        ctx,
                        21,
                        31,
                        22,
                        4,
                        p.purple0
                    );


                    /*
                     * Pieds.
                     */

                    this.r(
                        ctx,
                        11,
                        54,
                        8,
                        5,
                        p.metal3
                    );

                    this.r(
                        ctx,
                        45,
                        54,
                        8,
                        5,
                        p.metal3
                    );
                }
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


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    /*
                     * Anneau sombre.
                     */

                    this.r(
                        ctx,
                        12,
                        18,
                        40,
                        28,
                        p.red2
                    );


                    this.r(
                        ctx,
                        7,
                        24,
                        50,
                        16,
                        p.red1
                    );


                    /*
                     * Trou.
                     */

                    this.r(
                        ctx,
                        22,
                        23,
                        20,
                        20,
                        p.water2
                    );


                    this.r(
                        ctx,
                        26,
                        27,
                        12,
                        12,
                        p.water1
                    );


                    /*
                     * Highlights.
                     */

                    this.r(
                        ctx,
                        10,
                        24,
                        13,
                        5,
                        p.pink0
                    );


                    this.r(
                        ctx,
                        43,
                        35,
                        8,
                        3,
                        p.pink1
                    );
                }
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


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        5,
                        51,
                        54,
                        6,
                        0.30
                    );


                    /*
                     * Dossier.
                     */

                    this.r(
                        ctx,
                        5,
                        12,
                        54,
                        15,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        8,
                        14,
                        48,
                        10,
                        p.wood2
                    );


                    this.r(
                        ctx,
                        10,
                        15,
                        44,
                        3,
                        p.wood0
                    );


                    /*
                     * Assise.
                     */

                    this.r(
                        ctx,
                        5,
                        31,
                        54,
                        13,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        8,
                        33,
                        48,
                        8,
                        p.wood3
                    );


                    this.r(
                        ctx,
                        10,
                        34,
                        44,
                        2,
                        p.wood1
                    );


                    /*
                     * Pieds.
                     */

                    this.r(
                        ctx,
                        12,
                        42,
                        7,
                        15,
                        p.metal3
                    );


                    this.r(
                        ctx,
                        45,
                        42,
                        7,
                        15,
                        p.metal3
                    );
                }
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


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        5,
                        55,
                        54,
                        6,
                        0.28
                    );


                    /*
                     * Bassin contour.
                     */

                    this.r(
                        ctx,
                        5,
                        38,
                        54,
                        20,
                        p.ink0
                    );


                    /*
                     * Pierre.
                     */

                    this.r(
                        ctx,
                        8,
                        40,
                        48,
                        16,
                        p.stone1
                    );


                    /*
                     * Eau.
                     */

                    this.r(
                        ctx,
                        13,
                        43,
                        38,
                        9,
                        p.water2
                    );


                    this.r(
                        ctx,
                        17,
                        44,
                        30,
                        3,
                        p.water0
                    );


                    /*
                     * Colonne.
                     */

                    this.r(
                        ctx,
                        27,
                        14,
                        10,
                        31,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        30,
                        16,
                        4,
                        27,
                        p.stone0
                    );


                    /*
                     * Coupe haute.
                     */

                    this.r(
                        ctx,
                        21,
                        13,
                        22,
                        9,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        24,
                        14,
                        16,
                        6,
                        p.stone1
                    );


                    /*
                     * Jet d'eau.
                     */

                    this.r(
                        ctx,
                        31,
                        4,
                        3,
                        12,
                        p.water0
                    );


                    this.r(
                        ctx,
                        20,
                        18,
                        3,
                        19,
                        p.water1
                    );


                    this.r(
                        ctx,
                        42,
                        18,
                        3,
                        19,
                        p.water1
                    );
                }
            );
        }



        /* =========================================================
           PETITS OBJETS
        ========================================================= */

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
                p.blue1;


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        14,
                        48,
                        38,
                        4,
                        0.25
                    );


                    this.r(
                        ctx,
                        13,
                        12,
                        39,
                        38,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        16,
                        10,
                        35,
                        37,
                        bookColor
                    );


                    /*
                     * Dos.
                     */

                    this.r(
                        ctx,
                        18,
                        12,
                        5,
                        32,
                        "rgba(0,0,0,0.25)"
                    );


                    /*
                     * Highlight.
                     */

                    this.r(
                        ctx,
                        24,
                        13,
                        24,
                        4,
                        "rgba(255,255,255,0.26)"
                    );


                    /*
                     * Titre.
                     */

                    this.r(
                        ctx,
                        27,
                        24,
                        17,
                        3,
                        p.cream0
                    );


                    this.r(
                        ctx,
                        27,
                        31,
                        12,
                        2,
                        p.cream0
                    );
                }
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


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        10,
                        53,
                        44,
                        5,
                        0.28
                    );


                    this.r(
                        ctx,
                        10,
                        12,
                        44,
                        43,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        13,
                        15,
                        38,
                        37,
                        p.wood2
                    );


                    /*
                     * Bord haut.
                     */

                    this.r(
                        ctx,
                        13,
                        15,
                        38,
                        7,
                        p.wood1
                    );


                    /*
                     * Croix renfort.
                     */

                    this.r(
                        ctx,
                        28,
                        15,
                        7,
                        37,
                        p.wood0
                    );


                    this.r(
                        ctx,
                        13,
                        31,
                        38,
                        6,
                        p.wood3
                    );


                    /*
                     * Clous.
                     */

                    [
                        [
                            17,
                            19
                        ],

                        [
                            46,
                            19
                        ],

                        [
                            17,
                            47
                        ],

                        [
                            46,
                            47
                        ]
                    ].forEach(
                        nail => {

                            this.r(
                                ctx,
                                nail[0],
                                nail[1],
                                3,
                                3,
                                p.metal3
                            );
                        }
                    );
                }
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


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        12,
                        45,
                        42,
                        4,
                        0.20
                    );


                    /*
                     * Anneau.
                     */

                    this.r(
                        ctx,
                        11,
                        16,
                        24,
                        24,
                        p.eye3
                    );


                    this.r(
                        ctx,
                        15,
                        20,
                        16,
                        16,
                        p.light1
                    );


                    this.r(
                        ctx,
                        20,
                        25,
                        7,
                        7,
                        p.ink2
                    );


                    /*
                     * Tige.
                     */

                    this.r(
                        ctx,
                        31,
                        25,
                        25,
                        8,
                        p.yellow1
                    );


                    this.r(
                        ctx,
                        34,
                        26,
                        19,
                        3,
                        p.light0
                    );


                    /*
                     * Dents.
                     */

                    this.r(
                        ctx,
                        45,
                        31,
                        6,
                        9,
                        p.yellow1
                    );


                    this.r(
                        ctx,
                        52,
                        31,
                        4,
                        6,
                        p.yellow1
                    );
                }
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


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        18,
                        49,
                        30,
                        4,
                        0.20
                    );


                    this.r(
                        ctx,
                        19,
                        23,
                        27,
                        27,
                        p.red2
                    );


                    this.r(
                        ctx,
                        15,
                        28,
                        35,
                        17,
                        p.red1
                    );


                    this.r(
                        ctx,
                        21,
                        22,
                        18,
                        8,
                        p.red0
                    );


                    /*
                     * Reflet.
                     */

                    this.r(
                        ctx,
                        22,
                        27,
                        6,
                        5,
                        "#ffb2a6"
                    );


                    /*
                     * Tige.
                     */

                    this.r(
                        ctx,
                        31,
                        12,
                        4,
                        12,
                        p.darkWood3
                    );


                    /*
                     * Feuille.
                     */

                    this.r(
                        ctx,
                        35,
                        14,
                        15,
                        8,
                        p.leaf2
                    );


                    this.r(
                        ctx,
                        39,
                        13,
                        8,
                        4,
                        p.leaf0
                    );
                }
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


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        13,
                        48,
                        39,
                        4,
                        0.20
                    );


                    /*
                     * Tasse contour.
                     */

                    this.r(
                        ctx,
                        14,
                        18,
                        34,
                        31,
                        p.ink0
                    );


                    /*
                     * Tasse.
                     */

                    this.r(
                        ctx,
                        17,
                        20,
                        28,
                        26,
                        p.robotWhite1
                    );


                    /*
                     * Café.
                     */

                    this.r(
                        ctx,
                        19,
                        21,
                        24,
                        6,
                        "#53382e"
                    );


                    this.r(
                        ctx,
                        21,
                        21,
                        20,
                        2,
                        "#82604c"
                    );


                    /*
                     * Anse.
                     */

                    this.r(
                        ctx,
                        45,
                        25,
                        13,
                        17,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        47,
                        28,
                        8,
                        11,
                        p.robotWhite1
                    );


                    this.r(
                        ctx,
                        49,
                        30,
                        4,
                        7,
                        p.ink2
                    );


                    /*
                     * Reflet.
                     */

                    this.r(
                        ctx,
                        20,
                        28,
                        4,
                        12,
                        "#ffffff"
                    );
                }
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


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        12,
                        45,
                        40,
                        4,
                        0.18
                    );


                    this.r(
                        ctx,
                        10,
                        19,
                        44,
                        28,
                        p.ink1
                    );


                    this.r(
                        ctx,
                        13,
                        21,
                        38,
                        24,
                        p.robotWhite2
                    );


                    this.r(
                        ctx,
                        18,
                        25,
                        28,
                        16,
                        p.robotWhite0
                    );


                    this.r(
                        ctx,
                        21,
                        27,
                        22,
                        4,
                        "#ffffff"
                    );
                }
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


            const bottle =
                color ||
                p.green2;


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        18,
                        54,
                        28,
                        4,
                        0.20
                    );


                    /*
                     * Col.
                     */

                    this.r(
                        ctx,
                        25,
                        5,
                        14,
                        17,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        28,
                        7,
                        8,
                        15,
                        bottle
                    );


                    /*
                     * Corps.
                     */

                    this.r(
                        ctx,
                        18,
                        19,
                        28,
                        37,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        21,
                        21,
                        22,
                        33,
                        bottle
                    );


                    /*
                     * Highlight verre.
                     */

                    this.r(
                        ctx,
                        23,
                        23,
                        4,
                        23,
                        "rgba(255,255,255,0.25)"
                    );


                    /*
                     * Étiquette.
                     */

                    this.r(
                        ctx,
                        22,
                        34,
                        20,
                        12,
                        p.cream1
                    );


                    this.r(
                        ctx,
                        26,
                        37,
                        12,
                        3,
                        p.red2
                    );
                }
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


            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.shadowRect(
                        ctx,
                        7,
                        51,
                        50,
                        5,
                        0.25
                    );


                    /*
                     * Corps contour.
                     */

                    this.r(
                        ctx,
                        12,
                        23,
                        34,
                        30,
                        p.ink0
                    );


                    /*
                     * Corps.
                     */

                    this.r(
                        ctx,
                        15,
                        25,
                        28,
                        26,
                        "#598a97"
                    );


                    this.r(
                        ctx,
                        17,
                        27,
                        24,
                        5,
                        "#7db7bf"
                    );


                    /*
                     * Bec.
                     */

                    this.poly(
                        ctx,
                        [
                            [
                                42,
                                29
                            ],
                            [
                                59,
                                15
                            ],
                            [
                                62,
                                20
                            ],
                            [
                                44,
                                38
                            ]
                        ],
                        p.ink0
                    );


                    this.poly(
                        ctx,
                        [
                            [
                                45,
                                29
                            ],
                            [
                                58,
                                18
                            ],
                            [
                                59,
                                20
                            ],
                            [
                                44,
                                35
                            ]
                        ],
                        "#598a97"
                    );


                    /*
                     * Poignée.
                     */

                    this.r(
                        ctx,
                        16,
                        13,
                        22,
                        4,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        12,
                        15,
                        5,
                        14,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        37,
                        15,
                        5,
                        13,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        18,
                        15,
                        18,
                        2,
                        "#7db7bf"
                    );
                }
            );
        }



        /* =========================================================
           PYT
        ========================================================= */

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


            const now =
                performance.now();


            const moving =
                Boolean(
                    options.bob
                );


            const bounce =
                moving
                    ? Math.sin(
                        now /
                        82
                    ) *
                    1.7
                    : 0;


            const legPhase =
                moving
                    ? Math.sin(
                        now /
                        85
                    )
                    : 0;


            this.withTile(
                ctx,
                x,
                y +
                    bounce *
                    size /
                    this.BASE,
                size,
                () => {

                    /*
                     * PASS 01
                     * ombre au sol
                     */

                    ctx.save();

                    ctx.globalAlpha =
                        0.28;


                    this.r(
                        ctx,
                        15,
                        56,
                        34,
                        5,
                        "#000000"
                    );


                    this.r(
                        ctx,
                        19,
                        54,
                        26,
                        8,
                        "#000000"
                    );

                    ctx.restore();


                    /*
                     * PASS 02
                     * jambes noires
                     */

                    const leftLeg =
                        moving &&
                        legPhase >
                        0
                            ? 2
                            : 0;


                    const rightLeg =
                        moving &&
                        legPhase <
                        0
                            ? 2
                            : 0;


                    this.r(
                        ctx,
                        20,
                        44 + leftLeg,
                        8,
                        13,
                        p.robotBlack0
                    );


                    this.r(
                        ctx,
                        36,
                        44 + rightLeg,
                        8,
                        13,
                        p.robotBlack0
                    );


                    /*
                     * PASS 03
                     * pieds silhouette
                     */

                    this.r(
                        ctx,
                        15,
                        54 + leftLeg,
                        16,
                        7,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        33,
                        54 + rightLeg,
                        16,
                        7,
                        p.ink0
                    );


                    /*
                     * PASS 04
                     * pieds blancs
                     */

                    this.r(
                        ctx,
                        17,
                        53 + leftLeg,
                        13,
                        6,
                        p.robotWhite1
                    );


                    this.r(
                        ctx,
                        34,
                        53 + rightLeg,
                        13,
                        6,
                        p.robotWhite1
                    );


                    /*
                     * PASS 05
                     * highlight pieds
                     */

                    this.r(
                        ctx,
                        19,
                        54 + leftLeg,
                        9,
                        2,
                        p.robotWhite0
                    );


                    this.r(
                        ctx,
                        36,
                        54 + rightLeg,
                        9,
                        2,
                        p.robotWhite0
                    );


                    /*
                     * PASS 06
                     * bras silhouette
                     */

                    this.r(
                        ctx,
                        8,
                        28,
                        11,
                        23,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        45,
                        28,
                        11,
                        23,
                        p.ink0
                    );


                    /*
                     * PASS 07
                     * bras mécanique
                     */

                    this.r(
                        ctx,
                        11,
                        30,
                        6,
                        17,
                        p.robotWhite2
                    );


                    this.r(
                        ctx,
                        47,
                        30,
                        6,
                        17,
                        p.robotWhite2
                    );


                    /*
                     * PASS 08
                     * articulations
                     */

                    this.r(
                        ctx,
                        12,
                        33,
                        4,
                        5,
                        p.robotBlack2
                    );


                    this.r(
                        ctx,
                        48,
                        33,
                        4,
                        5,
                        p.robotBlack2
                    );


                    /*
                     * PASS 09
                     * mains
                     */

                    this.r(
                        ctx,
                        9,
                        46,
                        9,
                        8,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        46,
                        46,
                        9,
                        8,
                        p.ink0
                    );


                    this.r(
                        ctx,
                        11,
                        47,
                        6,
                        5,
                        p.robotWhite1
                    );


                    this.r(
                        ctx,
                        47,
                        47,
                        6,
                        5,
                        p.robotWhite1
                    );


                    /*
                     * PASS 10
                     * corps silhouette
                     */

                    this.r(
                        ctx,
                        17,
                        26,
                        30,
                        25,
                        p.ink0
                    );


                    /*
                     * PASS 11
                     * corps blanc
                     */

                    this.r(
                        ctx,
                        20,
                        28,
                        24,
                        20,
                        p.robotWhite2
                    );


                    /*
                     * PASS 12
                     * torse principal
                     */

                    this.r(
                        ctx,
                        22,
                        29,
                        20,
                        16,
                        p.robotWhite1
                    );


                    /*
                     * PASS 13
                     * highlight torse
                     */

                    this.r(
                        ctx,
                        24,
                        30,
                        16,
                        4,
                        p.robotWhite0
                    );


                    /*
                     * PASS 14
                     * bas torse
                     */

                    this.r(
                        ctx,
                        22,
                        43,
                        20,
                        4,
                        p.robotWhite3
                    );


                    /*
                     * PASS 15
                     * panneau poitrine
                     */

                    this.r(
                        ctx,
                        27,
                        37,
                        10,
                        6,
                        p.robotBlack1
                    );


                    /*
                     * PASS 16
                     * petite lumière poitrine
                     */

                    this.r(
                        ctx,
                        30,
                        38,
                        4,
                        2,
                        p.eye2
                    );


                    this.r(
                        ctx,
                        31,
                        38,
                        2,
                        1,
                        p.eye0
                    );


                    /*
                     * PASS 17
                     * cou
                     */

                    this.r(
                        ctx,
                        27,
                        21,
                        10,
                        8,
                        p.robotBlack1
                    );


                    /*
                     * PASS 18
                     * tête contour
                     */

                    this.r(
                        ctx,
                        11,
                        6,
                        42,
                        22,
                        p.ink0
                    );


                    /*
                     * PASS 19
                     * casque blanc
                     */

                    this.r(
                        ctx,
                        14,
                        4,
                        36,
                        21,
                        p.robotWhite1
                    );


                    /*
                     * PASS 20
                     * dessus casque
                     */

                    this.r(
                        ctx,
                        17,
                        3,
                        30,
                        6,
                        p.robotWhite0
                    );


                    /*
                     * PASS 21
                     * écran visage
                     */

                    this.r(
                        ctx,
                        17,
                        9,
                        30,
                        13,
                        p.robotBlack0
                    );


                    /*
                     * PASS 22
                     * écran intérieur
                     */

                    this.r(
                        ctx,
                        19,
                        11,
                        26,
                        9,
                        "#1f252a"
                    );


                    /*
                     * PASS 23
                     * reflet écran
                     */

                    this.r(
                        ctx,
                        20,
                        11,
                        11,
                        2,
                        "#35414a"
                    );


                    /*
                     * PASS 24
                     * antenne
                     */

                    this.r(
                        ctx,
                        30,
                        0,
                        4,
                        6,
                        p.robotMetal1
                    );


                    /*
                     * PASS 25
                     * tête antenne
                     */

                    this.r(
                        ctx,
                        27,
                        0,
                        10,
                        4,
                        p.eye3
                    );


                    this.r(
                        ctx,
                        30,
                        0,
                        4,
                        2,
                        p.eye0
                    );


                    /*
                     * PASS 26
                     * yeux
                     */

                    if (
                        dir ===
                        "N"
                    ) {

                        this.r(
                            ctx,
                            23,
                            14,
                            18,
                            3,
                            p.robotBlack2
                        );

                    } else {

                        let shift =
                            0;


                        if (
                            dir ===
                            "E"
                        ) {

                            shift =
                                2;
                        }


                        if (
                            dir ===
                            "W"
                        ) {

                            shift =
                                -2;
                        }


                        this.drawPytEyePair(
                            ctx,
                            shift,
                            Boolean(
                                options.happy
                            )
                        );
                    }


                    /*
                     * PASS 27
                     * côtés casque
                     */

                    this.r(
                        ctx,
                        12,
                        12,
                        4,
                        10,
                        p.robotWhite3
                    );


                    this.r(
                        ctx,
                        48,
                        12,
                        4,
                        10,
                        p.robotWhite3
                    );


                    /*
                     * PASS 28
                     * highlight gauche
                     */

                    this.r(
                        ctx,
                        15,
                        6,
                        5,
                        14,
                        "rgba(255,255,255,0.33)"
                    );


                    /*
                     * PASS 29
                     * profondeur droite
                     */

                    this.r(
                        ctx,
                        46,
                        8,
                        3,
                        14,
                        "rgba(0,0,0,0.16)"
                    );


                    /*
                     * PASS 30
                     * micro pixel finition
                     */

                    this.r(
                        ctx,
                        20,
                        27,
                        5,
                        2,
                        "#ffffff"
                    );
                }
            );
        }


        drawPytEyePair(
            ctx,
            shift = 0,
            happy = false
        ) {

            const p =
                this.palette;


            if (
                happy
            ) {

                this.r(
                    ctx,
                    23 + shift,
                    15,
                    5,
                    2,
                    p.eye1
                );


                this.r(
                    ctx,
                    27 + shift,
                    16,
                    3,
                    2,
                    p.eye2
                );


                this.r(
                    ctx,
                    36 + shift,
                    15,
                    5,
                    2,
                    p.eye1
                );


                this.r(
                    ctx,
                    34 + shift,
                    16,
                    3,
                    2,
                    p.eye2
                );


                return;
            }


            /*
             * Œil gauche halo sombre.
             */

            this.r(
                ctx,
                22 + shift,
                13,
                8,
                7,
                p.eye3
            );


            /*
             * Œil gauche clair.
             */

            this.r(
                ctx,
                23 + shift,
                13,
                6,
                6,
                p.eye1
            );


            this.r(
                ctx,
                24 + shift,
                14,
                4,
                4,
                p.eye0
            );


            /*
             * Œil droit.
             */

            this.r(
                ctx,
                34 + shift,
                13,
                8,
                7,
                p.eye3
            );


            this.r(
                ctx,
                35 + shift,
                13,
                6,
                6,
                p.eye1
            );


            this.r(
                ctx,
                36 + shift,
                14,
                4,
                4,
                p.eye0
            );
        }



        /* =========================================================
           GRILLE GAMEPLAY
        ========================================================= */

        drawGridCell(
            ctx,
            x,
            y,
            size,
            options = {}
        ) {

            const alpha =
                options.alpha ??
                0.42;


            const lineWidth =
                Math.max(
                    1,
                    Math.round(
                        size *
                        0.024
                    )
                );


            ctx.save();

            ctx.globalAlpha =
                alpha;

            ctx.strokeStyle =
                options.color ||
                "#fff2cf";

            ctx.lineWidth =
                lineWidth;


            ctx.strokeRect(
                Math.round(x) + 0.5,
                Math.round(y) + 0.5,
                Math.round(size) - 1,
                Math.round(size) - 1
            );


            /*
             * Coins plus forts.
             */

            const corner =
                Math.max(
                    5,
                    size *
                    0.13
                );


            ctx.globalAlpha =
                Math.min(
                    1,
                    alpha *
                    1.75
                );


            ctx.beginPath();


            /*
             * HG
             */

            ctx.moveTo(
                x,
                y + corner
            );

            ctx.lineTo(
                x,
                y
            );

            ctx.lineTo(
                x + corner,
                y
            );


            /*
             * HD
             */

            ctx.moveTo(
                x + size - corner,
                y
            );

            ctx.lineTo(
                x + size,
                y
            );

            ctx.lineTo(
                x + size,
                y + corner
            );


            /*
             * BG
             */

            ctx.moveTo(
                x,
                y + size - corner
            );

            ctx.lineTo(
                x,
                y + size
            );

            ctx.lineTo(
                x + corner,
                y + size
            );


            /*
             * BD
             */

            ctx.moveTo(
                x + size - corner,
                y + size
            );

            ctx.lineTo(
                x + size,
                y + size
            );

            ctx.lineTo(
                x + size,
                y + size - corner
            );


            ctx.stroke();

            ctx.restore();
        }



        /* =========================================================
           OBJECTIFS
        ========================================================= */

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
                0.86;


            const margin =
                Math.max(
                    4,
                    size *
                    0.08
                );


            ctx.strokeStyle =
                p.light0;

            ctx.lineWidth =
                Math.max(
                    2,
                    size *
                    0.045
                );


            ctx.strokeRect(
                x + margin,
                y + margin,
                size - margin * 2,
                size - margin * 2
            );


            /*
             * Double contour.
             */

            ctx.globalAlpha =
                0.35;


            ctx.strokeStyle =
                p.light2;


            ctx.strokeRect(
                x + margin * 1.8,
                y + margin * 1.8,
                size - margin * 3.6,
                size - margin * 3.6
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
                0.80;

            ctx.strokeStyle =
                p.cyan0;

            ctx.lineWidth =
                Math.max(
                    2,
                    size *
                    0.04
                );


            ctx.setLineDash([
                size *
                    0.12,
                size *
                    0.07
            ]);


            ctx.strokeRect(
                x +
                    size *
                    0.09,
                y +
                    size *
                    0.09,
                size *
                    0.82,
                size *
                    0.82
            );


            ctx.restore();
        }


        drawBlocked(
            ctx,
            x,
            y,
            size
        ) {

            ctx.save();

            ctx.globalAlpha =
                0.20;


            ctx.fillStyle =
                "#3f1830";


            ctx.fillRect(
                x +
                    size *
                    0.07,
                y +
                    size *
                    0.07,
                size *
                    0.86,
                size *
                    0.86
            );


            ctx.strokeStyle =
                "#ff708d";

            ctx.lineWidth =
                Math.max(
                    2,
                    size *
                    0.025
                );


            for (
                let offset =
                    -size;

                offset <
                    size *
                    2;

                offset +=
                    size *
                    0.23
            ) {

                ctx.beginPath();

                ctx.moveTo(
                    x + offset,
                    y
                );

                ctx.lineTo(
                    x +
                        offset +
                        size,
                    y +
                        size
                );

                ctx.stroke();
            }


            ctx.restore();
        }



        /* =========================================================
           BADGES PIXELISÉS
        ========================================================= */

        drawPixelBadge(
            ctx,
            centerX,
            centerY,
            radius,
            text,
            options = {}
        ) {

            const p =
                this.palette;


            const locked =
                Boolean(
                    options.locked
                );


            const active =
                Boolean(
                    options.active
                );


            ctx.save();

            ctx.imageSmoothingEnabled =
                false;


            /*
             * Ombre.
             */

            ctx.globalAlpha =
                0.36;


            this.drawPixelOctagon(
                ctx,
                centerX + 4,
                centerY + 7,
                radius + 3,
                "#070710"
            );


            ctx.globalAlpha =
                1;


            /*
             * Bord noir.
             */

            this.drawPixelOctagon(
                ctx,
                centerX,
                centerY,
                radius + 5,
                p.ink0
            );


            /*
             * Bord extérieur.
             */

            this.drawPixelOctagon(
                ctx,
                centerX,
                centerY,
                radius + 2,
                locked
                    ? "#55545f"
                    : active
                        ? p.light2
                        : p.purple0
            );


            /*
             * Fond.
             */

            this.drawPixelOctagon(
                ctx,
                centerX,
                centerY,
                radius - 3,
                locked
                    ? "#42414c"
                    : active
                        ? p.purple3
                        : p.night1
            );


            /*
             * Fond interne.
             */

            this.drawPixelOctagon(
                ctx,
                centerX,
                centerY,
                radius - 9,
                locked
                    ? "#35343c"
                    : p.night0
            );


            /*
             * Highlight haut.
             */

            ctx.fillStyle =
                locked
                    ? "#676671"
                    : active
                        ? p.light0
                        : p.purple1;


            ctx.fillRect(
                Math.round(
                    centerX -
                    radius *
                    0.47
                ),
                Math.round(
                    centerY -
                    radius *
                    0.58
                ),
                Math.round(
                    radius *
                    0.94
                ),
                Math.max(
                    2,
                    Math.round(
                        radius *
                        0.07
                    )
                )
            );


            /*
             * Texte.
             */

            const scale =
                Math.max(
                    1,
                    Math.floor(
                        radius /
                        25
                    )
                );


            this.drawPixelText(
                ctx,
                text,
                centerX,
                centerY -
                    scale *
                    3.5,
                {
                    scale,
                    align:
                        "center",

                    color:
                        locked
                            ? "#a2a1aa"
                            : "#fff8df",

                    shadow:
                        "#080810"
                }
            );


            ctx.restore();
        }


        drawPixelOctagon(
            ctx,
            centerX,
            centerY,
            radius,
            color
        ) {

            const cut =
                radius *
                0.31;


            ctx.fillStyle =
                color;


            ctx.beginPath();

            ctx.moveTo(
                centerX -
                    radius +
                    cut,
                centerY -
                    radius
            );


            ctx.lineTo(
                centerX +
                    radius -
                    cut,
                centerY -
                    radius
            );


            ctx.lineTo(
                centerX +
                    radius,
                centerY -
                    radius +
                    cut
            );


            ctx.lineTo(
                centerX +
                    radius,
                centerY +
                    radius -
                    cut
            );


            ctx.lineTo(
                centerX +
                    radius -
                    cut,
                centerY +
                    radius
            );


            ctx.lineTo(
                centerX -
                    radius +
                    cut,
                centerY +
                    radius
            );


            ctx.lineTo(
                centerX -
                    radius,
                centerY +
                    radius -
                    cut
            );


            ctx.lineTo(
                centerX -
                    radius,
                centerY -
                    radius +
                    cut
            );


            ctx.closePath();

            ctx.fill();
        }



        /* =========================================================
           PIÈCE COMPLÈTE
        ========================================================= */

        drawRoomScene(
            ctx,
            room,
            x,
            y,
            width,
            height,
            options = {}
        ) {

            const normalized =
                this.normalize(
                    room
                );


            const theme =
                this.roomThemes[
                    normalized
                ] ||
                this.roomThemes.entree;


            ctx.save();

            ctx.imageSmoothingEnabled =
                false;


            /*
             * PASS 01
             * fond sous la pièce
             */

            ctx.fillStyle =
                this.palette.ink0;


            ctx.fillRect(
                x - 12,
                y - 12,
                width + 24,
                height + 24
            );


            /*
             * PASS 02
             * ombre extérieure
             */

            ctx.fillStyle =
                "rgba(0,0,0,0.30)";


            ctx.fillRect(
                x + 13,
                y + 14,
                width,
                height
            );


            /*
             * PASS 03-07
             * sol
             */

            this.drawRoomFloor(
                ctx,
                theme.floor,
                x,
                y,
                width,
                height
            );


            /*
             * PASS 08-14
             * mur autour
             */

            this.drawRoomWallsDetailed(
                ctx,
                x,
                y,
                width,
                height,
                normalized
            );


            /*
             * PASS 15
             * ambiance sombre périphérique
             */

            this.drawRoomAmbientOcclusion(
                ctx,
                x,
                y,
                width,
                height
            );


            /*
             * PASS 16-25
             * meubles
             */

            if (
                options.furniture !==
                false
            ) {

                this.drawRoomFurnitureDetailed(
                    ctx,
                    normalized,
                    x,
                    y,
                    width,
                    height
                );
            }


            /*
             * PASS 26
             * petits objets
             */

            this.drawRoomSmallProps(
                ctx,
                normalized,
                x,
                y,
                width,
                height
            );


            /*
             * PASS 27
             * éclairage
             */

            this.drawRoomLighting(
                ctx,
                normalized,
                x,
                y,
                width,
                height
            );


            /*
             * PASS 28
             * micro détail
             */

            this.drawRoomMicroDetails(
                ctx,
                normalized,
                x,
                y,
                width,
                height
            );


            /*
             * PASS 29
             * léger voile couleur
             */

            ctx.save();

            ctx.globalAlpha =
                0.045;


            ctx.fillStyle =
                theme.ambient;


            ctx.fillRect(
                x,
                y,
                width,
                height
            );

            ctx.restore();


            /*
             * PASS 30
             * bord final
             */

            ctx.strokeStyle =
                "rgba(5,5,12,0.75)";

            ctx.lineWidth =
                Math.max(
                    3,
                    Math.min(
                        width,
                        height
                    ) *
                    0.012
                );


            ctx.strokeRect(
                x,
                y,
                width,
                height
            );


            ctx.restore();
        }


        drawRoomFloor(
            ctx,
            floor,
            x,
            y,
            width,
            height
        ) {

            const tileSize =
                Math.max(
                    42,
                    Math.min(
                        78,
                        Math.floor(
                            Math.min(
                                width,
                                height
                            ) /
                            5
                        )
                    )
                );


            for (
                let py = y;
                py < y + height;
                py += tileSize
            ) {

                for (
                    let px = x;
                    px < x + width;
                    px += tileSize
                ) {

                    const drawWidth =
                        Math.min(
                            tileSize,
                            x +
                                width -
                                px
                        );


                    const drawHeight =
                        Math.min(
                            tileSize,
                            y +
                                height -
                                py
                        );


                    /*
                     * On garde des carrés pour la texture.
                     */

                    const drawSize =
                        Math.max(
                            drawWidth,
                            drawHeight
                        );


                    switch (floor) {

                        case "tile":

                            this.drawTileFloor(
                                ctx,
                                px,
                                py,
                                drawSize
                            );

                            break;


                        case "stone":

                            this.drawStoneFloor(
                                ctx,
                                px,
                                py,
                                drawSize
                            );

                            break;


                        case "concrete":

                            this.drawConcreteFloor(
                                ctx,
                                px,
                                py,
                                drawSize
                            );

                            break;


                        case "grass":

                            this.drawGrass(
                                ctx,
                                px,
                                py,
                                drawSize
                            );

                            break;


                        default:

                            this.drawWoodFloor(
                                ctx,
                                px,
                                py,
                                drawSize
                            );
                    }
                }
            }
        }


        drawRoomWallsDetailed(
            ctx,
            x,
            y,
            width,
            height,
            room
        ) {

            const p =
                this.palette;


            const wall =
                Math.max(
                    16,
                    Math.min(
                        36,
                        Math.min(
                            width,
                            height
                        ) *
                        0.075
                    )
                );


            /*
             * Ombre profonde intérieure.
             */

            ctx.fillStyle =
                "rgba(0,0,0,0.30)";


            ctx.fillRect(
                x + wall,
                y + wall,
                width -
                    wall *
                    2,
                8
            );


            ctx.fillRect(
                x + wall,
                y + wall,
                8,
                height -
                    wall *
                    2
            );


            /*
             * Mur silhouette.
             */

            ctx.fillStyle =
                p.ink0;


            ctx.fillRect(
                x,
                y,
                width,
                wall
            );


            ctx.fillRect(
                x,
                y,
                wall,
                height
            );


            ctx.fillRect(
                x +
                    width -
                    wall,
                y,
                wall,
                height
            );


            ctx.fillRect(
                x,
                y +
                    height -
                    wall,
                width,
                wall
            );


            /*
             * Façades.
             */

            ctx.fillStyle =
                p.wallFace2;


            ctx.fillRect(
                x + 4,
                y + wall * 0.42,
                width - 8,
                wall * 0.58
            );


            ctx.fillRect(
                x + 4,
                y + 4,
                wall * 0.55,
                height - 8
            );


            ctx.fillRect(
                x +
                    width -
                    wall *
                    0.55 -
                    4,
                y + 4,
                wall *
                    0.55,
                height - 8
            );


            ctx.fillRect(
                x + 4,
                y +
                    height -
                    wall,
                width - 8,
                wall -
                    4
            );


            /*
             * Dessus clair mur.
             */

            ctx.fillStyle =
                p.wallTop1;


            ctx.fillRect(
                x + 4,
                y + 4,
                width - 8,
                wall * 0.46
            );


            ctx.fillRect(
                x + 4,
                y + 4,
                wall * 0.4,
                height - 8
            );


            ctx.fillRect(
                x +
                    width -
                    wall *
                    0.4 -
                    4,
                y + 4,
                wall * 0.4,
                height - 8
            );


            /*
             * Highlights.
             */

            ctx.fillStyle =
                p.wallTop0;


            ctx.fillRect(
                x + 7,
                y + 5,
                width - 14,
                Math.max(
                    3,
                    wall *
                    0.12
                )
            );


            /*
             * Plinthes.
             */

            ctx.fillStyle =
                p.wallFace0;


            ctx.fillRect(
                x + wall,
                y + wall - 5,
                width -
                    wall *
                    2,
                5
            );


            /*
             * Fenêtres / portes décoratives.
             */

            const decorSize =
                Math.min(
                    wall *
                    2.4,
                    Math.min(
                        width,
                        height
                    ) *
                    0.18
                );


            if (
                width >
                270
            ) {

                this.drawWindow(
                    ctx,
                    x +
                        width *
                        0.16,
                    y +
                        wall *
                        0.05,
                    decorSize
                );


                this.drawWindow(
                    ctx,
                    x +
                        width *
                        0.68,
                    y +
                        wall *
                        0.05,
                    decorSize
                );
            }


            /*
             * Porte bas.
             */

            if (
                height >
                250
            ) {

                this.drawDoor(
                    ctx,
                    x +
                        width *
                        0.44,
                    y +
                        height -
                        decorSize *
                        0.84,
                    decorSize *
                        0.86
                );
            }
        }


        drawRoomAmbientOcclusion(
            ctx,
            x,
            y,
            width,
            height
        ) {

            const edge =
                Math.max(
                    12,
                    Math.min(
                        width,
                        height
                    ) *
                        0.04
                );


            const top =
                ctx.createLinearGradient(
                    0,
                    y,
                    0,
                    y +
                        edge *
                        2
                );


            top.addColorStop(
                0,
                "rgba(5,5,12,0.40)"
            );


            top.addColorStop(
                1,
                "rgba(5,5,12,0)"
            );


            ctx.fillStyle =
                top;


            ctx.fillRect(
                x,
                y,
                width,
                edge *
                    2
            );


            const left =
                ctx.createLinearGradient(
                    x,
                    0,
                    x +
                        edge *
                        2,
                    0
                );


            left.addColorStop(
                0,
                "rgba(5,5,12,0.32)"
            );


            left.addColorStop(
                1,
                "rgba(5,5,12,0)"
            );


            ctx.fillStyle =
                left;


            ctx.fillRect(
                x,
                y,
                edge *
                    2,
                height
            );
        }


        drawRoomFurnitureDetailed(
            ctx,
            room,
            x,
            y,
            width,
            height
        ) {

            const base =
                Math.min(
                    width,
                    height
                ) *
                0.19;


            const draw =
                (
                    type,
                    rx,
                    ry,
                    scale = 1
                ) => {

                    this.draw(
                        ctx,
                        type,
                        x +
                            width *
                            rx,
                        y +
                            height *
                            ry,
                        base *
                            scale
                    );
                };


            switch (room) {

                case "salon":

                    draw(
                        "canape",
                        0.11,
                        0.28,
                        1.55
                    );


                    draw(
                        "table",
                        0.42,
                        0.45,
                        0.95
                    );


                    draw(
                        "bibliotheque",
                        0.73,
                        0.12,
                        1.05
                    );


                    draw(
                        "television",
                        0.73,
                        0.46,
                        0.92
                    );


                    draw(
                        "plante",
                        0.08,
                        0.65,
                        0.78
                    );


                    draw(
                        "lampe",
                        0.60,
                        0.13,
                        0.68
                    );


                    draw(
                        "tapis",
                        0.34,
                        0.35,
                        1.45
                    );

                    break;


                case "chambre":

                    draw(
                        "lit",
                        0.34,
                        0.19,
                        1.72
                    );


                    draw(
                        "tapis",
                        0.37,
                        0.58,
                        1.38
                    );


                    draw(
                        "plante",
                        0.09,
                        0.62,
                        0.72
                    );


                    draw(
                        "lampe",
                        0.73,
                        0.14,
                        0.63
                    );


                    draw(
                        "table",
                        0.08,
                        0.17,
                        0.70
                    );

                    break;


                case "cuisine":

                    draw(
                        "frigo",
                        0.06,
                        0.16,
                        1.00
                    );


                    draw(
                        "evier",
                        0.27,
                        0.12,
                        1.18
                    );


                    draw(
                        "four",
                        0.65,
                        0.13,
                        0.95
                    );


                    draw(
                        "table",
                        0.33,
                        0.51,
                        1.45
                    );


                    draw(
                        "chaise",
                        0.21,
                        0.74,
                        0.60
                    );


                    draw(
                        "chaise",
                        0.44,
                        0.74,
                        0.60
                    );


                    draw(
                        "chaise",
                        0.67,
                        0.74,
                        0.60
                    );


                    draw(
                        "plante",
                        0.82,
                        0.61,
                        0.62
                    );

                    break;


                case "garage":

                    draw(
                        "voiture",
                        0.38,
                        0.22,
                        1.95
                    );


                    draw(
                        "boite_outils",
                        0.74,
                        0.16,
                        0.76
                    );


                    draw(
                        "caisse",
                        0.10,
                        0.58,
                        0.75
                    );


                    draw(
                        "caisse",
                        0.20,
                        0.66,
                        0.58
                    );


                    draw(
                        "lampe",
                        0.82,
                        0.58,
                        0.65
                    );

                    break;


                case "cave_a_vin":

                    draw(
                        "casier_vin",
                        0.07,
                        0.13,
                        1.15
                    );


                    draw(
                        "casier_vin",
                        0.67,
                        0.13,
                        1.15
                    );


                    draw(
                        "tonneau",
                        0.10,
                        0.61,
                        0.82
                    );


                    draw(
                        "tonneau",
                        0.72,
                        0.60,
                        0.82
                    );


                    draw(
                        "table",
                        0.39,
                        0.58,
                        0.88
                    );


                    draw(
                        "lampe",
                        0.48,
                        0.09,
                        0.58
                    );

                    break;


                case "balcon":

                    draw(
                        "table",
                        0.35,
                        0.40,
                        0.92
                    );


                    draw(
                        "chaise",
                        0.19,
                        0.50,
                        0.58
                    );


                    draw(
                        "chaise",
                        0.63,
                        0.50,
                        0.58
                    );


                    draw(
                        "plante",
                        0.05,
                        0.14,
                        0.68
                    );


                    draw(
                        "fleurs",
                        0.66,
                        0.13,
                        0.68
                    );


                    draw(
                        "lampe",
                        0.82,
                        0.12,
                        0.55
                    );

                    break;


                case "toilette":

                    draw(
                        "toilette",
                        0.13,
                        0.36,
                        0.88
                    );


                    draw(
                        "lavabo",
                        0.58,
                        0.16,
                        0.83
                    );


                    draw(
                        "plante",
                        0.68,
                        0.62,
                        0.58
                    );


                    draw(
                        "lampe",
                        0.45,
                        0.10,
                        0.48
                    );

                    break;


                case "entree":

                    draw(
                        "tapis",
                        0.36,
                        0.47,
                        1.25
                    );


                    draw(
                        "table",
                        0.68,
                        0.19,
                        0.75
                    );


                    draw(
                        "plante",
                        0.08,
                        0.17,
                        0.70
                    );


                    draw(
                        "lampe",
                        0.79,
                        0.15,
                        0.55
                    );


                    draw(
                        "caisse",
                        0.13,
                        0.65,
                        0.58
                    );

                    break;
            }
        }


        drawRoomSmallProps(
            ctx,
            room,
            x,
            y,
            width,
            height
        ) {

            const small =
                Math.min(
                    width,
                    height
                ) *
                0.07;


            switch (room) {

                case "cuisine":

                    this.drawApple(
                        ctx,
                        x +
                            width *
                            0.49,
                        y +
                            height *
                            0.53,
                        small
                    );


                    this.drawCup(
                        ctx,
                        x +
                            width *
                            0.56,
                        y +
                            height *
                            0.51,
                        small *
                            0.8
                    );


                    this.drawPlate(
                        ctx,
                        x +
                            width *
                            0.42,
                        y +
                            height *
                            0.53,
                        small *
                            0.8
                    );

                    break;


                case "salon":

                    this.drawBook(
                        ctx,
                        x +
                            width *
                            0.49,
                        y +
                            height *
                            0.48,
                        small *
                            0.85
                    );

                    break;


                case "chambre":

                    this.drawBook(
                        ctx,
                        x +
                            width *
                            0.14,
                        y +
                            height *
                            0.22,
                        small *
                            0.72,
                        this.palette.pink2
                    );

                    break;


                case "garage":

                    this.drawKey(
                        ctx,
                        x +
                            width *
                            0.80,
                        y +
                            height *
                            0.25,
                        small *
                            0.75
                    );

                    break;


                case "cave_a_vin":

                    this.drawBottle(
                        ctx,
                        x +
                            width *
                            0.52,
                        y +
                            height *
                            0.63,
                        small *
                            0.72,
                        "#734053"
                    );

                    break;
            }
        }


        drawRoomLighting(
            ctx,
            room,
            x,
            y,
            width,
            height
        ) {

            const lamps = [];


            switch (room) {

                case "salon":

                    lamps.push([
                        0.65,
                        0.22,
                        0.25
                    ]);

                    break;


                case "chambre":

                    lamps.push([
                        0.77,
                        0.23,
                        0.24
                    ]);

                    break;


                case "cave_a_vin":

                    lamps.push([
                        0.51,
                        0.18,
                        0.22
                    ]);

                    lamps.push([
                        0.14,
                        0.23,
                        0.16
                    ]);

                    break;


                case "garage":

                    lamps.push([
                        0.82,
                        0.66,
                        0.17
                    ]);

                    break;


                default:

                    lamps.push([
                        0.80,
                        0.22,
                        0.16
                    ]);
            }


            lamps.forEach(
                lamp => {

                    const gx =
                        x +
                        width *
                        lamp[0];

                    const gy =
                        y +
                        height *
                        lamp[1];

                    const radius =
                        Math.min(
                            width,
                            height
                        ) *
                        lamp[2];


                    const gradient =
                        ctx.createRadialGradient(
                            gx,
                            gy,
                            0,
                            gx,
                            gy,
                            radius
                        );


                    gradient.addColorStop(
                        0,
                        "rgba(255,218,120,0.20)"
                    );


                    gradient.addColorStop(
                        0.45,
                        "rgba(255,165,75,0.09)"
                    );


                    gradient.addColorStop(
                        1,
                        "rgba(255,150,50,0)"
                    );


                    ctx.fillStyle =
                        gradient;


                    ctx.fillRect(
                        gx - radius,
                        gy - radius,
                        radius * 2,
                        radius * 2
                    );
                }
            );
        }


        drawRoomMicroDetails(
            ctx,
            room,
            x,
            y,
            width,
            height
        ) {

            /*
             * Petits pixels / cadres / mini objets.
             */

            const p =
                this.palette;


            ctx.save();


            ctx.globalAlpha =
                0.70;


            /*
             * Cadres muraux.
             */

            if (
                room !==
                    "garage" &&
                room !==
                    "toilette"
            ) {

                const fx =
                    x +
                    width *
                    0.50;

                const fy =
                    y +
                    height *
                    0.10;


                ctx.fillStyle =
                    p.ink0;


                ctx.fillRect(
                    fx,
                    fy,
                    width *
                        0.08,
                    height *
                        0.07
                );


                ctx.fillStyle =
                    p.purple2;


                ctx.fillRect(
                    fx +
                        3,
                    fy +
                        3,
                    width *
                        0.08 -
                        6,
                    height *
                        0.07 -
                        6
                );
            }


            /*
             * Petites particules visuelles.
             */

            ctx.fillStyle =
                "rgba(255,255,255,0.08)";


            for (
                let i = 0;
                i < 20;
                i += 1
            ) {

                const px =
                    x +
                    width *
                    this.hash(
                        i,
                        17,
                        21
                    );


                const py =
                    y +
                    height *
                    this.hash(
                        i,
                        18,
                        25
                    );


                ctx.fillRect(
                    Math.round(px),
                    Math.round(py),
                    1,
                    1
                );
            }


            ctx.restore();
        }



        /* =========================================================
           GRANDE MAISON
        ========================================================= */

        drawHouseMap(
            ctx,
            x,
            y,
            width,
            height,
            options = {}
        ) {

            const p =
                this.palette;


            ctx.save();

            ctx.imageSmoothingEnabled =
                false;


            /*
             * =====================================================
             * PASSE 01
             * fond extérieur sombre
             * =====================================================
             */

            ctx.fillStyle =
                p.grass4;


            ctx.fillRect(
                x,
                y,
                width,
                height
            );


            /*
             * =====================================================
             * PASSE 02
             * herbe
             * =====================================================
             */

            const grassSize =
                Math.max(
                    50,
                    width /
                        20
                );


            for (
                let py = y;
                py < y + height;
                py += grassSize
            ) {

                for (
                    let px = x;
                    px < x + width;
                    px += grassSize
                ) {

                    this.drawGrass(
                        ctx,
                        px,
                        py,
                        grassSize
                    );
                }
            }


            /*
             * =====================================================
             * PASSE 03
             * bordures sombres
             * =====================================================
             */

            const border =
                Math.max(
                    12,
                    width *
                        0.012
                );


            ctx.fillStyle =
                p.ink0;


            ctx.fillRect(
                x,
                y,
                width,
                border
            );


            ctx.fillRect(
                x,
                y +
                    height -
                    border,
                width,
                border
            );


            ctx.fillRect(
                x,
                y,
                border,
                height
            );


            ctx.fillRect(
                x +
                    width -
                    border,
                y,
                border,
                height
            );


            /*
             * =====================================================
             * PASSE 04
             * haies périphériques
             * =====================================================
             */

            const hedgeSize =
                Math.max(
                    34,
                    width *
                        0.035
                );


            for (
                let hx =
                    x +
                    border;

                hx <
                    x +
                    width -
                    border;

                hx +=
                    hedgeSize *
                    0.82
            ) {

                this.drawBush(
                    ctx,
                    hx,
                    y +
                        border *
                        0.3,
                    hedgeSize
                );


                this.drawBush(
                    ctx,
                    hx,
                    y +
                        height -
                        hedgeSize *
                        0.85,
                    hedgeSize
                );
            }


            /*
             * =====================================================
             * PASSE 05
             * arbres grands
             * =====================================================
             */

            const tree =
                width *
                0.065;


            const treePositions = [

                [
                    0.04,
                    0.11
                ],

                [
                    0.26,
                    0.04
                ],

                [
                    0.63,
                    0.04
                ],

                [
                    0.82,
                    0.10
                ],

                [
                    0.91,
                    0.26
                ],

                [
                    0.03,
                    0.72
                ],

                [
                    0.26,
                    0.83
                ],

                [
                    0.89,
                    0.78
                ]
            ];


            treePositions.forEach(
                position => {

                    this.drawTree(
                        ctx,
                        x +
                            width *
                            position[0],
                        y +
                            height *
                            position[1],
                        tree
                    );
                }
            );


            /*
             * =====================================================
             * PASSE 06
             * fleurs
             * =====================================================
             */

            const flowerSize =
                width *
                0.047;


            const flowerPositions = [

                [
                    0.07,
                    0.25
                ],

                [
                    0.21,
                    0.10
                ],

                [
                    0.42,
                    0.05
                ],

                [
                    0.79,
                    0.06
                ],

                [
                    0.91,
                    0.39
                ],

                [
                    0.11,
                    0.83
                ],

                [
                    0.37,
                    0.88
                ],

                [
                    0.72,
                    0.88
                ]
            ];


            flowerPositions.forEach(
                position => {

                    this.drawFlowers(
                        ctx,
                        x +
                            width *
                            position[0],
                        y +
                            height *
                            position[1],
                        flowerSize
                    );
                }
            );


            /*
             * =====================================================
             * PASSE 07
             * piscine
             * =====================================================
             */

            const poolSize =
                width *
                0.20;


            this.drawPool(
                ctx,
                x +
                    width *
                    0.075,
                y +
                    height *
                    0.055,
                poolSize,
                {
                    animate:
                        true
                }
            );


            /*
             * =====================================================
             * PASSE 08
             * transats
             * =====================================================
             */

            const sunbed =
                width *
                0.052;


            this.drawSunbed(
                ctx,
                x +
                    width *
                    0.285,
                y +
                    height *
                    0.105,
                sunbed
            );


            this.drawSunbed(
                ctx,
                x +
                    width *
                    0.345,
                y +
                    height *
                    0.105,
                sunbed
            );


            /*
             * =====================================================
             * PASSE 09
             * fontaine
             * =====================================================
             */

            this.drawFountain(
                ctx,
                x +
                    width *
                    0.085,
                y +
                    height *
                    0.76,
                width *
                    0.058
            );


            /*
             * =====================================================
             * PASSE 10
             * banc
             * =====================================================
             */

            this.drawBench(
                ctx,
                x +
                    width *
                    0.17,
                y +
                    height *
                    0.79,
                width *
                    0.075
            );


            /*
             * =====================================================
             * PASSE 11
             * allée entrée
             * =====================================================
             */

            const pathTile =
                width *
                0.055;


            const pathX =
                x +
                    width *
                    0.45;


            for (
                let py =
                    y +
                    height *
                    0.69;

                py <
                    y +
                    height;

                py +=
                    pathTile *
                    0.95
            ) {

                this.drawPath(
                    ctx,
                    pathX,
                    py,
                    pathTile
                );
            }


            /*
             * =====================================================
             * PASSE 12
             * zone maison
             * =====================================================
             */

            const houseX =
                x +
                    width *
                    0.08;


            const houseY =
                y +
                    height *
                    0.265;


            const houseW =
                width *
                    0.83;


            const houseH =
                height *
                    0.49;


            /*
             * =====================================================
             * PASSE 13
             * ombre maison
             * =====================================================
             */

            ctx.fillStyle =
                "rgba(0,0,0,0.38)";


            ctx.fillRect(
                houseX + 14,
                houseY + 15,
                houseW,
                houseH
            );


            /*
             * =====================================================
             * PASSE 14
             * sous-bassement
             * =====================================================
             */

            ctx.fillStyle =
                p.ink0;


            ctx.fillRect(
                houseX - 8,
                houseY - 8,
                houseW + 16,
                houseH + 16
            );


            /*
             * =====================================================
             * PASSE 15
             * découpage pièces
             * =====================================================
             */

            const leftW =
                houseW *
                    0.38;


            const middleW =
                houseW *
                    0.33;


            const rightW =
                houseW -
                    leftW -
                    middleW;


            const upperH =
                houseH *
                    0.48;


            const lowerH =
                houseH -
                    upperH;


            /*
             * BALCON
             */

            this.drawRoomScene(
                ctx,
                "balcon",
                houseX -
                    width *
                    0.07,
                houseY +
                    houseH *
                    0.08,
                width *
                    0.075,
                houseH *
                    0.50
            );


            /*
             * SALON
             */

            this.drawRoomScene(
                ctx,
                "salon",
                houseX,
                houseY,
                leftW,
                upperH
            );


            /*
             * CHAMBRE
             */

            this.drawRoomScene(
                ctx,
                "chambre",
                houseX +
                    leftW,
                houseY,
                middleW,
                upperH
            );


            /*
             * CAVE
             */

            this.drawRoomScene(
                ctx,
                "cave_a_vin",
                houseX +
                    leftW +
                    middleW,
                houseY,
                rightW,
                upperH
            );


            /*
             * CUISINE
             */

            this.drawRoomScene(
                ctx,
                "cuisine",
                houseX,
                houseY +
                    upperH,
                leftW,
                lowerH
            );


            /*
             * ENTREE
             */

            this.drawRoomScene(
                ctx,
                "entree",
                houseX +
                    leftW,
                houseY +
                    upperH,
                middleW *
                    0.62,
                lowerH
            );


            /*
             * TOILETTE
             */

            this.drawRoomScene(
                ctx,
                "toilette",
                houseX +
                    leftW +
                    middleW *
                    0.62,
                houseY +
                    upperH,
                middleW *
                    0.38,
                lowerH
            );


            /*
             * GARAGE
             */

            this.drawRoomScene(
                ctx,
                "garage",
                houseX +
                    leftW +
                    middleW,
                houseY +
                    upperH,
                rightW,
                lowerH
            );


            /*
             * =====================================================
             * PASSE 16
             * plantes autour maison
             * =====================================================
             */

            const plant =
                width *
                    0.033;


            const plantPositions = [

                [
                    0.16,
                    0.26
                ],

                [
                    0.33,
                    0.25
                ],

                [
                    0.55,
                    0.26
                ],

                [
                    0.75,
                    0.26
                ],

                [
                    0.09,
                    0.70
                ],

                [
                    0.29,
                    0.73
                ],

                [
                    0.68,
                    0.72
                ],

                [
                    0.88,
                    0.70
                ]
            ];


            plantPositions.forEach(
                position => {

                    this.drawPlant(
                        ctx,
                        x +
                            width *
                            position[0],
                        y +
                            height *
                            position[1],
                        plant
                    );
                }
            );


            /*
             * =====================================================
             * PASSE 17
             * lampadaires extérieurs
             * =====================================================
             */

            const lamp =
                width *
                    0.035;


            const lampPositions = [

                [
                    0.035,
                    0.065
                ],

                [
                    0.52,
                    0.08
                ],

                [
                    0.95,
                    0.08
                ],

                [
                    0.04,
                    0.86
                ],

                [
                    0.42,
                    0.88
                ],

                [
                    0.62,
                    0.88
                ],

                [
                    0.94,
                    0.84
                ]
            ];


            lampPositions.forEach(
                position => {

                    this.drawLamp(
                        ctx,
                        x +
                            width *
                            position[0],
                        y +
                            height *
                            position[1],
                        lamp
                    );
                }
            );


            /*
             * =====================================================
             * PASSE 18
             * portail
             * =====================================================
             */

            const gateY =
                y +
                    height *
                    0.91;


            ctx.fillStyle =
                p.ink0;


            ctx.fillRect(
                x +
                    width *
                    0.43,
                gateY,
                width *
                    0.15,
                height *
                    0.04
            );


            ctx.fillStyle =
                p.metal3;


            for (
                let gx =
                    x +
                    width *
                    0.44;

                gx <
                    x +
                    width *
                    0.57;

                gx +=
                    width *
                    0.012
            ) {

                ctx.fillRect(
                    gx,
                    gateY +
                        4,
                    Math.max(
                        2,
                        width *
                            0.002
                    ),
                    height *
                        0.03
                );
            }


            /*
             * =====================================================
             * PASSE 19
             * halos de lampes
             * =====================================================
             */

            lampPositions.forEach(
                position => {

                    const gx =
                        x +
                            width *
                            (
                                position[0] +
                                0.018
                            );


                    const gy =
                        y +
                            height *
                            (
                                position[1] +
                                0.018
                            );


                    const radius =
                        width *
                            0.055;


                    const gradient =
                        ctx.createRadialGradient(
                            gx,
                            gy,
                            0,
                            gx,
                            gy,
                            radius
                        );


                    gradient.addColorStop(
                        0,
                        "rgba(255,220,125,0.18)"
                    );


                    gradient.addColorStop(
                        1,
                        "rgba(255,180,70,0)"
                    );


                    ctx.fillStyle =
                        gradient;


                    ctx.fillRect(
                        gx - radius,
                        gy - radius,
                        radius * 2,
                        radius * 2
                    );
                }
            );


            /*
             * =====================================================
             * PASSE 20
             * badges chapitres
             * =====================================================
             */

            if (
                Array.isArray(
                    options.chapters
                )
            ) {

                options.chapters
                    .forEach(
                        chapter => {

                            this.drawPixelBadge(
                                ctx,
                                chapter.x,
                                chapter.y,
                                chapter.radius ||
                                    Math.max(
                                        32,
                                        width *
                                            0.035
                                    ),
                                chapter.label ||
                                    `CHAPITRE ${chapter.number}`,
                                {
                                    locked:
                                        chapter.locked,

                                    active:
                                        chapter.active
                                }
                            );
                        }
                    );
            }


            /*
             * =====================================================
             * PASSE 21
             * voile nocturne léger
             * =====================================================
             */

            const atmosphere =
                ctx.createLinearGradient(
                    0,
                    y,
                    0,
                    y +
                        height
                );


            atmosphere.addColorStop(
                0,
                "rgba(20,25,60,0.10)"
            );


            atmosphere.addColorStop(
                0.55,
                "rgba(25,20,50,0.02)"
            );


            atmosphere.addColorStop(
                1,
                "rgba(15,18,40,0.15)"
            );


            ctx.fillStyle =
                atmosphere;


            ctx.fillRect(
                x,
                y,
                width,
                height
            );


            /*
             * =====================================================
             * PASSE 22-30
             * micro détails extérieurs
             * =====================================================
             */

            this.drawOutdoorMicroDetails(
                ctx,
                x,
                y,
                width,
                height
            );


            ctx.restore();
        }


        drawOutdoorMicroDetails(
            ctx,
            x,
            y,
            width,
            height
        ) {

            const p =
                this.palette;


            /*
             * Petites pierres.
             */

            for (
                let i = 0;
                i < 26;
                i += 1
            ) {

                const px =
                    x +
                    width *
                    this.hash(
                        i,
                        81,
                        1
                    );


                const py =
                    y +
                    height *
                    this.hash(
                        i,
                        91,
                        3
                    );


                const radius =
                    2 +
                    this.hash(
                        i,
                        19,
                        7
                    ) *
                    4;


                ctx.fillStyle =
                    i %
                    2
                        ? p.stone1
                        : p.stone2;


                ctx.fillRect(
                    Math.round(px),
                    Math.round(py),
                    Math.round(
                        radius *
                        1.5
                    ),
                    Math.round(
                        radius
                    )
                );
            }


            /*
             * Petites fleurs supplémentaires.
             */

            const flowerColors = [

                p.flowerPink,
                p.flowerPurple,
                p.flowerBlue,
                p.flowerWhite,
                p.flowerYellow
            ];


            for (
                let i = 0;
                i < 40;
                i += 1
            ) {

                const px =
                    x +
                    width *
                    this.hash(
                        i,
                        113,
                        4
                    );


                const py =
                    y +
                    height *
                    this.hash(
                        i,
                        117,
                        9
                    );


                ctx.fillStyle =
                    flowerColors[
                        i %
                        flowerColors.length
                    ];


                ctx.fillRect(
                    Math.round(px),
                    Math.round(py),
                    2,
                    2
                );
            }


            /*
             * Lucioles / lumière jardin.
             */

            ctx.save();

            ctx.globalAlpha =
                0.45;


            for (
                let i = 0;
                i < 16;
                i += 1
            ) {

                const px =
                    x +
                    width *
                    this.hash(
                        i,
                        200,
                        1
                    );


                const py =
                    y +
                    height *
                    this.hash(
                        i,
                        201,
                        1
                    );


                ctx.fillStyle =
                    p.light1;


                ctx.fillRect(
                    Math.round(px),
                    Math.round(py),
                    2,
                    2
                );
            }


            ctx.restore();
        }



        /* =========================================================
           ROUTER
        ========================================================= */

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

                case "floor_wood":
                case "sol_bois":
                case "bois":

                    return this.drawWoodFloor(
                        ctx,
                        x,
                        y,
                        size,
                        options
                    );


                case "floor_tile":
                case "carrelage":

                    return this.drawTileFloor(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "floor_stone":
                case "sol_pierre":
                case "pierre":

                    return this.drawStoneFloor(
                        ctx,
                        x,
                        y,
                        size
                    );


                case "floor_concrete":
                case "beton":

                    return this.drawConcreteFloor(
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
                case "fauteuil":
                case "armchair":

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


                case "rug":
                case "tapis":

                    return this.drawRug(
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


                case "lamp":
                case "lampe":

                    return this.drawLamp(
                        ctx,
                        x,
                        y,
                        size
                    );


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
                        this.palette.red1
                    );


                case "livre_bleu":

                    return this.drawBook(
                        ctx,
                        x,
                        y,
                        size,
                        this.palette.blue1
                    );


                case "box":
                case "caisse":
                case "crate":
                case "caisse_bois":
                case "package":
                case "colis":
                case "carton":

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
                        "#803949"
                    );


                case "bouteille_bleue":

                    return this.drawBottle(
                        ctx,
                        x,
                        y,
                        size,
                        "#356f91"
                    );


                case "bouteille_verte":

                    return this.drawBottle(
                        ctx,
                        x,
                        y,
                        size,
                        "#3e7048"
                    );


                case "bouteille_jaune":

                    return this.drawBottle(
                        ctx,
                        x,
                        y,
                        size,
                        "#9f863f"
                    );


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
                        size
                    );
            }
        }



        /* =========================================================
           FALLBACK
        ========================================================= */

        drawUnknown(
            ctx,
            x,
            y,
            size
        ) {

            this.withTile(
                ctx,
                x,
                y,
                size,
                () => {

                    this.r(
                        ctx,
                        14,
                        14,
                        36,
                        36,
                        this.palette.ink0
                    );


                    this.r(
                        ctx,
                        18,
                        18,
                        28,
                        28,
                        this.palette.night2
                    );


                    this.drawPixelText(
                        ctx,
                        "?",
                        32,
                        24,
                        {
                            scale:
                                3,

                            align:
                                "center",

                            color:
                                this.palette.light0,

                            shadow:
                                this.palette.ink0
                        }
                    );
                }
            );
        }



        /* =========================================================
           PETITS HELPERS DE COULEUR
        ========================================================= */

        glassBlue() {

            return "#74c9dd";
        }


        glassSteel() {

            return "#9dc3c8";
        }

    }



    /* =========================================================
       EXPORT
    ========================================================= */

    window.PytArt =
        PytArt;


    window.PYTArt =
        new PytArt();

})();