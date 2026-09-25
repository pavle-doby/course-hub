"use client";

import { useId } from "react";
import {
  Controller,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormGetValues,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import { Trash2Icon } from "lucide-react";
import { QUESTION_TYPES, type SaveQuizReq } from "@repo/contract";
import { useT } from "@repo/i18n/client";
import { Button } from "@repo/ui-web/components/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui-web/components/field";
import { Input } from "@repo/ui-web/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui-web/components/select";
import { Switch } from "@repo/ui-web/components/switch";
import { QuestionChoices } from "./question-choices";
import type { QuestionValues, QuizFormValues } from "./quiz-form-values";

type QuestionFieldsProps = {
  index: number;
  control: Control<QuizFormValues, unknown, SaveQuizReq>;
  register: UseFormRegister<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  getValues: UseFormGetValues<QuizFormValues>;
  errors: FieldErrors<QuizFormValues>;
  canRemove: boolean;
  onRemove: (index: number) => void;
};

export function QuestionFields({
  index,
  control,
  register,
  setValue,
  getValues,
  errors,
  canRemove,
  onRemove,
}: QuestionFieldsProps) {
  const id = useId();
  const { t } = useT();
  const type = useWatch({ control, name: `questions.${index}.type` });
  const questionErrors = errors.questions?.[index];

  function handleRemove() {
    onRemove(index);
  }

  function handleTypeChange(value: string) {
    setValue(`questions.${index}.type`, value as QuestionValues["type"], { shouldDirty: true });
    // one answer: keep at most the first correct choice
    if (value === "single") {
      const current = getValues(`questions.${index}.choices`);
      const firstCorrect = current.findIndex((choice) => choice.correct);
      current.forEach((_, choiceIndex) => {
        setValue(`questions.${index}.choices.${choiceIndex}.correct`, choiceIndex === firstCorrect);
      });
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-medium">{t("courses.quiz.question", { number: index + 1 })}</h3>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("courses.quiz.removeQuestion")}
            onClick={handleRemove}
          >
            <Trash2Icon />
          </Button>
        )}
      </div>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`${id}-prompt`}>{t("courses.quiz.prompt")}</FieldLabel>
          <Input
            id={`${id}-prompt`}
            placeholder={t("courses.quiz.promptPlaceholder")}
            {...register(`questions.${index}.prompt`)}
          />
          <FieldError errors={[questionErrors?.prompt]} />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-description`}>{t("courses.quiz.description")}</FieldLabel>
          <Input id={`${id}-description`} {...register(`questions.${index}.description`)} />
          <FieldError errors={[questionErrors?.description]} />
        </Field>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <Field className="w-auto min-w-48">
            <FieldLabel htmlFor={`${id}-type`}>{t("courses.quiz.type")}</FieldLabel>
            <Controller
              control={control}
              name={`questions.${index}.type`}
              render={({ field }) => (
                <Select value={field.value} onValueChange={handleTypeChange}>
                  <SelectTrigger id={`${id}-type`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map((questionType) => (
                      <SelectItem key={questionType} value={questionType}>
                        {t(`courses.quiz.types.${questionType}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field orientation="horizontal" className="w-auto">
            <Controller
              control={control}
              name={`questions.${index}.required`}
              render={({ field }) => (
                <Switch
                  id={`${id}-required`}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <FieldLabel htmlFor={`${id}-required`}>{t("courses.quiz.required")}</FieldLabel>
          </Field>
        </div>

        {type !== "text" && (
          <QuestionChoices
            index={index}
            type={type}
            control={control}
            register={register}
            setValue={setValue}
            getValues={getValues}
            questionErrors={questionErrors}
          />
        )}
      </FieldGroup>
    </div>
  );
}
