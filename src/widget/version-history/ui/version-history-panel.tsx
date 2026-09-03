import { Button } from "@/components/ui/button";
import { useDocumentVersions } from "@/entities/document-version/hooks/use-document-versions";
import {
  DocumentVersion,
  MAX_VERSIONS_PER_DOCUMENT,
} from "@/entities/document-version/model/type";
import { Document } from "@/entities/document/model/types";
import { useRestoreVersion } from "@/features/restore-version/hooks/use-restore-version";
import { useState } from "react";

interface VersionHistoryPanelProps {
  documentId: string;
  currentVersion: number;
  onClose: () => void;
  onRestored: (document: Document) => void;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function VersionHistoryPanel({
  documentId,
  currentVersion,
  onClose,
  onRestored,
}: VersionHistoryPanelProps) {
  const { data: versions, isPending, error } = useDocumentVersions(documentId);
  const restoreVersion = useRestoreVersion();
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  async function handleRestore(version: DocumentVersion) {
    setConflictMessage(null);

    const result = await restoreVersion.mutateAsync({
      documentId,
      currentVersion,
      version,
    });

    if (!result.success) {
      const serverVersion = result.currentDoc?.version;
      setConflictMessage(
        serverVersion !== undefined
          ? `Document on the server is at version ${serverVersion}. Please refresh the page first.`
          : "Version conflict detected. Please refresh the page.",
      );
      return;
    }

    onRestored(result.document);
    onClose();
  }

  return (
    <aside
      aria-label="Version history"
      className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l bg-background shadow-lg"
    >
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Version History</h2>
          <p className="text-xs text-muted-foreground">
            Last {MAX_VERSIONS_PER_DOCUMENT} versions are retained
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-3 rounded-md border border-dashed px-3 py-2 text-xs">
          Current Version:{" "}
          <span className="font-medium">v{currentVersion}</span>
        </div>

        {isPending && (
          <p className="text-sm text-muted-foreground">Loading versions...</p>
        )}

        {error && (
          <p className="text-sm text-destructive">
            Failed to load history: {error.message}
          </p>
        )}

        {conflictMessage && (
          <p className="mb-3 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
            {conflictMessage}
          </p>
        )}

        {versions?.length === 0 && !isPending && (
          <p className="text-sm text-muted-foreground">
            No versions saved yet. Versions are created automatically upon
            edits.
          </p>
        )}

        {versions && versions.length > 0 && (
          <ul className="space-y-3">
            {versions.map((version) => (
              <li key={version.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    v{version.version}
                  </span>
                  <time
                    className="text-xs text-muted-foreground"
                    dateTime={
                      typeof version.createdAt === "string"
                        ? version.createdAt
                        : new Date(version.createdAt).toISOString()
                    }
                  >
                    {dateFormatter.format(new Date(version.createdAt))}
                  </time>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {version.title || "Untitled Document"}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 w-full"
                  disabled={restoreVersion.isPending}
                  onClick={() => handleRestore(version)}
                >
                  {restoreVersion.isPending
                    ? "Restoring..."
                    : "Restore this version"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
