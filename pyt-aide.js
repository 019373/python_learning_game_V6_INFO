"use strict";

/*
 * PYT — CONSIGNES ET OBSTACLES
 *
 * - Cases interdites remplies entièrement.
 * - Repères numérotés sur le plateau.
 * - Trajet expliqué à droite du jeu.
 * - Aide après deux échecs.
 * - Correction ciblée du chapitre 1, exercice 3.
 *
 * Les chemins des niveaux ne sont pas modifiés.
 */

(() => {
  const $ = id => document.getElementById(id);

  const attempts = new Map();

  let currentLevel = "";
  let installed = false;
  let lastRenderGame = null;

  const dirs = [
    [1, 0, "droite"],
    [0, 1, "bas"],
    [-1, 0, "gauche"],
    [0, -1, "haut"]
  ];

  const pos = p =>
    Array.isArray(p)
      ? {
          x: Number(p[0]),
          y: Number(p[1])
        }
      : {
          x: Number(p?.x ?? p?.col),
          y: Number(p?.y ?? p?.row)
        };

  const valid = p =>
    Number.isInteger(p?.x) &&
    Number.isInteger(p?.y);

  const same = (a, b) =>
    valid(a) &&
    valid(b) &&
    a.x === b.x &&
    a.y === b.y;

  const key = p => `${p.x},${p.y}`;

  const label = p =>
    `colonne ${p.x + 1}, ligne ${p.y + 1}`;

  const escapeHTML = s =>
    String(s ?? "").replace(
      /[&<>"']/g,
      c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[c]
    );

  const game = () => window.pytGame;
  const level = () => game()?.levelData;

  const levelId = l =>
    `${l?.chapter}-${l?.level}`;

  /* ================================================
     CORRECTION UNIQUEMENT DE L'EXERCICE 1-3
  ================================================ */

  function corrigerMission3() {
    const data =
      window.PYT_GAME_DATA ||
      window.PYT_LEVELS;

    const m = data?.getLevel?.(1, 3);

    if (
      !m ||
      !same(
        pos(m.robotStart),
        { x: 5, y: 4 }
      ) ||
      !same(
        pos(m.goal?.position),
        { x: 3, y: 2 }
      ) ||
      !Array.isArray(m.requiredConcepts)
    ) {
      console.warn(
        "[PYT] Mission 1-3 différente : " +
        "aucune correction automatique."
      );

      return;
    }

    /*
     * Le trajet naturel ne nécessite pas right().
     * On garde backward(), left() et forward().
     */

    m.requiredConcepts =
      m.requiredConcepts.filter(
        c => c !== "right"
      );

    m.instruction =
      "Recule de 2 cases jusqu'au repère 1. " +
      "Reviens à droite, monte jusqu'à " +
      "l'interrupteur (repère 2), puis va " +
      "à gauche vers l'arrivée. Le bouton " +
      "s'active quand Pyt marche dessus.";

    m.guideMessage =
      "Trajet : repère 1 → interrupteur " +
      "(repère 2) → arrivée. Une rotation " +
      "change seulement la direction. " +
      "Ici, right() n'est pas obligatoire.";

    m.hints = [
      "Commence par backward(2). " +
      "Pyt regarde vers la droite : reculer " +
      "le fait donc aller à gauche.",

      "Reviens de 2 cases à droite, " +
      "tourne vers le haut, monte de 2 cases, " +
      "puis tourne vers la gauche " +
      "et avance de 2 cases."
    ];

    console.info(
      "[PYT] Mission 1-3 corrigée, " +
      "sans modifier son chemin."
    );
  }

  corrigerMission3();

  /* ================================================
     REPÈRES ET TRAJETS
  ================================================ */

  function stages(l) {
    const points =
      Array.isArray(l?.goal?.visitInOrder)
        ? l.goal.visitInOrder
            .map(pos)
            .filter(valid)
        : [];

    const end = pos(
      l?.goal?.position ||
      l?.goal?.destination ||
      l?.goal
    );

    if (
      valid(end) &&
      !same(
        points[points.length - 1],
        end
      )
    ) {
      points.push(end);
    }

    return points;
  }

  function pathfind(from, to, g) {
    if (!valid(from) || !valid(to)) {
      return null;
    }

    const queue = [from];

    const prev = new Map([
      [key(from), null]
    ]);

    for (
      let head = 0;
      head < queue.length;
      head++
    ) {
      const p = queue[head];

      if (same(p, to)) {
        const path = [p];

        while (
          prev.get(
            key(path[path.length - 1])
          )
        ) {
          path.push(
            prev.get(
              key(path[path.length - 1])
            )
          );
        }

        return path.reverse();
      }

      for (const [dx, dy] of dirs) {
        const next = {
          x: p.x + dx,
          y: p.y + dy
        };

        const blocked =
          typeof g?.isBlockedCell === "function"
            ? g.isBlockedCell(
                next.x,
                next.y
              )
            : (
                next.x < 0 ||
                next.y < 0 ||
                next.x >= 8 ||
                next.y >= 6 ||
                (
                  g?.getBlockedCells?.() || []
                ).some(
                  w => same(pos(w), next)
                )
              );

        if (
          prev.has(key(next)) ||
          blocked
        ) {
          continue;
        }

        prev.set(key(next), p);

        queue.push(next);
      }
    }

    return null;
  }

  function movements(path) {
    if (!path || path.length < 2) {
      return "déjà sur cette case";
    }

    const output = [];

    for (
      let i = 1;
      i < path.length;
      i++
    ) {
      const a = path[i - 1];
      const b = path[i];

      const dir = dirs.find(
        ([dx, dy]) =>
          a.x + dx === b.x &&
          a.y + dy === b.y
      )?.[2];

      const last =
        output[output.length - 1];

      if (last?.direction === dir) {
        last.count++;
      } else {
        output.push({
          direction: dir,
          count: 1
        });
      }
    }

    return output.map(p => {
      const count =
        `${p.count} ` +
        (
          p.count > 1
            ? "cases"
            : "case"
        );

      const direction = {
        haut: "le haut",
        bas: "le bas",
        droite: "la droite",
        gauche: "la gauche"
      }[p.direction];

      return `${count} vers ${direction}`;
    }).join(" → ");
  }

  function route(l, g) {
    const points = stages(l);

    const start = pos(
      l?.robotStart ||
      g?.startState
    );

    let previous = start;

    return points.map((point, i) => {
      const path = pathfind(
        previous,
        point,
        g
      );

      previous = point;

      return {
        point,
        index: i,
        isEnd: i === points.length - 1,
        path,
        desc: path
          ? movements(path)
          : "trajet non calculable : " +
            "contourne les obstacles"
      };
    });
  }

  /* ================================================
     INTERFACE : À DROITE DU JEU, PAS DANS LE CODE
  ================================================ */

  function createUI() {
    if (!$("pyt-help-styles")) {
      const st =
        document.createElement("style");

      st.id = "pyt-help-styles";

      st.textContent = `
        #pyt-help-legend {
          grid-column: 1 / -1;
          display: block;
          margin: 10px 0 0;
          padding: 12px;
          background: #171d2d;
          border: 2px solid #ffe48c;
          border-radius: 5px;
          color: #f6f2e8;
          font-size: 13px;
          line-height: 1.65;
          white-space: normal;
          overflow-wrap: anywhere;
        }

        #pyt-help-legend strong {
          color: #ffdf79;
        }

        #pyt-help-legend .pyt-steps {
          padding-left: 20px;
          margin: 5px 0 8px;
        }

        #pyt-help-legend .pyt-steps li {
          padding: 3px 0;
        }

        #pyt-help-detail {
          grid-column: 1 / -1;
          margin: 9px 0 0;
          padding: 11px;
          border: 2px solid #ffae5c;
          border-radius: 5px;
          background: #35212a;
          color: #fff6e6;
          font-size: 13px;
          line-height: 1.55;
          overflow-wrap: anywhere;
        }

        #pyt-help-detail strong {
          color: #ffdf93;
        }

        #pyt-help-detail[hidden] {
          display: none !important;
        }

        .mission-panel {
          scrollbar-width: thin;
          scrollbar-color: #ffe08b #252033;
        }

        @media (max-width: 650px) {
          #pyt-help-legend,
          #pyt-help-detail {
            font-size: 12px;
            padding: 9px;
            margin-top: 6px;
          }
        }
      `;

      document.head.appendChild(st);
    }

    const instruction =
      $("mission-instruction");

    if (!instruction) return;

    if (!$("pyt-help-legend")) {
      const box =
        document.createElement("div");

      box.id = "pyt-help-legend";

      instruction.insertAdjacentElement(
        "afterend",
        box
      );
    }

    if (!$("pyt-help-detail")) {
      const box =
        document.createElement("div");

      box.id = "pyt-help-detail";
      box.hidden = true;

      $("pyt-help-legend")
        .insertAdjacentElement(
          "afterend",
          box
        );
    }
  }

  /* ================================================
     CONSIGNES POUR CHAQUE EXERCICE
  ================================================ */

  function instructions() {
    createUI();

    const l = level();
    const g = game();

    if (!l) return;

    const id = levelId(l);

    if (currentLevel !== id) {
      currentLevel = id;

      const help =
        $("pyt-help-detail");

      if (help) {
        help.hidden = true;
        help.textContent = "";
      }
    }

    const instruction =
      $("mission-instruction");

    if (instruction && l.instruction) {
      instruction.textContent =
        l.instruction;
    }

    const legend =
      $("pyt-help-legend");

    if (!legend) return;

    const points = route(l, g);
    const start = pos(l.robotStart);

    const orientation = ({
      E: "droite",
      N: "haut",
      W: "gauche",
      S: "bas"
    })[
      String(
        l.robotStart?.direction || "E"
      ).toUpperCase()
    ] || "la flèche";

    const steps = points.map(p => {
      const which =
        p.isEnd
          ? "ARRIVÉE"
          : `REPÈRE ${p.index + 1}`;

      return `
        <li>
          <strong>${which}</strong>
          (${label(p.point)}) :
          ${escapeHTML(p.desc)}.
        </li>
      `;
    }).join("");

    const extras = [];

    if (
      (l.objects || []).some(
        o => g?.isAutoPickupObject?.(o)
      )
    ) {
      extras.push(
        "Passe exactement sur les " +
        "objets à ramasser."
      );
    }

    if (
      (l.objects || []).some(
        o => g?.isButtonType?.(
          String(
            o.type || ""
          ).toLowerCase()
        )
      )
    ) {
      extras.push(
        "Un interrupteur s'active " +
        "automatiquement au passage."
      );
    }

    if (
      (l.targets || []).some(
        t => g?.isDepositTarget?.(t)
      )
    ) {
      extras.push(
        "Après le ramassage, passe " +
        "sur la zone de dépôt."
      );
    }

    if (l.goal?.noCollisions) {
      extras.push(
        "Aucun choc autorisé : tourne " +
        "avant les obstacles."
      );
    }

    const special =
      Number(l.chapter) === 1 &&
      Number(l.level) === 3
        ? `
          <p>
            <strong>Important :</strong>
            Pyt regarde à droite.
            <code>backward(2)</code>
            le déplace donc vers la gauche.
            Le repère 1 n'est PAS l'arrivée :
            il faut ensuite rejoindre
            l'interrupteur.
          </p>
        `
        : "";

    legend.innerHTML =
      `
        <strong>📍 Où aller ?</strong>

        <div>
          Départ : ${label(start)}.
          Pyt regarde vers la
          ${escapeHTML(orientation)}.
        </div>

        <ol class="pyt-steps">
          ${
            steps ||
            "<li>Rejoins l'objectif.</li>"
          }
        </ol>
      ` +
      special +
      extras.map(
        s => `<div>• ${escapeHTML(s)}</div>`
      ).join("") +
      `
        <div
          style="
            margin-top: 7px;
            color: #ffbdc4;
          "
        >
          ■ Rouge plein + croix =
          case entière interdite.

          ■ Jaune = objet poussable.

          Il n'existe pas de demi-case
          traversable.
        </div>
      `;
  }

  /* ================================================
     EXPLICATION APRÈS DEUX ÉCHECS
  ================================================ */

  function missingStage(l, g) {
    const seen = (
      g?.robot?.visited || []
    ).map(pos);

    let after = -1;

    for (
      const [i, p] of
      stages(l).entries()
    ) {
      const j = seen.findIndex(
        (s, ix) =>
          ix > after &&
          same(s, p)
      );

      if (j < 0) {
        return {
          i,
          point: p
        };
      }

      after = j;
    }

    return null;
  }

  function failure(detail) {
    const l = level();
    const g = game();

    if (!l || detail?.success) {
      return;
    }

    const id = levelId(l);

    const count =
      (attempts.get(id) || 0) + 1;

    attempts.set(id, count);

    if (count < 2) return;

    instructions();

    const messages = [];

    const collision = (
      g.runtimeIssues || []
    ).find(
      x => x.type === "collision"
    );

    if (collision) {
      const p = pos(collision);

      messages.push(
        "Pyt a tenté d'entrer en " +
        `${label(p)}. ` +
        "La case entière est interdite " +
        "ou située hors de la grille. " +
        "Tourne avant d'y entrer."
      );
    }

    const missed =
      missingStage(l, g);

    if (missed) {
      const name =
        missed.i === stages(l).length - 1
          ? "l'arrivée"
          : `le repère ${missed.i + 1}`;

      messages.push(
        "La prochaine étape manquante est " +
        `${name} (${label(missed.point)}). ` +
        "Les étapes sont obligatoires " +
        "dans l'ordre."
      );
    }

    if (
      detail.reason ===
      "concept_missing"
    ) {
      messages.push(
        "Le chemin peut être correct, " +
        "mais il manque une notion Python : " +
        (
          detail.missingConcepts || []
        ).join(", ") +
        "."
      );
    }

    if (
      detail.reason === "runtime_error" ||
      detail.reason === "engine_error"
    ) {
      messages.push(
        "Erreur de programme : " +
        String(
          detail.message ||
          "vérifie la syntaxe " +
          "et l'indentation"
        ) +
        "."
      );
    }

    if (
      detail.reason ===
        "wrong_destination" &&
      !missed
    ) {
      messages.push(
        "Le robot n'a pas terminé " +
        "sur la bonne case. Compare " +
        "sa position à l'arrivée verte."
      );
    }

    if (
      detail.reason ===
      "deposit_missing"
    ) {
      messages.push(
        "Un objet ramassé doit encore " +
        "être déposé sur la zone " +
        "correspondante."
      );
    }

    if (
      detail.reason ===
      "object_missing"
    ) {
      messages.push(
        "Il manque un objet à ramasser. " +
        "Passe sur sa case avant l'arrivée."
      );
    }

    if (!messages.length) {
      messages.push(
        "Le trajet, une action de mission " +
        "ou une notion Python n'a pas " +
        "été respecté."
      );
    }

    if (
      Number(l.chapter) === 1 &&
      Number(l.level) === 3
    ) {
      messages.push(
        "Pour cet exercice : " +
        "recule de 2 cases → " +
        "reviens à droite de 2 → " +
        "tourne à gauche → " +
        "monte de 2 → " +
        "tourne à gauche → " +
        "avance de 2. " +
        "Le bouton est sur " +
        "l'avant-dernier segment."
      );
    } else {
      const parts = route(l, g).map(
        r =>
          (
            r.isEnd
              ? "arrivée"
              : `repère ${r.index + 1}`
          ) +
          " : " +
          r.desc
      );

      if (parts.length) {
        messages.push(
          "Trajet conseillé : " +
          parts.join(" ; ") +
          "."
        );
      }
    }

    const hints =
      Array.isArray(l.hints)
        ? l.hints
        : [];

    if (hints.length) {
      messages.push(
        "Indice : " +
        hints[
          Math.min(
            count - 2,
            hints.length - 1
          )
        ]
      );
    }

    const box =
      $("pyt-help-detail");

    if (box) {
      box.innerHTML =
        "<strong>💡 Pourquoi cela " +
        "ne marche pas ? " +
        "(après 2 essais)</strong>" +
        messages.map(
          m => `
            <p style="margin:7px 0 0">
              ${escapeHTML(m)}
            </p>
          `
        ).join("");

      box.hidden = false;
    }

    const panel =
      box?.closest?.(
        ".mission-panel"
      );

    if (panel) {
      panel.scrollTop =
        panel.scrollHeight;
    }
  }

  /* ================================================
     DESSIN DES CASES ENTIÈREMENT INTERDITES
  ================================================ */

  function drawBlocked() {
    const g = game();
    const ctx = g?.ctx;

    if (
      !g?.levelData ||
      !ctx ||
      typeof g.cellRect !== "function" ||
      typeof g.isBlockedCell !== "function"
    ) {
      return;
    }

    ctx.save();

    ctx.globalAlpha = 1;

    ctx.globalCompositeOperation =
      "source-over";

    if (ctx.setLineDash) {
      ctx.setLineDash([]);
    }

    /*
     * On vérifie toutes les cases du plateau.
     * Le moteur décide si elles sont bloquées.
     */

    for (
      let y = 0;
      y < g.mapHeight;
      y++
    ) {
      for (
        let x = 0;
        x < g.mapWidth;
        x++
      ) {
        if (
          !g.isBlockedCell(x, y)
        ) {
          continue;
        }

        const box =
          g.cellRect(x, y);

        const z =
          Number(box?.size);

        if (
          !Number.isFinite(z) ||
          z <= 0
        ) {
          continue;
        }

        const p = box.x;
        const q = box.y;

        const objects = (
          Array.isArray(g.visualObjects) &&
          g.executing
            ? g.visualObjects
            : g.logicalObjects
        ) || [];

        const yellow =
          objects.some(
            o =>
              Math.round(o.x) === x &&
              Math.round(o.y) === y &&
              g.isPushableObject?.(o)
          );

        ctx.save();

        if (yellow) {
          /*
           * Caisse poussable :
           * contour jaune.
           */

          ctx.strokeStyle =
            "#ffe35b";

          ctx.lineWidth =
            Math.max(
              3,
              z * 0.09
            );

          ctx.strokeRect(
            p + z * 0.045,
            q + z * 0.045,
            z * 0.91,
            z * 0.91
          );

        } else {
          /*
           * Case interdite complète.
           *
           * Aucune demi-case,
           * aucune transparence,
           * aucune hachure.
           */

          ctx.fillStyle =
            "#560c1f";

          ctx.fillRect(
            p,
            q,
            z,
            z
          );

          /*
           * Contour rouge visible.
           */

          ctx.strokeStyle =
            "#ff5268";

          ctx.lineWidth =
            Math.max(
              3,
              z * 0.055
            );

          ctx.strokeRect(
            p + 1,
            q + 1,
            z - 2,
            z - 2
          );

          /*
           * Grande croix rouge.
           */

          ctx.lineCap =
            "square";

          ctx.lineWidth =
            Math.max(
              3,
              z * 0.09
            );

          ctx.beginPath();

          ctx.moveTo(
            p + z * 0.20,
            q + z * 0.20
          );

          ctx.lineTo(
            p + z * 0.80,
            q + z * 0.80
          );

          ctx.moveTo(
            p + z * 0.80,
            q + z * 0.20
          );

          ctx.lineTo(
            p + z * 0.20,
            q + z * 0.80
          );

          ctx.stroke();
        }

        ctx.restore();
      }
    }

    /* ============================================
       REPÈRES JAUNES ET ARRIVÉE VERTE
    ============================================ */

    const pts =
      stages(g.levelData);

    for (
      let i = 0;
      i < pts.length;
      i++
    ) {
      const pt = pts[i];

      if (
        !valid(pt) ||
        pt.x < 0 ||
        pt.y < 0 ||
        pt.x >= g.mapWidth ||
        pt.y >= g.mapHeight
      ) {
        continue;
      }

      const box =
        g.cellRect(
          pt.x,
          pt.y
        );

      const z = box.size;

      const cx =
        box.x + z * 0.24;

      const cy =
        box.y + z * 0.24;

      ctx.save();

      ctx.beginPath();

      ctx.arc(
        cx,
        cy,
        z * 0.185,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        i === pts.length - 1
          ? "#72eb98"
          : "#ffe281";

      ctx.fill();

      ctx.lineWidth =
        Math.max(
          2,
          z * 0.04
        );

      ctx.strokeStyle =
        "#151522";

      ctx.stroke();

      ctx.font =
        `bold ${
          Math.max(
            12,
            Math.round(
              z * 0.23
            )
          )
        }px sans-serif`;

      ctx.textAlign =
        "center";

      ctx.textBaseline =
        "middle";

      ctx.fillStyle =
        "#111524";

      ctx.fillText(
        i === pts.length - 1
          ? "A"
          : String(i + 1),
        cx,
        cy + 1
      );

      ctx.restore();
    }

    ctx.restore();
  }

  /* ================================================
     INSTALLATION SANS MODIFIER LE RESTE DU JEU
  ================================================ */

  function install() {
    const g = game();

    if (!g) return;

    /*
     * Dessiner les obstacles en dernier :
     * aucun décor ne peut masquer le rouge.
     */

    if (
      g !== lastRenderGame
    ) {
      const render = g.render;

      if (
        typeof render === "function"
      ) {
        g.render = function(...args) {
          const result =
            render.apply(
              this,
              args
            );

          drawBlocked();

          return result;
        };

        lastRenderGame = g;
      }
    }

    if (installed) return;

    installed = true;

    /*
     * Actualiser les consignes
     * même après un chargement direct.
     */

    if (
      typeof g.loadLevel ===
      "function"
    ) {
      const oldLoad =
        g.loadLevel;

      g.loadLevel = function(...args) {
        const result =
          oldLoad.apply(
            this,
            args
          );

        instructions();

        requestAnimationFrame(
          instructions
        );

        return result;
      };
    }

    window.addEventListener(
      "pyt:level-opened",
      () => requestAnimationFrame(
        instructions
      )
    );

    window.addEventListener(
      "pyt:load-level",
      () => requestAnimationFrame(
        instructions
      )
    );

    window.addEventListener(
      "pyt:execution-result",
      e => {
        if (e.detail?.success) {
          const help =
            $("pyt-help-detail");

          if (help) {
            help.hidden = true;
          }
        } else {
          failure(
            e.detail || {}
          );
        }
      }
    );

    createUI();
    instructions();

    g.render();

    console.info(
      "[PYT] Nouvelles consignes " +
      "et obstacles visibles activés."
    );
  }

  if (
    document.readyState ===
    "loading"
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
