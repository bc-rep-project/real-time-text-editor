
import React, { useState, useEffect } from 'react';

const ChatBox = ({ documentId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (documentId) {
      fetchChatHistory();
      setupWebSocket();
    }
  }, [documentId]);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`/api/chat/${documentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const setupWebSocket = () => {
    if (!window.socket) {
      window.socket = new WebSocket('ws://localhost:3000');
      window.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'chatMessage' && data.documentId === documentId) {
          setMessages((prevMessages) => [...prevMessages, data.message]);
        }
      };
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    const message = {
      documentId,
      userId: 1, // Replace with actual user ID when authentication is implemented
      message: newMessage,
    };

    try {
      const response = await fetch(`/api/chat/${documentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setNewMessage('');
      
      // Send WebSocket update
      if (window.socket) {
        window.socket.send(JSON.stringify({
          type: 'chatMessage',
          documentId,
          message,
        }));
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="border border-gray-300 p-4">
      <h3 className="text-lg font-bold mb-4">Chat</h3>
      <div className="h-64 overflow-y-auto mb-4 border border-gray-200 p-2 rounded-md">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <span className="font-semibold">{msg.userId}: </span>
            <span>{msg.message}</span>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
