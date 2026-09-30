import { CircleCheckBigIcon, CircleDashedIcon, CircleIcon } from "lucide-react-native";
import type { LessonProgressStatus } from "@repo/api-client";
import { useTranslation } from "@repo/i18n/native";
import { Icon } from "@repo/ui-native/components/icon";
import { cn } from "@repo/ui-native/lib/utils";
import { PROGRESS_STATUS_LABEL_KEYS } from "@/utils/consts";

// Web uses CircleDashedCheckIcon, which lucide-react-native doesn't ship.
const STATUS_ICONS = {
  todo: CircleIcon,
  in_progress: CircleDashedIcon,
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
  const { t } = useTranslation();

  return (
    <Icon
      as={STATUS_ICONS[status]}
      size={16}
      accessibilityRole="image"
      accessibilityLabel={t(PROGRESS_STATUS_LABEL_KEYS[status])}
      className={cn(STATUS_COLORS[status], className)}
    />
  );
}
