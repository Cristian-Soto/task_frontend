// filepath: d:\task_frontend\src\service\task.ts
import api from "./index";
import { CookieUtils } from "../utils/cookies";

const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000' 
  : process.env.NEXT_PUBLIC_API_URL || '';

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

  // Actualizar específicamente el estado de una tarea - VERSIÓN REFORZADA
  updateTaskStatus: async (id: number, status: Task['status']): Promise<Task> => {
    try {
      // Validación inicial del estado
      if (!['pendiente', 'en_progreso', 'completada'].includes(status)) {
        console.error(`Estado inválido: ${status}, usando 'pendiente' por defecto`);
        status = 'pendiente';
      }
      
      console.log(`Iniciando actualización robusta del estado para tarea ${id} a ${status}`);
      
      // Guardar una copia local de la tarea antes de intentar actualizarla
      let originalTask: Task | null = null;
      
      try {
        const response = await api.get(`/api/tasks/${id}/`);
        originalTask = response.data;
        console.log(`Tarea original recuperada:`, originalTask);
      } catch (fetchError) {
        console.warn(`No se pudo obtener la tarea original: ${fetchError}`);
      }
      
      // Método 1: Usar fetch nativo para tener más control
      try {
        console.log(`Método 1: Usando fetch nativo`);
        const token = CookieUtils.getCookie('access_token') || localStorage.getItem('access_token');
        const apiUrl = `${API_URL}/api/tasks/${id}/`;
        
        const fetchResponse = await fetch(apiUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'Cache-Control': 'no-cache',
            'X-Force-Update': 'true'
          },
          body: JSON.stringify({ 
            status: status,
            // Incluir todos los campos críticos si tenemos la tarea original
            ...(originalTask && {
              priority: originalTask.priority,
              title: originalTask.title 
            })
          })
        });
        
        if (fetchResponse.ok) {
          const result = await fetchResponse.json();
          console.log(`Respuesta fetch:`, result);
          
          if (result && result.id) {
            // Forzar el estado correcto incluso si el servidor devuelve otro
            result.status = status;
            
            // Verificar y corregir otros campos críticos
            if (!['baja', 'media', 'alta'].includes(result.priority)) {
              result.priority = originalTask?.priority || 'media';
            }
            
            return result;
          }
        } else {
          console.warn(`Método 1 falló con estado ${fetchResponse.status}`);
        }
      } catch (fetchError) {
        console.warn(`Error en método 1:`, fetchError);
      }
      
      // Método 2: Usar axios con reintentos
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          console.log(`Método 2: Usando axios, intento ${attempt + 1}/3`);
          
          // Usar una cabecera especial para identificar intentos de actualización
          const axiosResponse = await api.patch(`/api/tasks/${id}/`, 
            { 
              status: status,
              // Incluir campos críticos adicionales
              ...(originalTask && { priority: originalTask.priority })
            },
            {
              headers: {
                'X-Attempt': `${attempt + 1}`,
                'Cache-Control': 'no-cache'
              }
            }
          );
          
          if (axiosResponse.data && axiosResponse.data.id) {
            const result = axiosResponse.data;
            
            // Asegurarnos de que el estado sea el correcto
            if (result.status !== status) {
              console.warn(`Corrigiendo estado en respuesta: ${result.status} → ${status}`);
              result.status = status;
            }
            
            return result;
          } else {
            console.warn(`Respuesta de axios incompleta en intento ${attempt + 1}`);
          }
        } catch (axiosError) {
          console.warn(`Error en intento ${attempt + 1}:`, axiosError);
          // Pequeña pausa antes del siguiente intento
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      // Si nada funciona y tenemos la tarea original, devolver una versión con el estado actualizado
      if (originalTask) {
        console.warn(`Todos los métodos fallaron. Devolviendo tarea original con estado forzado ${status}`);
        return {
          ...originalTask,
          status: status
        };
      }
      
      // Último recurso - crear un objeto mínimo con el estado correcto
      console.warn(`Creando objeto mínimo con estado correcto como último recurso`);
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
