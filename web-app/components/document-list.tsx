
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  const handleSortChange = (value) => {
    setSort(value);
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Document List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Filter documents..."
              value={filter}
              onChange={handleFilterChange}
            />
            <Select onValueChange={handleSortChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt">Updated At</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
            <ul>
              {documents
                .filter((doc) =>
                  doc.title.toLowerCase().includes(filter.toLowerCase())
                )
                .sort((a, b) =>
                  sort === "updatedAt"
                    ? new Date(b.updatedAt) - new Date(a.updatedAt)
                    : a.title.localeCompare(b.title)
                )
                .map((doc) => (
                  <li key={doc.id} className="mb-2">
                    {doc.title} - {new Date(doc.updatedAt).toLocaleString()}
                  </li>
                ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
