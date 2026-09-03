"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/shared/api/supabase";
import { useSession } from "@/entities/session/hooks/use-session";

export interface PresenceUser {
  userId: string;
  userName: string;
  color: string;
  lastSeen: number;
}

/**
 * تولید یک رنگ HSL پایدار بر اساس شناسه کاربری
 */
function colorFromId(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360} 70% 45%)`;
}

export function useDocumentPresence(documentId: string) {
  const { user } = useSession();
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // اگر شناسه سند یا کاربر لاگین‌شده وجود نداشت، سابسکرایب نشود
    if (!documentId || !user) return;

    const currentUser: PresenceUser = {
      userId: user.id,
      userName: user.displayName || user.email.split("@")[0] || "Collaborator",
      color: colorFromId(user.id),
      lastSeen: Date.now(),
    };

    const channel = supabase.channel(`document:${documentId}`, {
      config: {
        presence: { key: user.id },
      },
    });

    const syncPresence = () => {
      const presenceState = channel.presenceState<PresenceUser>();
      const uniqueUsers = new Map<string, PresenceUser>();

      for (const presence of Object.values(presenceState).flat()) {
        if (presence?.userId) {
          uniqueUsers.set(presence.userId, {
            userId: presence.userId,
            userName: presence.userName,
            color: presence.color,
            lastSeen: presence.lastSeen,
          });
        }
      }

      setOnlineUsers(
        [...uniqueUsers.values()].sort((a, b) =>
          a.userName.localeCompare(b.userName),
        ),
      );
    };

    channel
      .on("presence", { event: "sync" }, syncPresence)
      .on("presence", { event: "join" }, syncPresence)
      .on("presence", { event: "leave" }, syncPresence)
      .subscribe((status) => {
        const isSubscribed = status === "SUBSCRIBED";
        setIsConnected(isSubscribed);

        if (isSubscribed) {
          void channel.track({
            ...currentUser,
            lastSeen: Date.now(),
          });
        }
      });

    return () => {
      setIsConnected(false);
      setOnlineUsers([]);
      void channel.untrack();
      void supabase.removeChannel(channel);
    };
  }, [documentId, user?.id, user?.displayName, user?.email]);

  return { onlineUsers, isConnected };
}
