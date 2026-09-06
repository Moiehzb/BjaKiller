# Hi-Lo Academy I (ex-Elite Counter) — To-Do

> Ce fichier est maintenu automatiquement par Claude.
> Mis à jour quand une tâche est assignée ou complétée.

## 🎯 Retours UI/Gameplay — session 05/09/2026 (à faire)

### Onboarding Salle d'Étude
- [x] **Préconiser "Le Déchiffrement" au 1er passage (2026-09-05, i18n complétée 2026-09-06)** — carte **Déchiffrement** mise en avant sur l'écran de sous-mode (`trainSubMode === null`, EliteCounter.jsx) tant que `save.studyHallOnboarded === false` (défaut dans `DEFAULT_SAVE`) : glow doré pulsé (`.card.beginner-glow` / `@keyframes study-glow`) + mini-badge `trainingSubMode.beginnerHint` (« Pour débuter » — traduit dans les 14 locales). Flag passé à `true` au clic sur n'importe quelle carte (Forge/Rafale/Déchiffrement) ou au retour → le glow ne réapparaît plus jamais ensuite. Build OK, vérifié au retour.

### Navigation / HUD
- [x] ~~Logo cliquable partout, fil d'Ariane avec sous-modes, HUD toujours visible, "Le Hall" cliquable~~ → fait (voir ✅ Fait).

### Hauts Faits (achievements)
- [x] ~~Afficher la récompense de chaque haut fait dans la liste des Hauts Faits~~ → fait (voir ✅ Fait).
- [x] ~~Nouveau haut fait "Le Test Avancé"~~ → fait (voir ✅ Fait).

### MMR — variable par rang ✅ codé (2026-09-05), reste à valider en jeu
> Fait : `mmrPerWin`/`mmrPerLoss` ne sont plus fixes à +20/−15. Courbe « Douce +5 » (seuils conservés) — Cuivre +30/−12 (~29 % de victoires pour monter) → Adamantium +19/−35 (~65 %). Abandon scalé par rang (= `mmrPerLoss`, plancher 0, ne relègue jamais) au lieu de −25 fixe. Granularité par rang. Build OK. Détail complet dans ✅ Fait.

**Table des valeurs (rappel rapide) :** Cuivre +30/−12 · Argent +28/−15 · Or +26/−17 · Émeraude +24/−21 · Saphir +21/−28 · Adamantium +19/−35.

**À vérifier au retour (en jeu, FR) :**
- [ ] Écran de config Ranked (« Les Portes de la Guilde ») : affiche bien +win / −loss / abandon corrects **selon le rang courant**.
- [ ] Carte Ranked de l'accueil : le sous-titre affiche bien le bon abandon (plus « −25 » figé).
- [ ] Ressenti de montée : plus rapide qu'avant partout, exigeant en haut. **Si Adamantium (ou le haut de ladder) semble encore trop lent → me dire, je baisse juste les défaites** (garde les gains, durcit à peine les seuils). À l'inverse je peux remonter/baisser toute la table.

**À faire par Claude après ta validation :**
- [x] **Bug corrigé (2026-09-06)** : deux affichages oubliés lors du passage à l'abandon scalé codaient encore « −25 » en dur — `rankedConfig.abandonWarn` (texte rouge sous le bouton « Se présenter aux Portes ») et `game.abandonMmr` (popup de confirmation en cours de partie). Passés en fonctions `({ abandon })`/`({ mmr })` et câblés sur `rank.mmrPerLoss` / `currentRank.mmrPerLoss` dans EliteCounter.jsx — fr.js only pour l'instant.
- [x] **Bug corrigé (2026-09-06)** : cliquer « Continuer » dans le popup d'abandon (ranked) laissait la partie bloquée sur l'overlay « Pause » sans jamais reprendre, car le bouton appelait `togglePause()` — qui est un no-op hors Salle d'Étude (`gameModeRef.current !== 'training'`). Extrait la moitié « reprise » de `togglePause` dans une nouvelle fonction `resumeGame()` (sans garde de mode), appelée directement par le bouton « Continuer » du popup d'abandon. `togglePause` reste inchangé pour le bouton pause de la Salle d'Étude.
- [x] **Bug corrigé (2026-09-06)** : après le fix ci-dessus, reprendre après abandon relançait le timer de la carte courante à 0 (`resumeGame` redémarrait un `setInterval` de durée pleine), donc la carte pouvait rester affichée jusqu'à 2x sa durée normale alors que le temps global défilait. `resumeGame` calcule maintenant le temps déjà écoulé sur la carte en cours (`elapsedTime % interval`) et attend seulement le temps restant (`setTimeout`) avant le premier changement de carte, puis reprend un `setInterval` normal. `elapsedTime` était déjà gelé pendant la pause (son propre `setInterval` est coupé), donc le décompte affiché ne bougeait pas — seul le rythme de défilement des cartes était faux.
- [x] **i18n propagée aux 13 autres locales (2026-09-06)** : `lobby.rankedSub`, `rankedConfig.rankedSub`, `rankedConfig.abandonWarn`, `game.abandonMmr` passés en fonctions dynamiques (paramètre `abandon`/`mmr`) dans les 13 locales — plus aucun « −25 » en dur nulle part. Build OK, parité de clés vérifiée (439 clés partout).

