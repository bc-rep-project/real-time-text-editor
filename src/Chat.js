
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000');

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    socket.on('chat-message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('chat-message');
    };
  }, []);

  const handleSendMessage = () => {
    if (inputMessage.trim() !== '') {
      socket.emit('chat-message', inputMessage);
      setMessages((prevMessages) => [...prevMessages, inputMessage]);
      setInputMessage('');
    }
  };

  return (
    <div className="chat">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className="chat-message">
            {message}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
