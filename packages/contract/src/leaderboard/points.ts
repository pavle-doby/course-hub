/** Points a learner earns on a course leaderboard. Shared so the web legend shows the same values. */
export const LEADERBOARD_POINTS = {
  /** Per distinct day with any progress or quiz save. */
  ACTIVE_DAY: 5,
  /** Per full run of `STREAK_DAYS` consecutive active days. */
  STREAK_BONUS: 15,
  STREAK_DAYS: 7,
  LESSON_DONE: 10,
  /** Lesson or topic with a ready video watched to the end. */
  VIDEO_WATCHED: 5,
  TOPIC_DONE: 25,
  COURSE_DONE: 100,
  /** Course done when the course has at least one ready video and one quiz. */
  RICH_COURSE_DONE: 150,
  /** Any saved quiz response (course, topic or lesson). */
  QUIZ_FINISHED: 10,
  /** Scaled by score / total. */
  QUIZ_SCORE_MAX: 20,
} as const;
