


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

  const createNewDocument = async (e) => {
    e.preventDefault();
    if (!newDocumentTitle.trim()) return;

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newDocumentTitle }),
      });
      const data = await response.json();
      setNewDocumentTitle('');
      fetchDocuments();
      onSelectDocument(data.id);
    } catch (error) {
      console.error('Error creating new document:', error);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-4">Documents</h2>
      <ul className="mb-4">
        {documents.map((doc) => (
          <li key={doc.id} className="mb-2">
            <button
              onClick={() => onSelectDocument(doc.id)}
              className="text-blue-500 hover:underline"
            >
              {doc.title || `Document ${doc.id}`}
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={createNewDocument} className="mt-4">
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={newDocumentTitle}
          onChange={(e) => setNewDocumentTitle(e.target.value)}
          placeholder="Enter new document title..."
        />
        <button
          type="submit"
          className="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
        >
          Create New Document
        </button>
      </form>
    </div>
  );
};

export default DocumentList;


