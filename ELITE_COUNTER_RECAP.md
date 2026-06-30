# ELITE COUNTER — Documentation Complète
## Blackjack Card Counting Trainer — React Single-File App

---

## STACK TECHNIQUE

- **React** (hooks : useState, useEffect, useRef)
- **Tailwind CSS** (classes utilitaires, pas de compiler)
- **Lucide React** (icônes)
- **localStorage** clé `eliteSave` (progression persistante, offline-first)
- **Single React Component** exporté en default — tout dans `EliteCounter.jsx`
- Syntax-checked avec Babel avant chaque livraison

---

## STRUCTURE DU FICHIER

```
Constantes globales (CARD_VALUES, SUITS, RANKS, CARD_SKINS, CHALLENGES, CASINO_STEPS, RANKS_DEF, PLACEMENT_GATES...)
↓
Design tokens (objet G: couleurs, CSS string injecté via <style>)
↓
Composants externes (TimePicker, CasinoCard)
↓
Composant principal EliteCounter()
  ├── State declarations
  ├── Effects (load save, auto-save, timer, card count sync, deck end)
  ├── Logic functions (buildDeck, launchGame, startRanked, startTraining, startCasinoChallenge...)
  ├── checkAnswer + applyMMRChange
  └── Render branches (nav layers: lobby, mode-ranked, mode-training, mode-casino, game)
```

---

## SYSTÈME DE NAVIGATION (nav layers)

```
'lobby'         → Écran principal
'mode-ranked'   → Config + lancement Ranked / Classement
'mode-training' → Config + lancement Training
'mode-casino'   → Config + lancement Run Casino
'game'          → Partie en cours (countdown / playing / paused / finished)
```

Pas de React Router. Navigation par `setNav(string)`. `goBack()` retourne au lobby.

---

## SKINS DE CARTES

9 skins. `CARD_SKINS` array. Achetés avec des coins, actif appliqué globalement.

| ID | Nom | Prix | Description visuelle |
|----|-----|------|----------------------|
| classic | Classic | Gratuit | Fond blanc, texte noir/rouge standard |
| gold | Gold Luxury | 300 🪙 | Fond crème-jaune, bordure or |
| royal | Royal Purple | 500 🪙 | Fond mauve clair, bordure violette |
| ice | Frozen Ice | 750 🪙 | Fond ardoise-bleu nuit, texte cyan néon |
| matrix | Matrix Code | 1000 🪙 | Fond noir-vert, texte vert |
| neon | Neon Cyber | 1400 🪙 | Fond violet-rose, texte néon |
| blood | Blood Diamond | 1900 🪙 | Fond rouge-noir, texte rouge/gris |
| voidgold | Void Gold | 2500 🪙 | Fond crème-ambre clair, texte ambré sombre |
| obsidian | Obsidian Void ◆ | Secret | Fond noir, texte blanc néon — débloqué uniquement par The Architect |

**Styling spécial** : Frozen Ice, Obsidian et Void Gold ont des `textShadow` et `boxShadow` custom sur le composant `CasinoCard`. Le composant lit `sk.id` pour adapter les couleurs de texte et les glows.

**Shop UI** : Équipé = badge gold, Équiper = bouton vert, Acheter = bouton or (si fonds suffisants) ou bouton grisé avec 🔒 prix. Les skins secrets n'affichent pas de bouton.

---

## SYSTÈME DE RANGS

6 rangs progressifs. Config fixe par rang.

| ID | Nom | Icon | XP requis | Decks | Pénétration | s/carte |
|----|-----|------|-----------|-------|-------------|---------|
| 1 | Bronze | 🥉 | 0 | 1 | 75% | 0.80 |
| 2 | Silver | 🥈 | — | 2 | 75% | 0.70 |
| 3 | Gold | 🥇 | — | 4 | 75% | 0.62 |
| 4 | Platinum | 💎 | — | 6 | 75% | 0.55 |
| 5 | Diamond | 💠 | — | 8 | 80% | 0.50 |
| 6 | Master | 👑 | — | 8 | 85% | 0.45 |

