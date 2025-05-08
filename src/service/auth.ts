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
};
