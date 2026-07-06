import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, X, ChevronRight, ChevronLeft, Eye, EyeOff, AlertTriangle, Globe, Volume2, VolumeX, Music, Vibrate, BookOpen, DoorOpen, Flame, CalendarDays, Sparkles, Award, Gem, BarChart3, ScrollText, Lock, KeyRound } from 'lucide-react';
import TutorialOverlay from './EliteCounterTutorial.jsx';
import { makeT, DEFAULT_LANG, getLanguage } from './i18n';
import { LanguageSelectScreen, LanguageModal, Flag } from './LanguageSelect.jsx';
import { initAudio, setMuted, playCorrect, playWrong, playChip, playRankUp, playAchievement, playClick, playCountdown, playGo, playCardFlip, playVictory, playDefeat } from './src/sounds.js';
import { fadeInLobbyMusic, fadeOutLobbyMusic, setMusicMuted, setMusicVolume } from './src/music.js';
import { setHapticsEnabled, vibrateWin, vibrateLose, vibrateTap } from './src/haptics.js';

// ─── Constants ────────────────────────────────────────────────────
const CARD_VALUES = {
  '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
  '7': 0, '8': 0, '9': 0,
  '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1
};
const SUITS = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' };
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const CARD_SKINS = [
  { id: 'classic',  name: 'Classic',        price: 0,    bg: 'bg-white',                                         border: 'border-gray-300' },
  { id: 'gold',     name: 'Gold Luxury',     price: 300,  bg: 'bg-gradient-to-br from-yellow-100 to-yellow-50',   border: 'border-yellow-500' },
  { id: 'royal',    name: 'Royal Purple',    price: 500,  bg: 'bg-gradient-to-br from-purple-200 to-purple-50',   border: 'border-purple-600' },
  { id: 'ice',      name: 'Frozen Ice',      price: 750,  bg: 'bg-gradient-to-br from-slate-900 to-blue-950',     border: 'border-cyan-400' },
  { id: 'matrix',   name: 'Matrix Code',     price: 1000, bg: 'bg-gradient-to-br from-green-950 to-black',        border: 'border-green-500' },
  { id: 'neon',     name: 'Neon Cyber',      price: 1400, bg: 'bg-gradient-to-br from-purple-900 to-pink-900',    border: 'border-pink-500' },
  { id: 'blood',    name: 'Blood Diamond',   price: 1900, bg: 'bg-gradient-to-br from-red-950 to-black',          border: 'border-red-600' },
  { id: 'voidgold', name: 'Gold Chains',      price: 2500, bg: 'bg-gradient-to-br from-amber-50 to-yellow-100',    border: 'border-amber-500' },
  { id: 'obsidian', name: 'Obsidian Void ◆', price: 0, secret: true, bg: 'bg-gradient-to-br from-gray-950 to-black', border: 'border-gray-700' }
];

// ─── SUPPORT SKINS — premium "Me soutenir" pack (10 skins, mécaniques uniques) ──
const isRedSuit = s => s === 'hearts' || s === 'diamonds';

const RANK_STEAM = { A:'A',2:'2',3:'3',4:'4',5:'5',6:'6',7:'7',8:'8',9:'9',10:'10',J:'J',Q:'Q',K:'K' };
const RANK_RUNE  = { A:'ᚨ',2:'ᚢ',3:'ᚦ',4:'ᚱ',5:'ᚲ',6:'ᚷ',7:'ᚹ',8:'ᚺ',9:'ᚾ',10:'ᛁ',J:'ᛃ',Q:'ᛇ',K:'ᛈ' };
const RANK_FULL  = { A:'Ａ',2:'２',3:'３',4:'４',5:'５',6:'６',7:'７',8:'８',9:'９',10:'１０',J:'Ｊ',Q:'Ｑ',K:'Ｋ' };
const RANK_SYS   = { A:'A',2:'02',3:'03',4:'04',5:'05',6:'06',7:'07',8:'08',9:'09',10:'10',J:'J',Q:'Q',K:'K' };

const SUIT_STEAM = { spades:'⚙',hearts:'♨',diamonds:'✦',clubs:'⚒' };
const SUIT_CYBER = { spades:'▲',hearts:'◈',diamonds:'⬡',clubs:'⊕' };
const SUIT_ELDR  = { spades:'☾',hearts:'⊗',diamonds:'✶',clubs:'⊛' };
const SUIT_NORSE = { spades:'⚔',hearts:'☽',diamonds:'ᛟ',clubs:'⚡' };
const SUIT_VAPOR = { spades:'♤',hearts:'♡',diamonds:'♢',clubs:'♧' };
const SUIT_SPACE = { spades:'✦',hearts:'☉',diamonds:'◎',clubs:'☽' };
const SUIT_BIO   = { spades:'⬡',hearts:'⊕',diamonds:'∿',clubs:'◉' };

const GRAFF_COLOR = { spades:'#00e5ff',hearts:'#ff1493',diamonds:'#ffe600',clubs:'#39ff14' };

// Taches/coulures de sang Noir — déterministe, différentes par rang
const NOIR_BLOOD = {};
RANKS.forEach((r, i) => {
  const count = 2 + (i % 3);
  const marks = [];
  for (let k = 0; k < count; k++) {
    const seed = i * 7 + k * 13 + 5;
    marks.push({
      top:  6 + (seed * 37) % 78,
      left: 6 + (seed * 53) % 82,
      size: 10 + (seed * 11) % 18,
      drip: seed % 3 === 0,
      rot:  (seed * 29) % 360,
    });
  }
  NOIR_BLOOD[r] = marks;
});

const SUPPORT_SKINS = [
  {
    id: 'sp_steampunk', name: 'Clockwork Empire', tagline: 'Steampunk · engrenages & vapeur',
    accent: '#c4922a', rankFont: '"Cinzel","Palatino Linotype",serif', rankSize: 39, suitSize: 42,
    rankMap: RANK_STEAM, suitMap: SUIT_STEAM,
    rankColor: s => isRedSuit(s) ? '#e8a050' : '#d4a843',
    suitColor: s => isRedSuit(s) ? '#e05a1a' : '#c4922a',
    cardStyle: s => ({
      background: isRedSuit(s)
        ? 'radial-gradient(ellipse at 30% 30%,#4a1c10 0%,#2a0d06 60%,#180603 100%)'
        : 'radial-gradient(ellipse at 30% 30%,#3d2a10 0%,#1c1108 60%,#0f0903 100%)',
      border: isRedSuit(s) ? '2px solid #a8481c' : '2px solid #8b6914',
      boxShadow: '0 6px 24px rgba(0,0,0,.8),inset 0 1px 0 rgba(212,168,67,.2)', borderRadius: 14,
    }),
    Overlay: () => (
      <>
        <div style={{ position:'absolute',bottom:10,right:10,fontSize:60,opacity:.08,
          animation:'gear-spin 12s linear infinite',pointerEvents:'none',color:'#c4922a' }}>⚙</div>
        {[1,2,3].map(i => (
          <div key={i} style={{ position:'absolute',bottom:0,left:`${20+i*20}%`,width:5,height:5,
            borderRadius:'50%',background:'rgba(255,160,60,.6)',
            animation:`steam-rise ${1.5+i*.5}s ease-out ${i*.4}s infinite` }} />
        ))}
      </>
    ),
  },
  {
    id: 'sp_cyber', name: 'NEON_SYS v2.0', tagline: 'Cyberpunk · hex 02-09, têtes K Q J T',
    accent: '#00e5ff', rankFont: '"Share Tech Mono","Courier New",monospace', rankSize: 27, suitSize: 36,
    rankMap: RANK_SYS, suitMap: SUIT_CYBER,
    rankColor: s => isRedSuit(s) ? '#ff2d78' : '#00e5ff',
    suitColor: s => isRedSuit(s) ? '#ff2d78' : '#00e5ff',
    suitGlowColor: s => isRedSuit(s) ? '#ff2d78' : '#00e5ff',
    cardStyle: {
      background: '#040d14', border: '1px solid #00e5ff',
      boxShadow: '0 0 12px rgba(0,229,255,.3),0 0 30px rgba(0,229,255,.1),inset 0 0 20px rgba(0,229,255,.04)',
      borderRadius: 10, animation: 'sys-flicker 7s infinite', overflow: 'hidden',
    },
    Overlay: () => (
      <>
        <div style={{ position:'absolute',inset:0,
          background:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,229,255,.02) 3px,rgba(0,229,255,.02) 4px)',
          pointerEvents:'none',animation:'glitch 4s infinite' }} />
        <div style={{ position:'absolute',left:0,right:0,height:12,
          background:'linear-gradient(rgba(0,229,255,.15),transparent)',
          animation:'scanline 2.5s linear infinite',pointerEvents:'none' }} />
        <div style={{ position:'absolute',top:8,right:10,fontSize:10,
          color:'rgba(0,229,255,.35)',fontFamily:'monospace',letterSpacing:1 }}>SYS</div>
      </>
    ),
  },
  {
    id: 'sp_vapor', name: 'AESTHETIC', tagline: 'Vaporwave · pleine largeur + VHS',
    accent: '#ff4fc8', rankFont: '"Righteous","Arial",sans-serif', rankSize: 21, suitSize: 39,
    rankMap: RANK_FULL, suitMap: SUIT_VAPOR,
    rankColor: () => '#ff80ff',
    suitColor: s => isRedSuit(s) ? '#ff4fc8' : '#80c0ff',
    rankExtra: () => ({ textShadow: '1px 0 0 rgba(0,229,255,.55), -1px 0 0 rgba(255,80,200,.55)' }),
    cardStyle: {
      background: 'linear-gradient(135deg,#1a003a,#3d0060,#0a1540)', backgroundSize: '200% 200%',
      border: '1px solid rgba(255,80,200,.5)',
      boxShadow: '0 0 20px rgba(255,0,200,.2),inset 0 0 30px rgba(100,0,200,.1)',
      borderRadius: 12, animation: 'vapor-bg 6s ease infinite',
    },
    Overlay: () => (
      <>
        <div style={{ position:'absolute',inset:0,
          background:'repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(255,80,200,.07) 24px,rgba(255,80,200,.07) 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,rgba(255,80,200,.04) 24px,rgba(255,80,200,.04) 25px)',
          pointerEvents:'none',borderRadius:12 }} />
        <div style={{ position:'absolute',bottom:10,left:0,right:0,textAlign:'center',
          fontSize:12,color:'rgba(255,160,240,.2)',fontFamily:'serif',letterSpacing:4 }}>ｖｉｂｅｓ</div>
      </>
    ),
  },
  {
    id: 'sp_eldritch', name: 'The Nameless', tagline: 'Horreur cosmique · œil qui pulse',
    accent: '#8833cc', rankFont: '"Cinzel","Palatino Linotype",serif', rankSize: 39, suitSize: 42,
    rankMap: {}, suitMap: SUIT_ELDR,
    rankColor: () => '#9a7fc8',
    suitColor: s => isRedSuit(s) ? '#8b1a1a' : '#6633aa',
    cardStyle: {
      background: 'radial-gradient(ellipse at 50% 30%,#1a0030 0%,#0d0010 70%)',
      border: '1px solid rgba(102,0,180,.5)',
      boxShadow: '0 0 12px rgba(102,0,200,.3),0 0 40px rgba(102,0,200,.1)',
      borderRadius: 12, animation: 'eldr-pulse 3s ease-in-out infinite',
    },
    Overlay: () => (
      <>
        <div style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
          fontSize:90,opacity:.05,color:'#aa66ff',pointerEvents:'none',
          animation:'eldr-pulse 4s ease-in-out infinite' }}>👁</div>
        <div style={{ position:'absolute',bottom:8,right:10,fontSize:30,opacity:.07,
          color:'#8833cc',transform:'rotate(20deg)',pointerEvents:'none' }}>⊛</div>
        <div style={{ position:'absolute',top:8,left:10,fontSize:22,opacity:.07,
          color:'#8833cc',transform:'rotate(-15deg)',pointerEvents:'none' }}>☾</div>
      </>
    ),
  },
  {
    id: 'sp_norse', name: 'Futhark', tagline: 'Viking · valeur lisible + rune accent',
    accent: '#c8a235', rankFont: '"Cinzel","Palatino Linotype",serif', rankSize: 45, suitSize: 39,
    rankMap: {}, suitMap: SUIT_NORSE, helperRank: true, helperMap: RANK_RUNE,
    helperStyle: s => ({ fontSize: 22, color: isRedSuit(s) ? '#c83c3c' : '#c8a235',
      fontFamily: '"Cinzel","Palatino Linotype",serif', animation: 'rune-glow 2.5s ease-in-out infinite' }),
    rankColor: s => isRedSuit(s) ? '#e06a6a' : '#e0c050',
    suitColor: s => isRedSuit(s) ? '#c83c3c' : '#c8a235',
    cardStyle: s => ({
      background: isRedSuit(s)
        ? 'linear-gradient(160deg,#301208 0%,#1f0a06 50%,#2a0f08 100%)'
        : 'linear-gradient(160deg,#2a1e0a 0%,#1a1208 50%,#221a08 100%)',
      border: isRedSuit(s) ? '2px solid #7e2e12' : '2px solid #6b4c0e',
      boxShadow: '0 4px 20px rgba(0,0,0,.8),inset 0 0 20px rgba(0,0,0,.4)', borderRadius: 10,
    }),
    Overlay: () => (
      <>
        <div style={{ position:'absolute',inset:0,
          background:'repeating-linear-gradient(45deg,transparent,transparent 12px,rgba(0,0,0,.05) 12px,rgba(0,0,0,.05) 13px)',
          pointerEvents:'none' }} />
        <div style={{ position:'absolute',top:8,right:8,fontSize:13,
          color:'rgba(200,162,53,.28)',fontFamily:'serif' }}>ᛋᚢᚱᛏ</div>
      </>
    ),
  },
  {
    id: 'sp_synth', name: 'CHROME_88', tagline: 'Synthwave · chrome + grille néon',
    accent: '#ff4fc8', rankFont: '"Righteous","Arial Black",sans-serif', rankSize: 42, suitSize: 33,
    rankMap: {}, suitMap: { spades:'◆',hearts:'◆',diamonds:'◆',clubs:'◆' },
    rankGradient: 'linear-gradient(160deg,#ffe566 0%,#ffffff 35%,#c8a0ff 70%,#ff6ec7 100%)',
    suitColor: s => isRedSuit(s) ? '#ff5577' : '#aaccff',
    cardStyle: {
      background: 'linear-gradient(180deg,#0a0014 0%,#140028 60%,#1a0a00 100%)',
      border: '1px solid rgba(255,80,200,.5)',
      boxShadow: '0 0 15px rgba(255,80,200,.2),0 0 40px rgba(100,60,255,.1)',
      borderRadius: 12, overflow: 'hidden',
    },
    Overlay: () => (
      <>
        <div style={{ position:'absolute',bottom:0,left:0,right:0,height:'45%',
          background:'repeating-linear-gradient(transparent,transparent 12px,rgba(255,80,200,.08) 12px,rgba(255,80,200,.08) 13px),linear-gradient(180deg,transparent 0%,rgba(255,80,200,.05) 100%)',
          pointerEvents:'none',animation:'grid-pulse 2s ease-in-out infinite' }} />
        <div style={{ position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none' }}>
          <div style={{ position:'absolute',top:0,bottom:0,width:'40%',
            background:'linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent)',
            animation:'chrome-shine 3.5s ease-in-out 1s infinite' }} />
        </div>
      </>
    ),
  },
  {
    id: 'sp_noir', name: 'NOIR_CITY', tagline: 'Film noir · sang propre à chaque rang',
    accent: '#cc1111', rankFont: '"Special Elite","Courier New",serif', rankSize: 39, suitSize: 42,
    rankMap: {}, suitMap: { spades:'♠',hearts:'♥',diamonds:'♦',clubs:'♣' },
    rankColor: s => isRedSuit(s) ? '#cc1111' : '#e0e0e0',
    suitColor: s => isRedSuit(s) ? '#cc1111' : '#aaa',
    cardStyle: {
      background: 'linear-gradient(160deg,#1c1c1c 0%,#111 60%,#1a1a1a 100%)',
      border: '1px solid #333',
      boxShadow: '4px 4px 12px rgba(0,0,0,.9),inset 0 0 30px rgba(0,0,0,.3)',
      borderRadius: 8, overflow: 'hidden',
    },
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
                width:2.5, height:m.size * 1.8,
                background:'linear-gradient(#8a0c0c,#5a0808,transparent)',
                pointerEvents:'none', opacity:.7 }} />
            )}
          </React.Fragment>
        ))}
        {[1,2,3,4,5].map(i => (
          <div key={`r${i}`} style={{ position:'absolute',top:0,left:`${8+i*17}%`,width:1,height:20,
            background:'rgba(200,200,200,.3)',
            animation:`rain-fall ${1.8+i*.28}s linear ${i*.32}s infinite` }} />
        ))}
        <div style={{ position:'absolute',bottom:6,left:0,right:0,textAlign:'center',
          fontSize:9,color:'rgba(255,255,255,.08)',fontFamily:'"Special Elite"',letterSpacing:3 }}>CLASSIFIED</div>
      </>
    ),
  },
  {
    id: 'sp_cosmos', name: 'DEEP_COSMOS', tagline: 'Espace · fond unique par enseigne',
    accent: '#88aaff', rankFont: '"Share Tech Mono","Courier New",monospace', rankSize: 33, suitSize: 42,
    rankMap: {}, suitMap: SUIT_SPACE,
    rankColor: s => isRedSuit(s) ? '#ffaa66' : '#88aaff',
    suitColor: s => isRedSuit(s) ? '#ffaa66' : '#88aaff',
    cardStyle: s => ({
      background: s === 'hearts'
        ? 'radial-gradient(ellipse at 40% 30%,#3a0a20 0%,#0a0020 100%)'
        : s === 'diamonds'
        ? 'radial-gradient(ellipse at 60% 40%,#2a1500 0%,#080010 100%)'
        : s === 'clubs'
        ? 'radial-gradient(ellipse at 50% 60%,#001a2a 0%,#000510 100%)'
        : 'radial-gradient(ellipse at 30% 40%,#0a0a2a 0%,#000510 100%)',
      border: '1px solid rgba(136,170,255,.2)',
      boxShadow: '0 0 20px rgba(80,100,255,.12),0 0 50px rgba(80,100,255,.05)', borderRadius: 12,
    }),
    Overlay: () => (
      <>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{ position:'absolute',
            top:`${10+i*13}%`,left:`${8+i*15}%`,
            width:4,height:4,borderRadius:'50%',background:'#fff',
            animation:`star-twink ${1.5+i*.4}s ease-in-out ${i*.55}s infinite` }} />
        ))}
      </>
    ),
  },
  {
    id: 'sp_bio', name: 'BIO_CELL', tagline: 'Bioluminescent · vert vs ambre',
    accent: '#00ff44', rankFont: '"Share Tech Mono","Courier New",monospace', rankSize: 33, suitSize: 39,
    rankMap: {}, suitMap: SUIT_BIO,
    rankColor: s => isRedSuit(s) ? '#ffaa00' : '#00ff44',
    suitColor: s => isRedSuit(s) ? '#ffaa00' : '#00ff44',
    suitGlowColor: s => isRedSuit(s) ? '#ffaa00' : '#00ff44',
    cardStyle: s => ({
      background: isRedSuit(s)
        ? 'radial-gradient(ellipse at 50% 40%,#1a1200 0%,#080600 100%)'
        : 'radial-gradient(ellipse at 50% 40%,#001a08 0%,#000602 100%)',
      border: `1px solid ${isRedSuit(s) ? 'rgba(255,170,0,.3)' : 'rgba(0,255,68,.3)'}`,
      borderRadius: 10,
      animation: isRedSuit(s) ? 'amber-pulse 2.5s ease-in-out infinite' : 'bio-pulse 2.5s ease-in-out infinite',
    }),
    Overlay: ({ suitName }) => (
      <>
        <div style={{ position:'absolute',inset:0,
          background:'repeating-linear-gradient(60deg,transparent,transparent 18px,rgba(0,255,68,.02) 18px,rgba(0,255,68,.02) 19px),repeating-linear-gradient(-60deg,transparent,transparent 18px,rgba(0,255,68,.02) 18px,rgba(0,255,68,.02) 19px)',
          pointerEvents:'none' }} />
        <div style={{ position:'absolute',top:8,right:8,fontSize:10,
          color:isRedSuit(suitName)?'rgba(255,170,0,.3)':'rgba(0,255,68,.3)',
          fontFamily:'monospace',letterSpacing:1 }}>CELL</div>
      </>
    ),
  },
  {
    id: 'sp_graffiti', name: 'GRAFFITI', tagline: 'Street art · 4 couleurs néon',
    accent: '#ff1493', rankFont: '"Impact","Arial Black",sans-serif', rankSize: 45, suitSize: 42,
    rankMap: {}, suitMap: { spades:'♠',hearts:'♥',diamonds:'♦',clubs:'♣' },
    rankColor: s => GRAFF_COLOR[s], suitColor: s => GRAFF_COLOR[s], suitGlowColor: s => GRAFF_COLOR[s],
    rankExtra: s => ({ textShadow: `0 0 12px ${GRAFF_COLOR[s]},0 0 30px ${GRAFF_COLOR[s]}88,2px 2px 0 rgba(0,0,0,.85)` }),
    cardStyle: { background: '#111', border: '1px solid #2a2a2a', boxShadow: '0 4px 16px rgba(0,0,0,.85)', borderRadius: 8 },
    Overlay: ({ suitName }) => (
      <>
        <div style={{ position:'absolute',inset:0,
          background:'repeating-linear-gradient(45deg,transparent,transparent 4px,rgba(255,255,255,.012) 4px,rgba(255,255,255,.012) 5px)',
          pointerEvents:'none' }} />
        {[1,2,3].map(i => (
          <div key={i} style={{ position:'absolute',top:'100%',left:`${14+i*24}%`,width:4,
            height:0,background:GRAFF_COLOR[suitName],borderRadius:'0 0 4px 4px',
            animation:`drip-grow ${2.5+i*.6}s ease-out ${i*.9}s infinite` }} />
        ))}
      </>
    ),
  },
];
const SUPPORT_IDS = new Set(SUPPORT_SKINS.map(s => s.id));

// Nom d'un skin par id (CARD_SKINS + SUPPORT_SKINS) — pour les stats.
const skinNameById = (id) =>
  (CARD_SKINS.find(s => s.id === id) || SUPPORT_SKINS.find(s => s.id === id) || {}).name || id;

