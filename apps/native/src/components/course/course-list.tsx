import { ActivityIndicator, FlatList, View } from "react-native";
import type { CourseWithStats } from "@repo/api-client";
import { useTranslation } from "@repo/i18n/native";
import { useErrorHandlingQuery } from "@repo/shared";
import { Text } from "@repo/ui-native/components/text";
import type { InfiniteList } from "@/hooks/use-infinite-list";
import { showToastError } from "@/utils/toast-error";
import { SearchInput } from "../search-input";
import { CourseCard } from "./course-card";
import { CourseCardSkeleton } from "./course-card-skeleton";

const SKELETON_ITEMS = Array.from({ length: 3 }, (_, i) => i);

type CourseListProps<T extends CourseWithStats> = {
  list: InfiniteList<T>;
  search: { value: string; onChangeText: (value: string) => void };
  emptyText: string;
  /** Percent of lessons done, for enrolled courses. */
  getProgressPercent?: (course: T) => number;
};

/** Searchable course cards with infinite scroll and pull-to-refresh (native take on web's paged grid). */
export function CourseList<T extends CourseWithStats>({
  list,
  search,
  emptyText,
  getProgressPercent,
}: CourseListProps<T>) {
  const { t } = useTranslation();
  const { items, isPending, isRefetching, isFetchingNextPage, hasNextPage, error } = list;
  useErrorHandlingQuery({ t: t as (key: string) => string, error, showToastError });

  function handleEndReached() {
    if (hasNextPage && !isFetchingNextPage) {
      void list.fetchNextPage();
    }
  }

  return (
    <View className="flex-1 bg-background">
      {/* Outside the FlatList so it stays visible while the cards scroll */}
      <View className="border-b border-border px-4 py-3">
        <SearchInput
          value={search.value}
          onChangeText={search.onChangeText}
          placeholder={t("learn.searchPlaceholder")}
        />
      </View>
      <FlatList
        className="flex-1"
        contentContainerClassName="gap-4 p-4"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        data={isPending ? [] : items}
        keyExtractor={(course) => course.id}
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            href={`/learn/${item.publicId}`}
            progressPercent={getProgressPercent?.(item)}
          />
        )}
        ListEmptyComponent={
          isPending ? (
            <View className="gap-4">
              {SKELETON_ITEMS.map((i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </View>
          ) : (
            <Text variant="muted">{emptyText}</Text>
          )
        }
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator className="py-4" /> : null}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={() => void list.refetch()}
      />
    </View>
  );
}
