import api from "./index";

export const userService = {  getCurrentUser: async () => {
    try {
      console.log("userService - getCurrentUser: Solicitando datos de usuario...");
      const response = await api.get("/api/users/me/");
      console.log("userService - getCurrentUser: Usuario obtenido correctamente", response.data);
      return response.data;
    } catch (error) {
      console.error("userService - getCurrentUser - Error:", error);
      // Verificar si hay token disponible
      const token = localStorage.getItem('access_token') || document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
      console.error("userService - getCurrentUser - ¿Hay token disponible?", !!token);
      throw new Error("Error al obtener la información del usuario.");
    }
  },

  updateProfile: async (userData: any) => {
    try {
      const response = await api.patch("/api/users/me/", userData);
      return response.data;
    } catch (error) {
      console.error("userService - updateProfile - Error:", error);
      throw new Error("Error al actualizar el perfil del usuario.");
    }
  }
};