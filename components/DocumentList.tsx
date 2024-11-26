'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import debounce from 'lodash/debounce';
import { Dialog } from './Dialog';
import type { Document } from '@/types/database';
import { CreateNewDocumentButton } from './CreateNewDocumentButton';
import { DocumentSearch } from './DocumentSearch';
import { DocumentActions } from './DocumentActions';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

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
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);

  const fetchDocuments = async (search: string, sort: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const searchParam = encodeURIComponent(search.trim());
      const response = await fetch(`/api/documents?sort=${sort}`);

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      setDocuments(data);
      setFilteredDocs(data); // Initialize filtered docs with all docs
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

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    if (!query.trim()) {
      setFilteredDocs(documents);
      return;
    }
    
    const filtered = documents.filter(doc => 
      doc.title.toLowerCase().includes(query.toLowerCase()) ||
      doc.content.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredDocs(filtered);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Documents</h1>
        <CreateNewDocumentButton onSuccess={() => fetchDocuments(searchTerm, sortBy)} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <DocumentSearch content={searchTerm} onSearch={handleSearch} />
        <div className="flex-shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'updatedAt' | 'title')}
            className="w-full h-10 px-4 py-2 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm appearance-none cursor-pointer"
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
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {searchTerm ? `No documents found for "${searchTerm}"` : 'No documents found'}
        </div>
      ) : (
      <div className="grid gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm 
            border dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-200"
          >
            <button
              onClick={() => router.push(`/document/${doc.id}`)}
              className="flex-1 text-left"
            >
              <h3 className="font-medium text-gray-900 dark:text-white">
                {doc.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Last updated: {new Date(doc.updatedAt).toLocaleString()}
              </p>
            </button>
            
            <DocumentActions
              documentId={doc.id}
              onShare={() => {/* Handle share */}}
              onExport={() => {/* Handle export */}}
              onDelete={() => setShowDeleteDialog(doc.id)}
            />
          </div>
        ))}
      </div>
      )}

      <Dialog
        isOpen={!!showDeleteDialog}
        onClose={() => setShowDeleteDialog(null)}
        title="Delete Document"
      >
        <DeleteConfirmationDialog
          onConfirm={async () => {
            if (showDeleteDialog) {
              await deleteDocument(showDeleteDialog);
            }
          }}
          onCancel={() => setShowDeleteDialog(null)}
        />
      </Dialog>
    </div>
  );
} 