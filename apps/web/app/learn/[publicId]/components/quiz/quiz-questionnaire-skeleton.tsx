import { Skeleton } from "@repo/ui-web/components/skeleton";

const CHOICES = Array.from({ length: 3 }, (_, index) => index);

/** Placeholder matching `QuizQuestionnaire`: progress, prompt, choices and the actions row. */
export function QuizQuestionnaireSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-5 w-3/4" />
      <div className="grid gap-2">
        {CHOICES.map((choice) => (
          <div key={choice} className="flex min-h-11 items-center gap-2.5 rounded-lg border px-3">
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
      <Skeleton className="ms-auto h-8 w-16" />
    </div>
  );
}
