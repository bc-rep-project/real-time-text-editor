'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { EditorArea } from '@/components/EditorArea';
import { ChatBox } from '@/components/ChatBox';
import { UserPresenceIndicator } from '@/components/UserPresenceIndicator';
import { VersionHistory } from '@/components/VersionHistory';

interface Document {
  id: number;
  title: string;
  content: string;
  updatedAt: string;
}

export default function DocumentPage() {
  const { documentId } = useParams();
  const { data: session, status } = useSession();
  const [document, setDocument] = useState<Document | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch document');
        }
        const data = await response.json();
        setDocument(data);
      } catch (error) {
        console.error('Error fetching document:', error);
        setError('Failed to load document');
      }
    };

    if (documentId) {
      fetchDocument();
    }
  }, [documentId]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-8">
        Please sign in to view this document
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-8">
        Loading document...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{document.title}</h1>
        <p className="text-gray-500">
          Last updated: {new Date(document.updatedAt).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <EditorArea
            documentId={documentId as string}
            initialContent={document.content}
          />
        </div>
        
        <div className="space-y-6">
          <UserPresenceIndicator documentId={documentId as string} />
          <ChatBox documentId={documentId as string} />
          <VersionHistory 
            documentId={documentId as string}
            onRevert={(content) => setDocument(prev => prev ? {...prev, content} : null)}
          />
        </div>
      </div>
    </div>
  );
} 