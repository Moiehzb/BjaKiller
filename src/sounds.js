// ─── Elite Counter Sound Engine ───────────────────────────────
// Web Audio API only — zero deps, zero external files.
// No frequency above ~500 Hz — nothing should sound shrill.
// Slight random jitter per call prevents listener fatigue.

let _ctx = null;
let _muted = false;
let _master = null;

const MASTER = 2.5; // volume général plus fort (mobile) ; un limiteur évite la saturation

export const setMuted = (v) => { _muted = v; };

const ac = () => {
  if (_muted) throw new Error('muted');
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
};

// Bus de sortie commun : makeup gain fort + limiteur (compresseur agressif) pour
// pousser le volume sans clipping. Tous les sons s'y connectent au lieu de
// `ctx.destination`.
const master = (ctx) => {
  if (!_master) {
    const lim = ctx.createDynamicsCompressor();
    lim.threshold.value = -4;
    lim.knee.value = 4;
    lim.ratio.value = 12;
    lim.attack.value = 0.002;
    lim.release.value = 0.12;
    _master = ctx.createGain();
    _master.gain.value = MASTER;
    _master.connect(lim);
    lim.connect(ctx.destination);
  }
  return _master;
};

const rnd = (base, pct = 0.06) => base * (1 + (Math.random() - 0.5) * 2 * pct);

const osc = (ctx, freq, type, vol, t0, dur, freqEnd) => {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g);
  g.connect(master(ctx));
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (freqEnd != null) o.frequency.exponentialRampToValueAtTime(freqEnd, t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
};

// ─── Public API ───────────────────────────────────────────────

// Generic UI click — warm, low, present
export const playClick = () => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    osc(ctx, rnd(310, 0.1), 'sine', 0.22, t, 0.026);
    osc(ctx, rnd(180, 0.1), 'sine', 0.12, t, 0.034);
  } catch {}
};

// Correct answer — warm bell tones, capped under 500 Hz even at high streaks
export const playCorrect = (streak = 0) => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    const base = rnd(390, 0.025) * (1 + Math.min(streak, 12) * 0.012);
    const vol = 0.17;
    osc(ctx, base, 'sine', vol, t, 0.42);
    if (streak >= 3)  osc(ctx, base * 1.20, 'sine', vol * 0.45, t + 0.04, 0.34);
    if (streak >= 6)  osc(ctx, base * 1.33, 'sine', vol * 0.30, t + 0.08, 0.26);
    if (streak >= 10) osc(ctx, base * 1.50, 'sine', vol * 0.18, t + 0.13, 0.20);
  } catch {}
};

// Classic menu confirmation — two short ascending pips
export const playMenuOk = () => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    osc(ctx, 330, 'sine', 0.22, t,        0.070);
    osc(ctx, 440, 'sine', 0.22, t + 0.08, 0.070);
  } catch {}
};

// Wrong answer — low hollow thud, warm and muted
export const playWrong = () => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    osc(ctx, rnd(140, 0.06), 'sine', 0.14, t,        0.28, 90);
    osc(ctx, rnd(95,  0.06), 'sine', 0.08, t + 0.08, 0.22, 60);
  } catch {}
};

// Old grimoire page turn — filtered noise sweep + paper flutter + landing
export const playCardFlip = () => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    const dur = rnd(0.11, 0.08);
    const frames = Math.ceil(dur * ctx.sampleRate);

    // White noise buffer, shaped by an amplitude ramp (paper unrolling)
    const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) {
      const env = Math.sin((i / frames) * Math.PI); // swells then fades = swish
      data[i] = (Math.random() * 2 - 1) * env;
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;

    // Bandpass swept upward = the "shhhk" of a page arcing over
    const bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.setValueAtTime(rnd(240, 0.1), t);
    bpf.frequency.exponentialRampToValueAtTime(rnd(520, 0.1), t + dur);
    bpf.Q.value = 0.7;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.34, t + dur * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    src.connect(bpf);
    bpf.connect(gain);
    gain.connect(master(ctx));
    src.start(t);
    src.stop(t + dur + 0.02);

    // Landing thud — the page settling against the others
    osc(ctx, rnd(76, 0.08), 'sine', 0.10, t + dur * 0.7, 0.07, 42);
  } catch {}
};

// Game start — low thump + soft click
export const playChip = () => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    osc(ctx, rnd(340, 0.08), 'sine', 0.12, t,  0.026);
    osc(ctx, rnd(85,  0.08), 'sine', 0.18, t,  0.110, 42);
  } catch {}
};

// Rank promotion fanfare — low arpegio, nothing above 450 Hz
export const playRankUp = () => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    // G3 B3 D4 F#4 A4
    [196, 247, 294, 370, 440].forEach((f, i) => {
      osc(ctx, f, 'sine', 0.18, t + i * 0.145, 0.56 - i * 0.04);
    });
  } catch {}
};

// Achievement unlocked — low ascending sparkle, max 494 Hz
export const playAchievement = () => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    // C4 E4 G4 B4
    [262, 330, 392, 494].forEach((f, i) =>
      osc(ctx, rnd(f, 0.03), 'sine', 0.13, t + i * 0.075, 0.26)
    );
  } catch {}
};

// Countdown tick — warm, muted
export const playCountdown = (n) => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    osc(ctx, n === 1 ? 330 : 220, 'sine', 0.10, t, 0.075);
  } catch {}
};

// "GO!" — round and warm, under 450 Hz
export const playGo = () => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    osc(ctx, 370, 'sine', 0.18, t,        0.36);
    osc(ctx, 440, 'sine', 0.09, t + 0.06, 0.26);
  } catch {}
};

export const initAudio = () => {
  try { ac(); } catch {}
};
