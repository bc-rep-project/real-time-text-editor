import { useEffect, useRef, useCallback } from 'react';
import config from '@/config';
import { WebSocketMessage } from '@/types/websocket';

export function useWebSocket(documentId: string) {
  const wsRef = useRef<WebSocket | null>(null);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        ...message,
        timestamp: Date.now()
      }));
    }
  }, []);

  useEffect(() => {
    const ws = new WebSocket(`${config.websocketUrl}?documentId=${documentId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage;
        // Handle incoming messages
        console.log('Received message:', data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket');
    };

    return () => {
      ws.close();
    };
  }, [documentId]);

  return { sendMessage };
} 