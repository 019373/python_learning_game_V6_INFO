"use strict";

/*
============================================================
PYT - audio.js

Gestion centralisée des musiques du jeu.

Règles :
- une seule musique à la fois ;
- les musiques tournent en boucle ;
- une musique différente remplace l'ancienne ;
- une musique identique continue sans redémarrer ;
- les fichiers absents ou invalides ne font jamais planter PYT ;
- game conserve la musique du chapitre actuel ;
- Musique = Non met réellement le volume à 0 %.
============================================================
*/

class PytAudioManager {

    constructor() {

        // -------------------------------------------------
        // DOSSIER
        // -------------------------------------------------

        this.musicFolder = "assets/music/";


        // -------------------------------------------------
        // FICHIERS
        // -------------------------------------------------

        this.tracks = {

            intro:
                this.musicFolder + "intro.mp3",

            theory:
                this.musicFolder + "theory.mp3",

            credits:
                this.musicFolder + "credits.mp3",

            chapter1:
                this.musicFolder + "chapter-1.mp3",

            chapter2:
                this.musicFolder + "chapter-2.mp3",

            chapter3:
                this.musicFolder + "chapter-3.mp3",

            chapter4:
                this.musicFolder + "chapter-4.mp3",

            chapter5:
                this.musicFolder + "chapter-5.mp3",

            chapter6:
                this.musicFolder + "chapter-6.mp3",

            chapter7:
                this.musicFolder + "chapter-7.mp3",

            chapter8:
                this.musicFolder + "chapter-8.mp3",

            chapter9:
                this.musicFolder + "Chapter-9.mp3"
        };


        // -------------------------------------------------
        // GROUPES DE MUSIQUES IDENTIQUES
        //
        // Important :
        // on utilise un identifiant commun pour empêcher
        // une coupure quand deux écrans utilisent le même
        // morceau.
        // -------------------------------------------------

        this.trackGroups = {

            intro: "intro-theory",
            theory: "intro-theory",

            chapter1: "chapters-1-8",
            chapter2: "chapters-1-8",
            chapter3: "chapters-1-8",
            chapter4: "chapters-1-8",
            chapter5: "chapters-1-8",
            chapter6: "chapters-1-8",
            chapter7: "chapters-1-8",
            chapter8: "chapters-1-8",

            chapter9: "chapter9-credits",
            credits: "chapter9-credits"
        };


        // -------------------------------------------------
        // ÉTAT
        // -------------------------------------------------

        this.audio = new Audio();

        this.audio.loop = true;
        this.audio.preload = "auto";


        this.currentTrack = null;
        this.currentGroup = null;

        this.currentChapter = 1;


        // -------------------------------------------------
        // PARAMÈTRES
        // -------------------------------------------------

        this.enabled = true;

        /*
        Volume par défaut : 50 %.
        Peut être modifié avec setVolume().
        */

        this.volume = 0.5;

        /*
        On garde le dernier volume différent de zéro afin
        de pouvoir réactiver la musique proprement.
        */

        this.lastAudibleVolume = 0.5;


        this.audio.volume =
            this.volume;


        // -------------------------------------------------
        // GESTION DES ERREURS
        // -------------------------------------------------

        this.audio.addEventListener(
            "error",
            () => {

                /*
                Un fichier absent, vide ou illisible
                ne doit jamais faire planter le jeu.
                */

                console.warn(
                    "PYT Audio : musique indisponible :",
                    this.audio.src
                );
            }
        );


        /*
        Certains navigateurs interdisent la lecture audio
        avant la première interaction de l'utilisateur.

        On réessaie donc discrètement après un clic,
        une touche ou un toucher d'écran.
        */

        this.waitingForInteraction = false;

        this.installInteractionUnlock();
    }


    // =====================================================
    // DÉBLOCAGE AUDIO NAVIGATEUR
    // =====================================================

