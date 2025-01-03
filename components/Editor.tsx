'use client';

import { useEffect } from 'react';

interface EditorProps {
  websocket: any;
  documentId: string;
  userId: string;
  username: string;
}

export function Editor({ websocket, documentId, userId, username }: EditorProps) {
  return (
    <div className="h-full p-4">
      <textarea 
        className="w-full h-full p-4 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
        placeholder="Start typing..."
      />
    </div>
  );
} 