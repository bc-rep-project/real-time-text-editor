'use client';

import { useState, useEffect } from 'react';
import { VersionHistory } from './VersionHistory';

interface MobileVersionHistoryProps {
  documentId: string;
  onRevert: (content: string) => void;
  onClose: () => void;
}

export function MobileVersionHistory({ documentId, onRevert, onClose }: MobileVersionHistoryProps) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleRevert = (content: string) => {
    onRevert(content);
    handleClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />
      <div
        className={`fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-[101] lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Version History</h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <VersionHistory
              documentId={documentId}
              onRevert={handleRevert}
              hideTitle={true}
            />
          </div>
        </div>
      </div>
    </>
  );
} 