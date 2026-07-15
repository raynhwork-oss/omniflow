/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Warm Cream Base (paper-like) ──────────────────────
        cream: {
          50:  '#FDFBF7',   // main bg — warm ivory
          100: '#FAF6F0',   // slightly deeper bg
          200: '#F5EBE0',   // warm sand panels
          300: '#EDDECC',   // card borders
          400: '#E0CDB8',   // dividers
          500: '#D0B99A',   // muted text bg
        },
        // ── Pastel Orange Brand ───────────────────────────────
        orange: {
          50:  '#FFF8ED',
          100: '#FFE8C2',
          200: '#FFD08A',
          300: '#FFB74D',   // accent main
          400: '#E6A23C',
          500: '#E68A00',   // terracotta / deep accent
          600: '#C87700',
          700: '#A36200',
          800: '#7A4A00',
          900: '#5A3600',
        },
        // ── Cat Paw Pink ──────────────────────────────────────
        paw: {
          50:  '#FFF5F5',
          100: '#FFE8E8',
          200: '#FFD8D8',   // highlight pink
          300: '#FFC0C0',
          400: '#FF9999',
          500: '#FF7070',
        },
        // ── Warm Text Colors ──────────────────────────────────
        espresso: {
          900: '#1E1208',
          800: '#3E2723',   // dark espresso brown — main text
          700: '#5D3A1A',
          600: '#795548',
          500: '#8D6E63',
          400: '#A1887F',
          300: '#BCAAA4',
          200: '#D7CCC8',
          100: '#EFEBE9',
        },
        // ── Deep Navy (high-contrast text) ───────────────────
        navy: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
        },
        // ── Warm Status Colors ────────────────────────────────
        status: {
          backlog:    '#8D6E63',
          todo:       '#F59E0B',
          inprogress: '#FF8A65',
          done:       '#66BB6A',
          archived:   '#BCAAA4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Bumped up ~15-20% across all sizes
        'xs':  ['0.8125rem',  { lineHeight: '1.2rem' }],   // was 0.75
        'sm':  ['0.9375rem',  { lineHeight: '1.35rem' }],  // was 0.875
        'base':['1.0625rem',  { lineHeight: '1.6rem' }],   // was 1
        'lg':  ['1.1875rem',  { lineHeight: '1.75rem' }],  // was 1.125
        'xl':  ['1.375rem',   { lineHeight: '1.875rem' }], // was 1.25
        '2xl': ['1.625rem',   { lineHeight: '2rem' }],
      },
      backgroundImage: {
        'gradient-warm':   'linear-gradient(135deg, #FFF8ED 0%, #FAF6F0 50%, #F5EBE0 100%)',
        'gradient-paw':    'linear-gradient(135deg, #FFE8C2 0%, #FFD8D8 100%)',
        'gradient-orange': 'linear-gradient(135deg, #FFB74D 0%, #E68A00 100%)',
        'paper-texture':   'repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(230,210,185,0.25) 28px, rgba(230,210,185,0.25) 29px)',
        'dot-pattern':     'radial-gradient(circle, rgba(200,170,140,0.35) 1px, transparent 1px)',
      },
      boxShadow: {
        'warm-sm':    '0 1px 4px rgba(139,90,43,0.08), 0 1px 2px rgba(139,90,43,0.05)',
        'warm-md':    '0 4px 16px rgba(139,90,43,0.12), 0 2px 6px rgba(139,90,43,0.07)',
        'warm-lg':    '0 8px 32px rgba(139,90,43,0.16), 0 4px 12px rgba(139,90,43,0.1)',
        'warm-hover': '0 8px 28px rgba(230,138,0,0.18), 0 2px 8px rgba(139,90,43,0.1)',
        'card':       '0 2px 8px rgba(139,90,43,0.08), inset 0 1px 0 rgba(255,255,255,0.7)',
        'card-hover': '0 6px 24px rgba(230,138,0,0.15), 0 2px 8px rgba(139,90,43,0.08)',
        'sidebar':    '2px 0 16px rgba(139,90,43,0.08)',
        'drawer':     '-4px 0 24px rgba(139,90,43,0.12)',
        'paw-glow':   '0 0 12px rgba(255,183,77,0.4)',
        'orange-glow':'0 0 20px rgba(255,183,77,0.3)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        'fade-in':        'fadeIn 0.2s ease-out',
        'scale-in':       'scaleIn 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
        'check-pop':      'checkPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'cat-wink':       'catWink 4s ease-in-out infinite',
        'cat-tail':       'catTail 3s ease-in-out infinite',
        'cat-sleep':      'catSleep 2s ease-in-out infinite',
        'cat-stretch':    'catStretch 6s ease-in-out infinite',
        'paw-bounce':     'pawBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'float':          'float 5s ease-in-out infinite',
        'wobble':         'wobble 0.5s ease-in-out',
      },
      keyframes: {
        slideInRight: {
          '0%':   { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        checkPop: {
          '0%':   { transform: 'scale(0.7)',  opacity: '0' },
          '60%':  { transform: 'scale(1.25)', opacity: '1' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        catWink: {
          '0%, 90%, 100%': { transform: 'scaleY(1)' },
          '95%':           { transform: 'scaleY(0.1)' },
        },
        catTail: {
          '0%, 100%': { transform: 'rotate(-15deg)' },
          '50%':      { transform: 'rotate(15deg)' },
        },
        catSleep: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-3px)' },
        },
        catStretch: {
          '0%, 85%, 100%': { transform: 'scaleX(1) scaleY(1)' },
          '88%':           { transform: 'scaleX(1.15) scaleY(0.88)' },
          '92%':           { transform: 'scaleX(0.9) scaleY(1.08)' },
          '95%':           { transform: 'scaleX(1) scaleY(1)' },
        },
        pawBounce: {
          '0%':   { transform: 'translateY(0) scale(1)' },
          '40%':  { transform: 'translateY(-8px) scale(1.15)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-5px)' },
        },
        wobble: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%':      { transform: 'rotate(-8deg)' },
          '75%':      { transform: 'rotate(8deg)' },
        },
      },
    },
  },
  plugins: [],
}
