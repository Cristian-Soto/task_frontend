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
    try {
      await taskService.createTask(taskData);
      await fetchTasks(); // Recargar tareas después de crear una nueva
    } catch (error) {
      console.error("Error al crear la tarea:", error);
      throw error; // Propagar el error para que el componente pueda manejarlo
    }
  };

  const handleUpdateTask = async (id: number, taskData: Partial<Task>) => {
    try {
      await taskService.updateTask(id, taskData);
      await fetchTasks(); // Recargar tareas después de actualizar
    } catch (error) {
      console.error(`Error al actualizar la tarea ${id}:`, error);
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
