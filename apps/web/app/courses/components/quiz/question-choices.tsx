"use client";

import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
  Controller,
  useFieldArray,
  type Control,
  type FieldErrors,
  type UseFormGetValues,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import { PlusIcon, XIcon } from "lucide-react";
import type { SaveQuizReq } from "@repo/contract";
import { useT } from "@repo/i18n/client";
import { Button } from "@repo/ui-web/components/button";
import { Checkbox } from "@repo/ui-web/components/checkbox";
import { Field, FieldError, FieldLabel } from "@repo/ui-web/components/field";
import { Input } from "@repo/ui-web/components/input";
import { newChoice, type QuestionValues, type QuizFormValues } from "./quiz-form-values";
import { SortableRow } from "./sortable-row";
import { useSortableSensors } from "./use-sortable-sensors";

type QuestionChoicesProps = {
  index: number;
  type: QuestionValues["type"];
  control: Control<QuizFormValues, unknown, SaveQuizReq>;
  register: UseFormRegister<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  getValues: UseFormGetValues<QuizFormValues>;
  questionErrors: FieldErrors<QuestionValues> | undefined;
};

/** Sortable answer choices of a single or multiple choice question. */
export function QuestionChoices({
  index,
  type,
  control,
  register,
  setValue,
  getValues,
  questionErrors,
}: QuestionChoicesProps) {
  const { t } = useT();
  const choices = useFieldArray({ control, name: `questions.${index}.choices` });
  const sensors = useSortableSensors();
  const choicesErrors = [
    questionErrors?.choices?.root ?? questionErrors?.choices,
    ...(Array.isArray(questionErrors?.choices)
      ? questionErrors.choices.map((choiceError) => choiceError?.label)
      : []),
  ].filter((error) => error?.message);

  function handleAddChoice() {
    choices.append(newChoice());
  }

  function handleChoiceDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) {
      return;
    }
    const from = choices.fields.findIndex((choice) => choice.id === active.id);
    const to = choices.fields.findIndex((choice) => choice.id === over.id);
    choices.move(from, to);
  }

  function handleRemoveChoice(choiceIndex: number) {
    choices.remove(choiceIndex);
  }

  // single choice: checking one answer unchecks the others
  function handleCorrectChange(choiceIndex: number, correct: boolean) {
    if (type === "single" && correct) {
      getValues(`questions.${index}.choices`).forEach((_, otherIndex) => {
        setValue(`questions.${index}.choices.${otherIndex}.correct`, otherIndex === choiceIndex);
      });
      return;
    }
    setValue(`questions.${index}.choices.${choiceIndex}.correct`, correct);
  }

  return (
    <Field>
      <FieldLabel>{t("courses.quiz.choices")}</FieldLabel>
      <div className="flex flex-col gap-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleChoiceDragEnd}
        >
          <SortableContext
            items={choices.fields.map((choice) => choice.id)}
            strategy={verticalListSortingStrategy}
          >
            {choices.fields.map((choice, choiceIndex) => (
              <SortableRow
                key={choice.id}
                id={choice.id}
                handleLabel={t("courses.quiz.dragToReorder")}
              >
                <Controller
                  control={control}
                  name={`questions.${index}.choices.${choiceIndex}.correct`}
                  render={({ field }) => (
                    <label className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          handleCorrectChange(choiceIndex, checked === true)
                        }
                      />
                      {t("courses.quiz.correct")}
                    </label>
                  )}
                />
                <Input
                  aria-label={t("courses.quiz.choicePlaceholder", {
                    number: choiceIndex + 1,
                  })}
                  placeholder={t("courses.quiz.choicePlaceholder", {
                    number: choiceIndex + 1,
                  })}
                  aria-invalid={!!questionErrors?.choices?.[choiceIndex]?.label}
                  {...register(`questions.${index}.choices.${choiceIndex}.label`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={t("courses.quiz.removeChoice")}
                  disabled={choices.fields.length <= 2}
                  onClick={() => handleRemoveChoice(choiceIndex)}
                >
                  <XIcon />
                </Button>
              </SortableRow>
            ))}
          </SortableContext>
        </DndContext>
      </div>
      {choices.fields.length < 6 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-fit gap-1.5"
          onClick={handleAddChoice}
        >
          <PlusIcon />
          {t("courses.quiz.addChoice")}
        </Button>
      )}
      <FieldError errors={choicesErrors} />
    </Field>
  );
}
