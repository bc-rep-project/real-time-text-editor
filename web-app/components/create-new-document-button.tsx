
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function CreateNewDocumentButton() {
  const [title, setTitle] = useState("");

  const handleCreateDocument = () => {
    fetch("/api/documents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Redirect to the new document
        window.location.href = `/document/${data.id}`;
      });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create New Document</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
        </DialogHeader>
        <Input
          type="text"
          placeholder="Document Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button onClick={handleCreateDocument}>Create</Button>
      </DialogContent>
    </Dialog>
  );
}
