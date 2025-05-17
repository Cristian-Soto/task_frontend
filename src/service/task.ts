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
      
      // Función para procesar una tarea individual y asegurar formato correcto
      const processTask = (task: any): Task => {
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
      };
      
      // CASO 1: Si es un array directamente
      if (Array.isArray(response.data)) {
        console.log(`taskService - getTasks: ${response.data.length} tareas obtenidas`);
        return response.data.map(processTask);
      } 
      
      // CASO 2: Si es una respuesta paginada con array en results
      if (response.data && response.data.results && Array.isArray(response.data.results)) {
        console.log(`taskService - getTasks: Respuesta paginada con ${response.data.results.length} tareas obtenidas`);
        return response.data.results.map(processTask);
      }
        // CASO 3: Si es un objeto con tasks o items como propiedad
      const potentialArrayProperties = ['tasks', 'items', 'data', 'content'];
      for (const prop of potentialArrayProperties) {
        if (response.data && response.data[prop]) {
          // Si la propiedad es directamente un array
          if (Array.isArray(response.data[prop])) {
            console.log(`taskService - getTasks: Encontrado array en propiedad '${prop}' con ${response.data[prop].length} tareas`);
            return response.data[prop].map(processTask);
          }
          
          // Si la propiedad es un objeto que a su vez contiene un array en una subpropiedad común
          if (typeof response.data[prop] === 'object' && response.data[prop]) {
            // Comprobar subpropiedades comunes
            for (const subProp of ['items', 'results', 'tasks', 'list']) {
              if (Array.isArray(response.data[prop][subProp])) {
                console.log(`taskService - getTasks: Encontrado array en sub-propiedad '${prop}.${subProp}' con ${response.data[prop][subProp].length} tareas`);
                return response.data[prop][subProp].map(processTask);
              }
            }
          }
        }
      }
      
      // CASO 4: Si el objeto tiene una estructura inesperada pero contiene propiedades de tarea
      if (response.data && typeof response.data === 'object') {
        // Si el objeto tiene propiedades típicas de una colección de tareas numeradas (0, 1, 2...)
        const numericKeys = Object.keys(response.data).filter(key => !isNaN(Number(key)));
        if (numericKeys.length > 0) {
          console.log(`taskService - getTasks: Encontrado objeto con ${numericKeys.length} tareas numeradas`);
          
          const taskArray = numericKeys.map(key => response.data[key]);
          return taskArray.map(processTask);
        }
        
        // Si parece ser una sola tarea (tiene id y otras propiedades típicas)
        if (response.data.id && (response.data.title || response.data.status)) {
          console.log(`taskService - getTasks: Encontrada una sola tarea con ID ${response.data.id}`);
          return [processTask(response.data)];
        }
      }
      
      // Inspección detallada de la estructura recibida para facilitar la depuración
      console.error("taskService - getTasks: Formato de datos incorrecto", response.data);
      if (response.data) {
        if (typeof response.data === 'object') {
          console.log("taskService - getTasks: Propiedades del objeto recibido:", Object.keys(response.data));
          console.log("taskService - getTasks: Muestra del contenido del objeto:", JSON.stringify(response.data).substring(0, 200) + "...");
        } else {
          console.log("taskService - getTasks: Tipo de datos recibido:", typeof response.data);
        }
      }
      
      return []; // Devolver un array vacío si no se pudo procesar la respuesta
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
      
      // Primero obtenemos la tarea original para preservar datos importantes
      let originalTask: Task | null = null;
      try {
        const originalResponse = await api.get(`/api/tasks/${id}/`);
        if (originalResponse.data && originalResponse.data.id) {
          originalTask = originalResponse.data;
          console.log(`taskService - updateTask: Datos originales de la tarea ${id}:`, originalTask);
        }
      } catch (getError) {
        console.warn(`No se pudo obtener la tarea original ${id}:`, getError);
      }
      
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
      } else if (originalTask && originalTask.priority) {
        // Si no se proporcionó una prioridad y tenemos la tarea original, preservamos su prioridad
        validatedData.priority = originalTask.priority;
      }
      
      if (taskData.description !== undefined) {
        validatedData.description = taskData.description;
      }
      
      if (taskData.due_date !== undefined) {
        validatedData.due_date = taskData.due_date;
      }
      
      // Enviar la actualización a la API
      console.log(`Enviando datos validados para actualizar tarea ${id}:`, validatedData);      const updateResponse = await api.patch(`/api/tasks/${id}/`, validatedData);
      
      console.log(`Tarea ${id} actualizada con éxito:`, updateResponse.data);
      return updateResponse.data;
    } catch (error) {
      console.error(`taskService - updateTask(${id}) - Error:`, error);
      throw error;
    }
  },

  // Actualizar solo el estado de una tarea
  updateTaskStatus: async (id: number, status: Task['status']): Promise<Task> => {
    console.log(`taskService - updateTaskStatus: Actualizando tarea ${id} a estado ${status}`);

    // Validar que el estado sea válido antes de enviarlo
    if (!['pending', 'in_progress', 'completed'].includes(status)) {
        console.error(`Estado inválido detectado: ${status}`);
        throw new Error(`Estado inválido: ${status}`);
    }    try {
        const response = await api.patch(`/api/tasks/${id}/`, { status });
        
        if (!response.data || !response.data.id) {
            throw new Error('Respuesta inválida del servidor');
        }// Validar y asegurar que los datos devueltos sean correctos
        const validatedTask: Task = {
            ...response.data,
            status: ['pending', 'in_progress', 'completed'].includes(response.data.status) 
                ? response.data.status 
                : status,
            priority: response.data.priority && ['baja', 'media', 'alta'].includes(response.data.priority)
                ? response.data.priority
                : 'media', // Usar media solo como último recurso
            status_display: STATUS_MAPPING[status as keyof typeof STATUS_MAPPING]
        };

        console.log(`taskService - updateTaskStatus: Tarea ${id} actualizada correctamente`);
        return validatedTask;
    } catch (error) {
        console.error(`taskService - updateTaskStatus - Error al actualizar tarea ${id}:`, error);
        throw new Error(`Error al actualizar el estado de la tarea: ${error}`);
    }  },

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
