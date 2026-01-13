/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      /* ---------------- FONTS (UNCHANGED) ---------------- */
      fontFamily: {
        fangsong: ["fangsong", "serif", "DM Sans"],
      },

      /* ---------------- EXISTING COLORS (UNCHANGED) ---------------- */
      colors: {
        heading: "#9333ea",
        text: "#ffffff",
        black: "#000000",
        dec: "#cbd5e1",
        card: "#9333ea",
        card1: "#191c23",

        /* ---------------- 🌗 THEME COLORS (ADDED ONLY) ---------------- */
        background: "var(--bg)",
        surface: "var(--surface)",
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
      },

      /* ---------------- BORDER RADIUS (UNCHANGED) ---------------- */
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      /* ---------------- ANIMATION (UNCHANGED) ---------------- */
      animation: {
        float: "float 6s ease-in-out infinite",
      },

      /* ---------------- KEYFRAMES (UNCHANGED) ---------------- */
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
