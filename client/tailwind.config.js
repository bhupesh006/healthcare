/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#00a8b5', // Signature healthcare teal
          hover: '#00929e',
          light: '#e6f8fa',
          dark: '#007a84',
        },
        secondary: {
          DEFAULT: '#0284c7', // Healthcare blue
          hover: '#0369a1',
          light: '#f0f9ff',
        },
        mint: {
          50: '#f2fbfc',
          100: '#e6f8fa',
          200: '#c5eaf0',
          300: '#99d9e4',
          400: '#5cbed0',
          500: '#00a8b5',
          600: '#00929e',
          700: '#007a84',
          800: '#045e67',
          900: '#084f57',
        }
      }
    },
  },
  plugins: [],
}
