'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import config from '@/config';
import { CustomWebsocketProvider } from '@/lib/y-websocket-provider';

export interface EditorProps {
  documentId: string;
  initialContent?: string;
  onUpdate?: (content: string) => void;
}

export function EditorArea({ documentId, initialContent = '', onUpdate }: EditorProps) {
  const { data: session } = useSession();
  
  // Create YJS doc and provider
  const ydoc = useMemo(() => new Y.Doc(), []);
  const provider = useMemo(() => new CustomWebsocketProvider(
    config.websocketUrl,
    documentId,
    ydoc
  ), [documentId, ydoc]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: provider as any,
        user: {
          name: session?.user?.name || 'Anonymous',
          color: '#' + Math.floor(Math.random()*16777215).toString(16),
        },
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      onUpdate?.(content);
    },
  });

  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  // Cleanup
  useEffect(() => {
    return () => {
      provider.destroy();
      ydoc.destroy();
    };
  }, [provider, ydoc]);

  return (
    <div className="editor-container">
      <EditorContent editor={editor} />
    </div>
  );
} 