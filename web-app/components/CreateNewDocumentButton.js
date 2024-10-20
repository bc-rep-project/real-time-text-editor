
import React, { useState } from 'react';

const CreateNewDocumentButton = ({ onDocumentCreated }) => {
  const [newDocumentTitle, setNewDocumentTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTitleChange = (e) => {
    setNewDocumentTitle(e.target.value);
  };

  const createDocument = async () => {
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newDocumentTitle, content: '' }),
      });

      if (!response.ok) {
        throw new Error('Failed to create document');
      }

      const data = await response.json();
      setNewDocumentTitle('');
      setIsModalOpen(false);
      if (onDocumentCreated) {
        onDocumentCreated(data.id);
      }
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Create New Document
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Create New Document</h3>
            <input
              type="text"
              value={newDocumentTitle}
              onChange={handleTitleChange}
              placeholder="Document title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                onClick={createDocument}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateNewDocumentButton;
