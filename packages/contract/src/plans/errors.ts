export enum ErrorCodePlans {
  /** An on/off feature the user's plan doesn't include (e.g. private courses on Free). */
  FEATURE_NOT_IN_PLAN = "plans_feature_not_in_plan",
  /** A numeric limit of the user's plan is used up (e.g. published courses on Free). */
  LIMIT_REACHED = "plans_limit_reached",
  /** Admin picked a plan version that doesn't exist in `PLAN_ENTITLEMENTS`. */
  INVALID_PLAN_VERSION = "plans_invalid_plan_version",
}