    installInteractionUnlock() {

        const unlock = () => {

            if (
                !this.waitingForInteraction
                ||
                !this.enabled
                ||
                !this.currentTrack
            ) {
                return;
            }


            this.tryPlay();
        };


        document.addEventListener(
            "pointerdown",
            unlock
        );


        document.addEventListener(
            "keydown",
            unlock
        );


        document.addEventListener(
            "touchstart",
            unlock,
            {
                passive: true
            }
        );
    }


    // =====================================================
    // LECTURE
    // =====================================================

    play(trackName) {

        const path =
            this.tracks[trackName];


        if (!path) {

            console.warn(
                "PYT Audio : piste inconnue :",
                trackName
            );

            return false;
        }


        const nextGroup =
            this.trackGroups[trackName]
            || trackName;


        /*
        Si le nouveau contexte utilise exactement le même
        morceau que le contexte actuel, on ne touche PAS
        à l'audio.

        Résultat :
        aucune coupure et aucune reprise depuis le début.
        */

        if (
            this.currentGroup === nextGroup
            &&
            this.currentTrack !== null
        ) {

            this.currentTrack =
                trackName;

            return true;
        }


        /*
        Nouvelle musique :
        on arrête proprement l'ancienne.
        */

        this.stop();


        this.currentTrack =
            trackName;

        this.currentGroup =
            nextGroup;


        try {

            this.audio.src =
                path;

            this.audio.loop =
                true;

            this.audio.volume =
                this.enabled
                    ? this.volume
                    : 0;


            this.audio.load();


            if (this.enabled) {

                this.tryPlay();
            }


            return true;

        } catch (error) {

            /*
            Même si le navigateur refuse le fichier,
            PYT continue normalement.
            */

            console.warn(
                "PYT Audio : impossible de charger la musique.",
                error
            );

            return false;
        }
    }


    // =====================================================
    // TENTATIVE DE LECTURE
    // =====================================================

    tryPlay() {

        if (
            !this.enabled
            ||
            !this.currentTrack
        ) {
            return;
        }


        try {

            const playPromise =
                this.audio.play();


            if (
                playPromise
                &&
                typeof playPromise.catch
                === "function"
            ) {

                playPromise
                    .then(
                        () => {

                            this.waitingForInteraction =
                                false;
                        }
                    )
                    .catch(
                        () => {

                            /*
                            Généralement causé par la sécurité
                            autoplay du navigateur.

                            Ce n'est pas une erreur du jeu.
                            */

                            this.waitingForInteraction =
                                true;
                        }
                    );

            } else {

                this.waitingForInteraction =
                    false;
            }

        } catch (error) {

            this.waitingForInteraction =
                true;
        }
    }


    // =====================================================
    // ARRÊT
    // =====================================================

    stop() {

        try {

            this.audio.pause();

        } catch (error) {

            // Ne jamais bloquer le jeu à cause de l'audio.
        }


        this.waitingForInteraction =
            false;

        this.currentTrack =
            null;

        this.currentGroup =
            null;
    }


    // =====================================================
    // INTRO / MENU PRINCIPAL / SETTINGS
    // =====================================================

    playIntro() {

        return this.play(
            "intro"
        );
    }


    playMainMenu() {

        /*
        Le menu principal utilise intro.mp3.
        Si l'intro jouait déjà, elle continue.
        */

        return this.play(
            "intro"
        );
    }


    playSettings() {

        /*
        Settings appartient au contexte du menu principal.
        La musique ne redémarre donc pas.
        */

        return this.play(
            "intro"
        );
    }


    // =====================================================
    // THÉORIE
    // =====================================================

    playTheory() {

        return this.play(
            "theory"
        );
    }


    // =====================================================
    // CHAPITRES
    // =====================================================

    setChapter(chapter) {

        const number =
            Number(chapter);


        if (
            Number.isInteger(number)
            &&
            number >= 1
            &&
            number <= 9
        ) {

            this.currentChapter =
                number;

            return true;
        }


        console.warn(
            "PYT Audio : chapitre invalide :",
            chapter
        );

        return false;
    }


    playChapter(chapter = this.currentChapter) {

        if (
            !this.setChapter(chapter)
        ) {
            return false;
        }


        return this.play(
            "chapter"
            +
            this.currentChapter
        );
    }


