import React, { useState, useEffect } from 'react';

const VersionHistory = ({ documentId }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}/versions`);
        if (!response.ok) {
          throw new Error('Failed to fetch version history');
        }
        const data = await response.json();
        setVersions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [documentId]);

  if (loading) {
    return <div className="text-center">Loading version history...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Version History</h3>
      <ul className="space-y-2">
        {versions.map((version) => (
          <li key={version.id} className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {new Date(version.timestamp).toLocaleString()}
              </span>
              <button
                onClick={() => {/* Implement restore functionality */}}
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                Restore
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VersionHistory;
