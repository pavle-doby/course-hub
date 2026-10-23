"use client";

import { InfoIcon } from "lucide-react";
import { LEADERBOARD_POINTS as POINTS } from "@repo/contract";
import { useT } from "@repo/i18n/client";
import { Button } from "@repo/ui-web/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui-web/components/dialog";

/** "How points work" button + dialog listing the values the API scores with. */
export function PointsLegendDialog() {
  const { t } = useT();
  const items = [
    { label: t("learn.leaderboard.legend.activeDay"), points: POINTS.ACTIVE_DAY },
    {
      label: t("learn.leaderboard.legend.streak", { days: POINTS.STREAK_DAYS }),
      points: POINTS.STREAK_BONUS,
    },
    { label: t("learn.leaderboard.legend.lessonDone"), points: POINTS.LESSON_DONE },
    { label: t("learn.leaderboard.legend.videoWatched"), points: POINTS.VIDEO_WATCHED },
    { label: t("learn.leaderboard.legend.topicDone"), points: POINTS.TOPIC_DONE },
    { label: t("learn.leaderboard.legend.quizFinished"), points: POINTS.QUIZ_FINISHED },
    { label: t("learn.leaderboard.legend.quizScore"), points: POINTS.QUIZ_SCORE_MAX },
    { label: t("learn.leaderboard.legend.courseDone"), points: POINTS.COURSE_DONE },
    { label: t("learn.leaderboard.legend.richCourseDone"), points: POINTS.RICH_COURSE_DONE },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("learn.leaderboard.howPointsWork")}>
          <InfoIcon className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("learn.leaderboard.howPointsWork")}</DialogTitle>
          <DialogDescription>{t("learn.leaderboard.legend.redo")}</DialogDescription>
        </DialogHeader>
        <ul className="flex flex-col divide-y text-sm">
          {items.map((item) => (
            <li key={item.label} className="flex justify-between gap-4 py-2">
              <span>{item.label}</span>
              <span className="shrink-0 font-semibold tabular-nums">+{item.points}</span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
