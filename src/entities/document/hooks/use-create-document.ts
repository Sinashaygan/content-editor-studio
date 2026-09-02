import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TiptapContent } from "../model/types";
import { documentService } from "../api/document-service";
import { documentKeys } from "./queries";

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      title,
      content,
    }: {
      title: string;
      content?: TiptapContent;
    }) => documentService.create(title, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}
