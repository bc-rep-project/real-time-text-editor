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
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState('');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });

  const [activeTab, setActiveTab] = useState('editor');

  useEffect(() => {
    // Add cleanup function
    return () => {
        setIsLoading(false);
      setShowVersionHistory(false);
      setShowShareDialog(false);
      setShowExportDialog(false);
    };
  }, []);

  const handleRevert = useCallback((content: string) => {
    // Handle revert logic
    setShowVersionHistory(false);
  }, []);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  const handleEditorReady = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  if (!session) {
    return null; // Let the session handler redirect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container mx-auto px-4 py-4 max-w-7xl">
        {/* Header Section */}
        <div className="mb-6">
          <DocumentBreadcrumbs documentId={params.documentId} />
          <DocumentToolbar
            onShareClick={() => setShowShareDialog(true)}
            onExportClick={() => setShowExportDialog(true)}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Left Sidebar - Document Outline */}
          <div className="hidden xl:block col-span-2">
            <DocumentOutline />
          </div>

          {/* Main Editor Area */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-7 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
              <DocumentTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
                tabs={[
                  { id: 'editor', label: 'Editor' },
                  { id: 'preview', label: 'Preview' },
                  { id: 'comments', label: 'Comments' }
                ]}
              />
              <div className="p-4">
                {activeTab === 'editor' && (
                  <EditorArea
                    documentId={params.documentId}
                    readOnly={false}
                    onContentChange={handleContentChange}
                    onEditorReady={handleEditorReady}
                  />
                )}
                {activeTab === 'preview' && (
                  <DocumentPreview content={content} />
                )}
                {activeTab === 'comments' && (
                  <DocumentComments documentId={params.documentId} />
                )}
              </div>
            </div>
            <DocumentStats 
              documentId={params.documentId}
              content={content}
            />
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block col-span-4 xl:col-span-3 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
              <ChatBox documentId={params.documentId} />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
              <VersionHistory 
                documentId={params.documentId} 
                onRevert={handleRevert} 
              />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
              <DocumentCollaborators documentId={params.documentId} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Keep existing code */}
      <div className="lg:hidden">
        <MobileNavigation 
          documentId={params.documentId}
          onVersionHistoryClick={() => setShowVersionHistory(true)} 
        />
      </div>

      {/* Dialogs - Keep existing code */}
      {showVersionHistory && (
        <MobileVersionHistory
          documentId={params.documentId}
          onRevert={handleRevert}
          onClose={() => setShowVersionHistory(false)}
        />
      )}

      {showShareDialog && (
        <ShareDialog
          documentId={params.documentId}
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </div>
  );
} 