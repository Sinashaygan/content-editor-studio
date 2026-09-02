"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useDocument } from "@/entities/document/hooks/use-document-by-id";
import { EditorCanvas } from "@/widget/editor/ui/editor-canvas";

export default function DocumentEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: document, isLoading, error } = useDocument(id);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-neutral-500">
        Loading document editor...
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-4">
        <p className="text-red-500 font-medium">
          {error ? (error as Error).message : "Document not found"}
        </p>
        <Button variant="outline" onClick={() => router.push("/")}>
          Back to Documents
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
          ← Back to Dashboard
        </Button>
      </div>

      <EditorCanvas initialDocument={document} />
    </div>
  );
}
