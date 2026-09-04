"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSignout } from "../hooks/use-signout";

export function SignoutButton() {
  const { mutate, isPending } = useSignout();
  return (
    <Button variant="ghost" size="sm" onClick={() => mutate()} disabled={isPending}>
      <LogOut />
      Sign out
    </Button>
  );
}
