'use client';

import { useState, useEffect } from 'react';

interface DocumentStatsProps {
  documentId: string;
  content: string;
}

export function DocumentStats({ documentId, content }: DocumentStatsProps) {
  const [stats, setStats] = useState({
    wordCount: 0,
    readingTime: 0,
    revisions: 0
  });

  useEffect(() => {
    const calculateStats = () => {
      // Calculate word count
      const words = content
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0);

      // Calculate reading time (average 200 words per minute)
      const readingTimeMinutes = Math.ceil(words.length / 200);

      // Fetch revision count
      fetch(`/api/documents/${documentId}/versions/count`)
        .then(res => res.json())
        .then(data => {
          setStats({
            wordCount: words.length,
            readingTime: readingTimeMinutes,
            revisions: data.count
          });
        });
    };

    calculateStats();
  }, [documentId, content]);

  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {stats.wordCount}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Words</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {stats.readingTime}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Min Read</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {stats.revisions}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Revisions</div>
      </div>
    </div>
  );
} 