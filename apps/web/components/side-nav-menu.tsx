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
  AppleIcon,
  ChevronRightIcon,
  CirclePlusIcon,
  CompassIcon,
  FileIcon,
  FolderIcon,
  GraduationCapIcon,
  LogOutIcon,
  SettingsIcon,
  SparklesIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";

import { useAuthSignOut } from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { clearAuthTokens } from "@/utils/token-storage";

type NavKey =
  | "nav.create"
  | "nav.courses"
  | "nav.lessons"
  | "nav.learn"
  | "nav.learnExplore"
  | "nav.learnEnrolled"
  | "nav.students"
  | "nav.profile"
  | "nav.aiConnect"
  | "nav.settings"
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
    icon: AppleIcon,
    items: [
      { label: "nav.learnExplore", href: "/learn/explore", icon: CompassIcon },
      { label: "nav.learnEnrolled", href: "/learn/enrolled", icon: GraduationCapIcon },
    ],
  },
  {
    label: "nav.create",
    icon: CirclePlusIcon,
    items: [
      { label: "nav.courses", href: "/courses", icon: FolderIcon },
      { label: "nav.lessons", href: "/lessons", icon: FileIcon },
    ],
  },
  { label: "nav.students", icon: UsersIcon, href: "/students" },
  { label: "nav.profile", icon: UserIcon, href: "/profile" },
];

const FOOTER_ITEMS = (onSignOut: () => void): FooterItem[] => [
  { label: "nav.aiConnect", icon: SparklesIcon, href: "/ai-connect" },
  { label: "nav.settings", icon: SettingsIcon, href: "/settings" },
  { label: "nav.logOut", icon: LogOutIcon, action: onSignOut },
];

export function SideNavMenu() {
  const { t } = useT();
  const pathname = usePathname();
  const router = useRouter();
  const { mutate: signOut } = useAuthSignOut();

  function handleSignOut() {
    signOut(undefined, {
      onSuccess: () => {
        clearAuthTokens();
        router.push("/auth/login");
      },
    });
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
                        <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
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
