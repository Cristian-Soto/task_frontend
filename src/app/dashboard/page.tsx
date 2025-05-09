"use client";

import { useState, useEffect } from 'react';
import { userService } from '@/service/user';
import { taskService, Task } from '@/service/task';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import TaskForm from '@components/tasks/TaskForm';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
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
  const fetchTasks = async () => {
    try {
      setTasksLoading(true);
      const tasksData = await taskService.getTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error("Error al cargar las tareas:", error);
      toast.error("No se pudieron cargar las tareas");
    } finally {
      setTasksLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTasks();
  }, []);

  // Calcular estadísticas de tareas
  const completedTasks = tasks.filter(task => task.status === 'completada').length;
  const pendingTasks = tasks.filter(task => task.status === 'pendiente').length;
  const inProgressTasks = tasks.filter(task => task.status === 'en_progreso').length;

  // Datos para las cards de estadísticas
  const stats = [
    { title: "Tareas Completadas", value: completedTasks.toString(), icon: "/file.svg", color: "bg-green-500" },
    { title: "Tareas Pendientes", value: pendingTasks.toString(), icon: "/window.svg", color: "bg-yellow-500" },
    { title: "Tareas En Progreso", value: inProgressTasks.toString(), icon: "/file.svg", color: "bg-blue-500" },
    { title: "Total Tareas", value: tasks.length.toString(), icon: "/globe.svg", color: "bg-purple-500" },
  ];
  // Obtener las últimas 3 tareas
  const recentTasks = [...tasks].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3);

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleSubmitForm = async (taskData: Omit<Task, 'id' | 'created_at' | 'user'>) => {
    try {
      await taskService.createTask(taskData);
      toast.success('Tarea creada correctamente');
      handleCloseForm();
      // Recargar tareas después de crear una nueva
      fetchTasks();
    } catch (error) {
      console.error("Error al crear la tarea:", error);
      toast.error('Error al guardar la tarea');
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 transition-transform hover:scale-105">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Image src={stat.icon} alt={stat.title} width={24} height={24} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Secciones adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sección de tareas recientes */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Tareas Recientes</h2>
            <Link href="/dashboard/tasks" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              Ver todas
            </Link>
          </div>
          
          {tasksLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center p-3 border rounded-lg mb-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : recentTasks.length > 0 ? (
            <div className="space-y-3">
              {recentTasks.map(task => (
                <div key={task.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-grow">
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-gray-500 truncate">{task.description}</p>
                  </div>
                  <div className="ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium 
                      ${task.status === 'pendiente' ? 'bg-gray-100 text-gray-800' : 
                        task.status === 'en_progreso' ? 'bg-indigo-100 text-indigo-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {task.status === 'pendiente' ? 'Pendiente' : 
                       task.status === 'en_progreso' ? 'En progreso' : 'Completada'}
                    </span>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 text-center">
                <Link href="/dashboard/tasks" className="inline-flex items-center justify-center px-4 py-2 border border-indigo-600 rounded-md text-indigo-600 hover:bg-indigo-50">
                  Gestionar todas las tareas
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 mb-4">No tienes tareas creadas todavía</p>
              <button 
                onClick={handleOpenForm}
                className="inline-flex items-center justify-center px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Crear mi primera tarea
              </button>
            </div>
          )}
        </div>
        
        {/* Sección de información del usuario */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Información del Usuario</h2>
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-5 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            </div>
          ) : user ? (
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
                {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <h3 className="text-lg font-medium">
                {user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : user.username || 'Usuario'
                }
              </h3>
              <p className="text-gray-500 mb-4">{user.email}</p>
              <div className="w-full space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Usuario desde</span>
                  <span>Mayo 2023</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tareas totales</span>
                  <span>{tasks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tareas completadas</span>
                  <span>{completedTasks}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">No se pudo cargar la información del usuario</p>          )}
        </div>
      </div>      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto backdrop-blur-sm bg-black/30 flex items-center justify-center px-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <TaskForm
              onSubmit={handleSubmitForm}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}