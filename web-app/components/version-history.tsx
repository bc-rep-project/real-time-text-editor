
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Version = {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
};

export default function VersionHistory() {
  const router = useRouter();
  const { documentId } = router.query;
  const [versions, setVersions] = useState<Version[]>([]);

  useEffect(() => {
    if (documentId) {
      // Fetch version history from the API
      fetch(`/api/documents/${documentId}/versions`)
        .then((response) => response.json())
        .then((data) => setVersions(data));
    }
  }, [documentId]);

  return (
    <div className="space-y-4">
      {versions.map((version) => (
        <Card key={version.id}>
          <CardHeader>
            <CardTitle>Version {version.id}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Edited by User {version.userId}</p>
            <p>{new Date(version.createdAt).toLocaleString()}</p>
            <pre className="whitespace-pre-wrap">{version.content}</pre>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
