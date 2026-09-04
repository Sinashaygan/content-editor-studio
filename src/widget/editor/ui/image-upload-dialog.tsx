"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAssetUpload } from "@/entities/document/hooks/use-asset-upload";

export function ImageUploadDialog({
  onInsert,
  onClose,
}: {
  onInsert: (url: string, alt: string) => void;
  onClose: () => void;
}) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const upload = useAssetUpload();
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-md space-y-3 rounded-lg bg-white p-5 shadow-xl">
        <h2 className="font-semibold">Insert image</h2>
        <Input
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload.mutate(file, { onSuccess: (r) => setUrl(r.url) });
          }}
        />
        <Input
          placeholder="Image URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Input
          placeholder="Alt text"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
        />
        {upload.error && (
          <p className="text-sm text-red-600">{upload.error.message}</p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!url || upload.isPending}
            onClick={() => {
              onInsert(url, alt);
              onClose();
            }}
          >
            Insert
          </Button>
        </div>
      </div>
    </div>
  );
}
