"use client";

import { useSyncExternalStore } from "react";
import { getPlanEntitlements } from "@repo/contract";
import type { Plan, PlanEntitlements } from "@repo/contract";
import { useGetUserSelf } from "@repo/api-client";
import { getAccessToken } from "@/utils/token-storage";

const noopSubscribe = () => () => {};

type UsePlanResult = {
  /** Has a token; the server render is always logged out. */
  isLoggedIn: boolean;
  /** Undefined while loading or when logged out. */
  plan: Plan | undefined;
  /** Undefined while loading or when logged out; the API still enforces every limit. */
  entitlements: PlanEntitlements | undefined;
};

/** The current user's plan and what it includes, from `GET /v1/users/self`. */
export function usePlan(): UsePlanResult {
  // Reads the token after hydration so the server and first client render agree
  const hasToken = useSyncExternalStore(
    noopSubscribe,
    () => Boolean(getAccessToken()),
    () => false
  );
  const { data: user } = useGetUserSelf({ query: { enabled: hasToken, retry: false } });

  return {
    isLoggedIn: hasToken,
    plan: user?.plan,
    entitlements: user ? getPlanEntitlements(user.plan, user.planVersion) : undefined,
  };
}
