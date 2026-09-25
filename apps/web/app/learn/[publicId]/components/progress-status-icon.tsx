import { CircleIcon, CircleCheckBigIcon, CircleDashedCheckIcon } from "lucide-react";
import type { LessonProgressStatus } from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { cn } from "@repo/ui-web/lib/utils";
import { PROGRESS_STATUS_LABEL_KEYS } from "@/utils/consts";

const STATUS_ICONS = {
  todo: CircleIcon,
  in_progress: CircleDashedCheckIcon,
  done: CircleCheckBigIcon,
} as const;

const STATUS_COLORS = {
  todo: "text-muted-foreground",
  in_progress: "text-blue-600 dark:text-blue-400",
  done: "text-green-600 dark:text-green-400",
} as const;

type ProgressStatusIconProps = {
  status: LessonProgressStatus;
  className?: string;
};

export function ProgressStatusIcon({ status, className }: ProgressStatusIconProps) {
  const { t } = useT();
  const Icon = STATUS_ICONS[status];

  return (
    <Icon
      role="img"
      aria-label={t(PROGRESS_STATUS_LABEL_KEYS[status])}
      className={cn("size-4 shrink-0", STATUS_COLORS[status], className)}
    />
  );
}
