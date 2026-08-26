import { relations } from "drizzle-orm";
import { users } from "./users";
import { userPreferences } from "./user-preferences";
import { courses } from "./courses";
import { courseEnrollments } from "./course-enrollments";
import { topics } from "./topics";
import { lectures } from "./lectures";
import { videos } from "./videos";
import { courseProgress } from "./course-progress";
import { lectureProgress } from "./lecture-progress";
import { fileUploads } from "./file-uploads";

export const usersRelations = relations(users, ({ one, many }) => ({
  preferences: one(userPreferences, { fields: [users.id], references: [userPreferences.userId] }),
  courses: many(courses),
  enrollments: many(courseEnrollments),
  courseProgress: many(courseProgress),
  lectureProgress: many(lectureProgress),
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
  lectures: many(lectures),
}));

export const lecturesRelations = relations(lectures, ({ one, many }) => ({
  topic: one(topics, { fields: [lectures.topicId], references: [topics.id] }),
  video: one(videos, { fields: [lectures.id], references: [videos.lectureId] }),
  progress: many(lectureProgress),
}));

export const videosRelations = relations(videos, ({ one }) => ({
  lecture: one(lectures, { fields: [videos.lectureId], references: [lectures.id] }),
}));

export const courseProgressRelations = relations(courseProgress, ({ one }) => ({
  user: one(users, { fields: [courseProgress.userId], references: [users.id] }),
  course: one(courses, { fields: [courseProgress.courseId], references: [courses.id] }),
  currentTopic: one(topics, { fields: [courseProgress.currentTopicId], references: [topics.id] }),
  currentLecture: one(lectures, {
    fields: [courseProgress.currentLectureId],
    references: [lectures.id],
  }),
}));

export const lectureProgressRelations = relations(lectureProgress, ({ one }) => ({
  user: one(users, { fields: [lectureProgress.userId], references: [users.id] }),
  lecture: one(lectures, { fields: [lectureProgress.lectureId], references: [lectures.id] }),
}));

export const fileUploadsRelations = relations(fileUploads, ({ one }) => ({
  user: one(users, { fields: [fileUploads.userId], references: [users.id] }),
}));
