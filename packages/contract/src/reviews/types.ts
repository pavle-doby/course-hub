import { z } from "zod";
import {
  CourseReviewSchema,
  MyCourseReviewSchema,
  ReviewParamsSchema,
  SaveCourseReviewBodySchema,
  SaveReviewReplyBodySchema,
} from "./schemas";
import { PaginationRes } from "../shared";

export type CourseReview = z.infer<typeof CourseReviewSchema>;

// GET /reviews/courses/:publicId/me → current user's review, or null
export type GetMyCourseReviewRes = z.infer<typeof MyCourseReviewSchema>;

// PUT /reviews/courses/:publicId → create or replace the current user's review
export type SaveCourseReviewReq = z.infer<typeof SaveCourseReviewBodySchema>;
export type SaveCourseReviewRes = CourseReview;

// GET /public/reviews/courses/:publicId → paginated reviews, newest first
export type GetCourseReviewsRes = PaginationRes<CourseReview>;

// PUT /reviews/:reviewId/reply → course creator sets or clears their reply
export type SaveReviewReplyParams = z.infer<typeof ReviewParamsSchema>;
export type SaveReviewReplyReq = z.infer<typeof SaveReviewReplyBodySchema>;
export type SaveReviewReplyRes = CourseReview;
