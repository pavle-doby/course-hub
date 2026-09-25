import type { QuizAnswers, QuizQuestion, QuizResult } from "@repo/contract";

/**
 * Scores answers against the current questions. Text questions aren't scored; a multiple-choice
 * answer counts only if it matches the correct set exactly. Answers to removed questions are ignored.
 */
export function scoreQuiz(questions: QuizQuestion[], answers: QuizAnswers): QuizResult {
  const results = questions.map((question) => {
    if (question.type === "text") {
      return { id: question.id, isCorrect: null, correctValues: [] };
    }

    const correctValues = question.choices
      .filter((choice) => choice.correct)
      .map((choice) => choice.value);
    const answer = answers[question.id];
    const selected = new Set(Array.isArray(answer) ? answer : answer ? [answer] : []);
    const isCorrect =
      selected.size === correctValues.length && correctValues.every((value) => selected.has(value));
    return { id: question.id, isCorrect, correctValues };
  });

  const scored = results.filter((result) => result.isCorrect !== null);
  return {
    score: scored.filter((result) => result.isCorrect).length,
    total: scored.length,
    questions: results,
  };
}
