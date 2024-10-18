
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FormattingToolbar({ onFormat }) {
  return (
    <Card className="w-full max-w-3xl mx-auto mt-4">
      <CardHeader>
        <CardTitle>Formatting Toolbar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Button onClick={() => onFormat("bold")}>Bold</Button>
          <Button onClick={() => onFormat("italic")}>Italic</Button>
          <Button onClick={() => onFormat("underline")}>Underline</Button>
        </div>
      </CardContent>
    </Card>
  );
}
