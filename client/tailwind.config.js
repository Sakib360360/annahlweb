/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3fdf8',
          100: '#daf7e5',
          200: '#b8eed0',
          300: '#88e0b4',
          400: '#47c78d',
          500: '#1da26d',
          600: '#178555',
          700: '#136a46',
          800: '#11563a',
          900: '#0f4530',
        },
        gold: {
          50: '#fffbf1',
          100: '#fff5d9',
          200: '#ffecad',
          300: '#ffe07b',
          400: '#f8c84a',
          500: '#e6ae26',
          600: '#c78b1d',
          700: '#9c6a16',
          800: '#764f11',
          900: '#5b3d0e',
        },
      },
      boxShadow: {
        soft: '0 10px 25px rgba(9, 30, 66, 0.08)',
        glow: '0 0 0 1px rgba(255, 214, 102, 0.45), 0 16px 40px rgba(0, 0, 0, 0.12)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-7px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        fadeIn: 'fadeIn 0.5s ease-out forwards',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
