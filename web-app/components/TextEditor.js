
import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import { Button, TextField, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import useTouchDevice from '../hooks/useTouchDevice';

const TextEditor = ({ documentId, onClose }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  
  const ws = useRef(null);
  const theme = useTheme();
  const darkMode = theme.palette.mode === 'dark';
  const isTouchDevice = useTouchDevice();

  useEffect(() => {
    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const token = localStorage.getItem('token');
      ws.current = new WebSocket(`${protocol}//${host}?token=${token}`);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        ws.current.send(JSON.stringify({ type: 'join', documentId }));
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'update') {
          console.log('Received update:', data);
          setContent(data.content);
          setTitle(data.title);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected. Trying to reconnect...');
        setIsConnected(false);
        setTimeout(connectWebSocket, 3000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws.current.close();
      };
    };

    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [documentId]);

  const sendUpdate = (newContent, newTitle) => {
    if (isConnected && ws.current) {
      const token = localStorage.getItem('token');
      ws.current.send(JSON.stringify({
        type: 'update',
        content: newContent,
        title: newTitle,
        documentId,
        token
      }));
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    sendUpdate(newContent, title);
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    sendUpdate(content, newTitle);
  };

  return (
    <div className={`w-full ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Real-time Text Editor</h1>
        {isTouchDevice ? (
          <IconButton onClick={onClose} color="inherit">
            <CloseIcon />
          </IconButton>
        ) : (
          <Button
            onClick={onClose}
            variant="contained"
            color="secondary"
          >
            Close
          </Button>
        )}
      </div>
      {!isConnected && (
        <Alert severity="warning" className="mb-4">
          Disconnected. Trying to reconnect...
        </Alert>
      )}
      <TextField
        fullWidth
        label="Document Title"
        value={title}
        onChange={handleTitleChange}
        className="mb-4"
        variant="outlined"
        InputProps={{
          style: { color: darkMode ? 'white' : 'black' }
        }}
      />
      <TextField
        fullWidth
        label="Document Content"
        value={content}
        onChange={handleContentChange}
        multiline
        rows={isTouchDevice ? 10 : 20}
        variant="outlined"
        InputProps={{
          style: { color: darkMode ? 'white' : 'black' }
        }}
      />
    </div>
  );
};

export default TextEditor;
