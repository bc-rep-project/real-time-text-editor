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
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      } else {
        console.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const createNewDocument = async () => {
    if (!newDocumentTitle.trim()) {
      alert('Please enter a title for the new document');
      return;
    }

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newDocumentTitle }),
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments([...documents, { id: data.id }]);
        setNewDocumentTitle('');
        onSelectDocument(data.id);
      } else {
        console.error('Failed to create new document');
      }
    } catch (error) {
      console.error('Error creating new document:', error);
    }
  };

  return (
    <div>
      <h2>Available Documents</h2>
      <ul>
        {documents.map((doc) => (
          <li key={doc.id}>
            <button onClick={() => onSelectDocument(doc.id)}>
              {doc.title} (Last updated: {new Date(doc.updatedAt).toLocaleString()})
            </button>
          </li>
        ))}
      </ul>
      <div>
        <input
          type="text"
          value={newDocumentTitle}
          onChange={(e) => setNewDocumentTitle(e.target.value)}
          placeholder="Enter new document title"
        />
        <button onClick={createNewDocument}>Create New Document</button>
      </div>
    </div>
  );
};

export default DocumentList;
