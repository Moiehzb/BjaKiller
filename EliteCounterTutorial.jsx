import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, Check, Play, BookOpen, DoorOpen, Flame, Lock } from 'lucide-react';
import { makeT, DEFAULT_LANG } from './i18n';
import { initAudio, playClick, playCorrect, playWrong, playChip, playGo } from './src/sounds.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Design tokens — exact mirror of EliteCounter.jsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const G = {
  bgDeep: '#0d0a1a', bgCard: '#13102a', bgPanel: '#1a1535',
  border: '#2e2654', borderGold: '#4a3a1d',
  gold: '#c9a24b', goldLight: '#e8c97a', goldDark: '#8a6820',
  amber: '#d4813a', amberLight: '#f0a860',
  teal: '#2dd4bf', tealDark: '#0f766e',
  textPrimary: '#f0e6cc', textSecondary: '#a896c8', textMuted: '#5c4f7a',
  purpleMid: '#2d2060',
  red: '#c0392b', green: '#27ae60',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CSS — injecté via <style> comme dans le fichier principal
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const tutCss = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');

  .tov { position:fixed; inset:0; z-index:200; background:radial-gradient(ellipse at top,#1a1535,${G.bgDeep} 72%); overflow-y:auto; font-family:'EB Garamond',serif; color:${G.textPrimary}; -webkit-font-smoothing:antialiased; }
  .tov-wrap { max-width:480px; margin:0 auto; padding:0 16px 56px; min-height:100vh; display:flex; flex-direction:column; }

  /* Header */
  .tov-hdr { display:flex; align-items:center; justify-content:space-between; padding:14px 0 10px; position:sticky; top:0; z-index:5; background:radial-gradient(ellipse at top,#1a1535,${G.bgDeep} 72%); }
  .tdots { display:flex; gap:6px; }
  .tdot { width:6px; height:6px; border-radius:50%; background:${G.border}; transition:all .3s ease; }
  .tdot.active { width:22px; border-radius:3px; background:${G.gold}; }
  .tdot.past { background:${G.goldDark}; }
  .tskip { background:rgba(255,255,255,.04); border:1px solid ${G.border}; border-radius:20px; padding:5px 14px; color:${G.textSecondary}; font-size:12px; font-family:'EB Garamond',serif; cursor:pointer; transition:all .15s; display:flex; align-items:center; gap:4px; }
  .tskip:hover { border-color:${G.goldDark}; color:${G.gold}; }

  /* Step wrappers with directional animation */
  .tstep-fwd { flex:1; display:flex; flex-direction:column; padding-top:14px; animation:tInFwd .32s ease forwards; }
  .tstep-bwd { flex:1; display:flex; flex-direction:column; padding-top:14px; animation:tInBwd .32s ease forwards; }
  @keyframes tInFwd { from{opacity:0;transform:translateY(18px);} to{opacity:1;transform:translateY(0);} }
  @keyframes tInBwd { from{opacity:0;transform:translateY(-18px);} to{opacity:1;transform:translateY(0);} }

  /* Typography */
  .tlabel { font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:${G.textSecondary}; display:flex; align-items:center; gap:8px; margin-bottom:12px; }
  .tlabel::after { content:''; flex:1; height:1px; background:${G.border}; }
  .th1 { font-family:'Cinzel',serif; font-size:27px; font-weight:700; line-height:1.2; color:${G.textPrimary}; margin-bottom:10px; }
  .tp { font-size:13px; color:${G.textSecondary}; line-height:1.65; margin-bottom:14px; }

  /* Playing card */
  .tcard { background:#f7f4eb; border:1.5px solid #cfc8b4; border-radius:9px; display:flex; flex-direction:column; align-items:flex-start; justify-content:space-between; font-family:'Cinzel',serif; font-weight:700; box-shadow:0 3px 12px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.9); user-select:none; flex-shrink:0; overflow:hidden; position:relative; }
  .tcard.sm  { width:36px; height:52px; padding:3px 4px; font-size:12px; border-radius:7px; }
  .tcard.md  { width:56px; height:78px; padding:5px 7px; font-size:18px; }
  .tcard.lg  { width:72px; height:102px; padding:7px 9px; font-size:24px; }
  .tcard.xl  { width:90px; height:128px; padding:9px 11px; font-size:30px; }
  .tcard.red-c { color:#c53030; }
  .tcard.blk-c { color:#1a1a1a; }
  .tctop { display:flex; flex-direction:column; align-items:center; line-height:1.1; }
  .tcsuit { font-size:.62em; line-height:1; }
  .tcbot { position:absolute; bottom:3px; right:4px; transform:rotate(180deg); display:flex; flex-direction:column; align-items:center; line-height:1.1; }

  /* Welcome logo */
  .tlogo { font-family:'Cinzel',serif; font-size:23px; font-weight:700; letter-spacing:.12em; background:linear-gradient(135deg,${G.goldLight},${G.gold},#8a6820); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; margin-bottom:3px; }
  .tlogsub { font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:${G.textSecondary}; }

  /* Card fan */
  .tfan { position:relative; width:230px; height:112px; margin:22px auto 26px; flex-shrink:0; }
  .tfcard { position:absolute; top:0; left:50%; transform-origin:bottom center; }
  .tfc0 { margin-left:-62px; transform:rotate(-19deg) translateY(10px); }
  .tfc1 { margin-left:-44px; transform:rotate(-9deg) translateY(-4px); }
  .tfc2 { margin-left:-28px; transform:rotate(0deg) translateY(-9px); }
  .tfc3 { margin-left:-12px; transform:rotate(9deg) translateY(-4px); }
  .tfc4 { margin-left:5px;   transform:rotate(19deg) translateY(10px); }

  /* Hi-Lo groups */
  .hilo-row { background:${G.bgPanel}; border:1px solid ${G.border}; border-radius:12px; padding:13px 15px; margin-bottom:9px; display:flex; align-items:center; gap:13px; }
  .hilo-row.plus  { border-left:3px solid ${G.green}; }
  .hilo-row.zero  { border-left:3px solid ${G.textSecondary}; }
  .hilo-row.minus { border-left:3px solid ${G.red}; }
  .hilo-cards { display:flex; gap:5px; flex:1; flex-wrap:wrap; align-items:center; }
  .hilo-info { display:flex; flex-direction:column; align-items:flex-end; flex-shrink:0; }
  .hilo-val { font-family:'Cinzel',serif; font-size:30px; font-weight:700; line-height:1; }
  .hilo-val.plus  { color:${G.green}; }
  .hilo-val.zero  { color:${G.textSecondary}; }
  .hilo-val.minus { color:${G.red}; }
  .hilo-sub { font-size:10px; color:${G.textSecondary}; text-transform:uppercase; letter-spacing:.07em; margin-top:2px; }

  /* Tip box */
  .tip-gold { background:rgba(201,162,75,.07); border:1px solid ${G.borderGold}; border-radius:10px; padding:12px 14px; font-size:12px; color:${G.gold}; line-height:1.6; margin-top:8px; }
  .tip-gold strong { color:${G.goldLight}; display:block; margin-bottom:3px; font-size:10px; letter-spacing:.08em; text-transform:uppercase; }

  /* Running count box */
  .qcount-box { background:${G.bgPanel}; border:1px solid ${G.border}; border-radius:12px; padding:12px 16px; text-align:center; margin-bottom:14px; }
  .qcount-lbl { font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:${G.textSecondary}; margin-bottom:4px; }
  .qcount-val { font-family:'Cinzel',serif; font-size:50px; font-weight:700; line-height:1; transition:color .18s; }
  .qcount-val.pos { color:${G.green}; }
  .qcount-val.neg { color:${G.red}; }
  .qcount-val.zer { color:${G.textSecondary}; }

  /* Quiz progress dots */
  .qdots { display:flex; gap:6px; justify-content:center; margin-bottom:12px; }
  .qdot { width:8px; height:8px; border-radius:50%; background:${G.border}; transition:all .2s; }
  .qdot.ok  { background:${G.green}; }
  .qdot.err { background:${G.red}; }
  .qdot.cur { background:${G.gold}; width:22px; border-radius:4px; }

  /* Quiz card zone */
  .quiz-card-zone { display:flex; align-items:center; justify-content:center; min-height:144px; margin-bottom:8px; }
  .quiz-fb { height:22px; text-align:center; font-size:13px; font-weight:600; margin-bottom:10px; transition:all .15s; }
  .quiz-fb.ok  { color:${G.green}; }
  .quiz-fb.err { color:${G.red}; }

  /* Answer buttons */
  .ans-wrap { display:flex; gap:10px; justify-content:center; margin-bottom:12px; }
  .ans-btn { width:80px; height:80px; border-radius:14px; border:2px solid ${G.border}; background:${G.bgPanel}; cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; transition:all .14s; font-family:'Cinzel',serif; font-weight:700; font-size:26px; color:${G.textSecondary}; -webkit-tap-highlight-color:transparent; }
  .ans-btn:hover:not(:disabled) { border-color:${G.goldDark}; color:${G.goldLight}; transform:translateY(-2px); background:rgba(201,162,75,.06); }
  .ans-btn:active:not(:disabled) { transform:scale(.93); }
  .ans-btn:disabled { cursor:default; }
  .ans-btn.aok  { border-color:${G.green}; background:rgba(39,174,96,.1); color:${G.green}; }
  .ans-btn.aerr { border-color:${G.red}; background:rgba(192,57,43,.08); color:${G.red}; }
  .albl { font-size:10px; font-family:'EB Garamond',serif; font-weight:500; letter-spacing:.05em; opacity:.55; }

  /* Card animations */
  @keyframes tDeal      { from{opacity:0;transform:translateY(-22px) scale(.88);} to{opacity:1;transform:translateY(0) scale(1);} }
  @keyframes tFlashOk   { 0%,100%{} 35%{filter:drop-shadow(0 0 18px ${G.green}) brightness(1.1);transform:scale(1.09);} }
  @keyframes tFlashErr  { 0%,100%{} 35%{filter:drop-shadow(0 0 16px ${G.red});transform:scale(.92);} }
  .t-deal    { animation:tDeal .25s cubic-bezier(.22,.8,.3,1) forwards; }
  .flash-ok  { animation:tFlashOk  .38s ease; }
  .flash-err { animation:tFlashErr .34s ease; }

  /* Score banner */
  .qscore { border-radius:12px; padding:14px 16px; margin-bottom:14px; }
  .qscore.great { background:rgba(39,174,96,.08); border:1px solid rgba(39,174,96,.25); }
  .qscore.ok    { background:rgba(201,162,75,.07); border:1px solid ${G.borderGold}; }
  .qscore.poor  { background:rgba(192,57,43,.07); border:1px solid rgba(192,57,43,.22); }
  .qscore-title { font-family:'Cinzel',serif; font-size:16px; margin-bottom:5px; }
  .qscore-desc  { font-size:12px; color:${G.textSecondary}; line-height:1.5; }

  /* Count quiz cards row */
  .cq-cards { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; min-height:88px; margin-bottom:18px; align-items:flex-end; }
  .cq-wrap { display:flex; flex-direction:column; align-items:center; gap:6px; }
  .cq-val { font-family:'Cinzel',serif; font-size:14px; font-weight:700; opacity:0; transition:opacity .38s; }
  .cq-val.vis { opacity:1; }
  .cq-val.pos { color:${G.green}; }
  .cq-val.neg { color:${G.red}; }
  .cq-val.zer { color:${G.textSecondary}; }
  .cq-empty { width:36px; height:52px; background:${G.bgPanel}; border:1px dashed ${G.border}; border-radius:7px; }

  /* Count stepper */
  .cnt-stepper { display:flex; align-items:center; justify-content:center; gap:18px; margin-bottom:14px; }
  .csb { width:54px; height:54px; border-radius:12px; background:rgba(201,162,75,.08); border:1px solid ${G.borderGold}; color:${G.gold}; font-size:28px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .13s; user-select:none; -webkit-tap-highlight-color:transparent; font-family:'Cinzel',serif; }
  .csb:hover { background:rgba(201,162,75,.16); }
  .csb:active { transform:scale(.9); }
  .cnt-num { font-family:'Cinzel',serif; font-size:56px; font-weight:700; line-height:1; min-width:90px; text-align:center; transition:color .15s; }
  .cnt-num.pos { color:${G.goldLight}; }
  .cnt-num.neg { color:${G.red}; }
  .cnt-num.zer { color:${G.textSecondary}; }

  /* Count feedback */
  .cnt-fb { border-radius:10px; padding:12px 14px; margin-bottom:12px; text-align:center; }
  .cnt-fb.ok  { background:rgba(39,174,96,.08); border:1px solid rgba(39,174,96,.25); }
  .cnt-fb.err { background:rgba(192,57,43,.07); border:1px solid rgba(192,57,43,.22); }
  .cnt-fb-title { font-family:'Cinzel',serif; font-size:15px; margin-bottom:3px; }
  .cnt-fb-desc  { font-size:12px; color:${G.textSecondary}; }

  /* Mode cards */
  .mode-card { background:${G.bgPanel}; border:1px solid ${G.border}; border-radius:12px; padding:14px 16px; margin-bottom:9px; position:relative; overflow:hidden; }
  .mode-card::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:${G.goldDark}; }
  .mode-card.hl { border-color:${G.borderGold}; background:linear-gradient(135deg,#2a2148,${G.bgPanel}); }
  .mode-card.hl::before { background:${G.gold}; }
  .mode-card.lkd { opacity:.42; }
  .mode-icon  { font-size:22px; margin-bottom:4px; }
  .mode-title { font-family:'Cinzel',serif; font-size:15px; font-weight:600; margin-bottom:3px; }
  .mode-sub   { font-size:10px; color:${G.textSecondary}; text-transform:uppercase; letter-spacing:.07em; }
  .mode-desc  { font-size:12px; color:${G.textSecondary}; line-height:1.5; margin-top:4px; }
  .mode-badge { position:absolute; right:14px; top:50%; transform:translateY(-50%); font-size:11px; padding:3px 9px; border-radius:20px; font-weight:600; letter-spacing:.04em; }
  .mode-badge.un { background:rgba(39,174,96,.12); color:${G.green}; border:1px solid rgba(39,174,96,.3); }
  .mode-badge.lk { font-size:16px; color:${G.textSecondary}; padding:2px 6px; }

  /* Ready */
  .ready-orb { width:88px; height:88px; border-radius:50%; border:2px solid ${G.borderGold}; background:rgba(201,162,75,.06); display:flex; align-items:center; justify-content:center; font-size:36px; margin:8px auto 16px; animation:orbPulse 2.5s ease infinite; }
  @keyframes orbPulse { 0%,100%{box-shadow:0 0 0 0 rgba(201,162,75,.2);} 50%{box-shadow:0 0 0 22px rgba(201,162,75,0);} }
  .chk-list { list-style:none; padding:0; margin:0 0 16px; }
  .chk-list li { display:flex; align-items:center; gap:10px; padding:9px 0; border-bottom:1px solid ${G.border}; font-size:13px; color:${G.textPrimary}; }
  .chk-list li:last-child { border-bottom:none; }
  .chk-ic { width:22px; height:22px; border-radius:50%; background:rgba(39,174,96,.12); border:1px solid rgba(39,174,96,.3); display:flex; align-items:center; justify-content:center; color:${G.green}; flex-shrink:0; }

  /* Buttons */
  .tbtn-g { width:100%; padding:16px; background:linear-gradient(135deg,#8a6820,${G.gold},#8a6820); background-size:200% 100%; border:1px solid ${G.gold}; border-radius:12px; color:#0d0a1a; font-family:'Cinzel',serif; font-size:14px; font-weight:700; letter-spacing:.12em; cursor:pointer; transition:all .3s; text-transform:uppercase; text-align:center; }
  .tbtn-g:hover { background-position:right center; box-shadow:0 0 30px rgba(201,162,75,.2); transform:translateY(-1px); }
  .tbtn-g:active { transform:none; }
  .tbtn-g:disabled { opacity:.38; cursor:default; transform:none; }
  .tbtn-o { width:100%; padding:13px; background:transparent; border:1px solid ${G.border}; border-radius:10px; color:${G.textSecondary}; font-family:'EB Garamond',serif; font-size:13px; cursor:pointer; transition:all .15s; text-align:center; margin-top:8px; }
  .tbtn-o:hover { border-color:${G.goldDark}; color:${G.gold}; }
  .tbtn-back { display:inline-flex; align-items:center; gap:5px; background:none; border:none; color:${G.textSecondary}; font-size:13px; cursor:pointer; font-family:'EB Garamond',serif; padding:0; transition:color .14s; margin-bottom:14px; }
  .tbtn-back:hover { color:${G.gold}; }

  /* "Suivant" inline button in intro phases */
  .cnt-watching-hint { text-align:center; padding:18px 0 10px; font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:${G.textSecondary}; }
`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Data
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const QUIZ_CARDS = [
  { rank: '5', suit: '♠', v:  1 },
  { rank: 'K', suit: '♥', v: -1 },
  { rank: '8', suit: '♦', v:  0 },
  { rank: 'A', suit: '♣', v: -1 },
  { rank: '3', suit: '♦', v:  1 },
  { rank: '7', suit: '♥', v:  0 },
  { rank: 'Q', suit: '♠', v: -1 },
  { rank: '4', suit: '♣', v:  1 },
];

// 2♥+1=1, 6♦+1=2, J♠-1=1, 9♣0=1, 4♥+1=2, A♦-1=1 → count: +1
const COUNT_SEQ = [
  { rank: '2', suit: '♥', v:  1 },
  { rank: '6', suit: '♦', v:  1 },
  { rank: 'J', suit: '♠', v: -1 },
  { rank: '9', suit: '♣', v:  0 },
  { rank: '4', suit: '♥', v:  1 },
  { rank: 'A', suit: '♦', v: -1 },
];
const COUNT_ANSWER = 1;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TCard — Carte de jeu minimaliste (style classique)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const TCard = ({ rank, suit, size = 'md', anim = '' }) => {
  const red = suit === '♥' || suit === '♦';
  return (
    <div className={`tcard ${size} ${red ? 'red-c' : 'blk-c'} ${anim}`}>
      <div className="tctop">
        <span>{rank}</span>
        <span className="tcsuit">{suit}</span>
      </div>
      <div className="tcbot">
        <span>{rank}</span>
        <span className="tcsuit">{suit}</span>
      </div>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ProgressDots
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ProgressDots = ({ step, total }) => (
  <div className="tdots">
    {Array.from({ length: total }, (_, i) => (
      <span
        key={i}
        className={`tdot ${i === step ? 'active' : i < step ? 'past' : ''}`}
      />
    ))}
  </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 0 — Welcome
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const WelcomeStep = ({ onNext, onSkip, t }) => {
  const FAN = [
    { rank: '3', suit: '♦' },
    { rank: '7', suit: '♣' },
    { rank: 'K', suit: '♥' },
    { rank: '5', suit: '♠' },
    { rank: 'A', suit: '♥' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: 10 }}>
      <div className="tlogo">BLACKJACK ACADEMY I</div>
      <div className="tlogsub">{t('tutorial.welcome.logoSub')}</div>

      {/* Card fan */}
      <div className="tfan">
        {FAN.map((c, i) => (
          <div key={i} className={`tfcard tfc${i}`}>
            <TCard rank={c.rank} suit={c.suit} size="md" />
          </div>
        ))}
      </div>

      <p style={{ fontSize: 14, color: G.textSecondary, lineHeight: 1.7, marginBottom: 28, maxWidth: 300 }}>
        {t('tutorial.welcome.intro')}
      </p>

      <button className="tbtn-g" style={{ maxWidth: 320 }} onClick={() => { initAudio(); playChip(); onNext(); }}>
        {t('tutorial.welcome.start')}
      </button>
      <button className="tbtn-o" style={{ maxWidth: 320 }} onClick={() => { playClick(); onSkip(); }}>
        {t('tutorial.welcome.skipKnow')}&nbsp;
        <ChevronRight size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />
      </button>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 1 — Hi-Lo : la théorie
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const HiLoLearnStep = ({ onNext, onBack, t }) => {
  const GROUPS = [
    {
      cls: 'plus', val: '+1', label: t('tutorial.hilo.groupLow'),
      cards: [
        { rank: '2', suit: '♥' }, { rank: '3', suit: '♠' },
        { rank: '4', suit: '♦' }, { rank: '5', suit: '♣' }, { rank: '6', suit: '♥' },
      ],
    },
    {
      cls: 'zero', val: '0', label: t('tutorial.hilo.groupNeutral'),
      cards: [
        { rank: '7', suit: '♦' }, { rank: '8', suit: '♠' }, { rank: '9', suit: '♣' },
      ],
    },
    {
      cls: 'minus', val: '−1', label: t('tutorial.hilo.groupHigh'),
      cards: [
        { rank: '10', suit: '♣' }, { rank: 'J', suit: '♠' },
        { rank: 'Q', suit: '♦' }, { rank: 'K', suit: '♥' }, { rank: 'A', suit: '♣' },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <button className="tbtn-back" onClick={() => { playClick(); onBack(); }}>
        <ChevronLeft size={14} /> {t('common.back')}
      </button>

      <div className="tlabel">{t('tutorial.hilo.label')}</div>
      <div className="th1">{t('tutorial.hilo.h1l1')}<br />{t('tutorial.hilo.h1l2')}</div>
      <p className="tp">
        {t('tutorial.hilo.p')}
      </p>

      {GROUPS.map((g) => (
        <div key={g.cls} className={`hilo-row ${g.cls}`}>
          <div className="hilo-cards">
            {g.cards.map((c, i) => (
              <TCard key={i} rank={c.rank} suit={c.suit} size="sm" />
            ))}
          </div>
          <div className="hilo-info">
            <div className={`hilo-val ${g.cls}`}>{g.val}</div>
            <div className="hilo-sub">{g.label}</div>
          </div>
        </div>
      ))}

      <div className="tip-gold">
        <strong>{t('tutorial.hilo.tipTitle')}</strong>
        {t('tutorial.hilo.tipBody')}
      </div>

      <div style={{ flex: 1 }} />
      <button className="tbtn-g" style={{ marginTop: 20 }} onClick={() => { playClick(); onNext(); }}>
        {t('tutorial.hilo.next')}
      </button>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 2 — Quiz interactif : identification carte par carte
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const HiLoRefBar = () => (
  <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
    {[
      { range: '2 – 6',  val: '+1', color: G.green },
      { range: '7 – 9',  val: '0',  color: G.textSecondary },
      { range: '10 – A', val: '−1', color: G.red },
    ].map((r) => (
      <div key={r.range} style={{ flex: 1, background: G.bgPanel, border: `1px solid ${G.border}`, borderRadius: 8, padding: '7px 4px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 17, fontWeight: 700, color: r.color, lineHeight: 1 }}>{r.val}</div>
        <div style={{ fontSize: 10, color: G.textSecondary, marginTop: 3, letterSpacing: '.04em' }}>{r.range}</div>
      </div>
    ))}
  </div>
);

const HiLoQuizStep = ({ onNext, onBack, t }) => {
  const [idx, setIdx]             = useState(0);
  const [results, setResults]     = useState([]);      // [true/false …]
  const [runCount, setRunCount]   = useState(0);
  const [answered, setAnswered]   = useState(null);    // { val, correct }
  const [flashCls, setFlashCls]   = useState('');
  const [showResult, setShowResult] = useState(false);
  const timerRef = useRef(null);

  // Cleanup on unmount (user taps back while timer is pending)
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const card = QUIZ_CARDS[idx];
  const score = results.filter(Boolean).length;
  const countCls = runCount > 0 ? 'pos' : runCount < 0 ? 'neg' : 'zer';

  const advanceNext = () => {
    clearTimeout(timerRef.current);
    setFlashCls('');
    setAnswered(null);
    if (idx < QUIZ_CARDS.length - 1) {
      setIdx((i) => i + 1);
    } else {
      setShowResult(true);
    }
  };

  const answerCard = (val) => {
    if (answered) return;
    const correct = val === card.v;

    setAnswered({ val, correct });
    setResults((r) => [...r, correct]);
    setRunCount((c) => c + card.v); // always apply the correct value
    setFlashCls(correct ? 'flash-ok' : 'flash-err');

    if (correct) {
      playCorrect(0);
      timerRef.current = setTimeout(advanceNext, 960);
    } else {
      playWrong();
    }
  };

  const resetQuiz = () => {
    clearTimeout(timerRef.current);
    setIdx(0);
    setResults([]);
    setRunCount(0);
    setAnswered(null);
    setFlashCls('');
    setShowResult(false);
  };

  // ── Results screen ────────────────────────────────────────────
  if (showResult) {
    const bannerCls  = score >= 7 ? 'great' : score >= 5 ? 'ok' : 'poor';
    const bannerIcon = score === 8 ? '🏆' : score >= 6 ? '✅' : score >= 4 ? '🎯' : '💪';
    const bannerHead = score === 8
      ? t('tutorial.quiz.headPerfect')
      : score >= 6 ? t('tutorial.quiz.headGood')
      : score >= 4 ? t('tutorial.quiz.headOk')
      : t('tutorial.quiz.headPoor');
    const bannerBody = score >= 6
      ? t('tutorial.quiz.bodyGood')
      : t('tutorial.quiz.bodyPoor');

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <button className="tbtn-back" onClick={() => { playClick(); onBack(); }}>
          <ChevronLeft size={14} /> {t('common.back')}
        </button>

        <div className="tlabel">{t('tutorial.quiz.resultsLabel')}</div>
        <div className="th1">{t('tutorial.quiz.score', { score })}</div>

        <div className={`qscore ${bannerCls}`}>
          <div className="qscore-title" style={{ color: bannerCls === 'great' ? G.green : bannerCls === 'ok' ? G.gold : G.red }}>
            {bannerIcon} {bannerHead}
          </div>
          <div className="qscore-desc">{bannerBody}</div>
        </div>

        <div className="qcount-box">
          <div className="qcount-lbl">{t('tutorial.quiz.finalCount')}</div>
          <div className={`qcount-val ${countCls}`}>
            {runCount > 0 ? `+${runCount}` : runCount}
          </div>
        </div>

        {/* Priorité inversée si erreur(s) : Recommencer devient le CTA principal */}
        {score < QUIZ_CARDS.length ? (
          <>
            <button className="tbtn-g" onClick={() => { playClick(); resetQuiz(); }}>{t('tutorial.quiz.restart')}</button>
            <button className="tbtn-o" onClick={() => { playClick(); onNext(); }}>{t('tutorial.quiz.continueAnyway')}</button>
          </>
        ) : (
          <button className="tbtn-g" onClick={() => { playClick(); onNext(); }}>{t('tutorial.quiz.continue')}</button>
        )}

        {/* Fiche mémo — uniquement si des erreurs ont été faites */}
        {score < QUIZ_CARDS.length && (
          <div style={{ marginTop: 16, background: G.bgPanel, border: `1px solid ${G.border}`, borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: G.textSecondary, marginBottom: 10 }}>
              {t('tutorial.quiz.memoTitle')}
            </div>
            {[
              { range: '2 – 6',  val: '+1', cls: 'plus',  label: t('tutorial.quiz.memoLow')  },
              { range: '7 – 9',  val: '0',  cls: 'zero',  label: t('tutorial.quiz.memoNeutral') },
              { range: '10 – A', val: '−1', cls: 'minus', label: t('tutorial.quiz.memoHigh')  },
            ].map((r) => (
              <div key={r.cls} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: r.cls !== 'minus' ? `1px solid ${G.border}` : 'none' }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 600, color: G.textPrimary }}>{r.range}</span>
                <span style={{ fontSize: 11, color: G.textSecondary, textTransform: 'uppercase', letterSpacing: '.06em' }}>{r.label}</span>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: r.cls === 'plus' ? G.green : r.cls === 'zero' ? G.textSecondary : G.red }}>{r.val}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Quiz screen ───────────────────────────────────────────────
  const ANSWERS = [
    { val: -1, symbol: '−1', label: t('tutorial.quiz.ansHigh') },
    { val:  0, symbol:  '0', label: t('tutorial.quiz.ansNeutral') },
    { val:  1, symbol: '+1', label: t('tutorial.quiz.ansLow') },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <button className="tbtn-back" onClick={() => { playClick(); onBack(); }}>
        <ChevronLeft size={14} /> {t('common.back')}
      </button>

      <div className="tlabel">{t('tutorial.quiz.identLabel')}</div>

      {/* Running count */}
      <div className="qcount-box">
        <div className="qcount-lbl">{t('tutorial.quiz.runningCount')}</div>
        <div className={`qcount-val ${countCls}`}>
          {runCount > 0 ? `+${runCount}` : runCount}
        </div>
      </div>

      {/* Progress dots */}
      <div className="qdots">
        {QUIZ_CARDS.map((_, i) => {
          let cls = '';
          if (i < results.length) cls = results[i] ? 'ok' : 'err';
          else if (i === idx) cls = 'cur';
          return <span key={i} className={`qdot ${cls}`} />;
        })}
      </div>

      {/* Rappel Hi-Lo */}
      <HiLoRefBar />

      {/* Card — the key on the wrapper remounts on each new card → t-deal replays */}
      <div className="quiz-card-zone">
        <div className={flashCls}>
          <div key={idx}>
            <TCard rank={card.rank} suit={card.suit} size="xl" anim="t-deal" />
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div className={`quiz-fb ${answered ? (answered.correct ? 'ok' : 'err') : ''}`}>
        {answered
          ? answered.correct
            ? t('tutorial.quiz.correctFb', { rank: card.rank, val: `${card.v > 0 ? '+' : ''}${card.v}` })
            : t('tutorial.quiz.wrongFb', { val: `${card.v > 0 ? '+' : ''}${card.v}`, type: card.v === 1 ? t('tutorial.quiz.typeLow') : card.v === 0 ? t('tutorial.quiz.typeNeutral') : t('tutorial.quiz.typeHigh') })
          : t('tutorial.quiz.question')
        }
      </div>

      {/* Answer buttons */}
      <div className="ans-wrap">
        {ANSWERS.map(({ val, symbol, label }) => {
          let cls = '';
          if (answered) {
            if (val === card.v) cls = 'aok';
            else if (val === answered.val) cls = 'aerr';
          }
          return (
            <button
              key={val}
              className={`ans-btn ${cls}`}
              onClick={() => answerCard(val)}
              disabled={!!answered}
            >
              {symbol}
              <span className="albl">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Bouton "Suivant" affiché seulement après une mauvaise réponse */}
      {answered && !answered.correct && (
        <button className="tbtn-g" style={{ marginTop: 6 }} onClick={() => { playClick(); advanceNext(); }}>
          {t('tutorial.quiz.nextCard')}
        </button>
      )}

      <div style={{ textAlign: 'center', fontSize: 11, color: G.textSecondary, marginTop: 8 }}>
        {t('tutorial.quiz.cardProgress', { n: idx + 1, total: QUIZ_CARDS.length })}
      </div>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 3 — Quiz de comptage : 6 cartes en séquence
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CountQuizStep = ({ onNext, onBack, t }) => {
  // phase: 'intro' → 'watching' → 'input' → 'done'
  const [phase, setPhase]       = useState('intro');
  const [dealIdx, setDealIdx]   = useState(-1);     // index of last dealt card (-1 = aucune)
  const [showVals, setShowVals] = useState(false);  // afficher les +1/0/-1 sous chaque carte
  const [guess, setGuess]       = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState(null);   // null | 'correct' | 'wrong-try' | 'wrong-final'
  const dealRef  = useRef(null);
  const phaseRef = useRef(null);
  const fbRef    = useRef(null);

  useEffect(() => () => {
    clearTimeout(dealRef.current);
    clearTimeout(phaseRef.current);
    clearTimeout(fbRef.current);
  }, []);

  // Auto-deal cards one by one
  useEffect(() => {
    if (phase !== 'watching' || dealIdx < 0) return;

    if (dealIdx < COUNT_SEQ.length - 1) {
      dealRef.current = setTimeout(() => setDealIdx((i) => i + 1), 870);
    } else {
      // Last card dealt → pause → input (valeurs révélées seulement après une erreur)
      dealRef.current = setTimeout(() => {
        phaseRef.current = setTimeout(() => setPhase('input'), 700);
      }, 750);
    }
    return () => clearTimeout(dealRef.current);
  }, [phase, dealIdx]);

  const startWatching = () => {
    setPhase('watching');
    setDealIdx(0);
  };

  const validate = () => {
    if (guess === COUNT_ANSWER) {
      playCorrect(0);
      setFeedback('correct');
      setPhase('done');
    } else {
      playWrong();
      const next = attempts + 1;
      setAttempts(next);
      setShowVals(true);
      if (next >= 2) {
        setFeedback('wrong-final');
        setPhase('done');
      } else {
        setFeedback('wrong-try');
        fbRef.current = setTimeout(() => setFeedback(null), 1600);
      }
    }
  };

  const countCls = guess > 0 ? 'pos' : guess < 0 ? 'neg' : 'zer';

  // ── Intro ─────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <button className="tbtn-back" onClick={() => { playClick(); onBack(); }}>
          <ChevronLeft size={14} /> {t('common.back')}
        </button>

        <div className="tlabel">{t('tutorial.count.label')}</div>
        <div className="th1">{t('tutorial.count.introH1l1')}<br />{t('tutorial.count.introH1l2')}</div>
        <p className="tp">
          {t('tutorial.count.introP')}
        </p>

        <div className="tip-gold">
          <strong>{t('tutorial.count.tipTitle')}</strong>
          {t('tutorial.count.tipBody')}
        </div>

        <div style={{ flex: 1 }} />
        <button className="tbtn-g" style={{ marginTop: 24 }} onClick={() => { playChip(); startWatching(); }}>
          <Play size={15} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
          {t('tutorial.count.see6')}
        </button>
      </div>
    );
  }

  // ── Cards row (watching + input + done) ───────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <button className="tbtn-back" onClick={() => { playClick(); onBack(); }}>
        <ChevronLeft size={14} /> {t('common.back')}
      </button>

      <div className="tlabel">{t('tutorial.count.label')}</div>

      {/* Cards */}
      <div className="cq-cards">
        {COUNT_SEQ.map((c, i) => {
          const valCls = c.v > 0 ? 'pos' : c.v < 0 ? 'neg' : 'zer';
          const valTxt = c.v > 0 ? '+1' : c.v < 0 ? '−1' : '0';
          return (
            <div key={i} className="cq-wrap">
              {i <= dealIdx
                ? <TCard rank={c.rank} suit={c.suit} size="sm" anim="t-deal" />
                : <div className="cq-empty" />
              }
              <div className={`cq-val ${valCls} ${showVals ? 'vis' : ''}`}>
                {valTxt}
              </div>
            </div>
          );
        })}
      </div>

      {/* Watching hint */}
      {phase === 'watching' && (
        <div className="cnt-watching-hint">{t('tutorial.count.watching')}</div>
      )}

      {/* Input */}
      {(phase === 'input' || phase === 'done') && (
        <>
          {/* Wrong-try inline feedback */}
          {feedback === 'wrong-try' && (
            <div style={{ textAlign: 'center', marginBottom: 10, fontSize: 13, color: G.red, fontWeight: 600 }}>
              {t('tutorial.count.wrongTry')}
            </div>
          )}

          {/* Result feedback */}
          {phase === 'done' && (
            <div className={`cnt-fb ${feedback === 'correct' ? 'ok' : 'err'}`}>
              <div className="cnt-fb-title" style={{ color: feedback === 'correct' ? G.green : G.red }}>
                {feedback === 'correct'
                  ? t('tutorial.count.correctTitle', { count: COUNT_ANSWER })
                  : t('tutorial.count.wrongTitle', { count: COUNT_ANSWER })}
              </div>
              <div className="cnt-fb-desc">
                {feedback === 'correct'
                  ? t('tutorial.count.correctDesc')
                  : t('tutorial.count.wrongDesc')}
              </div>
            </div>
          )}

          {/* Stepper */}
          {phase === 'input' && (
            <div className="cnt-stepper">
              <button className="csb" onClick={() => { playClick(); setGuess((g) => Math.max(g - 1, -12)); }}>−</button>
              <div className={`cnt-num ${countCls}`}>
                {guess > 0 ? `+${guess}` : guess}
              </div>
              <button className="csb" onClick={() => { playClick(); setGuess((g) => Math.min(g + 1, 12)); }}>+</button>
            </div>
          )}

          {/* CTA */}
          {phase === 'input' && (
            <button className="tbtn-g" onClick={validate}>
              {t('tutorial.count.validate')}
            </button>
          )}
          {phase === 'done' && (
            <button className="tbtn-g" onClick={() => { playClick(); onNext(); }}>
              {t('tutorial.count.continue')}
            </button>
          )}
        </>
      )}
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 4 — Les modes de jeu
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ModesStep = ({ onNext, onBack, t }) => {
  const MODES = [
    {
      icon: <BookOpen size={20} color={G.gold} />,
      name: t('tutorial.modes.trainingName'),
      sub: t('tutorial.modes.trainingSub'),
      desc: t('tutorial.modes.trainingDesc'),
      status: 'un',
      highlight: true,
    },
    {
      icon: <DoorOpen size={20} color={G.textSecondary} />,
      name: t('tutorial.modes.rankedName'),
      sub: t('tutorial.modes.rankedSub'),
      desc: t('tutorial.modes.rankedDesc'),
      status: 'lk',
      highlight: false,
    },
    {
      icon: <Flame size={20} color={G.textSecondary} />,
      name: t('tutorial.modes.casinoName'),
      sub: t('tutorial.modes.casinoSub'),
      desc: t('tutorial.modes.casinoDesc'),
      status: 'lk',
      highlight: false,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <button className="tbtn-back" onClick={() => { playClick(); onBack(); }}>
        <ChevronLeft size={14} /> {t('common.back')}
      </button>

      <div className="tlabel">{t('tutorial.modes.label')}</div>
      <div className="th1">{t('tutorial.modes.h1l1')}<br />{t('tutorial.modes.h1l2')}</div>
      <p className="tp">
        {t('tutorial.modes.p')}
      </p>

      {MODES.map((m) => (
        <div key={m.name} className={`mode-card ${m.highlight ? 'hl' : 'lkd'}`}>
          <div className="mode-icon" style={{ display: 'flex' }}>{m.icon}</div>
          <div className="mode-title">{m.name}</div>
          <div className="mode-sub">{m.sub}</div>
          <div className="mode-desc">{m.desc}</div>
          <div className={`mode-badge ${m.status}`}>
            {m.status === 'un' ? t('tutorial.modes.available') : <Lock size={14} />}
          </div>
        </div>
      ))}

      <div className="tip-gold" style={{ marginTop: 6 }}>
        <strong>{t('tutorial.modes.calibTipTitle')}</strong>
        {t('tutorial.modes.calibTipBody')}
      </div>

      <div style={{ flex: 1 }} />
      <button className="tbtn-g" style={{ marginTop: 20 }} onClick={() => { playClick(); onNext(); }}>
        {t('tutorial.modes.continue')}
      </button>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STEP 5 — Ready
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ReadyStep = ({ onComplete, t }) => {
  const CHECKS = [
    t('tutorial.ready.check1'),
    t('tutorial.ready.check2'),
    t('tutorial.ready.check3'),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', paddingTop: 16 }}>
        <div className="ready-orb" style={{ color: G.gold, fontFamily: "'Cinzel', serif" }}>♠</div>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
          {t('tutorial.ready.title')}
        </div>
        <p className="tp" style={{ maxWidth: 300, margin: '0 auto 22px' }}>
          {t('tutorial.ready.p')}
        </p>
      </div>

      <ul className="chk-list">
        {CHECKS.map((txt, i) => (
          <li key={i}>
            <div className="chk-ic"><Check size={11} /></div>
            {txt}
          </li>
        ))}
      </ul>

      {/* First objective */}
      <div style={{ background: G.bgPanel, border: `1px solid ${G.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 18 }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 13, fontWeight: 600, color: G.gold, marginBottom: 6 }}>
          {t('tutorial.ready.firstGoalTitle')}
        </div>
        <div style={{ fontSize: 12, color: G.textSecondary, lineHeight: 1.6 }}>
          {t('tutorial.ready.firstGoalPre')}<strong style={{ color: G.textPrimary }}>{t('tutorial.ready.firstGoalStrong')}</strong>{t('tutorial.ready.firstGoalPost')}
        </div>
      </div>

      <button className="tbtn-g" onClick={() => { playGo(); onComplete(); }}>
        {t('tutorial.ready.enterLobby')}
      </button>
    </div>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TutorialOverlay — composant racine, exporté en default
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STEPS = [WelcomeStep, HiLoLearnStep, HiLoQuizStep, CountQuizStep, ModesStep, ReadyStep];
const TOTAL = STEPS.length;

const TutorialOverlay = ({ onComplete, onSkip, t: tProp }) => {
  // Fallback so the overlay can run standalone (no parent) — defaults to FR.
  const t = tProp || makeT(DEFAULT_LANG);
  const [step, setStep] = useState(0);
  const [dir, setDir]   = useState('fwd');
  const [done, setDone] = useState(false);

  // Le composant gère lui-même sa disparition.
  // Si le parent fournit onComplete/onSkip (intégration EliteCounter), il les appelle aussi.
  // Si les props sont absentes (test standalone), le overlay disparaît quand même.
  const handleComplete = () => {
    setDone(true);
    if (typeof onComplete === 'function') onComplete();
  };
  const handleSkip = () => {
    setDone(true);
    if (typeof onSkip === 'function') onSkip();
  };

  if (done) return null;

  const goNext = () => {
    if (step < TOTAL - 1) { setDir('fwd'); setStep((s) => s + 1); }
  };
  const goBack = () => {
    if (step > 0) { setDir('bwd'); setStep((s) => s - 1); }
  };

  const Comp = STEPS[step];

  return (
    <div className="tov">
      <style>{tutCss}</style>
      <div className="tov-wrap">
        {/* Sticky header */}
        <div className="tov-hdr">
          <ProgressDots step={step} total={TOTAL} />
          {step < TOTAL - 1 && (
            <button className="tskip" onClick={() => { playClick(); handleSkip(); }}>
              {t('tutorial.skip')} <ChevronRight size={12} />
            </button>
          )}
        </div>

        {/* Step — key forces remount + animation on each navigation */}
        <div key={step} className={`tstep-${dir}`}>
          <Comp
            t={t}
            onNext={goNext}
            onBack={goBack}
            onComplete={handleComplete}
            onSkip={handleSkip}
          />
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
