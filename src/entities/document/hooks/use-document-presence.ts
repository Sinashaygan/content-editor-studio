import { useEffect, useState } from "react";
import { supabase } from "@/shared/api/supabase";

interface PresenceUser {
  userId: string;
  color: string;
  lastSeen: number;
}

export function useDocumentPresence(documentId: string) {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!documentId) return;

    const userId = crypto.randomUUID();
    const color = `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")}`;

    const channel = supabase.channel(`document:${documentId}`, {
      config: {
        presence: { key: userId },
      },
    });

    const syncPresence = () => {
      const state = channel.presenceState<PresenceUser>();
      setOnlineUsers(Object.values(state).flat() as PresenceUser[]);
    };

    channel
      .on("presence", { event: "sync" }, syncPresence)
      .on("presence", { event: "join" }, syncPresence)
      .on("presence", { event: "leave" }, syncPresence)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            userId,
            color,
            lastSeen: Date.now(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [documentId]);

  return { onlineUsers };
}
