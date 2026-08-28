"use client";

import Link from "next/link";
import { Menu, Settings, MessageCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@repo/ui-web/components/sheet";
import { Button } from "@repo/ui-web/components/button";
import { useAuthSignOut } from "@repo/api-client";
import { useT } from "@repo/i18n/client";

export function MobileHeader() {
  const { t } = useT();
  const router = useRouter();
  const { mutate: signOut } = useAuthSignOut();

  function handleSignOut() {
    signOut(undefined, { onSuccess: () => router.push("/auth/login") });
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4 lg:hidden">
      <span className="text-lg font-bold">{t("courses.title")}</span>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="flex flex-col p-0 pt-12">
          <nav className="flex flex-col gap-1 px-4">
            <SheetClose asChild>
              <Link
                href="/settings"
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-accent"
              >
                <Settings className="size-4" />
                {t("nav.settings")}
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link
                href="/feedback"
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-accent"
              >
                <MessageCircle className="size-4" />
                {t("nav.feedback")}
              </Link>
            </SheetClose>
          </nav>
          <div className="mt-auto border-t px-4 py-4">
            <SheetClose asChild>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-accent"
              >
                <LogOut className="size-4" />
                {t("nav.logOut")}
              </button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
