import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { lessonProgress, lessonProgressStatusEnum } from "@repo/db-schema";

export const LessonProgressStatusSchema = z.enum(lessonProgressStatusEnum.enumValues);

export const LessonProgressSchema = createSelectSchema(lessonProgress).pick({
  lessonId: true,
  status: true,
  progressSeconds: true,
});

export const TopicProgressSchema = z.object({
  topicId: z.uuid(),
  status: LessonProgressStatusSchema,
});

export const CourseProgressSchema = z.object({
  status: LessonProgressStatusSchema,
  /** Lesson with the most recent progress activity; null before any activity. */
  lastLessonId: z.uuid().nullable(),
  topics: z.array(TopicProgressSchema),
  lessons: z.array(LessonProgressSchema),
});

export const LessonProgressParamsSchema = z.object({
  lessonId: z.uuid(),
});

export const UpdateLessonProgressBodySchema = z
  .object({
    status: LessonProgressStatusSchema.optional(),
    progressSeconds: z.number().int().min(0).optional(),
  })
  .refine((body) => body.status !== undefined || body.progressSeconds !== undefined, {
    message: "status or progressSeconds is required",
  });
