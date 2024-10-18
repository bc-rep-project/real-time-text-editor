
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VersionHistory() {
  const [versions, setVersions] = useState([]);
  const router = useRouter();
  const { documentId } = router.query;

  useEffect(() => {
    if (documentId) {
      fetchVersionHistory();
    }
  }, [documentId]);

  const fetchVersionHistory = async () => {
    const response = await fetch(`/api/documents/${documentId}/versions`);
    const data = await response.json();
    setVersions(data.versions);
  };

  const handleRevertToVersion = async (versionId) => {
    const response = await fetch(`/api/documents/${documentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ versionId }),
    });

    if (response.ok) {
      fetchVersionHistory();
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto mt-4">
      <CardHeader>
        <CardTitle>Version History</CardTitle>
      </CardHeader>
      <CardContent>
        <ul>
          {versions.map((version) => (
            <li key={version.id} className="mb-2">
              <div>
                <strong>Version {version.id}:</strong> {new Date(version.createdAt).toLocaleString()}
              </div>
              <Button onClick={() => handleRevertToVersion(version.id)} className="mt-2">
                Revert to this version
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
