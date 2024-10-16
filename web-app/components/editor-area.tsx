
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Textarea } from "@/components/ui/textarea";

type Document = {
  id: number;
  title: string;
  content: string;
};

export default function EditorArea() {
  const router = useRouter();
  const { documentId } = router.query;
  const [document, setDocument] = useState<Document | null>(null);

  useEffect(() => {
    if (documentId) {
      // Fetch document from the API
      fetch(`/api/documents/${documentId}`)
        .then((response) => response.json())
        .then((data) => setDocument(data));
    }
  }, [documentId]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (document) {
      setDocument({ ...document, content: e.target.value });
    }
  };

  const handleSave = () => {
    if (document) {
      fetch(`/api/documents/${document.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: document.content }),
      });
    }
  };

  if (!document) {
    return <p>Loading...</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{document.title}</h2>
      <Textarea
        value={document.content}
        onChange={handleContentChange}
        className="w-full h-96"
      />
      <button onClick={handleSave} className="btn btn-primary">
        Save
      </button>
    </div>
  );
}
