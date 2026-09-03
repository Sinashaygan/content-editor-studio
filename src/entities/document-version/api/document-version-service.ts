import { supabase } from "@/shared/api/supabase";
import { DocumentContent, DocumentVersion, MAX_VERSIONS_PER_DOCUMENT } from "../model/type";

interface DocumentVersionRow {
  id: string;
  document_id: string;
  version: number;
  title: string;
  content: unknown;
  created_at: string;
}

function toDocumentVersion(row: DocumentVersionRow): DocumentVersion {
  return {
    id: row.id,
    documentId: row.document_id,
    version: row.version,
    title: row.title,
    content: row.content as DocumentContent,
    createdAt: row.created_at,
  };
}

export const documentVersionService = {
  async getByDocumentId(documentId: string): Promise<DocumentVersion[]> {
    const { data, error } = await supabase
      .from("document_versions")
      .select("id, document_id, version, title, content, created_at")
      .eq("document_id", documentId)
      .order("version", { ascending: false })
      .limit(MAX_VERSIONS_PER_DOCUMENT);

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) =>
      toDocumentVersion(row as DocumentVersionRow),
    );
  },
};
