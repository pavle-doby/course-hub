"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
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
import { FIREWORK_INTERVAL, FIREWORK_SIDES } from "@/utils/consts";

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
    // One soft burst per tick, alternating sides: low velocity and gravity with a slow decay
    // let the sparks float down gently instead of popping.
    let tick = 0;
    const interval = setInterval(() => {
      const [min, max] = FIREWORK_SIDES[tick++ % FIREWORK_SIDES.length] ?? FIREWORK_SIDES[0];
      void confetti({
        particleCount: 40,
        startVelocity: 18,
        spread: 360,
        gravity: 0.35,
        decay: 0.95,
        ticks: 260,
        scalar: 0.8,
        shapes: ["circle"],
        origin: { x: min + Math.random() * (max - min), y: 0.15 + Math.random() * 0.3 },
      });
    }, FIREWORK_INTERVAL);
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
