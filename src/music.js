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
const BOOST = 1.9;        // gain global (mobile plus fort) — un limiteur évite la saturation

let _ctx = null;
let _buffer = null;
let _loading = null;
let _src = null;
let _gain = null;
let _muted = false;
let _volume = DEFAULT_VOL;
let _wantPlaying = false;
let _armed = false;
let _ducked = false; // musique baissée (en partie) mais source toujours vivante
let _loop = { start: 0, end: 0 };

const ctx = () => {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  return _ctx;
};

const gain = () => {
  if (!_gain) {
    const c = ctx();
    _gain = c.createGain();
    _gain.gain.value = (_muted || _ducked) ? 0 : _volume * BOOST;
    // Limiteur en sortie : on peut pousser le gain sans risquer le clipping.
    const lim = c.createDynamicsCompressor();
    lim.threshold.value = -3;
    lim.knee.value = 4;
    lim.ratio.value = 12;
    lim.attack.value = 0.003;
    lim.release.value = 0.15;
    _gain.connect(lim);
    lim.connect(c.destination);
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

// Applique le gain « cible » instantanément (utilisé par mute/volume).
const applyGain = () => {
  if (!_gain) return;
  _gain.gain.cancelScheduledValues(ctx().currentTime);
  _gain.gain.value = (_muted || _ducked) ? 0 : _volume * BOOST;
};

export const playLobbyMusic = () => {
  _wantPlaying = true;
  if (_muted) return;
  const c = ctx();
  if (c.state === 'running') load().then(startSource);
  else armGesture();
};

// La source n'est JAMAIS arrêtée en cours de session : elle boucle en continu,
// on ne fait que fondre le gain. La musique reprend donc là où elle en était
// (jamais toujours le même passage), et l'entrée en partie n'est plus abrupte.
export const fadeInLobbyMusic = (sec = 1.2) => {
  _wantPlaying = true;
  _ducked = false;
  if (_muted) return;
  const c = ctx();
  const run = () => {
    startSource();
    if (!_gain) return;
    const now = ctx().currentTime;
    const g = _gain.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(Math.max(0.0001, g.value), now);
    g.linearRampToValueAtTime(_volume * BOOST, now + sec);
  };
  if (c.state === 'running') load().then(run);
  else armGesture(); // 1er lancement : démarrera au geste utilisateur
};

// Fond la musique jusqu'au silence sur `sec` (calé sur le décompte) SANS couper
// la source → position préservée, reprise transparente au retour au lobby.
export const fadeOutLobbyMusic = (sec = 3) => {
  _ducked = true;
  if (!_gain || !_src) return;
  const now = ctx().currentTime;
  const g = _gain.gain;
  g.cancelScheduledValues(now);
  g.setValueAtTime(Math.max(0.0001, g.value), now);
  g.linearRampToValueAtTime(0.0001, now + sec);
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
  applyGain();
  if (v) return;
  if (_wantPlaying && !_src) playLobbyMusic(); // reprise après un-mute
};

export const setMusicVolume = (v) => {
  _volume = Math.max(0, Math.min(1, Number(v) || 0));
  applyGain();
};

// Quand l'app passe en arrière-plan (bouton Accueil, changement d'app), la
// WebView Android garde sinon la boucle audio active. On suspend le contexte
// (position figée) et on le relance au retour au premier plan.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!_ctx) return;
    if (document.hidden) {
      try { _ctx.suspend(); } catch {}
    } else if (_wantPlaying && !_muted) {
      try { _ctx.resume(); } catch {}
    }
  });
}