// ─── Icône pièce — SVG inline ────────────────────────────────────
// L'emoji 🪙 (U+1FA99, 2020) ne s'affiche pas sur Windows 10 (tofu).
// Ce SVG s'affiche de façon identique partout.
const Coin = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
    style={{ display: 'inline-block', verticalAlign: '-0.14em', flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" fill="#e8c96d" stroke="#9c7c2e" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="6.5" fill="none" stroke="#9c7c2e" strokeWidth="1.2" opacity="0.55" />
    <ellipse cx="9" cy="8.5" rx="2.4" ry="1.4" fill="#ffffff" opacity="0.45" transform="rotate(-30 9 8.5)" />
  </svg>
);

// ─── Sceau de rang — SVG inline ──────────────────────────────────
// Remplace les emojis-médailles (🥉💎👑…) : pentagone facetté teinté par rang,
// rendu identique partout (les emojis récents font des tofu sur Windows 10).
const RankSigil = ({ color = '#c9a24b', size = 28, dim = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
    style={{ display: 'block', flexShrink: 0, opacity: dim ? 0.45 : 1 }}>
    <path d="M12 1.8 L21.2 8.6 L17.7 21 L6.3 21 L2.8 8.6 Z"
      fill={color} fillOpacity="0.14" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M12 6 L17 9.7 L15.1 16.4 L8.9 16.4 L7 9.7 Z"
      fill={color} fillOpacity="0.5" stroke={color} strokeWidth="0.9" strokeLinejoin="round" />
    <circle cx="12" cy="11.8" r="1.5" fill={color} />
  </svg>
);

// ─── Le Marchand — silhouette encapuchonnée, SVG pur (zéro emoji) ──
const Merchant = ({ size = 46 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" style={{ flexShrink: 0 }}>
    {/* cape */}
    <path d="M24 3.5 C15.5 3.5 10.5 11 9.8 19.5 C9.3 25.5 7.6 30 6.2 34.5 L6.2 43 L41.8 43 L41.8 34.5 C40.4 30 38.7 25.5 38.2 19.5 C37.5 11 32.5 3.5 24 3.5 Z"
      fill="#1a1535" stroke="#c9a24b" strokeWidth="1.2" strokeLinejoin="round" />
    {/* capuche — l'ombre sous le tissu */}
    <path d="M24 7.5 C18.4 7.5 15 12.8 14.5 19 C14.2 23.5 15.8 27 24 27 C32.2 27 33.8 23.5 33.5 19 C33 12.8 29.6 7.5 24 7.5 Z"
      fill="#0d0a1a" />
    {/* regard sous la capuche */}
    <circle cx="19.8" cy="19.2" r="1.2" fill="#e8c97a" />
    <circle cx="28.2" cy="19.2" r="1.2" fill="#e8c97a" />
    {/* fermoir */}
    <path d="M24 29.5 L26 33.5 L24 37.5 L22 33.5 Z" fill="#c9a24b" opacity="0.85" />
    {/* pli de la cape */}
    <path d="M15 30 C14 34 13 38.5 12.5 43 M33 30 C34 34 35 38.5 35.5 43"
      stroke="#2e2654" strokeWidth="1.1" fill="none" />
  </svg>
);

// ─── Logo de l'app — l'Œil du Compteur (le blackjack se reflète dans l'iris) ──
// Œil géant : deux ronds forment l'iris (anneau + cadran gradué), la main As+10
// se reflète dedans, jetons Hi-Lo (+1 / −1) collés aux cartes.
const AppLogo = ({ size = 30 }) => {
  const SPADE = "M50 18 C50 18 24 40 24 58 C24 70 33 76 42 72 C42 78 39 84 33 88 L67 88 C61 84 58 78 58 72 C67 76 76 70 76 58 C76 40 50 18 50 18 Z";
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" aria-hidden="true" style={{ display: 'block', flexShrink: 0 }}>
      <defs>
        <linearGradient id="alGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e8c97a" />
          <stop offset="0.5" stopColor="#c9a24b" />
          <stop offset="1" stopColor="#8a6820" />
        </linearGradient>
        <radialGradient id="alIris" cx="42%" cy="36%" r="75%">
          <stop offset="0" stopColor="#2a1f52" />
          <stop offset="0.6" stopColor="#160f30" />
          <stop offset="1" stopColor="#0b0818" />
        </radialGradient>
        <clipPath id="alEyeClip"><path d="M2 64 Q64 8 126 64 Q64 120 2 64 Z" /></clipPath>
        <clipPath id="alIrisClip"><circle cx="64" cy="64" r="40" /></clipPath>
      </defs>
      {/* globe de l'œil */}
      <g clipPath="url(#alEyeClip)">
        <rect x="2" y="8" width="124" height="112" fill="url(#alIris)" />
      </g>
      {/* iris : reflet + cartes + jetons, borné par le cercle de l'iris */}
      <g clipPath="url(#alIrisClip)">
        <circle cx="64" cy="64" r="40" fill="#120c28" />
        {/* carte As */}
        <g transform="rotate(-11 64 92)">
          <rect x="46" y="38" width="36" height="52" rx="4" fill="#f4ecd6" stroke="#c9a24b" strokeWidth="1.6" />
          <text x="53" y="48" fontFamily="Cinzel,serif" fontWeight="700" fontSize="10" fill="#14102a" textAnchor="middle" dominantBaseline="central">A</text>
          <path d={SPADE} transform="translate(52.57,51.88) scale(0.2286)" fill="#14102a" />
        </g>
        {/* carte 10 */}
        <g transform="rotate(11 64 92)">
          <rect x="46" y="38" width="36" height="52" rx="4" fill="#f4ecd6" stroke="#c9a24b" strokeWidth="1.6" />
          <text x="55" y="48" fontFamily="Cinzel,serif" fontWeight="700" fontSize="9" fill="#14102a" textAnchor="middle" dominantBaseline="central">10</text>
          <path d={SPADE} transform="translate(52.57,51.88) scale(0.2286)" fill="#14102a" />
        </g>
        {/* jeton −1 collé à la carte gauche */}
        <circle cx="36" cy="62" r="9" fill="#2d2060" stroke="#c9a24b" strokeWidth="1.4" />
        <text x="36" y="63" fontFamily="Cinzel,serif" fontWeight="700" fontSize="9" fill="#e8c97a" textAnchor="middle" dominantBaseline="central">−1</text>
        {/* jeton +1 collé à la carte droite */}
        <circle cx="92" cy="62" r="9" fill="url(#alGold)" stroke="#8a6820" strokeWidth="1.2" />
        <text x="92" y="63" fontFamily="Cinzel,serif" fontWeight="700" fontSize="9" fill="#14102a" textAnchor="middle" dominantBaseline="central">+1</text>
        {/* reflets brillants */}
        <ellipse cx="49" cy="45" rx="11" ry="6" fill="#ffffff" opacity="0.20" transform="rotate(-22 49 45)" />
        <ellipse cx="82" cy="80" rx="5" ry="3" fill="#ffffff" opacity="0.12" transform="rotate(-22 82 80)" />
      </g>
      {/* les deux ronds de l'iris */}
      <circle cx="64" cy="64" r="46" fill="none" stroke="#e8c97a" strokeWidth="1.5" strokeDasharray="1.6 6" opacity="0.7" />
      <circle cx="64" cy="64" r="40" fill="none" stroke="#c9a24b" strokeWidth="2.6" />
      {/* paupières */}
      <path d="M2 64 Q64 8 126 64 Q64 120 2 64 Z" fill="none" stroke="#c9a24b" strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M12 60 Q64 20 116 60" fill="none" stroke="#c9a24b" strokeWidth="1" opacity="0.3" />
    </svg>
  );
};

// ─── CHALLENGES — Geometry Dash style: hard, short, retry-friendly ────
// coins: reward credited on unlock, matched to a specific skin price.
const CHALLENGES = [
  {
    id: 'frame_perfect',
    name: 'Frame Perfect',
    desc: '1 deck — 0.40s/carte ou plus dur — compteur caché',
    icon: '🎯', coins: 300,
    check: (ctx) => ctx.won && ctx.decks === 1 && ctx.spc <= 0.40 && !ctx.countWasShown,
  },
  {
    id: 'no_mercy',
    name: 'No Mercy',
    desc: 'Réussis la porte Or → Émeraude du premier coup — compteur caché',
    icon: '⚔️', coins: 500,
    // gateId 2 = Or→Émeraude (the hardest gate most players will first attempt)
    check: (ctx) => ctx.won && ctx.mode === 'placement' && ctx.slotType === 'gate' && ctx.gateId === 2 && ctx.firstAttemptOnThisSlot && !ctx.countWasShown,
  },
  {
    id: 'the_wall',
    name: 'The Wall',
    desc: '6 decks — 90%+ pénétration — 0.50s/carte ou moins — compteur caché',
    icon: '🧱', coins: 750,
    check: (ctx) => ctx.won && ctx.decks === 6 && ctx.penetration >= 90 && ctx.spc <= 0.50 && !ctx.countWasShown,
  },
  {
    id: 'blind_run',
    name: 'Blind Run',
    desc: '8 decks — 0.45s/carte ou plus dur — compteur caché',
    icon: '🕶️', coins: 1000,
    check: (ctx) => ctx.won && ctx.decks === 8 && ctx.spc <= 0.45 && !ctx.countWasShown,
  },
  {
    id: 'iron_streak',
    name: 'Iron Streak',
    desc: '10 victoires consécutives — 0.55s/carte moy. ou moins — compteur caché',
    icon: '⛓️', coins: 1400,
    check: (ctx) => ctx.streak >= 10 && ctx.streakAvgSpc <= 0.55 && !ctx.countWasShown,
  },
  {
    id: 'full_burn',
    name: 'Full Burn',
    desc: '8 decks — 95%+ pénétration — compteur caché',
    icon: '🔥', coins: 1900,
    // ~395 cards at 95% pen — endurance at near-full shoe, completely different from Blind Run
    check: (ctx) => ctx.won && ctx.decks === 8 && ctx.penetration >= 95 && !ctx.countWasShown,
  },
  {
    id: 'casino_complete',
    name: 'Casino Ready',
    desc: 'Terminer le Run en entier',
    icon: '🎰', coins: 2500,
    check: (ctx) => ctx.casinoChallengeComplete,
  },
];

// ─── CASINO CHALLENGE ────────────────────────────────────────────
const CASINO_STEPS = [
  { step: 0, decks: 1, penetration: 90, secPerCard: 0.40 },
  { step: 1, decks: 2, penetration: 90, secPerCard: 0.40 },
  { step: 2, decks: 4, penetration: 90, secPerCard: 0.40 },
  { step: 3, decks: 6, penetration: 90, secPerCard: 0.40 },
  { step: 4, decks: 8, penetration: 90, secPerCard: 0.40 },
];

const getCasinoStepConfig = (stepIdx) => {
  const s = CASINO_STEPS[stepIdx];
  const totalCards = Math.floor(52 * s.decks * s.penetration / 100);
  const timeLimit = Math.round(s.secPerCard * totalCards);
  return { ...s, totalCards, timeLimit };
};

// ─── DÉFI DU JOUR ────────────────────────────────────────────────
// Deck + config déterministes à partir de la date : identiques pour tout
// le monde le même jour, différents chaque jour. 1 tentative/jour, compteur
// toujours caché. Le "score du jour" (1000 = compte exact) se compare jour
// après jour, avec un streak de jours consécutifs réussis (façon Wordle).
const mulberry32 = (seed) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
// Clé de date locale "AAAA-M-J" — sert au verrouillage journalier.
const dayKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
// Graine numérique du jour (AAAAMMJJ) — pilote deck + config.
const daySeed = (d = new Date()) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();

// Réglages du défi. Jour normal : court (≤ 45 s), un poil plus simple que la
// ranked du joueur. Jour spécial (tous les 42 jours) : 8 decks mais temps/carte
// très généreux, réservé aux hauts rangs (sinon 8 decks = injouable/interminable).
const DAILY_MAX_SECONDS = 45;          // plafond strict d'un jour normal (toutes vitesses)
const DAILY_SPECIAL_CYCLE = 42;        // jours entre deux rituels spéciaux 8 decks
const DAILY_EASE = 1.15;               // temps/carte un peu plus lent que la ranked = plus simple
const DAILY_SPECIAL_SLOW = 1.5;        // jour spécial : bien plus lent que la ranked
const DAILY_SPECIAL_PEN = 50;          // pénétration réduite pour garder les 8 decks jouables
// Ancre du cycle : 2 juillet 2026 = jour 0 (premier rituel spécial).
// Jour d'install typique (3 juillet 2026) = jour 1 du cycle → 41 jours avant le suivant.
const DAILY_SPECIAL_REF_MS = Date.UTC(2026, 6, 2);

const isDailySpecialDay = (seed) => {
  const y = Math.floor(seed / 10000);
  const m = Math.floor((seed % 10000) / 100) - 1; // 0-indexé
  const d = seed % 100;
  const daysSinceRef = Math.floor((Date.UTC(y, m, d) - DAILY_SPECIAL_REF_MS) / 86400000);
  return daysSinceRef >= 0 && daysSinceRef % DAILY_SPECIAL_CYCLE === 0;
};

// Config du défi du jour : dérivée de la date ET du rang courant du joueur.
// Volontairement différente des games ranked (moins de decks, un peu plus lente
// par carte) et bien plus courte en temps global.
const getDailyConfig = (seed, rankId = 1, subRank = 1) => {
  const ranked = getRankConfig(rankId, subRank);
  const rng = mulberry32(seed);
  rng();             // slot réservé (maintenu pour ne pas décaler deckRoll/penRoll)
  const deckRoll = rng();
  const penRoll = rng();
  const special = rankId >= 5 && isDailySpecialDay(seed);

  if (special) {
    const decks = 8;
    const secPerCard = parseFloat((ranked.secPerCard * DAILY_SPECIAL_SLOW).toFixed(2));
    const totalCards = Math.floor(52 * decks * DAILY_SPECIAL_PEN / 100);
    return { seed, special: true, decks, penetration: DAILY_SPECIAL_PEN, secPerCard, totalCards, timeLimit: Math.round(secPerCard * totalCards) };
  }

  let penetration = [65, 70, 75][Math.floor(penRoll * 3)];
  const secPerCard = parseFloat((ranked.secPerCard * DAILY_EASE).toFixed(2));
  let decks = deckRoll < 0.6 ? 1 : 2;
  let totalCards = Math.floor(52 * decks * penetration / 100);
  let timeLimit = Math.round(secPerCard * totalCards);
  // Downgrade 2→1 deck si ça dépasse le plafond
  if (timeLimit > DAILY_MAX_SECONDS && decks === 2) {
    decks = 1;
    totalCards = Math.floor(52 * decks * penetration / 100);
    timeLimit = Math.round(secPerCard * totalCards);
  }
  // Cap absolu 45 s : on taille totalCards et on recalcule la pénétration réelle
  if (timeLimit > DAILY_MAX_SECONDS) {
    totalCards = Math.floor(DAILY_MAX_SECONDS / secPerCard);
    penetration = Math.round(totalCards / (52 * decks) * 100);
    timeLimit = Math.round(secPerCard * totalCards);
  }
  return { seed, special: false, decks, penetration, secPerCard, totalCards, timeLimit };
};

// Score du jour : 1000 au compte exact, −501 par unité d'écart (peut être négatif).
// Score négatif = défi manqué → la série (streak) est perdue.
const dailyScore = (error) => 1000 - Math.abs(error) * 501;

// ─── RANK SYSTEM ─────────────────────────────────────────────────
// Source de vérité par rang : id, name, icon, color, decks, mmrPerWin/Loss.
// NOTE : penetration / secPerCard / mmrToPromo / desc sont OBSOLÈTES — la pénétration
// et la vitesse sont désormais dérivées du sous-rang (voir getRankConfig / TIER_SPC).
// Rangs de la Guilde — noms propres NON traduits (identiques dans toutes les langues).
// Les emojis-médailles sont remplacés par le sceau SVG <RankSigil color={rank.color} />.
const RANKS_DEF = [
  { id: 1, name: 'Cuivre',     color: '#b87333', decks: 1, penetration: 75, secPerCard: 0.80, mmrPerWin: 20, mmrPerLoss: -15, mmrToPromo: 100, desc: '1 deck · 0.80s/carte' },
  { id: 2, name: 'Argent',     color: '#a8aabc', decks: 2, penetration: 75, secPerCard: 0.70, mmrPerWin: 20, mmrPerLoss: -15, mmrToPromo: 100, desc: '2 decks · 0.70s/carte' },
  { id: 3, name: 'Or',         color: '#c9a24b', decks: 4, penetration: 75, secPerCard: 0.62, mmrPerWin: 20, mmrPerLoss: -15, mmrToPromo: 100, desc: '4 decks · 0.62s/carte' },
  { id: 4, name: 'Émeraude',   color: '#2ecc71', decks: 6, penetration: 75, secPerCard: 0.55, mmrPerWin: 20, mmrPerLoss: -15, mmrToPromo: 100, desc: '6 decks · 0.55s/carte' },
  { id: 5, name: 'Saphir',     color: '#4a7de8', decks: 8, penetration: 80, secPerCard: 0.50, mmrPerWin: 20, mmrPerLoss: -15, mmrToPromo: 100, desc: '8 decks · 0.50s/carte' },
  { id: 6, name: 'Adamantium', color: '#9b59b6', decks: 8, penetration: 85, secPerCard: 0.45, mmrPerWin: 20, mmrPerLoss: -15, mmrToPromo: null, desc: '8 decks · 0.45s/carte — Rang final' },
];

// Les noms de rangs restent en français (noms propres, identiques partout).
// Un petit sous-titre traduit aide les joueurs non francophones à situer le rang.
// Comme le nom affiché EST déjà le français, on montre l'anglais aux joueurs FR
// (sinon le sous-titre serait identique au nom) et la langue courante ailleurs.
const RANK_TL = {
  Cuivre:     { en: 'Copper',   de: 'Kupfer',  es: 'Cobre',      it: 'Rame',       pt: 'Cobre',   ru: 'Медь',      ar: 'نحاس',        hi: 'तांबा',    ja: '銅',         ko: '구리',      zh: '铜',     mn: 'Зэс',      sq: 'Bakër' },
  Argent:     { en: 'Silver',   de: 'Silber',  es: 'Plata',      it: 'Argento',    pt: 'Prata',   ru: 'Серебро',   ar: 'فضة',         hi: 'चांदी',    ja: '銀',         ko: '은',        zh: '银',     mn: 'Мөнгө',    sq: 'Argjend' },
  Or:         { en: 'Gold',     de: 'Gold',    es: 'Oro',        it: 'Oro',        pt: 'Ouro',    ru: 'Золото',    ar: 'ذهب',         hi: 'सोना',     ja: '金',         ko: '금',        zh: '金',     mn: 'Алт',      sq: 'Ar' },
  Émeraude:   { en: 'Emerald',  de: 'Smaragd', es: 'Esmeralda',  it: 'Smeraldo',   pt: 'Esmeralda', ru: 'Изумруд', ar: 'زمرد',        hi: 'पन्ना',    ja: 'エメラルド', ko: '에메랄드', zh: '祖母绿', mn: 'Маргад',   sq: 'Smerald' },
  Saphir:     { en: 'Sapphire', de: 'Saphir',  es: 'Zafiro',     it: 'Zaffiro',    pt: 'Safira',  ru: 'Сапфир',    ar: 'ياقوت أزرق',  hi: 'नीलम',     ja: 'サファイア', ko: '사파이어', zh: '蓝宝石', mn: 'Индранил', sq: 'Safir' },
  Adamantium: { en: 'Adamantium', de: 'Adamantium', es: 'Adamantita', it: 'Adamantio', pt: 'Adamantium', ru: 'Адамантий', ar: 'أدامانتيوم', hi: 'एडामेंटियम', ja: 'アダマンチウム', ko: '아다만티움', zh: '精金', mn: 'Адамантиум', sq: 'Adamantium' },
};
// Sous-titre du rang dans la langue sélectionnée. En français, le nom affiché
// EST déjà le français → pas de sous-titre. Repli : rien si langue non traduite.
const rankTranscription = (name, lang) => {
  if (!lang || lang === 'fr') return '';
  const w = RANK_TL[name]?.[lang];
  return w && w !== name ? w : '';
};

// ─── SUB-RANK SYSTEM ─────────────────────────────────────────────
// Chaque rang (Cuivre…Adamantium) a 3 sous-rangs (I, II, III) = 18 paliers.
// Pénétration par sous-rang : I=60%, II=70%, III=80% (identique pour tous les rangs).
// Vitesse : courbe géométrique de Cuivre I (3.00s/carte) → Adamantium III (0.42s/carte)
// sur les 18 paliers (ratio ≈ 0.8908). Decks repris de RANKS_DEF.
const SUB_RANKS = 3;
const SUBRANK_PEN = { 1: 60, 2: 70, 3: 80 };
const TIER_SPC = [
  3.00, 2.67, 2.38,  // Cuivre     I/II/III
  2.12, 1.89, 1.68,  // Argent     I/II/III
  1.50, 1.34, 1.19,  // Or         I/II/III
  1.06, 0.94, 0.84,  // Émeraude   I/II/III
  0.75, 0.67, 0.59,  // Saphir     I/II/III
  0.53, 0.47, 0.42,  // Adamantium I/II/III
];
const MAX_TIER = TIER_SPC.length - 1; // 17 = Adamantium III (palier final absolu)
const tierIndex = (rankId, subRank) => (rankId - 1) * SUB_RANKS + (subRank - 1);
const tierToRank = (tier) => ({ rankId: Math.floor(tier / SUB_RANKS) + 1, subRank: (tier % SUB_RANKS) + 1 });
const ROMAN = ['I', 'II', 'III'];
const subRankRoman = (subRank) => ROMAN[subRank - 1] || '';

// Config effective d'un sous-rang : { decks, penetration, secPerCard, totalCards, timeLimit }
const getRankConfig = (rankId, subRank) => {
  const rank = RANKS_DEF[rankId - 1];
  const penetration = SUBRANK_PEN[subRank] ?? 60;
  const secPerCard = TIER_SPC[tierIndex(rankId, subRank)];
  const totalCards = Math.floor(52 * rank.decks * penetration / 100);
  return { decks: rank.decks, penetration, secPerCard, totalCards, timeLimit: Math.round(secPerCard * totalCards) };
};

// ─── PLACEMENT SYSTEM ────────────────────────────────────────────
// 5 fixed games. Each gate = promo config of that rank.
// Rattrapage (recovery) = same rank config +10% s/carte (easier).
//
// Slot types:
//   'gate'       → difficulté sous-rang 2 du rang FROM (70% pénétration)
//   'recovery'   → même config +10% s/carte (un peu plus facile)
//
// Flow per slot:
//   gate win     → next gate (if slots remain)
//   gate loss    → next slot = recovery for that rank
//   recovery win → next slot = retry same gate (if slots remain)
//   recovery loss→ placement ends, placed at that rank MMR 0
//
// Game 5 win (any type) → MMR 100 of resulting rank
// 5/5 gates passed      → Master MMR 100 + The Architect achievement

// Les gates ne portent que le mapping rang/label ; la difficulté (decks, pen, spc)
// est dérivée du sous-rang 2 (70% pénétration) du rang FROM via getRankConfig.
const PLACEMENT_GATES = [
  { gateId: 0, label: 'Cuivre → Argent',      fromRankId: 1, toRankId: 2 },
  { gateId: 1, label: 'Argent → Or',          fromRankId: 2, toRankId: 3 },
  { gateId: 2, label: 'Or → Émeraude',        fromRankId: 3, toRankId: 4 },
  { gateId: 3, label: 'Émeraude → Saphir',    fromRankId: 4, toRankId: 5 },
  { gateId: 4, label: 'Saphir → Adamantium',  fromRankId: 5, toRankId: 6 },
];

const getGateConfig = (gateId) => {
  const g = PLACEMENT_GATES[gateId];
  const cfg = getRankConfig(g.fromRankId, 2); // sous-rang 2 = 70% pénétration
  return { ...g, decks: cfg.decks, penetration: cfg.penetration, secPerCard: cfg.secPerCard,
    totalCards: cfg.totalCards, timeLimit: cfg.timeLimit };
};

// Recovery : même difficulté que la gate (sous-rang 2 du rang FROM) mais +10% s/carte
const getRecoveryConfig = (gateId) => {
  const g = PLACEMENT_GATES[gateId];
  const rank = RANKS_DEF[g.fromRankId - 1];
  const base = getRankConfig(g.fromRankId, 2);
  const spc = parseFloat((base.secPerCard * 1.10).toFixed(2));
  return {
    label: rank.name, // recovery suffix is appended (localized) at render via slotLabel()
    decks: base.decks,
    penetration: base.penetration,
    secPerCard: spc,
    timeLimit: Math.round(spc * base.totalCards),
    totalCards: base.totalCards,
  };
};

// Build next placement slot given current state
// Returns: { type:'gate'|'recovery', gateId, label, decks, pen, spc, timeLimit, totalCards }
const nextPlacementSlot = (history) => {
  // Walk history to determine where we are
  // history: array of { type:'gate'|'recovery', gateId, won }
  let currentGateId = 0;
  let expectingRecovery = false;

  for (const h of history) {
    if (h.type === 'gate') {
      if (h.won) {
        currentGateId = h.gateId + 1;
        expectingRecovery = false;
      } else {
        expectingRecovery = true;
        // currentGateId stays
      }
    } else { // recovery
      if (h.won) {
        expectingRecovery = false;
        // retry same gate — currentGateId unchanged
      } else {
        // placement over — but caller handles this
        return null;
      }
    }
  }

  if (currentGateId >= PLACEMENT_GATES.length) return null; // all gates passed

  if (expectingRecovery) {
    const cfg = getRecoveryConfig(currentGateId);
    return { type: 'recovery', gateId: currentGateId, ...cfg };
  } else {
    const cfg = getGateConfig(currentGateId);
    return { type: 'gate', gateId: currentGateId, ...cfg };
  }
};

// After placement ends, determine rank + MMR
const placementResult = (history, isLastGameWin, isLastGame) => {
  let currentGateId = 0;
  let placedRankId = 1; // Cuivre if 0 gates passed

  for (const h of history) {
    if (h.type === 'gate') {
      if (h.won) {
        placedRankId = PLACEMENT_GATES[h.gateId].toRankId;
        currentGateId = h.gateId + 1;
      }
      // gate loss: placedRankId = fromRankId of that gate
      else {
        placedRankId = PLACEMENT_GATES[h.gateId].fromRankId;
      }
    }
    // recovery win/loss doesn't change placedRankId directly
  }

  const allGatesPassed = history.filter(h => h.type === 'gate').length === PLACEMENT_GATES.length
    && history.filter(h => h.type === 'gate').every(h => h.won);

  // On entre toujours dans un rang par son sous-rang I (bas du palier).
  const startMMR = isLastGame ? 100 : 0;
  return { rankId: placedRankId, subRank: 1, mmr: startMMR, perfect: allGatesPassed };
};

const PLACEMENT_TOTAL = 5;

// Secret achievement for perfect placement
const ACHIEVEMENT_PERFECT_PLACEMENT = {
  id: 'perfect_placement',
  name: 'The Architect',
  desc: '5/5 en calibration — placement parfait',
  icon: '🌑',
  xp: 0,
  secret: true,
  reward: 'Skin "Obsidian Void" débloqué',
};




// ─── Design tokens — Académie Secrète des Compteurs ──────────────
const G = {
  // Fonds
  bgDeep: '#0d0a1a', bgCard: '#13102a', bgPanel: '#1a1535',
  border: '#2e2654', borderGold: '#4a3a1d',
  // Or (accent chaud principal)
  gold: '#c9a24b', goldLight: '#e8c97a', goldDark: '#8a6820',
  // Ambre (CTA secondaires)
  amber: '#d4813a', amberLight: '#f0a860',
  // Teal (accent froid)
  teal: '#2dd4bf', tealDark: '#0f766e',
  // Textes
  textPrimary: '#f0e6cc', textSecondary: '#a896c8', textMuted: '#5c4f7a',
  // Fond mid
  purpleMid: '#2d2060',
  // États
  red: '#c0392b', green: '#27ae60',
};

const css = `
  /* Polices chargées en local via public/fonts/fonts.css (référencé dans index.html) — pas d'@import internet (app hors-ligne) */
  * { box-sizing: border-box; }
  .r { background:${G.bgDeep}; min-height:100vh; font-family:'EB Garamond',serif; font-size:15px; color:${G.textPrimary}; -webkit-font-smoothing:antialiased; }
  .serif { font-family:'Cinzel',serif; }

  .hd { background:linear-gradient(180deg,#0a0816,${G.bgCard}); border-bottom:1px solid ${G.borderGold}; padding:16px 20px 12px; position:sticky; top:0; z-index:50; }
  .logo { font-family:'Cinzel',serif; font-size:15px; font-weight:700; letter-spacing:.14em;
    background:linear-gradient(135deg,${G.goldLight},${G.gold},#8a6820); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .pill { background:rgba(201,162,75,.08); border:1px solid ${G.borderGold}; border-radius:20px; padding:4px 10px; font-size:12px; font-weight:500; color:${G.gold}; }

  .crumb { display:flex; align-items:center; gap:6px; padding:9px 20px; background:${G.bgCard}; border-bottom:1px solid ${G.border}; font-family:'Cinzel',serif; font-size:10px; color:${G.textMuted}; letter-spacing:.22em; text-transform:uppercase; overflow-x:auto; white-space:nowrap; }
  .crumb .ca { color:${G.gold}; }
  .crumb .sep { opacity:.4; }

  .lobby { padding:20px 16px; max-width:480px; margin:0 auto; }
  .sec { font-family:'Cinzel',serif; font-size:10px; letter-spacing:.28em; text-transform:uppercase; color:${G.textSecondary}; margin-bottom:10px; display:flex; align-items:center; gap:8px; }
  .sec::after { content:''; flex:1; height:1px; background:${G.border}; }

  .card { background:${G.bgPanel}; border:1px solid ${G.border}; border-radius:12px; padding:16px 18px; cursor:pointer; transition:all .18s; display:flex; align-items:center; justify-content:space-between; margin-bottom:9px; position:relative; overflow:hidden; }
  .card::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:${G.goldDark}; transition:all .18s; }
  .card:hover { border-color:${G.goldDark}; background:#201a45; transform:translateX(2px); }
  .card:hover::before { background:${G.gold}; }
  .card.feat { border-color:${G.borderGold}; background:linear-gradient(135deg,#2a2148,${G.bgPanel}); }
  .card.feat::before { background:${G.gold}; }
  .card.danger::before { background:${G.red}; }
  .card.danger:hover { border-color:rgba(192,57,43,.4); }
  .card.static { cursor:default; }
  .card.static:hover { transform:none; border-color:${G.border}; }

  .ci { font-size:24px; margin-right:12px; flex-shrink:0; }
  .ct { font-family:'Cinzel',serif; font-size:14px; font-weight:600; letter-spacing:.08em; margin-bottom:2px; }
  .cs { font-size:12.5px; color:${G.textSecondary}; }
  .chev { color:${G.textSecondary}; flex-shrink:0; margin-left:10px; transition:transform .18s; }
  .card:hover .chev { transform:translateX(3px); color:${G.gold}; }

  .cfg { padding:18px 16px; max-width:480px; margin:0 auto; }
  .cfgc { background:${G.bgPanel}; border:1px solid ${G.border}; border-radius:12px; padding:18px; margin-bottom:10px; }
  .cfgt { font-family:'Cinzel',serif; font-size:11px; color:${G.gold}; letter-spacing:.26em; margin-bottom:12px; text-transform:uppercase; }

  .dgrid { display:grid; grid-template-columns:repeat(5,1fr); gap:7px; }
  .dbtn { background:rgba(255,255,255,.03); border:1px solid ${G.border}; border-radius:8px; padding:11px 4px; cursor:pointer; text-align:center; transition:all .14s; color:${G.textSecondary}; font-size:13px; }
  .dbtn:hover { border-color:${G.goldDark}; color:${G.gold}; }
  .dbtn.a { background:rgba(201,162,75,.12); border-color:${G.gold}; color:${G.gold}; }
  .dnum { font-size:19px; font-weight:700; display:block; }
  .dlbl { font-size:10px; margin-top:1px; display:block; }

  .pgrid { display:grid; grid-template-columns:repeat(5,1fr); gap:6px; }
  .pbtn { background:rgba(255,255,255,.03); border:1px solid ${G.border}; border-radius:6px; padding:9px 4px; cursor:pointer; text-align:center; transition:all .14s; color:${G.textSecondary}; font-size:12px; }
  .pbtn:hover { border-color:${G.goldDark}; color:${G.gold}; }
  .pbtn.a { background:rgba(201,162,75,.12); border-color:${G.gold}; color:${G.gold}; }

  /* Time picker */
  .tpre { display:flex; gap:7px; flex-wrap:wrap; }
  .tpb { background:rgba(255,255,255,.03); border:1px solid ${G.border}; border-radius:8px; padding:9px 10px; cursor:pointer; text-align:center; transition:all .14s; color:${G.textSecondary}; font-size:12px; font-weight:500; flex:1; min-width:52px; }
  .tpb:hover { border-color:${G.goldDark}; color:${G.gold}; }
  .tpb.a { background:rgba(201,162,75,.12); border-color:${G.gold}; color:${G.gold}; font-weight:600; }
  .tcust { display:flex; align-items:center; gap:8px; margin-top:9px; background:rgba(0,0,0,.2); border:1px solid ${G.border}; border-radius:8px; padding:7px 12px; }
  .tstep { display:flex; align-items:center; gap:10px; flex:1; }
  .tsb { background:rgba(201,162,75,.1); border:1px solid ${G.borderGold}; border-radius:6px; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:${G.gold}; font-size:17px; font-weight:600; transition:all .14s; flex-shrink:0; user-select:none; }
  .tsb:hover { background:rgba(201,162,75,.2); }
  .tsb:active { transform:scale(.94); }
  .tdsp { font-family:'Cinzel',serif; font-size:26px; font-weight:700; color:${G.goldLight}; text-align:center; flex:1; }
  .tpc { font-size:11px; color:${G.textSecondary}; margin-top:5px; text-align:center; }

  /* Launch */
  .lbtn { width:100%; padding:16px; background:linear-gradient(135deg,#8a6820,${G.gold},#8a6820); background-size:200% 100%; border:1px solid ${G.gold}; border-radius:12px; color:#0d0a1a; font-family:'Cinzel',serif; font-size:15px; font-weight:700; letter-spacing:.14em; cursor:pointer; transition:all .3s; text-transform:uppercase; margin-top:6px; }
  .lbtn:hover { background-position:right center; box-shadow:0 0 30px rgba(201,162,75,.22); transform:translateY(-1px); }
  .lbtn:active { transform:translateY(0); }
  .lbtn:disabled { opacity:.4; cursor:not-allowed; transform:none; }
  .lbtn.red { background:linear-gradient(135deg,#5a0a0a,${G.red},#5a0a0a); border-color:${G.red}; color:#fff; }

  /* MMR bar */
  .mmrtrack { height:6px; background:rgba(255,255,255,.06); border-radius:3px; overflow:hidden; margin-top:6px; }
  .mmrfill { height:100%; border-radius:3px; transition:width .5s ease; }

  /* Rank badge */
  .rbadge { display:flex; align-items:center; gap:10px; background:rgba(201,162,75,.05); border:1px solid ${G.borderGold}; border-radius:10px; padding:12px 15px; margin-bottom:14px; }

  /* Placement */
  .pdot { width:12px; height:12px; border-radius:50%; border:2px solid ${G.border}; flex-shrink:0; transition:all .3s; }
  .pdot.win { background:${G.green}; border-color:${G.green}; }
  .pdot.loss { background:${G.red}; border-color:${G.red}; }
  .pdot.pend { background:transparent; border-color:${G.goldDark}; }

  /* Game */
  .gm { min-height:100vh; display:flex; flex-direction:column; background:radial-gradient(ellipse at top,#1a1535,${G.bgDeep} 70%); }
  .ghud { display:flex; align-items:center; justify-content:space-between; padding:13px 18px; background:rgba(0,0,0,.35); border-bottom:1px solid ${G.border}; }
  .gtimer { font-family:'Cinzel',serif; font-size:26px; font-weight:700; color:${G.goldLight}; min-width:68px; text-align:center; }
  .gctr { font-size:11px; color:${G.textSecondary}; text-align:center; letter-spacing:.05em; }
  .gctr strong { color:${G.textPrimary}; font-size:14px; display:block; font-weight:600; }
  .ghbtn { background:rgba(255,255,255,.06); border:1px solid ${G.border}; border-radius:8px; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:${G.textSecondary}; transition:all .14s; }
  .ghbtn:hover { border-color:${G.goldDark}; color:${G.gold}; }
  .gstage { flex:1; display:flex; align-items:center; justify-content:center; padding:16px; position:relative; }
  .gcrev { position:absolute; bottom:18px; left:50%; transform:translateX(-50%); background:rgba(201,162,75,.12); border:1px solid ${G.borderGold}; border-radius:8px; padding:5px 14px; font-size:13px; color:${G.gold}; white-space:nowrap; }
  .gpaused { position:absolute; inset:0; background:rgba(0,0,0,.65); backdrop-filter:blur(8px); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; }

  /* Countdown */
  .cdwn { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; }
  .cdnum { font-family:'Cinzel',serif; font-size:88px; font-weight:700; line-height:1;
    background:linear-gradient(135deg,${G.goldLight},${G.gold}); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    animation:cpulse 1s ease-in-out; }
  @keyframes cpulse { from{opacity:0;transform:scale(1.4)} to{opacity:1;transform:scale(1)} }

  /* Card flash */
  @keyframes cfin { from{opacity:.75;transform:scale(.97)} to{opacity:1;transform:scale(1)} }
  .canim { animation:cfin .08s ease; }

  /* Answer */
  .ans { width:100%; background:rgba(255,255,255,.04); border:1px solid ${G.border}; border-radius:10px; padding:14px 18px; font-family:'Cinzel',serif; font-size:30px; font-weight:700; color:${G.textPrimary}; text-align:center; outline:none; transition:border-color .2s; -moz-appearance:textfield; }
  .ans::-webkit-outer-spin-button,.ans::-webkit-inner-spin-button{-webkit-appearance:none;}
  .ans:focus { border-color:${G.gold}; }

  /* Result */
  .rc { color:${G.green}; font-family:'Cinzel',serif; font-size:60px; font-weight:700; line-height:1; }
  .rw { color:${G.red}; font-family:'Cinzel',serif; font-size:60px; font-weight:700; line-height:1; }

  /* Modal */
  .moverlay { position:fixed; inset:0; background:rgba(0,0,0,.72); backdrop-filter:blur(4px); z-index:100; display:flex; align-items:flex-end; justify-content:center; }
  .mdl { background:linear-gradient(180deg,#1a1535,${G.bgDeep}); border:1px solid ${G.border}; border-top:1px solid ${G.borderGold}; border-radius:20px 20px 0 0; padding:22px 18px 34px; width:100%; max-width:480px; max-height:82vh; overflow-y:auto; }
  .mhndl { width:38px; height:4px; background:${G.border}; border-radius:2px; margin:0 auto 18px; }
  .mtitle { font-family:'Cinzel',serif; font-size:19px; font-weight:700; margin-bottom:3px; }

  /* Achievement toast */
  .acht { position:fixed; top:78px; left:50%; transform:translateX(-50%); background:linear-gradient(135deg,#2a2148,#332a52); border:1px solid ${G.gold}; border-radius:12px; padding:13px 18px; z-index:200; min-width:270px; box-shadow:0 8px 32px rgba(201,162,75,.2); }
  .acht.entering { animation:ains .3s ease forwards; }
  .acht.leaving  { animation:aout .4s ease forwards; }
  @keyframes ains { from{opacity:0;transform:translateX(-50%) translateY(-10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  @keyframes aout { from{opacity:1;transform:translateX(-50%) translateY(0)} to{opacity:0;transform:translateX(-50%) translateY(-18px)} }

  /* Abandon confirm */
  .abdlg { position:fixed; inset:0; background:rgba(0,0,0,.8); backdrop-filter:blur(6px); z-index:150; display:flex; align-items:center; justify-content:center; padding:20px; }
  .abdbox { background:linear-gradient(180deg,#251020,#0d0a1a); border:1px solid rgba(192,57,43,.4); border-radius:16px; padding:28px 24px; width:100%; max-width:340px; text-align:center; }

  .back { display:flex; align-items:center; gap:5px; background:none; border:none; color:${G.textSecondary}; font-size:13px; cursor:pointer; padding:4px 0; transition:color .14s; letter-spacing:.04em; }
  .back:hover { color:${G.gold}; }

  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:${G.border};border-radius:2px}

  /* ── Support skins ── */
  @keyframes gear-spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes steam-rise { 0%{opacity:.6;transform:translateY(0)} 100%{opacity:0;transform:translateY(-48px) scaleX(1.4)} }
  @keyframes glitch { 0%,93%,100%{transform:translate(0)} 94%{transform:translate(-3px,1px);filter:hue-rotate(90deg)} 96%{transform:translate(3px,-1px)} 98%{transform:translate(-2px,2px);filter:hue-rotate(200deg)} }
  @keyframes scanline { from{top:-100%} to{top:200%} }
  @keyframes vapor-bg { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
  @keyframes eldr-pulse { 0%,100%{box-shadow:0 0 12px #6600cc,0 0 30px rgba(102,0,200,.2)} 50%{box-shadow:0 0 22px #9900ff,0 0 55px rgba(153,0,255,.4)} }
  @keyframes rune-glow { 0%,100%{text-shadow:0 0 6px #c8a235,0 0 12px rgba(200,162,53,.4)} 50%{text-shadow:0 0 16px #ffcc44,0 0 32px rgba(255,204,68,.8)} }
  @keyframes chrome-shine { 0%{left:-120%} 50%,100%{left:120%} }
  @keyframes grid-pulse { 0%,100%{opacity:.12} 50%{opacity:.28} }
  @keyframes rain-fall { 0%{transform:translateY(0);opacity:0} 15%{opacity:.55} 80%{opacity:.55} 100%{transform:translateY(320px);opacity:0} }
  @keyframes star-twink { 0%,100%{opacity:.1;transform:scale(.7)} 50%{opacity:1;transform:scale(1.4)} }
  @keyframes bio-pulse { 0%,100%{box-shadow:0 0 8px rgba(0,255,68,.35),0 0 20px rgba(0,255,68,.08)} 50%{box-shadow:0 0 20px rgba(0,255,68,.65),0 0 45px rgba(0,255,68,.2)} }
  @keyframes amber-pulse { 0%,100%{box-shadow:0 0 8px rgba(255,170,0,.35),0 0 20px rgba(255,170,0,.08)} 50%{box-shadow:0 0 20px rgba(255,170,0,.65),0 0 45px rgba(255,170,0,.2)} }
  @keyframes sys-flicker { 0%,92%,100%{opacity:1} 93%{opacity:.4} 95%{opacity:.9} 98%{opacity:.25} }
  @keyframes drip-grow { 0%{height:0;opacity:.9} 70%{opacity:.6} 100%{height:46px;opacity:0} }
`;

// ─── Time presets — expressed in s/carte so they scale with deck count ──
// Labels live in the locale files (timePicker.presets), aligned by index.
const SPC_PRESETS = [2.40, 1.00, 0.82, 0.71, 0.62, 0.55, 0.50, 0.45, 0.40, 0.35];

// value = total seconds, totalCards = cards in this deck config
// Touche du clavier virtuel — style autonome (pas de dépendance CSS).
const KpKey = ({ children, onClick, alt = false }) => {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        padding: '15px 0', fontSize: 21, fontWeight: 700, cursor: 'pointer',
        borderRadius: 11, transition: 'all .12s',
        fontFamily: "'Cinzel', serif",
        background: alt ? (h ? 'rgba(255,255,255,.09)' : 'rgba(255,255,255,.04)') : (h ? 'rgba(201,162,75,.2)' : 'rgba(201,162,75,.08)'),
        border: `1px solid ${alt ? G.border : (h ? G.gold : G.borderGold)}`,
        color: alt ? G.textSecondary : G.goldLight,
      }}
    >
      {children}
    </button>
  );
};

