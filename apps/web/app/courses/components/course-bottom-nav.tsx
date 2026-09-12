"use client";

import { ChevronLeft, ChevronRight, ListTree, TableOfContents } from "lucide-react";
import { Button } from "@repo/ui-web/components/button";
import { useSidebar } from "@repo/ui-web/components/sidebar";
import { useT } from "@repo/i18n/client";

type CourseBottomNavProps = {
  isSaving?: boolean;
  onCancel: () => void;
  onSave: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onOpenActions: () => void;
};

/** Mobile-only editor footer: cancel/save above a previous/contents/next nav bar. */
export function CourseBottomNav({
  isSaving,
  onCancel,
  onSave,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  onOpenActions,
}: CourseBottomNavProps) {
  const { t } = useT();
  const { toggleSidebar } = useSidebar();

  return (
    <div className="sticky bottom-0 z-40 flex flex-col border-t bg-background md:hidden">
      <div className="flex items-center gap-2 px-4 py-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onCancel}>
          {t("courses.editor.cancel")}
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={onSave} disabled={isSaving}>
          {isSaving ? t("courses.editor.saving") : t("courses.editor.save")}
        </Button>
      </div>
      <div className="flex items-center justify-between gap-2 border-t px-4 py-1">
        <Button
          variant="ghost"
          size="sm"
          className="min-w-30"
          disabled={!hasPrevious}
          onClick={onPrevious}
        >
          <ChevronLeft className="size-4" />
          {t("courses.editor.previous")}
        </Button>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label={t("courses.editor.contents")}
          >
            <ListTree className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenActions}
            aria-label={t("courses.editor.actions")}
          >
            <TableOfContents className="size-5" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="min-w-30" disabled={!hasNext} onClick={onNext}>
          {t("courses.editor.next")}
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
