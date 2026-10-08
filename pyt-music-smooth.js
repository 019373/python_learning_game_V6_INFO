"use strict";

/*
 * PYT - MUSIQUE FLUIDE
 * 1,9 seconde entre les écrans.
 * 1,75 seconde lors du retour au début d'un MP3.
 * N'affecte pas les exercices ni les autres fonctions.
 */

(() => {
  function installer() {
    const app = window.pytApp;

    if (!app || app.__smoothMusicInstalled) return;
    app.__smoothMusicInstalled = true;

    // Arrêter les anciens lecteurs audio.
    for (const info of app.audioTracks?.values?.() || []) {
      for (const audio of [info.audio, info.spare]) {
        if (!audio) continue;
        audio.pause();
        audio.loop = false;
        audio.muted = true;
      }
    }

    const names = {
      intro: "intro.mp3",
      game: "game.mp3",
      theory: "theory.mp3",
      credit: "credit.mp3"
    };

    for (let n = 1; n <= 9; n++) {
      names[`chapter-${n}`] = `chapter-${n}.mp3`;
    }

    const tracks = new Map();
    const fadeScreenMs = 1900;
    const fadeLoopMs = 1750;

    let playing = null;
    let fading = null;
    let pending = null;
    let generation = 0;
    let frame = 0;

    const master = () =>
      Math.min(1, Math.max(0, Number(app.volume) / 100 || 0));

    const setVolume = (node, volume) => {
      if (node) {
        node.volume = Math.max(0, Math.min(1, volume));
      }
    };

    const status = message => {
      if (app.audioStatus) {
        app.audioStatus.textContent = message;
      }
    };

    // Préparer les 13 musiques.
    for (const [name, file] of Object.entries(names)) {
      const paths = [
        `audio/${file}`,
        `assets/music/${name === "credit" ? "credits.mp3" : file}`
      ];

      // Deux lecteurs permettent de mélanger les sons.
      const nodes = [new Audio(), new Audio()];

      const track = {
        name,
        file,
        paths,
        nodes,
        index: 0,
        failed: false
      };

      tracks.set(name, track);

      for (const node of nodes) {
        node.src = paths[0];
        node.loop = false;
        node.preload = "metadata";
        node.volume = 0;

        // Si le morceau se termine avant le fondu.
        node.addEventListener("ended", () => {
          if (
            playing?.audio === node &&
            !fading &&
            !pending &&
            app.musicEnabled
          ) {
            start(
              track,
              node === nodes[0] ? nodes[1] : nodes[0],
              400
            );
          }
        });

        node.addEventListener("playing", () => {
          if (
            playing?.track === track ||
            fading?.to?.track === track
          ) {
            status(`Lecture OK : ${file}`);
          }
        });

        node.addEventListener("error", () => {
          if (track.index === 0) {
            track.index = 1;

            for (const player of nodes) {
              player.src = paths[1];
              player.load();
            }
          } else {
            track.failed = true;
            status(`MP3 introuvable : ${file}`);
          }
        });
      }
    }

    function cancelPending() {
      if (!pending) return;

      generation++;
      pending.audio.pause();
      pending = null;
    }

    function stopPair(pair) {
      if (!pair) return;

      pair.audio.pause();
      setVolume(pair.audio, 0);
    }

    function stopFade() {
      if (!fading) return;

      if (fading.from?.audio !== fading.to?.audio) {
        stopPair(fading.from);
      }

      playing = fading.to;
      fading = null;
    }

    // Démarrer un morceau sans couper immédiatement l'autre.
    function start(
      track,
      other = null,
      duration = fadeScreenMs
    ) {
      if (
        !track ||
        track.failed ||
        !app.musicEnabled ||
        !app.audioUnlocked
      ) {
        return;
      }

      cancelPending();
      stopFade();

      const old = playing;
      const audio = other || track.nodes[0];

      if (old?.audio === audio) return;

      const target = { track, audio };
      const token = ++generation;

      pending = target;

      audio.pause();

      try {
        audio.currentTime = 0;
      } catch (_) {}

      setVolume(audio, 0);

      let playResult;

      try {
        playResult = audio.play();
      } catch (error) {
        playResult = Promise.reject(error);
      }

      Promise.resolve(playResult)
        .then(() => {
          if (
            generation !== token ||
            !app.musicEnabled
          ) {
            stopPair(target);
            return;
          }

          pending = null;

          fading = {
            from: old,
            to: target,
            at: performance.now(),
            duration: old ? duration : 650
          };

          tick();
        })
        .catch(error => {
          if (generation === token) {
            pending = null;
          }

          if (error?.name === "NotAllowedError") {
            app.audioUnlocked = false;
          }

          status(
            `Lecture impossible : ${track.file} (${error?.name || "erreur"})`
          );
        });
    }

    function tick() {
      if (frame) return;

      frame = requestAnimationFrame(step);
    }

    // Animation des volumes.
    function step(now) {
      frame = 0;

      const volume = master();

      if (fading) {
        const fade = fading;

        const progress = Math.max(
          0,
          Math.min(
            1,
            (now - fade.at) / fade.duration
          )
        );

        // Fondu sinusoïdal pour une transition douce.
        setVolume(
          fade.from?.audio,
          volume * Math.cos(progress * Math.PI / 2)
        );

        setVolume(
          fade.to?.audio,
          volume * Math.sin(progress * Math.PI / 2)
        );

        if (progress >= 1) {
          if (fade.from?.audio !== fade.to?.audio) {
            stopPair(fade.from);
          }

          playing = fade.to;
          fading = null;
        }
      } else if (playing) {
        setVolume(playing.audio, volume);
      }

      // Préparer la prochaine boucle avant la fin du MP3.
      if (
        playing &&
        !fading &&
        !pending &&
        app.musicEnabled
      ) {
        const audio = playing.audio;

        if (
          !audio.paused &&
          Number.isFinite(audio.duration) &&
          audio.duration > 4.5
        ) {
          const remaining =
            audio.duration - audio.currentTime;

          if (
            remaining > 0 &&
            remaining <= fadeLoopMs / 1000 + 0.12
          ) {
            const [a, b] = playing.track.nodes;

            start(
              playing.track,
              audio === a ? b : a,
              fadeLoopMs
            );
          }
        }
      }

      if (
        fading ||
        (playing && app.musicEnabled)
      ) {
        tick();
      }
    }

    // Remplacer seulement le système musical de app.js.
    app.applyAudioSettings = function() {
      if (app.musicInput) {
        app.musicInput.checked =
          Boolean(app.musicEnabled);
      }

      if (app.volumeSlider) {
        app.volumeSlider.value =
          String(app.volume);
      }

      if (app.volumeValue) {
        app.volumeValue.textContent =
          `${app.volume}%`;
      }

      const desired =
        app.getDesiredTrack?.() || "game";

      if (
        !app.isVisible(app.settingsScreen) &&
        !app.isVisible(app.introScreen) &&
        !app.isVisible(app.creditsScreen)
      ) {
        app.lastGameTrack = desired;
      }

      // Fondu de sortie lorsque la musique est désactivée.
      if (!app.musicEnabled) {
        cancelPending();

        if (playing || fading) {
          stopFade();

          if (playing) {
            fading = {
              from: playing,
              to: null,
              at: performance.now(),
              duration: 550
            };

            tick();
          }
        }

        return;
      }

      if (!app.audioUnlocked) return;

      let track = tracks.get(desired);

      if (!track || track.failed) {
        track = tracks.get("game");
      }

      if (
        !track ||
        track.failed ||
        pending?.track === track ||
        fading?.to?.track === track
      ) {
        return;
      }

      if (
        playing?.track === track &&
        !fading
      ) {
        setVolume(
          playing.audio,
          master()
        );

        tick();
        return;
      }

      start(track);
    };

    // Autoriser la musique après un clic.
    app.unlockAudio = function() {
      app.audioUnlocked = true;
      app.applyAudioSettings();
    };

    // Suivre les changements d'écran de ui.js.
    const observer = new MutationObserver(() => {
      app.applyAudioSettings();
    });

    const screens = [
      "intro-screen",
      "settings-screen",
      "credits-screen",
      "game-interface",
      "chapter-screen",
      "map-screen",
      "game-screen"
    ];

    for (const id of screens) {
      const element = document.getElementById(id);

      if (element) {
        observer.observe(element, {
          attributes: true,
          attributeFilter: ["class", "hidden"]
        });
      }
    }

    window.addEventListener(
      "pyt:level-opened",
      () => {
        requestAnimationFrame(() => {
          app.applyAudioSettings();
        });
      }
    );

    app.applyAudioSettings();

    console.info(
      "[PYT] Fondus musicaux activés."
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      installer,
      { once: true }
    );
  } else {
    installer();
  }
})();
