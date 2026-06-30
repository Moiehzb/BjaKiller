import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { LANGUAGES } from './i18n';

// Design tokens — mirror of EliteCounter.jsx so this screen can stand alone
// (it renders before the main app's <style> is mounted, on first launch).
const G = {
  bg: '#0a0d0a', felt: '#0f1a0f', feltLight: '#152115',
  gold: '#c9a84c', goldLight: '#e8c96d', goldDim: '#7a6030',
  border: '#1e2e1e', borderGold: '#3a2e10',
  text: '#e8e4d8', textMuted: '#7a8a7a',
};

// One row per language — native name + flag. Scales cleanly to 50 entries
// (the list scrolls; nothing here is hardcoded per-language). Hover state is
// kept in JS so it works on both the full-screen picker and the bottom sheet
// without depending on a mounted <style> block.
const LangRow = ({ lang, active, onClick }) => {
  const [hover, setHover] = useState(false);
  const lit = active || hover;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, width: '100%',
        background: active ? 'rgba(201,168,76,.10)' : hover ? 'rgba(255,255,255,.03)' : G.feltLight,
        border: `1px solid ${active ? G.gold : hover ? G.goldDim : G.border}`,
        borderRadius: 12, padding: '13px 15px', cursor: 'pointer',
        color: G.text, textAlign: 'left',
        transition: 'transform .18s ease, border-color .18s ease, background .18s ease',
        transform: hover ? 'translateY(-1px)' : 'none',
        boxShadow: active ? '0 6px 20px -12px rgba(201,168,76,.6)' : 'none',
      }}
    >
      <span
        style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, lineHeight: 1,
          background: 'rgba(0,0,0,.25)',
          border: `1px solid ${lit ? G.borderGold : G.border}`,
          transition: 'border-color .18s ease',
        }}
      >
        {lang.flag}
      </span>
      <span style={{ flex: 1, fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, letterSpacing: '.01em' }}>
        {lang.label}
      </span>
      <span
        style={{
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1.5px solid ${active ? G.gold : G.border}`,
          background: active ? G.gold : 'transparent',
          transition: 'all .18s ease',
        }}
      >
        {active && <Check size={13} color={G.bg} strokeWidth={3} />}
      </span>
    </button>
  );
};

// ─── Full-screen first-launch selector (shown before the tutorial) ──
export const LanguageSelectScreen = ({ current, onPick }) => (
  <div
    style={{
      position: 'fixed', inset: 0, zIndex: 210, overflowY: 'auto',
      background: `radial-gradient(ellipse at top, #102010, ${G.bg} 72%)`,
      fontFamily: "'Inter', sans-serif", color: G.text,
      WebkitFontSmoothing: 'antialiased',
    }}
  >
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');`}</style>
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '0 18px 48px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: '.34em', textTransform: 'uppercase', color: G.goldDim, marginBottom: 14, paddingLeft: '.34em' }}>
          Elite Counter
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, letterSpacing: '.02em',
            background: `linear-gradient(135deg, ${G.goldLight}, ${G.gold} 55%, #a07820)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}
        >
          Language · Langue
        </div>
        <div style={{ width: 54, height: 1, margin: '15px auto 0', background: `linear-gradient(90deg, transparent, ${G.gold}, transparent)` }} />
        <div style={{ fontSize: 12, color: G.textMuted, letterSpacing: '.04em', marginTop: 14 }}>
          Choisis ta langue · Choose your language
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {LANGUAGES.map((lang) => (
          <LangRow key={lang.code} lang={lang} active={lang.code === current} onClick={() => onPick(lang.code)} />
        ))}
      </div>
    </div>
  </div>
);

// ─── Bottom-sheet picker, reused from the lobby language button ──────
export const LanguageModal = ({ current, onPick, onClose, t }) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0, zIndex: 170, background: 'rgba(0,0,0,.72)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: `linear-gradient(180deg, #1a261a, ${G.bg})`,
        border: `1px solid ${G.border}`, borderTop: `1px solid ${G.borderGold}`,
        borderRadius: '20px 20px 0 0', padding: '22px 18px 34px', width: '100%', maxWidth: 480,
        maxHeight: '82vh', overflowY: 'auto',
      }}
    >
      <div style={{ width: 38, height: 4, background: G.border, borderRadius: 2, margin: '0 auto 18px' }} />
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 700, marginBottom: 4 }}>
        {t('header.language')}
      </div>
      <div style={{ width: 40, height: 1, margin: '0 0 16px', background: `linear-gradient(90deg, ${G.gold}, transparent)` }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {LANGUAGES.map((lang) => (
          <LangRow
            key={lang.code}
            lang={lang}
            active={lang.code === current}
            onClick={() => { onPick(lang.code); onClose(); }}
          />
        ))}
      </div>
    </div>
  </div>
);
