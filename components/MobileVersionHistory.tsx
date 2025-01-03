'use client';

import { useState, useEffect } from 'react';
import { VersionHistory } from './VersionHistory';

interface MobileVersionHistoryProps {
  documentId: string;
  onRevert: (content: string) => void;
  onClose: () => void;
}

export function MobileVersionHistory({ documentId, onRevert, onClose }: MobileVersionHistoryProps) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative h-full bg-white dark:bg-gray-800 p-4">
        <VersionHistory documentId={documentId} onRevert={onRevert} />
      </div>
    </div>
  );
} 