'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CreateNewDocumentButton() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDocumentTitle, setNewDocumentTitle] = useState('');
  const [error, setError] = useState('');

  const handleCreateDocument = async () => {
    if (!newDocumentTitle.trim()) {
      setError('Title is required');
      return;
    }

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newDocumentTitle }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create document');
      }

      const data = await response.json();
      
      if (!data.id) {
        throw new Error('Invalid response from server');
      }

      setIsModalOpen(false);
      setNewDocumentTitle('');
      setError('');
      router.push(`/document/${data.id}`);
    } catch (error) {
      console.error('Failed to create document:', error);
      setError(error instanceof Error ? error.message : 'Failed to create document. Please try again.');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        New Document
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Create New Document</h2>
            {error && (
              <div className="text-red-500 text-sm mb-4">{error}</div>
            )}
            <input
              type="text"
              placeholder="Document title"
              value={newDocumentTitle}
              onChange={(e) => {
                setNewDocumentTitle(e.target.value);
                setError('');
              }}
              className="border p-2 rounded w-full mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setNewDocumentTitle('');
                  setError('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDocument}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 