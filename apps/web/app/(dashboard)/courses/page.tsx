"use client";

import { useRouter } from "next/navigation";
import { useGetCourses, useDeleteCourse } from "@repo/api-client";
import { Button } from "@repo/ui-web/components/button";
import { Input } from "@repo/ui-web/components/input";
import { Search } from "lucide-react";
import { CourseCard } from "./components/course-card";
import { CourseCardSkeleton } from "./components/course-card-skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { useT } from "@repo/i18n/client";

export default function CoursesPage() {
  const SKELETON_ITEMS = Array.from({ length: 6 });

  const router = useRouter();
  const { t } = useT();
  const { query, debouncedQuery, setQuery } = useDebounce("");

  const { data: courses, isPending } = useGetCourses({ query: debouncedQuery || undefined });
  const { mutate: deleteCourse } = useDeleteCourse();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleDelete = async (id: string) => {
    deleteCourse({ pathParams: { id } });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center">
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

      {isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SKELETON_ITEMS.map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses?.data.map((course) => (
            <CourseCard key={course.id} course={course} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
