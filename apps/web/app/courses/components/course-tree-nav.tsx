"use client";

import { useState } from "react";
import { ChevronRight, Folder, Trash2, Archive, Plus } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui-web/components/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@repo/ui-web/components/sidebar";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@repo/ui-web/components/alert-dialog";
import { Button } from "@repo/ui-web/components/button";
import { useT } from "@repo/i18n/client";
import type { TopicWithLessons } from "../hooks/use-course-tree";
import type { Selection } from "../types";

type CourseTreeNavProps = {
  courseName: string;
  tree: TopicWithLessons[];
  selection: Selection;
  onSelectCourse: () => void;
  onSelectTopic: (id: string) => void;
  onSelectLesson: (id: string) => void;
  onAddTopic: () => void;
  onAddLesson: (topicId: string) => void;
  onDeleteTopic: (id: string) => void;
  onDeleteLesson: (id: string) => void;
  onArchiveCourse?: () => void;
  onDeleteCourse?: () => void;
};

export function CourseTreeNav({
  courseName,
  tree,
  selection,
  onSelectCourse,
  onSelectTopic,
  onSelectLesson,
  onAddTopic,
  onAddLesson,
  onDeleteTopic,
  onDeleteLesson,
  onArchiveCourse,
  onDeleteCourse,
}: CourseTreeNavProps) {
  const { t } = useT();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <Sidebar collapsible="none" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
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
                      isActive={selection.type === "topic" && selection.id === topic.id}
                      onClick={() => onSelectTopic(topic.id)}
                    >
                      <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      <span>{topic.name}</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <SidebarMenuAction
                    showOnHover
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTopic(topic.id);
                    }}
                    aria-label={t("courses.editor.deleteTopic")}
                  >
                    <Trash2 />
                  </SidebarMenuAction>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {topic.lessons.map((lesson) => (
                        <SidebarMenuSubItem
                          key={lesson.id}
                          className="group/menu-sub-item relative"
                        >
                          <SidebarMenuSubButton
                            isActive={selection.type === "lesson" && selection.id === lesson.id}
                            onClick={() => onSelectLesson(lesson.id)}
                          >
                            {lesson.name}
                          </SidebarMenuSubButton>
                          <button
                            type="button"
                            aria-label={t("courses.editor.deleteLesson")}
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteLesson(lesson.id);
                            }}
                            className="absolute top-1/2 right-1 flex size-5 -translate-y-1/2 items-center justify-center rounded-md text-sidebar-foreground opacity-0 group-hover/menu-sub-item:opacity-100 hover:bg-sidebar-accent"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </SidebarMenuSubItem>
                      ))}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          className="my-1 border border-dashed"
                          onClick={() => onAddLesson(topic.id)}
                        >
                          <Plus className="size-3.5" />
                          {t("courses.editor.addNewLesson")}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}

            <SidebarMenuItem>
              <SidebarMenuButton className="my-1 border border-dashed" onClick={onAddTopic}>
                <Plus />
                <span>{t("courses.editor.addNewTopic")}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {onArchiveCourse && (
          <Button
            variant="destructive"
            className="w-full justify-start gap-2"
            onClick={onArchiveCourse}
          >
            <Archive className="size-4" />
            {t("courses.editor.archive")}
          </Button>
        )}

        {onDeleteCourse && (
          <Button
            variant="destructive"
            className="w-full justify-start gap-2"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="size-4" />
            {t("courses.editor.delete")}
          </Button>
        )}
      </SidebarFooter>

      {onDeleteCourse && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("courses.editor.deleteDialog.title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("courses.editor.deleteDialog.description")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("courses.editor.deleteDialog.cancel")}</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={onDeleteCourse}>
                {t("courses.editor.deleteDialog.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Sidebar>
  );
}
