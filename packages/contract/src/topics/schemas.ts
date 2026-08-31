import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { topics } from "@repo/db-schema";

export const TopicSchema = createSelectSchema(topics).omit({
  createdAt: true,
  updatedAt: true,
});

export const TopicGetAllQuerySchema = z.object({
  courseId: z.uuid().optional(),
});

export const TopicPostQuerySchema = createInsertSchema(topics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const TopicPutQuerySchema = createUpdateSchema(topics)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();
