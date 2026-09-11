"use client";

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronRight,
  Check,
  File,
  Files,
  Folder,
  GripHorizontal,
  Trash2,
  Archive,
  Globe,
  Lock,
  Plus,
  Shuffle,
  Undo2,
  Upload,
  UserPlus,
} from "lucide-react";
import type { CourseVisibility } from "@repo/api-client";
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
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
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
import { ButtonGroup } from "@repo/ui-web/components/button-group";
import { Separator } from "@repo/ui-web/components/separator";
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
  onReorderTopics: (orderedIds: string[]) => Promise<void> | void;
  onReorderLessons: (orderedIds: string[]) => Promise<void> | void;
  visibility?: CourseVisibility;
  onVisibilityChange?: (value: CourseVisibility) => void;
  onInviteClick?: () => void;
  isPublished?: boolean;
  onPublishCourse?: () => void;
  onArchiveCourse?: () => void;
  onDeleteCourse?: () => void;
  isLoadingTree?: boolean;
};

/** Draggable topic row — disabled outside reorder mode so a plain click still selects it. */
function SortableTopic({
  id,
  disabled,
  children,
}: {
  id: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { type: "topic" },
    disabled,
  });

  return (
    <Collapsible
      ref={setNodeRef}
      defaultOpen
      className="group/collapsible"
      style={{ transform: CSS.Transform.toString(transform), transition }}
      data-dragging={isDragging || undefined}
      {...attributes}
      {...listeners}
    >
      {children}
    </Collapsible>
  );
}

/** Draggable lesson row — disabled outside reorder mode so a plain click still selects it. */
function SortableLesson({
  id,
  disabled,
  children,
}: {
  id: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { type: "lesson" },
    disabled,
  });

  return (
    <SidebarMenuSubItem
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      data-dragging={isDragging || undefined}
      {...attributes}
      {...listeners}
    >
      {children}
    </SidebarMenuSubItem>
  );
}

function cloneTree(tree: TopicWithLessons[]): TopicWithLessons[] {
  return tree.map((topic) => ({ ...topic, lessons: [...topic.lessons] }));
}

type SkeletonTopic = { id: string; lessons: { id: string }[] };

// shown before topics/lessons have loaded for the first time
const PLACEHOLDER_TOPICS: SkeletonTopic[] = Array.from({ length: 3 }, (_, topicIndex) => ({
  id: `placeholder-topic-${topicIndex}`,
  lessons: Array.from({ length: 2 }, (_, lessonIndex) => ({
    id: `placeholder-lesson-${topicIndex}-${lessonIndex}`,
  })),
}));

