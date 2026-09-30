import { View } from "react-native";
import * as Haptics from "expo-haptics";
import { ListChecksIcon } from "lucide-react-native";
import {
  getGetMyQuizResponseQueryKey,
  useDeleteQuizResponse,
  useGetMyQuizResponse,
  useGetPublicQuiz,
  useQueryClient,
  useSaveQuizResponse,
} from "@repo/api-client";
import type { QuizAnswers, QuizParentParams } from "@repo/contract";
import { useTranslation } from "@repo/i18n/native";
import { useErrorHandlingAction } from "@repo/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui-native/components/card";
import { Icon } from "@repo/ui-native/components/icon";
import { Skeleton } from "@repo/ui-native/components/skeleton";
import { useCelebrate } from "@/modules/learn-course/hooks/use-celebrate";
import { showToastError } from "@/utils/toast-error";
import { QuizQuestionnaire } from "./quiz-questionnaire";
import { QuizQuestionnaireSkeleton } from "./quiz-questionnaire-skeleton";
import { QuizResult } from "./quiz-result";

type LearnQuizProps = {
  parent: QuizParentParams;
  isEnrolled: boolean;
  /** Called when the learner answers a question. */
  onStart?: () => void;
  /** Called after answers are saved or cleared (a lesson quiz can change the lesson status). */
  onResponseChange?: () => void;
};

/** Quiz at the end of a course, topic or lesson: take it, see the saved result, or clear answers. */
export function LearnQuiz({ parent, isEnrolled, onStart, onResponseChange }: LearnQuizProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { celebrate } = useCelebrate();
  const { handleErrorAction } = useErrorHandlingAction({
    t: t as (key: string) => string,
    showToastError,
  });

  const { data, isLoading: isQuizLoading } = useGetPublicQuiz(parent);
  const quiz = data?.quiz;
  const { data: myResponse, isLoading: isResponseLoading } = useGetMyQuizResponse(parent, {
    query: { enabled: isEnrolled && !!quiz },
  });
  const { mutate: saveResponse, isPending: isSaving } = useSaveQuizResponse();
  const { mutate: clearResponse } = useDeleteQuizResponse();
  const responseQueryKey = getGetMyQuizResponseQueryKey(parent);

  if (isQuizLoading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <Skeleton className="h-5 w-20" />
        </CardHeader>
        <CardContent>
          <QuizQuestionnaireSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (!quiz) {
    return null;
  }

  function handleSubmit(answers: QuizAnswers) {
    saveResponse(
      { pathParams: parent, data: { answers } },
      {
        onSuccess: (saved) => {
          queryClient.setQueryData(responseQueryKey, saved);
          onResponseChange?.();
          const result = saved.response?.result;
          // all graded answers right: celebrate (same burst as finishing a course)
          if (result && result.total > 0 && result.score === result.total) {
            celebrate();
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        onSuccess: () => {
          queryClient.setQueryData(responseQueryKey, { response: null });
          onResponseChange?.();
        },
        onError: (error: unknown) => handleErrorAction(error as Error),
      }
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <View className="flex-row items-center gap-2">
          <Icon as={ListChecksIcon} size={16} />
          <CardTitle>{t("learn.quiz.title")}</CardTitle>
        </View>
        {!isEnrolled && (
          <CardDescription>
            {t("learn.quiz.questionCount", { count: quiz.questions.length })}
            {" · "}
            {t("learn.quiz.enrollHint")}
          </CardDescription>
        )}
      </CardHeader>
      {isResponseLoading && (
        <CardContent>
          <QuizQuestionnaireSkeleton />
        </CardContent>
      )}
      {isEnrolled && myResponse && (
        <CardContent>
          {myResponse.response ? (
            <QuizResult quiz={quiz} response={myResponse.response} onClear={handleClear} />
          ) : (
            <QuizQuestionnaire
              quiz={quiz}
              isSaving={isSaving}
              onStart={onStart}
              onSubmit={handleSubmit}
            />
          )}
        </CardContent>
      )}
    </Card>
  );
}
