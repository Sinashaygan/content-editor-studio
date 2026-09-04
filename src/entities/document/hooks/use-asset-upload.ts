"use client";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "@/entities/session/hooks/use-session";
import { uploadDocumentImage } from "../api/document-assets-service";

export function useAssetUpload() {
  const { user } = useSession();
  return useMutation({
    mutationFn: (file: File) => {
      if (!user?.id) throw new Error("You must be signed in to upload.");
      return uploadDocumentImage(file, user.id);
    },
  });
}