**Progression par MMR** : 0–100 par rang. +20 MMR victoire, -15 MMR défaite, -25 MMR abandon.

**Promotion** : À 100 MMR → partie de promotion (pénétration +10%, même vitesse). Victoire = rang suivant MMR 0. Défaite = promo verrouillée, re-grind jusqu'à 100 MMR naturellement.

**Abandon en ranked** = popup de confirmation avec pénalité -25 MMR. Pas de bouton pause en ranked.

**`getRankTimeLimit(rank, promoMode)`** : calcule `secPerCard × totalCards` arrondi.

---

## SYSTÈME DE CLASSEMENT (5 PARTIES)

Remplace les anciens "placement games". 5 parties fixes, chacune consomme 1 slot.

### 5 Gates dans l'ordre :

| Gate | Config | Decks | Pén. | s/carte |
|------|--------|-------|------|---------|
| 0 | Bronze → Silver | 1 | 85% | 0.80 |
| 1 | Silver → Gold | 2 | 85% | 0.70 |
| 2 | Gold → Platinum | 4 | 85% | 0.62 |
| 3 | Platinum → Diamond | 6 | 85% | 0.55 |
| 4 | Diamond → Master | 8 | 90% | 0.50 |

### Flow :
- **Gate réussie** → gate suivante (si slots restants)
- **Gate ratée** → slot suivant = rattrapage (config du rang `fromRankId`, +10% s/carte)
- **Rattrapage réussi** → retente la même gate
- **Rattrapage raté** → classement terminé, placé au rang actuel, MMR 0
- **Partie 5 gagnée** (quel que soit le type) → MMR 100 du rang obtenu
- **5/5 gates** → Diamond MMR 100 + achievement "The Architect" + skin Obsidian Void

### Données sauvegardées :
```js
placementDone: false,
placementGames: 0,       // total parties jouées (0-5)
placementWins: 0,        // gate wins
placementHistory: [],    // [{ type:'gate'|'recovery', gateId:0-4, won:bool }]
placementEnded: false,   // true si fin sur rattrapage raté
```

### Fonctions clés :
- `nextPlacementSlot(history)` → retourne le prochain slot `{ type, gateId, decks, penetration, secPerCard, timeLimit, totalCards, label }`
- `getRecoveryConfig(gateId)` → config du rang +10% s/carte
- `placementResult(history, isLastGameWin, isLastGame)` → `{ rankId, mmr }`

---

## MODES DE JEU

### 1. Mode Ranked 🏆
- Config fixe par rang actuel
- Abandon = -25 MMR (dialog de confirmation)
- Pas de pause
- Compteur invisible (pas de bouton œil)
- Donne MMR + coins

### 2. Mode Training 🎯
- Config entièrement libre : decks (1/2/4/6/8), pénétration (50-95%), durée
- **TimePicker** : 9 presets en s/carte (1.00 / 0.82 / 0.71 / 0.62 / 0.55 / 0.50 / 0.45 / 0.40 / 0.35), + stepper ±1s, + tap-to-edit clavier
- Changer decks/pénétration préserve le s/carte (recalcul auto du temps)
- Pause disponible
- Compteur visible optionnel (toggle œil mid-game)
- **Si compteur visible = ON au lancement → `countWasShownRef = true` immédiatement → aucun achievement possible**
- Donne coins uniquement

### 3. Run Casino 🔥 (nom à changer)
- 5 étapes auto-enchaînées : 1D/2D/4D/6D/8D, toutes à 90% pén, 0.40s/carte
- 10s de pause entre les étapes (compte à rebours visuel), pas de 3s countdown entre étapes
- Rater = retour à l'étape 1
- Compteur invisible impossible (pas de bouton œil)
- Achievements débloqués mid-run → mis en queue, affichés en séquence au retour au lobby
- `casinoStepConfigRef` stocke la config de chaque étape pour les stats (évite la pollution de `rankUsedRef`)

---

## ACHIEVEMENTS (7 permanents + 1 secret)

