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
        // Sunset / cloud palette
        cloud: {
          50:  '#FFF5FA',
          100: '#FFE5F0',
          200: '#FFC9DF',
          300: '#FFA3C7',
          400: '#FF7DAE',
          500: '#FF6B9D', // primary pink
          600: '#E84C82',
          700: '#C2376A',
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
        peach: {
          100: '#FFE8D6',
          300: '#FFC29A',
          500: '#FF9966',
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
      boxShadow: {
        soft: '0 8px 24px -8px rgba(157,107,255,0.18), 0 2px 6px -2px rgba(255,107,157,0.10)',
        card: '0 4px 16px -4px rgba(157,107,255,0.10)',
        glow: '0 0 32px rgba(255,107,157,0.35)',
      },
      backgroundImage: {
        'cloud-sunset': 'linear-gradient(120deg, #FFB6D5 0%, #FFA3C7 22%, #C8A4FF 55%, #9D6BFF 100%)',
        'cloud-soft':   'linear-gradient(135deg, #FFE5F0 0%, #F5F0FF 60%, #EADCFF 100%)',
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
