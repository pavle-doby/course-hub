import type { InferSelectModel } from "drizzle-orm";
import type {
  users,
  userPreferences,
  fileUploads,
  courses,
  courseEnrollments,
  topics,
  lectures,
  videos,
  courseProgress,
  lectureProgress,
} from "./schemas";

export type UserEntity = InferSelectModel<typeof users>;
export type UserPreferencesEntity = InferSelectModel<typeof userPreferences>;
export type FileUploadEntity = InferSelectModel<typeof fileUploads>;
export type CourseEntity = InferSelectModel<typeof courses>;
export type CourseEnrollmentEntity = InferSelectModel<typeof courseEnrollments>;
export type TopicEntity = InferSelectModel<typeof topics>;
export type LectureEntity = InferSelectModel<typeof lectures>;
export type VideoEntity = InferSelectModel<typeof videos>;
export type CourseProgressEntity = InferSelectModel<typeof courseProgress>;
export type LectureProgressEntity = InferSelectModel<typeof lectureProgress>;
