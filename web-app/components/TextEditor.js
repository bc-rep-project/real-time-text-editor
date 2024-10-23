import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import { Button, TextField, Alert, IconButton, List, ListItem, ListItemText, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import useTouchDevice from '../hooks/useTouchDevice';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const TextEditor = ({ documentId, onClose }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [version, setVersion] = useState(0);
  const [pendingOperations, setPendingOperations] = useState([]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const ws = useRef(null);
  const quillRef = useRef(null);
  const theme = useTheme();
  const darkMode = theme.palette.mode === 'dark';
  const isTouchDevice = useTouchDevice();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('quill').then((Quill) => {
        console.log('Quill imported successfully');
        import('quill-image-resize-module-react').then((ImageResize) => {
          console.log('ImageResize module imported successfully');
          Quill.default.register('modules/imageResize', ImageResize.default);
          console.log('ImageResize module registered successfully');
        }).catch(error => console.error('Error importing ImageResize:', error));
      }).catch(error => console.error('Error importing Quill:', error));
    }
  }, []);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    imageResize: {
      modules: ['Resize', 'DisplaySize']
    }
  };

  useEffect(() => {
    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname;
      const port = 8082;
      const token = localStorage.getItem('token');
      ws.current = new WebSocket(`${protocol}//${host}:${port}/chat/${documentId}?token=${token}`);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);
        if (data.type === 'init') {
          setContent(data.content);
          setVersion(data.version);
        } else if (data.type === 'operation') {
          if (data.version === version + 1) {
            applyOperation(data.delta);
            setVersion(data.version);
            if (pendingOperations.length > 0) {
              const newPendingOps = pendingOperations.slice(1);
              setPendingOperations(newPendingOps);
              if (newPendingOps.length > 0) {
                sendOperation(newPendingOps[0]);
              }
            }
          }
        } else if (data.type === 'updateTitle') {
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
  }, [documentId, version, pendingOperations]);

  const applyOperation = useCallback((delta) => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      editor.updateContents(delta);
    }
  }, []);

  const handleChange = (content, delta, source, editor) => {
    if (source === 'user') {
      const operation = { delta, version };
      setPendingOperations([...pendingOperations, operation]);
      if (pendingOperations.length === 0) {
        sendOperation(operation);
      }
    }
  };

  const sendOperation = (operation) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'operation',
        delta: operation.delta,
        version: operation.version
      }));
    }
  };

  const handleTitleChange = (event) => {
    const newTitle = event.target.value;
    setTitle(newTitle);
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'updateTitle',
        title: newTitle
      }));
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <div className={`w-full ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Real-time Text Editor</h1>
        <IconButton onClick={onClose} color="inherit">
          <CloseIcon />
        </IconButton>
      </div>
      <TextField
        value={title}
        onChange={handleTitleChange}
        placeholder="Document Title"
        variant="outlined"
        fullWidth
        className="mb-4"
      />
      {Quill && (
        <ReactQuill
          ref={quillRef}
          value={content}
          onChange={handleChange}
          modules={modules}
          theme="snow"
          placeholder="Start typing..."
          className={`h-[calc(100vh-200px)] ${darkMode ? 'quill-dark' : ''}`}
        />
      )}
      <div className="mt-4 flex justify-between items-center">
        <Button onClick={toggleHistory} variant="outlined" color="primary">
          {showHistory ? 'Hide History' : 'Show History'}
        </Button>
        <Alert severity={isConnected ? 'success' : 'error'}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Alert>
      </div>
      {showHistory && (
        <List className="mt-4 border rounded">
          {history.map((item, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={`Version ${item.version}`}
                secondary={new Date(item.timestamp).toLocaleString()}
              />
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
};

export default TextEditor;
