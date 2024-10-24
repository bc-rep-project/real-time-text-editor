
import React, { useState, useEffect } from 'react';
import useTouchDevice from '../hooks/useTouchDevice';

const DocumentList = ({ onSelectDocument }) => {
  const [documents, setDocuments] = useState([]);
  const [newDocumentTitle, setNewDocumentTitle] = useState('');
  const isTouchDevice = useTouchDevice();

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
    <div className="p-4 bg-white dark:bg-gray-800 text-black dark:text-white">
      <h2 className="text-2xl font-bold mb-4">Documents</h2>
      <ul className="space-y-2 mb-4">
        {documents.map((doc) => (
          <li
            key={doc.id}
            onClick={() => onSelectDocument(doc.id)}
            className="cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
          >
            {doc.title}
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <input
          type="text"
          placeholder="New document title"
          value={newDocumentTitle}
          onChange={(e) => setNewDocumentTitle(e.target.value)}
          className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          onClick={createDocument}
        >
          Create New Document
        </button>
      </div>
    </div>
  );
};

export default DocumentList;
