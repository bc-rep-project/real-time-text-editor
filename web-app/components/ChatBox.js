import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import { Paper, Typography, TextField, Button, List, ListItem, ListItemText, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import useTouchDevice from '../hooks/useTouchDevice';

const ChatBox = ({ documentId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const darkMode = theme.palette.mode === 'dark';
  const isTouchDevice = useTouchDevice();

  useEffect(() => {
    // Connect to WebSocket
    socketRef.current = new WebSocket(`ws://localhost:8080/chat/${documentId}`);

    socketRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() !== '' && socketRef.current) {
      const message = { text: newMessage, sender: 'You', documentId };
      socketRef.current.send(JSON.stringify(message));
      setNewMessage('');
    }
  };

  return (
    <Paper elevation={3} className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} flex flex-col h-full`}>
      <Typography variant="h6" component="h2" className={`mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
        Chat
      </Typography>
      <List className="flex-grow overflow-y-auto mb-4">
        {messages.map((message, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={<strong>{message.sender}:</strong>}
              secondary={message.text}
              className={darkMode ? 'text-gray-300' : 'text-gray-700'}
            />
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
      </List>
      <form onSubmit={handleSendMessage} className="flex">
        <TextField
          fullWidth
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          variant="outlined"
          size="small"
          className="mr-2"
          InputProps={{
            style: { color: darkMode ? 'white' : 'black' }
          }}
        />
        {isTouchDevice ? (
          <IconButton type="submit" color="primary">
            <SendIcon />
          </IconButton>
        ) : (
          <Button type="submit" variant="contained" color="primary">
            Send
          </Button>
        )}
      </form>
    </Paper>
  );
};

export default ChatBox;
