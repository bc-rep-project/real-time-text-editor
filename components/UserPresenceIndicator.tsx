'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface User {
  userId: string;
  username: string;
  lastSeen: string;
}

interface UserPresenceIndicatorProps {
  documentId: string;
}

export function UserPresenceIndicator({ documentId }: UserPresenceIndicatorProps) {
  const { data: session } = useSession();
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const { sendMessage } = useWebSocket(documentId);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080?documentId=${documentId}`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'userPresence') {
        const { userId, username, action } = message.data;
        
        setActiveUsers(prev => {
          if (action === 'join') {
            if (!prev.find(user => user.userId === userId)) {
              return [...prev, { userId, username, lastSeen: new Date().toISOString() }];
            }
          } else if (action === 'leave') {
            return prev.filter(user => user.userId !== userId);
          }
          return prev;
        });
      }
    };

    return () => ws.close();
  }, [documentId]);

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-sm font-semibold text-gray-600 mb-2">
        Currently Editing
      </h3>
      <div className="space-y-2">
        {activeUsers.map((user) => (
          <div
            key={user.userId}
            className="flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm">
              {user.username}
              {user.userId === session?.user?.id && ' (You)'}
            </span>
          </div>
        ))}
        {activeUsers.length === 0 && (
          <p className="text-sm text-gray-500">No active users</p>
        )}
      </div>
    </div>
  );
} 