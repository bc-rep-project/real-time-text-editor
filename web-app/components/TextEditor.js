
import React, { useState, useEffect, useRef } from 'react';

const TextEditor = ({ documentId, onClose }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  
  const ws = useRef(null);

  useEffect(() => {
    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      ws.current = new WebSocket(`${protocol}//${host}`);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        ws.current.send(JSON.stringify({ type: 'join', documentId, username: 'User' }));
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

  const sendUpdate = (newContent, newTitle) => {
    if (isConnected && ws.current) {
      ws.current.send(JSON.stringify({
        type: 'update',
        content: newContent,
        title: newTitle,
        documentId,
        username: 'User'
      }));
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`w-full ${darkMode ? 'dark bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Real-time Text Editor</h1>
        <button
          onClick={toggleDarkMode}
          className={`px-4 py-2 rounded ${darkMode ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-white'}`}
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
      {!isConnected && (
        <div className={`border-l-4 p-4 mb-4 ${darkMode ? 'bg-yellow-900 border-yellow-600 text-yellow-200' : 'bg-yellow-100 border-yellow-500 text-yellow-700'}`} role="alert">
          <p className="font-bold">Disconnected</p>
          <p>Trying to reconnect...</p>
        </div>
      )}
      <input
        type="text"
        className={`w-full text-2xl font-semibold mb-4 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
          darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'
        }`}
        value={title}
        onChange={handleTitleChange}
        placeholder="Enter document title..."
      />
      <textarea
        className={`w-full h-64 p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 resize-none ${
          darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'
        }`}
        value={content}
        onChange={handleContentChange}
        placeholder="Start typing your document here..."
      />
      <button
        className={`mt-4 px-4 py-2 rounded transition-colors duration-200 ${
          darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
};

export default TextEditor;
