"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/service/auth";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Verificar si el usuario acaba de ser redirigido desde un registro exitoso
  // Este código se ejecuta cuando el usuario llega a la página de login con el parámetro 'registered=true' en la URL
  // La redirección se realiza desde RegisterForm después de completar el registro exitosamente
  useEffect(() => {
    const registered = searchParams.get("registered");
    if (registered === "true") {
      toast.success("¡Registro exitoso! Ahora puedes iniciar sesión con tus credenciales.");
    }
  }, [searchParams]);

  // Validación de email con expresión regular
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  // Función para iniciar sesión con credenciales de prueba
  const loginWithTestCredentials = async () => {
    setEmail("usuario@ejemplo.com");
    setPassword("123456");
    
    try {
      setLoading(true);
      setError("");
      const result = await authService.login("usuario@ejemplo.com", "123456");
      toast.success("Inicio de sesión exitoso");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error de inicio de sesión:", error);
      
      if (error.response && error.response.status === 401) {
        setError("Credenciales incorrectas. Por favor, verifica tu correo y contraseña.");
        toast.error("Credenciales de prueba inválidas");
      } else {
        setError("Ha ocurrido un error al iniciar sesión. Por favor, intenta de nuevo.");
        toast.error("Error de conexión");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    setPasswordError("");
    
    // Validar el formato del email antes de enviar la solicitud
    if (!validateEmail(email)) {
      setEmailError("Por favor, ingresa un correo electrónico válido");
      toast.error("Formato de correo electrónico inválido");
      return;
    }

    // Validar que la contraseña tenga al menos 6 caracteres
    if (password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      toast.error("La contraseña es demasiado corta");
      return;
    }

    setLoading(true);
      try {
      const loadingToast = toast.loading("Iniciando sesión...");
      // El servicio de autenticación ya maneja el almacenamiento de tokens
      await authService.login(email, password);
      
      toast.dismiss(loadingToast);
      toast.success("¡Inicio de sesión exitoso!");
      
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (hasError: boolean) => {
    return `border ${hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'} p-3 rounded transition-colors focus:outline-none focus:ring-2 ${hasError ? 'focus:ring-red-200' : 'focus:ring-blue-200'} focus:border-transparent text-base placeholder-gray-500 placeholder-opacity-100 font-medium text-gray-700`;
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Iniciar Sesión</h2>
      
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <input
            type="email"
            placeholder="Correo"
            className={getInputClass(!!emailError)}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ fontSize: '1.05rem' }}
          />
          {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
        </div>
        
        <div className="flex flex-col gap-1">
          <input
            type="password"
            placeholder="Contraseña"
            className={getInputClass(!!passwordError)}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ fontSize: '1.05rem' }}
          />
          {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
        </div>
        
        <button 
          type="submit" 
          className={`bg-blue-600 text-white p-3 rounded font-medium hover:bg-blue-700 transition-colors mt-3 flex justify-center items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </>
          ) : 'Iniciar sesión'}
        </button>
        
        <div className="my-2 border-t border-gray-200"></div>
        
        <p className="text-center text-sm text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            Regístrate aquí
          </Link>
        </p>
      </form>
      
      {/* Botón para iniciar sesión rápida con credenciales de prueba */}
      <div className="mt-4">
        <button
          type="button"
          onClick={loginWithTestCredentials}
          className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition duration-200"
          disabled={loading}
        >
          {loading ? "Cargando..." : "Iniciar Sesión con Cuenta de Prueba"}
        </button>
      </div>
    </div>
  );
}
