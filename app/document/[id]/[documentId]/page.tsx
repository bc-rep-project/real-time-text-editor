'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Editor } from '@/components/Editor';
import { DocumentBreadcrumbs } from '@/components/DocumentBreadcrumbs';
import { DocumentToolbar } from '@/components/DocumentToolbar';
import { DocumentCollaborators } from '@/components/DocumentCollaborators';
import { DocumentComments } from '@/components/DocumentComments';
import { DocumentHistory } from '@/components/DocumentHistory';
import { DocumentStats } from '@/components/DocumentStats';
import { DocumentSearch } from '@/components/DocumentSearch';
import { AutoSaveStatus } from '@/components/AutoSaveStatus';
import { UserPresenceIndicator } from '@/components/UserPresenceIndicator';
import { ChatBox } from '@/components/ChatBox';
import { MobileNavigation } from '@/components/MobileNavigation';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAuth } from '@/hooks/useAuth';

export default function DocumentPage() {
  const params = useParams();
  const documentId = params?.documentId as string;
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [content, setContent] = useState('');
  
  const websocket = useWebSocket(documentId);

  if (!user) {
    return <div>Please sign in to access this document.</div>;
  }

  const handleRestore = (restoredContent: string) => {
    setContent(restoredContent);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="lg:hidden">
        <MobileNavigation 
          documentId={documentId}
          onVersionHistoryClick={() => setShowHistory(!showHistory)}
        />
      </div>
      
      <div className="flex items-center justify-between px-4 py-2 border-b dark:border-gray-800">
        <DocumentBreadcrumbs documentId={documentId} />
        <div className="flex items-center gap-4">
          <AutoSaveStatus />
          <DocumentStats 
            documentId={documentId}
            content={content}
          />
          <DocumentToolbar 
            onToggleComments={() => setShowComments(!showComments)}
            onToggleHistory={() => setShowHistory(!showHistory)}
            onToggleChat={() => setShowChat(!showChat)}
          />
        </div>
      </div>
      
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <Editor 
              websocket={websocket}
              documentId={documentId}
              userId={user.id}
              username={user.name || user.email || 'Anonymous'}
              onContentChange={setContent}
            />
          </div>
        </div>

        <div className="w-64 border-l dark:border-gray-800 flex flex-col">
          <UserPresenceIndicator documentId={documentId} />
          <DocumentCollaborators documentId={documentId} />
          
          {showComments && (
            <DocumentComments documentId={documentId} />
          )}
          
          {showHistory && (
            <DocumentHistory 
              documentId={documentId}
              onRestore={handleRestore}
            />
          )}
          
          {showChat && (
            <ChatBox documentId={documentId} />
          )}
        </div>
      </div>
    </div>
  );
} 