"use client";

import { StarIcon } from "lucide-react";
import { useT } from "@repo/i18n/client";
import { cn } from "@repo/ui-web/lib/utils";

type StarRatingProps = {
  average: number;
  count: number;
  className?: string;
};

/** Compact average rating (`★ 4.3 (12)`); renders nothing before the first review. */
export function StarRating({ average, count, className }: StarRatingProps) {
  const { t } = useT();

  if (count === 0) {
    return null;
  }

  return (
    <span
      className={cn("flex items-center gap-1 text-sm", className)}
      aria-label={t("learn.reviews.averageLabel", { average: average.toFixed(1), count })}
    >
      <StarIcon className="size-4 fill-amber-400 text-amber-400" />
      <span className="font-semibold tabular-nums">{average.toFixed(1)}</span>
      <span className="text-muted-foreground tabular-nums">({count})</span>
    </span>
  );
}
