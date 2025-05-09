// src/lib/api.ts
import axios, { AxiosRequestConfig } from "axios";
import { CookieUtils } from "../utils/cookies";
import { TokenUtils } from "../utils/tokenUtils";

const isDevelopment = process.env.NODE_ENV === 'development'
const API_URL = isDevelopment ? 'http://localhost:8000': process.env.NEXT_PUBLIC_API_URL
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
    })
    return response  },  (error) => {
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

export default api;