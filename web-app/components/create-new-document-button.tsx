
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

export default function CreateNewDocumentButton() {
  const [newDocumentTitle, setNewDocumentTitle] = useState("");

  const handleTitleChange = (e) => {
    setNewDocumentTitle(e.target.value);
  };

  const createDocument = async () => {
    if (newDocumentTitle.trim() === "") {
      toast({
        title: "Error",
        description: "Document title cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    const response = await fetch("/api/documents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: newDocumentTitle }),
    });

    if (response.ok) {
      toast({
        title: "Success",
        description: "Document created successfully.",
      });
      setNewDocumentTitle("");
    } else {
      toast({
        title: "Error",
        description: "Failed to create document.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="p-2 bg-green-500 text-white">Create New Document</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Document Title"
            value={newDocumentTitle}
            onChange={handleTitleChange}
          />
          <Button onClick={createDocument}>Create</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
