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
    <header className="sticky top-0 z-40 grid h-14 grid-cols-3 items-center gap-4 border-b bg-background px-4">
      <div className="flex items-center gap-1 justify-self-start">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label={t("courses.editor.back")}>
          <ChevronLeft className="size-5" />
        </Button>
        <span className="text-lg font-bold">{title}</span>
      </div>

      <Label className="flex items-center gap-2 justify-self-center text-sm">
        {t("courses.editor.autoSave")}
        <Switch checked={autoSave} onCheckedChange={onAutoSaveChange} />
      </Label>

      <div className="flex items-center gap-2 justify-self-end">
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
