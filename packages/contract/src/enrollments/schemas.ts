import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { courseEnrollments } from "@repo/db-schema";

export const CourseEnrollmentSchema = createSelectSchema(courseEnrollments);

export const EnrollCourseBodySchema = z.object({
  publicId: z.string().max(12),
});
