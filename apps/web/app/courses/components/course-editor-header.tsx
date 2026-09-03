"use client";

import { ChevronLeft } from "lucide-react";
import { Button } from "@repo/ui-web/components/button";
import { Switch } from "@repo/ui-web/components/switch";
import { Label } from "@repo/ui-web/components/label";
import { useT } from "@repo/i18n/client";

type CourseEditorHeaderProps = {
  title: string;
  autoSave: boolean;
  onAutoSaveChange: (value: boolean) => void;
  isSaving?: boolean;
  isPublished: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSave: () => void;
  onPublish: () => void;
};

export function CourseEditorHeader({
  title,
  autoSave,
  onAutoSaveChange,
  isSaving,
  isPublished,
  onBack,
  onCancel,
  onSave,
  onPublish,
}: CourseEditorHeaderProps) {
  const { t } = useT();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b bg-background px-4 py-2 md:grid md:h-14 md:grid-cols-3 md:py-0">
      <div className="flex min-w-0 items-center gap-1 justify-self-start">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label={t("courses.editor.back")}>
          <ChevronLeft className="size-5" />
        </Button>
        <span className="truncate text-lg font-bold">{title}</span>
      </div>

      <Label className="flex items-center gap-2 text-sm md:justify-self-center">
        <span>{t("courses.editor.autoSave")}</span>
        <Switch checked={autoSave} onCheckedChange={onAutoSaveChange} />
      </Label>

      <div className="hidden items-center gap-2 justify-self-end md:flex">
        <Button variant="outline" onClick={onCancel}>
          {t("courses.editor.cancel")}
        </Button>
        <Button variant="outline" onClick={onSave} disabled={isSaving}>
          {isSaving ? t("courses.editor.saving") : t("courses.editor.save")}
        </Button>
        <Button onClick={onPublish} variant={isPublished ? "destructive" : "default"}>
          {isPublished ? t("courses.editor.unpublish") : t("courses.editor.publish")}
        </Button>
      </div>
    </header>
  );
}
