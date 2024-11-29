'use client';

import { useEffect, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface DocumentPreviewProps {
  content: string;
}

export function DocumentPreview({ content }: DocumentPreviewProps) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (!content) {
      setHtml('');
      return;
    }

    // Convert content to HTML and sanitize
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