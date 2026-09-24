import { z } from "zod";
import { CourseEntity } from "@repo/db-schema";
import { PaginationReq, PaginationRes, Search } from "../shared";
import {
  CourseGetAllQuerySchema,
  CoursePostQuerySchema,
  CoursePutQuerySchema,
  CourseSchema,
  CourseWithStatsSchema,
  CourseThumbnailUploadBodySchema,
  CourseThumbnailUploadCompleteBodySchema,
  CourseThumbnailUploadResponseSchema,
} from "./schemas";

export type Course = z.infer<typeof CourseSchema>;
export type CourseWithStats = z.infer<typeof CourseWithStatsSchema>;

export type CourseStatus = CourseEntity["status"];
export type CourseVisibility = CourseEntity["visibility"];

// GET /courses → get all courses
export type GetAllCoursesReq<Pagination = PaginationReq> = Pagination &
  Partial<Search> &
  z.infer<typeof CourseGetAllQuerySchema>;
export type GetAllCoursesRes = PaginationRes<CourseWithStats>;

// GET /public/courses → get all published courses, no auth required
export type GetAllPublicCoursesReq<Pagination = PaginationReq> = Pagination & Partial<Search>;
export type GetAllPublicCoursesRes = PaginationRes<CourseWithStats>;

// GET /courses/:id → get course by id
export type GetCourseRes = Course | undefined;

// GET /courses/public/:publicId → get course by public id
export type GetCourseByPublicIdRes = Course | undefined;

// POST /courses → create course
export type CreateCourseReq = z.infer<typeof CoursePostQuerySchema>;
export type CreateCourseRes = Course;

// PUT /courses/:id → update course
export type UpdateCourseReq = z.infer<typeof CoursePutQuerySchema>;
export type UpdateCourseRes = Course | undefined;

// DELETE /courses/:id → delete course
export type DeleteCourseRes = Course | undefined;

export type InitializeCourseThumbnailUploadReq = z.infer<typeof CourseThumbnailUploadBodySchema>;
export type CompleteCourseThumbnailUploadReq = z.infer<
  typeof CourseThumbnailUploadCompleteBodySchema
>;
export type InitializeCourseThumbnailUploadRes = z.infer<
  typeof CourseThumbnailUploadResponseSchema
>;
