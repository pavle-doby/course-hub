import { Tabs } from "expo-router";
import {
  BellIcon,
  FolderIcon,
  GraduationCapIcon,
  HouseIcon,
  UserIcon,
  type LucideIcon,
} from "lucide-react-native";
import { useTranslation } from "@repo/i18n/native";

const TABS = [
  { name: "index", icon: HouseIcon, labelKey: "nav.home" },
  { name: "learn", icon: GraduationCapIcon, labelKey: "nav.learn" },
  { name: "courses", icon: FolderIcon, labelKey: "nav.courses" },
  { name: "notifications", icon: BellIcon, labelKey: "nav.notifications" },
  { name: "profile", icon: UserIcon, labelKey: "nav.profile" },
] as const satisfies { name: string; icon: LucideIcon; labelKey: string }[];

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs>
      {TABS.map(({ name, icon: Icon, labelKey }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: t(labelKey),
            tabBarIcon: ({ color, size }) => <Icon color={color} size={size} />,
          }}
        />
      ))}
    </Tabs>
  );
}
