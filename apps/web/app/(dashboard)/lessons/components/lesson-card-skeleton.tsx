import { Card, CardHeader } from "@repo/ui-web/components/card";
import { Skeleton } from "@repo/ui-web/components/skeleton";

export function LessonCardSkeleton() {
  return (
    <Card className="min-h-25">
      <CardHeader>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 shrink-0" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <Skeleton className="h-5 w-10" />
        </div>
      </CardHeader>
    </Card>
  );
}