## 🛠️ Features en attente (backlog)

### Assets Play Store (à préparer avant soumission)
- [ ] Screenshots (4–8) — à faire depuis navigateur ou émulateur
- [ ] Feature graphic (1024×500 px) — bannière affichée en haut de la fiche Play Store
- [ ] Descriptions courte + longue FR/EN pour la fiche Play Store

### Publication Play Store — tester les achats à 4,99 € sans payer (checklist, dans l'ordre)
Le code du paywall est branché (Play Billing). Les achats ne marchent **que** via une app connue de la Play Console, installée depuis le Play Store. Le mécanisme « testeur de licence » permet de tester avec le vrai prix affiché mais une carte de test (jamais débité).

**Étapes utilisateur (manuelles) :**
- [x] 1. Créer un **compte développeur Google Play** (25 $ une fois) — vérification d'identité en cours
- [x] 2. Créer le **profil de paiement marchand** (Console → Paramètres) ✓
- [ ] 3. Créer l'app dans la console : « Hi-Lo Academy I », package `com.blackjackacademy.app`
- [ ] 4. Uploader l'**AAB signé** en piste **Test interne** (l'AAB est préparé par Claude, voir plus bas — dispo en quelques minutes, pas de review complète)
- [ ] 5. Créer les **10 produits in-app** (Monétiser → Produits → Produits intégrés) : **non consommables**, **4,99 €**, IDs **exacts** : `sp_steampunk`, `sp_cyber`, `sp_vapor`, `sp_eldritch`, `sp_norse`, `sp_synth`, `sp_noir`, `sp_cosmos`, `sp_bio`, `sp_graffiti` — puis les **activer**
- [ ] 6. S'ajouter en **testeur de licence** (Console, page d'accueil → Paramètres → Test de licence → son Gmail) → la feuille de paiement affichera 4,99 € avec « Carte de test, toujours approuvée »
- [ ] 7. S'ajouter aussi en **testeur interne** de l'app, ouvrir le lien d'opt-in, **installer depuis le Play Store** (⚠️ pas l'APK debug transféré à la main — les achats n'y marcheront pas)
- [ ] 8. Tester : achat d'un artefact (prix affiché 4,99 €, paiement test), puis « Restaurer mes achats » après désinstall/réinstall
- 💡 Re-tester un achat déjà fait : le rembourser dans la console (Gestion des commandes → Rembourser) → l'app le reverra comme non possédé

**Étapes Claude (demander quand prêt — « go keystore ») :**
- [x] Générer le **keystore de signature** release → `android/hilo-academy.jks` (alias `hilo-academy`) — ⚠️ **À sauvegarder précieusement** avec `android/key.properties`
- [x] Configurer la signature release dans Gradle + builder l'**AAB** signé → `Hi-Lo-Academy.aab` (12,3 Mo) prêt à uploader
- [x] Supprimer les codes cheat (`adminmagueule`, `Ouaisleskin`) avant publication

## 🔮 Fin de roadmap — ne jamais mentionner quand on demande quoi faire

- [ ] App 2 séparée : mode table réaliste style Card Counter Lite

## ✅ Fait

