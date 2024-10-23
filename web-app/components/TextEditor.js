
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import { Button, TextField, Alert, IconButton, List, ListItem, ListItemText, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import useTouchDevice from '../hooks/useTouchDevice';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
const ImageResize = dynamic(() => import('quill-image-resize-module-react'), { ssr: false });

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

  const sendOperation = useCallback((delta) => {
    if (isConnected && ws.current) {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      const message = JSON.stringify({
        type: 'operation',
        delta,
        version,
        documentId,
        token,
        username
      });
      console.log('Sending message:', message);
      ws.current.send(message);
      setPendingOperations((prev) => [...prev, delta]);
    }
  }, [isConnected, documentId, version]);

  const handleContentChange = (content, delta, source, editor) => {
    if (source === 'user') {
      sendOperation(delta);
    }
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (isConnected && ws.current) {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      const message = JSON.stringify({
        type: 'updateTitle',
        title: newTitle,
        documentId,
        token,
        username
      });
      console.log('Sending message:', message);
      ws.current.send(message);
    }
  };

  return (
    <div className={`w-full ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Real-time Text Editor</h1>
        <div>
          <Button
            onClick={() => setShowHistory(!showHistory)}
            variant="contained"
            color="primary"
            className="mr-2"
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </Button>
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
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={content}
        onChange={handleContentChange}
        modules={modules}
        className={`mb-4 ${darkMode ? 'quill-dark' : ''}`}
      />
      {showHistory && (
        <div className="mt-4">
          <Typography variant="h6" className="mb-2">Version History</Typography>
          {/* Add HistoryList component here */}
        </div>
      )}
    </div>
  );
};

export default TextEditor;
