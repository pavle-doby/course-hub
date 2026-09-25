"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Copy, Info, Plus, Trash2 } from "lucide-react";
import { CoursePutQuerySchema, LessonPutQuerySchema, TopicPutQuerySchema } from "@repo/contract";
import type { CourseStatus, CourseVisibility, Lesson } from "@repo/api-client";
import { Alert, AlertTitle } from "@repo/ui-web/components/alert";
import { Button } from "@repo/ui-web/components/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@repo/ui-web/components/card";
import { Separator } from "@repo/ui-web/components/separator";
import { useT } from "@repo/i18n/client";
import { ChAlertDialog } from "@/components/ch-alert-dialog";
import { EntityForm, type EntityFormHandle, type EntityFormValues } from "./entity-form";
import { CourseThumbnailInput } from "./course-thumbnail-input";
import { InviteForm } from "./invite-form";
import { QuizSection } from "./quiz/quiz-section";
import {
  useAdjacentSelection,
  type Selection,
  type TopicWithLessons,
} from "@/hooks/use-course-tree";

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
  thumbnailUrl?: string | null;
  visibility?: CourseVisibility;
  courseId?: string;
  publicId?: string;
  activeTab?: "edit" | "invite";
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
  onDeleteCourse?: () => void;
};

export function CourseWorkingArea({
  formRef,
  selection,
  autoSave,
  course,
  thumbnailUrl,
  visibility,
  courseId,
  publicId,
  activeTab = "edit",
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
  onDeleteCourse,
}: CourseWorkingAreaProps) {
  const { t } = useT();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isCourseSelected = selection.type === "course";
  const isCoursePrivate = visibility === "private";
  const showInviteTab = isCourseSelected && isCoursePrivate;

  const selectedTopic =
    selection.type === "topic" ? tree.find((topic) => topic.id === selection.id) : undefined;
  const selectedLesson =
    selection.type === "lesson"
      ? flatLessons.find((lesson) => lesson.id === selection.id)
      : undefined;

  const { previousItem, nextItem } = useAdjacentSelection(tree, selection);

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
  const isInviteActive = isCourseSelected && showInviteTab && activeTab === "invite";
  // needs a saved id, so the course-level quiz appears once the new course is first saved
  const quizParentId = isCourseSelected ? courseId : (selectedTopic?.id ?? selectedLesson?.id);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {showHeader && !isInviteActive && (
          <div className="hidden items-center justify-center gap-2 md:flex">
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
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b">
              <CardTitle>
                {isCourseSelected
                  ? t("courses.editor.courseLabel")
                  : selection.type === "topic"
                    ? t("courses.editor.topicLabel")
                    : t("courses.editor.lessonLabel")}
              </CardTitle>
              <CardAction className="static flex flex-wrap items-center gap-2">
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
              </CardAction>
            </CardHeader>
          )}
          <CardContent className={isCourseSelected && !isInviteActive ? "px-0" : undefined}>
            {selection.type === "course" && showInviteTab && activeTab === "invite" ? (
              publicId && <InviteForm publicId={publicId} />
            ) : (
              <>
                {isCourseSelected && course.status === "published" && (
                  <Alert className="mx-4 mb-4 w-auto" variant="destructive">
                    <Info />
                    <AlertTitle>{t("courses.editor.publishedVisibilityAlert")}</AlertTitle>
                  </Alert>
                )}
                {selection.type === "course" && (
                  <div className="flex flex-col gap-5 px-4">
                    <CourseThumbnailInput
                      courseId={courseId}
                      publicId={publicId}
                      thumbnailUrl={thumbnailUrl}
                    />
                    <Separator />
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
                      mediaParent={{ type: "course", id: courseId }}
                    />
                  </div>
                )}
              </>
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
                mediaParent={{ type: "topic", id: selectedTopic.id }}
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
                mediaParent={{ type: "lesson", id: selectedLesson.id }}
              />
            )}
          </CardContent>
        </Card>

        {!isInviteActive && quizParentId && (
          <QuizSection
            key={selectionKey}
            parent={{ parentType: selection.type, parentId: quizParentId }}
          />
        )}

        {!isInviteActive && (
          <div className="mx-auto flex w-full max-w-2xl flex-col justify-center gap-2 sm:flex-row">
            {selection.type !== "course" && (
              <Button
                className="gap-2 sm:min-w-40"
                variant="outline"
                onClick={() =>
                  onAddLesson(selection.type === "topic" ? selection.id : selectedLesson?.topicId)
                }
              >
                <Plus className="size-4" />
                {t("courses.editor.addNewLesson")}
              </Button>
            )}
            <Button className="gap-2 sm:min-w-40" variant="outline" onClick={onAddTopic}>
              <Plus className="size-4" />
              {t("courses.editor.addNewTopic")}
            </Button>
          </div>
        )}
      </div>

      {showHeader && (
        <ChAlertDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title={
            isCourseSelected
              ? t("courses.editor.deleteDialog.title")
              : t("courses.editor.entityDeleteDialog.title")
          }
          description={
            isCourseSelected
              ? t("courses.editor.deleteDialog.description")
              : t("courses.editor.entityDeleteDialog.description")
          }
          cancelLabel={t("courses.editor.entityDeleteDialog.cancel")}
          actionLabel={t("courses.editor.entityDeleteDialog.confirm")}
          actionProps={{ variant: "destructive", onClick: onDeleteSelected }}
        />
      )}
    </div>
  );
}
