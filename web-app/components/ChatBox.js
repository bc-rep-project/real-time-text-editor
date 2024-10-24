import React, { useState, useEffect, useRef } from 'react';
import useTouchDevice from '../hooks/useTouchDevice';

const ChatBox = ({
  documentId,
  activeUsers,
  typingUsers,
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearching,
  searchError,
  file,
  setFile,
  isUploading,
  uploadError
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
const socketRef = useRef(null);
const messagesEndRef = useRef(null);
const typingTimeoutRef = useRef(null);
const fileInputRef = useRef(null);
const isTouchDevice = useTouchDevice();

const handleSendMessage = (e) => {
  e.preventDefault();
  if (newMessage.trim() !== '') {
    socketRef.current.emit('chat message', { documentId, message: newMessage });
    setNewMessage('');
  }
};

const handleInputChange = (e) => {
  setNewMessage(e.target.value);
  socketRef.current.emit('typing', { documentId, username: socketRef.current.id });
  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  typingTimeoutRef.current = setTimeout(() => {
    socketRef.current.emit('stop typing', { documentId, username: socketRef.current.id });
  }, 1000);
};

const handleFileChange = (e) => {
  const selectedFile = e.target.files[0];
  if (selectedFile) {
    setFile(selectedFile);
    // You can add additional logic here, such as uploading the file
    // or emitting a socket event to notify other users about the file
  }
};

// ... (keep all the existing useEffect hooks and functions)

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold">Chat</h2>
        <div className="mt-2">
          <p>Active Users: {activeUsers.join(', ')}</p>
          {typingUsers.length > 0 && <p>{typingUsers.join(', ')} is typing...</p>}
        </div>
      </div>
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div key={index} className="mb-4">
            <p className="font-bold text-gray-700 dark:text-gray-300">{message.username}</p>
            <p className="text-gray-600 dark:text-gray-400">{message.content}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          {isSearching && <p>Searching...</p>}
          {searchError && <p className="text-red-500">{searchError}</p>}
          {searchResults.length > 0 && (
            <div className="mt-2">
              <h3>Search Results:</h3>
              {searchResults.map((result, index) => (
                <p key={index}>{result}</p>
              ))}
            </div>
          )}
        </div>
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-grow px-4 py-2 mr-2 rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="ml-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
          >
            Attach
          </button>
        </form>
        {file && (
          <div className="mt-2">
            <p>Selected file: {file.name}</p>
            {isUploading && <p>Uploading...</p>}
            {uploadError && <p className="text-red-500">{uploadError}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
