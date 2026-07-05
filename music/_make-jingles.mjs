// Génère deux jingles MIDI courts et doux (victoire / défaite) pour l'app.
// Ton « académie secrète » : timbre de harpe, vélocités basses, rien de strident.
//   npm run jingles   (ou : node music/_make-jingles.mjs)
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const dir = dirname(fileURLToPath(import.meta.url));

// ── Mini-écrivain SMF (format 0) ───────────────────────────────────
const vlq = (n) => {                       // delta-time en variable-length
  const bytes = [n & 0x7f];
  while ((n >>= 7) > 0) bytes.unshift((n & 0x7f) | 0x80);
  return bytes;
};
const str = (s) => [...s].map(c => c.charCodeAt(0));
const u32 = (n) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
const u16 = (n) => [(n >>> 8) & 255, n & 255];

// notes = [{ t, dur, pitch, vel }], t/dur en ticks. PPQ=480.
function buildMidi({ program = 46, tempo = 500000, notes }) {
  const PPQ = 480;
  const ev = [];                           // { at, data } events triés
  ev.push({ at: 0, data: [0xff, 0x51, 0x03, ...u32(tempo).slice(1)] }); // tempo
  ev.push({ at: 0, data: [0xc0, program & 0x7f] });                     // program change
  for (const n of notes) {
    ev.push({ at: n.t,          data: [0x90, n.pitch, n.vel] });        // note on
    ev.push({ at: n.t + n.dur,  data: [0x80, n.pitch, 0] });            // note off
  }
  ev.sort((a, b) => a.at - b.at);
  let track = [], last = 0;
  for (const e of ev) { track.push(...vlq(e.at - last), ...e.data); last = e.at; }
  track.push(...vlq(0), 0xff, 0x2f, 0x00);                             // end of track

  const header = [...str('MThd'), ...u32(6), ...u16(0), ...u16(1), ...u16(PPQ)];
  const trk = [...str('MTrk'), ...u32(track.length), ...track];
  return Buffer.from([...header, ...trk]);
}

// ── VICTOIRE ── arpège majeur ascendant qui se résout, doux, ~1,3 s ─
// C4 E4 G4 C5, puis triade C5+E5+G5 tenue en écho léger.
const N = (t, dur, pitch, vel) => ({ t, dur, pitch, vel });
const victory = buildMidi({
  program: 46,   // Orchestral Harp
  tempo: 460000, // ~130 bpm
  notes: [
    N(0,   180, 60, 52),   // C4
    N(160, 180, 64, 56),   // E4
    N(320, 200, 67, 60),   // G4
    N(480, 520, 72, 66),   // C5 (résolution)
    // écho de triade, très doux
    N(560, 640, 76, 40),   // E5
    N(560, 640, 79, 36),   // G5
  ],
});

// ── DÉFAITE ── chute mineure douce, feutrée, ~1,2 s, jamais agressive ─
// A3 -> F3 -> D3, close sur une tierce mineure basse tenue.
const defeat = buildMidi({
  program: 46,   // Harp (feutré, non strident)
  tempo: 520000, // ~115 bpm, un peu plus lent
  notes: [
    N(0,   240, 57, 54),   // A3
    N(220, 240, 53, 50),   // F3
    N(440, 260, 50, 46),   // D3
    // accord mineur bas, tenu, qui s'éteint
    N(700, 640, 45, 40),   // A2
    N(700, 640, 48, 34),   // C3
  ],
});

writeFileSync(join(dir, 'victory.mid'), victory);
writeFileSync(join(dir, 'defeat.mid'), defeat);
console.log('Jingles écrits : music/victory.mid, music/defeat.mid');
