import { useQuery } from "@tanstack/react-query";
import { documentKeys } from "./queries";
import { documentService } from "../api/document-service";

export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => documentService.getById(id),
    enabled: Boolean(id),
  });
}
