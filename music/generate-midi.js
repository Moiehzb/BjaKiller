// generate-midi.js — Génère music/le-seuil.mid depuis la composition
// Usage : node music/generate-midi.js
// Produit : music/le-seuil.mid  (7 tracks : Synth, Flûte, Harpe, Guitare, Luth, Basse, Percussions)

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Constantes de temps ────────────────────────────────────────────────────
const TPQN   = 480;                      // ticks par noire
const TPE    = TPQN / 2;                 // ticks par croche = 240
const TPB    = TPE  * 6;                 // ticks par mesure (6/8) = 1440
const TEMPO  = Math.round(60_000_000 / 90); // noire pointée=60bpm → noire=90bpm → 666 667 µs
const BARS   = 120;

function T(bar, e) { return (bar - 1) * TPB + Math.round(e * TPE); }

// ─── Note → numéro MIDI ─────────────────────────────────────────────────────
const PC = {C:0,Cs:1,D:2,Ds:3,E:4,F:5,Fs:6,G:7,Gs:8,A:9,As:10,B:11};
function mn(name) { return (parseInt(name.slice(-1)) + 1) * 12 + PC[name.slice(0,-1)]; }
const up = n => n.slice(0,-1) + (parseInt(n.slice(-1)) + 1);

// ─── Accords ─────────────────────────────────────────────────────────────────
const CH = {
  Am:    { harp:['A3','C4','E4','B4','A5'], gtr:['A2','E3','A3','C4'], orn:['E5','C5','A4'], root:'A' },
  G:     { harp:['G3','B3','D4','G4','B4'], gtr:['G2','D3','G3','B3'], orn:['D5','B4','G4'], root:'G' },
  Fmaj7: { harp:['A3','C4','E4','F4','A4'], gtr:['F2','C3','A3','C4'], orn:['E5','C5','A4'], root:'F' },
  E7:    { harp:['Gs3','B3','D4','E4','Gs4'], gtr:['E2','B2','Gs3','D4'], orn:['E5','B4','Gs4'], root:'E' },
  Cadd9: { harp:['C4','E4','G4','D5','G5'], gtr:['C3','G3','C4','E4'], orn:['G5','E5','C5'], root:'C' },
};
const CELL = ['Am','G','Fmaj7','E7'], VAMP = ['Cadd9','Fmaj7'];
const chordAt      = b => CELL[(b - 1) % 4];
const cloitreChord = b => VAMP[(b - 45) % 2];
const chordKeyAt   = b => (b >= 45 && b <= 64) ? cloitreChord(b) : chordAt(b);

// ─── Thèmes ──────────────────────────────────────────────────────────────────
const THEME = [
  [1,0,2,'A4'],[1,2,1,'C5'],[1,3,3,'E5'],
  [2,0,3,'D5'],[2,3,3,'B4'],
  [3,0,3,'C5'],[3,3,3,'A4'],
  [4,0,3,'B4'],[4,3,3,'Gs4'],
  [5,0,1,'A4'],[5,1,1,'C5'],[5,2,1,'E5'],[5,3,3,'A5'],
  [6,0,3,'G5'],[6,3,3,'D5'],
  [7,0,3,'E5'],[7,3,3,'C5'],
  [8,0,3,'Gs4'],[8,3,3,'A4'],
];
const THEME_B = [
  [1,0,1,'A4'],[1,1,1,'C5'],[1,2,1,'E5'],[1,3,2,'A5'],[1,5,1,'G5'],
  [2,0,2,'D5'],[2,2,1,'E5'],[2,3,2,'B4'],[2,5,1,'D5'],
  [3,0,2,'C5'],[3,2,1,'D5'],[3,3,2,'A4'],[3,5,1,'C5'],
  [4,0,2,'B4'],[4,2,1,'C5'],[4,3,3,'Gs4'],
  [5,0,1,'A4'],[5,1,1,'C5'],[5,2,1,'E5'],[5,3,3,'A5'],
  [6,0,2,'G5'],[6,2,1,'A5'],[6,3,2,'D5'],[6,5,1,'E5'],
  [7,0,2,'E5'],[7,2,1,'F5'],[7,3,2,'C5'],[7,5,1,'D5'],
  [8,0,1,'B4'],[8,1,1,'Gs4'],[8,2,1,'A4'],[8,3,3,'A4'],
];
const FLUTE_A = [
  [1,0,1,'E5'],[1,1,1,'G5'],[1,2,4,'A5'],
  [2,0,3,'C5'],[2,3,2,'D5'],[2,5,1,'E5'],
  [3,0,2,'G5'],[3,2,1,'A5'],[3,3,3,'G5'],
  [4,0,4,'E5'],
  [5,0,1,'E5'],[5,1,1,'G5'],[5,2,4,'A5'],
  [6,0,2,'C5'],[6,2,1,'E5'],[6,3,3,'F5'],
  [7,0,2,'G5'],[7,2,0.5,'A5'],[7,2.5,0.5,'G5'],[7,3,3,'E5'],
  [8,0,3,'D5'],
];
const FLUTE_B = [
  [1,0,1,'A5'],[1,1,2,'B5'],[1,3,3,'C6'],
  [2,0,3,'B5'],[2,3,3,'A5'],
  [3,0,0.5,'A5'],[3,0.5,0.5,'G5'],[3,1,1,'A5'],[3,2,1,'G5'],[3,3,3,'E5'],
  [4,0,3,'D5'],
  [5,0,1,'E5'],[5,1,1,'G5'],[5,2,4,'A5'],
  [6,0,3,'C5'],[6,3,2,'D5'],[6,5,1,'E5'],
  [7,0,2,'G5'],[7,2,1,'A5'],[7,3,3,'G5'],
  [8,0,6,'E5'],
];
const FLUTE_TAG = [
  [1,0,3,'E5'],[1,3,3,'D5'],
  [2,0,4,'C5'],
  [3,0,3,'B4'],[3,3,3,'A4'],
  [4,0,6,'A4'],
];

