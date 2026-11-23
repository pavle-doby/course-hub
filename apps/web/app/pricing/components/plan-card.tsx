"use client";

import { CheckIcon } from "lucide-react";
import type { BillingPeriod, Plan } from "@repo/contract";
import { useT } from "@repo/i18n/client";
import { Badge } from "@repo/ui-web/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui-web/components/card";
import { cn } from "@repo/ui-web/lib/utils";
import { PLAN_FEATURE_LINES } from "./plan-features";
import { PlanAction } from "./plan-action";
import { PlanPrice } from "./plan-price";

type PlanCardProps = {
  plan: Plan;
  billing: BillingPeriod;
  isLoggedIn: boolean;
  /** The logged-in user's plan. */
  isCurrent: boolean;
  isHighlighted?: boolean;
};

export function PlanCard({
  plan,
  billing,
  isLoggedIn,
  isCurrent,
  isHighlighted = false,
}: PlanCardProps) {
  const { t } = useT();

  return (
    <Card className={cn("gap-6 py-6", isHighlighted && "ring-2 ring-primary")}>
      <CardHeader className="px-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xl font-semibold">{t(`pricing.plans.${plan}.name`)}</CardTitle>
          {isHighlighted && <Badge>{t("pricing.mostPopular")}</Badge>}
        </div>
        <CardDescription>{t(`pricing.plans.${plan}.tagline`)}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-6 px-6">
        <PlanPrice plan={plan} billing={billing} />
        <ul className="flex flex-col gap-2.5">
          {PLAN_FEATURE_LINES[plan].map((line) =>
            "isHeading" in line ? (
              <li key={line.key} className="font-medium">
                {t(line.key)}
              </li>
            ) : (
              <li key={line.key} className="flex gap-2">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{"value" in line ? t(line.key, { value: line.value }) : t(line.key)}</span>
              </li>
            )
          )}
        </ul>
        <div className="mt-auto">
          <PlanAction plan={plan} isLoggedIn={isLoggedIn} isCurrent={isCurrent} />
        </div>
      </CardContent>
    </Card>
  );
}