const TimePicker = ({ value, onChange, totalCards, t, snd = (fn) => fn() }) => {
  const [kpOpen, setKpOpen] = useState(false);
  const [kpVal, setKpVal] = useState('');
  const currentSpc = totalCards > 0 ? value / totalCards : 0;
  const presetLabels = t('timePicker.presets');

  const activePresetIdx = SPC_PRESETS.findIndex(p => Math.abs(p - currentSpc) < 0.015);

  const applySpc = (spc) => {
    if (totalCards > 0) { snd(playClick); onChange(Math.max(5, Math.round(spc * totalCards))); }
  };

  // Clavier virtuel — saisie manuelle du temps en secondes.
  const openKp = () => { snd(playClick); setKpVal(String(value)); setKpOpen(true); };
  const kpPress = (d) => { snd(playClick); setKpVal(v => {
    const nv = (v === '0' ? '' : v) + d;
    return nv.length > 3 ? v : nv; // 3 chiffres max (clampé à 600 à la validation)
  }); };
  const kpBack = () => { snd(playClick); setKpVal(v => v.slice(0, -1)); };
  const kpClear = () => { snd(playClick); setKpVal(''); };
  const kpConfirm = () => {
    snd(playClick);
    const n = parseInt(kpVal || '0', 10);
    if (!isNaN(n) && n > 0) onChange(Math.max(5, Math.min(600, n)));
    setKpOpen(false);
  };

  return (
    <div>
      <div className="tpre" style={{ flexWrap: 'wrap' }}>
        {SPC_PRESETS.map((spc, i) => (
          <button key={spc} className={`tpb${activePresetIdx === i ? ' a' : ''}`} onClick={() => applySpc(spc)} style={{ minWidth: 60 }}>
            <div style={{ fontWeight: 700 }}>{spc.toFixed(2)}s</div>
            <div style={{ fontSize: 9, opacity: 0.75, marginTop: 1 }}>{presetLabels[i]}</div>
          </button>
        ))}
      </div>

      {/* Stepper : − à gauche, temps cliquable (→ clavier) au centre, + à droite */}
      <div className="tcust">
        <button className="tsb" onClick={() => { snd(playClick); onChange(Math.max(5, value - 1)); }}>−</button>
        <div style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }} onClick={openKp}>
          <div className="tdsp">{value}<span style={{ fontSize: 13, color: G.goldDark, marginLeft: 2 }}>s</span></div>
        </div>
        <button className="tsb" onClick={() => { snd(playClick); onChange(Math.min(600, value + 1)); }}>+</button>
      </div>
      <div style={{ fontSize: 10, color: G.textSecondary, textAlign: 'center', marginTop: 5 }}>{t('timePicker.hint')}</div>

      {totalCards > 0 && (
        <div className="tpc">{t('timePicker.spcCards', { spc: currentSpc.toFixed(2), cards: totalCards })}</div>
      )}

      {/* Clavier virtuel */}
      {kpOpen && (
        <div
          onClick={() => setKpOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.72)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'linear-gradient(180deg,#1a1535,#0d0a1a)', border: `1px solid ${G.border}`, borderTop: `1px solid ${G.borderGold}`, borderRadius: 18, padding: '20px 18px 22px', width: '100%', maxWidth: 300 }}
          >
            <div style={{ fontSize: 11, color: G.textSecondary, letterSpacing: '.12em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 12 }}>{t('timePicker.keypadTitle')}</div>
            <div style={{ background: 'rgba(0,0,0,.35)', border: `1px solid ${G.borderGold}`, borderRadius: 10, padding: '12px', textAlign: 'center', marginBottom: 14 }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: 34, fontWeight: 700, color: G.goldLight }}>{kpVal || '0'}</span>
              <span style={{ fontSize: 15, color: G.goldDark, marginLeft: 3 }}>s</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
                <KpKey key={d} onClick={() => kpPress(String(d))}>{d}</KpKey>
              ))}
              <KpKey alt onClick={kpClear}>C</KpKey>
              <KpKey onClick={() => kpPress('0')}>0</KpKey>
              <KpKey alt onClick={kpBack}>⌫</KpKey>
            </div>
            <button
              onClick={kpConfirm}
              style={{ width: '100%', marginTop: 12, padding: '13px', background: G.gold, border: 'none', borderRadius: 11, color: '#0d0a1a', fontWeight: 700, fontSize: 14, cursor: 'pointer', letterSpacing: '.03em' }}
            >
              {t('timePicker.keypadValidate')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Support skin card (premium "Me soutenir" pack) ─────────────
const SupportCard = ({ rank, suitName, skin, flash = false, mini = false }) => {
  const rankDisp = (skin.rankMap && skin.rankMap[rank]) || rank;
  const suitDisp = (skin.suitMap && skin.suitMap[suitName]) || SUITS[suitName];
  const cardStyleResolved = typeof skin.cardStyle === 'function' ? skin.cardStyle(suitName) : skin.cardStyle;

  const colorStyle = skin.rankGradient
    ? { background: skin.rankGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', color: 'transparent' }
    : { color: typeof skin.rankColor === 'function' ? skin.rankColor(suitName) : skin.rankColor };
  const extraStyle = skin.rankExtra ? skin.rankExtra(suitName) : {};
  const suitColor = typeof skin.suitColor === 'function' ? skin.suitColor(suitName) : skin.suitColor;
  const glow = skin.suitGlowColor ? skin.suitGlowColor(suitName) : null;

  if (mini) {
    return (
      <div style={{ position: 'relative', width: 40, height: 56, overflow: 'hidden',
        display: 'flex', flexDirection: 'column', padding: '3px 5px', ...cardStyleResolved }}>
        <span style={{ fontFamily: skin.rankFont, fontSize: 11, fontWeight: 700, lineHeight: 1, ...colorStyle, ...extraStyle }}>{rankDisp}</span>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 18, color: suitColor, filter: glow ? `drop-shadow(0 0 3px ${glow})` : undefined }}>{suitDisp}</span>
        </div>
      </div>
    );
  }

  const rankStyle = { fontFamily: skin.rankFont, fontSize: skin.rankSize, fontWeight: 700, lineHeight: 1, animation: skin.rankAnimation, ...colorStyle, ...extraStyle };
  const cornerRankStyle = { ...rankStyle, fontSize: Math.round(skin.rankSize * 0.5) };
  const suitStyle = { color: suitColor, lineHeight: 1, display: 'block', textAlign: 'center', filter: glow ? `drop-shadow(0 0 5px ${glow})` : undefined };
  const helperVal = skin.helperMap ? (skin.helperMap[rank] || rank) : rank;
  const helperStyleSkin = typeof skin.helperStyle === 'function' ? skin.helperStyle(suitName) : (skin.helperStyle || {});
  const helperStyle = { fontSize: 14, color: 'rgba(200,162,53,.6)', fontFamily: 'monospace', lineHeight: 1, ...helperStyleSkin };

  const Overlay = skin.Overlay;

  // Le pop de changement de carte (.canim) est porté par un wrapper externe :
  // sinon l'animation inline du skin (pulse, flicker…) l'écraserait.
  return (
    <div className={flash ? 'canim' : undefined} style={{ display: 'inline-block', flexShrink: 0 }}>
      <div style={{ position: 'relative', width: 224, height: 320, ...cardStyleResolved,
        display: 'flex', flexDirection: 'column', padding: '16px 18px' }}>
        {Overlay && <Overlay suitName={suitName} suit={suitDisp} rank={rank} />}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, zIndex: 1 }}>
          <span style={rankStyle}>{rankDisp}</span>
          {skin.helperRank && <span style={helperStyle}>{helperVal}</span>}
          <span style={{ ...suitStyle, fontSize: Math.round(skin.suitSize * 0.6) }}>{suitDisp}</span>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
          <span style={{ ...suitStyle, fontSize: Math.round(skin.suitSize * 2.0) }}>{suitDisp}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, transform: 'rotate(180deg)', zIndex: 1 }}>
          <span style={cornerRankStyle}>{rankDisp}</span>
          {skin.helperRank && <span style={helperStyle}>{helperVal}</span>}
          <span style={{ ...suitStyle, fontSize: Math.round(skin.suitSize * 0.5) }}>{suitDisp}</span>
        </div>
      </div>
    </div>
  );
};