    // =====================================================
    // GAME / CARTE / MENUS D'UN CHAPITRE
    // =====================================================

    playGame(chapter = this.currentChapter) {

        /*
        game.mp3 représente ici le CONTEXTE "game".

        D'après les règles définies pour PYT, il ne faut
        pas charger une musique indépendante lorsque le
        joueur ouvre la carte ou un autre menu interne.

        On conserve la musique du chapitre actuel.
        */

        return this.playChapter(
            chapter
        );
    }


    playMap(chapter = this.currentChapter) {

        return this.playGame(
            chapter
        );
    }


    playChapterMenu(chapter = this.currentChapter) {

        return this.playGame(
            chapter
        );
    }


    // =====================================================
    // CRÉDITS
    // =====================================================

    playCredits() {

        return this.play(
            "credits"
        );
    }


    // =====================================================
    // ACTIVATION / DÉSACTIVATION
    // =====================================================

    setEnabled(enabled) {

        this.enabled =
            Boolean(enabled);


        if (!this.enabled) {

            /*
            Règle du projet :
            Musique = Non
            => volume affiché/logique = 0 %.
            */

            if (this.volume > 0) {

                this.lastAudibleVolume =
                    this.volume;
            }


            this.volume =
                0;

            this.audio.volume =
                0;


            /*
            On met en pause, mais on ne remet pas
            currentTime à zéro.

            Si la musique est réactivée, elle peut
            reprendre sans recommencer.
            */

            try {

                this.audio.pause();

            } catch (error) {

                // Rien : le jeu doit continuer.
            }


            return;
        }


        /*
        Si on réactive la musique après l'avoir coupée,
        on restaure le dernier volume audible.
        */

        if (this.volume <= 0) {

            this.volume =
                this.lastAudibleVolume > 0
                    ? this.lastAudibleVolume
                    : 0.5;
        }


        this.audio.volume =
            this.volume;


        if (this.currentTrack) {

            this.tryPlay();
        }
    }


    isEnabled() {

        return this.enabled;
    }


    // =====================================================
    // VOLUME
    // =====================================================

    setVolume(value) {

        let newVolume =
            Number(value);


        if (
            Number.isNaN(newVolume)
        ) {
            return this.volume;
        }


        /*
        Accepte :
        setVolume(0.5)
        ou
        setVolume(50)
        */

        if (newVolume > 1) {

            newVolume =
                newVolume / 100;
        }


        newVolume =
            Math.max(
                0,
                Math.min(
                    1,
                    newVolume
                )
            );


        this.volume =
            newVolume;


        if (newVolume > 0) {

            this.lastAudibleVolume =
                newVolume;

            /*
            Mettre le curseur au-dessus de 0 peut
            réactiver la musique.
            */

            this.enabled =
                true;

        } else {

            /*
            Volume 0 % = musique désactivée.
            */

            this.enabled =
                false;
        }


        this.audio.volume =
            this.enabled
                ? this.volume
                : 0;


        if (
            this.enabled
            &&
            this.currentTrack
        ) {

            this.tryPlay();

        } else if (
            !this.enabled
        ) {

            try {

                this.audio.pause();

            } catch (error) {

                // Rien.
            }
        }


        return this.volume;
    }


    getVolume() {

        return Math.round(
            this.volume * 100
        );
    }


    // =====================================================
    // INFORMATIONS
    // =====================================================

    getCurrentTrack() {

        return this.currentTrack;
    }


    getCurrentChapter() {

        return this.currentChapter;
    }


    getState() {

        return {

            enabled:
                this.enabled,

            volume:
                this.getVolume(),

            chapter:
                this.currentChapter,

            track:
                this.currentTrack,

            group:
                this.currentGroup,

            playing:
                !this.audio.paused
        };
    }
}


// =========================================================
// INSTANCE GLOBALE
// =========================================================

/*
Une seule instance pour tout le jeu.

Cela est important pour empêcher deux musiques
de jouer en même temps.
*/

window.pytAudio =
    new PytAudioManager();