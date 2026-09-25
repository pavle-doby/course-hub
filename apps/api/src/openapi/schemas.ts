import z from "zod";
import { registry } from "./registry";
import {
  PaginationSchema,
  AuthPreferencesSchema,
  UserPreferencesSchema as UserPreferencesSchemaBase,
  UserSchema as UserSchemaBase,
  CourseSchema as CourseSchemaBase,
  CourseWithStatsSchema as CourseWithStatsSchemaBase,
  LessonSchema as LessonSchemaBase,
  LessonListItemSchema as LessonListItemSchemaBase,
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
  ApiTokenSchema as ApiTokenSchemaBase,
  CreateApiTokenResponseSchema as CreateApiTokenResponseSchemaBase,
  OauthApproveResponseSchema as OauthApproveResponseSchemaBase,
  CourseReviewSchema as CourseReviewSchemaBase,
  MyCourseReviewSchema as MyCourseReviewSchemaBase,
  QuizSchema as QuizSchemaBase,
  QuizOrNullSchema as QuizOrNullSchemaBase,
  PublicQuizOrNullSchema as PublicQuizOrNullSchemaBase,
  GeneratedQuizSchema as GeneratedQuizSchemaBase,
  MyQuizResponseSchema as MyQuizResponseSchemaBase,
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

export const CourseWithStatsSchema = registry.register(
  "CourseWithStats",
  CourseWithStatsSchemaBase
);

export const PaginatedCoursesWithStatsSchema = registry.register(
  "CoursesWithStats",
  z.object({
    data: z.array(CourseWithStatsSchema),
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

export const LessonListItemSchema = registry.register("LessonListItem", LessonListItemSchemaBase);

export const PaginatedLessonsSchema = registry.register(
  "Lessons",
  z.object({
    data: z.array(LessonListItemSchema),
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

export const ApiTokenSchema = registry.register("ApiToken", ApiTokenSchemaBase);
export const CreateApiTokenResponseSchema = registry.register(
  "CreatedApiToken",
  CreateApiTokenResponseSchemaBase
);

export const OauthApproveResponseSchema = registry.register(
  "OauthApproveResponse",
  OauthApproveResponseSchemaBase
);

export const CourseReviewSchema = registry.register("CourseReview", CourseReviewSchemaBase);
export const MyCourseReviewSchema = registry.register("MyCourseReview", MyCourseReviewSchemaBase);

export const PaginatedCourseReviewsSchema = registry.register(
  "CourseReviews",
  z.object({
    data: z.array(CourseReviewSchema),
    pagination: PaginationSchema,
  })
);

export const QuizSchema = registry.register("Quiz", QuizSchemaBase);
export const QuizOrNullSchema = registry.register("QuizOrNull", QuizOrNullSchemaBase);
export const PublicQuizOrNullSchema = registry.register(
  "PublicQuizOrNull",
  PublicQuizOrNullSchemaBase
);
export const GeneratedQuizSchema = registry.register("GeneratedQuiz", GeneratedQuizSchemaBase);
export const MyQuizResponseSchema = registry.register("MyQuizResponse", MyQuizResponseSchemaBase);
