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
    async function parseContent() {
      const parsedHtml = await marked.parse(content);
      const sanitizedHtml = DOMPurify.sanitize(parsedHtml);
      setHtml(sanitizedHtml);
    }
    
    parseContent();
  }, [content]);

  return (
    <div className="prose dark:prose-invert max-w-none p-6 overflow-auto h-full">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
} 