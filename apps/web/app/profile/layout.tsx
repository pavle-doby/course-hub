import { NavigationLayoutProvider } from "@/components/navigation-layout-provider";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <NavigationLayoutProvider>{children}</NavigationLayoutProvider>;
}
