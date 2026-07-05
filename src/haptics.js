// ─── Blackjack Academy I — Retour haptique ────────────────────
// Sur Android (APK Capacitor) : plugin natif @capacitor/haptics — la WebView
// ignore souvent navigator.vibrate, d'où l'absence de vibration en APK.
// Sur navigateur / desktop : repli sur l'API Web Vibration, sinon no-op.
// Piloté par un flag module (comme sounds.js) → réglable via le Scriptorium.

import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const NATIVE = (() => {
  try { return Capacitor.isNativePlatform(); } catch { return false; }
})();

let _enabled = true;

export const setHapticsEnabled = (v) => { _enabled = v; };

// Repli web (desktop / PWA)
const webVib = (pattern) => {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
  } catch {}
};

// Tap léger — chaque appui sur un bouton du menu. Discret, non fatigant.
export const vibrateTap = () => {
  if (!_enabled) return;
  if (NATIVE) { Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}); }
  else webVib(10);
};

// Victoire (bonne réponse) — un tap court et net, satisfaisant.
export const vibrateWin = () => {
  if (!_enabled) return;
  if (NATIVE) { Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {}); }
  else webVib(20);
};

// Défaite (mauvaise réponse) — buzz plus lourd, nettement distinct.
export const vibrateLose = () => {
  if (!_enabled) return;
  if (NATIVE) {
    // Notification "warning" = double vibration marquée côté OS.
    Haptics.notification({ type: NotificationType.Warning }).catch(() => {
      Haptics.vibrate({ duration: 90 }).catch(() => {});
    });
  } else webVib([45, 60, 90]);
};

// Coupe une vibration en cours (ex. au démontage).
export const cancelHaptics = () => {
  if (NATIVE) return; // rien à annuler pour impact/notification natifs
  webVib(0);
};
