'use client';

import { DocumentList } from '@/components/DocumentList';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { useState } from 'react';

export default function HomePage() {
  const [isCreatingDocument, setIsCreatingDocument] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateDocument = async () => {
    setIsCreatingDocument(true);
    setError(null);

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Untitled Document',
          content: '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create document');
      }

      // DocumentList will automatically refresh
    } catch (error) {
      console.error('Error creating document:', error);
      setError('Failed to create document');
    } finally {
      setIsCreatingDocument(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
          <button
            onClick={handleCreateDocument}
            disabled={isCreatingDocument}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreatingDocument ? (
              <>
                <LoadingSpinner size="small" />
                Creating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Document
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-4">
            <ErrorMessage
              message={error}
              onRetry={handleCreateDocument}
            />
          </div>
        )}

        <DocumentList />
      </div>
    </ProtectedRoute>
  );
} 