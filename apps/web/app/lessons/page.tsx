"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useGetLessons, useDeleteLesson } from "@repo/api-client";
import { Input } from "@repo/ui-web/components/input";
import { Search, Folder, File } from "lucide-react";
import { LessonCard } from "./components/lesson-card";
import { LessonCardSkeleton } from "./components/lesson-card-skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { useT } from "@repo/i18n/client";
import { cn } from "@repo/ui-web/lib/utils";

export default function LessonsPage() {
  const SKELETON_ITEMS = Array.from({ length: 6 });

  const pathname = usePathname();
  const { t } = useT();
  const { query, debouncedQuery, setQuery } = useDebounce("");

  const { data: lessons, isPending } = useGetLessons({ query: debouncedQuery || undefined });
  const { mutate: deleteLesson } = useDeleteLesson();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleDelete = (id: string) => {
    deleteLesson({ pathParams: { id } });
  };

  return (
    <div className="flex flex-col">
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

      {/* Desktop: title + search */}
      <div className="hidden items-center gap-4 p-6 lg:flex">
        <h1 className="text-xl font-semibold">{t("lessons.title")}</h1>
        <div className="relative flex flex-1 justify-center">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("lessons.searchPlaceholder")}
              className="pl-8"
              value={query}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>

      {/* Mobile/tablet: search */}
      <div className="p-4 lg:hidden">
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
      <div className="p-4 pt-0 lg:px-6 lg:pb-6">
        {isPending ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SKELETON_ITEMS.map((_, i) => (
              <LessonCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lessons?.data.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
