import { z } from "zod";
import { PaginationReq, PaginationRes, Search } from "../shared";
import {
  LessonGetAllQuerySchema,
  LessonPostQuerySchema,
  LessonPutQuerySchema,
  LessonListItemSchema,
  LessonSchema,
  PublicLessonSchema,
} from "./schemas";

export type Lesson = z.infer<typeof LessonSchema>;
export type LessonListItem = z.infer<typeof LessonListItemSchema>;
export type PublicLesson = z.infer<typeof PublicLessonSchema>;

export type GetAllLessonsReq<Pagination = PaginationReq> = Pagination &
  Partial<Search> &
  z.infer<typeof LessonGetAllQuerySchema>;
export type GetAllLessonsRes = PaginationRes<LessonListItem>;

// GET /courses/public/:publicId/lessons → lesson names for a published course (no auth)
export type GetPublicLessonsRes = PublicLesson[];

export type GetLessonRes = Lesson | undefined;

export type CreateLessonReq = z.infer<typeof LessonPostQuerySchema>;
export type CreateLessonRes = Lesson;

export type UpdateLessonReq = z.infer<typeof LessonPutQuerySchema>;
export type UpdateLessonRes = Lesson | undefined;

export type DeleteLessonRes = Lesson | undefined;
