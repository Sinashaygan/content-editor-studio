import { Database, Json } from "@/shared/types/database";
import { Document, TiptapContent } from "../model/types";
import { supabase } from "@/shared/api/supabase";

type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];
type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"];
type DocumentUpdate = Database["public"]["Tables"]["documents"]["Update"];

const mapRowToDocument = (row: DocumentRow): Document => ({
  id: row.id,
  title: row.title,
  content: (row.content as unknown as TiptapContent) || {
    type: "doc",
    content: [],
  },
  version: row.version,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

export const documentService = {
  async getById(id: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return mapRowToDocument(data as DocumentRow);
  },

  async getAll(): Promise<Document[]> {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw new Error(error.message);
    return ((data ?? []) as DocumentRow[]).map(mapRowToDocument);
  },

  async create(
    title: string,
    content: TiptapContent = { type: "doc", content: [] },
  ): Promise<Document> {
    const insertPayload: DocumentInsert = {
      title,
      content: content as unknown as Json,
      version: 1,
    };

    const { data, error } = await supabase
      .from("documents")
      .insert(insertPayload as any) // جلوگیری از ts(2353) در صورت mismatch تایپ سوپابیس
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapRowToDocument(data as DocumentRow);
  },

  async updateWithOptimisticLock(
    id: string,
    expectedVersion: number,
    updates: { title?: string; content?: TiptapContent },
  ): Promise<
    | { success: true; data: Document }
    | { success: false; conflict: true; currentDoc: Document | null }
  > {
    const updatePayload: DocumentUpdate = {
      ...(updates.title !== undefined ? { title: updates.title } : {}),
      ...(updates.content !== undefined
        ? { content: updates.content as unknown as Json }
        : {}),
      version: expectedVersion + 1,
    };

    const { data, error } = await supabase
      .from("documents")
      .update(updatePayload as any) // جلوگیری از ts(2345)
      .match({ id, version: expectedVersion })
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);

    if (!data) {
      const currentDoc = await this.getById(id);
      return { success: false, conflict: true, currentDoc };
    }

    return { success: true, data: mapRowToDocument(data as DocumentRow) };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};
