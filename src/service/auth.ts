import api from "./index";

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post("/api/token/", { email, password });
      return response.data; // Devuelve { access, refresh }
    } catch (error) {
      console.error("authServise - login - Error:", error);
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
