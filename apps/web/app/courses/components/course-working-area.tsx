"use client";

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { CoursePutQuerySchema, LessonPutQuerySchema, TopicPutQuerySchema } from "@repo/contract";
import type { Lesson } from "@repo/api-client";
import { Button } from "@repo/ui-web/components/button";
import { useT } from "@repo/i18n/client";
import { EntityForm, type EntityFormHandle, type EntityFormValues } from "./entity-form";
import type { TopicWithLessons } from "../hooks/use-course-tree";
import type { Selection } from "../types";

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
  course: { name: string; description?: string | null };
  tree: TopicWithLessons[];
  flatLessons: Lesson[];
  onSaveCourse: (data: EntityFormValues) => void | Promise<void>;
  onSaveTopic: (id: string, data: EntityFormValues) => void | Promise<void>;
  onSaveLesson: (id: string, data: EntityFormValues) => void | Promise<void>;
  onAddTopic: () => void;
  onAddLesson: (topicId?: string) => void;
  onSelectLesson: (id: string) => void;
  onSavingChange?: (saving: boolean) => void;
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
  onSelectLesson,
  onSavingChange,
}: CourseWorkingAreaProps) {
  const { t } = useT();

  const selectedTopic =
    selection.type === "topic" ? tree.find((topic) => topic.id === selection.id) : undefined;
  const selectedLesson =
    selection.type === "lesson"
      ? flatLessons.find((lesson) => lesson.id === selection.id)
      : undefined;

  const lessonIndex = selectedLesson
    ? flatLessons.findIndex((l) => l.id === selectedLesson.id)
    : -1;
  const previousLesson = lessonIndex > 0 ? flatLessons[lessonIndex - 1] : undefined;
  const nextLesson =
    lessonIndex >= 0 && lessonIndex < flatLessons.length - 1
      ? flatLessons[lessonIndex + 1]
      : undefined;

  const selectionKey = selection.type === "course" ? "course" : `${selection.type}-${selection.id}`;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {selection.type === "lesson" && selectedLesson && (
        <div className="flex items-center justify-center gap-2">
          <Button
            className="min-w-30"
            variant="outline"
            size="sm"
            disabled={!previousLesson}
            onClick={() => previousLesson && onSelectLesson(previousLesson.id)}
          >
            <ChevronLeft className="size-4" />
            {t("courses.editor.previous")}
          </Button>
          <Button
            className="min-w-30"
            variant="outline"
            size="sm"
            disabled={!nextLesson}
            onClick={() => nextLesson && onSelectLesson(nextLesson.id)}
          >
            {t("courses.editor.next")}
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      <div className="mx-auto w-full max-w-2xl">
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

        <div className="mt-6 flex justify-center gap-2">
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
      </div>
    </div>
  );
}
