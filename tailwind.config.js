/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          950: "#030712",
          900: "#0a0f1a",
          850: "#0f1629",
          800: "#111827",
          750: "#162032",
          700: "#1e293b",
          600: "#283548",
          500: "#334155",
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(16, 185, 129, 0.15)",
        "glow-lg": "0 0 40px rgba(16, 185, 129, 0.2)",
        "glow-blue": "0 0 20px rgba(59, 130, 246, 0.15)",
        float: "0 20px 60px rgba(0, 0, 0, 0.3)",
        soft: "0 4px 24px rgba(0, 0, 0, 0.25)",
        card: "0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.24)",
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Cascadia Code"', "monospace"],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-fast": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(100%)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.85)" },
        },
        "progress-shrink": {
          from: { width: "100%" },
          to: { width: "0%" },
        },
        "bar-grow": {
          from: { transform: "scaleY(0)" },
          to: { transform: "scaleY(1)" },
        },
        "donut-draw": {
          from: { strokeDashoffset: "251.2" },
          to: { strokeDashoffset: "var(--target-offset)" },
        },
        "counter-tick": {
          from: { opacity: "0.6", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "fade-in-fast": "fade-in-fast 0.2s ease-out both",
        "slide-in-right": "slide-in-right 0.35s cubic-bezier(0.21,1.02,0.73,1)",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "scale-in": "scale-in 0.25s ease-out both",
        shimmer: "shimmer 2s linear infinite",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
        "progress-shrink": "progress-shrink linear forwards",
        "bar-grow": "bar-grow 0.6s ease-out both",
        "donut-draw": "donut-draw 1s ease-out both",
        "counter-tick": "counter-tick 0.15s ease-out",
      },
    },
  },
  plugins: [],
};
