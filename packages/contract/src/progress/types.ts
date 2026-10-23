import { z } from "zod";
import {
  CourseProgressSchema,
  LessonProgressParamsSchema,
  LessonProgressSchema,
  LessonProgressStatusSchema,
  TopicProgressParamsSchema,
  TopicProgressSchema,
  UpdateLessonProgressBodySchema,
  UpdateTopicProgressBodySchema,
} from "./schemas";

export type LessonProgressStatus = z.infer<typeof LessonProgressStatusSchema>;
export type LessonProgress = z.infer<typeof LessonProgressSchema>;
export type TopicProgress = z.infer<typeof TopicProgressSchema>;
export type CourseProgress = z.infer<typeof CourseProgressSchema>;

// GET /progress/courses/:publicId → current user's progress in an enrolled course
export type GetCourseProgressRes = CourseProgress;

// PUT /progress/lessons/:lessonId → set current user's lesson status and/or video position
export type UpdateLessonProgressParams = z.infer<typeof LessonProgressParamsSchema>;
export type UpdateLessonProgressReq = z.infer<typeof UpdateLessonProgressBodySchema>;
export type UpdateLessonProgressRes = LessonProgress;

// PUT /progress/topics/:topicId → mark the topic video as watched
export type UpdateTopicProgressParams = z.infer<typeof TopicProgressParamsSchema>;
export type UpdateTopicProgressReq = z.infer<typeof UpdateTopicProgressBodySchema>;
