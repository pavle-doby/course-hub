"use client";

import type { CourseLeaderboardDataItem } from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui-web/components/avatar";
import { Badge } from "@repo/ui-web/components/badge";
import { cn } from "@repo/ui-web/lib/utils";

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

/**
 * List of rows: dividers between rows, none around the `data-me` item (it has its own outline).
 * Pulled out by the rows' `px-3` so their content lines up with the surrounding text while the
 * highlighted card reaches past it.
 */
export const LEADERBOARD_LIST_CLASS =
  "-mx-3 flex flex-col divide-y [&>[data-me]]:border-transparent [&>li:has(+[data-me])]:border-transparent";

type LeaderboardRowProps = {
  entry: CourseLeaderboardDataItem;
  isMe: boolean;
  className?: string;
};

export function LeaderboardRow({ entry, isMe, className }: LeaderboardRowProps) {
  const { t } = useT();
  const { user } = entry;
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username;

  return (
    <div
      className={cn(
        // Every row is padded, so avatars and names line up with the highlighted one.
        "flex items-center gap-3 px-3 py-3",
        // Same radius and outline as `Card`; inset so a clipping parent never cuts it off.
        isMe && "rounded-xl bg-card inset-ring-1 inset-ring-foreground/10",
        entry.isWithdrawn && "opacity-50",
        className
      )}
    >
      <span
        className="w-10 shrink-0 text-center font-semibold tabular-nums"
        aria-label={t("learn.leaderboard.placeLabel", { place: entry.place })}
      >
        {MEDALS[entry.place] ?? `#${entry.place}`}
      </span>
      <Avatar>
        {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.username} />}
        <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-semibold">{fullName}</span>
          {isMe && <Badge>{t("learn.leaderboard.you")}</Badge>}
          {entry.isWithdrawn && <Badge variant="outline">{t("learn.leaderboard.withdrawn")}</Badge>}
        </div>
        {user.email && <span className="truncate text-sm text-muted-foreground">{user.email}</span>}
      </div>
      <span className="shrink-0 font-semibold tabular-nums">
        {t("learn.leaderboard.points", { count: entry.points })}
      </span>
    </div>
  );
}
