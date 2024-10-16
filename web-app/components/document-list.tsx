
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Document = {
  id: number;
  title: string;
  createdAt: string;
};

export default function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    // Fetch documents from the API
    fetch("/api/documents")
      .then((response) => response.json())
      .then((data) => setDocuments(data));
  }, []);

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <Card key={document.id}>
          <CardHeader>
            <CardTitle>{document.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Created At: {new Date(document.createdAt).toLocaleString()}</p>
            <Button href={`/document/${document.id}`}>Open</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
