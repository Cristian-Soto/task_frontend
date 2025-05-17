import { useState, useEffect, useCallback } from 'react';
import { Task, taskService } from '@/service/task';

export interface TaskStats {
  completedCount: number;
  pendingCount: number;
  inProgressCount: number;
  totalCount: number;
  recentTasks: Task[];
}

export const useTaskStats = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Array<{ title: string; value: string; icon: string; color: string; }>>([]);

  const calculateStats = useCallback((taskList: Task[]) => {
    const completedTasks = taskList.filter(task => task.status === 'completed').length;
    const pendingTasks = taskList.filter(task => task.status === 'pending').length;
    const inProgressTasks = taskList.filter(task => task.status === 'in_progress').length;

    return [
      { title: "Tareas Completadas", value: completedTasks.toString(), icon: "/file.svg", color: "bg-green-500" },
      { title: "Tareas Pendientes", value: pendingTasks.toString(), icon: "/window.svg", color: "bg-yellow-500" },
      { title: "Tareas En Proceso", value: inProgressTasks.toString(), icon: "/file.svg", color: "bg-blue-500" },
      { title: "Total Tareas", value: taskList.length.toString(), icon: "/globe.svg", color: "bg-purple-500" },
    ];
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await taskService.getTasks();
      setTasks(response);
      setStats(calculateStats(response));
    } catch (error) {
      console.error("Error al cargar las tareas:", error);
      setTasks([]);
      setStats(calculateStats([]));
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  const updateTask = useCallback(async (taskId: number, newStatus: Task['status']) => {
    try {
      const updatedTask = await taskService.updateTaskStatus(taskId, newStatus);
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === taskId ? updatedTask : task)
      );
      return true;
    } catch (error) {
      console.error("Error al actualizar la tarea:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    setStats(calculateStats(tasks));
  }, [tasks, calculateStats]);

  const getRecentTasks = useCallback(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3);
  }, [tasks]);

  return {
    tasks,
    stats,
    loading,
    updateTask,
    fetchTasks,
    getRecentTasks
  };
};
