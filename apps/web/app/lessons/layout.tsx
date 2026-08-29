import { NavigationLayoutProvider } from "@/components/navigation-layout-provider";

export default function LessonsLayout({ children }: { children: React.ReactNode }) {
  return <NavigationLayoutProvider>{children}</NavigationLayoutProvider>;
}
