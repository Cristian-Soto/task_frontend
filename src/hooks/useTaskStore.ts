import { create } from 'zustand';
import { Task, taskService } from '@/service/task';
import { updateTaskStatusImproved } from '@/utils/taskUtils';

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  stats: {
    completed: number;
    pending: number;
    inProgress: number;
    total: number;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
  };
  recentTasks: Task[];
  calculateStats: (tasks: Task[]) => {
    completed: number;
    pending: number;
    inProgress: number;
    total: number;
  };
  fetchTasks: () => Promise<void>;
  updateTaskStatus: (taskId: number, status: Task['status']) => Promise<void>;
  updateTask: (taskId: number, taskData: Partial<Task>) => Promise<void>;
  createTask: (taskData: Omit<Task, 'id' | 'created_at' | 'user'>) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  getFilteredTasks: () => Task[];
  getPaginatedTasks: (page?: number, itemsPerPage?: number) => {
    tasks: Task[];
    pagination: {
      currentPage: number;
      totalPages: number;
      itemsPerPage: number;
      totalItems: number;
    };
  };
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  searchQuery: '',
  stats: {
    completed: 0,
    pending: 0,
    inProgress: 0,
    total: 0
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 6,
    totalItems: 0
  },
  recentTasks: [],

  calculateStats: (tasks: Task[]) => {
    const completed = tasks.filter(task => task.status === 'completed').length;
    const pending = tasks.filter(task => task.status === 'pending').length;
    const inProgress = tasks.filter(task => task.status === 'in_progress').length;
    
    return {
      completed,
      pending,
      inProgress,
      total: tasks.length
    };
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },
  
  setPage: (page: number) => {
    set(state => ({
      pagination: {
        ...state.pagination,
        currentPage: page
      }
    }));
  },
  
  setItemsPerPage: (itemsPerPage: number) => {
    set(state => ({
      pagination: {
        ...state.pagination,
        itemsPerPage,
        currentPage: 1 // Reinicia a la primera página cuando cambia el tamaño
      }
    }));
  },
  getFilteredTasks: () => {
    const { tasks, searchQuery } = get();
    if (!searchQuery.trim()) return tasks;
    
    const normalizedQuery = searchQuery.toLowerCase().trim();
    return tasks.filter(task => 
      task.title.toLowerCase().includes(normalizedQuery) || 
      task.description.toLowerCase().includes(normalizedQuery)
    );
  },
  
  getPaginatedTasks: (page?: number, itemsPerPage?: number) => {
    const { pagination } = get();
    const currentPage = page || pagination.currentPage;
    const pageSize = itemsPerPage || pagination.itemsPerPage;
    
    const filteredTasks = get().getFilteredTasks();
    const totalItems = filteredTasks.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    
    // Asegurarse de que la página actual es válida
    const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
    
    // Calcular índices de inicio y fin para la paginación
    const startIndex = (validCurrentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    
    // Obtener las tareas para la página actual
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
    
    return {
      tasks: paginatedTasks,
      pagination: {
        currentPage: validCurrentPage,
        totalPages,
        itemsPerPage: pageSize,
        totalItems
      }
    };
  },

  fetchTasks: async () => {
    try {
      set({ loading: true, error: null });
      const tasks = await taskService.getTasks();
      const recentTasks = [...tasks]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3);
        
      set(state => ({
        tasks,
        recentTasks,
        loading: false,
        stats: state.calculateStats(tasks)
      }));
    } catch (error) {
      set({ 
        error: 'Error al cargar las tareas',
        loading: false
      });
    }
  },
  updateTaskStatus: async (taskId: number, status: Task['status']) => {
    const { tasks } = get();
    const previousTask = tasks.find(t => t.id === taskId);
    
    if (!previousTask) return;    try {
      // Actualizar optimistamente
      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === taskId ? { ...task, status } : task
        )
      }));

      // Usar la función mejorada que preserva la prioridad
      try {
        // Intentar usar la nueva función mejorada primero
        const updatedTask = await updateTaskStatusImproved(taskId, status);
        
        // Actualizar con la respuesta del servidor
        set(state => {
          const newTasks = state.tasks.map(task =>
            task.id === taskId ? updatedTask : task
          );
          return {
            tasks: newTasks,
            stats: state.calculateStats(newTasks)
          };
        });
      } catch (utilError) {
        console.error("Error con función mejorada, usando método tradicional:", utilError);
        
        // Fallback al método tradicional
        const updatedTask = await taskService.updateTaskStatus(taskId, status);
        
        // Actualizar con la respuesta del servidor
        set(state => {
          const newTasks = state.tasks.map(task =>
            task.id === taskId ? updatedTask : task
          );
          return {
            tasks: newTasks,
            stats: state.calculateStats(newTasks)
          };
        });
      }} catch (error) {
      // Revertir a estado anterior en caso de error
      if (previousTask) {
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === taskId ? { ...task, status: previousTask.status } : task
          )
        }));
      }
      throw error; // Re-lanzar el error para que se pueda manejar en el componente
    }
  },

  updateTask: async (taskId: number, taskData: Partial<Task>) => {
    const { tasks } = get();
    const previousTask = tasks.find(t => t.id === taskId);
    
    if (!previousTask) return;
    
    try {
      // Actualizar optimistamente
      set(state => ({
        tasks: state.tasks.map(task =>
          task.id === taskId ? { ...task, ...taskData } : task
        )
      }));

      // Actualizar en el servidor
      const updatedTask = await taskService.updateTask(taskId, taskData);
      
      // Actualizar con la respuesta del servidor
      set(state => {
        const newTasks = state.tasks.map(task =>
          task.id === taskId ? updatedTask : task
        );
        return {
          tasks: newTasks,
          stats: state.calculateStats(newTasks)
        };
      });
    } catch (error) {
      // Revertir a estado anterior en caso de error
      if (previousTask) {
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === taskId ? previousTask : task
          )
        }));
      }
      throw error; // Re-lanzar el error para que se pueda manejar en el componente
    }
  },

  createTask: async (taskData) => {
    try {
      const newTask = await taskService.createTask(taskData);
      set(state => {
        const newTasks = [newTask, ...state.tasks];
        return {
          tasks: newTasks,
          stats: state.calculateStats(newTasks),
          recentTasks: newTasks
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 3)
        };
      });
    } catch (error) {
      throw error;
    }
  },

  deleteTask: async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      set(state => {
        const newTasks = state.tasks.filter(task => task.id !== taskId);
        return {
          tasks: newTasks,
          stats: state.calculateStats(newTasks),
          recentTasks: newTasks
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 3)
        };
      });
    } catch (error) {
      throw error;
    }
  }
}));
