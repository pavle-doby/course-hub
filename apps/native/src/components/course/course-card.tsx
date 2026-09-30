import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { Link, type Href } from "expo-router";
import { BookOpenIcon } from "lucide-react-native";
import type { CourseWithStats, CourseWithStatsCreator } from "@repo/api-client";
import { useTranslation } from "@repo/i18n/native";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui-native/components/avatar";
import { Badge } from "@repo/ui-native/components/badge";
import { Card } from "@repo/ui-native/components/card";
import { Icon } from "@repo/ui-native/components/icon";
import { Progress } from "@repo/ui-native/components/progress";
import { Text } from "@repo/ui-native/components/text";
import { cn } from "@repo/ui-native/lib/utils";
import { courseCardColor } from "@/utils/course-card-color";
import { getProgressColor } from "@/utils/get-progress-color";
import { CourseStats } from "./course-stats";

type CourseCardProps = {
  course: CourseWithStats;
  href: Href;
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

function creatorInitials(creator?: CourseWithStatsCreator) {
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
  const { t } = useTranslation();
  const progressColor = progressPercent !== undefined && getProgressColor(progressPercent);

  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="link" className="active:opacity-80">
        <Card className="gap-0 overflow-hidden py-0">
          {course.thumbnailUrl ? (
            <Image
              source={{ uri: course.thumbnailUrl }}
              style={{ width: "100%", aspectRatio: 16 / 9 }}
              contentFit="cover"
            />
          ) : (
            <View
              className={cn(
                "aspect-video w-full items-center justify-center",
                courseCardColor(course.id)
              )}
            >
              <Icon as={BookOpenIcon} size={40} className="text-white dark:text-black" />
            </View>
          )}

          <View className="gap-2 p-4">
            <View className="flex-row items-center gap-2">
              <Avatar alt={course.creator?.username ?? ""}>
                {course.creator?.avatarUrl && (
                  <AvatarImage source={{ uri: course.creator.avatarUrl }} />
                )}
                <AvatarFallback>
                  <Text className="text-sm">{creatorInitials(course.creator)}</Text>
                </AvatarFallback>
              </Avatar>
              <Text className="flex-1 font-semibold" numberOfLines={1}>
                {course.name}
              </Text>
              {actions}
            </View>
            {progressColor && (
              <View
                className="flex-row items-center gap-2"
                accessible
                accessibilityLabel={t("learn.progress.courseProgress")}
              >
                <Progress
                  value={progressPercent}
                  className="flex-1"
                  indicatorClassName={progressColor.indicator}
                />
                <Text className={cn("text-sm font-bold tabular-nums", progressColor.text)}>
                  {progressPercent}%
                </Text>
              </View>
            )}
            {course.description && (
              <Text variant="muted" numberOfLines={3}>
                {course.description}
              </Text>
            )}
            <View className="flex-row items-center justify-between gap-2 pt-2">
              <CourseStats course={course} className="flex-1" />
              {showStatus && (
                <Badge variant={statusVariant[course.status]}>
                  <Text>{t(`courses.status.${course.status}`)}</Text>
                </Badge>
              )}
            </View>
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}
