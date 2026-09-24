import type { InferSelectModel } from "drizzle-orm";
import type {
  users,
  userPreferences,
  courses,
  courseEnrollments,
  courseInvitations,
  topics,
  lessons,
  videos,
  courseProgress,
  lessonProgress,
  documents,
  pushSubscriptions,
  notificationPreferences,
  apiTokens,
  courseReviews,
} from "./schemas";

export type UserEntity = InferSelectModel<typeof users>;
export type UserPreferencesEntity = InferSelectModel<typeof userPreferences>;
export type CourseEntity = InferSelectModel<typeof courses>;
export type CourseEnrollmentEntity = InferSelectModel<typeof courseEnrollments>;
export type CourseInvitationEntity = InferSelectModel<typeof courseInvitations>;
export type TopicEntity = InferSelectModel<typeof topics>;
export type LessonEntity = InferSelectModel<typeof lessons>;
export type VideoEntity = InferSelectModel<typeof videos>;
export type CourseProgressEntity = InferSelectModel<typeof courseProgress>;
export type LessonProgressEntity = InferSelectModel<typeof lessonProgress>;
export type DocumentEntity = InferSelectModel<typeof documents>;
export type PushSubscriptionEntity = InferSelectModel<typeof pushSubscriptions>;
export type NotificationPreferenceEntity = InferSelectModel<typeof notificationPreferences>;
export type ApiTokenEntity = InferSelectModel<typeof apiTokens>;
export type CourseReviewEntity = InferSelectModel<typeof courseReviews>;
