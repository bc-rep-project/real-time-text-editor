'use client';

import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <button
        onClick={() => signIn('google')}
        className="btn"
      >
        Sign in with Google
      </button>
    </div>
  );
} 