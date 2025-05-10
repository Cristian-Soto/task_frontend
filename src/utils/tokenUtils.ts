import { authService } from "../service/auth";
import { CookieUtils } from "./cookies";
import api from "../service/index";

/**
 * Utilidades para el manejo de tokens JWT
 */
export const TokenUtils = {
  /**
   * Decodifica un token JWT sin validarlo
   * @param token Token JWT a decodificar
   * @returns Contenido decodificado del token o null si el formato es inválido
   */
  decodeToken(token: string): any {
    if (!token) return null;
    
    try {
      // Dividir el token en sus 3 partes: header, payload, signature
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      // Decodificar la parte del payload (parte central)
      const payload = parts[1];
      const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      return null;
    }
  },
  
  /**
   * Verifica si un token JWT está próximo a expirar
   * @param token Token JWT a verificar
   * @param thresholdMinutes Minutos antes de la expiración para considerarlo "próximo a expirar"
   * @returns true si el token está próximo a expirar, false en caso contrario
   */
  isTokenExpiringSoon(token: string, thresholdMinutes: number = 15): boolean {
    if (!token) return true;
    
    const decodedToken = this.decodeToken(token);
    if (!decodedToken || !decodedToken.exp) return true;
    
    // Convertir la fecha de expiración de segundos a milisegundos
    const expirationTime = decodedToken.exp * 1000;
    const currentTime = Date.now();
    
    // Calcular el tiempo restante en minutos
    const timeRemainingMinutes = (expirationTime - currentTime) / (1000 * 60);
    
    // Si el tiempo restante es menor que el umbral, el token está próximo a expirar
    return timeRemainingMinutes < thresholdMinutes;
  },
  
  /**
   * Intenta renovar el token de acceso utilizando el token de refresco
   * @returns Promesa que se resuelve con true si el token fue renovado exitosamente
   */
  async refreshAccessToken(): Promise<boolean> {
    try {
      // Obtener el token de refresco
      const refreshToken = CookieUtils.getCookie('refresh_token') || localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        throw new Error("No hay token de refresco disponible");
      }
      
      // Llamar al endpoint de refresco de token
      const response = await api.post("/api/token/refresh/", { refresh: refreshToken });
      
      if (response.data && response.data.access) {
        // Guardar el nuevo token de acceso
        const newAccessToken = response.data.access;
        
        // Actualizar en cookies y localStorage
        CookieUtils.setCookie('access_token', newAccessToken);
        localStorage.setItem('access_token', newAccessToken);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error al renovar el token de acceso:", error);
      
      // Si hay un error al renovar el token, posiblemente el token de refresco
      // también haya expirado. En ese caso, no cerramos sesión para mantener
      // al usuario conectado, solo informamos del error.
      return false;
    }
  },
  
  /**
   * Verifica y renueva el token de acceso si es necesario
   */
  async ensureTokenValid(): Promise<boolean> {
    const accessToken = CookieUtils.getCookie('access_token') || localStorage.getItem('access_token');
    
    if (!accessToken) {
      return false; // No hay token de acceso
    }
    
    // Verificar si el token está próximo a expirar
    if (this.isTokenExpiringSoon(accessToken)) {
      // Intentar renovar el token
      return await this.refreshAccessToken();
    }
    
    return true; // El token es válido y no está próximo a expirar
  }
};