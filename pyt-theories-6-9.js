"use strict";

/*
 * PYT : COURS DES CHAPITRES 6 À 9
 *
 * Conserve le système de théorie existant.
 * Ne modifie aucun exercice ni graphisme.
 */

(() => {
  const data =
    window.PYT_GAME_DATA ||
    window.PYT_LEVELS;

  if (!Array.isArray(data?.chapters)) {
    console.warn(
      "[PYT] Impossible de charger les cours."
    );
    return;
  }

  const cours = (title, body, code) => ({
    title,
    body: Array.isArray(body) ? body : [body],
    ...(code ? { code } : {})
  });

  const contenu = {

    /* =====================================
       CHAPITRE 6 — LISTES
    ===================================== */

    6: [
      cours("Créer une liste", [
        "Une liste regroupe plusieurs valeurs dans une seule variable. On l'écrit entre crochets, en séparant les éléments par des virgules.",
        "Par exemple, distances = [2, 1, 3] mémorise trois distances pour Pyt."
      ],
`from turtle import *

distances = [2, 1, 3]
forward(distances[0])`),

      cours("Comprendre les indices", [
        "Dans une liste Python, le premier élément porte l'indice 0. L'indice 1 désigne le deuxième élément.",
        "Écris liste[indice] pour récupérer une valeur. Attention à ne pas confondre l'indice avec le nombre de cases."
      ],
`from turtle import *

distances = [2, 1]
forward(distances[0])
left(90)
forward(distances[1])`),

      cours("Parcourir une liste avec for", [
        "Une boucle for lit les valeurs d'une liste les unes après les autres. À chaque tour, la variable distance reçoit la valeur suivante.",
        "Pyt avance réellement : observe les obstacles avant d'utiliser tes distances."
      ],
`from turtle import *

distances = [1, 1, 2]

for distance in distances:
    forward(distance)`),

      cours("Liste et condition", [
        "Une liste peut aussi contenir des mots. Tu peux utiliser if pour choisir une commande selon le mot rencontré.",
        "Le bloc sous if ou else doit être indenté."
      ],
`from turtle import *

actions = ["avancer", "tourner"]

for action in actions:
    if action == "avancer":
        forward(1)
    else:
        left(90)`),

      cours("À retenir",
        "Les crochets [ ] créent une liste, [0] lit son premier élément et for permet de parcourir la liste. Pour déplacer Pyt, il faut appeler forward() avec la valeur choisie."
      )
    ],

    /* =====================================
       CHAPITRE 7 — DICTIONNAIRES
    ===================================== */

    7: [
      cours("Créer un dictionnaire", [
        "Un dictionnaire range des informations sous un nom, appelé clé. On utilise des accolades et un deux-points entre chaque clé et sa valeur.",
        "C'est utile pour nommer les distances, les angles et les choix de direction."
      ],
`from turtle import *

trajet = {"distance": 2, "angle": 90}
forward(trajet["distance"])`),

      cours("Lire une valeur avec sa clé", [
        "Pour retrouver une valeur, écris le nom du dictionnaire puis sa clé entre crochets.",
        "Par exemple, trajet[\"angle\"] récupère l'angle enregistré."
      ],
`from turtle import *

trajet = {"distance": 2, "angle": 90}

forward(trajet["distance"])
left(trajet["angle"])`),

      cours("Choisir avec if", [
        "Un dictionnaire peut contenir des mots, comme gauche ou droite. Une condition if permet de choisir une action.",
        "Utilise == pour comparer, puis indente les lignes sous if et else."
      ],
`from turtle import *

config = {"tour": "gauche"}

if config["tour"] == "gauche":
    left(90)
else:
    right(90)`),

      cours("Organiser un trajet", [
        "Rassemble les informations du parcours dans un même dictionnaire pour éviter de te tromper entre les valeurs.",
        "Les clés doivent être écrites exactement de la même façon : distance et Distance ne sont pas identiques."
      ],
`from turtle import *

config = {"pas": 2, "tour": 90}

forward(config["pas"])
left(config["tour"])`),

      cours("À retenir",
        "Les accolades { } créent un dictionnaire ; les clés nomment ses valeurs ; if peut utiliser ces valeurs pour décider d'une action. Vérifie toujours l'orthographe des clés."
      )
    ],

    /* =====================================
       CHAPITRE 8 — BOUCLES WHILE
    ===================================== */

    8: [
      cours("Répéter avec while", [
        "while recommence un bloc d'instructions tant que sa condition est vraie. Contrairement à for, tu ne connais pas forcément le nombre de répétitions.",
        "La condition est vérifiée avant chaque tour de boucle."
      ],
`from turtle import *

while front_is_clear():
    forward(1)`),

      cours("S'arrêter avant un mur", [
        "front_is_clear() vérifie si la case devant Pyt est libre. Si elle ne l'est plus, la boucle s'arrête.",
        "On peut ensuite tourner pour emprunter un autre couloir."
      ],
`from turtle import *

while front_is_clear():
    forward(1)

left(90)`),

      cours("Tester une coordonnée", [
        "position_x() indique la colonne actuelle de Pyt ; position_y() indique sa ligne.",
        "Tu peux utiliser cette valeur dans la condition du while. Vérifie que les cases menant à la coordonnée sont libres."
      ],
`from turtle import *

while position_x() < 4:
    forward(1)`),

      cours("Plusieurs boucles dans un parcours", [
        "Une première boucle peut avancer jusqu'à un obstacle. Après une rotation, une autre boucle peut terminer le trajet.",
        "Chaque boucle doit posséder une condition d'arrêt adaptée au déplacement."
      ],
`from turtle import *

while front_is_clear():
    forward(1)

left(90)

while position_y() > 1:
    forward(1)`),

      cours("Attention à la boucle infinie",
        "Si la condition ne devient jamais fausse, while ne peut pas se terminer. Dans la boucle, fais évoluer la position ou la valeur que tu testes."
      )
    ],

    /* =====================================
       CHAPITRE 9 — MISSION FINALE
    ===================================== */

    9: [
      cours("La mission finale", [
        "Tu vas réunir les notions des chapitres précédents : déplacements, variables, fonctions, conditions, boucles, listes et dictionnaires.",
        "Avant de programmer, repère le départ, l'arrivée, les obstacles et les objets de mission. Découpe le parcours en petites étapes."
      ]),

      cours("Combiner fonction, variable et for", [
        "Une variable mémorise une donnée ; une fonction regroupe des commandes ; for permet de répéter une action.",
        "Dans cet exemple, chaque appel de fonction fait avancer Pyt d'une case."
      ],
`from turtle import *

distance = 1

def faire_un_pas():
    forward(distance)

for i in range(2):
    faire_un_pas()`),

      cours("Organiser avec liste, dictionnaire et if", [
        "Une liste conserve plusieurs valeurs dans un ordre donné. Un dictionnaire leur associe des noms explicites.",
        "La condition if permet ensuite de choisir une direction selon les informations mémorisées."
      ],
`from turtle import *

trajet = [1, 2]
regles = {"tour": "gauche"}

forward(trajet[0])

if regles["tour"] == "gauche":
    left(90)

forward(trajet[1])`),

      cours("Choisir for ou while", [
        "Utilise for si le nombre de répétitions est connu. Utilise while si l'arrêt dépend d'une condition, comme la présence d'un mur.",
        "Tu peux réutiliser ces deux méthodes dans différentes parties d'une mission."
      ],
`from turtle import *

while front_is_clear():
    forward(1)`),

      cours("Méthode pour réussir les exercices", [
        "1. Observe la grille, les obstacles, les objets et les objectifs.",
        "2. Découpe le trajet en déplacements, décisions et interactions.",
        "3. Écris puis teste ton code. En cas d'erreur, lis le message de Pyt et corrige l'étape concernée.",
        "4. Vérifie les objets récupérés, les dépôts, la destination et les notions Python demandées."
      ])
    ]
  };

  /* Installer les cours dans les données du jeu. */

  for (
    const [numero, sections]
    of Object.entries(contenu)
  ) {
    const chapitre = data.chapters.find(
      c => Number(c.chapter) === Number(numero)
    );

    if (chapitre) {
      chapitre.theory = sections;
    }
  }

  /*
   * Sécurité : si l'ancien livre de théorie
   * s'ouvre mais reste vide, on le remplit.
   *
   * Pas de nouvelle fenêtre.
   * Pas de changement de navigation.
   */

  function remplirLivreVide() {
    const page =
      document.getElementById("chapter-screen");

    const corps =
      document.getElementById("course-content");

    const titre =
      document.getElementById(
        "course-chapter-number"
      );

    if (
      !page ||
      !corps ||
      !titre ||
      page.classList.contains("hidden") ||
      corps.textContent.trim()
    ) {
      return;
    }

    const numero = Number(
      titre.textContent.match(/\d+/)?.[0]
    );

    if (!(numero >= 6 && numero <= 9)) {
      return;
    }

    const chapitre = data.chapters.find(
      c => Number(c.chapter) === numero
    );

    if (!chapitre) return;

    for (const section of chapitre.theory) {
      const bloc =
        document.createElement("section");

      bloc.className = "theory-section";

      const h =
        document.createElement("h3");

      h.textContent = section.title;
      bloc.appendChild(h);

      for (const texte of section.body) {
        const p =
          document.createElement("p");

        p.textContent = texte;
        bloc.appendChild(p);
      }

      if (section.code) {
        const pre =
          document.createElement("pre");

        pre.textContent = section.code;
        bloc.appendChild(pre);
      }

      corps.appendChild(bloc);
    }
  }

  function initialiser() {
    const page =
      document.getElementById("chapter-screen");

    const corps =
      document.getElementById("course-content");

    const titre =
      document.getElementById(
        "course-chapter-number"
      );

    if (!page || !corps || !titre) {
      return;
    }

    const observer =
      new MutationObserver(remplirLivreVide);

    observer.observe(page, {
      attributes: true,
      attributeFilter: ["class", "style"]
    });

    observer.observe(corps, {
      childList: true
    });

    observer.observe(titre, {
      childList: true,
      characterData: true,
      subtree: true
    });

    remplirLivreVide();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialiser,
      { once: true }
    );
  } else {
    initialiser();
  }

  console.info(
    "[PYT] Théories des chapitres 6 à 9 chargées."
  );
})();
