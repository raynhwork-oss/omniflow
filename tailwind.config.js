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
        // Brand - Electric Indigo
        brand: {
          50:  '#eef0ff',
          100: '#e0e3ff',
          200: '#c7ccff',
          300: '#a5acff',
          400: '#8080ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Dark surface system
        dark: {
          base:   '#0B0F19',   // deepest bg
          900:    '#0f1320',
          800:    '#141824',
          700:    '#1a2030',
          600:    '#1e2535',
          500:    '#232b3d',
          400:    '#2a3347',
          300:    '#344059',
          200:    '#3d4d6b',
          100:    '#4a5d80',
        },
        // Accent colors
        accent: {
          cyan:   '#22d3ee',
          violet: '#a78bfa',
          rose:   '#fb7185',
          amber:  '#fbbf24',
          emerald:'#34d399',
        },
        // Glass surfaces
        glass: {
          light: 'rgba(255,255,255,0.05)',
          med:   'rgba(255,255,255,0.08)',
          heavy:  'rgba(255,255,255,0.12)',
          border: 'rgba(255,255,255,0.08)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glow-brand': 'radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)',
        'card-shimmer': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
      },
      boxShadow: {
        'glow-sm':    '0 0 12px rgba(99,102,241,0.2)',
        'glow-md':    '0 0 24px rgba(99,102,241,0.25)',
        'glow-lg':    '0 0 48px rgba(99,102,241,0.3)',
        'glow-cyan':  '0 0 20px rgba(34,211,238,0.2)',
        'card':       '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.2)',
        'drawer':     '-8px 0 40px rgba(0,0,0,0.5)',
        'inner-top':  'inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'slide-in-right':  'slideInRight 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        'fade-in':         'fadeIn 0.2s ease-out',
        'scale-in':        'scaleIn 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
        'check-pop':       'checkPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'float':           'float 6s ease-in-out infinite',
        'shimmer':         'shimmer 2s linear infinite',
        'pulse-glow':      'pulseGlow 2s ease-in-out infinite',
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
          '0%':   { transform: 'scale(0.92)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        checkPop: {
          '0%':   { transform: 'scale(0.8)',  opacity: '0' },
          '60%':  { transform: 'scale(1.2)',  opacity: '1' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(99,102,241,0.2)' },
          '50%':      { boxShadow: '0 0 24px rgba(99,102,241,0.4)' },
        },
      },
    },
  },
  plugins: [],
}
