import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#102a36",
        field: "#f0fbff",
        sport: {
          green: "#38BDF8",
          mint: "#E0F7FF",
          blue: "#0284C7",
          sky: "#E0F7FF",
          dark: "#0284C7",
          light: "#E0F7FF",
          accent: "#06B6D4",
          coral: "#ff6b57",
          gold: "#f5b942"
        }
      },
      boxShadow: {
        soft: "0 18px 50px rgba(2, 132, 199, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
