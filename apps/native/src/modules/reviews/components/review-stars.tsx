import { Pressable, View } from "react-native";
import { StarIcon } from "lucide-react-native";
import { useTranslation } from "@repo/i18n/native";
import { Icon } from "@repo/ui-native/components/icon";
import { cn } from "@repo/ui-native/lib/utils";
import { STAR_FILL } from "@/utils/consts";

const RATINGS = [1, 2, 3, 4, 5] as const;

type ReviewStarsProps = {
  rating?: number;
  /** Makes the stars a 1–5 picker; read-only when omitted. */
  onRatingChange?: (rating: number) => void;
  className?: string;
};

/** A review's 1–5 stars (web: `ReviewStars`). */
export function ReviewStars({ rating = 0, onRatingChange, className }: ReviewStarsProps) {
  const { t } = useTranslation();

  if (!onRatingChange) {
    return (
      <View
        className={cn("flex-row gap-0.5", className)}
        accessible
        accessibilityLabel={t("learn.reviews.starsLabel", { rating })}
      >
        {RATINGS.map((value) => (
          <Icon
            key={value}
            as={StarIcon}
            size={16}
            className={value <= rating ? "text-amber-400" : "text-muted-foreground/40"}
            fill={value <= rating ? STAR_FILL : "none"}
          />
        ))}
      </View>
    );
  }

  return (
    <View
      className={cn("flex-row", className)}
      accessibilityRole="radiogroup"
      accessibilityLabel={t("learn.reviews.rating")}
    >
      {RATINGS.map((value) => (
        <Pressable
          key={value}
          className="rounded-md p-1 active:scale-110"
          accessibilityRole="radio"
          accessibilityState={{ checked: value === rating }}
          accessibilityLabel={t("learn.reviews.starsLabel", { rating: value })}
          hitSlop={4}
          onPress={() => onRatingChange(value)}
        >
          <Icon
            as={StarIcon}
            size={32}
            className={value <= rating ? "text-amber-400" : "text-muted-foreground/40"}
            fill={value <= rating ? STAR_FILL : "none"}
          />
        </Pressable>
      ))}
    </View>
  );
}
