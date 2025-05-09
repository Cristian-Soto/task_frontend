"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redireccionar a la página de dashboard automáticamente
    router.replace("/dashboard");
  }, [router]);

  // Esta página no renderiza nada visible ya que redirecciona inmediatamente
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redireccionando...</p>
    </div>
  );
}