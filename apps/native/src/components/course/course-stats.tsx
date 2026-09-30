import { View } from "react-native";
import { GlobeIcon, LockIcon, StarIcon, UserIcon } from "lucide-react-native";
import type { CourseWithStats } from "@repo/api-client";
import { useTranslation } from "@repo/i18n/native";
import { Icon } from "@repo/ui-native/components/icon";
import { Text } from "@repo/ui-native/components/text";
import { cn } from "@repo/ui-native/lib/utils";
import { STAR_FILL } from "@/utils/consts";

type CourseStatsProps = {
  course: Pick<CourseWithStats, "enrolledCount" | "ratingAverage" | "ratingCount" | "visibility">;
  className?: string;
};

/** Course card stats row: enrolled students, rating average + count, and visibility. */
export function CourseStats({ course, className }: CourseStatsProps) {
  const { t, i18n } = useTranslation();

  const isPublic = course.visibility === "public";
  const hasRating = course.ratingCount > 0;
  const enrolledCount = new Intl.NumberFormat(i18n.language, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(course.enrolledCount);

  return (
    <View className={cn("flex-row flex-wrap items-center gap-x-4 gap-y-2", className)}>
      <View
        className="flex-row items-center gap-1"
        accessible
        accessibilityLabel={t("courses.card.enrolledLabel", { count: course.enrolledCount })}
      >
        <Icon as={UserIcon} size={16} className="text-muted-foreground" />
        <Text variant="muted" className="tabular-nums">
          {enrolledCount}
        </Text>
      </View>
      <View
        className="flex-row items-center gap-1"
        accessible
        accessibilityLabel={t("courses.card.ratingLabel", {
          average: course.ratingAverage.toFixed(1),
          count: course.ratingCount,
        })}
      >
        <Icon
          as={StarIcon}
          size={16}
          className={hasRating ? "text-amber-400" : "text-muted-foreground"}
          fill={hasRating ? STAR_FILL : "none"}
        />
        {hasRating && (
          <Text className="text-sm font-semibold tabular-nums">
            {course.ratingAverage.toFixed(1)}
          </Text>
        )}
        <Text variant="muted" className="tabular-nums">
          ({course.ratingCount})
        </Text>
      </View>
      <View className="flex-row items-center gap-1">
        <Icon as={isPublic ? GlobeIcon : LockIcon} size={16} className="text-muted-foreground" />
        <Text variant="muted">
          {isPublic ? t("courses.editor.visibilityPublic") : t("courses.editor.visibilityPrivate")}
        </Text>
      </View>
    </View>
  );
}
