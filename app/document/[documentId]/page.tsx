'use client';

import { useEffect, useState, useCallback } from 'react';
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
import { DocumentOutline } from '@/components/DocumentOutline';
import { DocumentCollaborators } from '@/components/DocumentCollaborators';

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

  const handleRevert = useCallback((content: string) => {
    // Update editor content
    setEditorContent(content);
    
    // Update word count
    setWordCount(calculateWordCount(content));
    
    // Notify other users of changes via WebSocket if needed
    // This assumes you have access to the WebSocket context/hook
  }, [calculateWordCount]);

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

  const handleContentChange = (content: string) => {
    setEditorContent(content);
    setWordCount(calculateWordCount(content));
  };

  const handleEditorReady = () => {
    setIsEditorReady(true);
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

  const documentTabs = [
    {
      id: 'editor',
      label: 'Editor',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      id: 'preview',
      label: 'Preview',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    },
    {
      id: 'comments',
      label: 'Comments',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      )
    }
  ];

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Top Navigation Area */}
        <div className="mb-6">
        <DocumentBreadcrumbs documentId={params.documentId} />
        <DocumentToolbar 
          documentId={params.documentId}
          onShare={() => setShowShareDialog(true)}
          onExport={() => setShowExportDialog(true)}
        />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Document Structure */}
          <div className="hidden lg:block col-span-2 space-y-4">
            <DocumentOutline />
            <DocumentCollaborators documentId={params.documentId} />
          </div>

          {/* Main Editor Area */}
          <div className="col-span-12 lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
              {/* Editor Header */}
              <div className="p-4 border-b dark:border-gray-700">
              <UserPresenceIndicator documentId={params.documentId} />
              <DocumentStats 
                documentId={params.documentId}
                content={editorContent} 
              />
                <DocumentTabs
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  tabs={documentTabs}
                />
              </div>

              {/* Editor Content */}
              <div className="p-4">
                {activeTab === 'editor' && (
              <EditorArea 
                documentId={params.documentId}
                initialContent={document?.content || ''}
                onContentChange={handleContentChange}
                onEditorReady={handleEditorReady}
              />
                )}
                {activeTab === 'preview' && (
                  <DocumentPreview content={editorContent} />
                )}
                {activeTab === 'comments' && (
                  <DocumentComments documentId={params.documentId} />
                )}
              </div>
            </div>
          </div>
          
          {/* Right Sidebar */}
          <div className="hidden lg:block col-span-3 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
            <ChatBox documentId={params.documentId} />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
            <VersionHistory documentId={params.documentId} onRevert={handleRevert} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 pb-safe">
        <MobileNavigation 
          documentId={params.documentId}
          onVersionHistoryClick={() => setShowVersionHistory(true)} 
        />
      </div>

        {/* Mobile Drawers/Modals */}
      {showVersionHistory && (
        <MobileVersionHistory
          documentId={params.documentId}
          onRevert={handleRevert}
          onClose={() => setShowVersionHistory(false)}
        />
      )}
      </div>

      {/* Dialogs */}
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