"use client";

import { useGetPublicCourses } from "@repo/api-client";
import { Input } from "@repo/ui-web/components/input";
import { Search } from "lucide-react";
import { useT } from "@repo/i18n/client";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { NavigationLayoutProvider } from "@/components/navigation-layout-provider";
import { ChPagination, ChPaginationSkeleton } from "@/components/ch-pagination";
import { LearnCourseCard } from "./components/learn-course-card";
import { LearnCourseCardSkeleton } from "./components/learn-course-card-skeleton";

const SKELETON_ITEMS = Array.from({ length: 6 });
const PAGE_LIMIT = 6;

export default function LearnPage() {
  const { t } = useT();
  const { query, debouncedQuery, setQuery } = useDebounce("");
  const { page, setPage, trackTotalPages } = usePagination(debouncedQuery);

  const { data: courses, isPending } = useGetPublicCourses({
    query: debouncedQuery || undefined,
    page,
    limit: PAGE_LIMIT,
  });

  const { totalPages, knownTotalPages } = trackTotalPages(courses?.pagination);

  return (
    <NavigationLayoutProvider>
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-4 p-4 lg:p-6">
          <h1 className="hidden text-xl font-semibold lg:block">{t("learn.title")}</h1>
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("learn.searchPlaceholder")}
              className="pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4 pt-0 lg:px-6 lg:pb-6">
          {isPending ? (
            <div className="flex flex-1 flex-col justify-between">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {SKELETON_ITEMS.map((_, i) => (
                  <LearnCourseCardSkeleton key={i} />
                ))}
              </div>

              <ChPaginationSkeleton className="mt-6" page={page} totalPages={knownTotalPages} />
            </div>
          ) : courses?.data.length ? (
            <div className="flex flex-1 flex-col justify-between">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {courses.data.map((course) => (
                  <LearnCourseCard key={course.id} course={course} />
                ))}
              </div>

              <ChPagination
                className="mt-6"
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                previousLabel={t("learn.pagination.previous")}
                nextLabel={t("learn.pagination.next")}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("learn.empty")}</p>
          )}
        </div>
      </div>
    </NavigationLayoutProvider>
  );
}
