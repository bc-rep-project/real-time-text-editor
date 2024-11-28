'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatBox } from '@/components/ChatBox';
import { MobileNavigation } from '@/components/MobileNavigation';
import { UserPresenceIndicator } from '@/components/UserPresenceIndicator';
import { MobileVersionHistory } from '@/components/MobileVersionHistory';

export default function ChatPage({ params }: { params: { documentId: string } }) {
  const router = useRouter();
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const handleRevert = (content: string) => {
    // Since this is the chat page, we might want to redirect to the document page
    // when reverting to a previous version
    router.push(`/document/${params.documentId}`);
  };

  return (
    <div className="container mx-auto pb-24 lg:pb-6 pt-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <UserPresenceIndicator documentId={params.documentId} />
        <ChatBox documentId={params.documentId} />
      </div>

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 pb-safe">
        <MobileNavigation 
          documentId={params.documentId}
          onVersionHistoryClick={() => setShowVersionHistory(true)}
        />
      </div>

      {/* Mobile Version History Drawer */}
      {showVersionHistory && (
        <MobileVersionHistory
          documentId={params.documentId}
          onRevert={handleRevert}
          onClose={() => setShowVersionHistory(false)}
        />
      )}
    </div>
  );
} 