"use client";

import { CircleCheckBigIcon, XCircleIcon } from "lucide-react";
import type { MyQuizResponseResponse } from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import type { PublicQuizQuestion } from "./public-quiz";

type QuizResponse = NonNullable<MyQuizResponseResponse>;

type QuizResultItemProps = {
  question: PublicQuizQuestion;
  answer: QuizResponse["answers"][string] | undefined;
  questionResult: QuizResponse["result"]["questions"][number] | undefined;
};

/** One graded question: the learner's answer, plus the correct one when they got it wrong. */
export function QuizResultItem({ question, answer, questionResult }: QuizResultItemProps) {
  const { t } = useT();
  const selected = Array.isArray(answer) ? answer : answer ? [answer] : [];
  const answerText = question.type === "text" ? selected[0] : selected.map(labelOf).join(", ");

  function labelOf(value: string) {
    return question.choices.find((choice) => choice.value === value)?.label ?? value;
  }

  return (
    <li className="flex gap-2 rounded-lg border p-3">
      {questionResult?.isCorrect === true && (
        <CircleCheckBigIcon className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" />
      )}
      {questionResult?.isCorrect === false && (
        <XCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
      )}
      <div className="flex min-w-0 flex-col gap-1 text-sm">
        <span className="font-medium">{question.prompt}</span>
        <span className="text-muted-foreground">
          {t("learn.quiz.yourAnswer")}: {answerText || t("learn.quiz.noAnswer")}
        </span>
        {questionResult?.isCorrect === false && (
          <span className="text-muted-foreground">
            {t("learn.quiz.correctAnswer")}: {questionResult.correctValues.map(labelOf).join(", ")}
          </span>
        )}
      </div>
    </li>
  );
}
