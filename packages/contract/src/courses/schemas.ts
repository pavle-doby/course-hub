import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { courses } from "@repo/db-schema";
import { courseStatusEnum } from "@repo/db-schema";

export const CourseSchema = createSelectSchema(courses, {
  status: z.enum(courseStatusEnum.enumValues),
}).omit({
  createdAt: true,
  updatedAt: true,
});

export const CourseGetAllQuerySchema = z.object({
  status: z.enum(courseStatusEnum.enumValues).optional(),
});

export const CoursePostQuerySchema = createInsertSchema(courses, {
  status: z.enum(courseStatusEnum.enumValues).optional(),
}).omit({
  id: true,
  creatorId: true,
  publicId: true,
  createdAt: true,
  updatedAt: true,
});

export const CoursePutQuerySchema = createUpdateSchema(courses, {
  status: z.enum(courseStatusEnum.enumValues).optional(),
})
  .omit({
    id: true,
    creatorId: true,
    publicId: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();
