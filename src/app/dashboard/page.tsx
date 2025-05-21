"use client";

import { useState, useEffect } from 'react';
import { userService } from '@/service/user';
import { Task } from '@/service/task';
import { useTaskStore } from '@/hooks/useTaskStore';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import TaskForm from '@components/tasks/TaskForm';
import dynamic from 'next/dynamic';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  // Usar el store de Zustand
  const { 
    tasks, 
    stats, 
    loading: tasksLoading, 
    fetchTasks, 
    updateTaskStatus,
    createTask 
  } = useTaskStore();
  
  // Estados para la paginación de tareas recientes
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // Número fijo para tareas recientes
  // Convertir stats a array para el mapeo
  const statsArray = [
    { title: 'Total de Tareas', value: stats.total, icon: '/icons/total.svg', color: 'bg-blue-100 dark:bg-blue-900' },
    { title: 'Completadas', value: stats.completed, icon: '/icons/completed.svg', color: 'bg-green-100 dark:bg-green-900' },
    { title: 'Pendientes', value: stats.pending, icon: '/icons/pending.svg', color: 'bg-yellow-100 dark:bg-yellow-900' },
    { title: 'En Progreso', value: stats.inProgress, icon: '/icons/in-progress.svg', color: 'bg-purple-100 dark:bg-purple-900' },
  ];

  // Cargar usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await userService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);
  // Cargar tareas inicialmente
  useEffect(() => {
    const tasksAlreadyLoaded = sessionStorage.getItem('tasksLoaded');
    if (!tasksAlreadyLoaded || tasks.length === 0) {
      console.log("[DashboardPage] Cargando tareas...");
      fetchTasks().then(() => {
        sessionStorage.setItem('tasksLoaded', 'true');
      });
    } else {
      console.log("[DashboardPage] Las tareas ya estaban cargadas");
    }
  }, [fetchTasks, tasks.length]);
  // Obtener las últimas 3 tareas
  const sortedTasks = [...tasks]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
  // Calcular total de páginas para tareas recientes
  const totalTasks = sortedTasks.length;
  const totalPages = Math.ceil(totalTasks / itemsPerPage) || 1;
  
  // Obtener las tareas para la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalTasks);
  const recentTasks = sortedTasks.slice(startIndex, endIndex);
  
  // Manejar el cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleOpenForm = () => setIsFormOpen(true);
  const handleCloseForm = () => setIsFormOpen(false);

  const handleTaskStatusChange = async (taskId: number, newStatus: Task['status']) => {
    const toastId = `status-update-${taskId}`;
    toast.loading('Actualizando estado...', { id: toastId });

    // Validar que el estado sea válido antes de enviarlo
    if (!['pending', 'in_progress', 'completed'].includes(newStatus)) {
        console.error(`Estado inválido detectado: ${newStatus}`);
        toast.error('Estado inválido, no se puede actualizar', { id: toastId });
        return;
    }

    try {
        await updateTaskStatus(taskId, newStatus);
        toast.success('Estado actualizado', { id: toastId });

        // Recargar las estadísticas después de actualizar el estado
        fetchTasks();
    } catch (error) {
        console.error("Error al actualizar estado:", error);
        toast.error('Error al actualizar el estado', { id: toastId });
    }
  };

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'user'>) => {
    try {
      await createTask(taskData);
      toast.success('Tarea creada exitosamente');
      handleCloseForm();
    } catch (error) {
      console.error("Error al crear la tarea:", error);
      toast.error('Error al crear la tarea');
    }
  };

  return (    <div className="space-y-8">
      {/* Grid de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsArray.map((stat, index) => (          <div key={index} className={`${stat.color} rounded-lg shadow-md p-6 bg-card-background dark:bg-gray-800`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Image
                  src={stat.icon}
                  alt={stat.title}
                  width={48}
                  height={48}
                  className="w-12 h-12 text-gray-700 dark:text-gray-200"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                    {stat.title}
                  </dt>
                  <dd className="flex items-baseline">                    <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      {stat.value}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Sección de tareas recientes */}      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card-background dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200">Tareas Recientes</h2>
          </div>
          
          {tasksLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center p-3 border rounded-lg mb-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>          ) : recentTasks.length > 0 ? (
            <div className="space-y-3">              {recentTasks.map(task => (
                <div key={task.id} className="flex justify-between items-center p-3 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                  <div className="flex-grow">
                    <h3 className="font-medium">{task.title}</h3>
                    <div className="flex items-center mt-1">
                      <span className={`mr-2 px-2 py-0.5 rounded-full text-xs font-medium
                        ${task.priority === 'baja' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                          task.priority === 'media' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {task.priority === 'baja' ? 'Baja' : 
                         task.priority === 'media' ? 'Media' : 'Alta'}
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{task.description}</p>
                    </div>
                  </div>
                  <div className="ml-4">
                    <select 
                      value={task.status}
                      onChange={(e) => handleTaskStatusChange(task.id, e.target.value as Task['status'])}
                      className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer
                        ${task.status === 'pending' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' : 
                          task.status === 'in_progress' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200' : 
                          'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'}`}
                    >
                      <option value="pending">Pendiente</option>
                      <option value="in_progress">En proceso</option>
                      <option value="completed">Completada</option>
                    </select>
                  </div>
                </div>
              ))}
              
              {/* Paginación para tareas recientes */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-4">
                  <nav className="flex items-center space-x-1" aria-label="Paginación de tareas recientes">
                    {/* Botón Anterior */}
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-1 rounded-md ${
                        currentPage === 1 
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      aria-label="Página anterior"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Números de página */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (                      <button 
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${
                          page === currentPage
                            ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        aria-current={page === currentPage ? 'page' : undefined}
                        aria-label={`Página ${page}`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    {/* Botón Siguiente */}
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-1 rounded-md ${
                        currentPage === totalPages 
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      aria-label="Página siguiente"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              )}
                <div className="mt-4 text-center">
                <Link href="/dashboard/tasks" className="inline-flex items-center justify-center px-4 py-2 border border-indigo-600 dark:border-indigo-400 rounded-md text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                  Gestionar todas las tareas
                </Link>
              </div>
            </div>
          ) : (            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 mb-4">No tienes tareas creadas todavía</p>
              <button 
                onClick={handleOpenForm}
                className="inline-flex items-center justify-center px-4 py-2 text-white bg-indigo-600 dark:bg-indigo-500 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600"
              >
                Crear mi primera tarea
              </button>
            </div>
          )}
        </div>        {/* Sección de información del usuario */}
        <div className="bg-card-background dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-200">Información del Usuario</h2>
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-20 w-20 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mx-auto mb-4"></div>
            </div>
          ) : user ? (
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
                {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-200">
                {user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : user.username || 'Usuario'
                }
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">{user.email}</p>              <div className="w-full space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Tareas totales</span>
                  <span className="text-gray-400 dark:text-gray-300">{stats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Tareas completadas</span>
                  <span className="text-gray-400 dark:text-gray-300">{stats.completed}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">No se pudo cargar la información del usuario</p>
          )}
        </div>
      </div>

      {/* Modal de formulario */}      {isFormOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto backdrop-blur-sm bg-black/30 flex items-center justify-center px-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-card-background dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}