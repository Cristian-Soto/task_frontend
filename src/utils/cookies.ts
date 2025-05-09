import Cookies from 'js-cookie';

// Tiempo de expiración predeterminado (1 año = 365 días)
// Esto hará que la sesión persista durante mucho tiempo hasta que el usuario cierre sesión manualmente
const DEFAULT_EXPIRATION_DAYS = 31;

export const CookieUtils = {
  // Establecer una cookie
  setCookie(name: string, value: string, days: number = DEFAULT_EXPIRATION_DAYS): void {
    Cookies.set(name, value, { expires: days, path: '/' });
  },

  // Obtener el valor de una cookie
  getCookie(name: string): string | undefined {
    return Cookies.get(name);
  },

  // Eliminar una cookie
  removeCookie(name: string): void {
    Cookies.remove(name, { path: '/' });
  },

  // Verificar si una cookie existe
  cookieExists(name: string): boolean {
    return !!this.getCookie(name);
  }
};
