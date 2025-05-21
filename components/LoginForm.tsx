"use client";

/**
 * @file LoginForm.tsx
 * @description Componente para el formulario de inicio de sesión con validación de campos
 * y diseño mejorado. Incluye funcionalidad para iniciar sesión con credenciales normales o 
 * de prueba, validación de formularios y manejo de estados de error/carga.
 * @author Cristian Soto
 * @version 1.1.0
 * @lastModified 2025-05-21
 */

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/service/auth";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";

// Importar la hoja de estilos CSS para los formularios de autenticación
import "../public/auth-styles.css";

/**
 * Componente de formulario de inicio de sesión
 * Maneja validación, errores y redirecciones post-login
 * @returns {JSX.Element} Formulario de inicio de sesión renderizado
 */
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
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="flex justify-center mb-4">
            <Image src="/task-logo.svg" alt="Task Manager Logo" width={80} height={80} />
          </div>
          <h2>Iniciar Sesión</h2>
          <p>Bienvenido de nuevo, ingresa tus credenciales para acceder</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <div className="relative">
              <span className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </span>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>
            {emailError && <p className="field-error">{emailError}</p>}
          </div>

          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <div className="relative">
              <span className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </span>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                placeholder="••••••••"
                required
              />
            </div>
            {passwordError && <p className="field-error">{passwordError}</p>}
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="auth-footer">
          ¿No tienes una cuenta?{" "}
          <Link href="/register" className="auth-link">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
