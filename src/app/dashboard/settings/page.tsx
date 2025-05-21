"use client";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-card-background dark:bg-gray-800 p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Configuración</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Personaliza tu experiencia con la aplicación.</p>
        
        {/* Pestañas */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px space-x-8">
            <a href="#" className="border-b-2 border-indigo-500 py-4 px-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
              Perfil
            </a>
            <a href="#" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600">
              Notificaciones
            </a>
            <a href="#" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600">
              Seguridad
            </a>
          </nav>
        </div>
        
        {/* Formulario de configuración */}
        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
            <div className="mt-1">
              <input 
                type="text" 
                name="first_name" 
                id="first_name" 
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md p-2 border"
                placeholder="Tu nombre"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Apellidos</label>
            <div className="mt-1">
              <input 
                type="text" 
                name="last_name" 
                id="last_name" 
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md p-2 border"
                placeholder="Tus apellidos" 
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo electrónico</label>
            <div className="mt-1">
              <input 
                type="email" 
                name="email" 
                id="email" 
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md p-2 border"
                placeholder="tu@email.com" 
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="about" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Acerca de mí</label>
            <div className="mt-1">
              <textarea 
                id="about" 
                name="about" 
                rows={3} 
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md p-2 border"
                placeholder="Escribe algo sobre ti"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Breve descripción para tu perfil.</p>
          </div>

          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Foto de perfil</label>
            <div className="mt-1 flex items-center">
              <span className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                <svg className="h-full w-full text-gray-300 dark:text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
              <button 
                type="button" 
                className="ml-5 bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cambiar
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button type="button" className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Cancelar
          </button>
          <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Guardar
          </button>
        </div>
      </div>
      
      <div className="bg-card-background dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Preferencias de notificación</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">Notificaciones por email</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Recibe actualizaciones sobre tu cuenta por correo electrónico</p>
            </div>
            <button type="button" className="bg-indigo-600 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" role="switch" aria-checked="true">
              <span aria-hidden="true" className="translate-x-5 pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">Notificaciones push</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Recibe alertas directamente en tu navegador</p>
            </div>
            <button type="button" className="bg-gray-200 dark:bg-gray-600 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" role="switch" aria-checked="false">
              <span aria-hidden="true" className="translate-x-0 pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
            </button>          </div>
        </div>
      </div>
    </div>
  );
}
