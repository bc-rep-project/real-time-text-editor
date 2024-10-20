
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TextOperation } from 'ot-text';
import { TextField, Paper, Typography } from '@mui/material';

const EditorArea = ({ documentId }) => {
  const [content, setContent] = useState('');
  const [socket, setSocket] = useState(null);
  const [version, setVersion] = useState(0);
  const pendingOperations = useRef([]);

  const fetchDocumentContent = useCallback(async () => {
    try {
      const response = await fetch(`http://21b4ce6a841c24d7f4.blackbx.ai/api/documents/${documentId}`);
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
    const operation = new TextOperation();
    let oldIndex = 0;
    let newIndex = 0;

    while (oldIndex < oldContent.length || newIndex < newContent.length) {
      if (oldContent[oldIndex] === newContent[newIndex]) {
        operation.retain(1);
        oldIndex++;
        newIndex++;
      } else if (oldIndex < oldContent.length && newIndex < newContent.length) {
        operation.delete(1);
        operation.insert(newContent[newIndex]);
        oldIndex++;
        newIndex++;
      } else if (oldIndex < oldContent.length) {
        operation.delete(1);
        oldIndex++;
      } else {
        operation.insert(newContent[newIndex]);
        newIndex++;
      }
    }

    return operation.toJSON();
  };

  const sendContentUpdate = useCallback((operation) => {
    pendingOperations.current.push(operation);

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'documentUpdate',
        documentId,
        operation: operation.toJSON(),
        version,
      }));
    }

    // Also send update to the server via HTTP
    fetch(`http://21b4ce6a841c24d7f4.blackbx.ai/api/documents/${documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, version }),
    })
      .then(response => {
        if (response.status === 409) {
          console.log('Version conflict detected. Fetching latest content.');
          fetchDocumentContent();
        } else if (!response.ok) {
          throw new Error('Failed to update document');
        }
        return response.json();
      })
      .then(data => {
        setVersion(data.newVersion);
      })
      .catch(error => console.error('Error updating document:', error));
  }, [socket, documentId, version, content, fetchDocumentContent]);

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Document Editor
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={10}
        value={content}
        onChange={handleContentChange}
        variant="outlined"
        placeholder="Start typing your document here..."
      />
    </Paper>
  );
};

export default EditorArea;
