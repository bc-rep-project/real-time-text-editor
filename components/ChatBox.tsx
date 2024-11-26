'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import type { ChatMessageWithUser } from '@/types/database';
import { ChatHeader } from './chat/ChatHeader';
import { MessageBubble } from './chat/MessageBubble';
import { TypingIndicator } from './chat/TypingIndicator';
import { MessageInput } from './chat/MessageInput';

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
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

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
        const messagesWithDates = data.map((msg: ChatMessageWithUser) => ({
          ...msg,
          createdAt: new Date(msg.createdAt)
        }));
        setMessages(messagesWithDates);
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
          const messageWithDate = {
            ...data,
            createdAt: new Date(data.createdAt)
          };
          setMessages(prev => [...prev, messageWithDate]);
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

  const handleSendMessage = () => {
    if (!newMessage.trim() || !session?.user || isSending) return;

    const sendMessageAsync = async () => {
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

    sendMessageAsync();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 flex flex-col chat-container">
      <ChatHeader 
        onlineUsers={activeUsers.length}
        onScrollToBottom={scrollToBottom}
        onClearChat={() => setMessages([])}
      />

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
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg.message}
                username={msg.username}
                timestamp={msg.createdAt.toISOString()}
                isSelf={msg.userId === session?.user?.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <TypingIndicator typingUsers={typingUsers} />

          <MessageInput
            value={newMessage}
            onChange={setNewMessage}
            onSend={handleSendMessage}
            isLoading={isSending}
          />
        </>
      )}
    </div>
  );
} 