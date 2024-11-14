import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: [
    '/api/documents/:path*',
    '/api/chat/:path*',
    '/document/:path*',
  ],
}; 