import { NavigationLayoutProvider } from "@/components/navigation-layout-provider";

export default function ClientsLayout({ children }: { children: React.ReactNode }) {
  return <NavigationLayoutProvider>{children}</NavigationLayoutProvider>;
}
