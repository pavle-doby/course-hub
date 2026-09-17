"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@repo/ui-web/components/button";
import { Skeleton } from "@repo/ui-web/components/skeleton";
import { useT } from "@repo/i18n/client";
import { ChAlertDialog } from "@/components/ch-alert-dialog";

type LearnHeaderProps = {
  title: string;
  onBack: () => void;
  isEnrolled: boolean;
  isEnrolling: boolean;
  onEnroll: () => void;
  isWithdrawing: boolean;
  onWithdraw: () => void;
  isLoadingEnrollment?: boolean;
};

export function LearnHeader({
  title,
  onBack,
  isEnrolled,
  isEnrolling,
  onEnroll,
  isWithdrawing,
  onWithdraw,
  isLoadingEnrollment = false,
}: LearnHeaderProps) {
  const { t } = useT();
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-1 border-b bg-background px-4">
      <span className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label={t("learn.detail.back")}>
          <ChevronLeft className="size-5" />
        </Button>
        <span className="max-w-40 min-w-0 flex-1 truncate text-lg font-bold">{title}</span>
      </span>

      {isLoadingEnrollment ? (
        <Skeleton className="h-9 w-24" />
      ) : isEnrolled ? (
        <>
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
    </header>
  );
}
