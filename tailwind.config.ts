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
        // Core
        background: "#F7F8FA",
        foreground: "#1F2937",
        // Primary Gold Accents
        primary: "#4C7111",
        brand: {
          deep: "#3D5A0E",
          dark: "#2F450B",
          hover: "#3D5A0E",
        },
        // Text
        secondary: "#667085",
        muted: "#8A93A3",
        // Borders
        border: "#E2E5E9",
        "border-soft": "#E9E9E6",
        // Surfaces
        surface: {
          50: "#F4F8EF",
          100: "#FFFFFF",
          200: "#FAFBFC",
        },
        // Accents / status
        accent: {
          green: "#3F7D4A",   // success / ready
          warning: "#C58A16", // awaiting parts
          error: "#C94A4A",   // error / danger
          steel: "#3976A8",   // info
          // Legacy aliases so existing code doesn't break
          rust: "#C94A4A",
          amber: "#C58A16",
        },
      },
      fontFamily: {
        display: ["var(--font-montserrat)", "sans-serif"],
        sans: ["var(--font-montserrat)", "sans-serif"],
        arabic: ["var(--font-montserrat)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
