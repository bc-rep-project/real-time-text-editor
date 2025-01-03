'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import config from '@/config';

interface WebSocketContextType {
  sendMessage: (message: any) => void;
  addMessageListener: (handler: (event: MessageEvent) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const messageHandlersRef = useRef<Set<(event: MessageEvent) => void>>(new Set());

  useEffect(() => {
    const connect = () => {
      wsRef.current = new WebSocket(config.websocket.url);

      wsRef.current.onmessage = (event) => {
        messageHandlersRef.current.forEach(handler => handler(event));
      };

      wsRef.current.onclose = () => {
        setTimeout(connect, config.websocket.reconnectDelay);
      };
    };

    connect();

    return () => {
      wsRef.current?.close();
    };
  }, []);

  const value = {
    sendMessage: (message: any) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
      }
    },
    addMessageListener: (handler: (event: MessageEvent) => void) => {
      messageHandlersRef.current.add(handler);
      return () => {
        messageHandlersRef.current.delete(handler);
      };
    }
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}; 