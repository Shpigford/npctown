import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["Menlo", "Monaco", "Courier New", "monospace"],
      },
      animation: {
        "text-glow": "text-glow 2s ease-in-out infinite alternate",
        "cursor-blink": "cursor-blink 1s infinite",
        "fade-in": "fade-in 0.3s ease-in-out",
      },
      keyframes: {
        "text-glow": {
          "0%": { opacity: "0.7" },
          "100%": { opacity: "1" },
        },
        "cursor-blink": {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;