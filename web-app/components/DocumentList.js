import React, { useState, useEffect } from 'react';

const DocumentList = ({ onSelectDocument }) => {
  const [documents, setDocuments] = useState([]);
  const [newDocumentTitle, setNewDocumentTitle] = useState('');

  useEffect(() => {
    // Fetch documents
    // This is a placeholder for actual API call
    setDocuments([
      { id: 1, title: 'Document 1' },
      { id: 2, title: 'Document 2' },
    ]);
  }, []);

  const handleCreateDocument = () => {
    if (newDocumentTitle.trim()) {
      // Here you would typically send a request to create a new document
      const newDoc = { id: documents.length + 1, title: newDocumentTitle };
      setDocuments([...documents, newDoc]);
      setNewDocumentTitle('');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Available Documents</h2>
      <ul className="space-y-2 mb-4">
        {documents.map((doc) => (
          <li key={doc.id} className="flex items-center">
            <button
              onClick={() => onSelectDocument(doc.id)}
              className="text-blue-600 hover:underline"
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
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleCreateDocument}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create New Document
        </button>
      </div>
    </div>
  );
};

export default DocumentList;
