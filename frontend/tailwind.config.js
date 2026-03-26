module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#060D1A",
          800: "#0A1628",
          700: "#0D1F3C",
          600: "#112447",
          500: "#1A3260",
        },
        cyan: {
          400: "#4DFFD2",
          500: "#00E5CC",
          600: "#00C4AE",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}