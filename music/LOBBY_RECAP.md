# Lobby « Le Seuil » — Récap complet (Blackjack Academy I)

> **But de ce doc** : permettre à n'importe quelle session (fraîche, sans souvenir du chat) de reprendre la composition **immédiatement**, sans redemander une décision déjà tranchée. Source de vérité pour le morceau du lobby. Le **code fait foi** pour les valeurs exactes ; ce doc fait foi pour les **intentions et décisions**.
>
> Méthodologie générique réutilisable (comment on bosse) → voir `music/METHODE_COMPOSITION.md`.

---

## 0. En un coup d'œil

- **Fichier unique qui grandit** : `music/le-seuil.html`. On l'ouvre dans le navigateur (double-clic, `file://`), on clique **« Franchir le seuil »**. Curseur = navigation par mesure. **Ne PAS créer de fichiers séparés** (décision utilisateur).
- **Banc de diagnostic** : `music/diagnostic.html` — joue chaque instrument isolément (+ tests « silence » et « sinus pur » pour écarter le matériel). À rouvrir dès qu'un son paraît buggé.
- **Moteur** : Web Audio API, 100 % synthèse offline (aucun sample, aucun fetch). Marche en `file://`.
- **Sections codées + validées à l'oreille** : **Le Seuil** (mes. 1-12), **L'Appel** (13-28), **La Marche** (29-44).
- **Codé + validé à l'oreille** : **Le Cloître** (45-64) — pont lumineux (vamp **Cadd9⇄Fmaj7**). Flûte : ✅ **mélodie AABA validée**. Accompagnement : ✅ **texture progressive** + 2 moments hors-grille (harpe beat 2 mes.48, luth beat 1 mes.56).
- **Codé, à valider à l'oreille** : **L'Ascension** (65-92) + **Le Retour** (93-120) + **boucle seamless** (mes. 120 E7 → mes. 1 Am via `play(1)`). `TOTAL_BARS=120`.
- **Reste** : validation à l'oreille + éventuels ajustements de mix.
- **Journal / points de sauvegarde** : voir **§8 (Journal)** tout en bas — mis à jour à **chaque étape stable** (le plus récent en haut). Les **valeurs exactes = le code** ; le Journal ne logue **pas** les micro-réglages.

---

## 1. Le brief

App **Blackjack Academy I** — DA « Académie Secrète des Compteurs », **dark academia / médiéval mystique** (violets profonds, or, Cinzel + EB Garamond, zéro emoji, SVG). Voir `CLAUDE.md`.

**Musique du lobby**, direction émotionnelle : **mystérieuse, initiatique, PAS triste**, médiévale-mystique. Doit **boucler** sous l'UI sans lasser (écoute longue).

**Instrumentation** (brief initial + ajouts validés en cours de route) :
- Synthé analogique en **lead**
- Guitare **flamenco**
- **Harpe** en soutien
- Percussions **légères**
- **+ Luth** et **+ Flûte** (ajoutés ensuite — collent au médiéval-mystique ; traités en **invités ponctuels**, pas en couches permanentes, pour ne pas saturer)

---

## 2. Décisions VERROUILLÉES (fiche technique)

| Paramètre | Valeur | Notes |
|---|---|---|
| **Tonalité** | **La mineur andalou** | teinté phrygien-dominant sur le V |
| **Cellule harmonique** | **Am(add9) – G – Fmaj7 – E7(♭9)** | i – ♭VII – ♭VI – V7 (cadence andalouse) ; 1 accord / mesure |
| **Couleur** | Sol♯ + Fa(♭9) sur le E7 | épice flamenco / « qui appelle » |
| **Boucle seamless** | E7 → Am | le morceau finit sur le V qui rappelle le i du début ; texture de fin = texture de début |
| **Gamme mélodie** | La mineur pentatonique (La-Do-Ré-Mi-Sol) | + Sol♯ sur le E7, + Fa (♭9) en couleur |
| **Métrique** | **6/8** | « lilting mystique / conte » |
| **Tempo** | noire pointée ≈ **60** | mesure = **2.0 s**, croche = 180. Cajón sur temps **1 & 4**, palmas ternaires |
| **Durée cible** | **4 min = 120 mesures** | through-composé sur la cellule unique |
| **Arc émotionnel** | par **empilement/retrait de couches**, PAS par le tempo | (technique tirée de Terra/Schala) |