export function CourseTreeNav({
  courseName,
  tree,
  selection,
  onSelectCourse,
  onSelectTopic,
  onSelectLesson,
  onAddTopic,
  onAddLesson,
  onReorderTopics,
  onReorderLessons,
  visibility,
  onVisibilityChange,
  onInviteClick,
  isPublished = false,
  onPublishCourse,
  onArchiveCourse,
  onDeleteCourse,
  isLoadingTree = false,
}: CourseTreeNavProps) {
  const { t } = useT();
  const { isMobile, setOpenMobile } = useSidebar();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draftTree, setDraftTree] = useState<TopicWithLessons[] | null>(null);
  const isPrivate = visibility === "private";
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function selectAndClose(select: () => void) {
    select();

    if (isMobile) {
      setOpenMobile(false);
    }
  }

  const displayedTree = reorderMode && draftTree ? draftTree : tree;
  const showSkeleton = isLoadingTree || isSaving;
  const skeletonTopics: SkeletonTopic[] = isLoadingTree ? PLACEHOLDER_TOPICS : displayedTree;

  function handleDragEnd(event: DragEndEvent) {
    if (!reorderMode || !draftTree) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    if (active.data.current?.type === "topic") {
      const oldIndex = draftTree.findIndex((topic) => topic.id === active.id);
      const newIndex = draftTree.findIndex((topic) => topic.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      setDraftTree(arrayMove(draftTree, oldIndex, newIndex));
      return;
    }

    const topicIndex = draftTree.findIndex((topic) =>
      topic.lessons.some((lesson) => lesson.id === active.id)
    );
    const topic = draftTree[topicIndex];
    if (!topic) return;
    const oldIndex = topic.lessons.findIndex((lesson) => lesson.id === active.id);
    const newIndex = topic.lessons.findIndex((lesson) => lesson.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const nextDraft = cloneTree(draftTree);
    nextDraft[topicIndex] = { ...topic, lessons: arrayMove(topic.lessons, oldIndex, newIndex) };
    setDraftTree(nextDraft);
  }

  function handleStartReorder() {
    setDraftTree(cloneTree(tree));
    setReorderMode(true);
  }

  async function handleDoneReorder() {
    if (!draftTree) {
      setReorderMode(false);
      return;
    }
    setIsSaving(true);
    try {
      await onReorderTopics(draftTree.map((topic) => topic.id));
      await Promise.all(
        draftTree.map((topic) => onReorderLessons(topic.lessons.map((lesson) => lesson.id)))
      );
    } finally {
      setIsSaving(false);
      setReorderMode(false);
      setDraftTree(null);
    }
  }

  return (
    <Sidebar collapsible="offcanvas" className="border-r">
      <SidebarContent>
        <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center border-b bg-sidebar p-2">
          <Button
            variant="outline"
            className="w-full justify-center gap-2"
            disabled={isSaving || isLoadingTree}
            onClick={reorderMode ? handleDoneReorder : handleStartReorder}
          >
            {reorderMode ? <Check className="size-4" /> : <Shuffle className="size-4" />}
            {reorderMode ? t("courses.editor.reorderDone") : t("courses.editor.reorder")}
          </Button>
        </div>

        <SidebarGroup>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  textWrap="compact"
                  isActive={selection.type === "course"}
                  onClick={() => selectAndClose(onSelectCourse)}
                >
                  <Folder />
                  <span>{courseName}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SortableContext
                items={displayedTree.map((topic) => topic.id)}
                strategy={verticalListSortingStrategy}
              >
                {showSkeleton
                  ? skeletonTopics.map((topic) => (
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
                  : displayedTree.map((topic) => (
                      <SortableTopic key={topic.id} id={topic.id} disabled={!reorderMode}>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            textWrap="compact"
                            className="pl-7"
                            isActive={selection.type === "topic" && selection.id === topic.id}
                            onClick={() => selectAndClose(() => onSelectTopic(topic.id))}
                          >
                            {reorderMode && <GripHorizontal className="size-3.5" />}
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
                              <SortableContext
                                items={topic.lessons.map((lesson) => lesson.id)}
                                strategy={verticalListSortingStrategy}
                              >
                                {topic.lessons.map((lesson) => (
                                  <SortableLesson
                                    key={lesson.id}
                                    id={lesson.id}
                                    disabled={!reorderMode}
                                  >
                                    <SidebarMenuSubButton
                                      textWrap="compact"
                                      isActive={
                                        selection.type === "lesson" && selection.id === lesson.id
                                      }
                                      onClick={() =>
                                        selectAndClose(() => onSelectLesson(lesson.id))
                                      }
                                    >
                                      {reorderMode && <GripHorizontal className="size-3.5" />}
                                      <File />
                                      <span>{lesson.name}</span>
                                    </SidebarMenuSubButton>
                                  </SortableLesson>
                                ))}
                              </SortableContext>
                              {!reorderMode && (
                                <SidebarMenuSubItem>
                                  <SidebarMenuSubButton
                                    className="my-1 border border-dashed"
                                    onClick={() => onAddLesson(topic.id)}
                                  >
                                    <Plus className="size-3.5" />
                                    {t("courses.editor.addNewLesson")}
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </SortableTopic>
                    ))}
              </SortableContext>

              {!reorderMode && !isLoadingTree && (
                <SidebarMenuItem>
                  <SidebarMenuButton className="my-1 border border-dashed" onClick={onAddTopic}>
                    <Plus />
                    <span>{t("courses.editor.addNewTopic")}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </DndContext>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-3 bg-background py-4">
        {onVisibilityChange && (
          <>
            <ButtonGroup className="w-full">
              <Button
                type="button"
                variant={isPrivate ? "outline" : "default"}
                className="w-1/2 gap-1.5"
                disabled={reorderMode || isSaving}
                onClick={() => onVisibilityChange("public")}
              >
                <Globe className="size-4" />
                {t("courses.editor.visibilityPublic")}
              </Button>
              <Button
                type="button"
                variant={isPrivate ? "default" : "outline"}
                className="w-1/2 gap-1.5"
                disabled={reorderMode || isSaving}
                onClick={() => onVisibilityChange("private")}
              >
                <Lock className="size-4" />
                {t("courses.editor.visibilityPrivate")}
              </Button>
            </ButtonGroup>
            {isPrivate && onInviteClick && (
              <Button
                type="button"
                variant="outline"
                className="w-full gap-1.5"
                disabled={reorderMode || isSaving}
                onClick={onInviteClick}
              >
                <UserPlus className="size-4" />
                {t("courses.editor.invite")}
              </Button>
            )}
            <Separator className="-mx-2 !w-auto" />
          </>
        )}

        {onPublishCourse && (
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            disabled={reorderMode || isSaving}
            onClick={onPublishCourse}
          >
            {isPublished ? <Undo2 className="size-4" /> : <Upload className="size-4" />}
            {isPublished ? t("courses.editor.unpublish") : t("courses.editor.publish")}
          </Button>
        )}

        {onArchiveCourse && (
          <Button
            variant="destructive"
            className="w-full justify-start gap-2"
            disabled={reorderMode || isSaving}
            onClick={onArchiveCourse}
          >
            <Archive className="size-4" />
            {t("courses.editor.archive")}
          </Button>
        )}

        {onArchiveCourse && onDeleteCourse && <Separator className="-mx-2 !w-auto" />}

        {onDeleteCourse && (
          <Button
            variant="destructive"
            className="w-full justify-start gap-2"
            disabled={reorderMode || isSaving}
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
