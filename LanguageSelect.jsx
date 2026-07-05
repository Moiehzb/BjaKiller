import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { LANGUAGES } from './i18n';

// ─── Drapeaux SVG ────────────────────────────────────────────────
// Windows ne rend PAS les emojis-drapeaux (🇫🇷 s'affiche « FR »). On dessine
// donc des drapeaux SVG, rendus à l'identique partout. Ratio 3:2 uniforme.
export const Flag = ({ code, size = 22 }) => {
  const common = {
    width: size, height: Math.round((size * 2) / 3), viewBox: '0 0 60 40',
    style: { display: 'block', borderRadius: 3, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.25)', flexShrink: 0 },
    'aria-hidden': true,
  };
  switch (code) {
    case 'fr':
      return (
        <svg {...common}>
          <rect width="20" height="40" fill="#0055A4" />
          <rect x="20" width="20" height="40" fill="#fff" />
          <rect x="40" width="20" height="40" fill="#EF4135" />
        </svg>
      );
    case 'de':
      return (
        <svg {...common}>
          <rect width="60" height="13.34" fill="#000" />
          <rect y="13.34" width="60" height="13.33" fill="#DD0000" />
          <rect y="26.67" width="60" height="13.33" fill="#FFCE00" />
        </svg>
      );
    case 'es':
      return (
        <svg {...common}>
          <rect width="60" height="40" fill="#AA151B" />
          <rect y="10" width="60" height="20" fill="#F1BF00" />
        </svg>
      );
    case 'en':
      return (
        <svg {...common}>
          <rect width="60" height="40" fill="#012169" />
          <path d="M0 0 L60 40 M60 0 L0 40" stroke="#fff" strokeWidth="8" />
          <path d="M0 0 L60 40 M60 0 L0 40" stroke="#C8102E" strokeWidth="3.5" />
          <path d="M30 0 V40 M0 20 H60" stroke="#fff" strokeWidth="11" />
          <path d="M30 0 V40 M0 20 H60" stroke="#C8102E" strokeWidth="6.5" />
        </svg>
      );
    case 'ar':
      return (
        <svg {...common}>
          {/* Égypte — tricolore horizontal */}
          <rect width="60" height="40" fill="#CE1126" />
          <rect y="13.33" width="60" height="13.34" fill="#fff" />
          <rect y="26.67" width="60" height="13.33" fill="#000" />
          {/* Aigle d'or simplifié */}
          <path d="M26,18 L26,22 L28,22 L28,20 L32,20 L32,22 L34,22 L34,18 Z" fill="#C09300" />
          <rect x="28" y="17" width="4" height="1.5" fill="#C09300" />
        </svg>
      );
    case 'it':
      return (
        <svg {...common}>
          <rect width="20" height="40" fill="#009246" />
          <rect x="20" width="20" height="40" fill="#fff" />
          <rect x="40" width="20" height="40" fill="#CE2B37" />
        </svg>
      );
    case 'ru':
      return (
        <svg {...common}>
          <rect width="60" height="40" fill="#fff" />
          <rect y="13.33" width="60" height="13.34" fill="#0039A6" />
          <rect y="26.67" width="60" height="13.33" fill="#D52B1E" />
        </svg>
      );
    case 'pt':
      return (
        <svg {...common}>
          <rect width="60" height="40" fill="#FF0000" />
          <rect width="24" height="40" fill="#006600" />
          <circle cx="24" cy="20" r="7" fill="#FFD700" stroke="#006600" strokeWidth="1" />
          <circle cx="24" cy="20" r="5" fill="#fff" />
          <path d="M19,17 Q24,22 29,17" stroke="#003399" strokeWidth="1.2" fill="none" />
          <path d="M19,20 Q24,25 29,20" stroke="#003399" strokeWidth="1.2" fill="none" />
        </svg>
      );
    case 'ja':
      return (
        <svg {...common}>
          <rect width="60" height="40" fill="#fff" />
          <circle cx="30" cy="20" r="12" fill="#BC002D" />
        </svg>
      );
    case 'zh':
      return (
        <svg {...common}>
          <rect width="60" height="40" fill="#DE2910" />
          {/* Grand astre */}
          <polygon points="11,14 12.35,18.14 16.71,18.15 13.19,20.71 14.53,24.85 11,22.3 7.47,24.85 8.81,20.71 5.29,18.15 9.65,18.14" fill="#FFDE00" />
          {/* Quatre petits astres */}
          <polygon points="21,8.5 21.56,10.23 23.38,10.23 21.9,11.29 22.47,13.02 21,11.95 19.53,13.02 20.1,11.29 18.62,10.23 20.44,10.23" fill="#FFDE00" />
          <polygon points="25,13 25.56,14.73 27.38,14.73 25.9,15.79 26.47,17.52 25,16.45 23.53,17.52 24.1,15.79 22.62,14.73 24.44,14.73" fill="#FFDE00" />
          <polygon points="25,20 25.56,21.73 27.38,21.73 25.9,22.79 26.47,24.52 25,23.45 23.53,24.52 24.1,22.79 22.62,21.73 24.44,21.73" fill="#FFDE00" />
          <polygon points="21,25 21.56,26.73 23.38,26.73 21.9,27.79 22.47,29.52 21,28.45 19.53,29.52 20.1,27.79 18.62,26.73 20.44,26.73" fill="#FFDE00" />
        </svg>
      );
    case 'ko':
      return (
        <svg {...common}>
          <rect width="60" height="40" fill="#fff" />
          {/* Taegeuk */}
          <circle cx="30" cy="20" r="9" fill="#CD2E3A" />
          <path d="M30,11 A9,9 0 0,1 30,29 A4.5,4.5 0 0,0 30,20 A4.5,4.5 0 0,1 30,11Z" fill="#003478" />
          <circle cx="30" cy="15.5" r="4.5" fill="#CD2E3A" />
          <circle cx="30" cy="24.5" r="4.5" fill="#003478" />
          {/* Trigrammes */}
          <g fill="#000">
            <rect x="6" y="7" width="10" height="2" /><rect x="6" y="10.5" width="10" height="2" /><rect x="6" y="14" width="10" height="2" />
            <rect x="44" y="7" width="4" height="2" /><rect x="50" y="7" width="4" height="2" />
            <rect x="44" y="10.5" width="4" height="2" /><rect x="50" y="10.5" width="4" height="2" />
            <rect x="44" y="14" width="4" height="2" /><rect x="50" y="14" width="4" height="2" />
            <rect x="6" y="24" width="4" height="2" /><rect x="12" y="24" width="4" height="2" />
            <rect x="6" y="27.5" width="10" height="2" />
            <rect x="6" y="31" width="4" height="2" /><rect x="12" y="31" width="4" height="2" />
            <rect x="44" y="24" width="10" height="2" />
            <rect x="44" y="27.5" width="4" height="2" /><rect x="50" y="27.5" width="4" height="2" />
            <rect x="44" y="31" width="10" height="2" />
          </g>
        </svg>
      );
    case 'hi':
      return (
        <svg {...common}>
          <rect width="60" height="40" fill="#FF9933" />
          <rect y="13.33" width="60" height="13.34" fill="#fff" />
          <rect y="26.67" width="60" height="13.33" fill="#138808" />
          {/* Chakra d'Ashoka simplifié */}
          <circle cx="30" cy="20" r="5.5" fill="none" stroke="#000080" strokeWidth="1" />
          <circle cx="30" cy="20" r="1" fill="#000080" />
          <g stroke="#000080" strokeWidth="0.6">
            <line x1="30" y1="14.5" x2="30" y2="25.5" />
            <line x1="24.5" y1="20" x2="35.5" y2="20" />
            <line x1="26.11" y1="16.11" x2="33.89" y2="23.89" />
            <line x1="33.89" y1="16.11" x2="26.11" y2="23.89" />
            <line x1="27.07" y1="14.8" x2="32.93" y2="25.2" />
            <line x1="32.93" y1="14.8" x2="27.07" y2="25.2" />
            <line x1="24.8" y1="17.07" x2="35.2" y2="22.93" />
            <line x1="35.2" y1="17.07" x2="24.8" y2="22.93" />
          </g>
        </svg>
      );
    case 'mn':
      return (
        <svg {...common}>
          <rect width="60" height="40" fill="#C4272F" />
          <rect x="20" width="20" height="40" fill="#015197" />
          {/* Soyombo simplifié : flamme + soleil + lune */}
          <ellipse cx="10" cy="12" rx="3" ry="2" fill="#F5C400" />
          <circle cx="10" cy="18" r="3" fill="#F5C400" />
          <path d="M7,22 Q10,28 13,22" fill="#F5C400" />
        </svg>
      );
    case 'sq':
      return (
        <svg {...common}>
          <rect width="60" height="40" fill="#E41E20" />
          {/* Aigle bicéphale albanais simplifié */}
          <path d="M30,7 L27,10 L23,8 L25,12 L21,13 L25,15 L24,19 L30,17 L36,19 L35,15 L39,13 L35,12 L37,8 L33,10 Z" fill="#000" />
          <path d="M24,19 L21,22 L25,22 L23,27 L30,25 L37,27 L35,22 L39,22 L36,19 L30,21 Z" fill="#000" />
          <path d="M23,27 L21,31 L25,29 L25,33 L28,31 L30,35 L32,31 L35,33 L35,29 L39,31 L37,27 Z" fill="#000" />
        </svg>
      );
    default:
      return null;
  }
};