### Plan des 6 sections (mesure = 2.0 s)

| Section | Mes. | Temps | Intention |
|---|---|---|---|
| **Le Seuil** (intro) | 1–12 | 0:00–0:24 | Seuil/atmosphère. Basse + harpe lointaine + guitare (arrière-plan, entre mes.5) + luth (ornements). Pas de percu. S'ouvre progressivement. |
| **L'Appel** (thème A) | 13–28 | 0:24–0:56 | Le **synthé-lead** pose le thème. Percu entre (cajón 1&4 + palmas). Thème énoncé 2× (13-20, 21-28). |
| **La Marche** (var. A') | 29–44 | 0:56–1:28 | Plus d'élan. Thème **orné** (THEME_B). **Basse pulse sur 1&4**. **Guitare « flammes »** (doubles-croches). |
| **Le Cloître** (pont) | 45–64 | 1:28–2:08 | **Contraste lumineux** : ✅ **vamp hypnotique Cadd9⇄Fmaj7** (I⇄IV de Do majeur relatif, façon Corridors) — décidé. **Synthé se tait, la FLÛTE porte le thème** (respiration, Sol♯→Sol). Percu/guitare/luth coupés. |
| **L'Ascension** (climax) | 65–92 | 2:08–3:04 | Retour Am, arrangement **plein**, thème complet + harmonies, pic par les couches. **Pas de luth** (anti-saturation). |
| **Le Retour** (outro) | 93–120 | 3:04–4:00 | **Dé-empilement** jusqu'à la texture d'ouverture (luth revient ici). Mes. 120 (E7) → mes. 1 (Am) = jointure invisible. |

---

## 3. Le thème principal

Défini dans le code comme `THEME` (const, dans `le-seuil.html`). Forme (question/réponse sur 8 mesures) :
- **Antécédent** (cell 1) : montée pentatonique **La-Do-Mi**, puis descente **par paires** (Ré-Si / Do-La / Si-**Sol♯**) qui se pose sur le **Sol♯** = sensible, tension flamenco « qui appelle » et reste en suspens.
- **Conséquent** (cell 2) : **envol à l'octave (La5)** au climax, puis **résolution sur La**. Couleur Fa/Mi (maj7 sur le Fmaj7).
- **Variation `THEME_B`** (La Marche) : même ossature, plus **fleurie** (croches qui coulent, plus de mouvement) — garde l'envol A5 et la résolution.

C'est **accrocheur à la longue** (earworm après plusieurs écoutes), validé « ça fait médiéval » — cible atteinte. Le **thème est le motif porteur** : simple, chantable, pentatonique. La complexité vit dans l'accompagnement.

---

## 4. Rôles instrumentaux + hiérarchie de mix

**Règle d'or** : le **synthé-lead est la voix qu'on suit en priorité**. Tout le reste passe **dessous** — mais « dessous » ≠ « inaudible » (on a fait cette erreur avec la guitare, cf. §6).

| Instrument | Rôle | Niveau actuel (code) | Notes |
|---|---|---|---|
| **Synthé (lead)** | LA voix, le thème | `L = vel*0.15` | 2 saw + 2 tri (sub), vibrato retardé, filtre chantant. Entre à L'Appel. |
| **Basse** | socle **qui descend La-Sol-Fa-Mi** (⚠️ **PAS un bourdon statique** — rejeté par l'utilisateur) | `lvl = 0.12` | triangle+sinus, filtre bas. Tenue en Seuil/Appel ; **pulse sur 1&4** en La Marche. |
| **Guitare flamenco** | texture/arrière-plan **audible** (pas subliminale) | `gain = 0.12` (cut 2800) | KS. Arpèges 6/8 ; **« flammes » doubles-croches** à La Marche (`guitarFlurry`, octave supérieure). Reste sous le lead. |
| **Harpe** | vernis (arpèges roulés, gliss) | `gain = 0.17` | KS, registre haut, réverbérée = « lointaine ». |
| **Luth** | texture **discrète** des extrémités sobres (Seuil + Retour), **jamais au climax** | `gain = 0.062` | KS, double corde détunée. |
| **Flûte** | **porte le thème au Cloître** quand le synthé se tait | `fluteNote`, `L = vel*0.16`, send 0.22 | ✅ codée : sinus dominant + octave/triangle, vibrato retardé, **souffle** (bruit HP + « chiff » d'attaque). Voix soutenue = fonction de lead. Sol♯→Sol (lumière). |
| **Percu légère** | cajón (grave 1, claque 4) + palmas | vel ~0.9 / 0.7 / 0.4 | palmas ternaires ; un peu plus vivantes à La Marche. |
| **Réverbe** | petite salle | `wet = 0.32`, IR 1.8 s | ⚠️ garder modeste (cf. §6). |

---

## 5. Architecture du code (`le-seuil.html`)

Tout est dans un `<script>` unique (IIFE). Ordre : constantes → utilitaires (`f` note→Hz, `ks` Karplus-Strong) → instruments (`pluck`, `luteNote`, `harpRoll`, `guitarArp`, `guitarFlurry`, `bassNote`, `synthNote`+`THEME`/`THEME_B`, `fluteNote`+`FLUTE_CLOITRE`/`FLUTE_TAG`, `cajonBass`/`cajonSlap`/`palma`) → accords (`CH`, `ROOT`, `CELL`, `chordAt`, `VAMP`/`cloitreChord`/`chordKeyAt`, `sectionOf`) → **`buildEvents()`** (la partition, en temps relatifs) → transport.

**Points d'architecture importants (ne pas casser)** :
- **La partition est une LISTE D'ÉVÉNEMENTS** `{t, fn}` (temps relatif au début), construite par `buildEvents()`. `T(bar,e)` = temps **relatif** `(bar-1)*BAR + e*EIGHTH`.
- **Ordonnanceur look-ahead** (`schedulerLoop`, `setInterval` 25 ms, fenêtre 120 ms) : ne programme que le proche futur. **Indispensable** — l'ancien « tout créer d'un coup » faisait grésiller le démarrage.
- **Curseur de navigation** (`#seek`, mesures 1→`TOTAL_BARS`) : `play(fromBar)` positionne `pieceOrigin` ; on peut sauter n'importe où. Un **AudioContext neuf est créé à chaque play/seek** (`teardown()` ferme l'ancien).
- `TOTAL_BARS` = 64 (Cloître inclus ; à passer à 120 quand L'Ascension + Le Retour seront codés). Le Cloître n'utilise **pas** `chordAt` (cellule andalouse) mais `cloitreChord` (vamp) ; l'affichage passe par `chordKeyAt`.
- Cordes = **Karplus-Strong** (`ks()` génère un buffer, mis en cache). Réverbe = **IR généré** (bruit adouci passe-bas, décroissance rapide).
- Après chaque édition : **vérifier la syntaxe** (extraire le `<script>`, `node --check` via `vm.Script`).

---

## 6. Pièges déjà résolus (NE PAS refaire)

1. **Drone → « bruit blanc »** : un drone continu envoyé fort dans une réverbe (IR = bruit) = **voile large-bande permanent**. Résolu en : réverbe modeste + drone quasi retiré de la réverbe, PUIS le drone a été **remplacé par la basse mobile**.
2. **Bourdon statique « sans intérêt »** : une pédale de La immobile n'apporte rien dans une intro exposée → **basse qui bouge** (descend La-Sol-Fa-Mi).
3. **Nappe « qui grésille »** = ondes **sawtooth empilées** filtrées trop haut → **buzz**. Pour un pad chaud : **triangle + sinus**, octaves pures, filtre bas. (Pas de saws pour une nappe.)
4. **Grésillement au démarrage** = tous les nœuds/buffers créés d'un coup au `play()` → pic CPU. Résolu par l'**ordonnanceur look-ahead**.
5. **Guitare inaudible** : trop bien respecté « en retrait » → passée **sous le seuil d'audibilité**. « Arrière-plan » ≠ « inaudible » : un soutien doit **s'entendre**, juste sous le lead. (Remontée : gain 0.092 → 0.12, flammes sur toute La Marche.)

---

## 7. Prochaine étape

**✅ MORCEAU TERMINÉ ET VALIDÉ.** 120 mesures, boucle seamless (E7→Am). Prochaine étape : intégrer dans l'app React (voir §9).

Références analysées (dans `.midi/`, via parser maison — voir méthodologie) : **Gerudo Valley** (F♯m harmonique, cadence andalouse = ADN flamenco), **Corridors of Time** (loop hypnotique 2 accords), **Schala** (Fm, min-maj7/napolitain), **Terra** (Si maj penché sur le vi), **Pallet Town** (Sol maj diatonique, harmonie lente).

---

## 8. Journal (le plus récent en haut)

> **Point de sauvegarde par étape.** On met à jour cette fiche (ce §, + §0 « en un coup d'œil » + §7 « prochaine étape ») à **chaque état stable** : section codée, mix validé, décision verrouillée — **avant de s'arrêter**.
> **On NE logue PAS chaque micro-réglage.** Les valeurs exactes vivent dans le **code** (`le-seuil.html` fait foi). Une session de tweaks = **une** ligne consolidée (« guitare La Marche portée à X, validé »), pas dix.
> Format : `AAAA-MM-JJ — ce qui change — pourquoi`. Le plus récent en haut.

### 2026-07-05 — Morceau validé à l'oreille, intégration app à faire
- **Lobby ✅ terminé** : boucle validée, flûte dans l'Ascension retirée (tests concluants = pas nécessaire). Bouton toggle flûte (Le Cloître) conservé dans le player de démo.
- **Prochaine étape** : intégrer dans React (voir §9).

### 2026-07-05 — L'Ascension + Le Retour codés (mes. 65-120), boucle seamless
- **L'Ascension (65-92)** : 4 phases — thème A (65-72), thème B orné (73-80), climax B (81-88, palmas denses, harpe +shimmer+haute), transition (89-92, guitare arpège, perc s'allège). Pas de luth. Basse pulsée 1&4.
- **Le Retour (93-120)** : dé-empilement en 4 phases — perc s'éteint à la phase 3, guitare à la phase 3, luth revient dès la phase 2 (comme au Seuil). Dernière expo du thème (synthé) à 93-100. Harpe seule en phase 4.
- **Boucle seamless** : `play(1)` déclenché à `TOTAL_BARS*BAR + 3s`. Mes. 120 = E7 → mes. 1 = Am : jointure naturelle (cadence andalouse).
- **À valider** : mix global des sections V et VI, jointure perceptible ou invisible.

### 2026-07-04 — Le Cloître entièrement validé (mes. 45-64)
- **Flûte ✅** : forme **AABA** sur 16 mes. Thème 4 mes. (port E-G→La5, réponse Do-Ré-Mi, rebond Sol-La-Sol, Mi tenu). A+A' → dév. apex C6 + mordant → retour thème. vel=0.92, entrée franche (pas de fade-in).
- **Accompagnement ✅** : texture progressive — harpe seule (45-48) → shimmer cristallin beat 1.5 sur A' (49-52) → luth beat 4.5 impaires sur B (53-56) → luth beat 4.5 régulier retour thème (57-60) → harpe haute beat 2 tag (61-64). Crescendo harpe vel 0.44→0.57.
- **2 moments hors-grille ✅** : harpe beat **2** mes.48 (suspension fin A, avant reprise thème) + luth beat **1** mes.56 (anticipation fin développement, annonce retour thème).
- **Transition ✅** : fondu 3 mesures (cloitrePad La3 mes.43 / Mi3+Mi4 mes.44 / Sol4+Do4 mes.45).
- **Prochaine étape** : L'Ascension (mes. 65-92).

### 2026-07-04 — La Marche validée → cap sur Le Cloître
- **Guitare à La Marche : validée à l'oreille** (dosage `gain 0.12` + flammes `guitarFlurry`). Plus rien en attente sur les **mes. 1-44**.
- **En cours** : **Le Cloître** (mes. 45-64) — pont lumineux, le synthé se tait, **flûte à créer**, percu coupée. Choix harmonique à trancher (vamp Fmaj7⇄Cadd9 vs bascule Do majeur relatif).

### 2026-07-04 — Ouverture du Journal (baseline)
- **Fait & validé à l'oreille** : **Le Seuil** (mes. 1-12), **L'Appel** (13-28), **La Marche** (29-44). `TOTAL_BARS=44`.
- **En attente utilisateur** : dosage de la **guitare à La Marche** — remontée `gain 0.092 → 0.12` + flammes doubles-croches (`guitarFlurry`) sur toute la section, car elle était passée sous le seuil d'audibilité (cf. §6.5).
- **Prochaine étape** : **Le Cloître** (mes. 45-64) + coder la **flûte** (absente du code à ce jour).

---

## 9. Intégration dans l'app React — options

Le morceau est terminé en `music/le-seuil.html` (Web Audio pur). Il faut maintenant le faire jouer dans l'app. Trois options, classées par effort :

### Option A — Intégrer le Web Audio directement dans React ⭐ Recommandé
- **Ce qu'on fait** : extraire le bloc `<script>` de `le-seuil.html`, l'adapter en module ES (`lobbyMusic.js`), l'importer dans `EliteCounter.jsx`. `play()` au montage du lobby, `stop()` au démontage.
- **Avantages** : son strictement identique, 0 fichier audio à charger, fonctionne offline, pas de dépendance externe.
- **Travail estimé** : 2-4h. Points d'attention : le module ne doit pas créer l'AudioContext avant un geste utilisateur (règle navigateur) — déclencher sur le premier clic.

### Option B — Enregistrer et embedder (fichier audio)
- **Ce qu'on fait** : jouer `le-seuil.html` dans le navigateur, capturer la sortie audio (OBS, Audacity en loopback, ou `MediaRecorder` sur le contexte). Exporter en OGG Vorbis (meilleur ratio qualité/taille pour le web). Mettre dans `public/music/`, lire avec `<audio loop>` ou Howler.js.
- **Avantages** : très simple à intégrer, aucun code audio dans React.
- **Inconvénients** : ~3-4 MB pour 4 min à 128 kbps, pas génératif, boucle avec crossfade à gérer.

### Option C — Furnace (tracker chiptune/FM)
- **Ce qu'on fait** : recomposer le morceau dans Furnace (tracker open-source). Exporter en WAV/OGG. Embedder comme option B.
- **Avantages** : son stylisé cohérent "jeu vidéo", maîtrise totale du timbre.
- **Inconvénients** : projet à part entière (apprentissage tracker + recomposition complète). Le rendu sera différent du Web Audio — ni mieux ni moins bien, juste autre.
- **Quand choisir** : si on veut délibérément une couleur "chiptune/FM" plutôt que le son orchestral actuel.
