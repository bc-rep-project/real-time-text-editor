import React, { useState, useEffect } from 'react';

const UserPresenceIndicator = ({ documentId }) => {
  const [activeUsers, setActiveUsers] = useState([]);

  const setupWebSocket = () => {
    // WebSocket setup logic here
    setActiveUsers(['User1', 'User2']); // Update this with actual active users
  };

  useEffect(() => {
    setupWebSocket();
  }, [documentId]);

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Active Users</h3>
      <ul className="list-disc list-inside">
        {activeUsers.map((user, index) => (
          <li key={index}>{user}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserPresenceIndicator;
