import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TextOperation } from 'ot-text';

const EditorArea = ({ documentId }) => {
  const [content, setContent] = useState('');
  const [socket, setSocket] = useState(null);
  const [version, setVersion] = useState(0);
  const pendingOperations = useRef([]);

  const fetchDocumentContent = useCallback(async () => {
    try {
      const response = await fetch();
      if (!response.ok) {
        throw new Error('Failed to fetch document content');
      }
      const data = await response.json();
      setContent(data.content);
      setVersion(data.version);
    } catch (error) {
      console.error('Error fetching document content:', error);
    }
  }, [documentId]);

  useEffect(() => {
    if (documentId) {
      fetchDocumentContent();
      const ws = new WebSocket('ws://21b4ce6a841c24d7f4.blackbx.ai');
      setSocket(ws);

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'joinDocument', documentId }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'documentUpdate' && data.documentId === documentId) {
          const operation = TextOperation.fromJSON(data.operation);
          setContent(prevContent => operation.apply(prevContent));
          setVersion(data.version);
        } else if (data.type === 'versionMismatch') {
          console.log('Version mismatch detected. Fetching latest content.');
          fetchDocumentContent();
        }
      };

      return () => {
        ws.close();
      };
    }
  }, [documentId, fetchDocumentContent]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    const operation = TextOperation.fromJSON(generateOperation(content, newContent));
    setContent(newContent);
    sendContentUpdate(operation);
  };

  const generateOperation = (oldContent, newContent) => {
    // ... (keep the existing generateOperation function)
  };

  const sendContentUpdate = useCallback((operation) => {
    // ... (keep the existing sendContentUpdate function)
  }, [socket, documentId, version, content, fetchDocumentContent]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mt-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Document Editor</h2>
      <textarea
        value={content}
        onChange={handleContentChange}
        className="w-full h-64 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
        placeholder="Start typing your document here..."
      />
    </div>
  );
};

export default EditorArea;
