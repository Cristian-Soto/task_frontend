"use client";

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// Valor predeterminado para el contexto
const defaultTheme: Theme = 'system';

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => null
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {  const [theme, setTheme] = useState<Theme>(defaultTheme);
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
    
    console.log('[ThemeContext] Aplicando tema:', themeToApply);
    root.classList.add(themeToApply);
    
    // También actualizar el atributo data-theme para mejor compatibilidad
    root.setAttribute('data-theme', themeToApply);
    
    // Guardar en localStorage
    try {
      localStorage.setItem('theme', newTheme);
    } catch (e) {
      console.error('[ThemeContext] Error al guardar tema en localStorage:', e);
    }
    
    // Disparar un evento personalizado para notificar cambios de tema
    if (typeof window.CustomEvent === 'function') {
      window.dispatchEvent(new CustomEvent('themechange', { 
        detail: { theme: themeToApply } 
      }));
    }
  };

  // Efecto para cargar el tema desde localStorage al inicio
  useEffect(() => {
    // Verificar que estamos en el cliente
    if (typeof window === 'undefined') return;
    
    // Marcar como montado
    setMounted(true);
    
    try {
      // Intentar obtener el tema guardado en localStorage
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        console.log('Cargando tema guardado:', savedTheme);
        setTheme(savedTheme);
        applyTheme(savedTheme);
      } else {
        console.log('No hay tema guardado o es inválido, usando sistema');
        // Si no hay tema guardado o no es válido, usar el del sistema
        setTheme(defaultTheme);
        applyTheme(defaultTheme);
      }
    } catch (error) {
      console.error('Error al cargar el tema:', error);
      // Si hay un error, aplicar el tema del sistema
      setTheme(defaultTheme);
      applyTheme(defaultTheme);
    }
    
    // Este efecto solo debe ejecutarse una vez al montar
  }, []);
  // Efecto para actualizar el tema cuando cambia
  useEffect(() => {
    if (mounted) {
      console.log('[ThemeContext] Actualizando tema a:', theme);
      applyTheme(theme);
    }
  }, [theme, mounted]);
  // Efecto para escuchar cambios en las preferencias del sistema
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const newMode = mediaQuery.matches ? 'dark' : 'light';
        console.log('Preferencia del sistema cambiada a:', newMode);
        applyTheme('system');
      }
    };
    
    // Usar el método correcto basado en la compatibilidad del navegador
    try {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (e) {
      // Para navegadores más antiguos
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
