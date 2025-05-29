import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        beamin: "#3AC5C9",
        "beamin-50": "#ebebeb",
      },
      animation: {
        "loading-bar": "loading-bar 2s ease-in-out infinite",
        "float-1": "float-1 3s ease-in-out infinite",
        "float-2": "float-2 2.5s ease-in-out infinite 0.5s",
        "float-3": "float-3 2.8s ease-in-out infinite 1s",
        reverse: "spin 1s linear infinite reverse",
      },
      keyframes: {
        "loading-bar": {
          "0%": { transform: "translateX(-100%)" },
          "50%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "float-1": {
          "0%, 100%": {
            transform: "translateY(0px) rotate(0deg)",
            opacity: "0.5",
          },
          "50%": {
            transform: "translateY(-10px) rotate(180deg)",
            opacity: "1",
          },
        },
        "float-2": {
          "0%, 100%": {
            transform: "translateY(0px) rotate(0deg)",
            opacity: "0.3",
          },
          "50%": {
            transform: "translateY(-15px) rotate(-180deg)",
            opacity: "0.8",
          },
        },
        "float-3": {
          "0%, 100%": {
            transform: "translateY(0px) rotate(0deg)",
            opacity: "0.4",
          },
          "50%": {
            transform: "translateY(-8px) rotate(360deg)",
            opacity: "0.9",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
