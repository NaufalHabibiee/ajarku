// middleware.ts
import { type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return null;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};