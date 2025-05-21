"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/service/auth";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      path: "/dashboard",
    },
    {
      name: "Tareas",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      path: "/dashboard/tasks",
    },
    {
      name: "Perfil",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      path: "/dashboard/profile",
    },
    {
      name: "Configuración",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      path: "/dashboard/settings",
    }
  ];  const handleLogout = () => {
    // Usar el servicio de autenticación para cerrar sesión
    authService.logout();
    
    // Redirigir al login usando el router de Next.js
    router.push('/login');
  };

  return (    <aside      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-primary dark:bg-gray-800 text-primary-foreground transition-all duration-300 ease-in-out flex flex-col h-full border-r border-border dark:border-gray-700`}
    >
      <div className="p-5 flex justify-between items-center">
        <div className={`${collapsed ? "hidden" : "block"}`}>
          <h2 className="text-2xl font-bold">TaskApp</h2>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none"
        >
          {collapsed ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex-1 px-3 py-5 overflow-y-auto">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
            
            return (
              <Link
                key={item.path}
                href={item.path}                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary/20 text-primary-foreground font-medium"
                    : "text-primary-foreground/80 hover:bg-primary/10"
                }`}
              >
                <span className="flex items-center justify-center">{item.icon}</span>
                <span className={`ml-3 ${collapsed ? "hidden" : "block"}`}>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>      <div className="p-4 border-t border-border dark:border-gray-700">
        <button
          onClick={handleLogout}className={`flex items-center p-3 rounded-lg transition-all hover:bg-primary/10 dark:hover:bg-gray-700 w-full text-primary-foreground ${
            collapsed ? "justify-center" : "justify-start"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className={`ml-3 ${collapsed ? "hidden" : "block"}`}>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
