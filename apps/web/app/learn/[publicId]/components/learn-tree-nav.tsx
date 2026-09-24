"use client";

import Link from "next/link";
import { ChevronRight, File, Files, Folder, MessageSquareText } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui-web/components/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@repo/ui-web/components/sidebar";
import type { LessonProgressStatus } from "@repo/api-client";
import { useT } from "@repo/i18n/client";
import type { Selection, TopicWithLessons } from "@/hooks/use-course-tree";
import { LearnTreeResizeHandle } from "./learn-tree-resize-handle";
import { ProgressStatusIcon } from "./progress-status-icon";

type LearnTreeNavProps = {
  courseName: string;
  reviewsHref: string;
  tree: TopicWithLessons[];
  selection: Selection;
  contentLocked: boolean;
  isLoadingTree?: boolean;
  courseStatus?: LessonProgressStatus;
  /** Topic and lesson status by id; empty when not enrolled. */
  statusById: Map<string, LessonProgressStatus>;
  onSelectCourse: () => void;
  onSelectTopic: (id: string) => void;
  onSelectLesson: (id: string) => void;
};

type SkeletonTopic = { id: string; lessons: { id: string }[] };

// shown while topics/lessons load after enrolling
const PLACEHOLDER_TOPICS: SkeletonTopic[] = Array.from({ length: 3 }, (_, topicIndex) => ({
  id: `placeholder-topic-${topicIndex}`,
  lessons: Array.from({ length: 2 }, (_, lessonIndex) => ({
    id: `placeholder-lesson-${topicIndex}-${lessonIndex}`,
  })),
}));

export function LearnTreeNav({
  courseName,
  reviewsHref,
  tree,
  selection,
  contentLocked,
  isLoadingTree = false,
  courseStatus,
  statusById,
  onSelectCourse,
  onSelectTopic,
  onSelectLesson,
}: LearnTreeNavProps) {
  const { t } = useT();
  const { isMobile, setOpenMobile } = useSidebar();

  function selectAndClose(select: () => void) {
    select();

    if (isMobile) {
      setOpenMobile(false);
    }
  }

  return (
    <Sidebar collapsible="offcanvas" className="border-r">
      <SidebarHeader className="h-14 justify-center border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href={reviewsHref}>
                <MessageSquareText />
                <span>{t("learn.reviews.title")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                textWrap="default"
                isActive={selection.type === "course"}
                onClick={() => selectAndClose(onSelectCourse)}
              >
                <Folder />
                <span>{courseName}</span>
                {courseStatus && <ProgressStatusIcon status={courseStatus} className="ml-auto" />}
              </SidebarMenuButton>
            </SidebarMenuItem>

            {isLoadingTree
              ? PLACEHOLDER_TOPICS.map((topic) => (
                  <SidebarMenuItem key={topic.id}>
                    <SidebarMenuSkeleton showIcon className="pl-7" />
                    <SidebarMenuSub>
                      {topic.lessons.map((lesson) => (
                        <SidebarMenuSubItem key={lesson.id}>
                          <SidebarMenuSkeleton showIcon />
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                ))
              : tree.map((topic) => (
                  <Collapsible key={topic.id} defaultOpen className="group/collapsible">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        textWrap="default"
                        className="pl-7"
                        isActive={selection.type === "topic" && selection.id === topic.id}
                        disabled={contentLocked}
                        onClick={() => selectAndClose(() => onSelectTopic(topic.id))}
                      >
                        <Files />
                        <span>{topic.name}</span>
                        {statusById.has(topic.id) && (
                          <ProgressStatusIcon
                            status={statusById.get(topic.id)!}
                            className="ml-auto"
                          />
                        )}
                      </SidebarMenuButton>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuAction
                          className="right-auto left-1"
                          aria-label={t("courses.editor.toggleTopic")}
                        >
                          <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuAction>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {topic.lessons.map((lesson) => (
                            <SidebarMenuSubItem key={lesson.id}>
                              <SidebarMenuSubButton
                                textWrap="default"
                                isActive={selection.type === "lesson" && selection.id === lesson.id}
                                aria-disabled={contentLocked}
                                onClick={() => selectAndClose(() => onSelectLesson(lesson.id))}
                              >
                                <File />
                                <span>{lesson.name}</span>
                                {statusById.has(lesson.id) && (
                                  <ProgressStatusIcon
                                    status={statusById.get(lesson.id)!}
                                    className="ml-auto"
                                  />
                                )}
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <LearnTreeResizeHandle />
    </Sidebar>
  );
}
