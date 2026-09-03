import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarProvider,
} from "@repo/ui-web/components/sidebar";
import { Card, CardContent, CardHeader } from "@repo/ui-web/components/card";
import { Skeleton } from "@repo/ui-web/components/skeleton";

const SKELETON_TOPICS = Array.from({ length: 2 }, (_, topicIndex) => ({
  id: `skeleton-topic-${topicIndex}`,
  lessons: Array.from(
    { length: topicIndex === 0 ? 4 : 3 },
    (_, lessonIndex) => `skeleton-lesson-${topicIndex}-${lessonIndex}`
  ),
}));

/** Mirrors the tree nav / header / course card / bottom nav layout so the shell doesn't shift
 * once real data arrives — matches the same md breakpoint each real component switches on. */
export function CourseEditSkeleton() {
  return (
    <SidebarProvider>
      <div className="flex min-h-svh flex-1 flex-row">
        {/* Real tree nav is offcanvas (hidden) on mobile, opened via the bottom nav's contents button */}
        <Sidebar collapsible="none" className="hidden border-r md:flex">
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>

                {SKELETON_TOPICS.map((topic) => (
                  <SidebarMenuItem key={topic.id}>
                    <SidebarMenuSkeleton showIcon className="pl-7" />
                    <SidebarMenuSub>
                      {topic.lessons.map((lessonId) => (
                        <SidebarMenuSubItem key={lessonId}>
                          <SidebarMenuSkeleton showIcon />
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="gap-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b bg-background px-4 py-2 md:grid md:h-14 md:grid-cols-3 md:py-0">
            <div className="flex min-w-0 items-center gap-1 justify-self-start">
              <Skeleton className="size-8 rounded-md" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="hidden h-5 w-28 justify-self-center md:block" />
            <div className="hidden items-center gap-2 justify-self-end md:flex">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </header>

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
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-14" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-14" />
                  <Skeleton className="h-32 w-full" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </CardContent>
            </Card>

            <div className="mx-auto flex w-full max-w-2xl flex-col justify-center gap-2 sm:flex-row">
              <Skeleton className="h-9 w-full sm:w-40" />
              <Skeleton className="h-9 w-full sm:w-40" />
            </div>
          </div>

          {/* Mirrors CourseBottomNav: mobile-only cancel/save/publish row + previous/contents/next */}
          <div className="sticky bottom-0 z-40 flex flex-col border-t bg-background md:hidden">
            <div className="flex items-center gap-2 px-4 py-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
            </div>
            <div className="flex items-center justify-between gap-2 border-t px-4 py-1">
              <Skeleton className="h-8 w-30" />
              <Skeleton className="size-8 rounded-md" />
              <Skeleton className="h-8 w-30" />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
