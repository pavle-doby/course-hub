"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Apple, Users, Bell, User, Folder, File, CirclePlus } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from "@repo/ui-web/components/drawer";
import { cn } from "@repo/ui-web/lib/utils";
import { useT } from "@repo/i18n/client";

const NAV_LINKS = [
  { href: "/learn", icon: Apple, labelKey: "nav.learn" as const },
  { href: "/clients", icon: Users, labelKey: "nav.clients" as const },
  { href: "/notifications", icon: Bell, labelKey: "nav.notifications" as const },
  { href: "/profile", icon: User, labelKey: "nav.profile" as const },
];

const CREATE_LINKS = [
  { href: "/courses", icon: Folder, labelKey: "nav.courses" as const },
  { href: "/lessons", icon: File, labelKey: "nav.lessons" as const },
];

export function MobileBottomNav() {
  const { t } = useT();
  const pathname = usePathname();
  const isCreateActive = pathname === "/courses" || pathname === "/lessons";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background lg:hidden">
      <div className="flex h-16 items-center justify-around">
        <Drawer>
          <DrawerTrigger
            aria-label={t("nav.create")}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 text-xs",
              isCreateActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <CirclePlus className="size-5" />
          </DrawerTrigger>
          <DrawerContent className="p-0">
            <div className="flex flex-col p-2 pb-8">
              {CREATE_LINKS.map(({ href, icon: Icon, labelKey }) => (
                <DrawerClose key={href} asChild>
                  <Link
                    href={href}
                    className="flex items-center gap-2 rounded-md px-4 py-3 text-sm font-medium hover:bg-accent"
                  >
                    <Icon className="size-4" />
                    {t(labelKey)}
                  </Link>
                </DrawerClose>
              ))}
            </div>
          </DrawerContent>
        </Drawer>

        {NAV_LINKS.map(({ href, icon: Icon, labelKey }) => (
          <Link
            key={href}
            href={href}
            aria-label={t(labelKey)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 text-xs",
              pathname === href ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="size-5" />
          </Link>
        ))}
      </div>
    </nav>
  );
}
