"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, MessageSquareReply } from "lucide-react";
import {
  useGetCourseReviews,
  useGetEnrollmentStatus,
  useGetPublicCourseByPublicId,
  useGetUserSelf,
} from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingQuery } from "@repo/shared";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui-web/components/avatar";
import { Button } from "@repo/ui-web/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui-web/components/card";
import { Skeleton } from "@repo/ui-web/components/skeleton";
import { toast } from "@repo/ui-web/components/sonner";
import { usePagination } from "@/hooks/use-pagination";
import { ChPagination, ChPaginationSkeleton } from "@/components/ch-pagination";
import { StarRating } from "@/components/star-rating";
import { getAccessToken } from "@/utils/token-storage";
import { ReviewDialog } from "../components/review-dialog";
import { ReviewStars } from "../components/review-stars";
import { ReviewReplyForm } from "./components/review-reply-form";

const PAGE_LIMIT = 10;
const SKELETON_ITEMS = Array.from({ length: 3 });

export default function LearnCourseReviewsPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const router = useRouter();
  const { t } = useT();
  const { page, setPage, trackTotalPages } = usePagination();
  const [replyingToId, setReplyingToId] = useState<string>();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  const { data: course } = useGetPublicCourseByPublicId({ publicId });
  const { data: currentUser } = useGetUserSelf({
    query: { enabled: Boolean(getAccessToken()), retry: false },
  });
  const isCreator = !!course && course.creatorId === currentUser?.id;
  const { data: enrollmentStatus } = useGetEnrollmentStatus(
    { publicId },
    { query: { enabled: !!currentUser, retry: false } }
  );
  const isEnrolled = !!enrollmentStatus?.enrolled;
  const {
    data: reviews,
    isPending,
    error,
  } = useGetCourseReviews({ publicId }, { page, limit: PAGE_LIMIT });
  useErrorHandlingQuery({
    t: t as (key: string) => string,
    error,
    showToastError: ({ title, description }) => toast.error(title, { description }),
  });

  const { totalPages, knownTotalPages } = trackTotalPages(reviews?.pagination);

  return (
    <div className="flex min-h-svh flex-1 flex-col">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-1 border-b bg-background px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label={t("learn.detail.back")}
        >
          <ChevronLeft className="size-5" />
        </Button>
        <span className="min-w-0 flex-1 truncate text-lg font-bold">
          {t("learn.reviews.title")}
          {course && <span className="font-normal text-muted-foreground"> · {course.name}</span>}
        </span>
        {course && <StarRating average={course.ratingAverage} count={course.ratingCount} />}
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col p-4 md:p-6">
        {isPending ? (
          <>
            <ul className="flex flex-col gap-4">
              {SKELETON_ITEMS.map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </ul>
            <ChPaginationSkeleton className="mt-6" page={page} totalPages={knownTotalPages} />
          </>
        ) : reviews?.data.length ? (
          <>
            <ul className="flex flex-col divide-y">
              {reviews.data.map((review) => (
                <li key={review.id} className="flex gap-3 py-4">
                  <Avatar>
                    {review.author.avatarUrl && (
                      <AvatarImage src={review.author.avatarUrl} alt={review.author.username} />
                    )}
                    <AvatarFallback>
                      {review.author.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-x-2">
                      <span className="font-semibold">
                        {[review.author.firstName, review.author.lastName]
                          .filter(Boolean)
                          .join(" ") || review.author.username}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <ReviewStars rating={review.rating} />
                    {review.comment && (
                      <p className="text-sm whitespace-pre-line">{review.comment}</p>
                    )}
                    {replyingToId === review.id ? (
                      <ReviewReplyForm
                        publicId={publicId}
                        reviewId={review.id}
                        reply={review.reply}
                        onDone={() => setReplyingToId(undefined)}
                      />
                    ) : (
                      review.reply && (
                        <div className="mt-2 rounded-md border-l-2 border-primary bg-muted/50 px-3 py-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold">{t("learn.reviews.creatorReply")}</span>
                            {review.repliedAt && (
                              <span className="text-muted-foreground">
                                {new Date(review.repliedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-sm whitespace-pre-line">{review.reply}</p>
                        </div>
                      )
                    )}
                    {isCreator && replyingToId !== review.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="self-start"
                        onClick={() => setReplyingToId(review.id)}
                      >
                        <MessageSquareReply className="size-4" />
                        {review.reply ? t("learn.reviews.editReply") : t("learn.reviews.reply")}
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <ChPagination
              className="mt-6"
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              previousLabel={t("learn.pagination.previous")}
              nextLabel={t("learn.pagination.next")}
            />
          </>
        ) : (
          <Card className="text-center">
            <CardHeader>
              <CardTitle>{t("learn.reviews.empty")}</CardTitle>
              <CardDescription>{t("learn.reviews.emptyDescription")}</CardDescription>
            </CardHeader>
            {isEnrolled && (
              <CardFooter className="justify-center border-t py-4">
                <Button onClick={() => setIsReviewDialogOpen(true)}>
                  {t("learn.reviews.writeFirst")}
                </Button>
              </CardFooter>
            )}
          </Card>
        )}
      </div>
      {isEnrolled && (
        <ReviewDialog
          publicId={publicId}
          open={isReviewDialogOpen}
          onOpenChange={setIsReviewDialogOpen}
        />
      )}
    </div>
  );
}
