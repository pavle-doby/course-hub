"use client";

import Link from "next/link";
import type { Plan } from "@repo/contract";
import { useT } from "@repo/i18n/client";
import { Button } from "@repo/ui-web/components/button";
import { CONTACT_EMAIL } from "@/utils/consts";

type PlanActionProps = { plan: Plan; isLoggedIn: boolean; isCurrent: boolean };

/** Bottom button of a plan card. Nothing can be bought yet, so Pro is disabled until payments ship. */
export function PlanAction({ plan, isLoggedIn, isCurrent }: PlanActionProps) {
  const { t } = useT();

  if (isCurrent) {
    return (
      <Button variant="outline" size="lg" className="w-full" disabled>
        {t("pricing.currentPlan")}
      </Button>
    );
  }

  if (plan === "free") {
    // Logged in on a paid plan (or still loading it): there's nothing to do on Free
    if (isLoggedIn) {
      return null;
    }
    return (
      <Button asChild variant="outline" size="lg" className="w-full">
        <Link href="/auth/signup">{t("pricing.getStarted")}</Link>
      </Button>
    );
  }

  if (plan === "pro") {
    return (
      <Button size="lg" className="w-full" disabled>
        {t("pricing.comingSoon")}
      </Button>
    );
  }

  // Disabled until NEXT_PUBLIC_CONTACT_EMAIL is set so it never opens a broken mailto
  if (!CONTACT_EMAIL) {
    return (
      <Button size="lg" className="w-full" disabled>
        {t("pricing.contactUs")}
      </Button>
    );
  }
  const subject = encodeURIComponent(t("pricing.contactSubject"));
  return (
    <Button asChild size="lg" className="w-full">
      <a href={`mailto:${CONTACT_EMAIL}?subject=${subject}`}>{t("pricing.contactUs")}</a>
    </Button>
  );
}
