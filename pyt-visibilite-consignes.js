"use strict";

/* PYT — Consignes claires et obstacles opaques.
   Les cartes et les chemins restent inchangés. */

(() => {
  const $ = id => document.getElementById(id);

  const point = value => Array.isArray(value)
    ? {x:Number(value[0]),y:Number(value[1])}
    : {
        x:Number(value?.x ?? value?.col),
        y:Number(value?.y ?? value?.row)
      };

  const valid = p =>
    Number.isInteger(p?.x) &&
    Number.isInteger(p?.y);

  const same = (a,b) =>
    valid(a) && valid(b) &&
    a.x===b.x && a.y===b.y;

  const human = p =>
    `colonne ${p.x+1}, ligne ${p.y+1}`;

  const esc = text =>
    String(text ?? "").replace(/[&<>"']/g,
      c => ({
        "&":"&amp;",
        "<":"&lt;",
        ">":"&gt;",
        '"':"&quot;",
        "'":"&#39;"
      })[c]
    );

  const dirs = [
    [1,0,"droite"],
    [0,1,"bas"],
    [-1,0,"gauche"],
    [0,-1,"haut"]
  ];

  const failures = new Map();
  let lastLevel = "";

  function fixMission3(g) {
    const datasets = [
      window.PYT_GAME_DATA,
      window.PYT_LEVELS,
      window.GAME_LEVELS
    ];

    const candidates = [
      g?.levelData,
      ...datasets.map(d => d?.getLevel?.(1,3))
    ];

    for(const m of candidates) {
      if(
        !m ||
        Number(m.chapter)!==1 ||
        Number(m.level)!==3
      ) {
        continue;
      }

      if(Array.isArray(m.requiredConcepts)) {
        m.requiredConcepts =
          m.requiredConcepts.filter(
            c => c!=="right"
          );
      }
    }
  }

  function stages(l) {
    const raw =
      l?.goal?.visitInOrder ||
      l?.goal?.visit ||
      [];

    const pts = (
      Array.isArray(raw) ? raw : []
    ).map(point).filter(valid);

    const end = point(
      l?.goal?.position ||
      l?.goal?.destination ||
      l?.goal
    );

    if(
      valid(end) &&
      !same(pts[pts.length-1],end)
    ) {
      pts.push(end);
    }

    return pts;
  }

  function shortest(g,a,b) {
    if(!valid(a) || !valid(b)) return null;

    const key = p => `${p.x},${p.y}`;
    const todo = [a];

    const back = new Map([
      [key(a),null]
    ]);

    for(let i=0;i<todo.length;i++) {
      const p=todo[i];

      if(same(p,b)) {
        const path=[p];

        while(
          back.get(
            key(path[path.length-1])
          )
        ) {
          path.push(
            back.get(
              key(path[path.length-1])
            )
          );
        }

        return path.reverse();
      }

      for(const [dx,dy] of dirs) {
        const q={
          x:p.x+dx,
          y:p.y+dy
        };

        if(
          q.x<0 ||
          q.y<0 ||
          q.x>=g.mapWidth ||
          q.y>=g.mapHeight ||
          back.has(key(q))
        ) {
          continue;
        }

        if(g.isBlockedCell?.(q.x,q.y)) {
          continue;
        }

        back.set(key(q),p);
        todo.push(q);
      }
    }

    return null;
  }

  function describe(g,a,b) {
    const path=shortest(g,a,b);

    if(!path) {
      return "Aucun passage libre détecté " +
        "avec les collisions actuelles";
    }

    if(path.length===1) {
      return "Tu es déjà sur cette case";
    }

    const moves=[];

    for(let i=1;i<path.length;i++) {
      const before=path[i-1];
      const after=path[i];

      const dir=dirs.find(
        ([dx,dy]) =>
          before.x+dx===after.x &&
          before.y+dy===after.y
      )?.[2];

      const last=moves[moves.length-1];

      if(last?.dir===dir) {
        last.n++;
      } else {
        moves.push({dir,n:1});
      }
    }

    const name={
      haut:"monte",
      bas:"descends",
      droite:"va à droite",
      gauche:"va à gauche"
    };

    return moves.map(
      m =>
        `${name[m.dir]} de ${m.n} ` +
        `case${m.n>1?"s":""}`
    ).join(" → ");
  }

  function ensurePanel() {
    let style=$("pyt-aide-fiable-style");

    if(!style) {
      style=document.createElement("style");
      style.id="pyt-aide-fiable-style";

      style.textContent=`
        #pyt-help-legend,
        #pyt-help-detail,
        #pyt-route-info,
        #pyt-help-after-two {
          display:none!important;
        }

        #pyt-consignes-claires {
          display:block!important;
          grid-column:1/-1;
          box-sizing:border-box;
          margin:12px 0;
          padding:14px 15px;
          background:#131f35;
          border:3px solid #ffdb75;
          border-radius:7px;
          color:#fff8eb;
          font-size:14px;
          line-height:1.55;
          overflow-wrap:anywhere;
        }

        #pyt-consignes-claires strong {
          color:#ffe180;
        }

        #pyt-consignes-claires .pyt-etape {
          margin:8px 0;
          padding:8px 10px;
          background:#27354b;
          border-left:4px solid #ffd65c;
        }

        #pyt-consignes-claires
        .pyt-etape:last-of-type {
          border-left-color:#79f0a6;
        }

        #pyt-consignes-claires .pyt-regle {
          margin-top:9px;
          color:#fff0d7;
        }

        #pyt-consignes-erreur {
          display:block;
          margin-top:12px;
          padding:10px 12px;
          background:#482a2e;
          border:2px solid #ffb36a;
          color:#fff6e4;
          white-space:normal;
        }

        #pyt-consignes-erreur[hidden] {
          display:none!important;
        }

        @media(max-width:600px) {
          #pyt-consignes-claires {
            font-size:12px;
            padding:9px;
          }
        }
      `;

      document.head.appendChild(style);
    }

    const parent=
      document.querySelector(
        "#game-screen .mission-panel-top"
      ) ||
      $("mission-instruction")?.parentElement ||
      document.querySelector(
        "#game-screen .mission-panel"
      );

    if(!parent) return null;

    let box=$("pyt-consignes-claires");

    if(!box) {
      box=document.createElement("section");
      box.id="pyt-consignes-claires";
      parent.appendChild(box);
    }

    let help=$("pyt-consignes-erreur");

    if(!help) {
      help=document.createElement("div");
      help.id="pyt-consignes-erreur";
      help.hidden=true;

      help.setAttribute(
        "role","status"
      );

      box.appendChild(help);
    }

    return {box,help};
  }

  function showInstructions(g) {
    const l=g?.levelData;
    if(!l) return;

    fixMission3(g);

    const ui=ensurePanel();
    if(!ui) return;

    const id=`${l.chapter}-${l.level}`;

    if(id!==lastLevel) {
      lastLevel=id;
      ui.help.hidden=true;
    }

    const pts=stages(l);

    const start=point(
      l.robotStart ||
      g.startState
    );

    const facing={
      E:"droite",
      W:"gauche",
      N:"haut",
      S:"bas"
    }[
      String(
        l.robotStart?.direction || "E"
      ).toUpperCase()
    ] || "flèche";

    const mission3=
      Number(l.chapter)===1 &&
      Number(l.level)===3;

    let rows="";

    if(mission3) {
      rows=`
        <div class="pyt-etape">
          <strong>1 — RECULER :</strong>
          depuis ${human(start)},
          fais <code>backward(2)</code>.
          Tu vas à gauche jusqu'au repère jaune 1.
        </div>

        <div class="pyt-etape">
          <strong>2 — INTERRUPTEUR :</strong>
          avance de 2 cases pour revenir à droite,
          tourne à gauche avec
          <code>left(90)</code>,
          puis avance de 2 cases vers le haut.
          Marche sur le bouton (repère jaune 2).
        </div>

        <div class="pyt-etape">
          <strong>3 — ARRIVÉE :</strong>
          tourne encore à gauche et
          avance de 2 cases.
          Arrête-toi sur le A vert.
        </div>
      `;
    } else {
      let from=start;

      rows=pts.map((p,i) => {
        const name=
          i===pts.length-1
            ? "ARRIVÉE A"
            : `REPÈRE ${i+1}`;

        const text=describe(g,from,p);
        from=p;

        return `
          <div class="pyt-etape">
            <strong>
              ${name} — ${human(p)} :
            </strong>
            ${esc(text)}.
          </div>
        `;
      }).join("");

      if(!pts.length) {
        rows="<div>Rejoins les éléments " +
          "indiqués dans la mission.</div>";
      }
    }

    const other=[];

    if(
      (l.objects||[]).some(
        o => g.isAutoPickupObject?.(o)
      )
    ) {
      other.push(
        "Ramasse les objets en marchant dessus."
      );
    }

    if(
      (l.objects||[]).some(
        o => g.isButtonType?.(
          String(o.type||"").toLowerCase()
        )
      )
    ) {
      other.push(
        "Un bouton s'active quand Pyt " +
        "marche sur sa case."
      );
    }

    if(
      (l.targets||[]).some(
        t => g.isDepositTarget?.(t)
      )
    ) {
      other.push(
        "Amène l'objet à son dépôt, " +
        "puis passe dessus."
      );
    }

    if(l.goal?.noCollisions) {
      other.push(
        "Aucune collision n'est autorisée."
      );
    }

    const html=`
      <strong>
        OÙ PASSER ? —
        CHAPITRE ${esc(l.chapter)},
        EXERCICE ${esc(l.level)}
      </strong>

      <div>
        Départ :
        ${
          valid(start)
            ? human(start)
            : "position de Pyt"
        }.
        Pyt regarde vers la
        <strong>${esc(facing)}</strong>.
      </div>

      ${rows}

      <div class="pyt-regle">
        <strong>Commandes :</strong>
        <code>forward(n)</code>
        avance de n cases ;
        <code>backward(n)</code>
        recule sans tourner ;
        <code>left(90)</code>
        tourne à gauche ;
        <code>right(90)</code>
        tourne à droite.
      </div>

      <div class="pyt-regle">
        <strong>Cases :</strong>
        rouge opaque avec X blanc =
        entièrement interdite ;
        contour jaune = caisse poussable ;
        cercle numéroté = étape obligatoire ;
        A vert = arrivée.
      </div>

      ${
        other.map(
          s => `
            <div class="pyt-regle">
              ${esc(s)}
            </div>
          `
        ).join("")
      }
    `;

    const temp=document.createElement("div");
    temp.innerHTML=html;

    for(const child of [...ui.box.children]) {
      if(child!==ui.help) {
        child.remove();
      }
    }

    while(temp.firstChild) {
      ui.box.insertBefore(
        temp.firstChild,
        ui.help
      );
    }
  }

  function showFailure(g,detail) {
    if(detail?.success) {
      const help=$("pyt-consignes-erreur");

      if(help) {
        help.hidden=true;
      }

      return;
    }

    const l=g.levelData;
    if(!l) return;

    const id=`${l.chapter}-${l.level}`;

    const count=
      (failures.get(id)||0)+1;

    failures.set(id,count);

    if(count<2) return;

    showInstructions(g);

    const ui=ensurePanel();
    if(!ui) return;

    const notes=[];

    if(detail.reason==="concept_missing") {
      notes.push(
        "Il manque une commande Python demandée : " +
        (detail.missingConcepts||[]).join(", ") +
        "."
      );
    }

    if(detail.reason==="wrong_destination") {
      notes.push(
        "Pyt ne finit pas sur le A vert. " +
        "Suis les repères dans l'ordre."
      );
    }

    if(
      detail.reason==="runtime_error" ||
      detail.reason==="engine_error"
    ) {
      notes.push(
        "Ton code comporte une erreur : " +
        (detail.message||"vérifie les commandes") +
        "."
      );
    }

    if(detail.reason==="object_missing") {
      notes.push(
        "Un objet obligatoire n'a pas été ramassé."
      );
    }

    if(detail.reason==="deposit_missing") {
      notes.push(
        "Il reste un objet à déposer."
      );
    }

    const bump=(g.runtimeIssues||[]).find(
      x => x.type==="collision"
    );

    if(bump) {
      notes.push(
        "Tu as essayé de marcher sur une " +
        "case interdite : " +
        human(point(bump)) + "."
      );
    }

    const checkpoints=stages(l);

    const visited=(
      g.robot?.visited||[]
    ).map(point);

    let cursor=-1;

    for(let i=0;i<checkpoints.length;i++) {
      const idx=visited.findIndex(
        (v,j) =>
          j>cursor &&
          same(v,checkpoints[i])
      );

      if(idx<0) {
        notes.push(
          "Étape manquante : " +
          (
            i===checkpoints.length-1
              ? "arrivée A"
              : `repère ${i+1}`
          ) +
          " (" +
          human(checkpoints[i]) +
          ")."
        );

        break;
      }

      cursor=idx;
    }

    if(!notes.length) {
      notes.push(
        detail.message ||
        "Vérifie ton parcours et les actions demandées."
      );
    }

    if(
      Number(l.chapter)===1 &&
      Number(l.level)===3
    ) {
      notes.push(
        "Solution pour comprendre : " +
        "backward(2), forward(2), " +
        "left(90), forward(2), " +
        "left(90), forward(2)."
      );
    } else if(
      Array.isArray(l.hints) &&
      l.hints.length
    ) {
      notes.push(
        "Indice : " +
        l.hints[
          Math.min(
            count-2,
            l.hints.length-1
          )
        ]
      );
    }

    ui.help.textContent=
      "Pourquoi ça bloque après 2 essais ? " +
      notes.join(" ");

    ui.help.hidden=false;
  }

  /* Dessiner après tous les objets et décors. */

  function draw(g) {
    const ctx=g.ctx;

    if(
      !ctx ||
      !g.levelData ||
      !g.cellRect ||
      !g.isBlockedCell
    ) {
      return;
    }

    const objects=g.logicalObjects||[];
    let count=0;

    ctx.save();

    ctx.globalAlpha=1;
    ctx.globalCompositeOperation="source-over";
    ctx.setLineDash?.([]);

    for(let y=0;y<g.mapHeight;y++) {
      for(let x=0;x<g.mapWidth;x++) {
        if(!g.isBlockedCell(x,y)) {
          continue;
        }

        const cell=g.cellRect(x,y);
        const z=Number(cell.size);

        if(
          !Number.isFinite(z) ||
          z<=0
        ) {
          continue;
        }

        const movable=objects.some(
          o =>
            o.x===x &&
            o.y===y &&
            g.isPushableObject?.(o)
        );

        const wall=(
          g.getBlockedCells?.()||[]
        ).some(
          c => same(point(c),{x,y})
        );

        ctx.save();

        ctx.globalAlpha=1;

        ctx.globalCompositeOperation=
          "source-over";

        if(movable && !wall) {
          /* Caisse mobile : bord jaune. */

          ctx.strokeStyle="#fff36a";

          ctx.lineWidth=Math.max(
            4,
            z*.09
          );

          ctx.strokeRect(
            cell.x+3,
            cell.y+3,
            z-6,
            z-6
          );
        } else {
          /*
           * Rouge OPAQUE.
           * Rectangle entier.
           * Aucun effet hachuré.
           */

          ctx.fillStyle="#a31635";

          ctx.fillRect(
            cell.x,
            cell.y,
            z,
            z
          );

          ctx.strokeStyle="#fff0c9";

          ctx.lineWidth=Math.max(
            2,
            z*.04
          );

          ctx.strokeRect(
            cell.x+1,
            cell.y+1,
            z-2,
            z-2
          );

          /* Grande croix blanche. */

          ctx.strokeStyle="#ffffff";
          ctx.lineCap="round";

          ctx.lineWidth=Math.max(
            5,
            z*.12
          );

          ctx.beginPath();

          ctx.moveTo(
            cell.x+z*.24,
            cell.y+z*.24
          );

          ctx.lineTo(
            cell.x+z*.76,
            cell.y+z*.76
          );

          ctx.moveTo(
            cell.x+z*.76,
            cell.y+z*.24
          );

          ctx.lineTo(
            cell.x+z*.24,
            cell.y+z*.76
          );

          ctx.stroke();
        }

        ctx.restore();
        count++;
      }
    }

    /* Numéroter les étapes et l'arrivée. */

    const stops=stages(g.levelData);

    stops.forEach((p,i) => {
      if(
        !valid(p) ||
        p.x<0 ||
        p.y<0 ||
        p.x>=g.mapWidth ||
        p.y>=g.mapHeight
      ) {
        return;
      }

      const c=g.cellRect(p.x,p.y);
      const z=c.size;

      ctx.save();
      ctx.beginPath();

      ctx.arc(
        c.x+z*.22,
        c.y+z*.22,
        z*.20,
        0,
        Math.PI*2
      );

      ctx.fillStyle=
        i===stops.length-1
          ? "#79f6a7"
          : "#ffe263";

      ctx.fill();

      ctx.strokeStyle="#17141c";

      ctx.lineWidth=Math.max(
        2,
        z*.05
      );

      ctx.stroke();

      ctx.fillStyle="#16151a";

      ctx.font=
        `bold ${
          Math.max(
            12,
            Math.round(z*.25)
          )
        }px sans-serif`;

      ctx.textAlign="center";
      ctx.textBaseline="middle";

      ctx.fillText(
        i===stops.length-1
          ? "A"
          : String(i+1),
        c.x+z*.22,
        c.y+z*.22
      );

      ctx.restore();
    });

    ctx.restore();

    g.__pytVisibleObstacles=count;
  }

  function install() {
    const g=window.pytGame;

    if(
      !g ||
      g.__pytVisibiliteConsignesV3
    ) {
      return;
    }

    g.__pytVisibiliteConsignesV3=true;

    const origRender=g.render;

    g.render=function(...args) {
      const result=origRender.apply(
        this,
        args
      );

      draw(this);

      return result;
    };

    const origLoad=g.loadLevel;

    if(typeof origLoad==="function") {
      g.loadLevel=function(...args) {
        const result=origLoad.apply(
          this,
          args
        );

        fixMission3(this);
        showInstructions(this);

        return result;
      };
    }

    window.addEventListener(
      "pyt:execution-result",
      event => showFailure(
        g,
        event.detail||{}
      )
    );

    window.addEventListener(
      "pyt:level-opened",
      () => requestAnimationFrame(
        () => showInstructions(g)
      )
    );

    fixMission3(g);
    showInstructions(g);
    g.render();

    console.info(
      "[PYT] Aide fiable V3 active :",
      g.__pytVisibleObstacles,
      "cases dessinées."
    );
  }

  if(document.readyState==="loading") {
    document.addEventListener(
      "DOMContentLoaded",
      install,
      {once:true}
    );
  } else {
    install();
  }
})();

/* PYT OBSTACLES ROUGES V4 */
(() => {
  const marque = "__pytObstaclesRougesV4";

  function croixRouge(ctx, x, y, taille) {
    if (
      !ctx ||
      ![x, y, taille].every(Number.isFinite) ||
      taille <= 0
    ) return;

    ctx.save();

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.filter = "none";
    ctx.shadowBlur = 0;
    ctx.setLineDash?.([]);

    // Toute la case est rouge et opaque.
    ctx.fillStyle = "#971d36";
    ctx.fillRect(x, y, taille, taille);

    // Contour rouge clair.
    ctx.strokeStyle = "#ff677c";
    ctx.lineWidth = Math.max(2, taille * 0.055);

    ctx.strokeRect(
      x + 1,
      y + 1,
      taille - 2,
      taille - 2
    );

    // Grande croix blanche.
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = Math.max(4, taille * 0.11);
    ctx.lineCap = "round";

    ctx.beginPath();

    ctx.moveTo(
      x + taille * 0.2,
      y + taille * 0.2
    );

    ctx.lineTo(
      x + taille * 0.8,
      y + taille * 0.8
    );

    ctx.moveTo(
      x + taille * 0.8,
      y + taille * 0.2
    );

    ctx.lineTo(
      x + taille * 0.2,
      y + taille * 0.8
    );

    ctx.stroke();
    ctx.restore();
  }

  function installer() {
    /*
     * Remplacer les anciennes hachures
     * transparentes dans le dessin original.
     */
    const art = window.PYTArt;

    if (art && !art[marque]) {
      art.drawBlocked = function(
        ctx,
        x,
        y,
        taille
      ) {
        croixRouge(ctx, x, y, taille);
      };

      art[marque] = true;
    }

    const jeu = window.pytGame;

    if (
      !jeu ||
      jeu[marque] ||
      typeof jeu.render !== "function"
    ) return;

    const ancienRendu = jeu.render;

    /*
     * Dessiner après les décors :
     * les obstacles ne peuvent plus
     * être cachés par les meubles.
     */
    jeu.render = function(...args) {
      const resultat = ancienRendu.apply(
        this,
        args
      );

      const ctx = this.ctx;

      if (
        !ctx ||
        !this.levelData ||
        typeof this.cellRect !== "function"
      ) {
        return resultat;
      }

      const bloquees =
        this.getBlockedCells?.() || [];

      const objets =
        this.logicalObjects || [];

      const largeur =
        Number(this.mapWidth) || 0;

      const hauteur =
        Number(this.mapHeight) || 0;

      let compteur = 0;

      for (let y = 0; y < hauteur; y++) {
        for (let x = 0; x < largeur; x++) {

          const mur = bloquees.some(c =>
            Array.isArray(c)
              ? (
                  Number(c[0]) === x &&
                  Number(c[1]) === y
                )
              : (
                  Number(c?.x ?? c?.col) === x &&
                  Number(c?.y ?? c?.row) === y
                )
          );

          if (
            !mur &&
            !this.isBlockedCell?.(x, y)
          ) {
            continue;
          }

          const cell =
            this.cellRect(x, y);

          const cx = Number(cell?.x);
          const cy = Number(cell?.y);
          const taille = Number(cell?.size);

          if (
            ![cx, cy, taille].every(Number.isFinite) ||
            taille <= 0
          ) {
            continue;
          }

          /*
           * Conserver les caisses déplaçables
           * avec leur contour jaune.
           */
          const poussable = !mur && objets.some(
            o =>
              Number(o.x) === x &&
              Number(o.y) === y &&
              this.isPushableObject?.(o)
          );

          if (poussable) {
            ctx.save();

            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation =
              "source-over";

            ctx.setLineDash?.([]);

            ctx.strokeStyle = "#ffe36e";
            ctx.lineWidth =
              Math.max(3, taille * 0.09);

            ctx.strokeRect(
              cx + 3,
              cy + 3,
              taille - 6,
              taille - 6
            );

            ctx.restore();
          } else {
            croixRouge(
              ctx,
              cx,
              cy,
              taille
            );
          }

          compteur++;
        }
      }

      this.__pytObstaclesRougesCompte =
        compteur;

      return resultat;
    };

    jeu[marque] = true;

    if (jeu.levelData) {
      jeu.render();
    }

    console.info(
      "[PYT] Obstacles rouges V4 actifs."
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      installer
    );
  } else {
    installer();
  }

  window.addEventListener("load", installer);

  window.addEventListener(
    "pyt:level-opened",
    installer
  );
})();
