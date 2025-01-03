'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from './LoadingSpinner';

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');
    return function comp({ forwardedRef, ...props }: any) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  { ssr: false, loading: () => <LoadingSpinner /> }
);

interface EditorProps {
  websocket: any;
  documentId: string;
  userId: string;
  username: string;
  onContentChange?: (content: string) => void;
}

export function Editor({ websocket, documentId, userId, username, onContentChange }: EditorProps) {
  const editorRef = useRef<any>(null);
  const { sendMessage, addMessageListener } = useWebSocket(documentId);

  const handleChange = useCallback((content: string) => {
    onContentChange?.(content);
    sendMessage({
      type: 'documentUpdate',
      documentId,
      data: { content, userId, username }
    });
  }, [documentId, userId, username, sendMessage, onContentChange]);

  useEffect(() => {
    const handleIncomingChanges = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === 'documentUpdate' && data.userId !== userId) {
        // Update editor content
        if (editorRef.current) {
          editorRef.current.getEditor().updateContents(data.content);
        }
      }
    };

    const unsubscribe = addMessageListener(handleIncomingChanges);
    return () => unsubscribe();
  }, [addMessageListener, userId]);

  return (
    <div className="h-full p-4">
      <ReactQuill
        forwardedRef={editorRef}
        theme="snow"
        onChange={handleChange}
        modules={{
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            ['clean']
          ]
        }}
      />
    </div>
  );
} 