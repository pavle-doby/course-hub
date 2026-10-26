"use client";

import { useState } from "react";
import { PlanSchema } from "@repo/contract";
import type { BillingPeriod } from "@repo/contract";
import { useT } from "@repo/i18n/client";
import { usePlan } from "@/hooks/use-plan";
import { BillingToggle } from "./components/billing-toggle";
import { PlanCard } from "./components/plan-card";

// Public page: works logged out; logged in, it reads the user's plan to mark the current one.
export default function PricingPage() {
  const { t } = useT();
  const [billing, setBilling] = useState<BillingPeriod>("yearly");
  const { isLoggedIn, plan: currentPlan } = usePlan();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-6 md:px-6 md:py-10">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t("pricing.title")}</h1>
        <p className="text-muted-foreground">{t("pricing.subtitle")}</p>
      </div>
      <BillingToggle value={billing} onChange={setBilling} />
      <div className="grid items-stretch gap-6 md:grid-cols-3">
        {PlanSchema.options.map((plan) => (
          <PlanCard
            key={plan}
            plan={plan}
            billing={billing}
            isLoggedIn={isLoggedIn}
            isCurrent={plan === currentPlan}
            isHighlighted={plan === "pro"}
          />
        ))}
      </div>
    </div>
  );
}
