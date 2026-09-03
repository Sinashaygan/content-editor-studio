import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/shared/types/database";

export function getSupabaseEnv() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!rawUrl || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  const url = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  return { url, anonKey };
}

const { url, anonKey } = getSupabaseEnv();

export const supabase = createBrowserClient<Database>(url, anonKey);
