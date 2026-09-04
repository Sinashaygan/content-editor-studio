"use client";

import { useSession } from "../hooks/use-session";
import { SignoutButton } from "@/features/auth/ui/signout-button";

export function UserMenu() {
  const { user } = useSession();

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
      <SignoutButton />
    </div>
  );
}
