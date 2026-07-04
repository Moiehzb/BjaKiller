# Méthode : transformer des références musicales en composition codée

> Guide **générique et portable** — indépendant du jeu, du style ou du projet. Né du travail sur le lobby de Blackjack Academy, mais applicable à n'importe quel morceau (calme ou agressif, médiéval ou spatial, un jingle ou un thème de 5 min).
>
> **Comment l'utiliser** : une session sans souvenir peut suivre ce doc du début à la fin. Lire les **6 principes**, puis dérouler les **phases 0→6**. Les templates et checklists sont faits pour être copiés-remplis.
>
> Pour copier cette méthode dans un autre projet : ce fichier est autonome, il suffit de le déposer dans le nouveau repo.

---

## Les 6 principes cardinaux (non-négociables)

1. **Des données, pas des impressions.** On analyse les références en extrayant des **chiffres réels** (tonalité, tempo, accords, densité), pas des souvenirs vagues (« ça fait planant »). Voir Phase 1.
2. **Décider avant de coder.** Les choix qui changent *tout* (métrique, tonalité, structure) se tranchent **avant** la première note, via des **questions à choix multiples** avec reco + aperçus. Voir Phase 2.
3. **Motif porteur ≠ texture de soutien.** Une pièce mémorable = **une mélodie simple et chantable** (le motif) au-dessus d'un **accompagnement riche** (la texture). La complexité vit dans la texture, jamais dans le motif. Voir Phase 3.
4. **Hiérarchie de mix stricte.** Un seul élément est « la voix qu'on suit ». Tout le reste passe **dessous** — mais *dessous ≠ inaudible*. Un soutien doit s'entendre. Voir Phase 5.
5. **Itérer vite, en petit.** Web Audio API pour un contrôle total et une écoute instantanée. **Une section à la fois**, review, ajuste. Jamais coder 4 min à l'aveugle. Voir Phase 4.
6. **L'assistant n'entend pas — l'utilisateur juge.** Tout le workflow est conçu autour des oreilles de l'utilisateur + des outils d'**isolation** pour ne pas deviner. Voir Phase 6.

---

## Phase 0 — Cadrage

**But** : poser le brief en termes concrets et exploitables.

- [ ] **Cible émotionnelle**, incluant ce qu'il faut **ÉVITER** (« mystérieux **mais pas triste** » est plus utile que « mystérieux »).
- [ ] **Contrainte d'usage** (ex. un morceau de lobby **boucle** → ne doit pas fatiguer ; un jingle victoire dure 3 s → doit claquer). Ça oriente structure et durée.
- [ ] **Direction artistique / palette instrumentale** demandée.
- [ ] **Cible technique** : par défaut, **Web Audio API dans un fichier `.html` autonome** (zéro install, contrôle total au sample près, écoute en 10 s, marche en `file://`). Portage vers un tracker (Furnace…) seulement plus tard, si édition manuelle voulue.
- [ ] Rassembler les **références** (idéalement des fichiers MIDI — analysables ; sinon des noms de morceaux + descriptions).

---

## Phase 1 — Analyse de références (exploitable, pas vague)

**But** : extraire de chaque référence des **faits chiffrés**, puis en tirer des **principes transférables**.

### 1a. Extraire des données réelles
Si MIDI dispo : **parser les fichiers** (un parseur maison sans dépendance suffit — voir cheatsheet). Extraire par morceau :
- **Tonalité / mode** — via l'algo **Krumhansl-Schmuckler** (corrélation de l'histogramme de classes de hauteur pondéré par durée contre les profils majeur/mineur, sur les 12 toniques). Donne une estimation objective.
- **Tempo** (meta-events) et **métrique**.
- **Progression d'accords** — accord par mesure via template-matching (triades/7es), puis nettoyage enharmonique à la main.
- **Densité de notes dans le temps** (notes par fenêtre de N s) → révèle la **structure** (intro/build/climax) et si c'est une **texture constante** (hypnotique) ou un **arc**.
- **Registres** par piste/canal (exclure la batterie, canal 9).

> ⚠️ **Vérifier les faits, ne pas réciter de mémoire.** Le parseur dit la vérité ; ta mémoire d'un morceau célèbre peut se tromper. Croiser les deux.

### 1b. Fiche par référence (schéma fixe)
Pour chaque morceau, remplir le **même** schéma :
> Tonalité/mode · Progression principale · Tempo · Structure (intro/thème/variations) · **Ce qui le rend mémorable/intemporel**.

