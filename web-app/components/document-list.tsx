
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("updatedAt");

  useEffect(() => {
    fetchDocuments();
  }, [filter, sort]);

  const fetchDocuments = async () => {
    const response = await fetch("/api/documents");
    const data = await response.json();
    setDocuments(data.documents);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  return (
    <div className="border p-4 overflow-y-auto">
      <div className="flex justify-between mb-4">
        <Input
          type="text"
          placeholder="Filter documents..."
          value={filter}
          onChange={handleFilterChange}
        />
        <select value={sort} onChange={handleSortChange}>
          <option value="updatedAt">Sort by Updated At</option>
          <option value="title">Sort by Title</option>
        </select>
      </div>
      <ul>
        {documents
          .filter((doc) => doc.title.includes(filter))
          .sort((a, b) => (a[sort] > b[sort] ? 1 : -1))
          .map((doc) => (
            <li key={doc.id} className="mb-2">
              {doc.title} (Last updated: {new Date(doc.updatedAt).toLocaleString()})
            </li>
          ))}
      </ul>
    </div>
  );
}