Système basé sur `ctx` passé depuis `checkAnswer`. Débloquage one-shot, pas de reset.

**Règle globale** : `countWasShown` dans le ctx bloque tous les achievements qui le mentionnent.

| ID | Nom | Condition | Coins |
|----|-----|-----------|-------|
| frame_perfect | Frame Perfect | 1 deck, ≤0.40s/c, compteur caché | 300 |
| no_mercy | No Mercy | Gate Gold→Platinum (gateId 2), premier essai, compteur caché | 500 |
| the_wall | The Wall | 6 decks, ≥90% pén, ≤0.50s/c, compteur caché | 750 |
| blind_run | Blind Run | 8 decks, ≤0.45s/c, compteur caché | 1000 |
| iron_streak | Iron Streak | 10 victoires consécutives, avg s/c ≤0.55, compteur caché | 1400 |
| full_burn | Full Burn | 8 decks, ≥95% pénétration, compteur caché | 1900 |
| casino_complete | Casino Ready | Terminer le Run en entier | 2500 |
| perfect_placement | The Architect (secret) | 5/5 gates en classement | Skin Obsidian |

**Toast** : slide-down à l'entrée (`.entering`), slide-up à la sortie (`.leaving`), 2.6s visible + 0.4s animation sortie.

**`showAchievementToast(ach, delay)`** : gère l'auto-dismiss avec les deux setTimeout.

---

## DÉFIS ACTIFS : countWasShown

`countWasShownRef` = ref React qui track si le compteur a été affiché pendant la partie.

- En training : initialisé à `trainShowCount` directement dans `launchGame(…, initialCountShown=trainShowCount)`
- Mid-game : le bouton œil fait `countWasShownRef.current = true` quand activé
- En casino : `casinoCountShownRef` track sur tout le run (pas reset entre étapes)
- Dans `ctx` : `countWasShown: countWasShownRef.current`

---

## STATS SAUVEGARDÉES

```js
{
  correct: 0,        // parties gagnées
  total: 0,          // parties totales
  bestTime: null,    // meilleur temps (float seconds)
  recentResults: []  // 20 dernières : { won, decks, penetration, spc, timeSec, cards, mode }
}
```

`recentResults` stocke des objets complets (pas des booléens) pour permettre l'affichage détaillé en cliquant sur chaque barre dans le modal Stats.

**Meilleur streak** : `bestStreak`, `bestStreakAvgSpc`, `bestStreakCards` sauvegardés.
**Streak courant** : `perfectStreak`, `curStreakSpcSum`, `curStreakCardsSum` pour calculer la moyenne.

---

## ÉCONOMIE

- **Coins** : monnaie unique pour acheter des skins
- Gains par partie gagnée : `10 + decks×2 + 15 (si vitesse) + 20 (si streak ≥3)`
- Gains par achievement : montant défini dans `CHALLENGES[].coins`
- Pas d'XP dans la version actuelle (supprimé lors de la refonte ranked)

---

## SAUVEGARDE (DEFAULT_SAVE)

```js
{
  // Classement
  placementDone: false,
  placementGames: 0,
  placementWins: 0,
  placementHistory: [],
  placementEnded: false,

  // Ranked
  rankId: 1,
  mmr: 0,
  inPromo: false,
  promoLocked: false,
  totalWins: 0,
  totalLosses: 0,
  perfectStreak: 0,
  bestStreak: 0,
  bestStreakAvgSpc: null,
  bestStreakCards: 0,
  curStreakSpcSum: 0,
  curStreakCardsSum: 0,

  // Économie
  coins: 0,
  unlockedSkins: ['classic'],
  activeSkin: 'classic',

  // Achievements
  unlockedAchievements: [],

  // Stats
  lastPlayDate: '',
  stats: { correct: 0, total: 0, bestTime: null, recentResults: [] },

  // Casino (runtime, pas persisté entre sessions)
  casinoChallenge: { active: false, currentStep: 0, countShownThisRun: false },
}
```

---

## COMPOSANTS NOTABLES

