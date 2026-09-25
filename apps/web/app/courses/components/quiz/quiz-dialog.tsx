"use client";

import { PencilLineIcon, SparklesIcon } from "lucide-react";
import { useT } from "@repo/i18n/client";
import { Button } from "@repo/ui-web/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui-web/components/dialog";
import { AiInstructionsInput } from "./ai-instructions-input";

type QuizDialogProps = {
  open: boolean;
  isGenerating: boolean;
  onOpenChange: (open: boolean) => void;
  onAiCreate: (instructions?: string) => void;
  onManualCreate: () => void;
};

/** AI or manual choice for a new quiz; the form itself opens on the page. */
export function QuizDialog({
  open,
  isGenerating,
  onOpenChange,
  onAiCreate,
  onManualCreate,
}: QuizDialogProps) {
  const { t } = useT();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("courses.quiz.chooseTitle")}</DialogTitle>
          <DialogDescription>{t("courses.quiz.chooseDescription")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <section className="flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex flex-col gap-1">
              <h3 className="flex items-center gap-2 font-medium">
                <SparklesIcon className="size-4" />
                {t("courses.quiz.aiCreate")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("courses.quiz.aiCreateDescription")}
              </p>
            </div>
            <AiInstructionsInput
              submitLabel={t("courses.quiz.aiCreate")}
              isGenerating={isGenerating}
              onGenerate={onAiCreate}
            />
          </section>
          <section className="flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex flex-1 flex-col gap-1">
              <h3 className="flex items-center gap-2 font-medium">
                <PencilLineIcon className="size-4" />
                {t("courses.quiz.manualCreate")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("courses.quiz.manualCreateDescription")}
              </p>
            </div>
            <Button
              variant="outline"
              className="self-end"
              disabled={isGenerating}
              onClick={onManualCreate}
            >
              {t("courses.quiz.manualCreate")}
            </Button>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
