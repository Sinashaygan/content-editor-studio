import { useDocumentVersions } from "@/entities/document-version/hooks/use-document-versions";
import { DocumentVersion } from "@/entities/document-version/model/type";
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
}
