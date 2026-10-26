import { z } from "zod";
import { ParamsIdSchema } from "../shared";

export const PlanSchema = z.enum(["free", "pro", "enterprise"]);

/** Everything a plan can turn on or limit. Features every plan has get no key. */
export const PlanFeatureSchema = z.enum([
  "publishedCourses",
  "videoMinutes",
  "documentStorageMb",
  "aiQuizGenerationsDay",
  "privateCourses",
  "mcpAccess",
  "studentAiAccess",
  "reviewReplies",
  "fullStudentsPage",
  "liveSupport",
  "featureRequests",
]);

export const UpdateUserPlanParamsSchema = ParamsIdSchema;

/** Admin body for `PUT /users/:id/plan`; `planVersion` defaults to `CURRENT_PLAN_VERSION`. */
export const UpdateUserPlanBodySchema = z.object({
  plan: PlanSchema,
  planVersion: z.number().int().positive().optional(),
});
