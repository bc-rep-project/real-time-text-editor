import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface TemporaryLink {
  id: string;
  url: string;
  role: 'viewer' | 'commenter' | 'editor';
  expiresAt: Date;
  createdBy: string;
  createdAt: Date;
  usageCount: number;
  maxUses?: number;
}

interface TemporaryAccessLinkProps {
  documentId: string;
  onClose: () => void;
}

export function TemporaryAccessLink({
  documentId,
  onClose,
}: TemporaryAccessLinkProps) {
  const [links, setLinks] = useState<TemporaryLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<TemporaryLink['role']>('viewer');
  const [expirationDate, setExpirationDate] = useState('');
  const [maxUses, setMaxUses] = useState<number | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch existing temporary links
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/documents/${documentId}/temporary-links`);
        if (!response.ok) throw new Error('Failed to fetch temporary links');
        const data = await response.json();
        setLinks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch links');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinks();
  }, [documentId]);

  const handleGenerateLink = async () => {
    if (!expirationDate || isGenerating) return;

    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch(`/api/documents/${documentId}/temporary-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          expiresAt: new Date(expirationDate).toISOString(),
          maxUses,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate link');

      const newLink = await response.json();
      setLinks(prev => [...prev, newLink]);
      setExpirationDate('');
      setMaxUses(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate link');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevokeLink = async (linkId: string) => {
    try {
      const response = await fetch(
        `/api/documents/${documentId}/temporary-links/${linkId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to revoke link');

      setLinks(prev => prev.filter(link => link.id !== linkId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke link');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Temporary Access Links
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded">
              {error}
            </div>
          )}

          {/* Generate new link form */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
              Generate New Link
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as TemporaryLink['role'])}
                    className="w-full px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-800"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="commenter">Commenter</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expires
                  </label>
                  <input
                    type="datetime-local"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Uses (Optional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxUses || ''}
                  onChange={(e) => setMaxUses(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-800"
                  placeholder="Unlimited"
                />
              </div>
              <button
                onClick={handleGenerateLink}
                disabled={!expirationDate || isGenerating}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Generate Link'}
              </button>
            </div>
          </div>

          {/* Active links */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
              Active Links
            </h3>
            {isLoading ? (
              <div className="text-center py-4">Loading...</div>
            ) : (
              <div className="space-y-4">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {link.role.charAt(0).toUpperCase() + link.role.slice(1)} Access
                      </span>
                      <button
                        onClick={() => handleRevokeLink(link.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Revoke
                      </button>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <span>Link:</span>
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded">
                          {link.url}
                        </code>
                        <button
                          onClick={() => copyToClipboard(link.url)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          Copy
                        </button>
                      </div>
                      <div>
                        Expires: {format(new Date(link.expiresAt), 'PPpp')}
                      </div>
                      <div>
                        Created by: {link.createdBy} on{' '}
                        {format(new Date(link.createdAt), 'PPpp')}
                      </div>
                      <div>
                        Uses: {link.usageCount}
                        {link.maxUses ? ` / ${link.maxUses}` : ' (unlimited)'}
                      </div>
                    </div>
                  </div>
                ))}
                {links.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No active temporary links
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 