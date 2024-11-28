'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface MobileNavigationProps {
  documentId: string;
  onVersionHistoryClick: () => void;
}

export function MobileNavigation({ documentId, onVersionHistoryClick }: MobileNavigationProps) {
  const pathname = usePathname();
  const isDocumentPage = pathname === `/document/${documentId}`;
  const isChatPage = pathname === `/document/${documentId}/chat`;
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleHistoryClick = () => {
    setIsHistoryOpen(true);
    onVersionHistoryClick();
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-lg">
      <div className="grid grid-cols-3 items-center py-2 px-4">
        <Link
          href={`/document/${documentId}`}
          className={`flex flex-col items-center py-2 ${
            isDocumentPage 
              ? 'text-blue-500 dark:text-blue-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-xs mt-1">Editor</span>
        </Link>
        <button
          onClick={handleHistoryClick}
          className={`flex flex-col items-center py-2 ${
            isHistoryOpen
              ? 'text-blue-500 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs mt-1">History</span>
        </button>
        <Link
          href={`/document/${documentId}/chat`}
          className={`flex flex-col items-center py-2 ${
            isChatPage 
              ? 'text-blue-500 dark:text-blue-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-xs mt-1">Chat</span>
        </Link>
      </div>
      <div className="h-safe-bottom bg-white dark:bg-gray-800" />
    </div>
  );
} 