import React, { useState, useEffect } from 'react';

// ── Demo cards ─────────────────────────────────────────────────────────────
const DEMO_CARDS = [
  { rank: 'A',  suit: '♠', suitName: 'spades'   },
  { rank: 'K',  suit: '♥', suitName: 'hearts'   },
  { rank: '7',  suit: '♦', suitName: 'diamonds' },
  { rank: 'J',  suit: '♣', suitName: 'clubs'    },
  { rank: '10', suit: '♠', suitName: 'spades'   },
];

// ── Rank maps ──────────────────────────────────────────────────────────────
// Clockwork : chiffres arabes lisibles, 10 standard
const RANK_STEAM = { A:'A',2:'2',3:'3',4:'4',5:'5',6:'6',7:'7',8:'8',9:'9',10:'10',J:'J',Q:'Q',K:'K' };
// Runes Elder Futhark — désormais petit accent, la valeur lisible passe en grand
const RANK_RUNE  = { A:'ᚨ',2:'ᚢ',3:'ᚦ',4:'ᚱ',5:'ᚲ',6:'ᚷ',7:'ᚹ',8:'ᚺ',9:'ᚾ',10:'ᛁ',J:'ᛃ',Q:'ᛇ',K:'ᛈ' };
// Pleine largeur unicode vaporwave
const RANK_FULL  = { A:'Ａ',2:'２',3:'３',4:'４',5:'５',6:'６',7:'７',8:'８',9:'９',10:'１０',J:'Ｊ',Q:'Ｑ',K:'Ｋ' };
// Terminal hex : nombres 02-09, têtes lisibles K Q J, 10 standard
const RANK_SYS   = { A:'A',2:'02',3:'03',4:'04',5:'05',6:'06',7:'07',8:'08',9:'09',10:'10',J:'J',Q:'Q',K:'K' };

// ── Suit maps ──────────────────────────────────────────────────────────────
const SUIT_STEAM = { spades:'⚙',hearts:'♨',diamonds:'✦',clubs:'⚒' };
const SUIT_CYBER = { spades:'▲',hearts:'◈',diamonds:'⬡',clubs:'⊕' };
const SUIT_ELDR  = { spades:'☾',hearts:'⊗',diamonds:'✶',clubs:'⊛' };
const SUIT_NORSE = { spades:'⚔',hearts:'☽',diamonds:'ᛟ',clubs:'⚡' };
const SUIT_VAPOR = { spades:'♤',hearts:'♡',diamonds:'♢',clubs:'♧' };
const SUIT_SPACE = { spades:'✦',hearts:'☉',diamonds:'◎',clubs:'☽' };
const SUIT_BIO   = { spades:'⬡',hearts:'⊕',diamonds:'∿',clubs:'◉' };

const isRed = s => s === 'hearts' || s === 'diamonds';
// Mécanique Graffiti : 4 couleurs distinctes, une par enseigne
const GRAFF_COLOR = { spades:'#00e5ff',hearts:'#ff1493',diamonds:'#ffe600',clubs:'#39ff14' };

// Mécanique Noir : taches/coulures de sang — disposition déterministe, différente par rang
const RANKS_ALL = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const NOIR_BLOOD = {};
RANKS_ALL.forEach((r, i) => {
  const count = 2 + (i % 3);
  const marks = [];
  for (let k = 0; k < count; k++) {
    const seed = i * 7 + k * 13 + 5;
    marks.push({
      top:  6 + (seed * 37) % 78,
      left: 6 + (seed * 53) % 82,
      size: 7 + (seed * 11) % 13,
      drip: seed % 3 === 0,
      rot:  (seed * 29) % 360,
    });
  }
  NOIR_BLOOD[r] = marks;
});

// ── CSS ────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Share+Tech+Mono&family=Press+Start+2P&family=Righteous&family=Special+Elite&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');

* { box-sizing: border-box; }

