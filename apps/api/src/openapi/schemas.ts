import z from "zod";
import { registry } from "./registry";
import {
  PaginationSchema,
  AuthPreferencesSchema,
  UserPreferencesSchema as UserPreferencesSchemaBase,
  UserSchema as UserSchemaBase,
  CourseSchema as CourseSchemaBase,
  LessonSchema as LessonSchemaBase,
  PublicLessonSchema as PublicLessonSchemaBase,
  TopicSchema as TopicSchemaBase,
  PublicTopicSchema as PublicTopicSchemaBase,
  CourseEnrollmentSchema as CourseEnrollmentSchemaBase,
  EnrolledCourseSchema as EnrolledCourseSchemaBase,
  StudentSchema as StudentSchemaBase,
  CourseInvitationSchema as CourseInvitationSchemaBase,
  VideoEditorSchema as VideoEditorSchemaBase,
  PublicDocumentSchema as PublicDocumentSchemaBase,
  CourseProgressSchema as CourseProgressSchemaBase,
  LessonProgressSchema as LessonProgressSchemaBase,
} from "@repo/contract";

export const UserSchema = registry.register("User", UserSchemaBase);
export const UserPreferencesSchema = registry.register(
  "UserPreferences",
  UserPreferencesSchemaBase
);

export const AuthWithTokensSchema = registry.register(
  "AuthWithTokens",
  z.object({
    user: UserSchemaBase,
    preferences: AuthPreferencesSchema,
    accessToken: z.string(),
    refreshToken: z.string(),
  })
);

export const AuthTokensSchema = registry.register(
  "AuthTokens",
  z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  })
);

export const PaginatedUsersSchema = registry.register(
  "Users",
  z.object({
    data: z.array(UserSchema),
    pagination: PaginationSchema,
  })
);

export const CourseSchema = registry.register("Course", CourseSchemaBase);

export const PaginatedCoursesSchema = registry.register(
  "Courses",
  z.object({
    data: z.array(CourseSchema),
    pagination: PaginationSchema,
  })
);

export const EnrolledCourseSchema = registry.register("EnrolledCourse", EnrolledCourseSchemaBase);

export const PaginatedEnrolledCoursesSchema = registry.register(
  "EnrolledCourses",
  z.object({
    data: z.array(EnrolledCourseSchema),
    pagination: PaginationSchema,
  })
);

export const LessonSchema = registry.register("Lesson", LessonSchemaBase);

export const PaginatedLessonsSchema = registry.register(
  "Lessons",
  z.object({
    data: z.array(LessonSchema),
    pagination: PaginationSchema,
  })
);

export const PublicLessonSchema = registry.register("PublicLesson", PublicLessonSchemaBase);

export const TopicSchema = registry.register("Topic", TopicSchemaBase);

export const PaginatedTopicsSchema = registry.register(
  "Topics",
  z.object({
    data: z.array(TopicSchema),
    pagination: PaginationSchema,
  })
);

export const PublicTopicSchema = registry.register("PublicTopic", PublicTopicSchemaBase);

export const CourseEnrollmentSchema = registry.register(
  "CourseEnrollment",
  CourseEnrollmentSchemaBase
);

export const StudentSchema = registry.register("Student", StudentSchemaBase);

export const PaginatedStudentsSchema = registry.register(
  "Students",
  z.object({
    data: z.array(StudentSchema),
    pagination: PaginationSchema,
  })
);

export const CourseInvitationSchema = registry.register(
  "CourseInvitation",
  CourseInvitationSchemaBase
);

export const VideoEditorSchema = registry.register("VideoEditor", VideoEditorSchemaBase);
export const PublicDocumentSchema = registry.register("PublicDocument", PublicDocumentSchemaBase);

export const PaginatedCourseInvitationsSchema = registry.register(
  "CourseInvitations",
  z.object({
    data: z.array(CourseInvitationSchema),
    pagination: PaginationSchema,
  })
);

export const LessonProgressSchema = registry.register("LessonProgress", LessonProgressSchemaBase);
export const CourseProgressSchema = registry.register("CourseProgress", CourseProgressSchemaBase);
