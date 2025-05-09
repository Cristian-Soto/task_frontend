"use client";

import { useState, useEffect } from "react";
import { userService } from "@/service/user";

const Header = () => {
  const [user, setUser] = useState<any>(null);
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

  const today = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <header className="py-6 px-8 bg-white border-b border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {greeting} {userName ? userName : ''}
          </h1>
          <p className="text-gray-600 capitalize">{today}</p>
        </div>
        <div className="mt-4 md:mt-0">
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
