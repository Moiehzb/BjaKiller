// ─── Elite Counter Sound Engine ───────────────────────────────
// Web Audio API only — zero deps, zero external files.
// Every sound is synthesized procedurally. Small random jitter
// on pitch/timing prevents listener fatigue on repeated plays.

let _ctx = null;

const ac = () => {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
};

const rnd = (base, pct = 0.06) => base * (1 + (Math.random() - 0.5) * 2 * pct);

// Schedule a sine/square oscillator
const osc = (ctx, freq, type, vol, t0, dur, freqEnd) => {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g);
  g.connect(ctx.destination);
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (freqEnd != null) o.frequency.exponentialRampToValueAtTime(freqEnd, t0 + dur);
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
};

// Band-pass filtered white noise (card texture)
const noise = (ctx, vol, t0, dur, bandHz = 1000, Q = 0.7) => {
  const len = Math.ceil(ctx.sampleRate * (dur + 0.05));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const flt = ctx.createBiquadFilter();
  flt.type = 'bandpass';
  flt.frequency.value = bandHz;
  flt.Q.value = Q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(flt);
  flt.connect(g);
  g.connect(ctx.destination);
  src.start(t0);
  src.stop(t0 + dur + 0.05);
};

// ─── Public API ───────────────────────────────────────────────

// Card flip: paper noise + high transient click
export const playCard = () => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    osc(ctx, rnd(3200, 0.15), 'sine', 0.07, t, 0.016);
    noise(ctx, 0.11, t, rnd(0.052, 0.25), rnd(850, 0.3), 0.65);
  } catch {}
};

// Correct answer — richness/pitch grows with streak
export const playCorrect = (streak = 0) => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    const base = rnd(880, 0.025) * (1 + Math.min(streak, 12) * 0.018);
    const vol = 0.18;
    osc(ctx, base, 'sine', vol, t, 0.42);
    if (streak >= 3)  osc(ctx, base * 1.25,  'sine', vol * 0.55, t + 0.04, 0.33);
    if (streak >= 6)  osc(ctx, base * 1.5,   'sine', vol * 0.38, t + 0.08, 0.26);
    if (streak >= 10) osc(ctx, base * 2,      'sine', vol * 0.22, t + 0.13, 0.20);
  } catch {}
};

// Wrong answer — two descending tones, not harsh
export const playWrong = () => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    osc(ctx, rnd(270, 0.05), 'sine', 0.13, t,        0.21);
    osc(ctx, rnd(195, 0.05), 'sine', 0.10, t + 0.09, 0.20);
  } catch {}
};

// Game start / chip click: high click + low thump
export const playChip = () => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    osc(ctx, rnd(3800, 0.1),  'sine', 0.09,  t,       0.020);
    osc(ctx, rnd(88,   0.08), 'sine', 0.17,  t,       0.095, 40);
  } catch {}
};

// Rank promotion fanfare
export const playRankUp = () => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    // Ascending arpeggio C5→E5→G5→C6→E6
    [523, 659, 784, 1047, 1319].forEach((f, i) => {
      osc(ctx, f, 'sine', 0.19, t + i * 0.145, 0.58 - i * 0.04);
    });
    // Final shimmer
    osc(ctx, 2638, 'sine', 0.07, t + 4 * 0.145 + 0.06, 0.50);
  } catch {}
};

// Achievement unlocked — fast ascending sparkle
export const playAchievement = () => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    [820, 1050, 1380, 1820].forEach((f, i) =>
      osc(ctx, rnd(f, 0.03), 'sine', 0.14, t + i * 0.075, 0.24)
    );
  } catch {}
};

// Generic UI button — nearly subliminal
export const playClick = () => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    osc(ctx, rnd(980, 0.12), 'sine', 0.04, t, 0.016);
  } catch {}
};

// Countdown tick (n = 3 | 2 | 1)
export const playCountdown = (n) => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    osc(ctx, n === 1 ? 1050 : 680, 'square', 0.065, t, 0.068);
  } catch {}
};

// "GO!" — bright ding pair
export const playGo = () => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    osc(ctx, 1200, 'sine', 0.20, t,        0.38);
    osc(ctx, 1500, 'sine', 0.09, t + 0.06, 0.28);
  } catch {}
};

// Call on first user gesture to unlock AudioContext
export const initAudio = () => {
  try { ac(); } catch {}
};
