import { View } from "react-native";
import { ChevronLeftIcon, StarIcon } from "lucide-react-native";
import { useTranslation } from "@repo/i18n/native";
import { Button } from "@repo/ui-native/components/button";
import { Icon } from "@repo/ui-native/components/icon";
import { Text } from "@repo/ui-native/components/text";
import { StarRating } from "@/components/star-rating";

type ReviewsHeaderProps = {
  course?: { name: string; ratingAverage: number; ratingCount: number };
  onBack: () => void;
  /** Shown to enrolled learners: write or edit their review. */
  onReview?: () => void;
};

/** Reviews screen header: back, title + course name, rating summary, review action. */
export function ReviewsHeader({ course, onBack, onReview }: ReviewsHeaderProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-1 border-b border-border bg-background px-2 py-2">
      <Button
        variant="ghost"
        size="icon"
        onPress={onBack}
        accessibilityLabel={t("learn.detail.back")}
      >
        <Icon as={ChevronLeftIcon} size={20} />
      </Button>
      <Text className="flex-1 text-lg font-bold" numberOfLines={1}>
        {t("learn.reviews.title")}
        {course && <Text className="font-normal text-muted-foreground"> · {course.name}</Text>}
      </Text>
      {course && <StarRating average={course.ratingAverage} count={course.ratingCount} />}
      {onReview && (
        <Button
          variant="outline"
          size="icon"
          className="ml-1"
          onPress={onReview}
          accessibilityLabel={t("learn.reviews.review")}
        >
          <Icon as={StarIcon} size={16} />
        </Button>
      )}
    </View>
  );
}
