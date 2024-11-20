'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useWebSocket } from '@/hooks/useWebSocket';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

interface EditorProps {
  documentId: string;
  initialContent: string;
}

export function EditorArea({ documentId, initialContent }: EditorProps) {
  const { data: session } = useSession();
  const { sendMessage, addMessageListener } = useWebSocket(documentId);
  const [content, setContent] = useState(initialContent);
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Quill modules configuration
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  }), []);

  // Calculate word count
  const calculateWordCount = useCallback((text: string) => {
    // Remove HTML tags and count words
    const plainText = text.replace(/<[^>]*>/g, ' ');
    const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  }, []);

  // Handle content changes
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setWordCount(calculateWordCount(newContent));
    setIsTyping(true);

    // Notify other users of changes
    sendMessage({
      type: 'documentUpdate',
      documentId,
      data: { content: newContent }
    });

    // Debounced save to database
    const saveContent = async () => {
      try {
        setIsSaving(true);
        const response = await fetch(`/api/documents/${documentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newContent }),
        });

        if (!response.ok) throw new Error('Failed to save changes');
      } catch (error) {
        console.error('Error saving document:', error);
        setError('Failed to save changes');
      } finally {
        setIsSaving(false);
        setIsTyping(false);
      }
    };

    const timeoutId = setTimeout(saveContent, 1000);
    return () => clearTimeout(timeoutId);
  }, [documentId, sendMessage]);

  // Listen for updates from other users
  useEffect(() => {
    const cleanup = addMessageListener((event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'documentUpdate' && data.documentId === documentId) {
          setContent(data.data.content);
          setWordCount(calculateWordCount(data.data.content));
        }
      } catch (error) {
        console.error('Error handling editor update:', error);
      }
    });

    return cleanup;
  }, [documentId, addMessageListener, calculateWordCount]);

  return (
    <div className="flex flex-col h-full">
      <div className="border rounded-lg bg-white overflow-hidden">
        <ReactQuill
          value={content}
          onChange={handleContentChange}
          modules={modules}
          theme="snow"
          placeholder="Start writing..."
          className="h-[500px] mb-12"
        />
      </div>
      
      <div className="flex justify-between items-center mt-2 px-2 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span>{wordCount} words</span>
          {isTyping && <span>•</span>}
          {isSaving && (
            <span className="flex items-center gap-1">
              <LoadingSpinner size="small" />
              Saving...
            </span>
          )}
        </div>
        {error && <ErrorMessage message={error} />}
      </div>
    </div>
  );
} 