// ─── Canaux MIDI ─────────────────────────────────────────────────────────────
const C_SYNTH = 0, C_FLUTE = 1, C_HARP = 2, C_GTR = 3, C_LUTE = 4, C_BASS = 5, C_PERC = 9;
const KICK = 36, SLAP = 38, PALMA = 39;  // GM drum notes

// ─── Collecteur d'événements ─────────────────────────────────────────────────
const evts = [];
function addNote(ch, t, noteName, durTicks, velF) {
  const v = Math.max(1, Math.min(127, Math.round(velF * 127)));
  const d = Math.max(1, Math.round(durTicks));
  evts.push({ ch, t, note: mn(noteName), dur: d, vel: v });
}
function addDrum(t, pitch, velF) {
  evts.push({ ch: C_PERC, t, note: pitch, dur: 30, vel: Math.max(1,Math.min(127,Math.round(velF*127))) });
}

// ─── Fonctions d'instruments ─────────────────────────────────────────────────
function harpRoll(arr, t, vel) {
  arr.forEach((n,i) => addNote(C_HARP, t + i*15, n, Math.max(30, TPE*3 - i*15), vel*(1-i*0.05)));
}
const PAT6  = [0,1,2,3,2,1];
const PAT12 = [0,1,2,3,2,1,0,1,2,3,2,1];
function guitarArp(v, t, vel) {
  PAT6.forEach((p,e) => addNote(C_GTR, t + e*TPE, v[p%v.length], TPE*2, vel*(e===0?1:0.8)));
}
function guitarFlurry(v, t, vel) {
  PAT12.forEach((p,i) => addNote(C_GTR, t + i*(TPE/2), v[p%v.length], TPE, vel*(i%3===0?1:0.7)));
}
function bassNote(root, t, bars, vel) {
  addNote(C_BASS, t, root+'2', Math.round(bars*TPB), vel);
}
function luteNote(n, t, vel) { addNote(C_LUTE, t, n, TPE*2, vel); }

