
"use client";
import { useState, useEffect } from 'react';
import { WebSocket } from 'ws';

const ChatBox = ({ documentId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const ws = new WebSocket('ws://localhost:8080');

  useEffect(() => {
    fetch(`/api/chat/${documentId}`)
      .then((response) => response.json())
      .then((data) => setMessages(data.messages));

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === 'chatMessage' && data.documentId === documentId) {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    };

    return () => {
      ws.close();
    };
  }, [documentId]);

  const handleSendMessage = () => {
    const message = { userId, message: newMessage };
    ws.send(JSON.stringify({ event: 'chatMessage', documentId, ...message }));
    fetch(`/api/chat/${documentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    setNewMessage('');
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.userId}</strong>: {msg.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default ChatBox;
