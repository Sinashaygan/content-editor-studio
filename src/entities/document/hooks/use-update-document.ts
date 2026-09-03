import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DocumentUpdate } from "@/shared/types/database";
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
      updates: DocumentUpdate;
    }) =>
      documentService.updateWithOptimisticLock({
        id,
        expectedVersion,
        updates,
      }),
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
