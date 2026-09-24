import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { lessons } from "@repo/db-schema";

export const LessonSchema = createSelectSchema(lessons).omit({
  createdAt: true,
  updatedAt: true,
});

// Lesson list item carries its course's public id so the UI can link to the course editor
export const LessonListItemSchema = LessonSchema.extend({
  coursePublicId: z.string(),
});

// Names-only shape for non-enrolled learners (no description)
export const PublicLessonSchema = LessonSchema.pick({
  id: true,
  topicId: true,
  name: true,
  position: true,
});

export const LessonGetAllQuerySchema = z.object({
  topicId: z.uuid().optional(),
  courseId: z.uuid().optional(),
});

export const LessonPostQuerySchema = createInsertSchema(lessons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const LessonPutQuerySchema = createUpdateSchema(lessons)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();
