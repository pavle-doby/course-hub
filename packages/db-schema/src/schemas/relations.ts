import { relations } from "drizzle-orm";
import { users } from "./users";
import { userPreferences } from "./user-preferences";
import { courses } from "./courses";
import { courseEnrollments } from "./course-enrollments";
import { courseInvitations } from "./course-invitations";
import { topics } from "./topics";
import { lessons } from "./lessons";
import { videos } from "./videos";
import { courseProgress } from "./course-progress";
import { lessonProgress } from "./lesson-progress";
import { documents } from "./documents";
import { pushSubscriptions } from "./push-subscriptions";
import { notificationPreferences } from "./notification-preferences";

export const usersRelations = relations(users, ({ one, many }) => ({
  preferences: one(userPreferences, { fields: [users.id], references: [userPreferences.userId] }),
  courses: many(courses),
  enrollments: many(courseEnrollments),
  courseProgress: many(courseProgress),
  lectureProgress: many(lessonProgress),
  documents: many(documents),
  pushSubscriptions: many(pushSubscriptions),
  notificationPreferences: many(notificationPreferences),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, { fields: [userPreferences.userId], references: [users.id] }),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  creator: one(users, { fields: [courses.creatorId], references: [users.id] }),
  video: one(videos),
  topics: many(topics),
  enrollments: many(courseEnrollments),
  invitations: many(courseInvitations),
  progress: many(courseProgress),
  documents: many(documents),
  notificationPreferences: many(notificationPreferences),
}));

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  user: one(users, { fields: [pushSubscriptions.userId], references: [users.id] }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, { fields: [notificationPreferences.userId], references: [users.id] }),
  course: one(courses, { fields: [notificationPreferences.courseId], references: [courses.id] }),
}));

export const courseEnrollmentsRelations = relations(courseEnrollments, ({ one }) => ({
  user: one(users, { fields: [courseEnrollments.userId], references: [users.id] }),
  course: one(courses, { fields: [courseEnrollments.courseId], references: [courses.id] }),
}));

export const courseInvitationsRelations = relations(courseInvitations, ({ one }) => ({
  course: one(courses, { fields: [courseInvitations.courseId], references: [courses.id] }),
  invitedByUser: one(users, {
    fields: [courseInvitations.invitedBy],
    references: [users.id],
  }),
  acceptedByUser: one(users, {
    fields: [courseInvitations.acceptedByUserId],
    references: [users.id],
  }),
}));

export const topicsRelations = relations(topics, ({ one, many }) => ({
  course: one(courses, { fields: [topics.courseId], references: [courses.id] }),
  video: one(videos),
  lessons: many(lessons),
  documents: many(documents),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  topic: one(topics, { fields: [lessons.topicId], references: [topics.id] }),
  video: one(videos),
  progress: many(lessonProgress),
  documents: many(documents),
}));

export const videosRelations = relations(videos, ({ one }) => ({
  course: one(courses, { fields: [videos.courseId], references: [courses.id] }),
  topic: one(topics, { fields: [videos.topicId], references: [topics.id] }),
  lesson: one(lessons, { fields: [videos.lessonId], references: [lessons.id] }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  uploadedByUser: one(users, { fields: [documents.uploadedByUserId], references: [users.id] }),
  course: one(courses, { fields: [documents.courseId], references: [courses.id] }),
  topic: one(topics, { fields: [documents.topicId], references: [topics.id] }),
  lesson: one(lessons, { fields: [documents.lessonId], references: [lessons.id] }),
}));

export const courseProgressRelations = relations(courseProgress, ({ one }) => ({
  user: one(users, { fields: [courseProgress.userId], references: [users.id] }),
  course: one(courses, { fields: [courseProgress.courseId], references: [courses.id] }),
  currentTopic: one(topics, { fields: [courseProgress.currentTopicId], references: [topics.id] }),
  currentLesson: one(lessons, {
    fields: [courseProgress.currentLessonId],
    references: [lessons.id],
  }),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(users, { fields: [lessonProgress.userId], references: [users.id] }),
  lesson: one(lessons, { fields: [lessonProgress.lessonId], references: [lessons.id] }),
}));
