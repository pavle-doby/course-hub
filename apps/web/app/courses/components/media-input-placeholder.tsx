"use client";

import { ImageIcon } from "lucide-react";
import { useT } from "@repo/i18n/client";
import { cn } from "@repo/ui-web/lib/utils";

export function MediaInputPlaceholder({ className }: { className?: string }) {
  const { t } = useT();

  return (
    <div
      className={cn(
        "flex h-32 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-input text-sm text-muted-foreground",
        className
      )}
    >
      <ImageIcon className="size-4" />
      {t("courses.editor.mediaPlaceholder")}
    </div>
  );
}
