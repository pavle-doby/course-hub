"use client";

import { useState } from "react";
import { useFieldArray, useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircleIcon, Plus, SaveIcon, Sparkles, XIcon } from "lucide-react";
import { SaveQuizBodySchema, type SaveQuizReq } from "@repo/contract";
import { useT } from "@repo/i18n/client";
import { useErrorHandlingForm, useZodLocale } from "@repo/shared";
import { Alert, AlertTitle } from "@repo/ui-web/components/alert";
import { Badge } from "@repo/ui-web/components/badge";
import { Button } from "@repo/ui-web/components/button";
import { FieldError } from "@repo/ui-web/components/field";
import { Separator } from "@repo/ui-web/components/separator";
import { AiInstructionsInput } from "./ai-instructions-input";
import { QuestionFields } from "./question-fields";
import { QuestionReorderList } from "./question-reorder-list";
import { newQuestion, type QuizFormValues } from "./quiz-form-values";

type QuizFormProps = {
  /** Lets a submit button outside the form (the section header) save it. */
  id: string;
  defaultValues: QuizFormValues;
  isAiDraft: boolean;
  isRegenerating: boolean;
  /** Shows a compact, draggable list of questions instead of their fields. */
  isReordering: boolean;
  onRegenerate: (instructions?: string) => void;
  onCancel: () => void;
  onSave: (data: SaveQuizReq) => Promise<void>;
};

/** Question editor shared by manual create, AI drafts and edit. */
export function QuizForm({
  id,
  defaultValues,
  isAiDraft,
  isRegenerating,
  isReordering,
  onRegenerate,
  onCancel,
  onSave,
}: QuizFormProps) {
  const { t, i18n } = useT();
  useZodLocale(i18n);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<QuizFormValues, unknown, SaveQuizReq>({
    // form keeps `choices` on text questions, so its shape is looser than the saved union
    resolver: zodResolver(SaveQuizBodySchema) as unknown as Resolver<
      QuizFormValues,
      unknown,
      SaveQuizReq
    >,
    defaultValues,
  });
  const { fields, append, remove, move } = useFieldArray({ control, name: "questions" });
  const questions = useWatch({ control, name: "questions" });
  const { handleErrorForm } = useErrorHandlingForm<QuizFormValues>({ t, i18n, setError });

  async function handleSave(data: SaveQuizReq) {
    try {
      await onSave(data);
    } catch (error) {
      handleErrorForm(error as Error);
    }
  }

  // a successful regenerate remounts the form, which also closes this panel
  const [isRegeneratePanelOpen, setIsRegeneratePanelOpen] = useState(false);

  function handleToggleRegeneratePanel() {
    setIsRegeneratePanelOpen((open) => !open);
  }

  function handleCloseRegeneratePanel() {
    setIsRegeneratePanelOpen(false);
  }

  function handleAddQuestion() {
    append(newQuestion());
  }

  return (
    <form id={id} onSubmit={handleSubmit(handleSave)} noValidate className="flex flex-col gap-4">
      {isAiDraft && (
        <Badge variant="secondary" className="w-fit gap-1">
          <Sparkles className="size-3" />
          {t("courses.quiz.aiDraft")}
        </Badge>
      )}

      {isReordering ? (
        <QuestionReorderList fields={fields} questions={questions} onMove={move} />
      ) : (
        <fieldset disabled={isSubmitting || isRegenerating} className="flex flex-col gap-4">
          {fields.map((field, index) => (
            <QuestionFields
              key={field.id}
              index={index}
              control={control}
              register={register}
              setValue={setValue}
              getValues={getValues}
              errors={errors}
              canRemove={fields.length > 1}
              onRemove={remove}
            />
          ))}
        </fieldset>
      )}

      {errors.questions?.root && <FieldError errors={[errors.questions.root]} />}
      {errors.root && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>{errors.root.message}</AlertTitle>
        </Alert>
      )}

      {!isReordering && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            disabled={isSubmitting || isRegenerating}
            onClick={handleAddQuestion}
          >
            <Plus />
            {t("courses.quiz.addQuestion")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            aria-expanded={isRegeneratePanelOpen}
            disabled={isSubmitting || isRegenerating}
            onClick={handleToggleRegeneratePanel}
          >
            <Sparkles />
            {t("courses.quiz.regenerate")}
          </Button>
        </div>
      )}

      {!isReordering && isRegeneratePanelOpen && (
        <div className="rounded-lg border p-4">
          <AiInstructionsInput
            submitLabel={t("courses.quiz.regenerateSubmit")}
            isGenerating={isRegenerating}
            onGenerate={onRegenerate}
            onCancel={handleCloseRegeneratePanel}
          />
        </div>
      )}

      <Separator />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          <XIcon />
          {t("courses.quiz.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting || isRegenerating}>
          <SaveIcon />
          {isSubmitting ? t("courses.quiz.saving") : t("courses.quiz.save")}
        </Button>
      </div>
    </form>
  );
}
