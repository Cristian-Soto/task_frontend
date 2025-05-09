"use client";

import { useState, useEffect } from 'react';
import { userService } from '@/service/user';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Estados para los campos editables
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [editMode, setEditMode] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await userService.getCurrentUser();
        setUser(userData);
        
        // Inicializar los estados con los datos del usuario
        setFirstName(userData.first_name || '');
        setLastName(userData.last_name || '');
        setEmail(userData.email || '');
        
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("No se pudo cargar la información del usuario");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      
      await userService.updateProfile({
        first_name: firstName,
        last_name: lastName,
        email: email
      });
      
      // Actualizar el estado del usuario con los nuevos datos
      setUser({
        ...user,
        first_name: firstName,
        last_name: lastName,
        email: email
      });
      
      toast.success("Perfil actualizado correctamente");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("No se pudo actualizar el perfil");
    } finally {
      setUpdating(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-gray-700">Mi Perfil</h1>
      
      {loading ? (
        <div className="animate-pulse space-y-4 bg-white p-6 rounded-lg shadow-md">
          <div className="h-32 w-32 bg-gray-200 rounded-full mx-auto"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
          <div className="h-10 bg-gray-200 rounded w-full mt-8"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md">
          {/* Encabezado del perfil */}
          <div className="flex flex-col items-center mb-8">
            <div className="h-32 w-32 rounded-full bg-indigo-600 flex items-center justify-center text-white text-4xl font-bold mb-4">
              {user?.first_name ? user.first_name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <h2 className="text-xl text-gray-700 font-bold">
              {user?.first_name && user?.last_name 
                ? `${user.first_name} ${user.last_name}` 
                : user?.username || 'Usuario'
              }
            </h2>
            <p className="text-gray-600 mt-1">{user?.email}</p>
            <p className="text-gray-500 mt-1">Usuario desde: Mayo 2025</p>
          </div>
          
          {/* Formulario de información personal */}
          <form onSubmit={handleSaveProfile}>
            <div className="space-y-6">
              <h3 className="text-lg font-medium pb-2 border-b border-gray-200 text-gray-700">Información Personal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  {editMode ? (
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={updating}
                    />
                  ) : (
                    <p className="p-2 bg-gray-50 rounded-md">{user?.first_name || '-'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                  {editMode ? (
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={updating}
                    />
                  ) : (
                    <p className="p-2 bg-gray-50 rounded-md">{user?.last_name || '-'}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                {editMode ? (
                  <input
                    type="email"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={updating}
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded-md">{user?.email || '-'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de usuario</label>
                <p className="p-2 bg-gray-50 rounded-md">{user?.username || '-'}</p>
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                {editMode ? (
                  <>
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      onClick={() => setEditMode(false)}
                      disabled={updating}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
                      disabled={updating}
                    >
                      {updating ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
                    onClick={() => setEditMode(true)}
                  >
                    Editar perfil
                  </button>
                )}
              </div>
            </div>
          </form>
          
          {/* Sección de seguridad */}
          <div className="mt-10 space-y-6">
            <h3 className="text-lg font-medium pb-2 border-b border-gray-200">Seguridad</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <p className="p-2 bg-gray-50 rounded-md">••••••••</p>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cambiar contraseña
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}