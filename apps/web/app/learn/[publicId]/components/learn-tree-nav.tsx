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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@repo/ui-web/components/sidebar";
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
  return (
    <Sidebar collapsible="none" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                textWrap="default"
                isActive={selection.type === "course"}
                onClick={onSelectCourse}
              >
                <Folder />
                <span>{courseName}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {tree.map((topic) => (
              <Collapsible key={topic.id} defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      textWrap="default"
                      isActive={selection.type === "topic" && selection.id === topic.id}
                      onClick={() => onSelectTopic(topic.id)}
                    >
                      <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      <Files />
                      <span>{topic.name}</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {topic.lessons.map((lesson) => (
                        <SidebarMenuSubItem key={lesson.id}>
                          <SidebarMenuSubButton
                            textWrap="default"
                            isActive={selection.type === "lesson" && selection.id === lesson.id}
                            onClick={() => onSelectLesson(lesson.id)}
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
