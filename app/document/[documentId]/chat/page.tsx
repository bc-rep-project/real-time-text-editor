'use client';

import { useRouter } from 'next/navigation';
import { ChatBox } from '@/components/ChatBox';
import { MobileNavigation } from '@/components/MobileNavigation';
import { UserPresenceIndicator } from '@/components/UserPresenceIndicator';

export default function ChatPage({ params }: { params: { documentId: string } }) {
  return (
    <div className="container mx-auto p-4 sm:p-6 pb-24 lg:pb-6 min-h-screen flex flex-col">
      <div className="flex-1 space-y-4">
        <UserPresenceIndicator documentId={params.documentId} />
        <ChatBox documentId={params.documentId} />
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-40 pb-safe">
        <MobileNavigation documentId={params.documentId} />
      </div>
    </div>
  );
} 