// ─── Partition ───────────────────────────────────────────────────────────────
for (let bar = 1; bar <= BARS; bar++) {
  const cn = (bar>=45&&bar<=64) ? cloitreChord(bar) : chordAt(bar);
  const c  = CH[cn];
  const t0 = T(bar,0), t3 = T(bar,3);

  // Basse
  if ((bar>=29&&bar<=44)||(bar>=65&&bar<=88)) {
    bassNote(c.root, t0, 0.5, 0.75); bassNote(c.root, t3, 0.5, 0.65);
  } else {
    bassNote(c.root, t0, 1.0, bar===1?0.90:0.72);
  }

  if (bar <= 12) {
    // LE SEUIL
    const ph = bar<=2?1:bar<=4?2:bar<=8?3:4;
    harpRoll(c.harp.slice(0,ph===1?3:5), t0, 0.62);
    if (ph>=3) { addNote(C_HARP,t3,c.harp[4],TPE*2,0.42); guitarArp(c.gtr,t0,ph===4?0.75:0.60); }
    if (bar===2) luteNote('E5',T(bar,4),0.50);
    if (bar===4||bar===8||bar===12) c.orn.forEach((n,i)=>luteNote(n,T(bar,3+i),0.50-i*0.07));

  } else if (bar <= 28) {
    // L'APPEL
    const s2 = bar>20;
    harpRoll(c.harp, t0, 0.50);
    addNote(C_HARP,t3,c.harp[3],TPE*2,0.35);
    guitarArp(c.gtr, t0, s2?0.70:0.56);
    addDrum(t0,KICK,0.85); addDrum(t3,SLAP,0.65); addDrum(t3,PALMA,s2?0.50:0.36);
    if (s2) addDrum(T(bar,5),PALMA,0.28);
    if (bar%4===0) c.orn.forEach((n,i)=>luteNote(n,T(bar,4+i*0.5),0.30-i*0.05));

  } else if (bar <= 44) {
    // LA MARCHE
    const s2 = bar>36, last = bar===44;
    harpRoll(c.harp, t0, 0.52); harpRoll(c.harp.slice(2), t3, 0.34);
    if (!last) {
      guitarFlurry(c.gtr.map(up), t0, s2?0.85:0.72);
      addDrum(t0,KICK,0.90); addDrum(t3,SLAP,0.78); addDrum(t3,PALMA,0.50); addDrum(T(bar,5),PALMA,s2?0.40:0.30);
      if (s2) addDrum(T(bar,1),PALMA,0.28);
      if (bar%4===0) c.orn.forEach((n,i)=>luteNote(n,T(bar,4+i*0.5),0.32-i*0.05));
    }

  } else if (bar <= 64) {
    // LE CLOÎTRE
    const hv = 0.44 + (bar-45)*0.007;
    harpRoll(c.harp, t0, hv); harpRoll(c.harp.slice(2), t3, hv*0.6);
    if (bar>=49&&bar<=52) addNote(C_HARP,T(bar,1.5),c.harp[3],TPE*2,0.22);
    if (bar===48)         addNote(C_HARP,T(bar,2),  c.harp[4],TPE*2,0.28);
    if (bar>=53&&bar<=56&&bar%2===1) luteNote(c.orn[1],T(bar,4.5),0.20);
    if (bar===56) luteNote(c.orn[0],T(bar,1),0.24);
    if (bar>=57&&bar<=60) luteNote(c.orn[0],T(bar,4.5),0.24);
    if (bar>=61&&bar%2===1) addNote(C_HARP,T(bar,2),c.harp[4],TPE*2,0.25);

  } else if (bar <= 92) {
    // L'ASCENSION
    const ph = bar<=72?1:bar<=80?2:bar<=88?3:4;
    const hv = Math.min(0.54+(bar-65)*0.004, 0.65);
    harpRoll(c.harp, t0, hv); harpRoll(c.harp.slice(2), t3, hv*0.65);
    if (ph>=2) addNote(C_HARP,T(bar,1.5),c.harp[3],TPE*2,0.28);
    if (ph>=3) addNote(C_HARP,T(bar,4.5),c.harp[4],TPE*2,0.22);
    if (ph<=3) guitarFlurry(c.gtr.map(up), t0, ph===3?0.90:0.80);
    else       guitarArp(c.gtr, t0, 0.65);
    const pv = ph===4?0.55:0.85;
    addDrum(t0,KICK,pv); addDrum(t3,SLAP,ph===4?0.45:0.70);
    addDrum(t3,PALMA,ph===4?0.32:0.48); addDrum(T(bar,5),PALMA,ph===4?0.25:0.35);
    if (ph>=2) addDrum(T(bar,1),PALMA,0.28);
    if (ph===3) addDrum(T(bar,2),PALMA,0.22);

  } else {
    // LE RETOUR
    const ph = bar<=100?1:bar<=108?2:bar<=116?3:4;
    const hv = ph===1?0.50:ph===2?0.42:ph===3?0.34:0.26;
    harpRoll(c.harp, t0, hv);
    if (ph<=2) harpRoll(c.harp.slice(2), t3, hv*0.6);
    else       addNote(C_HARP,t3,c.harp[3],TPE*2,hv*0.7);
    if (ph===1)      guitarArp(c.gtr.map(up), t0, 0.68);
    else if (ph===2) guitarArp(c.gtr, t0, 0.50);
    if (ph===1) { addDrum(t0,KICK,0.65); addDrum(t3,SLAP,0.50); addDrum(t3,PALMA,0.36); }
    else if (ph===2) { addDrum(t0,KICK,0.40); addDrum(t3,PALMA,0.25); }
    if (ph>=2&&bar%4===0) c.orn.forEach((n,i)=>luteNote(n,T(bar,3+i),0.36-i*0.07));
    if (ph>=3) luteNote(c.orn[1],T(bar,4.5),0.28);
    if (ph===4&&bar%2===0) luteNote(c.orn[2],T(bar,2),0.22);
  }
}

