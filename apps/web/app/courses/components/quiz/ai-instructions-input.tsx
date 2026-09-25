"use client";

import { useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SparklesIcon, XIcon } from "lucide-react";
import { GenerateQuizBodySchema, type GenerateQuizReq } from "@repo/contract";
import { useT } from "@repo/i18n/client";
import { useZodLocale } from "@repo/shared";
import { Button } from "@repo/ui-web/components/button";
import { Field, FieldError, FieldLabel } from "@repo/ui-web/components/field";
import { Spinner } from "@repo/ui-web/components/spinner";
import { Textarea } from "@repo/ui-web/components/textarea";

type AiInstructionsInputProps = {
  submitLabel: string;
  isGenerating: boolean;
  onGenerate: (instructions?: string) => void;
  onCancel?: () => void;
};

/** Optional guidance for AI Create / Regenerate. Not a <form>: it also sits inside the quiz form. */
export function AiInstructionsInput({
  submitLabel,
  isGenerating,
  onGenerate,
  onCancel,
}: AiInstructionsInputProps) {
  const id = useId();
  const { t, i18n } = useT();
  useZodLocale(i18n);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GenerateQuizReq>({
    resolver: zodResolver(GenerateQuizBodySchema),
  });

  function handleGenerate({ instructions }: GenerateQuizReq) {
    onGenerate(instructions || undefined);
  }

  const handleGenerateClick = handleSubmit(handleGenerate);

  return (
    <div className="flex flex-col gap-3">
      <Field>
        <FieldLabel htmlFor={`${id}-instructions`}>{t("courses.quiz.aiInstructions")}</FieldLabel>
        <Textarea
          id={`${id}-instructions`}
          rows={3}
          placeholder={t("courses.quiz.aiInstructionsPlaceholder")}
          disabled={isGenerating}
          {...register("instructions")}
        />
        <FieldError errors={[errors.instructions]} />
      </Field>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" disabled={isGenerating} onClick={onCancel}>
            <XIcon />
            {t("courses.quiz.cancel")}
          </Button>
        )}
        <Button
          type="button"
          className="gap-1.5"
          disabled={isGenerating}
          onClick={handleGenerateClick}
        >
          {isGenerating ? <Spinner /> : <SparklesIcon />}
          {isGenerating ? t("courses.quiz.generating") : submitLabel}
        </Button>
      </div>
    </div>
  );
}
