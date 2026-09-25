"use client";

import type { FormEvent } from "react";
import type { QuizAnswers } from "@repo/contract";
import { useT } from "@repo/i18n/client";
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
} from "@repo/ui-web/components/questionnaire";
import type { PublicQuiz, PublicQuizQuestion } from "./public-quiz";

type QuizQuestionnaireProps = {
  quiz: PublicQuiz;
  isSaving: boolean;
  onStart?: () => void;
  onSubmit: (answers: QuizAnswers) => void;
};

/** Step-by-step form for taking the quiz; collects the answers and hands them to `onSubmit`. */
export function QuizQuestionnaire({ quiz, isSaving, onStart, onSubmit }: QuizQuestionnaireProps) {
  const { t } = useT();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const answers: QuizAnswers = {};
    for (const question of quiz.questions) {
      const values = formData
        .getAll(question.id)
        .map(String)
        .filter((value) => value.trim());
      if (values.length) {
        answers[question.id] = question.type === "multiple" ? values : values[0]!;
      }
    }
    onSubmit(answers);
  }

  return (
    <Questionnaire items={quiz.questions.map(toItem)} onChange={onStart} onSubmit={handleSubmit}>
      <QuestionnaireProgress />
      {quiz.questions.map((question) => (
        <QuestionnaireItem
          key={question.id}
          name={question.id}
          required={question.required}
          multiple={question.type === "multiple"}
        >
          <QuestionnaireTitle>{question.prompt}</QuestionnaireTitle>
          {question.description && (
            <QuestionnaireDescription>{question.description}</QuestionnaireDescription>
          )}
          <QuestionnaireChoices>
            {question.type === "text" ? (
              <QuestionnaireInput
                aria-label={question.prompt}
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
  return {
    name: question.id,
    required: question.required,
    choices: question.type === "text" ? undefined : question.choices,
  };
}
