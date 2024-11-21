'use client';

import { DocumentList } from '@/components/DocumentList';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CreateNewDocumentButton } from '@/components/CreateNewDocumentButton';

export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
          <CreateNewDocumentButton />
        </div>
        <DocumentList />
      </div>
    </ProtectedRoute>
  );
} 