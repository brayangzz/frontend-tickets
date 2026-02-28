/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  
  // 🔥 ESTA LÍNEA ES LA CLAVE.
  // Si no está, Tailwind obedece a tu PC, no al botón.
  darkMode: 'class', 

  theme: {
    extend: {
      colors: {
        background: "var(--bg-background)",
        card: "var(--bg-card)",
        primary: {
          DEFAULT: "#137fec", // Tu azul exacto
          foreground: "var(--text-primary)",
        },
        secondary: {
          DEFAULT: "var(--text-secondary)",
        },
        border: "var(--border-color)",
      },
      textColor: {
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
      }
    },
  },
  plugins: [],
}