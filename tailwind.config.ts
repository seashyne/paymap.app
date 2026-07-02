import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "Noto Sans Thai", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      colors: {
        bg:      "#0a0b11",
        surface: "#10111a",
        s2:      "#151620",
        s3:      "#1b1d28",
        border:  "#23263a",
        amber: {
          DEFAULT: "#f59e0b",
          light:   "#fbbf24",
          dim:     "rgba(245,158,11,0.12)",
        },
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease both",
        shimmer:   "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
