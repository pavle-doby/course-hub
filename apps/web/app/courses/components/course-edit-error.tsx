"use client";

import { AlertCircleIcon } from "lucide-react";
import { useT } from "@repo/i18n/client";
import { Button } from "@repo/ui-web/components/button";
import { Card, CardContent, CardDescription, CardHeader } from "@repo/ui-web/components/card";

type CourseEditErrorProps = {
  onRetry: () => void;
  onBack: () => void;
};

/** Shown when the course fails to load (network/API error) — replaces the spinner. */
export function CourseEditError({ onRetry, onBack }: CourseEditErrorProps) {
  const { t } = useT();
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-col items-center gap-2 pt-6 text-center">
          <AlertCircleIcon className="size-8 text-destructive" />
          <h1 className="text-xl font-bold">{t("errors.shared.SERVER_ERROR.title")}</h1>
          <CardDescription>{t("errors.shared.SERVER_ERROR.message")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button onClick={onRetry}>{t("courses.editor.retry")}</Button>
          <Button variant="outline" onClick={onBack}>
            {t("courses.editor.back")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
