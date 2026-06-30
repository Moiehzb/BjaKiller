# Elite Counter — To-Do

> Ce fichier est maintenu automatiquement par Claude.
> Mis à jour quand une tâche est assignée ou complétée.

## 🎯 Feedback utilisateur — à implémenter

### Tutoriel
- [ ] **Slide 3 du tuto** : quand le joueur se trompe, la carte doit se stopper et afficher un rappel (correction visuelle + explication) avant de continuer — pas de défilement automatique si erreur

---

## 🛠️ Features en attente (backlog)

- [ ] Brancher l'achat des skins support (4,99 €/skin) sur un vrai paiement — aujourd'hui le clic "4,99 €" débloque directement en localStorage (démo). Voir aussi le paywall en fin de roadmap.
- [ ] Ajouter des sons dans l'app (changement de carte, bonne/mauvaise réponse, victoire/défaite, achat/équipement de skin, clics UI) — prévoir un toggle son ON/OFF dans les réglages
- [ ] Transformer l'app en APK Android (build mobile installable)

## 🔮 Fin de roadmap — ne jamais mentionner quand on demande quoi faire

- [ ] Supprimer le code admin `adminmagueule` avant publication
- [ ] Paywall / système d'achat réel (StoreKit / Play Billing) pour les skins support "Le Trésor de Guerre"
- [ ] App 2 séparée : mode table réaliste style Card Counter Lite

## ✅ Fait

- [x] **Lot de retours UI — session 30/06/2026 (implémenté, à vérifier au retour)**
  - **Drapeaux SVG** : les emojis-drapeaux (🇫🇷…) s'affichaient « FR/GB/DE/ES » sur Windows. Remplacés par un composant `Flag` SVG (`LanguageSelect.jsx`, exporté) — picker de langue + bouton langue de l'accueil.
  - **Accueil** : bouton Tuto déplacé juste à gauche du bouton langue (fil d'Ariane). Le bouton langue n'affiche plus le code texte, juste 🌐 + drapeau.
  - **Réglages** : choix de langue retiré (se fait via l'accueil).
  - **Training — sélecteur de durée refait** : stepper `−` (gauche) / temps / `+` (droite), ±1s par clic. Clic sur le nombre → **clavier virtuel** (pavé 1-9, 0, C, ⌫, Valider), clampé 5–600s. Composants `KpKey` + clavier dans `TimePicker`. Ancien input natif supprimé.
  - **Rank dynamique au placement** : le rang affiché (pill accueil + stats) projette le rang provisoire via `placementResult(history)` pendant les games de placement (`displayRank` / `displayRankId`). Stats : « Classement en cours… » tant que le placement n'est pas fini.
  - i18n : clés `timePicker.keypadTitle/keypadValidate`, `stats.placementInProgress` ajoutées FR/EN/ES/DE. Build OK.
- [x] **Lot de retours UI précédent — 30/06/2026**
  - Training : flèches ±1s d'origine retirées (puis sélecteur entièrement refait, voir ci-dessus).
  - Libellés de durée → encouragement viking (Premiers pas → Légende) FR/EN/ES/DE.
  - Stat « skin le plus joué » dans les stats (`stats.skinGames`).
  - **UI sélection de langue redesignée** (sobre + stylée : drapeaux en pastille, survol doré, coche dans cercle or). ✅ remplace l'item backlog.
  - Pièces (coins) : emoji 🪙 (invisible sur Windows 10) remplacé par un composant SVG `Coin` partout (header, boutique, gains).
- [x] **Refonte ranked — sous-rangs (I/II/III) + courbe de vitesse** (30/06/2026)
  - 18 paliers : 6 rangs × 3 sous-rangs. Vitesse géométrique de Bronze I (3.00s/carte) → Master III (0.42s/carte), table `TIER_SPC`.
  - Pénétration par sous-rang : I=60%, II=70%, III=80% (identique tous rangs). Bronze I = 1 deck · 60% · 3s.
  - Placement : difficulté = sous-rang 2 (70% pén) du rang FROM.
  - Training : vitesse par défaut 2.4s/carte (+ preset « Débutant » 2.40s).
  - MMR : promotion → 10 MMR au palier suivant ; défaite >0 → descend (plancher 0, pas de relégation) ; défaite à 0 → relégation au palier précédent à 100 MMR. Système de promo (gate) retiré du ladder.
  - i18n : `game.demotion` ajouté (FR/EN/ES/DE), parité 337 clés OK. Build OK.
- [x] Git + backups GitHub — repo `Moiehzb/BjaKiller`, commit auto à chaque fin de session

- [x] Création du projet React + Vite
- [x] EliteCounter.jsx (~2200 lignes) avec tous les modes
- [x] Tutoriel first-launch intégré (TutorialOverlay)
- [x] CLAUDE.md + système mémoire en place
- [x] Node.js LTS installé (v24.18.0)
- [x] npm install effectué (64 packages)
- [x] npm run dev vérifié, app tourne
- [x] Claude Code mis à jour
- [x] Renommer "Run Casino" → "Casino Killer"
- [x] Système de progression post-tuto : Training → Ranked → Casino Killer
- [x] Catégorie de skins "⚔️ Le Trésor de Guerre" : 10 skins support premium intégrés dans l'app (mécaniques uniques), à 4,99 €/skin, avec aperçu plein écran défilant et effet pop au changement de carte
- [x] Multi-langues (i18n) **FR + EN + ES + DE** — moteur sans dépendance dans `i18n/` (registre `languages.js`, 1 fichier par langue dans `locales/`, `translate()`/`makeT()` avec interpolation + pluriels), écran de choix de langue au 1er lancement (avant le tuto), bouton langue dans l'accueil (ligne fil d'Ariane, sous le bouton Tuto) + dans les réglages. Tous les textes externalisés (336 clés × 4 langues, parité vérifiée). Ajouter une langue = 1 entrée registre + 1 fichier locale + 1 ligne dans `DICTS`.
