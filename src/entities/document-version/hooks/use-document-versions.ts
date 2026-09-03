"use client";

import { useQuery } from "@tanstack/react-query";
import { documentVersionService } from "../api/document-version-service";
import { documentVersionKeys } from "./queries";

export function useDocumentVersions(documentId: string, enabled = true) {
  return useQuery({
    queryKey: documentVersionKeys.list(documentId),
    queryFn: () => documentVersionService.getByDocumentId(documentId),
    enabled: enabled && !!documentId,
    staleTime: 10_000,
  });
}