### 1c. Synthèse transversale
Le plus important : **qu'ont-ils en COMMUN malgré des styles différents ?** Ces communs = les **principes qui guideront la compo**. (Exemples réels tirés de nos 5 réfs : mineur ou majeur-penché-sur-le-vi = « doux-amer pas triste » ; couleur par le **mode/emprunts** ; **énergie par la subdivision, pas le BPM** ; **ostinato + mélodie qui varie** ; accords **enrichis** (add9/maj7) ; **rythme harmonique lent** ; **arc par les couches**.)

- [ ] Une fiche chiffrée par référence.
- [ ] Une liste de **principes communs** → deviennent le cahier des charges musical.

---

## Phase 2 — Décisions structurantes (choix multiples)

**But** : verrouiller les paramètres qui changent tout, **avant** de coder.

Poser une **question à choix multiples par fork**, avec :
- une **recommandation en 1re position** (et pourquoi),
- des **aperçus concrets** (mini-schéma ASCII du feel rythmique, de la boucle d'accords) pour comparer d'un coup d'œil,
- des options **mutuellement exclusives**.

**Forks typiques à trancher** (checklist) :
- [ ] **Métrique / feel** (ex. 4/4 vs 3/4 vs 6/8) — change radicalement le caractère.
- [ ] **Centre tonal / mode** (ex. mineur naturel vs phrygien-dominant vs autre) — dose l'exotisme.
- [ ] **Approche de structure** (voyage évolutif vs boucle courte hypnotique).
- [ ] **Tempo** (souvent déductible une fois la métrique choisie — proposer une valeur).

Puis rédiger la **fiche technique** (template ci-dessous) et la faire **valider** avant tout code.

---

## Phase 3 — Fiche technique (le contrat)

Remplir ce template et le faire valider :

```
TONALITÉ / MODE     : ______   (+ couleurs/emprunts : ______)
MÉTRIQUE / TEMPO    : ___ à ___ BPM   (durée d'1 mesure = ___ s)
CELLULE HARMONIQUE  : ______  (fonctions : ______ ; rythme harmonique = ___/mesure)
GAMME MÉLODIQUE     : ______  (notes de couleur : ______)
DURÉE / FORME       : ___ min = ___ mesures ; sections :
   1. ______  (mes. __–__)  : intention ______
   2. ...
MÉCANIQUE DE BOUCLE : ______  (comment la fin ré-enchaîne le début sans couture)
RÔLES INSTRUMENTAUX (hiérarchie) :
   - LEAD (la voix qu'on suit) : ______
   - SOUTIEN/TEXTURE           : ______ (audibles mais sous le lead)
   - ORNEMENTS/INVITÉS         : ______ (ponctuels, anti-saturation)
   - BASSE                     : ______ (fixe ? mobile ? qui suit les fondamentales ?)
   - PERCUSSION                : ______ (légère ; où frappe-t-elle ?)
```

**Distinguer explicitement motif porteur et texture** : décider *qui* porte la mélodie et *qui* accompagne. Un instrument peut changer de rôle selon la section (ex. une flûte reprend le lead quand le synthé se tait sur un pont).

---

## Phase 4 — Codage incrémental (Web Audio)

**But** : construire **section par section**, écouter, ajuster.

- [ ] **Un seul fichier qui grandit** (sauf demande contraire). Ne pas proliférer les fichiers.
- [ ] Coder **une section**, la faire écouter, itérer, **puis** passer à la suivante.
- [ ] Après **chaque** édition : **vérifier la syntaxe** (extraire le `<script>`, le passer dans `node`/`vm.Script`).

**Architecture Web Audio qui passe à l'échelle** (vaut de l'or) :
- **Instruments = fonctions de synthèse** (chacune prend un temps absolu + params).
- **Composition = DONNÉES** : une **liste d'événements** `{t, fn}` en **temps relatif** au début, construite par un `buildEvents()`. La mélodie = un tableau de notes `[mesure, position, durée, note]`.
- **Ordonnanceur look-ahead** : un `setInterval` (~25 ms) qui ne programme que les ~120 ms à venir. **Évite le grésillement** dû à la création de tous les nœuds d'un coup, **et** rend le **curseur de navigation** trivial.
- **Curseur (seek)** : pour ré-écouter une section sans repartir du début — indispensable dès que le morceau dépasse ~30 s.

---

## Phase 5 — Mixage & hiérarchie (empêcher qu'un élément « bouffe » les autres)

