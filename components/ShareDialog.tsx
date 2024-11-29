'use client';

import { useState } from 'react';

interface ShareDialogProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareDialog({ documentId, isOpen, onClose }: ShareDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('viewer');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleShare = async () => {
    setIsLoading(true);
    try {
      await fetch(`/api/documents/${documentId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      });
      onClose();
    } catch (error) {
      console.error('Error sharing document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Share Document
        </h2>
        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={isLoading || !email}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
            >
              {isLoading ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 