'use client';

import { useState } from 'react';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'editor' | 'viewer';
  avatar?: string;
}

export function CollaboratorsList({ documentId }: { documentId: string }) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="font-medium mb-4">Collaborators</h3>
      {/* List collaborators with roles and actions */}
    </div>
  );
} 