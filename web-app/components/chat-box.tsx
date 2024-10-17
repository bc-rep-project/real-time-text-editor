
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WebSocket } from "ws";

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const router = useRouter();
  const { documentId } = router.query;

  useEffect(() => {
    if (documentId) {
      fetchChatHistory();
      const ws = new WebSocket(`ws://localhost:3000`);
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "join", documentId }));
      };
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "chatMessage" && data.documentId === documentId) {
          setMessages((prevMessages) => [...prevMessages, data.message]);
        }
      };
      return () => {
        ws.close();
      };
    }
  }, [documentId]);

  const fetchChatHistory = async () => {
    const response = await fetch(`/api/chat/${documentId}`);
    const data = await response.json();
    setMessages(data.messages);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    const response = await fetch(`/api/chat/${documentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: newMessage }),
    });

    if (response.ok) {
      const data = await response.json();
      const ws = new WebSocket(`ws://localhost:3000`);
      ws.send(JSON.stringify({ type: "chatMessage", documentId, message: data.message }));
      setNewMessage("");
    }
  };

  return (
    <div className="border p-4 overflow-y-auto">
      <div className="mb-4">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            {msg}
          </div>
        ))}
      </div>
      <div className="flex">
        <Input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button onClick={handleSendMessage}>Send</Button>
      </div>
    </div>
  );
}
