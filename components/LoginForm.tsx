"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/service/auth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();

  // Validación de email con expresión regular
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validar el formato del email antes de enviar la solicitud
    if (!validateEmail(email)) {
      setEmailError("Por favor, ingresa un correo electrónico válido");
      return;
    }

    setEmailError("");

    // Validar que la contraseña tenga al menos 6 caracteres
    if (password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setPasswordError("");

    try {
      const { access, refresh } = await authService.login(email, password);
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      router.push("/dashboard"); // Redirige a la página principal
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-4 rounded w-96"
    >
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>
      {error && <p className="text-red-600">{error}</p>}
      <input
        //type="email"
        placeholder="Correo"
        className="border p-2 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      {emailError && <p className="text-red-600">{emailError}</p>}
      <input
        type="password"
        placeholder="Contraseña"
        className="border p-2 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {passwordError && <p className="text-red-600">{passwordError}</p>}
      <button type="submit" className="bg-blue-600 text-white p-2 rounded">
        Iniciar sesión
      </button>
    </form>
  );
}