// ─── Aperçu plein écran d'un skin support ───────────────────────
const PREVIEW_CARDS = [
  { rank: 'A',  suitName: 'spades'   },
  { rank: 'K',  suitName: 'hearts'   },
  { rank: '10', suitName: 'diamonds' },
  { rank: '7',  suitName: 'clubs'    },
  { rank: 'Q',  suitName: 'spades'   },
  { rank: '9',  suitName: 'hearts'   },
  { rank: '4',  suitName: 'diamonds' },
];

const SupportPreviewModal = ({ skin, owned, active, onClose, onBuy, onEquip, t }) => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % PREVIEW_CARDS.length), 1100);
    return () => clearInterval(t);
  }, []);
  const c = PREVIEW_CARDS[idx];
  return (
    <div className="moverlay" style={{ alignItems: 'center', zIndex: 160 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'linear-gradient(180deg,#1a1535,#0d0a1a)', border: `1px solid ${G.border}`, borderRadius: 18, padding: '22px 22px 24px', width: '100%', maxWidth: 320, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 18, fontWeight: 700, color: skin.accent }}>{skin.name}</div>
        <div style={{ fontSize: 12, color: G.textSecondary, marginBottom: 18 }}>{t('shop.tagline.' + skin.id)}</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320, marginBottom: 8 }}>
          <SupportCard key={idx} rank={c.rank} suitName={c.suitName} skin={skin} flash />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginBottom: 18 }}>
          {PREVIEW_CARDS.map((_, i) => (
            <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === idx ? skin.accent : G.border }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', background: 'rgba(255,255,255,.05)', border: `1px solid ${G.border}`, borderRadius: 9, color: G.textPrimary, cursor: 'pointer', fontSize: 13 }}>{t('common.close')}</button>
          {active
            ? <span style={{ flex: 1, padding: '11px', background: skin.accent, borderRadius: 9, color: '#0d0a1a', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t('common.equipped')}</span>
            : owned
              ? <button onClick={() => { onEquip(); onClose(); }} style={{ flex: 1, padding: '11px', background: G.green, border: 'none', borderRadius: 9, color: '#0d0a1a', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>{t('common.equip')}</button>
              : <button onClick={() => { onBuy(); onClose(); }} style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg,#8a6820,#e8c97a,#8a6820)', border: '1px solid #e8c97a', borderRadius: 9, color: '#0d0a1a', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>{t('shop.forge')}</button>}
        </div>
      </div>
    </div>
  );
};

const VoidGoldChain = () => {
  // Arc centré sur (56, 4), rayon 46 — 12 maillons tangentiels uniquement.
  const links = [
    { cx: 10, cy: 6,  rot: 87 }, { cx: 11, cy: 13, rot: 79 },
    { cx: 12, cy: 19, rot: 71 }, { cx: 15, cy: 25, rot: 63 },
    { cx: 18, cy: 30, rot: 55 }, { cx: 22, cy: 35, rot: 47 },
    { cx: 26, cy: 39, rot: 40 }, { cx: 32, cy: 43, rot: 32 },
    { cx: 37, cy: 46, rot: 24 }, { cx: 43, cy: 48, rot: 16 },
    { cx: 50, cy: 50, rot: 8  }, { cx: 56, cy: 50, rot: 0  },
  ];
  return (
    <svg width="62" height="56" viewBox="0 0 62 56" fill="none"
      style={{ filter: 'drop-shadow(0 0 2.5px #D4AF37)' }}>
      {links.map((l, i) => (
        <ellipse key={i} cx={l.cx} cy={l.cy} rx="4.5" ry="2"
          stroke="#D4AF37" strokeWidth="1.3"
          transform={`rotate(${l.rot} ${l.cx} ${l.cy})`}
        />
      ))}
    </svg>
  );
};

const VoidGoldDiag = ({ x1, y1, x2, y2 }) => {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  const n = Math.round(len / 9);
  return (
    <svg viewBox="0 0 224 320" fill="none"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
               pointerEvents: 'none', filter: 'drop-shadow(0 0 2.5px #D4AF37)' }}>
      {Array.from({ length: n }, (_, i) => {
        const t = i / (n - 1);
        const cx = x1 + dx * t;
        const cy = y1 + dy * t;
        return <ellipse key={i} cx={cx} cy={cy} rx="4.5" ry="2"
          stroke="#D4AF37" strokeWidth="1.3"
          transform={`rotate(${angle} ${cx} ${cy})`} />;
      })}
    </svg>
  );
};

// ─── Casino Card ───────────────────────────────────────────────
const CasinoCard = ({ rank, suit, suitName, skin = 'classic', flash = false }) => {
  const support = SUPPORT_IDS.has(skin) ? SUPPORT_SKINS.find(s => s.id === skin) : null;
  if (support) return <SupportCard rank={rank} suitName={suitName} skin={support} flash={flash} />;
  const isRed = suitName === 'hearts' || suitName === 'diamonds';
  const sk = CARD_SKINS.find(s => s.id === skin) || CARD_SKINS[0];
  let tc = isRed ? 'text-red-600' : 'text-gray-900';
  if (sk.id === 'neon') tc = isRed ? 'text-pink-400' : 'text-purple-300';
  if (sk.id === 'matrix') tc = 'text-green-400';
  if (sk.id === 'blood') tc = isRed ? 'text-red-400' : 'text-gray-300';
  if (sk.id === 'obsidian') tc = isRed ? 'text-red-500' : 'text-gray-200';
  if (sk.id === 'voidgold') tc = 'text-amber-400';
  if (sk.id === 'ice') tc = isRed ? 'text-red-400' : 'text-cyan-300';
  if (sk.id === 'royal') tc = isRed ? 'text-red-600' : 'text-purple-900';
  const faceCards = { 'J': 'JACK', 'Q': 'QUEEN', 'K': 'KING', 'A': 'ACE' };
  const isFace = ['J', 'Q', 'K', 'A'].includes(rank);
  const obsidianBlackGlow = sk.id === 'obsidian' && !isRed
    ? { textShadow: '0 0 8px rgba(255,255,255,0.9), 0 0 16px rgba(200,200,255,0.5)' }
    : sk.id === 'obsidian' && isRed
    ? { textShadow: '0 0 8px rgba(255,60,80,0.9), 0 0 16px rgba(255,0,50,0.5)' }
    : sk.id === 'voidgold'
    ? { textShadow: '0 0 8px rgba(255,180,0,0.9), 0 0 16px rgba(255,160,0,0.5)' }
    : sk.id === 'ice' && !isRed
    ? { textShadow: '0 0 10px rgba(80,220,255,0.95), 0 0 20px rgba(0,180,255,0.6)' }
    : {};

  const cardBoxShadow = sk.id === 'obsidian'
    ? '0 20px 60px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.08), inset 0 0 30px rgba(255,255,255,.02)'
    : sk.id === 'ice'
    ? '0 20px 60px rgba(0,80,160,.5), 0 0 0 1px rgba(100,220,255,.15), inset 0 0 40px rgba(0,150,255,.08)'
    : '0 20px 60px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.05)';

  return (
    <div className={`relative w-56 h-80 ${sk.bg} rounded-xl border-2 ${sk.border} flex flex-col p-4${flash ? ' canim' : ''}`}
      style={{ boxShadow: cardBoxShadow }}>
      <div className={`absolute top-3 left-3 flex flex-col items-center ${tc} font-bold`} style={obsidianBlackGlow}>
        <div className="text-3xl leading-none">{rank}</div>
        <div className="text-2xl leading-none">{SUITS[suitName]}</div>
      </div>
      {sk.id === 'voidgold' && <>
        <div style={{ position: 'absolute', top: 0, right: 0 }}><VoidGoldChain /></div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'rotate(180deg)', transformOrigin: 'center' }}><VoidGoldChain /></div>
        <VoidGoldDiag x1={218} y1={50} x2={6}   y2={270} />
        <VoidGoldDiag x1={172} y1={6}  x2={52}  y2={314} />
      </>}
      <div className={`absolute bottom-3 right-3 flex flex-col items-center ${tc} font-bold rotate-180`} style={obsidianBlackGlow}>
        <div className="text-3xl leading-none">{rank}</div>
        <div className="text-2xl leading-none">{SUITS[suitName]}</div>
      </div>
      <div className={`flex-1 flex flex-col items-center justify-center ${tc}`} style={obsidianBlackGlow}>
        {isFace
          ? <div className="text-center"><div className="text-6xl mb-2">{SUITS[suitName]}</div><div className="text-lg font-serif font-bold tracking-wider">{faceCards[rank]}</div></div>
          : <div className="text-7xl">{SUITS[suitName]}</div>}
      </div>
    </div>
  );
};

// ─── Main App ──────────────────────────────────────────────────
const DEFAULT_SAVE = {
  // Placement
  placementDone: false,
  placementGames: 0,        // total games played so far (0–5)
  placementWins: 0,         // gate wins
  placementHistory: [],     // array of { type:'gate'|'recovery', gateId, won }
  placementEnded: false,    // true if ended early (recovery loss)

  // Ranked
  rankId: 1,            // current rank (1–6)
  subRank: 1,           // sous-rang dans le rang (1=I, 2=II, 3=III)
  mmr: 0,               // 0–100 within current sub-rank
  inPromo: false,       // (legacy — système de promo retiré, conservé pour compat)
  promoLocked: false,   // (legacy)
  totalWins: 0,
  totalLosses: 0,
  perfectStreak: 0,
  bestStreak: 0,             // highest perfectStreak ever reached
  bestStreakAvgSpc: null,    // average s/carte across that streak's games
  bestStreakCards: 0,        // total cards seen across that streak's games
  curStreakSpcSum: 0,        // running sum of s/carte for current streak (internal)
  curStreakCardsSum: 0,      // running sum of cards for current streak (internal)

  // Economy
  coins: 0,
  unlockedSkins: ['classic'],   // inclut les skins support achetés (4,99 € / skin)
  activeSkin: 'classic',

  // Achievements & permanent challenges
  unlockedAchievements: [],   // ids: 'perfect_placement' + challenge ids
  lastPlayDate: '',

  // Stats — recentResults now stores objects, not just booleans
  // { won, decks, penetration, spc, timeSec, mode }
  // deckStats: { [decks]: { correct, total } } — précision par nombre de decks
  // modeStats: { [mode]: count } — répartition des parties par mode
  // cardsCounted: total de cartes vues à vie (toutes parties confondues)
  stats: { correct: 0, total: 0, bestTime: null, recentResults: [], skinGames: {}, deckStats: {}, modeStats: {}, cardsCounted: 0 },

  // Défi du jour — deck identique pour tous chaque jour, 1 tentative/jour.
  // lastResult: { key, won, score, error, trueCount, answer, decks }
  // history: [{ key, won, score }] (14 derniers jours)
  daily: { lastKey: '', lastResult: null, streak: 0, bestStreak: 0, bestScore: 0, totalPlayed: 0, totalWon: 0, history: [] },

  // Casino Killer
  casinoChallenge: {
    active: false,       // currently in a run
    currentStep: 0,      // 0-4 (which deck config we're on)
    countShownThisRun: false, // if count was shown during this run
  },

  lang: null,            // null = language not chosen yet (shows the picker on first launch)
  tutorialDone: false,
  trainingDone: false,   // unlocks Ranked after first training card
  rankedDone: false,     // unlocks Casino Killer after first ranked game
  soundEnabled: true,
  hapticsEnabled: true,  // vibrations sur victoire/défaite (mobile)
  musicVolume: 0.35,     // volume de la musique du lobby (0..1)

  // Config Training (persistée entre sessions)
  trainDecks: 1,
  trainPen: 75,
  trainTime: 94,
  trainShowCount: false,
};