### `CasinoCard({ rank, suit, suitName, skin, flash })`
Carte de casino stylisée. Adapte couleurs texte + glows selon le skin. `flash` déclenche l'animation `.canim` (0.08s, scale 0.97→1).

### `TimePicker({ value, onChange, totalCards })`
Sélecteur de durée training. 9 presets s/carte, stepper ±1s, tap-to-edit clavier. Préserve le ratio s/carte quand `totalCards` change.

---

## FONCTIONS PRINCIPALES

| Fonction | Rôle |
|----------|------|
| `buildDeck(decks, pen)` | Crée et mélange un deck, applique la pénétration |
| `launchGame(decks, pen, timeSec, mode, skipCountdown, initialCountShown)` | Lance une partie (countdown ou direct) |
| `startRanked()` | Détermine le prochain slot (placement/promo/ranked) et lance |
| `startTraining()` | Lance en training avec config libre |
| `startCasinoChallenge()` | Lance le Run Casino depuis l'étape 0 |
| `advanceCasinoStep(won)` | Gère succès/échec d'une étape casino, déclenche les 10s |
| `checkAnswer()` | Valide la réponse, calcule stats/streak/ctx, check achievements, dispatch MMR |
| `applyMMRChange(won, abandon)` | Applique le delta MMR selon le mode |
| `nextPlacementSlot(history)` | Retourne le prochain slot de classement |
| `showAchievementToast(ach, delay)` | Affiche le toast avec slide-in/out automatique |
| `flushPendingAchievements()` | Affiche les achievements mis en queue (mode casino) |
| `goBack()` | Retour lobby + cleanup timers + flush achievements |

---

## CE QUI RESTE À FAIRE (BACKLOG)

### Haute priorité
1. **Tutoriel** first-launch : enseigner Hi-Lo (2-6 = +1, 7-9 = 0, 10-A = -1), montrer comment compter, walkthrough des modes
2. **Renommer "Run Casino"** — le nom actuel ne convainc pas
3. **Paywall** : 5.99€ one-time (StoreKit/Play Billing en prod, localStorage en démo) débloque Ranked + Run Casino

### Moyen terme
4. **App 2 séparée** : Mode table réaliste (style Card Counter Lite) — cartes distribuées vers des positions de joueurs, simulation vraie partie de blackjack
5. **Onboarding** : Écran d'accueil avant le lobby pour les nouveaux
6. **Animations** : Transitions entre nav layers, confetti sur achievement rare

### Améliorations UX
7. **Statistiques étendues** : courbe de précision dans le temps, distribution des s/carte
8. **Export/Import** progression (JSON → presse-papier) pour backup
9. **Mode offline PWA** avec Service Worker
10. **Sons** : tick par carte, son de victoire/défaite

---

## BUGS CONNUS / POINTS D'ATTENTION

1. **`launchGame` écrase `countWasShownRef`** — corrigé via le paramètre `initialCountShown`. Ne jamais setter `countWasShownRef` avant `launchGame`.

2. **`rankUsedRef` pollue les stats casino** — corrigé via `casinoStepConfigRef`. En mode casino, toujours lire `casinoStepConfigRef.current` pour decks/pen.

3. **Achievements mid-casino** → mis en queue dans `pendingAchievementsRef`, flushés à `goBack()`. Ne jamais appeler `showAchievementToast` directement depuis `advanceCasinoStep`.

4. **React state batching** — `patchSave` et `applyMMRChange` utilisent le même snapshot `save`. L'ordre d'appel dans `checkAnswer` est : `patchSave(stats+coins)` PUIS `applyMMRChange(correct)`. Les deux lisent le même `save` closure, c'est voulu.

5. **Placement history** : `placementTierPlayedRef.current` stocke le slot complet `{ type, gateId, decks, pen, ... }` défini dans `startRanked()`. `checkAnswer` le lit pour savoir `gateId` et `slotType`.

6. **Sauvegarde locale uniquement** — progression liée au navigateur/appareil. Pas de sync. Reset via Settings (confirmation "RESET" en majuscules).
