'use client';

import { useState, useEffect } from 'react';
import { VersionHistory } from './VersionHistory';

interface MobileVersionHistoryProps {
  documentId: string;
  onRevert: (content: string) => void;
}

export function MobileVersionHistory({ documentId, onRevert }: MobileVersionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const x = e.touches[0].clientX;
    const diff = startX - x;
    if (diff > 0) {
      setCurrentX(-diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (currentX < -50) { // If dragged more than 50px
      setIsOpen(true);
    }
    setCurrentX(0);
  };

  // Add effect to control body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  return (
    <>
      {/* Version history trigger */}
      <button
        onClick={() => setIsOpen(true)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="lg:hidden flex items-center gap-1 text-gray-500 hover:text-gray-700"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm">History</span>
      </button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Version history drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-[101] lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0">
            <h2 className="text-lg font-semibold">Version History</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-white">
            <VersionHistory
              documentId={documentId}
              onRevert={(content) => {
                onRevert(content);
                setIsOpen(false);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
} 