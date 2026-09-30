import { useState } from "react";
import { Pressable, View, type GestureResponderEvent } from "react-native";
import type { MyQuizResponseResponse } from "@repo/api-client";
import { useTranslation } from "@repo/i18n/native";
import { Button } from "@repo/ui-native/components/button";
import { Text } from "@repo/ui-native/components/text";
import { ChAlertDialog } from "@/modules/learn-course/components/ch-alert-dialog";
import { useCelebrate } from "@/modules/learn-course/hooks/use-celebrate";
import type { PublicQuiz } from "./public-quiz";
import { QuizResultItem } from "./quiz-result-item";

type QuizResultProps = {
  quiz: PublicQuiz;
  response: NonNullable<MyQuizResponseResponse>;
  onClear: () => void;
};

/** Saved quiz result: score, per-question breakdown, and a confirmed "clear answers" action. */
export function QuizResult({ quiz, response, onClear }: QuizResultProps) {
  const { t } = useTranslation();
  const { celebrateFrom } = useCelebrate();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const { result, answers } = response;
  const isPerfect = result.total > 0 && result.score === result.total;

  function handleOpenClearDialog() {
    setClearDialogOpen(true);
  }

  function handleCelebrate(event: GestureResponderEvent) {
    celebrateFrom(event);
  }

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-2">
        <Text className="text-lg font-medium">
          {result.total > 0
            ? t("learn.quiz.score", { score: result.score, total: result.total })
            : t("learn.quiz.noScore")}
        </Text>
        {isPerfect && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="🎉"
            hitSlop={8}
            className="active:scale-125"
            onPress={handleCelebrate}
          >
            <Text className="text-lg">🎉</Text>
          </Pressable>
        )}
      </View>

      <View className="gap-3">
        {quiz.questions.map((question) => (
          <QuizResultItem
            key={question.id}
            question={question}
            answer={answers[question.id]}
            questionResult={result.questions.find((item) => item.id === question.id)}
          />
        ))}
      </View>

      <Button variant="outline" className="self-start" onPress={handleOpenClearDialog}>
        <Text>{t("learn.quiz.clear")}</Text>
      </Button>
      <ChAlertDialog
        open={clearDialogOpen}
        onOpenChange={setClearDialogOpen}
        title={t("learn.quiz.clearDialog.title")}
        description={t("learn.quiz.clearDialog.description")}
        cancelLabel={t("learn.quiz.clearDialog.cancel")}
        actionLabel={t("learn.quiz.clearDialog.confirm")}
        onAction={onClear}
      />
    </View>
  );
}
