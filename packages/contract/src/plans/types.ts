import { z } from "zod";
import { PlanFeatureSchema, PlanSchema, UpdateUserPlanBodySchema } from "./schemas";

export type Plan = z.infer<typeof PlanSchema>;
export type PlanFeature = z.infer<typeof PlanFeatureSchema>;

export type BillingPeriod = "monthly" | "yearly";

/** `boolean` for on/off features, a number for limits, `null` for unlimited. */
export type PlanEntitlements = Record<PlanFeature, boolean | number | null>;

// PUT /users/:id/plan → set a user's plan (admin)
export type UpdateUserPlanReq = z.infer<typeof UpdateUserPlanBodySchema>;
