import { View } from "react-native";
import { Skeleton } from "@repo/ui-native/components/skeleton";

const CHOICES = Array.from({ length: 3 }, (_, index) => index);

/** Placeholder matching `QuizQuestionnaire`: progress, prompt, choices and the actions row. */
export function QuizQuestionnaireSkeleton() {
  return (
    <View className="gap-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-5 w-3/4" />
      <View className="gap-2">
        {CHOICES.map((choice) => (
          <View
            key={choice}
            className="min-h-11 flex-row items-center gap-2.5 rounded-lg border border-border px-3"
          >
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-4 w-1/2" />
          </View>
        ))}
      </View>
      <Skeleton className="ml-auto h-9 w-16" />
    </View>
  );
}