- [x] **MMR variable par rang + abandon scalé (2026-09-05)** *(implémenté + build OK, à vérifier au retour)*
  - **Avant** : `mmrPerWin`/`mmrPerLoss` fixes à +20/−15 pour les 6 rangs → seuil de progression identique partout (~43 % de victoires).
  - **Après** : valeurs **variables par rang** dans `RANKS_DEF` — base « Douce » avec **+5 MMR sur chaque victoire** et défaites remontées pour **conserver les mêmes seuils** (seuil = perte / (gain + perte)) : Cuivre +30/−12 (~29 %), Argent +28/−15 (~35 %), Or +26/−17 (~40 %), Émeraude +24/−21 (~47 %), Saphir +21/−28 (~57 %), Adamantium +19/−35 (~65 %). Montée quasi garantie en bas de ladder, exigeante en haut, et **plus rapide qu'avant** (fini le +20 uniforme).
  - **Abandon scalé par rang** : pénalité d'abandon = `mmrPerLoss` du rang (−12 à Cuivre … −35 à Adamantium) au lieu de −25 fixe. Plancher 0, ne relègue jamais (inchangé). `applyMMRChange`, EliteCounter.jsx.
  - **Granularité par rang** (pas par sous-rang) : les 3 sous-rangs partagent la même paire ; la logique lisait déjà `rank.mmrPerWin/Loss`, aucune table supplémentaire.
  - **i18n (fr.js only)** : `lobby.rankedSub` (nouveau param `abandon`) et `rankedConfig.rankedSub` (réutilise `loss`) affichent l'abandon dynamique. Les 13 autres locales codent encore « −25 » → à propager après validation.

