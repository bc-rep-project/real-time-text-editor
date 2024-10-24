import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import { Button, TextField, IconButton, Snackbar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import useTouchDevice from '../hooks/useTouchDevice';
import useDebounce from '../hooks/useDebounce';
import { saveDocument, getDocument } from '../utils/indexedDB';
import FileUpload from './FileUpload';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY = 3000;

const TextEditor = ({ documentId, onClose }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  const ws = useRef(null);
  const theme = useTheme();
  const darkMode = theme.palette.mode === 'dark';
  const isTouchDevice = useTouchDevice();

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const token = localStorage.getItem('token');
    ws.current = new WebSocket(`${protocol}//${host}?token=${token}`);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setRetryAttempts(0);
      ws.current.send(JSON.stringify({ type: 'join', documentId }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'update') {
        console.log('Received update:', data);
        setContent(data.content);
        setTitle(data.title);
        setIsSaving(false);
        saveDocument({ id: documentId, content: data.content, title: data.title });
      } else if (data.type === 'error') {
        setError(data.message);
        setIsSaving(false);
        setSnackbarOpen(true);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected. Trying to reconnect...');
      setIsConnected(false);
      if (retryAttempts < MAX_RETRY_ATTEMPTS) {
        setTimeout(() => {
          setRetryAttempts(prev => prev + 1);
          connectWebSocket();
        }, RETRY_DELAY);
      } else {
        setError('Unable to connect to the server. Please try again later.');
        setSnackbarOpen(true);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('An error occurred with the connection. Trying to reconnect...');
      setSnackbarOpen(true);
      ws.current.close();
    };
  };

  useEffect(() => {
    const loadDocument = async () => {
      try {
        const doc = await getDocument(documentId);
        if (doc) {
          setContent(doc.content);
          setTitle(doc.title);
        }
      } catch (err) {
        console.error('Error loading document from IndexedDB:', err);
        setError('Error loading document. Please try again.');
        setSnackbarOpen(true);
      }
    };

    loadDocument();
    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [documentId]);

  const sendUpdate = (newContent, newTitle) => {
    if (isConnected && ws.current) {
      setIsSaving(true);
      setError('');
      const token = localStorage.getItem('token');
      ws.current.send(JSON.stringify({
        type: 'update',
        content: newContent,
        title: newTitle,
        documentId,
        token
      }));
    } else {
      setError('Unable to save changes. Saving offline.');
      saveDocument({ id: documentId, content: newContent, title: newTitle });
      setSnackbarOpen(true);
    }
  };

  const debouncedContent = useDebounce(content, 500);
  const debouncedTitle = useDebounce(title, 500);

  useEffect(() => {
    sendUpdate(debouncedContent, debouncedTitle);
  }, [debouncedContent, debouncedTitle]);

  const handleContentChange = (value) => {
    setContent(value);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleFileUpload = (url) => {
    setContent(prevContent => `${prevContent}<img src="${url}" alt="Uploaded Image" />`);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  return (
    <div className={`w-full ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Real-time Text Editor</h1>
        {isTouchDevice ? (
          <IconButton onClick={onClose} color="inherit">
            <CloseIcon />
          </IconButton>
        ) : (
          <Button onClick={onClose} variant="contained" color="primary">
            Close
          </Button>
        )}
      </div>
      <TextField
        label="Title"
        variant="outlined"
        fullWidth
        value={title}
        onChange={handleTitleChange}
        className="mb-4"
      />
      <ReactQuill
        theme="snow"
        value={content}
        onChange={handleContentChange}
        modules={modules}
        formats={formats}
      />
      <div className="mt-4">
        <FileUpload onFileUpload={handleFileUpload} />
      </div>
      <div className="mt-4">
        <div className={`mt-4 ${isConnected ? "text-green-500" : "text-red-500"}`}>{isSaving ? "Saving..." : (isConnected ? "Connected" : "Offline")}</div>
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={error}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleSnackbarClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </div>
  );
};

export default TextEditor;
