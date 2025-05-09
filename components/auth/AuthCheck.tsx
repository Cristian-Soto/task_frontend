"use client";

import { useEffect, useState } from 'react';
import { authService } from '@/service/auth';
import { TokenUtils } from '@/utils/tokenUtils';

interface AuthCheckProps {
  children: React.ReactNode;
}

/**
 * Componente que se encarga de verificar periódicamente la validez del token
 * y renovarlo si es necesario para mantener la sesión activa.
 */
export default function AuthCheck({ children }: AuthCheckProps) {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Verificar autenticación al cargar el componente
    const checkAuth = async () => {
      try {
        await authService.checkAuth();
      } catch (error) {
        console.error("Error verificando autenticación:", error);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkAuth();
    
    // Configurar un intervalo para verificar periódicamente el token
    const tokenCheckInterval = setInterval(async () => {
      try {
        // Solo verificamos si hay un token actual
        const token = localStorage.getItem('access_token');
        if (token) {
          // Si el token está próximo a expirar, lo renovamos automáticamente
          if (TokenUtils.isTokenExpiringSoon(token)) {
            await TokenUtils.refreshAccessToken();
          }
        }
      } catch (error) {
        console.error("Error al verificar/renovar token:", error);
      }
    }, 5 * 60 * 1000); // Verificar cada 5 minutos
    
    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, []);

  return <>{children}</>;
}
