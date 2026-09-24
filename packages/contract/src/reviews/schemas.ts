import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { courseReviews } from "@repo/db-schema";
import { CourseCreatorSchema } from "../courses/schemas";

export const CourseReviewSchema = createSelectSchema(courseReviews, {
  rating: z.number().int().min(1).max(5),
})
  .pick({
    id: true,
    rating: true,
    comment: true,
    reply: true,
    repliedAt: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({ author: CourseCreatorSchema });

export const MyCourseReviewSchema = z.object({
  review: CourseReviewSchema.nullable(),
});

export const SaveCourseReviewBodySchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).nullish(),
});

export const ReviewParamsSchema = z.object({
  reviewId: z.uuid(),
});

// Blank or null clears the reply.
export const SaveReviewReplyBodySchema = z.object({
  reply: z.string().trim().max(2000).nullable(),
});
