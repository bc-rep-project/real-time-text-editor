'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { UserPresenceIndicator } from '@/components/UserPresenceIndicator';
import { ChatBox } from '@/components/ChatBox';
import { VersionHistory } from '@/components/VersionHistory';
import { EditorArea } from '@/components/EditorArea';
import { Document } from '@/types/database';

interface PageProps {
  params: {
    documentId: string;
  };
}

export default function DocumentPage({ params: { documentId } }: PageProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    // Your existing document fetching logic
  }, [documentId]);

  // Make sure we have a session and user ID
  if (!session?.user?.id) {
    return <div>Please sign in to view this document.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <EditorArea
            documentId={documentId as string}
            initialContent={document?.content || ''}
            onUpdate={(content: string) => setDocument(prev => 
              prev ? {...prev, content} : null
            )}
          />
        </div>
        <div className="space-y-6">
          <UserPresenceIndicator documentId={documentId as string} />
          <ChatBox 
            documentId={documentId as string} 
            userId={session.user.id} 
          />
          <VersionHistory
            documentId={documentId as string}
            onRevert={(content) => setDocument(prev => 
              prev ? {...prev, content} : null
            )}
          />
        </div>
      </div>
    </div>
  );
} 