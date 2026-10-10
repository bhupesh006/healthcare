/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0284c7', // Healthcare blue (sky-600)
          hover: '#0369a1', // sky-700
          light: '#e0f2fe', // sky-100
        },
        secondary: {
          DEFAULT: '#0d9488', // Teal
          hover: '#0f766e',
        },
      }
    },
  },
  plugins: [],
}
