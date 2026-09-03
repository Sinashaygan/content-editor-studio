"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { documentService } from "@/entities/document/api/document-service";
import { documentKeys } from "@/entities/document/hooks/queries";
import { documentVersionKeys } from "@/entities/document-version/hooks/queries";
import type {
  Document,
  UpdateDocumentResult,
} from "@/entities/document/model/types";
import type { Json } from "@/shared/types/database";
import { DocumentVersion } from "@/entities/document-version/model/type";

interface RestoreVersionInput {
  documentId: string;
  currentVersion: number;
  version: DocumentVersion;
}

export type RestoreVersionResult =
  | { success: true; document: Document }
  | Extract<UpdateDocumentResult, { success: false }>;

export function useRestoreVersion() {
  const queryClient = useQueryClient();

  return useMutation<RestoreVersionResult, Error, RestoreVersionInput>({
    mutationFn: async ({ documentId, currentVersion, version }) => {
      const result = await documentService.updateWithOptimisticLock({
        id: documentId,
        expectedVersion: currentVersion,
        updates: {
          title: version.title,
          content: version.content as unknown as Json,
        },
      });

      if (!result.success) {
        return result;
      }

      return { success: true, document: result.data };
    },
    onSuccess: (result, { documentId }) => {
      if (!result.success) return;

      queryClient.setQueryData(
        documentKeys.detail(documentId),
        result.document,
      );
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: documentVersionKeys.list(documentId),
      });
    },
  });
}
