"use client";

import {
  ChevronLeft,
  ChevronRight,
  ListTree,
  SaveIcon,
  TableOfContents,
  XIcon,
} from "lucide-react";
import { Button } from "@repo/ui-web/components/button";
import { useSidebar } from "@repo/ui-web/components/sidebar";
import { useT } from "@repo/i18n/client";
import { ChBottomNav } from "@/components/ch-bottom-nav";

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
    <div className="sticky bottom-0 z-40 flex flex-col md:hidden">
      <div className="flex items-center gap-2 bg-background px-4 py-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onCancel}>
          <XIcon />
          {t("courses.editor.cancel")}
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={onSave} disabled={isSaving}>
          <SaveIcon />
          {isSaving ? t("courses.editor.saving") : t("courses.editor.save")}
        </Button>
      </div>

      <ChBottomNav className="static">
        <div className="flex flex-1 items-center justify-between">
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
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={toggleSidebar}
            aria-label={t("courses.editor.contents")}
          >
            <ListTree className="size-5" />
          </Button>
          <Button
            size="icon-lg"
            variant="ghost"
            aria-label={t("courses.editor.actions")}
            onClick={onOpenActions}
          >
            <TableOfContents className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="min-w-30"
            disabled={!hasNext}
            onClick={onNext}
          >
            {t("courses.editor.next")}
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </ChBottomNav>
    </div>
  );
}
