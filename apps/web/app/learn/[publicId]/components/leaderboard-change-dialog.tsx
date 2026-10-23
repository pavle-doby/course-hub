"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useT } from "@repo/i18n/client";
import { Button } from "@repo/ui-web/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui-web/components/dialog";
import { cn } from "@repo/ui-web/lib/utils";
import type { LeaderboardPlaceChange } from "@/hooks/use-leaderboard-place-change";
import { LEADERBOARD_LIST_CLASS, LeaderboardRow } from "../leaderboard/components/leaderboard-row";

const SLIDE_DELAY_MS = 700;

type LeaderboardChangeDialogProps = {
  publicId: string;
  change?: LeaderboardPlaceChange;
  open: boolean;
  onClose: () => void;
};

/**
 * Shown after a completion moves the learner to another place: the learners around their new
 * place, with their own row sliding in from where it was.
 */
export function LeaderboardChangeDialog({
  publicId,
  change,
  open,
  onClose,
}: LeaderboardChangeDialogProps) {
  const { t } = useT();
  const [isSettled, setIsSettled] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    // Let the dialog finish opening, then slide the row so the move is actually seen.
    const timeout = setTimeout(() => setIsSettled(true), SLIDE_DELAY_MS);
    return () => {
      clearTimeout(timeout);
      setIsSettled(false);
    };
  }, [open]);

  if (!change?.before.me || !change.after.me) {
    return null;
  }
  const { before, after } = change;
  const me = after.me!;
  const myIndex = after.entries.findIndex((entry) => entry.user.id === me.user.id);
  // Rows to slide from: the place difference, kept inside the visible list.
  const offset = Math.max(
    -myIndex,
    Math.min(before.me!.place - me.place, after.entries.length - 1 - myIndex)
  );
  const isUp = me.place < before.me!.place;
  const pointsGained = me.points - before.me!.points;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isUp ? t("learn.leaderboard.change.titleUp") : t("learn.leaderboard.change.titleDown")}
          </DialogTitle>
          <DialogDescription>
            {t("learn.leaderboard.change.description", {
              from: before.me!.place,
              to: me.place,
            })}
            {pointsGained > 0 &&
              ` · ${t("learn.leaderboard.change.pointsGained", { count: pointsGained })}`}
          </DialogDescription>
        </DialogHeader>
        <ul className={cn(LEADERBOARD_LIST_CLASS, "overflow-hidden")}>
          {after.entries.map((entry) => {
            const isMe = entry.user.id === me.user.id;
            return (
              <li
                key={entry.user.id}
                data-me={isMe || undefined}
                className={cn(
                  isMe &&
                    "relative z-10 rounded-xl bg-background transition-transform duration-700 ease-out"
                )}
                style={
                  isMe ? { transform: `translateY(${isSettled ? 0 : offset * 100}%)` } : undefined
                }
              >
                <LeaderboardRow entry={entry} isMe={isMe} />
              </li>
            );
          })}
        </ul>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("learn.leaderboard.change.continue")}
          </Button>
          <Button asChild>
            <Link href={`/learn/${publicId}/leaderboard`}>
              {t("learn.leaderboard.change.viewAll")}
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
