'use client';

import { useState, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'editor' | 'viewer';
  isOnline: boolean;
}

interface DocumentCollaboratorsProps {
  documentId: string;
}

export function DocumentCollaborators({ documentId }: DocumentCollaboratorsProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/documents/${documentId}/collaborators`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch collaborators');
        }

        const data = await response.json();
        setCollaborators(data);
      } catch (error) {
        console.error('Error fetching collaborators:', error);
        setError('Failed to load collaborators');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollaborators();
  }, [documentId]);

  if (isLoading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
        <h3 className="font-medium mb-4 text-gray-900 dark:text-white">Collaborators</h3>
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
        <h3 className="font-medium mb-4 text-gray-900 dark:text-white">Collaborators</h3>
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
      <h3 className="font-medium mb-4 text-gray-900 dark:text-white">Collaborators</h3>
      <div className="space-y-3">
        {collaborators.map((collaborator) => (
          <div
            key={collaborator.id}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {collaborator.name[0].toUpperCase()}
                </div>
                {collaborator.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {collaborator.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {collaborator.email}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                collaborator.role === 'editor'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {collaborator.role}
              </span>
            </div>
          </div>
        ))}
        {collaborators.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400">
            No collaborators yet
          </div>
        )}
      </div>
    </div>
  );
} 