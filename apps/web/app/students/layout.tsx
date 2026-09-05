import { NavigationLayoutProvider } from "@/components/navigation-layout-provider";

export default function StudentsLayout({ children }: { children: React.ReactNode }) {
  return <NavigationLayoutProvider>{children}</NavigationLayoutProvider>;
}
