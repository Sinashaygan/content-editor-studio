import { supabase } from "@/shared/api/supabase";
import type { User } from "@supabase/supabase-js";
import type { AuthCredentials } from "../model/type";
import type { SessionUser } from "@/entities/session/model/types";

export function mapUser(user: User | null): SessionUser | null {
  if (!user) return null;
  const email = user.email ?? "unknown@local";
  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    email.split("@")[0];

  return {
    id: user.id,
    email,
    displayName,
    initials: displayName.slice(0, 2).toUpperCase(),
  };
}

export const authService = {
  async signIn({ email, password }: AuthCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return mapUser(data.user);
  },

  async signUp({
    email,
    password,
    fullName,
  }: AuthCredentials & { fullName: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return { user: mapUser(data.user), needsConfirmation: !data.session };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    return mapUser(data.user);
  },
};
