'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import debounce from 'lodash/debounce';

interface Document {
  id: string;
  title: string;
  updatedAt: Date;
  userId: string;
}

export function DocumentList() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'title'>('updatedAt');

  const fetchDocuments = async (search: string, sort: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        `/api/documents?search=${encodeURIComponent(search)}&sort=${sort}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search function
  const debouncedFetch = useCallback(
    debounce((search: string, sort: string) => {
      fetchDocuments(search, sort);
    }, 300),
    []
  );

  // Update search results when search term or sort changes
  useEffect(() => {
    debouncedFetch(searchTerm, sortBy);
    return () => {
      debouncedFetch.cancel();
    };
  }, [searchTerm, sortBy, debouncedFetch]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            aria-label="Search documents"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex-shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'updatedAt' | 'title')}
            className="w-full h-10 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm appearance-none cursor-pointer"
          >
            <option value="updatedAt">Last Updated</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? `No documents found for "${searchTerm}"` : 'No documents found'}
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => router.push(`/document/${doc.id}`)}
              className="w-full p-4 bg-white rounded-lg shadow-sm border hover:border-blue-500 transition-colors duration-200 text-left"
            >
              <h3 className="font-medium text-gray-900">{doc.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {new Date(doc.updatedAt).toLocaleString()}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 