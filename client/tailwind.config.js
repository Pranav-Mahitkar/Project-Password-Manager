/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        surface: {
          DEFAULT: '#0f1117',
          card:    '#161b27',
          hover:   '#1e2535',
          border:  '#2a3347',
        },
        brand: {
          DEFAULT: '#6366f1',
          hover:   '#4f52d8',
          muted:   '#6366f120',
        },
        danger: { DEFAULT: '#ef4444', muted: '#ef444420' },
        success:{ DEFAULT: '#22c55e', muted: '#22c55e20' },
        warn:   { DEFAULT: '#f59e0b', muted: '#f59e0b20' },
      },
      animation: {
        'fade-in':    'fadeIn .25s ease forwards',
        'slide-up':   'slideUp .3s ease forwards',
        'slide-down': 'slideDown .2s ease forwards',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 },              to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
