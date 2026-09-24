import { NavigationLayoutProvider } from "@/components/navigation-layout-provider";

export default function AiConnectLayout({ children }: { children: React.ReactNode }) {
  return <NavigationLayoutProvider>{children}</NavigationLayoutProvider>;
}
