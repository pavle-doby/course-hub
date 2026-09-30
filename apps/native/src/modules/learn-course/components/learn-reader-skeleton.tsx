import { View } from "react-native";
import { Skeleton } from "@repo/ui-native/components/skeleton";
import { LearnContentSkeleton } from "./learn-content-skeleton";

export function LearnReaderSkeleton() {
  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center gap-2 border-b border-border p-2">
        <Skeleton className="size-9" />
        <Skeleton className="h-6 flex-1" />
        <Skeleton className="h-9 w-24" />
      </View>
      <LearnContentSkeleton />
    </View>
  );
}
