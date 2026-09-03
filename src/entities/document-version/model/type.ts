import type { Document } from "@/entities/document/model/types";

export type DocumentContent = Document["content"];

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  title: string;
  content: DocumentContent;
  createdAt: string;
}

/** سقف نگهداری، هم‌تراز با تریگر دیتابیس */
export const MAX_VERSIONS_PER_DOCUMENT = 10;
