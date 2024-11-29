'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DocumentList } from '@/components/DocumentList';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/document');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="text-6xl mb-6">✍️</div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Collaborative Editor
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Collaborate on documents in real-time with your team
          </p>
          <div className="space-x-4">
            <Link
              href="/login"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-block bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-6 py-3 rounded-lg font-medium border border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 