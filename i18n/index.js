// ─── i18n engine — dependency-free ───────────────────────────────
// Public API:
//   translate(lang, key, vars) → string (or array/object for non-text values)
//   makeT(lang)                → t(key, vars) bound to a language
//   LANGUAGES, DEFAULT_LANG, FALLBACK_LANG, getLanguage  (re-exported)
//
// Dictionaries map dotted keys ("lobby.gameModes") to either:
//   • a string, optionally with {placeholders}  → interpolated from `vars`
//   • a function (vars) => string                → for plurals / rich logic
//   • an array / object                          → returned as-is (e.g. preset lists)
import { LANGUAGES, DEFAULT_LANG, FALLBACK_LANG, getLanguage } from './languages';
import fr from './locales/fr';
import en from './locales/en';
import es from './locales/es';
import de from './locales/de';

// Registry of loaded dictionaries — extend alongside ./languages.js.
const DICTS = { fr, en, es, de };

// Walk a dotted path ("a.b.c") through a nested dictionary.
function lookup(dict, key) {
  if (!dict) return undefined;
  let cur = dict;
  for (const part of key.split('.')) {
    if (cur == null) return undefined;
    cur = cur[part];
  }
  return cur;
}

export function translate(lang, key, vars) {
  let val = lookup(DICTS[lang], key);
  if (val === undefined && lang !== FALLBACK_LANG) val = lookup(DICTS[FALLBACK_LANG], key);
  if (val === undefined) {
    if (typeof console !== 'undefined') console.warn(`[i18n] missing key: ${key}`);
    return key; // last resort — surfaces the gap instead of crashing
  }
  if (typeof val === 'function') return val(vars || {});
  if (typeof val === 'string' && vars) {
    return val.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
  }
  return val; // strings without vars, and arrays/objects, pass through untouched
}

// Convenience: bind a language once, get a t() you can thread through props.
export function makeT(lang) {
  return (key, vars) => translate(lang, key, vars);
}

export { LANGUAGES, DEFAULT_LANG, FALLBACK_LANG, getLanguage };