- [x] **Accès mémoire testé (2026-09-05)** — écriture confirmée dans `C:\Users\PC1\.claude\projects\D--CLAUDE-CODE-CS-CODE-blackjack-academy-I\memory\` (les règles allow overrident bien les deny). URL de la politique de confidentialité sauvegardée en mémoire (`reference_privacy_policy.md`).

- [x] **Rituel du jour — rattrapage de série (2026-09-05)** *(implémenté + build OK, à vérifier au retour)*
  - **Écart d'1 jour** (joue tous les jours) : inchangé, 1 tentative, gagne → série +1, perd → série à 0.
  - **Écart de 2 jours** (1 jour sauté) : rattrapage — comme si le rituel manqué n'avait pas été annulé. **2 tentatives obligatoires** ce jour-là : la 1re = le rituel d'hier (le réussir remet la série à jour), la 2e = celui d'aujourd'hui, à faire dans tous les cas. Chacune suit la règle normale (gagne +1 / perd → 0) en chaîne — **il faut gagner les deux** pour que la série traverse la coupure intacte ; perdre l'une ou l'autre la remet à zéro immédiatement.
  - **Écart de 3 jours ou plus** : série perdue définitivement dès le retour, pas de rattrapage, repart normalement (1 tentative).
  - Nouveaux champs `save.daily.dayState` (état du jour en cours, dont `allWon`) + `lastResult.recovered`/`catchupPending`. Carte du lobby distingue le rituel de rattrapage (1er) du second rituel obligatoire ; écran de résultat distingue série gardée / reconstituée / rompue, + rappel s'il reste le rituel du jour à faire.
  - i18n : `lobby.dailyCatchupSub`, `lobby.dailyCatchupSecondSub`, `lobby.dailyRecovered`, `game.dailyStreakRecovered`, `game.dailyCatchupPending` — **propagées aux 14 locales (2026-09-06)**, build OK, parité vérifiée.

- [x] **Navigation / HUD — session 05/09/2026 (implémenté + build OK, à vérifier au retour)**
  - **Logo cliquable partout** : `renderHeader` simplifié (plus de mode `minimal`) — le clic sur `AppLogo` ouvre `AcademySwitcherModal` dans tous les écrans (Salle d'Étude, Ranked, L'Épreuve), pas seulement le lobby.
  - **Fil d'Ariane avec sous-modes** : `crumbMap['mode-training']` ajoute désormais un 3e maillon (« La Forge », « La Rafale », « Le Déchiffrement ») dès qu'un sous-mode est sélectionné, réutilise les clés i18n existantes (`trainingSubMode.standardTitle`, `modeName.speedrun/quiz`) — aucune nouvelle clé.
  - **HUD toujours visible** : rang, pièces, bouton Tuto et bouton Langue ne sont plus masqués hors du lobby (`renderHeader` affiche toujours le bloc de droite ; `renderCrumbs` affiche toujours les boutons Tuto/Langue, plus seulement si `nav === 'lobby'`).
  - **« Le Hall » cliquable** : 1er maillon du fil d'Ariane cliquable (curseur pointeur) hors du lobby → `goBack()` (même comportement que le bouton retour Android), raccourci maison depuis n'importe quel mode.
  - **Correctifs suite au 1er retour utilisateur** :
    - `AcademySwitcherModal` et `LanguageModal` n'étaient rendus que dans l'arbre JSX du lobby (`nav === 'lobby'`) — le clic sur le logo/le bouton langue mettait bien l'état à jour ailleurs mais aucune modal n'apparaissait. Extraits dans un helper commun `renderCommonOverlays()` appelé sur les 7 écrans (lobby, ranked, les 3 sous-écrans training, casino) → le logo ouvre désormais bien `AcademySwitcherModal` peu importe l'écran.
    - Maillon intermédiaire du fil d'Ariane (ex. « Salle d'Étude » quand on est dans « La Rafale ») rendu cliquable → `setTrainSubMode(null)` (retour au picker de sous-modes), en plus du 1er maillon « Le Hall » déjà cliquable.

- [x] **Hauts Faits — Sceau du Compteur Certifié + récompenses + « Le Test Avancé » (2026-09-05)** *(implémenté + build OK + vérifié au navigateur)*
  - **Sceau de certification (nouveau)** : un médaillon d'or festonné (`CertifiedSeal`, SVG pur DA — façon sceau de cire + coche de vérification) apparaît en haut à droite, **à gauche du rang**, dès qu'au moins un Haut Fait est débloqué. Discret + léger halo pulsé (`.certbadge` / `@keyframes seal-glow`). Clic → modal `badgeModal` (« Sceau de la Guilde » / « Compteur Certifié ») : félicitations sobres (ton DA, pas de « Bravo »), nombre de Hauts Faits scellés, **dernier Haut Fait obtenu**, et bouton « Voir mes Hauts Faits » → ouvre la liste. Nouvel état `showBadgeModal`, helpers `achName()`/`achReward()`.
  - **Récompenses affichées dans la liste** : chaque Haut Fait montre désormais sa récompense (« RÉCOMPENSE » + pièces d'or ; l'exploit secret « The Architect » affiche l'artefact « Obsidian Void »).
  - **Nouveau Haut Fait « Le Test Avancé »** (`advanced_test`, 🎖️, 500 pièces) : réussir **La Rafale** (speedrun) · 2 decks · 50 % pén. · < 25 s · compteur scellé. Débloquable **uniquement en Rafale** (`ctx.mode === 'speedrun' && ctx.cards === 52 && speedrunTime <= 25`).
  - **Fulgur déplacé hors Rafale** (demande utilisateur) : ne se débloque plus en speedrun ; devient le même exploit dans une **vraie partie chronométrée** (2 decks · 50 % · ≤ 0.45 s/carte · scellé, hors Rafale). Les deux ne se chevauchent plus.
  - i18n : `achievementsModal.reward`/`secretReward`, bloc `badgeModal` (5 clés), `challenges.advanced_test`, MAJ `challenges.flash.desc` — **14 locales, parité OK (431 clés)**.

- [x] **Retours UI — Tuto (2026-09-05)** *(implémenté + build OK, à vérifier au retour)*
  - **« Identification — carte par carte »** : réponse fausse → la barre de rappel Hi-Lo (2–6/7–9/10–A) clignote brièvement (glow doré, 2 pulses) pour attirer l'œil dessus (`HiLoRefBar`, prop `flash`, `EliteCounterTutorial.jsx`).
  - **Slide 2 « Le système Hi-Lo »** : bloc « L'intuition » (`tutorial.hilo.tipTitle/tipBody`) supprimé du rendu.
  - **Slide « Compte courant »** : bloc « La méthode » (`tutorial.count.tipTitle/tipBody`) supprimé du rendu.
  - Clés i18n laissées en données mortes (mêmes conventions que les slides précédents).

- [x] **Retours UI — Déchiffrement + slide « Les trois Voies » (2026-09-05)** *(implémenté + build OK, à vérifier au retour)*
  - **Le Déchiffrement (Salle d'Étude)** : rangée de boutons +1/0/−1 remontée du bord bas (`padding-bottom: calc(34px + safe-area-inset-bottom)`) — évite le déclenchement du geste « accueil » sur mobile. Passage à la carte suivante accéléré sur bonne réponse : 350 ms (vs 700 ms), l'erreur garde 700 ms pour laisser lire la bonne valeur (`answerQuiz`, EliteCounter.jsx).
  - **Slide « Les trois Voies » (tuto)** : suppression du rendu des 3 `mode-desc` (listes de specs façon fiche technique, ton « IA »). Les cartes gardent icône + nom + sous-titre évocateur + badge Ouverte/verrou ; intro et encart « L'Initiation » conservés. Réduction **uniforme sur les 17 langues** (changement de composant, zéro risque de traduction). Clés `*Desc` laissées en données mortes (`EliteCounterTutorial.jsx`).

- [x] **Politique de confidentialité (2026-07-21)** — `docs/privacy.html` bilingue FR/EN, hébergée sur GitHub Pages : `https://moiehzb.github.io/BjaKiller/privacy.html`. À coller dans Play Console → Policy → App content → Privacy policy (ou pendant le wizard de création d'app).

