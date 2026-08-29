import { NavigationLayoutProvider } from "@/components/navigation-layout-provider";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <NavigationLayoutProvider>{children}</NavigationLayoutProvider>;
}
