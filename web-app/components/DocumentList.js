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
            className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            {doc.title}
          </li>
        ))}
      </ul>
      <div className="flex space-x-2">
        <input
          type="text"
          value={newDocumentTitle}
          onChange={(e) => setNewDocumentTitle(e.target.value)}
          placeholder="New document title"
          className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <button
          onClick={createDocument}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default DocumentList;
