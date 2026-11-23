"use client";

import type { BillingPeriod } from "@repo/contract";
import { useT } from "@repo/i18n/client";
import { Badge } from "@repo/ui-web/components/badge";
import { Button } from "@repo/ui-web/components/button";
import { ButtonGroup } from "@repo/ui-web/components/button-group";
import { cn } from "@repo/ui-web/lib/utils";
import { fireworkBurstFrom } from "@/utils/celebrate";

type BillingToggleProps = { value: BillingPeriod; onChange: (value: BillingPeriod) => void };

/** Yearly / Monthly button group (same toggle pattern as the theme picker in Settings), with a thank-you note under it for yearly. */
export function BillingToggle({ value, onChange }: BillingToggleProps) {
  const { t } = useT();

  function handleYearly(event: React.MouseEvent<HTMLButtonElement>) {
    onChange("yearly");
    fireworkBurstFrom(event.currentTarget);
  }

  function handleMonthly() {
    onChange("monthly");
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <ButtonGroup aria-label={t("pricing.billingPeriod")}>
        <Button
          className="min-w-30"
          type="button"
          variant={value === "yearly" ? "default" : "outline"}
          aria-pressed={value === "yearly"}
          onClick={handleYearly}
        >
          {t("pricing.yearly")}
          <Badge variant="secondary">{t("pricing.yearlySaving")}</Badge>
        </Button>
        <Button
          className="min-w-30"
          type="button"
          variant={value === "monthly" ? "default" : "outline"}
          aria-pressed={value === "monthly"}
          onClick={handleMonthly}
        >
          {t("pricing.monthly")}
        </Button>
      </ButtonGroup>
      {/* Hidden, not removed, on monthly so the cards below don't jump when switching */}
      <p
        className={cn(
          "max-w-sm text-center text-xs whitespace-pre-line text-muted-foreground",
          value !== "yearly" && "invisible"
        )}
        aria-hidden={value !== "yearly"}
      >
        {t("pricing.yearlyThanks")}
      </p>
    </div>
  );
}
