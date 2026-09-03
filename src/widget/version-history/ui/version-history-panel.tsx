import { Button } from "@/components/ui/button";
import { useDocumentVersions } from "@/entities/document-version/hooks/use-document-versions";
import { DocumentVersion, MAX_VERSIONS_PER_DOCUMENT } from "@/entities/document-version/model/type";
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
    </aside>
  );
}
