import type { PresenceUser } from "@/entities/document/hooks/use-document-presence";

interface PresenceAvatarsProps {
  users: PresenceUser[];
  isConnected: boolean;
}

function getInitials(userName: string) {
  return userName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PresenceAvatars({
  users,
  isConnected,
}: PresenceAvatarsProps) {
  return (
    <div className="flex items-center gap-2" aria-label="Online collaborators">
      <span
        className={`h-2 w-2 rounded-full ${
          isConnected ? "bg-emerald-500" : "bg-neutral-300"
        }`}
        title={isConnected ? "Realtime connected" : "Realtime connecting"}
      />

      {users.length > 0 && (
        <>
          <div className="flex -space-x-2">
            {users.slice(0, 4).map((user) => (
              <div
                key={user.userId}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-xs font-semibold text-white shadow-sm"
                style={{ backgroundColor: user.color }}
                title={`${user.userName} is online`}
              >
                {getInitials(user.userName)}
              </div>
            ))}
          </div>

          {users.length > 4 && (
            <span className="text-xs text-muted-foreground">
              +{users.length - 4}
            </span>
          )}
        </>
      )}
    </div>
  );
}
