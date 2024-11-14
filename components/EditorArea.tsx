'use client';

import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useDebounce } from '@/hooks/useDebounce';
import { useSession } from 'next-auth/react';

interface EditorProps {
  documentId: string;
  initialContent: string;
}

export function EditorArea({ documentId, initialContent }: EditorProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState(initialContent);
  const debouncedContent = useDebounce(content, 1000);
  const { sendMessage } = useWebSocket(documentId);
  const [isSaving, setIsSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      sendMessage({
        type: 'documentUpdate',
        documentId,
        data: { content: html }
      });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });

  // Handle incoming WebSocket messages
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080?documentId=${documentId}`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'documentUpdate' && message.data.content !== content) {
        editor?.commands.setContent(message.data.content);
      }
    };

    return () => ws.close();
  }, [documentId, editor, content]);

  // Save to database
  useEffect(() => {
    const saveContent = async () => {
      if (debouncedContent !== initialContent) {
        setIsSaving(true);
        try {
          await fetch(`/api/documents/${documentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: debouncedContent }),
          });
        } catch (error) {
          console.error('Failed to save document:', error);
        } finally {
          setIsSaving(false);
        }
      }
    };

    saveContent();
  }, [debouncedContent, documentId, initialContent]);

  return (
    <div className="border rounded-lg bg-white">
      <div className="border-b p-2 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`p-2 rounded ${editor?.isActive('bold') ? 'bg-gray-200' : ''}`}
            title="Bold"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12.6 10.9c.9-.7 1.4-1.7 1.4-2.9 0-2.3-1.9-4-4.4-4H4v14h6.3c2.7 0 4.7-1.7 4.7-4.1 0-1.5-.7-2.5-2.4-3zm-4.1-4.3h2.3c1.2 0 1.9.6 1.9 1.6s-.7 1.6-1.9 1.6H8.5V6.6zm2.6 10.8H8.5v-3.4h2.6c1.4 0 2.2.7 2.2 1.7s-.8 1.7-2.2 1.7z"/>
            </svg>
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`p-2 rounded ${editor?.isActive('italic') ? 'bg-gray-200' : ''}`}
            title="Italic"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M14.5 4h-9L5 5.5h3.5L7 14.5H3.5L3 16h9l.5-1.5H9l1.5-9h3.5l.5-1.5z"/>
            </svg>
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded ${editor?.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded ${editor?.isActive('bulletList') ? 'bg-gray-200' : ''}`}
            title="Bullet List"
          >
            •
          </button>
        </div>
        <div className="text-sm text-gray-500">
          {isSaving ? 'Saving...' : 'Saved'}
        </div>
      </div>
      <EditorContent 
        editor={editor} 
        className="min-h-[500px] p-4"
      />
    </div>
  );
} 