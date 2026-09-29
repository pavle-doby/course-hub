import { useTranslation } from "@repo/i18n/native";
import { PlaceholderScreen } from "@/components/placeholder-screen";

export default function HomeScreen() {
  const { t } = useTranslation();
  return <PlaceholderScreen title={t("nav.home")} />;
}
