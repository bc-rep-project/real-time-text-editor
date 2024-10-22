






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

  return (
    <div className="w-full">
      {!isConnected && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p className="font-bold">Disconnected</p>
          <p>Trying to reconnect...</p>
        </div>
      )}
      <input
        type="text"
        className="w-full text-2xl font-semibold mb-4 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
        value={title}
        onChange={handleTitleChange}
        placeholder="Enter document title..."
      />
      <textarea
        className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200 resize-none"
        value={content}
        onChange={handleContentChange}
        placeholder="Start typing your document here..."
      />
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
};

export default TextEditor;

      </button>
    </div>
  );
};

export default TextEditor;

};

export default TextEditor;





