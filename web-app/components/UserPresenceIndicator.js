
import React, { useState, useEffect } from 'react';

const UserPresenceIndicator = ({ documentId }) => {
  const [presentUsers, setPresentUsers] = useState([]);

  useEffect(() => {
    if (documentId) {
      setupWebSocket();
    }
  }, [documentId]);

  const setupWebSocket = () => {
    if (!window.socket) {
      window.socket = new WebSocket('ws://localhost:3000');
    }

    window.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'userPresence' && data.documentId === documentId) {
        setPresentUsers(data.users);
      }
    };
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold mb-2">Currently Editing:</h3>
      <ul className="list-disc pl-5">
        {presentUsers.map((user, index) => (
          <li key={index} className="text-sm text-gray-600">
            {user}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserPresenceIndicator;
