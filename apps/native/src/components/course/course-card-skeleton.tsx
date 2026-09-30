import { View } from "react-native";
import { Card } from "@repo/ui-native/components/card";
import { Skeleton } from "@repo/ui-native/components/skeleton";

export function CourseCardSkeleton() {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <Skeleton className="aspect-video w-full rounded-none" />
      <View className="gap-2 p-4">
        <View className="flex-row items-center gap-2">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </View>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <View className="flex-row gap-4 pt-2">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-16" />
        </View>
      </View>
    </Card>
  );
}
