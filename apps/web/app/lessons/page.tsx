"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useGetLessons, useDeleteLesson } from "@repo/api-client";
import { Input } from "@repo/ui-web/components/input";
import { Search, Folder, File } from "lucide-react";
import { LessonCard } from "./components/lesson-card";
import { LessonCardSkeleton } from "./components/lesson-card-skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useT } from "@repo/i18n/client";
import { cn } from "@repo/ui-web/lib/utils";
import { PageHeader } from "@/components/page-header";
import { ChPagination, ChPaginationSkeleton } from "@/components/ch-pagination";

const PAGE_LIMIT = 9;

export default function LessonsPage() {
  const SKELETON_ITEMS = Array.from({ length: 6 });

  const pathname = usePathname();
  const { t } = useT();
  const { query, debouncedQuery, setQuery } = useDebounce("");
  const { page, setPage, trackTotalPages } = usePagination(debouncedQuery);

  const { data: lessons, isPending } = useGetLessons({
    query: debouncedQuery || undefined,
    page,
    limit: PAGE_LIMIT,
  });
  const { mutate: deleteLesson } = useDeleteLesson();

  const { totalPages, knownTotalPages } = trackTotalPages(lessons?.pagination);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleDelete = (id: string) => {
    deleteLesson({ pathParams: { id } });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Mobile/tablet: Courses | Lessons tab strip */}
      <div className="sticky top-14 z-30 flex border-b bg-background md:hidden">
        <Link
          href="/courses"
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 py-3 text-center text-sm font-medium",
            pathname === "/courses"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground"
          )}
        >
          <Folder className="size-4" />
          {t("nav.courses")}
        </Link>
        <Link
          href="/lessons"
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 py-3 text-center text-sm font-medium",
            pathname === "/lessons"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground"
          )}
        >
          <File className="size-4" />
          {t("nav.lessons")}
        </Link>
      </div>

      {/* Desktop: title + search */}
      <PageHeader
        className="mb-6 hidden md:flex"
        title={t("lessons.title")}
        search={{
          placeholder: t("lessons.searchPlaceholder"),
          value: query,
          onChange: handleSearch,
        }}
      />

      {/* Mobile/tablet: search */}
      <div className="p-4 md:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("lessons.searchPlaceholder")}
            className="pl-8"
            value={query}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-1 flex-col p-4 pt-0 md:px-6 md:pb-6">
        {isPending ? (
          <div className="flex flex-1 flex-col justify-between">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {SKELETON_ITEMS.map((_, i) => (
                <LessonCardSkeleton key={i} />
              ))}
            </div>

            <ChPaginationSkeleton className="mt-6" page={page} totalPages={knownTotalPages} />
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-between">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {lessons?.data.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} onDelete={handleDelete} />
              ))}
            </div>

            <ChPagination
              className="mt-6"
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              previousLabel={t("lessons.pagination.previous")}
              nextLabel={t("lessons.pagination.next")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
