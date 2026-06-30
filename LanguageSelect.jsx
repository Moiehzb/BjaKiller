import React from 'react';
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
// (the list scrolls; nothing here is hardcoded per-language).
const LangRow = ({ lang, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 14, width: '100%',
      background: active ? 'rgba(201,168,76,.12)' : G.feltLight,
      border: `1px solid ${active ? G.gold : G.border}`,
      borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
      color: G.text, textAlign: 'left', transition: 'all .15s',
    }}
  >
    <span style={{ fontSize: 28, lineHeight: 1 }}>{lang.flag}</span>
    <span style={{ flex: 1, fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600 }}>
      {lang.label}
    </span>
    {active && <Check size={18} color={G.gold} />}
  </button>
);

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
      <div style={{ textAlign: 'center', marginBottom: 26 }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>🌐</div>
        <div
          style={{
            fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, letterSpacing: '.04em',
            background: `linear-gradient(135deg, ${G.goldLight}, ${G.gold}, #a07820)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            marginBottom: 6,
          }}
        >
          Language · Langue
        </div>
        <div style={{ fontSize: 12, color: G.textMuted, letterSpacing: '.04em' }}>
          Elite Counter
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
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 700, marginBottom: 14 }}>
        {t('header.language')}
      </div>
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
