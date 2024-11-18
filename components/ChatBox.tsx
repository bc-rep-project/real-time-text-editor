'use client';

import { useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { WebSocketMessage } from '@/types/websocket';

interface ChatBoxProps {
  documentId: string;
  userId: string;
}

export function ChatBox({ documentId, userId }: ChatBoxProps) {
  const [message, setMessage] = useState('');
  const { sendMessage } = useWebSocket(documentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const data = {
      userId,
      message: message.trim(),
      timestamp: new Date().toISOString()
    };

    const wsMessage: WebSocketMessage = {
      type: 'chatMessage',
      documentId,
      data,
      userId
    };

    sendMessage(wsMessage);
    setMessage('');
  };

  return (
    <div className="chat-box">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="chat-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
} 