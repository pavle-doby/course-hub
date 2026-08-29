import { NavigationLayoutProvider } from "@/components/navigation-layout-provider";

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return <NavigationLayoutProvider>{children}</NavigationLayoutProvider>;
}
