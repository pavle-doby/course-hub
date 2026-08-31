import z from "zod";
import { registry } from "./registry";
import {
  PaginationSchema,
  UserSchema as UserSchemaBase,
  CourseSchema as CourseSchemaBase,
  LessonSchema as LessonSchemaBase,
  TopicSchema as TopicSchemaBase,
} from "@repo/contract";

export const UserSchema = registry.register("User", UserSchemaBase);

export const NativeAuthWithTokensSchema = registry.register(
  "NativeAuthWithTokens",
  z.object({
    user: UserSchemaBase,
    accessToken: z.string(),
    refreshToken: z.string(),
  })
);

export const NativeAuthTokensSchema = registry.register(
  "NativeAuthTokens",
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

export const LessonSchema = registry.register("Lesson", LessonSchemaBase);

export const PaginatedLessonsSchema = registry.register(
  "Lessons",
  z.object({
    data: z.array(LessonSchema),
    pagination: PaginationSchema,
  })
);

export const TopicSchema = registry.register("Topic", TopicSchemaBase);

export const PaginatedTopicsSchema = registry.register(
  "Topics",
  z.object({
    data: z.array(TopicSchema),
    pagination: PaginationSchema,
  })
);
