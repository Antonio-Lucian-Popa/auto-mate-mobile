/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: "#0B0F19", soft: "#111726", card: "#161D2E", elevated: "#1C2538" },
        line: "#26304A",
        brand: { DEFAULT: "#5B8DEF", soft: "#3B6FD4", glow: "#7FA8FF" },
        ok: "#34D399",
        warn: "#FBBF24",
        danger: "#F87171",
        ink: { DEFAULT: "#F4F7FF", soft: "#AEB8D0", faint: "#6B7693" },
      },
      borderRadius: { xl: "20px", "2xl": "28px" },
      fontFamily: { sans: ["System"] },
    },
  },
  plugins: [],
};
