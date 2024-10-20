
import React, { useState, useEffect } from 'react';

const EditorArea = ({ documentId }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (documentId) {
      fetchDocumentContent();
    }
  }, [documentId]);

  const fetchDocumentContent = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch document content');
      }
      const data = await response.json();
      setContent(data.content);
    } catch (error) {
      console.error('Error fetching document content:', error);
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    sendContentUpdate(newContent);
  };

  const sendContentUpdate = async (newContent) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to update document content');
      }

      // Send WebSocket update
      if (window.socket) {
        window.socket.send(JSON.stringify({
          type: 'documentUpdate',
          documentId,
          content: newContent,
        }));
      }
    } catch (error) {
      console.error('Error updating document content:', error);
    }
  };

  return (
    <div className="border border-gray-300 p-4">
      <textarea
        value={content}
        onChange={handleContentChange}
        className="w-full h-64 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Start typing your document here..."
      />
    </div>
  );
};

export default EditorArea;
