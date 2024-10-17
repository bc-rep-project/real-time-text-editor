
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { WebSocket } from "ws";

export default function UserPresenceIndicator() {
  const [presentUsers, setPresentUsers] = useState([]);
  const router = useRouter();
  const { documentId } = router.query;

  useEffect(() => {
    if (documentId) {
      const ws = new WebSocket(`ws://localhost:3000`);
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "join", documentId }));
      };
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "userPresence" && data.documentId === documentId) {
          setPresentUsers(data.users);
        }
      };
      return () => {
        ws.close();
      };
    }
  }, [documentId]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Users Present</h2>
      <ul>
        {presentUsers.map((user, index) => (
          <li key={index} className="mb-2">
            {user}
          </li>
        ))}
      </ul>
    </div>
  );
}
