import { ErrorCodePlans } from "@repo/contract";

export const plansErrorMessages = {
  [ErrorCodePlans.FEATURE_NOT_IN_PLAN]: {
    title: "errors.plans.FEATURE_NOT_IN_PLAN.title",
    message: "errors.plans.FEATURE_NOT_IN_PLAN.message",
  },
  [ErrorCodePlans.LIMIT_REACHED]: {
    title: "errors.plans.LIMIT_REACHED.title",
    message: "errors.plans.LIMIT_REACHED.message",
  },
  [ErrorCodePlans.INVALID_PLAN_VERSION]: {
    title: "errors.plans.INVALID_PLAN_VERSION.title",
    message: "errors.plans.INVALID_PLAN_VERSION.message",
  },
} as const satisfies Record<ErrorCodePlans, { title: string; message: string }>;
