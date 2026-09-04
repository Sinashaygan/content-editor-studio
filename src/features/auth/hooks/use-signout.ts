"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "../api/auth-service";

export function useSignout() {
  const router = useRouter();
  return useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      router.push("/login");
      router.refresh();
    },
  });
}
