'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import config from '@/config';

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

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${process.env.NEXT_PUBLIC_WS_URL}/ws?documentId=${documentId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Send initial presence
      if (session?.user) {
        ws.send(JSON.stringify({
          type: 'userPresence',
          documentId,
          data: {
            userId: session.user.id,
            username: session.user.name,
            action: 'join'
          }
        }));
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected, attempting to reconnect...');
      // Attempt to reconnect after delay
      reconnectTimeoutRef.current = setTimeout(connect, config.websocket.reconnectDelay);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onmessage = (event) => {
      messageHandlersRef.current.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    };
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

  return {
    sendMessage,
    addMessageListener,
    reconnect: connect,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN
  };
} 