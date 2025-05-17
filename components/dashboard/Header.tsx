"use client";

import { useState, useEffect } from "react";
import { userService } from "@/service/user";
import dynamic from 'next/dynamic';
import DarkModeToggle from './DarkModeToggle';

// Importación dinámica del componente de fecha con la opción ssr=false para evitar renderizado en servidor
const ClientDate = dynamic(() => import('./ClientDate'), { 
  ssr: false,
  loading: () => <p className="text-gray-600 dark:text-gray-400">Cargando fecha...</p>
});

const Header = () => {  const [user, setUser] = useState<any>(null);
  const [greeting, setGreeting] = useState("¡Bienvenido!");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await userService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    // Solo configuramos el saludo basado en la hora actual
    const date = new Date();
    const currentHour = date.getHours();

    if (currentHour < 12) {
      setGreeting("¡Buenos días!");
    } else if (currentHour < 18) {
      setGreeting("¡Buenas tardes!");
    } else {
      setGreeting("¡Buenas noches!");
    }
  }, []);
  const userName = user?.first_name 
    ? `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}` 
    : user?.username || "";
  return (
    <header className="py-6 px-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {greeting} {userName ? userName : ''}
          </h1>          <ClientDate />
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <DarkModeToggle />
          {user && (
            <div className="flex items-center">
              <div className="relative inline-block">
                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-semibold">
                  {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase() || '?'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
