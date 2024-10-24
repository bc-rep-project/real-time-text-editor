import React, { useState } from 'react';

const CreateNewDocumentButton = ({ onDocumentCreated }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');

  const handleCreateDocument = async () => {
    if (!title.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (response.ok) {
        const newDocument = await response.json();
        onDocumentCreated(newDocument);
        setTitle('');
      } else {
        console.error('Failed to create document');
      }
    } catch (error) {
      console.error('Error creating document:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New document title"
        className="w-full px-4 py-2 border rounded-l-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
      <button
        onClick={handleCreateDocument}
        disabled={isCreating || !title.trim()}
        className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCreating ? 'Creating...' : 'Create'}
      </button>
    </div>
  );
};

export default CreateNewDocumentButton;
