import { Card, CardContent, CardHeader } from "@repo/ui-web/components/card";
import { Skeleton } from "@repo/ui-web/components/skeleton";
import type { Selection } from "@/hooks/use-course-tree";

/** Mirrors CourseWorkingArea: prev/next row, entity card (course: thumbnail + name/description;
 * topic/lesson: name/media/documents/description), then the add-topic/lesson buttons. */
export function CourseWorkingAreaSkeleton({ type }: { type: Selection["type"] }) {
  const isCourse = type === "course";

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="hidden items-center justify-center gap-2 md:flex">
        <Skeleton className="h-8 w-30" />
        <Skeleton className="h-8 w-30" />
      </div>

      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b">
          <Skeleton className="h-5 w-16" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          {isCourse && <Skeleton className="h-32 w-full" />}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-9 w-full" />
          </div>
          {!isCourse && (
            <>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-16 w-full" />
              </div>
            </>
          )}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>

      <div className="mx-auto flex w-full max-w-2xl flex-col justify-center gap-2 sm:flex-row">
        {!isCourse && <Skeleton className="h-9 w-full sm:w-40" />}
        <Skeleton className="h-9 w-full sm:w-40" />
      </div>
    </div>
  );
}
