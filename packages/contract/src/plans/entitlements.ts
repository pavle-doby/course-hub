import type { BillingPeriod, Plan, PlanEntitlements } from "./types";

/** Version new users get. Existing users keep theirs when a plan's limits change. */
export const CURRENT_PLAN_VERSION = 1;

/**
 * What each plan includes, per version. The pricing page renders it and the API will enforce it,
 * so a limit changes in one place. Add a version instead of editing one users already have.
 */
export const PLAN_ENTITLEMENTS = {
  free: {
    1: {
      publishedCourses: 3,
      videoMinutes: 30,
      documentStorageMb: 500,
      aiQuizGenerationsDay: 0,
      privateCourses: false,
      mcpAccess: false,
      studentAiAccess: false,
      reviewReplies: false,
      fullStudentsPage: false,
      liveSupport: false,
      featureRequests: false,
    },
  },
  pro: {
    1: {
      publishedCourses: null,
      videoMinutes: 1200,
      documentStorageMb: 20480,
      aiQuizGenerationsDay: 20,
      privateCourses: true,
      mcpAccess: true,
      studentAiAccess: true,
      reviewReplies: true,
      fullStudentsPage: true,
      liveSupport: false,
      featureRequests: false,
    },
  },
  // ponytail: no caps by default; a deal that needs one gets a per-user override later
  enterprise: {
    1: {
      publishedCourses: null,
      videoMinutes: null,
      documentStorageMb: null,
      aiQuizGenerationsDay: null,
      privateCourses: true,
      mcpAccess: true,
      studentAiAccess: true,
      reviewReplies: true,
      fullStudentsPage: true,
      liveSupport: true,
      featureRequests: true,
    },
  },
} as const satisfies Record<Plan, Record<number, PlanEntitlements>>;

/**
 * Display prices in minor units (cents) of EUR. Enterprise is priced per deal.
 * The payment provider becomes the source of truth for what a customer pays.
 */
export const PLAN_PRICES = {
  free: { monthly: 0, yearly: 0 },
  pro: { monthly: 1900, yearly: 19000 },
  enterprise: null,
} as const satisfies Record<Plan, Record<BillingPeriod, number> | null>;

type Entitlements = (typeof PLAN_ENTITLEMENTS)["free"][typeof CURRENT_PLAN_VERSION];

/** Features that are on or off. */
export type PlanToggleFeature = {
  [K in keyof Entitlements]: Entitlements[K] extends boolean ? K : never;
}[keyof Entitlements];

/** Features with a numeric limit (`null` = unlimited). */
export type PlanLimitFeature = Exclude<keyof Entitlements, PlanToggleFeature>;

/**
 * What a user on `plan` / `planVersion` gets. Shared by the API checks and the web UI.
 * ponytail: an unknown version falls back to the current one instead of locking the user out.
 */
export function getPlanEntitlements(plan: Plan, planVersion: number): PlanEntitlements {
  const versions: Record<number, PlanEntitlements> = PLAN_ENTITLEMENTS[plan];
  return versions[planVersion] ?? versions[CURRENT_PLAN_VERSION]!;
}
