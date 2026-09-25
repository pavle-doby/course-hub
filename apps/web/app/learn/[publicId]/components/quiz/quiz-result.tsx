"use client";

import { useState, type MouseEvent } from "react";
import type { MyQuizResponseResponse } from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { Button } from "@repo/ui-web/components/button";
import { useIsMobile } from "@repo/ui-web/hooks/use-mobile";
import { ChAlertDialog } from "@/components/ch-alert-dialog";
import { celebrateFrom } from "./celebrate";
import type { PublicQuiz } from "./public-quiz";
import { QuizResultItem } from "./quiz-result-item";

type QuizResultProps = {
  quiz: PublicQuiz;
  response: NonNullable<MyQuizResponseResponse>;
  onClear: () => void;
};

/** Saved quiz result: score, per-question breakdown, and a confirmed "clear answers" action. */
export function QuizResult({ quiz, response, onClear }: QuizResultProps) {
  const { t } = useT();
  const isMobile = useIsMobile();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const { result, answers } = response;
  const isPerfect = result.total > 0 && result.score === result.total;

  function handleCelebrate(event: MouseEvent<HTMLButtonElement>) {
    celebrateFrom(event.currentTarget, isMobile);
  }

  function handleOpenClearDialog() {
    setClearDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-medium">
        {result.total > 0
          ? t("learn.quiz.score", { score: result.score, total: result.total })
          : t("learn.quiz.noScore")}
        {isPerfect && (
          <button
            type="button"
            aria-label="🎉"
            className="ml-2 cursor-pointer transition-transform hover:scale-125"
            onClick={handleCelebrate}
          >
            🎉
          </button>
        )}
      </p>

      <ol className="flex flex-col gap-3">
        {quiz.questions.map((question) => (
          <QuizResultItem
            key={question.id}
            question={question}
            answer={answers[question.id]}
            questionResult={result.questions.find((item) => item.id === question.id)}
          />
        ))}
      </ol>

      <Button variant="outline" className="w-fit" onClick={handleOpenClearDialog}>
        {t("learn.quiz.clear")}
      </Button>
      <ChAlertDialog
        open={clearDialogOpen}
        onOpenChange={setClearDialogOpen}
        title={t("learn.quiz.clearDialog.title")}
        description={t("learn.quiz.clearDialog.description")}
        cancelLabel={t("learn.quiz.clearDialog.cancel")}
        actionLabel={t("learn.quiz.clearDialog.confirm")}
        actionProps={{ onClick: onClear }}
      />
    </div>
  );
}
