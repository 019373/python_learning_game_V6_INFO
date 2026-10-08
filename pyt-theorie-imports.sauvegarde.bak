"use strict";

/*
 * PYT — THÉORIE AVANT LES EXERCICES
 * ET VÉRIFICATION DES IMPORTATIONS PYTHON.
 *
 * Ne modifie pas les cartes ni les déplacements.
 */

(() => {
  if (window.__pytTheorieImportsV1) return;
  window.__pytTheorieImportsV1 = true;

  const $ = id => document.getElementById(id);

  const escapeHTML = value =>
    String(value ?? "").replace(
      /[&<>"']/g,
      character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[character]
    );

  const turtleCommands = new Set([
    "forward",
    "backward",
    "left",
    "right",
    "goto",
    "setheading",
    "xcor",
    "ycor"
  ]);

  let theoryOpen = null;
  let patchedGame = null;

  /* =============================================
     VÉRIFICATION DE LA BIBLIOTHÈQUE
  ============================================= */

  function checkImport(source) {
    const text = String(source ?? "");

    const lines = text
      .replace(/\r\n?/g, "\n")
      .split("\n");

    const first = lines.findIndex(
      line =>
        line.trim() &&
        !line.trim().startsWith("#")
    );

    const instruction =
      "Pour dessiner et déplacer Pyt, commence par " +
      "« from turtle import * ». " +
      "Cette bibliothèque fournit les " +
      "commandes de déplacement.";

    if (first < 0) {
      return {
        ok: false,
        message: "Ton programme est vide. " +
          instruction
      };
    }

    const firstStatement = lines[first]
      .split("#")[0]
      .trim();

    if (
      !/^(from|import)\b/.test(firstStatement)
    ) {
      return {
        ok: false,
        message:
          instruction +
          " Place l'importation avant " +
          "tes commandes. Les commentaires " +
          "peuvent rester au-dessus."
      };
    }

    const processed = [...lines];

    let importStyle = "";
    let moduleAlias = "turtle";
    let importedNames = null;
    let found = false;

    for (let i = 0; i < lines.length; i++) {
      const statement = lines[i]
        .split("#")[0]
        .trim();

      if (
        !/^(from|import)\b/.test(statement)
      ) {
        continue;
      }

      const from = statement.match(
        /^from\s+([A-Za-z_]\w*)\s+import\s*(.+)$/
      );

      const direct = statement.match(
        /^import\s+([A-Za-z_]\w*)(?:\s+as\s+([A-Za-z_]\w*))?$/
      );

      const library =
        from?.[1] || direct?.[1];

      if (!library) {
        return {
          ok: false,
          message:
            `Ligne ${i + 1} : importation ` +
            "non reconnue. Utilise " +
            "« from turtle import * »."
        };
      }

      if (library !== "turtle") {
        let explanation;

        if (library === "maths") {
          explanation =
            "La bibliothèque Python s'appelle " +
            "math, sans s.";
        } else if (library === "math") {
          explanation =
            "math sert aux calculs, pas " +
            "aux déplacements de Pyt.";
        } else if (library === "tutle") {
          explanation =
            "Attention à l'orthographe : " +
            "la bibliothèque s'appelle turtle.";
        } else {
          explanation =
            `La bibliothèque « ${library} » ` +
            "n'est pas prise en charge " +
            "dans cet exercice.";
        }

        return {
          ok: false,
          message:
            `Ligne ${i + 1} : ` +
            explanation + " " +
            instruction
        };
      }

      if (found) {
        return {
          ok: false,
          message:
            "Tu n'as besoin d'importer " +
            "turtle qu'une seule fois."
        };
      }

      if (i !== first) {
        return {
          ok: false,
          message:
            "L'importation doit être " +
            "la première instruction " +
            "du programme."
        };
      }

      found = true;

      if (from) {
        importStyle = "from";

        const members = from[2].trim();

        if (members === "*") {
          importedNames = null;
        } else {
          const names = members
            .split(",")
            .map(name => name.trim());

          const invalid = names.some(
            name => !turtleCommands.has(name)
          );

          if (invalid) {
            return {
              ok: false,
              message:
                "Une commande demandée dans " +
                "« from turtle import ... » " +
                "est inconnue. Pour commencer, " +
                "utilise « from turtle import * »."
            };
          }

          importedNames = new Set(names);
        }
      } else {
        importStyle = "module";
        moduleAlias =
          direct[2] || "turtle";
      }

      /*
       * PYT utilise un interpréteur simplifié.
       * On reconnaît l'importation puis on
       * conserve les lignes du programme.
       */
      processed[i] = "";
    }

    if (!found) {
      return {
        ok: false,
        message: instruction
      };
    }

    for (
      let i = 0;
      i < processed.length;
      i++
    ) {
      const original = processed[i];

      if (
        original.trim().startsWith("#")
      ) {
        continue;
      }

      let code = original;

      if (importStyle === "module") {
        for (const name of turtleCommands) {
          const pattern = new RegExp(
            `\\b${moduleAlias}\\.${name}\\s*\\(`,
            "g"
          );

          code = code.replace(
            pattern,
            `${name}(`
          );
        }
      }

      const withoutComment =
        code.split("#")[0];

      for (const name of turtleCommands) {
        const call = new RegExp(
          `\\b${name}\\s*\\(`
        );

        if (!call.test(withoutComment)) {
          continue;
        }

        if (
          importStyle === "from" &&
          importedNames &&
          !importedNames.has(name)
        ) {
          return {
            ok: false,
            message:
              `Ligne ${i + 1} : ${name}() ` +
              "n'a pas été importée. " +
              `Ajoute ${name} dans ` +
              "« from turtle import ... » " +
              "ou utilise « from turtle import * »."
          };
        }

        if (importStyle === "module") {
          const qualified = new RegExp(
            `\\b${moduleAlias}\\.${name}\\s*\\(`
          );

          if (
            !qualified.test(
              original.split("#")[0]
            )
          ) {
            return {
              ok: false,
              message:
                `Ligne ${i + 1} : avec ` +
                "« import turtle », écris " +
                `« ${moduleAlias}.${name}(...) ». ` +
                "Sinon, utilise " +
                "« from turtle import * »."
            };
          }
        }
      }

      processed[i] = code;
    }

    return {
      ok: true,
      source: processed.join("\n")
    };
  }

  /* =============================================
     MESSAGES D'ERREUR PÉDAGOGIQUES
  ============================================= */

  function showError(message) {
    const output = $("console-output");

    if (output) {
      output.textContent =
        "⚠ BIBLIOTHÈQUE PYTHON\n\n" +
        message;
    }

    const editor = $("code-editor");

    if (editor) {
      editor.style.outline =
        "3px solid #ffb45b";
    }

    window.pytGame?.updateStatus?.(
      "Vérifie la bibliothèque importée"
    );
  }

  function patchGame() {
    const game = window.pytGame;

    if (
      !game ||
      game === patchedGame ||
      typeof game.executeSource !== "function"
    ) {
      return;
    }

    patchedGame = game;

    const original = game.executeSource;

    game.executeSource = function(
      source,
      ...args
    ) {
      if (theoryOpen) {
        showError(
          "Lis d'abord la théorie, puis " +
          "clique sur « Commencer l'exercice »."
        );

        return Promise.resolve();
      }

      const result = checkImport(source);

      if (!result.ok) {
        showError(result.message);
        return Promise.resolve();
      }

      const editor = $("code-editor");

      if (editor) {
        editor.style.outline = "";
      }

      return original.call(
        this,
        result.source,
        ...args
      );
    };
  }

  /* =============================================
     FENÊTRE DE THÉORIE
  ============================================= */

  function createTheoryUI() {
    let overlay = $("pyt-theory-first");

    if (overlay) return overlay;

    const style =
      document.createElement("style");

    style.id = "pyt-theory-first-style";

    style.textContent = `
      #pyt-theory-first {
        position: fixed;
        inset: 0;
        z-index: 2147483000;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 16px;
        background: rgba(9, 12, 25, .96);
        color: #f7f2e8;
        box-sizing: border-box;
      }

      #pyt-theory-first.visible {
        display: flex;
      }

      #pyt-theory-first .theory-paper {
        width: min(760px, 100%);
        max-height: 90vh;
        overflow-y: auto;
        background: #19243b;
        border: 3px solid #f3d58b;
        border-radius: 9px;
        padding: clamp(14px, 4vw, 30px);
        box-sizing: border-box;
      }

      #pyt-theory-first h2,
      #pyt-theory-first h3 {
        color: #ffe094;
      }

      #pyt-theory-first p {
        line-height: 1.55;
      }

      #pyt-theory-first .theory-card {
        border-left: 4px solid #dba956;
        padding: 10px 12px;
        background: #26334b;
        margin: 10px 0;
      }

      #pyt-theory-first pre {
        background: #0b1425;
        color: #c7f9dc;
        border: 1px solid #3b5471;
        padding: 12px;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        font: 14px/1.5 monospace;
      }

      #pyt-theory-first .import-lesson {
        margin: 12px 0;
        background: #163b39;
        border: 2px solid #71ceb3;
        padding: 12px;
        border-radius: 5px;
      }

      #pyt-theory-first button {
        background: #f5d783;
        color: #1c2234;
        border: 2px solid #fff4bf;
        border-radius: 5px;
        padding: 13px 19px;
        font-family: inherit;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        margin-top: 12px;
        min-height: 48px;
      }
    `;

    document.head.appendChild(style);

    overlay =
      document.createElement("div");

    overlay.id = "pyt-theory-first";

    overlay.setAttribute(
      "role",
      "dialog"
    );

    overlay.setAttribute(
      "aria-modal",
      "true"
    );

    overlay.innerHTML = `
      <div class="theory-paper">
        <div id="pyt-theory-content"></div>
        <button
          type="button"
          id="pyt-theory-continue"
        >
          J'ai compris — Commencer l'exercice →
        </button>
      </div>
    `;

    document.body.appendChild(overlay);

    $("pyt-theory-continue")
      .addEventListener("click", () => {
        theoryOpen = null;

        overlay.classList.remove(
          "visible"
        );

        const gameScreen =
          $("game-screen");

        if (
          gameScreen?.classList.contains(
            "hidden"
          )
        ) {
          window.pytApp?.showGame?.();
        }

        $("open-code-button")?.focus();
      });

    return overlay;
  }

  /* =============================================
     AFFICHER LE COURS DU BON CHAPITRE
  ============================================= */

  function showTheory(levelData) {
    const level =
      levelData ||
      window.pytGame?.levelData;

    const chapter =
      Number(level?.chapter);

    const exercise =
      Number(level?.level);

    if (!chapter || !exercise) {
      return;
    }

    const key =
      `${chapter}-${exercise}`;

    if (theoryOpen === key) {
      return;
    }

    const overlay = createTheoryUI();

    const data =
      window.PYT_GAME_DATA ||
      window.PYT_LEVELS;

    const chapterData =
      data?.getChapter?.(chapter) ||
      data?.chapters?.[chapter - 1];

    const sections =
      Array.isArray(chapterData?.theory)
        ? chapterData.theory
        : [];

    const lessons = sections.map(section => {
      const paragraphs =
        Array.isArray(section.body)
          ? section.body
          : [section.body];

      const description = paragraphs
        .filter(Boolean)
        .map(text =>
          `<p>${escapeHTML(text)}</p>`
        )
        .join("");

      const example = section.code
        ? `<pre>${escapeHTML(section.code)}</pre>`
        : "";

      return `
        <section class="theory-card">
          <h3>
            ${escapeHTML(
              section.title || "À retenir"
            )}
          </h3>
          ${description}
          ${example}
        </section>
      `;
    }).join("");

    $("pyt-theory-content").innerHTML = `
      <p>
        COURS AVANT L'EXERCICE —
        CHAPITRE ${chapter},
        EXERCICE ${exercise}
      </p>

      <h2>
        ${escapeHTML(
          chapterData?.title ||
          `Chapitre ${chapter}`
        )}
      </h2>

      <p>
        ${escapeHTML(
          chapterData?.subtitle ||
          "Lis la théorie avant de commencer."
        )}
      </p>

      <section class="import-lesson">
        <h3>
          Pourquoi importer la bonne bibliothèque ?
        </h3>

        <p>
          Une bibliothèque Python fournit
          des commandes spécialisées.
          Pour déplacer Pyt, on utilise
          <strong>turtle</strong>.
        </p>

        <p>
          La bibliothèque
          <strong>math</strong>
          sert aux calculs mathématiques.
          Elle ne remplace pas turtle.
        </p>

        <p>
          <strong>
            Commence ton programme ainsi :
          </strong>
        </p>

        <pre>from turtle import *

forward(2)
left(90)
forward(1)</pre>

        <p>
          <code>from turtle import *</code>
          rend les commandes
          <code>forward()</code>,
          <code>backward()</code>,
          <code>left()</code> et
          <code>right()</code>
          directement disponibles.
        </p>

        <p>
          Tu peux aussi écrire
          <code>import turtle</code>,
          mais il faut alors utiliser
          <code>turtle.forward(2)</code>.
        </p>

        <p>
          PYT utilise un interpréteur Python
          simplifié. Les autres bibliothèques,
          comme math, ne sont pas exécutées
          dans ce jeu.
        </p>
      </section>

      ${
        lessons ||
        "<p>Compte les cases et " +
        "tourne avant les obstacles.</p>"
      }

      <h3>Objectif de l'exercice</h3>

      <p>
        ${escapeHTML(
          level.instruction ||
          "Atteins les objectifs demandés."
        )}
      </p>
    `;

    theoryOpen = key;

    window.pytApp?.hideCodeWindow?.();

    overlay.classList.add("visible");

    overlay
      .querySelector(".theory-paper")
      .scrollTop = 0;

    $("pyt-theory-continue")?.focus();
  }

  /* =============================================
     LANCEMENT
  ============================================= */

  function onLevelOpened(event) {
    patchGame();

    const data =
      event?.detail?.data ||
      window.pytGame?.levelData;

    if (!data) return;

    setTimeout(
      () => showTheory(data),
      0
    );
  }

  function install() {
    patchGame();

    window.addEventListener(
      "pyt:level-opened",
      onLevelOpened
    );

    const game = window.pytGame;

    if (
      game &&
      typeof game.loadLevel === "function" &&
      !game.__pytTheoryLoadWrapped
    ) {
      game.__pytTheoryLoadWrapped = true;

      const originalLoad =
        game.loadLevel;

      game.loadLevel = function(
        data,
        ...args
      ) {
        const before =
          `${this.levelData?.chapter}-` +
          `${this.levelData?.level}`;

        const result =
          originalLoad.call(
            this,
            data,
            ...args
          );

        const after =
          `${this.levelData?.chapter}-` +
          `${this.levelData?.level}`;

        if (
          before !== after &&
          this.levelData?.chapter
        ) {
          setTimeout(
            () => showTheory(
              this.levelData
            ),
            0
          );
        }

        return result;
      };
    }

    const screen =
      $("game-screen");

    if (
      screen &&
      !screen.classList.contains(
        "hidden"
      ) &&
      game?.levelData
    ) {
      showTheory(game.levelData);
    }

    console.info(
      "[PYT] Théorie et bibliothèques activées."
    );
  }

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      install,
      { once: true }
    );
  } else {
    install();
  }
})();
