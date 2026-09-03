"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession } from "../hooks/use-session";
import { authService } from "@/features/auth/api/auth-service";

export function UserMenu() {
  const { user } = useSession();
  const router = useRouter();

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <span
        className="grid size-8 place-items-center rounded-full bg-primary/10 text-xs font-medium text-foreground"
        aria-label={`Signed in as ${user.displayName}`}
      >
        {user.initials}
      </span>
      <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
        {user.displayName}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={async () => {
          await authService.signOut();
          router.replace("/login");
          router.refresh();
        }}
      >
        Sign out
      </Button>
    </div>
  );
}
