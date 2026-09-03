"use client";

import { ChevronRight, File, Files, Folder } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui-web/components/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@repo/ui-web/components/sidebar";
import { useT } from "@repo/i18n/client";
import type { TopicWithLessons } from "@/app/courses/hooks/use-course-tree";
import type { Selection } from "@/app/courses/types";

type LearnTreeNavProps = {
  courseName: string;
  tree: TopicWithLessons[];
  selection: Selection;
  onSelectCourse: () => void;
  onSelectTopic: (id: string) => void;
  onSelectLesson: (id: string) => void;
};

export function LearnTreeNav({
  courseName,
  tree,
  selection,
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
              </SidebarMenuButton>
            </SidebarMenuItem>

            {tree.map((topic) => (
              <Collapsible key={topic.id} defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    textWrap="default"
                    className="pl-7"
                    isActive={selection.type === "topic" && selection.id === topic.id}
                    onClick={() => selectAndClose(() => onSelectTopic(topic.id))}
                  >
                    <Files />
                    <span>{topic.name}</span>
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
                            onClick={() => selectAndClose(() => onSelectLesson(lesson.id))}
                          >
                            <File />
                            {lesson.name}
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
    </Sidebar>
  );
}
