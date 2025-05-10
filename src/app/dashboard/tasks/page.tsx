"use client";

import React, { useState, useEffect } from 'react';
import { taskService, Task } from '@/service/task';
import TasksList from '@components/tasks/TasksList';
import toast from 'react-hot-toast';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (error) {
      console.error("Error al cargar las tareas:", error);
      toast.error("No se pudieron cargar las tareas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);
  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'user'>) => {
    toast.loading('Creando nueva tarea...', { id: 'create-task' });
    
    try {
      console.log("TaskPage: Iniciando creación de tarea con datos:", taskData);
      
      // Asegurar que la tarea tiene los campos requeridos
      if (!taskData.title || taskData.title.trim() === '') {
        toast.error('El título de la tarea es obligatorio', { id: 'create-task' });
        throw new Error('El título de la tarea es obligatorio');
      }
      
      // Crear la tarea
      const newTask = await taskService.createTask(taskData);
      console.log("TaskPage: Tarea creada exitosamente:", newTask);
      
      // Recargar las tareas
      await fetchTasks();
      toast.success('¡Tarea creada correctamente!', { id: 'create-task' });
    } catch (error: any) {
      console.error("Error al crear la tarea:", error);
      
      // Mostrar un mensaje de error más específico
      const errorMessage = error.message || 'Error desconocido al crear la tarea';
      toast.error(errorMessage, { id: 'create-task' });
      
      // Propagar el error para que el componente pueda manejarlo
      throw error;
    }
  };  const handleUpdateTask = async (id: number, taskData: Partial<Task>) => {
    try {
      console.log(`TaskPage: Actualizando tarea ${id}:`, taskData);
      
      // Validar datos antes de proceder
      if (taskData.status && !['pending', 'in_progress', 'completed'].includes(taskData.status)) {
        console.error(`Estado inválido: ${taskData.status}`);
        toast.error(`Estado inválido: ${taskData.status}`);
        return;
      }
      
      if (taskData.priority && !['baja', 'media', 'alta'].includes(taskData.priority)) {
        console.error(`Prioridad inválida: ${taskData.priority}`);
        toast.error(`Prioridad inválida: ${taskData.priority}`);
        return;
      }
      
      // Obtener la tarea actual antes de actualizarla
      const currentTask = tasks.find(task => task.id === id);
      if (!currentTask) {
        console.error(`No se encontró la tarea con id ${id} en el estado local`);
        toast.error('No se pudo encontrar la tarea para actualizar');
        return;
      }
        // Mostrar notificación del proceso que está ocurriendo
      const processType = taskData.status ? `estado a ${taskData.status === 'pending' ? 'Pendiente' : 
                                                     taskData.status === 'in_progress' ? 'En proceso' : 
                                                     'Completada'}` : 
                         taskData.priority ? `prioridad a ${taskData.priority === 'baja' ? 'Baja' : 
                                                        taskData.priority === 'media' ? 'Media' : 
                                                        'Alta'}` : 
                         'datos de la tarea';
      
      toast.loading(`Actualizando ${processType}...`, { id: `update-task-${id}` });
      
      // Guardar la versión actual de las tareas en caso de error
      const previousTasks = [...tasks];
      
      // Actualizar optimistamente la UI para una respuesta inmediata
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, ...taskData } : task
      ));
      
      try {
        // Si solo se está actualizando el estado, usamos el método específico
        let updatedTask;
        if (taskData.status && Object.keys(taskData).length === 1) {
          updatedTask = await taskService.updateTaskStatus(id, taskData.status);
        } else {
          updatedTask = await taskService.updateTask(id, taskData);
        }
        
        console.log("Tarea actualizada recibida del servidor:", updatedTask);
        
        // Verificar si la respuesta contiene todos los datos necesarios
        if (updatedTask && updatedTask.id) {
          // Verificar que tengamos todos los campos críticos, si faltan, mezclar con la tarea original
          const completeTask = {
            ...currentTask,
            ...updatedTask,
            // Asegurar que estado y prioridad sean válidos
            status: updatedTask.status && ['pendiente', 'en_progreso', 'completada'].includes(updatedTask.status) 
              ? updatedTask.status 
              : (taskData.status || currentTask.status),
            priority: updatedTask.priority && ['baja', 'media', 'alta'].includes(updatedTask.priority) 
              ? updatedTask.priority 
              : currentTask.priority
          };
          
          // Actualizar el estado local con los datos completos
          setTasks(prev => prev.map(task => 
            task.id === id ? completeTask : task
          ));
          
          toast.success(`¡${processType.charAt(0).toUpperCase() + processType.slice(1)} actualizado correctamente!`, 
            { id: `update-task-${id}` });
        } else {
          console.warn("La respuesta del servidor no contiene todos los datos esperados:", updatedTask);
          // Recargar todas las tareas para asegurarnos de tener datos consistentes
          await fetchTasks();
          
          toast.success('Tarea actualizada. Recargando datos...', { id: `update-task-${id}` });
        }
      } catch (error) {
        console.error(`Error al actualizar la tarea ${id}:`, error);
        // Restaurar el estado anterior en caso de error
        setTasks(previousTasks);
        toast.error('Error al actualizar la tarea', { id: `update-task-${id}` });
      }
    } catch (error) {
      console.error(`Error general al actualizar la tarea ${id}:`, error);
      toast.error('Error inesperado al actualizar la tarea');
      // Recargar las tareas para restaurar el estado correcto desde el servidor
      await fetchTasks();
      throw error;
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await taskService.deleteTask(id);
      setTasks(tasks.filter(task => task.id !== id)); // Actualizar estado localmente sin recargar todo
    } catch (error) {
      console.error(`Error al eliminar la tarea ${id}:`, error);
      throw error;
    }
  };
  return (
    <div className="space-y-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-700">Gestión de Tareas</h1>
        <p className="text-gray-600">Administra y organiza todas tus tareas en un solo lugar</p>
      </header>

      <div className="bg-white rounded-lg shadow-md p-6">
        <TasksList
          tasks={tasks}
          isLoading={isLoading}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      </div>
    </div>
  );
}
