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

  register: async (
    email: string, 
    username: string, 
    password: string, 
    password2: string, 
    first_name: string, 
    last_name: string
  ) => {
    try {
      console.log("Datos de registro enviados:", { 
        email, 
        username, 
        password: "******", 
        password2: "******", 
        first_name, 
        last_name 
      });
      
      const response = await api.post("/api/register/", { 
        email, 
        username, 
        password, 
        password2, 
        first_name, 
        last_name 
      });
      
      return response.data;
    } catch (error: any) {
      console.error("authService - register - Error completo:", error);
      
      // Mostramos detalles completos del error para diagnóstico
      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        console.error("Datos del error:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        
        const serverError = error.response.data;
        
        // Manejar diferentes tipos de respuestas de error
        if (typeof serverError === 'string') {
          throw new Error(serverError);
        } else if (serverError.detail) {
          throw new Error(serverError.detail);
        } else if (serverError.email) {
          throw new Error(`Email: ${serverError.email}`);
        } else if (serverError.password) {
          throw new Error(`Contraseña: ${serverError.password}`);
        } else if (serverError.name) {
          throw new Error(`Nombre: ${serverError.name}`);
        } else if (serverError.non_field_errors) {
          throw new Error(serverError.non_field_errors);
        } else {
          // Si hay datos de error pero no en un formato que esperamos
          throw new Error(JSON.stringify(serverError));
        }
      } else if (error.request) {
        // La solicitud se hizo pero no se recibió respuesta
        console.error("No se recibió respuesta del servidor");
        throw new Error("No se pudo conectar con el servidor. Verifica tu conexión a internet.");
      } else {
        // Algo ocurrió al configurar la solicitud
        console.error("Error al configurar la solicitud:", error.message);
        throw new Error("Error al realizar la solicitud: " + error.message);
      }
    }
  },
};
