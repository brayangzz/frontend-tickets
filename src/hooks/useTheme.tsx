import { useEffect, useState } from "react";

export function useTheme() {
  // 1. Leemos la preferencia guardada o usamos "light" por defecto
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  // 2. Este efecto se ejecuta cada vez que 'theme' cambia
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Quitamos ambas clases para evitar conflictos
    root.classList.remove("light", "dark");
    
    // Agregamos la clase actual al <html>
    root.classList.add(theme);
    
    // Guardamos en memoria para la próxima vez
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 3. Función para alternar
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return { theme, toggleTheme };
}