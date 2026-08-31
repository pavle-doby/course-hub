import { z } from "zod";
import { CourseEntity } from "@repo/db-schema";
import { PaginationReq, PaginationRes, Search } from "../shared";
import {
  CourseGetAllQuerySchema,
  CoursePostQuerySchema,
  CoursePutQuerySchema,
  CourseSchema,
} from "./schemas";

export type Course = z.infer<typeof CourseSchema>;

export type CourseStatus = CourseEntity["status"];

// GET /courses → get all courses
export type GetAllCoursesReq<Pagination = PaginationReq> = Pagination &
  Partial<Search> &
  z.infer<typeof CourseGetAllQuerySchema>;
export type GetAllCoursesRes = PaginationRes<Course>;

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
