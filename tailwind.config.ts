import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0C0C0C",
        foreground: "#F5F5F0",
        primary: "#D4AF37", // Warm amber / muted gold
        secondary: "#8A8A93", // Muted steel gray
        accent: {
          amber: "#D4AF37",
          rust: "#8B3A3A",
          steel: "#4A6B82",
          green: "#4F6B56"
        },
        surface: {
          50: "#121212",
          100: "#1A1A1A",
          200: "#222222",
        }
      },
      fontFamily: {
        display: ['var(--font-oswald)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
};
export default config;
