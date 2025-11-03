/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        base: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          100: '#f1f5f9',
          50: '#f8fafc',
        },
        accent: {
          500: '#38bdf8',
          400: '#0ea5e9',
          300: '#7dd3fc',
        },
      },
    },
  },
  plugins: [],
}
