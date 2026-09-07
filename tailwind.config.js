/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gem: {
          pink: "#ec4899",
          magenta: "#db2777",
          deepPink: "#be185d",
          lightPink: "#fbcfe8",
          blush: "#fce7f3",
          black: "#09090b",
          dark: "#121215",
          charcoal: "#18181b",
          card: "#141419",
          border: "#27272a",
          gold: "#eab308",
          champagne: "#f5f5f4",
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'pink-glow': '0 0 25px -5px rgba(236, 72, 153, 0.4)',
        'pink-glow-lg': '0 0 40px -10px rgba(236, 72, 153, 0.6)',
        'crystal': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s infinite ease-in-out',
        'float': 'float 6s infinite ease-in-out',
        'fade-in': 'fadeIn 0.3s ease-out both',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', filter: 'blur(20px)' },
          '50%': { opacity: '0.8', filter: 'blur(30px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      }
    },
  },
  plugins: [],
}
