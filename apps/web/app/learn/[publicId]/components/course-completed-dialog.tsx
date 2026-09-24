"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { useT } from "@repo/i18n/client";
import { Button } from "@repo/ui-web/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui-web/components/dialog";
import { FIREWORK_INTERVAL, FIREWORK_SIDES } from "@/utils/consts";

type CourseCompletedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Congratulations dialog for a just-finished course; fireworks run while it is open. */
export function CourseCompletedDialog({ open, onOpenChange }: CourseCompletedDialogProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("learn.completed.title")}</DialogTitle>
          <DialogDescription>{t("learn.completed.description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("learn.completed.thankYou")}</Button>
          </DialogClose>
          <Button onClick={handleNewCourse}>{t("learn.completed.newCourse")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
