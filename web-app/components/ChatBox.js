import React, { useState, useEffect } from 'react';

const ChatBox = ({ documentId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const fetchChatHistory = () => {
    // Fetch chat history logic here
    setMessages([]); // Update this with actual fetched messages
  };

  const setupWebSocket = () => {
    // WebSocket setup logic here
  };

  useEffect(() => {
    fetchChatHistory();
    setupWebSocket();
  }, [documentId]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { user: 'You', text: newMessage }]);
      setNewMessage('');
      // Send message logic here
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Chat</h3>
      <div className="border rounded-lg p-4 h-48 overflow-y-auto mb-2">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <span className="font-bold">{msg.user}: </span>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow border rounded-l-lg px-2 py-1"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-4 py-1 rounded-r-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
