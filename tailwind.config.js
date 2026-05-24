/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './*.html',
    './src/**/*.{ts,js}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#eff4ff',
          100: '#dbe8ff',
          200: '#bad3ff',
          300: '#85b2ff',
          400: '#4d87ff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e3a8a',
          800: '#1e3060',
          900: '#0f1f40',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
