"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@repo/ui-web/components/button";
import { Skeleton } from "@repo/ui-web/components/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui-web/components/alert-dialog";
import { useT } from "@repo/i18n/client";

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
    <header className="sticky top-0 z-40 flex h-14 items-center gap-1 border-b bg-background px-4">
      <Button variant="ghost" size="icon" onClick={onBack} aria-label={t("learn.detail.back")}>
        <ChevronLeft className="size-5" />
      </Button>
      <span className="flex-1 text-lg font-bold">{title}</span>
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
          <AlertDialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("learn.detail.withdrawDialog.title")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("learn.detail.withdrawDialog.description")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("learn.detail.withdrawDialog.cancel")}</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={onWithdraw}>
                  {t("learn.detail.withdrawDialog.confirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : (
        <Button onClick={onEnroll} disabled={isEnrolling}>
          {isEnrolling ? t("learn.detail.enrolling") : t("learn.detail.enroll")}
        </Button>
      )}
    </header>
  );
}
