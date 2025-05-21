"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redireccionar a la página de dashboard automáticamente
    console.log("Redirigiendo a /dashboard desde página principal");
    
    // Verificar si hay un token antes de redirigir
    const token = localStorage.getItem('access_token') || 
                  document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
                  
    if (token) {
      console.log("Token encontrado, redirigiendo a dashboard");
      router.replace("/dashboard");
    } else {
      console.log("No hay token, redirigiendo a login");
      router.replace("/login");
    }
  }, [router]);
  // Esta página no renderiza nada visible ya que redirecciona inmediatamente
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <p>Redireccionando...</p>
    </div>
  );
}