import { SidebarProvider } from "@repo/ui-web/components/sidebar";
import { SideNavMenu } from "@/components/side-nav-menu";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <SideNavMenu />
      <main className="flex flex-1 flex-col">{children}</main>
    </SidebarProvider>
  );
}
