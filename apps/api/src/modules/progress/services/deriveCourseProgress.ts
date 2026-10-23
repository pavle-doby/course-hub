import type { LessonProgressStatus, QuizAnswers, QuizQuestion } from "@repo/contract";
import { scoreQuiz } from "api/modules/quizzes/services/scoreQuiz";

/** Course structure the gates depend on; the same for every learner. */
export type CourseContent = {
  topics: { id: string; hasVideo: boolean }[];
  lessons: { id: string; topicId: string; hasVideo: boolean }[];
  /** Course quiz has neither `topicId` nor `lessonId`. */
  quizzes: {
    id: string;
    topicId: string | null;
    lessonId: string | null;
    questions: QuizQuestion[];
  }[];
};

/** One learner's progress in a course. Lessons without a row are "todo". */
export type LearnerState = {
  lessonStatuses: Map<string, LessonProgressStatus>;
  watchedTopicIds: Set<string>;
  answersByQuizId: Map<string, QuizAnswers>;
};

export type DerivedCourseProgress = {
  status: LessonProgressStatus;
  topicStatuses: Map<string, LessonProgressStatus>;
};

// done when every part is done, todo when nothing started, otherwise in progress.
export function deriveStatus(statuses: LessonProgressStatus[]): LessonProgressStatus {
  if (statuses.length > 0 && statuses.every((status) => status === "done")) {
    return "done";
  }
  if (statuses.every((status) => status === "todo")) {
    return "todo";
  }
  return "in_progress";
}

/** Passed = every graded answer right (a quiz with only text questions passes once answered). */
export function scoreSavedQuiz(
  questions: QuizQuestion[],
  answers: QuizAnswers | undefined
): { score: number; total: number; isPassed: boolean } | null {
  if (!answers) {
    return null;
  }
  const { score, total } = scoreQuiz(questions, answers);
  return { score, total, isPassed: score === total };
}

function quizStatus(quiz: CourseContent["quizzes"][number], state: LearnerState) {
  const result = scoreSavedQuiz(quiz.questions, state.answersByQuizId.get(quiz.id));
  if (!result) {
    return "todo";
  }
  return result.isPassed ? "done" : "in_progress";
}

/**
 * Topic and course status from lesson statuses plus the topic/course gates: a topic needs its
 * ready video watched and its quiz passed, the course needs its quiz passed. The course video
 * never blocks. Lesson gates are applied when the lesson status is saved.
 */
export function deriveCourseProgress(
  content: CourseContent,
  state: LearnerState
): DerivedCourseProgress {
  const topicStatuses = new Map<string, LessonProgressStatus>();
  const allParts: LessonProgressStatus[] = [];

  for (const topic of content.topics) {
    const parts: LessonProgressStatus[] = content.lessons
      .filter((lesson) => lesson.topicId === topic.id)
      .map((lesson) => state.lessonStatuses.get(lesson.id) ?? "todo");
    if (topic.hasVideo) {
      parts.push(state.watchedTopicIds.has(topic.id) ? "done" : "todo");
    }
    const quiz = content.quizzes.find((item) => item.topicId === topic.id);
    if (quiz) {
      parts.push(quizStatus(quiz, state));
    }
    topicStatuses.set(topic.id, deriveStatus(parts));
    allParts.push(...parts);
  }

  const courseQuiz = content.quizzes.find((quiz) => !quiz.topicId && !quiz.lessonId);
  if (courseQuiz) {
    allParts.push(quizStatus(courseQuiz, state));
  }

  return { status: deriveStatus(allParts), topicStatuses };
}
