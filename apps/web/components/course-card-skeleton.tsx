import { Card, CardContent } from "@repo/ui-web/components/card";
import { Skeleton } from "@repo/ui-web/components/skeleton";

export function CourseCardSkeleton() {
  return (
    <Card className="gap-0 py-0">
      <Skeleton className="aspect-video w-full rounded-none" />
      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="mt-auto flex gap-4 pt-2">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}
