import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { courseEnrollments } from "@repo/db-schema";
import { CourseSchema } from "../courses/schemas";
import { UserSchema } from "../users/schemas";

export const CourseEnrollmentSchema = createSelectSchema(courseEnrollments);

export const EnrollCourseBodySchema = z.object({
  publicId: z.string().max(12),
});

// A course in the current user's enrolled list, with the percent of its lessons they finished.
export const EnrolledCourseSchema = CourseSchema.extend({
  progressPercent: z.number().int().min(0).max(100),
});

export const StudentSchema = UserSchema.pick({
  id: true,
  firstName: true,
  lastName: true,
  username: true,
  avatarUrl: true,
  email: true,
}).extend({
  course: CourseSchema.pick({ id: true, name: true, publicId: true }),
  enrolledAt: CourseEnrollmentSchema.shape.enrolledAt,
  completedAt: CourseEnrollmentSchema.shape.completedAt,
  withdrawnAt: CourseEnrollmentSchema.shape.withdrawnAt,
});
