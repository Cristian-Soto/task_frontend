"use client";

import { useTheme } from '@/hooks/useThemeContext';
import { useState, useEffect } from 'react';

export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar renderizado en el servidor para prevenir problemas de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);  // Función para alternar entre temas de forma más robusta
  const toggleTheme = () => {
    console.log('Estado actual del tema:', theme);
    
    if (theme === 'dark') {
      console.log('Cambiando a tema claro');
      setTheme('light');
    } else {
      console.log('Cambiando a tema oscuro');
      setTheme('dark');
    }
  };

  if (!mounted) {
    // Renderizar un placeholder mientras se carga para evitar saltos en la UI
    return <div className="w-10 h-10"></div>;
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={theme}
        onChange={(e) => {
          const newTheme = e.target.value as 'light' | 'dark' | 'system';
          console.log('Seleccionando tema:', newTheme);
          setTheme(newTheme);
        }}
        className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="light">Claro</option>
        <option value="dark">Oscuro</option>
        <option value="system">Sistema</option>
      </select>
      
      {/* Botón alternativo con íconos */}      <button
        onClick={toggleTheme}
        className="p-2 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
        aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {theme === 'dark' ? (
          // Ícono de sol para modo claro
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
          </svg>
        ) : (
          // Ícono de luna para modo oscuro
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
          </svg>
        )}
      </button>
    </div>
  );
}