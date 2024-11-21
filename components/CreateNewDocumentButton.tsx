'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from './Dialog';
import { LoadingSpinner } from './LoadingSpinner';

interface CreateNewDocumentButtonProps {
  onSuccess?: () => void;
  className?: string;
}

export function CreateNewDocumentButton({ onSuccess, className }: CreateNewDocumentButtonProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleClose = () => {
    setIsModalOpen(false);
    setTitle('');
    setError('');
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isCreating) return;

    try {
      setIsCreating(true);
      setError('');
      
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: title.trim() || 'Untitled Document'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create document');
      }
      
      const data = await response.json();
      handleClose();
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/document/${data.id}`);
      }
    } catch (error) {
      console.error('Failed to create document:', error);
      setError(error instanceof Error ? error.message : 'Failed to create document. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={className || "px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"}
        type="button"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Document
      </button>

      <Dialog
        isOpen={isModalOpen}
        onClose={handleClose}
        title="Create New Document"
      >
        <form onSubmit={handleCreateDocument} className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document title"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isCreating ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>Creating...</span>
                </>
              ) : (
                'Create'
              )}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
} 