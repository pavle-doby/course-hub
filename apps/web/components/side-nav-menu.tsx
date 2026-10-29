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
  SidebarRail,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useSidebar,
} from "@repo/ui-web";
import { Button } from "@repo/ui-web/components/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  AppleIcon,
  BellIcon,
  ChevronRightIcon,
  CirclePlusIcon,
  CompassIcon,
  FileIcon,
  FolderIcon,
  GraduationCapIcon,
  LogOutIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SettingsIcon,
  SparklesIcon,
  TagIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";

import { useAuthSignOut } from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { clearAuthTokens } from "@/utils/token-storage";
import { useUnreadNotificationsCount } from "@/hooks/use-unread-notifications";

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
  | "nav.aiConnect"
  | "nav.pricing"
  | "nav.settings"
  | "nav.logOut"
  | "nav.collapseSidebar"
  | "nav.expandSidebar";

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
  { label: "nav.notifications", icon: BellIcon, href: "/notifications" },
  { label: "nav.profile", icon: UserIcon, href: "/profile" },
];

const FOOTER_ITEMS = (onSignOut: () => void): FooterItem[] => [
  { label: "nav.aiConnect", icon: SparklesIcon, href: "/ai-connect" },
  { label: "nav.pricing", icon: TagIcon, href: "/pricing" },
  { label: "nav.settings", icon: SettingsIcon, href: "/settings" },
  { label: "nav.logOut", icon: LogOutIcon, action: onSignOut },
];

export function SideNavMenu() {
  const { t } = useT();
  const pathname = usePathname();
  const router = useRouter();
  const { mutate: signOut } = useAuthSignOut();
  const unreadCount = useUnreadNotificationsCount();
  const { isMobile, state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  function handleSignOut() {
    signOut(undefined, {
      onSuccess: () => {
        clearAuthTokens();
        router.push("/auth/login");
      },
    });
  }

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-end border-b bg-sidebar p-2 group-data-[collapsible=icon]:justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label={t(isCollapsed ? "nav.expandSidebar" : "nav.collapseSidebar")}
          >
            {isCollapsed ? (
              <PanelLeftOpenIcon className="size-4" />
            ) : (
              <PanelLeftCloseIcon className="size-4" />
            )}
          </Button>
        </div>

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
                      <SidebarMenuButton
                        size="lg"
                        className="group-data-[collapsible=icon]:justify-center"
                        tooltip={t(item.label)}
                      >
                        <item.icon />
                        <span className="group-data-[collapsible=icon]:hidden">
                          {t(item.label)}
                        </span>
                        <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="group-data-[collapsible=icon]:mx-0! group-data-[collapsible=icon]:flex! group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:px-0">
                        {item.items.map((sub) => (
                          <SidebarMenuSubItem key={sub.href}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <SidebarMenuSubButton
                                  size="md"
                                  asChild
                                  className="group-data-[collapsible=icon]:flex! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                                  isActive={pathname === sub.href}
                                >
                                  <Link href={sub.href}>
                                    {sub.icon && <sub.icon />}
                                    <span className="group-data-[collapsible=icon]:hidden">
                                      {t(sub.label)}
                                    </span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </TooltipTrigger>
                              <TooltipContent
                                side="right"
                                align="center"
                                hidden={!isCollapsed || isMobile}
                              >
                                {t(sub.label)}
                              </TooltipContent>
                            </Tooltip>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    size="lg"
                    asChild
                    className="group-data-[collapsible=icon]:justify-center"
                    isActive={pathname === item.href}
                    tooltip={t(item.label)}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span className="group-data-[collapsible=icon]:hidden">{t(item.label)}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.href === "/notifications" && unreadCount > 0 && (
                    <span className="pointer-events-none absolute top-3 left-5 size-2 rounded-full bg-destructive ring-2 ring-sidebar" />
                  )}
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
                  className="group-data-[collapsible=icon]:justify-center"
                  tooltip={t(item.label)}
                  asChild={!!item.href}
                  isActive={!!item.href && pathname === item.href}
                  onClick={item.action}
                >
                  {item.href ? (
                    <Link href={item.href}>
                      <item.icon />
                      <span className="group-data-[collapsible=icon]:hidden">{t(item.label)}</span>
                    </Link>
                  ) : (
                    <>
                      <item.icon />
                      <span className="group-data-[collapsible=icon]:hidden">{t(item.label)}</span>
                    </>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
