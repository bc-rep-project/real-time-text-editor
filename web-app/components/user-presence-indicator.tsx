
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WebSocket } from "ws";

export default function UserPresenceIndicator() {
  const [presentUsers, setPresentUsers] = useState([]);
  const router = useRouter();
  const { documentId } = router.query;

  useEffect(() => {
    if (documentId) {
      const ws = new WebSocket(`ws://localhost:3000/ws/presence/${documentId}`);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "userPresence") {
          setPresentUsers(data.users);
        }
      };
      return () => ws.close();
    }
  }, [documentId]);

  return (
    <Card className="w-full max-w-3xl mx-auto mt-4">
      <CardHeader>
        <CardTitle>Users Present</CardTitle>
      </CardHeader>
      <CardContent>
        <ul>
          {presentUsers.map((user) => (
            <li key={user.id} className="mb-2">
              User {user.username} is {user.status}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
