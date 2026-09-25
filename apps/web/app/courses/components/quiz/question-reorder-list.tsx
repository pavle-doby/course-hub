"use client";

import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useT } from "@repo/i18n/client";
import type { QuestionValues } from "./quiz-form-values";
import { SortableRow } from "./sortable-row";
import { useSortableSensors } from "./use-sortable-sensors";

type QuestionReorderListProps = {
  /** `useFieldArray` fields; their `id` is the sortable key. */
  fields: { id: string }[];
  questions: QuestionValues[];
  onMove: (from: number, to: number) => void;
};

/** Compact, draggable list of questions shown while reordering. */
export function QuestionReorderList({ fields, questions, onMove }: QuestionReorderListProps) {
  const { t } = useT();
  const sensors = useSortableSensors();

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) {
      return;
    }
    onMove(
      fields.findIndex((field) => field.id === active.id),
      fields.findIndex((field) => field.id === over.id)
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={fields.map((field) => field.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2">
          {fields.map((field, index) => (
            <SortableRow
              key={field.id}
              id={field.id}
              handleLabel={t("courses.quiz.dragToReorder")}
              className="rounded-lg border p-2 pr-3"
            >
              <span className="min-w-0 flex-1 truncate text-sm">
                <span className="font-medium">
                  {t("courses.quiz.question", { number: index + 1 })}
                </span>
                {questions[index]?.prompt && (
                  <span className="text-muted-foreground"> · {questions[index].prompt}</span>
                )}
              </span>
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
