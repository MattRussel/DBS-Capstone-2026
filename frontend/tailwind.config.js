/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        earth: {
          primary: '#7A8C5C', // Olive Green
          background: '#F5F0E8', // Cream/Off-white
          cta: '#2C1A0E', // Dark Brown
          accent: '#C4621D', // Warm Orange
          error: '#FDE8DC', // Light Salmon
          text: {
            primary: '#2C1A0E', // Dark Brown
            secondary: '#6B5C4E', // Muted/Placeholder text
          },
          border: {
            active: '#7A8C5C', // Olive Green
            default: '#D6CFC4', // Grey-Cream
          }
        }
      }
    },
  },
  plugins: [],
}