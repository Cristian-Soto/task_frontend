"use client";

import { useTheme } from '@/hooks/useThemeContext';
import { useState, useEffect } from 'react';

export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // Estado para seguir el tema actual aplicado
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  
  // Evitar renderizado en el servidor para prevenir problemas de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Actualizar el estado local cada vez que cambie el tema o después de montarse
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      console.log('[DarkModeToggle] Estado actual del tema:', isDark ? 'oscuro' : 'claro', 'Actualización #:', updateCount);
      setIsDarkMode(isDark);
    }
  }, [theme, mounted, updateCount]);

  // Función para alternar entre temas de forma más robusta
  const toggleTheme = () => {
    // Leer el estado actual directamente del DOM para mayor precisión
    const currentIsDark = document.documentElement.classList.contains('dark');
    
    // Cambiar al tema opuesto
    const newTheme = currentIsDark ? 'light' : 'dark';
    console.log('[DarkModeToggle] Cambiando tema de:', currentIsDark ? 'oscuro' : 'claro', 'a:', newTheme);
    
    // Actualizar el tema
    setTheme(newTheme);
    
    // Forzar actualización de la UI con un pequeño retraso
    setTimeout(() => {
      setUpdateCount(prev => prev + 1);
    }, 50);
  };
  if (!mounted) {
    // Renderizar un placeholder mientras se carga para evitar saltos en la UI
    return <div className="w-10 h-10"></div>;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Botón con íconos para alternar tema */}
      <button
        onClick={() => {
          // Verificar el estado actual antes de cambiar
          console.log('[DarkModeToggle] Estado real antes de toggle:', document.documentElement.classList.contains('dark') ? 'oscuro' : 'claro');
          toggleTheme();
        }}
        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        type="button"
      >
        {isDarkMode ? (
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
      
      {/* Texto informativo sobre el modo actual */}
      <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:inline-block">
        {isDarkMode ? 'Modo oscuro' : 'Modo claro'}
      </span>
    </div>
  );
}