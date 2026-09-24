"use client";

import { useState } from "react";
import { ChevronLeft, Star } from "lucide-react";
import { Button } from "@repo/ui-web/components/button";
import { Progress } from "@repo/ui-web/components/progress";
import { Skeleton } from "@repo/ui-web/components/skeleton";
import { cn } from "@repo/ui-web/lib/utils";
import { useT } from "@repo/i18n/client";
import { ChAlertDialog } from "@/components/ch-alert-dialog";
import { getProgressColor } from "@/utils/get-progress-color";

type LearnHeaderProps = {
  title: string;
  onBack: () => void;
  isEnrolled: boolean;
  isEnrolling: boolean;
  onEnroll: () => void;
  isWithdrawing: boolean;
  onWithdraw: () => void;
  onReview: () => void;
  isLoadingEnrollment?: boolean;
  /** Percent of lessons done; omitted when not enrolled. */
  progressPercent?: number;
};

export function LearnHeader({
  title,
  onBack,
  isEnrolled,
  isEnrolling,
  onEnroll,
  isWithdrawing,
  onWithdraw,
  onReview,
  isLoadingEnrollment = false,
  progressPercent,
}: LearnHeaderProps) {
  const { t } = useT();
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 grid grid-cols-[1fr_auto] items-center gap-2 border-b bg-background px-4 py-2 md:h-14 md:grid-cols-[1fr_auto_1fr] md:py-0">
      <span className="flex min-w-0 items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label={t("learn.detail.back")}>
          <ChevronLeft className="size-5" />
        </Button>
        <span className="max-w-40 min-w-0 flex-1 truncate text-lg font-bold">{title}</span>
      </span>

      {progressPercent !== undefined && (
        <span
          className={cn(
            "col-span-2 row-start-2 flex items-center gap-2 md:col-span-1 md:col-start-2 md:row-start-1",
            getProgressColor(progressPercent)
          )}
        >
          <Progress
            value={progressPercent}
            aria-label={t("learn.progress.courseProgress")}
            className="h-2 flex-1 md:w-40 md:flex-none"
          />
          <span className="text-sm font-bold tabular-nums">{progressPercent}%</span>
        </span>
      )}

      <span className="flex justify-end gap-2 md:col-start-3">
        {isLoadingEnrollment ? (
          <Skeleton className="h-9 w-24" />
        ) : isEnrolled ? (
          <>
            <Button variant="outline" onClick={onReview}>
              <Star className="size-4" />
              {t("learn.reviews.review")}
            </Button>
            <Button
              variant="outline"
              disabled={isWithdrawing}
              onClick={() => setWithdrawDialogOpen(true)}
            >
              {isWithdrawing ? t("learn.detail.withdrawing") : t("learn.detail.withdraw")}
            </Button>
            <ChAlertDialog
              open={withdrawDialogOpen}
              onOpenChange={setWithdrawDialogOpen}
              title={t("learn.detail.withdrawDialog.title")}
              description={t("learn.detail.withdrawDialog.description")}
              cancelLabel={t("learn.detail.withdrawDialog.cancel")}
              actionLabel={t("learn.detail.withdrawDialog.confirm")}
              actionProps={{ variant: "destructive", onClick: onWithdraw }}
            />
          </>
        ) : (
          <Button onClick={onEnroll} disabled={isEnrolling}>
            {isEnrolling ? t("learn.detail.enrolling") : t("learn.detail.enroll")}
          </Button>
        )}
      </span>
    </header>
  );
}
