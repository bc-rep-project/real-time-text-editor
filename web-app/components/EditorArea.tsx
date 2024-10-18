
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { WebSocket } from 'ws';

const EditorArea = ({ documentId }) => {
  const [content, setContent] = useState('');
  const router = useRouter();
  const ws = new WebSocket('ws://localhost:8080');

  useEffect(() => {
    fetch(`/api/documents/${documentId}`)
      .then((response) => response.json())
      .then((data) => setContent(data.document.content));

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === 'documentUpdate' && data.documentId === documentId) {
        setContent(data.content);
      }
    };

    return () => {
      ws.close();
    };
  }, [documentId]);

  const handleContentChange = (newContent) => {
    setContent(newContent);
    ws.send(JSON.stringify({ event: 'documentUpdate', documentId, content: newContent }));
    fetch(`/api/documents/${documentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newContent }),
    });
  };

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        rows="20"
        cols="80"
      />
    </div>
  );
};

export default EditorArea;
