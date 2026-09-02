import { createBrowserClient } from "@supabase/ssr";
import { Database } from "../types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(
  /\/(?:rest\/v1\/?)?$/,
  "",
);
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL. Set it to your Supabase project URL (for example, https://<project-ref>.supabase.co).",
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Set it to your Supabase publishable/anon key.",
  );
}

export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
);
