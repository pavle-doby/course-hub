import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
  type UseInfiniteQueryResult,
} from "@repo/api-client";

type Page<T> = {
  data: T[];
  pagination: { page: number; limit: number; total: number };
};

export type InfiniteList<T> = UseInfiniteQueryResult<InfiniteData<Page<T>>> & { items: T[] };

/**
 * Infinite scroll over a 0-based paginated endpoint, using the Orval fetcher and query key
 * (Orval generates only plain `useQuery` hooks). The key gets an `"infinite"` suffix so it never
 * shares a cache entry with a `useQuery` of the same endpoint; invalidating the generated key
 * still refetches it.
 */
type UseInfiniteListArgs<T> = {
  queryKey: QueryKey;
  fetchPage: (page: number, signal: AbortSignal) => Promise<Page<T>>;
};

export function useInfiniteList<T>({
  queryKey,
  fetchPage,
}: UseInfiniteListArgs<T>): InfiniteList<T> {
  const query = useInfiniteQuery({
    queryKey: [...queryKey, "infinite"],
    queryFn: ({ pageParam, signal }) => fetchPage(pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: ({ pagination }) =>
      (pagination.page + 1) * pagination.limit < pagination.total ? pagination.page + 1 : undefined,
  });

  return { ...query, items: query.data?.pages.flatMap((page) => page.data) ?? [] };
}
