"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDocumentPresence } from "@/entities/document/hooks/use-document-presence";
import { useUpdateDocument } from "@/entities/document/hooks/use-update-document";
import type { Document, TiptapContent } from "@/entities/document/model/types";
import { PresenceAvatars } from "./presence-avatars";
import { VersionHistoryPanel } from "@/widget/version-history/ui/version-history-panel";
import type { Json } from "@/shared/types/database";
import { SlashCommands } from "../lib/tiptap/slash-commands";
import { ImageUploadDialog } from "./image-upload-dialog";
import { SignoutButton } from "@/features/auth/ui/signout-button";

interface EditorCanvasProps {
  initialDocument: Document;
}

type SaveMode = "manual" | "auto";
type SaveStatus = "idle" | "saving" | "auto-saving" | "saved" | "error";

interface SavedSnapshot {
  title: string;
  serializedContent: string;
}

const AUTOSAVE_DELAY = 2_000;
const SAVED_STATUS_DURATION = 2_500;

export function EditorCanvas({ initialDocument }: EditorCanvasProps) {
  const [title, setTitle] = useState(initialDocument.title);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [content, setContent] = useState<TiptapContent>(
    initialDocument.content,
  );
  const [currentVersion, setCurrentVersion] = useState(initialDocument.version);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<SavedSnapshot>({
    title: initialDocument.title,
    serializedContent: JSON.stringify(initialDocument.content),
  });

  const titleRef = useRef(initialDocument.title);
  const serializedContentRef = useRef(JSON.stringify(initialDocument.content));
  const lastSavedRef = useRef<SavedSnapshot>({
    title: initialDocument.title,
    serializedContent: JSON.stringify(initialDocument.content),
  });
  const versionRef = useRef(initialDocument.version);
  const saveInFlightRef = useRef(false);
  const queuedManualSaveRef = useRef(false);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const { mutateAsync: updateDocument } = useUpdateDocument();
  const { onlineUsers, isConnected } = useDocumentPresence(initialDocument.id);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({ nested: true }),
      SlashCommands,
      Placeholder.configure({
        placeholder: "Start writing your document here...",
      }),
    ],
    content: initialDocument.content,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      const nextContent = currentEditor.getJSON() as TiptapContent;
      serializedContentRef.current = JSON.stringify(nextContent);
      setContent(nextContent);
      setSaveStatus((status) => (status === "error" ? status : "idle"));
    },
  });

  const serializedContent = useMemo(() => JSON.stringify(content), [content]);
  const isDirty = useMemo(
    () =>
      title !== lastSavedSnapshot.title ||
      serializedContent !== lastSavedSnapshot.serializedContent,
    [lastSavedSnapshot, serializedContent, title],
  );

  const clearSavedStatusTimer = useCallback(() => {
    if (savedStatusTimerRef.current) {
      clearTimeout(savedStatusTimerRef.current);
      savedStatusTimerRef.current = null;
    }
  }, []);

  const showSavedStatus = useCallback(() => {
    clearSavedStatusTimer();
    setSaveStatus("saved");
    savedStatusTimerRef.current = setTimeout(() => {
      setSaveStatus("idle");
      savedStatusTimerRef.current = null;
    }, SAVED_STATUS_DURATION);
  }, [clearSavedStatusTimer]);

  const performSave = useCallback(
    async (mode: SaveMode) => {
      if (saveInFlightRef.current) {
        if (mode === "manual") {
          queuedManualSaveRef.current = true;
        }
        return;
      }

      saveInFlightRef.current = true;

      try {
        let nextMode: SaveMode | null = mode;

        while (nextMode) {
          const snapshot: SavedSnapshot = {
            title: titleRef.current,
            serializedContent: serializedContentRef.current,
          };

          if (
            snapshot.title === lastSavedRef.current.title &&
            snapshot.serializedContent ===
              lastSavedRef.current.serializedContent
          ) {
            showSavedStatus();
            break;
          }

          clearSavedStatusTimer();
          setConflictError(null);
          setSaveStatus(nextMode === "manual" ? "saving" : "auto-saving");
          queuedManualSaveRef.current = false;

          const result = await updateDocument({
            id: initialDocument.id,
            expectedVersion: versionRef.current,
            updates: {
              title: snapshot.title,
              content: JSON.parse(
                snapshot.serializedContent,
              ) as unknown as Json,
            },
          });

          if (!result.success) {
            if (result.forbidden) {
              setConflictError(
                "You do not have permission to update this document, or it no longer exists.",
              );
            } else if (result.conflict) {
              const serverVersion = result.currentDoc?.version;
              setConflictError(
                serverVersion
                  ? `Version conflict detected! The server is at v${serverVersion}, while this editor is based on v${versionRef.current}. Reload the server version before continuing.`
                  : "Version conflict detected! This document may have been deleted or updated elsewhere.",
              );
            } else {
              setConflictError(result.error);
            }
            setSaveStatus("error");
            break;
          }

          versionRef.current = result.data.version;
          lastSavedRef.current = snapshot;
          setCurrentVersion(result.data.version);
          setLastSavedSnapshot(snapshot);
          showSavedStatus();

          nextMode = queuedManualSaveRef.current ? "manual" : null;
        }
      } catch (error) {
        setSaveStatus("error");
        setConflictError(
          error instanceof Error ? error.message : "Failed to save changes.",
        );
      } finally {
        saveInFlightRef.current = false;
      }
    },
    [
      clearSavedStatusTimer,
      initialDocument.id,
      showSavedStatus,
      updateDocument,
    ],
  );

  useEffect(() => {
    if (!isDirty || conflictError || saveInFlightRef.current) return;

    autosaveTimerRef.current = setTimeout(() => {
      autosaveTimerRef.current = null;
      void performSave("auto");
    }, AUTOSAVE_DELAY);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
  }, [conflictError, isDirty, performSave]);

  useEffect(
    () => () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
      clearSavedStatusTimer();
    },
    [clearSavedStatusTimer],
  );

  const handleTitleChange = useCallback(
    (nextTitle: string) => {
      titleRef.current = nextTitle;
      setTitle(nextTitle);
      if (!conflictError) {
        setSaveStatus("idle");
      }
    },
    [conflictError],
  );

  const handleManualSave = useCallback(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    void performSave("manual");
  }, [performSave]);

  const statusLabel = useMemo(() => {
    const labels: Record<SaveStatus, string> = {
      idle: isDirty ? "Unsaved changes" : "All changes saved",
      saving: "Saving...",
      "auto-saving": "Auto-saving...",
      saved: "Saved",
      error: "Save failed",
    };

    return labels[saveStatus];
  }, [isDirty, saveStatus]);

  const handleRestored = useCallback(
    (restored: Document) => {
      // 1) دیبانس در حال انتظار را لغو کن تا محتوای قبلی روی نسخه بازگردانی‌شده نریزد
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }

      // 2) محتوا را بدون emitUpdate ست کن، سپس JSON نرمال‌شده خودِ ادیتور را مرجع بگیر
      let normalizedContent: TiptapContent = restored.content;

      if (editor) {
        editor.commands.setContent(restored.content, { emitUpdate: false });
        normalizedContent = editor.getJSON() as TiptapContent;
      }

      const serialized = JSON.stringify(normalizedContent);

      // 3) refs (مسیر همگام performSave)
      titleRef.current = restored.title;
      serializedContentRef.current = serialized;
      versionRef.current = restored.version;
      lastSavedRef.current = {
        title: restored.title,
        serializedContent: serialized,
      };

      // 4) state (مسیر رندر) — با ست شدن snapshot، isDirty خودکار false می‌شود
      setTitle(restored.title);
      setContent(normalizedContent);
      setCurrentVersion(restored.version);
      setLastSavedSnapshot({
        title: restored.title,
        serializedContent: serialized,
      });
      setConflictError(null);
      showSavedStatus();
    },
    [editor, showSavedStatus],
  );

  return (
    <div className="space-y-4">
      {conflictError && (
        <div
          className="flex items-center justify-between gap-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
          role="alert"
        >
          <span>{conflictError}</span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="shrink-0 bg-white"
            onClick={() => window.location.reload()}
          >
            Reload Server Version
          </Button>
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
        <Input
          value={title}
          onChange={(event) => handleTitleChange(event.target.value)}
          className="max-w-lg text-xl font-bold"
          placeholder="Untitled"
          aria-label="Document title"
        />

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <PresenceAvatars users={onlineUsers} isConnected={isConnected} />
          <SignoutButton />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsHistoryOpen(true)}
          >
            History
          </Button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-mono text-xs text-neutral-500">
                v{currentVersion}
              </p>
              <p
                className={`text-xs ${
                  saveStatus === "error" ? "text-red-600" : "text-neutral-500"
                }`}
                aria-live="polite"
              >
                {statusLabel}
              </p>
            </div>

            <Button
              type="button"
              onClick={handleManualSave}
              disabled={!editor || saveStatus === "saving"}
            >
              {saveStatus === "saving" ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => editor?.chain().focus().toggleTaskList().run()}
            >
              Task list
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                editor
                  ?.chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run()
              }
            >
              Insert table
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImageDialogOpen(true)}
            >
              Image
            </Button>
          </div>
        </div>
      </div>

      <p className="text-xs text-neutral-500">Tip: type / to open commands.</p>
      <div className="min-h-[450px] rounded-lg border bg-white p-6 shadow-sm focus-within:ring-1 focus-within:ring-neutral-400">
        <EditorContent
          editor={editor}
          className="prose max-w-none focus:outline-none"
        />
      </div>

      {isHistoryOpen && (
        <VersionHistoryPanel
          documentId={initialDocument.id}
          currentVersion={currentVersion}
          onClose={() => setIsHistoryOpen(false)}
          onRestored={handleRestored}
        />
      )}
      {isImageDialogOpen && editor && (
        <ImageUploadDialog
          onClose={() => setIsImageDialogOpen(false)}
          onInsert={(url, alt) =>
            editor.chain().focus().setImage({ src: url, alt }).run()
          }
        />
      )}
    </div>
  );
}
