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
    return `border ${hasError ? 'border-red-500 bg-red-50 dark:bg-red-900/30' : 'border-gray-300 dark:border-gray-600'} p-3 rounded transition-colors focus:outline-none focus:ring-2 ${hasError ? 'focus:ring-red-200 dark:focus:ring-red-800' : 'focus:ring-blue-200 dark:focus:ring-blue-800'} focus:border-transparent text-base placeholder-gray-500 dark:placeholder-gray-400 placeholder-opacity-100 font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700`;
  }
  return (    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-md p-8 space-y-6 bg-card-background dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Iniciar Sesión</h2>
          <p className="mt-2 text-muted-foreground dark:text-gray-300">
            Ingresa tus credenciales para acceder
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium dark:text-gray-200">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-md bg-background dark:bg-gray-700 text-foreground dark:text-gray-200 border-input dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary/70"
              placeholder="usuario@ejemplo.com"
              required
            />
            {emailError && <p className="mt-1 text-sm text-destructive dark:text-red-400">{emailError}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium dark:text-gray-200">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-md bg-background dark:bg-gray-700 text-foreground dark:text-gray-200 border-input dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary/70"
              placeholder="••••••••"
              required
            />
            {passwordError && <p className="mt-1 text-sm text-destructive dark:text-red-400">{passwordError}</p>}
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 dark:bg-red-900/20 border border-destructive/30 dark:border-red-800/30">
              <p className="text-sm text-destructive dark:text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 dark:hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/70 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>

          <button
            type="button"
            onClick={loginWithTestCredentials}
            disabled={loading}
            className="w-full py-2 px-4 bg-secondary dark:bg-gray-700 text-secondary-foreground dark:text-gray-200 rounded-md hover:bg-secondary/90 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-secondary/50 dark:focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Cargando..." : "Usar Credenciales de Prueba"}
          </button>
        </form>

        <p className="text-center text-muted-foreground dark:text-gray-400">
          ¿No tienes una cuenta?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
