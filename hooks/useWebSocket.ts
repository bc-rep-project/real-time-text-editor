'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import config from '@/config';
import { getToken } from 'next-auth/jwt';

interface WebSocketMessage {
  type: 'documentUpdate' | 'chatMessage' | 'userPresence';
  documentId: string;
  data: any;
}

type MessageHandler = (event: MessageEvent) => void;

export function useWebSocket(documentId: string) {
  const { data: session } = useSession();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const messageHandlersRef = useRef<Set<MessageHandler>>(new Set());
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/auth/token');
      const { token } = await response.json();
      
      const ws = new WebSocket(
        `${config.websocket.url}?documentId=${documentId}&token=${token}`
      );
      
      ws.onopen = () => {
        setConnectionStatus('connected');
        setError(null);
      };

      ws.onerror = (error) => {
        setError('WebSocket connection error');
        setConnectionStatus('disconnected');
      };

      wsRef.current = ws;
    } catch (error) {
      setError('Failed to establish WebSocket connection');
      setConnectionStatus('disconnected');
    }
  }, [documentId, session]);

  // Connect on mount and reconnect on session/documentId change
  useEffect(() => {
    if (!session) return;
    connect();

    return () => {
      // Send leave message before disconnecting
      if (wsRef.current?.readyState === WebSocket.OPEN && session?.user) {
        wsRef.current.send(JSON.stringify({
          type: 'userPresence',
          documentId,
          data: {
            userId: session.user.id,
            username: session.user.name,
            action: 'leave'
          }
        }));
      }

      // Clean up
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      messageHandlersRef.current.clear();
      wsRef.current?.close();
    };
  }, [connect, documentId, session]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, attempting to reconnect...');
      connect();
      return;
    }

    try {
      wsRef.current.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
    }
  }, [connect]);

  const addMessageListener = useCallback((handler: MessageHandler) => {
    messageHandlersRef.current.add(handler);
    return () => {
      messageHandlersRef.current.delete(handler);
    };
  }, []);

  // Return connection status and error
  return {
    sendMessage,
    addMessageListener,
    reconnect: connect,
    connectionStatus,
    error,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN
  };
} 