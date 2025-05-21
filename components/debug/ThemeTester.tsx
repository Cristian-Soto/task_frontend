"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useThemeContext';

interface ThemeTesterProps {
  className?: string;
}

/**
 * Componente para probar rápidamente los diferentes modos de tema en varios elementos UI
 */
export default function ThemeTester({ className = '' }: ThemeTesterProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={`border border-border dark:border-gray-700 rounded-md p-4 ${className}`}>
      <h2 className="text-lg font-bold mb-4 text-foreground">Verificador de Compatibilidad de Modo Oscuro</h2>
      
      <div className="space-y-6">
        {/* Botones de alternancia de tema */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setTheme('light')}
            className={`px-3 py-2 rounded-md ${
              theme === 'light' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            Tema Claro
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`px-3 py-2 rounded-md ${
              theme === 'dark' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            Tema Oscuro
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`px-3 py-2 rounded-md ${
              theme === 'system' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            Preferencia del Sistema
          </button>
        </div>
        
        {/* Elementos de prueba para revisar el modo oscuro */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tarjeta de ejemplo */}
          <div className="rounded-lg border border-border dark:border-gray-700 shadow-sm p-4 bg-white dark:bg-gray-800">
            <h3 className="text-foreground font-semibold mb-2">Tarjeta Básica</h3>
            <p className="text-muted-foreground">Este es un ejemplo de tarjeta con texto descriptivo</p>
          </div>
          
          {/* Campos de formulario */}
          <div className="rounded-lg border border-border dark:border-gray-700 shadow-sm p-4 bg-white dark:bg-gray-800">
            <h3 className="text-foreground font-semibold mb-2">Campos de Formulario</h3>
            <div className="space-y-2">
              <input 
                type="text" 
                placeholder="Texto de ejemplo" 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                <option>Opción 1</option>
                <option>Opción 2</option>
              </select>
            </div>
          </div>
          
          {/* Botones */}
          <div className="rounded-lg border border-border dark:border-gray-700 shadow-sm p-4 bg-white dark:bg-gray-800">
            <h3 className="text-foreground font-semibold mb-2">Botones</h3>
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Primario</button>
              <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md">Secundario</button>
              <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-border dark:border-gray-600 text-foreground rounded-md">Normal</button>
              <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md">Destructivo</button>
            </div>
          </div>
          
          {/* Textos */}
          <div className="rounded-lg border border-border dark:border-gray-700 shadow-sm p-4 bg-white dark:bg-gray-800">
            <h3 className="text-foreground font-semibold mb-2">Tipografía</h3>
            <h4 className="text-foreground font-medium">Título de muestra</h4>
            <p className="text-foreground">Texto regular en color principal</p>
            <p className="text-muted-foreground">Texto secundario o muted</p>
            <a href="#" className="text-primary hover:underline">Enlace de ejemplo</a>
          </div>
        </div>
        
        {/* Estado actual */}
        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md text-sm">
          <p className="text-foreground">Tema actual: <span className="font-bold">{theme}</span></p>
          <p className="text-muted-foreground text-xs mt-1">
            {theme === 'system' ? 'Usando la preferencia del sistema' : 
             theme === 'dark' ? 'Usando modo oscuro explícitamente' : 
             'Usando modo claro explícitamente'}
          </p>
        </div>
      </div>
    </div>
  );
}
