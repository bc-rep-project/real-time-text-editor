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

// Define Quill modules configuration
const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['link', 'image'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false
  }
};

interface EditorAreaProps {
  documentId: string;
  initialContent: string;
  onContentChange: (content: string) => void;
  onEditorReady: () => void;
}

export function EditorArea({ 
  documentId, 
  initialContent, 
  onContentChange,
  onEditorReady 
}: EditorAreaProps) {
  const { data: session } = useSession();
  const { sendMessage, addMessageListener } = useWebSocket(documentId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Call onEditorReady when the component mounts
  useEffect(() => {
    onEditorReady();
  }, [onEditorReady]);

  // Handle content changes
  const handleContentChange = useCallback((newContent: string) => {
    // Update word count immediately when content changes
    onContentChange(newContent);
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
        
        // Create a new version after successful save
        await fetch(`/api/documents/${documentId}/versions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newContent }),
        });
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
  }, [documentId, sendMessage, onContentChange]);

  return (
    <div className="flex flex-col h-full">
      <div className="rounded-lg overflow-hidden">
        <ReactQuill
          value={initialContent}
          onChange={handleContentChange}
          modules={modules}
          theme="snow"
          placeholder="Start writing..."
          className="h-[500px] bg-white dark:bg-gray-800"
        />
      </div>
      
      <div className="flex justify-between items-center mt-2 px-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
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