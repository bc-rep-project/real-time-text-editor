import { useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import config from '@/config';

interface WebSocketMessage {
  type: 'documentUpdate' | 'chatMessage' | 'userPresence';
  documentId: string;
  data: any;
}

export function useWebSocket(documentId: string) {
  const { data: session } = useSession();
  const wsRef = useRef<WebSocket | null>(null);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    if (!session || !documentId) return;

    const ws = new WebSocket(`${config.websocketUrl}?documentId=${documentId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [session, documentId]);

  return { sendMessage };
} 