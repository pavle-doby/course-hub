import { z } from "zod";
import type { Topic } from "../topics";
import type { Lesson } from "../lessons";
import type { Course } from "../courses";
import type { PaginationReq, PaginationRes, Search } from "../shared";
import { CourseEnrollmentSchema, EnrollCourseBodySchema, StudentSchema } from "./schemas";

export type CourseEnrollment = z.infer<typeof CourseEnrollmentSchema>;
export type Student = z.infer<typeof StudentSchema>;

// POST /enrollments → enroll current user into a published course
export type EnrollCourseReq = z.infer<typeof EnrollCourseBodySchema>;
export type EnrollCourseRes = CourseEnrollment;

// GET /enrollments/courses/:publicId → is current user enrolled in this course
export type GetEnrollmentStatusRes = { enrolled: boolean };

// DELETE /enrollments/courses/:publicId → withdraw current user from an enrolled course
export type WithdrawFromCourseRes = CourseEnrollment;

// GET /enrollments/courses/:publicId/topics → full topics, requires enrollment
export type GetEnrolledCourseTopicsRes = Topic[];

// GET /enrollments/courses/:publicId/lessons → full lessons, requires enrollment
export type GetEnrolledCourseLessonsRes = Lesson[];

// GET /enrollments/courses → courses current user is enrolled in
export type GetAllEnrolledCoursesReq<Pagination = PaginationReq> = Pagination & Partial<Search>;
export type GetAllEnrolledCoursesRes = PaginationRes<Course>;

// GET /enrollments/students → students enrolled in courses created by the current user
export type GetAllStudentsReq<Pagination = PaginationReq> = Pagination & Partial<Search>;
export type GetAllStudentsRes = PaginationRes<Student>;
