"use client";

import { forwardRef, useId, useImperativeHandle, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { useT } from "@repo/i18n/client";
import { useZodLocale } from "@repo/shared";
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui-web/components/field";
import { Input } from "@repo/ui-web/components/input";
import { Textarea } from "@repo/ui-web/components/textarea";
import { MediaInputPlaceholder } from "./media-input-placeholder";

export type EntityFormValues = { name: string; description?: string | null };

export type EntityFormHandle = { flush: () => Promise<void> };

type EntityFormProps = {
  schema: z.ZodTypeAny;
  name: string;
  description?: string | null;
  namePlaceholder?: string;
  autoSave: boolean;
  onSave: (data: EntityFormValues) => void | Promise<void>;
  onSavingChange?: (saving: boolean) => void;
};

export const EntityForm = forwardRef<EntityFormHandle, EntityFormProps>(function EntityForm(
  { schema, name, description, namePlaceholder, autoSave, onSave, onSavingChange },
  ref
) {
  const id = useId();
  const { t, i18n } = useT();
  useZodLocale(i18n);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields },
  } = useForm<EntityFormValues>({
    // the shared `schema` prop is intentionally loosely typed (ZodTypeAny) across course/topic/lesson variants
    resolver: zodResolver(schema as any) as Resolver<EntityFormValues>,
    defaultValues: { name, description: description ?? "" },
  });

  const save = handleSubmit(async (data) => {
    setIsSaving(true);
    onSavingChange?.(true);
    try {
      await onSave(data);
      reset(data);
    } finally {
      setIsSaving(false);
      onSavingChange?.(false);
    }
  });

  useImperativeHandle(ref, () => ({ flush: save }), [save]);

  // saves on blur only if autoSave is on and the field actually changed
  function autoSaveOnBlur(field: keyof EntityFormValues) {
    return () => {
      if (autoSave && dirtyFields[field]) void save();
    };
  }

  const nameField = register("name");
  const descriptionField = register("description");

  return (
    <fieldset disabled={isSaving}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`${id}-name`}>{t("courses.editor.nameLabel")}</FieldLabel>
          <Input
            id={`${id}-name`}
            placeholder={namePlaceholder}
            {...nameField}
            onBlur={(e) => {
              void nameField.onBlur(e);
              autoSaveOnBlur("name")();
            }}
          />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field>
          <FieldLabel>{t("courses.editor.mediaLabel")}</FieldLabel>
          <MediaInputPlaceholder />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-description`}>
            {t("courses.editor.descriptionLabel")}
          </FieldLabel>
          <Textarea
            id={`${id}-description`}
            {...descriptionField}
            onBlur={(e) => {
              void descriptionField.onBlur(e);
              autoSaveOnBlur("description")();
            }}
          />
          <FieldError errors={[errors.description]} />
        </Field>
      </FieldGroup>
    </fieldset>
  );
});
