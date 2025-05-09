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
      const { access, refresh } = await authService.login(email, password);
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      
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
    return `border ${hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'} p-3 rounded transition-colors focus:outline-none focus:ring-2 ${hasError ? 'focus:ring-red-200' : 'focus:ring-blue-200'} focus:border-transparent text-base placeholder-gray-500 placeholder-opacity-100 font-medium`;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-6 rounded-lg shadow-md w-96 bg-white"
    >
      <h1 className="text-2xl font-bold text-center mb-2 text-blue-700">Iniciar sesión</h1>
      
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">{error}</div>}
      
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
  );
}
