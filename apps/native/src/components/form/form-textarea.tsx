import { useId } from "react";
import type { TextInputProps } from "react-native";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@repo/ui-native/components/field";
import { Textarea } from "@repo/ui-native/components/textarea";

type FormTextareaProps<T extends FieldValues> = Omit<TextInputProps, "value" | "onChangeText"> & {
  control: Control<T>;
  name: Path<T>;
  label: string;
  /** Keeps the label for screen readers only. */
  hideLabel?: boolean;
};

/** Label + multiline input + error for a react-hook-form field (RN has no `register`). */
export function FormTextarea<T extends FieldValues>({
  control,
  name,
  label,
  hideLabel,
  ...textareaProps
}: FormTextareaProps<T>) {
  const labelId = useId();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <Field>
          {!hideLabel && <FieldLabel nativeID={labelId}>{label}</FieldLabel>}
          <Textarea
            aria-labelledby={hideLabel ? undefined : labelId}
            accessibilityLabel={hideLabel ? label : undefined}
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            {...textareaProps}
          />
          <FieldError errors={[error]} />
        </Field>
      )}
    />
  );
}
