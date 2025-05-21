/**
 * @file DOCUMENTATION.md
 * @description Documentación general del proyecto Task Manager Frontend
 * @author Cristian Soto
 * @version 1.1.0
 * @lastModified 2025-05-21
 */

# Documentación del Proyecto Task Manager

## Introducción

Task Manager es una aplicación web moderna para la gestión de tareas personales y profesionales. La aplicación permite a los usuarios gestionar sus tareas de manera eficiente con una interfaz atractiva y funcional.

## Estructura de Archivos

La aplicación sigue la estructura recomendada por Next.js con las siguientes carpetas principales:

- **components/**: Componentes reutilizables de React
  - **auth/**: Componentes relacionados con autenticación
  - **dashboard/**: Componentes para el tablero principal
  - **tasks/**: Componentes para la gestión de tareas
- **public/**: Archivos estáticos (imágenes, CSS, etc.)
- **src/**: Código fuente de la aplicación
  - **app/**: Páginas y rutas (Next.js App Router)
  - **hooks/**: Hooks personalizados de React
  - **service/**: Servicios para comunicación con la API
  - **utils/**: Utilidades y funciones auxiliares

## Componentes Principales

### Auth

- **LoginForm**: Formulario de inicio de sesión con validación y soporte para credenciales de prueba
- **RegisterForm**: Formulario de registro con validación completa de todos los campos
- **AuthCheck**: Componente de middleware para proteger rutas privadas

### Dashboard

- **Header**: Barra superior con opciones de usuario y navegación
- **Sidebar**: Menú lateral con enlaces a secciones principales
- **DarkModeToggle**: Botón para alternar entre tema claro y oscuro

### Tasks

- **TasksList**: Lista de tareas con opciones de filtrado
- **TaskCard**: Tarjeta individual para mostrar detalles de una tarea
- **TaskForm**: Formulario para crear y editar tareas

## Estilos

Los estilos están implementados con una combinación de:

- **Tailwind CSS**: Para estructura básica y componentes
- **CSS Modules**: Para estilos específicos de componentes
- **auth-styles.css**: Estilos personalizados para formularios de autenticación

## Estados y Hooks

La aplicación utiliza hooks personalizados para gestionar el estado:

- **useTaskStore**: Hook para gestionar el estado de las tareas
- **useTaskStats**: Hook para calcular estadísticas de tareas
- **useThemeContext**: Hook para gestionar el tema (claro/oscuro)

## Mejoras de Interfaz

La interfaz de usuario incluye:

- **Temas**: Soporte para tema claro y oscuro
- **Iconos SVG**: Iconos personalizados para una experiencia visual mejorada
- **Fondos**: Fondos personalizados para las páginas de autenticación
- **Efectos visuales**: Transiciones, efectos hover y sombras
- **Feedback**: Notificaciones toast para informar al usuario

## Consideraciones de Accesibilidad

- Contraste suficiente entre texto y fondo
- Etiquetas en campos de formulario
- Indicadores visuales para estados de error
- Textos alternativos para imágenes

## Próximas Mejoras

- Implementación de filtros avanzados para tareas
- Sistema de etiquetas personalizadas
- Soporte para recordatorios
- Vista de calendario para tareas programadas

## Mantenimiento

El código está documentado con comentarios siguiendo las convenciones JSDoc para facilitar el mantenimiento futuro.
