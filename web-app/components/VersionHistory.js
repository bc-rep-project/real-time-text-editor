import React, { useState, useEffect } from 'react';

const VersionHistory = ({ documentId }) => {
  const [versions, setVersions] = useState([]);

  const fetchVersionHistory = () => {
    // Fetch version history logic here
    setVersions([
      { number: 1, timestamp: '2023-10-22 10:00:00' },
      { number: 2, timestamp: '2023-10-22 11:30:00' },
    ]); // Update this with actual version history
  };

  useEffect(() => {
    fetchVersionHistory();
  }, [documentId]);

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Version History</h3>
      <ul className="list-disc list-inside">
        {versions.map((version, index) => (
          <li key={index}>
            Version {version.number} - {version.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VersionHistory;
