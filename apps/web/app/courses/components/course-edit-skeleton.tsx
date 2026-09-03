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

/** Mirrors the tree nav / header / course card layout so the shell doesn't shift once real data arrives. */
export function CourseEditSkeleton() {
  return (
    <SidebarProvider>
      <div className="flex min-h-svh flex-1 flex-row">
        <Sidebar collapsible="none" className="border-r">
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
          <header className="sticky top-0 z-40 grid h-14 grid-cols-3 items-center gap-4 border-b bg-background px-4">
            <div className="flex items-center gap-2 justify-self-start">
              <Skeleton className="size-5" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-5 w-28 justify-self-center" />
            <div className="flex items-center gap-2 justify-self-end">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6 p-6">
            <Card className="mx-auto w-full max-w-2xl">
              <CardHeader className="flex flex-row items-center justify-between border-b">
                <Skeleton className="h-5 w-16" />
                <div className="flex items-center gap-2">
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

            <Skeleton className="mx-auto h-9 w-32" />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
