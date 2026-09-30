import { View } from "react-native";
import { StarIcon } from "lucide-react-native";
import { useTranslation } from "@repo/i18n/native";
import { Icon } from "@repo/ui-native/components/icon";
import { Text } from "@repo/ui-native/components/text";
import { cn } from "@repo/ui-native/lib/utils";
import { STAR_FILL } from "@/utils/consts";

type StarRatingProps = {
  average: number;
  count: number;
  className?: string;
};

/** Compact average rating (`★ 4.3 (12)`); renders nothing before the first review. */
export function StarRating({ average, count, className }: StarRatingProps) {
  const { t } = useTranslation();

  if (count === 0) {
    return null;
  }

  return (
    <View
      className={cn("flex-row items-center gap-1", className)}
      accessible
      accessibilityLabel={t("learn.reviews.averageLabel", { average: average.toFixed(1), count })}
    >
      <Icon as={StarIcon} size={16} className="text-amber-400" fill={STAR_FILL} />
      <Text className="text-sm font-semibold tabular-nums">{average.toFixed(1)}</Text>
      <Text variant="muted" className="tabular-nums">
        ({count})
      </Text>
    </View>
  );
}
