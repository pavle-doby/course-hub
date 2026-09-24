import { z } from "zod";
import {
  AddLessonInputSchema,
  AddTopicInputSchema,
  CourseTreeSchema,
  CreateCourseDraftInputSchema,
  GetCourseTreeInputSchema,
  GetEnrolledCourseInputSchema,
  ListEnrolledCoursesInputSchema,
  ListMyCoursesInputSchema,
  SearchPublicCoursesInputSchema,
  UpdateCourseInputSchema,
  UpdateLessonInputSchema,
  UpdateTopicInputSchema,
} from "./schemas";

export type CourseTree = z.infer<typeof CourseTreeSchema>;

export type ListMyCoursesInput = z.infer<typeof ListMyCoursesInputSchema>;
export type GetCourseTreeInput = z.infer<typeof GetCourseTreeInputSchema>;
export type ListEnrolledCoursesInput = z.infer<typeof ListEnrolledCoursesInputSchema>;
export type GetEnrolledCourseInput = z.infer<typeof GetEnrolledCourseInputSchema>;
export type SearchPublicCoursesInput = z.infer<typeof SearchPublicCoursesInputSchema>;
export type CreateCourseDraftInput = z.infer<typeof CreateCourseDraftInputSchema>;
export type AddTopicInput = z.infer<typeof AddTopicInputSchema>;
export type AddLessonInput = z.infer<typeof AddLessonInputSchema>;
export type UpdateCourseInput = z.infer<typeof UpdateCourseInputSchema>;
export type UpdateTopicInput = z.infer<typeof UpdateTopicInputSchema>;
export type UpdateLessonInput = z.infer<typeof UpdateLessonInputSchema>;
