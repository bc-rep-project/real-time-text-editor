
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type User = {
  id: number;
  username: string;
};

export default function UserPresenceIndicator() {
  const router = useRouter();
  const { documentId } = router.query;
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (documentId) {
      // Fetch users currently editing the document from the API
      fetch(`/api/documents/${documentId}/users`)
        .then((response) => response.json())
        .then((data) => setUsers(data));
    }
  }, [documentId]);

  return (
    <div className="flex space-x-2">
      {users.map((user) => (
        <Avatar key={user.id}>
          <AvatarImage src={`https://api.adorable.io/avatars/40/${user.username}.png`} alt={user.username} />
          <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
}
