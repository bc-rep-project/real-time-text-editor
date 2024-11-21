'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import debounce from 'lodash/debounce';
import { Dialog } from './Dialog';
import type { Document } from '@/types/database';
import { CreateNewDocumentButton } from './CreateNewDocumentButton';

export function DocumentList() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'title'>('updatedAt');
  const [isCreating, setIsCreating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [newDocTitle, setNewDocTitle] = useState('');

  const fetchDocuments = async (search: string, sort: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const searchParam = encodeURIComponent(search.trim());
      const response = await fetch(
        `/api/documents?search=${searchParam}&sort=${sort}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      
      const filteredDocs = search.trim()
        ? data.filter((doc: Document) =>
            doc.title.toLowerCase().includes(search.toLowerCase())
          )
        : data;

      setDocuments(filteredDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetch = useCallback(
    debounce((search: string, sort: string) => {
      fetchDocuments(search, sort);
    }, 200),
    []
  );

  useEffect(() => {
    debouncedFetch(searchTerm, sortBy);
    return () => {
      debouncedFetch.cancel();
    };
  }, [searchTerm, sortBy, debouncedFetch]);

  const deleteDocument = async (documentId: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete document');
      
      fetchDocuments(searchTerm, sortBy);
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Failed to delete document');
    } finally {
      setShowDeleteDialog(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Documents</h1>
        <CreateNewDocumentButton onSuccess={() => fetchDocuments(searchTerm, sortBy)} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setSearchTerm(value);
              if (!value.trim()) {
                fetchDocuments('', sortBy);
              }
            }}
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
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border hover:border-blue-500 transition-colors duration-200"
            >
              <button
                onClick={() => router.push(`/document/${doc.id}`)}
                className="flex-1 text-left"
              >
                <h3 className="font-medium text-gray-900">{doc.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {new Date(doc.updatedAt).toLocaleString()}
                </p>
              </button>
              
              <button
                onClick={() => setShowDeleteDialog(doc.id)}
                className="ml-4 p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                aria-label="Delete document"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog
        isOpen={!!showDeleteDialog}
        onClose={() => setShowDeleteDialog(null)}
        title="Delete Document"
      >
        <p className="text-gray-600">
          Are you sure you want to delete this document? This action cannot be undone.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => setShowDeleteDialog(null)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => showDeleteDialog && deleteDocument(showDeleteDialog)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </Dialog>
    </div>
  );
} 