import { z } from "zod";
import { PaginationReq, PaginationRes, Search } from "../shared";
import {
  LessonGetAllQuerySchema,
  LessonPostQuerySchema,
  LessonPutQuerySchema,
  LessonSchema,
} from "./schemas";

export type Lesson = z.infer<typeof LessonSchema>;

export type GetAllLessonsReq<Pagination = PaginationReq> = Pagination &
  Partial<Search> &
  z.infer<typeof LessonGetAllQuerySchema>;
export type GetAllLessonsRes = PaginationRes<Lesson>;

// GET /courses/public/:publicId/lessons → lessons for a published course
export type GetPublicLessonsRes = Lesson[];

export type GetLessonRes = Lesson | undefined;

export type CreateLessonReq = z.infer<typeof LessonPostQuerySchema>;
export type CreateLessonRes = Lesson;

export type UpdateLessonReq = z.infer<typeof LessonPutQuerySchema>;
export type UpdateLessonRes = Lesson | undefined;

export type DeleteLessonRes = Lesson | undefined;
