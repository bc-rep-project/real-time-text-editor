
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
    <>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => setIsModalOpen(true)}
      >
        Create New Document
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Document</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Enter a title for your new document:
                </p>
                <input
                  type="text"
                  className="mt-2 px-3 py-2 bg-white border shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md sm:text-sm focus:ring-1"
                  placeholder="Document Title"
                  value={newDocumentTitle}
                  onChange={handleTitleChange}
                />
              </div>
              <div className="items-center px-4 py-3">
                <button
                  id="ok-btn"
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  onClick={createDocument}
                >
                  Create
                </button>
                <button
                  id="cancel-btn"
                  className="mt-3 px-4 py-2 bg-white text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateNewDocumentButton;
