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
import { DocumentBreadcrumbs } from '@/components/DocumentBreadcrumbs';
import { DocumentToolbar } from '@/components/DocumentToolbar';
import { DocumentTabs } from '@/components/DocumentTabs';
import { DocumentPreview } from '@/components/DocumentPreview';
import { DocumentStats } from '@/components/DocumentStats';
import { DocumentComments } from '@/components/DocumentComments';
import { ShareDialog } from '@/components/ShareDialog';
import { ExportDialog } from '@/components/ExportDialog';

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
  const [activeTab, setActiveTab] = useState('editor');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const calculateWordCount = (content: string) => {
    if (typeof window === 'undefined' || !content || content === '<p><br></p>' || content === '<p></p>') {
      return 0;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const textContent = doc.body.textContent || '';
      
      const words = textContent
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .trim()
        .split(' ')
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
    <div className="container mx-auto pb-24 lg:pb-6 pt-4 sm:pt-6">
      <DocumentBreadcrumbs
        items={[
          { label: 'Documents', href: '/' },
          { label: document?.title || 'Loading...' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <div className="lg:col-span-9">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700">
            <DocumentToolbar />
            <DocumentTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            
            {activeTab === 'editor' ? (
              <EditorArea
                documentId={params.documentId}
                initialContent={editorContent}
                onContentChange={handleContentUpdate}
                onEditorReady={() => setIsEditorReady(true)}
              />
            ) : (
              <DocumentPreview content={editorContent} />
            )}
            
            <DocumentStats
              documentId={params.documentId}
              content={editorContent}
            />
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <UserPresenceIndicator documentId={params.documentId} />
          <DocumentComments documentId={params.documentId} />
          <ChatBox documentId={params.documentId} />
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden pb-safe">
        <MobileNavigation documentId={params.documentId} />
      </div>

      {/* Modals */}
      {showShareDialog && (
        <ShareDialog
          documentId={params.documentId}
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
        />
      )}
      
      {showExportDialog && (
        <ExportDialog
          documentId={params.documentId}
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
        />
      )}
    </div>
  );
} 