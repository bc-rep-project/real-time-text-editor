'use client';

import { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'editor' | 'viewer';
  avatar?: string;
  isOnline: boolean;
}

export function CollaboratorsList({ documentId }: { documentId: string }) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addMessageListener } = useWebSocket(documentId);

  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}/collaborators`);
        if (!response.ok) throw new Error('Failed to fetch collaborators');
        const data = await response.json();
        setCollaborators(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load collaborators');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollaborators();
  }, [documentId]);

  useEffect(() => {
    const handlePresenceUpdate = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === 'userPresence') {
        setCollaborators(prev => prev.map(collab => 
          collab.id === data.userId 
            ? { ...collab, isOnline: data.action === 'join' }
            : collab
        ));
      }
    };

    const unsubscribe = addMessageListener(handlePresenceUpdate);
    return () => unsubscribe();
  }, [addMessageListener]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="font-medium mb-4">Collaborators</h3>
      <div className="space-y-3">
        {collaborators.map(collaborator => (
          <div key={collaborator.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className="relative">
                {collaborator.avatar ? (
                  <img 
                    src={collaborator.avatar} 
                    alt={collaborator.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {collaborator.name[0]}
                  </div>
                )}
                {collaborator.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              
              {/* User Info */}
              <div>
                <div className="font-medium">{collaborator.name}</div>
                <div className="text-sm text-gray-500">{collaborator.email}</div>
              </div>
            </div>

            {/* Role Badge */}
            <span className={`px-2 py-1 rounded-full text-xs ${
              collaborator.role === 'editor' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {collaborator.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 