'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

interface EditorProps {
  documentId: string;
  initialContent: string;
}

export function EditorArea({ documentId, initialContent }: EditorProps) {
  const { data: session } = useSession();
  const { sendMessage, addMessageListener } = useWebSocket(documentId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false // Disable history as we'll handle versions through our backend
      })
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      handleContentChange(content);
    },
  });

  const handleContentChange = useCallback((content: string) => {
    // Send update to other users immediately
    sendMessage({
      type: 'documentUpdate',
      documentId,
      data: { content }
    });

    // Save to database with debounce
    saveContentWithDelay(content);
  }, [documentId, sendMessage]);

  const saveContent = async (content: string) => {
    try {
      setIsSaving(true);
      setError(null);
      
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to save document');
      }
    } catch (error) {
      console.error('Failed to save document:', error);
      setError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const saveContentWithDelay = useCallback((content: string) => {
    const timeoutId = setTimeout(() => {
      saveContent(content);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  // Handle incoming updates from other users
  useEffect(() => {
    if (!editor) return;

    const cleanup = addMessageListener((event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'documentUpdate' && message.data.content) {
          // Store current cursor position
          const currentPos = editor.state.selection.$head.pos;
          
          // Update content
          editor.commands.setContent(message.data.content, false);
          
          // Restore cursor position
          editor.commands.setTextSelection(currentPos);
        }
      } catch (error) {
        console.error('Error handling editor update:', error);
      }
    });

    return cleanup;
  }, [editor, addMessageListener]);

  // Initialize editor content
  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  if (!editor) {
    return (
      <div className="border rounded-lg bg-white p-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white">
      <div className="border-b p-2 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
            title="Bold"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12.6 10.9c.9-.7 1.4-1.7 1.4-2.9 0-2.3-1.9-4-4.4-4H4v14h6.3c2.7 0 4.7-1.7 4.7-4.1 0-1.5-.7-2.5-2.4-3zm-4.1-4.3h2.3c1.2 0 1.9.6 1.9 1.6s-.7 1.6-1.9 1.6H8.5V6.6zm2.6 10.8H8.5v-3.4h2.6c1.4 0 2.2.7 2.2 1.7s-.8 1.7-2.2 1.7z"/>
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
            title="Italic"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M14.5 4h-9L5 5.5h3.5L7 14.5H3.5L3 16h9l.5-1.5H9l1.5-9h3.5l.5-1.5z"/>
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
            title="Heading 1"
          >
            H1
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {isSaving && (
            <div className="flex items-center gap-1">
              <LoadingSpinner size="small" />
              Saving...
            </div>
          )}
          {error && <ErrorMessage message={error} />}
        </div>
      </div>
      <EditorContent editor={editor} className="prose max-w-none p-4" />
    </div>
  );
} 