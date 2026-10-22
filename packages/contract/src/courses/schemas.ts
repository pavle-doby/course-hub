import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { courses } from "@repo/db-schema";
import { courseStatusEnum, courseVisibilityEnum } from "@repo/db-schema";
import { isoDatetime, paramBoolean } from "../shared";
import { UserSchema } from "../users/schemas";

// In cents: 1,000,000.00
const MAX_COURSE_PRICE = 1_000_000_00;

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
    aiAccessEnabled: true,
    price: true,
    publishedAt: true,
    ratingAverage: true,
    ratingCount: true,
  })
  .extend({
    creator: CourseCreatorSchema.optional(),
    thumbnailUrl: z.url().nullable(),
  });

// GET /courses list item: adds the number of active (non-withdrawn) enrollments
export const CourseWithStatsSchema = CourseSchema.extend({
  enrolledCount: z.int().nonnegative(),
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
  price: (s) => s.int().nonnegative().max(MAX_COURSE_PRICE).optional(),
}).pick({
  name: true,
  description: true,
  status: true,
  visibility: true,
  aiAccessEnabled: true,
  price: true,
  publishedAt: true,
});

export const CoursePutQuerySchema = createUpdateSchema(courses, {
  status: z.enum(courseStatusEnum.enumValues).optional(),
  visibility: z.enum(courseVisibilityEnum.enumValues).optional(),
  publishedAt: isoDatetime(),
  price: (s) => s.int().nonnegative().max(MAX_COURSE_PRICE),
})
  .pick({
    name: true,
    description: true,
    status: true,
    visibility: true,
    aiAccessEnabled: true,
    price: true,
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
