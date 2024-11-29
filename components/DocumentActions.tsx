'use client';

import { useState } from 'react';

interface DocumentActionsProps {
  documentId: string;
  onShare: () => void;
  onExport: () => void;
  onDelete: () => void;
}

export function DocumentActions({ documentId, onShare, onExport, onDelete }: DocumentActionsProps) {
  const handleShare = async () => {
    try {
      // Get document details for sharing
      const response = await fetch(`/api/documents/${documentId}`);
      if (!response.ok) throw new Error('Failed to fetch document');
      const document = await response.json();
      
      // Create a shareable link
      const shareUrl = `${window.location.origin}/document/${documentId}`;
      
      // Try to use the native share API if available
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          text: 'Check out this document',
          url: shareUrl
        });
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(shareUrl);
        // You might want to show a toast notification here
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing document:', error);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/export`);
      if (!response.ok) throw new Error('Failed to export document');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document-${documentId}.md`; // You can customize the filename
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting document:', error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleShare}
        className="p-2 text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
        title="Share Document"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>
      <button
        onClick={handleExport}
        className="p-2 text-gray-600 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400"
        title="Export Document"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>
      <button
        onClick={onDelete}
        className="p-2 text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
        title="Delete Document"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
} 