import React, { useState, useEffect, useRef } from 'react';
import useTouchDevice from '../hooks/useTouchDevice';

const ChatBox = ({ documentId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const isTouchDevice = useTouchDevice();

  useEffect(() => {
    const fetchPreviousMessages = async () => {
      try {
        const response = await fetch(`/api/messages/${documentId}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Error fetching previous messages:', error);
      }
    };

    fetchPreviousMessages();

    // Connect to WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    socketRef.current = new WebSocket(`${protocol}//${host}`);

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      } else if (data.type === 'userList') {
        setActiveUsers(data.users);
      } else if (data.type === 'typing') {
        if (data.isTyping) {
          setTypingUsers((prevTypingUsers) => 
            prevTypingUsers.includes(data.username) ? prevTypingUsers : [...prevTypingUsers, data.username]
          );
        } else {
          setTypingUsers((prevTypingUsers) => 
            prevTypingUsers.filter((user) => user !== data.username)
          );
        }
      }
    };

    socketRef.current.onopen = () => {
      socketRef.current.send(JSON.stringify({ type: 'join', documentId, username: 'You' }));
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socketRef.current.onclose = (event) => {
      if (event.wasClean) {
        console.log(`Closed cleanly, code=${event.code}, reason=${event.reason}`);
      } else {
        console.error('Connection died');
      }
    };

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.send(JSON.stringify({ type: 'leave', documentId }));
        socketRef.current.close();
      }
    };
  }, [documentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((newMessage.trim() !== '' || file) && socketRef.current) {
      let fileUrl = '';
      if (file) {
        setIsUploading(true);
        setUploadError('');
        const formData = new FormData();
        formData.append('file', file);
        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          if (response.ok) {
            const data = await response.json();
            fileUrl = data.fileUrl;
          } else {
            throw new Error('File upload failed');
          }
        } catch (error) {
          console.error('Error uploading file:', error);
          setUploadError('Failed to upload file. Please try again.');
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }
      const message = { type: 'chat', text: newMessage, sender: 'You', documentId, fileUrl };
      socketRef.current.send(JSON.stringify(message));
      setNewMessage('');
      setFile(null);
      // Send typing status as false when message is sent
      socketRef.current.send(JSON.stringify({ type: 'typing', documentId, username: 'You', isTyping: false }));
    }
  };

  const handleTyping = () => {
    if (socketRef.current) {
      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Send typing status as true
      socketRef.current.send(JSON.stringify({ type: 'typing', documentId, username: 'You', isTyping: true }));

      // Set a new timeout
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.send(JSON.stringify({ type: 'typing', documentId, username: 'You', isTyping: false }));
      }, 2000); // Stop "typing" after 2 seconds of inactivity
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div key={index} className="mb-4">
            <p className="font-bold text-gray-700 dark:text-gray-300">{message.sender}</p>
            <p className="text-gray-600 dark:text-gray-400">{message.text}</p>
            {message.fileUrl && (
              <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                Attached File
              </a>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            className="flex-grow mr-2 p-2 border border-gray-300 dark:border-gray-600 rounded"
            placeholder="Type a message..."
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-2"
          >
            📎
          </button>
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-full"
          >
            Send
          </button>
        </form>
        {file && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">File attached: {file.name}</p>}
        {isUploading && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Uploading file...</p>}
        {uploadError && <p className="mt-2 text-sm text-red-500">{uploadError}</p>}
        {typingUsers.length > 0 && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
      }, 1000); // Stop typing indicator after 1 second of inactivity
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError('');
      return;
    }
    setIsSearching(true);
    setSearchError('');
    try {
      const response = await fetch(`/api/search?documentId=${documentId}&query=${encodeURIComponent(searchQuery.trim())}`);
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      } else {
        throw new Error('Failed to fetch search results');
      }
    } catch (error) {
      console.error('Error searching messages:', error);
      setSearchError('An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    setSearchError('');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size exceeds 5MB limit. Please choose a smaller file.');
        e.target.value = null; // Reset the file input
      } else {
        setFile(selectedFile);
      }
    }
  };

  return (
    <Paper elevation={3} className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} flex flex-col h-full`}>
      <Typography variant="h6" component="h2" className={`mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>
        Chat
      </Typography>
      <Typography variant="body2" className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        Active Users: {activeUsers.join(', ')}
      </Typography>
      {typingUsers.length > 0 && (
        <Typography variant="body2" className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </Typography>
      )}
      <div className="mb-2 flex flex-col">
        <div className="flex mb-2">
          <TextField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            variant="outlined"
            size="small"
            className="mr-2 flex-grow"
            InputProps={{
              style: { color: darkMode ? 'white' : 'black' }
            }}
          />
          <Button onClick={handleSearch} variant="contained" color="primary" disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
        {searchResults.length > 0 && (
          <div className="flex justify-between items-center mb-2">
            <Typography variant="body2" className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
              {searchResults.length} result(s) found
            </Typography>
            <Button onClick={clearSearch} variant="outlined" size="small">
              Clear Search
            </Button>
          </div>
        )}
        {searchError && (
          <Typography variant="body2" className="text-red-500 mb-2">
            {searchError}
          </Typography>
        )}
      </div>
      <List className="flex-grow overflow-y-auto mb-4">
        {(searchResults.length > 0 ? searchResults : messages).map((message, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={message.sender}
              secondary={
                <>
                  {message.text}
                  {message.fileUrl && (
                    <div>
                      <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
                        Attached File
                      </a>
                    </div>
                  )}
                </>
              }
              primaryTypographyProps={{ style: { color: darkMode ? 'white' : 'black' } }}
              secondaryTypographyProps={{ style: { color: darkMode ? 'lightgray' : 'gray' } }}
            />
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
      </List>
      <form onSubmit={handleSendMessage} className="flex items-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <IconButton onClick={() => fileInputRef.current.click()} color="primary" disabled={isUploading}>
          <AttachFileIcon />
        </IconButton>
        <TextField
          fullWidth
          value={newMessage}
          onChange={handleTyping}
          placeholder="Type a message..."
          variant="outlined"
          size="small"
          className="mr-2"
          InputProps={{
            style: { color: darkMode ? 'white' : 'black' }
          }}
          disabled={isUploading}
        />
        {isTouchDevice ? (
          <IconButton type="submit" color="primary" disabled={isUploading}>
            <SendIcon />
          </IconButton>
        ) : (
          <Button type="submit" variant="contained" color="primary" disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Send'}
          </Button>
        )}
      </form>
      {file && (
        <Typography variant="body2" className="mt-2">
          File selected: {file.name}
        </Typography>
      )}
      {uploadError && (
        <Typography variant="body2" className="mt-2 text-red-500">
          {uploadError}
        </Typography>
      )}
    </Paper>
  );
};

export default ChatBox;
