# PROJECT_RULES.md
# Jeu éducatif Python - Collège Voltaire

## 1. Contexte du projet

Nous sommes un groupe de 4 élèves de 3e année au Collège Voltaire à Genève.

Nous devons créer en environ une semaine un projet de groupe en informatique pour aider les élèves de 1re année à apprendre et pratiquer Python de manière ludique.

Le jeu est inspiré dans son principe de *The Farmer Was Replaced*, mais ce n’est pas une copie.

Le joueur contrôle/programme un robot appelé **Pyt**.

Le but est de résoudre des exercices Python dans un monde visuel rétro.

---

## 2. Membres du groupe et initiales

Chaque demande envoyée à une IA doit se terminer par **une initiale seule sur la dernière ligne** :

- `Z`
- `N`
- `T`
- `A`

Répartition actuelle :

- **Z = interface**
- **N = interface / affichage du jeu**
- **T = moteur du jeu**
- **A = moteur du jeu**

### Organisation du travail
- **Z et N travaillent ensemble** sur l’interface.
- **T et A travaillent ensemble** sur le moteur du jeu.

### Règle importante
L’IA doit utiliser l’initiale pour :
- savoir qui travaille ;
- savoir quelle zone du projet elle doit privilégier ;
- éviter de modifier inutilement la partie d’un autre membre ;
- proposer le bon nom de commit ;
- signaler si la demande touche aussi au travail d’un autre binôme.

### Si l’utilisateur oublie l’initiale
L’IA doit demander :

> Quelle est ton initiale : Z, N, T ou A ?

avant de produire du code destiné au projet.

---

## 3. GitHub / Codespaces

Nous travaillons avec **GitHub** et **Codespaces**.

Chaque membre a son **propre Codespace**.

Les modifications **ne se synchronisent pas automatiquement en temps réel**.

### Règle de base
Avant de commencer à coder :

```bash
git pull origin main
```

Après avoir codé :

```bash
git add .
git commit -m "INITIAL - description courte"
git push origin main
```

### Méthode visuelle possible
1. Aller dans **Source Control**.
2. Écrire un nom de commit.
3. Cliquer sur **Commit**.
4. Cliquer sur **Sync Changes**.

### Règle obligatoire à rappeler si besoin
- **Pull avant de coder**
- **Commit + Push / Sync Changes après**

L’IA peut le rappeler si l’utilisateur semble l’avoir oublié.

---

## 4. Noms des commits

Après chaque modification importante, l’IA doit **toujours proposer un nom de commit**.

### Format obligatoire
```text
INITIAL - description courte
```

### Exemples
```text
Z - ajout fenêtre de code
N - affichage pixel art de la grille
T - ajout collisions avec les murs
A - ajout exécution des déplacements de Pyt
```

### Règle
L’IA ne doit jamais dire seulement :
> fais un commit

Elle doit écrire par exemple :

```text
Commit conseillé :
T - ajout détection des collisions
```

Si plusieurs modifications distinctes ont été faites, l’IA peut proposer plusieurs commits séparés.

---

## 5. But pédagogique du jeu

Le jeu doit apprendre aux élèves de 1re année les notions Python réellement vues au Collège Voltaire.

Le jeu doit être :
- pédagogique ;
- progressif ;
- clair ;
- amusant ;
- cohérent avec le programme.

Le joueur écrit du **vrai Python** autant que possible.

---

## 6. Direction artistique

## Style général
Le jeu doit avoir un style :

- **rétro**
- **pixel art**
- **inspiré des jeux Zelda rétro**
- vue **2D**
- avec des personnages / objets ayant un rendu **pseudo-3D pixelisé**, un peu dans l’esprit des anciens jeux Pokémon

### Important
- le **monde du jeu** est pixelisé
- les **sprites** sont pixelisés
- les **décors** sont pixelisés
- mais le **texte des consignes**, le **texte de code**, les **menus textuels** et les **instructions** ne sont **pas pixelisés**

### Couleurs de référence
S’inspirer environ de la palette montrée par l’utilisateur :

- violet profond / bleu nuit
- rose / magenta
- cyan / turquoise
- jaune vif
- orange chaud
- noir pour contours / silhouettes

