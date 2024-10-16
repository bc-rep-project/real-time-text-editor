
"use client";

import { Button } from "@/components/ui/button";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react";

export default function FormattingToolbar({ onFormat }: { onFormat: (format: string) => void }) {
  return (
    <div className="flex space-x-2 mb-4">
      <Button onClick={() => onFormat("bold")} size="icon">
        <BoldIcon className="h-4 w-4" />
        <span className="sr-only">Bold</span>
      </Button>
      <Button onClick={() => onFormat("italic")} size="icon">
        <ItalicIcon className="h-4 w-4" />
        <span className="sr-only">Italic</span>
      </Button>
      <Button onClick={() => onFormat("underline")} size="icon">
        <UnderlineIcon className="h-4 w-4" />
        <span className="sr-only">Underline</span>
      </Button>
    </div>
  );
}
