import { getGetPublicCoursesQueryKey, getPublicCourses } from "@repo/api-client";
import { useTranslation } from "@repo/i18n/native";
import { CourseList } from "@/components/course/course-list";
import { useDebounce } from "@/hooks/use-debounce";
import { useInfiniteList } from "@/hooks/use-infinite-list";
import { COURSE_PAGE_LIMIT } from "@/utils/consts";

/** Public catalog: every published public course. */
export default function HomeScreen() {
  const { t } = useTranslation();
  const { query, debouncedQuery, setQuery } = useDebounce("");
  const params = { query: debouncedQuery || undefined, limit: COURSE_PAGE_LIMIT };

  const list = useInfiniteList({
    queryKey: getGetPublicCoursesQueryKey(params),
    fetchPage: (page, signal) => getPublicCourses({ ...params, page }, undefined, signal),
  });

  return (
    <CourseList
      list={list}
      search={{ value: query, onChangeText: setQuery }}
      emptyText={t("learn.empty")}
    />
  );
}
