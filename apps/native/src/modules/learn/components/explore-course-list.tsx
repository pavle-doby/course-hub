import { getCourses, getGetCoursesQueryKey } from "@repo/api-client";
import { useTranslation } from "@repo/i18n/native";
import { CourseList } from "@/components/course/course-list";
import { useDebounce } from "@/hooks/use-debounce";
import { useInfiniteList } from "@/hooks/use-infinite-list";
import { COURSE_PAGE_LIMIT } from "@/utils/consts";

/** Published courses from every creator that the user isn't enrolled in. */
export function ExploreCourseList() {
  const { t } = useTranslation();
  const { query, debouncedQuery, setQuery } = useDebounce("");
  const params = {
    query: debouncedQuery || undefined,
    excludeEnrolled: true,
    showAllCreators: true,
    status: "published" as const,
    limit: COURSE_PAGE_LIMIT,
  };

  const list = useInfiniteList({
    queryKey: getGetCoursesQueryKey(params),
    fetchPage: (page, signal) => getCourses({ ...params, page }, undefined, signal),
  });

  return (
    <CourseList
      list={list}
      search={{ value: query, onChangeText: setQuery }}
      emptyText={t("learn.explore.empty")}
    />
  );
}
