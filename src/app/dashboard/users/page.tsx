"use client";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Usuarios</h1>
        <p className="text-gray-600">En esta sección podrás gestionar los usuarios del sistema.</p>
        
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mt-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Esta sección está en construcción. Próximamente podrás gestionar usuarios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
