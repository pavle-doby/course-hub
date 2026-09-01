"use client";

import { ChevronLeft } from "lucide-react";
import { Button } from "@repo/ui-web/components/button";
import { useT } from "@repo/i18n/client";

type LearnHeaderProps = {
  title: string;
  onBack: () => void;
};

export function LearnHeader({ title, onBack }: LearnHeaderProps) {
  const { t } = useT();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-1 border-b bg-background px-4">
      <Button variant="ghost" size="icon" onClick={onBack} aria-label={t("learn.detail.back")}>
        <ChevronLeft className="size-5" />
      </Button>
      <span className="text-lg font-bold">{title}</span>
    </header>
  );
}
