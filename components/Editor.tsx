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
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="border-b dark:border-gray-700 p-2">
        {/* Add toolbar buttons here */}
      </div>
      
      {/* Editor Area */}
      <div className="flex-1 p-4">
        <textarea 
          className="w-full h-full p-4 resize-none border rounded dark:border-gray-700 dark:bg-gray-800"
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
    </div>
  );
} 