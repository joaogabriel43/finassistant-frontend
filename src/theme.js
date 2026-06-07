// src/theme.js — FortunAI MUI v7 theme
// ───────────────────────────────────────────────────────────────────
// Generated from the D4 "Bento Refinado" design tokens (d4-tokens.js).
// Single source of truth: edit `tokens` below and both the MUI theme
// (sx prop / styled) and the raw CSS variables (applyCssVars) stay in sync.
//
// Dark-only by design — the D4 system ships a single dark surface palette.
//
// Fonts (Vite): install once, then the imports below bundle them.
//   npm i @fontsource/hanken-grotesk @fontsource/jetbrains-mono

import '@fontsource/hanken-grotesk/400.css';
import '@fontsource/hanken-grotesk/500.css';
import '@fontsource/hanken-grotesk/600.css';
import '@fontsource/hanken-grotesk/700.css';
import '@fontsource/hanken-grotesk/800.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/600.css';
import '@fontsource/jetbrains-mono/700.css';

import { createTheme } from '@mui/material/styles';

// ── Design tokens (clean, importable copy of d4-tokens.js) ──────────
export const tokens = {
  colors: {
    bg:          '#08080c', // app background
    panel:       '#0b0b11', // sidebar / chrome
    surface:     '#101017', // cards (Paper)
    raised:      '#16161f', // raised layer inside a card

    line:        'rgba(255,255,255,0.07)',
    lineStrong:  'rgba(255,255,255,0.12)',

    text:        '#ECECF1',
    textDim:     '#9494A6',
    textFaint:   '#62626F',

    primary:     '#7C6AF7',
    primaryHi:   '#8B7BFF',
    primaryLo:   '#5B4FD4',
    primarySoft: 'rgba(124,106,247,0.14)',

    pos:         '#2DD4A7',
    neg:         '#FF5C77',
    warn:        '#FFB547',
    pink:        '#FF6FB3',

    // input borders (merged from the previous theme — dark tokens)
    inputBorder:      'rgba(255,255,255,0.12)',
    inputBorderHover: 'rgba(255,255,255,0.24)',

    // portfolio series — keep order stable so legend ↔ donut colors match
    series: ['#7C6AF7', '#2DD4A7', '#FFB547', '#4FC3F7', '#FF6FB3'],
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 },
  space:  { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32 }, // 4pt scale
  font: {
    ui:   "'Hanken Grotesk', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace",
  },
  motion: { ease: 'cubic-bezier(.22,.7,.3,1)', dur: 900 },
};

const c = tokens.colors;

// ── createTheme: tokens → MUI palette / shape / spacing / typography ─
export const theme = createTheme({
  // MUI v7 native CSS variables — exposes palette as --fa-* custom props
  // and gives proper SSR/dark-mode behaviour out of the box.
  cssVariables: { cssVarPrefix: 'fa' },

  palette: {
    mode: 'dark',
    primary: { main: c.primary, light: c.primaryHi, dark: c.primaryLo, contrastText: '#ffffff' },
    secondary: { main: c.pink, contrastText: '#ffffff' },
    success: { main: c.pos, contrastText: '#06140f' },
    error:   { main: c.neg, contrastText: '#1a0509' },
    warning: { main: c.warn, contrastText: '#1a1203' },
    background: { default: c.bg, paper: c.surface },
    text: { primary: c.text, secondary: c.textDim, disabled: c.textFaint },
    divider: c.line,

    // ── custom palette extensions (read via theme.palette.*) ──────────
    surfaces:  { bg: c.bg, panel: c.panel, surface: c.surface, raised: c.raised },
    lines:     { subtle: c.line, strong: c.lineStrong },
    accent:    { primarySoft: c.primarySoft, pink: c.pink, textFaint: c.textFaint },
    series:    c.series,
  },

  // base 4px: theme.spacing(1) === 4px → space tokens map 1:1 (space[2]=spacing(2))
  spacing: 4,

  shape: { borderRadius: tokens.radius.lg }, // 16

  // expose the full radius scale + mono family for components/sx
  radius: tokens.radius,
  motion: tokens.motion,

  typography: {
    fontFamily: tokens.font.ui,
    fontFamilyMono: tokens.font.mono, // custom — use for all monetary values
    // tabular figures everywhere by default
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 800, letterSpacing: '-0.02em' },
    h3: { fontWeight: 750, letterSpacing: '-0.015em' },
    h4: { fontWeight: 750, letterSpacing: '-0.01em' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { fontWeight: 650, textTransform: 'none', letterSpacing: 0 },
    overline: { fontWeight: 600, letterSpacing: '0.08em', fontSize: '0.66rem' },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFeatureSettings: '"tnum" 1',
          backgroundColor: c.bg,
          color: c.text,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: c.surface,
          backgroundImage: 'none',
          border: `1px solid ${c.line}`,
          borderRadius: tokens.radius.lg,
        },
      },
    },
    // merged from previous theme — keep Card visually aligned with Paper
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: c.surface,
          backgroundImage: 'none',
          border: `1px solid ${c.line}`,
          borderRadius: tokens.radius.lg,
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: tokens.radius.md, fontWeight: 650, paddingInline: 16 },
        containedPrimary: {
          backgroundImage: `linear-gradient(135deg, ${c.primary}, ${c.primaryLo})`,
          boxShadow: '0 2px 14px rgba(124,106,247,0.35)',
          '&:hover': { boxShadow: '0 4px 20px rgba(124,106,247,0.5)' },
        },
      },
    },
    // merged from previous theme — input border states
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: tokens.radius.md,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: c.inputBorder },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: c.inputBorderHover },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: c.primary },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.md,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: c.inputBorder },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: c.inputBorderHover },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: c.primary },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 6, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.06)' },
        bar: { borderRadius: 4 },
      },
    },
    MuiDivider: { styleOverrides: { root: { borderColor: c.line } } },
    // merged from previous theme
    MuiChip: { styleOverrides: { root: { borderRadius: tokens.radius.sm } } },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: c.raised, border: `1px solid ${c.lineStrong}`, fontSize: 12 },
      },
    },
  },
});

/**
 * Flatten tokens into the `--c-*` / `--r-*` / `--f-*` CSS custom properties
 * used by the hand-written D4 CSS. Spread onto a root element's style, or
 * call applyCssVars(document.documentElement) once at boot.
 * @param {HTMLElement} [el] when provided, sets the vars on that element
 * @returns {Record<string,string>} the variable map (for sx/style spread)
 */
export function cssVars() {
  return {
    '--c-bg': c.bg, '--c-panel': c.panel, '--c-surface': c.surface, '--c-raised': c.raised,
    '--c-line': c.line, '--c-line-strong': c.lineStrong,
    '--c-tx': c.text, '--c-tx2': c.textDim, '--c-tx3': c.textFaint,
    '--c-pri': c.primary, '--c-pri-hi': c.primaryHi, '--c-pri-lo': c.primaryLo, '--c-pri-soft': c.primarySoft,
    '--c-pos': c.pos, '--c-neg': c.neg, '--c-warn': c.warn, '--c-pink': c.pink,
    '--r-sm': `${tokens.radius.sm}px`, '--r-md': `${tokens.radius.md}px`,
    '--r-lg': `${tokens.radius.lg}px`, '--r-xl': `${tokens.radius.xl}px`,
    '--f-ui': tokens.font.ui, '--f-mono': tokens.font.mono,
  };
}

export function applyCssVars(el = typeof document !== 'undefined' ? document.documentElement : null) {
  if (!el) return;
  const vars = cssVars();
  for (const k in vars) el.style.setProperty(k, vars[k]);
}

export default theme;
