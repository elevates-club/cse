import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#0a0a0f",
        surface: "#111118",
        glass: "rgba(255,255,255,0.05)",
        accent: "#6C63FF",
        gold: "#F5C518",
        muted: "#888899",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        handwriting: ["var(--font-caveat)", "cursive"],
      },
    },
  },
  plugins: [],
};
export default config;