### Ce qu’il faut éviter
L’IA ne doit pas proposer :
- une interface moderne lisse type mobile app
- un style réaliste
- de la 3D réaliste
- un style non pixelisé
- une palette totalement différente sans raison

---

## 7. Personnage principal

Le robot du jeu s’appelle :

# **Pyt**

### Apparence
Pyt doit :
- être un petit robot futuriste
- être visuellement simple
- être lisible
- être cohérent avec le style rétro pixel art
- rappeler l’idée d’un robot blanc, doux et futuriste
- être inspiré visuellement de robots de type Eve / WALL-E, sans copie directe
- être rendu en **pixel art**
- s’intégrer dans une vue 2D avec rendu pseudo-3D

---

## 8. Structure générale du jeu

Le jeu est organisé en **chapitres**.

### Important
Les exercices :
- **ne sont pas générés aléatoirement**
- sont **créés à l’avance**
- sont **fixes**
- appartiennent chacun à un chapitre précis
- ont une difficulté précise

### Dans chaque chapitre
Il y a exactement **3 exercices** :

1. **Facile**
2. **Moyen**
3. **Difficile**

---

## 9. Organisation pédagogique des chapitres

Ordre conseillé et validé :

### Chapitre 1
**Déplacements de base / Turtle**
- `forward`
- `backward`
- `left`
- `right`

### Chapitre 2
**Variables et opérations**
- affectation
- calculs
- conversions simples

### Chapitre 3
**Conditions**
- comparaisons
- `if`
- `else`
- `elif`
- `and`
- `or`
- `not`

### Chapitre 4
**Boucles `for`**
- `for`
- `range(n)`
- `range(deb, fin, pas)`

### Chapitre 5
**Boucles `while`**
- `while condition`
- `while True`
- `break`

### Chapitre 6
**Listes**
- création
- `len`
- index
- appartenance
- `append`
- parcours de liste

### Chapitre 7
**Fonctions**
- `def`
- paramètres
- `return`

### Chapitre 8
**Chapitre final de combinaison**
- mélange cohérent de plusieurs notions déjà vues

### Règle pédagogique
Les notions doivent être introduites progressivement.
Ne pas sauter directement à quelque chose de trop compliqué.
Le difficile d’un chapitre peut réutiliser les notions déjà vues auparavant.

---

## 10. Technologie choisie pour construire le jeu

Le jeu sera construit avec :

# **Tkinter + Canvas**

### Pourquoi
- inclus avec Python
- pas besoin d’installation compliquée
- compatible avec Thonny en général
- adapté pour une fenêtre de jeu simple
- permet de gérer le pixel art et l’interface

### Règle
L’IA ne doit pas remplacer cela par :
- Pygame
- moteur externe
- bibliothèque nécessitant `pip install`

sauf si le groupe demande explicitement ce changement.

---

## 11. Vue et déplacement

Le jeu est en **vue 2D**.

Les déplacements sont :

- **case par case**
- **devant**
- **derrière**
- **gauche**
- **droite**

### Important
Le moteur du jeu travaille en **grille logique** et non en pixels purs.

Exemple :
- position logique : `(ligne, colonne)`

L’interface peut afficher visuellement ces cases avec une taille en pixels.

### Taille graphique recommandée
Pour l’affichage, on peut utiliser par défaut environ :

```text
64 x 64 pixels par case
```

Mais le moteur ne doit pas dépendre strictement d’une taille fixe.

---

## 12. Règle sur le code écrit par l’élève

Le joueur doit utiliser **le plus possible du vrai Python** et des notions réellement vues en cours.

### Autorisé / attendu
Le joueur peut utiliser :
- variables
- calculs
- comparaisons
- conditions
- boucles
- listes
- fonctions
- `random` si pertinent
- commandes de type Turtle vues en cours

### À éviter
Éviter autant que possible d’inventer pour l’élève des commandes comme :

```python
move()
pick_up()
clean()
drop()
```

si le même effet peut être obtenu autrement.

### Préférence
Quand c’est possible, préférer un esprit basé sur les commandes apprises :

```python
forward(1)
right(90)
forward(1)
```

plutôt que :

```python
move()
turn_right()
move()
```

---

