import {
  ErrorCodePlans,
  ForbiddenError,
  getPlanEntitlements,
  type PlanEntitlements,
  type PlanLimitFeature,
  type PlanToggleFeature,
} from "@repo/contract";
import type { UserEntity } from "@repo/db-schema";

type PlanUser = Pick<UserEntity, "plan" | "planVersion">;

/**
 * Plan checks. Pure: callers pass usage in, so each service counts only what it needs.
 * Every check goes through `get`, so per-user overrides (later) change only this file.
 */
export const entitlementsService = {
  get: (user: PlanUser): PlanEntitlements => getPlanEntitlements(user.plan, user.planVersion),

  /** Throws `FEATURE_NOT_IN_PLAN` (403) when the user's plan doesn't include the feature. */
  assertFeature: (user: PlanUser, feature: PlanToggleFeature): void => {
    if (!entitlementsService.get(user)[feature]) {
      throw new ForbiddenError({ code: ErrorCodePlans.FEATURE_NOT_IN_PLAN });
    }
  },

  /** Throws `LIMIT_REACHED` (403) when `used + adding` would go over the plan's limit. */
  assertWithinLimit: (
    user: PlanUser,
    feature: PlanLimitFeature,
    used: number,
    adding: number
  ): void => {
    const limit = entitlementsService.get(user)[feature] as number | null;
    if (limit !== null && used + adding > limit) {
      throw new ForbiddenError({ code: ErrorCodePlans.LIMIT_REACHED });
    }
  },
};
