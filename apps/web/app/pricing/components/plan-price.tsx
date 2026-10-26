"use client";

import { PLAN_PRICES } from "@repo/contract";
import type { BillingPeriod, Plan } from "@repo/contract";
import { useT } from "@repo/i18n/client";
import { formatPrice } from "@/utils/format-price";

const WHOLE_EUROS = { maximumFractionDigits: 0 } as const;

const PERIOD_LABEL_KEYS = {
  monthly: "pricing.perMonth",
  yearly: "pricing.perYear",
} as const satisfies Record<BillingPeriod, string>;

type PlanPriceProps = { plan: Plan; billing: BillingPeriod };

/** Price for the chosen billing period; Enterprise is priced per deal. */
export function PlanPrice({ plan, billing }: PlanPriceProps) {
  const { t, i18n } = useT();
  const price = PLAN_PRICES[plan];

  if (!price) {
    return <p className="text-2xl font-semibold tracking-tight">{t("pricing.contactSales")}</p>;
  }

  // Only yearly, and only where it's cheaper than 12 months (Pro), gets the "2 months free" note
  const hasYearlySaving = billing === "yearly" && price.yearly < price.monthly * 12;

  return (
    <div className="flex flex-col gap-1">
      <p className="flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight">
          {formatPrice(price[billing], i18n.language, WHOLE_EUROS)}
        </span>
        <span className="text-muted-foreground">{t(PERIOD_LABEL_KEYS[billing])}</span>
      </p>
      {hasYearlySaving && (
        <p className="text-xs text-muted-foreground">{t("pricing.savingNoteYearly")}</p>
      )}
    </div>
  );
}
