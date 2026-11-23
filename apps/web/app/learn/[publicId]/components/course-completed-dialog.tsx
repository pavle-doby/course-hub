"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { StarIcon } from "lucide-react";
import { useT } from "@repo/i18n/client";
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
import { fireworkBurst } from "@/utils/celebrate";
import { FIREWORK_INTERVAL } from "@/utils/consts";

type CourseCompletedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Set while the learner has no review yet; swaps "Thank you" for a Review button. */
  onReview?: () => void;
};

/** Congratulations dialog for a just-finished course; fireworks run while it is open. */
export function CourseCompletedDialog({
  open,
  onOpenChange,
  onReview,
}: CourseCompletedDialogProps) {
  const { t } = useT();
  const router = useRouter();

  useEffect(() => {
    if (!open) {
      return;
    }
    // One soft burst per tick, alternating sides
    let tick = 0;
    const interval = setInterval(() => fireworkBurst(tick++), FIREWORK_INTERVAL);
    return () => clearInterval(interval);
  }, [open]);

  function handleNewCourse() {
    router.push("/learn/explore");
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("learn.completed.title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("learn.completed.description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {onReview ? (
            <>
              <AlertDialogAction variant="outline" onClick={handleNewCourse}>
                {t("learn.completed.newCourse")}
              </AlertDialogAction>
              <AlertDialogAction onClick={onReview}>
                <StarIcon className="size-4" />
                {t("learn.reviews.review")}
              </AlertDialogAction>
            </>
          ) : (
            <>
              <AlertDialogCancel>{t("learn.completed.thankYou")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleNewCourse}>
                {t("learn.completed.newCourse")}
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
