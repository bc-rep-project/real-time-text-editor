'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Welcome to Collaborative Text Editor</h1>
      {session ? (
        <Link href="/documents" className="btn">
          View Documents
        </Link>
      ) : (
        <div className="space-x-4">
          <Link href="/login" className="btn">
            Login
          </Link>
          <Link href="/register" className="btn">
            Register
          </Link>
        </div>
      )}
    </main>
  );
} 