"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Document, TiptapContent } from "@/entities/document/model/types";
import { useUpdateDocument } from "@/entities/document/hooks/use-update-document";

interface EditorCanvasProps {
  initialDocument: Document;
}

export function EditorCanvas({ initialDocument }: EditorCanvasProps) {
  const [title, setTitle] = useState(initialDocument.title);
  const [currentVersion, setCurrentVersion] = useState(initialDocument.version);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const updateMutation = useUpdateDocument();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing your document here...",
      }),
    ],
    content: initialDocument.content,
    immediatelyRender: false,
  });

//   useEffect(() => {
//     if (editor && initialDocument.content) {
//       editor.commands.setContent(initialDocument.content);
//       setCurrentVersion(initialDocument.version);
//       setTitle(initialDocument.title);
//     }
//   }, [editor, initialDocument.id]);

  const handleSave = async () => {
    if (!editor) return;

    setSaveStatus("saving");
    setConflictError(null);

    const contentJSON = editor.getJSON() as TiptapContent;

    try {
      const result = await updateMutation.mutateAsync({
        id: initialDocument.id,
        expectedVersion: currentVersion,
        updates: {
          title,
          content: contentJSON,
        },
      });

      if (result.success) {
        setCurrentVersion(result.data.version);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } else if (result.conflict) {
        setSaveStatus("error");
        setConflictError(
          `Version conflict detected! Someone else updated this document to v${result.currentDoc?.version}. Please review before overwriting.`,
        );
      }
    } catch (err) {
      setSaveStatus("error");
      setConflictError((err as Error).message || "Failed to save changes");
    }
  };

  return (
    <div className="space-y-4">
      {conflictError && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-sm flex items-center justify-between">
          <span>⚠️ {conflictError}</span>
          <Button
            size="sm"
            variant="outline"
            className="bg-white"
            onClick={() => window.location.reload()}
          >
            Reload Server Version
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 pb-4 border-b">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-xl font-bold max-w-lg"
          placeholder="Untitled"
        />

        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500 font-mono">
            v{currentVersion}
          </span>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending
              ? "Saving..."
              : saveStatus === "saved"
                ? "Saved ✓"
                : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg min-h-[450px] p-6 shadow-sm bg-white focus-within:ring-1 focus-within:ring-neutral-400">
        <EditorContent
          editor={editor}
          className="prose max-w-none focus:outline-none"
        />
      </div>
    </div>
  );
}
