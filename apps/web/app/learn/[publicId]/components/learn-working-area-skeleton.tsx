import { Skeleton } from "@repo/ui-web/components/skeleton";

const DOCUMENTS = Array.from({ length: 3 }, (_, index) => index);

/** Content placeholder while the current lesson (or the page) loads. */
export function LearnWorkingAreaSkeleton() {
  return (
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
  );
}
