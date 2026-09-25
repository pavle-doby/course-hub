"use client";

import { ChevronDownIcon } from "lucide-react";
import { LessonProgressStatus } from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { Button } from "@repo/ui-web/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@repo/ui-web/components/dropdown-menu";
import { PROGRESS_STATUS_LABEL_KEYS } from "@/utils/consts";
import { ProgressStatusIcon } from "./progress-status-icon";

const STATUSES = Object.values(LessonProgressStatus);

type LessonStatusSelectProps = {
  status: LessonProgressStatus;
  onStatusChange: (status: LessonProgressStatus) => void;
};

export function LessonStatusSelect({ status, onStatusChange }: LessonStatusSelectProps) {
  const { t } = useT();

  function handleValueChange(value: string) {
    onStatusChange(value as LessonProgressStatus);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="shrink-0 gap-2">
          <ProgressStatusIcon status={status} />
          {t(PROGRESS_STATUS_LABEL_KEYS[status])}
          <ChevronDownIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel>{t("learn.progress.status")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={status} onValueChange={handleValueChange}>
          {STATUSES.map((option) => (
            <DropdownMenuRadioItem key={option} value={option} className="gap-2 whitespace-nowrap">
              <ProgressStatusIcon status={option} />
              {t(PROGRESS_STATUS_LABEL_KEYS[option])}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
