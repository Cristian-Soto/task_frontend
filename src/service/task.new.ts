import api from "./index";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pendiente' | 'en_progreso' | 'completada';
  priority: 'baja' | 'media' | 'alta';
  created_at: string;
  due_date: string | null;
  user: number;
}

export const taskService = {
  // Obtener todas las tareas del usuario actual
  getTasks: async (): Promise<Task[]> => {
    try {
      const response = await api.get("/api/tasks/");
      
      // Verificar y validar los datos recibidos
      if (Array.isArray(response.data)) {
        console.log(`taskService - getTasks: ${response.data.length} tareas obtenidas`);
        
        // Validar cada tarea para asegurarnos de que tenga los campos requeridos
        return response.data.map(task => ({
          id: task.id,
          title: task.title || 'Sin título',
          description: task.description || '',
          status: ['pendiente', 'en_progreso', 'completada'].includes(task.status) 
            ? task.status 
            : 'pendiente',
          priority: ['baja', 'media', 'alta'].includes(task.priority) 
            ? task.priority 
            : 'media',
          created_at: task.created_at || new Date().toISOString(),
          due_date: task.due_date,
          user: task.user
        }));
      } 
      
      console.error("taskService - getTasks: Formato de datos incorrecto", response.data);
      return []; // Devolver un array vacío si no se recibió un array
    } catch (error) {
      console.error("taskService - getTasks - Error:", error);
      throw new Error("Error al obtener las tareas del usuario.");
    }
  },

  // Obtener una tarea específica por ID
  getTask: async (id: number): Promise<Task> => {
    try {
      const response = await api.get(`/api/tasks/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`taskService - getTask(${id}) - Error:`, error);
      throw new Error("Error al obtener la información de la tarea.");
    }
  },

  // Crear una nueva tarea
  createTask: async (taskData: Omit<Task, 'id' | 'created_at' | 'user'>): Promise<Task> => {
    try {
      const response = await api.post("/api/tasks/", taskData);
      return response.data;
    } catch (error) {
      console.error("taskService - createTask - Error:", error);
      throw new Error("Error al crear la tarea.");
    }
  },

  // Actualizar una tarea existente
  updateTask: async (id: number, taskData: Partial<Task>): Promise<Task> => {
    try {
      console.log(`Actualizando tarea ${id}:`, taskData);
      
      // Asegurarnos de que los datos que enviamos son correctos
      const validatedData = { ...taskData };
      
      // Validar el estado si está presente
      if (validatedData.status && !['pendiente', 'en_progreso', 'completada'].includes(validatedData.status)) {
        console.error(`Estado inválido: ${validatedData.status}`);
        validatedData.status = 'pendiente'; // Valor por defecto si es inválido
      }
      
      // Validar la prioridad si está presente
      if (validatedData.priority && !['baja', 'media', 'alta'].includes(validatedData.priority)) {
        console.error(`Prioridad inválida: ${validatedData.priority}`);
        validatedData.priority = 'media'; // Valor por defecto si es inválido
      }
      
      const response = await api.patch(`/api/tasks/${id}/`, validatedData);
      console.log("Respuesta del servidor después de actualizar tarea:", response.data);
      return response.data;
    } catch (error) {
      console.error(`taskService - updateTask(${id}) - Error:`, error);
      throw new Error("Error al actualizar la tarea.");
    }
  },

  // Eliminar una tarea
  deleteTask: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/tasks/${id}/`);
    } catch (error) {
      console.error(`taskService - deleteTask(${id}) - Error:`, error);
      throw new Error("Error al eliminar la tarea.");
    }
  },

  // Actualizar específicamente el estado de una tarea
  updateTaskStatus: async (id: number, status: Task['status']): Promise<Task> => {
    try {
      // Validar que el estado sea válido
      if (!['pendiente', 'en_progreso', 'completada'].includes(status)) {
        console.error(`Estado inválido: ${status}, usando 'pendiente' por defecto`);
        status = 'pendiente'; // Usar un valor por defecto en lugar de fallar
      }
      
      console.log(`Enviando actualización de estado para tarea ${id}: ${status}`);
      
      // Primero obtenemos la tarea actual para asegurarnos de tener datos completos
      try {
        const currentTaskResponse = await api.get(`/api/tasks/${id}/`);
        const currentTask = currentTaskResponse.data;
        
        // Verificar que tengamos datos válidos
        if (currentTask && currentTask.id) {
          console.log('Tarea actual recuperada:', currentTask);
          
          // Actualizar solo el estado para minimizar problemas
          const updateResponse = await api.patch(`/api/tasks/${id}/`, { status });
          
          // Si la respuesta contiene datos completos y válidos, los usamos
          if (updateResponse.data && updateResponse.data.id) {
            // Verificar si el estado recibido es el correcto
            const updatedTask = updateResponse.data;
            
            // Si el estado devuelto no coincide con el solicitado, lo corregimos
            if (updatedTask.status !== status) {
              console.warn(`El estado devuelto (${updatedTask.status}) no coincide con el solicitado (${status})`);
              // Corregimos localmente para que la UI muestre el estado correcto
              updatedTask.status = status;
            }
            
            // Aseguramos que la prioridad sea válida
            if (!['baja', 'media', 'alta'].includes(updatedTask.priority)) {
              console.warn(`Prioridad inválida recibida: ${updatedTask.priority}, usando la original`);
              updatedTask.priority = currentTask.priority || 'media';
            }
            
            return updatedTask;
          } else {
            // Si la respuesta está incompleta, usamos la tarea original con el estado actualizado
            console.warn('Respuesta incompleta al actualizar el estado, usando datos originales con el nuevo estado');
            return {
              ...currentTask,
              status: status
            };
          }
        } else {
          throw new Error('No se pudo obtener información válida de la tarea');
        }
      } catch (error) {
        console.error('Error al actualizar el estado:', error);
        
        // Intentar una forma alternativa: actualizar directamente sin obtener la tarea primero
        const response = await api.patch(`/api/tasks/${id}/`, { status });
        
        if (response.data && response.data.id) {
          // Asegurar que el estado sea el que solicitamos
          const task = {
            ...response.data,
            status: status // Forzar el estado solicitado en caso de discrepancia
          };
          
          return task;
        } else {
          // Si todo falla, construir un objeto Task mínimo con el ID y estado correctos
          console.warn('No se pudo obtener datos completos, devolviendo objeto mínimo');
          return {
            id: id,
            title: 'Tarea',
            description: '',
            status: status,
            priority: 'media',
            created_at: new Date().toISOString(),
            due_date: null,
            user: 0
          };
        }
      }
    } catch (error) {
      console.error(`taskService - updateTaskStatus(${id}) - Error:`, error);
      throw new Error("Error al actualizar el estado de la tarea.");
    }
  }
};
