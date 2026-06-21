/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        teal: {
          DEFAULT: '#0F766E',
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        gold: {
          DEFAULT: '#D4A853',
          50: '#FDF8EF',
          100: '#FAF0D8',
          200: '#F4DFB0',
          300: '#EDCC83',
          400: '#D4A853',
          500: '#C49230',
          600: '#A87324',
          700: '#8A5720',
          800: '#724621',
          900: '#603B20',
        },
        surface: '#F8FAFB',
      },
    },
  },
  plugins: [],
};
