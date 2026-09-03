"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Copy,
  Plus,
  Trash2,
  Undo2,
  Upload,
} from "lucide-react";
import { CoursePutQuerySchema, LessonPutQuerySchema, TopicPutQuerySchema } from "@repo/contract";
import type { CourseStatus, Lesson } from "@repo/api-client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui-web/components/alert-dialog";
import { Button } from "@repo/ui-web/components/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@repo/ui-web/components/card";
import { Separator } from "@repo/ui-web/components/separator";
import { useT } from "@repo/i18n/client";
import { EntityForm, type EntityFormHandle, type EntityFormValues } from "./entity-form";
import type { TopicWithLessons } from "../hooks/use-course-tree";
import type { Selection } from "../types";

function isSameSelection(a: Selection, b: Selection): boolean {
  if (a.type !== b.type) return false;
  return a.type === "course" || a.id === (b as { id: string }).id;
}

const coursePickedSchema = CoursePutQuerySchema.pick({
  name: true,
  description: true,
}).required({
  name: true,
});
const topicPickedSchema = TopicPutQuerySchema.pick({
  name: true,
  description: true,
}).required({
  name: true,
});
const lessonPickedSchema = LessonPutQuerySchema.pick({
  name: true,
  description: true,
}).required({
  name: true,
});

type CourseWorkingAreaProps = {
  formRef: React.RefObject<EntityFormHandle | null>;
  selection: Selection;
  autoSave: boolean;
  course: { name: string; description?: string | null; status?: CourseStatus };
  tree: TopicWithLessons[];
  flatLessons: Lesson[];
  onSaveCourse: (data: EntityFormValues) => void | Promise<void>;
  onSaveTopic: (id: string, data: EntityFormValues) => void | Promise<void>;
  onSaveLesson: (id: string, data: EntityFormValues) => void | Promise<void>;
  onAddTopic: () => void;
  onAddLesson: (topicId?: string) => void;
  onDeleteTopic: (id: string) => void;
  onDuplicateTopic: (id: string) => void;
  onDeleteLesson: (id: string) => void;
  onDuplicateLesson: (id: string) => void;
  onNavigate: (selection: Selection) => void;
  onSavingChange?: (saving: boolean) => void;
  onDuplicateCourse?: () => void;
  onPublishCourse?: () => void;
  onArchiveCourse?: () => void;
  onDeleteCourse?: () => void;
};

