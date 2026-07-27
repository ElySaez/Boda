import type { Config } from "tailwindcss";

// Paleta de la boda: rosa Barbie, naranja/coral, blanco y dorado.
// Cada color se define como escala 50-900 para tener suficiente rango
// de contraste (accesibilidad) sin salir de la identidad visual pedida.
const config: Config = {
  darkMode: "media",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        barbie: {
          50: "#fff0f7",
          100: "#ffe0ef",
          200: "#ffb8db",
          300: "#ff8ac2",
          400: "#fd5aa8",
          500: "#e0218a", // color base "rosa Barbie"
          600: "#c1156f",
          700: "#9c1059",
          800: "#7a0d46",
          900: "#5c0a35",
        },
        coral: {
          50: "#fff3f0",
          100: "#ffe1da",
          200: "#ffbcac",
          300: "#ff9580",
          400: "#ff7a5c",
          500: "#ff6f61", // color base coral
          600: "#e5533f",
          700: "#bd3f2d",
          800: "#8f2f22",
          900: "#69231a",
        },
        sunset: {
          50: "#fff7ed",
          100: "#ffedd4",
          200: "#ffd9a8",
          300: "#ffbe70",
          400: "#ffa03f",
          500: "#ff8c42", // color base naranja
          600: "#e5701f",
          700: "#bd5717",
          800: "#8f4113",
          900: "#69300f",
        },
        gold: {
          50: "#fdf9ec",
          100: "#faf0c9",
          200: "#f2dd8f",
          300: "#e9c757",
          400: "#dfb43a",
          500: "#d4af37", // color base dorado
          600: "#ad8a24",
          700: "#87681c",
          800: "#634c16",
          900: "#443411",
        },
        cream: {
          50: "#fffdfb",
          100: "#fff9f5", // fondo claro principal
          200: "#fef2ea",
          300: "#fbe6d8",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "gentle-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s ease-out both",
        "gentle-float": "gentle-float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