- [x] **Boucle musique lobby (2026-07-20)** — `computeLoop()` recalculé : `loopEnd` fixé à `pré-roll + 120 × 2.0 s` (bar boundary exact) au lieu du dernier échantillon audible. La queue du luth en mesure 121 ne crée plus de micro-pause.

- [x] **Paywall réel « Le Marchand » — Google Play Billing (session 06/07/2026)**
  - Plugin `cordova-plugin-purchase@13.17.2` (Play Billing Library 9) intégré via Capacitor.
  - Module `src/billing.js` : init du store, 10 produits non consommables (IDs = ids des skins `sp_*`), achat → feuille de paiement Google Play, déblocage **uniquement** après confirmation Google (`approved` → unlock + equip + `finish()`/acknowledge), resynchronisation des achats possédés au démarrage (réinstallation/changement d'appareil), prix **localisés** du Play Store affichés dans la boutique et le modal (fallback « 4,99 € » tant que le store n'a pas répondu).
  - Bouton **« Restaurer mes achats »** sous la liste du Marchand (natif uniquement).
  - Sur navigateur/desktop (dev) : déblocage démo localStorage conservé (`billingIsNative()` === false).
  - i18n : clé `shop.restore` ajoutée + `shop.forge` passé en prix dynamique `{price}` — 14 locales.
  - **Projet Android mis à niveau** (exigé par la Billing Library 9, et par le Play Store pour publier) : compileSdk/targetSdk 34→35, minSdk 22→23 (perd Android 5 uniquement), AGP 8.2.1→8.7.2, Gradle 8.2.1→8.11.1, platform-35 installée dans `D:\android-build-tools`. `build-apk.ps1` corrigé (ne copie plus un vieil APK quand Gradle échoue). Build APK OK (14,5 Mo).
  - ⚠️ Achats non testables tant que l'app n'est pas sur la Play Console (voir étapes manuelles ci-dessus).
- [x] **Retours post-install APK — validés par l'utilisateur le 06/07/2026** (volume, transcription des rangs, musique arrière-plan, vibrations, icône — plus rien en attente)
- [x] **Retours post-install APK — session 06/07/2026**
  - **Musique coupée en arrière-plan** : `music.js` suspend l'AudioContext sur `visibilitychange` (la WebView Android gardait la boucle active), reprise au retour au 1er plan.
  - **Volume général monté** : bus master + limiteur (DynamicsCompressor anti-clipping) — SFX ×2.5 (`sounds.js`), musique ×1.9 (`music.js`).
  - **Vibrations réparées** : `navigator.vibrate` ignoré par la WebView → passage au plugin natif `@capacitor/haptics` (impact/notification), repli web conservé.
  - **Transcription des rangs** : petit sous-titre traduit sous Cuivre/Argent/… (localisé ; FR→anglais car le nom est déjà FR). Lobby + ladder + stats. Table `RANK_TL` + `rankTranscription()`.
  - **Nouvelle icône d'app** : « carte + œil du compteur » (as de pique parchemin incliné, œil doré à pupille pique). Sources SVG dans `assets/`, rasterisées via sharp, densités + splash générés par `@capacitor/assets`.
