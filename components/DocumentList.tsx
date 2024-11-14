'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Document {
  id: number;
  title: string;
  updatedAt: string;
}

export function DocumentList() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState<'updatedAt' | 'title'>('updatedAt');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/documents?filter=${filter}&sort=${sort}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
        
        const data = await response.json();
        setDocuments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch documents:', error);
        setError('Failed to load documents');
        setDocuments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [filter, sort]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter documents..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 rounded flex-grow"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'updatedAt' | 'title')}
          className="border p-2 rounded"
        >
          <option value="updatedAt">Last Updated</option>
          <option value="title">Title</option>
        </select>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No documents found
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => router.push(`/document/${doc.id}`)}
              className="border p-4 rounded cursor-pointer hover:bg-gray-50"
            >
              <h2 className="text-xl font-semibold">{doc.title}</h2>
              <p className="text-gray-500">
                Last updated: {new Date(doc.updatedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 