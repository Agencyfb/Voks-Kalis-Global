/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#A15912",
          light: "#CB843F",
          dark: "#78400B",
        },
        sand: "#F5F5F5",
        gold: {
          DEFAULT: "#CB843F",
          light: "#E5B27D",
        },
        cream: "#FAFAFA",
        ink: "#242424",
        clay: "#A15912",
        "brand-copper": "#CB843F",
        "brand-copper-dark": "#A15912",
        "brand-copper-subtle": "#FBF2E9",
        "surface-page": "#FAFAFA",
        "surface-card": "#FFFFFF",
        "surface-subtle": "#F5F5F5",
        "text-primary": "#242424",
        "text-secondary": "#666666",
        "text-inverse": "#FFFFFF",
        "border-default": "#E0E0E0",
        "status-approved": "#246B4D",
        "status-approved-subtle": "#EAF5EE",
        "status-pending": "#8A5A12",
        "status-pending-subtle": "#FFF4DD",
        "status-declined": "#B33B3B",
        "status-declined-subtle": "#FCEDED",
        "status-sold": "#405A8A",
        "status-sold-subtle": "#EDF2FA",
      },
      fontFamily: {
        display: ["var(--font-poppins)", "sans-serif"],
        body: ["var(--font-poppins)", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      backgroundImage: {
        "grain": "radial-gradient(circle at 1px 1px, rgba(29,37,33,0.06) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};
