"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface PaginationInfo {
  total: number;
  limit: number;
}

interface TotalPagesResult {
  totalPages: number;
  /** Last known page count, kept stable during refetches so loading skeletons don't shift. */
  knownTotalPages: number;
}

interface UsePaginationResult {
  /** 0-indexed current page, synced with the 1-indexed `page` URL search param. */
  page: number;
  setPage: (page: number) => void;
  /** Call with a query's pagination info once it resolves to derive totalPages/knownTotalPages. */
  trackTotalPages: (pagination: PaginationInfo | undefined) => TotalPagesResult;
}

/**
 * URL-synced page state that resets to page 0 whenever `resetKey` changes (e.g. a search
 * term). `page`/`setPage` are needed to build the query that produces pagination info, so
 * totalPages/knownTotalPages are exposed via `trackTotalPages`, called once that query resolves.
 */
export function usePagination(resetKey?: unknown): UsePaginationResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(0, (Number(searchParams.get("page")) || 1) - 1);

  const setPage = useCallback(
    (next: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next > 0) params.set("page", String(next + 1));
      else params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setPage(0);
  }

  const [knownTotalPages, setKnownTotalPages] = useState(0);

  const trackTotalPages = (pagination: PaginationInfo | undefined): TotalPagesResult => {
    const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 0;
    if (totalPages > 0 && totalPages !== knownTotalPages) setKnownTotalPages(totalPages);
    return { totalPages, knownTotalPages: totalPages > 0 ? totalPages : knownTotalPages };
  };

  return { page, setPage, trackTotalPages };
}