export default function EliteCounter() {
  // ── nav: 'lobby' | 'mode-ranked' | 'mode-training' | 'mode-casino' | 'game'
  const [nav, setNav] = useState('lobby');

  // ── persistent state
  const [save, setSave] = useState(null);

  // ── game runtime
  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [runningCount, setRunningCount] = useState(0);
  const [gameState, setGameState] = useState('idle'); // idle|countdown|playing|paused|finished
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [cardFlash, setCardFlash] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [showCount, setShowCount] = useState(false);
  const countWasShownRef = useRef(false);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [mmrDelta, setMmrDelta] = useState(0);

  const [showTutorialReplay, setShowTutorialReplay] = useState(false);

  // ── Casino Killer runtime
  const [casinoActive, setCasinoActive] = useState(false);
  const [casinoStep, setCasinoStep] = useState(0);
  const [casinoCountdown, setCasinoCountdown] = useState(null); // 10s break between steps
  const [casinoFailed, setCasinoFailed] = useState(false); // show failure state
  const casinoCountShownRef = useRef(false); // tracks showCount across full casino run
  const casinoCountdownRef = useRef(null); // interval ref for 10s break
  const pendingAchievementsRef = useRef([]); // toasts to show after casino ends

  // ── game config (for training mode / casino) — persisté dans le save (eliteSave)
  const _savedTrain = useMemo(() => { try { return JSON.parse(localStorage.getItem('eliteSave')) || {}; } catch { return {}; } }, []);
  const [trainDecks, setTrainDecks] = useState(_savedTrain.trainDecks ?? 1);
  const [trainPen, setTrainPen] = useState(_savedTrain.trainPen ?? 75);
  const [trainTime, setTrainTime] = useState(_savedTrain.trainTime ?? 94); // total seconds ≈ 2.4s/carte (1 deck · 75% pén)
  const [trainShowCount, setTrainShowCount] = useState(_savedTrain.trainShowCount ?? false);

  // Keep s/carte roughly constant when deck count or penetration changes,
  // so switching decks doesn't silently make the game trivial or impossible.
  const prevTrainCardsRef = useRef(Math.floor(52 * (_savedTrain.trainDecks ?? 1) * (_savedTrain.trainPen ?? 75) / 100));
  useEffect(() => {
    const newTotalCards = Math.floor(52 * trainDecks * trainPen / 100);
    const prevTotalCards = prevTrainCardsRef.current;
    if (prevTotalCards > 0 && newTotalCards > 0 && prevTotalCards !== newTotalCards) {
      const spc = trainTime / prevTotalCards;
      setTrainTime(Math.max(5, Math.round(spc * newTotalCards)));
    }
    prevTrainCardsRef.current = newTotalCards;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainDecks, trainPen]);

  // Persiste la config Training pour qu'elle survive au redémarrage de l'app.
  useEffect(() => {
    if (save) patchSave({ trainDecks, trainPen, trainTime, trainShowCount });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainDecks, trainPen, trainTime, trainShowCount]);

  // ── game mode tracking
  const gameModeRef = useRef('ranked'); // 'ranked'|'placement'|'training'|'promo'|'casino'
  const rankUsedRef = useRef(null);     // RANKS_DEF entry used for this game
  const timeLimitUsedRef = useRef(null);
  const placementTierPlayedRef = useRef(null);
  const casinoStepConfigRef = useRef(null); // config of the current casino step (decks, pen, spc)
  const dailyRef = useRef(null); // config du défi du jour en cours (seed, decks, pen, spc)

  // ── abandon confirm dialog
  const [showAbandon, setShowAbandon] = useState(false);

  // ── modals
  const [showShop, setShowShop] = useState(false);
  const [previewSkin, setPreviewSkin] = useState(null);
  const [showChallenges, setShowChallenges] = useState(false);
  const [showAchievement, setShowAchievement] = useState(null);
  const [toastLeaving, setToastLeaving] = useState(false);
  const showAchievementToast = (ach, delay = 0) => {
    setTimeout(() => {
      setToastLeaving(false);
      setShowAchievement(ach);
      snd(playAchievement);
      setTimeout(() => {
        setToastLeaving(true);                  // trigger slide-up
        setTimeout(() => {
          setShowAchievement(null);
          setToastLeaving(false);
        }, 400);                                // matches aout duration
      }, 2600);                                 // visible for 2.6s, then 0.4s slide out = 3s total
    }, delay);
  };
  const [showSettings, setShowSettings] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [selectedHistoryIdx, setSelectedHistoryIdx] = useState(null); // for clickable recent-games bars
  const [resetText, setResetText] = useState('');
  const [showPlacementHistory, setShowPlacementHistory] = useState(false);
  const [showRankLadder, setShowRankLadder] = useState(false);

  const timerRef = useRef(null);
  const autoPlayRef = useRef(null);
  const soundEnabledRef = useRef(true);

  // ── Load save ─────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem('eliteSave');
      const parsed = raw ? { ...DEFAULT_SAVE, ...JSON.parse(raw) } : { ...DEFAULT_SAVE };
      // Migration sous-rangs : anciens saves sans subRank → I, clamp 1..3, purge promo legacy.
      if (!parsed.subRank || parsed.subRank < 1 || parsed.subRank > SUB_RANKS) parsed.subRank = 1;
      parsed.inPromo = false;
      parsed.promoLocked = false;
      setSave(parsed);
    } catch { setSave({ ...DEFAULT_SAVE }); }
  }, []);

  // ── Auto-save ─────────────────────────────────────────────────
  useEffect(() => {
    if (save) localStorage.setItem('eliteSave', JSON.stringify(save));
  }, [save]);

  // ── Sound helpers ──────────────────────────────────────────────
  useEffect(() => {
    const on = save?.soundEnabled !== false;
    soundEnabledRef.current = on;
    setMuted(!on);
    setMusicMuted(!on);
  }, [save?.soundEnabled]);
  const snd = (fn) => { if (soundEnabledRef.current) fn(); };

  // ── Retour haptique (vibration mobile) ─────────────────────────
  useEffect(() => { setHapticsEnabled(save?.hapticsEnabled !== false); }, [save?.hapticsEnabled]);

  // Tap léger sur tout élément cliquable (boutons, cartes de mode, drapeau…).
  // On écoute 'click' (et non 'pointerdown') : un scroll ne produit pas de
  // click, donc pas de vibration au défilement. On remonte le DOM et on
  // déclenche si le curseur est "pointer". Hors partie (retours win/lose dédiés).
  useEffect(() => {
    const onTap = (e) => {
      if (nav === 'game') return;
      let el = e.target;
      for (let i = 0; el && i < 6; i++, el = el.parentElement) {
        if (el.nodeType !== 1) continue;
        const tag = el.tagName;
        if (tag === 'BUTTON' || el.getAttribute('role') === 'button') { vibrateTap(); return; }
        try { if (getComputedStyle(el).cursor === 'pointer') { vibrateTap(); return; } } catch {}
      }
    };
    document.addEventListener('click', onTap, true);
    return () => document.removeEventListener('click', onTap, true);
  }, [nav]);

  // ── Musique du lobby ───────────────────────────────────────────
  // Boucle en continu sur tous les écrans de menu. En partie, elle ne s'arrête
  // pas : on la fond pendant le décompte (~3 s) puis on la relance là où elle
  // en était au retour au lobby — jamais toujours le même passage.
  useEffect(() => {
    if (nav === 'game') fadeOutLobbyMusic(3);
    else fadeInLobbyMusic(1.2);
  }, [nav]);
  useEffect(() => { setMusicVolume(save?.musicVolume ?? 0.35); }, [save?.musicVolume]);


  // patch peut être un objet, ou une fonction (prev) => patch quand le nouveau
  // patch doit lire l'état déjà modifié dans le même tick (ex. cumuler des coins).
  const patchSave = (patch) => setSave(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));

  // ── i18n ──────────────────────────────────────────────────────
  const lang = save?.lang || DEFAULT_LANG;
  const t = makeT(lang);
  const setLang = (code) => patchSave({ lang: code });

  // Reflect the active language on <html> for a11y / RTL future-proofing.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = getLanguage(lang).dir || 'ltr';
  }, [lang]);

  // ── Helpers ───────────────────────────────────────────────────
  // rng optionnel : passer un générateur seedé (mulberry32) rend le mélange
  // déterministe — utilisé par le défi du jour. Par défaut : Math.random.
  const buildDeck = (decks, pen, rng = Math.random) => {
    const cards = [];
    for (let d = 0; d < decks; d++)
      for (const s of Object.keys(SUITS))
        for (const r of RANKS)
          cards.push({ rank: r, suit: SUITS[s], suitName: s, value: CARD_VALUES[r] });
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards.slice(0, Math.floor(cards.length * pen / 100));
  };

  const currentRank = save ? RANKS_DEF[save.rankId - 1] : RANKS_DEF[0];
  // Rang AFFICHÉ (header accueil + stats) : pendant le placement, save.rankId
  // reste à Bronze jusqu'à la fin. On projette donc le rang provisoire à partir
  // de l'historique des gates déjà jouées pour qu'il évolue partie après partie.
  const placementOngoing = save && !save.placementDone && (save.placementHistory || []).length > 0;
  const displayRankId = placementOngoing
    ? placementResult(save.placementHistory || [], false, false).rankId
    : (save?.rankId || 1);
  const displayRank = RANKS_DEF[displayRankId - 1] || RANKS_DEF[0];
  const curSubRank = save?.subRank || 1;
  // Config effective du sous-rang courant (decks/pen/spc/timeLimit)
  const curRankCfg = getRankConfig(save?.rankId || 1, curSubRank);
  // "Cuivre I", "Adamantium III", … — nom de rang + chiffre romain du sous-rang
  const rankLabel = (rankId = save?.rankId || 1, subRank = curSubRank) =>
    `${RANKS_DEF[rankId - 1]?.name || ''} ${subRankRoman(subRank)}`;
  // Palier final absolu = Master III (plus de progression possible)
  const isMaxTier = (save?.rankId === 6) && (curSubRank === SUB_RANKS);

  // Placement slot display label — gate labels ("Cuivre → Argent") are
  // language-neutral; recovery slots get a localized "(recovery)" suffix.
  const slotLabel = (slot) =>
    !slot ? '' : slot.type === 'recovery'
      ? `${slot.label} (${t('placement.recoverySuffix')})`
      : slot.label;

  // ── Timer effect ───────────────────────────────────────────────
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => setElapsedTime(Date.now() - startTime), 50);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [gameState, startTime]);

  // ── Count sync + flash ─────────────────────────────────────────
  useEffect(() => {
    if (deck.length > 0 && currentIndex > 0 && currentIndex <= deck.length) {
      let c = 0;
      for (let i = 0; i < currentIndex; i++) c += deck[i].value;
      setRunningCount(c);
      setCardFlash(true);
      snd(playCardFlip);
      setTimeout(() => setCardFlash(false), 110);
    }
  }, [currentIndex, deck]);

  // ── Deck end ───────────────────────────────────────────────────
  useEffect(() => {
    if (deck.length > 0 && currentIndex === deck.length && gameState === 'playing') {
      clearInterval(timerRef.current);
      clearInterval(autoPlayRef.current);
      const ft = Date.now() - startTime;
      setFinalTime(ft);
      setTimeout(() => setGameState('finished'), 700);
    }
  }, [currentIndex, gameState, deck.length, startTime]);

  // ── Core: launch any game ──────────────────────────────────────
  const launchGame = (decks, pen, timeSec, mode, skipCountdown = false, initialCountShown = false, presetDeck = null) => {
    const newDeck = presetDeck || buildDeck(decks, pen);
    setDeck(newDeck);
    setCurrentIndex(0);
    setRunningCount(0);
    setShowResult(false);
    setUserAnswer('');
    setElapsedTime(0);
    setFinalTime(0);
    setShowAbandon(false);
    timeLimitUsedRef.current = timeSec;
    // Casino tracks countWasShown across the full run — don't reset between steps.
    // For all other modes, initialCountShown lets training pass trainShowCount here directly.
    if (mode !== 'casino') countWasShownRef.current = initialCountShown;

    const startPlaying = () => {
      snd(playChip);
      setCurrentIndex(1);
      setGameState('playing');
      setStartTime(Date.now());
      const interval = (timeSec * 1000) / newDeck.length;
      let ci = 1;
      autoPlayRef.current = setInterval(() => {
        ci++;
        if (ci <= newDeck.length) setCurrentIndex(ci);
        else clearInterval(autoPlayRef.current);
      }, interval);
    };

    if (skipCountdown) {
      setGameState('playing');
      startPlaying();
    } else {
      setGameState('countdown');
      setCountdown(3);
      snd(() => playCountdown(3));
      let cnt = 3;
      const iv = setInterval(() => {
        cnt--;
        setCountdown(cnt);
        if (cnt === 0) {
          clearInterval(iv);
          snd(playGo);
          startPlaying();
        } else {
          snd(() => playCountdown(cnt));
        }
      }, 1000);
    }
  };

  // ── Start ranked / placement ────────────────────────────────────
  const startRanked = () => {
    if (!save) return;
    const rank = RANKS_DEF[save.rankId - 1];

    if (!save.placementDone && !save.placementEnded) {
      // Determine next slot from history
      const slot = nextPlacementSlot(save.placementHistory || []);
      if (!slot || save.placementGames >= PLACEMENT_TOTAL) {
        // Shouldn't happen, but fallback to ranked
        patchSave({ placementDone: true });
        return;
      }
      gameModeRef.current = 'placement';
      rankUsedRef.current = null;
      placementTierPlayedRef.current = slot; // store full slot object
      setNav('game');
      launchGame(slot.decks, slot.penetration, slot.timeLimit, 'placement');
    } else {
      // Ranked normal — config du sous-rang courant (decks/pen/spc).
      gameModeRef.current = 'ranked';
      const cfg = getRankConfig(save.rankId, save.subRank);
      rankUsedRef.current = { ...rank, decks: cfg.decks, penetration: cfg.penetration, secPerCard: cfg.secPerCard };
      setNav('game');
      launchGame(cfg.decks, cfg.penetration, cfg.timeLimit, 'ranked');
    }
  };

  // ── Start training ─────────────────────────────────────────────
  const startTraining = () => {
    gameModeRef.current = 'training';
    rankUsedRef.current = null;
    setNav('game');
    setShowCount(trainShowCount);
    // Pass trainShowCount as initialCountShown so launchGame sets the ref correctly
    // (setting it before launchGame would just get overwritten)
    launchGame(trainDecks, trainPen, trainTime, 'training', false, trainShowCount);
  };

  // ── Défi du jour ────────────────────────────────────────────────
  const startDaily = () => {
    if (!save || save.daily?.lastKey === dayKey()) return; // déjà joué aujourd'hui
    const seed = daySeed();
    const cfg = getDailyConfig(seed, save.rankId, save.subRank);
    // Deck seedé indépendamment de la config (graine dérivée) → déterministe.
    const deck = buildDeck(cfg.decks, cfg.penetration, mulberry32(seed ^ 0x9e3779b9));
    dailyRef.current = cfg;
    gameModeRef.current = 'daily';
    rankUsedRef.current = null;
    setShowCount(false); // compteur toujours caché sur le défi
    setNav('game');
    launchGame(cfg.decks, cfg.penetration, cfg.timeLimit, 'daily', false, false, deck);
  };

  const finishDaily = (trueCount, answer) => {
    const key = dayKey();
    const error = answer - trueCount;
    const score = dailyScore(error);
    const won = score >= 0; // score négatif (écart ≥ 2) = défi manqué → streak perdue
    const d = save.daily || DEFAULT_SAVE.daily;
    const newStreak = won ? (d.streak || 0) + 1 : 0;
    const coinBonus = won ? 30 + Math.min(newStreak, 10) * 10 : 0; // habitude récompensée, plafonnée
    const result = { key, won, score, error, trueCount, answer, decks: dailyRef.current?.decks, special: !!dailyRef.current?.special };
    // patch fonctionnel : cumule les coins par-dessus le patch principal de checkAnswer.
    patchSave(prev => ({
      coins: (prev.coins || 0) + coinBonus,
      daily: {
        ...d,
        lastKey: key,
        lastResult: result,
        streak: newStreak,
        bestStreak: Math.max(d.bestStreak || 0, newStreak),
        bestScore: Math.max(d.bestScore || 0, score),
        totalPlayed: (d.totalPlayed || 0) + 1,
        totalWon: (d.totalWon || 0) + (won ? 1 : 0),
        history: [...(d.history || []).slice(-13), { key, won, score }],
      },
    }));
    if (coinBonus > 0) setEarnedCoins(c => c + coinBonus);
  };

  // ── Casino Killer ───────────────────────────────────────────
  const startCasinoChallenge = () => {
    casinoCountShownRef.current = false;
    setCasinoActive(true);
    setCasinoStep(0);
    setCasinoFailed(false);
    setCasinoCountdown(null);
    gameModeRef.current = 'casino';
    rankUsedRef.current = null;
    const cfg = getCasinoStepConfig(0);
    casinoStepConfigRef.current = cfg;
    setNav('game');
    launchGame(cfg.decks, cfg.penetration, cfg.timeLimit, 'casino');
  };

  const advanceCasinoStep = (won) => {
    // Track if count was shown during this game
    if (countWasShownRef.current) casinoCountShownRef.current = true;

    if (!won) {
      // Failed — reset
      setCasinoFailed(true);
      setCasinoActive(false);
      setCasinoStep(0);
      return;
    }

    const nextStep = casinoStep + 1;
    if (nextStep >= CASINO_STEPS.length) {
      // Completed all steps!
      setCasinoActive(false);
      setCasinoStep(0);
      const complete = !casinoCountShownRef.current;
      // Check casino_complete achievement
      const ctx = { casinoChallengeComplete: true, countWasShown: casinoCountShownRef.current };
      const alreadyHas = (save?.unlockedAchievements || []).includes('casino_complete');
      const casinoChallenge = CHALLENGES.find(c => c.id === 'casino_complete');
      if (!alreadyHas && casinoChallenge && casinoChallenge.check(ctx) && save) {
        patchSave({
          unlockedAchievements: [...(save.unlockedAchievements || []), 'casino_complete'],
          coins: (save.coins || 0) + casinoChallenge.coins,
        });
        pendingAchievementsRef.current.push(casinoChallenge);
      }
      return;
    }

    // 10s break then auto-launch next step
    setCasinoStep(nextStep);
    setCasinoCountdown(10);
    let count = 10;
    casinoCountdownRef.current = setInterval(() => {
      count--;
      setCasinoCountdown(count);
      if (count <= 0) {
        clearInterval(casinoCountdownRef.current);
        setCasinoCountdown(null);
        const cfg = getCasinoStepConfig(nextStep);
        casinoStepConfigRef.current = cfg;
        gameModeRef.current = 'casino';
        launchGame(cfg.decks, cfg.penetration, cfg.timeLimit, 'casino', true); // skip 3s countdown
      }
    }, 1000);
  };

  // ── Toggle pause (training only) ──────────────────────────────
  const togglePause = () => {
    if (gameModeRef.current !== 'training') return; // pause disabled in ranked/placement/promo
    if (gameState === 'playing') {
      setGameState('paused');
      clearInterval(autoPlayRef.current);
    } else if (gameState === 'paused') {
      setGameState('playing');
      setStartTime(Date.now() - elapsedTime);
      const tl = timeLimitUsedRef.current;
      const interval = (tl * 1000) / deck.length;
      let ci = currentIndex;
      autoPlayRef.current = setInterval(() => {
        ci++;
        if (ci <= deck.length) setCurrentIndex(ci);
        else clearInterval(autoPlayRef.current);
      }, interval);
    }
  };

  // ── Abandon (ranked = penalty) ──────────────────────────────────
  const doAbandon = () => {
    clearInterval(timerRef.current);
    clearInterval(autoPlayRef.current);
    const isRanked = ['ranked', 'placement', 'promo'].includes(gameModeRef.current);
    if (isRanked && save) {
      applyMMRChange(false, true);
    }
    setShowAbandon(false);
    setGameState('idle');
    setNav('lobby');
  };

  // ── Apply MMR result ────────────────────────────────────────────
  const applyMMRChange = (won, abandon = false) => {
    if (!save) return;
    const mode = gameModeRef.current;
    const rank = RANKS_DEF[save.rankId - 1];

    if (mode === 'training') return;

    if (mode === 'placement') {
      const slot = placementTierPlayedRef.current; // { type, gateId, ... }
      if (!slot) return null;

      const newHistory = [...(save.placementHistory || []), { type: slot.type, gateId: slot.gateId, won }];
      const newGames = save.placementGames + 1;
      const newWins = save.placementWins + (slot.type === 'gate' && won ? 1 : 0);
      const isLastGame = newGames >= PLACEMENT_TOTAL;

      // Determine if placement ends this game
      const recoveryLoss = slot.type === 'recovery' && !won;
      const allGatesDone = slot.type === 'gate' && won && slot.gateId === PLACEMENT_GATES.length - 1;
      const placementEndsNow = isLastGame || recoveryLoss || allGatesDone;

      if (placementEndsNow) {
        // Compute final rank from full history
        const res = placementResult(newHistory, won, isLastGame || allGatesDone);
        const isPerfect = newWins === PLACEMENT_GATES.length && newHistory.filter(h=>h.type==='gate').every(h=>h.won);
        const newUnlockedAchs = isPerfect && !(save.unlockedAchievements||[]).includes('perfect_placement')
          ? [...(save.unlockedAchievements||[]), 'perfect_placement']
          : (save.unlockedAchievements||[]);
        const newUnlockedSkins = isPerfect && !save.unlockedSkins.includes('obsidian')
          ? [...save.unlockedSkins, 'obsidian'] : save.unlockedSkins;

        patchSave({
          placementDone: true,
          placementEnded: recoveryLoss,
          placementGames: newGames,
          placementWins: newWins,
          placementHistory: newHistory,
          rankId: res.rankId,
          subRank: res.subRank,
          mmr: res.mmr,
          inPromo: false,
          promoLocked: false,
          unlockedAchievements: newUnlockedAchs,
          unlockedSkins: newUnlockedSkins,
        });
        if (isPerfect) showAchievementToast(ACHIEVEMENT_PERFECT_PLACEMENT, 800);
        setMmrDelta(0);
        return null;
      } else {
        patchSave({
          placementGames: newGames,
          placementWins: newWins,
          placementHistory: newHistory,
        });
        setMmrDelta(0);
        return null; // playAgain reads history from save to pick next slot
      }
    }

    // ── Ranked normal (échelle 18 sous-rangs) ──────────────────────
    // Promotion  : 100 MMR atteint après une victoire → palier+1, on arrive à 10 MMR.
    // Défaite >0 : MMR descend (plancher 0), pas de relégation.
    // Défaite à 0: relégation palier−1 → on arrive à 100 MMR (puis ça redescend normalement).
    // Abandon    : pénalité sèche −25 MMR, ne relègue jamais.
    const tier = tierIndex(save.rankId, save.subRank);

    if (won && !abandon) {
      const newMmr = save.mmr + rank.mmrPerWin;
      if (newMmr >= 100 && tier < MAX_TIER) {
        const np = tierToRank(tier + 1);
        patchSave({ rankId: np.rankId, subRank: np.subRank, mmr: 10 });
        setMmrDelta(999); // flag promotion (affichage)
        snd(playRankUp);
      } else {
        // Palier final (Master III) → plafonné à 100, sinon MMR normal.
        patchSave({ mmr: Math.min(100, newMmr) });
        setMmrDelta(rank.mmrPerWin);
      }
    } else if (abandon) {
      patchSave({ mmr: Math.max(0, save.mmr - 25) });
      setMmrDelta(-25);
    } else if (save.mmr === 0) {
      // Défaite à 0 → relégation (sauf si déjà Cuivre I, plancher absolu).
      if (tier <= 0) {
        patchSave({ mmr: 0 });
        setMmrDelta(0);
      } else {
        const np = tierToRank(tier - 1);
        patchSave({ rankId: np.rankId, subRank: np.subRank, mmr: 100 });
        setMmrDelta(-998); // flag relégation (affichage)
      }
    } else {
      // Défaite avec MMR > 0 → on descend, plancher 0, pas de relégation.
      patchSave({ mmr: Math.max(0, save.mmr + rank.mmrPerLoss) });
      setMmrDelta(rank.mmrPerLoss);
    }
    return null;
  };

  // ── Check answer ────────────────────────────────────────────────
  const checkAnswer = () => {
    if (!save) return;
    const answer = parseInt(userAnswer);
    const timeInSec = finalTime / 1000;
    const tl = timeLimitUsedRef.current;

    const correct = answer === runningCount;

    setIsCorrect(correct);
    setShowResult(true);

    const today = new Date().toDateString();
    const isCasinoMode = gameModeRef.current === 'casino';
    const isDailyMode = gameModeRef.current === 'daily';
    const decksUsed = isCasinoMode ? (casinoStepConfigRef.current?.decks ?? 1)
      : isDailyMode ? (dailyRef.current?.decks ?? 1)
      : rankUsedRef.current ? rankUsedRef.current.decks : trainDecks;
    const penUsed = isCasinoMode ? (casinoStepConfigRef.current?.penetration ?? 90)
      : isDailyMode ? (dailyRef.current?.penetration ?? 75)
      : rankUsedRef.current ? rankUsedRef.current.penetration : trainPen;
    const cardsUsed = deck.length;
    const spcUsed = cardsUsed > 0 ? timeInSec / cardsUsed : 0;

    let newCoins = 0;
    if (correct) {
      newCoins = 10 + decksUsed * 2;
      if (timeInSec < tl * 0.8) newCoins += 15;
      if (save.perfectStreak >= 3) newCoins += 20;
      setEarnedCoins(newCoins);
    } else {
      setEarnedCoins(0);
    }

    // ── Streak + bestStreak (with avg s/carte across the streak) ──
    const newStreak = correct ? save.perfectStreak + 1 : 0;
    const newCurSpcSum = correct ? (save.curStreakSpcSum || 0) + spcUsed : 0;
    const newCurCardsSum = correct ? (save.curStreakCardsSum || 0) + cardsUsed : 0;
    const beatsBest = correct && newStreak > (save.bestStreak || 0);

    // ── Answer sound : jingles victoire / défaite (.ogg) ─────────
    if (correct) snd(playVictory);
    else snd(playDefeat);
    // ── Retour haptique (gated indépendamment du son) ────────────
    if (correct) vibrateWin(); else vibrateLose();
    const newBestStreak = beatsBest ? newStreak : (save.bestStreak || 0);
    const newBestStreakAvgSpc = beatsBest ? (newCurSpcSum / newStreak) : save.bestStreakAvgSpc;
    const newBestStreakCards = beatsBest ? newCurCardsSum : save.bestStreakCards;

    // ── Recent results — store full context for clickable history ──
    const resultEntry = {
      won: correct,
      decks: decksUsed,
      penetration: penUsed,
      spc: parseFloat(spcUsed.toFixed(3)),
      timeSec: parseFloat(timeInSec.toFixed(1)),
      cards: cardsUsed,
      mode: gameModeRef.current,
    };

    const skinUsed = save.activeSkin || 'classic';
    // Agrégats à vie : précision par nb de decks, répartition par mode, cartes vues.
    const prevDeckStats = save.stats.deckStats || {};
    const dk = String(decksUsed);
    const prevDeckEntry = prevDeckStats[dk] || { correct: 0, total: 0 };
    const prevModeStats = save.stats.modeStats || {};
    const mk = gameModeRef.current;
    const newStats = {
      ...save.stats,
      total: save.stats.total + 1,
      correct: save.stats.correct + (correct ? 1 : 0),
      bestTime: correct && (!save.stats.bestTime || timeInSec < save.stats.bestTime) ? timeInSec : save.stats.bestTime,
      recentResults: [...(save.stats.recentResults || []).slice(-19), resultEntry],
      skinGames: { ...(save.stats.skinGames || {}), [skinUsed]: ((save.stats.skinGames || {})[skinUsed] || 0) + 1 },
      deckStats: { ...prevDeckStats, [dk]: { correct: prevDeckEntry.correct + (correct ? 1 : 0), total: prevDeckEntry.total + 1 } },
      modeStats: { ...prevModeStats, [mk]: (prevModeStats[mk] || 0) + 1 },
      cardsCounted: (save.stats.cardsCounted || 0) + cardsUsed,
    };

    // ── Challenge detection ──
    const isFirstAttemptOnSlot = gameModeRef.current === 'placement' && placementTierPlayedRef.current
      ? !(save.placementHistory || []).some(h => h.gateId === placementTierPlayedRef.current.gateId && h.type === placementTierPlayedRef.current.type)
      : false;

    const ctx = {
      won: correct,
      decks: decksUsed,
      penetration: penUsed,
      spc: spcUsed,
      finalTimeSec: timeInSec,
      mode: gameModeRef.current,
      slotType: placementTierPlayedRef.current?.type,
      gateId: placementTierPlayedRef.current?.gateId,
      firstAttemptOnThisSlot: isFirstAttemptOnSlot,
      countWasShown: countWasShownRef.current,
      streak: newStreak,
      streakAvgSpc: newStreak > 0 ? newCurSpcSum / newStreak : 999,
    };

    const newlyUnlocked = [];
    for (const ch of CHALLENGES) {
      if (!(save.unlockedAchievements || []).includes(ch.id) && ch.check(ctx)) {
        newlyUnlocked.push(ch.id);
      }
    }
    const newUnlockedAchievements = newlyUnlocked.length > 0
      ? [...(save.unlockedAchievements || []), ...newlyUnlocked]
      : (save.unlockedAchievements || []);

    const challengeCoins = newlyUnlocked.reduce((sum, id) => {
      const ch = CHALLENGES.find(c => c.id === id);
      return sum + (ch?.coins || 0);
    }, 0);

    patchSave({
      coins: save.coins + newCoins + challengeCoins,
      perfectStreak: newStreak,
      curStreakSpcSum: newCurSpcSum,
      curStreakCardsSum: newCurCardsSum,
      bestStreak: newBestStreak,
      bestStreakAvgSpc: newBestStreakAvgSpc,
      bestStreakCards: newBestStreakCards,
      totalWins: save.totalWins + (correct ? 1 : 0),
      totalLosses: save.totalLosses + (correct ? 0 : 1),
      lastPlayDate: today,
      stats: newStats,
      unlockedAchievements: newUnlockedAchievements,
      ...(gameModeRef.current === 'training' && !save.trainingDone ? { trainingDone: true } : {}),
      ...(['ranked', 'placement', 'promo'].includes(gameModeRef.current) && !save.rankedDone ? { rankedDone: true } : {}),
    });

    if (newlyUnlocked.length > 0) {
      if (gameModeRef.current === 'casino') {
        // Queue for display after casino run ends
        newlyUnlocked.forEach(id => {
          const ch = CHALLENGES.find(c => c.id === id);
          if (ch) pendingAchievementsRef.current.push(ch);
        });
      } else {
        const firstChallenge = CHALLENGES.find(c => c.id === newlyUnlocked[0]);
        showAchievementToast({ ...firstChallenge, name: t('challenges.' + firstChallenge.id + '.name'), xp: 0, reward: t('achievementsModal.challengeDone') }, 900);
      }
    }

    if (gameModeRef.current === 'casino') {
      advanceCasinoStep(correct);
    } else if (gameModeRef.current === 'daily') {
      finishDaily(runningCount, answer);
    } else {
      applyMMRChange(correct);
    }
  };

  // ── Pavé de réponse (écran de jeu) — gère les counts négatifs ──
  const ansPress = (d) => {
    snd(playClick);
    setUserAnswer(v => {
      const neg = v.startsWith('-');
      const digits = neg ? v.slice(1) : v;
      if (digits.replace(/^0+/, '').length >= 3) return v; // 3 chiffres significatifs max
      const nd = (digits === '0' ? '' : digits) + d;
      return (neg ? '-' : '') + nd;
    });
  };
  const ansToggleSign = () => { snd(playClick); setUserAnswer(v => v.startsWith('-') ? v.slice(1) : '-' + v); };
  const ansBack = () => { snd(playClick); setUserAnswer(v => v.slice(0, -1)); };

  // Clavier physique pour le pavé de réponse (confort desktop / dev).
  useEffect(() => {
    if (nav !== 'game' || gameState !== 'finished' || showResult) return;
    const onKey = (e) => {
      if (e.key >= '0' && e.key <= '9') ansPress(e.key);
      else if (e.key === '-') ansToggleSign();
      else if (e.key === 'Backspace') ansBack();
      else if (e.key === 'Enter' && userAnswer !== '' && userAnswer !== '-') checkAnswer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav, gameState, showResult, userAnswer]);

  // ── Play again ─────────────────────────────────────────────────
  const playAgain = () => {
    setShowResult(false);
    setIsCorrect(null);
    setUserAnswer('');
    if (gameModeRef.current === 'training') {
      startTraining();
    } else {
      startRanked();
    }
  };

  const flushPendingAchievements = () => {
    const queue = [...pendingAchievementsRef.current];
    pendingAchievementsRef.current = [];
    queue.forEach((ch, i) => {
      showAchievementToast({ ...ch, name: t('challenges.' + ch.id + '.name'), xp: 0, reward: t('achievementsModal.challengeDone') }, i * 3500);
    });
  };

  const goBack = () => {
    clearInterval(timerRef.current);
    clearInterval(autoPlayRef.current);
    clearInterval(casinoCountdownRef.current);
    setCasinoCountdown(null);
    setCasinoActive(false);
    setGameState('idle');
    setNav('lobby');
    flushPendingAchievements();
  };

  // ── Ranked X button → confirm abandon ──────────────────────────
  const handleXButton = () => {
    const isRanked = ['ranked', 'placement', 'promo'].includes(gameModeRef.current);
    if (isRanked && gameState === 'playing') {
      clearInterval(timerRef.current);
      clearInterval(autoPlayRef.current);
      setGameState('paused');
      setShowAbandon(true);
    } else {
      goBack();
    }
  };

  if (!save) return <div className="r"><style>{css}</style><div style={{ padding: 40, textAlign: 'center', color: G.textSecondary }}>{t('common.loading')}</div></div>;

  // ── First launch: pick a language BEFORE the tutorial ──────────
  if (!save.lang) {
    return <LanguageSelectScreen current={save.lang} onPick={setLang} />;
  }

  if (!save.tutorialDone) {
    return <TutorialOverlay
      t={t}
      onComplete={() => { patchSave({ tutorialDone: true }); setNav('mode-training'); }}
      onSkip={() => patchSave({ tutorialDone: true, trainingDone: true, rankedDone: true })}
    />;
  }

  if (showTutorialReplay) {
    return <TutorialOverlay
      t={t}
      onComplete={() => setShowTutorialReplay(false)}
      onSkip={() => setShowTutorialReplay(false)}
    />;
  }

  // ── Crumbs ─────────────────────────────────────────────────────
  const crumbMap = {
    lobby: [t('crumbs.home')],
    'mode-ranked': [t('crumbs.home'), t('crumbs.ranked')],
    'mode-training': [t('crumbs.home'), t('crumbs.training')],
    'mode-casino': [t('crumbs.home'), t('crumbs.casino')],
    game: [t('crumbs.home'), gameModeRef.current === 'training' ? t('crumbs.training') : gameModeRef.current === 'casino' ? t('crumbs.casino') : gameModeRef.current === 'daily' ? t('modeName.daily') : t('crumbs.ranked'), t('crumbs.game')],
  };
  const crumbs = crumbMap[nav] || [t('crumbs.home')];

  const renderHeader = (minimal = false, showTutoBtn = false) => (
    <div className="hd">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <AppLogo size={30} />
          <div className="logo">BLACKJACK ACADEMY I</div>
        </div>
        {!minimal && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div className="pill" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => { snd(playClick); setShowRankLadder(true); }}><RankSigil color={displayRank.color} size={13} /> {displayRank.name}</div>
            <div className="pill" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Coin size={13} /> {save.coins}</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCrumbs = () => {
    return (
      <div className="crumb">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep">›</span>}
            <span className={i === crumbs.length - 1 ? 'ca' : ''}>{c}</span>
          </React.Fragment>
        ))}
        {nav === 'lobby' && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button onClick={() => { snd(playClick); setShowTutorialReplay(true); }} title={t('header.tuto')}
              style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,.06)', border: `1px solid ${G.border}`, borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: G.textSecondary, fontSize: 11, fontWeight: 600, letterSpacing: '.04em' }}>
              {t('header.tuto')}
            </button>
            <button onClick={() => { snd(playClick); setShowLangModal(true); }} title={t('header.language')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.06)', border: `1px solid ${G.border}`, borderRadius: 6, padding: '4px 9px', cursor: 'pointer', color: G.textSecondary }}>
              <Globe size={12} />
              <Flag code={lang} size={18} />
            </button>
          </div>
        )}
      </div>
    );
  };

  // ── MMR bar color ──────────────────────────────────────────────
  const mmrColor = save.mmr >= 80 ? G.gold : save.mmr >= 50 ? G.green : '#2dd4bf';

  // ──────────────────────────────────────────────────────────────
  // LOBBY
  // ──────────────────────────────────────────────────────────────
  if (nav === 'lobby') {
    const rank = currentRank;
    const isMaster = isMaxTier; // bar MMR masquée seulement au palier final absolu (Master III)

    return (
      <div className="r">
        <style>{css}</style>
        {renderHeader(false, true)}
        {renderCrumbs()}

        <div className="lobby">
          {/* Rank badge + MMR */}
          {save.placementDone ? (
            <div className="rbadge" style={{ cursor: 'pointer' }} onClick={() => { snd(playClick); setShowRankLadder(true); }}>
              <RankSigil color={rank.color} size={34} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: G.textSecondary, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 2 }}>
                  {t('lobby.currentRank')}
                </div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 17, fontWeight: 700 }}>{rankLabel()}</div>
                {rankTranscription(rank.name, lang) && (
                  <div style={{ fontFamily: 'EB Garamond, serif', fontStyle: 'italic', fontSize: 12, color: G.textSecondary, marginTop: -1, marginBottom: 1 }}>{rankTranscription(rank.name, lang)}</div>
                )}
                {!isMaster && (
                  <>
                    <div className="mmrtrack">
                      <div className="mmrfill" style={{ width: `${save.mmr}%`, background: `linear-gradient(90deg,${G.goldDark},${mmrColor})` }} />
                    </div>
                    <div style={{ fontSize: 11, color: G.textSecondary, marginTop: 3 }}>
                      {t('lobby.mmr', { mmr: save.mmr })}
                    </div>
                  </>
                )}
                {isMaster && <div style={{ fontSize: 11, color: G.gold, marginTop: 2 }}>{t('lobby.maxRank')}</div>}
              </div>
              <ChevronRight className="chev" size={17} />
            </div>
          ) : (() => {
            const history = save.placementHistory || [];
            const nextSlot = nextPlacementSlot(history);
            const gamesLeft = PLACEMENT_TOTAL - save.placementGames;
            return (
              <div className="rbadge" style={{ borderColor: 'rgba(45,212,191,.3)', background: 'rgba(45,212,191,.05)', cursor: 'pointer' }}
                onClick={() => { snd(playClick); setShowPlacementHistory(true); }}>
                <KeyRound size={26} color="#2dd4bf" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#2dd4bf', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 2 }}>{t('lobby.placementTitle')}</div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 15, fontWeight: 700 }}>
                    {nextSlot ? slotLabel(nextSlot) : t('lobby.placementDoneLabel')}
                  </div>
                  <div style={{ fontSize: 11, color: G.textSecondary, marginTop: 2 }}>
                    {t('lobby.placementProgress', { played: save.placementGames, total: PLACEMENT_TOTAL, left: gamesLeft })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  {Array.from({ length: PLACEMENT_TOTAL }).map((_, i) => {
                    const h = history[i];
                    const color = !h ? 'rgba(255,255,255,.06)' : h.won ? G.green : G.red;
                    const isCur = i === save.placementGames;
                    return (
                      <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: color, border: isCur ? `2px solid #2dd4bf` : 'none', flexShrink: 0 }} />
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div className="sec">{t('lobby.gameModes')}</div>

          {/* Défi du jour — difficulté calée sur le rang, 1 tentative/jour */}
          {(() => {
            const dDone = save.daily?.lastKey === dayKey();
            const dStreak = save.daily?.streak || 0;
            const dRes = save.daily?.lastResult;
            const dCfg = getDailyConfig(daySeed(), save.rankId, save.subRank);
            const isSpecial = !dDone && dCfg.special;
            return (
              <div className="card" onClick={() => { snd(playClick); if (dDone) setShowStats(true); else startDaily(); }}
                style={dDone
                  ? { borderColor: G.border, background: 'rgba(255,255,255,.02)' }
                  : isSpecial
                    ? { borderColor: G.gold, background: 'rgba(201,162,75,.12)', boxShadow: '0 0 22px rgba(201,162,75,.28)' }
                    : { borderColor: G.borderGold, background: 'rgba(201,162,75,.07)', boxShadow: '0 0 18px rgba(201,162,75,.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div className="ci" style={{ display: 'flex' }}>{isSpecial ? <Sparkles size={22} color={G.goldLight} /> : <CalendarDays size={22} color={dDone ? G.textMuted : G.gold} />}</div>
                  <div>
                    <div className="ct" style={{ color: dDone ? G.textPrimary : G.goldLight }}>
                      {isSpecial ? t('lobby.dailySpecialTitle') : t('lobby.dailyTitle')}
                    </div>
                    <div className="cs">
                      {dDone
                        ? (dRes?.won ? t('lobby.dailyDoneWin', { score: dRes.score }) : t('lobby.dailyDoneLoss')) + ' · ' + t('lobby.dailyComeBack')
                        : t('lobby.dailyReadySub', { decks: dCfg.decks, secs: dCfg.timeLimit })}
                    </div>
                  </div>
                </div>
                {dStreak > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 6, fontSize: 13, fontWeight: 700, color: G.gold }}>
                    <Flame size={13} /> {dStreak}
                  </div>
                )}
                {!dDone && <ChevronRight className="chev" size={17} />}
              </div>
            );
          })()}

          <div className="card feat" onClick={() => { snd(playClick); setNav('mode-training'); }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div className="ci" style={{ display: 'flex' }}><BookOpen size={22} color={G.gold} /></div>
              <div>
                <div className="ct">{t('modeName.training')}</div>
                <div className="cs">{t('lobby.trainingSub')}</div>
              </div>
            </div>
            <ChevronRight className="chev" size={17} />
          </div>

          <div className="card" onClick={save.trainingDone ? () => { snd(playClick); setNav('mode-ranked'); } : undefined}
            style={!save.trainingDone ? { opacity: 0.45, cursor: 'not-allowed' } : {}}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div className="ci" style={{ display: 'flex' }}><DoorOpen size={22} color={save.trainingDone ? G.gold : G.textMuted} /></div>
              <div>
                <div className="ct">{save.placementDone ? t('modeName.ranked') : t('lobby.rankedPlacement')}</div>
                <div className="cs">
                  {!save.trainingDone
                    ? t('lobby.rankedLocked')
                    : !save.placementDone
                      ? t('lobby.rankedPlacementSub', { left: PLACEMENT_TOTAL - save.placementGames })
                      : t('lobby.rankedSub', { rank: rankLabel(), desc: t('ranks.descShort', { decks: curRankCfg.decks, spc: curRankCfg.secPerCard }) + (isMaxTier ? ' — ' + t('ranks.finalRank') : '') })}
                </div>
              </div>
            </div>
            {save.trainingDone && <ChevronRight className="chev" size={17} />}
          </div>

          <div className="card danger" onClick={save.rankedDone ? () => { snd(playClick); setNav('mode-casino'); } : undefined}
            style={!save.rankedDone ? { opacity: 0.45, cursor: 'not-allowed' } : {}}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div className="ci" style={{ display: 'flex' }}><Flame size={22} color={save.rankedDone ? G.amber : G.textMuted} /></div>
              <div>
                <div className="ct">{t('modeName.casino')}</div>
                <div className="cs">{save.rankedDone ? t('lobby.casinoSub') : t('lobby.casinoLocked')}</div>
              </div>
            </div>
            {save.rankedDone && <ChevronRight className="chev" size={17} />}
          </div>

          <div className="sec" style={{ marginTop: 6 }}>{t('lobby.account')}</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            {[
              { icon: <Award size={17} color={G.gold} />, label: t('lobby.achievements'), sub: t('lobby.achievementsSub', { unlocked: (save.unlockedAchievements||[]).length, total: CHALLENGES.length + 1 }), action: () => setShowChallenges(true) },
              { icon: <Gem size={17} color={G.gold} />, label: t('lobby.skins'), sub: t('lobby.skinsSub', { owned: save.unlockedSkins.length, total: CARD_SKINS.length + SUPPORT_SKINS.length }), action: () => setShowShop(true) },
              { icon: <BarChart3 size={17} color={G.gold} />, label: t('lobby.stats'), sub: save.stats.total > 0 ? t('lobby.statsSub', { total: save.stats.total }) : t('lobby.statsNone'), action: () => setShowStats(true) },
              { icon: <ScrollText size={17} color={G.gold} />, label: t('lobby.settings'), sub: t('lobby.settingsSub'), action: () => setShowSettings(true) },
            ].map(item => (
              <div key={item.label} className="card" style={{ marginBottom: 0, padding: '13px 14px' }} onClick={() => { snd(playClick); item.action(); }}>
                <div>
                  <div style={{ marginBottom: 5, display: 'flex' }}>{item.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: G.textSecondary }}>{item.sub}</div>
                </div>
                <ChevronRight className="chev" size={14} />
              </div>
            ))}
          </div>

          {save.perfectStreak > 0 && (
            <div style={{ background: 'rgba(201,162,75,.06)', border: `1px solid ${G.borderGold}`, borderRadius: 8, padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={16} color={G.amber} />
              <span style={{ fontSize: 13, color: G.gold, fontWeight: 600 }}>{t('lobby.currentStreak', { streak: save.perfectStreak })}</span>
            </div>
          )}
        </div>

        {/* MODALS */}
        {showChallenges && (
          <div className="moverlay" onClick={() => setShowChallenges(false)}>
            <div className="mdl" onClick={e => e.stopPropagation()}>
              <div className="mhndl" />
              <div className="mtitle">{t('achievementsModal.title')}</div>
              <div style={{ color: G.textSecondary, fontSize: 12, marginBottom: 14 }}>
                {t('achievementsModal.sub', { unlocked: (save.unlockedAchievements || []).length, total: CHALLENGES.length + 1 })}
              </div>
              {CHALLENGES.map(ch => {
                const done = (save.unlockedAchievements || []).includes(ch.id);
                return (
                  <div key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: `1px solid ${G.border}`, opacity: done ? 1 : 0.55 }}>
                    <div style={{ fontSize: 22 }}>{ch.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 1, color: done ? G.gold : G.textPrimary }}>{t('challenges.' + ch.id + '.name')}</div>
                      <div style={{ fontSize: 11, color: G.textSecondary }}>{t('challenges.' + ch.id + '.desc')}</div>
                    </div>
                    {done && <span style={{ color: G.green, fontSize: 16 }}>✓</span>}
                  </div>
                );
              })}
              {/* Secret achievement */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', opacity: (save.unlockedAchievements || []).includes('perfect_placement') ? 1 : 0.4 }}>
                <div style={{ fontSize: 22, display: 'flex', alignItems: 'center' }}>{(save.unlockedAchievements || []).includes('perfect_placement') ? '🌑' : <Lock size={18} color={G.textMuted} />}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 1, color: (save.unlockedAchievements || []).includes('perfect_placement') ? G.gold : G.textPrimary }}>
                    {(save.unlockedAchievements || []).includes('perfect_placement') ? t('achievementsModal.secretNameUnlocked') : t('achievementsModal.secretNameLocked')}
                  </div>
                  <div style={{ fontSize: 11, color: G.textSecondary }}>
                    {(save.unlockedAchievements || []).includes('perfect_placement') ? t('achievementsModal.secretDescUnlocked') : t('achievementsModal.secretDescLocked')}
                  </div>
                </div>
                {(save.unlockedAchievements || []).includes('perfect_placement') && <span style={{ color: G.green, fontSize: 16 }}>✓</span>}
              </div>
            </div>
          </div>
        )}

        {showPlacementHistory && (
          <div className="moverlay" onClick={() => setShowPlacementHistory(false)}>
            <div className="mdl" onClick={e => e.stopPropagation()}>
              <div className="mhndl" />
              <div className="mtitle">{t('placementModal.title')}</div>
              <div style={{ color: G.textSecondary, fontSize: 12, marginBottom: 16 }}>
                {t('placementModal.sub', { played: save.placementGames, total: PLACEMENT_TOTAL })}
              </div>

              {/* Timeline of games played */}
              {(save.placementHistory || []).map((h, i) => {
                const gate = PLACEMENT_GATES[h.gateId];
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${G.border}` }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: h.won ? 'rgba(39,174,96,.15)' : 'rgba(192,57,43,.15)', border: `2px solid ${h.won ? G.green : G.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
                      {h.won ? '✓' : '✗'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: h.won ? G.green : G.red }}>{t('common.gameN', { n: i + 1 })} — {h.won ? t('common.win') : t('common.loss')}</div>
                      <div style={{ fontSize: 11, color: G.textSecondary }}>{h.type === 'recovery' ? t('placement.recoveryTag') : t('placement.gateTag')} {gate?.label}</div>
                    </div>
                  </div>
                );
              })}

              {/* Next game */}
              {!save.placementDone && save.placementGames < PLACEMENT_TOTAL && (() => {
                const slot = nextPlacementSlot(save.placementHistory || []);
                if (!slot) return null;
                return (
                  <div style={{ marginTop: 12, background: slot.type === 'recovery' ? 'rgba(212,129,58,.08)' : 'rgba(45,212,191,.08)', border: `1px solid ${slot.type === 'recovery' ? 'rgba(212,129,58,.2)' : 'rgba(45,212,191,.2)'}`, borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, color: slot.type === 'recovery' ? '#d4813a' : '#2dd4bf', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                      {t('common.gameN', { n: save.placementGames + 1 })} — {slot.type === 'recovery' ? t('placement.recovery') : t('placement.gate')}
                    </div>
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{slotLabel(slot)}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                      {[
                        { label: t('placementModal.decks'), val: slot.decks },
                        { label: t('placementModal.penetration'), val: `${slot.penetration}%` },
                        { label: t('placementModal.limit'), val: `${slot.timeLimit}s` },
                      ].map(s => (
                        <div key={s.label} style={{ textAlign: 'center', background: 'rgba(0,0,0,.2)', borderRadius: 6, padding: '6px 4px' }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: slot.type === 'recovery' ? '#d4813a' : '#2dd4bf' }}>{s.val}</div>
                          <div style={{ fontSize: 10, color: G.textSecondary }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {showRankLadder && (
          <div className="moverlay" onClick={() => setShowRankLadder(false)}>
            <div className="mdl" onClick={e => e.stopPropagation()}>
              <div className="mhndl" />
              <div className="mtitle">{t('rankLadder.title')}</div>
              <div style={{ color: G.textSecondary, fontSize: 12, marginBottom: 16 }}>
                {t('rankLadder.sub', { count: RANKS_DEF.length, tiers: RANKS_DEF.length * SUB_RANKS })}
              </div>

              {RANKS_DEF.map(rk => {
                const isCurrent = save.rankId === rk.id;
                const isReached = save.rankId > rk.id;
                const isMasterRank = rk.id === RANKS_DEF.length;
                // fastest = sub-rank III, slowest = sub-rank I
                const spcFast = TIER_SPC[tierIndex(rk.id, SUB_RANKS)];
                const spcSlow = TIER_SPC[tierIndex(rk.id, 1)];
                const status = isCurrent ? t('rankLadder.you') : isReached ? t('rankLadder.reached') : t('rankLadder.locked');
                const statusColor = isCurrent ? rk.color : isReached ? G.green : G.textSecondary;
                return (
                  <div key={rk.id} style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start', padding: '13px 14px', marginBottom: 9,
                    borderRadius: 10,
                    background: isCurrent ? `${rk.color}18` : 'rgba(255,255,255,.02)',
                    border: `1px solid ${isCurrent ? rk.color : G.border}`,
                    opacity: isReached || isCurrent ? 1 : 0.62,
                  }}>
                    <RankSigil color={rk.color} size={30} dim={!isReached && !isCurrent} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16, fontWeight: 700, color: rk.color }}>{rk.name}</div>
                        {rankTranscription(rk.name, lang) && (
                          <div style={{ fontFamily: 'EB Garamond, serif', fontStyle: 'italic', fontSize: 11.5, color: G.textSecondary }}>· {rankTranscription(rk.name, lang)}</div>
                        )}
                        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: statusColor, border: `1px solid ${statusColor}`, borderRadius: 20, padding: '1px 7px' }}>{status}</div>
                      </div>
                      <div style={{ fontSize: 11, color: G.textSecondary, marginBottom: 8 }}>{t('rankLadder.tiers')}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                        {[
                          { label: t('rankLadder.decksLabel'), val: rk.decks },
                          { label: t('rankLadder.penetration'), val: `${SUBRANK_PEN[1]}–${SUBRANK_PEN[SUB_RANKS]}%` },
                          { label: t('rankLadder.speed'), val: `${spcFast}–${spcSlow}s` },
                        ].map(s => (
                          <div key={s.label} style={{ background: 'rgba(0,0,0,.22)', borderRadius: 6, padding: '7px 4px', textAlign: 'center' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: rk.color }}>{s.val}</div>
                            <div style={{ fontSize: 9.5, color: G.textSecondary, marginTop: 2 }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: 11, color: isMasterRank ? G.gold : G.textSecondary, marginTop: 8 }}>
                        {isMasterRank ? t('rankLadder.masterPerk') : t('rankLadder.rankPerk')}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div style={{ fontSize: 11, color: G.textSecondary, marginTop: 4, textAlign: 'center' }}>{t('rankLadder.footer')}</div>
            </div>
          </div>
        )}

        {showShop && (
          <div className="moverlay" onClick={() => setShowShop(false)}>
            <div className="mdl" onClick={e => e.stopPropagation()}>
              <div className="mhndl" />
              <div className="mtitle">{t('shop.title')}</div>
              <div style={{ color: G.textSecondary, fontSize: 12, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5 }}><Coin size={13} />{t('shop.coinsAvailable', { coins: save.coins })}</div>
              <div style={{ fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: G.gold, marginBottom: 8 }}>{t('shop.boutiqueCoins')}</div>
              {CARD_SKINS.map(sk => {
                const owned = save.unlockedSkins.includes(sk.id);
                const active = save.activeSkin === sk.id;
                const canBuy = !owned && save.coins >= sk.price && !sk.secret;
                const isSecret = sk.secret && !owned;
                return (
                  <div key={sk.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: `1px solid ${G.border}`, opacity: isSecret ? 0.5 : 1 }}>
                    <div style={{ width: 38, height: 52, borderRadius: 6, border: `2px solid ${active ? G.gold : G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
                         className={isSecret ? '' : sk.bg}>
                      {isSecret && <Lock size={16} color={G.textMuted} />}
                      {!isSecret && sk.id === 'voidgold' && (
                        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', filter: 'drop-shadow(0 0 1px #D4AF37)' }} viewBox="0 0 38 52" fill="none">
                          <path d="M 29 1 Q 37 1 37 9"  stroke="#D4AF37" strokeWidth="1" strokeDasharray="2 1.5"/>
                          <path d="M 9 51 Q 1 51 1 43"  stroke="#D4AF37" strokeWidth="1" strokeDasharray="2 1.5"/>
                          <line x1="37" y1="9"  x2="1"  y2="43" stroke="#D4AF37" strokeWidth="1" strokeDasharray="2 1.5"/>
                          <line x1="29" y1="1"  x2="9"  y2="51" stroke="#D4AF37" strokeWidth="1" strokeDasharray="2 1.5"/>
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 1 }}>{isSecret ? t('shop.secretName') : sk.name}</div>
                      <div style={{ fontSize: 12, color: G.textSecondary }}>{isSecret ? t('shop.secretDesc') : sk.price === 0 ? t('shop.free') : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{t('shop.priceCoins', { price: sk.price })}<Coin size={11} /></span>}</div>
                    </div>
                    {isSecret ? null : active
                      ? <span style={{ fontSize: 11, color: '#0d0a1a', background: G.gold, borderRadius: 6, padding: '4px 10px', fontWeight: 700, letterSpacing: '.04em' }}>{t('common.equipped')}</span>
                      : owned
                        ? <button style={{ fontSize: 11, color: '#0d0a1a', background: G.green, border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 700 }} onClick={() => { snd(playClick); patchSave({ activeSkin: sk.id }); }}>{t('common.equip')}</button>
                        : <button style={{ fontSize: 11, color: canBuy ? '#0d0a1a' : G.textSecondary, background: canBuy ? G.gold : 'rgba(255,255,255,.04)', border: `1px solid ${canBuy ? G.gold : G.border}`, borderRadius: 6, padding: '4px 10px', cursor: canBuy ? 'pointer' : 'not-allowed', fontWeight: canBuy ? 700 : 400 }}
                          onClick={() => { if (canBuy) { snd(playClick); patchSave({ coins: save.coins - sk.price, unlockedSkins: [...save.unlockedSkins, sk.id], activeSkin: sk.id }); } }}>
                          {canBuy ? t('common.buy') : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{t('shop.buyLocked', { price: sk.price })}<Coin size={10} /></span>}</button>}
                  </div>
                );
              })}

              {/* ─── Catégorie 2 : Le Marchand (artefacts payants, 4,99 € pièce) ─── */}
              <div style={{ marginTop: 26, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Merchant size={46} />
                <div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 15, fontWeight: 700, letterSpacing: '.08em', color: '#e8c97a' }}>{t('shop.warChest')}</div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9.5, letterSpacing: '.24em', textTransform: 'uppercase', color: G.textMuted, marginTop: 2 }}>{t('shop.merchantSub')}</div>
                </div>
              </div>
              <div style={{ fontSize: 13.5, fontStyle: 'italic', color: G.textSecondary, marginBottom: 12, lineHeight: 1.55, borderLeft: `2px solid ${G.borderGold}`, paddingLeft: 12 }}>
                {t('shop.warChestDesc')}
              </div>
              {SUPPORT_SKINS.map(sk => {
                const owned = save.unlockedSkins.includes(sk.id);
                const active = save.activeSkin === sk.id;
                const buy = () => patchSave({ unlockedSkins: [...save.unlockedSkins, sk.id], activeSkin: sk.id });
                const equip = () => patchSave({ activeSkin: sk.id });
                return (
                  <div key={sk.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: `1px solid ${G.border}`, opacity: owned ? 1 : 0.85 }}>
                    <div style={{ position: 'relative', width: 40, height: 56, borderRadius: 6, overflow: 'hidden', border: `2px solid ${active ? sk.accent : G.border}`, flexShrink: 0 }}>
                      <SupportCard rank="A" suitName="spades" skin={sk} mini />
                      {!owned && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Lock size={15} color={G.goldLight} /></div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 1, color: owned ? sk.accent : G.textPrimary }}>{sk.name}</div>
                      <div style={{ fontSize: 12, color: G.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{owned ? t('shop.tagline.' + sk.id) : t('shop.price499')}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => { snd(playClick); setPreviewSkin(sk); }}
                        style={{ fontSize: 11, color: sk.accent, background: 'transparent', border: `1px solid ${sk.accent}55`, borderRadius: 6, padding: '4px 9px', cursor: 'pointer', fontWeight: 600 }}>{t('shop.preview')}</button>
                      {active
                        ? <span style={{ fontSize: 11, color: '#0d0a1a', background: sk.accent, borderRadius: 6, padding: '4px 10px', fontWeight: 700, letterSpacing: '.04em' }}>{t('common.equipped')}</span>
                        : owned
                          ? <button style={{ fontSize: 11, color: '#0d0a1a', background: G.green, border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 700 }} onClick={() => { snd(playClick); equip(); }}>{t('common.equip')}</button>
                          : <button style={{ fontSize: 11, color: '#0d0a1a', background: '#e8c97a', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 700 }} onClick={() => { snd(playClick); buy(); }}>{t('shop.price499')}</button>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {previewSkin && (
          <SupportPreviewModal
            skin={previewSkin}
            t={t}
            owned={save.unlockedSkins.includes(previewSkin.id)}
            active={save.activeSkin === previewSkin.id}
            onClose={() => setPreviewSkin(null)}
            onBuy={() => patchSave({ unlockedSkins: [...save.unlockedSkins, previewSkin.id], activeSkin: previewSkin.id })}
            onEquip={() => patchSave({ activeSkin: previewSkin.id })}
          />
        )}

        {showStats && (() => {
          const s = save.stats;
          const total = s.total || 0;
          const correct = s.correct || 0;
          const winRate = total > 0 ? Math.round(correct / total * 100) : null;
          const recent = s.recentResults || [];
          const recentWins = recent.filter(r => (typeof r === 'object' ? r.won : r)).length;
          const recentWR = recent.length > 0 ? Math.round(recentWins / recent.length * 100) : null;
          const history = save.placementHistory || [];
          const selected = selectedHistoryIdx !== null ? recent[selectedHistoryIdx] : null;
          const skinGames = s.skinGames || {};
          const topSkinId = Object.keys(skinGames).sort((a, b) => skinGames[b] - skinGames[a])[0] || null;
          const topSkinCount = topSkinId ? skinGames[topSkinId] : 0;

          // Précision par nombre de decks (trié 1 → 8).
          const deckStats = s.deckStats || {};
          const deckRows = Object.keys(deckStats)
            .map(k => ({ decks: parseInt(k, 10), ...deckStats[k] }))
            .filter(r => r.total > 0)
            .sort((a, b) => a.decks - b.decks);
          const modeStats = s.modeStats || {};
          const cardsCounted = s.cardsCounted || 0;
          const modeLabel = (m) => t('modeName.' + (m === 'placement' ? 'placement' : m === 'promo' ? 'promo' : m === 'ranked' ? 'ranked' : m === 'casino' ? 'casino' : m === 'daily' ? 'daily' : 'training'));

          // Défi du jour
          const d = save.daily || {};
          const dailyPlayed = d.totalPlayed || 0;
          const dailyWR = dailyPlayed > 0 ? Math.round((d.totalWon || 0) / dailyPlayed * 100) : null;
          const dailyHist = d.history || [];

          return (
            <div className="moverlay" onClick={() => { setShowStats(false); setSelectedHistoryIdx(null); }}>
              <div className="mdl" onClick={e => e.stopPropagation()}>
                <div className="mhndl" />
                <div className="mtitle">{t('stats.title')}</div>
                <div style={{ color: G.textSecondary, fontSize: 12, marginBottom: 16 }}>{t('stats.sub')}</div>

                {/* Key metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                  {[
                    { label: t('stats.games'), val: total, color: G.textPrimary },
                    { label: t('stats.wins'), val: `${save.totalWins || 0}`, color: G.green },
                    { label: t('stats.losses'), val: `${save.totalLosses || 0}`, color: G.red },
                    { label: t('stats.accuracy'), val: winRate !== null ? `${winRate}%` : '—', color: G.gold },
                    { label: t('stats.last20'), val: recentWR !== null ? `${recentWR}%` : '—', color: '#2dd4bf' },
                    { label: t('stats.bestTime'), val: s.bestTime ? `${s.bestTime.toFixed(1)}s` : '—', color: G.goldLight },
                  ].map(m => (
                    <div key={m.label} style={{ background: 'rgba(0,0,0,.2)', border: `1px solid ${G.border}`, borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 18, fontWeight: 700, color: m.color }}>{m.val}</div>
                      <div style={{ fontSize: 10, color: G.textSecondary, marginTop: 2 }}>{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Streak info */}
                <div style={{ background: 'rgba(201,162,75,.06)', border: `1px solid ${G.borderGold}`, borderRadius: 8, padding: '10px 14px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, color: G.gold }}>{t('stats.currentStreak')}</div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 20, fontWeight: 700, color: G.goldLight }}>{save.perfectStreak || 0}</div>
                </div>

                {/* Best streak with avg s/carte */}
                <div style={{ background: 'rgba(45,212,191,.06)', border: '1px solid rgba(45,212,191,.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: (save.bestStreak || 0) > 0 ? 6 : 0 }}>
                    <div style={{ fontSize: 13, color: '#2dd4bf' }}>{t('stats.bestStreak')}</div>
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: 20, fontWeight: 700, color: '#2dd4bf' }}>{save.bestStreak || 0}</div>
                  </div>
                  {(save.bestStreak || 0) > 0 && (
                    <div style={{ fontSize: 11, color: G.textSecondary, display: 'flex', justifyContent: 'space-between' }}>
                      <span>{save.bestStreakAvgSpc != null ? t('stats.avgSpc', { spc: save.bestStreakAvgSpc.toFixed(2) }) : '—'}</span>
                      <span>{t('stats.totalCards', { cards: save.bestStreakCards || 0 })}</span>
                    </div>
                  )}
                </div>

                {/* Défi du jour */}
                <div style={{ background: 'rgba(201,162,75,.06)', border: `1px solid ${G.borderGold}`, borderRadius: 8, padding: '12px 14px', marginBottom: 14 }}>
                  <div style={{ fontSize: 13, color: G.gold, marginBottom: dailyPlayed > 0 ? 10 : 0, display: 'flex', alignItems: 'center', gap: 6 }}><CalendarDays size={13} /> {t('stats.dailyTitle')}</div>
                  {dailyPlayed > 0 ? (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                        {[
                          { label: t('stats.dailyStreak'), val: d.streak || 0, color: G.goldLight },
                          { label: t('stats.dailyBestStreak'), val: d.bestStreak || 0, color: '#2dd4bf' },
                          { label: t('stats.dailyBestScore'), val: d.bestScore || 0, color: G.gold },
                        ].map(m => (
                          <div key={m.label} style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 17, fontWeight: 700, color: m.color }}>{m.val}</div>
                            <div style={{ fontSize: 10, color: G.textSecondary, marginTop: 2 }}>{m.label}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: 11, color: G.textSecondary, marginBottom: dailyHist.length > 0 ? 8 : 0 }}>
                        {t('stats.dailyRecap', { won: d.totalWon || 0, played: dailyPlayed, wr: dailyWR })}
                      </div>
                      {dailyHist.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          {dailyHist.map((h, i) => (
                            <div key={i} title={h.key} style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, background: h.won ? 'rgba(39,174,96,.2)' : 'rgba(192,57,43,.2)', border: `1.5px solid ${h.won ? G.green : G.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: h.won ? G.green : G.red }}>
                              {h.won ? '✓' : '✗'}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ fontSize: 12, color: G.textSecondary }}>{t('stats.dailyNever')}</div>
                  )}
                </div>

                {/* Most-played skin */}
                {topSkinId && (
                  <div style={{ background: 'rgba(201,162,75,.06)', border: `1px solid ${G.borderGold}`, borderRadius: 8, padding: '10px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 13, color: G.gold, display: 'flex', alignItems: 'center', gap: 6 }}><Gem size={13} /> {t('stats.topSkin')}</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 15, fontWeight: 700, color: G.goldLight }}>{skinNameById(topSkinId)}</div>
                      <div style={{ fontSize: 11, color: G.textSecondary }}>{t('stats.topSkinGames', { n: topSkinCount })}</div>
                    </div>
                  </div>
                )}

                {/* Recent 20 results — clickable bars */}
                {recent.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: G.textSecondary, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>{t('stats.recentTitle')}</div>
                    <div style={{ display: 'flex', gap: 3, height: 28, alignItems: 'flex-end' }}>
                      {recent.map((r, i) => {
                        const won = typeof r === 'object' ? r.won : r;
                        const isSel = selectedHistoryIdx === i;
                        return (
                          <div key={i}
                            onClick={() => setSelectedHistoryIdx(isSel ? null : i)}
                            style={{
                              flex: 1, borderRadius: 2, cursor: 'pointer',
                              background: won ? G.green : G.red,
                              height: won ? '100%' : '40%',
                              opacity: isSel ? 1 : 0.65 + (i / recent.length) * 0.25,
                              outline: isSel ? `2px solid ${G.gold}` : 'none',
                              outlineOffset: 1,
                            }} />
                        );
                      })}
                      {Array.from({ length: Math.max(0, 20 - recent.length) }).map((_, i) => (
                        <div key={`empty-${i}`} style={{ flex: 1, borderRadius: 2, background: 'rgba(255,255,255,.06)', height: '20%' }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: G.textSecondary, marginTop: 4 }}>
                      <span>{t('stats.oldest')}</span><span>{t('stats.newest')}</span>
                    </div>

                    {/* Detail popup for selected bar */}
                    {selected && typeof selected === 'object' && (
                      <div style={{ marginTop: 10, background: 'rgba(0,0,0,.3)', border: `1px solid ${selected.won ? 'rgba(39,174,96,.3)' : 'rgba(192,57,43,.3)'}`, borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: selected.won ? G.green : G.red, marginBottom: 6 }}>
                          {selected.won ? t('stats.detailWin') : t('stats.detailLoss')} · {modeLabel(selected.mode)}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
                          {[
                            { label: t('stats.decks'), val: selected.decks },
                            { label: t('stats.penetration'), val: `${selected.penetration}%` },
                            { label: t('stats.spcLabel'), val: selected.spc?.toFixed(2) },
                            { label: t('stats.timeLabel'), val: `${selected.timeSec}s` },
                          ].map(s => (
                            <div key={s.label} style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: G.textPrimary }}>{s.val}</div>
                              <div style={{ fontSize: 9, color: G.textSecondary, marginTop: 1 }}>{s.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Précision par nombre de decks */}
                {deckRows.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: G.textSecondary, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>{t('stats.byDeckTitle')}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {deckRows.map(r => {
                        const acc = Math.round(r.correct / r.total * 100);
                        const barColor = acc >= 70 ? G.green : acc >= 45 ? '#d4813a' : G.red;
                        return (
                          <div key={r.decks} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 58, fontSize: 11, color: G.textSecondary, flexShrink: 0 }}>{t('stats.deckLabel', { n: r.decks })}</div>
                            <div style={{ flex: 1, height: 14, background: 'rgba(255,255,255,.05)', borderRadius: 7, overflow: 'hidden' }}>
                              <div style={{ width: `${acc}%`, height: '100%', background: barColor, borderRadius: 7, transition: 'width .3s' }} />
                            </div>
                            <div style={{ width: 66, textAlign: 'right', fontSize: 11, color: G.textPrimary, flexShrink: 0 }}>
                              <span style={{ fontWeight: 700, color: barColor }}>{acc}%</span> <span style={{ color: G.textSecondary }}>({r.total})</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Cartes comptées à vie + répartition par mode */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  <div style={{ flex: 1, background: 'rgba(0,0,0,.2)', border: `1px solid ${G.border}`, borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: 18, fontWeight: 700, color: G.goldLight }}>{cardsCounted.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: G.textSecondary, marginTop: 2 }}>{t('stats.cardsCounted')}</div>
                  </div>
                  {Object.keys(modeStats).length > 0 && (
                    <div style={{ flex: 1.4, background: 'rgba(0,0,0,.2)', border: `1px solid ${G.border}`, borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ fontSize: 10, color: G.textSecondary, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>{t('stats.byModeTitle')}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {Object.keys(modeStats).sort((a, b) => modeStats[b] - modeStats[a]).map(m => (
                          <div key={m} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                            <span style={{ color: G.textSecondary }}>{modeLabel(m)}</span>
                            <span style={{ color: G.textPrimary, fontWeight: 600 }}>{modeStats[m]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Rang + MMR */}
                <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 14, marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: G.textSecondary, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>{t('stats.rankedProgress')}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <RankSigil color={displayRank.color} size={32} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 3 }}>
                        {displayRank.name}
                        {rankTranscription(displayRank.name, lang) && (
                          <span style={{ fontFamily: 'EB Garamond, serif', fontStyle: 'italic', fontSize: 12, fontWeight: 400, color: G.textSecondary }}> · {rankTranscription(displayRank.name, lang)}</span>
                        )}
                      </div>
                      {placementOngoing ? (
                        <div style={{ fontSize: 11, color: G.gold, marginTop: 3 }}>{t('stats.placementInProgress')}</div>
                      ) : displayRank.id < 6 && (
                        <>
                          <div className="mmrtrack">
                            <div className="mmrfill" style={{ width: `${save.mmr}%`, background: `linear-gradient(90deg,${G.goldDark},${mmrColor})` }} />
                          </div>
                          <div style={{ fontSize: 11, color: G.textSecondary, marginTop: 3 }}>{save.mmr}/100 MMR</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Placement history if done */}
                {save.placementDone && history.length > 0 && (
                  <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 14 }}>
                    <div style={{ fontSize: 11, color: G.textSecondary, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>{t('stats.initialPlacement')}</div>
                    {history.map((h, i) => {
                      const gate = PLACEMENT_GATES[h.gateId];
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: `1px solid ${G.border}` }}>
                          <div style={{ width: 22, height: 22, borderRadius: '50%', background: h.won ? 'rgba(39,174,96,.15)' : 'rgba(192,57,43,.15)', border: `1.5px solid ${h.won ? G.green : G.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>
                            {h.won ? '✓' : '✗'}
                          </div>
                          <div style={{ flex: 1, fontSize: 12, color: G.textSecondary }}>{t('common.gameN', { n: i + 1 })} · {h.type === 'recovery' ? t('placement.recoveryTag') : t('placement.gateTag')} {gate?.label}</div>
                          <div style={{ fontSize: 11, color: h.won ? G.green : G.red, fontWeight: 600 }}>{h.won ? t('common.winShort') : t('common.lossShort')}</div>
                        </div>
                      );
                    })}
                    {save.placementWins === PLACEMENT_GATES.length && (
                      <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(0,0,0,.3)', border: `1px solid ${G.border}`, borderRadius: 8, textAlign: 'center', fontSize: 12, color: G.textSecondary }}>
                        🌑 <span style={{ color: G.textPrimary }}>The Architect</span>{t('stats.architectSuffix')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {showSettings && (
          <div className="moverlay" onClick={() => setShowSettings(false)}>
            <div className="mdl" onClick={e => e.stopPropagation()}>
              <div className="mhndl" />
              <div className="mtitle">{t('settings.title')}</div>
              <div style={{ padding: '14px 0', borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: G.textPrimary, fontSize: 13 }}>
                  {save.soundEnabled !== false ? <Volume2 size={15} color={G.gold} /> : <VolumeX size={15} color={G.textSecondary} />}
                  <span>{t('settings.sound')}</span>
                </div>
                <button
                  onClick={() => { initAudio(); patchSave({ soundEnabled: save.soundEnabled === false }); }}
                  style={{ padding: '6px 14px', background: save.soundEnabled !== false ? 'rgba(201,162,75,.15)' : 'rgba(255,255,255,.05)', border: `1px solid ${save.soundEnabled !== false ? G.borderGold : G.border}`, borderRadius: 6, color: save.soundEnabled !== false ? G.gold : G.textSecondary, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                  {save.soundEnabled !== false ? 'ON' : 'OFF'}
                </button>
              </div>
              {/* Volume de la musique du lobby */}
              <div style={{ padding: '14px 0', borderBottom: `1px solid ${G.border}`, opacity: save.soundEnabled !== false ? 1 : 0.45 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: G.textPrimary, fontSize: 13 }}>
                    <Music size={15} color={G.gold} />
                    <span>{t('settings.music')}</span>
                  </div>
                  <span style={{ color: G.textSecondary, fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
                    {Math.round((save.musicVolume ?? 0.35) * 100)}%
                  </span>
                </div>
                <input
                  type="range" min={0} max={100} step={1}
                  value={Math.round((save.musicVolume ?? 0.35) * 100)}
                  disabled={save.soundEnabled === false}
                  onChange={e => patchSave({ musicVolume: Number(e.target.value) / 100 })}
                  style={{ width: '100%', accentColor: G.gold, cursor: save.soundEnabled === false ? 'default' : 'pointer' }}
                />
              </div>
              {/* Vibrations haptiques (mobile) */}
              <div style={{ padding: '14px 0', borderBottom: `1px solid ${G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: G.textPrimary, fontSize: 13 }}>
                  <Vibrate size={15} color={save.hapticsEnabled !== false ? G.gold : G.textSecondary} />
                  <span>{t('settings.haptics')}</span>
                </div>
                <button
                  onClick={() => { const on = save.hapticsEnabled === false; patchSave({ hapticsEnabled: on }); if (on) vibrateWin(); }}
                  style={{ padding: '6px 14px', background: save.hapticsEnabled !== false ? 'rgba(201,162,75,.15)' : 'rgba(255,255,255,.05)', border: `1px solid ${save.hapticsEnabled !== false ? G.borderGold : G.border}`, borderRadius: 6, color: save.hapticsEnabled !== false ? G.gold : G.textSecondary, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                  {save.hapticsEnabled !== false ? 'ON' : 'OFF'}
                </button>
              </div>
              {/* Dev · définir le rang sans passer par le placement */}
              <div style={{ padding: '14px 0', borderBottom: `1px solid ${G.border}` }}>
                <div style={{ fontSize: 11, color: G.textSecondary, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>{t('settings.devRankTitle')}</div>
                <div style={{ fontSize: 11, color: G.textSecondary, marginBottom: 10 }}>{t('settings.devRankHint')}</div>
                {/* Sous-rang I / II / III */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  {ROMAN.map((r, i) => {
                    const sr = i + 1;
                    const active = save.subRank === sr;
                    return (
                      <button key={r} onClick={() => { snd(playClick); patchSave({ subRank: sr, placementDone: true, placementEnded: false, trainingDone: true, inPromo: false, promoLocked: false }); }}
                        style={{ flex: 1, padding: '7px 0', background: active ? 'rgba(201,162,75,.15)' : 'rgba(255,255,255,.03)', border: `1px solid ${active ? G.borderGold : G.border}`, borderRadius: 6, color: active ? G.gold : G.textSecondary, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                        {r}
                      </button>
                    );
                  })}
                </div>
                {/* Rangs Cuivre → Adamantium */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                  {RANKS_DEF.map(rk => {
                    const active = save.rankId === rk.id;
                    return (
                      <button key={rk.id} onClick={() => { snd(playClick); patchSave({ rankId: rk.id, subRank: save.subRank || 1, mmr: 0, placementDone: true, placementEnded: false, trainingDone: true, inPromo: false, promoLocked: false }); }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '9px 4px', background: active ? `${rk.color}22` : 'rgba(255,255,255,.03)', border: `1px solid ${active ? rk.color : G.border}`, borderRadius: 7, cursor: 'pointer' }}>
                        <RankSigil color={rk.color} size={20} dim={!active} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: active ? rk.color : G.textSecondary }}>{rk.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ padding: '14px 0', borderBottom: `1px solid ${G.border}` }}>
                <button style={{ width: '100%', padding: 11, background: 'rgba(192,57,43,.1)', border: `1px solid rgba(192,57,43,.3)`, borderRadius: 8, color: G.red, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                  onClick={() => { snd(playClick); setShowResetConfirm(true); }}>{t('settings.reset')}</button>
              </div>
            </div>
          </div>
        )}

        {showResetConfirm && (
          <div className="moverlay">
            <div className="mdl">
              <div className="mhndl" />
              <div className="mtitle" style={{ color: G.red }}>{t('settings.resetTitle')}</div>
              <div style={{ color: G.textSecondary, fontSize: 13, margin: '10px 0 14px', lineHeight: 1.5 }}>{t('settings.resetWarnPre')}<strong style={{ color: G.textPrimary }}>RESET</strong>{t('settings.resetWarnPost')}</div>
              <input style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: `1px solid ${G.border}`, borderRadius: 8, padding: '11px 14px', color: G.textPrimary, fontSize: 14, outline: 'none', marginBottom: 10 }}
                value={resetText} onChange={e => {
                  const v = e.target.value;
                  if (v === 'adminmagueule') {
                    patchSave({ coins: (save.coins || 0) + 10000 });
                    setResetText('');
                    setShowResetConfirm(false);
                  } else if (v === 'Ouaisleskin') {
                    patchSave({ unlockedSkins: save.unlockedSkins.includes('obsidian') ? save.unlockedSkins : [...save.unlockedSkins, 'obsidian'], activeSkin: 'obsidian' });
                    setResetText('');
                    setShowResetConfirm(false);
                  } else {
                    setResetText(v);
                  }
                }} placeholder={t('settings.resetPlaceholder')} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ flex: 1, padding: 11, background: 'rgba(255,255,255,.05)', border: `1px solid ${G.border}`, borderRadius: 8, color: G.textSecondary, cursor: 'pointer' }}
                  onClick={() => { snd(playClick); setShowResetConfirm(false); setResetText(''); }}>{t('common.cancel')}</button>
                <button style={{ flex: 1, padding: 11, background: resetText === 'RESET' ? 'rgba(192,57,43,.2)' : 'rgba(255,255,255,.03)', border: `1px solid ${resetText === 'RESET' ? G.red : G.border}`, borderRadius: 8, color: resetText === 'RESET' ? G.red : G.textSecondary, cursor: resetText === 'RESET' ? 'pointer' : 'not-allowed', fontWeight: 600 }}
                  onClick={() => { if (resetText === 'RESET') { localStorage.removeItem('eliteSave'); window.location.reload(); } }}>{t('common.confirm')}</button>
              </div>
            </div>
          </div>
        )}

        {showAchievement && (
          <div className={`acht ${toastLeaving ? 'leaving' : 'entering'}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 26 }}>{showAchievement.icon}</div>
              <div>
                <div style={{ fontSize: 10, color: G.gold, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 1 }}>{t('achievementsModal.toastLabel')}</div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 15, fontWeight: 700 }}>{showAchievement.name}</div>
              </div>
            </div>
          </div>
        )}

        {showLangModal && (
          <LanguageModal current={lang} onPick={setLang} onClose={() => setShowLangModal(false)} t={t} />
        )}
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // MODE-RANKED CONFIG
  // ──────────────────────────────────────────────────────────────
  if (nav === 'mode-ranked') {
    const rank = currentRank;
    const isPlacement = !save.placementDone && !save.placementEnded;
    const isPromo = false; // système de promo retiré — promotion automatique à 100 MMR
    const history = save.placementHistory || [];
    const nextSlot = isPlacement ? nextPlacementSlot(history) : null;
    const rankedPen = curRankCfg.penetration;
    const tl = nextSlot ? nextSlot.timeLimit : curRankCfg.timeLimit;
    const totalC = nextSlot ? nextSlot.totalCards : curRankCfg.totalCards;

    return (
      <div className="r">
        <style>{css}</style>
        {renderHeader(true)}
        {renderCrumbs()}
        <div className="cfg">
          <button className="back" onClick={() => { snd(playClick); goBack(); }} style={{ marginBottom: 14 }}><ChevronLeft size={13} /> {t('common.back')}</button>

          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 21, fontWeight: 700, marginBottom: 3 }}>
            {isPlacement ? t('rankedConfig.placementTitle') : isPromo ? t('rankedConfig.promoTitle') : t('rankedConfig.rankedTitle')}
          </div>
          <div style={{ fontSize: 13, color: G.textSecondary, marginBottom: 16 }}>
            {isPlacement && nextSlot
              ? t('rankedConfig.placementSub', { n: save.placementGames + 1, total: PLACEMENT_TOTAL, type: nextSlot.type })
              : t('rankedConfig.rankedSub', { rank: rankLabel(), win: rank.mmrPerWin, loss: rank.mmrPerLoss })}
          </div>

          {isPlacement && nextSlot ? (
            <div className="cfgc">
              <div className="cfgt">{t('rankedConfig.progress', { n: save.placementGames, total: PLACEMENT_TOTAL })}</div>

              {/* Progress bar */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {Array.from({ length: PLACEMENT_TOTAL }).map((_, i) => {
                  const h = history[i];
                  const isCur = i === save.placementGames;
                  return (
                    <div key={i} style={{ flex: 1, height: 6, borderRadius: 3,
                      background: h ? (h.won ? G.green : G.red) : isCur ? '#2dd4bf' : 'rgba(255,255,255,.06)' }} />
                  );
                })}
              </div>

              {/* Slot card */}
              <div style={{ background: nextSlot.type === 'recovery' ? 'rgba(212,129,58,.06)' : 'rgba(45,212,191,.06)',
                border: `1px solid ${nextSlot.type === 'recovery' ? 'rgba(212,129,58,.3)' : 'rgba(45,212,191,.3)'}`,
                borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: nextSlot.type === 'recovery' ? '#d4813a' : '#2dd4bf',
                  letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5 }}>
                  {nextSlot.type === 'recovery' ? t('placement.recoveryTag') : t('placement.gateTag')}
                </div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16, fontWeight: 700, marginBottom: 10 }}>
                  {slotLabel(nextSlot)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
                  {[
                    { label: t('rankedConfig.decks'), val: nextSlot.decks },
                    { label: t('rankedConfig.penetration'), val: `${nextSlot.penetration}%` },
                    { label: t('rankedConfig.limit'), val: `${nextSlot.timeLimit}s` },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'rgba(0,0,0,.2)', borderRadius: 6, padding: '8px 6px', textAlign: 'center' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: nextSlot.type === 'recovery' ? '#d4813a' : '#2dd4bf' }}>{s.val}</div>
                      <div style={{ fontSize: 10, color: G.textSecondary, marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: G.textSecondary, marginTop: 8, textAlign: 'center' }}>
                  {t('rankedConfig.spcCards', { spc: nextSlot.secPerCard, cards: nextSlot.totalCards })}
                </div>
              </div>

              {/* Win/loss consequences */}
              <div style={{ display: 'flex', gap: 7 }}>
                <div style={{ flex: 1, background: 'rgba(39,174,96,.07)', border: '1px solid rgba(39,174,96,.25)', borderRadius: 7, padding: '8px 10px', fontSize: 11 }}>
                  <div style={{ color: G.green, fontWeight: 700, marginBottom: 3 }}>{t('rankedConfig.winLabel')}</div>
                  {nextSlot.type === 'gate'
                    ? <div style={{ color: G.textSecondary }}>→ {nextSlot.gateId < PLACEMENT_GATES.length - 1 ? t('rankedConfig.nextGate') : t('rankedConfig.placedAt', { rank: RANKS_DEF[(nextSlot.toRankId||1)-1]?.name })}</div>
                    : <div style={{ color: G.textSecondary }}>→ {t('rankedConfig.retryGate', { gate: PLACEMENT_GATES[nextSlot.gateId]?.label })}</div>}
                </div>
                <div style={{ flex: 1, background: 'rgba(192,57,43,.07)', border: '1px solid rgba(192,57,43,.25)', borderRadius: 7, padding: '8px 10px', fontSize: 11 }}>
                  <div style={{ color: G.red, fontWeight: 700, marginBottom: 3 }}>{t('rankedConfig.lossLabel')}</div>
                  {nextSlot.type === 'gate'
                    ? <div style={{ color: G.textSecondary }}>→ {t('rankedConfig.recoveryTo', { rank: RANKS_DEF[(nextSlot.fromRankId||1)-1]?.name })}</div>
                    : <div style={{ color: G.textSecondary }}>→ {t('rankedConfig.placementOver')}</div>}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="cfgc">
                <div className="cfgt">{t('rankedConfig.configuration')}</div>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <RankSigil color={rank.color} size={36} />
                  <div>
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: 15, fontWeight: 600, marginBottom: 3 }}>{rankLabel()}</div>
                    <div style={{ fontSize: 12, color: G.textSecondary, marginBottom: 2 }}>{t('rankedConfig.deckPen', { decks: curRankCfg.decks, pen: rankedPen })}</div>
                    <div style={{ fontSize: 12, color: G.textSecondary }}>{t('rankedConfig.timeSpcCards', { tl, spc: curRankCfg.secPerCard, cards: totalC })}</div>
                  </div>
                </div>
              </div>
              <div className="cfgc">
                <div className="cfgt">{t('rankedConfig.mmrCurrent')}</div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 28, fontWeight: 700, color: G.goldLight, marginBottom: 6 }}>{save.mmr}<span style={{ fontSize: 14, color: G.goldDark, marginLeft: 4 }}>/ 100</span></div>
                <div className="mmrtrack">
                  <div className="mmrfill" style={{ width: `${save.mmr}%`, background: `linear-gradient(90deg,${G.goldDark},${mmrColor})` }} />
                </div>
              </div>
            </>
          )}

          <button className="lbtn" onClick={() => { snd(playClick); startRanked(); }}>
            {isPlacement
              ? nextSlot?.type === 'recovery'
                ? t('rankedConfig.launchRecovery')
                : t('rankedConfig.launchGate', { n: save.placementGames + 1, total: PLACEMENT_TOTAL })
              : t('rankedConfig.launchRanked')}
          </button>
          <div style={{ fontSize: 11, color: G.red, textAlign: 'center', marginTop: 8 }}>{t('rankedConfig.abandonWarn')}</div>
        </div>
      </div>
    );
  }

    // ──────────────────────────────────────────────────────────────
  // MODE-TRAINING CONFIG
  // ──────────────────────────────────────────────────────────────
  if (nav === 'mode-training') {
    const tc = Math.floor(52 * trainDecks * trainPen / 100);
    return (
      <div className="r">
        <style>{css}</style>
        {renderHeader(true)}
        {renderCrumbs()}
        <div className="cfg">
          <button className="back" onClick={() => { snd(playClick); goBack(); }} style={{ marginBottom: 14 }}><ChevronLeft size={13} /> {t('common.back')}</button>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 21, fontWeight: 700, marginBottom: 3 }}>{t('trainingConfig.title')}</div>
          <div style={{ fontSize: 13, color: G.textSecondary, marginBottom: 18 }}>{t('trainingConfig.sub')}</div>

          <div className="cfgc">
            <div className="cfgt">{t('trainingConfig.deckCount')}</div>
            <div className="dgrid">
              {[1, 2, 4, 6, 8].map(d => (
                <button key={d} className={`dbtn${trainDecks === d ? ' a' : ''}`} onClick={() => { snd(playClick); setTrainDecks(d); }}>
                  <span className="dnum">{d}</span><span className="dlbl">{d > 1 ? t('trainingConfig.decks') : t('trainingConfig.deck')}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="cfgc">
            <div className="cfgt">{t('trainingConfig.penetration')}</div>
            <div className="pgrid">
              {[50, 60, 70, 75, 80, 85, 90, 95].map(p => (
                <button key={p} className={`pbtn${trainPen === p ? ' a' : ''}`} onClick={() => { snd(playClick); setTrainPen(p); }}>{p}%</button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: G.textSecondary, marginTop: 7 }}>{t('trainingConfig.cardsOf', { cards: tc, total: 52 * trainDecks })}</div>
          </div>

          <div className="cfgc">
            <div className="cfgt">{t('trainingConfig.duration')}</div>
            <TimePicker value={trainTime} onChange={setTrainTime} totalCards={tc} t={t} snd={snd} />
          </div>

          <div className="cfgc">
            <div className="cfgt">{t('trainingConfig.options')}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{t('trainingConfig.showCounter')}</div>
                <div style={{ fontSize: 11, color: G.textSecondary }}>{t('trainingConfig.showCounterSub')}</div>
              </div>
              <button style={{ background: trainShowCount ? 'rgba(201,162,75,.15)' : 'rgba(255,255,255,.05)', border: `1px solid ${trainShowCount ? G.gold : G.border}`, borderRadius: 20, padding: '5px 14px', color: trainShowCount ? G.gold : G.textSecondary, cursor: 'pointer', fontSize: 13 }}
                onClick={() => { snd(playClick); setTrainShowCount(p => !p); }}>{trainShowCount ? t('common.on') : t('common.off')}</button>
            </div>
          </div>

          <button className="lbtn" onClick={() => { snd(playClick); startTraining(); }}>{t('trainingConfig.start')}</button>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // MODE-CASINO (placeholder — can extend later)
  // ──────────────────────────────────────────────────────────────
  if (nav === 'mode-casino') {
    const alreadyCompleted = (save.unlockedAchievements || []).includes('casino_complete');
    return (
      <div className="r">
        <style>{css}</style>
        {renderHeader(true)}
        {renderCrumbs()}
        <div className="cfg">
          <button className="back" onClick={() => { snd(playClick); goBack(); }} style={{ marginBottom: 14 }}><ChevronLeft size={13} /> {t('common.back')}</button>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 21, fontWeight: 700, marginBottom: 4 }}>{t('casinoConfig.title')}</div>
          <div style={{ fontSize: 13, color: G.textSecondary, marginBottom: 18 }}>{t('casinoConfig.sub')}</div>

          {alreadyCompleted && (
            <div style={{ background: 'rgba(201,162,75,.08)', border: `1px solid ${G.borderGold}`, borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: G.gold }}>
              {t('casinoConfig.alreadyDone')}
            </div>
          )}

          {/* Steps */}
          <div className="cfgc">
            <div className="cfgt">{t('casinoConfig.stepsTitle')}</div>
            {CASINO_STEPS.map((s, i) => {
              const cfg = getCasinoStepConfig(i);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < CASINO_STEPS.length - 1 ? `1px solid ${G.border}` : 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(192,57,43,.12)', border: '1px solid rgba(192,57,43,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: G.red, flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t('casinoConfig.deckLabel', { decks: s.decks })}</div>
                    <div style={{ fontSize: 11, color: G.textSecondary }}>{t('casinoConfig.stepCards', { cards: cfg.totalCards, tl: cfg.timeLimit })}</div>
                  </div>
                  <div style={{ fontSize: 11, color: G.textSecondary, textAlign: 'right' }}>
                    <div>{t('casinoConfig.penShort', { pen: s.penetration })}</div>
                    <div>{t('casinoConfig.spcShort', { spc: s.secPerCard })}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background: 'rgba(192,57,43,.06)', border: '1px solid rgba(192,57,43,.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#e87a6a', lineHeight: 1.5 }}>
            {t('casinoConfig.warn')}
          </div>

          <button className="lbtn red" onClick={() => { snd(playClick); startCasinoChallenge(); }}>
            {t('casinoConfig.launch')}
          </button>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // GAME SCREEN
  // ──────────────────────────────────────────────────────────────
  if (nav === 'game') {
    const currentCard = deck[currentIndex - 1];
    const tl = timeLimitUsedRef.current || 60;
    const timeInSec = elapsedTime / 1000;
    const timeDisplay = timeInSec.toFixed(1);
    const progress = deck.length > 0 ? (currentIndex / deck.length) * 100 : 0;
    const isRanked = ['ranked', 'placement', 'promo'].includes(gameModeRef.current);
    const isCasino = gameModeRef.current === 'casino';
    const isDaily = gameModeRef.current === 'daily';

    const timePct = timeInSec / tl;
    const timerColor = timePct > 0.9 ? G.red : timePct > 0.7 ? '#d4813a' : G.goldLight;

    // ── 10s inter-step countdown screen ──────────────────────────
    if (casinoCountdown !== null) {
      return (
        <div className="r"><style>{css}</style>
          <div className="gm">
            <div className="cdwn">
              <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                {CASINO_STEPS.map((_, i) => (
                  <div key={i} style={{ width: 28, height: 6, borderRadius: 3, background: i < casinoStep ? G.green : i === casinoStep ? G.gold : 'rgba(255,255,255,.1)' }} />
                ))}
              </div>
              <div style={{ fontSize: 12, color: G.textSecondary, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                {t('game.stepDoneNext', { n: casinoStep })}
              </div>
              <div className="cdnum" key={casinoCountdown}>{casinoCountdown}</div>
              <div style={{ fontSize: 13, color: G.textSecondary }}>
                {t('game.stepNext', { n: casinoStep + 1, decks: getCasinoStepConfig(casinoStep).decks, tl: getCasinoStepConfig(casinoStep).timeLimit })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Countdown screen
    if (gameState === 'countdown') {
      return (
        <div className="r"><style>{css}</style>
          <div className="gm">
            <div className="cdwn">
              {isCasino && (
                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                  {CASINO_STEPS.map((_, i) => (
                    <div key={i} style={{ width: 28, height: 6, borderRadius: 3, background: i < casinoStep ? G.green : i === casinoStep ? G.gold : 'rgba(255,255,255,.1)' }} />
                  ))}
                </div>
              )}
              <div style={{ fontSize: 12, color: G.textSecondary, letterSpacing: '.1em', textTransform: 'uppercase' }}>
                {isCasino ? t('game.countdownCasino', { n: casinoStep + 1 }) : gameModeRef.current === 'daily' ? t('modeName.daily') : gameModeRef.current === 'promo' ? t('game.countdownPromo') : gameModeRef.current === 'placement' ? t('game.countdownPlacement', { n: save.placementGames + 1, total: PLACEMENT_TOTAL }) : gameModeRef.current === 'training' ? t('game.countdownTraining') : t('game.countdownRanked')}
              </div>
              <div className="cdnum" key={countdown}>{countdown > 0 ? countdown : t('game.go')}</div>
              <div style={{ fontSize: 12, color: G.textSecondary }}>{t('game.cardsTime', { cards: deck.length, tl })}</div>
            </div>
          </div>
        </div>
      );
    }

    // Finished screen
    if (gameState === 'finished') {
      const isPlace = gameModeRef.current === 'placement';
      const finalTimeSec = finalTime / 1000;

      return (
        <div className="r"><style>{css}</style>
          <div className="gm" style={{ padding: 0 }}>
            <div style={{ padding: '18px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button className="back" onClick={() => { snd(playClick); goBack(); }}><ChevronLeft size={13} /> {t('common.menu')}</button>
              <div style={{ fontSize: 12, color: G.textSecondary }}>{finalTimeSec.toFixed(1)}s / {tl}s</div>
            </div>

            {/* Input phase — no ghost card, keyboard in natural flow */}
            {!showResult && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 24px 32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', width: '100%', maxWidth: 280 }}>
                  <div style={{ fontSize: 11, color: G.textSecondary, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>{t('game.countQuestion')}</div>
                  <div className="ans" style={{ userSelect: 'none' }}>
                    {userAnswer === '' || userAnswer === '-' ? <span style={{ color: G.goldDark }}>?</span> : userAnswer}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, width: '100%' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
                      <KpKey key={d} onClick={() => ansPress(String(d))}>{d}</KpKey>
                    ))}
                    <KpKey alt onClick={ansToggleSign}>−</KpKey>
                    <KpKey onClick={() => ansPress('0')}>0</KpKey>
                    <KpKey alt onClick={ansBack}>⌫</KpKey>
                  </div>
                  <button className="lbtn" style={{ width: '100%' }} onClick={checkAnswer} disabled={userAnswer === '' || userAnswer === '-'}>{t('common.validate')}</button>
                </div>
              </div>
            )}

            {/* Result phase — ghost card background + absolute content overlay */}
            {showResult && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', gap: 20 }}>
              {currentCard && (
                <div style={{ opacity: .12, pointerEvents: 'none' }}>
                  <CasinoCard rank={currentCard.rank} suit={currentCard.suit} suitName={currentCard.suitName} skin={save.activeSkin} />
                </div>
              )}

              <div style={{ position: 'absolute', textAlign: 'center', width: '100%', padding: '0 24px' }}>
                  <div style={{ textAlign: 'center', maxWidth: 300, margin: '0 auto' }}>
                    <div className={isCorrect ? 'rc' : 'rw'}>{isCorrect ? '✓' : '✗'}</div>
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: 22, marginTop: 8, marginBottom: 4 }}>
                      {isCorrect ? t('game.perfect') : t('game.wasCount', { count: runningCount })}
                    </div>
                    <div style={{ fontSize: 12, color: G.textSecondary, marginBottom: 14 }}>
                      {t('game.resultStats', { time: finalTimeSec.toFixed(1), tl, decks: isDaily ? (dailyRef.current?.decks ?? 1) : (rankUsedRef.current || { decks: trainDecks }).decks })}
                    </div>

                    {/* MMR delta — promotion (999) / relégation (-998) / variation normale */}
                    {isRanked && !isPlace && mmrDelta !== 0 && (
                      <div style={{ marginBottom: 12, padding: '8px 16px', background: mmrDelta === 999 ? 'rgba(201,162,75,.12)' : mmrDelta > 0 ? 'rgba(39,174,96,.1)' : 'rgba(192,57,43,.1)', border: `1px solid ${mmrDelta === 999 ? G.borderGold : mmrDelta > 0 ? 'rgba(39,174,96,.3)' : 'rgba(192,57,43,.3)'}`, borderRadius: 8 }}>
                        {mmrDelta === 999
                          ? <span style={{ color: G.gold, fontFamily: 'Cinzel, serif', fontSize: 16, fontWeight: 700 }}>{t('game.promotion')} → {rankLabel()}</span>
                          : mmrDelta === -998
                          ? <span style={{ color: G.red, fontFamily: 'Cinzel, serif', fontSize: 16, fontWeight: 700 }}>{t('game.demotion')} → {rankLabel()}</span>
                          : <span style={{ color: mmrDelta > 0 ? G.green : G.red, fontSize: 15, fontWeight: 700 }}>{t('game.mmrDelta', { delta: mmrDelta })}</span>}
                      </div>
                    )}

                    {isPlace && (() => {
                      const gamesPlayed = save.placementGames; // already incremented by applyMMRChange
                      const isDone = save.placementDone; // patched synchronously by applyMMRChange before this renders
                      const nextSlot = isDone ? null : nextPlacementSlot(save.placementHistory || []);
                      return (
                        <div style={{ marginBottom: 12, background: 'rgba(45,212,191,.08)', border: '1px solid rgba(45,212,191,.2)', borderRadius: 8, padding: '10px 12px', fontSize: 12 }}>
                          {isDone ? (
                            <>
                              <div style={{ color: '#2dd4bf', fontWeight: 700, marginBottom: 3, fontSize: 13 }}>{t('game.placementDoneTitle')}</div>
                              <div style={{ color: G.textPrimary }}>{t('game.startRankPre')}<strong style={{ color: RANKS_DEF[save.rankId - 1]?.color || G.gold }}>{RANKS_DEF[save.rankId - 1]?.name}</strong></div>
                              {save.mmr > 0 && <div style={{ color: G.textSecondary, marginTop: 2 }}>{t('game.startMmr', { mmr: save.mmr })}</div>}
                              {save.placementWins === PLACEMENT_GATES.length && (
                                <div style={{ color: G.gold, marginTop: 4, fontWeight: 600 }}>{t('game.architectWin')}</div>
                              )}
                            </>
                          ) : nextSlot ? (
                            <>
                              <div style={{ color: isCorrect ? G.green : G.red, fontWeight: 700, marginBottom: 4 }}>
                                {isCorrect ? t('rankedConfig.winLabel') : t('rankedConfig.lossLabel')}
                              </div>
                              <div style={{ color: G.textPrimary, marginBottom: 2 }}>
                                {t('game.nextPre')}<strong style={{ color: nextSlot.type === 'recovery' ? '#d4813a' : '#2dd4bf' }}>{slotLabel(nextSlot)}</strong>
                                {nextSlot.type === 'recovery' && <span style={{ color: '#d4813a' }}>{t('game.recoveryParen')}</span>}
                              </div>
                              <div style={{ color: G.textSecondary }}>{t('game.placementStats', { decks: nextSlot.decks, pen: nextSlot.penetration, spc: nextSlot.secPerCard, tl: nextSlot.timeLimit })}</div>
                              <div style={{ color: G.textSecondary, marginTop: 3 }}>{t('game.gamesPlayed', { played: gamesPlayed, total: PLACEMENT_TOTAL })}</div>
                            </>
                          ) : null}
                        </div>
                      );
                    })()}

                    {isCorrect && earnedCoins > 0 && (
                      <div style={{ color: G.textSecondary, fontSize: 13, marginBottom: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 5 }}>{t('game.coinsEarned', { coins: earnedCoins })}<Coin size={13} /></div>
                    )}

                    {/* Défi du jour : score + streak + reviens demain */}
                    {isDaily && showResult && save.daily?.lastResult && (() => {
                      const lr = save.daily.lastResult;
                      return (
                        <div style={{ marginBottom: 12, background: 'rgba(201,162,75,.08)', border: `1px solid ${G.borderGold}`, borderRadius: 8, padding: '12px 14px' }}>
                          {lr.special && <div style={{ fontSize: 11, color: G.gold, textAlign: 'center', marginBottom: 6, letterSpacing: '.06em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}><Sparkles size={11} /> {t('game.dailySpecial')}</div>}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                            <span style={{ fontSize: 12, color: G.textSecondary }}>{t('game.dailyScore')}</span>
                            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 22, fontWeight: 700, color: lr.score >= 0 ? G.goldLight : G.red }}>{lr.score}</span>
                          </div>
                          <div style={{ fontSize: 12, color: lr.won ? G.green : G.red, textAlign: 'center', marginBottom: 4 }}>
                            {lr.won ? t('game.dailyStreakKept', { n: save.daily.streak }) : t('game.dailyStreakLost')}
                          </div>
                          <div style={{ fontSize: 11, color: G.textSecondary, textAlign: 'center' }}>{t('game.dailyComeBack')}</div>
                        </div>
                      );
                    })()}

                    {/* Casino: show failure state or waiting for auto-advance */}
                    {isCasino && showResult && (
                      <div style={{ marginBottom: 12 }}>
                        {!isCorrect ? (
                          <div style={{ background: 'rgba(192,57,43,.1)', border: '1px solid rgba(192,57,43,.3)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#e87a6a', marginBottom: 10 }}>
                            {t('game.casinoFail')}
                          </div>
                        ) : casinoStep + 1 < CASINO_STEPS.length ? (
                          <div style={{ background: 'rgba(39,174,96,.08)', border: '1px solid rgba(39,174,96,.25)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: G.green }}>
                            {t('game.casinoStepOk', { n: casinoStep + 1, next: casinoCountdown ?? '...' })}
                          </div>
                        ) : (
                          <div style={{ background: 'rgba(201,162,75,.1)', border: `1px solid ${G.borderGold}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: G.gold, fontWeight: 700 }}>
                            {t('game.casinoDone')}
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={{ flex: 1, padding: '11px 0', background: 'rgba(255,255,255,.04)', border: `1px solid ${G.border}`, borderRadius: 8, color: G.textSecondary, cursor: 'pointer', fontSize: 13 }} onClick={() => { snd(playClick); goBack(); }}>{t('common.menu')}</button>
                      {!isCasino && !isDaily && <button className="lbtn" style={{ flex: 2, marginTop: 0, padding: 11 }} onClick={() => { snd(playClick); playAgain(); }}>{t('common.replay')}</button>}
                      {isCasino && !isCorrect && <button className="lbtn red" style={{ flex: 2, marginTop: 0, padding: 11 }} onClick={() => { snd(playClick); startCasinoChallenge(); }}>{t('common.restart')}</button>}
                    </div>
                  </div>
              </div>
            </div>
          )}
          </div>
        </div>
      );
    }

    // Playing / paused
    return (
      <div className="r"><style>{css}</style>
        <div className="gm">
          {/* HUD */}
          <div className="ghud">
            <div className="ghbtn" onClick={handleXButton}>
              <X size={15} />
            </div>
            <div className="gtimer" style={{ color: timerColor }}>{timeDisplay}s</div>
            <div className="gctr">
              <strong>{currentIndex}</strong>/ {deck.length}
            </div>
            {gameModeRef.current === 'training' && (
              <div className="ghbtn" onClick={() => { snd(playClick); setShowCount(p => { const n = !p; if (n) countWasShownRef.current = true; return n; }); }}>
                {showCount ? <Eye size={15} /> : <EyeOff size={15} />}
              </div>
            )}
            {gameModeRef.current === 'training' && (
              <div className="ghbtn" onClick={togglePause}>
                {gameState === 'paused' ? <Play size={15} /> : <Pause size={15} />}
              </div>
            )}
            <div className="ghbtn" onClick={() => patchSave({ soundEnabled: save.soundEnabled === false })} title="Son">
              {save.soundEnabled !== false ? <Volume2 size={15} /> : <VolumeX size={15} color={G.textSecondary} />}
            </div>
          </div>

          {/* Progress */}
          <div style={{ height: 2, background: 'rgba(255,255,255,.04)' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg,${G.goldDark},${timerColor})`, transition: 'width .12s' }} />
          </div>

          {/* Ranked info bar */}
          {(isRanked || isCasino || isDaily) && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 18px', background: 'rgba(0,0,0,.2)', fontSize: 11, color: G.textSecondary }}>
              {isCasino
                ? <><span>{t('game.infoCasino', { n: casinoStep + 1 })}</span><span style={{ display: 'flex', gap: 4 }}>{CASINO_STEPS.map((_, i) => <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < casinoStep ? G.green : i === casinoStep ? G.gold : 'rgba(255,255,255,.15)', display: 'inline-block' }} />)}</span></>
                : <><span>{isDaily ? t('modeName.daily') : gameModeRef.current === 'promo' ? t('game.infoPromo') : gameModeRef.current === 'placement' ? t('game.infoPlacement', { n: save.placementGames + 1, total: PLACEMENT_TOTAL }) : t('game.infoRank', { rank: currentRank.name })}</span><span style={{ color: timePct > 0.85 ? G.red : G.textSecondary }}>{t('game.limit', { tl })}</span></>
              }
            </div>
          )}

          {/* Card */}
          <div className="gstage">
            {currentCard && (
              <CasinoCard rank={currentCard.rank} suit={currentCard.suit} suitName={currentCard.suitName} skin={save.activeSkin} flash={cardFlash} />
            )}
            {gameState === 'paused' && !showAbandon && (
              <div className="gpaused">
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 26, fontWeight: 700, color: G.goldLight }}>{t('game.pause')}</div>
                <div style={{ fontSize: 12, color: G.textSecondary }}>{t('game.pauseHint')}</div>
              </div>
            )}
            {showCount && gameModeRef.current === 'training' && (
              <div className="gcrev">{t('game.count', { value: runningCount > 0 ? `+${runningCount}` : runningCount })}</div>
            )}
          </div>
        </div>

        {/* ABANDON DIALOG (ranked only) */}
        {showAbandon && (
          <div className="abdlg">
            <div className="abdbox">
              <AlertTriangle size={32} color={G.red} style={{ margin: '0 auto 12px' }} />
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 19, fontWeight: 700, marginBottom: 6, color: G.textPrimary }}>{t('game.abandonTitle')}</div>
              <div style={{ fontSize: 13, color: G.textSecondary, marginBottom: 20, lineHeight: 1.5 }}>
                {t('game.abandonBody1')}<br />
                <span style={{ color: G.red, fontWeight: 600 }}>{t('game.abandonMmr')}</span>{t('game.abandonBody2')}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={{ flex: 1, padding: '12px 0', background: 'rgba(255,255,255,.05)', border: `1px solid ${G.border}`, borderRadius: 9, color: G.textPrimary, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                  onClick={() => { snd(playClick); setShowAbandon(false); togglePause(); }}>{t('common.continue')}</button>
                <button style={{ flex: 1, padding: '12px 0', background: 'rgba(192,57,43,.15)', border: `1px solid rgba(192,57,43,.4)`, borderRadius: 9, color: G.red, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                  onClick={() => { snd(playClick); doAbandon(); }}>{t('game.abandon')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
