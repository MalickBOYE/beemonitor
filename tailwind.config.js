/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bee: {
          dark: '#020617',    // Fond très sombre
          panel: 'rgba(15, 23, 42, 0.6)', // Effet verre
          gold: '#fbbf24',    // Jaune miel
          goldHover: '#d97706',
          accent: '#3b82f6',  // Bleu technique
          danger: '#ef4444',  // Rouge alerte
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
