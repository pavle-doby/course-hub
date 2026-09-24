"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { type Course, type CourseWithStats } from "@repo/api-client";
import { Card, CardContent } from "@repo/ui-web/components/card";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui-web/components/avatar";
import { Badge } from "@repo/ui-web/components/badge";
import { Progress } from "@repo/ui-web/components/progress";
import { useT } from "@repo/i18n/client";
import { BookOpen } from "lucide-react";
import { cn } from "@repo/ui-web/lib/utils";
import { courseCardGradient } from "@/utils/course-card-gradient";
import { getProgressColor } from "@/utils/get-progress-color";
import { CourseStats } from "@/components/course-stats";

type CourseCardProps = {
  course: CourseWithStats;
  href: string;
  /** Percent of lessons done; shown only for enrolled courses. */
  progressPercent?: number;
  /** Shows the draft/published/archived badge next to the stats. */
  showStatus?: boolean;
  /** Rendered next to the title, e.g. the three-dots action menu. */
  actions?: ReactNode;
};

const statusVariant = {
  draft: "secondary",
  published: "default",
  archived: "outline",
} as const;

function creatorInitials(creator: Course["creator"]) {
  const initials = `${creator?.firstName?.charAt(0) ?? ""}${creator?.lastName?.charAt(0) ?? ""}`;
  return initials || (creator?.username.charAt(0).toUpperCase() ?? "?");
}

export function CourseCard({
  course,
  href,
  progressPercent,
  showStatus,
  actions,
}: CourseCardProps) {
  const { t } = useT();

  return (
    // Stretched link (title's ::after covers the card) so the actions button isn't nested in <a>.
    <Card className="relative h-full w-full gap-0 py-0 transition-shadow hover:shadow-md">
      {course.thumbnailUrl ? (
        <Image
          src={course.thumbnailUrl}
          alt=""
          width={640}
          height={178}
          unoptimized
          className="aspect-video w-full object-cover"
        />
      ) : (
        <div
          className={cn(
            "flex aspect-video w-full items-center justify-center bg-gradient-to-br",
            courseCardGradient(course.id)
          )}
        >
          <BookOpen className="size-10 text-white dark:text-black" />
        </div>
      )}

      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <Avatar>
            {course.creator?.avatarUrl && (
              <AvatarImage src={course.creator.avatarUrl} alt={course.creator.username} />
            )}
            <AvatarFallback>{creatorInitials(course.creator)}</AvatarFallback>
          </Avatar>
          <h3 className="line-clamp-1 flex-1 font-semibold">
            <Link href={href} className="after:absolute after:inset-0">
              {course.name}
            </Link>
          </h3>
          {actions && <div className="relative z-10">{actions}</div>}
        </div>
        {progressPercent !== undefined && (
          <div className={cn("flex items-center gap-2", getProgressColor(progressPercent))}>
            <Progress
              value={progressPercent}
              aria-label={t("learn.progress.courseProgress")}
              className="h-2 flex-1"
            />
            <span className="text-sm font-bold tabular-nums">{progressPercent}%</span>
          </div>
        )}
        {course.description && (
          <p className="line-clamp-3 text-sm text-muted-foreground">{course.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <CourseStats course={course} />
          {showStatus && (
            <Badge variant={statusVariant[course.status]}>
              {t(`courses.status.${course.status}`)}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
