'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

interface Version {
  id: string;
  documentId: string;
  content: string;
  userId: string;
  username: string;
  createdAt: Date;
}

interface VersionHistoryProps {
  documentId: string;
  onRevert: (content: string) => void;
  hideTitle?: boolean;
}

export function VersionHistory({ documentId, onRevert, hideTitle = false }: VersionHistoryProps) {
  const { data: session } = useSession();
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReverting, setIsReverting] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/documents/${documentId}/versions`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch versions');
        }
        
        const data = await response.json();
        setVersions(data);
      } catch (error) {
        console.error('Error fetching versions:', error);
        setError('Failed to load version history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersions();
  }, [documentId]);

  const handleRevert = async (version: Version) => {
    try {
      setIsReverting(version.id);
      setError(null);

      console.log('Sending revert request with:', {
        versionId: version.id,
        content: version.content
      });

      const response = await fetch(`/api/documents/${documentId}/versions/revert`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ 
          versionId: version.id,
          content: version.content
        }),
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let data;
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid server response');
      }

      if (!response.ok) {
        console.error('Revert error response:', data);
        throw new Error(data.error || 'Failed to revert to version');
      }

      onRevert(version.content);
      console.log('Successfully reverted to version:', version.id);
    } catch (error) {
      console.error('Error reverting version:', error);
      setError(error instanceof Error ? error.message : 'Failed to revert to selected version. Please try again.');
    } finally {
      setIsReverting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg bg-white p-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg bg-white p-4">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
      {!hideTitle && (
        <div className="p-3 border-b dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white">Version History</h3>
        </div>
      )}
      <div className="divide-y dark:divide-gray-700 max-h-[300px] overflow-y-auto">
        {versions.map((version) => (
          <div key={version.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {version.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(version.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleRevert(version)}
                disabled={isReverting !== null}
                className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 
                disabled:opacity-50 flex items-center gap-1"
              >
                {isReverting === version.id ? (
                  <>
                    <LoadingSpinner size="small" />
                    Reverting...
                  </>
                ) : (
                  'Revert to this version'
                )}
              </button>
            </div>
          </div>
        ))}
        {versions.length === 0 && (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No version history available
          </div>
        )}
      </div>
    </div>
  );
} 