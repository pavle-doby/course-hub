"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  useGetCourses,
  useDeleteCourse,
  getGetCoursesQueryKey,
  useQueryClient,
} from "@repo/api-client";
import { Button } from "@repo/ui-web/components/button";
import { Input } from "@repo/ui-web/components/input";
import { Search, Folder, File } from "lucide-react";
import { CourseCard } from "./components/course-card";
import { CourseCardSkeleton } from "./components/course-card-skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import { useT } from "@repo/i18n/client";
import { cn } from "@repo/ui-web/lib/utils";
import { NavigationLayoutProvider } from "@/components/navigation-layout-provider";
import { ChPagination, ChPaginationSkeleton } from "@/components/ch-pagination";

const PAGE_LIMIT = 9;

export default function CoursesPage() {
  const SKELETON_ITEMS = Array.from({ length: 6 });

  const router = useRouter();
  const pathname = usePathname();
  const { t } = useT();
  const { query, debouncedQuery, setQuery } = useDebounce("");
  const { page, setPage, trackTotalPages } = usePagination(debouncedQuery);

  const { data: courses, isPending } = useGetCourses({
    query: debouncedQuery || undefined,
    page,
    limit: PAGE_LIMIT,
  });
  const { mutate: deleteCourse } = useDeleteCourse();
  const queryClient = useQueryClient();

  const { totalPages, knownTotalPages } = trackTotalPages(courses?.pagination);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleDelete = async (id: string) => {
    deleteCourse(
      { pathParams: { id } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCoursesQueryKey() }) }
    );
  };

  return (
    <NavigationLayoutProvider>
      <div className="flex h-full flex-col">
        {/* Mobile/tablet: Courses | Lessons tab strip */}
        <div className="sticky top-14 z-30 flex border-b bg-background lg:hidden">
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

        {/* Desktop: title + search + add button */}
        <div className="hidden items-center gap-4 p-6 lg:flex">
          <h1 className="text-xl font-semibold">{t("courses.title")}</h1>
          <div className="relative flex flex-1 justify-center">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("courses.searchPlaceholder")}
                className="pl-8"
                value={query}
                onChange={handleSearch}
              />
            </div>
          </div>
          <Button onClick={() => router.push("/courses/add")}>{t("courses.addCourse")}</Button>
        </div>

        {/* Mobile/tablet: search */}
        <div className="p-4 lg:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("courses.searchPlaceholder")}
              className="pl-8"
              value={query}
              onChange={handleSearch}
            />
          </div>
        </div>

        {/* Cards */}
        <div className="flex flex-1 flex-col p-4 pt-0 lg:px-6 lg:pb-6">
          {isPending ? (
            <div className="flex flex-1 flex-col justify-between">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {SKELETON_ITEMS.map((_, i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>

              <ChPaginationSkeleton className="mt-6" page={page} totalPages={knownTotalPages} />
            </div>
          ) : (
            <div className="flex flex-1 flex-col justify-between">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses?.data.map((course) => (
                  <CourseCard key={course.id} course={course} onDelete={handleDelete} />
                ))}
              </div>

              <ChPagination
                className="mt-6"
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                previousLabel={t("courses.pagination.previous")}
                nextLabel={t("courses.pagination.next")}
              />
            </div>
          )}
        </div>

        {/* Mobile/tablet: fixed primary button above the bottom nav */}
        <div className="fixed inset-x-0 bottom-16 px-4 pb-2 lg:hidden">
          <Button className="w-full" onClick={() => router.push("/courses/add")}>
            {t("courses.addCourse")}
          </Button>
        </div>
      </div>
    </NavigationLayoutProvider>
  );
}
