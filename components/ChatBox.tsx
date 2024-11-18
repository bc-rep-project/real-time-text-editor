'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  createdAt: Date;
}

interface ChatBoxProps {
  documentId: string;
}

export function ChatBox({ documentId }: ChatBoxProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const { sendMessage } = useWebSocket(documentId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch chat history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/chat/${documentId}`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to load chat messages');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [documentId]);

  // Handle incoming chat messages
  useEffect(() => {
    const handleWebSocketMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chatMessage') {
          setMessages(prev => [...prev, data.data]);
          scrollToBottom();
        }
      } catch (error) {
        console.error('Error handling chat message:', error);
      }
    };

    const ws = new WebSocket(`ws://localhost:8081?documentId=${documentId}`);
    ws.addEventListener('message', handleWebSocketMessage);

    return () => {
      ws.removeEventListener('message', handleWebSocketMessage);
      ws.close();
    };
  }, [documentId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user || isSending) return;

    try {
      setIsSending(true);
      const response = await fetch(`/api/chat/${documentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const messageData = await response.json();
      sendMessage({
        type: 'chatMessage',
        documentId,
        data: messageData
      });

      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg bg-white p-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg bg-white p-4">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white">
      <div className="p-3 border-b">
        <h3 className="font-medium">Chat</h3>
      </div>
      <div className="h-[300px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.userId === session?.user?.id ? 'items-end' : 'items-start'
              }`}
            >
              <div className="text-xs text-gray-500 mb-1">{msg.username}</div>
              <div
                className={`rounded-lg px-3 py-2 max-w-[80%] ${
                  msg.userId === session?.user?.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100'
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={isSending}
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isSending}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <LoadingSpinner size="small" />
                  Sending...
                </>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 