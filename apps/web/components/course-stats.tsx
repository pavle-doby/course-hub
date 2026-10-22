"use client";

import { type CourseWithStats } from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { cn } from "@repo/ui-web/lib/utils";
import { GlobeIcon, LockIcon, StarIcon, TagIcon, UserIcon } from "lucide-react";
import { formatPrice } from "@/utils/format-price";

type CourseStatsProps = {
  course: Pick<
    CourseWithStats,
    "enrolledCount" | "ratingAverage" | "ratingCount" | "visibility" | "price"
  >;
  className?: string;
};

/** Course card stats row: enrolled students, rating average + count, visibility, and price. */
export function CourseStats({ course, className }: CourseStatsProps) {
  const { t, i18n } = useT();

  const isPublic = course.visibility === "public";
  const enrolledCount = new Intl.NumberFormat(i18n.language, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(course.enrolledCount);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground",
        className
      )}
    >
      <span
        className="flex items-center gap-1"
        aria-label={t("courses.card.enrolledLabel", { count: course.enrolledCount })}
      >
        <UserIcon className="size-4" />
        <span className="tabular-nums">{enrolledCount}</span>
      </span>
      <span
        className="flex items-center gap-1"
        aria-label={t("courses.card.ratingLabel", {
          average: course.ratingAverage.toFixed(1),
          count: course.ratingCount,
        })}
      >
        <StarIcon
          className={cn("size-4", course.ratingCount > 0 && "fill-amber-400 text-amber-400")}
        />
        {course.ratingCount > 0 && (
          <span className="font-semibold text-foreground tabular-nums">
            {course.ratingAverage.toFixed(1)}
          </span>
        )}
        <span className="tabular-nums">({course.ratingCount})</span>
      </span>
      <span className="flex items-center gap-1">
        {isPublic ? <GlobeIcon className="size-4" /> : <LockIcon className="size-4" />}
        {isPublic ? t("courses.editor.visibilityPublic") : t("courses.editor.visibilityPrivate")}
      </span>
      {/* pushed right while the row has room; wraps onto its own line (still right-aligned) when it doesn't */}
      <span className="ml-auto flex shrink-0 items-center gap-1 whitespace-nowrap">
        <TagIcon className="size-4" />
        <span className="font-semibold text-foreground tabular-nums">
          {course.price > 0 ? formatPrice(course.price, i18n.language) : t("courses.card.free")}
        </span>
      </span>
    </div>
  );
}