// Mélodies
const mel = (ch,sb,arr,vel) => arr.forEach(([lb,e,d,n])=>addNote(ch,T(sb+lb-1,e),n,Math.round(d*TPE),vel));
mel(C_SYNTH,13,THEME,0.88);   mel(C_SYNTH,21,THEME,0.88);
mel(C_SYNTH,29,THEME_B,0.90); mel(C_SYNTH,37,THEME_B,0.90);
mel(C_SYNTH,65,THEME,0.88);   mel(C_SYNTH,73,THEME_B,0.90);
mel(C_SYNTH,81,THEME_B,0.90); mel(C_SYNTH,93,THEME,0.88);
mel(C_FLUTE,45,FLUTE_A,0.85); mel(C_FLUTE,53,FLUTE_B,0.85);
mel(C_FLUTE,61,FLUTE_TAG,0.80);

// ─── Écriture MIDI ───────────────────────────────────────────────────────────
function varLen(n) {
  if (n === 0) return [0];
  const b = []; let x = n;
  while (x > 0) { b.unshift(x & 0x7F); x >>= 7; }
  for (let i = 0; i < b.length-1; i++) b[i] |= 0x80;
  return b;
}
const u16 = n => [(n>>8)&0xFF, n&0xFF];
const u32 = n => [(n>>24)&0xFF,(n>>16)&0xFF,(n>>8)&0xFF,n&0xFF];

// Regrouper par canal et trier
const byCh = {};
for (let i = 0; i <= 9; i++) byCh[i] = [];
evts.forEach(ev => {
  byCh[ev.ch].push({ t:ev.t,       type:'on',  note:ev.note, vel:ev.vel });
  byCh[ev.ch].push({ t:ev.t+ev.dur, type:'off', note:ev.note, vel:0      });
});
for (const ch of Object.keys(byCh))
  byCh[ch].sort((a,b) => a.t - b.t || (a.type==='off'?-1:1));

// Track de tempo (piste 0)
function tempoTrack() {
  return [
    0x00,0xFF,0x51,0x03, (TEMPO>>16)&0xFF,(TEMPO>>8)&0xFF,TEMPO&0xFF,
    0x00,0xFF,0x58,0x04, 0x06,0x03,0x24,0x08,  // 6/8
    0x00,0xFF,0x2F,0x00,
  ];
}

// Track instrument
const TRACK_DEFS = [
  { name:'Synth Lead', ch:C_SYNTH, prog:81 },  // Lead 2 Sawtooth
  { name:'Flute',      ch:C_FLUTE, prog:73 },  // Flute
  { name:'Harp',       ch:C_HARP,  prog:46 },  // Orchestral Harp
  { name:'Guitar',     ch:C_GTR,   prog:24 },  // Acoustic Guitar Nylon
  { name:'Lute',       ch:C_LUTE,  prog:24 },  // (pas de luth GM → nylon guitar)
  { name:'Bass',       ch:C_BASS,  prog:32 },  // Acoustic Bass
  { name:'Percussion', ch:C_PERC,  prog:null}, // Canal 10 = drums GM
];

function buildTrack(name, ch, prog, evList) {
  const b = [];
  const nm = [...Buffer.from(name)];
  b.push(0x00,0xFF,0x03,...varLen(nm.length),...nm);
  if (prog !== null) b.push(0x00, 0xC0|(ch&0xF), prog&0x7F);
  let prev = 0;
  for (const e of evList) {
    const dt = e.t - prev; prev = e.t;
    b.push(...varLen(dt));
    b.push((e.type==='on'?0x90:0x80)|(ch&0xF), e.note&0x7F, Math.min(127,Math.max(0,e.vel)));
  }
  b.push(0x00,0xFF,0x2F,0x00);
  return b;
}

// Assembler
const chunks = [];
const tt = tempoTrack();
chunks.push([0x4D,0x54,0x72,0x6B,...u32(tt.length),...tt]);
let nTracks = 1;
for (const {name,ch,prog} of TRACK_DEFS) {
  const lst = byCh[ch];
  if (!lst || !lst.length) continue;
  const td = buildTrack(name, ch, prog, lst);
  chunks.push([0x4D,0x54,0x72,0x6B,...u32(td.length),...td]);
  nTracks++;
}
const header = [0x4D,0x54,0x68,0x64,...u32(6),...u16(1),...u16(nTracks),...u16(TPQN)];
const all = [header, ...chunks].flat();
const out = path.join(__dirname,'le-seuil.mid');
fs.writeFileSync(out, Buffer.from(all));
console.log(`MIDI généré : ${out}`);
console.log(`${all.length} octets — ${nTracks} tracks`);
TRACK_DEFS.forEach(({name,ch,prog})=>console.log(`  Canal ${ch}: ${name}${prog!==null?' (prog GM '+prog+')':' (drums)'}`));
