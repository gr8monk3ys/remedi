import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        aurora: "aurora 60s linear infinite",
      },
      keyframes: {
        aurora: {
          from: {
            backgroundPosition: "50% 50%, 50% 50%",
          },
          to: {
            backgroundPosition: "350% 50%, 350% 50%",
          },
        },
      },
      colors: {
        transparent: "transparent",
        white: "#ffffff",
        black: "#000000",
        surface: "var(--surface)",
        "surface-alt": "var(--surface-alt)",
        primary: "var(--primary)",
        "primary-light": "var(--primary-light)",
        "primary-dark": "var(--primary-dark)",
        "primary-surface": "var(--primary-surface)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        foreground: "var(--foreground)",
        "foreground-muted": "var(--foreground-muted)",
        "foreground-subtle": "var(--foreground-subtle)",
      },
      borderRadius: {
        neu: "16px",
        "neu-sm": "12px",
        "neu-lg": "24px",
        "neu-pill": "9999px",
      },
    },
  },
  darkMode: "media",
  plugins: [],
};

export default config;
