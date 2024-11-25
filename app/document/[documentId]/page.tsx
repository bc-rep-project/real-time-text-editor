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
  const [theme, setTheme] = useState('light');

  const calculateWordCount = (content: string) => {
    if (typeof window === 'undefined' || !content || content === '<p><br></p>' || content === '<p></p>') {
      return 0;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const textContent = doc.body.textContent || '';
      
      const words = textContent
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0);
      
      return words.length;
    } catch (error) {
      console.error('Error calculating word count:', error);
      return 0;
    }
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

  const handleSave = async () => {
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

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
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
    <div className="desktop-layout">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 
            rounded-lg transition-colors"
            title="Back to Documents"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {document?.title || 'Loading...'}
        </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last edited {document && new Date(document.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowVersionHistory(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 
            hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>History</span>
          </button>
          
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 
            dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            <span>Save</span>
          </button>
        </div>
      </div>

      <div className="content-container">
        <div className="editor-container">
          <EditorArea
            documentId={params.documentId}
            initialContent={editorContent}
            onContentChange={handleContentUpdate}
            onEditorReady={() => setIsEditorReady(true)}
          />
          {isEditorReady && (
            <div className="flex justify-between items-center p-3 border-t dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Words: {wordCount}
              </div>
            </div>
          )}
        </div>
        
        <div className="sidebar-container">
            <UserPresenceIndicator documentId={params.documentId} />
            <ChatBox documentId={params.documentId} />
        </div>
      </div>

      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        className="theme-toggle"
        title="Toggle theme"
      >
        {theme === 'dark' ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
    </div>
  );
} 