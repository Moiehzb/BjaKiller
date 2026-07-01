// ─── Elite Counter Sound Engine ───────────────────────────────
// Web Audio API only — zero deps, zero external files.
// Slight random jitter per call prevents listener fatigue.

let _ctx = null;

const ac = () => {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
};

const rnd = (base, pct = 0.06) => base * (1 + (Math.random() - 0.5) * 2 * pct);

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

// ─── Public API ───────────────────────────────────────────────

// Generic UI click — warm, low, nearly subliminal
export const playClick = () => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    osc(ctx, rnd(310, 0.1), 'sine', 0.10, t, 0.022);
    osc(ctx, rnd(180, 0.1), 'sine', 0.05, t, 0.030);
  } catch {}
};

// Correct answer — warmth grows with streak
export const playCorrect = (streak = 0) => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    const base = rnd(660, 0.025) * (1 + Math.min(streak, 12) * 0.015);
    const vol = 0.17;
    osc(ctx, base, 'sine', vol, t, 0.40);
    if (streak >= 3)  osc(ctx, base * 1.25, 'sine', vol * 0.50, t + 0.04, 0.32);
    if (streak >= 6)  osc(ctx, base * 1.5,  'sine', vol * 0.34, t + 0.08, 0.25);
    if (streak >= 10) osc(ctx, base * 2,    'sine', vol * 0.20, t + 0.13, 0.20);
  } catch {}
};

// Wrong answer — descending soft tones
export const playWrong = () => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    osc(ctx, rnd(240, 0.05), 'sine', 0.13, t,        0.22);
    osc(ctx, rnd(170, 0.05), 'sine', 0.09, t + 0.10, 0.20);
  } catch {}
};

// Game start — low thump + soft click (no harsh high transient)
export const playChip = () => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    osc(ctx, rnd(380, 0.08), 'sine', 0.12, t,       0.026);
    osc(ctx, rnd(85,  0.08), 'sine', 0.18, t,       0.110, 42);
  } catch {}
};

// Rank promotion fanfare — shifted down an octave, still impactful
export const playRankUp = () => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    // C4 E4 G4 C5 E5
    [261, 330, 392, 523, 659].forEach((f, i) => {
      osc(ctx, f, 'sine', 0.18, t + i * 0.145, 0.56 - i * 0.04);
    });
    // Subtle high shimmer on last note only
    osc(ctx, 659 * 2, 'sine', 0.05, t + 4 * 0.145 + 0.05, 0.45);
  } catch {}
};

// Achievement unlocked — lower sparkle
export const playAchievement = () => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    [520, 660, 880, 1100].forEach((f, i) =>
      osc(ctx, rnd(f, 0.03), 'sine', 0.13, t + i * 0.075, 0.24)
    );
  } catch {}
};

// Countdown tick — warm, muted
export const playCountdown = (n) => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    osc(ctx, n === 1 ? 420 : 290, 'sine', 0.10, t, 0.075);
  } catch {}
};

// "GO!" — round and warm
export const playGo = () => {
  try {
    const ctx = ac();
    const t = ctx.currentTime;
    osc(ctx, 490, 'sine', 0.18, t,        0.36);
    osc(ctx, 620, 'sine', 0.09, t + 0.06, 0.26);
  } catch {}
};

export const initAudio = () => {
  try { ac(); } catch {}
};
