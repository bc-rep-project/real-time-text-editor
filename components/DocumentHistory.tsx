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
}

export function DocumentHistory({ documentId }: DocumentHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}/versions`);
        if (!response.ok) throw new Error('Failed to fetch versions');
        const data = await response.json();
        setVersions(data);
      } catch (error) {
        setError('Failed to load version history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersions();
  }, [documentId]);

  return (
    <div className="version-history-container">
      {/* Render version history UI */}
    </div>
  );
} 