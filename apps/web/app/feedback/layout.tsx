import { NavigationLayoutProvider } from "@/components/navigation-layout-provider";

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return <NavigationLayoutProvider>{children}</NavigationLayoutProvider>;
}