- [ ] **Le lead est l'élément le plus fort** (en présence perçue). Tout passe dessous.
- [ ] **Soutien = audible mais sous le lead.** Piège vécu : trop bien respecter « en retrait » → l'instrument devient **subliminal**. Calibrer à l'oreille : on doit *entendre* la guitare/harpe, pas juste la deviner.
- [ ] **L'énergie et les variations viennent des COUCHES et de la SUBDIVISION** (empiler/retirer des instruments, accélérer les arpèges), **pas** du tempo ni du seul volume. C'est ce qui tient un long morceau sans lasser.
- [ ] **Niveaux = un chiffre réglable** chacun (gain par instrument, vélocité par section). Itérer : « encore un peu / c'est bon / trop », section par section.
- [ ] **Garder la réverbe modeste.** Une réverbe forte à IR bruitée, convoluée sur une source tenue, produit un **voile de bruit blanc**. Sends faibles, wet modéré, IR courte et adoucie.

---

## Phase 6 — Boucle de review (l'assistant n'entend pas)

- [ ] **L'utilisateur est le juge.** Lui donner des **consignes d'écoute précises** (« le lead ressort-il au-dessus ? la guitare est-elle audible ? l'ambiance tient-elle ? »), pas un vague « c'est bon ? ».
- [ ] **Quand un son paraît buggé : ISOLER, ne pas deviner.** Construire un **banc de test** avec un bouton par instrument (solo) **+ deux tests matériel** : « silence » (contexte actif mais muet) et « sinus pur » — s'ils grésillent, c'est le **matériel/navigateur** de l'utilisateur, pas le code. Cette isolation a résolu un « bruit blanc » en une passe après un diagnostic à distance raté.
- [ ] **Rapport fidèle** : dire ce qui est fait / à faire, ne pas survendre. Après édition, revalider la syntaxe.
- [ ] Ouvrir le fichier pour l'utilisateur (sur son poste) pour raccourcir la boucle.

---

## Cheatsheet technique — Web Audio (recettes qui sonnent bien, pièges)

**Note → fréquence** : `440 * 2^((midi-69)/12)`, midi = `(octave+1)*12 + classe`.

**Parser MIDI maison** (sans dépendance) : lire `MThd` (format/ntracks/division), puis chaque `MTrk` ; delta-times en **VLQ** ; gérer le **running status** ; meta 0x51 tempo, 0x58 métrique, 0x59 tonalité, 0x2F fin ; events 0x8n/0x9n note off/on. Accumuler les notes `{start,end,pitch,chan}`.

**Krumhansl-Schmuckler (tonalité)** : histogramme des 12 classes pondéré par durée ; pour chaque tonique (12) et mode (maj/min), corrélation de Pearson avec le profil K-K décalé ; le max = la tonalité.

**Cordes pincées = Karplus-Strong** : buffer, exciter les `N = sr/freq` premiers échantillons avec du bruit (adoucissable), puis `y[i] = decay*(damp*(y[i-N]+y[i-N+1])/2 + (1-damp)*y[i-N])` ; normaliser ; jouer comme `AudioBuffer`. Varier `decay`/`bright`/`damp`/filtre par instrument (harpe brillante longue, guitare chaude, luth court + double corde détunée).

**Nappe / pad chaud** : **triangle + sinus** en octaves, léger désaccord, **filtre passe-bas bas** (2 étages). ⚠️ **Jamais des sawtooth empilées** filtrées haut → ça *buzz* (perçu comme du bruit).

**Réverbe** : `ConvolverNode` avec IR **généré** = bruit décroissant **adouci** (passe-bas 1 pôle), **court** (~1.8 s), décroissance rapide (`^3`). Rester **modeste** (sends ~0.1–0.2, wet ~0.3).

**Lead analogique** : 2 saw détunées + sub triangle, **vibrato retardé** (LFO ~5 Hz sur `detune`, profondeur montant en ~0.3 s), **enveloppe de filtre** (attaque brillante → repli), attaque douce (chant, pas pluck).

**Percussion synthétique** : cajón grave = sinus 130→60 Hz à décroissance rapide ; claque/palma = burst de bruit filtré (highpass/bandpass) très court ; varier via `bufferSource.start(t, offsetAléatoire)` pour éviter l'effet « photocopie ».

**Transport** : recréer un **AudioContext neuf** à chaque play/seek (état propre) ; `ctx.resume()` défensif ; **limiter** (`DynamicsCompressor`) en bout de chaîne ; volume master réglable.

**Anti-grésillement** : ne **jamais** tout programmer d'un coup au `play()` → ordonnanceur look-ahead obligatoire dès que la pièce grossit.

---

## Résumé (le squelette)

**Cadrer** (cible + ce qu'on évite + Web Audio) → **Analyser** (données réelles + principes communs) → **Décider** (choix multiples + fiche technique validée) → **Coder** (section par section, événements + look-ahead) → **Mixer** (lead au-dessus, soutien audible, énergie par les couches) → **Reviewer** (oreilles de l'utilisateur + isolation). Motif porteur simple, texture riche, itérer petit.
