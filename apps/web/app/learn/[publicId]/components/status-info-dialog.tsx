"use client";

import { InfoIcon } from "lucide-react";
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

const RULE_KEYS = {
  topic: [
    "learn.progress.statusInfo.topic.lessons",
    "learn.progress.statusInfo.topic.video",
    "learn.progress.statusInfo.topic.quiz",
  ],
  course: [
    "learn.progress.statusInfo.course.topics",
    "learn.progress.statusInfo.course.quiz",
    "learn.progress.statusInfo.course.video",
  ],
} as const;

type StatusInfoDialogProps = {
  type: "topic" | "course";
};

/** Info button next to a topic/course status: what it takes to get that item to Done. */
export function StatusInfoDialog({ type }: StatusInfoDialogProps) {
  const { t } = useT();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0"
          aria-label={t(`learn.progress.statusInfo.${type}.title`)}
        >
          <InfoIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(`learn.progress.statusInfo.${type}.title`)}</DialogTitle>
          <DialogDescription>{t("learn.progress.statusInfo.description")}</DialogDescription>
        </DialogHeader>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-sm">
          {RULE_KEYS[type].map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
