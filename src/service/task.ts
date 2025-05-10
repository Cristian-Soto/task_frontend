import api from "./index";

// Definición de la interfaz Task según la API de Django
export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  status_display?: string; // Campo que devuelve la API con el texto en español
  priority: 'baja' | 'media' | 'alta';
  created_at: string;
  due_date: string | null;
  user: number;
}

// Mapeos entre valores de la API y valores de presentación en español
export const STATUS_MAPPING = {
  pending: 'Pendiente',
  in_progress: 'En proceso',
  completed: 'Completada'
};

export const PRIORITY_MAPPING = {
  baja: 'Baja',
  media: 'Media', 
  alta: 'Alta'
};

export const taskService = {
  // Obtener todas las tareas del usuario actual
  getTasks: async (): Promise<Task[]> => {
    try {
      const response = await api.get("/api/tasks/");
      
      // Verificar y validar los datos recibidos
      if (Array.isArray(response.data)) {
        console.log(`taskService - getTasks: ${response.data.length} tareas obtenidas`);
        
        // Validar cada tarea para asegurarnos de que tenga los campos requeridos
        return response.data.map(task => {
          // Validar el status y obtener un valor seguro
          const safeStatus = ['pending', 'in_progress', 'completed'].includes(task.status)
            ? task.status as 'pending' | 'in_progress' | 'completed'
            : 'pending';
            
          // Determinar el texto de visualización del estado
          let statusDisplay = 'Pendiente';
          if (task.status_display) {
            statusDisplay = task.status_display;
          } else if (safeStatus === 'pending') {
            statusDisplay = STATUS_MAPPING.pending;
          } else if (safeStatus === 'in_progress') {
            statusDisplay = STATUS_MAPPING.in_progress;
          } else if (safeStatus === 'completed') {
            statusDisplay = STATUS_MAPPING.completed;
          }
            
          return {
            id: task.id,
            title: task.title || 'Sin título',
            description: task.description || '',
            status: safeStatus,
            status_display: statusDisplay,
            priority: ['baja', 'media', 'alta'].includes(task.priority) 
              ? task.priority 
              : 'media',
            created_at: task.created_at || new Date().toISOString(),
            due_date: task.due_date,
            user: task.user
          };
        });
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
      console.log(`taskService - getTask(${id}): Respuesta recibida:`, response.data);
      
      const task = response.data;
      
      // Validar el status y obtener un valor seguro
      const safeStatus = ['pending', 'in_progress', 'completed'].includes(task.status)
        ? task.status as 'pending' | 'in_progress' | 'completed'
        : 'pending';
        
      // Determinar el texto de visualización del estado
      let statusDisplay = 'Pendiente';
      if (task.status_display) {
        statusDisplay = task.status_display;
      } else if (safeStatus === 'pending') {
        statusDisplay = STATUS_MAPPING.pending;
      } else if (safeStatus === 'in_progress') {
        statusDisplay = STATUS_MAPPING.in_progress;
      } else if (safeStatus === 'completed') {
        statusDisplay = STATUS_MAPPING.completed;
      }
      
      return {
        ...task,
        status: safeStatus,
        status_display: statusDisplay,
        priority: ['baja', 'media', 'alta'].includes(task.priority) 
          ? task.priority 
          : 'media'
      };
    } catch (error) {
      console.error(`taskService - getTask(${id}) - Error:`, error);
      throw new Error("Error al obtener la información de la tarea.");
    }
  },

  // Crear una nueva tarea
  createTask: async (taskData: Omit<Task, 'id' | 'created_at' | 'user'>): Promise<Task> => {
    try {
      // Validar datos antes de enviarlos
      const validatedData = { ...taskData };
      
      // Asegurarse de que status sea válido
      if (!validatedData.status || !['pending', 'in_progress', 'completed'].includes(validatedData.status)) {
        console.warn(`Estado inválido o no proporcionado: ${validatedData.status}, usando 'pending' por defecto`);
        validatedData.status = 'pending';
      }
      
      // Asegurarse de que priority sea válido
      if (!validatedData.priority || !['baja', 'media', 'alta'].includes(validatedData.priority)) {
        console.warn(`Prioridad inválida o no proporcionada: ${validatedData.priority}, usando 'media' por defecto`);
        validatedData.priority = 'media';
      }
      
      // Asegurarse de que title no esté vacío
      if (!validatedData.title || validatedData.title.trim() === '') {
        console.error("Intento de crear tarea sin título");
        throw new Error("El título de la tarea es obligatorio.");
      }
      
      // Validar y formatear due_date
      if (validatedData.due_date) {
        try {
          // Convertir la fecha a formato ISO si es una cadena válida
          const date = new Date(validatedData.due_date);
          if (!isNaN(date.getTime())) {
            // Usar solo la parte de la fecha (YYYY-MM-DD)
            validatedData.due_date = date.toISOString().split('T')[0];
          } else {
            console.warn(`Fecha inválida: ${validatedData.due_date}, estableciendo como null`);
            validatedData.due_date = null;
          }
        } catch (error) {
          console.warn(`Error al procesar la fecha: ${validatedData.due_date}`, error);
          validatedData.due_date = null;
        }
      }
      
      console.log("Creando nueva tarea con datos validados:", JSON.stringify(validatedData, null, 2));
      
      const response = await api.post("/api/tasks/", validatedData);
      console.log("Tarea creada con éxito:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("taskService - createTask - Error:", error);
      
      // Mostrar detalles específicos del error si están disponibles
      if (error.response) {
        console.error("Detalles de la respuesta de error:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
        
        // Mensaje más específico basado en el código de error
        if (error.response.status === 400) {
          throw new Error(`Error 400: Solicitud incorrecta - ${JSON.stringify(error.response.data)}`);
        }
      }
      
      throw new Error("Error al crear la tarea.");
    }
  },

  // Actualizar una tarea existente
  updateTask: async (id: number, taskData: Partial<Task>): Promise<Task> => {
    try {
      console.log(`taskService - updateTask: Actualizando tarea ${id} con datos:`, taskData);
      
      // Validar que los campos enviados sean válidos
      const validatedData: Partial<Task> = {};
      
      if (taskData.title !== undefined) {
        if (!taskData.title.trim()) {
          throw new Error("El título no puede estar vacío");
        }
        validatedData.title = taskData.title;
      }
      
      if (taskData.status !== undefined) {
        if (!['pending', 'in_progress', 'completed'].includes(taskData.status)) {
          console.error(`Estado inválido: ${taskData.status}`);
          throw new Error(`Estado inválido: ${taskData.status}`);
        }
        validatedData.status = taskData.status;
      }
      
      if (taskData.priority !== undefined) {
        if (!['baja', 'media', 'alta'].includes(taskData.priority)) {
          console.error(`Prioridad inválida: ${taskData.priority}`);
          throw new Error(`Prioridad inválida: ${taskData.priority}`);
        }
        validatedData.priority = taskData.priority;
      }
      
      if (taskData.description !== undefined) {
        validatedData.description = taskData.description;
      }
      
      if (taskData.due_date !== undefined) {
        validatedData.due_date = taskData.due_date;
      }
      
      // Enviar la actualización a la API
      console.log(`Enviando datos validados para actualizar tarea ${id}:`, validatedData);
      const updateResponse = await api.patch(`/api/tasks/${id}/`, validatedData);
      
      console.log(`Tarea ${id} actualizada con éxito:`, updateResponse.data);
      return updateResponse.data;
    } catch (error) {
      console.error(`taskService - updateTask(${id}) - Error:`, error);
      throw error;
    }
  },

  // Actualizar solo el estado de una tarea
  updateTaskStatus: async (id: number, status: Task['status']): Promise<Task> => {
    try {
      console.log(`Iniciando actualización del estado para tarea ${id} a ${status}`);
      
      // Validar que el estado sea válido
      if (!['pending', 'in_progress', 'completed'].includes(status)) {
        throw new Error(`Estado inválido: ${status}`);
      }
      
      try {
        // Primero obtener la tarea actual para tener todos los datos
        const currentTask = await taskService.getTask(id);
        console.log(`Estado actual de la tarea ${id}: ${currentTask.status}`);
        
        // Solo actualizamos si el estado es diferente
        if (currentTask.status !== status) {
          // Actualizar solo el estado, manteniendo el resto de campos
          const updatedTask = await taskService.updateTask(id, { status });
          
          // Asegurar que el estado devuelto sea el solicitado (por si la API devuelve otra cosa)
          if (updatedTask.status !== status) {
            console.warn(`El servidor devolvió un estado diferente al solicitado: ${updatedTask.status} != ${status}`);
            updatedTask.status = status;
            updatedTask.status_display = STATUS_MAPPING[status];
          }
          
          console.log(`Estado actualizado correctamente para tarea ${id}: ${updatedTask.status}`);
          return updatedTask;
        } else {
          console.log(`La tarea ${id} ya tiene el estado ${status}, no hay cambios`);
          return currentTask;
        }
      } catch (error) {
        console.error(`Error durante la actualización de estado:`, error);
        
        // Intentar un enfoque alternativo si el primero falla
        const simpleUpdate = await api.patch(`/api/tasks/${id}/`, { status });
        const result = simpleUpdate.data;
        
        // Asegurar que el resultado tiene el estado correcto
        if (result && result.id) {
          result.status = status; // Forzar el estado correcto
          result.status_display = STATUS_MAPPING[status];
          return result;
        }
        
        throw error; // Si tampoco funciona, propagar el error
      }
    } catch (error) {
      console.error(`Error al actualizar estado de tarea ${id}:`, error);
      throw error;
    }
  },

  // Eliminar una tarea
  deleteTask: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/tasks/${id}/`);
      console.log(`Tarea ${id} eliminada con éxito`);
    } catch (error) {
      console.error(`taskService - deleteTask(${id}) - Error:`, error);
      throw new Error(`Error al eliminar la tarea con ID: ${id}`);
    }
  }
};

export default taskService;
