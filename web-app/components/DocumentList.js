import React, { useState, useEffect } from 'react';

const DocumentList = ({ onSelectDocument }) => {
  const [documents, setDocuments] = useState([]);

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

  return (
    <div>
      <h2>Available Documents</h2>
      <ul>
        {documents.map((doc) => (
          <li key={doc.id}>
            <button onClick={() => onSelectDocument(doc.id)}>{doc.id}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentList;
