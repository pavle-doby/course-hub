import { NavigationLayoutProvider } from "@/components/navigation-layout-provider";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <NavigationLayoutProvider>{children}</NavigationLayoutProvider>;
}
