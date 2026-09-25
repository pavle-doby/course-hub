"use client";

import Link from "next/link";
import { BellIcon, MenuIcon, SettingsIcon, SparklesIcon, LogOutIcon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@repo/ui-web/components/sheet";
import { Button } from "@repo/ui-web/components/button";
import { useAuthSignOut } from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { clearAuthTokens } from "@/utils/token-storage";
import { useUnreadNotificationsCount } from "@/hooks/use-unread-notifications";

const TITLE_BY_PATH: Record<
  string,
  | "nav.courses"
  | "nav.lessons"
  | "nav.learn"
  | "nav.students"
  | "nav.notifications"
  | "nav.profile"
  | "nav.aiConnect"
  | "nav.settings"
> = {
  "/courses": "nav.courses",
  "/lessons": "nav.lessons",
  "/learn": "nav.learn",
  "/students": "nav.students",
  "/notifications": "nav.notifications",
  "/profile": "nav.profile",
  "/ai-connect": "nav.aiConnect",
  "/settings": "nav.settings",
};

export function MobileHeader() {
  const { t } = useT();
  const router = useRouter();
  const pathname = usePathname();
  const { mutate: signOut } = useAuthSignOut();
  const unreadCount = useUnreadNotificationsCount();

  const titleKey =
    Object.entries(TITLE_BY_PATH).find(([path]) => pathname.startsWith(path))?.[1] ?? "nav.courses";

  function handleSignOut() {
    signOut(undefined, {
      onSuccess: () => {
        clearAuthTokens();
        router.push("/auth/login");
      },
    });
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
      <span className="text-lg font-bold">{t(titleKey)}</span>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="relative" asChild>
          <Link href="/notifications" aria-label={t("nav.notifications")}>
            <BellIcon className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive ring-2 ring-background" />
            )}
          </Link>
        </Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <MenuIcon className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col p-0 pt-12">
            <nav className="flex flex-col gap-1 px-4">
              <SheetClose asChild>
                <Link
                  href="/ai-connect"
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-accent"
                >
                  <SparklesIcon className="size-4" />
                  {t("nav.aiConnect")}
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-accent"
                >
                  <SettingsIcon className="size-4" />
                  {t("nav.settings")}
                </Link>
              </SheetClose>
            </nav>
            <div className="mt-auto border-t px-4 py-4">
              <SheetClose asChild>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-accent"
                >
                  <LogOutIcon className="size-4" />
                  {t("nav.logOut")}
                </button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
