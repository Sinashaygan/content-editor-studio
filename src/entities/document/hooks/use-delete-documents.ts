import { useMutation, useQueryClient } from "@tanstack/react-query";
import { documentService } from "../api/document-service";
import { documentKeys } from "./queries";

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}
