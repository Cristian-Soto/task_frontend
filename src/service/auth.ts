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
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const response = await api.post("/api/register/", { name, email, password });
      return response.data;
    } catch (error: any) {
      console.error("authService - register - Error:", error);
      // Si el error tiene un mensaje detallado del servidor, lo usamos
      if (error.response && error.response.data) {
        const serverError = error.response.data;
        if (serverError.detail) {
          throw new Error(serverError.detail);
        } else if (serverError.email) {
          throw new Error(`Email: ${serverError.email}`);
        }
      }
      // Si no hay un mensaje específico, usamos uno genérico
      throw new Error(
        "Error en el proceso de registro. Por favor, inténtalo de nuevo."
      );
    }
  },
};
