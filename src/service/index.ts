// src/lib/api.ts
import axios, { AxiosRequestConfig } from "axios";
import { CookieUtils } from "../utils/cookies";
import { TokenUtils } from "../utils/tokenUtils";

const isDevelopment = process.env.NODE_ENV === 'development';
const API_URL = isDevelopment ? 'http://localhost:8000' : process.env.NEXT_PUBLIC_API_URL;
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interfaz para las promesas en cola
interface QueuePromise {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}

// Variable para controlar si hay una renovación de token en curso
let isRefreshing = false;
// Cola de solicitudes a reintentarse después de renovar el token
let failedQueue: QueuePromise[] = [];

// Función para procesar la cola de solicitudes fallidas
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.request.use(async (config) => {
  // Si la solicitud es para renovar el token, no necesitamos verificar el token actual
  if (config.url?.includes('/token/refresh/')) {
    return config;
  }
  
  try {
    // Intentar obtener token primero de las cookies, luego del localStorage
    let token = CookieUtils.getCookie('access_token') || localStorage.getItem('access_token');
      // Si hay un token y está próximo a expirar, intentar renovarlo
    if (token && TokenUtils.isTokenExpiringSoon(token)) {
      // Renovar token solo si no hay otra renovación en curso
      if (!isRefreshing) {
        isRefreshing = true;
        
        try {
          await TokenUtils.refreshAccessToken();
          // Obtener el nuevo token
          token = CookieUtils.getCookie('access_token') || localStorage.getItem('access_token');
          processQueue(null, token);
        } catch (refreshError) {
          processQueue(refreshError as Error, null);
        } finally {
          isRefreshing = false;
        }
      }
    }
    
    // Usar el token actualizado (o el original si no se renovó)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  } catch (error) {
    console.error("Error en interceptor de solicitud:", error);
    return config; // Continuar con la solicitud aun si hay un error en la renovación
  }
});

api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    // Si el error es 401 Unauthorized pero no estamos intentando renovar el token
    if (error.response?.status === 401 && !error.config.url?.includes('/token/refresh/')) {
      // Intentar refrescar el token solo una vez
      const originalRequest = error.config;
      
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        
        // Si ya estamos refrescando el token, agregamos la solicitud a la cola
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }
        
        // Intentar renovar el token
        isRefreshing = true;
        
        return TokenUtils.refreshAccessToken()
          .then(() => {
            const newToken = CookieUtils.getCookie('access_token') || localStorage.getItem('access_token');
            
            // Procesar otras solicitudes en cola
            processQueue(null, newToken);
            
            // Actualizar el token en la solicitud original y reintentarla
            if (newToken) {
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            }
            return api(originalRequest);
          })
          .catch(refreshError => {
            processQueue(refreshError as Error, null);
            
            // Si no se pudo renovar el token, solo en este caso cerramos sesión
            const { authService } = require('./auth');
            authService.logout();
            
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
            
            return Promise.reject(refreshError);
          })
          .finally(() => {
            isRefreshing = false;
          });
      }
    }
    
    // Para otros errores que no son 401 o ya intentamos renovar el token sin éxito
    if (error.response?.status === 401) {
      // Importamos con require para evitar problemas de importación circular
      const { authService } = require('./auth');
      authService.logout();
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error)
  }
)