- [x] **APK Android — session 05/07/2026** : app packagée en APK installable via **Capacitor 6**.
  - **App rendue 100 % hors-ligne** : Tailwind (compilateur CDN auto-hébergé `public/vendor/tailwind.js`) + 5 polices (Cinzel, EB Garamond, Share Tech Mono, Righteous, Special Elite) en local (`public/fonts/`, 16 woff2). `@import` internet retirés (EliteCounter/Tutorial/LanguageSelect). Vite `base:'./'`.
  - **Chaîne de build portable** (sans Android Studio) dans `D:\android-build-tools` : JDK 17 Temurin + SDK Android (platform-34, build-tools 34, adb). Licences acceptées via fichiers.
  - **Build** : `build-apk.ps1` (ou `npm run android:apk`) → `Blackjack-Academy.apk` (~9 Mo) à la racine. appId `com.blackjackacademy.app`.
  - ⚠️ APK *debug* non signé (usage perso). Pour Play Store : keystore + signature + Play Billing pour les artefacts payants.
- [x] **Sons in-app** — flip de carte, bonne/mauvaise réponse, victoire/défaite, achat/équipement de skin, clics UI + toggle son dans les réglages.
- [x] **Vibration (haptique)** sur bonne (tap court) / mauvaise (double buzz) réponse — jeu + tuto, toggle dédié dans le Scriptorium (`save.hapticsEnabled`).
- [x] **Musique du lobby intégrée + tuto→Training — session 05/07/2026**
  - **Compo** : « Le Seuil » composé (Web Audio, 120 mes., boucle seamless) `music/le-seuil.html` puis **mixé et validé dans LMMS** (`music/Lobby.mmpz`, backup `Lobby.backup.mmpz`). Synth TripleOscillator natif (les SF2 ne filtrent pas), percu cajón/palmas, basse orgue, flûte reverb, luth. Détails → mémoire `project-music-pipeline-furnace.md` + `LOBBY_RECAP.md` §8.
  - **Intégration** : export OGG → `public/music/le_hall.ogg`. Module `src/music.js` : lecture **Web Audio** (`AudioBufferSourceNode.loop`, pas `<audio loop>`) → boucle échantillon-exact + **rognage du silence en tête/queue** (corrige le « blanc » de boucle). Démarrage différé au 1er geste, coupée en partie (`nav === 'game'`), liée au toggle son.
  - **Volume réglable** (GainNode) : `save.musicVolume` (défaut 0.35) + slider dans le Scriptorium (icône `Music`, %). Clé i18n `settings.music` ajoutée aux 14 locales.
  - **Tuto → Training** : `onComplete` du tuto first-launch fait `setNav('mode-training')` en plus de `tutorialDone` (le skip laisse au lobby, tout débloqué).

