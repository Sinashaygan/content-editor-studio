import {
  DocumentInsert,
  DocumentRow,
  DocumentUpdate,
  Json,
} from "@/shared/types/database";
import {
  Document,
  TiptapContent,
  UpdateDocumentResult,
} from "../model/types";
import { supabase } from "@/shared/api/supabase";

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
      .insert(insertPayload)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapRowToDocument(data as DocumentRow);
  },

  async updateWithOptimisticLock(params: {
    id: string;
    expectedVersion: number;
    updates: DocumentUpdate;
  }): Promise<UpdateDocumentResult> {
    const { id, expectedVersion, updates } = params;
    const { data, error } = await supabase
      .from("documents")
      .update({
        ...updates,
        version: expectedVersion + 1,
        updated_at: new Date().toISOString(),
      })
      .match({ id, version: expectedVersion })
      .select()
      .maybeSingle();

    if (error) {
      return { success: false, conflict: false, error: error.message };
    }

    if (data) {
      return {
        success: true,
        data: mapRowToDocument(data as DocumentRow),
      };
    }

    const { data: current, error: currentError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (currentError) {
      return {
        success: false,
        conflict: false,
        error: currentError.message,
      };
    }

    if (!current) {
      return {
        success: false,
        conflict: false,
        forbidden: true,
        currentDoc: null,
      };
    }

    return {
      success: false,
      conflict: true,
      currentDoc: mapRowToDocument(current as DocumentRow),
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("documents").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};
