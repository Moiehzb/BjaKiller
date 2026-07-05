// ─── Blackjack Academy I — Retour haptique ────────────────────
// Vibration mobile via l'API Web Vibration (navigator.vibrate).
// Aucune dépendance. Sur desktop / navigateur non compatible : no-op silencieux.
// Piloté par un flag module (comme sounds.js) → réglable via le Scriptorium.

let _enabled = true;

export const setHapticsEnabled = (v) => { _enabled = v; };

const vib = (pattern) => {
  if (!_enabled) return;
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
  } catch {}
};

// Victoire (bonne réponse) — un tap court et net, satisfaisant.
export const vibrateWin = () => vib(20);

// Défaite (mauvaise réponse) — double buzz plus lourd, nettement distinct.
export const vibrateLose = () => vib([45, 60, 90]);

// Coupe une vibration en cours (ex. au démontage).
export const cancelHaptics = () => vib(0);
