"use client";

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);
  // Aplicar el tema al HTML según la selección del usuario o preferencia del sistema
  const applyTheme = (newTheme: Theme) => {
    if (typeof window === 'undefined') return;
    
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    let themeToApply = newTheme;
    
    if (newTheme === 'system') {
      themeToApply = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    console.log('Aplicando tema:', themeToApply);
    root.classList.add(themeToApply);
    
    // Guardar en localStorage
    try {
      localStorage.setItem('theme', newTheme);
    } catch (e) {
      console.error('Error al guardar tema en localStorage:', e);
    }
  };  // Efecto para cargar el tema desde localStorage al inicio
  useEffect(() => {
    // Marcar como montado
    setMounted(true);
    
    try {
      // Intentar obtener el tema guardado en localStorage
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      
      if (savedTheme) {
        console.log('Cargando tema guardado:', savedTheme);
        setTheme(savedTheme);
        applyTheme(savedTheme);
      } else {
        console.log('No hay tema guardado, usando sistema');
        // Si no hay tema guardado, usar el del sistema
        applyTheme('system');
      }
    } catch (error) {
      console.error('Error al cargar el tema:', error);
      // Si hay un error, aplicar el tema del sistema
      applyTheme('system');
    }
    
    // Este efecto solo debe ejecutarse una vez al montar
  }, []);

  // Efecto para actualizar el tema cuando cambia
  useEffect(() => {
    if (mounted) {
      applyTheme(theme);
    }
  }, [theme, mounted]);

  // Efecto para escuchar cambios en las preferencias del sistema
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
