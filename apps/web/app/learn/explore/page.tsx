"use client";

import { useGetCourses } from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingQuery } from "@repo/shared";
import { toast } from "@repo/ui-web/components/sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { NavigationLayoutProvider } from "@/components/navigation-layout-provider";
import { PageHeader } from "@/components/page-header";
import { ChPagination, ChPaginationSkeleton } from "@/components/ch-pagination";
import { CourseCard } from "@/components/course-card";
import { CourseCardSkeleton } from "@/components/course-card-skeleton";

const SKELETON_ITEMS = Array.from({ length: 6 });
const PAGE_LIMIT = 6;

export default function LearnExplorePage() {
  const { t } = useT();
  const { query, debouncedQuery, setQuery } = useDebounce("");
  const { page, setPage, trackTotalPages } = usePagination(debouncedQuery);

  const {
    data: courses,
    isPending,
    error,
  } = useGetCourses({
    query: debouncedQuery || undefined,
    excludeEnrolled: true,
    showAllCreators: true,
    status: "published",
    page,
    limit: PAGE_LIMIT,
  });
  useErrorHandlingQuery({
    t: t as (key: string) => string,
    error,
    showToastError: ({ title, description }) => toast.error(title, { description }),
  });

  const { totalPages, knownTotalPages } = trackTotalPages(courses?.pagination);

  return (
    <NavigationLayoutProvider>
      <div className="flex h-full flex-col">
        <PageHeader
          className="mb-6"
          titleClassName="hidden md:block"
          title={t("learn.explore.title")}
          search={{
            placeholder: t("learn.searchPlaceholder"),
            value: query,
            onChange: (e) => setQuery(e.target.value),
          }}
        />

        <div className="flex flex-1 flex-col p-4 pt-0 md:px-6 md:pb-6">
          {isPending ? (
            <div className="flex flex-1 flex-col justify-between">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {SKELETON_ITEMS.map((_, i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>

              <ChPaginationSkeleton className="mt-6" page={page} totalPages={knownTotalPages} />
            </div>
          ) : courses?.data.length ? (
            <div className="flex flex-1 flex-col justify-between">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {courses.data.map((course) => (
                  <CourseCard key={course.id} href={`/learn/${course.publicId}`} course={course} />
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
            <p className="text-sm text-muted-foreground">{t("learn.explore.empty")}</p>
          )}
        </div>
      </div>
    </NavigationLayoutProvider>
  );
}
