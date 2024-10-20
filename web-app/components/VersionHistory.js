
import React, { useState, useEffect } from 'react';

const VersionHistory = ({ documentId }) => {
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    if (documentId) {
      fetchVersionHistory();
    }
  }, [documentId]);

  const fetchVersionHistory = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/versions`);
      if (!response.ok) {
        throw new Error('Failed to fetch version history');
      }
      const data = await response.json();
      setVersions(data);
    } catch (error) {
      console.error('Error fetching version history:', error);
    }
  };

  const handleRevertToVersion = async (versionId) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/versions/${versionId}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to revert to version');
      }
      // Refresh the document content after reverting
      // You might want to implement a callback to the parent component to refresh the editor
      alert('Document reverted to selected version');
    } catch (error) {
      console.error('Error reverting to version:', error);
    }
  };

  return (
    <div className="border border-gray-300 p-4">
      <h3 className="text-lg font-bold mb-4">Version History</h3>
      <ul className="space-y-2">
        {versions.map((version) => (
          <li key={version.id} className="flex justify-between items-center">
            <span>
              {new Date(version.createdAt).toLocaleString()} - User {version.userId}
            </span>
            <button
              onClick={() => handleRevertToVersion(version.id)}
              className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
            >
              Revert
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VersionHistory;
