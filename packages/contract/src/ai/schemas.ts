import { z } from "zod";
import { courseStatusEnum } from "@repo/db-schema";
import { CoursePostQuerySchema, CoursePutQuerySchema, CourseSchema } from "../courses/schemas";
import { TopicPostQuerySchema, TopicPutQuerySchema, TopicSchema } from "../topics/schemas";
import { LessonPostQuerySchema, LessonPutQuerySchema, LessonSchema } from "../lessons/schemas";
import { QuizParentParamsSchema, SaveQuizBodySchema } from "../quizzes/schemas";

// ponytail: caps keep one tool call from inserting thousands of rows
const MAX_TOPICS = 30;
const MAX_LESSONS_PER_TOPIC = 30;
const MAX_PAGE_SIZE = 50;

const PageInputShape = {
  page: z.int().min(0).optional(),
  limit: z.int().min(1).max(MAX_PAGE_SIZE).optional(),
};

// Compact course tree put into LLM context: no timestamps, media ids or creator info
export const CourseTreeLessonSchema = LessonSchema.pick({
  id: true,
  name: true,
  description: true,
  position: true,
});

export const CourseTreeTopicSchema = TopicSchema.pick({
  id: true,
  name: true,
  description: true,
  position: true,
}).extend({ lessons: z.array(CourseTreeLessonSchema) });

export const CourseTreeSchema = CourseSchema.pick({
  id: true,
  publicId: true,
  name: true,
  description: true,
  status: true,
  visibility: true,
}).extend({ topics: z.array(CourseTreeTopicSchema) });

export const ListMyCoursesInputSchema = z.object({
  query: z.string().max(255).optional(),
  status: z.enum(courseStatusEnum.enumValues).optional(),
  ...PageInputShape,
});

export const GetCourseTreeInputSchema = z
  .object({
    courseId: z.uuid().optional(),
    publicId: z.string().max(12).optional(),
  })
  .refine((input) => !!input.courseId !== !!input.publicId, {
    message: "Provide exactly one of courseId or publicId",
  });

export const ListEnrolledCoursesInputSchema = z.object({
  query: z.string().max(255).optional(),
  ...PageInputShape,
});

export const GetEnrolledCourseInputSchema = z.object({
  publicId: z.string().max(12),
});

export const SearchPublicCoursesInputSchema = z.object({
  query: z.string().max(255).optional(),
  ...PageInputShape,
});

const DraftLessonInputSchema = LessonPostQuerySchema.pick({ name: true, description: true });

const DraftTopicInputSchema = TopicPostQuerySchema.pick({ name: true, description: true }).extend({
  lessons: z.array(DraftLessonInputSchema).max(MAX_LESSONS_PER_TOPIC).optional(),
});

export const CreateCourseDraftInputSchema = CoursePostQuerySchema.pick({
  name: true,
  description: true,
}).extend({
  topics: z.array(DraftTopicInputSchema).max(MAX_TOPICS).optional(),
});

export const AddTopicInputSchema = TopicPostQuerySchema.pick({
  courseId: true,
  name: true,
  description: true,
  position: true,
}).partial({ position: true });

export const AddLessonInputSchema = LessonPostQuerySchema.pick({
  topicId: true,
  name: true,
  description: true,
  position: true,
}).partial({ position: true });

export const UpdateCourseInputSchema = CoursePutQuerySchema.pick({
  name: true,
  description: true,
}).extend({ courseId: z.uuid() });

export const UpdateTopicInputSchema = TopicPutQuerySchema.pick({
  name: true,
  description: true,
  position: true,
}).extend({ topicId: z.uuid() });

export const UpdateLessonInputSchema = LessonPutQuerySchema.pick({
  name: true,
  description: true,
  position: true,
}).extend({ lessonId: z.uuid() });

// Replaces the whole quiz on a course, topic or lesson
export const SaveQuizInputSchema = QuizParentParamsSchema.extend(SaveQuizBodySchema.shape);
