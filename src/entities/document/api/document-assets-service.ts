import { supabase } from "@/shared/api/supabase";

const BUCKET = "document-assets";
const MAX_SIZE = 5 * 1024 * 1024;

export async function uploadDocumentImage(file: File, userId: string) {
  if (file.size > MAX_SIZE) throw new Error("Images must be 5MB or smaller.");
  if (!/^image\/(jpeg|png|gif|webp|svg\+xml)$/.test(file.type)) {
    throw new Error("Unsupported image type.");
  }
  const path = `${userId}/${crypto.randomUUID()}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return { path, url: getPublicUrl(path) };
}

export function getPublicUrl(path: string) {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
