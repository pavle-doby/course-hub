"use client";

import { type CourseWithStats } from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { cn } from "@repo/ui-web/lib/utils";
import { Globe, Lock, Star, User } from "lucide-react";

type CourseStatsProps = {
  course: Pick<CourseWithStats, "enrolledCount" | "ratingAverage" | "ratingCount" | "visibility">;
  className?: string;
};

/** Course card stats row: enrolled students, rating average + count, and visibility. */
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
        <User className="size-4" />
        <span className="tabular-nums">{enrolledCount}</span>
      </span>
      <span
        className="flex items-center gap-1"
        aria-label={t("courses.card.ratingLabel", {
          average: course.ratingAverage.toFixed(1),
          count: course.ratingCount,
        })}
      >
        <Star className={cn("size-4", course.ratingCount > 0 && "fill-amber-400 text-amber-400")} />
        {course.ratingCount > 0 && (
          <span className="font-semibold text-foreground tabular-nums">
            {course.ratingAverage.toFixed(1)}
          </span>
        )}
        <span className="tabular-nums">({course.ratingCount})</span>
      </span>
      <span className="flex items-center gap-1">
        {isPublic ? <Globe className="size-4" /> : <Lock className="size-4" />}
        {isPublic ? t("courses.editor.visibilityPublic") : t("courses.editor.visibilityPrivate")}
      </span>
    </div>
  );
}
