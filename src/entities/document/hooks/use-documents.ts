import { useQuery } from "@tanstack/react-query";
import { documentKeys } from "./queries";
import { documentService } from "../api/document-service";

export function useDocuments() {
  return useQuery({
    queryKey: documentKeys.lists(),
    queryFn: () => documentService.getAll(),
  });
}
