import { Skeleton } from "@repo/ui-web/components/skeleton";

const TREE_ITEMS = Array.from({ length: 6 }, (_, index) => index);
const DOCUMENTS = Array.from({ length: 3 }, (_, index) => index);

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

        <main className="flex flex-1 flex-col p-4 md:p-6">
          <div className="mx-auto w-full max-w-2xl">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="mt-4 aspect-video w-full rounded-lg" />

            <section className="mt-4">
              <Skeleton className="mb-2 h-5 w-24" />
              <div className="space-y-2">
                {DOCUMENTS.map((document) => (
                  <Skeleton key={document} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            </section>

            <div className="mt-4 space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          </div>
        </main>

        <footer className="sticky bottom-0 z-40 flex items-center justify-between border-t bg-background px-4 pt-1 pb-4 md:hidden">
          <Skeleton className="h-7 w-30" />
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="h-7 w-30" />
        </footer>
      </div>
    </div>
  );
}