## 13. Interactions automatiques

Le jeu doit gérer automatiquement certaines interactions.

### Exemple
Si Pyt :
- arrive sur un objet à ramasser → l’objet est ramassé automatiquement
- arrive au bon endroit de dépôt → l’objet peut être déposé automatiquement
- arrive sur une case spéciale liée à la mission → l’interaction se produit automatiquement
- essaie de traverser un mur → le mouvement est refusé

### Avantage
Cela évite d’inventer trop de fausses commandes Python pour l’élève.

---

## 14. Interface du code

Le joueur dispose d’une **fenêtre de code séparée**.

### Cette fenêtre doit :
- s’ouvrir à côté du jeu
- pouvoir être déplacée
- pouvoir être agrandie
- pouvoir être rapetissée
- pouvoir changer un peu de position
- rester claire et utilisable

### Apparence de la fenêtre de code
- fond noir ou très sombre
- texte clair / blanc
- style proche d’un éditeur de code
- police monospace normale
- le texte n’est **pas pixelisé**

Le code et les consignes ne doivent pas être en pixel art.

---

## 15. Progression dans les exercices

La progression est simple.

### Dans chaque chapitre
- exercice facile
- exercice moyen
- exercice difficile

### Déblocage
Quand un exercice est réussi, le suivant peut être débloqué.

### À éviter au début
Ne pas construire un système de score complexe dès le début.

On peut éventuellement ajouter plus tard :
- étoiles
- objectifs bonus
- récompenses secondaires

Mais ce n’est pas une priorité du MVP.

---

## 16. Fichiers du projet

Structure actuelle :

```text
python_learning_game_V6_INFO/
│
├── main.py
├── game.py
├── robot.py
├── runner.py
├── levels.py
├── ui.py
├── PROJECT_RULES.md
├── README.md
│
└── assets/
```

L’IA ne doit pas changer cette structure sans vraie nécessité.

---

## 17. Rôle exact des fichiers

### `main.py`
Lance le programme et connecte les différentes parties.

### `game.py`
Gère l’état du jeu :
- grille
- murs
- objets
- règles
- interactions
- condition de réussite

### `robot.py`
Gère Pyt :
- position
- orientation
- déplacement
- état du robot

### `runner.py`
Gère le lien entre :
- le code écrit par l’élève
- les actions de Pyt
- l’exécution du programme
- les erreurs Python
- la sécurité minimale contre les boucles infinies

### `levels.py`
Contient les chapitres et exercices :
- titre
- consigne
- chapitre
- difficulté
- données du niveau
- notion travaillée
- condition de réussite

### `ui.py`
Gère l’interface :
- affichage du monde
- affichage des textes
- fenêtres
- boutons
- fenêtre de code
- éléments visuels

### `assets/`
Ressources visuelles / images / sprites éventuels.

---

## 18. Format unique des niveaux

Tous les exercices doivent être stockés de manière uniforme.

L’IA ne doit pas inventer plusieurs formats différents.

### Format recommandé
Chaque niveau doit contenir au minimum des informations du type :

- chapitre
- numéro d’exercice
- difficulté
- titre
- consigne
- données de carte
- position de départ
- objectif
- notion Python travaillée
- condition de réussite

### Règle
Si un format existe déjà dans `levels.py`, l’IA doit le respecter.

Si le format n’existe pas encore, l’IA peut proposer un format unique, mais elle doit clairement signaler qu’il deviendra la référence.

---

## 19. Stratégie de `runner.py`

`runner.py` est une partie sensible.

### Fonctionnement attendu
Le code de l’élève est :
1. lu
2. vérifié
3. exécuté de manière encadrée
4. transformé en actions pour le jeu
5. envoyé au moteur
6. affiché / animé dans l’interface

### Important
L’IA ne doit pas inventer un système incompatible si elle n’a pas la version actuelle de `runner.py`.

### Objectif
Le code de l’élève doit pouvoir produire en interne une suite d’actions exploitables par le moteur, sans que l’élève voie forcément cette mécanique.

### Sécurité
Prévoir si possible une protection simple contre :
- boucle infinie
- plantage évident
- erreur de syntaxe
- erreur de nom
- code invalide

---

