/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
    './stores/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          burgundy: "#6E1F2A",
          "burgundy-hover": "#581821",
          "burgundy-light": "#F7EEF0",
        },
        warm: {
          bg: "#FCFBF8",
          surface: "#F5F2EF",
          border: "#E7E2DE",
          text: "#191716",
          muted: "#6F6A67",
        },
        status: {
          success: "#2F7D5B",
          warning: "#B7791F",
          error: "#B54747",
          info: "#41658A",
        }
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(25, 23, 22, 0.05), 0 1px 2px rgba(25, 23, 22, 0.03)",
        card: "0 4px 12px rgba(25, 23, 22, 0.06)",
        modal: "0 12px 32px rgba(25, 23, 22, 0.12)",
      }
    },
  },
  plugins: [],
}
