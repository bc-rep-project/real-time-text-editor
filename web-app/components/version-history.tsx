
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

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
    const response = await fetch(`/api/documents/${documentId}/versions/${versionId}`, {
      method: "POST",
    });

    if (response.ok) {
      fetchVersionHistory();
    }
  };

  return (
    <div className="border p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Version History</h2>
      <ul>
        {versions.map((version) => (
          <li key={version.id} className="mb-2">
            <div>
              <span>{new Date(version.createdAt).toLocaleString()}</span>
              <Button onClick={() => handleRevertToVersion(version.id)}>Revert</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
