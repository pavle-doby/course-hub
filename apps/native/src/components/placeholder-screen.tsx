import { View } from "react-native";
import { Text } from "@repo/ui-native/components/text";

// ponytail: tab placeholder until the tab's own task (n-task-3+) replaces it
export function PlaceholderScreen({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <View className="flex-1 items-center justify-center gap-6 bg-background p-6">
      <Text variant="h3">{title}</Text>
      {children}
    </View>
  );
}
