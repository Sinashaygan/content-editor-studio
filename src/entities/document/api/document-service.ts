import { Database } from "@/shared/types/database";
import { Document, TiptapContent } from "../model/types";

type documentRow = Database["public"]["Tables"]["documents"]["Row"];

const mapRowToDocument = (row: documentRow): Document => ({
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
