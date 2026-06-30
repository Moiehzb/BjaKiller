# Elite Counter — Blackjack Card Counting Trainer

## Lancer l'app
```
npm install   (une seule fois)
npm run dev   (puis ouvrir http://localhost:5173)
```

## Stack
- React 18 + Vite (pas de TypeScript)
- Tailwind CSS via CDN (pas de compiler, classes Tailwind dans index.html)
- Lucide React (icônes)
- localStorage clé `eliteSave` (sauvegarde locale, offline)

## Fichiers principaux
- `EliteCounter.jsx` — app complète (~2700 lignes), composant default export
- `EliteCounterTutorial.jsx` — tutoriel first-launch, overlay z-index:200, composant `TutorialOverlay`
- `LanguageSelect.jsx` — écran plein écran de choix de langue (1er lancement) + `LanguageModal` (bottom-sheet réutilisé par le bouton langue de l'accueil)
- `i18n/` — moteur i18n (voir section Internationalisation)
- `ELITE_COUNTER_RECAP.md` — documentation complète de l'app (modes, ranks, achievements, etc.)
- `src/main.jsx` — point d'entrée Vite, monte EliteCounter dans #root

## Architecture navigation
Nav par `setNav(string)` — pas de React Router.
États: `'lobby' | 'mode-ranked' | 'mode-training' | 'mode-casino' | 'game'`

## Tutoriel
`TutorialOverlay` s'affiche automatiquement au premier lancement (`save.tutorialDone === false`).
Props: `onComplete` et `onSkip` → appellent `patchSave({ tutorialDone: true })`.

## Sauvegarde
`DEFAULT_SAVE` dans EliteCounter.jsx. `patchSave(patch)` pour modifier.
Reset via Settings → taper "RESET" → `localStorage.removeItem('eliteSave')`.

## Internationalisation (i18n)
Langues livrées : **FR, EN, ES, DE**. Moteur maison, **zéro dépendance**, dans `i18n/` :
- `i18n/languages.js` — registre `LANGUAGES` (`code`, `label` natif, `flag`, `dir`) + `DEFAULT_LANG` (fr) + `FALLBACK_LANG` (en).
- `i18n/locales/<code>.js` — un dictionnaire par langue, **mêmes clés partout**. Valeurs = string, string avec `{var}`, ou **fonction** `(vars) => string` pour pluriels/logique. Les arrays (ex. `timePicker.presets`) sont retournés tels quels.
- `i18n/index.js` — `translate(lang, key, vars)` (clés imbriquées `a.b.c`, interpolation, fallback `lang → en → clé`) et `makeT(lang)`.

**Câblage** : `EliteCounter` calcule `const lang = save.lang || DEFAULT_LANG` puis `const t = makeT(lang)`. `t` est passé en **prop** aux composants enfants (`TimePicker`, `SupportPreviewModal`, `TutorialOverlay`, `LanguageModal`). La langue vit dans `save.lang` (localStorage `eliteSave`) ; `null` = pas encore choisie → l'écran de choix s'affiche **avant** le tutoriel.

**Noms propres NON traduits** (identiques dans toutes les langues) : rangs (Bronze…Master), noms de skins, noms de code des achievements (« The Architect »), labels de gates (« Bronze → Silver »). Les `desc`/`name` dans `CHALLENGES`/`RANKS_DEF` ne sont plus rendus (résolus via `t('challenges.<id>.name')` etc.) — données mortes laissées comme référence.

**Ajouter une langue** = (1) une entrée dans `LANGUAGES`, (2) un fichier `locales/<code>.js` copié sur `fr.js`/`en.js`, (3) l'enregistrer dans le `DICTS` de `i18n/index.js`. Rien d'autre à toucher.

**Vérifier** : `npm run build` doit passer ; les locales doivent garder des jeux de clés identiques (un check de parité a été utilisé pendant le dev).

## Règles importantes
- Ne jamais setter `countWasShownRef` avant `launchGame()` (sera écrasé)
- Mode casino : lire `casinoStepConfigRef.current` pour decks/pen, pas `rankUsedRef`
- Achievements mid-casino → queue `pendingAchievementsRef`, flush dans `goBack()`

## Gestion du TODO
`TODO.md` = liste des tâches en cours et backlog.
- Si tu demandes à l'utilisateur de faire quelque chose manuellement → l'ajouter dans `TODO.md`
- Si une tâche est confirmée faite → la déplacer dans la section ✅ Fait
- En début de session, si l'utilisateur demande "y'a quoi à faire ?", lire `TODO.md` et répondre directement

## Backlog prioritaire
1. Renommer "Run Casino" (nom pas convainquant)
2. Paywall 5.99€ one-time (localStorage en démo)
3. App 2 séparée : mode table réaliste style Card Counter Lite
