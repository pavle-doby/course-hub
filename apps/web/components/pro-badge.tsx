"use client";

import { useT } from "@repo/i18n/client";
import { Badge } from "@repo/ui-web/components/badge";

/** Marks a control the user's plan doesn't include. */
export function ProBadge() {
  const { t } = useT();
  return <Badge variant="secondary">{t("pricing.proBadge")}</Badge>;
}
