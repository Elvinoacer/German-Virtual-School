/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#135bec",
          hover: "#0f4bc2",
        },
        "primary-hover": "#0f4bc2",
        background: {
          light: "#f6f6f8",
          dark: "#101622",
        },
        "background-light": "#f6f6f8",
        "background-dark": "#101622",
        surface: {
          light: "#ffffff",
          dark: "#1a2230",
        },
        card: {
          light: "#ffffff",
          dark: "#1a2230",
        },
        "card-light": "#ffffff",
        "card-dark": "#1a2230",
        border: {
          light: "#e7ebf3",
          dark: "#2d3748",
        },
        "border-light": "#e7ebf3",
        "border-dark": "#2d3748",
        text: {
          main: "#0d121b",
          subtle: "#4f5b6e",
          "dark-main": "#f8f9fc",
          "dark-subtle": "#9ca3af",
        },
        "text-main": "#0d121b",
        "text-subtle": "#4f5b6e",
        "text-dark-main": "#f8f9fc",
        "text-dark-subtle": "#9ca3af",
      },
      fontFamily: {
        display: ["Lexend", "sans-serif"],
        body: ["Noto Sans", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