// Interceptor de respuesta para verificar y validar las tareas
api.interceptors.response.use(
  (response) => {
    // Verificar si la respuesta es para una actualización de tarea
    const url = response.config.url;
    if (url && url.includes('/api/tasks/')) {
      // Si se está obteniendo o modificando tareas
      if (response.config.method === 'get') {
        // Para solicitudes GET que devuelven un array de tareas
        if (Array.isArray(response.data)) {
          console.log(`Interceptor: Respuesta con ${response.data.length} tareas recibidas`);
            // Validar cada tarea en el array
          response.data = response.data.map(task => {
            // Asegurar que cada tarea tenga los campos requeridos con valores válidos
            // Aceptar estados tanto en inglés como en español
            const validStatesES = ['pendiente', 'en_progreso', 'completada'];
            const validStatesEN = ['pending', 'in_progress', 'completed'];
            
            let finalStatus = task.status;
            if (validStatesEN.includes(task.status)) {
              finalStatus = task.status;
            } else if (validStatesES.includes(task.status)) {
              // Mapear estados en español a inglés si es necesario
              const statusMap = {
                'pendiente': 'pending',
                'en_progreso': 'in_progress',
                'completada': 'completed'
              };
              finalStatus = statusMap[task.status as keyof typeof statusMap] || 'pending';
            } else {
              finalStatus = 'pending';
            }
              return {
              ...task,
              status: finalStatus,
              priority: task.priority && ['baja', 'media', 'alta'].includes(task.priority) ? task.priority : 'media'
            };
          });
        } 
        // Para solicitudes GET que devuelven una única tarea
        else if (response.data && typeof response.data === 'object' && response.data.id) {
          console.log(`Interceptor: Respuesta con datos de tarea individual recibida:`, response.data.id);
            // Validar y corregir la tarea individual
          const task = response.data;
          
          // Aceptar estados tanto en inglés como en español
          const validStatesES = ['pendiente', 'en_progreso', 'completada'];
          const validStatesEN = ['pending', 'in_progress', 'completed'];
          
          // Determinar el estado final
          let finalStatus = task.status;
          if (validStatesEN.includes(task.status)) {
            finalStatus = task.status;
          } else if (validStatesES.includes(task.status)) {
            // Mapear estados en español a inglés
            const statusMap = {
              'pendiente': 'pending',
              'en_progreso': 'in_progress',
              'completada': 'completed'
            };
            finalStatus = statusMap[task.status as keyof typeof statusMap] || 'pending';
          } else {
            finalStatus = 'pending';
          }
          
          response.data = {
            ...task,
            status: finalStatus,
            priority: task.priority && ['baja', 'media', 'alta'].includes(task.priority) ? task.priority : 'media'
          };
        }
      }
      // Para actualizaciones de tareas (PUT/PATCH)
      else if (response.config.method === 'patch' || response.config.method === 'put') {
        console.log('Interceptor: Respuesta de actualización de tarea recibida:', response.data);
        
        // Verificar y corregir los datos de la tarea actualizada
        if (response.data && typeof response.data === 'object') {
          const task = response.data;
            // Verificar que los valores críticos estén presentes y sean válidos
          // Aceptar estados tanto en inglés como en español
          const validStatesES = ['pendiente', 'en_progreso', 'completada'];
          const validStatesEN = ['pending', 'in_progress', 'completed'];
          
          if (task.status && (validStatesEN.includes(task.status) || validStatesES.includes(task.status))) {
            console.log(`Interceptor: Estado válido detectado: ${task.status}`);
          } else {
            console.warn(`Interceptor: Estado de tarea inválido o faltante detectado: ${task.status}`);
            
            // Intentar obtener el estado de los datos de la solicitud
            try {
                const requestData = JSON.parse(response.config.data || '{}');
                if (requestData && requestData.status) {
                    if (validStatesEN.includes(requestData.status) || validStatesES.includes(requestData.status)) {
                        console.log('Interceptor: Usando el estado de la solicitud:', requestData.status);
                        task.status = requestData.status;
                    }
                }
            } catch (err) {
                console.error('Error al parsear datos de solicitud:', err);
            }
            
            // Si todavía no es válido, asignar un valor por defecto
            if (!task.status || (!validStatesEN.includes(task.status) && !validStatesES.includes(task.status))) {
                task.status = 'pending'; // Valor por defecto en inglés
            }
          }          // Validar y corregir prioridad si es necesario
          const validPriorities = ['baja', 'media', 'alta'];
          
          if (task.priority && validPriorities.includes(task.priority)) {
            console.log(`Interceptor: Prioridad válida detectada: ${task.priority}`);
          } else {
            console.warn(`Interceptor: Prioridad de tarea inválida o faltante detectada: ${task.priority}`);
            
            // Intentar obtener la prioridad de los datos de la solicitud
            try {
                const requestData = JSON.parse(response.config.data || '{}');
                if (requestData && requestData.priority && validPriorities.includes(requestData.priority)) {
                    console.log('Interceptor: Usando la prioridad de la solicitud:', requestData.priority);
                    task.priority = requestData.priority;
                } 
                // Si no hay prioridad en la solicitud, intentar mantener la prioridad original
                else if (!requestData.priority && task.id) {
                    // No forzar el cambio a 'media' si no se está intentando actualizar la prioridad
                    console.log('Interceptor: Manteniendo la prioridad original');
                }
            } catch (err) {
                console.error('Error al parsear datos de solicitud:', err);
            }
            
            // Solo asignar el valor por defecto si no hay prioridad en absoluto
            if (!task.priority) {
                task.priority = 'media';
            }
          }
          
          // Log detallado de la tarea procesada
          console.log('Interceptor: Tarea procesada:', {
              id: task.id,
              title: task.title,
              status: task.status,
              priority: task.priority,
              status_display: task.status_display
          });
          
          response.data = task;
        }
      }
    }
    
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;