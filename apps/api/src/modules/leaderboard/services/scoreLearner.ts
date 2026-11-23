import { LEADERBOARD_POINTS as POINTS } from "@repo/contract";
import {
  deriveCourseProgress,
  scoreSavedQuiz,
  type CourseContent,
  type LearnerState,
} from "api/modules/progress/services/deriveCourseProgress";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Distinct active days (`YYYY-MM-DD`) → day points plus a bonus per full streak run. */
function scoreConsistency(days: string[]): number {
  const times = [...new Set(days)].map((day) => Date.parse(day)).sort((a, b) => a - b);
  let streakBonuses = 0;
  let run = 0;
  times.forEach((time, index) => {
    run = index > 0 && time - times[index - 1]! === DAY_MS ? run + 1 : 1;
    if (run % POINTS.STREAK_DAYS === 0) {
      streakBonuses += 1;
    }
  });
  return times.length * POINTS.ACTIVE_DAY + streakBonuses * POINTS.STREAK_BONUS;
}

/**
 * A learner's leaderboard points, computed from their current progress: undoing a lesson or
 * clearing a quiz (Redo) takes back what it earned.
 */
export function scoreLearner(
  content: CourseContent,
  state: LearnerState,
  watchedLessonVideoIds: Set<string>,
  activityDays: string[]
): number {
  const derived = deriveCourseProgress(content, state);
  let points = scoreConsistency(activityDays);

  for (const lesson of content.lessons) {
    if (state.lessonStatuses.get(lesson.id) === "done") {
      points += POINTS.LESSON_DONE;
    }
    if (lesson.hasVideo && watchedLessonVideoIds.has(lesson.id)) {
      points += POINTS.VIDEO_WATCHED;
    }
  }

  for (const topic of content.topics) {
    if (topic.hasVideo && state.watchedTopicIds.has(topic.id)) {
      points += POINTS.VIDEO_WATCHED;
    }
    if (derived.topicStatuses.get(topic.id) === "done") {
      points += POINTS.TOPIC_DONE;
    }
  }

  for (const quiz of content.quizzes) {
    const result = scoreSavedQuiz(quiz.questions, state.answersByQuizId.get(quiz.id));
    if (result) {
      const ratio = result.total === 0 ? 1 : result.score / result.total;
      points += POINTS.QUIZ_FINISHED + Math.round(POINTS.QUIZ_SCORE_MAX * ratio);
    }
  }

  if (derived.status === "done") {
    const hasVideo =
      content.lessons.some((lesson) => lesson.hasVideo) ||
      content.topics.some((topic) => topic.hasVideo);
    const isRich = hasVideo && content.quizzes.length > 0;
    points += isRich ? POINTS.RICH_COURSE_DONE : POINTS.COURSE_DONE;
  }

  return points;
}
