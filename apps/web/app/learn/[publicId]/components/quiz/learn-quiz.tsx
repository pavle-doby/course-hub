"use client";

import { ListChecks } from "lucide-react";
import {
  getGetMyQuizResponseQueryKey,
  useDeleteQuizResponse,
  useGetMyQuizResponse,
  useGetPublicQuiz,
  useQueryClient,
  useSaveQuizResponse,
} from "@repo/api-client";
import type { QuizAnswers, QuizParentParams } from "@repo/contract";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingAction } from "@repo/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui-web/components/card";
import { toast } from "@repo/ui-web/components/sonner";
import { useIsMobile } from "@repo/ui-web/hooks/use-mobile";
import { celebrate } from "./celebrate";
import { QuizQuestionnaire } from "./quiz-questionnaire";
import { QuizResult } from "./quiz-result";

type LearnQuizProps = {
  parent: QuizParentParams;
  isEnrolled: boolean;
};

/** Quiz at the end of a course, topic or lesson: take it, see the saved result, or clear answers. */
export function LearnQuiz({ parent, isEnrolled }: LearnQuizProps) {
  const { t } = useT();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { handleErrorAction } = useErrorHandlingAction({
    t: t as (key: string) => string,
    showToastError: ({ title, description }) => toast.error(title, { description }),
  });

  const { data } = useGetPublicQuiz(parent);
  const quiz = data?.quiz;
  const { data: myResponse } = useGetMyQuizResponse(parent, {
    query: { enabled: isEnrolled && !!quiz },
  });
  const { mutate: saveResponse, isPending: isSaving } = useSaveQuizResponse();
  const { mutate: clearResponse } = useDeleteQuizResponse();
  const responseQueryKey = getGetMyQuizResponseQueryKey(parent);

  if (!quiz) {
    return null;
  }

  function handleSubmit(answers: QuizAnswers) {
    saveResponse(
      { pathParams: parent, data: { answers } },
      {
        onSuccess: (saved) => {
          queryClient.setQueryData(responseQueryKey, saved);
          const result = saved.response?.result;
          // all graded answers right: celebrate (same burst as finishing a course)
          if (result && result.total > 0 && result.score === result.total) {
            celebrate(isMobile);
          }
        },
        onError: (error: unknown) => handleErrorAction(error as Error),
      }
    );
  }

  function handleClear() {
    clearResponse(
      { pathParams: parent },
      {
        onSuccess: () => queryClient.setQueryData(responseQueryKey, { response: null }),
        onError: (error: unknown) => handleErrorAction(error as Error),
      }
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="size-4" />
          {t("learn.quiz.title")}
        </CardTitle>
        {!isEnrolled && (
          <CardDescription>
            {t("learn.quiz.questionCount", { count: quiz.questions.length })}
            {" · "}
            {t("learn.quiz.enrollHint")}
          </CardDescription>
        )}
      </CardHeader>
      {isEnrolled && myResponse && (
        <CardContent>
          {myResponse.response ? (
            <QuizResult quiz={quiz} response={myResponse.response} onClear={handleClear} />
          ) : (
            <QuizQuestionnaire quiz={quiz} isSaving={isSaving} onSubmit={handleSubmit} />
          )}
        </CardContent>
      )}
    </Card>
  );
}
