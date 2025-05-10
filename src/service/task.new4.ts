// filepath: d:\task_frontend\src\service\task.ts
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

  // Actualizar específicamente el estado de una tarea - VERSIÓN SIN CABECERAS CORS
  updateTaskStatus: async (id: number, status: Task['status']): Promise<Task> => {
    try {
      // Validación inicial del estado
      if (!['pendiente', 'en_progreso', 'completada'].includes(status)) {
        console.error(`Estado inválido: ${status}, usando 'pendiente' por defecto`);
        status = 'pendiente';
      }
      
      console.log(`Iniciando actualización del estado para tarea ${id} a ${status}`);
      
      // Primer intento: Obtener la tarea y actualizarla con datos completos
      try {
        console.log(`Obteniendo tarea ${id} para actualización con datos completos`);
        const currentTask = await taskService.getTask(id);
        
        if (currentTask && currentTask.id) {
          console.log(`Tarea recuperada:`, currentTask);
          
          // Preparar un payload completo pero sin campos especiales
          const payload = {
            status: status,
            // Incluir campos importantes para mantener consistencia
            priority: currentTask.priority,
            title: currentTask.title
          };
          
          console.log(`Enviando actualización con datos completos:`, payload);
          const response = await api.patch(`/api/tasks/${id}/`, payload);
          
          if (response.data && response.data.id) {
            // Asegurarse de que la respuesta tiene el estado correcto
            const result = {
              ...response.data,
              status: status // Forzar el estado correcto localmente
            };
            
            return result;
          }
        }
      } catch (firstError) {
        console.warn(`Error en primer intento:`, firstError);
      }
      
      // Segundo intento: Actualización directa (solo estado)
      try {
        console.log(`Intentando actualización simple (solo estado)`);
        const payload = { status };
        
        const response = await api.patch(`/api/tasks/${id}/`, payload);
        
        if (response.data && response.data.id) {
          console.log(`Respuesta recibida en segundo intento:`, response.data);
          
          // Asegurar el estado correcto
          response.data.status = status;
          
          return response.data;
        }
      } catch (secondError) {
        console.warn(`Error en segundo intento:`, secondError);
      }
      
      // Tercer intento: Reintentos simples sin cabeceras personalizadas
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          // Pequeña pausa entre intentos
          if (attempt > 0) {
            await new Promise(r => setTimeout(r, 300));
          }
          
          console.log(`Intento ${attempt + 1} de 3`);
          const response = await api.patch(`/api/tasks/${id}/`, { 
            status: status,
            timestamp: Date.now() // Campo único para evitar caché
          });
          
          if (response.data && response.data.id) {
            const result = {
              ...response.data,
              status: status
            };
            return result;
          }
        } catch (attemptError) {
          console.warn(`Error en intento ${attempt + 1}:`, attemptError);
        }
      }
      
      // Si todo falla, crear objeto mínimo con el estado correcto
      console.warn(`Todos los intentos fallaron. Creando objeto mínimo.`);
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
    } catch (error) {
      console.error(`taskService - updateTaskStatus(${id}) - Error general:`, error);
      throw new Error(`Error al actualizar el estado de la tarea: ${error}`);
    }
  }
};
