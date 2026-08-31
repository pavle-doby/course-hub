import { Card, CardHeader, CardContent, CardFooter } from "@repo/ui-web/components/card";
import { Skeleton } from "@repo/ui-web/components/skeleton";

export function LessonCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="size-4 shrink-0" />
          <Skeleton className="h-4 w-40" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </CardContent>

      <CardFooter>
        <Skeleton className="h-5 w-10" />
      </CardFooter>
    </Card>
  );
}
