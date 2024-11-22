'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileNavigationProps {
  documentId: string;
}

export function MobileNavigation({ documentId }: MobileNavigationProps) {
  const pathname = usePathname();
  const isDocumentPage = pathname === `/document/${documentId}`;
  const isChatPage = pathname === `/document/${documentId}/chat`;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t lg:hidden z-30">
      <div className="flex justify-around items-center h-16">
        <Link
          href={`/document/${documentId}`}
          className={`flex flex-col items-center w-1/2 py-2 ${
            isDocumentPage ? 'text-blue-500' : 'text-gray-500'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm">Document</span>
        </Link>
        <Link
          href={`/document/${documentId}/chat`}
          className={`flex flex-col items-center w-1/2 py-2 ${
            isChatPage ? 'text-blue-500' : 'text-gray-500'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-sm">Chat</span>
        </Link>
      </div>
    </div>
  );
} 