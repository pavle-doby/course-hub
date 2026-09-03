"use client";

import { ChevronLeft, ChevronRight, ListTree } from "lucide-react";
import { Button } from "@repo/ui-web/components/button";
import { useSidebar } from "@repo/ui-web/components/sidebar";
import { useT } from "@repo/i18n/client";

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
    <div className="sticky bottom-0 z-40 flex items-center justify-between gap-2 border-t bg-background px-4 py-1 md:hidden">
      <Button
        variant="ghost"
        size="sm"
        className="min-w-30"
        disabled={!hasPrevious}
        onClick={onPrevious}
      >
        <ChevronLeft className="size-4" />
        {t("learn.detail.previous")}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        aria-label={t("learn.detail.contents")}
      >
        <ListTree className="size-5" />
      </Button>
      <Button variant="ghost" size="sm" className="min-w-30" disabled={!hasNext} onClick={onNext}>
        {t("learn.detail.next")}
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
