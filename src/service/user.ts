import api from "./index";

export const userService = {
  getCurrentUser: async () => {
    try {
      const response = await api.get("/api/users/me/");
      return response.data;
    } catch (error) {
      console.error("userService - getCurrentUser - Error:", error);
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