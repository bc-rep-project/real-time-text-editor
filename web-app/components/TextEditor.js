
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import { Button, TextField, Alert, IconButton, List, ListItem, ListItemText, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import useTouchDevice from '../hooks/useTouchDevice';
import { type, apply } from 'ot-text';

const TextEditor = ({ documentId, onClose }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [version, setVersion] = useState(0);
  const [pendingOperations, setPendingOperations] = useState([]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const ws = useRef(null);
  const theme = useTheme();
  const darkMode = theme.palette.mode === 'dark';
  const isTouchDevice = useTouchDevice();

  const applyOperation = useCallback((operation) => {
    setContent((prevContent) => apply(prevContent, operation));
  }, []);

  const sendOperation = useCallback((operation) => {
    if (isConnected && ws.current) {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      ws.current.send(JSON.stringify({
        type: 'operation',
        operation,
        version,
        documentId,
        token,
        username
      }));
      setPendingOperations((prev) => [...prev, operation]);
    }
  }, [isConnected, documentId, version]);

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
        if (data.type === 'init') {
          setContent(data.content);
          setTitle(data.title);
          setVersion(data.version);
          setHistory(data.history);
        } else if (data.type === 'operation') {
          if (data.version === version + 1) {
            applyOperation(data.operation);
            setVersion(data.version);
            setHistory((prev) => [...prev, data.historyEntry]);
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
          setHistory((prev) => [...prev, data.historyEntry]);
        } else if (data.type === 'revert') {
          setContent(data.content);
          setVersion(data.version);
          setHistory((prev) => [...prev, data.historyEntry]);
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
  }, [documentId, version, pendingOperations, applyOperation]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    const operation = type(content, newContent);
    setContent(newContent);
    sendOperation(operation);
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (isConnected && ws.current) {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      ws.current.send(JSON.stringify({
        type: 'updateTitle',
        title: newTitle,
        documentId,
        token,
        username
      }));
    }
  };

  const handleRevertToVersion = (revertVersion) => {
    if (isConnected && ws.current) {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
      ws.current.send(JSON.stringify({
        type: 'revertToVersion',
        version: revertVersion,
        documentId,
        token,
        username
      }));
    }
  };

  const HistoryList = () => (
    <List>
      {history.map((entry, index) => (
        <ListItem key={index}>
          <ListItemText
            primary={`Version ${entry.version}`}
            secondary={`${entry.username} - ${new Date(entry.timestamp).toLocaleString()}`}
          />
          <Button onClick={() => handleRevertToVersion(entry.version)}>
            Revert to this version
          </Button>
        </ListItem>
      ))}
    </List>
  );

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
      <TextField
        fullWidth
        label="Document Content"
        value={content}
        onChange={handleContentChange}
        multiline
        rows={isTouchDevice ? 10 : 20}
        className="mb-4"
        variant="outlined"
        InputProps={{
          style: { color: darkMode ? 'white' : 'black' }
        }}
      />
      {showHistory && (
        <div className="mt-4">
          <Typography variant="h6" className="mb-2">Version History</Typography>
          <HistoryList />
        </div>
      )}
        variant="outlined"
        InputProps={{
          style: { color: darkMode ? 'white' : 'black' }
        }}
      />
    </div>
  );
};

export default TextEditor;
