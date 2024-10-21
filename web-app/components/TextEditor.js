import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from './LoadingSpinner';

const TextEditor = ({ documentId }) => {
  const [text, setText] = useState('');
  const [ws, setWs] = useState(null);
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const connectWebSocket = useCallback(() => {
    setIsLoading(true);
    const socket = new WebSocket('ws://0dc9ae2286a79b8954.blackbx.ai');
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
      setIsLoading(false);
      setError('');
      if (username && documentId) {
        socket.send(JSON.stringify({ type: 'join', username, documentId }));
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'update') {
        setText(data.content);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
      setIsLoading(false);
      setError('Connection lost. Attempting to reconnect...');
      setTimeout(connectWebSocket, 5000);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsLoading(false);
      setError('An error occurred. Please try again later.');
    };

    setWs(socket);
  }, [username, documentId]);

  useEffect(() => {
    if (username && documentId) {
      connectWebSocket();
    }
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [username, documentId, connectWebSocket]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'update', content: newText, username, documentId }));
    }
  };

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    setUsername(e.target.username.value);
  };

  if (!username) {
    return (
      <form onSubmit={handleUsernameSubmit}>
        <input type="text" name="username" placeholder="Enter your username" required />
        <button type="submit">Set Username</button>
      </form>
    );
  }

  return (
    <div>
      <h2>Editing Document: {documentId}</h2>
      <p>Welcome, {username}!</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {isLoading ? (
        <LoadingSpinner />
      ) : isConnected ? (
        <textarea
          value={text}
          onChange={handleTextChange}
          rows={10}
          cols={50}
          placeholder="Start typing here..."
        />
      ) : (
        <p>Connecting...</p>
      )}
    </div>
  );
};

export default TextEditor;
