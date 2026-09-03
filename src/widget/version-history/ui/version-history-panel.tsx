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
}: VersionHistoryPanelProps) {}
