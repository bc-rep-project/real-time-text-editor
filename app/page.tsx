'use client';

import { DocumentList } from '@/components/DocumentList';
import { CreateNewDocumentButton } from '@/components/CreateNewDocumentButton';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect('/login');
  }

  return (
    <main className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Documents</h1>
        <CreateNewDocumentButton />
      </div>
      <DocumentList />
    </main>
  );
} 