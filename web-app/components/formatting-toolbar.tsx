
"use client";

import { Button } from "@/components/ui/button";

export default function FormattingToolbar({ onFormat }) {
  return (
    <div className="p-4 border-b">
      <Button onClick={() => onFormat("bold")}>Bold</Button>
      <Button onClick={() => onFormat("italic")}>Italic</Button>
      <Button onClick={() => onFormat("underline")}>Underline</Button>
    </div>
  );
}