@keyframes gear-spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes steam-rise   { 0%{opacity:.6;transform:translateY(0)} 100%{opacity:0;transform:translateY(-36px) scaleX(1.4)} }
@keyframes glitch       { 0%,93%,100%{transform:translate(0)} 94%{transform:translate(-3px,1px);filter:hue-rotate(90deg)} 96%{transform:translate(3px,-1px)} 98%{transform:translate(-2px,2px);filter:hue-rotate(200deg)} }
@keyframes scanline     { from{top:-100%} to{top:200%} }
@keyframes pixel-blink  { 0%,49%{opacity:1} 50%,100%{opacity:.2} }
@keyframes vapor-bg     { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes eldr-pulse   { 0%,100%{box-shadow:0 0 12px #6600cc,0 0 30px rgba(102,0,200,.2)} 50%{box-shadow:0 0 22px #9900ff,0 0 55px rgba(153,0,255,.4)} }
@keyframes rune-glow    { 0%,100%{text-shadow:0 0 6px #c8a235,0 0 12px rgba(200,162,53,.4)} 50%{text-shadow:0 0 16px #ffcc44,0 0 32px rgba(255,204,68,.8)} }
@keyframes chrome-shine { 0%{left:-120%} 50%,100%{left:120%} }
@keyframes grid-pulse   { 0%,100%{opacity:.12} 50%{opacity:.28} }
@keyframes manga-flash  { 0%,100%{background:transparent} 50%{background:rgba(255,255,255,.05)} }
@keyframes rain-fall    { 0%{transform:translateY(0);opacity:0} 15%{opacity:.55} 80%{opacity:.55} 100%{transform:translateY(220px);opacity:0} }
@keyframes star-twink   { 0%,100%{opacity:.1;transform:scale(.7)} 50%{opacity:1;transform:scale(1.4)} }
@keyframes bio-pulse    { 0%,100%{box-shadow:0 0 8px rgba(0,255,68,.35),0 0 20px rgba(0,255,68,.08)} 50%{box-shadow:0 0 20px rgba(0,255,68,.65),0 0 45px rgba(0,255,68,.2)} }
@keyframes amber-pulse  { 0%,100%{box-shadow:0 0 8px rgba(255,170,0,.35),0 0 20px rgba(255,170,0,.08)} 50%{box-shadow:0 0 20px rgba(255,170,0,.65),0 0 45px rgba(255,170,0,.2)} }
@keyframes sys-flicker  { 0%,92%,100%{opacity:1} 93%{opacity:.1} 95%{opacity:.8} 98%{opacity:.05} }
@keyframes drip-grow    { 0%{height:0;opacity:.9} 70%{opacity:.6} 100%{height:32px;opacity:0} }
@keyframes origami-fold { 0%,100%{opacity:.1} 50%{opacity:.2} }

.skin-tab { cursor:pointer; padding:10px 16px; border-radius:10px; display:flex; align-items:center; gap:8px; transition:all .2s; border:1px solid transparent; }
.skin-tab:hover { background:rgba(255,255,255,.06); }
.skin-tab.active { background:rgba(255,255,255,.1); border-color:rgba(255,255,255,.2); }
`;

// ── Skin definitions ───────────────────────────────────────────────────────
const SKINS = [
  // ── 1. Clockwork Empire ────────────────────────────────────────────────
  {
    id: 'steampunk',
    name: 'Clockwork Empire',
    emoji: '⚙️',
    shortDesc: 'Steampunk victorien',
    uniqueFeatures: [
      'Chiffres arabes lisibles à grande vitesse (10 standard)',
      'Cartes rouges sur fond cuivre-rouge, noires sur fond bronze',
      'Enseignes ⚙ ♨ ✦ ⚒ — engrenage, vapeur, étoile, marteau',
      'Engrenage de fond animé en filigrane',
      'Bulles de vapeur qui montent aux bords',
    ],
    inspiration: 'Steampunk, esthétique victorienne, Dishonored',
    rankMap: RANK_STEAM,
    suitMap: SUIT_STEAM,
    rankColor: s => isRed(s) ? '#e8a050' : '#d4a843',
    suitColor: s => isRed(s) ? '#e05a1a' : '#c4922a',
    cardStyle: s => ({
      background: isRed(s)
        ? 'radial-gradient(ellipse at 30% 30%,#4a1c10 0%,#2a0d06 60%,#180603 100%)'
        : 'radial-gradient(ellipse at 30% 30%,#3d2a10 0%,#1c1108 60%,#0f0903 100%)',
      border: isRed(s) ? '2px solid #a8481c' : '2px solid #8b6914',
      boxShadow: '0 6px 24px rgba(0,0,0,.8),inset 0 1px 0 rgba(212,168,67,.2)',
      borderRadius: 10,
    }),
    rankFont: '"Cinzel","Palatino Linotype",serif',
    rankSize: 26,
    suitSize: 28,
    pageAccent: '#c4922a',
    pageBg: '#0f0903',
    Overlay: () => (
      <>
        <div style={{ position:'absolute',bottom:6,right:6,fontSize:40,opacity:.08,
          animation:'gear-spin 12s linear infinite',pointerEvents:'none',color:'#c4922a' }}>⚙</div>
        {[1,2,3].map(i => (
          <div key={i} style={{ position:'absolute',bottom:0,left:`${20+i*20}%`,width:4,height:4,
            borderRadius:'50%',background:'rgba(255,160,60,.6)',
            animation:`steam-rise ${1.5+i*.5}s ease-out ${i*.4}s infinite` }} />
        ))}
        <div style={{ position:'absolute',top:4,left:5,fontSize:8,color:'rgba(200,162,53,.25)',pointerEvents:'none' }}>◆</div>
        <div style={{ position:'absolute',top:4,right:5,fontSize:8,color:'rgba(200,162,53,.25)',pointerEvents:'none' }}>◆</div>
      </>
    ),
  },

  // ── 2. NEON_SYS v2.0 ──────────────────────────────────────────────────
  {
    id: 'cyberpunk',
    name: 'NEON_SYS v2.0',
    emoji: '🔷',
    shortDesc: 'Cyberpunk / terminal hex',
    uniqueFeatures: [
      'Nombres 02–09 zéro-paddés, têtes lisibles K Q J, 10 standard',
      'Enseignes géométriques ▲ ◈ ⬡ ⊕ avec glow néon',
      'Glitch RGB aléatoire — décalage de pixels',
      'Scanline cyan qui défile en continu',
      'Scintillement de néon imprévisible (sys-flicker)',
    ],
    inspiration: 'Cyberpunk 2077, culture hacker, terminaux Unix',
    rankMap: RANK_SYS,
    suitMap: SUIT_CYBER,
    rankColor: s => isRed(s) ? '#ff2d78' : '#00e5ff',
    suitColor: s => isRed(s) ? '#ff2d78' : '#00e5ff',
    suitGlowColor: s => isRed(s) ? '#ff2d78' : '#00e5ff',
    cardStyle: {
      background: '#040d14',
      border: '1px solid #00e5ff',
      boxShadow: '0 0 12px rgba(0,229,255,.3),0 0 30px rgba(0,229,255,.1),inset 0 0 20px rgba(0,229,255,.04)',
      borderRadius: 6,
      animation: 'sys-flicker 7s infinite',
    },
    rankFont: '"Share Tech Mono","Courier New",monospace',
    rankSize: 18,
    suitSize: 24,
    pageAccent: '#00e5ff',
    pageBg: '#020811',
    Overlay: () => (
      <>
        <div style={{ position:'absolute',inset:0,
          background:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,229,255,.02) 3px,rgba(0,229,255,.02) 4px)',
          pointerEvents:'none',borderRadius:6,animation:'glitch 4s infinite' }} />
        <div style={{ position:'absolute',left:0,right:0,height:8,
          background:'linear-gradient(rgba(0,229,255,.15),transparent)',
          animation:'scanline 2.5s linear infinite',pointerEvents:'none' }} />
        <div style={{ position:'absolute',top:4,right:6,fontSize:7,
          color:'rgba(0,229,255,.35)',fontFamily:'monospace',letterSpacing:1 }}>SYS</div>
        <div style={{ position:'absolute',bottom:14,left:0,right:0,height:1,
          background:'linear-gradient(90deg,transparent,rgba(0,229,255,.1),rgba(0,229,255,.07),transparent)',
          pointerEvents:'none' }} />
      </>
    ),
  },

  // ── Vaporwave ─────────────────────────────────────────────────────────
  {
    id: 'vaporwave',
    name: 'Ａ Ｅ Ｓ Ｔ Ｈ Ｅ Ｔ Ｉ Ｃ',
    emoji: '🌸',
    shortDesc: 'Vaporwave / 80s aesthetics',
    uniqueFeatures: [
      'Caractères pleine largeur (Ａ Ｋ Ｑ Ｊ) — visuellement distincts',
      'Aberration chromatique VHS sur les chiffres (rouge+cyan décalé)',
      'Dégradé animé pink → purple → cyan en fond',
      'Grille VHS horizontal + vertical en overlay',
      'Watermark ｖｉｂｅｓ rose pâle en bas',
    ],
    inspiration: 'Vaporwave, outrun, aesthetics tumblr',
    rankMap: RANK_FULL,
    suitMap: SUIT_VAPOR,
    rankColor: () => '#ff80ff',
    suitColor: s => isRed(s) ? '#ff4fc8' : '#80c0ff',
    rankExtra: () => ({ textShadow: '1px 0 0 rgba(0,229,255,.55), -1px 0 0 rgba(255,80,200,.55)' }),
    cardStyle: {
      background: 'linear-gradient(135deg,#1a003a,#3d0060,#0a1540)',
      backgroundSize: '200% 200%',
      border: '1px solid rgba(255,80,200,.5)',
      boxShadow: '0 0 20px rgba(255,0,200,.2),inset 0 0 30px rgba(100,0,200,.1)',
      borderRadius: 8,
      animation: 'vapor-bg 6s ease infinite',
    },
    rankFont: '"Righteous","Arial",sans-serif',
    rankSize: 14,
    suitSize: 26,
    pageAccent: '#ff4fc8',
    pageBg: '#0d0020',
    Overlay: () => (
      <>
        <div style={{ position:'absolute',inset:0,
          background:'repeating-linear-gradient(0deg,transparent,transparent 18px,rgba(255,80,200,.07) 18px,rgba(255,80,200,.07) 19px),repeating-linear-gradient(90deg,transparent,transparent 18px,rgba(255,80,200,.04) 18px,rgba(255,80,200,.04) 19px)',
          pointerEvents:'none',borderRadius:8 }} />
        <div style={{ position:'absolute',bottom:6,left:0,right:0,textAlign:'center',
          fontSize:9,color:'rgba(255,160,240,.2)',fontFamily:'serif',letterSpacing:3 }}>ｖｉｂｅｓ</div>
      </>
    ),
  },

  // ── 5. The Nameless ───────────────────────────────────────────────────
  {
    id: 'eldritch',
    name: 'The Nameless',
    emoji: '👁',
    shortDesc: 'Lovecraftien / horreur cosmique',
    uniqueFeatures: [
      'Enseignes occultes ☾ ⊗ ✶ ⊛ — lune, œil barré, étoile, cible',
      'Chiffres en Cinzel — lisibles mais lourds, pesants',
      'Œil géant qui pulse doucement au centre',
      'Lueur violette qui respire (box-shadow animée)',
      'Croissant ☾ et rune ⊛ en watermarks tournés',
    ],
    inspiration: 'Lovecraft, Darkest Dungeon, Thresh & Mordekaiser',
    rankMap: {},
    suitMap: SUIT_ELDR,
    rankColor: () => '#9a7fc8',
    suitColor: s => isRed(s) ? '#8b1a1a' : '#6633aa',
    cardStyle: {
      background: 'radial-gradient(ellipse at 50% 30%,#1a0030 0%,#0d0010 70%)',
      border: '1px solid rgba(102,0,180,.5)',
      boxShadow: '0 0 12px rgba(102,0,200,.3),0 0 40px rgba(102,0,200,.1)',
      borderRadius: 8,
      animation: 'eldr-pulse 3s ease-in-out infinite',
    },
    rankFont: '"Cinzel","Palatino Linotype",serif',
    rankSize: 26,
    suitSize: 28,
    pageAccent: '#8833cc',
    pageBg: '#060008',
    Overlay: () => (
      <>
        <div style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
          fontSize:58,opacity:.05,color:'#aa66ff',pointerEvents:'none',
          animation:'eldr-pulse 4s ease-in-out infinite' }}>👁</div>
        <div style={{ position:'absolute',bottom:5,right:7,fontSize:20,opacity:.07,
          color:'#8833cc',transform:'rotate(20deg)',pointerEvents:'none' }}>⊛</div>
        <div style={{ position:'absolute',top:5,left:7,fontSize:14,opacity:.07,
          color:'#8833cc',transform:'rotate(-15deg)',pointerEvents:'none' }}>☾</div>
      </>
    ),
  },

  // ── 6. Futhark ────────────────────────────────────────────────────────
  {
    id: 'norse',
    name: 'Futhark',
    emoji: '⚔️',
    shortDesc: 'Norse / Viking runes',
    uniqueFeatures: [
      'Valeur lisible en grand — lecture instantanée à haute vitesse',
      'Rune Elder Futhark en petit accent doré qui scintille (rune-glow)',
      'Cartes rouges sur bois rouge-sang, noires sur bois bronze',
      'Enseignes nordiques ⚔ ☽ ᛟ ⚡',
      'Texture bois vieilli + filigrane ᛋᚢᚱᛏ',
    ],
    inspiration: 'God of War, Valheim, Runescape',
    rankMap: {},
    suitMap: SUIT_NORSE,
    helperRank: true,
    helperMap: RANK_RUNE,
    helperStyle: s => ({
      fontSize: 15,
      color: isRed(s) ? '#c83c3c' : '#c8a235',
      fontFamily: '"Cinzel","Palatino Linotype",serif',
      animation: 'rune-glow 2.5s ease-in-out infinite',
    }),
    rankColor: s => isRed(s) ? '#e06a6a' : '#e0c050',
    suitColor: s => isRed(s) ? '#c83c3c' : '#c8a235',
    cardStyle: s => ({
      background: isRed(s)
        ? 'linear-gradient(160deg,#301208 0%,#1f0a06 50%,#2a0f08 100%)'
        : 'linear-gradient(160deg,#2a1e0a 0%,#1a1208 50%,#221a08 100%)',
      border: isRed(s) ? '2px solid #7e2e12' : '2px solid #6b4c0e',
      boxShadow: '0 4px 20px rgba(0,0,0,.8),inset 0 0 20px rgba(0,0,0,.4)',
      borderRadius: 6,
    }),
    rankFont: '"Cinzel","Palatino Linotype",serif',
    rankSize: 30,
    suitSize: 26,
    pageAccent: '#c8a235',
    pageBg: '#0d0a04',
    Overlay: () => (
      <>
        <div style={{ position:'absolute',inset:0,
          background:'repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(0,0,0,.05) 8px,rgba(0,0,0,.05) 9px)',
          pointerEvents:'none' }} />
        <div style={{ position:'absolute',top:4,right:5,fontSize:9,
          color:'rgba(200,162,53,.28)',fontFamily:'serif' }}>ᛋᚢᚱᛏ</div>
      </>
    ),
  },

  // ── 7. CHROME_88 ──────────────────────────────────────────────────────
  {
    id: 'synthwave',
    name: 'CHROME_88',
    emoji: '🌅',
    shortDesc: 'Synthwave / outrun 80s',
    uniqueFeatures: [
      'Texte dégradé chrome CSS (or → blanc → violet → rose)',
      'Grille perspective qui pulse en bas de carte',
      'Reflet chrome qui balaye la carte toutes les 3,5s',
      'Enseignes ◆ chromées uniformes — toutes couleurs',
      'Fond coucher de soleil néon violet/orange',
    ],
    inspiration: 'Outrun, synthwave, Drive (film), Jayce Neon Strike',
    rankMap: {},
    suitMap: { spades:'◆',hearts:'◆',diamonds:'◆',clubs:'◆' },
    rankGradient: 'linear-gradient(160deg,#ffe566 0%,#ffffff 35%,#c8a0ff 70%,#ff6ec7 100%)',
    suitColor: s => isRed(s) ? '#ff5577' : '#aaccff',
    cardStyle: {
      background: 'linear-gradient(180deg,#0a0014 0%,#140028 60%,#1a0a00 100%)',
      border: '1px solid rgba(255,80,200,.5)',
      boxShadow: '0 0 15px rgba(255,80,200,.2),0 0 40px rgba(100,60,255,.1)',
      borderRadius: 8,
      overflow: 'hidden',
    },
    rankFont: '"Righteous","Arial Black",sans-serif',
    rankSize: 28,
    suitSize: 22,
    pageAccent: '#ff4fc8',
    pageBg: '#060010',
    Overlay: () => (
      <>
        <div style={{ position:'absolute',bottom:0,left:0,right:0,height:'45%',
          background:'repeating-linear-gradient(transparent,transparent 8px,rgba(255,80,200,.08) 8px,rgba(255,80,200,.08) 9px),linear-gradient(180deg,transparent 0%,rgba(255,80,200,.05) 100%)',
          pointerEvents:'none',animation:'grid-pulse 2s ease-in-out infinite' }} />
        <div style={{ position:'absolute',inset:0,overflow:'hidden',borderRadius:8,pointerEvents:'none' }}>
          <div style={{ position:'absolute',top:0,bottom:0,width:'40%',
            background:'linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent)',
            animation:'chrome-shine 3.5s ease-in-out 1s infinite' }} />
        </div>
      </>
    ),
  },

  // ── NOIR_CITY ─────────────────────────────────────────────────────────
  {
    id: 'noir',
    name: 'NOIR_CITY',
    emoji: '🎞️',
    shortDesc: 'Film noir / détective années 40',
    uniqueFeatures: [
      'Mécanique unique : taches/coulures de sang propres à chaque rang',
      'Le rouge sang est la SEULE couleur — tout le reste en gris/blanc',
      'Police machine à écrire Special Elite',
      'Pluie animée qui traverse la carte',
      'Watermark CLASSIFIED + grain de pellicule',
    ],
    inspiration: 'Sin City, Blade Runner, L.A. Noire, The Maltese Falcon',
    rankMap: {},
    suitMap: { spades:'♠',hearts:'♥',diamonds:'♦',clubs:'♣' },
    rankColor: s => isRed(s) ? '#cc1111' : '#e0e0e0',
    suitColor: s => isRed(s) ? '#cc1111' : '#aaa',
    cardStyle: {
      background: 'linear-gradient(160deg,#1c1c1c 0%,#111 60%,#1a1a1a 100%)',
      border: '1px solid #333',
      boxShadow: '4px 4px 12px rgba(0,0,0,.9),inset 0 0 30px rgba(0,0,0,.3)',
      borderRadius: 4,
      overflow: 'hidden',
    },
    rankFont: '"Special Elite","Courier New",serif',
    rankSize: 26,
    suitSize: 28,
    pageAccent: '#cc1111',
    pageBg: '#0a0a0a',
    Overlay: ({ rank }) => (
      <>
        {(NOIR_BLOOD[rank] || []).map((m, i) => (
          <React.Fragment key={i}>
            <div style={{ position:'absolute', top:`${m.top}%`, left:`${m.left}%`,
              width:m.size, height:m.size * 0.85, borderRadius:'52% 48% 46% 54%',
              background:'radial-gradient(circle at 38% 32%,#d11a1a 0%,#8a0c0c 55%,#4a0606 100%)',
              transform:`rotate(${m.rot}deg)`, opacity:.82, pointerEvents:'none',
              boxShadow:'0 0 3px rgba(170,12,12,.45)' }} />
            {m.drip && (
              <div style={{ position:'absolute', top:`${m.top + 3}%`, left:`${m.left + 1.5}%`,
                width:2, height:m.size * 1.7,
                background:'linear-gradient(#8a0c0c,#5a0808,transparent)',
                pointerEvents:'none', opacity:.7 }} />
            )}
          </React.Fragment>
        ))}
        {[1,2,3,4,5].map(i => (
          <div key={`r${i}`} style={{ position:'absolute',top:0,left:`${8+i*17}%`,width:1,height:14,
            background:'rgba(200,200,200,.3)',
            animation:`rain-fall ${1.8+i*.28}s linear ${i*.32}s infinite` }} />
        ))}
        <div style={{ position:'absolute',inset:0,
          background:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,.012) 2px,rgba(255,255,255,.012) 3px)',
          pointerEvents:'none' }} />
        <div style={{ position:'absolute',bottom:4,left:0,right:0,textAlign:'center',
          fontSize:7,color:'rgba(255,255,255,.08)',fontFamily:'"Special Elite"',letterSpacing:2 }}>CLASSIFIED</div>
      </>
    ),
  },

  // ── 10. DEEP_COSMOS ──────────────────────────────────────────────────
  {
    id: 'cosmos',
    name: 'DEEP_COSMOS',
    emoji: '🌌',
    shortDesc: 'Espace profond / astronomie',
    uniqueFeatures: [
      'Mécanique unique : fond de carte différent selon l\'enseigne',
      'Enseignes astronomiques ✦ ☉ ◎ ☽ — étoile, soleil, orbite, lune',
      'Étoiles qui scintillent (5 points animés décalés)',
      'Chiffres en monospace bleu stellaire ou ambre solaire',
      'Bordure constellation subtile — bleu galactique',
    ],
    inspiration: 'NASA, Stellarium, Mass Effect, 2001 A Space Odyssey',
    rankMap: {},
    suitMap: SUIT_SPACE,
    rankColor: s => isRed(s) ? '#ffaa66' : '#88aaff',
    suitColor: s => isRed(s) ? '#ffaa66' : '#88aaff',
    cardStyle: s => ({
      background: s === 'hearts'
        ? 'radial-gradient(ellipse at 40% 30%,#3a0a20 0%,#0a0020 100%)'
        : s === 'diamonds'
        ? 'radial-gradient(ellipse at 60% 40%,#2a1500 0%,#080010 100%)'
        : s === 'clubs'
        ? 'radial-gradient(ellipse at 50% 60%,#001a2a 0%,#000510 100%)'
        : 'radial-gradient(ellipse at 30% 40%,#0a0a2a 0%,#000510 100%)',
      border: '1px solid rgba(136,170,255,.2)',
      boxShadow: '0 0 20px rgba(80,100,255,.12),0 0 50px rgba(80,100,255,.05)',
      borderRadius: 8,
    }),
    rankFont: '"Share Tech Mono","Courier New",monospace',
    rankSize: 22,
    suitSize: 28,
    pageAccent: '#88aaff',
    pageBg: '#02030f',
    Overlay: () => (
      <>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ position:'absolute',
            top:`${12+i*15}%`,left:`${10+i*18}%`,
            width:3,height:3,borderRadius:'50%',background:'#fff',
            animation:`star-twink ${1.5+i*.4}s ease-in-out ${i*.55}s infinite` }} />
        ))}
        <div style={{ position:'absolute',bottom:4,right:6,fontSize:7,
          color:'rgba(136,170,255,.2)',fontFamily:'monospace' }}>ly</div>
      </>
    ),
  },

  // ── BIO_CELL ──────────────────────────────────────────────────────────
  {
    id: 'bio',
    name: 'BIO_CELL',
    emoji: '🧬',
    shortDesc: 'Bioluminescent / labo obscur',
    uniqueFeatures: [
      'Mécanique unique : vert phosphore (♠♣) vs ambre bio (♥♦)',
      'Fond + glow différents selon la couleur de l\'enseigne',
      'Enseignes biologie ⬡ ⊕ ∿ ◉ — cellule, mitose, ADN, noyau',
      'Grille hexagonale de cellules en arrière-plan',
      'Terminal monospace — ambiance microscope numérique',
    ],
    inspiration: 'Alien Isolation, Halo UNSC panels, BioShock',
    rankMap: {},
    suitMap: SUIT_BIO,
    rankColor: s => isRed(s) ? '#ffaa00' : '#00ff44',
    suitColor: s => isRed(s) ? '#ffaa00' : '#00ff44',
    suitGlowColor: s => isRed(s) ? '#ffaa00' : '#00ff44',
    cardStyle: s => ({
      background: isRed(s)
        ? 'radial-gradient(ellipse at 50% 40%,#1a1200 0%,#080600 100%)'
        : 'radial-gradient(ellipse at 50% 40%,#001a08 0%,#000602 100%)',
      border: `1px solid ${isRed(s) ? 'rgba(255,170,0,.3)' : 'rgba(0,255,68,.3)'}`,
      borderRadius: 6,
      animation: isRed(s) ? 'amber-pulse 2.5s ease-in-out infinite' : 'bio-pulse 2.5s ease-in-out infinite',
    }),
    rankFont: '"Share Tech Mono","Courier New",monospace',
    rankSize: 22,
    suitSize: 26,
    pageAccent: '#00ff44',
    pageBg: '#000802',
    Overlay: ({ suitName }) => (
      <>
        <div style={{ position:'absolute',inset:0,
          background:'repeating-linear-gradient(60deg,transparent,transparent 12px,rgba(0,255,68,.02) 12px,rgba(0,255,68,.02) 13px),repeating-linear-gradient(-60deg,transparent,transparent 12px,rgba(0,255,68,.02) 12px,rgba(0,255,68,.02) 13px)',
          pointerEvents:'none' }} />
        <div style={{ position:'absolute',top:4,right:5,fontSize:7,
          color:isRed(suitName)?'rgba(255,170,0,.3)':'rgba(0,255,68,.3)',
          fontFamily:'monospace',letterSpacing:1 }}>CELL</div>
      </>
    ),
  },

  // ── GRAFFITI ──────────────────────────────────────────────────────────
  {
    id: 'graffiti',
    name: 'GRAFFITI',
    emoji: '🎨',
    shortDesc: 'Street art / aérosol urbain',
    uniqueFeatures: [
      'Mécanique unique : 4 couleurs distinctes, une par enseigne',
      '♠ cyan · ♥ rose · ♦ jaune · ♣ lime — jamais rouge/noir',
      'Glow spray paint : chaque enseigne rayonne sa propre couleur',
      'Gouttes de peinture animées en bas de carte (drip)',
      'Fond béton texturé + hachures diagonales légères',
    ],
    inspiration: 'Banksy, graffiti NYC, Street Fighter, Tony Hawk Pro Skater',
    rankMap: {},
    suitMap: { spades:'♠',hearts:'♥',diamonds:'♦',clubs:'♣' },
    rankColor: s => GRAFF_COLOR[s],
    suitColor: s => GRAFF_COLOR[s],
    suitGlowColor: s => GRAFF_COLOR[s],
    rankExtra: s => ({
      textShadow: `0 0 12px ${GRAFF_COLOR[s]},0 0 30px ${GRAFF_COLOR[s]}88,2px 2px 0 rgba(0,0,0,.85)`,
    }),
    cardStyle: {
      background: '#111',
      border: '1px solid #2a2a2a',
      boxShadow: '0 4px 16px rgba(0,0,0,.85)',
      borderRadius: 4,
    },
    rankFont: '"Impact","Arial Black",sans-serif',
    rankSize: 30,
    suitSize: 28,
    pageAccent: '#ff1493',
    pageBg: '#0a0a0a',
    Overlay: ({ suitName }) => (
      <>
        <div style={{ position:'absolute',inset:0,
          background:'repeating-linear-gradient(45deg,transparent,transparent 3px,rgba(255,255,255,.012) 3px,rgba(255,255,255,.012) 4px)',
          pointerEvents:'none' }} />
        {[1,2,3].map(i => (
          <div key={i} style={{ position:'absolute',top:'100%',left:`${14+i*24}%`,width:3,
            height:0,background:GRAFF_COLOR[suitName],borderRadius:'0 0 4px 4px',
            animation:`drip-grow ${2.5+i*.6}s ease-out ${i*.9}s infinite` }} />
        ))}
      </>
    ),
  },
];

// ── Card component ─────────────────────────────────────────────────────────
function SkinCard({ skin, card, size = 'normal' }) {
  const w = size === 'large' ? 150 : 115;
  const h = size === 'large' ? 210 : 160;
  const { Overlay } = skin;

  const rank = skin.rankMap[card.rank] || card.rank;
  const suit = skin.suitMap[card.suitName] || card.suit;

  // cardStyle peut être une fonction (mécanique par enseigne)
  const cardStyleResolved = typeof skin.cardStyle === 'function'
    ? skin.cardStyle(card.suitName)
    : skin.cardStyle;

  // Petit accent secondaire (rune Futhark, etc.) — helperMap optionnel
  const helperVal = skin.helperMap ? (skin.helperMap[card.rank] || card.rank) : card.rank;
  const helperStyleBase = { fontSize: 9, color: 'rgba(200,162,53,.6)', fontFamily: 'monospace', lineHeight: 1 };
  const helperStyleSkin = typeof skin.helperStyle === 'function'
    ? skin.helperStyle(card.suitName)
    : (skin.helperStyle || {});
  const helperStyle = { ...helperStyleBase, ...helperStyleSkin };

  // Roue dentée dans certains chiffres (Clockwork : 6 et 9)
  const showGear = skin.gearRanks && skin.gearRanks.includes(card.rank);
  const gearTop = card.rank === '6' ? '62%' : '36%';
  const RankSpan = ({ style, children }) => (
    <span style={{ position:'relative', display:'inline-block' }}>
      <span style={style}>{children}</span>
      {showGear && (
        <span style={{ position:'absolute', left:'46%', top:gearTop, transform:'translate(-50%,-50%)',
          fontSize: Math.round((style.fontSize || 26) * 0.42), color:'#e8c060', opacity:.92,
          animation:'gear-spin 6s linear infinite', pointerEvents:'none',
          textShadow:'0 0 2px rgba(0,0,0,.8)' }}>⚙</span>
      )}
    </span>
  );

  // Couleur du rang : gradient CSS ou couleur plate
  const colorStyle = skin.rankGradient
    ? { background: skin.rankGradient, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }
    : { color: typeof skin.rankColor === 'function' ? skin.rankColor(card.suitName) : skin.rankColor };

  // Styles supplémentaires par enseigne (outline, glow, etc.)
  const extraStyle = skin.rankExtra ? skin.rankExtra(card.suitName) : {};

  const rankStyle = {
    fontFamily: skin.rankFont,
    fontSize: skin.rankSize,
    fontWeight: 700,
    lineHeight: 1,
    animation: skin.rankAnimation,
    ...colorStyle,
    ...extraStyle,
  };

  // Glow drop-shadow sur l'enseigne si défini
  const glowColor = skin.suitGlowColor ? skin.suitGlowColor(card.suitName) : null;
  const suitStyle = {
    fontSize: skin.suitSize,
    color: typeof skin.suitColor === 'function' ? skin.suitColor(card.suitName) : skin.suitColor,
    lineHeight: 1,
    display: 'block',
    textAlign: 'center',
    filter: glowColor ? `drop-shadow(0 0 4px ${glowColor})` : undefined,
  };

  const cornerRankStyle = { ...rankStyle, fontSize: Math.round(skin.rankSize * 0.5) };

  return (
    <div style={{ position:'relative', width:w, height:h, ...cardStyleResolved,
      display:'flex', flexDirection:'column', padding:'8px 10px', flexShrink:0 }}>

      {Overlay && <Overlay suitName={card.suitName} suit={suit} rank={card.rank} />}

      {/* Top-left corner */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:1, zIndex:1 }}>
        <RankSpan style={rankStyle}>{rank}</RankSpan>
        {skin.helperRank && <span style={helperStyle}>{helperVal}</span>}
        <span style={{ ...suitStyle, fontSize: Math.round(skin.suitSize * 0.55), textAlign:'left' }}>{suit}</span>
      </div>

      {/* Center suit */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', zIndex:1 }}>
        <span style={{ ...suitStyle, fontSize: Math.round(skin.suitSize * 1.6) }}>{suit}</span>
      </div>

      {/* Bottom-right corner (inverted) */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:1,
        transform:'rotate(180deg)', zIndex:1 }}>
        <RankSpan style={cornerRankStyle}>{rank}</RankSpan>
        {skin.helperRank && <span style={helperStyle}>{helperVal}</span>}
        <span style={{ ...suitStyle, fontSize: Math.round(skin.suitSize * 0.45), textAlign:'left' }}>{suit}</span>
      </div>
    </div>
  );
}

// ── Main showcase ──────────────────────────────────────────────────────────
export default function SkinShowcase() {
  const [activeSkin, setActiveSkin] = useState(SKINS[0]);
  const [tick, setTick] = useState(0);

  useEffect(() => { setTick(t => t + 1); }, [activeSkin]);

  const skin = activeSkin;

  return (
    <div style={{ minHeight:'100vh', background: skin.pageBg, color:'#fff',
      fontFamily:'system-ui,sans-serif', transition:'background 0.5s' }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{ padding:'24px 32px 16px', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
        <div style={{ fontSize:11, letterSpacing:'.15em', textTransform:'uppercase',
          color:'rgba(255,255,255,.4)', marginBottom:4 }}>Elite Counter — Skin Workshop</div>
        <div style={{ fontSize:26, fontWeight:700, color: skin.pageAccent }}>
          {skin.emoji} {skin.name}
        </div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,.5)', marginTop:4 }}>{skin.shortDesc}</div>
      </div>

      <div style={{ display:'flex', gap:0 }}>

        {/* Left sidebar */}
        <div style={{ width:240, padding:'16px 12px', borderRight:'1px solid rgba(255,255,255,.06)',
          minHeight:'calc(100vh - 100px)', flexShrink:0, overflowY:'auto' }}>
          <div style={{ fontSize:10, letterSpacing:'.1em', color:'rgba(255,255,255,.3)',
            textTransform:'uppercase', marginBottom:10, paddingLeft:8 }}>Skins ({SKINS.length})</div>
          {SKINS.map(s => (
            <div key={s.id} className={`skin-tab${s.id === skin.id ? ' active' : ''}`}
              onClick={() => setActiveSkin(s)}
              style={{ color: s.id === skin.id ? s.pageAccent : 'rgba(255,255,255,.6)' }}>
              <span style={{ fontSize:18 }}>{s.emoji}</span>
              <div>
                <div style={{ fontSize:12, fontWeight:600 }}>{s.name}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.35)', marginTop:1 }}>{s.shortDesc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main area */}
        <div style={{ flex:1, padding:'32px 40px' }}>

          {/* Cards preview */}
          <div style={{ marginBottom:32 }}>
            <div style={{ fontSize:11, letterSpacing:'.1em', textTransform:'uppercase',
              color:'rgba(255,255,255,.35)', marginBottom:20 }}>Aperçu — 5 cartes</div>
            <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
              {DEMO_CARDS.map((card, i) => (
                <SkinCard key={`${skin.id}-${i}-${tick}`} skin={skin} card={card} size="large" />
              ))}
            </div>
          </div>

          {/* All values */}
          <div style={{ marginBottom:32 }}>
            <div style={{ fontSize:11, letterSpacing:'.1em', textTransform:'uppercase',
              color:'rgba(255,255,255,.35)', marginBottom:16 }}>Toutes les valeurs</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {['A','2','3','4','5','6','7','8','9','10','J','Q','K'].map(rank => (
                <SkinCard key={rank} skin={skin}
                  card={{ rank, suit:'♠', suitName:'spades' }} size="normal" />
              ))}
            </div>
          </div>

          {/* Color comparison */}
          <div style={{ marginBottom:32 }}>
            <div style={{ fontSize:11, letterSpacing:'.1em', textTransform:'uppercase',
              color:'rgba(255,255,255,.35)', marginBottom:16 }}>Comparaison couleurs / mécanique</div>
            <div style={{ display:'flex', gap:12 }}>
              {[
                { rank:'A', suit:'♠', suitName:'spades' },
                { rank:'A', suit:'♥', suitName:'hearts' },
                { rank:'K', suit:'♣', suitName:'clubs' },
                { rank:'K', suit:'♦', suitName:'diamonds' },
              ].map((card, i) => (
                <SkinCard key={i} skin={skin} card={card} size="large" />
              ))}
            </div>
          </div>

          {/* Features */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
            <div style={{ background:'rgba(255,255,255,.04)', borderRadius:12,
              border:'1px solid rgba(255,255,255,.06)', padding:'20px 24px' }}>
              <div style={{ fontSize:11, letterSpacing:'.1em', textTransform:'uppercase',
                color: skin.pageAccent, marginBottom:14 }}>⚡ Spécificités uniques</div>
              {skin.uniqueFeatures.map((f, i) => (
                <div key={i} style={{ display:'flex', gap:10, marginBottom:10, alignItems:'flex-start' }}>
                  <span style={{ color: skin.pageAccent, fontSize:14, flexShrink:0 }}>›</span>
                  <span style={{ fontSize:13, color:'rgba(255,255,255,.7)', lineHeight:1.5 }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ background:'rgba(255,255,255,.04)', borderRadius:12,
              border:'1px solid rgba(255,255,255,.06)', padding:'20px 24px' }}>
              <div style={{ fontSize:11, letterSpacing:'.1em', textTransform:'uppercase',
                color: skin.pageAccent, marginBottom:14 }}>🎮 Inspiration</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,.7)', lineHeight:1.8 }}>
                {skin.inspiration}
              </div>
              <div style={{ marginTop:20, padding:'12px 16px', background:'rgba(255,255,255,.03)',
                borderRadius:8, border:`1px solid ${skin.pageAccent}33` }}>
                <div style={{ fontSize:10, color: skin.pageAccent, letterSpacing:'.08em', marginBottom:6 }}>ID DU SKIN</div>
                <code style={{ fontSize:13, color:'rgba(255,255,255,.8)' }}>{skin.id}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
