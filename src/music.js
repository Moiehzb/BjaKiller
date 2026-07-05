// ─── Blackjack Academy I — Lobby background music ─────────────
// Loue le morceau du lobby « Le Seuil » (mix LMMS exporté en OGG).
// Fichier attendu : public/music/le_hall.ogg  → servi à /music/le_hall.ogg
// Démarrage différé au 1er geste utilisateur (règle autoplay navigateur).

const SRC = '/music/le_hall.ogg';
const VOL = 0.55; // sous les SFX in-game, présence sans écraser l'UI

let _audio = null;
let _muted = false;
let _wantPlaying = false;
let _armed = false;

const el = () => {
  if (!_audio) {
    _audio = new Audio(SRC);
    _audio.loop = true;
    _audio.preload = 'auto';
    _audio.volume = VOL;
  }
  return _audio;
};

// Le 1er play() peut être bloqué tant qu'aucun geste n'a eu lieu → on réessaie
// au 1er pointerdown/keydown.
const armGesture = () => {
  if (_armed) return;
  _armed = true;
  const resume = () => {
    document.removeEventListener('pointerdown', resume);
    document.removeEventListener('keydown', resume);
    _armed = false;
    if (_wantPlaying && !_muted) el().play().catch(() => {});
  };
  document.addEventListener('pointerdown', resume, { once: true });
  document.addEventListener('keydown', resume, { once: true });
};

export const playLobbyMusic = () => {
  _wantPlaying = true;
  if (_muted) return;
  el().play().catch(() => armGesture());
};

export const stopLobbyMusic = () => {
  _wantPlaying = false;
  if (_audio) { _audio.pause(); _audio.currentTime = 0; }
};

export const setMusicMuted = (v) => {
  _muted = v;
  if (!_audio) return;
  if (v) _audio.pause();
  else if (_wantPlaying) _audio.play().catch(() => armGesture());
};
