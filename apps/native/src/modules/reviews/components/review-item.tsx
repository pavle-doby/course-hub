import { View } from "react-native";
import { MessageSquareReplyIcon } from "lucide-react-native";
import type { CourseReview } from "@repo/api-client";
import { useTranslation } from "@repo/i18n/native";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui-native/components/avatar";
import { Button } from "@repo/ui-native/components/button";
import { Icon } from "@repo/ui-native/components/icon";
import { Text } from "@repo/ui-native/components/text";
import { ReviewReplyForm } from "./review-reply-form";
import { ReviewStars } from "./review-stars";

type ReviewItemProps = {
  publicId: string;
  review: CourseReview;
  /** The course creator can reply to reviews. */
  canReply: boolean;
  isReplying: boolean;
  onReplyingChange: (isReplying: boolean) => void;
};

/** One review: author, date, stars, comment, and the creator's reply (web: reviews page item). */
export function ReviewItem({
  publicId,
  review,
  canReply,
  isReplying,
  onReplyingChange,
}: ReviewItemProps) {
  const { t, i18n } = useTranslation();
  const { author } = review;
  const authorName =
    [author.firstName, author.lastName].filter(Boolean).join(" ") || author.username;

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(i18n.language);
  }

  return (
    <View className="flex-row gap-3 py-4">
      <Avatar alt={author.username}>
        {author.avatarUrl && <AvatarImage source={{ uri: author.avatarUrl }} />}
        <AvatarFallback>
          <Text className="text-sm">{author.username.charAt(0).toUpperCase()}</Text>
        </AvatarFallback>
      </Avatar>
      <View className="min-w-0 flex-1 gap-1">
        <View className="flex-row flex-wrap items-center gap-x-2">
          <Text className="font-semibold">{authorName}</Text>
          <Text variant="muted">{formatDate(review.updatedAt)}</Text>
        </View>
        <ReviewStars rating={review.rating} />
        {review.comment && <Text className="text-sm">{review.comment}</Text>}

        {isReplying ? (
          <ReviewReplyForm
            publicId={publicId}
            reviewId={review.id}
            reply={review.reply}
            onDone={() => onReplyingChange(false)}
          />
        ) : (
          review.reply && (
            <View className="mt-2 rounded-md border-l-2 border-primary bg-muted/50 px-3 py-2">
              <View className="flex-row items-center gap-2">
                <Text className="text-sm font-semibold">{t("learn.reviews.creatorReply")}</Text>
                {review.repliedAt && <Text variant="muted">{formatDate(review.repliedAt)}</Text>}
              </View>
              <Text className="text-sm">{review.reply}</Text>
            </View>
          )
        )}

        {canReply && !isReplying && (
          <Button
            variant="ghost"
            size="sm"
            className="self-start"
            onPress={() => onReplyingChange(true)}
          >
            <Icon as={MessageSquareReplyIcon} size={16} />
            <Text>{review.reply ? t("learn.reviews.editReply") : t("learn.reviews.reply")}</Text>
          </Button>
        )}
      </View>
    </View>
  );
}
