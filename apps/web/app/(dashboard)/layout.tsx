import { SidebarProvider } from "@repo/ui-web/components/sidebar";
import { SideNavMenu } from "@/components/side-nav-menu";
import { MobileHeader } from "@/components/mobile-header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {/* Desktop sidebar — hidden on mobile/tablet */}
      <div className="hidden lg:contents">
        <SideNavMenu />
      </div>
      <div className="flex flex-1 flex-col">
        <MobileHeader />
        <main className="flex flex-1 flex-col pb-32 lg:pb-0">{children}</main>
      </div>
      <MobileBottomNav />
    </SidebarProvider>
  );
}
