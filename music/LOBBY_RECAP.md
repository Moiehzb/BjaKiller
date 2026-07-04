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
- **Reste à coder** : **Le Cloître** (45-64), **L'Ascension** (65-92), **Le Retour** (93-120) + finalisation de la **boucle seamless**.
- **Point de review en cours** : on vient de **remonter la guitare** (elle était inaudible) — en attente de confirmation utilisateur sur le dosage à La Marche.

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
| **Le Cloître** (pont) | 45–64 | 1:28–2:08 | **Contraste lumineux** : bascule vers Do majeur relatif OU vamp hypnotique Fmaj7⇄Cadd9 (façon Corridors). **Synthé se tait, la FLÛTE porte le thème** (respiration). Percu coupée. |
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
| **Flûte** | **porte le thème au Cloître** quand le synthé se tait | **PAS ENCORE CODÉE** | voix soutenue = reprend la fonction du lead sans encombrer le registre pincé. |
| **Percu légère** | cajón (grave 1, claque 4) + palmas | vel ~0.9 / 0.7 / 0.4 | palmas ternaires ; un peu plus vivantes à La Marche. |
| **Réverbe** | petite salle | `wet = 0.32`, IR 1.8 s | ⚠️ garder modeste (cf. §6). |

---

## 5. Architecture du code (`le-seuil.html`)

Tout est dans un `<script>` unique (IIFE). Ordre : constantes → utilitaires (`f` note→Hz, `ks` Karplus-Strong) → instruments (`pluck`, `luteNote`, `harpRoll`, `guitarArp`, `guitarFlurry`, `bassNote`, `synthNote`+`THEME`/`THEME_B`, `cajonBass`/`cajonSlap`/`palma`) → accords (`CH`, `ROOT`, `CELL`, `chordAt`, `sectionOf`) → **`buildEvents()`** (la partition, en temps relatifs) → transport.

**Points d'architecture importants (ne pas casser)** :
- **La partition est une LISTE D'ÉVÉNEMENTS** `{t, fn}` (temps relatif au début), construite par `buildEvents()`. `T(bar,e)` = temps **relatif** `(bar-1)*BAR + e*EIGHTH`.
- **Ordonnanceur look-ahead** (`schedulerLoop`, `setInterval` 25 ms, fenêtre 120 ms) : ne programme que le proche futur. **Indispensable** — l'ancien « tout créer d'un coup » faisait grésiller le démarrage.
- **Curseur de navigation** (`#seek`, mesures 1→`TOTAL_BARS`) : `play(fromBar)` positionne `pieceOrigin` ; on peut sauter n'importe où. Un **AudioContext neuf est créé à chaque play/seek** (`teardown()` ferme l'ancien).
- `TOTAL_BARS` = 44 pour l'instant (à passer à 120 quand tout sera codé).
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

**Le Cloître** (pont, mes. 45-64) : bascule **lumineuse** (Do majeur relatif ou vamp hypnotique Fmaj7⇄Cadd9 façon Corridors of Time), **le synthé se tait**, **coder la FLÛTE** qui porte le thème (respiration/contraste), **percu coupée**, texture aérée. Puis **L'Ascension** (climax) et **Le Retour** (outro + bouclage seamless E7→Am).

Références analysées (dans `.midi/`, via parser maison — voir méthodologie) : **Gerudo Valley** (F♯m harmonique, cadence andalouse = ADN flamenco), **Corridors of Time** (loop hypnotique 2 accords), **Schala** (Fm, min-maj7/napolitain), **Terra** (Si maj penché sur le vi), **Pallet Town** (Sol maj diatonique, harmonie lente).
