'use client';

import { useState, useEffect } from 'react';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';

interface Version {
  id: string;
  content: string;
  userId: string;
  username: string;
  createdAt: string;
  wordCount: number;
  changes: number;
}

interface DocumentHistoryProps {
  documentId: string;
  onRestore: (content: string) => void;
}

export function DocumentHistory({ documentId, onRestore }: DocumentHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}/versions`);
        const data = await response.json();
        setVersions(data);
      } catch (error) {
        console.error('Error fetching versions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersions();
  }, [documentId]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white">Version History</h3>
      </div>
      <div className="divide-y dark:divide-gray-700">
        {versions.map((version) => (
          <div
            key={version.id}
            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
              selectedVersion === version.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
            onClick={() => setSelectedVersion(version.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {version.username}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(version.createdAt))} ago
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {version.wordCount} words • {version.changes} changes
              </div>
            </div>
            {selectedVersion === version.id && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => onRestore(version.content)}
                  className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400"
                >
                  Restore this version
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 