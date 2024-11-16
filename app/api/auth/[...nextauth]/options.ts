import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Please provide process.env.NEXTAUTH_SECRET');
}

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            throw new Error('Missing credentials');
          }

          const userSnapshot = await adminDb
            .collection('users')
            .where('username', '==', credentials.username)
            .limit(1)
            .get();

          if (userSnapshot.empty) {
            return null;
          }

          const userDoc = userSnapshot.docs[0];
          const user = userDoc.data();

          const isPasswordValid = await compare(credentials.password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: userDoc.id,
            name: user.username,
            email: user.email
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}; 