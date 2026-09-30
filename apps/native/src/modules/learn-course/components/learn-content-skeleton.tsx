import { View } from "react-native";
import { Skeleton } from "@repo/ui-native/components/skeleton";

/** Content placeholder while the current lesson (or the reader) loads. */
export function LearnContentSkeleton() {
  return (
    <View className="gap-4 p-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="aspect-video w-full rounded-lg" />
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </View>
  );
}
