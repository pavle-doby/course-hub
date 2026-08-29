import type { InferSelectModel } from "drizzle-orm";
import type {
  users,
  userPreferences,
  fileUploads,
  courses,
  courseEnrollments,
  topics,
  lessons,
  videos,
  courseProgress,
  lessonProgress,
} from "./schemas";

export type UserEntity = InferSelectModel<typeof users>;
export type UserPreferencesEntity = InferSelectModel<typeof userPreferences>;
export type FileUploadEntity = InferSelectModel<typeof fileUploads>;
export type CourseEntity = InferSelectModel<typeof courses>;
export type CourseEnrollmentEntity = InferSelectModel<typeof courseEnrollments>;
export type TopicEntity = InferSelectModel<typeof topics>;
export type LessonEntity = InferSelectModel<typeof lessons>;
export type VideoEntity = InferSelectModel<typeof videos>;
export type CourseProgressEntity = InferSelectModel<typeof courseProgress>;
export type LessonProgressEntity = InferSelectModel<typeof lessonProgress>;