## 20. Répartition du travail par binômes

### Binôme interface
**Z + N**
- `ui.py`
- éléments visuels
- fenêtre de code
- affichage de la grille et de Pyt
- style rétro visuel

### Binôme moteur
**T + A**
- `game.py`
- `robot.py`
- `runner.py`
- logique du jeu
- interactions
- déplacement
- exécution du code

### Règle
Un binôme ne modifie pas la partie de l’autre sans nécessité.

Si une modification transversale est nécessaire, l’IA doit le signaler clairement.

---

## 21. Communication entre les fichiers

Chaque information doit avoir **une seule source principale**.

### Exemple
- la position de Pyt doit venir du moteur / robot
- l’interface ne doit pas inventer une deuxième position indépendante
- l’état de réussite doit venir du moteur
- l’interface ne doit pas recréer une autre logique de victoire

### Si une nouvelle communication est nécessaire
L’IA doit écrire clairement :

```text
Communication nécessaire :
SOURCE : ...
DESTINATION : ...
INFORMATION : ...
PROPOSITION : ...
```

---

## 22. Règles générales pour toutes les IA

L’IA doit :

- respecter la structure actuelle
- respecter les noms existants
- ne pas renommer inutilement
- ne pas recréer une deuxième architecture
- ne pas réécrire tout le projet sans raison
- demander le contenu actuel d’un fichier si elle en a besoin
- indiquer exactement où mettre le code
- proposer comment tester
- proposer un commit

---

## 23. Ce que l’IA ne doit pas faire

L’IA ne doit pas :

- inventer le contenu d’un fichier qu’elle n’a pas vu
- supposer qu’une fonction existe si elle n’est pas confirmée
- changer la techno choisie
- mélanger interface et moteur dans n’importe quel fichier
- créer plusieurs systèmes de niveaux incompatibles
- créer plusieurs systèmes de déplacement incompatibles
- imposer des notions trop avancées aux élèves de 1re
- alourdir inutilement le projet

---

## 24. Quand l’IA donne du code

Elle doit toujours préciser :

### Format obligatoire de réponse

```text
PERSONNE :
Z / N / T / A

OBJECTIF :
...

AVANT DE COMMENCER :
git pull origin main

FICHIERS CONCERNÉS :
...

MODIFICATION 1
FICHIER :
...

ACTION :
Remplacer tout le fichier
ou
Ajouter ce code à tel endroit
ou
Modifier telle fonction

CODE :
...

MODIFICATION 2
(si nécessaire)

TEST :
1. ...
2. ...
3. ...

RÉSULTAT ATTENDU :
...

COMMIT CONSEILLÉ :
INITIAL - description
```

### Règle
Ne jamais répondre avec seulement du code sans expliquer où le mettre.

---

## 25. Si une information manque

L’IA ne doit pas inventer une décision importante.

Si une décision influence :
- plusieurs fichiers
- la structure générale
- l’interface
- le moteur
- la progression pédagogique

alors elle doit poser la question avant de produire du code définitif.

---

## 26. Notions Python de référence

Le jeu doit surtout utiliser les notions vues dans les fiches fournies :

### Variables / opérations
- `=`
- `+ - * /`
- `**`
- `//`
- `%`

### Conversions
- `int()`
- `float()`
- `str()`

### Fonctions mathématiques simples
- `round()`
- `min()`
- `max()`

### Entrées / sorties
- `input()`
- `print()`

### Comparaisons
- `<`
- `>`
- `<=`
- `>=`
- `==`
- `!=`

### Logique
- `and`
- `or`
- `not`

### Conditions
- `if`
- `elif`
- `else`

### Boucles
- `for`
- `range()`
- `while`
- `break`

### Listes
- création
- index
- tranches
- `len()`
- `append()`
- `insert()`
- `remove()`
- `pop()`
- `sort()`
- `reverse()`
- `in`
- `not in`
- parcours de listes

### Fonctions
- `def`
- paramètres
- `return`

### Random
- `random`
- `randint`
- `choice`
- `shuffle`

### Turtle
Notions vues :
- `forward`
- `backward`
- `left`
- `right`
- `goto`
- `setheading`
- etc.

---

## 27. Priorités du projet

