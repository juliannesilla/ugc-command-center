import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // A.AA recolor (HR-27 lavender/iris lock): `cloud` ramp recolored pink -> lavender/periwinkle.
        // Name retained intentionally to avoid a 150-file class rename (HR-3/HR-4); every existing
        // `cloud-*` usage now renders lavender. Pink fully demoted per Julz "match the inspo".
        cloud: {
          50:  '#F4F3FE',
          100: '#E9E6FC',
          200: '#D3CCF7',
          300: '#B4A8F0',
          400: '#9A89E8',
          500: '#7C6BDC', // primary lavender (was hot pink #FF6B9D)
          600: '#6451C4',
          700: '#503FA1',
          800: '#3E2F7E', // AA contrast on cloud-100 bg
        },
        iris: {
          50:  '#F5F0FF',
          100: '#EADCFF',
          200: '#D4B8FF',
          300: '#B58CFF',
          400: '#9D6BFF', // accent purple
          500: '#8649F2',
          600: '#6C2FD1',
        },
        // A.AA: peach demoted to a soft lilac so no warm-pink/orange clashes with lavender/iris.
        peach: {
          100: '#F1ECFB',
          300: '#D6C7F2',
          500: '#B49BE6',
        },
        ink: {
          900: '#1A1224',
          800: '#2C1F3D',
          700: '#3E2F52',
          600: '#5A4A6E',
          500: '#7A6B8E',
          400: '#9E91B0',
          300: '#C9BFD6',
        },
        chip: {
          green:  '#22C55E',
          yellow: '#EAB308',
          orange: '#F97316',
          red:    '#EF4444',
          blue:   '#3B82F6',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Playfair Display', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xs': ['1.125rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],   // 18px section subtitle
        'display-sm': ['1.375rem', { lineHeight: '1.25', letterSpacing: '-0.015em' }], // 22px section title
        'display-md': ['2rem',     { lineHeight: '1.1',  letterSpacing: '-0.02em' }],  // 32px stat number
        'display-lg': ['2.25rem',  { lineHeight: '1.05', letterSpacing: '-0.022em' }], // 36px stat number lg
        'display-xl': ['2.75rem',  { lineHeight: '1.05', letterSpacing: '-0.025em' }], // 44px hero title
        'label-xs':   ['0.625rem', { lineHeight: '1.2',  letterSpacing: '0.14em' }],   // 10px tiny label
        'label-sm':   ['0.6875rem',{ lineHeight: '1.2',  letterSpacing: '0.14em' }],   // 11px label
        'body-sm':    ['0.84375rem', { lineHeight: '1.5' }],                            // 13.5px body
      },
      letterSpacing: {
        'magazine': '0.14em',
        'hero':     '-0.022em',
      },
      boxShadow: {
        soft: '0 8px 24px -8px rgba(124,107,220,0.20), 0 2px 6px -2px rgba(157,107,255,0.10)',
        card: '0 4px 16px -4px rgba(124,107,220,0.12)',
        glow: '0 0 32px rgba(124,107,220,0.32)',
        // A14L L3-G additive — larger card elevation for hover-lift / modal-like surfaces.
        'card-lg': '0 12px 32px -8px rgba(124,107,220,0.20), 0 4px 12px -4px rgba(157,107,255,0.12)',
        // A14L L3-G additive — soft inset glow for active nav-item / focus rings.
        'ring-soft': '0 0 0 3px rgba(180,160,245,0.55)',
      },
      backgroundImage: {
        'cloud-sunset': 'linear-gradient(120deg, #CFC7FF 0%, #B3A6FB 24%, #9D6BFF 60%, #7C4DE0 100%)',
        'cloud-soft':   'linear-gradient(135deg, #ECE8FF 0%, #F5F0FF 55%, #E3DAFF 100%)',
        'iris-soft':    'linear-gradient(135deg, #F5F0FF 0%, #EADCFF 55%, #D4B8FF 100%)',
        'grain': "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .35 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};

export default config;
