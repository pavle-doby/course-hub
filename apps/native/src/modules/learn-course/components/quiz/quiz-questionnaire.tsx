import type { QuizAnswers } from "@repo/contract";
import { useTranslation } from "@repo/i18n/native";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
  type QuestionnaireAnswers,
} from "@repo/ui-native/components/questionnaire";
import type { PublicQuiz, PublicQuizQuestion } from "./public-quiz";

type QuizQuestionnaireProps = {
  quiz: PublicQuiz;
  isSaving: boolean;
  onStart?: () => void;
  onSubmit: (answers: QuizAnswers) => void;
};

/** Step-by-step form for taking the quiz; collects the answers and hands them to `onSubmit`. */
export function QuizQuestionnaire({ quiz, isSaving, onStart, onSubmit }: QuizQuestionnaireProps) {
  const { t } = useTranslation();

  function handleSubmit(values: QuestionnaireAnswers) {
    const answers: QuizAnswers = {};
    for (const question of quiz.questions) {
      const selected = values[question.id];
      if (selected?.length) {
        answers[question.id] = question.type === "multiple" ? selected : selected[0]!;
      }
    }
    onSubmit(answers);
  }

  return (
    <Questionnaire items={quiz.questions.map(toItem)} onChange={onStart} onSubmit={handleSubmit}>
      <QuestionnaireProgress />
      {quiz.questions.map((question) => (
        <QuestionnaireItem key={question.id} name={question.id}>
          <QuestionnaireTitle>{question.prompt}</QuestionnaireTitle>
          {question.description && (
            <QuestionnaireDescription>{question.description}</QuestionnaireDescription>
          )}
          <QuestionnaireChoices>
            {question.type === "text" ? (
              <QuestionnaireInput
                accessibilityLabel={question.prompt}
                placeholder={t("learn.quiz.answerPlaceholder")}
              />
            ) : (
              question.choices.map((choice) => (
                <QuestionnaireChoice key={choice.value} value={choice.value}>
                  {choice.label}
                </QuestionnaireChoice>
              ))
            )}
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
      ))}
      <QuestionnaireActions>
        <QuestionnairePrevious>{t("learn.quiz.previous")}</QuestionnairePrevious>
        <QuestionnaireSkip>{t("learn.quiz.skip")}</QuestionnaireSkip>
        <QuestionnaireNext>{t("learn.quiz.next")}</QuestionnaireNext>
        <QuestionnaireSubmit disabled={isSaving}>{t("learn.quiz.submit")}</QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  );
}

function toItem(question: PublicQuizQuestion) {
  return { name: question.id, required: question.required, multiple: question.type === "multiple" };
}
