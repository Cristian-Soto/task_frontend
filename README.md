# Aplicación de Gestión de Tareas

![Task Manager Logo](./public/task-logo.svg)

## Descripción

Aplicación web para gestión de tareas personales desarrollada con Next.js y React. Permite a los usuarios registrarse, iniciar sesión, y administrar sus tareas diarias de forma eficiente con una interfaz moderna y atractiva.

## Características

- **Autenticación completa**: Sistema de registro e inicio de sesión con validación de campos
- **Gestión de tareas**: Crear, editar, eliminar y marcar tareas como completadas
- **Dashboard personalizado**: Vista general de tareas pendientes, en progreso y completadas
- **Estadísticas**: Visualización de progreso y productividad
- **Diseño responsivo**: Funciona en dispositivos móviles, tablets y escritorio
- **Modo oscuro**: Soporte para tema claro y oscuro según preferencias del usuario
- **Interfaz moderna**: UI moderna con efectos visuales, transiciones y feedback visual

## Tecnologías

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Estado**: React Hooks, Context API
- **Estilizado**: CSS Modules, Tailwind CSS
- **Notificaciones**: React Hot Toast
- **Iconos**: SVG inline personalizados

## Requisitos

- Node.js 16.0.0 o superior
- npm 7.0.0 o superior

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/task-manager.git
   cd task-manager
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   - Crear un archivo `.env.local` en la raíz del proyecto
   - Agregar las siguientes variables:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:8000/api
     ```

4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## Estructura del Proyecto

```
task_frontend/
├── components/         # Componentes reutilizables
│   ├── auth/           # Componentes relacionados con autenticación
│   ├── dashboard/      # Componentes del dashboard
│   └── tasks/          # Componentes para gestión de tareas
├── public/             # Archivos estáticos y recursos
│   ├── icons/          # Iconos SVG
│   └── ...             # Otros recursos
├── src/
│   ├── app/            # Páginas y rutas de la aplicación
│   ├── hooks/          # Hooks personalizados
│   ├── service/        # Servicios para API
│   └── utils/          # Utilidades y helpers
└── ...                 # Archivos de configuración
```

## Contribución

1. Fork del repositorio
2. Crear una rama para tu función: `git checkout -b feature/nueva-caracteristica`
3. Commit de tus cambios: `git commit -m 'Añadir nueva característica'`
4. Push a la rama: `git push origin feature/nueva-caracteristica`
5. Enviar un Pull Request

## Licencia

[MIT](LICENSE)

---

Desarrollado con ❤️ por Cristian Soto
