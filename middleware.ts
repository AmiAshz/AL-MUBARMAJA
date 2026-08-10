import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isDashboardRoute = path.startsWith('/dashboard');
  const isLoginRoute = path === '/login';

  // Assuming the auth token is stored in a cookie named 'token'
  // In a real production app we'd verify the JWT properly using 'jose' or iron-session
  // For VANTARA MVP we just check if the cookie exists as a basic frontend gate
  // The backend API routes have robust protection.
  const token = request.cookies.get('token')?.value;

  if (isDashboardRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isLoginRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
