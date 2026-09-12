import { Separator } from "@repo/ui-web/components/separator";
import { Skeleton } from "@repo/ui-web/components/skeleton";

function SkeletonHeader() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="size-3.5 rounded-sm" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  );
}

function SkeletonActions() {
  return (
    <div className="ml-auto flex shrink-0 items-center gap-1">
      <Skeleton className="size-8 rounded-md" />
      <Skeleton className="size-8 rounded-md" />
    </div>
  );
}

export function InviteEmailSkeleton() {
  return (
    <div className="flex items-start gap-2 rounded-md border p-2">
      <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-col gap-1.5">
          <SkeletonHeader />
          <Skeleton className="h-3 w-32" />
        </div>
        <Separator orientation="vertical" className="hidden self-stretch md:block" />
        <div className="flex shrink-0 items-center gap-2 md:self-center">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      </div>
      <SkeletonActions />
    </div>
  );
}

export function InviteLinkSkeleton() {
  return (
    <div className="flex items-start gap-2 rounded-md border p-2">
      <div className="flex min-w-0 flex-col gap-1.5">
        <SkeletonHeader />
        <Skeleton className="h-3 w-32" />
      </div>
      <SkeletonActions />
    </div>
  );
}
