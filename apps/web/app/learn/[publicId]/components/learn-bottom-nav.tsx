"use client";

import { ChevronLeftIcon, ChevronRightIcon, ListTreeIcon } from "lucide-react";
import { Button } from "@repo/ui-web/components/button";
import { useSidebar } from "@repo/ui-web/components/sidebar";
import { useT } from "@repo/i18n/client";
import { ChBottomNav } from "@/components/ch-bottom-nav";

type LearnBottomNavProps = {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

/** Mobile-only reader footer: previous/contents/next nav bar. */
export function LearnBottomNav({ hasPrevious, hasNext, onPrevious, onNext }: LearnBottomNavProps) {
  const { t } = useT();
  const { toggleSidebar } = useSidebar();

  return (
    <ChBottomNav className="sticky">
      <div className="flex flex-1 items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="min-w-30"
          disabled={!hasPrevious}
          onClick={onPrevious}
        >
          <ChevronLeftIcon className="size-4" />
          {t("learn.detail.previous")}
        </Button>
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={toggleSidebar}
          aria-label={t("learn.detail.contents")}
        >
          <ListTreeIcon className="size-5" />
        </Button>
        <Button variant="ghost" size="sm" className="min-w-30" disabled={!hasNext} onClick={onNext}>
          {t("learn.detail.next")}
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>
    </ChBottomNav>
  );
}
