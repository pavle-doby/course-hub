import { useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
  getCourseReviews,
  getGetCourseReviewsQueryKey,
  useGetEnrollmentStatus,
  useGetPublicCourseByPublicId,
  useGetUserSelf,
} from "@repo/api-client";
import { useTranslation } from "@repo/i18n/native";
import { useErrorHandlingQuery } from "@repo/shared";
import { Separator } from "@repo/ui-native/components/separator";
import { Skeleton } from "@repo/ui-native/components/skeleton";
import { ReviewDialog } from "@/modules/reviews/components/review-dialog";
import { ReviewItem } from "@/modules/reviews/components/review-item";
import { ReviewsEmpty } from "@/modules/reviews/components/reviews-empty";
import { ReviewsHeader } from "@/modules/reviews/components/reviews-header";
import { useInfiniteList } from "@/hooks/use-infinite-list";
import { REVIEW_PAGE_LIMIT } from "@/utils/consts";
import { showToastError } from "@/utils/toast-error";

const SKELETON_ITEMS = Array.from({ length: 3 }, (_, i) => i);

export default function CourseReviewsScreen() {
  const { publicId } = useLocalSearchParams<{ publicId: string }>();
  const { t } = useTranslation();
  const [replyingToId, setReplyingToId] = useState<string>();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  const { data: course } = useGetPublicCourseByPublicId({ publicId });
  const { data: currentUser } = useGetUserSelf();
  const isCreator = !!course && course.creatorId === currentUser?.id;
  const { data: enrollmentStatus } = useGetEnrollmentStatus(
    { publicId },
    { query: { retry: false } }
  );
  const isEnrolled = !!enrollmentStatus?.enrolled;

  const params = { limit: REVIEW_PAGE_LIMIT };
  const list = useInfiniteList({
    queryKey: getGetCourseReviewsQueryKey({ publicId }, params),
    fetchPage: (page, signal) =>
      getCourseReviews({ publicId }, { ...params, page }, undefined, signal),
  });
  const { items, isPending, isRefetching, isFetchingNextPage, hasNextPage, error } = list;
  useErrorHandlingQuery({ t: t as (key: string) => string, error, showToastError });

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(`/learn/${publicId}`);
    }
  }

  function handleOpenReview() {
    setIsReviewDialogOpen(true);
  }

  function handleEndReached() {
    if (hasNextPage && !isFetchingNextPage) {
      void list.fetchNextPage();
    }
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
      <ReviewsHeader
        course={course}
        onBack={handleBack}
        onReview={isEnrolled ? handleOpenReview : undefined}
      />
      {/* Reply form: taps on Save work with the keyboard open, and it doesn't cover the input */}
      <FlatList
        className="flex-1"
        contentContainerClassName="px-4 pb-4"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
        data={isPending ? [] : items}
        keyExtractor={(review) => review.id}
        ItemSeparatorComponent={Separator}
        renderItem={({ item }) => (
          <ReviewItem
            publicId={publicId}
            review={item}
            canReply={isCreator}
            isReplying={replyingToId === item.id}
            onReplyingChange={(isReplying) => setReplyingToId(isReplying ? item.id : undefined)}
          />
        )}
        ListEmptyComponent={
          isPending ? (
            <View className="gap-4 pt-4">
              {SKELETON_ITEMS.map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </View>
          ) : (
            <View className="pt-4">
              <ReviewsEmpty onWriteReview={isEnrolled ? handleOpenReview : undefined} />
            </View>
          )
        }
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator className="py-4" /> : null}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={() => void list.refetch()}
      />
      {isEnrolled && (
        <ReviewDialog
          publicId={publicId}
          open={isReviewDialogOpen}
          onOpenChange={setIsReviewDialogOpen}
        />
      )}
    </SafeAreaView>
  );
}
