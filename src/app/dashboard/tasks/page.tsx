"use client";

import React, { useEffect } from 'react';
import { Task } from '@/service/task';
import TasksList from '@components/tasks/TasksList';
import toast from 'react-hot-toast';
import { useTaskStore } from '@/hooks/useTaskStore';

export default function TasksPage() {
  const { tasks, loading, error, updateTaskStatus, updateTask, createTask, deleteTask, fetchTasks } = useTaskStore();

  // Cargar tareas solo si no se han cargado previamente
  useEffect(() => {
    const tasksAlreadyLoaded = sessionStorage.getItem('tasksLoaded');
    if (!tasksAlreadyLoaded || tasks.length === 0) {
      console.log("[TasksPage] Cargando tareas...");
      fetchTasks().then(() => {
        sessionStorage.setItem('tasksLoaded', 'true');
      });
    } else {
      console.log("[TasksPage] Las tareas ya estaban cargadas");
    }
  }, [fetchTasks, tasks.length]);const handleCreateTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'user'>) => {
    toast.loading('Creando nueva tarea...', { id: 'create-task' });
    
    console.log('[TasksPage] Datos de la nueva tarea:', taskData);
    
    try {
      await createTask(taskData);
      toast.success('¡Tarea creada correctamente!', { id: 'create-task' });
    } catch (error: any) {
      const errorMessage = error.message || 'Error desconocido al crear la tarea';
      toast.error(errorMessage, { id: 'create-task' });
      throw error;
    }
  };const handleUpdateTask = async (id: number, taskData: Partial<Task>) => {
    const toastId = `update-task-${id}`;
    
    try {
      toast.loading('Actualizando tarea...', { id: toastId });
      
      if (taskData.status && Object.keys(taskData).length === 1) {
        // Si solo se está actualizando el estado, usamos updateTaskStatus
        await updateTaskStatus(id, taskData.status);
      } else {
        // Para cualquier otro cambio o actualizaciones múltiples, usamos updateTask
        await updateTask(id, taskData);
      }
      
      toast.success('Tarea actualizada correctamente', { id: toastId });
    } catch (error) {
      console.error("Error al actualizar la tarea:", error);
      toast.error('Error al actualizar la tarea', { id: toastId });
      throw error;
    }
  };
  const handleDeleteTask = async (id: number) => {
    const toastId = `delete-task-${id}`;
    try {
      toast.loading('Eliminando tarea...', { id: toastId });
      await deleteTask(id);
      toast.success('Tarea eliminada correctamente', { id: toastId });
    } catch (error) {
      console.error(`Error al eliminar la tarea ${id}:`, error);
      toast.error('Error al eliminar la tarea', { id: toastId });
      throw error;
    }
  };  return (
    <div className="space-y-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-200">Gestión de Tareas</h1>
        <p className="text-gray-600 dark:text-gray-400">Administra y organiza todas tus tareas en un solo lugar</p>
      </header>      <div className="bg-card-background dark:bg-gray-800 rounded-lg shadow-md p-6">
        <TasksList
          tasks={tasks}
          isLoading={loading}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      </div>
    </div>
  );
}
