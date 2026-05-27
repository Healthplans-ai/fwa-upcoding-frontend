/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // healthplans.ai palette — same as fwa-dedup-front so the two
        // dashboards read as one product family.
        hp: {
          bg:    "#FBFCFA",
          text:  "#0D1A13",
          sky:   "#A2CFE1",
          light: "#DEEDF3",
          deep:  "#1C5577",
          mint:  "#0AF084",
          black: "#000000",
        },
        "hp-bg":    "#FBFCFA",
        "hp-text":  "#0D1A13",
        "hp-sky":   "#A2CFE1",
        "hp-light": "#DEEDF3",
        "hp-deep":  "#1C5577",
        "hp-mint":  "#0AF084",
        "hp-black": "#000000",

        forest: {
          50:  "#F1F5F3", 100: "#DCE6E0", 200: "#B7CCC2", 300: "#86A99B",
          400: "#587D70", 500: "#33574A", 600: "#1F3A2F", 700: "#172A22",
          800: "#11201A", 900: "#0D1A13", 950: "#06120E",
        },
        cream: {
          50: "#FFFFFF", 100: "#FBFCFA", 200: "#F2F6F4",
          300: "#DEEDF3", 400: "#C7DEEA",
        },
        mint: {
          50: "#E6FBEF", 100: "#C9F8DD", 200: "#9FF1C2", 300: "#5FE8A2",
          400: "#0AF084", 500: "#08C76C", 600: "#069E55", 700: "#057A41",
        },
        sky: {
          400: "#A2CFE1", 500: "#7BB8D0", 600: "#4F95B5", 700: "#1C5577",
        },
        ink: { soft: "#3F4D49", muted: "#7A8884" },
      },
      fontFamily: {
        sans:    ['"Figtree"', '"Arimo"', "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Figtree"', "ui-sans-serif", "system-ui", "sans-serif"],
        body:    ['"Arimo"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono:    ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: { "display": "-0.02em", "tight-2": "-0.04em" },
      borderRadius: { "pill": "300px" },
      boxShadow: {
        "card":   "0 1px 2px rgba(13,26,19,0.04), 0 12px 32px -16px rgba(13,26,19,0.12)",
        "raised": "0 1px 3px rgba(13,26,19,0.06), 0 20px 50px -20px rgba(13,26,19,0.18)",
        "mint":   "0 0 0 1px rgba(10,240,132,0.30), 0 12px 36px -12px rgba(10,240,132,0.40)",
        "ink":    "0 0 0 1px rgba(13,26,19,0.10), 0 16px 40px -16px rgba(13,26,19,0.45)",
        "sky":    "0 0 0 1px rgba(162,207,225,0.40), 0 16px 40px -20px rgba(28,85,119,0.30)",
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out",
        "shimmer": "shimmer 2.4s linear infinite",
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
    },
  },
  plugins: [],
};
