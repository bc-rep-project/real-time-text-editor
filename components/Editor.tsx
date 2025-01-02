'use client';

import { useEffect, useState } from 'react';
import type { WebSocketMessage, MessageHandler } from '@/types/websocket';

interface EditorProps {
  websocket: {
    sendMessage: (message: WebSocketMessage) => void;
    addMessageListener: (handler: MessageHandler) => void;
    reconnect: () => void;
    isConnected: boolean;
  };
  documentId: string;
  onSelectionChange?: (selection: { from: number; to: number } | undefined) => void;
}

export function Editor({ websocket, documentId, onSelectionChange }: EditorProps) {
  return (
    <div className="h-full">
      {/* Editor implementation will go here */}
      <textarea 
        className="w-full h-full p-4 resize-none"
        onChange={(e) => {
          websocket.sendMessage({
            type: 'documentUpdate',
            documentId,
            data: { 
              type: 'documentUpdate',
              content: e.target.value 
            }
          });
        }}
      />
    </div>
  );
} 