- [x] **Refonte DA « Académie Secrète des Compteurs » + rebranding Hi-Lo Academy I — session 02/07/2026**
  - **Palette** : objet `G` refait (fonds violets profonds `#0d0a1a`/`#13102a`/`#1a1535`, or `#c9a24b`, ambre `#d4813a`, teal `#2dd4bf`, textes parchemin/lavande) — appliqué à EliteCounter.jsx + miroirs Tutorial/LanguageSelect + index.html.
  - **Typo** : Cinzel (titres, labels caps letter-spacing .22–.28em) + EB Garamond (corps) — Google Fonts en `<link>` (index.html) + `@import` des feuilles injectées. Playfair Display/Inter supprimés.
  - **Rangs renommés** : Bronze→**Cuivre**, Silver→**Argent**, Gold→**Or**, Platinum→**Émeraude**, Diamond→**Saphir**, Master→**Adamantium** (noms propres identiques dans les 4 langues, couleurs assorties). Gates relabellisées (« Cuivre → Argent »…). Emojis-médailles remplacés par le sceau SVG `RankSigil` (pentagone facetté teinté).
  - **Renommage des modes** (i18n) : Entraînement→**Salle d'Étude**, Classement→**Les Portes de la Guilde** (placement = **l'Initiation**), Casino Killer→**L'Épreuve** (nom définitif, étapes = « cercles »), Défi du jour→**Rituel du jour**, Paramètres→**Scriptorium**, Succès→**Hauts Faits**, skins→**Artefacts**, boutique→**La Salle des Artefacts**.
  - **Le Marchand** : section payante de la boutique refaite — silhouette SVG encapuchonnée (`Merchant`, zéro emoji), réplique du marchand (« Compteur… j'ai entendu parler de toi… »), 4,99 €/artefact, bouton « Acquérir ».
  - **Ton éditorial** : réécriture complète des 4 locales (FR/EN/ES/DE, 378 clés, parité vérifiée) — sobre, initiatique, sans exclamations ni emojis dans les textes. Presets de vitesse : Novice → Légende (progression d'académie).
  - **Emojis structurels → SVG/lucide** : icônes du lobby (BookOpen/DoorOpen/Flame/CalendarDays/Sparkles/Award/Gem/BarChart3/ScrollText), verrous (Lock), clé d'Initiation (KeyRound), flammes de série (Flame). Logo « BLACKJACK ACADEMY I ». Build OK.

- [x] **Défi du jour + stats améliorées — session 02/07/2026**
  - **Défi du jour** (façon Wordle) : deck seedé sur la date (`mulberry32` sur `AAAAMMJJ`, déterministe) + **difficulté calée sur le rang du joueur** (`getDailyConfig(seed, rankId, subRank)`). Volontairement **différent des games ranked** : moins de decks (1–2 en général), temps/carte un peu plus lent (×1.15 = légèrement plus simple) mais **beaucoup plus court** (~≤ 2 min, garde-fou `DAILY_MAX_SECONDS`). **Jours spéciaux** rares (~7 %, Diamond+ seulement pour rester jouables) : 8 decks à 50 % pén. mais temps/carte ×1.5 (bien plus lent) → 2–4 min. 1 tentative/jour (verrouillé ensuite), **compteur toujours caché**. **Score** : 1000 au compte exact, **−501 par unité d'écart** (peut être négatif) ; **score < 0 = manqué → série perdue** (écart ≤ 1 pardonné). Streak de jours + meilleure série + meilleur score + historique 14 jours. Coins bonus (30 + 10×streak). N'affecte **pas** le MMR ranked. Carte dédiée en tête du lobby (glow doré, ⭐ + style renforcé les jours spéciaux). Bloc résultat sur l'écran de fin.
  - **Stats améliorées** : **précision par nombre de decks** (barres 1/2/4/6/8 — le « nul à 8 decks »), **cartes comptées à vie**, **répartition des parties par mode**, + bloc **défi du jour** (série/record/historique) dans le modal Stats. Nouveaux agrégats persistés dans `stats` (`deckStats`, `modeStats`, `cardsCounted`).
  - i18n : 20 clés × 4 langues (FR/EN/ES/DE), parité 360 clés OK. Build OK.

- [x] **Config Training persistée** : decks / pénétration / durée / compteur visible sauvegardés dans `eliteSave`, restaurés au lancement (fini le reset à 1 deck · 75% · 94s). (02/07/2026)
- [x] **Suppression du code mort temporel** : `tooSlow` / `overTime` / `timeTooSlow` retirés (jamais déclenchables — les cartes défilent en auto, on ne peut perdre qu'en comptant mal), + `winRate` inutilisé du lobby, + 3 clés i18n orphelines (`game.overTime/seeResult/tooSlow`) dans FR/EN/ES/DE. (02/07/2026)
- [x] **Pavé de saisie maison pour la réponse** : l'`<input type=number>` natif (le clavier OS masquait la carte sur mobile) remplacé par un pavé `KpKey` cohérent avec le TimePicker (chiffres, ±, ⌫) + support clavier physique pour le dev. (02/07/2026)

- [x] **Slide 3 du tuto — correction visuelle** : la carte se stoppe en cas d'erreur et affiche un rappel avant de continuer (02/07/2026)

- [x] **Refonte visuelle skins — session 02/07/2026**
  - **Obsidian Void** : glow rouge (`rgba(255,60,80)`) ajouté sur les cartes rouges (symétrique au glow blanc/bleu des noires).
  - **Void Gold → renommé "Gold Chains"** : texte en or (`text-amber-400`) pour toutes les enseignes + glow gold, box-shadow spéciale de la carte supprimée. Chaîne en arc de cercle (12 maillons SVG tangentiels) dans les coins haut-droit et bas-gauche. Deux diagonales de maillons traversent la carte en X. Preview shop mis à jour (arcs + diagonales en tirets dorés).

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
