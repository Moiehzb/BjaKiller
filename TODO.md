# Elite Counter — To-Do

> Ce fichier est maintenu automatiquement par Claude.
> Mis à jour quand une tâche est assignée ou complétée.

## 🎯 Feedback utilisateur — à implémenter

### Tutoriel
- [ ] **Slide 3 du tuto** : quand le joueur se trompe, la carte doit se stopper et afficher un rappel (correction visuelle + explication) avant de continuer — pas de défilement automatique si erreur

### Interface
- [ ] **UI sélection de langue** : redesigner l'écran/modal de choix de langue — jugé moche par le testeur

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
