"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateDocument } from "../hooks/use-create-document";

export function CreateDocumentSection() {
  const [title, setTitle] = useState("");
  const router = useRouter();
  const createMutation = useCreateDocument();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const newDoc = await createMutation.mutateAsync({ title: title.trim() });
      setTitle("");
      router.push(`/editor/${newDoc.id}`);
    } catch (err) {
      console.error("Failed to create document:", err);
    }
  };

  return (
    <Card className="mb-8 border-dashed">
      <CardHeader>
        <CardTitle className="text-lg">Create New Document</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Input
            placeholder="Document title (e.g. Architecture RFC #4)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={createMutation.isPending}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={createMutation.isPending || !title.trim()}
          >
            {createMutation.isPending ? "Creating..." : "Create Document"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
