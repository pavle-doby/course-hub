import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const userStatusEnum = pgEnum("user_status", ["pending", "approved", "rejected"]);
export const contentBehaviorEnum = pgEnum("content_behavior", ["create", "consume", "both"]);
export const themeEnum = pgEnum("theme", ["light", "dark", "system"]);
export const courseStatusEnum = pgEnum("course_status", ["draft", "published", "archived"]);
export const courseVisibilityEnum = pgEnum("course_visibility", ["public", "private"]);
export const courseInvitationTypeEnum = pgEnum("course_invitation_type", ["email", "link"]);
export const courseInvitationStatusEnum = pgEnum("course_invitation_status", [
  "pending",
  "accepted",
  "revoked",
  "expired",
]);
export const videoStatusEnum = pgEnum("video_status", [
  "uploading",
  "processing",
  "ready",
  "error",
]);
export const documentStatusEnum = pgEnum("document_status", ["pending", "ready", "failed"]);
export const notificationCategoryEnum = pgEnum("notification_category", [
  "course_enrolled",
  "private_course_attempt",
  "course_updated",
  "creator_new_course",
]);
export const lessonProgressStatusEnum = pgEnum("lesson_progress_status", [
  "todo",
  "in_progress",
  "done",
]);
