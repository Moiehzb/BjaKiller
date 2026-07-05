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

// Intensités globales volontairement basses : retour discret, jamais fatigant.

// Tap léger — chaque appui sur un bouton du menu.
export const vibrateTap = () => {
  if (!_enabled) return;
  if (NATIVE) { Haptics.impact({ style: ImpactStyle.Light }).catch(() => {}); }
  else webVib(6);
};

// Sur natif, on joue une suite d'impacts calés dans le temps (le pattern
// web [on,off,…] n'existe pas). schedule = [{ at(ms), style }].
const nativeSequence = (schedule) => {
  for (const s of schedule) {
    setTimeout(() => { Haptics.impact({ style: s.style }).catch(() => {}); }, s.at);
  }
};

// Victoire — calée sur le jingle (Victoire_jingle.ogg / victory.mid) :
// arpège montant à ~0/153/307 ms, résolution appuyée à 460 ms, écho doux 537 ms.
export const vibrateWin = () => {
  if (!_enabled) return;
  if (NATIVE) {
    nativeSequence([
      { at: 0,   style: ImpactStyle.Light },
      { at: 153, style: ImpactStyle.Light },
      { at: 307, style: ImpactStyle.Light },
      { at: 460, style: ImpactStyle.Medium }, // résolution
      { at: 537, style: ImpactStyle.Light },  // écho de triade
    ]);
  } else {
    // [on,off,on,off,…] — mêmes onsets que le jingle.
    webVib([10, 143, 10, 144, 10, 143, 18, 59, 8]);
  }
};

// Défaite — calée sur le jingle (Defaite_jingle.ogg / defeat.mid) :
// chute descendante à ~0/238/477 ms puis accord grave tenu à 758 ms.
export const vibrateLose = () => {
  if (!_enabled) return;
  if (NATIVE) {
    nativeSequence([
      { at: 0,   style: ImpactStyle.Light },
      { at: 238, style: ImpactStyle.Light },
      { at: 477, style: ImpactStyle.Light },
      { at: 758, style: ImpactStyle.Medium }, // accord grave tenu
    ]);
  } else {
    webVib([12, 226, 12, 227, 12, 269, 35]);
  }
};

// Coupe une vibration en cours (ex. au démontage).
export const cancelHaptics = () => {
  if (NATIVE) return; // rien à annuler pour impact/notification natifs
  webVib(0);
};
