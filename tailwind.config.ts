import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f6f7fb",
          100: "#e9ecf5",
          200: "#cfd6ea",
          300: "#aab6d6",
          400: "#7b8ec0",
          500: "#5a6ea8",
          600: "#465686",
          700: "#364268",
          800: "#27304c",
          900: "#1b2236",
        },
        mint: {
          400: "#38e2a5",
          500: "#12c98b",
        },
        sunset: {
          300: "#ffb26f",
          400: "#ff9061",
          500: "#ff6b6b",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.04), 0 12px 30px rgba(7,12,32,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
