import React, { useState, useEffect } from 'react';

const DocumentList = ({ onSelectDocument }) => {
  const [documents, setDocuments] = useState([]);
  const [newDocumentTitle, setNewDocumentTitle] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleCreateDocument = async () => {
    if (newDocumentTitle.trim()) {
      try {
        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: newDocumentTitle, content: '' }),
        });
        const newDoc = await response.json();
        setDocuments([...documents, newDoc]);
        setNewDocumentTitle('');
      } catch (error) {
        console.error('Error creating document:', error);
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Available Documents</h2>
      <ul className="space-y-2 mb-6">
        {documents.map((doc) => (
          <li key={doc.id} className="flex items-center">
            <button
              onClick={() => onSelectDocument(doc.id)}
              className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200"
            >
              {doc.title}
            </button>
          </li>
        ))}
      </ul>
      <div className="flex space-x-2">
        <input
          type="text"
          value={newDocumentTitle}
          onChange={(e) => setNewDocumentTitle(e.target.value)}
          placeholder="Enter new document title"
          className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
        />
        <button
          onClick={handleCreateDocument}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200"
        >
          Create New Document
        </button>
      </div>
    </div>
  );
};

export default DocumentList;
