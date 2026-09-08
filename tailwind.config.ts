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
        foreground: "#111827",
        // Primary Brand Forest Green
        primary: "#3D5A0E",
        brand: {
          deep: "#2D420A",
          dark: "#1F2E07",
          hover: "#2D420A",
        },
        // Text
        secondary: "#374151",
        muted: "#4B5563",
        // Borders
        border: "#D1D5DB",
        "border-soft": "#E5E7EB",
        // Surfaces
        surface: {
          50: "#F4F8EF",
          100: "#FFFFFF",
          200: "#F0F4EC",
        },
        // Accents / status
        accent: {
          green: "#2E6838",
          warning: "#B45309",
          error: "#B91C1C",
          steel: "#1D4ED8",
          rust: "#B91C1C",
          amber: "#B45309",
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
