'use client';

import { DocumentList } from '@/components/DocumentList';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6">
        <DocumentList />
      </div>
    </ProtectedRoute>
  );
} 