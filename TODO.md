# Elite Counter — To-Do

> Ce fichier est maintenu automatiquement par Claude.
> Mis à jour quand une tâche est assignée ou complétée.

## 🎯 Feedback utilisateur — à implémenter

### Tutoriel
- [ ] **Slide 3 du tuto** : quand le joueur se trompe, la carte doit se stopper et afficher un rappel (correction visuelle + explication) avant de continuer — pas de défilement automatique si erreur

### Vitesse & difficulté ranked
- [ ] **Vitesse par défaut trop rapide** : passer la vitesse de base de 1s/carte à **2.4s/carte** en Training (plus accessible pour un débutant)
- [ ] **Premier ranked** : 1 deck, 60% de pénétration, 3s/carte
- [ ] **Progression vitesse Bronze → Master** : vitesse augmente très progressivement de **Bronze 1 → 3s/carte** jusqu'à **Master 3 → 0.42s/carte**. Valeurs intermédiaires à calculer sur 18 paliers (6 rangs × 3 sous-rangs)
- [ ] **Pénétration par sous-rang** : dans chaque rang, sous-rang 1 = 60%, sous-rang 2 = 70%, sous-rang 3 = 80%
- [ ] **Games de placement** : difficulté équivalente sous-rang 2 (70% de pénétration)

### Interface
- [ ] **UI sélection de langue** : redesigner l'écran/modal de choix de langue — jugé moche par le testeur

---

## 🛠️ Features en attente (backlog)

- [ ] Mettre le projet sous Git + backups GitHub — aujourd'hui pas de versioning (ni historique, ni filet de secours). À faire : `git init`, premier commit, créer un repo GitHub (privé), pousser. Ensuite commit + push réguliers après chaque grosse feature pour avoir un backup et un historique.
- [ ] Brancher l'achat des skins support (4,99 €/skin) sur un vrai paiement — aujourd'hui le clic "4,99 €" débloque directement en localStorage (démo). Voir aussi le paywall en fin de roadmap.
- [ ] Ajouter des sons dans l'app (changement de carte, bonne/mauvaise réponse, victoire/défaite, achat/équipement de skin, clics UI) — prévoir un toggle son ON/OFF dans les réglages
- [ ] Transformer l'app en APK Android (build mobile installable)

## 🔮 Fin de roadmap — ne jamais mentionner quand on demande quoi faire

- [ ] Supprimer le code admin `adminmagueule` avant publication
- [ ] Paywall / système d'achat réel (StoreKit / Play Billing) pour les skins support "Le Trésor de Guerre"
- [ ] App 2 séparée : mode table réaliste style Card Counter Lite

## ✅ Fait

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
