import { CURRENT_PLAN_VERSION, PLAN_ENTITLEMENTS } from "@repo/contract";
import type { Plan } from "@repo/contract";

const free = PLAN_ENTITLEMENTS.free[CURRENT_PLAN_VERSION];
const pro = PLAN_ENTITLEMENTS.pro[CURRENT_PLAN_VERSION];

/** One feature line on a plan card; `value` fills `{{value}}` and comes from the entitlements. */
export type PlanFeatureLine = {
  key: `pricing.features.${string}`;
  value?: number;
  /** Section lead-in ("Everything in Free, plus:") rather than a checked feature. */
  isHeading?: boolean;
};

export const PLAN_FEATURE_LINES = {
  free: [
    { key: "pricing.features.publishedCourses", value: free.publishedCourses },
    { key: "pricing.features.videoMinutes", value: free.videoMinutes },
    { key: "pricing.features.documentsMb", value: free.documentStorageMb },
    { key: "pricing.features.manualQuizzes" },
    { key: "pricing.features.publicCourses" },
    { key: "pricing.features.leaderboard" },
    { key: "pricing.features.basicStudents" },
    { key: "pricing.features.pushNotifications" },
    { key: "pricing.features.learnersFree" },
  ],
  pro: [
    { key: "pricing.features.everythingInFree", isHeading: true },
    { key: "pricing.features.unlimitedCourses" },
    { key: "pricing.features.videoHours", value: pro.videoMinutes / 60 },
    { key: "pricing.features.documentsGb", value: pro.documentStorageMb / 1024 },
    { key: "pricing.features.aiQuizzes", value: pro.aiQuizGenerationsDay },
    { key: "pricing.features.privateCourses" },
    { key: "pricing.features.mcpAccess" },
    { key: "pricing.features.studentAiAccess" },
    { key: "pricing.features.reviewReplies" },
    { key: "pricing.features.fullStudents" },
  ],
  enterprise: [
    { key: "pricing.features.everythingInPro", isHeading: true },
    { key: "pricing.features.noLimits" },
    { key: "pricing.features.liveSupport" },
    { key: "pricing.features.featureRequests" },
  ],
} as const satisfies Record<Plan, PlanFeatureLine[]>;
