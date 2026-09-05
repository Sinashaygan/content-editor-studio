import type { UpdateDocumentResult } from "@/entities/document/model/types";

export type SaveMode = "manual" | "auto";
export type SaveStatus = "idle" | "saving" | "auto-saving" | "saved" | "error";

export interface SavedSnapshot {
  title: string;
  serializedContent: string;
}

export type SaveErrorKind = "conflict" | "forbidden" | "generic";

export interface ClassifiedSaveError {
  kind: SaveErrorKind;
  message: string;
  result: UpdateDocumentResult;
}

export function classifySaveError(result: UpdateDocumentResult): ClassifiedSaveError | null {
  if (result.success) return null;
  if (result.forbidden) {
    return {
      kind: "forbidden",
      message: "You do not have permission to update this document, or it no longer exists.",
      result,
    };
  }
  if (result.conflict) {
    const serverVersion = result.currentDoc?.version;
    return {
      kind: "conflict",
      message: serverVersion
        ? `Version conflict detected! The server is at v${serverVersion}.`
        : "Version conflict detected! This document may have been deleted or updated elsewhere.",
      result,
    };
  }
  return { kind: "generic", message: result.error, result };
}
