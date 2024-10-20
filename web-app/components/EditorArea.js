
import React, { useState, useEffect, useCallback } from 'react';

const EditorArea = ({ documentId }) => {
  const [content, setContent] = useState('');
  const [socket, setSocket] = useState(null);

  const fetchDocumentContent = useCallback(async () => {
    try {
      const response = await fetch(`http://21b4ce6a841c24d7f4.blackbx.ai/api/documents/${documentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch document content');
      }
      const data = await response.json();
      setContent(data.content);
    } catch (error) {
      console.error('Error fetching document content:', error);
    }
  }, [documentId]);

  useEffect(() => {
    if (documentId) {
      fetchDocumentContent();
      const ws = new WebSocket('ws://21b4ce6a841c24d7f4.blackbx.ai');
      setSocket(ws);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'documentUpdate' && data.documentId === documentId) {
          setContent(data.content);
        }
      };

      return () => {
        ws.close();
      };
    }
  }, [documentId, fetchDocumentContent]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    sendContentUpdate(newContent);
  };

  const sendContentUpdate = useCallback((newContent) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'documentUpdate',
        documentId,
        content: newContent,
      }));
    }

    // Also send update to the server via HTTP
    fetch(`http://21b4ce6a841c24d7f4.blackbx.ai/api/documents/${documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: newContent }),
    }).catch(error => console.error('Error updating document:', error));
  }, [socket, documentId]);

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
