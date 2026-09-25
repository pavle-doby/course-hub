import type { QuizQuestionsItem } from "@repo/api-client";
import type { QUESTION_TYPES } from "@repo/contract";

export type ChoiceValues = { value: string; label: string; correct: boolean };
export type QuestionValues = {
  id: string;
  type: (typeof QUESTION_TYPES)[number];
  prompt: string;
  description?: string;
  required: boolean;
  // kept for text questions too so switching type back doesn't lose them; Zod strips them on save
  choices: ChoiceValues[];
};
export type QuizFormValues = { questions: QuestionValues[] };

export function newChoice(): ChoiceValues {
  return { value: crypto.randomUUID().slice(0, 8), label: "", correct: false };
}

export function newQuestion(): QuestionValues {
  return {
    id: crypto.randomUUID(),
    type: "single",
    prompt: "",
    description: "",
    required: true,
    choices: [newChoice(), newChoice()],
  };
}

export function toFormValues(questions: QuizQuestionsItem[]): QuizFormValues {
  return {
    questions: questions.map((question) => ({
      ...question,
      description: question.description ?? "",
      choices: question.type === "text" ? [newChoice(), newChoice()] : question.choices,
    })),
  };
}
