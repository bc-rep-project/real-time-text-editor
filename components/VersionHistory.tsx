'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Version {
  id: number;
  content: string;
  createdAt: string;
  username: string;
}

interface VersionHistoryProps {
  documentId: string;
  onRevert: (content: string) => void;
}

export function VersionHistory({ documentId, onRevert }: VersionHistoryProps) {
  const { data: session } = useSession();
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}/versions`);
        const data = await response.json();
        setVersions(data);
      } catch (error) {
        console.error('Failed to fetch versions:', error);
      }
    };

    fetchVersions();
  }, [documentId]);

  const handleRevert = async (versionId: number) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/versions/revert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId }),
      });

      const data = await response.json();
      onRevert(data.content);
      setIsPreviewOpen(false);
    } catch (error) {
      console.error('Failed to revert version:', error);
    }
  };

  return (
    <div className="border rounded-lg">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Version History</h2>
      </div>

      <div className="divide-y">
        {versions.map((version) => (
          <div key={version.id} className="p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-medium">{version.username}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {new Date(version.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => {
                    setSelectedVersion(version);
                    setIsPreviewOpen(true);
                  }}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  Preview
                </button>
                <button
                  onClick={() => handleRevert(version.id)}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  Revert
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Version Preview Modal */}
      {isPreviewOpen && selectedVersion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-3/4 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Version from {new Date(selectedVersion.createdAt).toLocaleString()}
              </h3>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {selectedVersion.content}
              </pre>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRevert(selectedVersion.id)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Revert to this version
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 