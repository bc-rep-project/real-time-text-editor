'use client';

import { useEffect, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useWebSocket } from '@/hooks/useWebSocket';

interface DocumentPreviewProps {
  content: string;
  documentId: string;
}

export function DocumentPreview({ content, documentId }: DocumentPreviewProps) {
  const [html, setHtml] = useState('');
  const { addMessageListener } = useWebSocket(documentId);

  useEffect(() => {
    // Handle real-time updates
    const unsubscribe = addMessageListener((event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'documentUpdate') {
        const rawHtml = marked.parse(data.content, { async: false });
        const sanitizedHtml = DOMPurify.sanitize(rawHtml);
        setHtml(sanitizedHtml);
      }
    });

    return () => unsubscribe();
  }, [addMessageListener]);

  useEffect(() => {
    if (!content) {
      setHtml('');
      return;
    }

    const rawHtml = marked.parse(content, { async: false });
    const sanitizedHtml = DOMPurify.sanitize(rawHtml);
    setHtml(sanitizedHtml);
  }, [content]);

  return (
    <div className="prose dark:prose-invert max-w-none p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div 
        dangerouslySetInnerHTML={{ __html: html }}
        className="min-h-[500px]"
      />
    </div>
  );
} 