
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ChatMessage = {
  id: number;
  userId: number;
  message: string;
  timestamp: string;
};

export default function ChatBox() {
  const router = useRouter();
  const { documentId } = router.query;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (documentId) {
      // Fetch chat messages from the API
      fetch(`/api/chat/${documentId}`)
        .then((response) => response.json())
        .then((data) => setMessages(data));
    }
  }, [documentId]);

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      fetch(`/api/chat/${documentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: newMessage }),
      })
        .then((response) => response.json())
        .then((data) => {
          setMessages((prevMessages) => [...prevMessages, data]);
          setNewMessage("");
        });
    }
  };

  return (
    <div className="space-y-4">
      <div className="h-64 overflow-y-auto bg-gray-100 p-4 rounded-lg">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <p className="font-semibold">
              <strong>User {msg.userId}:</strong> {msg.message}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(msg.timestamp).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSendMessage} className="bg-blue-500 text-white">
          Send
        </Button>
      </div>
    </div>
  );
}
