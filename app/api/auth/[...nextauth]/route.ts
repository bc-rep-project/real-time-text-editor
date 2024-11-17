import NextAuth from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { adminAuth } from '@/lib/firebase-admin';

interface CustomToken extends JWT {
  customToken?: string;
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        try {
          // Create or get Firebase user
          let firebaseUser;
          try {
            firebaseUser = await adminAuth.getUserByEmail(credentials.username);
          } catch (error) {
            // If user doesn't exist, create one
            firebaseUser = await adminAuth.createUser({
              email: credentials.username,
              password: credentials.password,
              displayName: credentials.username,
            });
          }

          // Create custom token for Firebase
          const customToken = await adminAuth.createCustomToken(firebaseUser.uid);

          return {
            id: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            customToken,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Explicitly type the token
        const customToken = token as CustomToken;
        customToken.sub = user.id;
        customToken.customToken = user.customToken;
        return customToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        const customToken = token as CustomToken;
        session.user.id = customToken.sub as string;
        session.user.customToken = customToken.customToken;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
});

export { handler as GET, handler as POST }; 