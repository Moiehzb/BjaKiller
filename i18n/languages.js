// ─── Language registry ───────────────────────────────────────────
// Adding a new language = add ONE entry here + ONE file in ./locales,
// then register it in ./index.js. Nothing else in the app changes.
//
// Fields:
//   code   — ISO 639-1 code, also the locale filename (fr → locales/fr.js)
//   label  — the language's own native name (shown in the picker)
//   flag   — emoji flag for quick visual scanning
//   dir    — 'ltr' | 'rtl' (future-proofing for Arabic, Hebrew, …)
export const LANGUAGES = [
  { code: 'fr', label: 'Français',  flag: '🇫🇷', dir: 'ltr' },
  { code: 'en', label: 'English',   flag: '🇬🇧', dir: 'ltr' },
  { code: 'es', label: 'Español',   flag: '🇪🇸', dir: 'ltr' },
  { code: 'de', label: 'Deutsch',   flag: '🇩🇪', dir: 'ltr' },
  { code: 'pt', label: 'Português', flag: '🇵🇹', dir: 'ltr' },
  { code: 'ja', label: '日本語',    flag: '🇯🇵', dir: 'ltr' },
  { code: 'zh', label: '中文',      flag: '🇨🇳', dir: 'ltr' },
  { code: 'ko', label: '한국어',    flag: '🇰🇷', dir: 'ltr' },
  { code: 'hi', label: 'हिन्दी',   flag: '🇮🇳', dir: 'ltr' },
  { code: 'mn', label: 'Монгол',   flag: '🇲🇳', dir: 'ltr' },
  { code: 'sq', label: 'Shqip',    flag: '🇦🇱', dir: 'ltr' },
];

// Language used before the user picks one, and as the rendering default.
export const DEFAULT_LANG = 'fr';

// Language used to fill any key missing from the active locale.
export const FALLBACK_LANG = 'en';

export const getLanguage = (code) =>
  LANGUAGES.find((l) => l.code === code) || LANGUAGES.find((l) => l.code === DEFAULT_LANG);
