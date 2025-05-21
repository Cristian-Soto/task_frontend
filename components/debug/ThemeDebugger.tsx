"use client";

import { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useThemeContext';

export default function ThemeDebugger() {
  const { theme, setTheme } = useTheme();
  const [actualMode, setActualMode] = useState<string>('');
  const [systemPreference, setSystemPreference] = useState<string>('');
  const [localStorageTheme, setLocalStorageTheme] = useState<string>('');
  const [htmlClasses, setHtmlClasses] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      // Verificar preferencia del sistema
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setSystemPreference(isDarkMode ? 'dark' : 'light');
      
      // Verificar localStorage
      try {
        const savedTheme = localStorage.getItem('theme');
        setLocalStorageTheme(savedTheme || 'no hay valor guardado');
      } catch (e) {
        setLocalStorageTheme('error al leer localStorage');
      }
      
      // Verificar clases en el HTML
      setHtmlClasses(document.documentElement.className);
      // Verificar el tema realmente aplicado
      setActualMode(document.documentElement.classList.contains('dark') ? 'dark aplicado' : 'light aplicado');
    }
  }, []);

  // Actualizar cuando cambie el tema
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      setHtmlClasses(document.documentElement.className);
      setActualMode(document.documentElement.classList.contains('dark') ? 'dark aplicado' : 'light aplicado');
    }
  }, [theme, mounted]);

  if (!mounted) {
    return <div>Cargando...</div>;
  }
  return (
    <div className="border border-primary dark:border-gray-600 p-4 my-4 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      <h2 className="text-xl font-bold mb-4">Depurador de Tema</h2>
      <div className="grid grid-cols-1 gap-2">
        <div className="flex justify-between">
          <span className="font-semibold">Estado de tema:</span>
          <span>{theme}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Tema aplicado:</span>
          <span>{actualMode}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Preferencia del sistema:</span>
          <span>{systemPreference}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Tema en localStorage:</span>
          <span>{localStorageTheme}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Clases HTML:</span>
          <span className="text-sm">{htmlClasses}</span>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <button 
          onClick={() => setTheme('light')}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Aplicar tema claro
        </button>
        <button 
          onClick={() => setTheme('dark')}
          className="px-3 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition dark:bg-gray-700 dark:hover:bg-gray-800"
        >
          Aplicar tema oscuro
        </button>
        <button 
          onClick={() => setTheme('system')}
          className="px-3 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          Usar tema del sistema
        </button>
        <button 
          onClick={() => {
            // Actualizar los estados actuales
            setHtmlClasses(document.documentElement.className);
            setActualMode(document.documentElement.classList.contains('dark') ? 'dark aplicado' : 'light aplicado');
            try {
              const savedTheme = localStorage.getItem('theme');
              setLocalStorageTheme(savedTheme || 'no hay valor guardado');
            } catch (e) {
              setLocalStorageTheme('error al leer localStorage');
            }
          }}
          className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition dark:bg-green-600 dark:hover:bg-green-700 mt-2"
        >
          Actualizar información
        </button>
      </div>
    </div>
  );
}
