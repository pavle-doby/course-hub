import { relations } from "drizzle-orm";
import { users } from "./users";
import { userPreferences } from "./user-preferences";
import { courses } from "./courses";
import { courseEnrollments } from "./course-enrollments";
import { topics } from "./topics";
import { lessons } from "./lessons";
import { videos } from "./videos";
import { courseProgress } from "./course-progress";
import { lessonProgress } from "./lesson-progress";
import { fileUploads } from "./file-uploads";

export const usersRelations = relations(users, ({ one, many }) => ({
  preferences: one(userPreferences, { fields: [users.id], references: [userPreferences.userId] }),
  courses: many(courses),
  enrollments: many(courseEnrollments),
  courseProgress: many(courseProgress),
  lectureProgress: many(lessonProgress),
  fileUploads: many(fileUploads),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, { fields: [userPreferences.userId], references: [users.id] }),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  creator: one(users, { fields: [courses.creatorId], references: [users.id] }),
  topics: many(topics),
  enrollments: many(courseEnrollments),
  progress: many(courseProgress),
}));

export const courseEnrollmentsRelations = relations(courseEnrollments, ({ one }) => ({
  user: one(users, { fields: [courseEnrollments.userId], references: [users.id] }),
  course: one(courses, { fields: [courseEnrollments.courseId], references: [courses.id] }),
}));

export const topicsRelations = relations(topics, ({ one, many }) => ({
  course: one(courses, { fields: [topics.courseId], references: [courses.id] }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  topic: one(topics, { fields: [lessons.topicId], references: [topics.id] }),
  video: one(videos, { fields: [lessons.id], references: [videos.lessonId] }),
  progress: many(lessonProgress),
}));

export const videosRelations = relations(videos, ({ one }) => ({
  lesson: one(lessons, { fields: [videos.lessonId], references: [lessons.id] }),
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

export const fileUploadsRelations = relations(fileUploads, ({ one }) => ({
  user: one(users, { fields: [fileUploads.userId], references: [users.id] }),
}));
