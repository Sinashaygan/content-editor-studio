import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TiptapContent } from "../model/types";
import { documentService } from "../api/document-service";
import { documentKeys } from "./queries";

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      expectedVersion,
      updates,
    }: {
      id: string;
      expectedVersion: number;
      updates: { title?: string; content?: TiptapContent };
    }) =>
      documentService.updateWithOptimisticLock(id, expectedVersion, updates),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.setQueryData(
          documentKeys.detail(variables.id),
          result.data,
        );
        queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      }
    },
  });
}