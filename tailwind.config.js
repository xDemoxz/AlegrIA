/** Tailwind CSS v3 — Barrio Abajo del Río / AlegrIA
 *  Para v4, ver src/styles/theme.v4.css (misma escala como @theme).
 *  Fuente de verdad: sistema de diseño "Barrio Abajo del Río" (Claude Design).
 */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        yellow: { DEFAULT: '#F2B807', light: '#FFDC43' },
        red: { DEFAULT: '#E02828', dark: '#A81212' },
        blue: { DEFAULT: '#1DB3E7', dark: '#0A749A' },
        orange: { DEFAULT: '#F26522' },
        ink: '#121212',
        cream: '#FDF6E3',
      },
      fontFamily: {
        display: ["'Bebas Neue'", "'Druk Wide'", 'Impact', 'sans-serif'],
        body: ["'Work Sans'", "'Inter'", 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.0', fontWeight: '900', letterSpacing: '-0.02em' }],
        'display-lg': ['3.25rem', { lineHeight: '1.05', fontWeight: '800', letterSpacing: '-0.01em' }],
        'heading-md': ['2rem', { lineHeight: '1.2', fontWeight: '700' }],
        'body-lg': ['1.25rem', { lineHeight: '1.5', fontWeight: '500' }],
        'label-sm': ['0.8125rem', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '0.08em' }],
      },
      borderWidth: { 3: '3px', 4: '4px' },
      borderRadius: { sticker: '16px', badge: '8px', pill: '9999px' },
      boxShadow: {
        'pop-black': '5px 5px 0px 0px #121212',
        'pop-red': '5px 5px 0px 0px #E02828',
        'pop-blue': '5px 5px 0px 0px #0A749A',
        'pop-xl': '10px 10px 0px 0px #121212',
        sticker: '0 0 0 4px #FFFFFF, 5px 5px 0px 0px #121212',
        pressed: '2px 2px 0px 0px #121212',
      },
      transitionTimingFunction: { pop: 'cubic-bezier(0.34,1.56,0.64,1)' },
      backgroundImage: {
        // Motivos vernáculos: baldosa hidráulica, teja colonial, calado de reja
        baldosa:
          'conic-gradient(from 90deg at 50% 50%, #E02828 0 25%, #F2B807 0 50%, #E02828 0 75%, #F2B807 0)',
        teja: 'repeating-radial-gradient(circle at 50% 100%, #E02828 0 14px, #A81212 14px 16px, transparent 16px 34px)',
        calado:
          'repeating-linear-gradient(45deg, #121212 0 2px, transparent 2px 14px), repeating-linear-gradient(-45deg, #121212 0 2px, transparent 2px 14px)',
      },
      backgroundSize: { baldosa: '48px 48px', teja: '68px 34px', calado: '20px 20px' },
    },
  },
  plugins: [],
};
