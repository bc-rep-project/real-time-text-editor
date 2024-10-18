
"use client";
import { useState, useEffect } from 'react';
import { WebSocket } from 'ws';

const UserPresenceIndicator = ({ documentId }) => {
  const [presentUsers, setPresentUsers] = useState([]);
  const ws = new WebSocket('ws://localhost:8080');

  useEffect(() => {
    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({ event: 'userPresence', documentId, status: 'join' }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === 'userPresence' && data.documentId === documentId) {
        setPresentUsers((prevUsers) => {
          if (data.status === 'join') {
            return [...prevUsers, data.userId];
          } else {
            return prevUsers.filter((userId) => userId !== data.userId);
          }
        });
      }
    };

    return () => {
      ws.send(JSON.stringify({ event: 'userPresence', documentId, status: 'leave' }));
      ws.close();
    };
  }, [documentId]);

  return (
    <div>
      <h3>Present Users</h3>
      <ul>
        {presentUsers.map((userId, index) => (
          <li key={index}>{userId}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserPresenceIndicator;
