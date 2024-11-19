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
}

export function VersionHistory({ documentId, onRevert }: VersionHistoryProps) {
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

      const response = await fetch(`/api/documents/${documentId}/versions/revert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId: version.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to revert to version');
      }

      onRevert(version.content);
    } catch (error) {
      console.error('Error reverting version:', error);
      setError('Failed to revert to selected version');
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
    <div className="border rounded-lg bg-white">
      <div className="p-3 border-b">
        <h3 className="font-medium">Version History</h3>
      </div>
      <div className="divide-y max-h-[300px] overflow-y-auto">
        {versions.map((version) => (
          <div key={version.id} className="p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-gray-600">
                  {version.username}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(version.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleRevert(version)}
                disabled={isReverting !== null}
                className="text-sm text-blue-500 hover:text-blue-600 disabled:opacity-50 flex items-center gap-1"
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
          <div className="p-4 text-center text-gray-500">
            No version history available
          </div>
        )}
      </div>
    </div>
  );
} 