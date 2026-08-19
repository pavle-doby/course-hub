"use client";

import { useGetUserSelf } from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { Button } from "@repo/ui-web/components/button";

export default function Page() {
  const { data, isPending } = useGetUserSelf();
  const { t } = useT();

  console.log({ data, isPending });

  if (isPending) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">{t("hello", { name: data?.firstName })}</h1>
          <p>You may now add components and start building.</p>
          <p>We&apos;ve already added the button component for you.</p>
          <Button className="mt-2">Button</Button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>
      </div>
    </div>
  );
}
