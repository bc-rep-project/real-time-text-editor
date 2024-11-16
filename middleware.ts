import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Add auth token to headers for Firebase Admin SDK
    const session = req.nextauth.token;
    if (session) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('Authorization', `Bearer ${session.sub}`);
      return NextResponse.next({
        headers: requestHeaders,
      });
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/documents/:path*',
    '/api/documents/:path*',
    '/api/chat/:path*',
  ],
}; 