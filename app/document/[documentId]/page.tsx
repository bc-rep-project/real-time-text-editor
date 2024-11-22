'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EditorArea } from '@/components/EditorArea';
import { ChatBox } from '@/components/ChatBox';
import { VersionHistory } from '@/components/VersionHistory';
import { UserPresenceIndicator } from '@/components/UserPresenceIndicator';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import type { Document } from '@/types/database';
import { MobileNavigation } from '@/components/MobileNavigation';
import { MobileVersionHistory } from '@/components/MobileVersionHistory';

export default function DocumentPage({ params }: { params: { documentId: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [document, setDocument] = useState<Document | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [editorContent, setEditorContent] = useState('');
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const calculateWordCount = (content: string) => {
    return content.split(/\s+/).filter(Boolean).length;
  };

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/documents/${params.documentId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch document');
        }
        
        const doc = await response.json();
        setDocument(doc);
        setEditorContent(doc.content);
        setWordCount(calculateWordCount(doc.content));
        setIsEditorReady(true);
      } catch (error) {
        console.error('Error fetching document:', error);
        setError('Failed to load document');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchDocument();
    }
  }, [params.documentId, session?.user?.id]);

  const handleContentUpdate = (newContent: string) => {
    setEditorContent(newContent);
    setWordCount(calculateWordCount(newContent));
    if (document) {
      setDocument(prev => prev ? { ...prev, content: newContent } : null);
    }
  };

  const handleUpdateTitle = async () => {
    if (!newTitle.trim() || isSavingTitle) return;

    try {
      setIsSavingTitle(true);
      const response = await fetch(`/api/documents/${params.documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() })
      });

      if (!response.ok) throw new Error('Failed to update title');

      const updatedDoc = await response.json();
      setDocument(updatedDoc);
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Error updating title:', error);
    } finally {
      setIsSavingTitle(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <ErrorMessage message={error} />
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go back to documents
        </button>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 pb-24 lg:pb-6 pt-4 sm:pt-6">
      <div className="mb-4 sm:mb-6 flex justify-between items-center relative z-20">
        <div className="flex-1 min-w-0">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateTitle();
                  } else if (e.key === 'Escape') {
                    setIsEditingTitle(false);
                  }
                }}
                className="text-xl sm:text-3xl font-bold px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                placeholder="Document title"
                autoFocus
              />
              <button
                onClick={handleUpdateTitle}
                disabled={isSavingTitle || !newTitle.trim()}
                className="p-2 text-blue-500 hover:text-blue-600 disabled:opacity-50"
              >
                {isSavingTitle ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setIsEditingTitle(false)}
                className="p-2 text-gray-500 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="group flex items-center gap-2 overflow-hidden">
              <h1 className="text-xl sm:text-3xl font-bold truncate">{document?.title}</h1>
              <button
                onClick={() => {
                  setNewTitle(document?.title || '');
                  setIsEditingTitle(true);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                aria-label="Edit title"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          )}
          <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
            Last updated: {document && new Date(document.updatedAt).toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="text-gray-600 hover:text-gray-900 ml-2 flex-shrink-0"
          aria-label="Back to documents"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 relative mb-16 lg:mb-0">
        <div className="lg:col-span-8 xl:col-span-9 relative z-10">
          <EditorArea
            documentId={params.documentId}
            initialContent={editorContent}
            onContentChange={handleContentUpdate}
            onEditorReady={() => setIsEditorReady(true)}
          />
          {isEditorReady && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                Words: {wordCount}
              </div>
              <div className="flex lg:hidden">
                <MobileVersionHistory
                  documentId={params.documentId}
                  onRevert={(content) => {
                    setEditorContent(content);
                    setDocument(prev => prev ? {...prev, content} : null);
                    setWordCount(calculateWordCount(content));
                  }}
                />
              </div>
              <button
                onClick={() => setShowVersionHistory(true)}
                className="hidden lg:flex items-center gap-1 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Version History</span>
              </button>
            </div>
          )}
        </div>
        
        <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
          <div className="sticky top-4 space-y-4">
            <UserPresenceIndicator documentId={params.documentId} />
            <ChatBox documentId={params.documentId} />
          </div>
        </div>
      </div>

      {showVersionHistory && (
        <div className="fixed inset-0 z-[60]">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowVersionHistory(false)}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl">
            <VersionHistory
              documentId={params.documentId}
              onRevert={(content) => {
                setEditorContent(content);
                setDocument(prev => prev ? {...prev, content} : null);
                setWordCount(calculateWordCount(content));
                setShowVersionHistory(false);
              }}
            />
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        <MobileNavigation documentId={params.documentId} />
      </div>
    </div>
  );
} 