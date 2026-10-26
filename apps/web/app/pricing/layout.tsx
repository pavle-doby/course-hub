import { NavigationLayoutProvider } from "@/components/navigation-layout-provider";

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <NavigationLayoutProvider>{children}</NavigationLayoutProvider>;
}
