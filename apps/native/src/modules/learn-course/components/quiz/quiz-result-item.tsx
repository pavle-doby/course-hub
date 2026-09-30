import { View } from "react-native";
import { CircleCheckBigIcon, XCircleIcon } from "lucide-react-native";
import type { MyQuizResponseResponse } from "@repo/api-client";
import { useTranslation } from "@repo/i18n/native";
import { Icon } from "@repo/ui-native/components/icon";
import { Text } from "@repo/ui-native/components/text";
import type { PublicQuizQuestion } from "./public-quiz";

type QuizResponse = NonNullable<MyQuizResponseResponse>;

type QuizResultItemProps = {
  question: PublicQuizQuestion;
  answer: QuizResponse["answers"][string] | undefined;
  questionResult: QuizResponse["result"]["questions"][number] | undefined;
};

/** One graded question: the learner's answer, plus the correct one when they got it wrong. */
export function QuizResultItem({ question, answer, questionResult }: QuizResultItemProps) {
  const { t } = useTranslation();
  const selected = Array.isArray(answer) ? answer : answer ? [answer] : [];
  const answerText = question.type === "text" ? selected[0] : selected.map(labelOf).join(", ");

  function labelOf(value: string) {
    return question.choices.find((choice) => choice.value === value)?.label ?? value;
  }

  return (
    <View className="flex-row gap-2 rounded-lg border border-border p-3">
      {questionResult?.isCorrect === true && (
        <Icon
          as={CircleCheckBigIcon}
          size={16}
          className="mt-0.5 text-green-600 dark:text-green-400"
        />
      )}
      {questionResult?.isCorrect === false && (
        <Icon as={XCircleIcon} size={16} className="mt-0.5 text-destructive" />
      )}
      <View className="min-w-0 flex-1 gap-1">
        <Text className="text-sm font-medium">{question.prompt}</Text>
        <Text variant="muted">
          {t("learn.quiz.yourAnswer")}: {answerText || t("learn.quiz.noAnswer")}
        </Text>
        {questionResult?.isCorrect === false && (
          <Text variant="muted">
            {t("learn.quiz.correctAnswer")}: {questionResult.correctValues.map(labelOf).join(", ")}
          </Text>
        )}
      </View>
    </View>
  );
}