// Design tokens — mirror of EliteCounter.jsx so this screen can stand alone
// (it renders before the main app's <style> is mounted, on first launch).
const G = {
  bgDeep: '#0d0a1a', bgCard: '#13102a', bgPanel: '#1a1535',
  border: '#2e2654', borderGold: '#4a3a1d',
  gold: '#c9a24b', goldLight: '#e8c97a', goldDark: '#8a6820',
  textPrimary: '#f0e6cc', textSecondary: '#a896c8', textMuted: '#5c4f7a',
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
        background: active ? 'rgba(201,162,75,.10)' : hover ? 'rgba(255,255,255,.03)' : G.bgPanel,
        border: `1px solid ${active ? G.gold : hover ? G.goldDark : G.border}`,
        borderRadius: 12, padding: '13px 15px', cursor: 'pointer',
        color: G.textPrimary, textAlign: 'left',
        transition: 'transform .18s ease, border-color .18s ease, background .18s ease',
        transform: hover ? 'translateY(-1px)' : 'none',
        boxShadow: active ? '0 6px 20px -12px rgba(201,162,75,.6)' : 'none',
      }}
    >
      <span
        style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,.25)',
          border: `1px solid ${lit ? G.borderGold : G.border}`,
          transition: 'border-color .18s ease',
        }}
      >
        <Flag code={lang.code} size={24} />
      </span>
      <span style={{ flex: 1, fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 600, letterSpacing: '.01em' }}>
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
        {active && <Check size={13} color={G.bgDeep} strokeWidth={3} />}
      </span>
    </button>
  );
};

