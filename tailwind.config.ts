import type { Config } from "tailwindcss";

import { nextui } from "@nextui-org/react";

export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // single component styles

    "./node_modules/@nextui-org/theme/dist/components/**/*.js",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#7c3aed",
        "primary-glow": "#a78bfa",
        secondary: "#8b5cf6",
        accent: "#f59e0b",
        "accent-glow": "#fbbf24",
        background: "#ffffff",
        surface: "#f8fafc",
        text: "#1e293b",
        "text-muted": "#64748b",
        border: "#e2e8f0",
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "pulse-slow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-gentle": "bounce 1.5s infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [nextui()],
} satisfies Config;