export function CourseWorkingArea({
  formRef,
  selection,
  autoSave,
  course,
  tree,
  flatLessons,
  onSaveCourse,
  onSaveTopic,
  onSaveLesson,
  onAddTopic,
  onAddLesson,
  onDeleteTopic,
  onDuplicateTopic,
  onDeleteLesson,
  onDuplicateLesson,
  onNavigate,
  onSavingChange,
  onDuplicateCourse,
  onPublishCourse,
  onArchiveCourse,
  onDeleteCourse,
}: CourseWorkingAreaProps) {
  const { t } = useT();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isCourseSelected = selection.type === "course";
  const isCoursePublished = course.status === "published";

  const selectedTopic =
    selection.type === "topic" ? tree.find((topic) => topic.id === selection.id) : undefined;
  const selectedLesson =
    selection.type === "lesson"
      ? flatLessons.find((lesson) => lesson.id === selection.id)
      : undefined;

  const flatItems = useMemo(() => {
    const items: Selection[] = [{ type: "course" }];
    for (const topic of tree) {
      items.push({ type: "topic", id: topic.id });
      for (const lesson of topic.lessons) {
        items.push({ type: "lesson", id: lesson.id });
      }
    }
    return items;
  }, [tree]);
  const currentIndex = flatItems.findIndex((item) => isSameSelection(item, selection));
  const previousItem = currentIndex > 0 ? flatItems[currentIndex - 1] : undefined;
  const nextItem =
    currentIndex >= 0 && currentIndex < flatItems.length - 1
      ? flatItems[currentIndex + 1]
      : undefined;

  const selectionKey = selection.type === "course" ? "course" : `${selection.type}-${selection.id}`;

  function onDeleteSelected() {
    if (isCourseSelected) {
      onDeleteCourse?.();
    } else if (selection.type === "topic" && selectedTopic) {
      onDeleteTopic(selectedTopic.id);
    } else if (selection.type === "lesson" && selectedLesson) {
      onDeleteLesson(selectedLesson.id);
    }
  }

  function onDuplicateSelected() {
    if (isCourseSelected) {
      onDuplicateCourse?.();
    } else if (selection.type === "topic" && selectedTopic) {
      onDuplicateTopic(selectedTopic.id);
    } else if (selection.type === "lesson" && selectedLesson) {
      onDuplicateLesson(selectedLesson.id);
    }
  }

  const hasSelectedTopicOrLesson =
    (selection.type === "topic" && !!selectedTopic) ||
    (selection.type === "lesson" && !!selectedLesson);
  const showHeader = isCourseSelected || hasSelectedTopicOrLesson;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {showHeader && (
        <div className="flex items-center justify-center gap-2">
          <Button
            className="min-w-30"
            variant="outline"
            size="sm"
            disabled={!previousItem}
            onClick={() => previousItem && onNavigate(previousItem)}
          >
            <ChevronLeft className="size-4" />
            {t("courses.editor.previous")}
          </Button>
          <Button
            className="min-w-30"
            variant="outline"
            size="sm"
            disabled={!nextItem}
            onClick={() => nextItem && onNavigate(nextItem)}
          >
            {t("courses.editor.next")}
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      <Card className="mx-auto w-full max-w-2xl">
        {showHeader && (
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle>
              {isCourseSelected
                ? t("courses.editor.courseLabel")
                : selection.type === "topic"
                  ? t("courses.editor.topicLabel")
                  : t("courses.editor.lessonLabel")}
            </CardTitle>
            <CardAction className="static flex items-center gap-2">
              {(!isCourseSelected || onDuplicateCourse) && (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1.5"
                  onClick={onDuplicateSelected}
                >
                  <Copy />
                  {t("courses.editor.duplicate")}
                </Button>
              )}
              {(!isCourseSelected || onDeleteCourse) && (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 />
                  {t("courses.editor.delete")}
                </Button>
              )}

              {isCourseSelected && (onPublishCourse || onArchiveCourse) && (
                <Separator orientation="vertical" className="h-8!" />
              )}

              {isCourseSelected && onPublishCourse && (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1.5"
                  onClick={onPublishCourse}
                >
                  {isCoursePublished ? <Undo2 /> : <Upload />}
                  {isCoursePublished ? t("courses.editor.unpublish") : t("courses.editor.publish")}
                </Button>
              )}
              {isCourseSelected && onArchiveCourse && (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1.5"
                  onClick={onArchiveCourse}
                >
                  <Archive />
                  {t("courses.editor.archive")}
                </Button>
              )}
            </CardAction>
          </CardHeader>
        )}
        <CardContent>
          {selection.type === "course" && (
            <EntityForm
              key={selectionKey}
              ref={formRef}
              schema={coursePickedSchema}
              name={course.name}
              description={course.description}
              namePlaceholder={t("courses.editor.untitledCourse")}
              autoSave={autoSave}
              onSave={onSaveCourse}
              onSavingChange={onSavingChange}
            />
          )}

          {selection.type === "topic" && selectedTopic && (
            <EntityForm
              key={selectionKey}
              ref={formRef}
              schema={topicPickedSchema}
              name={selectedTopic.name}
              description={selectedTopic.description}
              autoSave={autoSave}
              onSave={(data) => onSaveTopic(selectedTopic.id, data)}
              onSavingChange={onSavingChange}
            />
          )}

          {selection.type === "lesson" && selectedLesson && (
            <EntityForm
              key={selectionKey}
              ref={formRef}
              schema={lessonPickedSchema}
              name={selectedLesson.name}
              description={selectedLesson.description}
              autoSave={autoSave}
              onSave={(data) => onSaveLesson(selectedLesson.id, data)}
              onSavingChange={onSavingChange}
            />
          )}
        </CardContent>
      </Card>

      <div className="mx-auto flex w-full max-w-2xl justify-center gap-2">
        {selection.type !== "course" && (
          <Button
            className="min-w-40 gap-2"
            variant="outline"
            onClick={() =>
              onAddLesson(selection.type === "topic" ? selection.id : selectedLesson?.topicId)
            }
          >
            <Plus className="size-4" />
            {t("courses.editor.addNewLesson")}
          </Button>
        )}
        <Button className="min-w-40 gap-2" variant="outline" onClick={onAddTopic}>
          <Plus className="size-4" />
          {t("courses.editor.addNewTopic")}
        </Button>
      </div>

      {showHeader && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isCourseSelected
                  ? t("courses.editor.deleteDialog.title")
                  : t("courses.editor.entityDeleteDialog.title")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isCourseSelected
                  ? t("courses.editor.deleteDialog.description")
                  : t("courses.editor.entityDeleteDialog.description")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("courses.editor.entityDeleteDialog.cancel")}</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={onDeleteSelected}>
                {t("courses.editor.entityDeleteDialog.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
