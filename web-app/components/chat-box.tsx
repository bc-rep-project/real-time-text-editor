
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WebSocket } from "ws";

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const router = useRouter();
  const { documentId } = router.query;

  useEffect(() => {
    if (documentId) {
      fetchChatHistory();
      const ws = new WebSocket(`ws://localhost:3000/ws/chat/${documentId}`);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "chatMessage") {
          setMessages((prevMessages) => [...prevMessages, data.message]);
        }
      };
      return () => ws.close();
    }
  }, [documentId]);

  const fetchChatHistory = async () => {
    const response = await fetch(`/api/chat/${documentId}`);
    const data = await response.json();
    setMessages(data.messages);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const response = await fetch(`/api/chat/${documentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: 1, message: newMessage }), // Mock userId for now
    });

    if (response.ok) {
      setNewMessage("");
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto mt-4">
      <CardHeader>
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {messages.map((msg, index) => (
            <div key={index} className="mb-2">
              <strong>User {msg.userId}:</strong> {msg.message}
            </div>
          ))}
        </ScrollArea>
        <div className="flex mt-4">
          <Input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow"
          />
          <Button onClick={handleSendMessage} className="ml-2">
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