// ─── Full-screen first-launch selector (shown before the tutorial) ──
export const LanguageSelectScreen = ({ current, onPick }) => (
  <div
    style={{
      position: 'fixed', inset: 0, zIndex: 210, overflowY: 'auto',
      background: `radial-gradient(ellipse at top, #1a1535, ${G.bgDeep} 72%)`,
      fontFamily: "'EB Garamond', serif", color: G.textPrimary,
      WebkitFontSmoothing: 'antialiased',
    }}
  >
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '0 18px 48px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: '.34em', textTransform: 'uppercase', color: G.goldDark, marginBottom: 14, paddingLeft: '.34em' }}>
          Blackjack Academy I
        </div>
        <div
          style={{
            fontFamily: "'Cinzel', serif", fontSize: 28, fontWeight: 700, letterSpacing: '.04em',
            background: `linear-gradient(135deg, ${G.goldLight}, ${G.gold} 55%, #8a6820)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}
        >
          Language · Langue
        </div>
        <div style={{ width: 54, height: 1, margin: '15px auto 0', background: `linear-gradient(90deg, transparent, ${G.gold}, transparent)` }} />
        <div style={{ fontSize: 12, color: G.textSecondary, letterSpacing: '.04em', marginTop: 14 }}>
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
        background: `linear-gradient(180deg, #1a261a, ${G.bgDeep})`,
        border: `1px solid ${G.border}`, borderTop: `1px solid ${G.borderGold}`,
        borderRadius: '20px 20px 0 0', padding: '22px 18px 34px', width: '100%', maxWidth: 480,
        maxHeight: '82vh', overflowY: 'auto',
      }}
    >
      <div style={{ width: 38, height: 4, background: G.border, borderRadius: 2, margin: '0 auto 18px' }} />
      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 19, fontWeight: 700, marginBottom: 4 }}>
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
