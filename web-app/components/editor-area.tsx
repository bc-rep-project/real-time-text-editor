
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WebSocket } from "ws";

export default function EditorArea() {
  const [content, setContent] = useState("");
  const router = useRouter();
  const { documentId } = router.query;

  useEffect(() => {
    if (documentId) {
      fetchDocumentContent();
      const ws = new WebSocket(`ws://localhost:3000`);
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "join", documentId }));
      };
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "documentUpdate" && data.documentId === documentId) {
          setContent(data.content);
        }
      };
      return () => {
        ws.close();
      };
    }
  }, [documentId]);

  const fetchDocumentContent = async () => {
    const response = await fetch(`/api/documents/${documentId}`);
    const data = await response.json();
    setContent(data.content);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    const ws = new WebSocket(`ws://localhost:3000`);
    ws.send(JSON.stringify({ type: "documentUpdate", documentId, content: e.target.value }));
  };

  return (
    <div className="border p-4 overflow-y-auto">
      <textarea
        className="w-full h-full"
        value={content}
        onChange={handleContentChange}
      />
    </div>
  );
}
