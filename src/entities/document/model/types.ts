export interface Document {
  id: string;
  title: string;
  content: TiptapContent;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

// Tiptap JSON structure
export interface TiptapContent {
  type: "doc";
  content?: TiptapNode[];
}

export interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
}

export interface TiptapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

// Conflict detection
export interface SaveConflict {
  type: "version_mismatch";
  localVersion: number;
  serverVersion: number;
  serverContent: TiptapContent;
}

export type UpdateDocumentResult =
  | { success: true; data: Document }
  | {
      success: false;
      conflict: true;
      forbidden?: false;
      currentDoc: Document | null;
    }
  | {
      success: false;
      conflict: false;
      forbidden: true;
      currentDoc: null;
    }
  | {
      success: false;
      conflict: false;
      forbidden?: false;
      error: string;
    };
