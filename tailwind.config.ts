import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        accent: {
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
        },
        ink: {
          950: "#070b1a",
          900: "#0b1124",
          800: "#111935",
          700: "#1a2347",
          600: "#27315a",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "ui-sans-serif",
          "system-ui",
          "Apple SD Gothic Neo",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(99,102,241,.25), 0 10px 40px -10px rgba(99,102,241,.45)",
        "glow-sm": "0 0 0 1px rgba(99,102,241,.18), 0 6px 20px -8px rgba(99,102,241,.4)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 50px -20px rgba(2,6,23,0.6)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse at top, rgba(99,102,241,0.18), transparent 55%), radial-gradient(ellipse at bottom right, rgba(34,211,238,0.12), transparent 50%)",
      },
      animation: {
        "fade-up": "fade-up .5s ease-out both",
        shimmer: "shimmer 2.4s linear infinite",
        ripple: "ripple .55s ease-out forwards",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        ripple: {
          "0%": { transform: "scale(0)", opacity: "0.55" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.65" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
