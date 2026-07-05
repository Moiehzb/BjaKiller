// ─── Blackjack Academy I — Lobby background music ─────────────
// Joue le morceau du lobby « Le Seuil » (mix LMMS exporté en OGG).
// Fichier : public/music/le_hall.ogg  → servi à /music/le_hall.ogg
//
// Lecture via Web Audio (AudioBufferSourceNode.loop) et non <audio loop> :
// la boucle est alors échantillon-exact, sans le « blanc » de re-buffering
// du lecteur HTML. On rogne en plus le silence numérique en tête/queue pour
// une jointure serrée. Volume réglable via un GainNode.

const SRC = '/music/le_hall.ogg';
const DEFAULT_VOL = 0.35; // linéaire, discret sous les SFX

let _ctx = null;
let _buffer = null;
let _loading = null;
let _src = null;
let _gain = null;
let _muted = false;
let _volume = DEFAULT_VOL;
let _wantPlaying = false;
let _armed = false;
let _loop = { start: 0, end: 0 };

const ctx = () => {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  return _ctx;
};

const gain = () => {
  if (!_gain) {
    _gain = ctx().createGain();
    _gain.gain.value = _muted ? 0 : _volume;
    _gain.connect(ctx().destination);
  }
  return _gain;
};

// Bornes de boucle : on cherche le 1er et le dernier échantillon audibles pour
// couper le silence numérique (padding d'encodage, queue de reverb éteinte).
const computeLoop = (buf) => {
  const data = buf.getChannelData(0);
  const n = data.length;
  const thr = 0.003;
  let start = 0, end = n - 1;
  while (start < n && Math.abs(data[start]) < thr) start++;
  while (end > start && Math.abs(data[end]) < thr) end--;
  _loop.start = Math.max(0, start - 1) / buf.sampleRate;
  _loop.end = Math.min(n - 1, end + 1) / buf.sampleRate;
  if (!(_loop.end > _loop.start)) { _loop.start = 0; _loop.end = buf.duration; }
};

const load = () => {
  if (_buffer) return Promise.resolve(_buffer);
  if (!_loading) {
    _loading = fetch(SRC)
      .then(r => r.arrayBuffer())
      .then(a => ctx().decodeAudioData(a))
      .then(buf => { _buffer = buf; computeLoop(buf); return buf; })
      .catch(() => { _loading = null; });
  }
  return _loading;
};

const startSource = () => {
  if (!_buffer || _src || !_wantPlaying || _muted) return;
  const s = ctx().createBufferSource();
  s.buffer = _buffer;
  s.loop = true;
  s.loopStart = _loop.start;
  s.loopEnd = _loop.end;
  s.connect(gain());
  s.start(0, _loop.start);
  _src = s;
};

// Le contexte démarre « suspended » tant qu'aucun geste utilisateur n'a eu
// lieu → on réessaie au 1er pointerdown/keydown.
const armGesture = () => {
  if (_armed) return;
  _armed = true;
  const resume = () => {
    document.removeEventListener('pointerdown', resume);
    document.removeEventListener('keydown', resume);
    _armed = false;
    if (!_wantPlaying || _muted) return;
    ctx().resume().catch(() => {}).finally(() => { load().then(startSource); });
  };
  document.addEventListener('pointerdown', resume, { once: true });
  document.addEventListener('keydown', resume, { once: true });
};

export const playLobbyMusic = () => {
  _wantPlaying = true;
  if (_muted) return;
  const c = ctx();
  if (c.state === 'running') load().then(startSource);
  else armGesture();
};

export const stopLobbyMusic = () => {
  _wantPlaying = false;
  if (_src) {
    try { _src.stop(); } catch {}
    try { _src.disconnect(); } catch {}
    _src = null;
  }
};

export const setMusicMuted = (v) => {
  _muted = v;
  if (_gain) _gain.gain.value = v ? 0 : _volume;
  if (v) return;
  if (_wantPlaying && !_src) playLobbyMusic(); // reprise après un-mute
};

export const setMusicVolume = (v) => {
  _volume = Math.max(0, Math.min(1, Number(v) || 0));
  if (_gain && !_muted) _gain.gain.value = _volume;
};
