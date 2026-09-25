"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppleIcon,
  BellIcon,
  UsersIcon,
  UserIcon,
  FolderIcon,
  FileIcon,
  CirclePlusIcon,
  CompassIcon,
  GraduationCapIcon,
} from "lucide-react";
import { Button } from "@repo/ui-web/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@repo/ui-web/components/drawer";
import { useT } from "@repo/i18n/client";
import { cn } from "@repo/ui-web/lib/utils";
import { ChBottomNav } from "@/components/ch-bottom-nav";
import { useUnreadNotificationsCount } from "@/hooks/use-unread-notifications";

const NAV_LINKS = [
  { href: "/students", icon: UsersIcon, labelKey: "nav.students" as const },
  { href: "/notifications", icon: BellIcon, labelKey: "nav.notifications" as const },
  { href: "/profile", icon: UserIcon, labelKey: "nav.profile" as const },
];

const LEARN_LINKS = [
  { href: "/learn/explore", icon: CompassIcon, labelKey: "nav.learnExplore" as const },
  { href: "/learn/enrolled", icon: GraduationCapIcon, labelKey: "nav.learnEnrolled" as const },
];

const CREATE_LINKS = [
  { href: "/courses", icon: FolderIcon, labelKey: "nav.courses" as const },
  { href: "/lessons", icon: FileIcon, labelKey: "nav.lessons" as const },
];

export function MobileBottomNav() {
  const { t } = useT();
  const pathname = usePathname();
  const unreadCount = useUnreadNotificationsCount();
  const isCreateActive = pathname === "/courses" || pathname === "/lessons";
  const isLearnActive = pathname.startsWith("/learn");

  return (
    <ChBottomNav>
      <div className="flex items-center justify-around">
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              size="icon-lg"
              aria-label={t("nav.learn")}
              className={isLearnActive ? "text-primary" : "text-muted-foreground"}
            >
              <AppleIcon className="size-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="p-0">
            <DrawerHeader className="border-b text-left">
              <DrawerTitle>{t("nav.learn")}</DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col gap-3 p-2 pb-16">
              {LEARN_LINKS.map(({ href, icon: Icon, labelKey }) => (
                <DrawerClose key={href} asChild>
                  <Link href={href}>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Icon className="size-4" />
                      {t(labelKey)}
                    </Button>
                  </Link>
                </DrawerClose>
              ))}
            </div>
          </DrawerContent>
        </Drawer>

        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              size="icon-lg"
              aria-label={t("nav.create")}
              className={isCreateActive ? "text-primary" : "text-muted-foreground"}
            >
              <CirclePlusIcon className="size-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="p-0">
            <DrawerHeader className="border-b text-left">
              <DrawerTitle>{t("nav.create")}</DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col gap-3 p-2 pb-16">
              {CREATE_LINKS.map(({ href, icon: Icon, labelKey }) => (
                <DrawerClose key={href} asChild>
                  <Link href={href}>
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Icon className="size-4" />
                      {t(labelKey)}
                    </Button>
                  </Link>
                </DrawerClose>
              ))}
            </div>
          </DrawerContent>
        </Drawer>

        {NAV_LINKS.map(({ href, icon: Icon, labelKey }) => (
          <Link key={href} href={href} aria-label={t(labelKey)}>
            <Button
              variant="ghost"
              size="icon-lg"
              className={cn(
                "relative",
                pathname === href ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" />
              {href === "/notifications" && unreadCount > 0 && (
                <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive ring-2 ring-background" />
              )}
            </Button>
          </Link>
        ))}
      </div>
    </ChBottomNav>
  );
}
