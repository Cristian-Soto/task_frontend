"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@components/dashboard/Sidebar";
import Header from "@components/dashboard/Header";
import AuthCheck from "@components/auth/AuthCheck";
import { useTaskStore } from "@/hooks/useTaskStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {  const router = useRouter();
  const { fetchTasks } = useTaskStore();
  
  // Cargar tareas una sola vez al montar el componente
  useEffect(() => {
    console.log("[Dashboard Layout] Cargando tareas iniciales");
    // Utilizamos un flag en sessionStorage para evitar cargas duplicadas
    const tasksLoaded = sessionStorage.getItem('tasksLoaded');
    
    if (!tasksLoaded) {
      fetchTasks().then(() => {
        sessionStorage.setItem('tasksLoaded', 'true');
        console.log("[Dashboard Layout] Tareas cargadas correctamente");
      });
    } else {
      console.log("[Dashboard Layout] Las tareas ya fueron cargadas previamente");
    }
  }, [fetchTasks]);
  
  // Verificar que el usuario está autenticado
  useEffect(() => {
    // Ya no es necesario hacer esta verificación aquí porque el middleware se encargará
    // de redirigir al usuario si no está autenticado, pero lo dejamos como una capa adicional
    // de seguridad en el lado del cliente
    const checkAuth = async () => {
      console.log("[Dashboard Layout] Verificando autenticación");
      const token = localStorage.getItem('access_token') || 
                    document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
      
      console.log("[Dashboard Layout] Token encontrado:", !!token);
      if (!token) {
        console.log("[Dashboard Layout] No hay token, redirigiendo a login");
        router.push('/login');
      } else {
        console.log("[Dashboard Layout] Token válido, cargando dashboard");
      }
    };
    
    checkAuth();
  }, [router]);

  return (
    <AuthCheck>
      <div className="flex h-screen bg-gray-50">
        {/* Barra lateral */}
        <Sidebar />
        
        {/* Contenido principal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Encabezado */}
          <Header />
          
          {/* Contenido */}
          <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </AuthCheck>
  );
}