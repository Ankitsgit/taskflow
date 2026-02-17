/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontWeight: {
        '500': '500',
        '600': '600',
        '700': '700',
        '800': '800',
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f5f3f0',
          100: '#e8e4de',
          200: '#d0c9be',
          300: '#b5a99a',
          400: '#9a8977',
          500: '#7d6e5e',
          600: '#63574a',
          700: '#4a4038',
          800: '#302b25',
          900: '#1a1713',
          950: '#0d0b09',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        sage: '#6b7c6b',
        clay: '#c4786a',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-in': 'slideIn 0.3s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'elevated': '0 10px 40px -10px rgba(0,0,0,0.15)',
      }
    },
  },
  plugins: [],
}
