"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/api/supabase";
import { SessionUser } from "@/features/auth/model/type";
import { authService, mapUser } from "@/features/auth/api/auth-service";

export const sessionKeys = { current: ["session", "current"] as const };

export function useSession(initialUser?: SessionUser | null) {
  const queryClient = useQueryClient();

  const query = useQuery<SessionUser | null>({
    queryKey: sessionKeys.current,
    queryFn: () => authService.getCurrentUser(),
    initialData: initialUser,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      queryClient.setQueryData(
        sessionKeys.current,
        mapUser(session?.user ?? null),
      );
      if (event === "SIGNED_OUT") {
        queryClient.clear(); // پاک‌کردن کامل کش تمام داکیومنت‌ها پس از خروج
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [queryClient]);

  return { user: query.data ?? null, isLoading: query.isLoading };
}
