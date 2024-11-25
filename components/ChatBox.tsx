'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import type { ChatMessageWithUser } from '@/types/database';

interface ChatBoxProps {
  documentId: string;
}

export function ChatBox({ documentId }: ChatBoxProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessageWithUser[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const { sendMessage, addMessageListener } = useWebSocket(documentId);
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
    const handleWebSocketMessage = async (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chatMessage') {
          setMessages(prev => [...prev, data]);
          scrollToBottom();
        }
      } catch (error) {
        console.error('Error handling chat message:', error);
      }
    };

    const unsubscribe = addMessageListener(handleWebSocketMessage);

    return () => {
      unsubscribe();
    };
  }, [addMessageListener]);

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

  return (
    <div className="chat-container border rounded-lg bg-white dark:bg-gray-800 flex flex-col">
      <div className="p-3 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-medium text-gray-900 dark:text-white">Chat</h3>
        
        {/* Added features menu */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {/* Add scroll to latest */}}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            title="Scroll to Latest"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
          
          <button
            onClick={() => {/* Add clear chat */}}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            title="Clear Chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <ErrorMessage message={error} />
        </div>
      ) : (
        <>
          {/* Chat messages container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.userId === session?.user?.id ? 'items-end' : 'items-start'
                }`}
              >
                <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                  {msg.username}
                </div>
                <div
                  className={`rounded-lg px-3 py-2 break-words max-w-[85%] sm:max-w-[75%] ${
                    msg.userId === session?.user?.id
                      ? 'chat-message-sent text-white ml-8'
                      : 'chat-message-received dark:text-gray-100 mr-8'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input form */}
          <form onSubmit={handleSendMessage} className="chat-input-container p-3 border-t dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={isSending}
                className="chat-input flex-1 px-3 py-2 border rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500 
                disabled:opacity-50 text-sm"
              />
              <button
                type="submit"
                disabled={isSending || !newMessage.trim()}
                className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg 
                hover:bg-blue-600 dark:hover:bg-blue-700 
                disabled:opacity-50 disabled:hover:bg-blue-500 
                flex items-center gap-2 whitespace-nowrap text-sm"
              >
                {isSending ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span className="hidden sm:inline">Sending...</span>
                  </>
                ) : (
                  <span>Send</span>
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
} 