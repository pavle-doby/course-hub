import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeftIcon, ChevronRightIcon, ListTreeIcon } from "lucide-react-native";
import { useTranslation } from "@repo/i18n/native";
import { Button } from "@repo/ui-native/components/button";
import { Icon } from "@repo/ui-native/components/icon";
import { Text } from "@repo/ui-native/components/text";

type LearnBottomBarProps = {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onOpenContents: () => void;
};

/** Reader footer: previous / contents / next (web: `LearnBottomNav`). */
export function LearnBottomBar({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  onOpenContents,
}: LearnBottomBarProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between border-t border-border bg-background px-2 pt-2"
      style={{ paddingBottom: insets.bottom + 8 }}
    >
      <Button variant="ghost" className="min-w-28" disabled={!hasPrevious} onPress={onPrevious}>
        <Icon as={ChevronLeftIcon} size={16} />
        <Text>{t("learn.detail.previous")}</Text>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onPress={onOpenContents}
        accessibilityLabel={t("learn.detail.contents")}
      >
        <Icon as={ListTreeIcon} size={20} />
      </Button>
      <Button variant="ghost" className="min-w-28" disabled={!hasNext} onPress={onNext}>
        <Text>{t("learn.detail.next")}</Text>
        <Icon as={ChevronRightIcon} size={16} />
      </Button>
    </View>
  );
}
