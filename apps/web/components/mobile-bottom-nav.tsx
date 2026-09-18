"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Apple, Users, User, Folder, File, CirclePlus, Compass, GraduationCap } from "lucide-react";
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
import { ChBottomNav } from "@/components/ch-bottom-nav";

const NAV_LINKS = [
  { href: "/students", icon: Users, labelKey: "nav.students" as const },
  { href: "/profile", icon: User, labelKey: "nav.profile" as const },
];

const LEARN_LINKS = [
  { href: "/learn/explore", icon: Compass, labelKey: "nav.learnExplore" as const },
  { href: "/learn/enrolled", icon: GraduationCap, labelKey: "nav.learnEnrolled" as const },
];

const CREATE_LINKS = [
  { href: "/courses", icon: Folder, labelKey: "nav.courses" as const },
  { href: "/lessons", icon: File, labelKey: "nav.lessons" as const },
];

export function MobileBottomNav() {
  const { t } = useT();
  const pathname = usePathname();
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
              <Apple className="size-5" />
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
              <CirclePlus className="size-5" />
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
              className={pathname === href ? "text-primary" : "text-muted-foreground"}
            >
              <Icon className="size-5" />
            </Button>
          </Link>
        ))}
      </div>
    </ChBottomNav>
  );
}
