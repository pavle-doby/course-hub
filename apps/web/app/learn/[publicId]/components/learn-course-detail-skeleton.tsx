import { Skeleton } from "@repo/ui-web/components/skeleton";
import { LearnWorkingAreaSkeleton } from "./learn-working-area-skeleton";

const TREE_ITEMS = Array.from({ length: 6 }, (_, index) => index);

export function LearnCourseDetailSkeleton() {
  return (
    <div className="flex min-h-svh flex-1">
      <aside className="hidden w-64 shrink-0 border-r p-4 md:block">
        <div className="space-y-3">
          {TREE_ITEMS.map((item) => (
            <Skeleton key={item} className="h-8 w-full" />
          ))}
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-2 border-b bg-background px-4">
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-9 w-24" />
        </header>

        <LearnWorkingAreaSkeleton />

        <footer className="sticky bottom-0 z-40 flex items-center justify-between border-t bg-background px-4 pt-1 pb-4 md:hidden">
          <Skeleton className="h-7 w-30" />
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="h-7 w-30" />
        </footer>
      </div>
    </div>
  );
}
