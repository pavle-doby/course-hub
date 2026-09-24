import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { courses } from "@repo/db-schema";
import { courseStatusEnum, courseVisibilityEnum } from "@repo/db-schema";
import { isoDatetime, paramBoolean } from "../shared";
import { UserSchema } from "../users/schemas";

export const CourseCreatorSchema = UserSchema.pick({
  id: true,
  firstName: true,
  lastName: true,
  username: true,
  avatarUrl: true,
});

export const CourseSchema = createSelectSchema(courses, {
  status: z.enum(courseStatusEnum.enumValues),
  visibility: z.enum(courseVisibilityEnum.enumValues),
})
  .pick({
    id: true,
    creatorId: true,
    name: true,
    publicId: true,
    description: true,
    status: true,
    visibility: true,
    publishedAt: true,
    ratingAverage: true,
    ratingCount: true,
  })
  .extend({
    creator: CourseCreatorSchema.optional(),
    thumbnailUrl: z.url().nullable(),
  });

export const CourseGetAllQuerySchema = z.object({
  status: z.enum(courseStatusEnum.enumValues).optional(),
  excludeEnrolled: paramBoolean().optional(),
  // when false (default), only the current user's own courses are returned
  showAllCreators: paramBoolean().optional(),
});

export const ParamsPublicIdSchema = z.object({
  publicId: z.string().max(12),
});

export const CoursePostQuerySchema = createInsertSchema(courses, {
  status: z.enum(courseStatusEnum.enumValues).optional(),
  visibility: z.enum(courseVisibilityEnum.enumValues).optional(),
  publishedAt: isoDatetime().optional(),
}).pick({
  name: true,
  description: true,
  status: true,
  visibility: true,
  publishedAt: true,
});

export const CoursePutQuerySchema = createUpdateSchema(courses, {
  status: z.enum(courseStatusEnum.enumValues).optional(),
  visibility: z.enum(courseVisibilityEnum.enumValues).optional(),
  publishedAt: isoDatetime(),
})
  .pick({
    name: true,
    description: true,
    status: true,
    visibility: true,
    publishedAt: true,
  })
  .partial();

export const CourseThumbnailUploadBodySchema = z.object({
  courseId: z.uuid(),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  size: z
    .int()
    .positive()
    .max(10 * 1024 * 1024),
});

export const CourseThumbnailUploadCompleteBodySchema = z.object({
  courseId: z.uuid(),
  objectKey: z.string().min(1),
});

export const CourseThumbnailUploadResponseSchema = z.object({
  objectKey: z.string(),
  uploadUrl: z.url(),
  requiredHeaders: z.object({ "Content-Type": z.string() }),
});
