import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Allow WebSocket upgrade requests
    if (req.headers.get('upgrade') === 'websocket') {
      return NextResponse.next();
    }

    const token = req.nextauth?.token;
    if (!token) {
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'Authentication required' }),
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Add user info to headers for API routes
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', token.sub as string);
    requestHeaders.set('x-user-email', token.email as string);
    requestHeaders.set('x-user-name', token.name as string);

    // Add CORS headers for WebSocket connections
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow WebSocket connections
        if (req.headers.get('upgrade') === 'websocket') {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/documents/:path*',
    '/api/documents/:path*',
    '/api/chat/:path*',
    '/api/notifications/:path*',
    '/ws',
  ],
}; 