Ordre de priorité :

1. Le programme fonctionne
2. Les 4 membres restent compatibles entre eux
3. Le contenu pédagogique correspond au Python de Voltaire
4. Le code reste clair
5. Le style rétro est respecté
6. Les détails bonus viennent ensuite

---

## 28. Règle finale

Avant de donner une solution, l’IA doit vérifier :

- Est-ce que je connais l’initiale ?
- Est-ce que je sais quel binôme est concerné ?
- Est-ce que je respecte la structure actuelle ?
- Est-ce que je modifie seulement ce qui est nécessaire ?
- Est-ce que je dis exactement où mettre le code ?
- Est-ce que je propose un test ?
- Est-ce que je propose un commit ?
- Est-ce que je n’invente pas une décision importante ?

Si la réponse est non à une question importante, l’IA doit corriger cela avant de donner le code.

### Chapitre 9
# Épreuve finale

Le dernier chapitre est une **épreuve finale**.

Il ne doit introduire **aucune nouvelle notion Python**.

Il sert à vérifier que l’élève sait réutiliser et combiner les notions apprises dans les chapitres précédents.

Comme tous les autres chapitres, il contient exactement **3 exercices** :

1. **Facile**
2. **Moyen**
3. **Difficile**

### Épreuve finale facile
Doit demander de combiner plusieurs notions simples déjà vues.

Exemples :
- déplacements
- variables
- conditions
- boucle `for`

### Épreuve finale moyenne
Doit demander davantage de raisonnement.

Peut combiner :
- déplacements
- variables
- `if / elif / else`
- `for`
- `while`
- listes

### Épreuve finale difficile
C’est le niveau final du jeu.

Il doit demander à l’élève de construire un programme plus complet en utilisant plusieurs notions apprises, par exemple :

- variables
- opérations
- conditions
- `for`
- `while`
- listes
- fonctions
- paramètres
- `return`
- commandes Turtle appropriées

L’exercice doit rester réalisable uniquement avec les notions enseignées auparavant.

### Règles de l’épreuve finale

- aucun nouveau concept Python ne doit être introduit ;
- les trois exercices sont créés à l’avance ;
- ils ne sont pas générés aléatoirement ;
- la difficulté vient de la combinaison des notions et du raisonnement ;
- le niveau difficile doit être le défi le plus complet du jeu ;
- l’élève doit pouvoir utiliser plusieurs solutions correctes si elles respectent l’objectif ;
- le moteur doit vérifier le résultat obtenu, pas imposer une seule manière exacte d’écrire le code.

Une fois l’exercice difficile réussi, le jeu considère que l’élève a terminé le parcours principal.

# Capacités de Pyt

## Déplacement
- avancer
- reculer
- tourner à gauche
- tourner à droite

## Interactions automatiques
- ramasser un objet
- déposer un objet
- nettoyer une case
- pousser un objet ou une caisse
- activer un bouton
- ouvrir une porte
- recharger Pyt
- atteindre une destination
- déclencher un mécanisme lié à une case spéciale
- terminer un niveau lorsqu’un objectif est atteint

## Défis possibles
- éviter des murs
- suivre un chemin
- atteindre une destination
- ranger des objets
- trier des objets
- nettoyer une pièce
- déplacer des caisses
- activer plusieurs mécanismes
- ouvrir un passage
- récupérer plusieurs objets
- déposer des objets au bon endroit
- choisir le bon trajet
- effectuer un trajet avec une boucle
- utiliser des conditions pour choisir une action
- répéter des actions avec `for`
- répéter des actions avec `while`
- utiliser des variables pour contrôler un trajet
- utiliser des listes pour organiser plusieurs éléments
- créer une fonction pour automatiser une partie du trajet
- combiner plusieurs notions Python dans un même niveau

## Règle

Les déplacements doivent utiliser autant que possible les commandes Python/Turtle réellement vues en cours.

Les interactions comme ramasser, déposer, nettoyer, pousser, activer ou ouvrir doivent être gérées automatiquement par le moteur lorsqu’elles peuvent l’être.

L’élève ne doit pas avoir besoin d’utiliser des commandes inventées comme :

```python
pick_up()
clean()
drop()
open_door()
