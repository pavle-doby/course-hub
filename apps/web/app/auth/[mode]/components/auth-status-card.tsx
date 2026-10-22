import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@repo/ui-web/components/card";
import { Button } from "@repo/ui-web/components/button";
import { cn } from "@repo/ui-web/lib/utils";

type AuthStatusCardProps = {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  message: string;
  linkHref: string;
  linkLabel: string;
};

export function AuthStatusCard({
  icon: Icon,
  iconClassName,
  title,
  message,
  linkHref,
  linkLabel,
}: AuthStatusCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-6">
        <Icon className={cn("size-10 text-primary", iconClassName)} />
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button asChild className="w-full">
          <Link href={linkHref}>{linkLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
