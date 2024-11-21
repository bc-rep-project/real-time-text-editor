'use client';

import { useRouter } from 'next/navigation';
import { ChatBox } from '@/components/ChatBox';
import { MobileNavigation } from '@/components/MobileNavigation';
import { UserPresenceIndicator } from '@/components/UserPresenceIndicator';

export default function ChatPage({ params }: { params: { documentId: string } }) {
  return (
    <div className="container mx-auto p-6 pb-20 lg:pb-6 relative z-0">
      <div className="space-y-6">
        <UserPresenceIndicator documentId={params.documentId} />
        <ChatBox documentId={params.documentId} />
      </div>
      <MobileNavigation documentId={params.documentId} />
    </div>
  );
} 