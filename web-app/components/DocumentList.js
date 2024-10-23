
import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';

const DocumentList = ({ onSelectDocument }) => {
  const [documents, setDocuments] = useState([]);
  const [newDocumentTitle, setNewDocumentTitle] = useState('');
  const theme = useTheme();
  const darkMode = theme.palette.mode === 'dark';

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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

  const createDocument = async () => {
    if (!newDocumentTitle.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newDocumentTitle }),
      });

      if (response.ok) {
        const newDocument = await response.json();
        setDocuments([...documents, newDocument]);
        setNewDocumentTitle('');
      } else {
        console.error('Failed to create document');
      }
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  return (
    <div className={`p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <h2 className="text-xl font-semibold mb-4">Documents</h2>
      <ul className="space-y-2">
        {documents.map((doc) => (
          <li
            key={doc.id}
            className={`cursor-pointer p-2 rounded ${
              darkMode
                ? 'hover:bg-gray-700 focus:bg-gray-700'
                : 'hover:bg-gray-100 focus:bg-gray-100'
            }`}
            onClick={() => onSelectDocument(doc.id)}
          >
            {doc.title}
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <input
          type="text"
          className={`w-full p-2 border rounded-md ${
            darkMode
              ? 'bg-gray-700 text-white border-gray-600'
              : 'bg-white text-black border-gray-300'
          }`}
          placeholder="New document title"
          value={newDocumentTitle}
          onChange={(e) => setNewDocumentTitle(e.target.value)}
        />
        <button
          className={`mt-2 px-4 py-2 rounded ${
            darkMode
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          onClick={createDocument}
        >
          Create New Document
        </button>
      </div>
    </div>
  );
};

export default DocumentList;
