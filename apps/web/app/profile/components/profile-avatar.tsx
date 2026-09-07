import { UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui-web/components/avatar";
import { cn } from "@repo/ui-web/lib/utils";

export function ProfileAvatar({
  avatarUrl,
  username,
  size = 88,
  className,
}: {
  avatarUrl?: string | null;
  username?: string;
  size?: number;
  className?: string;
}) {
  return (
    <Avatar style={{ width: size, height: size }} className={cn("after:rounded-full", className)}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={username} />}
      <AvatarFallback>
        <UserIcon className="size-1/2 text-muted-foreground" />
      </AvatarFallback>
    </Avatar>
  );
}
