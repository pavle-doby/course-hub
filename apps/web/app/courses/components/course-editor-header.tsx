"use client";

import { ChevronLeft } from "lucide-react";
import { Button } from "@repo/ui-web/components/button";
import { Switch } from "@repo/ui-web/components/switch";
import { Label } from "@repo/ui-web/components/label";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui-web/components/tabs";
import { useT } from "@repo/i18n/client";

type CourseEditorHeaderProps = {
  title: string;
  autoSave: boolean;
  onAutoSaveChange: (value: boolean) => void;
  isSaving?: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSave: () => void;
  showInviteTab?: boolean;
  activeTab?: "edit" | "invite";
  onActiveTabChange?: (value: "edit" | "invite") => void;
};

export function CourseEditorHeader({
  title,
  autoSave,
  onAutoSaveChange,
  isSaving,
  onBack,
  onCancel,
  onSave,
  showInviteTab,
  activeTab = "edit",
  onActiveTabChange,
}: CourseEditorHeaderProps) {
  const { t } = useT();

  return (
    <header className="sticky top-0 z-40 flex flex-col bg-background">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-2 md:grid md:h-14 md:grid-cols-3 md:py-0">
        <div className="flex min-w-0 items-center gap-1 justify-self-start">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label={t("courses.editor.back")}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <span className="truncate text-lg font-bold">{title}</span>
        </div>

        <div className="flex items-center gap-4 text-sm md:justify-self-center">
          <Label className="flex items-center gap-2">
            <span>{t("courses.editor.autoSave")}</span>
            <Switch checked={autoSave} onCheckedChange={onAutoSaveChange} />
          </Label>
        </div>

        <div className="hidden items-center gap-2 justify-self-end md:flex">
          <Button variant="outline" onClick={onCancel}>
            {t("courses.editor.cancel")}
          </Button>
          <Button variant="outline" onClick={onSave} disabled={isSaving}>
            {isSaving ? t("courses.editor.saving") : t("courses.editor.save")}
          </Button>
        </div>
      </div>

      {showInviteTab && (
        <div className="flex justify-center px-4 py-2 md:px-6">
          <Tabs
            value={activeTab}
            onValueChange={(value) => onActiveTabChange?.(value as "edit" | "invite")}
          >
            <TabsList variant="line">
              <TabsTrigger className="min-w-30" value="edit">
                {t("courses.editor.editTab")}
              </TabsTrigger>
              <TabsTrigger className="min-w-30" value="invite">
                {t("courses.editor.invite")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}
    </header>
  );
}
