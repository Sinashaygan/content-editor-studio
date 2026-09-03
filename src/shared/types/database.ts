export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string;
          title: string;
          content: Json;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content?: Json;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: Json;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      document_versions: {
        Row: {
          id: string;
          document_id: string;
          version: number;
          title: string;
          content: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          version: number;
          title: string;
          content: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          version?: number;
          title?: string;
          content?: Json;
          created_at?: string;
        };
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      [_ in never]: never;
    };

    Enums: {
      [_ in never]: never;
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
