"use client";

import Link from "next/link";
import { SparklesIcon } from "lucide-react";
import { useT } from "@repo/i18n/client";
import { Alert, AlertAction, AlertTitle } from "@repo/ui-web/components/alert";
import { Button } from "@repo/ui-web/components/button";
import { cn } from "@repo/ui-web/lib/utils";

type UpgradeNoticeProps = { message: string; className?: string };

/** Explains that a feature is part of Pro, with a link to the pricing page. */
export function UpgradeNotice({ message, className }: UpgradeNoticeProps) {
  const { t } = useT();

  return (
    <Alert className={cn("w-full", className)}>
      <SparklesIcon />
      <AlertTitle>{message}</AlertTitle>
      <AlertAction>
        <Button asChild size="sm">
          <Link href="/pricing">{t("pricing.upgradeToPro")}</Link>
        </Button>
      </AlertAction>
    </Alert>
  );
}
