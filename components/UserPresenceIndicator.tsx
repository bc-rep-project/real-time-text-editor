'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { LoadingSpinner } from './LoadingSpinner';

interface User {
  userId: string;
  username: string;
  lastSeen: string;
  status: 'online' | 'away' | 'dnd' | 'offline';
  avatar?: string;
  currentActivity?: {
    type: 'editing' | 'commenting' | 'viewing';
    location: string;
    timestamp: string;
  };
}

interface UserPresenceIndicatorProps {
  documentId: string;
}

export function UserPresenceIndicator({ documentId }: UserPresenceIndicatorProps) {
  const { data: session } = useSession();
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const { sendMessage, addMessageListener } = useWebSocket(documentId);
  const [isLoading, setIsLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<User['status']>('online');
  const idleTimeout = useRef<NodeJS.Timeout>();

  // Handle user idle state
  useEffect(() => {
    const handleActivity = () => {
      if (userStatus === 'away') {
        setUserStatus('online');
        sendPresenceUpdate('online');
      }
      
      // Clear existing timeout
      if (idleTimeout.current) {
        clearTimeout(idleTimeout.current);
      }

      // Set new idle timeout (5 minutes)
      idleTimeout.current = setTimeout(() => {
        setUserStatus('away');
        sendPresenceUpdate('away');
      }, 5 * 60 * 1000);
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      if (idleTimeout.current) {
        clearTimeout(idleTimeout.current);
      }
    };
  }, [userStatus]);

  const sendPresenceUpdate = (status: User['status'], activity?: User['currentActivity']) => {
    if (!session?.user) return;

    sendMessage({
      type: 'userPresence',
      documentId,
      data: {
        userId: session.user.id,
        username: session.user.name,
        status,
        avatar: session.user.image,
        currentActivity: activity,
        action: 'update'
      }
    });
  };

  // Send presence on mount and handle incoming presence updates
  useEffect(() => {
    if (!session?.user) return;
    setIsLoading(false);

    // Send initial presence
    sendPresenceUpdate('online');

    // Handle incoming presence updates
    const cleanup = addMessageListener((event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'userPresence') {
          const { userId, username, status, avatar, currentActivity, action } = data.data;
          
          setActiveUsers(prev => {
            if (action === 'update') {
              const existingUserIndex = prev.findIndex(user => user.userId === userId);
              if (existingUserIndex >= 0) {
                const newUsers = [...prev];
                newUsers[existingUserIndex] = {
                  ...newUsers[existingUserIndex],
                  status,
                  avatar,
                  currentActivity,
                  lastSeen: new Date().toISOString()
                };
                return newUsers;
              } else {
                return [...prev, {
                  userId,
                  username,
                  status,
                  avatar,
                  currentActivity,
                  lastSeen: new Date().toISOString()
                }];
              }
            } else if (action === 'leave') {
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
      if (idleTimeout.current) {
        clearTimeout(idleTimeout.current);
      }
    };
  }, [session, documentId, sendMessage, addMessageListener]);

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: User['status']) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'dnd': return 'Do Not Disturb';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 p-4">
        <LoadingSpinner size="small" />
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">
        Currently Active ({activeUsers.length})
      </h3>
      <div className="space-y-3">
        {activeUsers.map((user) => (
          <div
            key={user.userId}
            className="flex items-center gap-3 group relative"
          >
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {user.username[0]}
                  </span>
                </div>
              )}
              <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-white dark:border-gray-800`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {user.username}
                  {user.userId === session?.user?.id && ' (You)'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {getStatusText(user.status)}
                </span>
              </div>
              {user.currentActivity && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.currentActivity.type === 'editing' && 'Editing '}
                  {user.currentActivity.type === 'commenting' && 'Commenting on '}
                  {user.currentActivity.type === 'viewing' && 'Viewing '}
                  {user.currentActivity.location}
                </p>
              )}
            </div>
            
            {/* Hover card with detailed info */}
            <div className="absolute left-full ml-2 hidden group-hover:block bg-white dark:bg-gray-700 shadow-lg rounded-lg p-3 z-10 w-64">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                        {user.username[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {user.username}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {getStatusText(user.status)}
                    </p>
                  </div>
                </div>
                {user.currentActivity && (
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <p className="font-medium">Current Activity:</p>
                    <p>{user.currentActivity.type} {user.currentActivity.location}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(user.currentActivity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last seen: {new Date(user.lastSeen).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        {activeUsers.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No active users
          </p>
        )}
      </div>
    </div>
  );
} 