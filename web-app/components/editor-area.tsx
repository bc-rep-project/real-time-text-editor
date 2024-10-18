
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WebSocket } from "ws";

export default function EditorArea() {
  const [content, setContent] = useState("");
  const router = useRouter();
  const { documentId } = router.query;

  useEffect(() => {
    if (documentId) {
      fetchDocumentContent();
      const ws = new WebSocket(`ws://localhost:3000/ws/documents/${documentId}`);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "documentUpdate") {
          setContent(data.content);
        }
      };
      return () => ws.close();
    }
  }, [documentId]);

  const fetchDocumentContent = async () => {
    const response = await fetch(`/api/documents/${documentId}`);
    const data = await response.json();
    setContent(data.content);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    const ws = new WebSocket(`ws://localhost:3000/ws/documents/${documentId}`);
    ws.send(JSON.stringify({ type: "documentUpdate", content: e.target.value }));
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Document Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          type="text"
          placeholder="Edit document content..."
          value={content}
          onChange={handleContentChange}
          className="w-full h-96"
        />
      </CardContent>
    </Card>
  );
}
