"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeftIcon } from "lucide-react";
import { useGetCourseLeaderboard, useGetPublicCourseByPublicId } from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingQuery } from "@repo/shared";
import { Button } from "@repo/ui-web/components/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@repo/ui-web/components/card";
import { Skeleton } from "@repo/ui-web/components/skeleton";
import { toast } from "@repo/ui-web/components/sonner";
import { usePagination } from "@/hooks/use-pagination";
import { ChPagination, ChPaginationSkeleton } from "@/components/ch-pagination";
import { LEADERBOARD_LIST_CLASS, LeaderboardRow } from "./components/leaderboard-row";
import { PointsLegendDialog } from "./components/points-legend-dialog";

const PAGE_LIMIT = 20;
const SKELETON_ITEMS = Array.from({ length: 5 });

export default function LearnCourseLeaderboardPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const router = useRouter();
  const { t } = useT();
  const { page, setPage, trackTotalPages } = usePagination();

  const { data: course } = useGetPublicCourseByPublicId({ publicId });
  const {
    data: leaderboard,
    isPending,
    error,
  } = useGetCourseLeaderboard(
    { publicId },
    { page, limit: PAGE_LIMIT },
    { query: { retry: false } }
  );
  useErrorHandlingQuery({
    t: t as (key: string) => string,
    error,
    showToastError: ({ title, description }) => toast.error(title, { description }),
  });

  const { totalPages, knownTotalPages } = trackTotalPages(leaderboard?.pagination);
  const me = leaderboard?.me;
  const isMeOnPage = !!me && leaderboard.data.some((entry) => entry.user.id === me.user.id);

  return (
    <div className="flex min-h-svh flex-1 flex-col">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-1 border-b bg-background px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label={t("learn.detail.back")}
        >
          <ChevronLeftIcon className="size-5" />
        </Button>
        <span className="min-w-0 flex-1 truncate text-lg font-bold">
          {t("learn.leaderboard.title")}
          {course && <span className="font-normal text-muted-foreground"> · {course.name}</span>}
        </span>
        <PointsLegendDialog />
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col p-4 md:p-6">
        {isPending ? (
          <>
            <ul className="flex flex-col gap-4">
              {SKELETON_ITEMS.map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </ul>
            <ChPaginationSkeleton className="mt-6" page={page} totalPages={knownTotalPages} />
          </>
        ) : leaderboard?.data.length ? (
          <>
            <ul className={LEADERBOARD_LIST_CLASS}>
              {leaderboard.data.map((entry) => (
                <li key={entry.user.id} data-me={entry.user.id === me?.user.id || undefined}>
                  <LeaderboardRow entry={entry} isMe={entry.user.id === me?.user.id} />
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
              <CardTitle>{t("learn.leaderboard.empty")}</CardTitle>
              <CardDescription>{t("learn.leaderboard.emptyDescription")}</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      {me && !isMeOnPage && (
        <div
          className="sticky bottom-0 border-t bg-background px-4"
          aria-label={t("learn.leaderboard.yourPlace")}
        >
          <div className="mx-auto w-full max-w-2xl md:px-6">
            <LeaderboardRow entry={me} isMe className="-mx-3" />
          </div>
        </div>
      )}
    </div>
  );
}
