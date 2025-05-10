import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Obtener el token de las cookies
  const token = request.cookies.get('access_token')?.value;
  
  // Obtener la ruta actual
  const { pathname } = request.nextUrl;
  
  console.log(`[Middleware] Procesando ruta: ${pathname}, token presente: ${!!token}`);
  
  // Si es la ruta raíz /, permitir que la redirección a /dashboard ocurra normalmente
  if (pathname === '/') {
    console.log('[Middleware] Ruta principal, permitiendo navegación');
    return NextResponse.next();
  }
  
  // Si es una solicitud a API o recursos estáticos, permitir sin verificar token
  if (pathname.includes('/_next') || pathname.includes('/api/') || pathname.includes('/static/')) {
    return NextResponse.next();
  }
  
  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/register'];
  
  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Si es una ruta del dashboard y no hay token, redirigir al login
  if (pathname.startsWith('/dashboard') && !token) {
    console.log('[Middleware] Intentando acceder al dashboard sin token, redirigiendo a login');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Si es una ruta pública y hay token, redirigir al dashboard
  if (isPublicRoute && token) {
    console.log('[Middleware] Ruta pública con token, redirigiendo a dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // En cualquier otro caso, continuar normalmente
  return NextResponse.next();
}

// Configurar en qué rutas se debe ejecutar el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next|static|api|images|favicon.ico|public).*)',
  ],
};
