interface PresenceAvatarsProps {
  users: Array<{ userId: string; color: string }>;
}

export function PresenceAvatars({ users }: PresenceAvatarsProps) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-2">
        {users.slice(0, 3).map((user) => (
          <div
            key={user.userId}
            className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-semibold"
            style={{ backgroundColor: user.color }}
            title={user.userId}
          >
            {user.userId.slice(0, 2).toUpperCase()}
          </div>
        ))}
      </div>
      {users.length > 3 && (
        <span className="text-sm text-muted-foreground">
          +{users.length - 3}
        </span>
      )}
    </div>
  );
}
