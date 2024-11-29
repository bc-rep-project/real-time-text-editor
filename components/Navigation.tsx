'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { UserMenu } from './UserMenu';

export function Navigation() {
  const { data: session } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!session) return null;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              Text Editor
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden lg:flex lg:items-center lg:ml-6">
            <UserMenu />
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              aria-label="Open menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:hidden`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                aria-label="Close menu"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 px-4 py-6">
            <div className="space-y-6">
              <UserMenu />
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </nav>
  );
} 