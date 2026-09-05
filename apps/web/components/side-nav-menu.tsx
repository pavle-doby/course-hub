"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@repo/ui-web";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Apple,
  Bell,
  ChevronRight,
  CirclePlus,
  Compass,
  File,
  Folder,
  GraduationCap,
  LogOut,
  MessageCircle,
  Settings,
  User,
  Users,
} from "lucide-react";

import { useAuthSignOut } from "@repo/api-client";
import { useT } from "@repo/i18n/client";

type NavKey =
  | "nav.create"
  | "nav.courses"
  | "nav.lessons"
  | "nav.learn"
  | "nav.learnExplore"
  | "nav.learnEnrolled"
  | "nav.students"
  | "nav.notifications"
  | "nav.profile"
  | "nav.settings"
  | "nav.feedback"
  | "nav.logOut";

type NavSubItem = { label: NavKey; href: string; icon?: LucideIcon };
type NavItem =
  | { label: NavKey; icon: LucideIcon; href: string; items?: never }
  | { label: NavKey; icon: LucideIcon; href?: never; items: NavSubItem[] };
type FooterItem =
  | { label: NavKey; icon: LucideIcon; href: string; action?: never }
  | { label: NavKey; icon: LucideIcon; href?: never; action: () => void };

const NAV_ITEMS: NavItem[] = [
  {
    label: "nav.learn",
    icon: Apple,
    items: [
      { label: "nav.learnExplore", href: "/learn/explore", icon: Compass },
      { label: "nav.learnEnrolled", href: "/learn/enrolled", icon: GraduationCap },
    ],
  },
  {
    label: "nav.create",
    icon: CirclePlus,
    items: [
      { label: "nav.courses", href: "/courses", icon: Folder },
      { label: "nav.lessons", href: "/lessons", icon: File },
    ],
  },
  { label: "nav.students", icon: Users, href: "/students" },
  { label: "nav.notifications", icon: Bell, href: "/notifications" },
  { label: "nav.profile", icon: User, href: "/profile" },
];

const FOOTER_ITEMS = (onSignOut: () => void): FooterItem[] => [
  { label: "nav.settings", icon: Settings, href: "/settings" },
  { label: "nav.feedback", icon: MessageCircle, href: "/feedback" },
  { label: "nav.logOut", icon: LogOut, action: onSignOut },
];

export function SideNavMenu() {
  const { t } = useT();
  const pathname = usePathname();
  const router = useRouter();
  const { mutate: signOut } = useAuthSignOut();

  function handleSignOut() {
    signOut(undefined, { onSuccess: () => router.push("/auth/login") });
  }

  return (
    <Sidebar collapsible="none" className="sticky top-0 h-svh border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {NAV_ITEMS.map((item) =>
              item.items ? (
                <Collapsible
                  key={item.label}
                  asChild
                  defaultOpen={
                    item.label === "nav.create" ||
                    item.label === "nav.learn" ||
                    item.items.some((s) => pathname === s.href)
                  }
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton size="lg">
                        <item.icon />
                        <span>{t(item.label)}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((sub) => (
                          <SidebarMenuSubItem key={sub.href}>
                            <SidebarMenuSubButton
                              size="md"
                              asChild
                              isActive={pathname === sub.href}
                            >
                              <Link href={sub.href}>
                                {sub.icon && <sub.icon />}
                                {t(sub.label)}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton size="lg" asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{t(item.label)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup>
          <SidebarMenu>
            {FOOTER_ITEMS(handleSignOut).map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  size="lg"
                  asChild={!!item.href}
                  isActive={!!item.href && pathname === item.href}
                  onClick={item.action}
                >
                  {item.href ? (
                    <Link href={item.href}>
                      <item.icon />
                      <span>{t(item.label)}</span>
                    </Link>
                  ) : (
                    <>
                      <item.icon />
                      <span>{t(item.label)}</span>
                    </>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
