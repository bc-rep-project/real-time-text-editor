
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
        body: JSON.stringify({ message: newMessage, userId: 1 }),  // Assuming userId is 1 for testing
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to send message");
        }
        return response.json();
      })
      .then((data) => {
        setMessages((prevMessages) => [...prevMessages, data]);
        setNewMessage("");
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="h-64 overflow-y-auto card">
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
        <Button onClick={handleSendMessage} className="button-primary">
          Send
        </Button>
      </div>
    </div>
  );
}
