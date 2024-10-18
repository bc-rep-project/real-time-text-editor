
import { useState, useEffect } from 'react';

const VersionHistory = ({ documentId }) => {
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    fetch(`/api/documents/${documentId}/versions`)
      .then((response) => response.json())
      .then((data) => setVersions(data.versions));
  }, [documentId]);

  const handleRevert = (versionId) => {
    fetch(`/api/documents/${documentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: versions.find(v => v.id === versionId).content }),
    }).then(() => {
      alert('Document reverted to selected version');
    });
  };

  return (
    <div>
      <h3>Version History</h3>
      <ul>
        {versions.map((version) => (
          <li key={version.id}>
            <span>{new Date(version.createdAt).toLocaleString()}</span>
            <button onClick={() => handleRevert(version.id)}>Revert</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VersionHistory;
