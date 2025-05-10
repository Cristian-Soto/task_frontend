import api from "./index";
import { CookieUtils } from "../utils/cookies";
import { TokenUtils } from "../utils/tokenUtils";

export const authService = {
  logout: () => {
    // Eliminar tokens de localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Eliminar cookies
    CookieUtils.removeCookie('access_token');
    CookieUtils.removeCookie('refresh_token');
    
    // Eliminar cualquier otra cookie relacionada con la sesión
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  },
  
  /**
   * Verifica el estado de autenticación y renueva el token si es necesario
   * @returns true si el usuario está autenticado, false en caso contrario
   */
  async checkAuth(): Promise<boolean> {
    return await TokenUtils.ensureTokenValid();
  },
  
  /**
   * Obtiene el token de acceso actual, renovándolo si es necesario
   * @returns El token de acceso o null si no hay sesión
   */
  async getAccessToken(): Promise<string | null> {
    const isValid = await this.checkAuth();
    if (!isValid) return null;
    
    return CookieUtils.getCookie('access_token') || localStorage.getItem('access_token');
  },
  login: async (email: string, password: string) => {
    try {
      const response = await api.post("/api/token/", { email, password });
      
      // Guardar tokens en cookies y localStorage
      const { access, refresh } = response.data;
      
      // Guardar en cookies para que sean accesibles por el middleware
      CookieUtils.setCookie('access_token', access);
      CookieUtils.setCookie('refresh_token', refresh);
      
      // Guardar en localStorage para uso en el cliente
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      return response.data; // Devuelve { access, refresh }
    } catch (error) {
      console.error("authService - login - Error:", error);
      throw new Error(
        "Error al iniciar sesión. Por favor, verifica tus credenciales."
      );
    }
  },  register: async (first_name: string, last_name: string, username: string, email: string, password: string, password2: string) => {    try {
      console.log("Enviando datos de registro:", { 
        first_name, 
        last_name, 
        username, 
        email, 
        password: password ? "***" : undefined,
        password2: password2 ? "***" : undefined
      });

      const response = await api.post("/api/register/", { 
        first_name, 
        last_name, 
        username, 
        email, 
        password,
        password2
      });
      return response.data;
    } catch (error: any) {
      console.error("authService - register - Error:", error);
      
      // Imprimir datos completos de error para depuración
      if (error.response) {
        console.error("Respuesta del servidor:", error.response.status);
        console.error("Datos del error:", error.response.data);
        console.error("Headers:", error.response.headers);
      }
      
      // Si el error tiene un mensaje detallado del servidor, lo usamos
      if (error.response && error.response.data) {
        const serverError = error.response.data;
        console.log("Detalles del error:", serverError);
        
        if (serverError.detail) {
          throw new Error(serverError.detail);
        } else if (serverError.email) {
          throw new Error(`Email: ${serverError.email}`);
        } else if (serverError.username) {
          throw new Error(`Usuario: ${serverError.username}`);
        } else if (typeof serverError === 'object') {
          // Si el error es un objeto pero no tiene campos específicos
          const errorMessages = Object.entries(serverError)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('; ');
          throw new Error(errorMessages || "Error en los datos enviados");
        }else if (serverError.username) {
          throw new Error(`Usuario: ${serverError.username}`);
        }
      }
      // Si no hay un mensaje específico, usamos uno genérico
      throw new Error(
        "Error en el proceso de registro. Por favor, inténtalo de nuevo."
      );
    }
  },
};
