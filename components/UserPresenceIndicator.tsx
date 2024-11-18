'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { LoadingSpinner } from './LoadingSpinner';

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
  const { sendMessage, addMessageListener } = useWebSocket(documentId);
  const [isLoading, setIsLoading] = useState(true);

  // Send presence on mount and handle incoming presence updates
  useEffect(() => {
    if (!session?.user) return;
    setIsLoading(false);

    // Send initial presence
    sendMessage({
      type: 'userPresence',
      documentId,
      data: {
        userId: session.user.id,
        username: session.user.name,
        action: 'join'
      }
    });

    // Handle incoming presence updates
    const cleanup = addMessageListener((event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'userPresence') {
          const { userId, username, action } = data.data;
          
          setActiveUsers(prev => {
            if (action === 'join') {
              // Add user if not already present
              if (!prev.find(user => user.userId === userId)) {
                return [...prev, { 
                  userId, 
                  username, 
                  lastSeen: new Date().toISOString() 
                }];
              }
            } else if (action === 'leave') {
              // Remove user
              return prev.filter(user => user.userId !== userId);
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Error handling presence update:', error);
      }
    });

    // Cleanup: Send leave message and remove listener
    return () => {
      sendMessage({
        type: 'userPresence',
        documentId,
        data: {
          userId: session.user.id,
          username: session.user.name,
          action: 'leave'
        }
      });
      cleanup?.();
    };
  }, [session, documentId, sendMessage, addMessageListener]);

  if (isLoading) {
    return (
      <div className="border rounded-lg bg-white p-4">
        <LoadingSpinner size="small" />
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-600 mb-3">
        Currently Active
      </h3>
      <div className="space-y-2">
        {activeUsers.map((user) => (
          <div
            key={user.userId}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full absolute animate-ping"></div>
            </div>
            <span className="text-sm text-gray-700">
              {user.username}
              {user.userId === session?.user?.id && ' (You)'}
            </span>
          </div>
        ))}
        {activeUsers.length === 0 && (
          <p className="text-sm text-gray-500">
            No active users
          </p>
        )}
      </div>
    </div>
  );
} 